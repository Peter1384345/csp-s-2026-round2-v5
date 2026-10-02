/* ============================================================================
 * 算法安全运行器 (runner.js)
 *   学生的「我的算法」可能在死循环里卡住主线程，因此放进 Web Worker 里跑，
 *   超时直接 terminate。file:// 场景下 worker/fetch 不可用时退化为同步执行
 *   （此时依赖 trace.js 内部的步数与时间上限保护）。
 * ==========================================================================*/
(function (global) {
  'use strict';

  var traceSrc = null;         // trace.js 源码缓存
  var loading = null;

  function loadTraceSrc() {
    if (traceSrc) return Promise.resolve(traceSrc);
    if (loading) return loading;
    loading = fetch('js/core/trace.js')
      .then(function (r) { return r.text(); })
      .then(function (t) { traceSrc = t; return t; })
      .catch(function () { return null; });
    return loading;
  }

  var workerSrc = [
    'self.onmessage = function (e) {',
    '  try {',
    '    (0, eval)(e.data.traceSrc);',
    '    var TR = self.CSP.trace;',
    '    if (e.data.mode === "fuzz") {',
    '      var gen = new Function("return (" + e.data.gen + ")")();',
    '      var found = null, tried = 0;',
    '      for (var r = 0; r < e.data.rounds; r++) {',
    '        var input;',
    '        try { input = String(gen(r)); } catch (err1) { continue; }',
    '        tried++;',
    '        var rr = TR.run(e.data.ref, input);',
    '        var ur = TR.run(e.data.user, input);',
    '        if (rr.ok && rr.answer == null) continue;',
    '        if (!ur.ok) { found = { input: input, refAnswer: rr.answer, userAnswer: null, error: ur.error, round: r, cause: "runtime" }; break; }',
    '        if (TR.norm(rr.answer) !== TR.norm(ur.answer)) {',
    '          found = { input: input, refAnswer: rr.answer, userAnswer: ur.answer, round: r, cause: "wrong-answer" }; break;',
    '        }',
    '      }',
    '      self.postMessage({ ok: true, fuzz: { found: found, tried: tried, total: e.data.rounds } });',
    '      return;',
    '    }',
    '    var res = TR.run(e.data.source, e.data.input);',
    '    self.postMessage({ ok: true, res: res });',
    '  } catch (err) {',
    '    self.postMessage({ ok: false, error: String(err && err.message || err) });',
    '  }',
    '};'
  ].join('\n');

  var blobUrl = null;
  function getWorkerUrl() {
    if (blobUrl) return blobUrl;
    var blob = new Blob([workerSrc], { type: 'application/javascript' });
    blobUrl = URL.createObjectURL(blob);
    return blobUrl;
  }

  function canUseWorker() {
    return typeof Worker !== 'undefined' && typeof Blob !== 'undefined' &&
      typeof URL !== 'undefined' && URL.createObjectURL && location.protocol !== 'file:';
  }

  /** 异步安全运行 */
  function run(source, input, opts) {
    opts = opts || {};
    var timeout = opts.timeout || 6000;
    if (!canUseWorker()) {
      // 退化：同步运行（trace.js 内部有 MAX_STEPS/MAX_MS 保护）
      return new Promise(function (resolve) {
        var r;
        try { r = global.CSP.trace.run(source, input); }
        catch (e) { r = { ok: false, steps: [], error: String(e.message || e), errorType: 'RuntimeError', answer: null }; }
        resolve(r);
      });
    }
    return loadTraceSrc().then(function (src) {
      if (!src) {
        var r = global.CSP.trace.run(source, input);
        return r;
      }
      return new Promise(function (resolve) {
        var w, finished = false;
        var timer = setTimeout(function () {
          if (finished) return;
          finished = true;
          try { w.terminate(); } catch (e) { }
          resolve({
            ok: false, steps: [], answer: null, out: null,
            error: '⏱ 运行超时（超过 ' + (timeout / 1000) + ' 秒被强制终止）：请检查是否存在死循环，或是否忘记在循环里调用 T.step',
            errorType: 'TimeoutLimit', ms: timeout
          });
        }, timeout);
        try {
          w = new Worker(getWorkerUrl());
        } catch (e) {
          clearTimeout(timer);
          resolve(global.CSP.trace.run(source, input));
          return;
        }
        w.onmessage = function (e) {
          if (finished) return;
          finished = true;
          clearTimeout(timer);
          try { w.terminate(); } catch (err) { }
          if (e.data && e.data.ok) resolve(e.data.res);
          else resolve({
            ok: false, steps: [], answer: null, out: null,
            error: '💥 ' + (e.data && e.data.error || '未知错误'), errorType: 'RuntimeError', ms: 0
          });
        };
        w.onerror = function (e) {
          if (finished) return;
          finished = true;
          clearTimeout(timer);
          try { w.terminate(); } catch (err) { }
          resolve({
            ok: false, steps: [], answer: null, out: null,
            error: '💥 ' + (e.message || 'Worker 执行错误'), errorType: 'RuntimeError', ms: 0
          });
        };
        w.postMessage({ traceSrc: src, source: source, input: input });
      });
    });
  }

  /** 异步对拍：整个对拍循环放进单个 Worker，避免为每一轮各建一个 Worker */
  function fuzz(refSource, userSource, genSource, rounds, opts) {
    opts = opts || {};
    var timeout = opts.timeout || 20000;
    rounds = rounds || 60;
    if (!canUseWorker()) {
      return Promise.resolve(global.CSP.trace.fuzz(refSource, userSource, genSource, rounds));
    }
    return loadTraceSrc().then(function (src) {
      if (!src) return global.CSP.trace.fuzz(refSource, userSource, genSource, rounds);
      return new Promise(function (resolve) {
        var w, finished = false;
        var timer = setTimeout(function () {
          if (finished) return;
          finished = true;
          try { w.terminate(); } catch (e) { }
          resolve({ error: '对拍超时：可能是某个随机用例让算法陷入死循环' });
        }, timeout);
        try { w = new Worker(getWorkerUrl()); }
        catch (e) {
          clearTimeout(timer);
          resolve(global.CSP.trace.fuzz(refSource, userSource, genSource, rounds));
          return;
        }
        w.onmessage = function (e) {
          if (finished) return;
          finished = true;
          clearTimeout(timer);
          try { w.terminate(); } catch (err) { }
          if (e.data && e.data.ok) resolve(e.data.fuzz);
          else resolve({ error: (e.data && e.data.error) || '对拍执行失败' });
        };
        w.onerror = function (e) {
          if (finished) return;
          finished = true;
          clearTimeout(timer);
          try { w.terminate(); } catch (err) { }
          resolve({ error: (e && e.message) || 'Worker 执行错误' });
        };
        w.postMessage({ mode: 'fuzz', traceSrc: src, ref: refSource, user: userSource, gen: genSource, rounds: rounds });
      });
    });
  }

  global.CSP = global.CSP || {};
  global.CSP.runner = { run: run, fuzz: fuzz };
})(typeof window !== 'undefined' ? window : globalThis);
