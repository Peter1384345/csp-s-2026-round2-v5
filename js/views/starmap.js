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

  var W = 1000, H = 1000, CX = 500, CY = 500;

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

    var R0 = 128, STEP = 40;
    var rings = [];
    sorted.forEach(function (cat, ri) {
      var list = cats[cat];
      var r = R0 + ri * STEP;
      var base = -Math.PI / 2 + ri * (Math.PI / 11);       // 每环错开一点，避免全部对齐
      var step = 2 * Math.PI / list.length;
      list.forEach(function (n, i) {
        var a = base + i * step;
        n.r = r;
        n.ang = a;
        n.x = CX + r * Math.cos(a);
        n.y = CY + r * Math.sin(a);
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
    return 3.4 + Math.min(5.4, n.count * 1.15) + (n.level >= 3 ? 0.8 : 0);
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
    s.push('<svg id="sm-svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet">');

    /* --- 背景：星尘 + 星云 --- */
    s.push('<defs>');
    s.push('<radialGradient id="sm-nebula" cx="50%" cy="50%" r="50%">' +
      '<stop offset="0%" stop-color="#12294a" stop-opacity="0.55"/>' +
      '<stop offset="45%" stop-color="#0b1730" stop-opacity="0.35"/>' +
      '<stop offset="100%" stop-color="#050a14" stop-opacity="0"/>' +
      '</radialGradient>');
    s.push('<filter id="sm-glow" x="-120%" y="-120%" width="340%" height="340%">' +
      '<feGaussianBlur stdDeviation="3.4" result="b"/>' +
      '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>');
    s.push('<filter id="sm-glow-soft" x="-160%" y="-160%" width="420%" height="420%">' +
      '<feGaussianBlur stdDeviation="7" result="b2"/>' +
      '<feMerge><feMergeNode in="b2"/><feMergeNode in="SourceGraphic"/></feMerge></filter>');
    s.push('</defs>');

    s.push('<circle cx="' + CX + '" cy="' + CY + '" r="470" fill="url(#sm-nebula)"/>');

    /* 星尘（固定伪随机，保证每次一样） */
    var i, seed = 20261031;
    function rnd() { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }
    var dust = [];
    for (i = 0; i < 220; i++) {
      var dx = rnd() * W, dy = rnd() * H, dr = rnd() * 1.1 + 0.25;
      dust.push('<circle class="sm-dust" cx="' + dx.toFixed(0) + '" cy="' + dy.toFixed(0) +
        '" r="' + dr.toFixed(2) + '" style="animation-delay:' + (rnd() * 6).toFixed(1) + 's"/>');
    }
    s.push('<g>' + dust.join('') + '</g>');

    /* --- 法阵刻线环 --- */
    s.push('<g class="sm-runes">');
    [96, 236, 336, 424].forEach(function (r, k) {
      s.push('<circle class="sm-rune" cx="' + CX + '" cy="' + CY + '" r="' + r + '"' +
        ' style="animation-duration:' + (90 + k * 34) + 's;animation-direction:' + (k % 2 ? 'reverse' : 'normal') + '"/>');
    });
    /* 外圈刻度 */
    var ticks = [];
    for (i = 0; i < 72; i++) {
      var a2 = i * Math.PI * 2 / 72;
      var r1 = 424, r2 = i % 6 === 0 ? 414 : 419;
      ticks.push('<line class="sm-tick" x1="' + (CX + r1 * Math.cos(a2)).toFixed(1) + '" y1="' + (CY + r1 * Math.sin(a2)).toFixed(1) +
        '" x2="' + (CX + r2 * Math.cos(a2)).toFixed(1) + '" y2="' + (CY + r2 * Math.sin(a2)).toFixed(1) + '"/>');
    }
    s.push(ticks.join(''));
    s.push('</g>');

    /* --- 中心核心 --- */
    s.push('<g class="sm-core">' +
      '<circle cx="' + CX + '" cy="' + CY + '" r="52" class="sm-core-glow"/>' +
      '<circle cx="' + CX + '" cy="' + CY + '" r="40" class="sm-core-ring"/>' +
      '<text x="' + CX + '" y="' + (CY - 4) + '" class="sm-core-t">CSP-S</text>' +
      '<text x="' + CX + '" y="' + (CY + 13) + '" class="sm-core-s">2026 ROUND 2</text>' +
      '</g>');

    /* --- 连线 --- */
    s.push('<g class="sm-edges">');
    g.edges.forEach(function (e) {
      s.push('<path class="sm-edge ' + e.kind + '" data-a="' + e.a + '" data-b="' + e.b +
        '" d="' + edgePath(e, g.byId) + '"/>');
    });
    s.push('</g>');

    /* --- 板块环标注 --- */
    rings.forEach(function (r, i) {
      var a = -Math.PI / 2 + i * (Math.PI / 11) - (2 * Math.PI / 64);
      var x = CX + (r.r + 17) * Math.cos(a), y = CY + (r.r + 17) * Math.sin(a);
      s.push('<text class="sm-ring-label" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) +
        '" style="fill:' + (CAT_COLOR[r.cat] || '#22e6ff') + '">' + U.esc(r.cat) + ' · ' + r.count + '</text>');
    });

    /* --- 星体 --- */
    s.push('<g class="sm-stars">');
    g.nodes.forEach(function (n) {
      var st = stateOf(n.id);
      var col = stateColor(n);
      var rr = starRadius(n);
      s.push('<g class="' + nodeClass(n) + '" data-id="' + n.id + '" data-cat="' + U.esc(n.cat) + '"' +
        ' transform="translate(' + n.x.toFixed(1) + ',' + n.y.toFixed(1) + ')" style="--c:' + col + '">' +
        '<circle class="sm-halo" r="' + (rr + 7).toFixed(1) + '"/>' +
        '<circle class="sm-body" r="' + rr.toFixed(1) + '"/>' +
        (st === 'none' ? '' : '<circle class="sm-state-ring" r="' + (rr + 4).toFixed(1) + '"/>') +
        '<text class="sm-label" y="' + (rr + 12).toFixed(1) + '">' + U.esc(n.name) + '</text>' +
        '</g>');
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

    /* 星图本体 + 右侧详情 */
    h += '<div class="sm-layout">';
    h += '<div class="panel sm-stage-panel"><div class="sm-stage" id="sm-stage">' + svgFor(g, rings) +
      '<div class="sm-tip hidden" id="sm-tip"></div>' +
      '<div class="sm-zoom"><button class="btn btn-xs" data-sm-zoom="in">+</button>' +
      '<button class="btn btn-xs" data-sm-zoom="out">−</button></div>' +
      '</div></div>';
    h += '<div class="panel sm-side" id="sm-side"><div class="panel-bd">' +
      '<div class="sm-side-empty"><div style="font-size:26px">✧</div>' +
      '<div class="mono-sm mt">把鼠标移到任意一颗星上</div>' +
      '<div class="mono-sm">查看它与其他考点的连线</div>' +
      '<div class="mono-sm">点击星星展开完整知识卡</div>' +
      '<div class="sm-side-hint">拖动平移 · 滚轮缩放</div>' +
      '</div></div></div>';
    h += '</div>';
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
      el.addEventListener('click', function (ev) { ev.stopPropagation(); openCard(id); });
    });

    /* ---- 点击：右侧知识卡 ---- */
    function openCard(id) {
      var side = U.$('#sm-side');
      if (!side) return;
      side.innerHTML = '<div class="panel-bd">' +
        '<div class="sm-side-hd"><span class="mono-sm">知识卡</span>' +
        '<a class="chip ml-auto" href="#/knowledge/' + id + '">独立页面打开 →</a></div>' +
        global.CSP.views.knowledgeCardHtml(id) + '</div>';
      global.CSP.views.bindKmark(side, id);
      side.classList.add('open');
      var n = g.byId[id];
      /* 高亮该星并自动聚焦 */
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
    var vb = { x: -30, y: -30, w: W + 60, h: H + 60 };
    function applyVb() {
      svg.setAttribute('viewBox', [vb.x, vb.y, vb.w, vb.h].map(function (v) {
        return (Math.round(v * 10) / 10);
      }).join(' '));
    }
    function clampVb() {
      var maxW = W + 60, maxH = H + 60;
      vb.w = Math.max(150, Math.min(maxW, vb.w));
      vb.h = vb.w * (maxH / maxW);
      vb.x = Math.max(-160, Math.min(W + 160 - vb.w, vb.x));
      vb.y = Math.max(-160, Math.min(H + 160 - vb.h, vb.y));
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
      vb = { x: -30, y: -30, w: W + 60, h: H + 60 };
      applyVb(); clearHl();
    };

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
