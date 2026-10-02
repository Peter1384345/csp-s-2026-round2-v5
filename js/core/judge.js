/* ============================================================================
 * 实时评测 (judge.js)
 *   GitHub Pages 无法在后端编译 C++，因此通过浏览器调用 Wandbox 公共编译服务
 *   （https://wandbox.org/api/compile.json，免密钥、支持 CORS）。
 *
 *   - 逐测试点编译运行，实时回报每个测试点的结果（AC/WA/RE/CE/TLE）
 *   - 按通过测试点比例给分（与官方「按测试点给分」一致，可拿部分分）
 *   - 结果按 (代码, 输入) 哈希缓存，避免重复请求
 * ==========================================================================*/
(function (global) {
  'use strict';

  var COMPILER = 'gcc-13.2.0';
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

  function endpoint() {
    var st = global.CSP && global.CSP.store && global.CSP.store.S();
    return (st && st.settings && st.settings.judgeEndpoint) || 'https://wandbox.org/api/compile.json';
  }

  /** 单次编译运行 */
  function runOnce(code, stdin, attempt) {
    attempt = attempt || 0;
    var t0 = Date.now();
    var body = JSON.stringify({ compiler: COMPILER, code: code, stdin: stdin || '' });
    return fetch(endpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body
    }).then(function (r) {
      if (r.status === 429 || r.status >= 500) throw new Error('rate:' + r.status);
      return r.json();
    }).then(function (j) {
      var res = classify(j, Date.now() - t0);
      if (res.verdict === 'ERR' && attempt < 4) throw new Error('retry');
      return res;
    }).catch(function (e) {
      if (attempt < 4 && /rate:|retry|Failed to fetch|NetworkError|timeout/i.test(e.message)) {
        return new Promise(function (ok) { setTimeout(ok, 1200 * (attempt + 1)); })
          .then(function () { return runOnce(code, stdin, attempt + 1); });
      }
      return {
        verdict: 'ERR', output: '', error: '评测服务请求失败：' + e.message +
          '（请检查网络，或稍后重试）', ms: Date.now() - t0, noRetry: true
      };
    });
  }

  function classify(j, ms) {
    var cerr = String(j.compiler_error || '').trim();
    var perr = String(j.program_error || '').trim();
    // 编译服务自身容量不足（并非用户的错）→ 交给上层重试
    if (/OCI runtime error|crun|Resource temporarily unavailable/i.test(cerr + ' ' + perr)) {
      return { verdict: 'ERR', output: '', ms: ms, error: '评测服务暂时繁忙，正在重试…', capacity: true };
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
