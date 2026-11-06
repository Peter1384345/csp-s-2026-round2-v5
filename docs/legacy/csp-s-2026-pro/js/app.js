/* ============================================================================
 * CSP-S 2026 PRO · 主应用逻辑
 * 功能：路由、模板速查、考试倒计时、计时器、搜索、快速导航
 * ==========================================================================*/
(function () {
  'use strict';
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];
  const T = window.CSP.templates || [];
  const CATS = window.CSP.templateCats || [];
  const PROBLEMS = window.CSP.problems || [];

  // ============================ 共享常量 ============================
  const CAT_ICONS = {
    '基础算法': 'AL', '图论': 'GR', '树论': 'TR', '动态规划': 'DP',
    '数学': 'MA', '字符串': 'ST', '数据结构': 'DS', '考试模板': 'EX'
  };

  // ============================ 状态 ============================
  const state = {
    view: 'home',
    searchQuery: '',
    filterCat: 'all',
    timerRunning: false,
    timerStart: 0,
    timerElapsed: 0,
    quickPanelOpen: false
  };

  // ============================ 考试倒计时 ============================
  const EXAM_DATE = new Date('2026-10-31T08:30:00');

  function updateCountdown() {
    const now = new Date();
    const diff = EXAM_DATE - now;
    if (diff <= 0) {
      $('#cd-value').textContent = '考试已开始';
      $('#cd-value').className = 'cd-value urgent';
      return;
    }
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);

    const el = $('#cd-value');
    el.textContent = `${days}天 ${hours}时 ${mins}分 ${secs}秒`;
    if (days <= 3) el.className = 'cd-value urgent';
    else if (days <= 10) el.className = 'cd-value warning';
    else el.className = 'cd-value';
  }

  // ============================ 考试计时器 ============================
  const TIMER_KEY = 'csp_timer_state';

  function saveTimerState() {
    try {
      const elapsed = state.timerRunning
        ? Date.now() - state.timerStart + state.timerElapsed
        : state.timerElapsed;
      localStorage.setItem(TIMER_KEY, JSON.stringify({
        running: state.timerRunning,
        elapsed: elapsed,
        savedAt: Date.now()
      }));
    } catch (e) { /* localStorage不可用时静默忽略 */ }
  }

  function loadTimerState() {
    try {
      const raw = localStorage.getItem(TIMER_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      state.timerElapsed = data.elapsed || 0;
      if (data.running) {
        state.timerRunning = true;
        state.timerStart = Date.now() - (Date.now() - data.savedAt);
        // 补偿保存后流逝的时间
        state.timerElapsed += Date.now() - data.savedAt;
        state.timerStart = Date.now();
      }
    } catch (e) { /* 解析失败时静默忽略 */ }
  }

  function updateTimer() {
    if (!state.timerRunning) return;
    const elapsed = Date.now() - state.timerStart + state.timerElapsed;
    const totalSec = Math.floor(elapsed / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const display = $('#cd-timer-display');
    if (display) {
      display.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      if (h > 3 || (h >= 3 && m >= 30)) display.style.color = 'var(--red)';
      else if (h >= 3) display.style.color = 'var(--yellow)';
    }
    // 每5秒保存一次状态
    if (totalSec % 5 === 0) saveTimerState();
  }

  function toggleTimer() {
    const btn = $('#cd-timer-btn');
    if (!btn) return;
    if (!state.timerRunning) {
      state.timerRunning = true;
      state.timerStart = Date.now();
      btn.textContent = '暂停';
      btn.className = 'cd-timer-btn pause';
    } else {
      state.timerRunning = false;
      state.timerElapsed += Date.now() - state.timerStart;
      btn.textContent = '继续';
      btn.className = 'cd-timer-btn';
    }
    saveTimerState();
  }

  function resetTimer() {
    state.timerRunning = false;
    state.timerStart = 0;
    state.timerElapsed = 0;
    const btn = $('#cd-timer-btn');
    if (btn) { btn.textContent = '开始计时'; btn.className = 'cd-timer-btn'; }
    const display = $('#cd-timer-display');
    if (display) { display.textContent = '00:00:00'; display.style.color = 'var(--text)'; }
    try { localStorage.removeItem(TIMER_KEY); } catch (e) {}
  }

  // ============================ 粒子背景 ============================
  function initParticles() {
    const canvas = $('#particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouseX = -1000, mouseY = -1000;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // 创建粒子
    const count = Math.min(80, Math.floor(canvas.width * canvas.height / 18000));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5
      });
    }

    canvas.addEventListener('mousemove', e => {
      mouseX = e.clientX; mouseY = e.clientY;
    });

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // 鼠标引力
        const dx = mouseX - p.x, dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          p.x += dx * 0.008; p.y += dy * 0.008;
        }

        // 绘制粒子
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(232,168,56, 0.6)';
        ctx.fill();

        // 连线
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const ddx = p.x - q.x, ddy = p.y - q.y;
          const d = Math.sqrt(ddx * ddx + ddy * ddy);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(232,168,56, ${0.15 * (1 - d / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(animate);
    }
    animate();
  }

  // ============================ 语法高亮 ============================
  function highlightCode(code) {
    // 先转义HTML实体
    let html = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 用占位符提取注释和字符串，避免后续正则误匹配span标签内容
    const placeholders = [];
    function stash(content, cls) {
      const idx = placeholders.length;
      placeholders.push(`<span class="${cls}">${content}</span>`);
      return `\x00${idx}\x00`;
    }

    // 提取块注释
    html = html.replace(/\/\*[\s\S]*?\*\//g, m => stash(m, 'comment'));
    // 提取行注释
    html = html.replace(/\/\/[^\n]*/g, m => stash(m, 'comment'));
    // 提取字符串
    html = html.replace(/"(?:[^"\\]|\\.)*"/g, m => stash(m, 'str'));
    html = html.replace(/'(?:[^'\\]|\\.)*'/g, m => stash(m, 'str'));

    // 关键字高亮
    const kws = ['int','long','double','float','char','bool','void','const','struct','class','public','private','return','if','else','for','while','do','break','continue','switch','case','default','typedef','using','namespace','include','define','template','typename','auto','static','unsigned','signed','short','enum','union','sizeof','new','delete','this','nullptr','true','false','vector','queue','stack','deque','priority_queue','pair','map','set','unordered_map','unordered_set','string','memset','memcpy','sort','lower_bound','upper_bound','unique','min','max','abs','swap','push','pop','front','back','top','empty','size','begin','end','push_back','pop_back','first','second','make_pair','__lg','time','rand','srand','printf','scanf','cin','cout','endl','freopen','ios','sync_with_stdio','tie','INT_MAX','INT_MIN','MAXN','MOD','INF','ll','ull'];
    const kwRe = new RegExp('\\b(' + kws.join('|') + ')\\b', 'g');
    html = html.replace(kwRe, '<span class="kw">$1</span>');

    // 数字高亮
    html = html.replace(/\b(\d+\.?\d*[eE]?[+-]?\d*)\b/g, '<span class="num">$1</span>');

    // 函数调用高亮
    html = html.replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g, (m, p1) => {
      if (kws.includes(p1)) return m;
      return `<span class="func">${p1}</span>`;
    });

    // 恢复占位符
    html = html.replace(/\x00(\d+)\x00/g, (_, i) => placeholders[parseInt(i)]);

    return html;
  }

  // ============================ 复制代码 ============================
  function copyCode(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = '已复制';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = '复制';
        btn.classList.remove('copied');
      }, 1500);
      showToast('代码已复制到剪贴板', 'ok');
    }).catch(() => {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      btn.textContent = '已复制';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = '复制';
        btn.classList.remove('copied');
      }, 1500);
      showToast('代码已复制到剪贴板', 'ok');
    });
  }

  // ============================ Toast ============================
  function showToast(msg, type = 'ok') {
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2000);
  }

  // ============================ 渲染：首页 ============================
  function renderHome() {
    const total = T.length;
    const byCat = {};
    CATS.forEach(c => byCat[c] = T.filter(t => t.cat === c).length);

    // 每日一题
    const daily = getDailyProblem();
    const dailyFav = isFavorite(daily.id);

    // 学习热力图（最近84天 = 12周）
    const activity = loadActivityData();
    const today = new Date();
    const heatCells = [];
    for (let i = 83; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const count = activity[key] || 0;
      let level = 0;
      if (count >= 5) level = 4;
      else if (count >= 3) level = 3;
      else if (count >= 2) level = 2;
      else if (count >= 1) level = 1;
      heatCells.push(`<div class="heat-cell heat-l${level}" title="${key}: ${count}次"></div>`);
    }

    // 收藏数
    const favCount = loadFavorites().length;

    return `
    <div class="hero">
      <div class="hero-left">
        <h1>CSP-S 2026 <span>第二轮</span> 备考站</h1>
        <p>整合知识点速查 + 代码模板一键复制 + 考试倒计时 + 模拟计时器。覆盖基础算法、图论、树论、动态规划、数学、字符串、数据结构等核心考点，助你高效备考。</p>
      </div>
      <div class="hero-stats">
        <div class="hstat"><div class="n">${total}</div><div class="l">代码模板</div></div>
        <div class="hstat"><div class="n">${CATS.length}</div><div class="l">知识分类</div></div>
        <div class="hstat"><div class="n">${favCount}</div><div class="l">已收藏</div></div>
        <div class="hstat"><div class="n">4</div><div class="l">考试题数</div></div>
      </div>
    </div>

    <div class="grid g4 mb">
      ${CATS.map(c => `
        <div class="stat-card" onclick="CSP.go('templates#${c}')">
          <div class="k">${c}</div>
          <div class="v">${byCat[c]}</div>
        </div>
      `).join('')}
    </div>

    <div class="grid g2 mb">
      <!-- 每日一题 -->
      <div class="panel">
        <div class="panel-hd"><span class="dot"></span> 每日一题</div>
        <div class="panel-bd">
          <div class="daily-problem">
            <div class="dp-header">
              <span class="tag" style="background:var(--cyan);color:var(--bg);">${daily.cat}</span>
              <span class="difficulty diff-${daily.diff}">${daily.diff}</span>
              <button class="btn btn-sm" onclick="CSP.toggleFavorite('${daily.id}')">${dailyFav ? '*' : '☆'}</button>
            </div>
            <h3 style="color:var(--text);margin:8px 0;">${daily.name}</h3>
            <p style="color:var(--text-2);font-size:13px;">${daily.desc}</p>
            <button class="btn btn-primary btn-sm" style="margin-top:12px;" onclick="CSP.go('templates#${daily.id}')">查看模板 →</button>
          </div>
        </div>
      </div>

      <!-- 学习热力图 -->
      <div class="panel">
        <div class="panel-hd"><span class="dot"></span> 学习热力图（近12周）</div>
        <div class="panel-bd">
          <div class="heatmap">${heatCells.join('')}</div>
          <div class="heat-legend">
            <span style="font-size:11px;color:var(--text-3);">少</span>
            <div class="heat-cell heat-l0"></div>
            <div class="heat-cell heat-l1"></div>
            <div class="heat-cell heat-l2"></div>
            <div class="heat-cell heat-l3"></div>
            <div class="heat-cell heat-l4"></div>
            <span style="font-size:11px;color:var(--text-3);">多</span>
          </div>
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-hd"><span class="dot"></span>考场策略</div>
      <div class="panel-bd">
        <div class="tip-box success"><strong>时间分配：</strong>3.5小时4题，建议每题50分钟，留30分钟检查。先看全部题目，从最有把握的开始。</div>
        <div class="tip-box"><strong>暴力优先：</strong>每题先写暴力（30~60分），确保拿到基础分后再优化。部分分策略：10→30→60→100。</div>
        <div class="tip-box warning"><strong>对拍验证：</strong>写完正解后务必对拍！用暴力程序+数据生成器验证正解正确性，避免低级错误丢分。</div>
        <div class="tip-box danger"><strong>常见陷阱：</strong>①数组开小 ②long long溢出 ③freopen写错文件名 ④边界条件 ⑤多组数据未初始化 ⑥图论建反边</div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-hd"><span class="dot"></span>高频考点 TOP 10</div>
      <div class="panel-bd">
        <table class="tbl">
          <thead><tr><th>排名</th><th>考点</th><th>分类</th><th>出现频率</th><th>操作</th></tr></thead>
          <tbody>
            ${[
              ['1','二分答案','基础算法','★★★★★','tpl-binary'],
              ['2','线段树','树论','★★★★★','tpl-segtree'],
              ['3','树形DP','动态规划','★★★★☆','tpl-tree-dp'],
              ['4','最短路Dijkstra','图论','★★★★☆','tpl-shortest'],
              ['5','并查集','图论','★★★★☆','tpl-dsu'],
              ['6','背包DP','动态规划','★★★★☆','tpl-knapsack'],
              ['7','前缀和/差分','基础算法','★★★★☆','tpl-prefix'],
              ['8','BFS/DFS','基础算法','★★★★☆','tpl-bfs'],
              ['9','Tarjan缩点','图论','★★★☆☆','tpl-tarjan'],
              ['10','状压DP','动态规划','★★★☆☆','tpl-bitmask-dp']
            ].map(r => `
              <tr>
                <td class="pid">${r[0]}</td>
                <td class="pname">${r[1]}</td>
                <td><span class="tag">${r[2]}</span></td>
                <td>${r[3]}</td>
                <td><a class="btn btn-sm" onclick="CSP.go('templates#${r[4]}')">查看模板</a></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
    `;
  }

  // ============================ 渲染：模板速查 ============================
  function renderTemplates() {
    let filtered = T;
    if (state.filterCat !== 'all') {
      filtered = filtered.filter(t => t.cat === state.filterCat);
    }
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q) ||
        t.cat.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q)
      );
    }

    // 检查是否有锚点跳转到特定模板
    const hashParts = location.hash.split('#');
    const targetId = hashParts[2];

    let html = `
    <div class="crumb"><a onclick="CSP.go('home')">首页</a> / <b>模板速查</b></div>

    <div class="panel">
      <div class="panel-hd"><span class="dot"></span>筛选</div>
      <div class="panel-bd">
        <div class="flex flex-wrap" style="gap:8px;">
          <span class="chip ${state.filterCat==='all'?'on':''}" onclick="CSP.setFilter('all')">全部 (${T.length})</span>
          ${CATS.map(c => `
            <span class="chip ${state.filterCat===c?'on':''}" onclick="CSP.setFilter('${c}')">${CAT_ICONS[c]||''} ${c} (${T.filter(t=>t.cat===c).length})</span>
          `).join('')}
        </div>
      </div>
    </div>
    `;

    if (filtered.length === 0) {
      html += `<div class="empty">没有找到匹配的模板，试试其他关键词？</div>`;
      return html;
    }

    // 按分类分组
    const grouped = {};
    filtered.forEach(t => {
      if (!grouped[t.cat]) grouped[t.cat] = [];
      grouped[t.cat].push(t);
    });

    CATS.forEach(cat => {
      if (!grouped[cat]) return;
      const items = grouped[cat];
      html += `
      <div class="category" id="cat-${cat}">
        <div class="category-header">
          <span class="cat-icon" style="background:rgba(232,168,56,.1);color:var(--cyan);">${CAT_ICONS[cat]||'•'}</span>
          ${cat}
          <span class="cat-count">${items.length} 个模板</span>
        </div>
        <div class="knowledge-grid">
          ${items.map(t => `
            <div class="knowledge-card" id="${t.id}">
              <h3>
                ${t.name}
                <span class="difficulty diff-${t.diff}">${t.diff}</span>
                <button class="fav-btn ${isFavorite(t.id) ? 'fav-on' : ''}" onclick="CSP.toggleFavorite('${t.id}')" title="收藏">${isFavorite(t.id) ? '*' : '☆'}</button>
              </h3>
              <div class="desc">${t.desc}</div>
              <div class="code-block">
                <button class="copy-btn" onclick="CSP.copy(this, '${t.id}')">复制</button>
                <button class="copy-btn" onclick="CSP.downloadCode('${t.id}')" style="right:60px;">下载</button>
                <pre id="code-${t.id}">${highlightCode(t.code)}</pre>
              </div>
              ${t.problems && t.problems.length ? `
                <div class="mt" style="display:flex;gap:4px;flex-wrap:wrap;">
                  <span class="tag know">相关题目</span>
                  ${t.problems.map(p => `<span class="tag">${p}</span>`).join('')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
      `;
    });

    return html;
  }

  // ============================ 渲染：真题对比 ============================
  // 分类到可视化模块的映射
  const catToDemoModule = {
    '基础算法': 'sort', '数据结构': 'segtree', '图论': 'dijkstra',
    '动态规划': 'knap', '数学': 'sort', '字符串': 'lcs', '树论': 'tree'
  };
  // 当前选中的题目
  let currentProblemId = null;

  function renderProblems() {
    // 按年份分组
    const byYear = {};
    PROBLEMS.forEach(p => { if (!byYear[p.year]) byYear[p.year] = []; byYear[p.year].push(p); });
    const years = Object.keys(byYear).sort((a, b) => b - a);
    // 默认选中第一道题
    if (!currentProblemId || !PROBLEMS.find(p => p.id === currentProblemId)) {
      currentProblemId = PROBLEMS[0]?.id;
    }
    const current = PROBLEMS.find(p => p.id === currentProblemId);
    const relatedTpl = current ? T.find(t => t.cat === current.cat) : null;
    const demoModule = current ? (catToDemoModule[current.cat] || 'sort') : 'sort';

    return `
    <div class="crumb"><a onclick="CSP.go('home')">首页</a> / <b>真题对比</b></div>

    <div class="problem-split-layout">
      <!-- 左侧：题目列表 -->
      <div class="problem-list-panel">
        <div class="problem-list-header">
          <span>EX 题目列表</span>
          <span class="problem-count">${PROBLEMS.length} 道</span>
        </div>
        <div class="problem-list-body">
          ${years.map(y => `
            <div class="problem-year-group">
              <div class="problem-year-label" onclick="CSP.toggleYearGroup('${y}')">
                <span class="year-arrow">▾</span> ${y}年
                <span class="year-count">${byYear[y].length}</span>
              </div>
              <div class="problem-year-items" id="year-items-${y}">
                ${byYear[y].map(p => `
                  <div class="problem-list-item ${p.id === currentProblemId ? 'active' : ''}" onclick="CSP.selectProblem('${p.id}')">
                    <span class="pli-title">${p.title}</span>
                    <span class="difficulty diff-${p.diff}">${p.diff}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 右侧：题目详情 -->
      <div class="problem-detail-panel">
        ${current ? `
          <div class="problem-detail-header">
            <h2>${current.title}</h2>
            <div class="problem-detail-meta">
              <span class="tag">${current.year}年</span>
              <span class="tag">${current.cat}</span>
              <span class="difficulty diff-${current.diff}">${current.diff}</span>
              <button class="fav-btn ${isFavorite(current.id) ? 'fav-on' : ''}" onclick="CSP.toggleFavorite('${current.id}')">${isFavorite(current.id) ? '* 已收藏' : '☆ 收藏'}</button>
            </div>
          </div>

          <div class="problem-detail-section">
            <div class="ps-label"> 题目描述</div>
            <div class="ps-content">${current.desc}</div>
          </div>

          <div class="problem-detail-section">
            <div class="ps-label"> 输入格式</div>
            <div class="ps-content">${current.input}</div>
          </div>

          <div class="problem-detail-section">
            <div class="ps-label"> 输出格式</div>
            <div class="ps-content">${current.output}</div>
          </div>

          <div class="problem-detail-section">
            <div class="ps-label"> 样例</div>
            <pre class="ps-sample">${current.sample}</pre>
          </div>

          <div class="problem-detail-section">
            <div class="ps-label"> 参考代码</div>
            <div class="code-block">
              <button class="copy-btn" onclick="CSP.copyProblem(this, '${current.id}')">复制</button>
              <button class="copy-btn" onclick="CSP.downloadProblem('${current.id}')" style="right:60px;">下载</button>
              <pre>${highlightCode(current.code)}</pre>
            </div>
          </div>

          <div class="problem-demo-bar">
            <button class="btn btn-sm btn-primary" onclick="CSP.demoProblem('${demoModule}')">▶ 自动演示算法</button>
            <span class="demo-hint">关联可视化: ${demoModule}</span>
          </div>

          ${relatedTpl ? `
          <div class="problem-compare">
            <div class="pc-header"> 对比模板：${relatedTpl.name}</div>
            <div class="pc-body">
              <div class="pc-col">
                <div class="pc-title">真题代码</div>
                <pre class="pc-code">${highlightCode(current.code.substring(0, 600))}${current.code.length > 600 ? '\n...' : ''}</pre>
              </div>
              <div class="pc-col">
                <div class="pc-title">通用模板</div>
                <pre class="pc-code">${highlightCode(relatedTpl.code.substring(0, 600))}${relatedTpl.code.length > 600 ? '\n...' : ''}</pre>
              </div>
            </div>
            <button class="btn btn-sm" onclick="CSP.go('templates#${relatedTpl.id}')">查看完整模板 →</button>
          </div>
          ` : ''}
        ` : '<div class="problem-empty">请从左侧选择一道题目</div>'}
      </div>
    </div>`;
  }

  function selectProblem(id) {
    currentProblemId = id;
    render();
  }
  function toggleYearGroup(year) {
    const el = $(`#year-items-${year}`);
    if (el) {
      el.style.display = el.style.display === 'none' ? 'block' : 'none';
      const arrow = el.previousElementSibling?.querySelector('.year-arrow');
      if (arrow) arrow.textContent = el.style.display === 'none' ? '▸' : '▾';
    }
  }

  function demoProblem(module) {
    // 跳转到对应的可视化页面并启动自动演示
    const viewMap = {
      sort: 'visualizer', dijkstra: 'visualizer', uf: 'visualizer', topo: 'visualizer',
      array: 'dataviz', stack: 'dataviz', queue: 'dataviz', tree: 'dataviz',
      heap: 'dataviz', monostack: 'dataviz', monoqueue: 'dataviz', segtree: 'dataviz',
      lis: 'dpviz', lcs: 'dpviz', knap: 'dpviz', idp: 'dpviz'
    };
    const view = viewMap[module] || 'visualizer';
    // 设置对应的tab
    if (module === 'dijkstra') vizState.algoTab = 'dijkstra';
    else if (module === 'uf') vizState.algoTab = 'unionfind';
    else if (module === 'topo') vizState.algoTab = 'topo';
    else if (module === 'sort') vizState.algoTab = 'sort';
    else if (['array','stack','queue','tree','heap','monostack','monoqueue','segtree'].includes(module)) dataVizState.tab = module;
    else if (module === 'lis') dpVizState.tab = 'lis';
    else if (module === 'lcs') dpVizState.tab = 'lcs';
    else if (module === 'knap') dpVizState.tab = 'knapsack';
    else if (module === 'idp') dpVizState.tab = 'interval';
    CSP.go(view);
    setTimeout(() => autoDemoStart(module), 300);
  }

  function copyProblem(btn, id) {
    const p = PROBLEMS.find(x => x.id === id);
    if (p) copyCode(p.code, btn);
  }
  function downloadProblem(id) {
    const p = PROBLEMS.find(x => x.id === id);
    if (!p) return;
    const blob = new Blob([p.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${id}.cpp`; a.click();
    URL.revokeObjectURL(url);
    showToast(`已下载 ${id}.cpp`, 'success');
  }

  // ============================ 渲染：考试策略 ============================
  function renderStrategy() {
    return `
    <div class="crumb"><a onclick="CSP.go('home')">首页</a> / <b>考场策略</b></div>

    <div class="panel">
      <div class="panel-hd"><span class="dot"></span>时间分配策略</div>
      <div class="panel-bd">
        <table class="tbl">
          <thead><tr><th>时间段</th><th>任务</th><th>目标</th></tr></thead>
          <tbody>
            <tr><td>0:00-0:15</td><td>通读4题，判断难度和类型</td><td>确定做题顺序</td></tr>
            <tr><td>0:15-1:05</td><td>T1（最简单题）</td><td>争取100分</td></tr>
            <tr><td>1:05-1:55</td><td>T2</td><td>争取60-100分</td></tr>
            <tr><td>1:55-2:45</td><td>T3</td><td>争取30-60分</td></tr>
            <tr><td>2:45-3:20</td><td>T4</td><td>争取10-30分（暴力）</td></tr>
            <tr><td>3:20-3:30</td><td>检查、对拍、文件操作</td><td>确保不丢冤枉分</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="panel">
      <div class="panel-hd"><span class="dot"></span>部分分策略</div>
      <div class="panel-bd">
        <div class="tip-box success"><strong>10分：</strong>特殊性质/样例。读懂题，写个能过样例的就行。</div>
        <div class="tip-box"><strong>30分：</strong>暴力枚举/搜索。O(n²)或O(2^n)在小数据上跑。</div>
        <div class="tip-box"><strong>60分：</strong>部分正确算法。可能时间复杂度不够优，或只处理部分情况。</div>
        <div class="tip-box warning"><strong>100分：</strong>正解。需要正确的算法+优化的复杂度+边界处理。</div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-hd"><span class="dot"></span>常见错误清单</div>
      <div class="panel-bd">
        <table class="tbl">
          <thead><tr><th>类型</th><th>错误</th><th>防范</th></tr></thead>
          <tbody>
            <tr><td>数组</td><td>数组开小导致RE</td><td>MAXN开到题目上限+5</td></tr>
            <tr><td>类型</td><td>int溢出，答案应为long long</td><td>涉及乘法/大数一律用long long</td></tr>
            <tr><td>文件</td><td>freopen文件名写错</td><td>仔细核对题目要求的文件名</td></tr>
            <tr><td>边界</td><td>n=0或n=1的特殊情况</td><td>手动验证边界数据</td></tr>
            <tr><td>初始化</td><td>多组数据未清空数组</td><td>每组数据前memset或重新赋值</td></tr>
            <tr><td>图论</td><td>建反边/无向边忘记加两条</td><td>addEdge(u,v,w); addEdge(v,u,w);</td></tr>
            <tr><td>DP</td><td>状态转移方程写错</td><td>用小数据手动验证转移</td></tr>
            <tr><td>取模</td><td>忘记取模或取模位置错误</td><td>每次加法/乘法后立即取模</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="panel">
      <div class="panel-hd"><span class="dot"></span>对拍流程</div>
      <div class="panel-bd">
        <div class="tip-box"><strong>步骤1：</strong>写暴力程序（保证正确但慢）</div>
        <div class="tip-box"><strong>步骤2：</strong>写正解程序（可能有问题但快）</div>
        <div class="tip-box"><strong>步骤3：</strong>写数据生成器（随机生成测试数据）</div>
        <div class="tip-box"><strong>步骤4：</strong>循环：生成数据→跑暴力→跑正解→比较结果</div>
        <div class="tip-box danger"><strong>注意：</strong>对拍发现不一致时，优先检查暴力是否正确，再检查正解！</div>
      </div>
    </div>
    `;
  }

  // ============================ 渲染：知识星图 ============================
  function renderStarmap() {
    return `
    <div class="crumb"><a onclick="CSP.go('home')">首页</a> / <b>知识星图</b></div>

    <div class="panel">
      <div class="panel-hd"><span class="dot"></span>CSP-S 知识体系全景</div>
      <div class="panel-bd">
        <p style="color:var(--text-2);font-size:14px;margin-bottom:16px;">以下为CSP-S第二轮常考知识点的完整体系，点击任意节点可跳转到对应模板。</p>
        ${CATS.map(cat => {
          const items = T.filter(t => t.cat === cat);
          return `
          <div class="category" id="star-${cat}">
            <div class="category-header">
              <span class="cat-icon" style="background:rgba(232,168,56,.1);color:var(--cyan);">${CAT_ICONS[cat]||'•'}</span>
              ${cat}
              <span class="cat-count">${items.length} 个知识点</span>
            </div>
            <div class="grid g3">
              ${items.map(t => `
                <div class="knowledge-card" style="cursor:pointer;" onclick="CSP.go('templates#${t.id}')">
                  <h3>${t.name} <span class="difficulty diff-${t.diff}">${t.diff}</span></h3>
                  <div class="desc">${t.desc}</div>
                </div>
              `).join('')}
            </div>
          </div>
          `;
        }).join('')}
      </div>
    </div>
    `;
  }

  // ============================ 主题切换 ============================
  const THEME_KEY = 'csp_theme';

  function loadTheme() {
    try {
      const theme = localStorage.getItem(THEME_KEY) || 'dark';
      if (theme === 'light') {
        document.body.classList.add('light-theme');
        const btn = $('#theme-toggle');
        if (btn) btn.textContent = '';
      }
    } catch (e) {}
  }

  function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    const btn = $('#theme-toggle');
    if (btn) btn.textContent = isLight ? '' : '';
    try { localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark'); } catch (e) {}
  }

  // ============================ 学习进度 ============================
  const PROGRESS_KEY = 'csp_progress';

  function loadProgress() {
    try {
      return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
    } catch (e) { return {}; }
  }

  function saveProgress(progress) {
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)); } catch (e) {}
  }

  function setMastery(id, level) {
    const progress = loadProgress();
    progress[id] = level; // 0=未学, 1=了解, 2=掌握, 3=精通
    saveProgress(progress);
  }

  function getMastery(id) {
    const progress = loadProgress();
    return progress[id] || 0;
  }

  function renderProgress() {
    const progress = loadProgress();
    const levels = ['未学', '了解', '掌握', '精通'];
    const colors = ['var(--text-3)', 'var(--yellow)', 'var(--cyan)', 'var(--green)'];

    let totalMastery = 0;
    let learnedCount = 0;
    T.forEach(t => {
      const m = progress[t.id] || 0;
      if (m > 0) learnedCount++;
      totalMastery += m;
    });
    const overallPct = Math.round(totalMastery / (T.length * 3) * 100);

    // 按分类统计
    const catStats = {};
    CATS.forEach(c => {
      const items = T.filter(t => t.cat === c);
      let mSum = 0;
      items.forEach(t => { mSum += (progress[t.id] || 0); });
      catStats[c] = { total: items.length, mastery: mSum, pct: Math.round(mSum / (items.length * 3) * 100) };
    });

    const catIcons = {
      '基础算法': 'AL', '图论': 'GR', '树论': 'TR', '动态规划': 'DP',
      '数学': 'MA', '字符串': 'ST', '数据结构': 'DS', '考试模板': 'EX'
    };

    return `
    <div class="crumb"><a onclick="CSP.go('home')">首页</a> / <b>学习进度</b></div>

    <div class="panel">
      <div class="panel-hd"><span class="dot"></span>总体进度</div>
      <div class="panel-bd">
        <div style="display:flex;align-items:center;gap:24px;flex-wrap:wrap;">
          <div class="progress-ring">
            <svg width="80" height="80">
              <circle class="ring-bg" cx="40" cy="40" r="34" fill="none" stroke-width="6"/>
              <circle class="ring-fg" cx="40" cy="40" r="34" fill="none" stroke-width="6"
                stroke-dasharray="${2 * Math.PI * 34}"
                stroke-dashoffset="${2 * Math.PI * 34 * (1 - overallPct / 100)}"/>
            </svg>
            <span class="ring-label">${overallPct}%</span>
          </div>
          <div>
            <div style="font-size:18px;font-weight:700;color:var(--text);">备考掌握度</div>
            <div style="font-size:13px;color:var(--text-2);margin-top:4px;">
              已学习 <b style="color:var(--cyan);">${learnedCount}</b> / ${T.length} 个知识点
            </div>
            <div style="font-size:13px;color:var(--text-2);">
              总掌握分 <b style="color:var(--green);">${totalMastery}</b> / ${T.length * 3}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-hd"><span class="dot"></span>分类掌握度</div>
      <div class="panel-bd">
        <div class="grid g2">
          ${CATS.map(c => `
            <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--panel-2);border-radius:var(--radius-sm);border:1px solid var(--border);">
              <span style="font-size:20px;">${catIcons[c]||'•'}</span>
              <div style="flex:1;">
                <div style="font-size:14px;font-weight:600;color:var(--text);">${c}</div>
                <div class="bar" style="margin-top:6px;">
                  <i style="width:${catStats[c].pct}%;"></i>
                </div>
              </div>
              <span style="font-family:var(--mono);font-size:14px;font-weight:700;color:var(--cyan);">${catStats[c].pct}%</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-hd"><span class="dot"></span>知识点掌握详情</div>
      <div class="panel-bd">
        <table class="tbl">
          <thead><tr><th>知识点</th><th>分类</th><th>难度</th><th>掌握度</th><th>操作</th></tr></thead>
          <tbody>
            ${T.map(t => {
              const m = progress[t.id] || 0;
              return `
              <tr>
                <td class="pname">${t.name}</td>
                <td><span class="tag">${t.cat}</span></td>
                <td><span class="difficulty diff-${t.diff}">${t.diff}</span></td>
                <td>
                  <span style="color:${colors[m]};font-weight:600;font-size:12px;">${levels[m]}</span>
                </td>
                <td>
                  <div style="display:flex;gap:4px;">
                    ${[1,2,3].map(l => `
                      <button class="btn btn-sm" style="padding:2px 8px;font-size:11px;${m===l?'background:var(--cyan);color:var(--bg);border-color:var(--cyan);':''}"
                        onclick="CSP.setMastery('${t.id}', ${l})">${levels[l]}</button>
                    `).join('')}
                    ${m > 0 ? `<button class="btn btn-sm btn-danger" style="padding:2px 8px;font-size:11px;" onclick="CSP.setMastery('${t.id}', 0)">重置</button>` : ''}
                  </div>
                </td>
              </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
    `;
  }

  // ============================ 闪卡测验 ============================
  const flashcardState = { current: 0, order: [], flipped: false, correct: 0, total: 0 };

  function initFlashcards() {
    flashcardState.order = [...T].sort(() => Math.random() - 0.5);
    flashcardState.current = 0;
    flashcardState.flipped = false;
    flashcardState.correct = 0;
    flashcardState.total = 0;
  }

  function renderFlashcard() {
    if (flashcardState.order.length === 0) initFlashcards();
    const card = flashcardState.order[flashcardState.current];
    if (!card) return '<div class="empty">没有闪卡数据</div>';

    const catIcons = {
      '基础算法': 'AL', '图论': 'GR', '树论': 'TR', '动态规划': 'DP',
      '数学': 'MA', '字符串': 'ST', '数据结构': 'DS', '考试模板': 'EX'
    };

    return `
    <div class="crumb"><a onclick="CSP.go('home')">首页</a> / <b>闪卡测验</b></div>

    <div class="panel">
      <div class="panel-hd"><span class="dot"></span>闪卡测验 · 第 ${flashcardState.current + 1} / ${flashcardState.order.length} 张</div>
      <div class="panel-bd" style="display:flex;flex-direction:column;align-items:center;gap:16px;">
        <div style="display:flex;gap:12px;font-size:13px;">
          <span style="color:var(--green);">✓ 正确: ${flashcardState.correct}</span>
          <span style="color:var(--text-3);">总计: ${flashcardState.total}</span>
          <span style="color:var(--cyan);">正确率: ${flashcardState.total > 0 ? Math.round(flashcardState.correct / flashcardState.total * 100) : 0}%</span>
        </div>

        <div class="flashcard ${flashcardState.flipped ? 'flipped' : ''}" onclick="CSP.flipCard()">
          <div class="flashcard-inner">
            <div class="flashcard-front">
              <span class="cat-label">${catIcons[card.cat]||'•'} ${card.cat} · ${card.diff}</span>
              <h3>${card.name}</h3>
              <span style="font-size:12px;color:var(--text-3);margin-top:8px;">点击翻转查看答案</span>
            </div>
            <div class="flashcard-back">
              <div class="answer">${card.desc}</div>
              <div class="code-snippet"><pre>${highlightCode(card.code.substring(0, 300))}${card.code.length > 300 ? '\n...' : ''}</pre></div>
            </div>
          </div>
        </div>

        <div style="display:flex;gap:8px;">
          <button class="btn btn-danger" onclick="CSP.markCard(false)">✗ 不会</button>
          <button class="btn" onclick="CSP.flipCard()">↻ 翻转</button>
          <button class="btn btn-primary" onclick="CSP.markCard(true)">✓ 会了</button>
          <button class="btn" onclick="CSP.nextCard()">⏭ 下一张</button>
        </div>
      </div>
    </div>
    `;
  }

  // ============================ 复杂度速查 ============================
  function renderComplexity() {
    const data = [
      { name: '前缀和/差分', cat: '基础算法', complexity: 'O(n)', cls: 'c3', pct: 25 },
      { name: '二分查找/答案', cat: '基础算法', complexity: 'O(log n)', cls: 'c2', pct: 10 },
      { name: 'BFS/DFS', cat: '基础算法', complexity: 'O(V+E)', cls: 'c3', pct: 25 },
      { name: '排序（快排/归并）', cat: '基础算法', complexity: 'O(n log n)', cls: 'c4', pct: 40 },
      { name: 'Dijkstra+堆', cat: '图论', complexity: 'O((V+E) log V)', cls: 'c4', pct: 40 },
      { name: 'Floyd', cat: '图论', complexity: 'O(V³)', cls: 'c5', pct: 70 },
      { name: 'Kruskal', cat: '图论', complexity: 'O(E log E)', cls: 'c4', pct: 40 },
      { name: 'Tarjan SCC', cat: '图论', complexity: 'O(V+E)', cls: 'c3', pct: 25 },
      { name: 'LCA倍增', cat: '图论', complexity: 'O(n log n)预处理+O(log n)查询', cls: 'c4', pct: 40 },
      { name: '树状数组', cat: '树论', complexity: 'O(log n)', cls: 'c2', pct: 10 },
      { name: '线段树', cat: '树论', complexity: 'O(log n)', cls: 'c2', pct: 10 },
      { name: '树链剖分', cat: '树论', complexity: 'O(log²n)', cls: 'c2', pct: 15 },
      { name: 'Trie', cat: '树论', complexity: 'O(L)', cls: 'c2', pct: 10 },
      { name: '线性DP（LIS/LCS）', cat: '动态规划', complexity: 'O(n²) / O(n log n)', cls: 'c5', pct: 60 },
      { name: '背包DP', cat: '动态规划', complexity: 'O(nW)', cls: 'c4', pct: 40 },
      { name: '区间DP', cat: '动态规划', complexity: 'O(n³)', cls: 'c5', pct: 70 },
      { name: '树形DP', cat: '动态规划', complexity: 'O(n)', cls: 'c3', pct: 25 },
      { name: '状压DP', cat: '动态规划', complexity: 'O(2^n · n)', cls: 'c6', pct: 90 },
      { name: '数位DP', cat: '动态规划', complexity: 'O(位数×状态)', cls: 'c3', pct: 25 },
      { name: '快速幂', cat: '数学', complexity: 'O(log n)', cls: 'c2', pct: 10 },
      { name: '欧拉筛', cat: '数学', complexity: 'O(n)', cls: 'c3', pct: 25 },
      { name: 'KMP', cat: '字符串', complexity: 'O(n+m)', cls: 'c3', pct: 25 },
      { name: 'AC自动机', cat: '字符串', complexity: 'O(n+m)', cls: 'c3', pct: 25 },
      { name: '莫队算法', cat: '数据结构', complexity: 'O(n√n)', cls: 'c4', pct: 45 },
      { name: '分块', cat: '数据结构', complexity: 'O(n√n)', cls: 'c4', pct: 45 },
      { name: 'ST表', cat: '数据结构', complexity: 'O(n log n)预处理+O(1)查询', cls: 'c4', pct: 40 },
    ];

    const legend = [
      { label: 'O(1)', cls: 'c1', desc: '常数时间' },
      { label: 'O(log n)', cls: 'c2', desc: '对数时间' },
      { label: 'O(n)', cls: 'c3', desc: '线性时间' },
      { label: 'O(n log n)', cls: 'c4', desc: '线性对数' },
      { label: 'O(n²)/O(n³)', cls: 'c5', desc: '多项式' },
      { label: 'O(2^n)', cls: 'c6', desc: '指数级' },
    ];

    return `
    <div class="crumb"><a onclick="CSP.go('home')">首页</a> / <b>复杂度速查</b></div>

    <div class="panel">
      <div class="panel-hd"><span class="dot"></span>复杂度图例</div>
      <div class="panel-bd">
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          ${legend.map(l => `
            <div style="display:flex;align-items:center;gap:6px;">
              <span class="bar-fill ${l.cls}" style="width:30px;height:16px;border-radius:3px;display:inline-block;"></span>
              <span style="font-size:12px;color:var(--text-2);">${l.label} - ${l.desc}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-hd"><span class="dot"></span>算法复杂度对比</div>
      <div class="panel-bd">
        ${data.map(d => `
          <div class="complexity-bar">
            <span class="label">${d.name}</span>
            <div class="bar-track">
              <div class="bar-fill ${d.cls}" style="width:${d.pct}%;">${d.complexity}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="panel">
      <div class="panel-hd"><span class="dot"></span>复杂度选择建议</div>
      <div class="panel-bd">
        <table class="tbl">
          <thead><tr><th>数据规模</th><th>安全复杂度</th><th>可用算法</th></tr></thead>
          <tbody>
            <tr><td>n ≤ 10</td><td>O(n!) / O(2^n)</td><td>暴力枚举、状压DP</td></tr>
            <tr><td>n ≤ 20</td><td>O(2^n · n)</td><td>状压DP、折半搜索</td></tr>
            <tr><td>n ≤ 100</td><td>O(n³)</td><td>区间DP、Floyd</td></tr>
            <tr><td>n ≤ 1000</td><td>O(n²)</td><td>朴素DP、矩阵操作</td></tr>
            <tr><td>n ≤ 10⁵</td><td>O(n log n)</td><td>排序、线段树、二分</td></tr>
            <tr><td>n ≤ 10⁶</td><td>O(n)</td><td>线性扫描、前缀和、BFS</td></tr>
            <tr><td>n ≤ 10⁹</td><td>O(log n) / O(1)</td><td>数学公式、快速幂</td></tr>
          </tbody>
        </table>
      </div>
    </div>
    `;
  }

  // ============================ 知识图谱 SVG ============================
  // ============================ 知识点→可视化模块映射 ============================
  const tplToVizMap = {
    // 基础算法
    'tpl-binary': 'sort', 'tpl-prefix': 'array', 'tpl-diff': 'array',
    'tpl-bfs': 'sort', 'tpl-dfs': 'sort', 'tpl-discretize': 'sort', 'tpl-greedy': 'sort',
    // 图论
    'tpl-graph-store': 'tree', 'tpl-toposort': 'topo', 'tpl-dsu': 'uf',
    'tpl-mst': 'dijkstra', 'tpl-shortest': 'dijkstra', 'tpl-tarjan': 'dijkstra',
    'tpl-lca': 'tree', 'tpl-diff-constraint': 'dijkstra', 'tpl-bipartite': 'dijkstra',
    'tpl-spfa': 'dijkstra',
    // 树论
    'tpl-bit': 'segtree', 'tpl-segtree': 'segtree', 'tpl-trie': 'tree',
    'tpl-hld': 'tree', 'tpl-tree-diff': 'tree',
    // 动态规划
    'tpl-linear-dp': 'lis', 'tpl-knapsack': 'knap', 'tpl-interval-dp': 'idp',
    'tpl-tree-dp': 'tree', 'tpl-bitmask-dp': 'knap', 'tpl-monoqueue-dp': 'monoqueue',
    'tpl-digit-dp': 'knap',
    // 数学
    'tpl-qpow': 'sort', 'tpl-gcd': 'sort', 'tpl-prime-sieve': 'sort', 'tpl-comb': 'sort',
    // 字符串
    'tpl-kmp': 'lcs', 'tpl-strhash': 'lcs', 'tpl-acauto': 'lcs',
    // 数据结构
    'tpl-st': 'segtree', 'tpl-monostack': 'monostack', 'tpl-heap': 'heap',
    'tpl-moalgo': 'segtree', 'tpl-block': 'segtree',
    // 考试模板
    'tpl-skeleton': 'sort', 'tpl-datagen': 'sort'
  };
  // 分类→默认可视化模块（点击分类节点时使用）
  const catToVizDefault = {
    '基础算法': 'sort', '图论': 'dijkstra', '树论': 'tree',
    '动态规划': 'knap', '数学': 'sort', '字符串': 'lcs',
    '数据结构': 'segtree', '考试模板': 'sort'
  };
  function vizFromTpl(tplId) { return tplToVizMap[tplId] || null; }
  function vizFromCat(cat) { return catToVizDefault[cat] || 'sort'; }

  function renderGraph() {
    const catIcons = {
      '基础算法': 'AL', '图论': 'GR', '树论': 'TR', '动态规划': 'DP',
      '数学': 'MA', '字符串': 'ST', '数据结构': 'DS', '考试模板': 'EX'
    };
    const catColors = {
      '基础算法': '#e8a838', '图论': '#d4574a', '树论': '#7da868',
      '动态规划': '#d4843e', '数学': '#c8902e', '字符串': '#b0453a',
      '数据结构': '#6a9456', '考试模板': '#9a9488'
    };

    // 构建图数据
    const nodes = [{ id: 'center', label: 'CSP-S', type: 'core', r: 28, color: '#e8a838', cat: '' }];
    const edges = [];
    CATS.forEach(cat => {
      nodes.push({ id: `cat-${cat}`, label: cat, type: 'cat', r: 18, color: catColors[cat], cat });
      edges.push({ from: 'center', to: `cat-${cat}` });
      T.filter(t => t.cat === cat).forEach(item => {
        nodes.push({ id: item.id, label: item.name, type: 'leaf', r: 6, color: catColors[cat], tplId: item.id, cat });
        edges.push({ from: `cat-${cat}`, to: item.id });
      });
    });

    return `
    <div class="crumb"><a onclick="CSP.go('home')">首页</a> / <b>知识星图</b></div>

    <div class="panel">
      <div class="panel-hd"><span class="dot"></span>CSP-S 知识星图 · 力导向交互图</div>
      <div class="panel-bd">
        <p style="color:var(--text-2);font-size:13px;margin-bottom:12px;">
           拖拽节点重新布局 · 悬停高亮关联边 · <b style="color:var(--cyan);">点击任意知识点查看可视化演示</b> · 滚轮缩放
        </p>
        <div class="starmap-canvas" id="starmap-canvas">
          <svg class="starmap-svg" id="starmap-svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
            <defs>
              <radialGradient id="nodeGlow">
                <stop offset="0%" stop-color="rgba(232,168,56,.4)"/>
                <stop offset="100%" stop-color="rgba(232,168,56,0)"/>
              </radialGradient>
              <filter id="glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            <g id="starmap-viewport">
              <g id="starmap-links"></g>
              <g id="starmap-nodes"></g>
            </g>
          </svg>
          <div class="starmap-controls">
            <button class="btn btn-sm" onclick="CSP.starmapTogglePlay()" id="starmap-play-btn">⏸ 暂停</button>
            <button class="btn btn-sm" onclick="CSP.starmapReset()">↻ 重置</button>
            <button class="btn btn-sm" onclick="CSP.starmapZoom(1.2)">+</button>
            <button class="btn btn-sm" onclick="CSP.starmapZoom(0.8)">−</button>
          </div>
          <div class="starmap-legend">
            ${Object.entries(catColors).map(([cat, color]) => `
              <div class="starmap-legend-item">
                <span class="starmap-legend-dot" style="background:${color}"></span>${cat}
              </div>
            `).join('')}
          </div>
          <div class="starmap-tooltip" id="starmap-tooltip"></div>
        </div>
        <div style="margin-top:8px;font-size:11px;color:var(--text-3);font-family:var(--mono);">
          节点数: ${nodes.length} · 边数: ${edges.length} · 物理模拟运行中
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-hd"><span class="dot"></span>分类详情</div>
      <div class="panel-bd">
        ${CATS.map(cat => {
          const items = T.filter(t => t.cat === cat);
          return `
          <div class="category" id="star-${cat}">
            <div class="category-header">
              <span class="cat-icon" style="background:rgba(232,168,56,.1);color:var(--cyan);">${catIcons[cat]||'•'}</span>
              ${cat}
              <span class="cat-count">${items.length} 个知识点</span>
            </div>
            <div class="grid g3">
              ${items.map(t => {
                const vizMod = vizFromTpl(t.id) || vizFromCat(cat);
                return `
                <div class="knowledge-card" style="cursor:pointer;">
                  <h3>${t.name} <span class="difficulty diff-${t.diff}">${t.diff}</span></h3>
                  <div class="desc">${t.desc}</div>
                  <div class="card-actions">
                    <button class="btn btn-sm btn-primary" onclick="event.stopPropagation();CSP.demoProblem('${vizMod}')">▶ 可视化</button>
                    <button class="btn btn-sm" onclick="event.stopPropagation();CSP.go('templates#${t.id}')">EX 模板</button>
                  </div>
                </div>
                `;
              }).join('')}
            </div>
          </div>
          `;
        }).join('')}
      </div>
    </div>
    <script>
      (function(){
        const nodes = ${JSON.stringify(nodes.map(n => ({...n, x: 400 + (Math.random()-0.5)*300, y: 300 + (Math.random()-0.5)*200, vx: 0, vy: 0})))};
        const edges = ${JSON.stringify(edges)};
        const nodeMap = {}; nodes.forEach(n => nodeMap[n.id] = n);
        const svg = document.getElementById('starmap-svg');
        const linksG = document.getElementById('starmap-links');
        const nodesG = document.getElementById('starmap-nodes');
        const viewport = document.getElementById('starmap-viewport');
        const tooltip = document.getElementById('starmap-tooltip');
        const canvas = document.getElementById('starmap-canvas');
        let playing = true;
        let scale = 1, offsetX = 0, offsetY = 0;
        let dragNode = null, isPanning = false, panStart = {x:0,y:0};

        // 力模拟参数
        const REPULSION = 3000;
        const SPRING = 0.04;
        const DAMPING = 0.85;
        const CENTER_GRAVITY = 0.005;
        const CX = 400, CY = 300;

        function simulate() {
          if (!playing) return;
          // 排斥力
          for (let i = 0; i < nodes.length; i++) {
            for (let j = i+1; j < nodes.length; j++) {
              const a = nodes[i], b = nodes[j];
              let dx = a.x - b.x, dy = a.y - b.y;
              let dist = Math.sqrt(dx*dx + dy*dy) || 1;
              const force = REPULSION / (dist * dist);
              const fx = (dx / dist) * force;
              const fy = (dy / dist) * force;
              a.vx += fx; a.vy += fy;
              b.vx -= fx; b.vy -= fy;
            }
          }
          // 弹簧力
          edges.forEach(e => {
            const a = nodeMap[e.from], b = nodeMap[e.to];
            let dx = b.x - a.x, dy = b.y - a.y;
            let dist = Math.sqrt(dx*dx + dy*dy) || 1;
            const targetDist = a.type === 'core' ? 150 : a.type === 'cat' ? 60 : 40;
            const force = (dist - targetDist) * SPRING;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            a.vx += fx; a.vy += fy;
            b.vx -= fx; b.vy -= fy;
          });
          // 中心引力 + 更新位置
          nodes.forEach(n => {
            if (n === dragNode) return;
            n.vx += (CX - n.x) * CENTER_GRAVITY;
            n.vy += (CY - n.y) * CENTER_GRAVITY;
            n.vx *= DAMPING; n.vy *= DAMPING;
            n.x += n.vx; n.y += n.vy;
          });
        }

        function render() {
          // 边
          let linkHtml = '';
          edges.forEach(e => {
            const a = nodeMap[e.from], b = nodeMap[e.to];
            linkHtml += '<line class="starmap-link" x1="'+a.x.toFixed(1)+'" y1="'+a.y.toFixed(1)+'" x2="'+b.x.toFixed(1)+'" y2="'+b.y.toFixed(1)+'" data-from="'+e.from+'" data-to="'+e.to+'"/>';
          });
          linksG.innerHTML = linkHtml;
          // 节点
          let nodeHtml = '';
          nodes.forEach(n => {
            const esc = n.label.replace(/"/g,'&quot;').replace(/</g,'&lt;');
            if (n.type === 'leaf') {
              nodeHtml += '<g class="starmap-node" data-id="'+n.id+'" transform="translate('+n.x.toFixed(1)+','+n.y.toFixed(1)+')">'+
                '<circle r="'+n.r+'" fill="'+n.color+'" opacity="0.8"/>'+
                '<title>'+esc+'</title></g>';
            } else {
              const fs = n.type === 'core' ? 12 : 9;
              const lbl = n.label.length > 5 ? n.label.substring(0,4)+'…' : n.label;
              nodeHtml += '<g class="starmap-node" data-id="'+n.id+'" transform="translate('+n.x.toFixed(1)+','+n.y.toFixed(1)+')">'+
                '<circle r="'+n.r+'" fill="'+n.color+'" opacity="0.85" filter="url(#glow)"/>'+
                '<text class="starmap-label" y="4" font-size="'+fs+'" fill="#1a1a24" font-weight="700">'+lbl+'</text></g>';
            }
          });
          nodesG.innerHTML = nodeHtml;
          viewport.setAttribute('transform', 'translate('+offsetX+','+offsetY+') scale('+scale+')');
        }

        function loop() {
          simulate();
          render();
          requestAnimationFrame(loop);
        }

        // 交互：拖拽
        function svgPoint(evt) {
          const pt = svg.createSVGPoint();
          pt.x = evt.clientX; pt.y = evt.clientY;
          const m = svg.getScreenCTM().inverse();
          const p = pt.matrixTransform(m);
          // 反向应用viewport变换
          p.x = (p.x - offsetX) / scale;
          p.y = (p.y - offsetY) / scale;
          return p;
        }
        svg.addEventListener('mousedown', evt => {
          const target = evt.target.closest('.starmap-node');
          if (target) {
            const id = target.getAttribute('data-id');
            dragNode = nodeMap[id];
          } else {
            isPanning = true;
            panStart = {x: evt.clientX - offsetX, y: evt.clientY - offsetY};
          }
        });
        window.addEventListener('mousemove', evt => {
          if (dragNode) {
            const p = svgPoint(evt);
            dragNode.x = p.x; dragNode.y = p.y;
            dragNode.vx = 0; dragNode.vy = 0;
          } else if (isPanning) {
            offsetX = evt.clientX - panStart.x;
            offsetY = evt.clientY - panStart.y;
          }
        });
        window.addEventListener('mouseup', () => { dragNode = null; isPanning = false; });

        // 悬停高亮
        svg.addEventListener('mouseover', evt => {
          const target = evt.target.closest('.starmap-node');
          if (target) {
            const id = target.getAttribute('data-id');
            target.classList.add('active');
            linksG.querySelectorAll('.starmap-link').forEach(l => {
              if (l.getAttribute('data-from') === id || l.getAttribute('data-to') === id) l.classList.add('highlight');
            });
            const n = nodeMap[id];
            if (n && n.type !== 'core') {
              tooltip.style.display = 'block';
              tooltip.innerHTML = '<b style="color:'+n.color+'">'+n.label+'</b>' + (n.cat ? '<br>分类: '+n.cat : '');
              const rect = canvas.getBoundingClientRect();
              tooltip.style.left = (evt.clientX - rect.left + 12) + 'px';
              tooltip.style.top = (evt.clientY - rect.top + 12) + 'px';
            }
          }
        });
        svg.addEventListener('mouseout', evt => {
          const target = evt.target.closest('.starmap-node');
          if (target) {
            target.classList.remove('active');
            linksG.querySelectorAll('.starmap-link.highlight').forEach(l => l.classList.remove('highlight'));
            tooltip.style.display = 'none';
          }
        });

        // 点击跳转可视化演示
        svg.addEventListener('click', evt => {
          const target = evt.target.closest('.starmap-node');
          if (target && !dragNode) {
            const id = target.getAttribute('data-id');
            const n = nodeMap[id];
            if (n && n.tplId) CSP.demoProblem(CSP.vizFromTpl(n.tplId) || 'sort');
            else if (n && n.cat) CSP.demoProblem(CSP.vizFromCat(n.cat));
            else if (n && n.type === 'core') CSP.go('home');
          }
        });

        // 滚轮缩放
        svg.addEventListener('wheel', evt => {
          evt.preventDefault();
          const delta = evt.deltaY > 0 ? 0.9 : 1.1;
          scale = Math.max(0.3, Math.min(3, scale * delta));
        }, {passive:false});

        // 暴露控制
        CSP._starmap = { nodes, nodeMap, get playing(){return playing;}, set playing(v){playing=v;}, get scale(){return scale;}, set scale(v){scale=v;}, reset(){nodes.forEach(n=>{n.x=400+(Math.random()-0.5)*300;n.y=300+(Math.random()-0.5)*200;n.vx=0;n.vy=0;});scale=1;offsetX=0;offsetY=0;} };
        CSP.starmapTogglePlay = function(){ playing = !playing; document.getElementById('starmap-play-btn').textContent = playing ? '⏸ 暂停' : '▶ 播放'; };
        CSP.starmapReset = function(){ CSP._starmap.reset(); };
        CSP.starmapZoom = function(f){ scale = Math.max(0.3, Math.min(3, scale * f)); };

        loop();
      })();
    </script>
    `;
  }

  // ============================ 算法可视化 ============================
  const vizState = {
    algo: 'bubble',
    data: [],
    steps: [],
    stepIdx: 0,
    playing: false,
    timer: null,
    speed: 500,
    comparing: [],
    sorted: [],
    pivot: -1,
    // 二分查找
    bsTarget: 0,
    bsLeft: 0,
    bsRight: 0,
    bsMid: 0,
    bsFound: false,
    // BFS/DFS
    graphNodes: [],
    graphEdges: [],
    graphAdj: {},
    visited: [],
    queue: [],
    currentGraphNode: -1,
    graphMode: 'bfs'
  };

  function genVizData(n) {
    const arr = [];
    for (let i = 0; i < n; i++) arr.push(Math.floor(Math.random() * 90) + 10);
    return arr;
  }

  // 排序算法步骤生成
  function bubbleSteps(arr) {
    const steps = [];
    const a = [...arr];
    const n = a.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - 1 - i; j++) {
        steps.push({ type: 'compare', indices: [j, j + 1], array: [...a] });
        if (a[j] > a[j + 1]) {
          [a[j], a[j + 1]] = [a[j + 1], a[j]];
          steps.push({ type: 'swap', indices: [j, j + 1], array: [...a] });
        }
      }
      steps.push({ type: 'sorted', index: n - 1 - i, array: [...a] });
    }
    steps.push({ type: 'done', array: [...a] });
    return steps;
  }

  function selectionSteps(arr) {
    const steps = [];
    const a = [...arr];
    const n = a.length;
    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        steps.push({ type: 'compare', indices: [minIdx, j], array: [...a] });
        if (a[j] < a[minIdx]) minIdx = j;
      }
      if (minIdx !== i) {
        [a[i], a[minIdx]] = [a[minIdx], a[i]];
        steps.push({ type: 'swap', indices: [i, minIdx], array: [...a] });
      }
      steps.push({ type: 'sorted', index: i, array: [...a] });
    }
    steps.push({ type: 'done', array: [...a] });
    return steps;
  }

  function insertionSteps(arr) {
    const steps = [];
    const a = [...arr];
    const n = a.length;
    steps.push({ type: 'sorted', index: 0, array: [...a] });
    for (let i = 1; i < n; i++) {
      let j = i;
      while (j > 0) {
        steps.push({ type: 'compare', indices: [j - 1, j], array: [...a] });
        if (a[j - 1] > a[j]) {
          [a[j - 1], a[j]] = [a[j], a[j - 1]];
          steps.push({ type: 'swap', indices: [j - 1, j], array: [...a] });
          j--;
        } else break;
      }
      steps.push({ type: 'sorted', index: i, array: [...a] });
    }
    steps.push({ type: 'done', array: [...a] });
    return steps;
  }

  function quickSteps(arr) {
    const steps = [];
    const a = [...arr];
    function qs(lo, hi) {
      if (lo >= hi) {
        if (lo === hi) steps.push({ type: 'sorted', index: lo, array: [...a] });
        return;
      }
      const pivot = a[hi];
      steps.push({ type: 'pivot', index: hi, array: [...a] });
      let i = lo - 1;
      for (let j = lo; j < hi; j++) {
        steps.push({ type: 'compare', indices: [j, hi], array: [...a], pivot: hi });
        if (a[j] < pivot) {
          i++;
          if (i !== j) {
            [a[i], a[j]] = [a[j], a[i]];
            steps.push({ type: 'swap', indices: [i, j], array: [...a], pivot: hi });
          }
        }
      }
      [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
      steps.push({ type: 'swap', indices: [i + 1, hi], array: [...a] });
      steps.push({ type: 'sorted', index: i + 1, array: [...a] });
      qs(lo, i);
      qs(i + 2, hi);
    }
    qs(0, a.length - 1);
    steps.push({ type: 'done', array: [...a] });
    return steps;
  }

  function mergeSteps(arr) {
    const steps = [];
    const a = [...arr];
    function ms(lo, hi) {
      if (lo >= hi) return;
      const mid = Math.floor((lo + hi) / 2);
      ms(lo, mid);
      ms(mid + 1, hi);
      // merge
      const left = a.slice(lo, mid + 1);
      const right = a.slice(mid + 1, hi + 1);
      let i = 0, j = 0, k = lo;
      while (i < left.length && j < right.length) {
        steps.push({ type: 'compare', indices: [lo + i, mid + 1 + j], array: [...a] });
        if (left[i] <= right[j]) {
          a[k] = left[i]; i++;
        } else {
          a[k] = right[j]; j++;
        }
        steps.push({ type: 'overwrite', index: k, array: [...a] });
        k++;
      }
      while (i < left.length) { a[k] = left[i]; steps.push({ type: 'overwrite', index: k, array: [...a] }); i++; k++; }
      while (j < right.length) { a[k] = right[j]; steps.push({ type: 'overwrite', index: k, array: [...a] }); j++; k++; }
      for (let x = lo; x <= hi; x++) steps.push({ type: 'sorted', index: x, array: [...a] });
    }
    ms(0, a.length - 1);
    steps.push({ type: 'done', array: [...a] });
    return steps;
  }

  function heapSortSteps(arr) {
    const steps = [];
    const a = [...arr];
    const n = a.length;
    function siftDown(start, end) {
      let root = start;
      while (root * 2 + 1 <= end) {
        let child = root * 2 + 1;
        if (child + 1 <= end && a[child] < a[child + 1]) child++;
        if (a[root] < a[child]) {
          steps.push({ type: 'compare', indices: [root, child], array: [...a] });
          [a[root], a[child]] = [a[child], a[root]];
          steps.push({ type: 'swap', indices: [root, child], array: [...a] });
          root = child;
        } else break;
      }
    }
    // 建堆
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      siftDown(i, n - 1);
    }
    // 排序
    for (let i = n - 1; i > 0; i--) {
      steps.push({ type: 'swap', indices: [0, i], array: [...a] });
      [a[0], a[i]] = [a[i], a[0]];
      steps.push({ type: 'sorted', index: i, array: [...a] });
      siftDown(0, i - 1);
    }
    steps.push({ type: 'sorted', index: 0, array: [...a] });
    steps.push({ type: 'done', array: [...a] });
    return steps;
  }

  function getAlgoSteps(algo, arr) {
    switch (algo) {
      case 'bubble': return bubbleSteps(arr);
      case 'selection': return selectionSteps(arr);
      case 'insertion': return insertionSteps(arr);
      case 'quick': return quickSteps(arr);
      case 'merge': return mergeSteps(arr);
      case 'heap': return heapSortSteps(arr);
      default: return bubbleSteps(arr);
    }
  }

  // CSP-S 相关题目数据
  const VIZ_PROBLEMS = {
    sort: [
      { title: 'CSP-S 2019 T1 · 数字排序', desc: '给定n个整数，要求按从小到大排序后输出。', algo: '排序算法', hint: 'n≤10⁵时用快排/归并/堆排，n≤100时冒泡也可', diff: '入门' },
      { title: 'CSP-S 2020 T2 · 简单排序', desc: '对数组进行排序并统计逆序对数量。', algo: '归并排序', hint: '归并排序过程中统计逆序对，O(n log n)', diff: '普及' },
      { title: 'CSP-S 2021 T1 · 廊桥分配', desc: '需要排序后贪心处理，按位置排序是关键步骤。', algo: '排序+贪心', hint: '先排序再贪心，排序是预处理步骤', diff: '提高' },
      { title: 'CSP-S 2022 T1 · 假期计划', desc: '涉及多关键字排序与优先队列调度。', algo: '堆排序', hint: '用堆维护动态优先级，堆排序思想', diff: '提高' }
    ],
    search: [
      { title: 'CSP-S 2019 T2 · 二分查找', desc: '在有序序列中查找满足条件的最小位置。', algo: '二分查找', hint: '标准二分查找模板，注意边界处理', diff: '入门' },
      { title: 'CSP-S 2020 T3 · 函数调用', desc: '需要二分确定函数调用顺序的合法性。', algo: '二分答案', hint: '二分答案+验证，经典二分应用', diff: '提高' },
      { title: 'CSP-S 2021 T3 · 回文', desc: '利用二分+哈希判断回文子串。', algo: '二分+哈希', hint: '二分回文半径，哈希O(1)验证', diff: '提高' },
      { title: 'CSP-S 2022 T2 · 策略游戏', desc: '二分枚举对方策略，求最优应对。', algo: '二分答案', hint: '二分答案+贪心验证', diff: '提高' }
    ],
    graph: [
      { title: 'CSP-S 2019 T3 · 旅行', desc: '在树上/图上遍历所有节点，求最小字典序路径。', algo: 'DFS/BFS', hint: '树上级DFS，环上枚举断边后DFS', diff: '提高' },
      { title: 'CSP-S 2020 T1 · 儒略日', desc: '图的最短路问题，Dijkstra算法应用。', algo: 'Dijkstra', hint: '堆优化Dijkstra，O((V+E)logV)', diff: '普及' },
      { title: 'CSP-S 2021 T2 · 括号序列', desc: '需要判断图的连通性，并查集维护。', algo: '并查集', hint: '并查集判连通，路径压缩优化', diff: '提高' },
      { title: 'CSP-S 2022 T3 · 星战', desc: '图连通性判定，并查集+哈希。', algo: '并查集', hint: '并查集维护连通块，哈希判定全连通', diff: 'NOI' },
      { title: 'CSP-S 2023 T2 · 消除游戏', desc: '拓扑排序判断依赖关系是否合法。', algo: '拓扑排序', hint: 'Kahn算法拓扑排序，检测环', diff: '提高' }
    ],
    dijkstra: [
      { title: 'CSP-S 2020 T1 · 儒略日', desc: '单源最短路，堆优化Dijkstra。', algo: 'Dijkstra+堆', hint: '优先队列优化，O((V+E)logV)', diff: '普及' },
      { title: 'CSP-S 2021 T1 · 廊桥分配', desc: '最短路+贪心分配。', algo: 'Dijkstra', hint: '多源最短路预处理+贪心', diff: '提高' }
    ],
    unionfind: [
      { title: 'CSP-S 2021 T2 · 括号序列', desc: '并查集判断括号匹配的连通性。', algo: '并查集', hint: '路径压缩+按秩合并', diff: '提高' },
      { title: 'CSP-S 2022 T3 · 星战', desc: '并查集维护动态连通块。', algo: '并查集+哈希', hint: '哈希值判定全连通状态', diff: 'NOI' },
      { title: 'CSP-S 2023 T1 · 密码锁', desc: '并查集合并等价状态。', algo: '并查集', hint: '枚举+并查集判等价类', diff: '普及' }
    ],
    topo: [
      { title: 'CSP-S 2023 T2 · 消除游戏', desc: '拓扑排序判断依赖合法性。', algo: '拓扑排序', hint: 'Kahn算法，入度为0的先入队', diff: '提高' },
      { title: 'CSP-S 2019 T2 · 数字排序', desc: '拓扑排序确定偏序关系。', algo: '拓扑排序', hint: 'DAG上拓扑排序', diff: '提高' }
    ],
    array: [
      { title: 'CSP-S 2019 T1 · 数字排序', desc: '数组存储+排序输出。', algo: '数组操作', hint: '最基础的数组应用', diff: '入门' },
      { title: 'CSP-S 2020 T1 · 儒略日', desc: '前缀和数组优化区间查询。', algo: '前缀和', hint: '差分/前缀和，O(1)区间查询', diff: '普及' },
      { title: 'CSP-S 2021 T3 · 回文', desc: '差分数组标记区间操作。', algo: '差分数组', hint: '差分+前缀和还原', diff: '提高' }
    ],
    stack: [
      { title: 'CSP-S 2021 T2 · 括号序列', desc: '栈判断括号匹配合法性。', algo: '栈', hint: '左括号入栈，右括号匹配出栈', diff: '普及' },
      { title: 'CSP-S 2020 T3 · 表达式', desc: '栈求中缀表达式值。', algo: '栈', hint: '双栈：操作数栈+运算符栈', diff: '提高' },
      { title: 'CSP-S 2023 T1 · 密码锁', desc: '单调栈求最近更大元素。', algo: '单调栈', hint: '维护递减栈，弹出时记录答案', diff: '提高' }
    ],
    queue: [
      { title: 'CSP-S 2019 T3 · 旅行', desc: 'BFS队列求最短路径。', algo: 'BFS+队列', hint: '队列实现BFS层序遍历', diff: '提高' },
      { title: 'CSP-S 2021 T1 · 廊桥分配', desc: '单调队列优化DP转移。', algo: '单调队列', hint: '单调队列维护滑动窗口最值', diff: '提高' },
      { title: 'CSP-S 2022 T2 · 策略游戏', desc: '单调队列优化区间最值查询。', algo: '单调队列', hint: '队首维护窗口内最值', diff: '提高' }
    ],
    list: [
      { title: 'CSP-S 2019 T3 · 旅行', desc: '邻接表(链表)存储图结构。', algo: '邻接表', hint: '前向星/链式前向星存图', diff: '提高' },
      { title: 'CSP-S 2020 T2 · 简单排序', desc: '链表插入排序。', algo: '链表排序', hint: '链表插入排序O(n²)，归并排序O(nlogn)', diff: '普及' }
    ],
    tree: [
      { title: 'CSP-S 2019 T3 · 旅行', desc: '树形结构DFS遍历。', algo: '树形DFS', hint: '树上级DFS，注意访问顺序', diff: '提高' },
      { title: 'CSP-S 2021 T1 · 廊桥分配', desc: '线段树维护区间最值。', algo: '线段树', hint: '线段树区间查询+单点更新', diff: '提高' },
      { title: 'CSP-S 2022 T1 · 假期计划', desc: '树形DP+线段树优化。', algo: '线段树', hint: '线段树优化树形DP转移', diff: '提高' }
    ],
    heap: [
      { title: 'CSP-S 2020 T1 · 儒略日', desc: '堆优化Dijkstra求最短路。', algo: '优先队列(堆)', hint: '小根堆维护最短距离', diff: '普及' },
      { title: 'CSP-S 2022 T1 · 假期计划', desc: '堆维护动态优先级调度。', algo: '堆', hint: '大根堆/小根堆动态取最值', diff: '提高' },
      { title: 'CSP-S 2023 T3 · 种树', desc: '反悔贪心+堆维护。', algo: '堆+贪心', hint: '堆维护可反悔的贪心选择', diff: 'NOI' }
    ],
    dp: [
      { title: 'CSP-S 2020 T2 · 简单排序', desc: 'LIS最长递增子序列DP。', algo: '线性DP', hint: 'O(n²)朴素或O(nlogn)二分优化', diff: '普及' },
      { title: 'CSP-S 2021 T1 · 廊桥分配', desc: '背包DP分配资源。', algo: '背包DP', hint: '01背包或分组背包', diff: '提高' },
      { title: 'CSP-S 2022 T2 · 策略游戏', desc: '区间DP合并最优策略。', algo: '区间DP', hint: '区间DP枚举分割点', diff: '提高' },
      { title: 'CSP-S 2023 T2 · 消除游戏', desc: '树形DP求最优消除方案。', algo: '树形DP', hint: '树形DP，子树合并转移', diff: '提高' }
    ]
  };

  function renderProblemCard(problems) {
    // 精简：每个可视化模块只展示一道精选题目（取第一道）
    const p = problems[0];
    if (!p) return '';
    return `
    <div class="viz-problem-single">
      <div class="vps-header">
        <span class="vps-icon">ST</span>
        <span class="vps-title">${p.title}</span>
        <span class="difficulty diff-${p.diff === '入门' ? '1' : p.diff === '普及' ? '2' : p.diff === '提高' ? '3' : '4'}">${p.diff}</span>
      </div>
      <div class="vps-desc">${p.desc}</div>
      <div class="vps-footer">
        <span class="vps-algo"> ${p.algo}</span>
        <span class="vps-hint"> ${p.hint}</span>
      </div>
    </div>`;
  }

  function renderSortViz() {
    const step = vizState.steps[vizState.stepIdx] || { array: vizState.data, type: 'idle' };
    const arr = step.array || vizState.data;
    const maxVal = Math.max(...arr, 1);

    const algoNames = {
      'bubble': '冒泡排序 O(n²)',
      'selection': '选择排序 O(n²)',
      'insertion': '插入排序 O(n²)',
      'quick': '快速排序 O(n log n)',
      'merge': '归并排序 O(n log n)',
      'heap': '堆排序 O(n log n)'
    };

    const bars = arr.map((v, i) => {
      let cls = 'bar-item';
      if (step.type === 'compare' && step.indices.includes(i)) cls += ' comparing';
      if (step.type === 'swap' && step.indices.includes(i)) cls += ' swapping';
      if (step.type === 'overwrite' && step.index === i) cls += ' swapping';
      if (step.type === 'pivot' && step.pivot === i) cls += ' pivot';
      if (vizState.sorted.includes(i) || (step.type === 'sorted' && step.index === i)) cls += ' sorted';
      if (step.type === 'done') cls += ' sorted';
      const h = Math.max(4, (v / maxVal) * 180);
      return `<div class="${cls}" style="height:${h}px;" title="${v}">
        <span class="bar-val">${v}</span>
      </div>`;
    }).join('');

    return `
    <div class="viz-section">
      <div class="viz-controls">
        <select id="viz-algo" onchange="CSP.setAlgo(this.value)">
          ${Object.entries(algoNames).map(([k, v]) => `<option value="${k}" ${vizState.algo === k ? 'selected' : ''}>${v}</option>`).join('')}
        </select>
        <button class="btn btn-primary" onclick="CSP.vizPlay()" ${vizState.playing ? 'disabled' : ''}>▶ 播放</button>
        <button class="btn" onclick="CSP.vizPause()" ${!vizState.playing ? 'disabled' : ''}>⏸ 暂停</button>
        <button class="btn" onclick="CSP.vizStep()">⏭ 单步</button>
        <button class="btn" onclick="CSP.vizReset()">↻ 重置</button>
        <button class="btn" onclick="CSP.vizShuffle()">? 随机数据</button>
        <label style="font-size:12px;color:var(--text-2);">速度</label>
        <input type="range" id="viz-speed" min="50" max="1500" value="${vizState.speed}" onchange="CSP.setVizSpeed(this.value)" style="width:100px;">
      </div>
      <div class="viz-info">
        <span id="sort-status">步骤: ${vizState.stepIdx + 1} / ${vizState.steps.length}</span>
        <span id="viz-status">${step.type === 'compare' ? '比较' : step.type === 'swap' ? '交换' : step.type === 'sorted' ? '已排序' : step.type === 'pivot' ? '选基准' : step.type === 'overwrite' ? '写入' : step.type === 'done' ? '完成' : '就绪'}</span>
      </div>
      <div class="bar-chart" id="sort-bars">${bars}</div>
      <div class="viz-legend">
        <span class="legend-item"><i class="legend-color comparing"></i>比较中</span>
        <span class="legend-item"><i class="legend-color swapping"></i>交换中</span>
        <span class="legend-item"><i class="legend-color pivot"></i>基准</span>
        <span class="legend-item"><i class="legend-color sorted"></i>已排序</span>
      </div>
      ${renderProblemCard(VIZ_PROBLEMS.sort)}
    </div>`;
  }

  // 二分查找可视化
  function renderBinarySearchViz() {
    if (vizState.data.length === 0) vizState.data = genVizData(15);
    const arr = [...vizState.data].sort((a, b) => a - b);
    const target = vizState.bsTarget;

    const items = arr.map((v, i) => {
      let cls = 'bs-item';
      if (i < vizState.bsLeft || i > vizState.bsRight) cls += ' eliminated';
      if (i === vizState.bsMid) cls += ' mid';
      if (vizState.bsFound && v === target) cls += ' found';
      return `<div class="${cls}">${v}</div>`;
    }).join('');

    return `
    <div class="viz-section">
      <div class="viz-controls">
        <input type="number" id="bs-target" value="${target}" placeholder="查找目标" style="width:80px;" onchange="CSP.setBsTarget(this.value)">
        <button class="btn btn-primary" onclick="CSP.bsSearch()">⌕ 查找</button>
        <button class="btn" onclick="CSP.bsStep()">⏭ 单步</button>
        <button class="btn" onclick="CSP.bsReset()">↻ 重置</button>
        <button class="btn" onclick="CSP.vizShuffle()">? 随机数据</button>
      </div>
      <div class="viz-info">
        <span>目标: ${target}</span>
        <span>范围: [${vizState.bsLeft}, ${vizState.bsRight}]</span>
        <span>中点: ${vizState.bsMid}</span>
        <span id="bs-status">${vizState.bsFound ? '✓ 已找到!' : '查找中...'}</span>
      </div>
      <div class="bs-array">${items}</div>
      <div class="viz-legend">
        <span class="legend-item"><i class="legend-color mid"></i>中点</span>
        <span class="legend-item"><i class="legend-color eliminated"></i>已排除</span>
        <span class="legend-item"><i class="legend-color found"></i>找到</span>
      </div>
      ${renderProblemCard(VIZ_PROBLEMS.search)}
    </div>`;
  }

  // BFS/DFS 图遍历可视化
  function initGraphViz() {
    // 预定义一个6节点图
    vizState.graphNodes = [
      { id: 0, x: 150, y: 80, label: 'A' },
      { id: 1, x: 300, y: 50, label: 'B' },
      { id: 2, x: 450, y: 80, label: 'C' },
      { id: 3, x: 200, y: 200, label: 'D' },
      { id: 4, x: 400, y: 200, label: 'E' },
      { id: 5, x: 300, y: 300, label: 'F' }
    ];
    vizState.graphEdges = [[0,1],[0,3],[1,2],[1,4],[2,4],[3,4],[3,5],[4,5]];
    vizState.graphAdj = {};
    vizState.graphNodes.forEach(n => { vizState.graphAdj[n.id] = []; });
    vizState.graphEdges.forEach(([a, b]) => {
      vizState.graphAdj[a].push(b);
      vizState.graphAdj[b].push(a);
    });
    vizState.visited = [];
    vizState.queue = [];
    vizState.currentGraphNode = -1;
  }

  function renderGraphTraversalViz() {
    if (vizState.graphNodes.length === 0) initGraphViz();

    const edgesSvg = vizState.graphEdges.map(([a, b]) => {
      const n1 = vizState.graphNodes[a];
      const n2 = vizState.graphNodes[b];
      const isPath = vizState.visited.includes(a) && vizState.visited.includes(b);
      return `<line class="graph-viz-edge ${isPath ? 'path' : ''}" x1="${n1.x}" y1="${n1.y}" x2="${n2.x}" y2="${n2.y}"/>`;
    }).join('');

    const nodesSvg = vizState.graphNodes.map(n => {
      let cls = 'graph-viz-node';
      if (vizState.visited.includes(n.id)) cls += ' visited';
      if (vizState.currentGraphNode === n.id) cls += ' current';
      if (vizState.queue.includes(n.id)) cls += ' frontier';
      return `<g class="${cls}">
        <circle cx="${n.x}" cy="${n.y}" r="22"/>
        <text x="${n.x}" y="${n.y + 5}" text-anchor="middle">${n.label}</text>
      </g>`;
    }).join('');

    const visitedLabels = vizState.visited.map(id => vizState.graphNodes[id].label).join(' → ');

    return `
    <div class="viz-section">
      <div class="viz-controls">
        <select id="graph-mode" onchange="CSP.setGraphMode(this.value)">
          <option value="bfs" ${vizState.graphMode === 'bfs' ? 'selected' : ''}>BFS 广度优先</option>
          <option value="dfs" ${vizState.graphMode === 'dfs' ? 'selected' : ''}>DFS 深度优先</option>
        </select>
        <button class="btn btn-primary" onclick="CSP.graphTraverseStart()">▶ 开始遍历</button>
        <button class="btn" onclick="CSP.graphTraverseStep()">⏭ 单步</button>
        <button class="btn" onclick="CSP.graphTraverseReset()">↻ 重置</button>
      </div>
      <div class="viz-info">
        <span>模式: ${vizState.graphMode === 'bfs' ? 'BFS' : 'DFS'}</span>
        <span>已访问: ${visitedLabels || '无'}</span>
        <span>队列/栈: [${vizState.queue.map(id => vizState.graphNodes[id].label).join(', ')}]</span>
      </div>
      <svg viewBox="0 0 600 380" class="graph-viz-svg">
        ${edgesSvg}
        ${nodesSvg}
      </svg>
      <div class="viz-legend">
        <span class="legend-item"><i class="legend-color current"></i>当前</span>
        <span class="legend-item"><i class="legend-color frontier"></i>队列/栈</span>
        <span class="legend-item"><i class="legend-color visited"></i>已访问</span>
      </div>
      ${renderProblemCard(VIZ_PROBLEMS.graph)}
    </div>`;
  }

  // Dijkstra 最短路可视化
  const dijkstraState = {
    nodes: [], edges: [], adj: {}, dist: [], visited: [], current: -1, steps: [], stepIdx: 0, playing: false, timer: null
  };

  function initDijkstra() {
    dijkstraState.nodes = [
      { id: 0, x: 100, y: 150, label: 'S' },
      { id: 1, x: 250, y: 80, label: 'A' },
      { id: 2, x: 250, y: 220, label: 'B' },
      { id: 3, x: 400, y: 80, label: 'C' },
      { id: 4, x: 400, y: 220, label: 'D' },
      { id: 5, x: 550, y: 150, label: 'T' }
    ];
    dijkstraState.edges = [
      [0,1,4],[0,2,2],[1,2,1],[1,3,5],[2,3,8],[2,4,10],[3,4,2],[3,5,6],[4,5,3]
    ];
    dijkstraState.adj = {};
    dijkstraState.nodes.forEach(n => { dijkstraState.adj[n.id] = []; });
    dijkstraState.edges.forEach(([a,b,w]) => {
      dijkstraState.adj[a].push({ to: b, w });
      dijkstraState.adj[b].push({ to: a, w });
    });
    dijkstraState.dist = dijkstraState.nodes.map(() => Infinity);
    dijkstraState.dist[0] = 0;
    dijkstraState.visited = [];
    dijkstraState.current = -1;
    dijkstraState.steps = [];
    dijkstraState.stepIdx = 0;
  }

  function dijkstraCompute() {
    initDijkstra();
    const steps = [];
    const dist = [...dijkstraState.dist];
    const visited = [];
    const n = dijkstraState.nodes.length;
    for (let i = 0; i < n; i++) {
      // 找最小未访问
      let u = -1, minD = Infinity;
      for (let j = 0; j < n; j++) {
        if (!visited.includes(j) && dist[j] < minD) { minD = dist[j]; u = j; }
      }
      if (u === -1) break;
      visited.push(u);
      steps.push({ type: 'visit', node: u, dist: [...dist], visited: [...visited] });
      // 松弛
      dijkstraState.adj[u].forEach(({ to, w }) => {
        if (dist[u] + w < dist[to]) {
          dist[to] = dist[u] + w;
          steps.push({ type: 'relax', from: u, to, w, dist: [...dist], visited: [...visited] });
        }
      });
    }
    steps.push({ type: 'done', dist: [...dist], visited: [...visited] });
    dijkstraState.steps = steps;
  }

  function renderDijkstraViz() {
    if (dijkstraState.nodes.length === 0) initDijkstra();
    const step = dijkstraState.steps[dijkstraState.stepIdx] || { type: 'idle', dist: dijkstraState.dist, visited: [] };

    const edgesSvg = dijkstraState.edges.map(([a, b, w]) => {
      const n1 = dijkstraState.nodes[a], n2 = dijkstraState.nodes[b];
      const isPath = step.visited && step.visited.includes(a) && step.visited.includes(b);
      const isRelax = step.type === 'relax' && ((step.from === a && step.to === b) || (step.from === b && step.to === a));
      let cls = 'graph-viz-edge';
      if (isPath) cls += ' path';
      if (isRelax) cls += ' relax';
      const mx = (n1.x + n2.x) / 2, my = (n1.y + n2.y) / 2;
      return `<line class="${cls}" x1="${n1.x}" y1="${n1.y}" x2="${n2.x}" y2="${n2.y}"/>
        <text x="${mx}" y="${my - 4}" class="edge-weight">${w}</text>`;
    }).join('');

    const nodesSvg = dijkstraState.nodes.map(n => {
      let cls = 'graph-viz-node';
      if (step.visited && step.visited.includes(n.id)) cls += ' visited';
      if (step.type === 'visit' && step.node === n.id) cls += ' current';
      const d = step.dist ? step.dist[n.id] : Infinity;
      const distLabel = d === Infinity ? '∞' : d;
      return `<g class="${cls}">
        <circle cx="${n.x}" cy="${n.y}" r="22"/>
        <text x="${n.x}" y="${n.y + 4}" text-anchor="middle">${n.label}</text>
        <text x="${n.x}" y="${n.y - 28}" text-anchor="middle" class="dist-label">${distLabel}</text>
      </g>`;
    }).join('');

    return `
    <div class="viz-section">
      <div class="viz-controls">
        <button class="btn btn-primary" onclick="CSP.dijkstraPlay()" ${dijkstraState.playing ? 'disabled' : ''}>▶ 播放</button>
        <button class="btn" onclick="CSP.dijkstraPause()" ${!dijkstraState.playing ? 'disabled' : ''}>⏸ 暂停</button>
        <button class="btn" onclick="CSP.dijkstraStep()">⏭ 单步</button>
        <button class="btn" onclick="CSP.dijkstraReset()">↻ 重置</button>
      </div>
      <div class="viz-info">
        <span>步骤: ${dijkstraState.stepIdx + 1} / ${dijkstraState.steps.length || 1}</span>
        <span id="dij-status">${step.type === 'visit' ? `访问 ${dijkstraState.nodes[step.node]?.label}` : step.type === 'relax' ? `松弛 ${dijkstraState.nodes[step.from]?.label}→${dijkstraState.nodes[step.to]?.label} (w=${step.w})` : step.type === 'done' ? '完成' : '就绪'}</span>
      </div>
      <svg viewBox="0 0 650 300" class="graph-viz-svg">
        ${edgesSvg}
        ${nodesSvg}
      </svg>
      <div class="viz-legend">
        <span class="legend-item"><i class="legend-color current"></i>当前访问</span>
        <span class="legend-item"><i class="legend-color visited"></i>已确定最短路</span>
        <span class="legend-item"><i class="legend-color path"></i>最短路径边</span>
      </div>
      ${renderProblemCard(VIZ_PROBLEMS.dijkstra)}
    </div>`;
  }

  // 并查集可视化
  const ufState = {
    parent: [], rank: [], nodes: [], steps: [], stepIdx: 0, groups: []
  };

  function initUF() {
    ufState.nodes = [
      { id: 0, x: 100, y: 80, label: '1' },
      { id: 1, x: 250, y: 80, label: '2' },
      { id: 2, x: 400, y: 80, label: '3' },
      { id: 3, x: 550, y: 80, label: '4' },
      { id: 4, x: 150, y: 200, label: '5' },
      { id: 5, x: 350, y: 200, label: '6' },
      { id: 6, x: 500, y: 200, label: '7' }
    ];
    ufState.parent = ufState.nodes.map((_, i) => i);
    ufState.rank = ufState.nodes.map(() => 0);
    ufState.steps = [];
    ufState.stepIdx = 0;
    ufState.groups = ufState.nodes.map((_, i) => [i]);
  }

  function ufFind(x) {
    while (ufState.parent[x] !== x) {
      ufState.parent[x] = ufState.parent[ufState.parent[x]]; // 路径压缩
      x = ufState.parent[x];
    }
    return x;
  }

  function ufUnion(a, b) {
    const ra = ufFind(a), rb = ufFind(b);
    if (ra === rb) { ufState.steps.push({ type: 'same', a, b, parent: [...ufState.parent], groups: JSON.parse(JSON.stringify(ufState.groups)) }); return; }
    if (ufState.rank[ra] < ufState.rank[rb]) { ufState.parent[ra] = rb; }
    else if (ufState.rank[ra] > ufState.rank[rb]) { ufState.parent[rb] = ra; }
    else { ufState.parent[rb] = ra; ufState.rank[ra]++; }
    // 更新groups
    ufState.groups = ufState.groups.filter(g => !g.includes(ra) && !g.includes(rb));
    const newGroup = [...new Set([...ufState.nodes.map((_, i) => i).filter(i => ufFind(i) === ra || ufFind(i) === rb)])];
    ufState.groups.push(newGroup);
    ufState.steps.push({ type: 'union', a, b, parent: [...ufState.parent], groups: JSON.parse(JSON.stringify(ufState.groups)) });
  }

  function renderUnionFindViz() {
    if (ufState.nodes.length === 0) initUF();

    // 绘制节点和父指针
    const nodesSvg = ufState.nodes.map(n => {
      const root = ufFind(n.id);
      const isRoot = n.id === root;
      let cls = 'uf-node';
      if (isRoot) cls += ' root';
      const px = ufState.parent[n.id] !== n.id ? ufState.nodes[ufState.parent[n.id]].x : n.x;
      const py = ufState.parent[n.id] !== n.id ? ufState.nodes[ufState.parent[n.id]].y : n.y;
      let arrow = '';
      if (ufState.parent[n.id] !== n.id) {
        arrow = `<line class="uf-edge" x1="${n.x}" y1="${n.y}" x2="${px}" y2="${py}"/>`;
      }
      return `${arrow}<g class="${cls}">
        <circle cx="${n.x}" cy="${n.y}" r="20"/>
        <text x="${n.x}" y="${n.y + 4}" text-anchor="middle">${n.label}</text>
      </g>`;
    }).join('');

    // 连通块统计
    const groupInfo = ufState.groups.map((g, i) => {
      const labels = g.map(id => ufState.nodes[id].label).join(', ');
      return `<span class="uf-group">{${labels}}</span>`;
    }).join('');

    return `
    <div class="viz-section">
      <div class="viz-controls">
        <input type="number" id="uf-a" placeholder="元素A" style="width:60px;" min="1" max="7">
        <input type="number" id="uf-b" placeholder="元素B" style="width:60px;" min="1" max="7">
        <button class="btn btn-primary" onclick="CSP.ufUnionOp()">合并</button>
        <button class="btn" onclick="CSP.ufFindOp()">查找根</button>
        <button class="btn" onclick="CSP.ufReset()">↻ 重置</button>
      </div>
      <div class="viz-info">
        <span>连通块数: ${ufState.groups.length}</span>
        <span id="uf-status">就绪</span>
      </div>
      <svg viewBox="0 0 650 260" class="graph-viz-svg">
        ${nodesSvg}
      </svg>
      <div class="uf-groups">${groupInfo}</div>
      <div class="viz-legend">
        <span class="legend-item"><i class="legend-color visited"></i>根节点</span>
        <span class="legend-item"><i class="legend-color current"></i>普通节点</span>
      </div>
      ${renderProblemCard(VIZ_PROBLEMS.unionfind)}
    </div>`;
  }

  // 拓扑排序可视化
  const topoState = {
    nodes: [], edges: [], adj: {}, inDegree: [], queue: [], result: [], current: -1
  };

  function initTopo() {
    topoState.nodes = [
      { id: 0, x: 100, y: 60, label: 'A' },
      { id: 1, x: 250, y: 60, label: 'B' },
      { id: 2, x: 400, y: 60, label: 'C' },
      { id: 3, x: 100, y: 180, label: 'D' },
      { id: 4, x: 250, y: 180, label: 'E' },
      { id: 5, x: 400, y: 180, label: 'F' },
      { id: 6, x: 550, y: 120, label: 'G' }
    ];
    topoState.edges = [[0,1],[0,3],[1,2],[1,4],[3,4],[2,5],[4,5],[5,6]];
    topoState.adj = {};
    topoState.nodes.forEach(n => { topoState.adj[n.id] = []; });
    topoState.edges.forEach(([a, b]) => { topoState.adj[a].push(b); });
    topoState.inDegree = topoState.nodes.map(() => 0);
    topoState.edges.forEach(([a, b]) => { topoState.inDegree[b]++; });
    topoState.queue = [];
    topoState.result = [];
    topoState.current = -1;
    // 初始入度为0的入队
    topoState.nodes.forEach(n => { if (topoState.inDegree[n.id] === 0) topoState.queue.push(n.id); });
  }

  function renderTopoViz() {
    if (topoState.nodes.length === 0) initTopo();

    const edgesSvg = topoState.edges.map(([a, b]) => {
      const n1 = topoState.nodes[a], n2 = topoState.nodes[b];
      const isDone = topoState.result.includes(a) && topoState.result.includes(b);
      let cls = 'graph-viz-edge';
      if (isDone) cls += ' path';
      return `<line class="${cls}" x1="${n1.x}" y1="${n1.y}" x2="${n2.x}" y2="${n2.y}"/>
        <polygon points="${n2.x - 6},${n2.y - 4} ${n2.x - 6},${n2.y + 4} ${n2.x},${n2.y}" class="edge-arrow" fill="${isDone ? 'var(--cyan)' : 'var(--border-2)'}"/>`;
    }).join('');

    const nodesSvg = topoState.nodes.map(n => {
      let cls = 'graph-viz-node';
      if (topoState.result.includes(n.id)) cls += ' visited';
      if (topoState.current === n.id) cls += ' current';
      if (topoState.queue.includes(n.id)) cls += ' frontier';
      return `<g class="${cls}">
        <circle cx="${n.x}" cy="${n.y}" r="20"/>
        <text x="${n.x}" y="${n.y + 4}" text-anchor="middle">${n.label}</text>
        <text x="${n.x}" y="${n.y - 26}" text-anchor="middle" class="indeg-label">入度:${topoState.inDegree[n.id]}</text>
      </g>`;
    }).join('');

    const resultLabels = topoState.result.map(id => topoState.nodes[id].label).join(' → ');

    return `
    <div class="viz-section">
      <div class="viz-controls">
        <button class="btn btn-primary" onclick="CSP.topoStep()">⏭ 下一步</button>
        <button class="btn" onclick="CSP.topoAuto()">▶ 自动排序</button>
        <button class="btn" onclick="CSP.topoReset()">↻ 重置</button>
      </div>
      <div class="viz-info">
        <span>队列: [${topoState.queue.map(id => topoState.nodes[id].label).join(', ')}]</span>
        <span>排序结果: ${resultLabels || '无'}</span>
        <span id="topo-status">${topoState.queue.length === 0 && topoState.result.length < topoState.nodes.length ? '存在环!' : topoState.result.length === topoState.nodes.length ? '排序完成' : '排序中'}</span>
      </div>
      <svg viewBox="0 0 650 240" class="graph-viz-svg">
        ${edgesSvg}
        ${nodesSvg}
      </svg>
      <div class="viz-legend">
        <span class="legend-item"><i class="legend-color current"></i>当前出队</span>
        <span class="legend-item"><i class="legend-color frontier"></i>队列中(入度=0)</span>
        <span class="legend-item"><i class="legend-color visited"></i>已排序</span>
      </div>
      ${renderProblemCard(VIZ_PROBLEMS.topo)}
    </div>`;
  }

  function renderVisualizer() {
    const tabs = [
      { id: 'sort', label: '排序算法', icon: 'DP' },
      { id: 'search', label: '二分查找', icon: '⌕' },
      { id: 'graph', label: '图遍历', icon: 'GR' },
      { id: 'dijkstra', label: '最短路', icon: '~️' },
      { id: 'unionfind', label: '并查集', icon: '' },
      { id: 'topo', label: '拓扑排序', icon: '△' }
    ];

    let content = '';
    const tab = vizState.algoTab || 'sort';
    switch (tab) {
      case 'sort': content = renderSortViz(); break;
      case 'search': content = renderBinarySearchViz(); break;
      case 'graph': content = renderGraphTraversalViz(); break;
      case 'dijkstra': content = renderDijkstraViz(); break;
      case 'unionfind': content = renderUnionFindViz(); break;
      case 'topo': content = renderTopoViz(); break;
    }
    const demoModule = { sort: 'sort', dijkstra: 'dijkstra', unionfind: 'uf', topo: 'topo' }[tab];

    return `
    <div class="crumb"><a onclick="CSP.go('home')">首页</a> / <b>算法可视化</b></div>

    <div class="panel">
      <div class="panel-hd"><span class="dot"></span>算法可视化 · 交互式动画演示</div>
      <div class="panel-bd">
        <div class="viz-tabs">
          ${tabs.map(t => `<button class="viz-tab ${vizState.algoTab === t.id ? 'active' : ''}" onclick="CSP.setVizTab('${t.id}')">${t.icon} ${t.label}</button>`).join('')}
        </div>
        ${demoModule ? autoPlayBar(demoModule) : ''}
        ${content}
      </div>
    </div>`;
  }

  // ============================ 基础数据可视化 ============================
  const dataVizState = {
    tab: 'array',
    // 数组
    arrayData: [5, 3, 8, 1, 9, 4, 7, 2, 6],
    arrayHighlight: -1,
    // 栈
    stackData: [10, 20, 30],
    stackOp: '',
    // 队列
    queueData: ['A', 'B', 'C'],
    // 链表
    listData: [1, 2, 3, 4, 5],
    // 二叉树
    treeData: [50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45],
    treeHighlight: -1,
    // 堆
    heapData: [90, 70, 80, 30, 50, 60, 40, 10, 20],
    heapHighlight: -1
  };

  function renderArrayViz() {
    const items = dataVizState.arrayData.map((v, i) => {
      let cls = 'ds-array-item';
      if (i === dataVizState.arrayHighlight) cls += ' highlight';
      return `<div class="${cls}">
        <span class="ds-index">${i}</span>
        <span class="ds-value">${v}</span>
      </div>`;
    }).join('');

    return `
    <div class="viz-section">
      <div class="viz-controls">
        <input type="number" id="arr-input" placeholder="值" style="width:60px;">
        <input type="number" id="arr-idx" placeholder="索引" style="width:60px;">
        <button class="btn btn-primary" onclick="CSP.arrayInsert()">插入</button>
        <button class="btn btn-danger" onclick="CSP.arrayDelete()">删除</button>
        <button class="btn" onclick="CSP.arrayAccess()">访问</button>
        <button class="btn" onclick="CSP.arrayRandom()">? 随机</button>
      </div>
      <div class="viz-info">
        <span>长度: ${dataVizState.arrayData.length}</span>
        <span id="arr-status">${dataVizState.arrayHighlight >= 0 ? `访问索引 ${dataVizState.arrayHighlight} → ${dataVizState.arrayData[dataVizState.arrayHighlight]}` : '就绪'}</span>
      </div>
      <div class="ds-array">${items}</div>
      <div class="ds-note">
        <b>数组</b>：连续存储，O(1)随机访问，O(n)插入/删除。CSP-S中常用于前缀和、差分数组等。
      </div>
      ${renderProblemCard(VIZ_PROBLEMS.array)}
    </div>`;
  }

  function renderStackViz() {
    const items = dataVizState.stackData.map((v, i) => {
      let cls = 'ds-stack-item';
      if (i === dataVizState.stackData.length - 1) cls += ' top';
      return `<div class="${cls}">${v}</div>`;
    }).reverse().join('');

    return `
    <div class="viz-section">
      <div class="viz-controls">
        <input type="number" id="stack-input" placeholder="值" style="width:60px;">
        <button class="btn btn-primary" onclick="CSP.stackPush()">入栈</button>
        <button class="btn btn-danger" onclick="CSP.stackPop()">出栈</button>
        <button class="btn" onclick="CSP.stackPeek()">查看栈顶</button>
      </div>
      <div class="viz-info">
        <span>栈大小: ${dataVizState.stackData.length}</span>
        <span id="stack-status">${dataVizState.stackOp || '就绪'}</span>
      </div>
      <div class="ds-stack">
        ${items || '<div class="ds-empty">栈为空</div>'}
        <div class="ds-stack-base">— 底 —</div>
      </div>
      <div class="ds-note">
        <b>栈</b>：后进先出(LIFO)，O(1)入栈/出栈。CSP-S中用于DFS、表达式求值、括号匹配等。
      </div>
      ${renderProblemCard(VIZ_PROBLEMS.stack)}
    </div>`;
  }

  function renderQueueViz() {
    const items = dataVizState.queueData.map((v, i) => {
      let cls = 'ds-queue-item';
      if (i === 0) cls += ' front';
      if (i === dataVizState.queueData.length - 1) cls += ' rear';
      return `<div class="${cls}">${v}</div>`;
    }).join('');

    return `
    <div class="viz-section">
      <div class="viz-controls">
        <input type="text" id="queue-input" placeholder="值" style="width:60px;">
        <button class="btn btn-primary" onclick="CSP.queueEnqueue()">入队</button>
        <button class="btn btn-danger" onclick="CSP.queueDequeue()">出队</button>
      </div>
      <div class="viz-info">
        <span>队列大小: ${dataVizState.queueData.length}</span>
        <span id="queue-status">就绪</span>
      </div>
      <div class="ds-queue">
        <span class="ds-queue-arrow">出 ←</span>
        ${items || '<div class="ds-empty">队列为空</div>'}
        <span class="ds-queue-arrow">← 入</span>
      </div>
      <div class="ds-note">
        <b>队列</b>：先进先出(FIFO)，O(1)入队/出队。CSP-S中用于BFS、单调队列优化DP等。
      </div>
      ${renderProblemCard(VIZ_PROBLEMS.queue)}
    </div>`;
  }

  function renderLinkedListViz() {
    const items = dataVizState.listData.map((v, i) => {
      return `<div class="ds-list-node">
        <div class="ds-list-val">${v}</div>
        <div class="ds-list-ptr">${i < dataVizState.listData.length - 1 ? '→' : '∅'}</div>
      </div>`;
    }).join('');

    return `
    <div class="viz-section">
      <div class="viz-controls">
        <input type="number" id="list-input" placeholder="值" style="width:60px;">
        <input type="number" id="list-idx" placeholder="位置" style="width:60px;">
        <button class="btn btn-primary" onclick="CSP.listInsert()">插入</button>
        <button class="btn btn-danger" onclick="CSP.listDelete()">删除</button>
      </div>
      <div class="viz-info">
        <span>链表长度: ${dataVizState.listData.length}</span>
      </div>
      <div class="ds-linkedlist">
        <div class="ds-list-head">head →</div>
        ${items || '<div class="ds-empty">链表为空</div>'}
      </div>
      <div class="ds-note">
        <b>链表</b>：O(1)插入/删除（已知位置），O(n)查找。CSP-S中常用前向星存图、邻接表等。
      </div>
      ${renderProblemCard(VIZ_PROBLEMS.list)}
    </div>`;
  }

  // 二叉树可视化（BST结构）
  function buildTreeLayout(data) {
    if (data.length === 0) return { nodes: [], edges: [] };
    // 构建BST
    const root = { val: data[0], left: null, right: null, id: 0 };
    for (let i = 1; i < data.length; i++) {
      let node = root;
      while (true) {
        if (data[i] < node.val) {
          if (!node.left) { node.left = { val: data[i], left: null, right: null, id: i }; break; }
          node = node.left;
        } else {
          if (!node.right) { node.right = { val: data[i], left: null, right: null, id: i }; break; }
          node = node.right;
        }
      }
    }
    // 计算位置（中序遍历分配x坐标）
    const nodes = [];
    const edges = [];
    let xCounter = 0;
    function layout(node, depth) {
      if (!node) return null;
      const leftX = layout(node.left, depth + 1);
      const myX = xCounter++;
      const rightX = layout(node.right, depth + 1);
      nodes.push({ id: node.id, val: node.val, x: myX * 55 + 30, y: depth * 55 + 30 });
      if (node.left) edges.push([node.id, node.left.id]);
      if (node.right) edges.push([node.id, node.right.id]);
      return myX;
    }
    layout(root, 0);
    return { nodes, edges };
  }

  function renderTreeViz() {
    const { nodes, edges } = buildTreeLayout(dataVizState.treeData);
    const maxDepth = Math.max(...nodes.map(n => Math.floor(n.y / 55)), 0);
    const svgW = Math.max(nodes.length * 55 + 60, 400);
    const svgH = (maxDepth + 1) * 55 + 60;

    const edgesSvg = edges.map(([a, b]) => {
      const n1 = nodes.find(n => n.id === a);
      const n2 = nodes.find(n => n.id === b);
      if (!n1 || !n2) return '';
      return `<line class="ds-tree-edge" x1="${n1.x}" y1="${n1.y}" x2="${n2.x}" y2="${n2.y}"/>`;
    }).join('');

    const nodesSvg = nodes.map(n => {
      let cls = 'ds-tree-node';
      if (n.id === dataVizState.treeHighlight) cls += ' highlight';
      return `<g class="${cls}">
        <circle cx="${n.x}" cy="${n.y}" r="18"/>
        <text x="${n.x}" y="${n.y + 4}" text-anchor="middle">${n.val}</text>
      </g>`;
    }).join('');

    return `
    <div class="viz-section">
      <div class="viz-controls">
        <input type="number" id="tree-input" placeholder="值" style="width:60px;">
        <button class="btn btn-primary" onclick="CSP.treeInsert()">插入</button>
        <button class="btn" onclick="CSP.treeRandom()">? 随机</button>
        <button class="btn" onclick="CSP.treeTraverse('pre')">前序</button>
        <button class="btn" onclick="CSP.treeTraverse('in')">中序</button>
        <button class="btn" onclick="CSP.treeTraverse('post')">后序</button>
      </div>
      <div class="viz-info">
        <span>节点数: ${dataVizState.treeData.length}</span>
        <span id="tree-status">就绪</span>
      </div>
      <svg viewBox="0 0 ${svgW} ${svgH}" class="ds-tree-svg">
        ${edgesSvg}
        ${nodesSvg}
      </svg>
      <div class="ds-note">
        <b>二叉搜索树(BST)</b>：左子<根<右子，中序遍历得有序序列。CSP-S中涉及线段树、平衡树等。
      </div>
      ${renderProblemCard(VIZ_PROBLEMS.tree)}
    </div>`;
  }

  // 堆可视化
  function renderHeapViz() {
    const data = dataVizState.heapData;
    if (data.length === 0) return '<div class="ds-empty">堆为空</div>';

    // 堆的树形布局：节点i的子节点为2i+1, 2i+2
    const nodes = [];
    const edges = [];
    const levels = Math.floor(Math.log2(data.length)) + 1;

    function heapX(i, level) {
      const nodesInLevel = Math.pow(2, level);
      const posInLevel = i - (Math.pow(2, level) - 1);
      return (posInLevel + 0.5) * (600 / nodesInLevel);
    }

    for (let i = 0; i < data.length; i++) {
      const level = Math.floor(Math.log2(i + 1));
      nodes.push({ id: i, val: data[i], x: heapX(i, level), y: level * 55 + 30 });
      if (2 * i + 1 < data.length) edges.push([i, 2 * i + 1]);
      if (2 * i + 2 < data.length) edges.push([i, 2 * i + 2]);
    }

    const svgH = levels * 55 + 60;

    const edgesSvg = edges.map(([a, b]) => {
      const n1 = nodes[a], n2 = nodes[b];
      return `<line class="ds-tree-edge" x1="${n1.x}" y1="${n1.y}" x2="${n2.x}" y2="${n2.y}"/>`;
    }).join('');

    const nodesSvg = nodes.map(n => {
      let cls = 'ds-heap-node';
      if (n.id === 0) cls += ' root';
      if (n.id === dataVizState.heapHighlight) cls += ' highlight';
      return `<g class="${cls}">
        <circle cx="${n.x}" cy="${n.y}" r="18"/>
        <text x="${n.x}" y="${n.y + 4}" text-anchor="middle">${n.val}</text>
      </g>`;
    }).join('');

    // 同时显示数组形式
    const arrayView = data.map((v, i) => `<div class="ds-heap-arr-item">${v}</div>`).join('');

    return `
    <div class="viz-section">
      <div class="viz-controls">
        <input type="number" id="heap-input" placeholder="值" style="width:60px;">
        <button class="btn btn-primary" onclick="CSP.heapPush()">插入</button>
        <button class="btn btn-danger" onclick="CSP.heapPop()">弹出堆顶</button>
        <button class="btn" onclick="CSP.heapRandom()">? 随机</button>
      </div>
      <div class="viz-info">
        <span>堆大小: ${data.length}</span>
        <span id="heap-status">大根堆</span>
      </div>
      <svg viewBox="0 0 600 ${svgH}" class="ds-tree-svg">
        ${edgesSvg}
        ${nodesSvg}
      </svg>
      <div class="ds-heap-array">
        <span style="font-size:12px;color:var(--text-3);">数组表示：</span>
        ${arrayView}
      </div>
      <div class="ds-note">
        <b>大根堆</b>：父节点≥子节点，O(log n)插入/弹出。CSP-S中用于Dijkstra优先队列、堆排序等。
      </div>
      ${renderProblemCard(VIZ_PROBLEMS.heap)}
    </div>`;
  }

  // 单调栈可视化 - 求每个元素右边第一个更大元素
  const monoStackState = { data: [3, 1, 4, 1, 5, 9, 2, 6], stack: [], result: [], current: -1, step: 0 };

  function renderMonoStackViz() {
    const arr = monoStackState.data;
    const items = arr.map((v, i) => {
      let cls = 'ds-array-item';
      if (i === monoStackState.current) cls += ' highlight';
      if (monoStackState.result[i] !== undefined) cls += ' sorted';
      return `<div class="${cls}">
        <span class="ds-index">${i}</span>
        <span class="ds-value">${v}</span>
      </div>`;
    }).join('');

    const stackItems = monoStackState.stack.length > 0
      ? monoStackState.stack.map((idx, i) => {
          let cls = 'ds-stack-item';
          if (i === monoStackState.stack.length - 1) cls += ' top';
          return `<div class="${cls}">[${idx}]=${arr[idx]}</div>`;
        }).reverse().join('')
      : '<div class="ds-empty">栈为空</div>';

    const resultItems = arr.map((v, i) => {
      const r = monoStackState.result[i];
      return `<div class="ds-array-item ${r !== undefined ? 'sorted' : ''}">
        <span class="ds-index">${i}</span>
        <span class="ds-value">${r !== undefined ? arr[r] : '?'}</span>
      </div>`;
    }).join('');

    return `
    <div class="viz-section">
      <div class="viz-controls">
        <button class="btn btn-primary" onclick="CSP.monoStackStep()">⏭ 下一步</button>
        <button class="btn" onclick="CSP.monoStackReset()">↻ 重置</button>
        <button class="btn" onclick="CSP.monoStackRandom()">? 随机数据</button>
      </div>
      <div class="viz-info">
        <span>当前: ${monoStackState.current >= 0 ? `[${monoStackState.current}]=${arr[monoStackState.current]}` : '就绪'}</span>
        <span>栈大小: ${monoStackState.stack.length}</span>
        <span id="ms-status">${monoStackState.step >= arr.length ? '完成' : '处理中'}</span>
      </div>
      <div style="font-size:13px;color:var(--text-2);margin-bottom:4px;">输入数组：</div>
      <div class="ds-array">${items}</div>
      <div style="font-size:13px;color:var(--text-2);margin-bottom:4px;margin-top:8px;">单调栈（递减）：</div>
      <div class="ds-stack">${stackItems}<div class="ds-stack-base">— 底 —</div></div>
      <div style="font-size:13px;color:var(--text-2);margin-bottom:4px;margin-top:8px;">结果（右边第一个更大）：</div>
      <div class="ds-array">${resultItems}</div>
      <div class="ds-note">
        <b>单调栈</b>：维护递减栈，弹出时记录答案。O(n)求每个元素右边第一个更大元素。CSP-S中常用于求最近更大/更小元素。
      </div>
      ${renderProblemCard(VIZ_PROBLEMS.stack)}
    </div>`;
  }

  // 单调队列可视化 - 滑动窗口最值
  const monoQueueState = { data: [1, 3, -1, 5, 3, 6, 7], window: 3, queue: [], current: -1, result: [] };

  function renderMonoQueueViz() {
    const arr = monoQueueState.data;
    const w = monoQueueState.window;

    const items = arr.map((v, i) => {
      let cls = 'ds-array-item';
      if (i === monoQueueState.current) cls += ' highlight';
      const inWindow = i >= monoQueueState.current - w + 1 && i <= monoQueueState.current;
      if (inWindow && monoQueueState.current >= 0) cls += ' swapping';
      return `<div class="${cls}">
        <span class="ds-index">${i}</span>
        <span class="ds-value">${v}</span>
      </div>`;
    }).join('');

    const queueItems = monoQueueState.queue.length > 0
      ? monoQueueState.queue.map((idx, i) => {
          let cls = 'ds-queue-item';
          if (i === 0) cls += ' front';
          return `<div class="${cls}">[${idx}]=${arr[idx]}</div>`;
        }).join('')
      : '<div class="ds-empty">队列为空</div>';

    const resultItems = monoQueueState.result.map((v, i) => `<div class="ds-queue-item front">${v}</div>`).join('');

    return `
    <div class="viz-section">
      <div class="viz-controls">
        <label style="font-size:12px;color:var(--text-2);">窗口大小</label>
        <input type="number" id="mq-window" value="${w}" min="1" max="${arr.length}" style="width:50px;" onchange="CSP.monoQueueSetWindow(this.value)">
        <button class="btn btn-primary" onclick="CSP.monoQueueStep()">⏭ 下一步</button>
        <button class="btn" onclick="CSP.monoQueueReset()">↻ 重置</button>
        <button class="btn" onclick="CSP.monoQueueRandom()">? 随机数据</button>
      </div>
      <div class="viz-info">
        <span>当前: ${monoQueueState.current >= 0 ? `[${monoQueueState.current}]=${arr[monoQueueState.current]}` : '就绪'}</span>
        <span>窗口: [${Math.max(0, monoQueueState.current - w + 1)}, ${monoQueueState.current}]</span>
        <span id="mq-status">${monoQueueState.current >= arr.length - 1 ? '完成' : '处理中'}</span>
      </div>
      <div style="font-size:13px;color:var(--text-2);margin-bottom:4px;">输入数组：</div>
      <div class="ds-array">${items}</div>
      <div style="font-size:13px;color:var(--text-2);margin-bottom:4px;margin-top:8px;">单调队列（递减，队首=窗口最大）：</div>
      <div class="ds-queue">${queueItems}</div>
      <div style="font-size:13px;color:var(--text-2);margin-bottom:4px;margin-top:8px;">每个窗口最大值：</div>
      <div class="ds-queue">${resultItems || '<div class="ds-empty">无</div>'}</div>
      <div class="ds-note">
        <b>单调队列</b>：维护递减队列，队首始终是窗口内最大值。O(n)求滑动窗口最值。CSP-S中常用于优化DP转移。
      </div>
      ${renderProblemCard(VIZ_PROBLEMS.queue)}
    </div>`;
  }

  // 线段树可视化 - 区间求和
  const segTreeState = { data: [2, 5, 1, 4, 3, 7, 6, 8], tree: [], queryL: -1, queryR: -1, highlight: [] };

  function buildSegTree() {
    const n = segTreeState.data.length;
    const tree = new Array(4 * n).fill(0);
    function build(node, lo, hi) {
      if (lo === hi) { tree[node] = segTreeState.data[lo]; return; }
      const mid = Math.floor((lo + hi) / 2);
      build(node * 2, lo, mid);
      build(node * 2 + 1, mid + 1, hi);
      tree[node] = tree[node * 2] + tree[node * 2 + 1];
    }
    build(1, 0, n - 1);
    segTreeState.tree = tree;
  }

  function renderSegTreeViz() {
    if (segTreeState.tree.length === 0) buildSegTree();
    const n = segTreeState.data.length;
    const data = segTreeState.data;

    // 数据数组
    const dataItems = data.map((v, i) => {
      let cls = 'ds-array-item';
      if (i >= segTreeState.queryL && i <= segTreeState.queryR && segTreeState.queryL >= 0) cls += ' highlight';
      return `<div class="${cls}"><span class="ds-index">${i}</span><span class="ds-value">${v}</span></div>`;
    }).join('');

    // 树形SVG布局
    const levels = Math.ceil(Math.log2(n + 1)) + 1;
    const nodes = [];
    const edges = [];
    function layout(node, lo, hi, level, xStart, xEnd) {
      const x = (xStart + xEnd) / 2;
      const y = level * 50 + 25;
      const val = segTreeState.tree[node] || 0;
      const isLeaf = lo === hi;
      let isHighlight = false;
      if (segTreeState.queryL >= 0) {
        if (lo >= segTreeState.queryL && hi <= segTreeState.queryR) isHighlight = true;
      }
      nodes.push({ x, y, val, isLeaf, isHighlight, node, lo, hi });
      if (!isLeaf) {
        const mid = Math.floor((lo + hi) / 2);
        const xMid = (xStart + xEnd) / 2;
        layout(node * 2, lo, mid, level + 1, xStart, xMid);
        layout(node * 2 + 1, mid + 1, hi, level + 1, xMid, xEnd);
        const leftChild = nodes.find(n => n.node === node * 2);
        const rightChild = nodes.find(n => n.node === node * 2 + 1);
        if (leftChild) edges.push([x, y, leftChild.x, leftChild.y]);
        if (rightChild) edges.push([x, y, rightChild.x, rightChild.y]);
      }
    }
    layout(1, 0, n - 1, 0, 0, 600);

    const svgW = 620, svgH = levels * 50 + 40;
    const edgesSvg = edges.map(([x1, y1, x2, y2]) => `<line class="ds-tree-edge" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`).join('');
    const nodesSvg = nodes.map(n => {
      let cls = 'seg-node';
      if (n.isLeaf) cls += ' leaf';
      if (n.isHighlight) cls += ' highlight';
      return `<g class="${cls}">
        <circle cx="${n.x}" cy="${n.y}" r="16"/>
        <text x="${n.x}" y="${n.y + 4}" text-anchor="middle">${n.val}</text>
      </g>`;
    }).join('');

    return `
    <div class="viz-section">
      <div class="viz-controls">
        <input type="number" id="seg-l" placeholder="左端" style="width:50px;" min="0" max="${n-1}">
        <input type="number" id="seg-r" placeholder="右端" style="width:50px;" min="0" max="${n-1}">
        <button class="btn btn-primary" onclick="CSP.segQuery()">区间查询</button>
        <button class="btn" onclick="CSP.segReset()">↻ 重置</button>
        <button class="btn" onclick="CSP.segRandom()">? 随机数据</button>
      </div>
      <div class="viz-info">
        <span>数据长度: ${n}</span>
        <span id="seg-status">${segTreeState.queryL >= 0 ? `查询区间 [${segTreeState.queryL}, ${segTreeState.queryR}]` : '就绪'}</span>
      </div>
      <div style="font-size:13px;color:var(--text-2);margin-bottom:4px;">原始数据：</div>
      <div class="ds-array">${dataItems}</div>
      <div style="font-size:13px;color:var(--text-2);margin-bottom:4px;margin-top:8px;">线段树（区间求和）：</div>
      <svg viewBox="0 0 ${svgW} ${svgH}" class="ds-tree-svg">
        ${edgesSvg}
        ${nodesSvg}
      </svg>
      <div class="viz-legend">
        <span class="legend-item"><i class="legend-color sorted"></i>覆盖区间</span>
        <span class="legend-item"><i class="legend-color mid"></i>叶子节点</span>
      </div>
      <div class="ds-note">
        <b>线段树</b>：O(n)建树，O(log n)区间查询/单点更新。支持区间求和、最值等。CSP-S中常用于区间操作问题。
      </div>
      ${renderProblemCard(VIZ_PROBLEMS.tree)}
    </div>`;
  }

  // DP可视化 - LIS最长递增子序列
  const dpState = { data: [3, 1, 4, 1, 5, 9, 2, 6], dp: [], prev: [], current: -1, best: -1 };

  function renderLisViz() {
    const arr = dpState.data;
    if (dpState.dp.length === 0) {
      dpState.dp = arr.map(() => 1);
      dpState.prev = arr.map(() => -1);
    }

    const items = arr.map((v, i) => {
      let cls = 'ds-array-item';
      if (i === dpState.current) cls += ' highlight';
      if (dpState.best >= 0 && i === dpState.best) cls += ' sorted';
      return `<div class="${cls}"><span class="ds-index">${i}</span><span class="ds-value">${v}</span></div>`;
    }).join('');

    const dpItems = dpState.dp.map((v, i) => {
      let cls = 'ds-array-item';
      if (i === dpState.current) cls += ' highlight';
      return `<div class="${cls}"><span class="ds-index">dp[${i}]</span><span class="ds-value">${v}</span></div>`;
    }).join('');

    // LIS路径回溯
    let path = [];
    if (dpState.best >= 0) {
      let cur = dpState.best;
      while (cur !== -1) { path.unshift(cur); cur = dpState.prev[cur]; }
    }
    const pathLabels = path.length > 0 ? path.map(i => `${arr[i]}`).join(' → ') : '未计算';

    return `
    <div class="viz-section">
      <div class="viz-controls">
        <button class="btn btn-primary" onclick="CSP.lisStep()">⏭ 下一步</button>
        <button class="btn" onclick="CSP.lisReset()">↻ 重置</button>
        <button class="btn" onclick="CSP.lisRandom()">? 随机数据</button>
      </div>
      <div class="viz-info">
        <span>当前: ${dpState.current >= 0 ? `[${dpState.current}]=${arr[dpState.current]}` : '就绪'}</span>
        <span>LIS长度: ${dpState.best >= 0 ? dpState.dp[dpState.best] : '?'}</span>
        <span id="lis-status">${dpState.current >= arr.length ? '完成' : '计算中'}</span>
      </div>
      <div style="font-size:13px;color:var(--text-2);margin-bottom:4px;">输入数组：</div>
      <div class="ds-array">${items}</div>
      <div style="font-size:13px;color:var(--text-2);margin-bottom:4px;margin-top:8px;">DP数组（dp[i]=以i结尾的LIS长度）：</div>
      <div class="ds-array">${dpItems}</div>
      <div style="font-size:13px;color:var(--text-2);margin-bottom:4px;margin-top:8px;">LIS路径：${pathLabels}</div>
      <div class="ds-note">
        <b>LIS（最长递增子序列）</b>：dp[i]=max(dp[j])+1（j<i且a[j]<a[i]）。O(n²)朴素或O(nlogn)二分优化。CSP-S经典DP题型。
      </div>
      ${renderProblemCard(VIZ_PROBLEMS.dp)}
    </div>`;
  }

  // DP可视化 - 01背包
  const knapState = { items: [[3,4],[4,5],[2,3],[5,6],[1,1]], capacity: 8, dp: [], current: -1 };

  function renderKnapsackViz() {
    const items = knapState.items;
    const W = knapState.capacity;
    const n = items.length;

    if (knapState.dp.length === 0) {
      knapState.dp = new Array(n + 1).fill(null).map(() => new Array(W + 1).fill(0));
    }

    // 物品列表
    const itemRows = items.map((v, i) => {
      let cls = '';
      if (i === knapState.current) cls = 'highlight';
      return `<tr class="${cls}"><td>${i+1}</td><td>${v[0]}</td><td>${v[1]}</td></tr>`;
    }).join('');

    // DP表格
    const dpTable = knapState.dp.map((row, i) => {
      const cells = row.map((v, j) => {
        let cls = 'dp-cell';
        if (i === knapState.current + 1) cls += ' current-row';
        if (i <= knapState.current + 1 && knapState.current >= 0) cls += ' computed';
        return `<td class="${cls}">${v}</td>`;
      }).join('');
      return `<tr><td class="dp-row-label">${i === 0 ? '0' : `物品${i}`}</td>${cells}</tr>`;
    }).join('');

    const colHeaders = Array.from({length: W + 1}, (_, j) => `<th>${j}</th>`).join('');

    return `
    <div class="viz-section">
      <div class="viz-controls">
        <label style="font-size:12px;color:var(--text-2);">背包容量</label>
        <input type="number" id="knap-cap" value="${W}" min="1" max="20" style="width:50px;" onchange="CSP.knapSetCap(this.value)">
        <button class="btn btn-primary" onclick="CSP.knapStep()">⏭ 下一步</button>
        <button class="btn" onclick="CSP.knapReset()">↻ 重置</button>
      </div>
      <div class="viz-info">
        <span>当前物品: ${knapState.current >= 0 ? `物品${knapState.current+1} (w=${items[knapState.current]?.[0]}, v=${items[knapState.current]?.[1]})` : '就绪'}</span>
        <span>最大价值: ${knapState.current >= n - 1 ? knapState.dp[n][W] : '计算中'}</span>
      </div>
      <div style="font-size:13px;color:var(--text-2);margin-bottom:4px;">物品列表（重量, 价值）：</div>
      <table class="tbl">
        <thead><tr><th>编号</th><th>重量</th><th>价值</th></tr></thead>
        <tbody>${itemRows}</tbody>
      </table>
      <div style="font-size:13px;color:var(--text-2);margin-bottom:4px;margin-top:8px;">DP表格（行=前i个物品，列=容量j）：</div>
      <div class="dp-table-wrap">
        <table class="tbl dp-table">
          <thead><tr><th></th>${colHeaders}</tr></thead>
          <tbody>${dpTable}</tbody>
        </table>
      </div>
      <div class="ds-note">
        <b>01背包</b>：dp[i][j]=max(dp[i-1][j], dp[i-1][j-w[i]]+v[i])。O(nW)时间空间，可滚动数组优化空间至O(W)。CSP-S经典DP题型。
      </div>
      ${renderProblemCard(VIZ_PROBLEMS.dp)}
    </div>`;
  }

  function renderDataViz() {
    const tabs = [
      { id: 'array', label: '数组', icon: 'EX' },
      { id: 'stack', label: '栈', icon: '' },
      { id: 'monostack', label: '单调栈', icon: '' },
      { id: 'queue', label: '队列', icon: '→' },
      { id: 'monoqueue', label: '单调队列', icon: 'DP' },
      { id: 'list', label: '链表', icon: '' },
      { id: 'tree', label: '二叉树', icon: 'TR' },
      { id: 'heap', label: '堆', icon: '^️' },
      { id: 'segtree', label: '线段树', icon: '' }
    ];

    let content = '';
    switch (dataVizState.tab) {
      case 'array': content = renderArrayViz(); break;
      case 'stack': content = renderStackViz(); break;
      case 'monostack': content = renderMonoStackViz(); break;
      case 'queue': content = renderQueueViz(); break;
      case 'monoqueue': content = renderMonoQueueViz(); break;
      case 'list': content = renderLinkedListViz(); break;
      case 'tree': content = renderTreeViz(); break;
      case 'heap': content = renderHeapViz(); break;
      case 'segtree': content = renderSegTreeViz(); break;
    }

    return `
    <div class="crumb"><a onclick="CSP.go('home')">首页</a> / <b>数据结构可视化</b></div>

    <div class="panel">
      <div class="panel-hd"><span class="dot"></span>数据结构可视化 · 交互式操作演示</div>
      <div class="panel-bd">
        <div class="viz-tabs">
          ${tabs.map(t => `<button class="viz-tab ${dataVizState.tab === t.id ? 'active' : ''}" onclick="CSP.setDataVizTab('${t.id}')">${t.icon} ${t.label}</button>`).join('')}
        </div>
        ${autoPlayBar(dataVizState.tab)}
        ${content}
      </div>
    </div>`;
  }

  // ============================ 路由 ============================
  function render() {
    const main = $('#main');
    const hash = location.hash.slice(1) || 'home';
    const parts = hash.split('#');
    state.view = parts[0];

    // 更新导航高亮
    $$('.nav-links a').forEach(a => {
      a.classList.toggle('active', a.dataset.view === state.view);
    });

    let content = '';
    switch (state.view) {
      case 'home': content = renderHome(); break;
      case 'templates': content = renderTemplates(); break;
      case 'problems': content = renderProblems(); break;
      case 'strategy': content = renderStrategy(); break;
      case 'starmap': content = renderGraph(); break;
      case 'flashcard': content = renderFlashcard(); break;
      case 'progress': content = renderProgress(); break;
      case 'complexity': content = renderComplexity(); break;
      case 'visualizer': content = renderVisualizer(); break;
      case 'dataviz': content = renderDataViz(); break;
      case 'dpviz': content = renderDPViz(); break;
      case 'exam': content = renderExam(); break;
      default: content = renderHome();
    }
    main.innerHTML = content;
    // innerHTML 插入的 <script> 不会自动执行，需手动提取并运行
    main.querySelectorAll('script').forEach(oldScript => {
      const newScript = document.createElement('script');
      if (oldScript.src) newScript.src = oldScript.src;
      else newScript.textContent = oldScript.textContent;
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
    // 页面切换动画
    main.classList.remove('view-enter');
    void main.offsetWidth; // 触发重排
    main.classList.add('view-enter');

    // 重新初始化滚动揭示
    initScrollReveal();

    // 滚动到锚点
    if (parts[1]) {
      setTimeout(() => {
        const el = document.getElementById(parts[1]);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }

  // ============================ 快速导航面板 ============================
  function renderQuickPanel() {
    const panel = $('#quick-panel');
    const toggle = $('#quick-toggle');
    if (state.quickPanelOpen) {
      panel.classList.remove('hidden');
      toggle.classList.add('hidden');
    } else {
      panel.classList.add('hidden');
      toggle.classList.remove('hidden');
    }
  }

  // ============================ 闪卡交互 ============================
  function flipCard() {
    flashcardState.flipped = !flashcardState.flipped;
    render();
  }

  function markCard(correct) {
    flashcardState.total++;
    if (correct) flashcardState.correct++;
    nextCard();
  }

  function nextCard() {
    flashcardState.current = (flashcardState.current + 1) % flashcardState.order.length;
    flashcardState.flipped = false;
    render();
  }

  // ============================ 可视化交互函数 ============================
  // 排序可视化
  function setAlgo(algo) { vizState.algo = algo; vizState.sorted = []; vizState.stepIdx = 0; vizState.steps = getAlgoSteps(algo, vizState.data); render(); }
  function setVizSpeed(v) { vizState.speed = parseInt(v); }
  function setVizTab(tab) { vizState.algoTab = tab; render(); }
  function vizPlay() {
    if (vizState.data.length === 0) { vizState.data = genVizData(10); vizState.steps = getAlgoSteps(vizState.algo, vizState.data); }
    if (vizState.steps.length === 0) vizState.steps = getAlgoSteps(vizState.algo, vizState.data);
    vizState.playing = true;
    render();
    // 使用 requestAnimationFrame + 时间累加器，消除卡顿
    let lastTime = 0;
    let acc = 0;
    function tick(now) {
      if (!vizState.playing) return;
      if (!lastTime) lastTime = now;
      const dt = now - lastTime;
      lastTime = now;
      acc += dt;
      while (acc >= vizState.speed && vizState.stepIdx < vizState.steps.length - 1) {
        acc -= vizState.speed;
        vizState.stepIdx++;
        const step = vizState.steps[vizState.stepIdx];
        if (step.type === 'sorted') vizState.sorted.push(step.index);
      }
      if (vizState.stepIdx >= vizState.steps.length - 1) {
        vizPause();
        return;
      }
      // 只更新排序条形图，避免全量render
      updateSortBars();
      vizState.timer = requestAnimationFrame(tick);
    }
    vizState.timer = requestAnimationFrame(tick);
  }
  // 增量更新排序条形图，避免全量render卡顿
  function updateSortBars() {
    const container = $('#sort-bars');
    if (!container) { render(); return; }
    const step = vizState.steps[vizState.stepIdx];
    if (!step) return;
    const bars = container.querySelectorAll('.bar-item');
    const data = step.array || vizState.data;
    const maxVal = Math.max(...data, 1);
    bars.forEach((bar, i) => {
      if (i < data.length) {
        const h = Math.max(4, (data[i] / maxVal) * 180);
        bar.style.height = h + 'px';
        const val = bar.querySelector('.bar-val');
        if (val) val.textContent = data[i];
        bar.classList.remove('comparing', 'swapping', 'sorted', 'pivot');
        if (step.type === 'compare' && step.indices && step.indices.includes(i)) bar.classList.add('comparing');
        if (step.type === 'swap' && step.indices && step.indices.includes(i)) bar.classList.add('swapping');
        if (step.type === 'overwrite' && step.index === i) bar.classList.add('swapping');
        if (step.type === 'pivot' && step.pivot === i) bar.classList.add('pivot');
        if (vizState.sorted.includes(i) || (step.type === 'sorted' && step.index === i) || step.type === 'done') bar.classList.add('sorted');
      }
    });
    // 更新状态文本
    const status = $('#sort-status');
    if (status) status.textContent = `步骤: ${vizState.stepIdx + 1} / ${vizState.steps.length}`;
    const vizStatus = $('#viz-status');
    if (vizStatus) {
      const labels = { compare: '比较', swap: '交换', sorted: '已排序', pivot: '选基准', overwrite: '写入', done: '完成', idle: '就绪' };
      vizStatus.textContent = labels[step.type] || '就绪';
    }
  }
  function vizPause() { vizState.playing = false; if (vizState.timer) { cancelAnimationFrame(vizState.timer); clearInterval(vizState.timer); vizState.timer = null; } render(); }
  function vizStep() {
    if (vizState.data.length === 0) { vizState.data = genVizData(10); vizState.steps = getAlgoSteps(vizState.algo, vizState.data); }
    if (vizState.stepIdx < vizState.steps.length - 1) {
      vizState.stepIdx++;
      const step = vizState.steps[vizState.stepIdx];
      if (step.type === 'sorted') vizState.sorted.push(step.index);
      render();
    }
  }
  function vizReset() { vizPause(); vizState.stepIdx = 0; vizState.sorted = []; render(); }
  function vizShuffle() { vizPause(); vizState.data = genVizData(10); vizState.steps = getAlgoSteps(vizState.algo, vizState.data); vizState.stepIdx = 0; vizState.sorted = []; render(); }

  // 二分查找
  function setBsTarget(v) { vizState.bsTarget = parseInt(v) || 0; }
  function bsSearch() {
    const arr = [...vizState.data].sort((a, b) => a - b);
    vizState.bsLeft = 0; vizState.bsRight = arr.length - 1; vizState.bsMid = 0; vizState.bsFound = false;
    render();
  }
  function bsStep() {
    const arr = [...vizState.data].sort((a, b) => a - b);
    if (vizState.bsLeft > vizState.bsRight) return;
    vizState.bsMid = Math.floor((vizState.bsLeft + vizState.bsRight) / 2);
    if (arr[vizState.bsMid] === vizState.bsTarget) {
      vizState.bsFound = true;
    } else if (arr[vizState.bsMid] < vizState.bsTarget) {
      vizState.bsLeft = vizState.bsMid + 1;
    } else {
      vizState.bsRight = vizState.bsMid - 1;
    }
    render();
  }
  function bsReset() { vizState.bsLeft = 0; vizState.bsRight = vizState.data.length - 1; vizState.bsMid = 0; vizState.bsFound = false; render(); }

  // 图遍历
  function setGraphMode(m) { vizState.graphMode = m; graphTraverseReset(); }
  function graphTraverseStart() { graphTraverseReset(); graphTraverseStep(); }
  function graphTraverseStep() {
    if (vizState.graphNodes.length === 0) initGraphViz();
    if (vizState.visited.length === 0 && vizState.queue.length === 0) {
      vizState.queue = [0];
    }
    if (vizState.queue.length === 0) return;
    const node = vizState.queue.shift();
    if (vizState.visited.includes(node)) { graphTraverseStep(); return; }
    vizState.visited.push(node);
    vizState.currentGraphNode = node;
    const neighbors = vizState.graphAdj[node] || [];
    if (vizState.graphMode === 'bfs') {
      neighbors.forEach(n => { if (!vizState.visited.includes(n) && !vizState.queue.includes(n)) vizState.queue.push(n); });
    } else {
      neighbors.reverse().forEach(n => { if (!vizState.visited.includes(n) && !vizState.queue.includes(n)) vizState.queue.unshift(n); });
    }
    render();
  }
  function graphTraverseReset() { vizState.visited = []; vizState.queue = []; vizState.currentGraphNode = -1; render(); }

  // 数据结构可视化
  function setDataVizTab(tab) { dataVizState.tab = tab; render(); }

  // 数组操作
  function arrayInsert() {
    const val = parseInt($('#arr-input')?.value);
    const idx = parseInt($('#arr-idx')?.value);
    if (isNaN(val)) return;
    if (isNaN(idx) || idx < 0 || idx > dataVizState.arrayData.length) dataVizState.arrayData.push(val);
    else dataVizState.arrayData.splice(idx, 0, val);
    dataVizState.arrayHighlight = -1;
    render();
  }
  function arrayDelete() {
    const idx = parseInt($('#arr-idx')?.value);
    if (isNaN(idx) || idx < 0 || idx >= dataVizState.arrayData.length) return;
    dataVizState.arrayData.splice(idx, 1);
    dataVizState.arrayHighlight = -1;
    render();
  }
  function arrayAccess() {
    const idx = parseInt($('#arr-idx')?.value);
    if (isNaN(idx) || idx < 0 || idx >= dataVizState.arrayData.length) return;
    dataVizState.arrayHighlight = idx;
    render();
  }
  function arrayRandom() { dataVizState.arrayData = genVizData(9); dataVizState.arrayHighlight = -1; render(); }

  // 栈操作
  function stackPush() {
    const val = parseInt($('#stack-input')?.value);
    if (isNaN(val)) return;
    dataVizState.stackData.push(val);
    dataVizState.stackOp = `入栈 ${val}`;
    render();
  }
  function stackPop() {
    if (dataVizState.stackData.length === 0) { dataVizState.stackOp = '栈为空'; render(); return; }
    const v = dataVizState.stackData.pop();
    dataVizState.stackOp = `出栈 ${v}`;
    render();
  }
  function stackPeek() {
    if (dataVizState.stackData.length === 0) { dataVizState.stackOp = '栈为空'; render(); return; }
    dataVizState.stackOp = `栈顶 = ${dataVizState.stackData[dataVizState.stackData.length - 1]}`;
    render();
  }

  // 队列操作
  function queueEnqueue() {
    const val = $('#queue-input')?.value;
    if (!val) return;
    dataVizState.queueData.push(val);
    render();
  }
  function queueDequeue() {
    if (dataVizState.queueData.length === 0) return;
    dataVizState.queueData.shift();
    render();
  }

  // 链表操作
  function listInsert() {
    const val = parseInt($('#list-input')?.value);
    const idx = parseInt($('#list-idx')?.value);
    if (isNaN(val)) return;
    if (isNaN(idx) || idx < 0 || idx > dataVizState.listData.length) dataVizState.listData.push(val);
    else dataVizState.listData.splice(idx, 0, val);
    render();
  }
  function listDelete() {
    const idx = parseInt($('#list-idx')?.value);
    if (isNaN(idx) || idx < 0 || idx >= dataVizState.listData.length) return;
    dataVizState.listData.splice(idx, 1);
    render();
  }

  // 二叉树操作
  function treeInsert() {
    const val = parseInt($('#tree-input')?.value);
    if (isNaN(val)) return;
    dataVizState.treeData.push(val);
    render();
  }
  function treeRandom() { dataVizState.treeData = genVizData(8); render(); }
  function treeTraverse(order) {
    const { nodes } = buildTreeLayout(dataVizState.treeData);
    // 简单显示遍历顺序提示
    const labels = { 'pre': '前序遍历: 根→左→右', 'in': '中序遍历: 左→根→右 (有序)', 'post': '后序遍历: 左→右→根' };
    const statusEl = $('#tree-status');
    if (statusEl) statusEl.textContent = labels[order];
  }

  // 堆操作
  function heapPush() {
    const val = parseInt($('#heap-input')?.value);
    if (isNaN(val)) return;
    dataVizState.heapData.push(val);
    // 上浮调整
    let i = dataVizState.heapData.length - 1;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (dataVizState.heapData[parent] < dataVizState.heapData[i]) {
        [dataVizState.heapData[parent], dataVizState.heapData[i]] = [dataVizState.heapData[i], dataVizState.heapData[parent]];
        i = parent;
      } else break;
    }
    render();
  }
  function heapPop() {
    if (dataVizState.heapData.length === 0) return;
    dataVizState.heapData[0] = dataVizState.heapData[dataVizState.heapData.length - 1];
    dataVizState.heapData.pop();
    // 下沉调整
    let i = 0;
    const n = dataVizState.heapData.length;
    while (true) {
      let largest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && dataVizState.heapData[l] > dataVizState.heapData[largest]) largest = l;
      if (r < n && dataVizState.heapData[r] > dataVizState.heapData[largest]) largest = r;
      if (largest !== i) {
        [dataVizState.heapData[i], dataVizState.heapData[largest]] = [dataVizState.heapData[largest], dataVizState.heapData[i]];
        i = largest;
      } else break;
    }
    render();
  }
  function heapRandom() { dataVizState.heapData = genVizData(9); render(); }

  // === 单调栈交互 ===
  function monoStackStep() {
    const arr = monoStackState.data;
    if (monoStackState.step >= arr.length) return;
    monoStackState.current = monoStackState.step;
    const i = monoStackState.step;
    // 弹出栈顶比当前小的
    while (monoStackState.stack.length > 0 && arr[monoStackState.stack[monoStackState.stack.length - 1]] < arr[i]) {
      const top = monoStackState.stack.pop();
      monoStackState.result[top] = i;
    }
    monoStackState.stack.push(i);
    monoStackState.step++;
    if (monoStackState.step >= arr.length) {
      // 栈中剩余元素没有更大元素
      while (monoStackState.stack.length > 0) {
        monoStackState.result[monoStackState.stack.pop()] = -1;
      }
      // 找最长LIS的best
      let bestLen = 0, bestIdx = 0;
      for (let k = 0; k < arr.length; k++) {
        if (monoStackState.result[k] !== -1 && arr[monoStackState.result[k]] > bestLen) {
          bestLen = arr[monoStackState.result[k]];
          bestIdx = k;
        }
      }
    }
    render();
  }
  function monoStackReset() {
    monoStackState.stack = []; monoStackState.result = []; monoStackState.current = -1; monoStackState.step = 0;
    render();
  }
  function monoStackRandom() {
    monoStackState.data = genVizData(8);
    monoStackReset();
  }

  // === 单调队列交互 ===
  function monoQueueStep() {
    const arr = monoQueueState.data;
    const w = monoQueueState.window;
    if (monoQueueState.current >= arr.length - 1) return;
    monoQueueState.current++;
    const i = monoQueueState.current;
    // 弹出队尾比当前小的
    while (monoQueueState.queue.length > 0 && arr[monoQueueState.queue[monoQueueState.queue.length - 1]] <= arr[i]) {
      monoQueueState.queue.pop();
    }
    monoQueueState.queue.push(i);
    // 弹出队首超出窗口的
    while (monoQueueState.queue.length > 0 && monoQueueState.queue[0] < i - w + 1) {
      monoQueueState.queue.shift();
    }
    // 记录窗口最大值
    if (i >= w - 1) {
      monoQueueState.result.push(arr[monoQueueState.queue[0]]);
    }
    render();
  }
  function monoQueueReset() {
    monoQueueState.queue = []; monoQueueState.current = -1; monoQueueState.result = [];
    render();
  }
  function monoQueueRandom() {
    monoQueueState.data = genVizData(7);
    monoQueueReset();
  }
  function monoQueueSetWindow(v) {
    monoQueueState.window = Math.max(1, Math.min(v, monoQueueState.data.length));
    monoQueueReset();
  }

  // === 线段树交互 ===
  function segQuery() {
    const l = parseInt($('#seg-l')?.value || '0');
    const r = parseInt($('#seg-r')?.value || '0');
    const n = segTreeState.data.length;
    if (l < 0 || r >= n || l > r) { alert('请输入合法区间'); return; }
    segTreeState.queryL = l; segTreeState.queryR = r;
    render();
  }
  function segReset() {
    segTreeState.queryL = -1; segTreeState.queryR = -1; segTreeState.tree = [];
    render();
  }
  function segRandom() {
    segTreeState.data = genVizData(8);
    segTreeState.tree = []; segTreeState.queryL = -1; segTreeState.queryR = -1;
    render();
  }

  // === Dijkstra 播放控制 ===
  function dijkstraStep() {
    if (dijkstraState.steps.length === 0) dijkstraCompute();
    if (dijkstraState.stepIdx < dijkstraState.steps.length - 1) {
      dijkstraState.stepIdx++;
      const step = dijkstraState.steps[dijkstraState.stepIdx];
      dijkstraState.dist = step.dist;
      dijkstraState.visited = step.visited;
      if (step.type === 'visit') dijkstraState.current = step.node;
      render();
    }
  }
  function dijkstraPlay() {
    if (dijkstraState.steps.length === 0) dijkstraCompute();
    dijkstraState.playing = true;
    if (dijkstraState.timer) clearInterval(dijkstraState.timer);
    dijkstraState.timer = setInterval(() => {
      if (dijkstraState.stepIdx >= dijkstraState.steps.length - 1) {
        dijkstraPause(); return;
      }
      dijkstraStep();
    }, vizState.speed || 600);
    render();
  }
  function dijkstraPause() {
    dijkstraState.playing = false;
    if (dijkstraState.timer) { clearInterval(dijkstraState.timer); dijkstraState.timer = null; }
    render();
  }
  function dijkstraReset() {
    dijkstraPause();
    dijkstraState.stepIdx = 0;
    initDijkstra();
    render();
  }

  // === 拓扑排序 控制 ===
  function topoStep() {
    if (topoState.queue.length === 0) return;
    const node = topoState.queue.shift();
    topoState.current = node;
    topoState.result.push(node);
    topoState.adj[node].forEach(next => {
      topoState.inDegree[next]--;
      if (topoState.inDegree[next] === 0) topoState.queue.push(next);
    });
    render();
  }
  function topoAuto() {
    if (topoState.timer) { clearInterval(topoState.timer); topoState.timer = null; }
    topoState.timer = setInterval(() => {
      if (topoState.queue.length === 0) {
        clearInterval(topoState.timer); topoState.timer = null; return;
      }
      topoStep();
    }, 800);
  }
  function topoReset() {
    if (topoState.timer) { clearInterval(topoState.timer); topoState.timer = null; }
    initTopo();
    render();
  }

  // === 并查集 操作 ===
  function ufUnionOp() {
    const a = parseInt($('#uf-a')?.value || '0');
    const b = parseInt($('#uf-b')?.value || '1');
    if (isNaN(a) || isNaN(b)) return;
    ufUnion(a, b);
    render();
  }
  function ufFindOp() {
    const a = parseInt($('#uf-find')?.value || '0');
    if (isNaN(a)) return;
    showToast(`节点 ${ufState.nodes[a]?.label} 的根: ${ufState.nodes[ufFind(a)]?.label}`, 'info');
  }
  function ufReset() {
    initUF();
    render();
  }

  // === 通用自动演示管理器 ===
  const autoDemo = {
    running: false,
    timer: null,
    speed: 600,
    queue: [],
    idx: 0,
    currentModule: null
  };

  function autoDemoStart(module) {
    autoDemoStop();
    autoDemo.currentModule = module;
    autoDemo.queue = autoDemoScripts[module] || [];
    autoDemo.idx = 0;
    autoDemo.running = true;
    autoDemoNext();
  }
  function autoDemoNext() {
    if (!autoDemo.running || autoDemo.idx >= autoDemo.queue.length) {
      autoDemoStop();
      return;
    }
    const action = autoDemo.queue[autoDemo.idx];
    autoDemo.idx++;
    try { action(); } catch(e) { console.warn('autoDemo action error:', e); }
    updateAutoDemoBar();
    if (autoDemo.running && autoDemo.idx < autoDemo.queue.length) {
      autoDemo.timer = setTimeout(autoDemoNext, autoDemo.speed);
    } else {
      autoDemoStop();
    }
  }
  function autoDemoStop() {
    autoDemo.running = false;
    if (autoDemo.timer) { clearTimeout(autoDemo.timer); autoDemo.timer = null; }
    updateAutoDemoBar();
  }
  function autoDemoToggle(module) {
    if (autoDemo.running && autoDemo.currentModule === module) {
      autoDemoStop();
    } else {
      autoDemoStart(module);
    }
  }
  function autoDemoSetSpeed(speed) {
    autoDemo.speed = speed;
  }
  function updateAutoDemoBar() {
    const bar = $('#autoplay-bar');
    if (!bar) return;
    const fill = bar.querySelector('.ap-progress-fill');
    const status = bar.querySelector('.ap-status');
    const btn = bar.querySelector('.ap-toggle');
    const total = autoDemo.queue.length;
    const cur = autoDemo.idx;
    if (fill) fill.style.width = total > 0 ? (cur / total * 100) + '%' : '0%';
    if (status) status.textContent = autoDemo.running ? `${cur}/${total} 运行中` : total > 0 ? `${cur}/${total} 已停止` : '就绪';
    if (btn) {
      btn.classList.toggle('active', autoDemo.running);
      btn.textContent = autoDemo.running ? '⏸ 暂停' : '▶ 自动演示';
    }
  }

  // === 各模块自动演示脚本 ===
  const autoDemoScripts = {
    // 排序可视化
    sort: () => {
      const scripts = [];
      scripts.push(() => { setAlgo('bubble'); vizShuffle(); });
      scripts.push(() => vizPlay());
      return scripts;
    },
    // Dijkstra
    dijkstra: () => {
      return [() => dijkstraReset(), () => dijkstraPlay()];
    },
    // 拓扑排序
    topo: () => {
      return [() => topoReset(), () => topoAuto()];
    },
    // 并查集
    uf: () => {
      const ops = [() => ufReset()];
      const pairs = [[0,1],[2,3],[1,2],[4,5],[3,4],[0,6],[5,6]];
      pairs.forEach(([a,b]) => {
        ops.push(() => { ufUnion(a, b); render(); });
      });
      return ops;
    },
    // 单调栈
    monostack: () => {
      const ops = [() => monoStackReset()];
      for (let i = 0; i < 10; i++) ops.push(() => monoStackStep());
      return ops;
    },
    // 单调队列
    monoqueue: () => {
      const ops = [() => monoQueueReset()];
      for (let i = 0; i < 8; i++) ops.push(() => monoQueueStep());
      return ops;
    },
    // 线段树
    segtree: () => {
      return [() => segRandom(), () => { segTreeState.queryL = 1; segTreeState.queryR = 5; render(); }];
    },
    // LIS
    lis: () => {
      const ops = [() => lisReset()];
      for (let i = 0; i < 10; i++) ops.push(() => lisStep());
      return ops;
    },
    // 01背包
    knap: () => {
      const ops = [() => knapReset()];
      for (let i = 0; i < 20; i++) ops.push(() => knapStep());
      return ops;
    },
    // LCS
    lcs: () => {
      const ops = [() => lcsReset()];
      for (let i = 0; i < 30; i++) ops.push(() => lcsStep());
      return ops;
    },
    // 区间DP
    idp: () => {
      const ops = [() => idpReset()];
      for (let i = 0; i < 25; i++) ops.push(() => idpStep());
      return ops;
    },
    // 数组
    array: () => {
      const ops = [() => arrayRandom()];
      for (let i = 0; i < 5; i++) ops.push(() => arrayInsert());
      ops.push(() => arrayAccess());
      ops.push(() => arrayDelete());
      return ops;
    },
    // 栈
    stack: () => {
      const ops = [];
      for (let i = 0; i < 5; i++) ops.push(() => stackPush());
      ops.push(() => stackPeek());
      for (let i = 0; i < 3; i++) ops.push(() => stackPop());
      return ops;
    },
    // 队列
    queue: () => {
      const ops = [];
      for (let i = 0; i < 5; i++) ops.push(() => queueEnqueue());
      for (let i = 0; i < 3; i++) ops.push(() => queueDequeue());
      return ops;
    },
    // 二叉树
    tree: () => {
      const ops = [() => treeRandom()];
      ops.push(() => treeTraverse('pre'));
      ops.push(() => treeTraverse('in'));
      ops.push(() => treeTraverse('post'));
      return ops;
    },
    // 堆
    heap: () => {
      const ops = [() => heapRandom()];
      for (let i = 0; i < 3; i++) ops.push(() => heapPush());
      ops.push(() => heapPop());
      return ops;
    }
  };

  // 生成自动播放控制条HTML
  function autoPlayBar(module) {
    return `
    <div class="viz-autoplay-bar" id="autoplay-bar">
      <button class="ap-btn ap-toggle" onclick="CSP.autoDemoToggle('${module}')">▶ 自动演示</button>
      <button class="ap-btn" onclick="CSP.autoDemoStop()">⏹ 停止</button>
      <div class="ap-speed">
        速度 <input type="range" min="200" max="2000" step="100" value="${2200 - autoDemo.speed}" oninput="CSP.autoDemoSetSpeed(2200-parseInt(this.value))">
      </div>
      <div class="ap-progress"><div class="ap-progress-fill"></div></div>
      <span class="ap-status">就绪</span>
    </div>`;
  }

  // === DP LIS 交互 ===
  function lisStep() {
    const arr = dpState.data;
    if (dpState.current >= arr.length - 1) {
      // 完成，找best
      let bestLen = 0, bestIdx = 0;
      for (let k = 0; k < arr.length; k++) {
        if (dpState.dp[k] > bestLen) { bestLen = dpState.dp[k]; bestIdx = k; }
      }
      dpState.best = bestIdx;
      render();
      return;
    }
    dpState.current++;
    const i = dpState.current;
    for (let j = 0; j < i; j++) {
      if (arr[j] < arr[i] && dpState.dp[j] + 1 > dpState.dp[i]) {
        dpState.dp[i] = dpState.dp[j] + 1;
        dpState.prev[i] = j;
      }
    }
    render();
  }
  function lisReset() {
    dpState.dp = []; dpState.prev = []; dpState.current = -1; dpState.best = -1;
    render();
  }
  function lisRandom() {
    dpState.data = genVizData(8);
    lisReset();
  }

  // === DP 01背包 交互 ===
  function knapStep() {
    const items = knapState.items;
    const W = knapState.capacity;
    const n = items.length;
    if (knapState.current >= n - 1) return;
    knapState.current++;
    const i = knapState.current + 1; // dp table row index (1-based)
    const w = items[knapState.current][0], v = items[knapState.current][1];
    for (let j = 0; j <= W; j++) {
      knapState.dp[i][j] = knapState.dp[i - 1][j];
      if (j >= w && knapState.dp[i - 1][j - w] + v > knapState.dp[i][j]) {
        knapState.dp[i][j] = knapState.dp[i - 1][j - w] + v;
      }
    }
    render();
  }
  function knapReset() {
    knapState.dp = []; knapState.current = -1;
    render();
  }
  function knapSetCap(v) {
    knapState.capacity = Math.max(1, Math.min(v, 20));
    knapReset();
  }

  // === DP可视化路由 ===
  const dpVizState = { tab: 'lis' };

  function renderDPViz() {
    const tabs = [
      { id: 'lis', label: 'LIS', icon: 'PR' },
      { id: 'lcs', label: 'LCS', icon: '' },
      { id: 'knapsack', label: '01背包', icon: 'B' },
      { id: 'interval', label: '区间DP', icon: '#' }
    ];

    let content = '';
    const dpTab = dpVizState.tab;
    switch (dpTab) {
      case 'lis': content = renderLisViz(); break;
      case 'lcs': content = renderLCSViz(); break;
      case 'knapsack': content = renderKnapsackViz(); break;
      case 'interval': content = renderIntervalDPViz(); break;
    }
    const dpDemoModule = { lis: 'lis', lcs: 'lcs', knapsack: 'knap', interval: 'idp' }[dpTab];

    return `
    <div class="crumb"><a onclick="CSP.go('home')">首页</a> / <b>DP可视化</b></div>

    <div class="panel">
      <div class="panel-hd"><span class="dot"></span>动态规划可视化 · 交互式推演</div>
      <div class="panel-bd">
        <div class="viz-tabs">
          ${tabs.map(t => `<button class="viz-tab ${dpVizState.tab === t.id ? 'active' : ''}" onclick="CSP.setDPVizTab('${t.id}')">${t.icon} ${t.label}</button>`).join('')}
        </div>
        ${dpDemoModule ? autoPlayBar(dpDemoModule) : ''}
        ${content}
      </div>
    </div>`;
  }

  function setDPVizTab(tab) {
    dpVizState.tab = tab;
    render();
  }

  // ============================ 公共API ============================
  window.CSP = window.CSP || {};
  Object.assign(window.CSP, {
    go(view) {
      location.hash = view;
    },
    setFilter(cat) {
      state.filterCat = cat;
      render();
    },
    copy(btn, id) {
      const tpl = T.find(t => t.id === id);
      if (tpl) copyCode(tpl.code, btn);
    },
    toggleQuickPanel() {
      state.quickPanelOpen = !state.quickPanelOpen;
      renderQuickPanel();
    },
    toggleMobileMenu() {
      const menu = $('#mobile-menu');
      if (menu) menu.classList.toggle('open');
    },
    toggleTimer,
    resetTimer,
    toggleTheme,
    flipCard,
    markCard,
    nextCard,
    setMastery,
    getMastery,
    // 算法可视化
    setAlgo,
    setVizSpeed,
    setVizTab,
    vizPlay,
    vizPause,
    vizStep,
    vizReset,
    vizShuffle,
    setBsTarget,
    bsSearch,
    bsStep,
    bsReset,
    setGraphMode,
    graphTraverseStart,
    graphTraverseStep,
    graphTraverseReset,
    // 数据结构可视化
    setDataVizTab,
    arrayInsert,
    arrayDelete,
    arrayAccess,
    arrayRandom,
    stackPush,
    stackPop,
    stackPeek,
    queueEnqueue,
    queueDequeue,
    listInsert,
    listDelete,
    treeInsert,
    treeRandom,
    treeTraverse,
    heapPush,
    heapPop,
    heapRandom,
    // 单调栈
    monoStackStep,
    monoStackReset,
    monoStackRandom,
    // 单调队列
    monoQueueStep,
    monoQueueReset,
    monoQueueRandom,
    monoQueueSetWindow,
    // 线段树
    segQuery,
    segReset,
    segRandom,
    // DP可视化
    setDPVizTab,
    lisStep,
    lisReset,
    lisRandom,
    knapStep,
    knapReset,
    knapSetCap,
    // 第五轮升级
    showToast,
    toggleFavorite,
    isFavorite,
    downloadCode,
    // LCS
    lcsStep,
    lcsReset,
    lcsSetStrings,
    // 区间DP
    idpStep,
    idpReset,
    idpRandom,
    // 模拟考试
    startExam,
    setExamAnswer,
    examNext,
    examPrev,
    submitExam,
    resetExam,
    // 真题对比
    copyProblem,
    downloadProblem,
    demoProblem,
    selectProblem,
    toggleYearGroup,
    // 知识点→可视化
    vizFromTpl,
    vizFromCat,
    // 在线升级
    checkUpdateNow,
    // Dijkstra控制
    dijkstraPlay,
    dijkstraPause,
    dijkstraStep,
    dijkstraReset,
    // 拓扑排序控制
    topoStep,
    topoAuto,
    topoReset,
    // 并查集操作
    ufUnionOp,
    ufFindOp,
    ufReset,
    // 自动演示
    autoDemoToggle,
    autoDemoStop,
    autoDemoSetSpeed
  });

  // ============================ 第五轮最强升级 ============================

  // === Toast通知系统 ===
  function showToast(msg, type = 'info', duration = 3000) {
    const container = $('#toast-container') || (() => {
      const c = document.createElement('div');
      c.id = 'toast-container';
      document.body.appendChild(c);
      return c;
    })();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = { info: 'i', success: '✓', warning: '!', error: '×' };
    toast.innerHTML = `<span class="toast-icon">${icons[type] || 'i'}</span><span class="toast-msg">${msg}</span>`;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // === 收藏夹 ===
  function loadFavorites() {
    try { return JSON.parse(localStorage.getItem('csp-favorites') || '[]'); }
    catch { return []; }
  }
  function saveFavorites(favs) {
    localStorage.setItem('csp-favorites', JSON.stringify(favs));
  }
  function toggleFavorite(id) {
    let favs = loadFavorites();
    if (favs.includes(id)) {
      favs = favs.filter(f => f !== id);
      showToast('已取消收藏', 'info');
    } else {
      favs.push(id);
      showToast('已加入收藏', 'success');
    }
    saveFavorites(favs);
    render();
  }
  function isFavorite(id) {
    return loadFavorites().includes(id);
  }

  // === 每日一题 ===
  function getDailyProblem() {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    return T[seed % T.length];
  }

  // === 学习热力图数据 ===
  function loadActivityData() {
    try { return JSON.parse(localStorage.getItem('csp-activity') || '{}'); }
    catch { return {}; }
  }
  function recordActivity() {
    const data = loadActivityData();
    const today = new Date().toISOString().slice(0, 10);
    data[today] = (data[today] || 0) + 1;
    localStorage.setItem('csp-activity', JSON.stringify(data));
  }

  // === 滚动揭示动画 ===
  function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.panel, .stat-card, .knowledge-card').forEach(el => {
      el.classList.add('reveal');
      observer.observe(el);
    });
  }

  // === 页面顶部进度条 ===
  function initScrollProgress() {
    let bar = $('#scroll-progress');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'scroll-progress';
      document.body.appendChild(bar);
    }
    function update() {
      const h = document.documentElement;
      const scroll = h.scrollTop || document.body.scrollTop;
      const height = h.scrollHeight - h.clientHeight;
      const pct = height > 0 ? (scroll / height) * 100 : 0;
      bar.style.width = pct + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // === 代码下载 ===
  function downloadCode(id) {
    const tpl = T.find(t => t.id === id);
    if (!tpl) return;
    const blob = new Blob([tpl.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${id}.cpp`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`已下载 ${id}.cpp`, 'success');
  }

  // === 模拟考试模式 ===
  const examState = {
    questions: [], current: 0, answers: {}, startTime: 0, timeLimit: 210 * 60, active: false, submitted: false
  };

  function startExam() {
    // 随机抽4题，每题来自不同分类
    const cats = [...CATS].sort(() => Math.random() - 0.5);
    const selected = [];
    for (const cat of cats) {
      const items = T.filter(t => t.cat === cat);
      if (items.length > 0) {
        selected.push(items[Math.floor(Math.random() * items.length)]);
      }
      if (selected.length >= 4) break;
    }
    examState.questions = selected;
    examState.current = 0;
    examState.answers = {};
    examState.startTime = Date.now();
    examState.active = true;
    examState.submitted = false;
    render();
    showToast('模拟考试已开始！限时3.5小时', 'info');
  }

  function renderExam() {
    if (!examState.active || examState.questions.length === 0) {
      return `
      <div class="crumb"><a onclick="CSP.go('home')">首页</a> / <b>模拟考试</b></div>
      <div class="panel">
        <div class="panel-hd"><span class="dot"></span>模拟考试模式</div>
        <div class="panel-bd" style="text-align:center;padding:40px 20px;">
          <div style="font-size:48px;margin-bottom:16px;">ST</div>
          <h2 style="color:var(--text);margin-bottom:12px;">CSP-S 模拟考试</h2>
          <p style="color:var(--text-2);max-width:500px;margin:0 auto 24px;">
            随机抽取4道题目，模拟真实考试环境。限时3.5小时，完成后查看评分和建议。
          </p>
          <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:20px;">
            <span class="tag" style="background:var(--panel-2);"> 限时 3.5 小时</span>
            <span class="tag" style="background:var(--panel-2);">EX 4 道题目</span>
            <span class="tag" style="background:var(--panel-2);">EX 随机抽取</span>
            <span class="tag" style="background:var(--panel-2);">DP 评分建议</span>
          </div>
          <button class="btn btn-primary" style="font-size:16px;padding:12px 32px;" onclick="CSP.startExam()"> 开始考试</button>
        </div>
      </div>`;
    }

    const elapsed = Math.floor((Date.now() - examState.startTime) / 1000);
    const remaining = examState.timeLimit - elapsed;
    const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
    const ss = String(remaining % 60).padStart(2, '0');
    const q = examState.questions[examState.current];

    if (remaining <= 0 && !examState.submitted) {
      examState.submitted = true;
    }

    if (examState.submitted) {
      const score = examState.questions.reduce((sum, qd, i) => {
        const ans = examState.answers[i] || '';
        return sum + (ans.trim().length > 20 ? 25 : ans.trim().length > 0 ? 10 : 0);
      }, 0);
      return `
      <div class="crumb"><a onclick="CSP.go('home')">首页</a> / <b>模拟考试</b></div>
      <div class="panel">
        <div class="panel-hd"><span class="dot"></span>考试结果</div>
        <div class="panel-bd" style="text-align:center;padding:30px;">
          <div style="font-size:56px;margin-bottom:8px;">${score >= 80 ? '' : score >= 50 ? '' : ''}</div>
          <div style="font-size:36px;font-weight:700;color:${score >= 80 ? 'var(--green)' : score >= 50 ? 'var(--cyan)' : 'var(--yellow)'};">${score} / 100</div>
          <p style="color:var(--text-2);margin:12px 0 24px;">
            ${score >= 80 ? '优秀！继续保持！' : score >= 50 ? '不错，还有提升空间' : '继续努力，多练习模板'}
          </p>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;text-align:left;">
            ${examState.questions.map((qd, i) => {
              const ans = examState.answers[i] || '';
              const sc = ans.trim().length > 20 ? 25 : ans.trim().length > 0 ? 10 : 0;
              return `<div class="exam-result-card">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                  <b style="color:var(--text);">T${i+1}: ${qd.name}</b>
                  <span class="tag" style="background:${sc >= 25 ? 'var(--green)' : sc > 0 ? 'var(--yellow)' : 'var(--red)'};color:var(--bg);">${sc}分</span>
                </div>
                <div style="font-size:12px;color:var(--text-3);">${qd.cat} · ${qd.diff}</div>
              </div>`;
            }).join('')}
          </div>
          <button class="btn btn-primary" style="margin-top:24px;" onclick="CSP.resetExam()">↻ 再考一次</button>
        </div>
      </div>`;
    }

    return `
    <div class="crumb"><a onclick="CSP.go('home')">首页</a> / <b>模拟考试</b></div>
    <div class="exam-timer-bar">
      <span class="exam-timer-text"> ${mm}:${ss}</span>
      <span style="color:var(--text-3);">| 题 ${examState.current + 1}/${examState.questions.length}</span>
    </div>
    <div class="panel">
      <div class="panel-hd"><span class="dot"></span>T${examState.current + 1}: ${q.name} <span class="difficulty diff-${q.diff}">${q.diff}</span></div>
      <div class="panel-bd">
        <div style="margin-bottom:16px;">
          <span class="tag">${q.cat}</span>
          <span style="color:var(--text-2);font-size:13px;margin-left:8px;">${q.desc}</span>
        </div>
        <div style="font-size:13px;color:var(--text-3);margin-bottom:8px;">参考模板：</div>
        <div class="code-block">
          <pre>${highlightCode(q.code)}</pre>
        </div>
        <div style="font-size:13px;color:var(--text-3);margin:16px 0 8px;">你的解答（写出思路或代码）：</div>
        <textarea class="exam-answer" placeholder="在此输入你的解答..." oninput="CSP.setExamAnswer(${examState.current}, this.value)">${examState.answers[examState.current] || ''}</textarea>
      </div>
    </div>
    <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
      ${examState.current > 0 ? `<button class="btn" onclick="CSP.examPrev()">⬅ 上一题</button>` : ''}
      ${examState.current < examState.questions.length - 1 ? `<button class="btn btn-primary" onclick="CSP.examNext()">下一题 ➡</button>` : ''}
      <button class="btn btn-danger" onclick="CSP.submitExam()">✓ 交卷</button>
    </div>`;
  }

  function setExamAnswer(idx, val) { examState.answers[idx] = val; }
  function examNext() { if (examState.current < examState.questions.length - 1) { examState.current++; render(); } }
  function examPrev() { if (examState.current > 0) { examState.current--; render(); } }
  function submitExam() { examState.submitted = true; render(); showToast('已交卷', 'success'); }
  function resetExam() { examState.active = false; examState.submitted = false; examState.questions = []; render(); }

  // === LCS可视化 ===
  const lcsState = { s1: 'ABCBDAB', s2: 'BDCAB', dp: [], current: -1, done: false };

  function renderLCSViz() {
    const s1 = lcsState.s1, s2 = lcsState.s2;
    const n = s1.length, m = s2.length;

    if (lcsState.dp.length === 0) {
      lcsState.dp = new Array(n + 1).fill(null).map(() => new Array(m + 1).fill(0));
    }

    // DP表格
    const tableRows = [];
    // 表头
    tableRows.push(`<tr><th></th><th>∅</th>${s2.split('').map(c => `<th>${c}</th>`).join('')}</tr>`);
    for (let i = 0; i <= n; i++) {
      const cells = [];
      cells.push(`<th>${i === 0 ? '∅' : s1[i-1]}</th>`);
      for (let j = 0; j <= m; j++) {
        let cls = 'dp-cell';
        if (i === lcsState.current + 1 && j <= m) cls += ' current-row';
        if (i <= lcsState.current + 1 && lcsState.current >= 0) cls += ' computed';
        if (lcsState.done && i === n && j === m) cls += ' current-row';
        cells.push(`<td class="${cls}">${lcsState.dp[i][j]}</td>`);
      }
      tableRows.push(`<tr>${cells.join('')}</tr>`);
    }

    return `
    <div class="viz-section">
      <div class="viz-controls">
        <input type="text" id="lcs-s1" value="${s1}" style="width:100px;" placeholder="串1">
        <input type="text" id="lcs-s2" value="${s2}" style="width:100px;" placeholder="串2">
        <button class="btn btn-primary" onclick="CSP.lcsStep()">⏭ 下一步</button>
        <button class="btn" onclick="CSP.lcsReset()">↻ 重置</button>
        <button class="btn" onclick="CSP.lcsSetStrings()">设置串</button>
      </div>
      <div class="viz-info">
        <span>串1: ${s1} (长度${n})</span>
        <span>串2: ${s2} (长度${m})</span>
        <span>LCS长度: ${lcsState.done ? lcsState.dp[n][m] : '?'}</span>
      </div>
      <div style="font-size:13px;color:var(--text-2);margin-bottom:4px;">DP表格（dp[i][j]=s1前i个与s2前j个的LCS长度）：</div>
      <div class="dp-table-wrap">
        <table class="tbl dp-table"><tbody>${tableRows.join('')}</tbody></table>
      </div>
      <div class="ds-note">
        <b>LCS（最长公共子序列）</b>：若s1[i]=s2[j]，dp[i][j]=dp[i-1][j-1]+1；否则dp[i][j]=max(dp[i-1][j], dp[i][j-1])。O(nm)时间空间。
      </div>
      ${renderProblemCard(VIZ_PROBLEMS.dp)}
    </div>`;
  }

  function lcsStep() {
    const s1 = lcsState.s1, s2 = lcsState.s2;
    const n = s1.length, m = s2.length;
    if (lcsState.current >= n - 1) { lcsState.done = true; render(); return; }
    lcsState.current++;
    const i = lcsState.current + 1;
    for (let j = 1; j <= m; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        lcsState.dp[i][j] = lcsState.dp[i - 1][j - 1] + 1;
      } else {
        lcsState.dp[i][j] = Math.max(lcsState.dp[i - 1][j], lcsState.dp[i][j - 1]);
      }
    }
    render();
  }
  function lcsReset() { lcsState.dp = []; lcsState.current = -1; lcsState.done = false; render(); }
  function lcsSetStrings() {
    const s1 = $('#lcs-s1')?.value || 'ABC';
    const s2 = $('#lcs-s2')?.value || 'ABC';
    lcsState.s1 = s1.toUpperCase().substring(0, 10);
    lcsState.s2 = s2.toUpperCase().substring(0, 10);
    lcsReset();
  }

  // === 区间DP可视化（石子合并） ===
  const intervalDPState = { data: [4, 2, 3, 5, 1], dp: [], sum: [], current: -1, done: false };

  function renderIntervalDPViz() {
    const arr = intervalDPState.data;
    const n = arr.length;

    if (intervalDPState.dp.length === 0) {
      intervalDPState.dp = new Array(n).fill(null).map(() => new Array(n).fill(0));
      intervalDPState.sum = new Array(n).fill(null).map(() => new Array(n).fill(0));
      for (let i = 0; i < n; i++) intervalDPState.sum[i][i] = arr[i];
      for (let len = 2; len <= n; len++) {
        for (let i = 0; i + len - 1 < n; i++) {
          const j = i + len - 1;
          intervalDPState.sum[i][j] = intervalDPState.sum[i][j - 1] + arr[j];
        }
      }
    }

    // 数据展示
    const items = arr.map((v, i) => {
      let cls = 'ds-array-item';
      if (intervalDPState.current >= 0 && i <= intervalDPState.current) cls += ' sorted';
      return `<div class="${cls}"><span class="ds-index">${i}</span><span class="ds-value">${v}</span></div>`;
    }).join('');

    // DP表格（下三角）
    const tableRows = [];
    tableRows.push(`<tr><th>i\\j</th>${arr.map((_, j) => `<th>${j}</th>`).join('')}</tr>`);
    for (let i = 0; i < n; i++) {
      const cells = [`<th>${i}</th>`];
      for (let j = 0; j < n; j++) {
        if (j < i) {
          cells.push(`<td class="dp-cell" style="opacity:.3;">-</td>`);
        } else {
          let cls = 'dp-cell';
          if (intervalDPState.done || (intervalDPState.current >= 0 && j - i <= intervalDPState.current + 1)) cls += ' computed';
          if (i === 0 && j === n - 1 && intervalDPState.done) cls += ' current-row';
          cells.push(`<td class="${cls}">${intervalDPState.dp[i][j]}</td>`);
        }
      }
      tableRows.push(`<tr>${cells.join('')}</tr>`);
    }

    return `
    <div class="viz-section">
      <div class="viz-controls">
        <button class="btn btn-primary" onclick="CSP.idpStep()">⏭ 下一步</button>
        <button class="btn" onclick="CSP.idpReset()">↻ 重置</button>
        <button class="btn" onclick="CSP.idpRandom()">? 随机数据</button>
      </div>
      <div class="viz-info">
        <span>石子堆数: ${n}</span>
        <span>当前区间长度: ${intervalDPState.current >= 0 ? intervalDPState.current + 2 : '就绪'}</span>
        <span>最小代价: ${intervalDPState.done ? intervalDPState.dp[0][n-1] : '?'}</span>
      </div>
      <div style="font-size:13px;color:var(--text-2);margin-bottom:4px;">石子重量：</div>
      <div class="ds-array">${items}</div>
      <div style="font-size:13px;color:var(--text-2);margin-bottom:4px;margin-top:8px;">DP表格（dp[i][j]=合并区间[i,j]的最小代价）：</div>
      <div class="dp-table-wrap">
        <table class="tbl dp-table"><tbody>${tableRows.join('')}</tbody></table>
      </div>
      <div class="ds-note">
        <b>区间DP（石子合并）</b>：dp[i][j]=min(dp[i][k]+dp[k+1][j]+sum[i][j])，枚举k∈[i,j)。O(n³)时间。CSP-S经典区间DP题型。
      </div>
      ${renderProblemCard(VIZ_PROBLEMS.dp)}
    </div>`;
  }

  function idpStep() {
    const n = intervalDPState.data.length;
    if (intervalDPState.current >= n - 2) { intervalDPState.done = true; render(); return; }
    intervalDPState.current++;
    const len = intervalDPState.current + 2;
    for (let i = 0; i + len - 1 < n; i++) {
      const j = i + len - 1;
      intervalDPState.dp[i][j] = Infinity;
      for (let k = i; k < j; k++) {
        const cost = intervalDPState.dp[i][k] + intervalDPState.dp[k + 1][j] + intervalDPState.sum[i][j];
        if (cost < intervalDPState.dp[i][j]) intervalDPState.dp[i][j] = cost;
      }
    }
    render();
  }
  function idpReset() { intervalDPState.dp = []; intervalDPState.sum = []; intervalDPState.current = -1; intervalDPState.done = false; render(); }
  function idpRandom() { intervalDPState.data = genVizData(5); idpReset(); }

  // ============================ 初始化 ============================
  // ============================ 在线升级检测 ============================
  const REPO_API = 'https://api.github.com/repos/Peter1384345/csp-s-2026-pro/commits/main';
  let currentSha = null;
  let versionCheckTimer = null;

  async function fetchLatestCommit() {
    try {
      const res = await fetch(REPO_API, { cache: 'no-store' });
      if (!res.ok) return null;
      const data = await res.json();
      return { sha: data.sha, date: data.commit?.author?.date || '', msg: data.commit?.message || '' };
    } catch (e) { return null; }
  }

  function shortenSha(sha) { return sha ? sha.substring(0, 7) : '------'; }

  function initVersionChecker() {
    // 首次加载：获取当前版本作为基准
    fetchLatestCommit().then(info => {
      if (!info) return;
      currentSha = info.sha;
      // 存储到 sessionStorage 作为本次会话的基准版本
      try { sessionStorage.setItem('csp_base_sha', info.sha); } catch (e) {}
      updateVersionBadge(info);
    });

    // 每 5 分钟检查一次是否有新提交
    versionCheckTimer = setInterval(checkForUpdate, 5 * 60 * 1000);
    // 首次 30 秒后也检查一次（处理部署刚完成的场景）
    setTimeout(checkForUpdate, 30000);
  }

  async function checkForUpdate() {
    const info = await fetchLatestCommit();
    if (!info) return;
    const baseSha = currentSha || (sessionStorage.getItem('csp_base_sha') || null);
    if (baseSha && info.sha !== baseSha) {
      showUpdateNotification(info);
    }
    updateVersionBadge(info);
  }

  function updateVersionBadge(info) {
    const badge = $('#version-badge');
    if (badge && info) {
      const d = info.date ? new Date(info.date).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';
      badge.textContent = `v${shortenSha(info.sha)} · ${d}`;
      badge.title = info.msg || '';
    }
  }

  function showUpdateNotification(info) {
    if ($('#update-notify')) return;
    const notify = document.createElement('div');
    notify.id = 'update-notify';
    notify.className = 'update-notify';
    notify.innerHTML = `
      <span class="un-icon">*</span>
      <span class="un-text">发现新版本 <b>v${shortenSha(info.sha)}</b>，点击刷新获取最新内容</span>
      <button class="un-btn" onclick="location.reload()">立即刷新</button>
      <button class="un-close" onclick="this.parentElement.remove()">×</button>
    `;
    document.body.appendChild(notify);
    // 入场动画
    requestAnimationFrame(() => notify.classList.add('show'));
  }

  function checkUpdateNow() {
    checkForUpdate();
  }

  function init() {
    // 加载主题
    loadTheme();

    // 加载计时器持久化状态
    loadTimerState();

    // 粒子背景
    initParticles();

    // 滚动揭示动画
    initScrollReveal();

    // 页面顶部进度条
    initScrollProgress();

    // 记录今日活动
    recordActivity();

    // 倒计时
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // 计时器
    setInterval(updateTimer, 1000);
    // 页面卸载时保存计时器状态
    window.addEventListener('beforeunload', saveTimerState);

    // 搜索（带防抖）
    const searchInput = $('#nav-search-input');
    if (searchInput) {
      let searchTimer = null;
      searchInput.addEventListener('input', e => {
        state.searchQuery = e.target.value;
        if (searchTimer) clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
          if (state.searchQuery && state.view !== 'templates') {
            location.hash = 'templates';
          } else if (state.view === 'templates') {
            render();
          }
        }, 200);
      });
      // 回车搜索时确保跳转到模板页
      searchInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' && state.searchQuery) {
          if (searchTimer) clearTimeout(searchTimer);
          if (state.view !== 'templates') location.hash = 'templates';
        }
      });
    }

    // 路由
    window.addEventListener('hashchange', render);
    render();

    // 在线升级检测
    initVersionChecker();

    // 快速面板
    renderQuickPanel();

    // 键盘快捷键
    document.addEventListener('keydown', e => {
      // 忽略在输入框中的按键
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        if (e.key === 'Escape') e.target.blur();
        return;
      }
      // / 聚焦搜索
      if (e.key === '/') {
        e.preventDefault();
        const si = $('#nav-search-input');
        if (si) si.focus();
      }
      // Esc 关闭快速面板/移动菜单
      if (e.key === 'Escape') {
        if (state.quickPanelOpen) { state.quickPanelOpen = false; renderQuickPanel(); }
        const mm = $('#mobile-menu');
        if (mm) mm.classList.remove('open');
      }
      // g 然后按对应键跳转
      if (e.key === 'g') {
        const handler = ev => {
          document.removeEventListener('keydown', handler);
          const map = { 'h': 'home', 't': 'templates', 's': 'starmap', 'r': 'strategy', 'f': 'flashcard', 'p': 'progress', 'c': 'complexity', 'v': 'visualizer', 'd': 'dataviz', 'k': 'dpviz', 'e': 'exam' };
          if (map[ev.key]) { e.preventDefault(); location.hash = map[ev.key]; }
        };
        document.addEventListener('keydown', handler);
        setTimeout(() => document.removeEventListener('keydown', handler), 1000);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
