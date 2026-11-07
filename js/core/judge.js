/* ============================================================================
 * 实时评测 (judge.js)
 *   GitHub Pages 无法在后端编译 C++，因此通过浏览器调用公共编译服务。
 *   双通道设计（提升可靠性，避免单点故障）：
 *     1. Wandbox           https://wandbox.org/api/compile.json （主通道，gcc 13.2.0）
 *     2. Compiler Explorer https://godbolt.org/api/compiler/g133/compile （备用通道，gcc，CORS 全开）
 *   （原计划的 Piston 公共实例自 2026-02 起改为白名单授权制，故改用 Compiler Explorer）
 *   首选上次成功的通道；请求失败（网络 / 429 / 5xx / 容量不足）时自动切换到
 *   另一通道重试，最多 4 次。编译错误（CE）属于用户代码问题，不触发切换。
 *
 *   - 逐测试点编译运行，实时回报每个测试点的结果（AC/WA/RE/CE/TLE）
 *   - 按通过测试点比例给分（与官方「按测试点给分」一致，可拿部分分）
 *   - 结果按 (代码, 输入) 哈希缓存，避免重复请求
 * ==========================================================================*/
(function (global) {
  'use strict';

  var CONCURRENCY = 3;
  var cache = {};            // hash -> {v, out, err}
  var CACHE_KEY = 'csp-s-v5-judgecache';

  function loadCache() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (raw) cache = JSON.parse(raw) || {};
    } catch (e) { cache = {}; }
  }
  function saveCache() {
    try {
      var keys = Object.keys(cache);
      if (keys.length > 400) {          // 简单裁剪
        keys.slice(0, keys.length - 400).forEach(function (k) { delete cache[k]; });
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (e) { /* quota */ }
  }

  function hash(s) {
    var h = 5381, i = s.length;
    while (i) h = (h * 33) ^ s.charCodeAt(--i);
    return (h >>> 0).toString(36) + '_' + s.length;
  }

  function norm(s) {
    return String(s == null ? '' : s)
      .replace(/\r\n?/g, '\n')
      .split('\n').map(function (l) { return l.replace(/\s+$/, ''); })
      .join('\n').replace(/\n+$/, '').trim();
  }

  /* ------------------------------------------------------------------
   * 通道一：Wandbox（POST /api/compile.json）
   * 返回统一结构 { verdict, output, ms, error?, infraFail? }。
   * infraFail=true 表示是评测服务自身的问题（网络/限流/容量），应切换通道重试。
   * ------------------------------------------------------------------ */
  var WANDBOX_COMPILER = 'gcc-13.2.0';

  function wandboxEndpoint() {
    var st = global.CSP && global.CSP.store && global.CSP.store.S();
    return (st && st.settings && st.settings.judgeEndpoint) || 'https://wandbox.org/api/compile.json';
  }

  function runWandbox(code, stdin, t0) {
    return fetch(wandboxEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ compiler: WANDBOX_COMPILER, code: code, stdin: stdin || '' })
    }).then(function (r) {
      if (r.status === 429 || r.status >= 500) {
        return { infraFail: true, reason: 'wandbox rate:' + r.status, ms: Date.now() - t0 };
      }
      return r.json().then(function (j) { return classifyWandbox(j, Date.now() - t0); });
    }).catch(function (e) {
      return { infraFail: true, reason: 'wandbox ' + e.message, ms: Date.now() - t0 };
    });
  }

  /* ------------------------------------------------------------------
   * 通道二：Compiler Explorer（godbolt.org，POST /api/compiler/g133/compile）
   * 免密钥、CORS 全开（Access-Control-Allow-Origin: *）。gcc 版本 id g133；
   * 若某天该 id 下线，可换为其它现存版本 id（g1xx 系列长期保留）。
   * ------------------------------------------------------------------ */
  var GODBOLT_URL = 'https://godbolt.org/api/compiler/g133/compile';

  function stripAnsi(s) {
    return String(s == null ? '' : s).replace(/\x1b\[[0-9;]*m/g, '');
  }

  function godboltBody(code, stdin) {
    return JSON.stringify({
      source: code,
      options: {
        userArguments: '-std=c++17 -O2',
        executeParameters: { args: [], stdin: stdin || '' },
        filters: { execute: true },
        tools: [], libraries: []
      },
      lang: 'c++',
      allowStoreCodeDebug: false
    });
  }

  function runGodbolt(code, stdin, t0) {
    return fetch(GODBOLT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: godboltBody(code, stdin)
    }).then(function (r) {
      if (r.status === 429 || r.status >= 500) {
        return { infraFail: true, reason: 'godbolt rate:' + r.status, ms: Date.now() - t0 };
      }
      return r.json().then(function (j) { return classifyGodbolt(j, Date.now() - t0); });
    }).catch(function (e) {
      return { infraFail: true, reason: 'godbolt ' + e.message, ms: Date.now() - t0 };
    });
  }

  var CHANNELS = [
    { id: 'wandbox', run: runWandbox },
    { id: 'godbolt', run: runGodbolt }
  ];
  var curChannel = 0;   // 粘性：记住最近一次成功的通道，后续请求优先走它

  /** 单次编译运行：走当前通道，基础设施类失败时自动切换通道重试（最多 4 次） */
  function runOnce(code, stdin, attempt) {
    attempt = attempt || 0;
    var t0 = Date.now();
    var i = curChannel;
    return CHANNELS[i].run(code, stdin, t0).then(function (res) {
      if (res && res.infraFail) {
        if (attempt < 4) {
          curChannel = (i + 1) % CHANNELS.length;   // 切到另一条通道
          return new Promise(function (ok) { setTimeout(ok, 1200 * (attempt + 1)); })
            .then(function () { return runOnce(code, stdin, attempt + 1); });
        }
        return {
          verdict: 'ERR', output: '', ms: res.ms,
          error: '评测服务请求失败（Wandbox 与备用 Compiler Explorer 均不可达）：' + res.reason +
            '（请检查网络，或稍后重试）', noRetry: true
        };
      }
      curChannel = i;
      return res;
    });
  }

  function classifyWandbox(j, ms) {
    var cerr = String(j.compiler_error || '').trim();
    var perr = String(j.program_error || '').trim();
    // 编译服务自身容量不足（并非用户的错）→ 交给上层切换通道重试
    if (/OCI runtime error|crun|Resource temporarily unavailable/i.test(cerr + ' ' + perr)) {
      return { infraFail: true, reason: 'wandbox capacity', ms: ms };
    }
    if (cerr) {
      return {
        verdict: 'CE', output: '', ms: ms,
        error: cerr,
        compilerMessage: j.compiler_message || ''
      };
    }
    if (j.compiler_message && /error:/i.test(j.compiler_message) && !j.program_output && !j.program_error) {
      return { verdict: 'CE', output: '', ms: ms, error: String(j.compiler_message).slice(0, 4000) };
    }
    var status = j.status;
    var sig = String(j.signal || '');
    if (sig && /KILL|TERM|ALRM/i.test(sig)) {
      return { verdict: 'TLE', output: j.program_output || '', ms: ms, error: '运行超时（' + sig + '）' };
    }
    if (status !== 0 && status !== '0' && status != null) {
      return {
        verdict: 'RE', output: j.program_output || '', ms: ms,
        error: String(perr || j.program_message || '运行时错误 (status=' + status + ')').slice(0, 2000)
      };
    }
    if (perr) {
      return { verdict: 'RE', output: j.program_output || '', ms: ms, error: perr.slice(0, 2000) };
    }
    return { verdict: 'OK', output: j.program_output || '', ms: ms, error: null };
  }

  /** Compiler Explorer 响应 → 统一结果结构 */
  function classifyGodbolt(j, ms) {
    if (j.code != null && String(j.code) !== '0') {
      var cerr = (j.stderr || []).map(function (x) { return stripAnsi(x.text); }).join('\n');
      return { verdict: 'CE', output: '', ms: ms, error: cerr.slice(0, 4000) };
    }
    var exec = j.execResult || {};
    var out = (exec.stdout || []).map(function (x) { return x.text; }).join('\n');
    var errText = (exec.stderr || []).map(function (x) { return stripAnsi(x.text); }).join('\n');
    if (exec.timedOut || /SIGKILL|SIGTERM|SIGALRM/i.test(errText) || exec.code === 124 || exec.code === 137 || exec.code === 143) {
      return { verdict: 'TLE', output: out, ms: ms, error: '运行超时' };
    }
    if (exec.code != null && String(exec.code) !== '0') {
      return {
        verdict: 'RE', output: out, ms: ms,
        error: (errText || '运行时错误 (status=' + exec.code + ')').slice(0, 2000)
      };
    }
    return { verdict: 'OK', output: out, ms: ms, error: null };
  }

  /**
   * 提交整题
   * @param code 用户 C++ 代码
   * @param tests [{input, output, score}]
   * @param onProgress(caseResult, index, total)
   * @returns Promise<{verdict, score, passed, total, cases, compilerError, ms}>
   */
  function submit(code, tests, onProgress) {
    var total = tests.length;
    var cases = new Array(total);
    var t0 = Date.now();
    var idx = 0, done = 0, compileFail = null;
    var maxMs = 0;

    function next() {
      if (idx >= total) return Promise.resolve();
      var my = idx++;
      var c = tests[my];
      var key = hash(code) + '|' + hash(c.input);
      var p;
      if (cache[key]) {
        p = Promise.resolve(cache[key]);
      } else {
        p = runOnce(code, c.input).then(function (r) {
          cache[key] = { v: r.verdict, out: r.output, err: r.error, ms: r.ms };
          return r;
        });
      }
      return p.then(function (r) {
        maxMs = Math.max(maxMs, r.ms || 0);
        var res;
        if (r.verdict === 'CE') {
          compileFail = r.error;
          res = { i: my, verdict: 'CE', score: 0, output: '', expected: c.output, error: r.error, ms: r.ms };
        } else if (r.verdict === 'RE') {
          res = { i: my, verdict: 'RE', score: 0, output: r.output, expected: c.output, error: r.error, ms: r.ms };
        } else if (r.verdict === 'TLE') {
          res = { i: my, verdict: 'TLE', score: 0, output: r.output, expected: c.output, error: r.error, ms: r.ms };
        } else if (r.verdict === 'ERR') {
          res = { i: my, verdict: 'ERR', score: 0, output: '', expected: c.output, error: r.error, ms: r.ms };
        } else {
          var ok = norm(r.output) === norm(c.output);
          res = {
            i: my, verdict: ok ? 'AC' : 'WA', score: ok ? (c.score || 0) : 0,
            output: r.output, expected: c.output, error: null, ms: r.ms
          };
        }
        res.cached = !!cache[key];
        cases[my] = res;
        done++;
        if (onProgress) { try { onProgress(res, done, total); } catch (e) { } }
        // 编译错误：整题直接失败，不再跑剩余点
        if (compileFail) { idx = total; return Promise.resolve(); }
        return next();
      });
    }

    var workers = [];
    for (var w = 0; w < Math.min(CONCURRENCY, total); w++) workers.push(next());

    return Promise.all(workers).then(function () {
      for (var i = 0; i < total; i++) {
        if (!cases[i]) cases[i] = { i: i, verdict: 'ERR', score: 0, error: '未执行', output: '', expected: tests[i].output };
      }
      saveCache();
      var score = cases.reduce(function (s, c) { return s + (c.score || 0); }, 0);
      var passed = cases.filter(function (c) { return c.verdict === 'AC'; }).length;
      var serviceErrors = cases.filter(function (c) { return c.verdict === 'ERR'; }).length;
      var verdict;
      if (compileFail) verdict = 'CE';
      else if (passed === total) verdict = 'AC';
      else if (serviceErrors > 0) verdict = 'ERR';          // 服务繁忙 ≠ 用户做错
      else if (passed === 0) {
        verdict = cases.some(function (c) { return c.verdict === 'RE'; }) ? 'RE'
          : cases.some(function (c) { return c.verdict === 'TLE'; }) ? 'TLE' : 'WA';
      } else verdict = 'WA';
      return {
        verdict: verdict, score: score, passed: passed, total: total,
        cases: cases, compilerError: compileFail, ms: Date.now() - t0,
        maxCaseMs: maxMs, serviceErrors: serviceErrors
      };
    });
  }

  /** 只做一次编译检查（用空输入跑第一个测试点会浪费，这里用编译报错探测） */
  function compileCheck(code) {
    return runOnce(code, '').then(function (r) {
      return { ok: r.verdict !== 'CE' && r.verdict !== 'ERR', error: r.error || null };
    });
  }

  loadCache();

  global.CSP = global.CSP || {};
  global.CSP.judge = {
    submit: submit,
    compileCheck: compileCheck,
    norm: norm,
    clearCache: function () { cache = {}; saveCache(); }
  };
})(typeof window !== 'undefined' ? window : globalThis);
