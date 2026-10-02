/* ============================================================================
 * 代码编辑器组件 (editor.js)
 *   等宽 + 行号 + 语法着色 + 当前执行行高亮 + 语法错误行标记
 *   实现：透明 textarea 覆盖在着色 <pre> 之上，自动增高。
 * ==========================================================================*/
(function (global) {
  'use strict';

  var uid = 0;

  function Editor(host, opts) {
    opts = opts || {};
    this.host = typeof host === 'string' ? document.querySelector(host) : host;
    this.lang = opts.lang || 'cpp';
    this.onChange = opts.onChange || function () { };
    this.readonly = !!opts.readonly;
    this.id = 'ed' + (++uid);
    this.render(opts.value || '');
  }

  Editor.prototype.render = function (value) {
    var self = this;
    this.host.innerHTML =
      '<div class="editor">' +
      '<div class="ed-gutter"><div class="ed-gutter-in" id="' + this.id + '-g"></div></div>' +
      '<div class="ed-scroll">' +
      '<div class="ed-content">' +
      '<div class="ed-curline" id="' + this.id + '-cur"></div>' +
      '<pre class="ed-hl" id="' + this.id + '-hl"></pre>' +
      '<textarea class="ed-input" id="' + this.id + '-in" spellcheck="false" wrap="off"' +
      (this.readonly ? ' readonly' : '') + '></textarea>' +
      '</div></div></div>';

    this.gutter = document.getElementById(this.id + '-g');
    this.hl = document.getElementById(this.id + '-hl');
    this.ta = document.getElementById(this.id + '-in');
    this.cur = document.getElementById(this.id + '-cur');
    this.scroll = this.host.querySelector('.ed-scroll');

    this.ta.value = value;
    this.ta.addEventListener('input', function () {
      self.refresh();
      self.onChange(self.getValue());
    });
    this.ta.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') {
        e.preventDefault();
        var s = self.ta.selectionStart, e2 = self.ta.selectionEnd;
        self.ta.value = self.ta.value.slice(0, s) + '    ' + self.ta.value.slice(e2);
        self.ta.selectionStart = self.ta.selectionEnd = s + 4;
        self.refresh();
        self.onChange(self.getValue());
      }
    });
    this.ta.addEventListener('click', function () { self.syncCur(); });
    this.ta.addEventListener('keyup', function () { self.syncCur(); });
    this.scroll.addEventListener('scroll', function () {
      self.gutter.style.transform = 'translateY(' + (-self.scroll.scrollTop) + 'px)';
    });
    this.refresh();
  };

  Editor.prototype.getValue = function () { return this.ta.value; };
  Editor.prototype.setValue = function (v) { this.ta.value = v; this.refresh(); };

  Editor.prototype.refresh = function () {
    var code = this.ta.value;
    var lines = code.split('\n');
    var html = global.CSP.render.highlight(code, this.lang);
    // 着色结果按行拆分，保证与 textarea 的换行一致
    var painted = html.split('\n');
    this.hl.innerHTML = painted.map(function (l) { return l === '' ? '&nbsp;' : l; }).join('\n') + '\n';

    var g = '';
    for (var i = 1; i <= lines.length; i++) g += '<div class="gl' + (this.isErr === i ? ' err' : '') + '">' + i + '</div>';
    this.gutter.innerHTML = g;

    // 自动增高
    this.ta.style.height = 'auto';
    var h = Math.max(this.opts_minH || 300, this.ta.scrollHeight);
    this.ta.style.height = h + 'px';
    this.hl.style.minHeight = h + 'px';

    this.lineHeight = parseFloat(getComputedStyle(this.ta).lineHeight) || 20.8;
    this.syncCur();
  };

  Editor.prototype.syncCur = function () {
    if (!this.cur) return;
    var upto = this.ta.value.slice(0, this.ta.selectionStart);
    this.curLine = upto.split('\n').length;
    if (this.forceLine) this.curLine = this.forceLine;
    this.cur.style.top = ((this.curLine - 1) * this.lineHeight + 12) + 'px';
    this.cur.style.height = this.lineHeight + 'px';
    this.cur.style.display = 'block';
  };

  /** 高亮「正在执行的代码行」（算法可视化播放时使用） */
  Editor.prototype.setExecLine = function (ln) {
    this.forceLine = ln || null;
    if (!ln) { if (this.cur) this.cur.classList.remove('exec'); this.syncCur(); return; }
    this.forceLine = null;
    this.curLine = ln;
    this.cur.classList.add('exec');
    this.cur.style.top = ((ln - 1) * this.lineHeight + 12) + 'px';
    this.cur.style.height = this.lineHeight + 'px';
    this.cur.style.display = 'block';
    // 滚动到可视区域
    var y = (ln - 1) * this.lineHeight + 12;
    if (y < this.scroll.scrollTop + 20 || y > this.scroll.scrollTop + this.scroll.clientHeight - 30) {
      this.scroll.scrollTop = Math.max(0, y - this.scroll.clientHeight / 2);
    }
  };

  Editor.prototype.setErrorLine = function (ln) {
    this.isErr = ln || null;
    var code = this.ta.value;
    var lines = code.split('\n');
    var g = '';
    for (var i = 1; i <= lines.length; i++) g += '<div class="gl' + (this.isErr === i ? ' err' : '') + '">' + i + '</div>';
    this.gutter.innerHTML = g;
  };

  /** 从编译器报错信息里猜出首个错误行号 */
  Editor.prototype.markCompileError = function (msg) {
    var m = String(msg || '').match(/csp-user\.cpp:(\d+)/) || String(msg || '').match(/program\.cpp:(\d+)/) ||
      String(msg || '').match(/:(\d+):\d+:/);
    if (m) this.setErrorLine(parseInt(m[1], 10));
  };

  global.CSP = global.CSP || {};
  global.CSP.Editor = Editor;
})(typeof window !== 'undefined' ? window : globalThis);
