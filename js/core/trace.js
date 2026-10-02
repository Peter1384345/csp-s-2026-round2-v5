/* ============================================================================
 * CSP-S 2026 第二轮 · 算法可视化追踪引擎 (trace.js)
 * ----------------------------------------------------------------------------
 * 设计目标：
 *   标准算法与「我的算法」用同一套 API 编写，在同一输入上运行，
 *   各自产出「步骤序列」，从而可以逐步并排对比、定位第一处分歧。
 *
 * 算法编写约定（参考实现与用户实现完全一致）：
 *
 *   function solve(input, T) {
 *     const S = { a: [2,7,11,15], l: 0, r: 3, target: 9 };
 *     T.step(S, "初始状态 l=0, r=3");        // 记录一步：S 会被深拷贝快照
 *     while (S.l < S.r) {
 *       S.sum = S.a[S.l] + S.a[S.r];
 *       T.step(S, `a[${S.l}]+a[${S.r}]=${S.sum}`);   // 同一对象可复用
 *       if (S.sum === S.target) break;
 *       S.sum < S.target ? S.l++ : S.r--;
 *       T.step(S, "移动指针");
 *     }
 *     T.answer(`${S.l+1} ${S.r+1}`);          // 声明最终答案（用于结果对比）
 *     return `${S.l+1} ${S.r+1}`;
 *   }
 *
 * 引擎保证：
 *   - 用 new Function 编译并注入 sourceURL，从而可以从调用栈取到
 *     「当前执行到用户代码的第几行」，用于代码面板高亮。
 *   - 设置步数上限与时限，防止死循环把页面卡死（超限抛 TraceLimit）。
 *   - 每一步深拷贝状态，互不干扰。
 * ==========================================================================*/
(function (global) {
  'use strict';

  var MAX_STEPS = 20000;
  // 墙钟上限只是「死循环」的兜底：真正可靠的护栏是上面的步数上限，
  // 以及浏览器端 runner.js 的 Worker 超时。这里放宽以免机器繁忙时误杀正常算法。
  var MAX_MS = 12000;

  /* --------------------------------------------------------------------------
   * 输入分词器：竞赛风格按「空白字符」分割读取
   * ------------------------------------------------------------------------*/
  function Tokens(input) {
    this.buf = String(input == null ? '' : input).trim().split(/\s+/);
    if (this.buf.length === 1 && this.buf[0] === '') this.buf = [];
    this.i = 0;
  }
  Tokens.prototype.next = function () { return this.buf[this.i++]; };
  Tokens.prototype.int = function () { return parseInt(this.buf[this.i++], 10); };
  Tokens.prototype.num = function () { return Number(this.buf[this.i++]); };
  Tokens.prototype.ints = function (n) {
    var a = [], k;
    for (k = 0; k < n; k++) a.push(this.int());
    return a;
  };
  Tokens.prototype.left = function () { return this.buf.length - this.i; };
  Tokens.prototype.rest = function () { return this.buf.slice(this.i); };

  function lines(input) {
    return String(input == null ? '' : input).replace(/\r\n?/g, '\n').replace(/\n+$/, '').split('\n');
  }

  /* --------------------------------------------------------------------------
   * 深拷贝：只保留可序列化的可视化数据（数组/数字/字符串/布尔/嵌套对象）
   * ------------------------------------------------------------------------*/
  function clone(v, depth) {
    depth = depth || 0;
    if (v === null || v === undefined) return null;
    var t = typeof v;
    if (t === 'number') return Number.isFinite(v) ? v : String(v);
    if (t === 'string' || t === 'boolean') return v;
    if (t === 'bigint') return Number(v);
    if (t === 'function') return '[fn]';
    if (depth > 6) return '[deep]';
    if (Array.isArray(v)) {
      var arr = [], i;
      for (i = 0; i < v.length && i < 4096; i++) arr.push(clone(v[i], depth + 1));
      return arr;
    }
    if (v instanceof Map) {
      var mo = {};
      v.forEach(function (val, key) { mo[String(key)] = clone(val, depth + 1); });
      return mo;
    }
    if (v instanceof Set) {
      var so = [];
      v.forEach(function (val) { so.push(clone(val, depth + 1)); });
      return so;
    }
    var out = {}, keys = Object.keys(v);
    for (var k = 0; k < keys.length; k++) {
      var key = keys[k];
      if (key.charAt(0) === '_') continue;   // 下划线开头 = 内部变量，不参与可视化
      out[key] = clone(v[key], depth + 1);
    }
    return out;
  }

  /* --------------------------------------------------------------------------
   * 栈帧解析：拿到「当前执行到用户代码的行号」
   *   V8 经 new Function 编译后，函数体的行号带固定偏移，
   *   这里用一个探针函数在加载时标定偏移量。
   * ------------------------------------------------------------------------*/
  var LINE_OFFSET = 0;
  var MARKER = 'csp-algo.js';
  (function calibrate() {
    try {
      var probe = new Function('return (new Error()).stack;' + '\n//# sourceURL=' + MARKER);
      var stack = String(probe() || '');
      var m = stack.match(new RegExp(MARKER.replace('.', '\\.') + ':(\\d+):(\\d+)'));
      if (m) LINE_OFFSET = parseInt(m[1], 10) - 1;   // 探针调用发生在函数体第 1 行
    } catch (e) { LINE_OFFSET = 0; }
  })();

  function currentLine() {
    try {
      var stack = String(new Error().stack || '');
      var re = new RegExp(MARKER.replace('.', '\\.') + ':(\\d+):(\\d+)', 'g');
      var m = re.exec(stack);
      if (m) return Math.max(1, parseInt(m[1], 10) - LINE_OFFSET);
    } catch (e) { /* ignore */ }
    return 0;
  }

  function TraceLimit(msg) {
    var e = new Error(msg);
    e.name = 'TraceLimit';
    return e;
  }

  /* --------------------------------------------------------------------------
   * Tracer：注入到算法中的观察者对象
   *   注意：内部答案字段命名为 answerText，避免遮蔽 prototype 上的 answer() 方法。
   * ------------------------------------------------------------------------*/
  function Tracer(input) {
    this.steps = [];
    this.answerText = null;
    this.t0 = (global.performance && performance.now) ? performance.now() : Date.now();
    this.input = input;
    this.tokens = new Tokens(input);
    this.lines = lines(input);
    this.sigKeys = null;
    this.finished = false;
    this.notes = [];
  }

  /** 记录一步。state 为「当前全部可见变量」的普通对象。 */
  Tracer.prototype.step = function (state, note, opts) {
    var now = (global.performance && performance.now) ? performance.now() : Date.now();
    if (this.steps.length >= MAX_STEPS) throw TraceLimit('步数超过上限 ' + MAX_STEPS + '，疑似死循环');
    if (now - this.t0 > MAX_MS) throw TraceLimit('运行超过 ' + MAX_MS + 'ms，疑似死循环或复杂度过高');
    var rec = {
      i: this.steps.length,
      line: currentLine(),
      note: note == null ? '' : String(note),
      state: clone(state)
    };
    if (opts && opts.bad) rec.bad = true;
    if (opts && opts.tag) rec.tag = opts.tag;
    this.steps.push(rec);
    return rec;
  };

  /** 只记录一条日志（同时记录一步），用于补充说明 */
  Tracer.prototype.log = function (msg) {
    this.notes.push(String(msg));
    var last = this.steps.length ? this.steps[this.steps.length - 1].state : {};
    return this.step(last, msg);
  };

  /** 声明最终答案 */
  Tracer.prototype.answer = function (v) {
    this.answerText = v == null ? '' : String(v);
    this.finished = true;
    return this.answerText;
  };

  /** 指定参与「逐步一致性比较」的关键变量（默认比较全部可见字段） */
  Tracer.prototype.sig = function (keys) {
    this.sigKeys = keys;
    return this;
  };

  /** 只读辅助：安全取数 */
  Tracer.prototype.at = function (arr, i) {
    return (arr && i >= 0 && i < arr.length) ? arr[i] : undefined;
  };

  /* --------------------------------------------------------------------------
   * 运行算法
   *   run(source, input) -> { ok, steps, answer, out, error, errorType, ms }
   * ------------------------------------------------------------------------*/
  function run(source, input, opts) {
    opts = opts || {};
    var T = new Tracer(input);
    var t0 = (global.performance && performance.now) ? performance.now() : Date.now();
    var fn, out = null;
    try {
      // 允许两种写法：function solve(input,T){} 或 function solve(input){}
      var body = String(source || '');
      fn = new Function('T', 'input',
        body +
        '\nreturn (typeof solve === "function") ? solve(input, T) : undefined;' +
        '\n//# sourceURL=' + MARKER);
    } catch (compileErr) {
      return {
        ok: false, steps: [], answer: null, out: null,
        error: '语法错误: ' + compileErr.message, errorType: 'SyntaxError',
        ms: 0
      };
    }
    try {
      out = fn(T, input);
    } catch (e) {
      var isLimit = e && e.name === 'TraceLimit';
      return {
        ok: false,
        steps: T.steps,
        answer: T.answerText,
        out: null,
        error: (isLimit ? '⏱ ' : '💥 ') + (e && e.message ? e.message : String(e)),
        errorType: isLimit ? 'TraceLimit' : 'RuntimeError',
        ms: ((global.performance && performance.now) ? performance.now() : Date.now()) - t0
      };
    }
    return {
      ok: true,
      steps: T.steps,
      answer: T.answerText != null ? T.answerText : (out == null ? null : String(out)),
      out: out,
      error: null,
      errorType: null,
      ms: ((global.performance && performance.now) ? performance.now() : Date.now()) - t0
    };
  }

  /* --------------------------------------------------------------------------
   * 状态签名：用于「逐步一致性」比较
   * ------------------------------------------------------------------------*/
  function signature(step, sigKeys) {
    if (!step) return '\u0000';
    var st = step.state || {};
    var keys = (sigKeys && sigKeys.length) ? sigKeys.slice() : Object.keys(st);
    keys.sort();
    var parts = [];
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (k === 'note') continue;
      var v = st[k];
      parts.push(k + '=' + (v !== null && typeof v === 'object' ? JSON.stringify(v) : String(v)));
    }
    return parts.join('|');
  }

  function stateEqual(a, b) { return signature(a) === signature(b); }

  /* --------------------------------------------------------------------------
   * 逐步对比：按步号对齐两条轨迹，逐字段比较，找出第一处分歧
   * ------------------------------------------------------------------------*/
  function compare(refRes, userRes) {
    var refSteps = refRes.steps || [];
    var userSteps = userRes.steps || [];
    var n = Math.max(refSteps.length, userSteps.length);
    var rows = [];
    var firstDiv = -1;
    var divergedKeys = [];
    for (var i = 0; i < n; i++) {
      var r = refSteps[i] || null;
      var u = userSteps[i] || null;
      var same = false;
      var diffKeys = [];
      if (r && u) {
        var keys = uniq(Object.keys(r.state || {}).concat(Object.keys(u.state || {})));
        for (var k = 0; k < keys.length; k++) {
          var key = keys[k];
          if (key === 'note') continue;
          if (JSON.stringify(r.state[key]) !== JSON.stringify(u.state[key])) diffKeys.push(key);
        }
        same = diffKeys.length === 0;
      }
      if (!same && firstDiv === -1) { firstDiv = i; divergedKeys = diffKeys; }
      rows.push({ i: i, ref: r, user: u, same: same, diffKeys: diffKeys });
    }

    var refAns = norm(refRes.answer);
    var userAns = norm(userRes.answer != null ? userRes.answer : userRes.out);
    var answerSame = refAns === userAns;

    var verdict, verdictLevel;
    if (!userRes.ok) {
      verdict = '运行失败：' + userRes.error;
      verdictLevel = 'error';
    } else if (!answerSame) {
      verdict = '结论错误：你的输出与标准算法不一致' +
        (firstDiv >= 0 ? '，第 ' + (firstDiv + 1) + ' 步开始就出现了分歧' : '');
      verdictLevel = 'wrong';
    } else if (firstDiv === -1) {
      verdict = '完全一致：不仅结论相同，每一步的状态变化也与标准算法完全相同';
      verdictLevel = 'perfect';
    } else {
      verdict = '结论正确，但过程不同：第 ' + (firstDiv + 1) +
        ' 步起状态与标准算法不同（可能思路更优，也可能隐藏边界风险）';
      verdictLevel = 'different';
    }

    return {
      rows: rows,
      firstDivergence: firstDiv,
      divergedKeys: divergedKeys,
      answerSame: answerSame,
      refAnswer: refRes.answer,
      userAnswer: userRes.answer != null ? userRes.answer : userRes.out,
      refSteps: refSteps.length,
      userSteps: userSteps.length,
      verdict: verdict,
      verdictLevel: verdictLevel
    };
  }

  function uniq(a) {
    var seen = {}, out = [];
    for (var i = 0; i < a.length; i++) if (!seen[a[i]]) { seen[a[i]] = 1; out.push(a[i]); }
    return out;
  }

  /** 输出归一化：忽略行尾空白、末尾空行 */
  function norm(s) {
    if (s == null) return '';
    return String(s).replace(/\r\n?/g, '\n').split('\n')
      .map(function (l) { return l.replace(/\s+$/, ''); })
      .join('\n').replace(/\n+$/, '').trim();
  }

  /** 逐 token 比较（用于定位第几个数错了） */
  function tokenDiff(expected, actual) {
    var e = norm(expected).split(/\s+/).filter(Boolean);
    var a = norm(actual).split(/\s+/).filter(Boolean);
    var n = Math.max(e.length, a.length), bad = [];
    for (var i = 0; i < n; i++) if (e[i] !== a[i]) bad.push({ i: i, expected: e[i], actual: a[i] });
    return { total: n, badCount: bad.length, bad: bad.slice(0, 50) };
  }

  /* --------------------------------------------------------------------------
   * 随机小数据对拍：找出第一个让「我的算法」输出错误的用例
   * ------------------------------------------------------------------------*/
  function fuzz(refSource, userSource, genSource, rounds, onProgress) {
    var gen;
    try {
      gen = new Function('return (' + genSource + ')')();
    } catch (e) {
      return { error: '数据生成器语法错误: ' + e.message };
    }
    var found = null, count = rounds || 30, tried = 0;
    for (var r = 0; r < count; r++) {
      var input;
      try { input = String(gen(r)); } catch (e) { continue; }
      tried++;
      var rr = run(refSource, input);
      var ur = run(userSource, input);
      if (rr.answer == null && rr.ok) { continue; }
      if (!ur.ok) {
        found = { input: input, refAnswer: rr.answer, userAnswer: null, error: ur.error, round: r, cause: 'runtime' };
        break;
      }
      if (norm(rr.answer) !== norm(ur.answer)) {
        found = { input: input, refAnswer: rr.answer, userAnswer: ur.answer, round: r, cause: 'wrong-answer' };
        break;
      }
      if (onProgress && r % 5 === 0) onProgress(r, count);
    }
    return { found: found, tried: tried, total: count };
  }

  global.CSP = global.CSP || {};
  global.CSP.trace = {
    run: run,
    compare: compare,
    fuzz: fuzz,
    signature: signature,
    stateEqual: stateEqual,
    tokenDiff: tokenDiff,
    norm: norm,
    clone: clone,
    Tokens: Tokens,
    lines: lines,
    MAX_STEPS: MAX_STEPS
  };
})(typeof window !== 'undefined' ? window : globalThis);
