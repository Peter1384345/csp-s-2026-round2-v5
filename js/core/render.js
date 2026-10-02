/* ============================================================================
 * 算法可视化结构渲染器 (render.js)
 *   输入：某一「步」的 state + 题目的 viz 描述
 *   输出：HTML / SVG 字符串
 * 支持：array | bars | matrix | graph | tree | string | stack
 * ==========================================================================*/
(function (global) {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function isArr(v) { return Array.isArray(v); }
  function isMat(v) { return isArr(v) && v.length > 0 && isArr(v[0]); }

  /** 取「指针/高亮」变量指向的下标集合 */
  function idxSet(state, names) {
    var out = {};
    (names || []).forEach(function (k) {
      var v = state[k];
      if (typeof v === 'number' && isFinite(v)) out[v] = (out[v] ? out[v] + ',' : '') + k;
    });
    return out;
  }

  function labelOf(viz, k) {
    return (viz.labels && viz.labels[k]) ? viz.labels[k] : k;
  }

  /* ------------------------------------------------------------------ array */
  function renderArray(state, viz, opts) {
    var a = state[viz.mainKey];
    if (!isArr(a)) return '<div class="empty">state.' + esc(viz.mainKey) + ' 不是数组</div>';
    opts = opts || {};
    var ptr = idxSet(state, viz.pointers);
    var hl = idxSet(state, viz.highlight);
    var diff = opts.diffIdx || {};
    var html = '<div class="arrbar">';
    for (var i = 0; i < a.length; i++) {
      var v = a[i];
      var isPt = ptr[i] !== undefined, isHl = hl[i] !== undefined;
      var cls = 'cell' + (isHl ? ' hl' : '') + (isPt ? ' act' : '');
      if (diff[i]) cls += ' diff';
      var ptrTxt = ptr[i] ? esc(ptr[i].split(',').map(function (k) { return labelOf(viz, k); }).join(' ')) : '';
      html += '<div class="cell-wrap">' +
        '<div class="cell-ptr">' + (isPt ? '▲ ' + ptrTxt : '') + '</div>' +
        '<div class="' + cls + '" data-idx="' + i + '">' + esc(typeof v === 'object' ? JSON.stringify(v) : v) + '</div>' +
        '<div class="cell-idx">' + i + '</div>' +
        '</div>';
    }
    return html + '</div>';
  }

  /* ------------------------------------------------------------------- bars */
  function renderBars(state, viz) {
    var a = state[viz.mainKey];
    if (!isArr(a)) return '<div class="empty">state.' + esc(viz.mainKey) + ' 不是数组</div>';
    var hl = idxSet(state, viz.highlight);
    var ptr = idxSet(state, viz.pointers);
    var max = 1, i;
    for (i = 0; i < a.length; i++) if (typeof a[i] === 'number' && Math.abs(a[i]) > max) max = Math.abs(a[i]);
    var html = '<div class="bars">';
    for (i = 0; i < a.length; i++) {
      var h = Math.max(4, Math.round(Math.abs(a[i] || 0) / max * 100));
      var cls = 'bar-col' + (hl[i] ? ' hl' : '') + (ptr[i] ? ' act' : '');
      html += '<div class="bar-wrap"><div class="bar-val">' + esc(a[i]) + '</div>' +
        '<div class="' + cls + '" style="height:' + h + '%"></div>' +
        '<div class="cell-idx">' + i + '</div></div>';
    }
    return html + '</div>';
  }

  /* ----------------------------------------------------------------- matrix */
  function renderMatrix(state, viz) {
    var m = state[viz.mainKey];
    if (!isMat(m)) return '<div class="empty">state.' + esc(viz.mainKey) + ' 不是二维数组</div>';
    var hr = state[viz.rowKey || 'i'], hc = state[viz.colKey || 'j'];
    var ptr = idxSet(state, viz.pointers);
    var html = '<div class="matrix" style="grid-template-columns:34px repeat(' + m[0].length + ',42px)">';
    html += '<div class="mhead"></div>';
    for (var c = 0; c < m[0].length; c++) html += '<div class="mhead">' + c + '</div>';
    for (var r = 0; r < m.length; r++) {
      html += '<div class="mhead">' + r + '</div>';
      for (c = 0; c < m[r].length; c++) {
        var cls = 'mcell';
        if (typeof hr === 'number' && typeof hc === 'number') {
          if (r === hr && c === hc) cls += ' act';
          else if (r === hr || c === hc) cls += ' hl';
        }
        if (ptr[r] !== undefined) cls += ' done';
        html += '<div class="' + cls + '">' + esc(typeof m[r][c] === 'object' ? JSON.stringify(m[r][c]) : m[r][c]) + '</div>';
      }
    }
    return html + '</div>';
  }

  /* ------------------------------------------------------------------ graph */
  function renderGraph(state, viz) {
    var n = Number(state[viz.mainKey] != null ? state[viz.mainKey] : state.n);
    var edges = state[viz.edgesKey || 'edges'] || [];
    var dist = viz.distKey ? state[viz.distKey] : null;
    var cur = viz.curKey ? state[viz.curKey] : null;
    var inTree = state[viz.treeKey || '_tree'] || (viz.treeKey ? state[viz.treeKey] : null);
    if (!n || !isFinite(n)) return '<div class="empty">缺少节点数 n</div>';
    /* dist 可能是 0 起下标（长度 n）或 1 起下标（长度 n+1，第 0 位是哑元），
       这里按长度自适应，避免节点标注错位一格 */
    var distBase = (isArr(dist) && dist.length === n + 1) ? 1 : 0;
    function distAt(i) { return isArr(dist) ? dist[i - 1 + distBase] : null; }
    var W = 340, H = 260, cx = W / 2, cy = H / 2 + 6, R = Math.min(110, 34 + n * 8);
    var pos = {};
    for (var i = 1; i <= n; i++) {
      var ang = -Math.PI / 2 + (i - 1) * 2 * Math.PI / n;
      pos[i] = [cx + R * Math.cos(ang), cy + R * Math.sin(ang)];
    }
    var vis = {};
    if (isArr(dist)) {
      for (var t = 1; t <= n; t++) { var dv = distAt(t); if (dv !== -1 && dv != null) vis[t] = 1; }
    }
    if (Array.isArray(inTree)) inTree.forEach(function (e) { vis[e[0]] = 1; vis[e[1]] = 1; });

    var s = '<svg class="gsvg" viewBox="0 0 ' + W + ' ' + H + '">';
    var treeSet = {};
    if (Array.isArray(inTree)) inTree.forEach(function (e) { treeSet[e[0] + '-' + e[1]] = treeSet[e[1] + '-' + e[0]] = 1; });
    edges.forEach(function (e) {
      var u = e[0], v = e[1], w = e[2];
      if (pos[u] == null || pos[v] == null) return;
      var cls = 'gedge' + (treeSet[u + '-' + v] ? ' tree' : (cur === u || cur === v ? ' act' : ''));
      s += '<line class="' + cls + '" x1="' + pos[u][0].toFixed(1) + '" y1="' + pos[u][1].toFixed(1) +
        '" x2="' + pos[v][0].toFixed(1) + '" y2="' + pos[v][1].toFixed(1) + '"/>';
      if (w != null) {
        s += '<text class="gw" x="' + ((pos[u][0] + pos[v][0]) / 2 + 6).toFixed(1) + '" y="' +
          ((pos[u][1] + pos[v][1]) / 2 - 4).toFixed(1) + '">' + esc(w) + '</text>';
      }
    });
    for (i = 1; i <= n; i++) {
      var cls2 = 'gnode' + (cur === i ? ' act' : (vis[i] ? ' vis' : ''));
      s += '<g class="' + cls2 + '" transform="translate(' + pos[i][0].toFixed(1) + ',' + pos[i][1].toFixed(1) + ')">' +
        '<circle r="15"/><text y="1">' + i + '</text></g>';
      if (isArr(dist)) {
        var dv2 = distAt(i);
        if (dv2 != null) {
          s += '<text class="gw" x="' + pos[i][0].toFixed(1) + '" y="' + (pos[i][1] + 27).toFixed(1) +
            '" text-anchor="middle">' + esc(dv2 === -1 ? '∞' : dv2) + '</text>';
        }
      }
    }
    return s + '</svg>';
  }

  /* ------------------------------------------------------------------- tree */
  function renderTree(state, viz) {
    var ch = state[viz.childrenKey || 'ch'] || state[viz.mainKey];
    if (!ch || typeof ch !== 'object') return '<div class="empty">缺少树结构</div>';
    var root = viz.root != null ? viz.root : (state.root != null ? state.root : 1);
    var levels = [], q = [[root, 0]], seen = {};
    while (q.length) {
      var it = q.shift(), nd = it[0], d = it[1];
      if (seen[nd]) continue;
      seen[nd] = 1;
      (levels[d] = levels[d] || []).push(nd);
      (ch[nd] || []).forEach(function (c) { q.push([c, d + 1]); });
    }
    var cur = viz.curKey ? state[viz.curKey] : null;
    var valKey = viz.valKey;
    var W = 360, rowH = 58, H = levels.length * rowH + 20;
    var pos = {};
    levels.forEach(function (lvl, d) {
      lvl.forEach(function (nd, k) {
        pos[nd] = [W * (k + 1) / (lvl.length + 1), 26 + d * rowH];
      });
    });
    var s = '<svg class="gsvg" viewBox="0 0 ' + W + ' ' + H + '">';
    Object.keys(ch).forEach(function (p) {
      (ch[p] || []).forEach(function (c) {
        if (!pos[p] || !pos[c]) return;
        s += '<line class="gedge tree" x1="' + pos[p][0].toFixed(1) + '" y1="' + (pos[p][1] + 15).toFixed(1) +
          '" x2="' + pos[c][0].toFixed(1) + '" y2="' + (pos[c][1] - 15).toFixed(1) + '"/>';
      });
    });
    Object.keys(pos).forEach(function (nd) {
      var p = pos[nd];
      var cls = 'gnode' + (String(cur) === String(nd) ? ' act' : ' vis');
      s += '<g class="' + cls + '" transform="translate(' + p[0].toFixed(1) + ',' + p[1].toFixed(1) + ')">' +
        '<circle r="15"/><text y="1">' + esc(nd) + '</text></g>';
      if (valKey && state[valKey] && state[valKey][nd] != null) {
        s += '<text class="gw" x="' + p[0].toFixed(1) + '" y="' + (p[1] + 27) + '" text-anchor="middle">' +
          esc(state[valKey][nd]) + '</text>';
      }
    });
    return s + '</svg>';
  }

  /* ----------------------------------------------------------------- string */
  function renderString(state, viz) {
    var a = state[viz.mainKey];
    if (typeof a === 'string') a = a.split('');
    if (!isArr(a)) return '<div class="empty">state.' + esc(viz.mainKey) + ' 不是字符串</div>';
    var ptr = idxSet(state, viz.pointers);
    var hl = idxSet(state, viz.highlight);
    var range = state[viz.matchKey || '_match'];
    var html = '<div class="str-cells">';
    for (var i = 0; i < a.length; i++) {
      var cls = 'scell';
      if (hl[i]) cls += ' hl';
      if (ptr[i]) cls += ' act';
      if (isArr(range) && i >= range[0] && i <= range[1]) cls += ' match';
      var t = ptr[i] ? labelOf(viz, ptr[i].split(',')[0]) : '';
      html += '<div class="cell-wrap"><div class="cell-ptr">' + esc(t) + '</div>' +
        '<div class="' + cls + '">' + esc(a[i] === ' ' ? '␣' : a[i]) + '</div>' +
        '<div class="cell-idx">' + i + '</div></div>';
    }
    return html + '</div>';
  }

  /* ------------------------------------------------------------------ stack */
  function renderStack(state, viz) {
    var a = state[viz.mainKey];
    if (!isArr(a)) return '<div class="empty">state.' + esc(viz.mainKey) + ' 不是数组</div>';
    var html = '<div class="stack-cells">';
    if (!a.length) html += '<div class="stcell">(空)</div>';
    for (var i = 0; i < a.length; i++) {
      html += '<div class="stcell' + (i === a.length - 1 ? ' top' : '') + '">' +
        esc(typeof a[i] === 'object' ? JSON.stringify(a[i]) : a[i]) + '</div>';
    }
    return html + '</div><div class="mono-sm mt">栈底 ↑ / 栈顶 ' + (a.length - 1) + '</div>';
  }

  /* -------------------------------------------------------------- dispatch */
  function structure(state, viz, opts) {
    if (!state) return '<div class="empty">（无状态）</div>';
    viz = viz || {};
    var t = viz.type || 'array';
    switch (t) {
      case 'bars': return renderBars(state, viz);
      case 'matrix': return renderMatrix(state, viz);
      case 'graph': return renderGraph(state, viz);
      case 'tree': return renderTree(state, viz);
      case 'string': return renderString(state, viz);
      case 'stack': return renderStack(state, viz);
      default: return renderArray(state, viz, opts);
    }
  }

  /** 变量面板：把 state 里的标量/短数组列出来 */
  function vars(state, opts) {
    if (!state) return '';
    opts = opts || {};
    var diff = {};
    (opts.diffKeys || []).forEach(function (k) { diff[k] = 1; });
    var skip = { note: 1 };
    Object.keys(opts.skip || {}).forEach(function (k) { skip[k] = 1; });
    var html = '';
    Object.keys(state).forEach(function (k) {
      if (skip[k]) return;
      var v = state[k];
      if (isMat(v)) return;
      if (isArr(v) && v.length > 12) return;
      var txt = (v !== null && typeof v === 'object') ? JSON.stringify(v) : String(v);
      if (txt.length > 42) txt = txt.slice(0, 40) + '…';
      html += '<span class="vitem' + (diff[k] ? ' diff' : '') + '"><b>' + esc(k) + '</b> = ' + esc(txt) + '</span>';
    });
    return html ? '<div class="vars">' + html + '</div>' : '';
  }

  /** 极简 JS/C++ 语法着色 */
  var KW = 'var let const function return if else for while do break continue new typeof instanceof this null undefined true false try catch throw switch case default class extends of in delete void yield async await'.split(' ');
  var TYPES = 'int long double float char bool string vector pair map set queue stack priority_queue bitset auto size_t unsigned signed short void'.split(' ');
  var PRE = '#include using namespace std main cin cout endl printf scanf sort unique lower_bound upper_bound max min swap push_back size empty begin end'.split(' ');

  function highlight(code, lang) {
    var s = esc(code);
    // 先抽出字符串、注释，避免被后续规则破坏
    var store = [];
    function keep(html) { store.push(html); return '\u0001' + (store.length - 1) + '\u0001'; }
    s = s.replace(/(\/\/[^\n]*)/g, function (m) { return keep('<span class="tok-cmt">' + m + '</span>'); });
    s = s.replace(/(\/\*[\s\S]*?\*\/)/g, function (m) { return keep('<span class="tok-cmt">' + m + '</span>'); });
    s = s.replace(/(&quot;.*?&quot;|&#39;.*?&#39;)/g, function (m) { return keep('<span class="tok-str">' + m + '</span>'); });
    s = s.replace(/\b(0x[0-9a-fA-F]+|\d+\.?\d*)\b/g, '<span class="tok-num">$1</span>');
    s = s.replace(/\b([A-Za-z_]\w*)(\s*\()/g, function (m, a, b) {
      if (KW.indexOf(a) >= 0) return '<span class="tok-kw">' + a + '</span>' + b;
      if (TYPES.indexOf(a) >= 0) return '<span class="tok-type">' + a + '</span>' + b;
      return '<span class="tok-fn">' + a + '</span>' + b;
    });
    s = s.replace(new RegExp('\\b(' + KW.join('|') + ')\\b', 'g'), '<span class="tok-kw">$1</span>');
    s = s.replace(new RegExp('\\b(' + TYPES.join('|') + ')\\b', 'g'), '<span class="tok-type">$1</span>');
    s = s.replace(new RegExp('\\b(' + PRE.join('|') + ')\\b', 'g'), '<span class="tok-pre">$1</span>');
    s = s.replace(/\u0001(\d+)\u0001/g, function (m, i) { return store[+i]; });
    return s;
  }

  global.CSP = global.CSP || {};
  global.CSP.render = {
    structure: structure,
    vars: vars,
    highlight: highlight,
    esc: esc,
    idxSet: idxSet,
    isArr: isArr,
    isMat: isMat
  };
})(typeof window !== 'undefined' ? window : globalThis);
