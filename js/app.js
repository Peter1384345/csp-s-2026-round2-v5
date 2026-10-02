/* ============================================================================
 * 应用入口：路由 + 首页 / 题库 / 知识图谱 / 记录 / 模拟赛 (app.js)
 * ==========================================================================*/
(function (global) {
  'use strict';
  var U = global.CSP.ui;

  var app = global.CSP.app = {};

  /* ============================ 路由 ================================== */
  function parseHash() {
    var h = (location.hash || '#/dashboard').replace(/^#\/?/, '');
    var parts = h.split('/').filter(function (x) { return x !== ''; });
    return { view: parts[0] || 'dashboard', arg: parts[1] || null };
  }

  function render() {
    var r = parseHash();
    var box = U.$('#app');
    var v = r.view;
    if (v !== 'problem' && global.CSP._viz) { try { global.CSP._viz.pause(); } catch (e) { } global.CSP._viz = null; }

    U.$$('#nav a').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-view') === v ||
        (v === 'problem' && a.getAttribute('data-view') === 'problems'));
    });

    if (v === 'problem') {
      box.innerHTML = global.CSP.views.problem(r.arg);
      global.CSP.views.mountProblem(r.arg);
    } else if (v === 'problems') {
      box.innerHTML = viewProblems();
      mountProblems();
    } else if (v === 'knowledge') {
      box.innerHTML = r.arg ? viewKnowledgeCard(r.arg) : viewKnowledge();
      mountKnowledge(r.arg);
    } else if (v === 'records') {
      box.innerHTML = viewRecords();
      mountRecords();
    } else if (v === 'mock') {
      box.innerHTML = viewMock();
      mountMock();
    } else if (v === 'about') {
      box.innerHTML = viewAbout();
    } else {
      box.innerHTML = viewDashboard();
      mountDashboard();
    }
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'auto' : 'auto' });
    renderLoginArea();
  }
  app.render = render;
  app.refresh = function (full) {
    if (full === false) { renderLoginArea(); return; }
    render();
  };

  /* ============================ 顶栏用户区 ============================ */
  function renderLoginArea() {
    var box = U.$('#loginArea');
    if (!box) return;
    var S = global.CSP.store.S();
    if (S.user) {
      box.innerHTML = '<div class="user-chip" id="userChip" title="点击查看数据管理">' +
        '<div class="avatar" style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#22e6ff,#7c5cff);display:grid;place-items:center;color:#04121a;font-weight:800;font-size:13px">' +
        U.esc(S.user.name.slice(0, 1)) + '</div><span>' + U.esc(S.user.name) + '</span></div>';
      U.$('#userChip').onclick = userMenu;
    } else {
      box.innerHTML = '<button class="btn btn-primary btn-sm" id="loginBtn">登录 / 注册</button>';
      U.$('#loginBtn').onclick = loginDialog;
    }
  }

  function loginDialog() {
    var S = global.CSP.store.S();
    var m = U.modal('登录', '<div class="field"><label>用户名</label><input id="lgName" maxlength="20" placeholder="例如：Peter" value="' +
      U.esc(S.user ? S.user.name : '') + '"></div>' +
      '<div class="mono-sm">数据只保存在本机浏览器（localStorage），不会上传到任何服务器。换浏览器/清缓存会丢失，可在「我的记录」里导出备份。</div>',
      [{ label: '取消' }, {
        label: '进入备考', kind: 'btn-primary', onClick: function (w) {
          var n = U.$('#lgName', w).value.trim();
          if (!n) { U.toast('请输入用户名', 'err'); return false; }
          global.CSP.store.login(n);
          renderLoginArea();
          U.toast('欢迎，' + n + '！', 'ok');
        }
      }]);
    var inp = U.$('#lgName', m.el);
    if (inp) inp.focus();
  }

  function userMenu() {
    var S = global.CSP.store.S();
    var st = global.CSP.store.stats();
    U.modal('数据管理 · ' + S.user.name,
      '<div class="grid g3 mb">' +
      '<div class="stat-card"><div class="k">已完成</div><div class="v">' + st.done + '</div></div>' +
      '<div class="stat-card"><div class="k">掌握度</div><div class="v">' + st.mastery.pct + '%</div></div>' +
      '<div class="stat-card"><div class="k">提交次数</div><div class="v">' + st.subs + '</div></div>' +
      '</div>' +
      '<div class="field"><label>导出备份（复制保存）</label><textarea id="expBox" style="height:120px;font-family:var(--mono);font-size:11px">' +
      U.esc(global.CSP.store.exportJSON()) + '</textarea></div>' +
      '<div class="field"><label>导入备份（粘贴后点导入）</label><textarea id="impBox" style="height:80px;font-family:var(--mono);font-size:11px" placeholder="粘贴导出的 JSON"></textarea></div>',
      [
        { label: '切换账号', onClick: function () { global.CSP.store.logout(); renderLoginArea(); render(); } },
        { label: '导入', onClick: function (w) {
            try { global.CSP.store.importJSON(U.$('#impBox', w).value); U.toast('导入成功', 'ok'); render(); }
            catch (e) { U.toast('导入失败：' + e.message, 'err'); }
            return true;
          } },
        {
          label: '清空进度', kind: 'btn-danger', onClick: function () {
            global.CSP.store.reset(false); U.toast('已清空刷题进度', 'ok'); render();
          }
        },
        { label: '关闭', kind: 'btn-primary' }
      ]);
  }

  /* ============================ 首页 ================================== */
  function viewDashboard() {
    var store = global.CSP.store, S = store.S();
    var st = store.stats();
    var probs = global.CSP.problems || [];
    var flags = store.flaggedKnowledge();
    var wrong = store.wrongBook();
    var syl = global.CSP.syllabus || [];

    var h = '';
    h += '<div class="hero">';
    h += '<h1>CSP-S 2026 <span>第二轮</span> 备考控制台<span class="cursor"></span></h1>';
    h += '<p>4 题 × 100 分，机试 4 小时。这一站把「刷题 → 评测 → 知识点卡片 → 算法逐步可视化」串成一条闭环：' +
      '做错的题会自动点亮对应知识点卡片，算法可视化能把你的写法和标准解法并排逐步对比，直接看到第一步错在哪。</p>';
    h += '<div class="hero-stats">' +
      hstat(st.done + '/' + st.total, '已通过题目') +
      hstat(st.mastery.pct + '%', '知识掌握度') +
      hstat(st.subs, '提交次数') +
      hstat(flags.length, '待巩固知识点') +
      hstat(wrong.length, '错题待复习') +
      '</div></div>';

    h += '<div class="grid g4 mb">' +
      statCard('题库总量', probs.length + ' 题') +
      statCard('知识考点', syl.length + ' 个') +
      statCard('知识卡', Object.keys(global.CSP.cards || {}).length + ' 张') +
      statCard('可可视化题目', probs.filter(function (p) { return p.algo && p.algo.ref; }).length + ' 题') +
      '</div>';

    h += '<div class="grid g2">';
    /* 左：继续 + 薄弱点 */
    h += '<div>';
    h += '<div class="panel mb"><div class="panel-hd"><span class="dot"></span>继续备考' +
      '<span class="more"><a href="#/problems">全部题目 →</a></span></div><div class="panel-bd">';
    var next = probs.filter(function (p) { return store.status(p.id) !== 'done'; }).slice(0, 6);
    if (!next.length) h += '<div class="empty">全部题目已通过，去模拟赛检验一下？</div>';
    next.forEach(function (p) {
      h += '<div class="home-prob-row" onclick="location.hash=\'#/problem/' + p.id + '\'">' +
        '<span class="hpr-id">' + p.id.toUpperCase() + '</span>' +
        '<span class="hpr-name">' + U.esc(p.title) + '</span>' +
        U.diffBadge(p.diff, p.tier) + U.statusBadge(store.status(p.id)) + '</div>';
    });
    h += '</div></div>';

    h += '<div class="panel"><div class="panel-hd"><span class="dot" style="background:#ff4d6d;box-shadow:0 0 10px #ff4d6d"></span>' +
      '待巩固的知识点<span class="more"><a href="#/knowledge">知识图谱 →</a></span></div><div class="panel-bd">';
    if (!flags.length) h += '<div class="empty">还没有被标红的考点，保持住</div>';
    else {
      h += '<div style="display:flex;flex-wrap:wrap;gap:6px">' + flags.slice(0, 18).map(function (k) {
        var name = gn(k);
        return '<a class="chip" style="border-color:#ff4d6d;color:#ffc4d1" href="#/knowledge/' + k + '">' + U.esc(name) + '</a>';
      }).join('') + '</div>';
    }
    h += '</div></div></div>';

    /* 右：掌握度 + 活跃度 + 快捷入口 */
    h += '<div>';
    h += '<div class="panel mb"><div class="panel-hd"><span class="dot"></span>考纲掌握度</div><div class="panel-bd">' +
      '<div class="flex mb"><div class="ring" style="--p:' + st.mastery.pct + '"><b>' + st.mastery.pct + '%</b></div>' +
      '<div style="flex:1">' +
      '<div class="mono-sm">已掌握 ' + st.mastery.mastered + ' / ' + st.mastery.total + ' 个考点</div>' +
      '<div class="bar mt"><i style="width:' + st.mastery.pct + '%"></i></div>' +
      '<div class="mono-sm mt">掌握度 = 已掌握 ×1 + 复习中 ×0.5 + 待巩固 ×0.2</div>' +
      '</div></div>' +
      catBars() +
      '</div></div>';

    h += '<div class="panel mb"><div class="panel-hd"><span class="dot"></span>近 28 天活跃度</div>' +
      '<div class="panel-bd">' + heatmap() + '</div></div>';

    h += '<div class="panel"><div class="panel-hd"><span class="dot"></span>快捷入口</div><div class="panel-bd">' +
      '<div style="display:flex;flex-wrap:wrap;gap:8px">' +
      '<a class="btn btn-sm" href="#/problems">📚 题库</a>' +
      '<a class="btn btn-sm" href="#/knowledge">🧭 知识图谱</a>' +
      '<a class="btn btn-sm" href="#/mock">🏆 模拟赛</a>' +
      '<a class="btn btn-sm" href="#/records">📈 我的记录</a>' +
      '<a class="btn btn-sm" href="#/about">ℹ️ 使用说明</a>' +
      '</div></div></div></div>';
    h += '</div>';
    return h;
  }

  function hstat(n, l) { return '<div class="hstat"><div class="n">' + n + '</div><div class="l">' + l + '</div></div>'; }
  function statCard(k, v) { return '<div class="stat-card"><div class="k">' + k + '</div><div class="v">' + v + '</div></div>'; }
  function gn(kid) {
    var k = (global.CSP.syllabus || []).filter(function (x) { return x.id === kid; })[0];
    return k ? k.name : kid;
  }

  function catBars() {
    var store = global.CSP.store, syl = global.CSP.syllabus || [];
    var cats = {};
    syl.forEach(function (k) {
      cats[k.cat] = cats[k.cat] || { n: 0, got: 0 };
      cats[k.cat].n++;
      var s = store.kstate(k.id).state;
      cats[k.cat].got += s === 'mastered' ? 1 : s === 'learning' ? 0.5 : s === 'flagged' ? 0.2 : 0;
    });
    return Object.keys(cats).map(function (c) {
      var pct = Math.round(cats[c].got / cats[c].n * 100);
      return '<div class="mb" style="margin-bottom:8px"><div class="flex" style="font-size:12px"><span>' + U.esc(c) +
        '</span><span class="ml-auto mono-sm">' + pct + '%</span></div>' +
        '<div class="bar"><i style="width:' + pct + '%"></i></div></div>';
    }).join('');
  }

  function heatmap() {
    var act = global.CSP.store.activity(28);
    return '<div style="display:flex;gap:3px;flex-wrap:wrap">' + act.map(function (d) {
      var c = d.n === 0 ? 'rgba(27,42,65,.75)' : d.n < 3 ? 'rgba(34,230,255,.3)' : d.n < 6 ? 'rgba(34,230,255,.6)' : '#22e6ff';
      return '<div title="' + d.date + '：' + d.n + ' 次提交" style="width:16px;height:16px;border-radius:3px;background:' + c + '"></div>';
    }).join('') + '</div>';
  }

  function mountDashboard() {
    // 登录是可选的：不主动弹窗打断刷题，用户可用右上角「登录 / 注册」保留进度归属。
  }

  /* ============================ 题库 ================================== */
  var filterState = { q: '', cat: 'all', diff: 'all', status: 'all', onlyViz: false, sort: 'no' };

  function viewProblems() {
    var h = '';
    h += '<div class="crumb"><b>题库</b> · CSP-S 第二轮考点全覆盖</div>';
    h += '<div class="panel mb"><div class="panel-bd">';
    h += '<div class="searchbox" style="position:relative;margin-bottom:12px"><span class="ic">🔍</span>' +
      '<input id="plSearch" placeholder="搜索题号 / 题名 / 知识点…" value="' + U.esc(filterState.q) + '" style="width:100%;height:38px;background:#070d18;border:1px solid #1b2a41;border-radius:8px;color:#d7e3f4;padding:0 12px 0 34px;font-size:13.5px;outline:none"></div>';
    h += '<div class="flex flex-wrap" style="gap:6px">';
    h += '<span class="mono-sm">难度</span>';
    [['all', '全部'], ['1', '入门'], ['2', '普及-'], ['3', '普及+'], ['4', '提高'], ['5', '提高+'], ['6', '省选-']].forEach(function (d) {
      h += '<span class="chip' + (filterState.diff === d[0] ? ' on' : '') + '" data-diff="' + d[0] + '">' + d[1] + '</span>';
    });
    h += '<span class="mono-sm" style="margin-left:10px">状态</span>';
    [['all', '全部'], ['todo', '未做'], ['wrong', '未通过'], ['done', '已通过']].forEach(function (d) {
      h += '<span class="chip' + (filterState.status === d[0] ? ' on' : '') + '" data-status="' + d[0] + '">' + d[1] + '</span>';
    });
    h += '</div>';
    h += '<div class="flex flex-wrap mt" style="gap:6px"><span class="mono-sm">知识板块</span>' +
      '<span class="chip' + (filterState.cat === 'all' ? ' on' : '') + '" data-cat="all">全部</span>' +
      Array.from(new Set((global.CSP.syllabus || []).map(function (k) { return k.cat; }))).map(function (c) {
        return '<span class="chip' + (filterState.cat === c ? ' on' : '') + '" data-cat="' + c + '">' + U.esc(c) + '</span>';
      }).join('') +
      '<span class="chip' + (filterState.onlyViz ? ' on' : '') + '" data-viz="1" style="margin-left:10px">仅看有可视化的题</span>' +
      '</div>';
    h += '</div></div>';
    h += '<div class="panel"><div id="plList"></div></div>';
    return h;
  }

  function filteredProblems() {
    var store = global.CSP.store;
    var q = filterState.q.trim().toLowerCase();
    return (global.CSP.problems || []).filter(function (p) {
      if (filterState.diff !== 'all' && String(p.diff) !== filterState.diff) return false;
      if (filterState.onlyViz && !(p.algo && p.algo.ref)) return false;
      if (filterState.cat !== 'all') {
        var ok = (p.knowledge || []).some(function (k) {
          var s = (global.CSP.syllabus || []).filter(function (x) { return x.id === k; })[0];
          return s && s.cat === filterState.cat;
        });
        if (!ok) return false;
      }
      if (filterState.status !== 'all') {
        var st = store.status(p.id);
        if (filterState.status === 'todo' && st) return false;
        if (filterState.status === 'done' && st !== 'done') return false;
        if (filterState.status === 'wrong' && (st === 'done' || !st)) return false;
      }
      if (q) {
        var hay = (p.id + ' ' + p.title + ' ' + p.tier + ' ' +
          (p.knowledge || []).map(gn).join(' ')).toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
  }

  function renderProblemList() {
    var store = global.CSP.store, list = filteredProblems();
    if (!list.length) return '<div class="empty">没有符合条件的题目</div>';
    var h = '<table class="tbl"><thead><tr>' +
      '<th style="width:70px">题号</th><th>题目</th><th style="width:90px">难度</th>' +
      '<th style="width:260px">知识点</th><th style="width:110px">状态</th><th style="width:70px">可视化</th>' +
      '</tr></thead><tbody>';
    list.forEach(function (p) {
      h += '<tr onclick="location.hash=\'#/problem/' + p.id + '\'">' +
        '<td class="pid">' + p.id.toUpperCase() + '</td>' +
        '<td class="pname">' + U.esc(p.title) + '</td>' +
        '<td>' + U.diffBadge(p.diff, p.tier) + '</td>' +
        '<td>' + (p.knowledge || []).map(function (k) {
          var fl = store.kstate(k).state === 'flagged';
          return '<span class="tag know"' + (fl ? ' style="border-color:#ff4d6d;color:#ffc4d1"' : '') + '>' + U.esc(gn(k)) + '</span>';
        }).join('') + '</td>' +
        '<td>' + U.statusBadge(store.status(p.id)) + '</td>' +
        '<td class="mono-sm">' + (p.algo && p.algo.ref ? '✅' : '—') + '</td></tr>';
    });
    return h + '</tbody></table>';
  }

  function mountProblems() {
    var list = U.$('#plList');
    function paint() { list.innerHTML = renderProblemList(); }
    paint();
    U.$('#plSearch').oninput = U.debounce(function () {
      filterState.q = this.value; paint();
    });
    U.$$('[data-diff]').forEach(function (c) {
      c.onclick = function () { filterState.diff = c.getAttribute('data-diff'); render(); };
    });
    U.$$('[data-status]').forEach(function (c) {
      c.onclick = function () { filterState.status = c.getAttribute('data-status'); render(); };
    });
    U.$$('[data-cat]').forEach(function (c) {
      c.onclick = function () { filterState.cat = c.getAttribute('data-cat'); render(); };
    });
    U.$$('[data-viz]').forEach(function (c) {
      c.onclick = function () { filterState.onlyViz = !filterState.onlyViz; render(); };
    });
  }

  /* ============================ 知识图谱 ============================== */
  /* 每个考点关联的题目数量（缓存） */
  var _kCount = null;
  function kCount() {
    if (_kCount) return _kCount;
    _kCount = {};
    (global.CSP.problems || []).forEach(function (p) {
      (p.knowledge || []).forEach(function (k) { _kCount[k] = (_kCount[k] || 0) + 1; });
    });
    return _kCount;
  }

  /* 方法类考点：不配套独立题目，通过站内工具/策略页练习 */
  var METHOD_POINTS = {
    'adv.stress': '用题目页的「🎲 随机对拍找错」练',
    'adv.strategy': '见「模拟赛」页的考场策略速查',
    'adv.io': '见该知识卡的代码骨架，直接抄进模板',
    'basic.complexity': '每道题的数据范围都在训练它',
    'adv.interactive': '交互思维：见该知识卡要点',
    'adv.offline': '离线处理常与扫描线/差分结合，见相关卡片'
  };

  function viewKnowledge() {
    var store = global.CSP.store, syl = global.CSP.syllabus || [];
    var st = store.stats();
    var cats = {};
    syl.forEach(function (k) { (cats[k.cat] = cats[k.cat] || []).push(k); });
    var kc = kCount();
    var withP = syl.filter(function (k) { return kc[k.id]; }).length;

    var h = '';
    h += '<div class="crumb"><b>知识图谱</b> · ' + syl.length + ' 个考点 · ' +
      Object.keys(cats).length + ' 个板块 · ' + withP + ' 个配有练习题目</div>';

    h += '<div class="panel mb"><div class="panel-bd">' +
      '<div class="flex flex-wrap" style="gap:10px">' +
      '<div class="ring" style="--p:' + st.mastery.pct + '"><b>' + st.mastery.pct + '%</b></div>' +
      '<div style="flex:1;min-width:220px">' +
      '<div class="mono-sm">整体掌握度</div>' +
      '<div class="bar mt mb"><i style="width:' + st.mastery.pct + '%"></i></div>' +
      '<div class="mono-sm">已掌握 <b style="color:#3ddc84">' + st.mastery.mastered + '</b> · ' +
      '待巩固 <b style="color:#ff4d6d">' + store.flaggedKnowledge().length + '</b> · ' +
      '共 ' + syl.length + ' 个考点</div>' +
      '<div class="mono-sm mt">全部 ' + syl.length + ' 个考点都有完整知识卡（定义 / 核心要点 / 复杂度 / 易错点 / 代码骨架 / 识别套路）；' +
      '其中 <b style="color:#22e6ff">' + withP + '</b> 个配有可评测的练习题。</div>' +
      '</div></div></div></div>';

    h += '<div class="panel mb"><div class="panel-bd">' +
      '<span class="mono-sm">图例：</span>' +
      '<span class="kstate ks-none">未学习</span> ' +
      '<span class="kstate ks-learning">复习中</span> ' +
      '<span class="kstate ks-mastered">已掌握</span> ' +
      '<span class="kstate ks-flagged">待巩固（做错题自动标记）</span>' +
      '<span class="mono-sm" style="margin-left:14px">只看：</span>' +
      '<span class="chip' + (knowFilter === 'all' ? ' on' : '') + '" data-kf="all">全部</span>' +
      '<span class="chip' + (knowFilter === 'flagged' ? ' on' : '') + '" data-kf="flagged">待巩固</span>' +
      '<span class="chip' + (knowFilter === 'cardonly' ? ' on' : '') + '" data-kf="cardonly">仅知识卡（无题目）</span>' +
      '<span class="chip' + (knowFilter === 'hasprob' ? ' on' : '') + '" data-kf="hasprob">有题目</span>' +
      '</div></div>';

    var anyShown = false;
    Object.keys(cats).forEach(function (c) {
      var list = cats[c].filter(function (k) {
        if (knowFilter === 'flagged') return store.kstate(k.id).state === 'flagged';
        if (knowFilter === 'cardonly') return !kCount()[k.id];
        if (knowFilter === 'hasprob') return !!kCount()[k.id];
        return true;
      });
      if (!list.length) return;
      anyShown = true;
      var n = list.filter(function (k) { return kCount()[k.id]; }).length;
      h += '<div class="panel mb"><div class="panel-hd"><span class="dot"></span>' + U.esc(c) +
        '<span class="more">' + list.length + ' 个考点 · ' + n + ' 个配套题目</span></div><div class="panel-bd">' +
        '<div class="kcards">' + list.map(kcardMini).join('') + '</div></div></div>';
    });
    if (!anyShown) h += '<div class="panel"><div class="empty">没有符合条件的考点</div></div>';
    return h;
  }
  var knowFilter = 'all';

  function kcardMini(k) {
    var store = global.CSP.store;
    var st = store.kstate(k.id);
    var card = (global.CSP.cards || {})[k.id];
    var n = kCount()[k.id] || 0;
    var cls = st.state === 'mastered' ? ' mastered' : st.state === 'flagged' ? ' flagged' : st.state === 'learning' ? ' learning' : '';
    var method = METHOD_POINTS[k.id];
    return '<div class="kcard' + cls + '" onclick="location.hash=\'#/knowledge/' + k.id + '\'">' +
      '<div class="kc-cat">' + U.esc(k.cat) + ' · Lv' + k.level + '</div>' +
      '<div class="kc-name">' + U.esc(k.name) + '</div>' +
      '<div class="kc-def">' + U.esc(card ? String(card.definition).slice(0, 52) + (card.definition.length > 52 ? '…' : '') : '（暂无卡片）') + '</div>' +
      '<div class="kc-foot">' +
      (st.state === 'none' ? '<span class="kstate ks-none">未学习</span>' : '') +
      (st.state === 'learning' ? '<span class="kstate ks-learning">复习中</span>' : '') +
      (st.state === 'mastered' ? '<span class="kstate ks-mastered">已掌握</span>' : '') +
      (st.state === 'flagged' ? '<span class="kstate ks-flagged">待巩固</span>' : '') +
      (n ? '<span class="kstate" style="color:#22e6ff;background:rgba(34,230,255,.12)">' + n + ' 题</span>' : '') +
      (st.wrong ? '<span class="kc-wrong">错 ' + st.wrong + ' 次</span>' : '') +
      '</div>' +
      (!n && method ? '<div class="mono-sm" style="margin-top:6px;font-size:10.5px">' + U.esc(method) + '</div>' : '') +
      '</div>';
  }

  function viewKnowledgeCard(kid) {
    var k = (global.CSP.syllabus || []).filter(function (x) { return x.id === kid; })[0];
    if (!k) return '<div class="empty">知识点不存在</div>';
    var h = '<div class="crumb"><a href="#/knowledge">知识图谱</a> / <b>' + U.esc(k.name) + '</b></div>';
    h += '<div class="panel" style="max-width:900px;margin:0 auto"><div class="panel-bd" id="kcard-host">' +
      global.CSP.views.knowledgeCardHtml(kid) + '</div></div>';
    return h;
  }

  function mountKnowledge(kid) {
    if (kid) { global.CSP.views.bindKmark(U.$('#kcard-host'), kid); return; }
    U.$$('[data-kf]').forEach(function (c) {
      c.onclick = function () { knowFilter = c.getAttribute('data-kf'); render(); };
    });
  }

  /* ============================ 记录 ================================== */
  function viewRecords() {
    var store = global.CSP.store, S = store.S();
    var st = store.stats();
    var h = '';
    h += '<div class="crumb"><b>我的记录</b> · 提交历史 / 错题本 / 数据管理</div>';
    h += '<div class="grid g4 mb">' +
      statCard('提交次数', st.subs) + statCard('AC 次数', st.ac) +
      statCard('通过题目', st.done + '/' + st.total) + statCard('累计得分', st.totalScore) +
      '</div>';

    h += '<div class="panel mb"><div class="panel-hd"><span class="dot" style="background:#ff4d6d;box-shadow:0 0 10px #ff4d6d"></span>' +
      '错题本<span class="more">' + store.wrongBook().length + ' 题</span></div><div class="panel-bd">';
    var wb = store.wrongBook();
    if (!wb.length) h += '<div class="empty">没有错题，继续保持</div>';
    else {
      h += '<div class="kcards">' + wb.map(function (pid) {
        var p = global.CSP.views.findProblem(pid);
        if (!p) return '';
        return '<div class="kcard flagged" onclick="location.hash=\'#/problem/' + pid + '\'">' +
          '<div class="kc-cat">' + pid.toUpperCase() + ' · 最高分 ' + Math.max(0, store.bestScore(pid)) + '</div>' +
          '<div class="kc-name">' + U.esc(p.title) + '</div>' +
          '<div class="kc-def">' + (p.knowledge || []).map(gn).join(' / ') + '</div>' +
          '<div class="kc-foot"><span class="kstate ks-flagged">去重做</span></div></div>';
      }).join('') + '</div>';
    }
    h += '</div></div>';

    h += '<div class="panel mb"><div class="panel-hd"><span class="dot"></span>提交历史</div><div id="subList"></div></div>';
    h += '<div class="grid g2">' +
      '<div class="panel"><div class="panel-hd"><span class="dot"></span>模拟赛战绩</div><div class="panel-bd" id="mockHis"></div></div>' +
      '<div class="panel"><div class="panel-hd"><span class="dot"></span>数据管理</div><div class="panel-bd">' +
      '<div class="mono-sm mb">数据保存在本机浏览器。换设备时用导出 / 导入迁移。</div>' +
      '<div class="flex flex-wrap"><button class="btn btn-sm" id="recExport">📤 导出备份</button>' +
      '<button class="btn btn-sm" id="recImport">📥 导入备份</button>' +
      '<button class="btn btn-sm" id="recClearJudge">🧹 清空评测缓存</button>' +
      '<button class="btn btn-sm btn-danger" id="recReset">⚠️ 清空所有进度</button></div>' +
      '</div></div></div>';
    return h;
  }

  function mountRecords() {
    var store = global.CSP.store;
    var list = U.$('#subList');
    var subs = store.S().subs;
    if (!subs.length) list.innerHTML = '<div class="empty">还没有提交记录</div>';
    else {
      list.innerHTML = '<div style="max-height:420px;overflow:auto">' + subs.slice(0, 200).map(function (s) {
        var p = global.CSP.views.findProblem(s.pid);
        return '<div class="sub-row" onclick="location.hash=\'#/problem/' + s.pid + '\'">' +
          '<span class="sid">' + U.esc(s.sid) + '</span>' +
          '<span style="width:60px;color:#22e6ff">' + U.esc(s.pid.toUpperCase()) + '</span>' +
          '<span class="' + U.scoreClass(s.verdict) + '" style="width:44px">' + U.esc(s.verdict) + '</span>' +
          '<span style="width:52px">' + (s.score || 0) + ' 分</span>' +
          '<span class="mono-sm">' + U.esc(p ? p.title : '') + '</span>' +
          '<span class="ml-auto mono-sm">' + U.fmtTime(s.ts) + '</span></div>';
      }).join('') + '</div>';
    }
    var mh = U.$('#mockHis');
    var his = store.S().mockHistory || [];
    mh.innerHTML = his.length ? his.map(function (m) {
      return '<div class="sub-row"><span style="color:#22e6ff">' + U.esc(m.examId) + ' 卷</span>' +
        '<span>' + m.score + ' / 400</span><span class="ml-auto mono-sm">' + U.fmtTime(m.ts) + '</span></div>';
    }).join('') : '<div class="empty">还没有模拟赛记录</div>';

    U.$('#recExport').onclick = function () {
      U.modal('导出备份', '<div class="mono-sm mb">复制下面内容保存到文件，换设备时用「导入备份」恢复。</div>' +
        '<textarea style="width:100%;height:260px;background:#070d18;color:#b9cde6;border:1px solid #1b2a41;border-radius:8px;font-family:var(--mono);font-size:11px;padding:10px" readonly>' +
        U.esc(store.exportJSON()) + '</textarea>');
    };
    U.$('#recImport').onclick = function () {
      U.modal('导入备份', '<div class="field"><label>粘贴备份 JSON</label><textarea id="imp2" style="height:220px;font-family:var(--mono);font-size:11px"></textarea></div>',
        [{ label: '取消' }, {
          label: '导入', kind: 'btn-primary', onClick: function (w) {
            try { store.importJSON(U.$('#imp2', w).value); U.toast('导入成功', 'ok'); render(); }
            catch (e) { U.toast('导入失败：' + e.message, 'err'); return false; }
          }
        }]);
    };
    U.$('#recClearJudge').onclick = function () {
      global.CSP.judge.clearCache(); U.toast('已清空评测缓存', 'ok');
    };
    U.$('#recReset').onclick = function () {
      U.confirm('清空所有进度', '将删除全部提交记录与知识点标记，且不可恢复。确定吗？', function () {
        store.reset(false); U.toast('已清空', 'ok'); render();
      });
    };
  }

  /* ============================ 模拟赛 ================================ */
  var MOCKS = [
    { id: 'A', name: '模拟赛 A 卷', desc: '基础算法 + 图论入门', probs: ['p01', 'p03', 'p05', 'p20'] },
    { id: 'B', name: '模拟赛 B 卷', desc: '数据结构 + DP 综合', probs: ['p12', 'p13', 'p16', 'p29'] },
    { id: 'C', name: '模拟赛 C 卷', desc: '图论 + 动态规划提高', probs: ['p22', 'p23', 'p27', 'p31'] },
    { id: 'D', name: '模拟赛 D 卷', desc: '字符串 + 数学压轴', probs: ['p36', 'p38', 'p41', 'p43'] }
  ];
  function examOf(id) {
    var e = MOCKS.filter(function (x) { return x.id === id; })[0];
    if (!e) return null;
    e.problems = e.probs.map(function (pid) { return global.CSP.views.findProblem(pid); }).filter(Boolean);
    return e;
  }

  function viewMock() {
    var store = global.CSP.store, S = store.S();
    var h = '<div class="crumb"><b>模拟赛</b> · 4 题 × 100 分 = 400 分 · 限时 240 分钟</div>';
    if (S.mock) {
      var e = examOf(S.mock.examId);
      var done = 0;
      e.problems.forEach(function (p) { if (store.bestScore(p.id) >= 100) done++; });
      h += '<div class="panel mb"><div class="panel-hd"><span class="dot" style="background:#ffb020;box-shadow:0 0 10px #ffb020"></span>' +
        '进行中：' + U.esc(e.name) + '<span class="more">已通过 ' + done + '/' + e.problems.length + ' 题</span></div>' +
        '<div class="panel-bd"><div class="prob-section"><h3>题目列表</h3>' +
        e.problems.map(function (p, i) {
          var sc = Math.max(0, store.bestScore(p.id));
          return '<div class="home-prob-row" onclick="location.hash=\'#/problem/' + p.id + '\'">' +
            '<span class="hpr-id">T' + (i + 1) + '</span>' +
            '<span class="hpr-name">' + U.esc(p.title) + '</span>' +
            U.diffBadge(p.diff, p.tier) +
            '<span class="mono-sm" style="width:60px;text-align:right;color:' + (sc >= 100 ? '#3ddc84' : '#8ba1bd') + '">' + sc + ' 分</span></div>';
        }).join('') + '</div>' +
        '<div class="flex mt"><button class="btn" id="mockEnd">结束本场模拟赛</button>' +
        '<span class="mono-sm">结束后会记录成绩（每题取本场最高分）</span></div>' +
        '</div></div>';
    }
    h += '<div class="grid g2">' + MOCKS.map(function (m) {
      var startable = m.probs.every(function (pid) { return !!global.CSP.views.findProblem(pid); });
      return '<div class="panel"><div class="panel-hd"><span class="dot"></span>' + U.esc(m.name) + '</div><div class="panel-bd">' +
        '<div class="mono-sm mb">' + U.esc(m.desc) + ' · 限时 240 分钟</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:4px">' + m.probs.map(function (pid) {
          var p = global.CSP.views.findProblem(pid);
          return p ? '<span class="chip">T ' + U.esc(p.title) + '</span>' : '';
        }).join('') + '</div>' +
        '<button class="btn btn-primary btn-sm mt" data-mock="' + m.id + '"' + (startable ? '' : ' disabled') + '>开始模拟赛</button>' +
        (startable ? '' : '<span class="mono-sm" style="margin-left:8px">（题目未就绪）</span>') +
        '</div></div>';
    }).join('') + '</div>';

    h += '<div class="panel mt"><div class="panel-hd"><span class="dot"></span>考场策略速查</div><div class="panel-bd">' +
      '<ul class="kcard-detail" style="padding-left:20px">' +
      ['先花 10 分钟通读四题，判断难度，先做最有把握的一题。',
        '每题先写暴力拿部分分，再逐步优化；不要在一题上死磕超过 60 分钟。',
        '写之前先确认数据范围，据此选算法（O(n²) 能过就绝不写 O(n log n)）。',
        '提交前用样例自测，并手造边界数据（n=1、全相同、最大值）。',
        '注意 long long：涉及乘法或大范围和时先开 long long 再说。',
        '交卷前留 15 分钟检查是否所有文件都提交、文件名是否正确。'
      ].map(function (x) { return '<li>' + U.esc(x) + '</li>'; }).join('') + '</ul></div></div>';
    return h;
  }

  function mountMock() {
    var store = global.CSP.store;
    U.$$('[data-mock]').forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute('data-mock');
        var e = examOf(id);
        U.confirm('开始 ' + e.name, '限时 240 分钟，开始后顶部会出现计时条。每题按最高分计入总分。', function () {
          store.startMock(id, 240);
          U.toast('模拟赛开始，加油！', 'ok');
          render();
        });
      };
    });
    var end = U.$('#mockEnd');
    if (end) end.onclick = function () {
      var S = store.S();
      var e = examOf(S.mock.examId);
      var score = e.problems.reduce(function (s, p) { return s + Math.max(0, store.bestScore(p.id)); }, 0);
      U.confirm('结束模拟赛', '本次成绩：' + score + ' / 400 分，确认结束并记录吗？', function () {
        store.mockRecord(S.mock.examId, score, e.problems.map(function (p) { return { pid: p.id, score: Math.max(0, store.bestScore(p.id)) }; }));
        U.toast('已记录成绩：' + score + ' 分', 'ok');
        render();
      });
    };
  }

  /* ============================ 关于 ================================== */
  function viewAbout() {
    var h = '<div class="crumb"><b>使用说明</b></div>';
    h += '<div class="panel mb"><div class="panel-hd"><span class="dot"></span>这个站怎么用</div><div class="panel-bd">' +
      '<div class="kcard-detail">' +
      '<h4>1 · 刷题与实时评测</h4><ul><li>打开任意题目，右侧写 C++，点「提交评测」。</li>' +
      '<li>系统会逐测试点调用 Wandbox（gcc 13.2.0）真实编译运行，按通过的测试点给分，与官方「按测试点给分」一致。</li>' +
      '<li>需要联网。首次评测会稍慢（编译耗时），相同代码+输入会命中缓存。</li></ul>' +
      '<h4>2 · 知识点卡片</h4><ul><li>每道题都关联 1–3 个考纲知识点，题目页「知识点卡片」标签里能看到完整卡片：是什么 / 怎么做 / 复杂度 / 易错点 / 代码骨架 / 识别套路。</li>' +
      '<li><b>做错就自动标红</b>：未满分的提交会把该题关联的知识点标记为「待巩固」，在首页和知识图谱里高亮显示；满分通过则转为「已掌握」。</li>' +
      '<li>也可以在知识图谱里手动标记「掌握 / 待巩固」，掌握度进度条会实时更新。</li></ul>' +
      '<h4>3 · 算法可视化（你写的算法 ⟷ 标准算法）</h4><ul>' +
      '<li>题目页下方的可视化区，左边是标准算法、右边是<b>你自己写的算法</b>，两者在<b>同一组输入</b>上运行，逐步并排播放。</li>' +
      '<li>「我的算法」用 JavaScript 写，用 <code>T.step(状态, 说明)</code> 记录每一步，用 <code>T.answer(答案)</code> 声明答案。</li>' +
      '<li>播放时两边会同步高亮当前执行的代码行；<b>第一处状态分歧会自动标红</b>，并指出是哪个变量先不对。</li>' +
      '<li>点「🎲 随机对拍找错」会自动造 60 组小数据，找出第一个让你的算法出错的用例，一键载入并逐步对比。</li></ul>' +
      '<h4>4 · 模拟赛</h4><ul><li>4 卷可选，各 4 题、限时 240 分钟，顶部计时条倒计时，结束后记录成绩。</li></ul>' +
      '</div></div></div>';
    h += '<div class="panel mb"><div class="panel-hd"><span class="dot"></span>覆盖范围</div><div class="panel-bd">' +
      '<div class="mono-sm mb">依据 CCF《NOI 大纲》提高级与 CSP-S 第二轮命题范围整理：' +
      '<b style="color:#22e6ff">' + (global.CSP.syllabus || []).length + '</b> 个考点、8 个板块，' +
      '<b style="color:#22e6ff">' + (global.CSP.problems || []).length + '</b> 道可评测题（每题 5 个隐藏测试点）、' +
      '<b style="color:#22e6ff">' + Object.keys(global.CSP.cards || {}).length + '</b> 张知识卡。' +
      '所有考点都有完整知识卡；每个考点卡片右下角标出配套题目数量，没有独立题目的方法类考点会在卡片上给出练习方式。</div>' +
      (function () {
        var cats = {}, kc = kCount();
        (global.CSP.syllabus || []).forEach(function (k) {
          cats[k.cat] = cats[k.cat] || { n: 0, withP: 0, names: [] };
          cats[k.cat].n++;
          cats[k.cat].names.push(k.name);
          if (kc[k.id]) cats[k.cat].withP++;
        });
        return Object.keys(cats).map(function (c) {
          var v = cats[c];
          return '<div class="mb"><div style="font-family:var(--mono);font-size:12.5px;color:#22e6ff">' + U.esc(c) +
            '<span class="mono-sm">（' + v.n + ' 个考点，' + v.withP + ' 个有题目）</span></div>' +
            '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:5px">' +
            v.names.map(function (n) { return '<span class="chip">' + U.esc(n) + '</span>'; }).join('') + '</div></div>';
        }).join('');
      })() +
      '</div></div>';
    h += '<div class="panel"><div class="panel-hd"><span class="dot"></span>免责声明</div><div class="panel-bd mono-sm">' +
      '本站为个人备考工具，与 CCF 无任何关联；题目为原创模拟题，非历年真题。' +
      '考试时间、大纲与评分标准以 NOI 官网（noi.cn）与 CCF 官方通知为准。</div></div>';
    return h;
  }

  /* ============================ 启动 ================================== */
  function boot() {
    global.CSP.store.load();
    U.$('#nav').innerHTML = [
      ['dashboard', '首页'], ['problems', '题库'], ['knowledge', '知识图谱'],
      ['mock', '模拟赛'], ['records', '我的记录'], ['about', '说明']
    ].map(function (x) {
      return '<a data-view="' + x[0] + '" href="#/' + x[0] + '">' + x[1] + '</a>';
    }).join('');

    U.$('#topSearch').addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var q = this.value.trim().toLowerCase();
      if (!q) return;
      var hit = (global.CSP.problems || []).filter(function (p) {
        return (p.id + p.title + (p.knowledge || []).map(gn).join('')).toLowerCase().indexOf(q) >= 0;
      })[0];
      var khit = (global.CSP.syllabus || []).filter(function (k) {
        return (k.name + k.id + k.cat).toLowerCase().indexOf(q) >= 0;
      })[0];
      if (hit) location.hash = '#/problem/' + hit.id;
      else if (khit) location.hash = '#/knowledge/' + khit.id;
      else U.toast('没有找到「' + q + '」', 'err');
    });

    U.$('#topSearch').addEventListener('input', U.debounce(function () {
      var q = this.value.trim().toLowerCase();
      if (q.length < 2) return;
      if (parseHash().view !== 'problems') location.hash = '#/problems';
      filterState.q = q;
      var inp = U.$('#plSearch');
      if (inp) { inp.value = q; U.$('#plList').innerHTML = renderProblemList(); }
    }, 320));

    window.addEventListener('hashchange', render);
    render();
    tickMock();
    setInterval(tickMock, 1000);
  }

  function tickMock() {
    var bar = U.$('#mockbar');
    if (!bar) return;
    var S = global.CSP.store.S();
    if (!S.mock) { bar.classList.add('hidden'); return; }
    bar.classList.remove('hidden');
    var left = global.CSP.store.mockRemain();
    U.$('#mocktime').textContent = U.fmtClock(left);
    if (left <= 0) {
      U.$('#mocktime').textContent = '00:00:00';
      return;
    }
    var e = examOf(S.mock.examId);
    if (!e) return;
    U.$('#mockprobs').innerHTML = e.problems.map(function (p, i) {
      var sc = Math.max(0, global.CSP.store.bestScore(p.id));
      return '<span class="pb' + (sc >= 100 ? ' done' : '') + '" onclick="location.hash=\'#/problem/' + p.id + '\'">T' +
        (i + 1) + ' · ' + sc + '分</span>';
    }).join('');
  }

  global.CSP.views.dashboard = viewDashboard;
  global.CSP.views.problems = viewProblems;
  global.CSP.views.knowledge = viewKnowledge;
  global.CSP.views.records = viewRecords;
  global.CSP.views.mock = viewMock;
  global.CSP.views.about = viewAbout;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(typeof window !== 'undefined' ? window : globalThis);
