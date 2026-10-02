/* ============================================================================
 * 通用 UI 工具 (ui.js)
 * ==========================================================================*/
(function (global) {
  'use strict';

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** 文本转 HTML：保留换行、支持 **加粗** 与 `代码` */
  function rich(s) {
    return esc(s)
      .replace(/\*\*([^*]+)\*\*/g, '<b style="color:#dff3ff">$1</b>')
      .replace(/`([^`]+)`/g, '<code style="background:#0a1220;padding:1px 5px;border-radius:4px;color:#22e6ff">$1</code>');
  }

  var toastBox = null;
  function toast(msg, kind, ms) {
    if (!toastBox) {
      toastBox = document.createElement('div');
      toastBox.id = 'toast';
      document.body.appendChild(toastBox);
    }
    var d = document.createElement('div');
    d.className = 'toast ' + (kind || '');
    d.textContent = msg;
    toastBox.appendChild(d);
    setTimeout(function () {
      d.style.transition = 'opacity .3s, transform .3s';
      d.style.opacity = '0';
      d.style.transform = 'translateX(20px)';
      setTimeout(function () { d.remove(); }, 320);
    }, ms || 2600);
  }

  function modal(title, bodyHtml, actions) {
    var wrap = document.createElement('div');
    wrap.className = 'modal';
    wrap.innerHTML =
      '<div class="modal-box">' +
      '<div class="modal-hd"><span style="color:#22e6ff">▍</span>' + esc(title) +
      '<span class="modal-close">✕</span></div>' +
      '<div class="modal-body">' + bodyHtml + '</div>' +
      '<div class="modal-actions"></div>' +
      '</div>';
    var acts = $('.modal-actions', wrap);
    (actions || [{ label: '关闭', kind: 'btn-ghost' }]).forEach(function (a) {
      var b = document.createElement('button');
      b.className = 'btn ' + (a.kind || 'btn-ghost');
      b.textContent = a.label;
      b.onclick = function () { if (!a.onClick || a.onClick(wrap) !== false) close(); };
      acts.appendChild(b);
    });
    function close() { wrap.remove(); }
    $('.modal-close', wrap).onclick = close;
    wrap.addEventListener('click', function (e) { if (e.target === wrap) close(); });
    document.body.appendChild(wrap);
    return { el: wrap, close: close };
  }

  function confirmBox(title, msg, onOk) {
    modal(title, '<div style="font-size:13.5px;color:#8ba1bd;line-height:1.8">' + rich(msg) + '</div>', [
      { label: '取消', kind: 'btn-ghost' },
      { label: '确定', kind: 'btn-primary', onClick: function () { onOk(); } }
    ]);
  }

  function diffBadge(d, tier) {
    d = Math.max(1, Math.min(6, Number(d) || 1));
    return '<span class="diff diff-' + d + '">' + esc(tier || ('Lv' + d)) + '</span>';
  }

  var STATUS_MAP = {
    done: ['st-done', '已通过'],
    part: ['st-part', '部分分'],
    wa: ['st-wa', '未通过']
  };
  function statusBadge(st) {
    if (!st) return '<span class="st st-none">未提交</span>';
    var m = STATUS_MAP[st] || STATUS_MAP.wa;
    return '<span class="st ' + m[0] + '">' + m[1] + '</span>';
  }

  function scoreClass(v) {
    return ({ AC: 'v-AC', WA: 'v-WA', CE: 'v-CE', RE: 'v-RE', TLE: 'v-TLE' })[v] || 'v-ERR';
  }

  function fmtTime(ts) {
    var d = new Date(ts);
    function p(n) { return n < 10 ? '0' + n : n; }
    return (d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  function fmtClock(msRemain) {
    var s = Math.max(0, Math.floor(msRemain / 1000));
    var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), ss = s % 60;
    function p(n) { return n < 10 ? '0' + n : n; }
    return h + ':' + p(m) + ':' + p(ss);
  }

  function debounce(fn, ms) {
    var t;
    return function () {
      var a = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, a); }, ms);
    };
  }

  /** 代码块：带行号，每行一个 div（便于高亮当前执行行） */
  function codeLines(code, lang) {
    var lines = String(code || '').split('\n');
    var hl = global.CSP.render.highlight;
    return '<div class="code-lines">' + lines.map(function (l, i) {
      return '<div class="cl" data-ln="' + (i + 1) + '"><span class="cl-no">' + (i + 1) +
        '</span><span class="cl-tx">' + (hl(l, lang) || '&nbsp;') + '</span></div>';
    }).join('') + '</div>';
  }

  global.CSP = global.CSP || {};
  global.CSP.ui = {
    $: $, $$: $$, esc: esc, rich: rich, toast: toast, modal: modal, confirm: confirmBox,
    diffBadge: diffBadge, statusBadge: statusBadge, scoreClass: scoreClass,
    fmtTime: fmtTime, fmtClock: fmtClock, debounce: debounce, codeLines: codeLines
  };
})(typeof window !== 'undefined' ? window : globalThis);
