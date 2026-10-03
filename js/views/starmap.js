/* ============================================================================
 * 知识星图 (views/starmap.js)
 * ----------------------------------------------------------------------------
 * 把 90 个考纲考点画成「代码宇宙」里的一整张星图：
 *   - 每个考点 = 一颗星，按板块分布在一个个同心圆环上（法阵式布局）
 *   - 星与星之间有真实含义的连线：
 *       · 紫色实线 = 学习先后 / 依赖关系（CSP.prereq 人工梳理）
 *       · 青色虚线 = 题目共现（同一道题涉及的考点会自动连起来）
 *   - 星体大小 = 配套题目数量；星体颜色 = 掌握状态（红=待巩固 绿=已掌握 黄=复习中）
 *   - 悬停高亮该星及其邻居，点击在右侧打开完整知识卡
 *   - 支持缩放 / 拖动 / 按板块与状态筛选 / 搜索定位
 * ==========================================================================*/
(function (global) {
  'use strict';
  var U = global.CSP.ui;

  var CAT_COLOR = {
    '基础算法': '#22e6ff',
    '数据结构': '#7c5cff',
    '图论': '#3ddc84',
    '动态规划': '#ffb020',
    '字符串': '#ff5ec4',
    '数学': '#5ea8ff',
    '搜索': '#ff8a5c',
    '综合技巧': '#9f8cff'
  };

  /* 世界坐标：8 个环摊开到半径 234..780，相邻环间距 78（配合小径向抖动也不会挤到一起），
     星图占满整行宽度，因此屏幕上每颗星之间有充足空间 */
  var W = 1700, H = 1700, CX = 850, CY = 850;
  var PAD = 90;                       // 默认视野四周的留白
  var POS_KEY = 'csp-s-v5-starmap-pos';
  var MOTION_KEY = 'csp-s-v5-starmap-motion';

  /* 动态效果开关：默认开；系统偏好「减少动态」时默认关 */
  function motionOn() {
    try {
      var v = localStorage.getItem(MOTION_KEY);
      if (v === '1') return true;
      if (v === '0') return false;
    } catch (e) { }
    try {
      return !(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch (e) { return true; }
  }
  function setMotion(on) {
    try { localStorage.setItem(MOTION_KEY, on ? '1' : '0'); } catch (e) { }
  }

  /* 确定性伪随机（同一考点每次抖动方向一致，刷新不会跳来跳去） */
  function hash01(str, salt) {
    var h = 2166136261 ^ (salt || 0), i;
    for (i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return ((h >>> 0) % 100000) / 100000;
  }

  function loadPos() {
    try { return JSON.parse(localStorage.getItem(POS_KEY) || '{}') || {}; }
    catch (e) { return {}; }
  }
  function savePos(o) { try { localStorage.setItem(POS_KEY, JSON.stringify(o)); } catch (e) { } }
  function clearPos() { try { localStorage.removeItem(POS_KEY); } catch (e) { } }
  /** 把用户手动拖动过的坐标覆盖到自动布局之上 */
  function applySavedPos(g) {
    var p = loadPos(), k = 0;
    g.nodes.forEach(function (n) {
      if (p[n.id]) { n.x = p[n.id][0]; n.y = p[n.id][1]; n.custom = true; k++; }
    });
    return k;
  }

  /* ------------------------------------------------------------ 图数据 --- */
  function buildGraph() {
    var syl = (global.CSP.syllabus || []);
    var probs = (global.CSP.problems || []);
    var cards = (global.CSP.cards || {});

    /* 每个考点的题目数 */
    var cnt = {};
    probs.forEach(function (p) {
      (p.knowledge || []).forEach(function (k) { cnt[k] = (cnt[k] || 0) + 1; });
    });

    var nodes = syl.map(function (k, i) {
      return {
        id: k.id, name: k.name, cat: k.cat, level: k.level,
        count: cnt[k.id] || 0,
        hasCard: !!cards[k.id],
        color: CAT_COLOR[k.cat] || '#22e6ff',
        idx: i
      };
    });
    var byId = {};
    nodes.forEach(function (n) { byId[n.id] = n; });

    /* 连线：题目共现 + 人工依赖 */
    var edges = [], seen = {};
    function add(a, b, kind) {
      if (!a || !b || a === b) return;
      if (!byId[a] || !byId[b]) return;                 // 过滤失效 id
      var key = a < b ? a + '|' + b : b + '|' + a;
      if (seen[key] !== undefined) {
        if (kind === 'prereq') edges[seen[key]].kind = 'prereq';   // 依赖关系优先
        else edges[seen[key]].w++;
        return;
      }
      seen[key] = edges.length;
      edges.push({ a: a, b: b, kind: kind, w: 1 });
    }
    probs.forEach(function (p) {
      var ks = p.knowledge || [];
      for (var i = 0; i < ks.length; i++) {
        for (var j = i + 1; j < ks.length; j++) add(ks[i], ks[j], 'co');
      }
    });
    (global.CSP.prereq || []).forEach(function (e) { add(e[0], e[1], 'prereq'); });

    /* 邻居表 */
    var nbr = {};
    nodes.forEach(function (n) { nbr[n.id] = {}; });
    edges.forEach(function (e) { nbr[e.a][e.b] = 1; nbr[e.b][e.a] = 1; });

    return { nodes: nodes, byId: byId, edges: edges, nbr: nbr, cnt: cnt };
  }

  /* ------------------------------------------------------------ 布局 --- */
  function layout(g) {
    var cats = {}, order = [];
    g.nodes.forEach(function (n) {
      if (!cats[n.cat]) { cats[n.cat] = []; order.push(n.cat); }
      cats[n.cat].push(n);
    });
    /* 节点多的板块放外圈（周长更长，不拥挤） */
    var sorted = order.slice().sort(function (a, b) { return cats[a].length - cats[b].length; });

    /* 环间距 78：即使叠加径向抖动，相邻环之间仍能保证 ≥60 的净间距；
       离散感主要由「角向抖动 + 大半径」提供，而不是把点在环之间乱塞 */
    var R0 = 234, STEP = 78;
    var rings = [];
    sorted.forEach(function (cat, ri) {
      var list = cats[cat];
      var r = R0 + ri * STEP;
      var base = -Math.PI / 2 + ri * (Math.PI / 9);        // 每环错开，避免所有环的起点对齐
      var step = 2 * Math.PI / list.length;
      list.forEach(function (n, i) {
        var a = base + i * step;
        /* 径向只给 ±8（不破坏环间距），角向给 ±34% 步长 → 星点疏密自然，不像刻度 */
        var jr = (hash01(n.id, 7) - 0.5) * 16;
        var ja = (hash01(n.id, 13) - 0.5) * step * 0.68;
        var rr = r + jr;
        var aa = a + ja;
        n.r = rr;
        n.ang = aa;
        n.x = CX + rr * Math.cos(aa);
        n.y = CY + rr * Math.sin(aa);
        n.ring = ri;
        n.catColor = CAT_COLOR[cat] || '#22e6ff';
        if (i === 0) rings.push({ cat: cat, r: r, count: list.length });
      });
    });
    return rings;
  }

  /* ------------------------------------------------------------ 渲染 --- */
  function edgePath(e, byId) {
    var A = byId[e.a], B = byId[e.b];
    if (!A || !B) return '';
    /* 和弦：用二次贝塞尔向圆心方向收一点，形成法阵的弧弦感 */
    var mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
    var cx = mx + (CX - mx) * 0.22, cy = my + (CY - my) * 0.22;
    return 'M' + A.x.toFixed(1) + ',' + A.y.toFixed(1) +
      'Q' + cx.toFixed(1) + ',' + cy.toFixed(1) + ' ' + B.x.toFixed(1) + ',' + B.y.toFixed(1);
  }

  function starRadius(n) {
    /* 世界坐标变大了，星体半径同步放大，保证屏幕上的观感不变 */
    return 6 + Math.min(9, n.count * 2) + (n.level >= 3 ? 1.4 : 0);
  }

  function stateOf(id) {
    return global.CSP.store.kstate(id).state;
  }

  function nodeClass(n) {
    var st = stateOf(n.id);
    return 'star st-' + st + (n.count ? ' has-prob' : '');
  }

  function stateColor(n) {
    var st = stateOf(n.id);
    if (st === 'flagged') return '#ff4d6d';
    if (st === 'mastered') return '#3ddc84';
    if (st === 'learning') return '#ffb020';
    return n.catColor;
  }

  function svgFor(g, rings) {
    var s = [];
    s.push('<svg id="sm-svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet"' +
      ' xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">');

    /* ---------- defs：星云 / 发光 / 流星拖尾 ---------- */
    s.push('<defs>');
    s.push('<radialGradient id="sm-nebula" cx="50%" cy="50%" r="50%">' +
      '<stop offset="0%" stop-color="#12294a" stop-opacity="0.55"/>' +
      '<stop offset="45%" stop-color="#0b1730" stop-opacity="0.35"/>' +
      '<stop offset="100%" stop-color="#050a14" stop-opacity="0"/>' +
      '</radialGradient>');
    [['sm-neb-a', '#1b4b8f'], ['sm-neb-b', '#7c5cff'], ['sm-neb-c', '#00b4d8'], ['sm-neb-d', '#ff5ec4']]
      .forEach(function (nb) {
        s.push('<radialGradient id="' + nb[0] + '" cx="50%" cy="50%" r="50%">' +
          '<stop offset="0%" stop-color="' + nb[1] + '" stop-opacity="0.5"/>' +
          '<stop offset="55%" stop-color="' + nb[1] + '" stop-opacity="0.14"/>' +
          '<stop offset="100%" stop-color="' + nb[1] + '" stop-opacity="0"/></radialGradient>');
      });
    s.push('<radialGradient id="sm-core-g" cx="50%" cy="50%" r="50%">' +
      '<stop offset="0%" stop-color="#22e6ff" stop-opacity="0.55"/>' +
      '<stop offset="60%" stop-color="#7c5cff" stop-opacity="0.18"/>' +
      '<stop offset="100%" stop-color="#22e6ff" stop-opacity="0"/></radialGradient>');
    s.push('<linearGradient id="sm-meteor-g" x1="0%" y1="0%" x2="100%" y2="0%">' +
      '<stop offset="0%" stop-color="#22e6ff" stop-opacity="0"/>' +
      '<stop offset="70%" stop-color="#9fe8ff" stop-opacity="0.85"/>' +
      '<stop offset="100%" stop-color="#ffffff" stop-opacity="1"/></linearGradient>');
    s.push('<filter id="sm-glow" x="-120%" y="-120%" width="340%" height="340%">' +
      '<feGaussianBlur stdDeviation="3.4" result="b"/>' +
      '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>');
    s.push('<filter id="sm-glow-soft" x="-200%" y="-200%" width="500%" height="500%">' +
      '<feGaussianBlur stdDeviation="9" result="b2"/>' +
      '<feMerge><feMergeNode in="b2"/><feMergeNode in="SourceGraphic"/></feMerge></filter>');
    s.push('</defs>');

    /* ---------- 背景：缓慢流动的星云（呼吸 + 漂移） ---------- */
    s.push('<circle cx="' + CX + '" cy="' + CY + '" r="880" fill="url(#sm-nebula)"/>');
    s.push('<g class="sm-nebulae">' +
      '<circle class="sm-neb" cx="' + (CX - 330) + '" cy="' + (CY - 250) + '" r="430" fill="url(#sm-neb-a)" style="--dur:44s;--dx:60px;--dy:-40px"/>' +
      '<circle class="sm-neb" cx="' + (CX + 380) + '" cy="' + (CY + 180) + '" r="470" fill="url(#sm-neb-b)" style="--dur:56s;--dx:-70px;--dy:50px;animation-delay:-12s"/>' +
      '<circle class="sm-neb" cx="' + (CX + 120) + '" cy="' + (CY - 420) + '" r="360" fill="url(#sm-neb-c)" style="--dur:38s;--dx:-50px;--dy:70px;animation-delay:-20s"/>' +
      '</g>');

    /* ---------- 星尘：静态底噪 + 会眨眼的高光星 ---------- */
    var i, seed = 20261031;
    function rnd() { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }
    var dust = [], twinkle = [];
    for (i = 0; i < 620; i++) {
      var dx = rnd() * W, dy = rnd() * H, dr = rnd() * 1.7 + 0.4;
      dust.push('<circle cx="' + dx.toFixed(0) + '" cy="' + dy.toFixed(0) + '" r="' + dr.toFixed(2) +
        '" fill="#9fd0ff" opacity="' + (0.1 + rnd() * 0.25).toFixed(2) + '"/>');
    }
    s.push('<g class="sm-dustfield">' + dust.join('') + '</g>');
    for (i = 0; i < 86; i++) {
      var tx = rnd() * W, ty = rnd() * H, tr = rnd() * 2.6 + 1.4;
      twinkle.push('<circle class="sm-dust" cx="' + tx.toFixed(0) + '" cy="' + ty.toFixed(0) +
        '" r="' + tr.toFixed(2) + '" style="--dur:' + (3 + rnd() * 5).toFixed(1) + 's;animation-delay:-' +
        (rnd() * 6).toFixed(1) + 's"/>');
    }
    s.push('<g>' + twinkle.join('') + '</g>');

    /* ---------- 流星 ---------- */
    s.push('<g class="sm-meteors">');
    for (i = 0; i < 5; i++) {
      var mx = rnd() * W * 0.7, my = rnd() * H * 0.45, len = 150 + rnd() * 190;
      s.push('<g class="sm-meteor" style="--dur:' + (9 + rnd() * 9).toFixed(1) + 's;animation-delay:-' +
        (rnd() * 16).toFixed(1) + 's;--travel:' + (900 + rnd() * 700).toFixed(0) + 'px">' +
        '<line x1="' + mx.toFixed(0) + '" y1="' + my.toFixed(0) + '" x2="' + (mx + len).toFixed(0) +
        '" y2="' + (my + len * 0.42).toFixed(0) + '" stroke="url(#sm-meteor-g)" stroke-width="2.2" stroke-linecap="round"/>' +
        '</g>');
    }
    s.push('</g>');

    /* ---------- 法阵刻线环（反向旋转 + 呼吸） ---------- */
    s.push('<g class="sm-runes">');
    [234, 468, 624, 780].forEach(function (r, k) {
      s.push('<circle class="sm-rune" cx="' + CX + '" cy="' + CY + '" r="' + r + '"' +
        ' style="animation-duration:' + (90 + k * 34) + 's;animation-direction:' + (k % 2 ? 'reverse' : 'normal') + '"/>');
    });
    s.push('<circle class="sm-rune sm-rune-pulse" cx="' + CX + '" cy="' + CY + '" r="624"/>');
    var ticks = [];
    for (i = 0; i < 120; i++) {
      var a2 = i * Math.PI * 2 / 120;
      var r1 = 780, r2 = i % 10 === 0 ? 756 : 768;
      ticks.push('<line class="sm-tick" x1="' + (CX + r1 * Math.cos(a2)).toFixed(1) + '" y1="' + (CY + r1 * Math.sin(a2)).toFixed(1) +
        '" x2="' + (CX + r2 * Math.cos(a2)).toFixed(1) + '" y2="' + (CY + r2 * Math.sin(a2)).toFixed(1) + '"/>');
    }
    s.push(ticks.join(''));
    s.push('</g>');

    /* ---------- 中心核心：脉动光晕 + 扩散波纹 ---------- */
    s.push('<g class="sm-core">' +
      '<circle cx="' + CX + '" cy="' + CY + '" r="150" fill="url(#sm-core-g)" class="sm-core-atmo"/>' +
      '<circle cx="' + CX + '" cy="' + CY + '" r="96" class="sm-core-glow"/>' +
      '<circle cx="' + CX + '" cy="' + CY + '" r="72" class="sm-core-ring"/>' +
      '<circle cx="' + CX + '" cy="' + CY + '" r="72" class="sm-core-wave" style="animation-delay:0s"/>' +
      '<circle cx="' + CX + '" cy="' + CY + '" r="72" class="sm-core-wave" style="animation-delay:-2.2s"/>' +
      '<circle cx="' + CX + '" cy="' + CY + '" r="72" class="sm-core-wave" style="animation-delay:-4.4s"/>' +
      '<text x="' + CX + '" y="' + (CY - 6) + '" class="sm-core-t">CSP-S</text>' +
      '<text x="' + CX + '" y="' + (CY + 22) + '" class="sm-core-s">2026 ROUND 2</text>' +
      '</g>');

    /* ---------- 连线：虚线流动 + 沿线的能量光点 ---------- */
    s.push('<g class="sm-edges">');
    var pulseEvery = Math.max(3, Math.round(g.edges.length / 38));   // 约 38 条线上跑光点
    g.edges.forEach(function (e, idx) {
      var d = edgePath(e, g.byId);
      var id = 'sme-' + idx;
      s.push('<path id="' + id + '" class="sm-edge ' + e.kind + '" data-a="' + e.a + '" data-b="' + e.b +
        '" d="' + d + '" style="animation-delay:-' + (idx % 12 * 0.23).toFixed(2) + 's"/>');
      if (idx % pulseEvery === 0) {
        var dur = (3.4 + (idx % 7) * 0.5).toFixed(1);
        s.push('<circle class="sm-pulse" r="4" style="--pc:' + (e.kind === 'prereq' ? '#b3a1ff' : '#22e6ff') + '">' +
          '<animateMotion dur="' + dur + 's" repeatCount="indefinite" begin="-' + (idx % 9 * 0.6).toFixed(1) + 's" rotate="auto">' +
          '<mpath href="#' + id + '" xlink:href="#' + id + '"/></animateMotion></circle>');
      }
    });
    s.push('</g>');

    /* ---------- 板块环标注 ---------- */
    rings.forEach(function (r, i) {
      var a = -Math.PI / 2 + i * (Math.PI / 9) - (2 * Math.PI / 48);
      var x = CX + (r.r + 19) * Math.cos(a), y = CY + (r.r + 19) * Math.sin(a);
      s.push('<text class="sm-ring-label" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) +
        '" style="fill:' + (CAT_COLOR[r.cat] || '#22e6ff') + '">' + U.esc(r.cat) + ' · ' + r.count + '</text>');
    });

    /* ---------- 星体：外层负责位置（可拖动），内层负责漂浮呼吸 ---------- */
    s.push('<g class="sm-stars">');
    g.nodes.forEach(function (n) {
      var st = stateOf(n.id);
      var col = stateColor(n);
      var rr = starRadius(n);
      var fd = (9 + hash01(n.id, 3) * 7).toFixed(1);          // 漂浮周期 9~16s
      var fdl = (-hash01(n.id, 5) * 12).toFixed(2);
      var hd = (2.6 + hash01(n.id, 11) * 3.4).toFixed(1);      // 呼吸周期
      var hdl = (-hash01(n.id, 17) * 6).toFixed(2);
      var amp = (5 + hash01(n.id, 19) * 6).toFixed(1);          // 漂浮幅度 5~11
      s.push('<g class="' + nodeClass(n) + '" data-id="' + n.id + '" data-cat="' + U.esc(n.cat) + '"' +
        ' transform="translate(' + n.x.toFixed(1) + ',' + n.y.toFixed(1) + ')" style="--c:' + col + '">' +
        '<g class="star-float" style="--fd:' + fd + 's;--fdl:' + fdl + 's;--amp:' + amp + 'px">' +
        '<circle class="sm-halo" r="' + (rr + 13).toFixed(1) + '" style="--hd:' + hd + 's;--hdl:' + hdl + 's"/>' +
        '<circle class="sm-body" r="' + rr.toFixed(1) + '"/>' +
        (st === 'none' ? '' : '<circle class="sm-state-ring" r="' + (rr + 7).toFixed(1) + '"/>') +
        '<text class="sm-label" y="' + (rr + 24).toFixed(1) + '">' + U.esc(n.name) + '</text>' +
        '</g></g>');
    });
    s.push('</g>');

    s.push('</svg>');
    return s.join('');
  }

  /* ------------------------------------------------------------ 页面 --- */
  var view = { cat: 'all', state: 'all', q: '', mode: 'map' };

  global.CSP.views.starmap = function () {
    var g = buildGraph();
    var rings = layout(g);
    applySavedPos(g);            // 用户拖动过的星按记忆位置摆放
    var store = global.CSP.store;
    var st = store.stats();
    var flagged = store.flaggedKnowledge().length;
    var cats = {};
    g.nodes.forEach(function (n) { cats[n.cat] = (cats[n.cat] || 0) + 1; });

    var h = '';
    h += '<div class="crumb"><b>知识星图</b> · ' + g.nodes.length + ' 颗星（考点） · ' +
      g.edges.length + ' 条连线 · ' + Object.keys(cats).length + ' 个板块</div>';

    /* 工具条 */
    h += '<div class="panel mb"><div class="panel-bd"><div class="sm-toolbar">';
    h += '<span class="mono-sm">视角</span>' +
      '<span class="chip' + (view.mode === 'map' ? ' on' : '') + '" data-sm-mode="map">星图</span>' +
      '<span class="chip' + (view.mode === 'grid' ? ' on' : '') + '" data-sm-mode="grid">卡片列表</span>';
    h += '<span class="mono-sm" style="margin-left:12px">板块</span>' +
      '<span class="chip' + (view.cat === 'all' ? ' on' : '') + '" data-sm-cat="all">全部</span>' +
      Object.keys(cats).map(function (c) {
        return '<span class="chip' + (view.cat === c ? ' on' : '') + '" data-sm-cat="' + U.esc(c) + '"' +
          ' style="--c:' + (CAT_COLOR[c] || '#22e6ff') + '">' + U.esc(c) + '<b style="opacity:.55;font-weight:400"> ' + cats[c] + '</b></span>';
      }).join('');
    h += '<span class="mono-sm" style="margin-left:12px">状态</span>' +
      [['all', '全部'], ['flagged', '待巩固'], ['mastered', '已掌握'], ['none', '未学习']].map(function (s) {
        return '<span class="chip' + (view.state === s[0] ? ' on' : '') + '" data-sm-state="' + s[0] + '">' + s[1] + '</span>';
      }).join('');
    h += '<span class="chip' + (view.q === '__prob' ? ' on' : '') + '" data-sm-prob="1" style="margin-left:12px">仅有题目的星</span>';
    h += '<input id="sm-search" class="sm-search" placeholder="搜索考点，回车定位…" value="' + U.esc(view.q === '__prob' ? '' : view.q) + '">';
    h += '<span class="chip' + (motionOn() ? ' on' : '') + '" id="sm-motion" title="开/关星星漂浮、能量流动、流星等动效">✨ 动态效果</span>';
    h += '<button class="btn btn-xs" id="sm-reset-pos" title="清除手动拖动，恢复自动布局">重置布局</button>';
    h += '<button class="btn btn-xs" id="sm-reset">重置视图</button>';
    h += '</div>';

    /* 图例 */
    h += '<div class="sm-legend">' +
      '<span class="sm-lg"><i class="lg-star" style="--c:#ff4d6d"></i>待巩固</span>' +
      '<span class="sm-lg"><i class="lg-star" style="--c:#3ddc84"></i>已掌握</span>' +
      '<span class="sm-lg"><i class="lg-star" style="--c:#ffb020"></i>复习中</span>' +
      '<span class="sm-lg"><i class="lg-star" style="--c:#5b7290"></i>未学习</span>' +
      '<span class="sm-lg"><i class="lg-line prereq"></i>学习先后 / 依赖</span>' +
      '<span class="sm-lg"><i class="lg-line co"></i>同题共现</span>' +
      '<span class="sm-lg"><i class="lg-star big" style="--c:#22e6ff"></i>星越大 = 配套题目越多</span>' +
      '<span class="sm-lg mono-sm">✥ 星星可自由拖动（位置会自动记住） · 滚轮缩放 · 拖空白处平移</span>' +
      '<span class="sm-lg mono-sm">当前 ' + st.mastery.mastered + '/' + g.nodes.length + ' 已掌握 · ' + flagged + ' 待巩固</span>' +
      '</div>';

    h += '</div></div>';

    if (view.mode === 'grid') {
      var cats2 = {};
      var shown = g.nodes.filter(function (n) {
        if (view.cat !== 'all' && n.cat !== view.cat) return false;
        if (view.state !== 'all' && stateOf(n.id) !== view.state) return false;
        if (view.q === '__prob' && !n.count) return false;
        if (view.q && view.q !== '__prob' && (n.name + n.id + n.cat).toLowerCase().indexOf(view.q.toLowerCase()) < 0) return false;
        return true;
      });
      shown.forEach(function (n) { (cats2[n.cat] = cats2[n.cat] || []).push(n); });
      var anyCat = Object.keys(cats2).length > 0;
      Object.keys(cats2).forEach(function (c) {
        h += '<div class="panel mb"><div class="panel-hd"><span class="dot" style="background:' +
          (CAT_COLOR[c] || '#22e6ff') + ';box-shadow:0 0 10px ' + (CAT_COLOR[c] || '#22e6ff') +
          '"></span>' + U.esc(c) + '<span class="more">' + cats2[c].length + ' 个考点</span></div><div class="panel-bd">' +
          '<div class="kcards">' + cats2[c].map(function (n) { return kcardMiniFromNode(n); }).join('') +
          '</div></div></div>';
      });
      if (!anyCat) h += '<div class="panel"><div class="empty">没有符合条件的考点</div></div>';
      return h;
    }

    /* 星图本体（占满整行）+ 悬浮在右侧的知识卡抽屉 */
    h += '<div class="panel sm-stage-panel"><div class="sm-stage" id="sm-stage">' + svgFor(g, rings) +
      '<div class="sm-tip hidden" id="sm-tip"></div>' +
      '<div class="sm-zoom"><button class="btn btn-xs" data-sm-zoom="in" title="放大">+</button>' +
      '<button class="btn btn-xs" data-sm-zoom="out" title="缩小">−</button>' +
      '<button class="btn btn-xs" id="sm-fit" title="适应窗口">⤢</button></div>' +
      '<div class="panel sm-side" id="sm-side"></div>' +
      '</div></div>';
    return h;
  };

  function kcardMiniFromNode(n) {
    var store = global.CSP.store;
    var st = store.kstate(n.id).state;
    var card = (global.CSP.cards || {})[n.id];
    var cls = st === 'mastered' ? ' mastered' : st === 'flagged' ? ' flagged' : st === 'learning' ? ' learning' : '';
    return '<div class="kcard' + cls + '" style="--c:' + n.color + '" onclick="location.hash=\'#/knowledge/' + n.id + '\'">' +
      '<div class="kc-cat">' + U.esc(n.cat) + ' · Lv' + n.level + '</div>' +
      '<div class="kc-name">' + U.esc(n.name) + '</div>' +
      '<div class="kc-def">' + U.esc(card ? String(card.definition).slice(0, 52) + (card.definition.length > 52 ? '…' : '') : '（暂无卡片）') + '</div>' +
      '<div class="kc-foot">' +
      (st === 'none' ? '<span class="kstate ks-none">未学习</span>' : '') +
      (st === 'learning' ? '<span class="kstate ks-learning">复习中</span>' : '') +
      (st === 'mastered' ? '<span class="kstate ks-mastered">已掌握</span>' : '') +
      (st === 'flagged' ? '<span class="kstate ks-flagged">待巩固</span>' : '') +
      (n.count ? '<span class="kstate" style="color:#22e6ff;background:rgba(34,230,255,.12)">' + n.count + ' 题</span>' : '') +
      '</div></div>';
  }

  /* ------------------------------------------------------------ 挂载 --- */
  global.CSP.views.mountStarmap = function () {
    var store = global.CSP.store;

    /* 工具条交互 */
    U.$$('[data-sm-mode]').forEach(function (c) {
      c.onclick = function () { view.mode = c.getAttribute('data-sm-mode'); global.CSP.app.refresh(); };
    });
    U.$$('[data-sm-cat]').forEach(function (c) {
      c.onclick = function () { view.cat = c.getAttribute('data-sm-cat'); global.CSP.app.refresh(); };
    });
    U.$$('[data-sm-state]').forEach(function (c) {
      c.onclick = function () { view.state = c.getAttribute('data-sm-state'); global.CSP.app.refresh(); };
    });
    var pb = U.$('[data-sm-prob]');
    if (pb) pb.onclick = function () { view.q = view.q === '__prob' ? '' : '__prob'; global.CSP.app.refresh(); };

    var svg = U.$('#sm-svg');
    if (!svg) return;                       // 卡片模式

    var g = buildGraph();
    layout(g);          // 必须重跑布局：节点的 x/y 是「定位到某颗星」所需的坐标
    applySavedPos(g);   // 再叠加用户手动摆放的位置

    /* ---- 筛选：给不匹配的星加 dim ---- */
    function applyFilter() {
      U.$$('.star', svg).forEach(function (el) {
        var id = el.getAttribute('data-id');
        var n = g.byId[id];
        var ok = true;
        if (view.cat !== 'all' && n.cat !== view.cat) ok = false;
        if (view.state !== 'all' && stateOf(id) !== view.state) ok = false;
        if (view.q === '__prob' && !n.count) ok = false;
        if (view.q && view.q !== '__prob') {
          var q = view.q.toLowerCase();
          if ((n.name + n.id + n.cat).toLowerCase().indexOf(q) < 0) ok = false;
        }
        el.classList.toggle('dim', !ok);
      });
      U.$$('.sm-edge', svg).forEach(function (el) {
        var a = g.byId[el.getAttribute('data-a')], b = g.byId[el.getAttribute('data-b')];
        var ok = true;
        if (view.cat !== 'all' && a.cat !== view.cat && b.cat !== view.cat) ok = false;
        if (view.q === '__prob' && (!a.count || !b.count)) ok = false;
        el.classList.toggle('dim', !ok);
      });
    }
    applyFilter();

    /* ---- 悬停：高亮邻居 ---- */
    var tip = U.$('#sm-tip');
    var stage = U.$('#sm-stage');
    function clearHl() {
      U.$$('.star.hl, .star.nb', svg).forEach(function (e) { e.classList.remove('hl', 'nb'); });
      U.$$('.sm-edge.hl', svg).forEach(function (e) { e.classList.remove('hl'); });
      svg.classList.remove('focusing');
      if (tip) tip.classList.add('hidden');
    }
    function hoverId(id) {
      clearHl();
      var n = g.byId[id];
      if (!n) return;
      svg.classList.add('focusing');
      var el = svg.querySelector('.star[data-id="' + id + '"]');
      if (el) el.classList.add('hl');
      Object.keys(g.nbr[id] || {}).forEach(function (k) {
        var e2 = svg.querySelector('.star[data-id="' + k + '"]');
        if (e2) e2.classList.add('nb');
      });
      U.$$('.sm-edge', svg).forEach(function (e) {
        var a = e.getAttribute('data-a'), b = e.getAttribute('data-b');
        if (a === id || b === id) e.classList.add('hl');
      });
      /* 悬浮提示 */
      if (tip) {
        var st = stateOf(id);
        var stTxt = st === 'flagged' ? '待巩固' : st === 'mastered' ? '已掌握' : st === 'learning' ? '复习中' : '未学习';
        var nb = Object.keys(g.nbr[id] || {}).length;
        tip.innerHTML = '<b style="color:' + stateColor(n) + '">' + U.esc(n.name) + '</b>' +
          '<div class="mono-sm">' + U.esc(n.cat) + ' · Lv' + n.level + ' · ' + U.esc(stTxt) + '</div>' +
          '<div class="mono-sm">配套题目 ' + n.count + ' 道 · 连线 ' + nb + ' 条</div>' +
          '<div class="mono-sm" style="color:#5b7290">点击查看知识卡</div>';
        tip.classList.remove('hidden');
      }
    }
    U.$$('.star', svg).forEach(function (el) {
      var id = el.getAttribute('data-id');
      el.addEventListener('mouseenter', function () { hoverId(id); });
      el.addEventListener('mouseleave', function () { clearHl(); });
      el.addEventListener('click', function (ev) {
        ev.stopPropagation();
        if (suppressClick) { suppressClick = false; return; }   // 刚刚是拖动，别当点击
        openCard(id);
      });
    });

    /* ---- 点击：右侧知识卡 ---- */
    function openCard(id) {
      var side = U.$('#sm-side');
      if (!side) return;
      var n = g.byId[id];
      side.innerHTML =
        '<div class="sm-side-hd"><span class="mono-sm">知识卡</span>' +
        '<a class="chip" href="#/knowledge/' + id + '" style="margin-left:6px">独立页 →</a>' +
        '<button class="btn btn-xs sm-side-close" id="sm-side-close">✕</button></div>' +
        '<div class="sm-side-bd">' + global.CSP.views.knowledgeCardHtml(id) + '</div>';
      global.CSP.views.bindKmark(side, id);
      side.classList.add('open');
      var cl = U.$('#sm-side-close', side);
      if (cl) cl.onclick = function (e) { e.stopPropagation(); side.classList.remove('open'); };
      /* 高亮该星并自动聚焦（不用整页刷新） */
      focusOn(n);
    }
    function focusOn(n) {
      if (!n) return;
      /* 视野太远时先拉近，保证被定位的星能真正居中、看清邻居 */
      if (vb.w > 620) { vb.w = 520; vb.h = 520; }
      vb.x = n.x - vb.w / 2;
      vb.y = n.y - vb.h / 2;
      clampVb();
      applyVb();
      hoverId(n.id);
    }

    /* ---- 缩放 / 平移 ---- */
    var vb = { x: -PAD, y: -PAD, w: W + PAD * 2, h: H + PAD * 2 };
    function applyVb() {
      svg.setAttribute('viewBox', [vb.x, vb.y, vb.w, vb.h].map(function (v) {
        return (Math.round(v * 10) / 10);
      }).join(' '));
    }
    function clampVb() {
      var maxW = W + PAD * 2, maxH = H + PAD * 2;
      vb.w = Math.max(170, Math.min(maxW, vb.w));
      vb.h = vb.w * (maxH / maxW);
      vb.x = Math.max(-300, Math.min(W + 300 - vb.w, vb.x));
      vb.y = Math.max(-300, Math.min(H + 300 - vb.h, vb.y));
    }
    applyVb();

    stage.addEventListener('wheel', function (e) {
      e.preventDefault();
      var k = e.deltaY > 0 ? 1.12 : 1 / 1.12;
      var rect = svg.getBoundingClientRect();
      var px = vb.x + (e.clientX - rect.left) / rect.width * vb.w;
      var py = vb.y + (e.clientY - rect.top) / rect.height * vb.h;
      var nw = vb.w * k;
      vb.x = px - (px - vb.x) * (nw / vb.w);
      vb.y = py - (py - vb.y) * (nw / vb.w);
      vb.w = nw;
      clampVb();
      applyVb();
    }, { passive: false });

    /* ---- 拖动单颗星（自由摆放，位置记进 localStorage） ---- */
    var edgeMap = {};                      // 星 id -> 与它相连的连线元素
    U.$$('.sm-edge', svg).forEach(function (el) {
      var a = el.getAttribute('data-a'), b = el.getAttribute('data-b');
      (edgeMap[a] = edgeMap[a] || []).push(el);
      (edgeMap[b] = edgeMap[b] || []).push(el);
    });
    function pathBetween(A, B) {
      var mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
      var cx = mx + (CX - mx) * 0.22, cy = my + (CY - my) * 0.22;
      return 'M' + A.x.toFixed(1) + ',' + A.y.toFixed(1) +
        'Q' + cx.toFixed(1) + ',' + cy.toFixed(1) + ' ' + B.x.toFixed(1) + ',' + B.y.toFixed(1);
    }
    function moveStar(n, el) {
      el.setAttribute('transform', 'translate(' + n.x.toFixed(1) + ',' + n.y.toFixed(1) + ')');
      (edgeMap[n.id] || []).forEach(function (p) {
        var A = g.byId[p.getAttribute('data-a')], B = g.byId[p.getAttribute('data-b')];
        if (A || B) p.setAttribute('d', pathBetween(A || n, B || n));
      });
    }

    var posMap = loadPos();
    var starDrag = null;
    var suppressClick = false;

    U.$$('.star', svg).forEach(function (el) {
      var id = el.getAttribute('data-id');
      el.addEventListener('mousedown', function (ev) {
        ev.stopPropagation();
        ev.preventDefault();
        starDrag = {
          id: id, el: el, node: g.byId[id],
          sx: ev.clientX, sy: ev.clientY,
          ox: g.byId[id].x, oy: g.byId[id].y, moved: false
        };
        el.classList.add('dragging');
      });
    });

    window.addEventListener('mousemove', function (ev) {
      if (!starDrag) return;
      var dx = ev.clientX - starDrag.sx, dy = ev.clientY - starDrag.sy;
      if (!starDrag.moved && Math.abs(dx) + Math.abs(dy) > 4) starDrag.moved = true;
      if (!starDrag.moved) return;
      var rect = svg.getBoundingClientRect();
      starDrag.node.x = starDrag.ox + dx / rect.width * vb.w;
      starDrag.node.y = starDrag.oy + dy / rect.height * vb.h;
      moveStar(starDrag.node, starDrag.el);
    });
    window.addEventListener('mouseup', function () {
      if (!starDrag) return;
      var d = starDrag;
      starDrag = null;
      d.el.classList.remove('dragging');
      if (!d.moved) return;
      suppressClick = true;
      posMap[d.id] = [Math.round(d.node.x), Math.round(d.node.y)];
      savePos(posMap);
      U.toast('已固定「' + d.node.name + '」的位置（点「重置布局」可还原自动排布）', 'info', 2200);
    });

    /* 拖动过的星用 pointer 光标提示 */
    U.$$('.star', svg).forEach(function (el) {
      var id = el.getAttribute('data-id');
      if (posMap[id]) el.classList.add('pinned');
    });

    var drag = null;
    stage.addEventListener('mousedown', function (e) {
      if (e.target.closest('.star')) return;
      drag = { x: e.clientX, y: e.clientY, vx: vb.x, vy: vb.y };
      stage.classList.add('grabbing');
    });
    window.addEventListener('mousemove', function (e) {
      if (!drag) return;
      var rect = svg.getBoundingClientRect();
      vb.x = drag.vx - (e.clientX - drag.x) / rect.width * vb.w;
      vb.y = drag.vy - (e.clientY - drag.y) / rect.height * vb.h;
      clampVb();
      applyVb();
    });
    window.addEventListener('mouseup', function () {
      if (drag) { drag = null; stage.classList.remove('grabbing'); }
    });

    U.$$('[data-sm-zoom]').forEach(function (b) {
      b.onclick = function (e) {
        e.stopPropagation();
        var k = b.getAttribute('data-sm-zoom') === 'in' ? 1 / 1.25 : 1.25;
        vb.x += vb.w * (1 - k) / 2;
        vb.y += vb.h * (1 - k) / 2;
        vb.w *= k;
        clampVb();
        applyVb();
      };
    });
    var rst = U.$('#sm-reset');
    if (rst) rst.onclick = function () {
      vb = { x: -PAD, y: -PAD, w: W + PAD * 2, h: H + PAD * 2 };
      applyVb(); clearHl();
    };
    var rp = U.$('#sm-reset-pos');
    if (rp) rp.onclick = function () {
      clearPos();
      U.toast('已恢复自动排布', 'ok');
      global.CSP.app.refresh();
    };
    /* 动态效果开关：即时生效，不需要整页重绘 */
    if (!motionOn()) stage.classList.add('sm-nomotion');
    var mo = U.$('#sm-motion');
    if (mo) {
      if (motionOn()) stage.classList.add('sm-force-motion');
      mo.onclick = function () {
        var on = !motionOn();
        setMotion(on);
        stage.classList.toggle('sm-nomotion', !on);
        stage.classList.toggle('sm-force-motion', on);
        mo.classList.toggle('on', on);
        U.toast(on ? '动态效果已开启 ✨' : '动态效果已关闭（省电模式）', 'info', 1600);
      };
    }
    var fit = U.$('#sm-fit');
    if (fit) fit.onclick = function () { global.CSP.app.refresh(); };

    /* 滚出视口就把动画停下来，避免在别的页面白白烧 CPU */
    if (global.IntersectionObserver) {
      try {
        var io = new IntersectionObserver(function (ents) {
          ents.forEach(function (en) {
            var away = !en.isIntersecting;
            stage.classList.toggle('sm-paused', away);
            try {
              if (svg.pauseAnimations) { if (away) svg.pauseAnimations(); else svg.unpauseAnimations(); }
            } catch (e) { }
          });
        }, { threshold: 0.01 });
        io.observe(stage);
      } catch (e) { }
    }
    document.addEventListener('visibilitychange', function () {
      try {
        if (!svg.pauseAnimations) return;
        if (document.hidden) svg.pauseAnimations(); else svg.unpauseAnimations();
      } catch (e) { }
    });

    /* ---- 搜索 ---- */
    var se = U.$('#sm-search');
    if (se) {
      se.addEventListener('input', U.debounce(function () {
        view.q = this.value.trim();
        applyFilter();
      }, 260));
      se.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return;
        var q = this.value.trim().toLowerCase();
        if (!q) return;
        var hit = g.nodes.filter(function (n) {
          return (n.name + n.id + n.cat).toLowerCase().indexOf(q) >= 0;
        })[0];
        if (hit) { openCard(hit.id); U.toast('已定位：' + hit.name, 'ok'); }
        else U.toast('没有找到「' + q + '」', 'err');
      });
    }
  };

  global.CSP.views.starmapColors = CAT_COLOR;
})(typeof window !== 'undefined' ? window : globalThis);
