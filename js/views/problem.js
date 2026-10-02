/* ============================================================================
 * 题目页 (views/problem.js)
 *   同一页面包含：题面 / 题解 / 知识点卡片 / 代码编辑与实时评测
 *                 + 算法可视化（标准算法 ⟷ 我的算法 逐步并排对比）
 * ==========================================================================*/
(function (global) {
  'use strict';
  var U = global.CSP.ui;

  global.CSP.views = global.CSP.views || {};

  /* ------------------------------------------------------------ 工具 --- */
  function findProblem(pid) {
    return (global.CSP.problems || []).filter(function (p) { return p.id === pid; })[0];
  }
  function cardOf(kid) {
    return (global.CSP.cards || {})[kid] || null;
  }
  function knowName(kid) {
    var k = (global.CSP.syllabus || []).filter(function (x) { return x.id === kid; })[0];
    return k ? k.name : kid;
  }
  function codeKey(pid) { return 'csp-s-v5-code-' + pid; }
  function algoKey(pid) { return 'csp-s-v5-algo-' + pid; }

  function loadUserCode(pid, fallback) {
    try {
      var v = localStorage.getItem(codeKey(pid));
      return v != null ? v : fallback;
    } catch (e) { return fallback; }
  }
  function saveUserCode(pid, v) {
    try { localStorage.setItem(codeKey(pid), v); } catch (e) { }
  }
  function loadUserAlgo(pid, fallback) {
    try {
      var v = localStorage.getItem(algoKey(pid));
      return v != null ? v : fallback;
    } catch (e) { return fallback; }
  }
  function saveUserAlgo(pid, v) {
    try { localStorage.setItem(algoKey(pid), v); } catch (e) { }
  }

  var DEFAULT_CPP = [
    '#include <bits/stdc++.h>',
    'using namespace std;',
    '',
    'int main() {',
    '    ios::sync_with_stdio(false);',
    '    cin.tie(nullptr);',
    '    ',
    '    // TODO: 在这里写你的解法',
    '    ',
    '    return 0;',
    '}'
  ].join('\n');

  /* ==========================================================================
   * 知识点卡片（详情视图，题目页与知识图谱页共用）
   * ========================================================================*/
  function knowledgeCardHtml(kid, opts) {
    opts = opts || {};
    var k = cardOf(kid);
    var name = knowName(kid);
    var st = U0().kstate(kid).state;
    var probs = (global.CSP.problems || []).filter(function (p) {
      return (p.knowledge || []).indexOf(kid) >= 0;
    });
    var h = '<div class="kcard-detail">';
    h += '<div class="flex flex-wrap mb">' +
      '<span class="diff diff-' + (k ? Math.min(6, 2 + (k.level || 1)) : 2) + '">' + U.esc(name) + '</span>' +
      '<span class="mono-sm">' + U.esc(id2cat(kid)) + '</span>' +
      (st === 'flagged' ? '<span class="kstate ks-flagged">待巩固</span>' :
        st === 'mastered' ? '<span class="kstate ks-mastered">已掌握</span>' :
          st === 'learning' ? '<span class="kstate ks-learning">复习中</span>' : '') +
      '<span class="ml-auto flex">' +
      '<button class="btn btn-xs" data-kmark="mastered">标记掌握</button>' +
      '<button class="btn btn-xs" data-kmark="flagged">标为待巩固</button>' +
      '</span></div>';

    if (!k) {
      h += '<div class="empty">该知识点暂无卡片内容</div>';
      return h + '</div>';
    }
    h += '<h4>是什么</h4><p style="font-size:13.5px;color:#d7e3f4;line-height:1.85">' + U.rich(k.definition) + '</p>';
    h += '<h4>怎么做 · 核心要点</h4><ul>' + (k.keyPoints || []).map(function (x) {
      return '<li>' + U.rich(x) + '</li>';
    }).join('') + '</ul>';
    h += '<h4>复杂度</h4><div class="mono-sm" style="font-size:12.5px;color:#8ba1bd">' + U.rich(k.complexity) + '</div>';
    h += '<h4>易错点</h4><ul>' + (k.pitfalls || []).map(function (x) {
      return '<li style="color:#ffc4d1">' + U.rich(x) + '</li>';
    }).join('') + '</ul>';
    if (k.pattern) h += '<h4>识别套路</h4><div class="mono-sm" style="font-size:12.5px;color:#9fd0ff">' + U.rich(k.pattern) + '</div>';
    if (k.template) h += '<h4>代码骨架</h4><div class="pill-tpl">' + U.esc(k.template) + '</div>';
    if (probs.length) {
      h += '<h4>相关题目</h4><div>' + probs.map(function (p) {
        return '<a class="chip" href="#/problem/' + p.id + '">' + p.id.toUpperCase() + ' ' + U.esc(p.title) + '</a>';
      }).join('') + '</div>';
    }
    return h + '</div>';
  }
  function U0() { return global.CSP.store; }
  function id2cat(id) {
    var k = (global.CSP.syllabus || []).filter(function (x) { return x.id === id; })[0];
    return k ? k.cat : '';
  }

  function bindKmark(root, kid) {
    U.$$('[data-kmark]', root).forEach(function (b) {
      b.onclick = function () {
        global.CSP.store.setKstate(kid, b.getAttribute('data-kmark'));
        U.toast('已标记为「' + (b.getAttribute('data-kmark') === 'mastered' ? '掌握' : '待巩固') + '」', 'ok');
        global.CSP.app.refresh();
      };
    });
  }

  /* ==========================================================================
   * 算法可视化控制器
   * ========================================================================*/
  function VizCtrl(host, problem, store) {
    var self = this;
    this.host = typeof host === 'string' ? document.querySelector(host) : host;
    if (!this.host) throw new Error('VizCtrl: 找不到可视化容器');
    this.p = problem;
    this.store = store;
    this.algo = problem.algo || {};
    this.refSrc = this.algo.ref || '';
    this.userSrc = loadUserAlgo(problem.id, this.algo.userTemplate || this.refSrc);
    this.viz = this.algo.viz || { type: 'array', mainKey: 'a' };
    this.input = this.viz.input || (problem.samples && problem.samples[0] ? problem.samples[0].input : '');
    this.i = 0;
    this.playing = false;
    this.speed = 380;
    this.timer = null;
    this.traceRef = null;
    this.traceUser = null;
    this.cmp = null;
    this.build();
    this.runCompare();
  }

  VizCtrl.prototype.build = function () {
    var self = this;
    var p = this.p;
    this.host.innerHTML = [
      '<div class="viz-ctl">',
      '  <span class="mono-sm">输入数据</span>',
      '  <textarea id="vz-input" class="viz-input" rows="2" spellcheck="false" wrap="off" ',
      '    style="flex:1;min-width:200px;background:#070d18;border:1px solid #1b2a41;border-radius:6px;color:#d7e3f4;font-family:var(--mono);font-size:12px;padding:6px 10px;resize:vertical;outline:none">',
      U.esc(this.input),
      '</textarea>',
      '  <button class="btn btn-sm" id="vz-usesample">用样例</button>',
      '  <button class="btn btn-sm btn-primary" id="vz-run">▶ 运行并对比</button>',
      '  <button class="btn btn-sm" id="vz-fuzz">🎲 随机对拍找错</button>',
      '</div>',
      '<div class="cmp-verdict" id="vz-verdict">等待运行…</div>',
      '<div class="viz-wrap">',
      '  <div class="viz-pane">',
      '    <div class="viz-pane-hd"><span class="pill pill-ref">标准算法</span>' +
      '      <span id="vz-ref-name" style="color:#8ba1bd">' + U.esc(this.algo.title || '参考实现') + '</span>' +
      '      <span class="stepno" id="vz-ref-step">—</span></div>',
      '    <div class="viz-stage" id="vz-ref-stage"></div>',
      '    <div class="viz-note" id="vz-ref-note">—</div>',
      '  </div>',
      '  <div class="viz-pane">',
      '    <div class="viz-pane-hd"><span class="pill pill-mine">我的算法</span>' +
      '      <span style="color:#8ba1bd">你写的版本</span>' +
      '      <span class="stepno" id="vz-user-step">—</span></div>',
      '    <div class="viz-stage" id="vz-user-stage"></div>',
      '    <div class="viz-note" id="vz-user-note">—</div>',
      '  </div>',
      '</div>',
      '<div class="viz-ctl mt">',
      '  <button class="btn btn-sm" id="vz-first" title="第一步">⏮</button>',
      '  <button class="btn btn-sm" id="vz-prev" title="上一步">◀</button>',
      '  <button class="btn btn-sm btn-primary" id="vz-play" style="min-width:78px">▶ 播放</button>',
      '  <button class="btn btn-sm" id="vz-next" title="下一步">▶</button>',
      '  <button class="btn btn-sm" id="vz-last" title="最后一步">⏭</button>',
      '  <input type="range" class="step-slider" id="vz-slider" min="0" max="0" value="0">',
      '  <span class="mono-sm" id="vz-speed-label">速度</span>',
      '  <input type="range" id="vz-speed" min="60" max="1200" step="20" value="' + (1360 - this.speed) + '" style="width:90px">',
      '  <span class="prog" id="vz-progress">0 / 0</span>',
      '</div>',
      '<div class="grid g2 mt">',
      '  <div class="panel" id="vz-ref-code-panel"><div class="panel-hd"><span class="dot"></span>标准算法源码<span class="more">播放时高亮当前执行行</span></div>',
      '    <div style="max-height:300px;overflow:auto;background:#05090f">' + U.codeLines(this.refSrc, 'js') + '</div></div>',
      '  <div class="panel"><div class="panel-hd"><span class="dot" style="background:#7c5cff;box-shadow:0 0 10px #7c5cff"></span>我的算法（可编辑）',
      '    <span class="more"><span class="flex">',
      '      <button class="btn btn-xs" id="vz-tpl">载入模板</button>',
      '      <button class="btn btn-xs" id="vz-copy-ref">载入标准算法</button>',
      '    </span></span></div>',
      '    <div id="vz-code-editor"></div></div>',
      '</div>',
      '<div class="grid g2 mt">',
      '  <div class="panel"><div class="panel-hd"><span class="dot"></span>步骤序列 · 点击跳转</div>',
      '    <div class="steps-list" id="vz-steps"></div></div>',
      '  <div class="panel"><div class="panel-hd"><span class="dot" style="background:#ffb020;box-shadow:0 0 10px #ffb020"></span>当前步骤变量</div>',
      '    <div class="panel-bd" id="vz-vars-wrap"><div class="mono-sm">运行后显示</div></div>',
      '    <div class="panel-bd" style="border-top:1px solid #1b2a41"><div class="mono-sm" id="vz-answer-ref">标准答案：—</div>',
      '    <div class="mono-sm" id="vz-answer-user">我的答案：—</div></div>',
      '  </div>',
      '</div>'
    ].join('\n');

    this.el = {
      input: U.$('#vz-input', this.host),
      verdict: U.$('#vz-verdict', this.host),
      refStage: U.$('#vz-ref-stage', this.host),
      refNote: U.$('#vz-ref-note', this.host),
      userStage: U.$('#vz-user-stage', this.host),
      userNote: U.$('#vz-user-note', this.host),
      refStep: U.$('#vz-ref-step', this.host),
      userStep: U.$('#vz-user-step', this.host),
      slider: U.$('#vz-slider', this.host),
      speed: U.$('#vz-speed', this.host),
      progress: U.$('#vz-progress', this.host),
      play: U.$('#vz-play', this.host),
      steps: U.$('#vz-steps', this.host),
      vars: U.$('#vz-vars-wrap', this.host),
      ansRef: U.$('#vz-answer-ref', this.host),
      ansUser: U.$('#vz-answer-user', this.host)
    };

    this.editor = new global.CSP.Editor('#vz-code-editor', {
      lang: 'js',
      value: this.userSrc,
      onChange: function (v) { self.userSrc = v; saveUserAlgo(self.p.id, v); }
    });

    U.$('#vz-run', this.host).onclick = function () { self.runCompare(); };
    U.$('#vz-usesample', this.host).onclick = function () {
      var s = self.p.samples && self.p.samples[0];
      if (s) { self.el.input.value = s.input; self.runCompare(); }
    };
    U.$('#vz-tpl', this.host).onclick = function () {
      self.editor.setValue(self.algo.userTemplate || ''); self.userSrc = self.editor.getValue();
    };
    U.$('#vz-copy-ref', this.host).onclick = function () {
      self.editor.setValue(self.refSrc); self.userSrc = self.refSrc;
      U.toast('已载入标准算法，试着改坏某一行再运行，看看分歧怎么被定位', 'info', 3200);
    };
    U.$('#vz-fuzz', this.host).onclick = function () { self.fuzz(); };

    U.$('#vz-first', this.host).onclick = function () { self.pause(); self.goto(0); };
    U.$('#vz-prev', this.host).onclick = function () { self.pause(); self.goto(self.i - 1); };
    U.$('#vz-next', this.host).onclick = function () { self.pause(); self.goto(self.i + 1); };
    U.$('#vz-last', this.host).onclick = function () { self.pause(); self.goto(self.total() - 1); };
    this.el.play.onclick = function () { self.toggle(); };
    this.el.slider.oninput = function () { self.pause(); self.goto(parseInt(this.value, 10)); };
    this.el.speed.oninput = function () { self.speed = 1360 - parseInt(this.value, 10); };

    this.el.refCodePanel = U.$('#vz-ref-code-panel', this.host);
  };

  VizCtrl.prototype.total = function () {
    var a = this.traceRef ? this.traceRef.steps.length : 0;
    var b = this.traceUser ? this.traceUser.steps.length : 0;
    return Math.max(a, b);
  };

  VizCtrl.prototype.pause = function () {
    this.playing = false;
    clearInterval(this.timer);
    if (this.el && this.el.play) this.el.play.textContent = '▶ 播放';
  };

  VizCtrl.prototype.toggle = function () {
    var self = this;
    if (this.playing) { this.pause(); return; }
    if (this.i >= this.total() - 1) this.i = 0;
    this.playing = true;
    this.el.play.textContent = '⏸ 暂停';
    this.timer = setInterval(function () {
      if (self.i >= self.total() - 1) { self.pause(); return; }
      self.goto(self.i + 1);
    }, this.speed);
  };

  VizCtrl.prototype.goto = function (i) {
    var n = this.total();
    if (n <= 0) { this.paint(); return; }
    this.i = Math.max(0, Math.min(n - 1, i));
    this.paint();
  };

  /** 运行标准算法 + 我的算法并对比 */
  VizCtrl.prototype.runCompare = function () {
    var self = this;
    this.pause();
    this.input = this.el.input.value;
    this.el.verdict.className = 'cmp-verdict';
    this.el.verdict.innerHTML = '<span class="spinner"></span> 正在运行两个算法…';

    global.CSP.runner.run(this.refSrc, this.input).then(function (refRes) {
      self.traceRef = refRes;
      return global.CSP.runner.run(self.userSrc, self.input).then(function (userRes) {
        self.traceUser = userRes;
        self.cmp = global.CSP.trace.compare(refRes, userRes);
        self.afterRun();
      });
    });
  };

  VizCtrl.prototype.afterRun = function () {
    var s = this.store.stats();
    this.el.verdict.className = 'cmp-verdict ' + this.cmp.verdictLevel;
    var extra = '<div class="mono-sm mt" style="font-size:11.5px">标准算法 ' +
      this.traceRef.steps.length + ' 步 / 我的算法 ' + this.traceUser.steps.length + ' 步' +
      (this.traceRef.steps.length && this.traceUser.steps.length ?
        '（步数比 ' + (this.traceUser.steps.length / this.traceRef.steps.length).toFixed(2) + '×）' : '') +
      (this.cmp.divergedKeys && this.cmp.divergedKeys.length ?
        ' · 首个分歧变量：<b>' + U.esc(this.cmp.divergedKeys.join(', ')) + '</b>' : '') +
      '</div>';
    this.el.verdict.innerHTML = '<b>' + U.esc(this.cmp.verdict) + '</b>' + extra;

    this.el.ansRef.innerHTML = '标准答案：<b style="color:#3ddc84">' +
      U.esc(this.traceRef.answer == null ? '(未声明)' : this.traceRef.answer) + '</b>';
    this.el.ansUser.innerHTML = '我的答案：<b style="color:' +
      (this.cmp.answerSame ? '#3ddc84' : '#ff4d6d') + '">' +
      U.esc(this.traceUser.answer == null ? '(未声明)' : this.traceUser.answer) + '</b>';

    this.el.slider.max = Math.max(0, this.total() - 1);
    this.buildSteps();
    this.i = 0;
    this.paint();
  };

  VizCtrl.prototype.buildSteps = function () {
    var self = this;
    var refSteps = this.traceRef.steps, userSteps = this.traceUser.steps;
    var n = this.total();
    var html = '';
    for (var i = 0; i < n; i++) {
      var r = refSteps[i], u = userSteps[i];
      var div = (this.cmp.firstDivergence === i);
      var note = r ? r.note : (u ? u.note : '');
      html += '<div class="step-item' + (div ? ' div' : '') + '" data-i="' + i + '">' +
        '<span class="n">' + (i + 1) + '</span>' +
        (div ? '<span style="color:#ff4d6d">⚠</span>' : '') +
        '<span class="d">' + U.esc(note) + '</span></div>';
    }
    if (!n) html = '<div class="empty">两个算法都没有记录步骤（检查是否调用了 T.step）</div>';
    this.el.steps.innerHTML = html;
    U.$$('.step-item', this.el.steps).forEach(function (it) {
      it.onclick = function () { self.pause(); self.goto(parseInt(it.getAttribute('data-i'), 10)); };
    });
  };

  VizCtrl.prototype.paint = function () {
    var R = global.CSP.render, v = this.viz;
    var i = this.i;
    var r = this.traceRef.steps[i] || null;
    var u = this.traceUser.steps[i] || null;
    var div = this.cmp ? this.cmp.firstDivergence : -1;
    var diffKeys = (div === i && this.cmp) ? this.cmp.divergedKeys : [];

    // 结构
    this.el.refStage.innerHTML = r ? R.structure(r.state, v, {}) :
      '<div class="empty">标准算法已结束</div>';
    this.el.userStage.innerHTML = u ? R.structure(u.state, v, {}) :
      (this.traceUser.ok ? '<div class="empty">我的算法已结束（步数少于标准算法）</div>' :
        '<div class="empty" style="color:#ff4d6d">' + U.esc(this.traceUser.error || '运行失败') + '</div>');

    // 变量面板
    var skip = {}; if (v.mainKey) skip[v.mainKey] = 1;
    this.el.vars.innerHTML = (r || u) ?
      R.vars(r ? r.state : u.state, { skip: skip, diffKeys: diffKeys }) +
      (u && r && div !== i ? '' : '')
      : '<div class="mono-sm">运行后显示</div>';
    if (u && r) {
      var both = '<div class="mono-sm mt" style="border-top:1px solid #1b2a41;padding-top:8px">我的算法变量</div>' +
        R.vars(u.state, { skip: skip, diffKeys: diffKeys });
      this.el.vars.innerHTML += both;
    }

    // 说明文字
    this.el.refNote.className = 'viz-note' + (div === i ? ' bad' : '');
    this.el.refNote.innerHTML = r ? '<b style="color:#3ddc84">[' + (i + 1) + ']</b> ' + U.esc(r.note) : '—';
    this.el.userNote.className = 'viz-note' + (div === i ? ' bad' : '');
    this.el.userNote.innerHTML = u ?
      '<b style="color:#b3a1ff">[' + (i + 1) + ']</b> ' + U.esc(u.note) +
      (div === i ? '<div style="color:#ff4d6d;margin-top:4px">⚠ 这里开始与标准算法不一致：' +
        U.esc(diffKeys.join(', ') || '步骤数不同') + '</div>' : '')
      : (this.traceUser.ok ? '<span style="color:#5b7290">我的算法已结束</span>'
        : '<span style="color:#ff4d6d">' + U.esc(this.traceUser.error || '运行失败') + '</span>');

    this.el.refStep.textContent = r ? 'step ' + (i + 1) + '/' + this.traceRef.steps.length : '已结束';
    this.el.userStep.textContent = u ? 'step ' + (i + 1) + '/' + this.traceUser.steps.length : '已结束';
    this.el.slider.value = i;
    this.el.progress.textContent = (i + 1) + ' / ' + this.total();

    // 代码执行行高亮
    this.editor.setExecLine(u ? u.line : null);
    this.highlightLine(this.el.refCodePanel, r ? r.line : null);

    U.$$('.step-item', this.el.steps).forEach(function (it) {
      it.classList.toggle('on', parseInt(it.getAttribute('data-i'), 10) === i);
    });
    var on = U.$('.step-item.on', this.el.steps);
    if (on && this.playing) {
      var box = this.el.steps;
      if (on.offsetTop < box.scrollTop || on.offsetTop > box.scrollTop + box.clientHeight - 24) {
        box.scrollTop = on.offsetTop - box.clientHeight / 2;
      }
    }
  };

  VizCtrl.prototype.highlightLine = function (panel, ln) {
    if (!panel) return;
    Array.prototype.forEach.call(panel.querySelectorAll('.cl'), function (el) {
      el.classList.remove('exec');
    });
    if (!ln) return;
    var el = panel.querySelector('.cl[data-ln="' + ln + '"]');
    if (el) el.classList.add('exec');
  };

  /** 随机对拍：造小数据找第一个让我的算法出错的用例（整个循环在单个 Worker 内完成） */
  VizCtrl.prototype.fuzz = function () {
    var self = this;
    var gen = this.algo.gen;
    if (!gen) { U.toast('这道题没有提供随机数据生成器', 'err'); return; }
    this.pause();
    this.el.verdict.className = 'cmp-verdict';
    this.el.verdict.innerHTML = '<span class="spinner"></span> 正在随机造数据对拍（最多 60 组）…';

    global.CSP.runner.fuzz(this.refSrc, this.userSrc, gen, 60).then(function (r) {
      if (!r || r.error) {
        self.el.verdict.className = 'cmp-verdict error';
        self.el.verdict.innerHTML = '<b>对拍未能完成</b><div class="mono-sm mt">' +
          U.esc((r && r.error) || '未知错误') + '</div>' +
          '<div class="mono-sm mt">可以先点「▶ 运行并对比」，用当前输入逐步检查。</div>';
        return;
      }
      if (!r.found) {
        self.el.verdict.className = 'cmp-verdict perfect';
        self.el.verdict.innerHTML = '<b>🎉 ' + r.tried + ' 组随机数据全部通过</b>' +
          '<div class="mono-sm mt">没有找到反例。可以改一改数据范围再点一次，换一批数据继续找。</div>';
        return;
      }
      self.fuzzFound(r.found);
    }).catch(function (e) {
      self.el.verdict.className = 'cmp-verdict error';
      self.el.verdict.innerHTML = '<b>对拍出错</b><div class="mono-sm mt">' + U.esc(String(e && e.message || e)) + '</div>';
    });
  };

  VizCtrl.prototype.fuzzFound = function (f) {
    var self = this;
    this.el.verdict.className = 'cmp-verdict wrong';
    this.el.verdict.innerHTML = '<b>🎯 找到反例！（第 ' + ((f.round || 0) + 1) + ' 组随机数据）</b>' +
      '<div class="mono-sm mt">输入：<code style="color:#22e6ff">' + U.esc(String(f.input).replace(/\n/g, ' ⏎ ')) + '</code></div>' +
      '<div class="mono-sm">标准答案 <b style="color:#3ddc84">' + U.esc(f.refAnswer == null ? '(未声明)' : f.refAnswer) +
      '</b> · 我的答案 <b style="color:#ff4d6d">' +
      U.esc(f.cause === 'runtime' ? ('运行失败：' + (f.error || '')) : (f.userAnswer == null ? '(未声明)' : f.userAnswer)) +
      '</b></div>' +
      '<button class="btn btn-sm btn-primary mt" id="vz-loadcase">载入这组数据并逐步对比</button>';
    U.$('#vz-loadcase', this.el.verdict).onclick = function () {
      self.el.input.value = f.input;
      self.runCompare();
    };
  };

  /* ==========================================================================
   * 题目页主体
   * ========================================================================*/
  global.CSP.views.problem = function (pid) {
    var p = findProblem(pid);
    if (!p) return '<div class="empty">题目不存在</div>';
    var store = global.CSP.store;
    store.S().lastProblem = pid;

    var st = store.status(pid), best = store.bestScore(pid);
    var h = '';

    h += '<div class="crumb"><a href="#/problems">题库</a> / <b>' + p.id.toUpperCase() + '</b> ' + U.esc(p.title) + '</div>';

    h += '<div class="flex flex-wrap mb">' +
      '<h1 style="font-family:var(--mono);font-size:21px">' + p.id.toUpperCase() + ' · ' + U.esc(p.title) + '</h1>' +
      U.diffBadge(p.diff, p.tier) +
      (p.knowledge || []).map(function (k) {
        var kk = store.kstate(k);
        return '<a class="tag know" href="#/knowledge/' + k + '"' +
          (kk.state === 'flagged' ? ' style="border-color:#ff4d6d;color:#ffc4d1"' : '') + '>' +
          U.esc(knowName(k)) + '</a>';
      }).join('') +
      '<span class="ml-auto">' + U.statusBadge(st) +
      (best >= 0 ? ' <span class="mono-sm">最高 ' + best + ' 分</span>' : '') + '</span>' +
      '</div>';

    h += '<div class="problem-layout">';
    /* -------- 左：题面 / 题解 / 知识卡 / 记录 -------- */
    h += '<div><div class="panel">';
    h += '<div class="tabs" id="pv-tabs">' +
      '<div class="tab on" data-t="stmt">题面</div>' +
      '<div class="tab" data-t="sol">题解</div>' +
      '<div class="tab" data-t="know">知识点卡片<span class="cnt">' + (p.knowledge || []).length + '</span></div>' +
      '<div class="tab" data-t="subs">提交记录<span class="cnt">' + store.problemSubs(pid).length + '</span></div>' +
      '</div>';
    h += '<div class="panel-bd" id="pv-body"></div></div></div>';

    /* -------- 右：编辑器 + 评测 -------- */
    h += '<div><div class="panel">';
    h += '<div class="panel-hd"><span class="dot"></span>提交评测 · C++17' +
      '<span class="more">编译服务：Wandbox（gcc 13.2.0）</span></div>';
    h += '<div class="ed-toolbar">' +
      '<span class="mono-sm">' + U.esc(p.limits ? (p.limits.time + ' / ' + p.limits.memory) : '1s / 128MB') + '</span>' +
      '<span class="right">' +
      '<button class="btn btn-xs" id="pv-reset">重置代码</button>' +
      '<button class="btn btn-xs" id="pv-copyfile" title="把测试数据展开便于本地对拍">测试数据</button>' +
      '<button class="btn btn-xs btn-primary" id="pv-submit">🚀 提交评测</button>' +
      '</span></div>';
    h += '<div id="pv-editor"></div>';
    h += '<div class="panel-bd" id="pv-result"><div class="mono-sm">写完代码点「提交评测」，会逐测试点实时返回结果。</div></div>';
    h += '</div></div>';
    h += '</div>';

    /* -------- 同一页面的算法可视化 -------- */
    h += '<div class="panel mt" id="pv-viz-panel">';
    h += '<div class="panel-hd"><span class="dot" style="background:#7c5cff;box-shadow:0 0 10px #7c5cff"></span>' +
      '算法可视化 · 我的算法 ⟷ 标准算法 逐步对比' +
      '<span class="more">每一步都可回放；分歧点会自动标红</span></div>';
    h += '<div class="panel-bd" id="pv-viz"></div></div>';

    return h;
  };

  /* --------------------------------------------------------- 页面挂载 --- */
  global.CSP.views.mountProblem = function (pid) {
    var p = findProblem(pid);
    if (!p) return;
    var store = global.CSP.store;

    /* ---- 标签页 ---- */
    var body = U.$('#pv-body');
    var subsCount = store.problemSubs(pid).length;

    function tplStmt() {
      var h = '';
      h += '<div class="meta-row"><span>时间限制：' + U.esc(p.limits ? p.limits.time : '1s') + '</span>' +
        '<span>内存限制：' + U.esc(p.limits ? p.limits.memory : '128MB') + '</span>' +
        '<span>满分：100</span><span>测试点：' + p.tests.length + '</span></div>';
      h += '<div class="prob-section"><h3>题目描述</h3><p>' + U.rich(p.statement) + '</p></div>';
      h += '<div class="prob-section"><h3>输入格式</h3><p>' + U.rich(p.inputFormat) + '</p></div>';
      h += '<div class="prob-section"><h3>输出格式</h3><p>' + U.rich(p.outputFormat) + '</p></div>';
      h += '<div class="prob-section"><h3>样例</h3>';
      (p.samples || []).forEach(function (s, i) {
        h += '<div class="sample-box"><div class="lbl">输入 #' + (i + 1) + '</div><pre>' + U.esc(s.input) + '</pre></div>';
        h += '<div class="sample-box"><div class="lbl">输出 #' + (i + 1) + '</div><pre>' + U.esc(s.output) + '</pre></div>';
        if (s.explain) h += '<div class="mono-sm" style="margin-bottom:12px">说明：' + U.rich(s.explain) + '</div>';
      });
      h += '</div>';
      if (p.tips && p.tips.length) {
        h += '<div class="prob-section"><h3>易错提示</h3><ul class="kcard-detail" style="padding-left:20px">' +
          p.tips.map(function (t) { return '<li>' + U.rich(t) + '</li>'; }).join('') + '</ul></div>';
      }
      return h;
    }

    function tplSol() {
      var a = p.algo || {};
      var h = '';
      h += '<div class="prob-section"><h3>算法思路</h3><p>' + U.rich(a.title || '') + '</p>';
      if (a.pseudo && a.pseudo.length) {
        h += '<div class="code-block mt">' + a.pseudo.map(function (l, i) {
          return '<span style="display:inline-block;width:26px;color:#3d5570">' + (i + 1) + '</span>' + U.esc(l);
        }).join('\n') + '</div>';
      }
      h += '</div>';
      h += '<div class="prob-section"><h3>参考程序（C++17）</h3>' +
        '<div style="max-height:420px;overflow:auto;background:#05090f;border:1px solid #1b2a41;border-radius:6px">' +
        U.codeLines((p.std && p.std.code) || '', 'cpp') + '</div></div>';
      h += '<div class="prob-section"><h3>对照学习</h3><p>页面下方的「算法可视化」可以把标准算法和你自己写的版本逐步对照播放，' +
        '自动定位第一处分歧。建议先自己写，再点「运行并对比」。</p></div>';
      return h;
    }

    function tplKnow() {
      var h = '';
      if (!p.knowledge || !p.knowledge.length) return '<div class="empty">该题未关联知识点</div>';
      h += '<div class="flaged-box mb"><div class="t">// 做错这道题会自动把这几个知识点标为「待巩固」</div>' +
        p.knowledge.map(function (k) {
          var st = store.kstate(k).state;
          return '<span class="chip' + (st === 'flagged' ? ' on' : '') + '">' + U.esc(knowName(k)) + '</span>';
        }).join(' ') + '</div>';
      p.knowledge.forEach(function (k) {
        h += '<div class="panel mb" style="background:transparent"><div class="panel-bd">' + knowledgeCardHtml(k) + '</div></div>';
      });
      return h;
    }

    function tplSubs() {
      var list = store.problemSubs(pid);
      if (!list.length) return '<div class="empty">还没有提交记录</div>';
      return list.map(function (s) {
        return '<div class="sub-row"><span class="sid">' + U.esc(s.sid) + '</span>' +
          '<span class="' + U.scoreClass(s.verdict) + '">' + U.esc(s.verdict) + '</span>' +
          '<span>' + (s.score || 0) + ' 分</span>' +
          '<span class="mono-sm">' + (s.passed || 0) + '/' + (s.total || 0) + ' 通过</span>' +
          '<span class="ml-auto mono-sm">' + U.fmtTime(s.ts) + '</span></div>';
      }).join('');
    }

    var TPLS = { stmt: tplStmt, sol: tplSol, know: tplKnow, subs: tplSubs };
    function show(t) {
      body.innerHTML = TPLS[t]();
      U.$$('#pv-tabs .tab').forEach(function (x) { x.classList.toggle('on', x.getAttribute('data-t') === t); });
      if (t === 'know') {
        (p.knowledge || []).forEach(function (k) { bindKmark(body, k); });
      }
    }
    U.$$('#pv-tabs .tab').forEach(function (x) {
      x.onclick = function () { show(x.getAttribute('data-t')); };
    });
    show('stmt');

    /* ---- 代码编辑器 ---- */
    var editor = new global.CSP.Editor('#pv-editor', {
      lang: 'cpp',
      value: loadUserCode(pid, DEFAULT_CPP),
      onChange: function (v) { saveUserCode(pid, v); }
    });

    U.$('#pv-reset').onclick = function () {
      U.confirm('重置代码', '确定清空当前代码？此操作不可撤销。', function () {
        editor.setValue(DEFAULT_CPP); saveUserCode(pid, DEFAULT_CPP);
      });
    };
    U.$('#pv-copyfile').onclick = function () {
      var txt = p.tests.map(function (t, i) {
        return '--- 测试点 ' + (i + 1) + ' (输入) ---\n' + t.input + '\n--- 期望输出 ---\n' + t.output;
      }).join('\n\n');
      U.modal('测试数据（用于本地对拍）',
        '<div class="mono-sm mb">把下面内容存成文件，配合你自己的 check 脚本本地对拍。</div>' +
        '<textarea style="width:100%;height:340px;background:#070d18;color:#b9cde6;border:1px solid #1b2a41;border-radius:8px;font-family:var(--mono);font-size:12px;padding:10px" readonly>' +
        U.esc(txt) + '</textarea>');
    };

    /* ---- 提交评测 ---- */
    var resultBox = U.$('#pv-result');
    U.$('#pv-submit').onclick = function () {
      var code = editor.getValue();
      if (!code.trim()) { U.toast('代码是空的', 'err'); return; }
      var btn = U.$('#pv-submit');
      btn.disabled = true;
      btn.textContent = '评测中…';
      editor.setErrorLine(null);
      resultBox.innerHTML = '<div class="verdict"><span class="spinner"></span> 正在提交到评测服务…</div>';

      var rows = p.tests.map(function (t, i) {
        return '<div class="res-row" id="pv-res-' + i + '"><span class="tid">#' + (i + 1) + '</span>' +
          '<span class="spinner"></span><span class="mono-sm">等待中</span>' +
          '<span class="score">' + (t.score || 0) + ' 分</span></div>';
      }).join('');
      resultBox.innerHTML = '<div id="pv-rows">' + rows + '</div><div id="pv-final" class="mt"></div>';

      var t0 = Date.now();
      global.CSP.judge.submit(code, p.tests, function (c, done, total) {
        var el = U.$('#pv-res-' + c.i);
        if (!el) return;
        var extra = c.verdict === 'WA' ?
          '<span class="mono-sm">期望 <code style="color:#3ddc84">' + U.esc(String(c.expected).slice(0, 18)) +
          '</code> 实际 <code style="color:#ff4d6d">' + U.esc(String(c.output).slice(0, 18)) + '</code></span>' :
          (c.verdict === 'RE' ? '<span class="mono-sm" style="color:#ff5ec4">' + U.esc(String(c.error || '').slice(0, 70)) + '</span>' : '');
        el.innerHTML = '<span class="tid">#' + (c.i + 1) + '</span>' +
          '<span class="' + U.scoreClass(c.verdict) + '">' + c.verdict + '</span>' +
          '<span class="mono-sm">' + (c.ms || 0) + 'ms</span>' + extra +
          '<span class="score">' + (c.score || 0) + ' 分</span>';
        U.$('#pv-final').innerHTML = '<span class="mono-sm">已完成 ' + done + '/' + total + ' 个测试点…</span>';
      }).then(function (r) {
        btn.disabled = false;
        btn.textContent = '🚀 提交评测';
        finishJudge(r);
      });
    };

    function caseRows(cases) {
      return '<div style="max-height:260px;overflow:auto">' + cases.map(function (c) {
        var extra = '';
        if (c.verdict === 'WA') {
          var d = global.CSP.trace.tokenDiff(c.expected, c.output);
          extra = '<span class="mono-sm">' + (d.bad.length ?
            '首个不同的数：期望 <code style="color:#3ddc84">' + U.esc(String(d.bad[0].expected)) +
            '</code>，实际 <code style="color:#ff4d6d">' + U.esc(String(d.bad[0].actual)) + '</code>' : '') + '</span>';
        } else if (c.verdict === 'RE' || c.verdict === 'TLE') {
          extra = '<span class="mono-sm" style="color:#ff5ec4">' + U.esc(String(c.error || '').slice(0, 80)) + '</span>';
        } else if (c.verdict === 'ERR') {
          extra = '<span class="mono-sm" style="color:#8ba1bd">评测服务繁忙，未完成</span>';
        }
        return '<div class="res-row"><span class="tid">#' + (c.i + 1) + '</span>' +
          '<span class="' + U.scoreClass(c.verdict) + '">' + c.verdict + '</span>' +
          '<span class="mono-sm">' + (c.ms || 0) + 'ms</span>' + extra +
          '<span class="score">' + (c.score || 0) + ' 分</span></div>';
      }).join('') + '</div>';
    }

    function finishJudge(r) {
      var ok = r.verdict === 'AC';
      var rowsHtml = caseRows(r.cases);

      /* 公共评测服务容量不足 → 不当成用户做错：不记错题、不标红知识点 */
      if ((r.serviceErrors || 0) > 0) {
        var box0 = U.$('#pv-final');
        U.$('#pv-rows').innerHTML = '';
        if (box0) box0.innerHTML =
          '<div class="verdict bad"><span class="big v-ERR">服务繁忙</span>' +
          '<span>' + r.serviceErrors + ' / ' + r.total + ' 个测试点因公共编译服务（Wandbox）容量不足未能完成</span></div>' +
          '<div class="mono-sm mb">已完成 ' + r.passed + ' / ' + r.total + ' 个测试点，本次得分 ' + r.score +
          ' 分。<b>本次结果不计入错题本，也不会把知识点标为待巩固</b>——这不是你的代码的问题。</div>' +
          '<button class="btn btn-primary btn-sm" id="pv-retry">重新评测</button>' + rowsHtml;
        btn.disabled = false;
        btn.textContent = '🚀 提交评测';
        var rb = U.$('#pv-retry');
        if (rb) rb.onclick = function () { U.$('#pv-submit').click(); };
        U.toast('评测服务繁忙，本次不计入成绩，请稍后重试', 'err', 3600);
        return;
      }

      var h = '<div class="verdict ' + (ok ? 'ok' : 'bad') + '">' +
        '<span class="big ' + U.scoreClass(r.verdict) + '">' + r.verdict + '</span>' +
        '<span>' + r.score + ' / 100 分 · 通过 ' + r.passed + '/' + r.total + ' 个测试点 · 用时 ' + (r.ms / 1000).toFixed(1) + 's</span></div>';

      if (r.compilerError) {
        editor.markCompileError(r.compilerError);
        h += '<div class="prob-section"><h3>编译错误</h3><div class="code-block" style="color:#ffc4d1">' +
          U.esc(r.compilerError) + '</div></div>';
      }
      h += rowsHtml;

      if (!ok) {
        h += '<div class="flaged-box mt"><div class="t">// 已自动标记待巩固的知识点</div>' +
          (p.knowledge || []).map(function (k) {
            return '<span class="chip on" style="border-color:#ff4d6d;color:#ffc4d1">' + U.esc(knowName(k)) + '</span>';
          }).join(' ') +
          '<div class="mono-sm mt">去 <a href="#/knowledge">知识图谱</a> 看这些点的卡片，' +
          '或用下方「算法可视化」定位第一处错误步骤。</div></div>';
      } else {
        h += '<div class="verdict ok mt">🎉 满分通过！知识点已转为「已掌握」，可以去挑战下一题。</div>';
      }

      var box = U.$('#pv-final');
      if (box) box.innerHTML = h;
      U.$('#pv-rows').innerHTML = '';

      global.CSP.store.addSubmission({
        pid: p.id, verdict: r.verdict, score: r.score, passed: r.passed,
        total: r.total, code: editor.getValue(), ms: r.ms
      });
      U.toast(ok ? 'AC！满分通过' : (r.verdict + ' · ' + r.score + ' 分，已记录错题'), ok ? 'ok' : 'err');
      global.CSP.app.refresh(false);
    }

    /* ---- 算法可视化 ---- */
    global.CSP._viz = new VizCtrl('#pv-viz', p, store);
  };

  global.CSP.views.knowledgeCardHtml = knowledgeCardHtml;
  global.CSP.views.bindKmark = bindKmark;
  global.CSP.views.knowName = knowName;
  global.CSP.views.findProblem = findProblem;
})(typeof window !== 'undefined' ? window : globalThis);
