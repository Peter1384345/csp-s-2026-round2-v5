/* ============================================================================
 * CSP-S 2026 第二轮 · 题目数据（图论 + 搜索） p19–p27
 * ----------------------------------------------------------------------------
 * 每道题同时提供：
 *   std.code      参考 C++17 程序（真实编译评测用）
 *   algo.ref      JS 追踪版参考实现（输出与 C++ 完全一致）
 *   algo.userTemplate  给用户改的起步代码（挖空 + TODO）
 *   algo.viz      可视化描述（小规模输入，graph 类型）
 *   algo.gen      随机数据生成器源码字符串（对拍用）
 * 所有图论题的点编号一律从 1 开始。viz 用的小图规模：n ≤ 7、m ≤ 10。
 * ==========================================================================*/
(function () {
  'use strict';
  window.CSP = window.CSP || {};
  window.CSP.problems = window.CSP.problems || [];

  /* ========================================================================
   * p19 连通块统计（图的存储 + DFS）
   * ======================================================================*/
  window.CSP.problems.push({
    id: 'p19', no: 19, title: '连通块统计', diff: 2, tier: '普及+',
    knowledge: ['graph.store', 'graph.dfs'],
    limits: { time: '1s', memory: '128MB' },
    statement:
      '给定一张 n 个点、m 条边的**无向图**，点编号为 1 到 n（可能有重边，没有自环）。\n' +
      '所谓「连通块」，就是互相可达的极大点集。请求出连通块的个数，并把每个连通块里的点按编号从小到大输出。\n' +
      '输出顺序：先按连通块中**最小编号**从小到大排列各连通块。\n' +
      '提示：用邻接表存图（`vector<int> g[n+1]`，无向边要双向各存一次），然后从每个未访问的点出发 DFS。',
    inputFormat:
      '第一行两个整数 n, m（1 ≤ n ≤ 1000，0 ≤ m ≤ 5000）。\n' +
      '接下来 m 行，每行两个整数 u, v（1 ≤ u, v ≤ n），表示一条连接 u 和 v 的无向边。',
    outputFormat:
      '第一行一个整数 k，表示连通块个数。\n' +
      '接下来 k 行，第 i 行是第 i 个连通块的所有点编号，按升序用空格分隔。',
    samples: [
      {
        input: '6 3\n1 2\n2 3\n4 5\n',
        output: '3\n1 2 3\n4 5\n6',
        explain: '{1,2,3} 与 {4,5} 是连通块，点 6 孤立自成一个连通块。'
      }
    ],
    tests: [
      { input: '6 3\n1 2\n2 3\n4 5\n', output: '3\n1 2 3\n4 5\n6', score: 20 },
      { input: '1 0\n', output: '1\n1', score: 20 },
      { input: '3 0\n', output: '3\n1\n2\n3', score: 20 },
      { input: '4 5\n1 2\n1 2\n3 4\n4 3\n2 3\n', output: '1\n1 2 3 4', score: 20 },
      { input: '8 4\n1 2\n3 4\n5 6\n7 8\n', output: '4\n1 2\n3 4\n5 6\n7 8', score: 20 }
    ],
    std: {
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int n, m;',
        'vector<vector<int>> g;',
        'vector<int> vis, cur;',
        'void dfs(int u){',
        '  vis[u] = 1; cur.push_back(u);',
        '  for (size_t i = 0; i < g[u].size(); i++) { int v = g[u][i]; if (!vis[v]) dfs(v); }',
        '}',
        'int main(){',
        '  scanf("%d %d", &n, &m);',
        '  g.assign(n + 1, vector<int>()); vis.assign(n + 1, 0);',
        '  for (int i = 0; i < m; i++) { int u, v; scanf("%d %d", &u, &v); g[u].push_back(v); g[v].push_back(u); }',
        '  vector<vector<int>> comps;',
        '  for (int i = 1; i <= n; i++) if (!vis[i]) { cur.clear(); dfs(i); sort(cur.begin(), cur.end()); comps.push_back(cur); }',
        '  printf("%d\\n", (int)comps.size());',
        '  for (size_t i = 0; i < comps.size(); i++) {',
        '    for (size_t j = 0; j < comps[i].size(); j++) { if (j) printf(" "); printf("%d", comps[i][j]); }',
        '    printf("\\n");',
        '  }',
        '  return 0;',
        '}'
      ].join('\n')
    },
    algo: {
      title: '邻接表 DFS 求连通块',
      viz: {
        input: '6 3\n1 2\n2 3\n4 5\n',
        type: 'graph', mainKey: 'n', edgesKey: 'edges', distKey: 'dist', curKey: 'cur',
        title: 'DFS 遍历连通块（dist = 访问次序）'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), m = tk.int();',
        '  var adj = [], edges = [], i, k;',
        '  for (i = 0; i <= n; i++) adj.push([]);',
        '  for (i = 0; i < m; i++) {',
        '    var u = tk.int(), v = tk.int();',
        '    adj[u].push(v); adj[v].push(u);',
        '    edges.push([u, v]);',
        '  }',
        '  var dist = [];',
        '  for (i = 0; i <= n; i++) dist.push(0);',
        '  var comp = [], comps = [], order = 0;',
        '  var S = { n: n, m: m, edges: edges, dist: dist, cur: 0, order: 0, comp: [], comps: [], ans: 0 };',
        '  T.step(S, "邻接表建图完成：n=" + n + "，m=" + m);',
        '  function dfs(u) {',
        '    order++; dist[u] = order;',
        '    S.cur = u; S.order = order;',
        '    comp.push(u); S.comp = comp.slice();',
        '    T.step(S, "访问点 " + u + "（第 " + order + " 个）");',
        '    for (var t = 0; t < adj[u].length; t++) {',
        '      var v = adj[u][t];',
        '      if (dist[v] === 0) dfs(v);',
        '    }',
        '  }',
        '  for (i = 1; i <= n; i++) {',
        '    if (dist[i] === 0) {',
        '      comp = []; S.comp = [];',
        '      T.step(S, "点 " + i + " 未访问，开启新连通块");',
        '      dfs(i);',
        '      comp.sort(function (a, b) { return a - b; });',
        '      comps.push(comp.slice());',
        '      S.comps = comps.slice();',
        '      T.step(S, "连通块 {" + comp.join(" ") + "} 收集完毕");',
        '    }',
        '  }',
        '  var out = [String(comps.length)];',
        '  for (k = 0; k < comps.length; k++) out.push(comps[k].join(" "));',
        '  var ans = out.join("\\n");',
        '  S.ans = comps.length;',
        '  T.answer(ans);',
        '  return ans;',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), m = tk.int();',
        '  var adj = [], edges = [], i;',
        '  for (i = 0; i <= n; i++) adj.push([]);',
        '  for (i = 0; i < m; i++) {',
        '    var u = tk.int(), v = tk.int();',
        '    adj[u].push(v); adj[v].push(u);',
        '    edges.push([u, v]);',
        '  }',
        '  var dist = [];',
        '  for (i = 0; i <= n; i++) dist.push(0);   // dist[u] = 访问次序，0 表示未访问',
        '  var comp = [], comps = [], order = 0;',
        '  var S = { n: n, m: m, edges: edges, dist: dist, cur: 0, order: 0, comp: [], comps: [], ans: 0 };',
        '  T.step(S, "邻接表建图完成");',
        '  // TODO: 写一个 dfs(u)：标记 dist[u] = ++order，把 u 压入 comp，',
        '  //       递归访问所有未访问的邻居；每访问一个点都要 T.step(S, note)',
        '  // TODO: 从 1 到 n 枚举，遇到未访问的点就开一个新连通块，DFS 后把 comp 排序存入 comps',
        '  // TODO: 输出 k 以及每个连通块（升序、空格分隔）',
        '  T.answer(String(comps.length));',
        '  return String(comps.length);',
        '}'
      ].join('\n'),
      pseudo: [
        'for i ← 1 to n: if dist[i] = 0 then DFS(i) 并收集一个连通块',
        'DFS(u): dist[u] ← ++order; comp.push(u)',
        '        for each v in adj[u]: if dist[v] = 0 then DFS(v)',
        '输出 连通块数 k，再逐行输出排序后的每个连通块'
      ],
      gen: 'function(r){ var n = 2 + Math.floor(Math.random()*7); var m = Math.floor(Math.random()*10); var s = n + " " + m; for (var i = 0; i < m; i++) { var u = 1 + Math.floor(Math.random()*n); var v = 1 + Math.floor(Math.random()*n); if (u === v) { i--; continue; } s += "\\n" + u + " " + v; } return s; }'
    },
    tips: [
      '每个连通块一定要在最小编号处被发现，这样输出顺序天然就是按最小点升序，不用再排序。',
      '孤立点也是一个大小 1 的连通块，别漏掉。',
      '无向边要双向都存；有重边不影响 DFS 正确性。'
    ]
  });

  /* ========================================================================
   * p20 网格迷宫最短路（BFS）
   * ======================================================================*/
  window.CSP.problems.push({
    id: 'p20', no: 20, title: '网格迷宫最短路', diff: 2, tier: '普及+',
    knowledge: ['graph.bfs', 'search.bfs', 'graph.store'],
    limits: { time: '1s', memory: '128MB' },
    statement:
      '给定一个 n 行 m 列的网格迷宫，`.` 表示可以走的空地，`#` 表示墙。\n' +
      '每次可以向上下左右四个方向移动一格（不能斜走，不能走出网格，不能穿墙）。\n' +
      '给定起点 (sx, sy) 和终点 (tx, ty)（行列均从 1 开始编号，sx 是行号，sy 是列号），' +
      '求从起点到终点的**最少移动步数**；如果到不了，输出 -1。\n' +
      '做法：把每个空格看成一个结点，相邻空格之间连一条边，这就是一张无权图，用 BFS 求最短路。',
    inputFormat:
      '第一行两个整数 n, m（1 ≤ n, m ≤ 1000）。\n' +
      '接下来 n 行，每行一个长度为 m 的字符串，只含 `.` 和 `#`。\n' +
      '最后一行四个整数 sx, sy, tx, ty（1 ≤ sx, tx ≤ n，1 ≤ sy, ty ≤ m），保证起点和终点都是 `.`。',
    outputFormat: '一行一个整数，表示最少移动步数；若无法到达则输出 -1。',
    samples: [
      {
        input: '2 3\n...\n...\n1 1 2 3\n',
        output: '3',
        explain: '(1,1) → (1,2) → (1,3) → (2,3) 共 3 步。'
      }
    ],
    tests: [
      { input: '2 3\n...\n...\n1 1 2 3\n', output: '3', score: 20 },
      { input: '1 3\n.#.\n1 1 1 3\n', output: '-1', score: 20 },
      { input: '1 1\n.\n1 1 1 1\n', output: '0', score: 20 },
      { input: '3 4\n....\n.##.\n....\n1 1 3 4\n', output: '5', score: 20 },
      { input: '4 5\n.....\n.###.\n.#.#.\n.....\n1 1 4 5\n', output: '7', score: 20 }
    ],
    std: {
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main(){',
        '  int n, m;',
        '  if (scanf("%d %d", &n, &m) != 2) return 0;',
        '  vector<string> g(n);',
        '  char buf[2005];',
        '  for (int i = 0; i < n; i++) { scanf("%s", buf); g[i] = buf; }',
        '  int sx, sy, tx, ty; scanf("%d %d %d %d", &sx, &sy, &tx, &ty);',
        '  sx--; sy--; tx--; ty--;',
        '  vector<vector<int>> d(n, vector<int>(m, -1));',
        '  queue<pair<int,int>> q;',
        '  if (g[sx][sy] == \'.\') { d[sx][sy] = 0; q.push(make_pair(sx, sy)); }',
        '  int dx[4] = {-1, 1, 0, 0}, dy[4] = {0, 0, -1, 1};',
        '  while (!q.empty()) {',
        '    pair<int,int> t = q.front(); q.pop();',
        '    int x = t.first, y = t.second;',
        '    for (int k = 0; k < 4; k++) {',
        '      int nx = x + dx[k], ny = y + dy[k];',
        '      if (nx < 0 || nx >= n || ny < 0 || ny >= m) continue;',
        '      if (g[nx][ny] == \'#\') continue;',
        '      if (d[nx][ny] != -1) continue;',
        '      d[nx][ny] = d[x][y] + 1;',
        '      q.push(make_pair(nx, ny));',
        '    }',
        '  }',
        '  printf("%d\\n", d[tx][ty]);',
        '  return 0;',
        '}'
      ].join('\n')
    },
    algo: {
      title: '把空格建成无权图后 BFS',
      viz: {
        input: '2 3\n...\n...\n1 1 2 3\n',
        type: 'graph', mainKey: 'n', edgesKey: 'edges', distKey: 'dist', curKey: 'cur',
        title: '迷宫转成图后的 BFS 分层'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), m = tk.int();',
        '  var g = [], id = [], i, j, k;',
        '  for (i = 0; i < n; i++) g.push(tk.next());',
        '  var sx = tk.int() - 1, sy = tk.int() - 1, tx = tk.int() - 1, ty = tk.int() - 1;',
        '  for (i = 0; i < n; i++) { id.push([]); for (j = 0; j < m; j++) id[i].push(0); }',
        '  var cnt = 0;',
        '  for (i = 0; i < n; i++) for (j = 0; j < m; j++) if (g[i].charAt(j) === ".") id[i][j] = ++cnt;',
        '  var edges = [], adj = [];',
        '  for (i = 0; i <= cnt; i++) adj.push([]);',
        '  var dx = [-1, 1, 0, 0], dy = [0, 0, -1, 1];',
        '  for (i = 0; i < n; i++) for (j = 0; j < m; j++) {',
        '    if (!id[i][j]) continue;',
        '    for (k = 0; k < 4; k++) {',
        '      var ni = i + dx[k], nj = j + dy[k];',
        '      if (ni < 0 || ni >= n || nj < 0 || nj >= m) continue;',
        '      if (!id[ni][nj]) continue;',
        '      if (id[i][j] < id[ni][nj]) {',
        '        edges.push([id[i][j], id[ni][nj]]);',
        '        adj[id[i][j]].push(id[ni][nj]);',
        '        adj[id[ni][nj]].push(id[i][j]);',
        '      }',
        '    }',
        '  }',
        '  var dist = [];',
        '  for (i = 0; i <= cnt; i++) dist.push(-1);',
        '  var S = { n: cnt, edges: edges, dist: dist, cur: 0, rows: n, cols: m, ans: -1 };',
        '  T.step(S, "把迷宫转成无权图：共 " + cnt + " 个空格结点");',
        '  var start = id[sx][sy], target = id[tx][ty];',
        '  var q = [], head = 0;',
        '  if (start > 0) {',
        '    dist[start] = 0; q.push(start); S.cur = start;',
        '    T.step(S, "起点（结点 " + start + "）入队，距离 0");',
        '  }',
        '  while (head < q.length) {',
        '    var u = q[head]; head++;',
        '    S.cur = u;',
        '    T.step(S, "结点 " + u + " 出队，距离 " + dist[u]);',
        '    for (k = 0; k < adj[u].length; k++) {',
        '      var v = adj[u][k];',
        '      if (dist[v] === -1) { dist[v] = dist[u] + 1; q.push(v); }',
        '    }',
        '  }',
        '  var ans = target > 0 ? dist[target] : -1;',
        '  S.ans = ans;',
        '  T.step(S, "终点距离 = " + ans);',
        '  T.answer(String(ans));',
        '  return String(ans);',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), m = tk.int();',
        '  var g = [], i, j;',
        '  for (i = 0; i < n; i++) g.push(tk.next());',
        '  var sx = tk.int() - 1, sy = tk.int() - 1, tx = tk.int() - 1, ty = tk.int() - 1;',
        '  // TODO: 给每个 "." 编号（从 1 开始），得到一个无权图',
        '  // TODO: 相邻的空格之间连边（上下左右），存进 edges 与邻接表 adj',
        '  var dist = [];   // dist[id] = 从起点出发的最短步数，-1 表示还没访问到',
        '  var S = { n: 0, edges: [], dist: dist, cur: 0, rows: n, cols: m, ans: -1 };',
        '  T.step(S, "建图完成");',
        '  // TODO: 把起点的 dist 设为 0 并入队，然后 BFS 逐层扩展（每步 T.step）',
        '  // TODO: 答案是终点的 dist；终点不可达时输出 -1',
        '  T.answer(String(S.ans));',
        '  return String(S.ans);',
        '}'
      ].join('\n'),
      pseudo: [
        '把每个 . 编号，相邻的 . 之间连边',
        'dist[start] ← 0，start 入队',
        'while 队列非空: u ← 队首出队',
        '  for each v in adj[u]: if dist[v] = -1 then dist[v] ← dist[u]+1, v 入队',
        '输出 dist[target]（不可达为 -1）'
      ],
      gen: 'function(r){ var n = 1 + Math.floor(Math.random()*4), m = 1 + Math.floor(Math.random()*4); var s = n + " " + m; var g = []; for (var i = 0; i < n; i++) { var row = ""; for (var j = 0; j < m; j++) row += (Math.random() < 0.75 ? "." : "#"); g.push(row); s += "\\n" + row; } g[0] = "." + g[0].slice(1); g[n-1] = g[n-1].slice(0, m-1) + "."; s = n + " " + m; for (var i = 0; i < n; i++) s += "\\n" + g[i]; s += "\\n1 1 " + n + " " + m; return s; }'
    },
    tips: [
      '无权图最短路一定用 BFS，不要用 DFS；队列里出队的顺序天然就是距离单调不降。',
      '起点等于终点时答案是 0，不要漏掉。',
      '入队时就把 dist 标记好（而不是出队时），否则同一个点会被重复入队，复杂度退化。'
    ]
  });

  /* ========================================================================
   * p21 课程安排（拓扑排序 + 判环）
   * ======================================================================*/
  window.CSP.problems.push({
    id: 'p21', no: 21, title: '课程安排', diff: 3, tier: '提高',
    knowledge: ['graph.toposort', 'ds.queue', 'graph.store'],
    limits: { time: '1s', memory: '128MB' },
    statement:
      '某专业有 n 门课程，编号 1 到 n。已知 m 条「先修关系」：一条关系 a b 表示课程 a 必须在课程 b 之前修完。\n' +
      '请排出所有课程的学习顺序，要求满足全部先修关系；如果有多种合法顺序，输出**字典序最小**的那一种。\n' +
      '如果先修关系互相矛盾（构成环）以至于无法安排，则输出一行 `No`。\n' +
      '做法：Kahn 算法——每次在所有入度为 0 的点中取编号最小的一个输出，然后删掉它所有的出边。',
    inputFormat:
      '第一行两个整数 n, m（1 ≤ n ≤ 1000，0 ≤ m ≤ 5000）。\n' +
      '接下来 m 行，每行两个整数 a, b（1 ≤ a, b ≤ n，a ≠ b），表示 a 必须先于 b。',
    outputFormat:
      '若存在合法顺序：一行 n 个整数，为字典序最小的拓扑序，用空格分隔。\n' +
      '若关系矛盾：一行 `No`。',
    samples: [
      {
        input: '4 3\n1 2\n1 3\n3 4\n',
        output: '1 2 3 4',
        explain: '先修 1；之后 2、3 都可以，取小的 2；再取 3、4。'
      }
    ],
    tests: [
      { input: '4 3\n1 2\n1 3\n3 4\n', output: '1 2 3 4', score: 20 },
      { input: '3 1\n2 1\n', output: '2 1 3', score: 20 },
      { input: '3 3\n1 2\n2 3\n3 1\n', output: 'No', score: 20 },
      { input: '5 4\n1 5\n2 5\n3 5\n4 5\n', output: '1 2 3 4 5', score: 20 },
      { input: '6 6\n1 2\n1 3\n2 4\n3 4\n4 5\n4 6\n', output: '1 2 3 4 5 6', score: 20 }
    ],
    std: {
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main(){',
        '  int n, m; scanf("%d %d", &n, &m);',
        '  vector<vector<int>> g(n + 1);',
        '  vector<int> indeg(n + 1, 0);',
        '  for (int i = 0; i < m; i++) { int a, b; scanf("%d %d", &a, &b); g[a].push_back(b); indeg[b]++; }',
        '  priority_queue<int, vector<int>, greater<int>> pq;',
        '  for (int i = 1; i <= n; i++) if (indeg[i] == 0) pq.push(i);',
        '  vector<int> ord;',
        '  while (!pq.empty()) {',
        '    int u = pq.top(); pq.pop();',
        '    ord.push_back(u);',
        '    for (size_t i = 0; i < g[u].size(); i++) if (--indeg[g[u][i]] == 0) pq.push(g[u][i]);',
        '  }',
        '  if ((int)ord.size() != n) { printf("No\\n"); return 0; }',
        '  for (size_t i = 0; i < ord.size(); i++) { if (i) printf(" "); printf("%d", ord[i]); }',
        '  printf("\\n");',
        '  return 0;',
        '}'
      ].join('\n')
    },
    algo: {
      title: 'Kahn 拓扑排序 + 每次取最小编号',
      viz: {
        input: '4 3\n1 2\n1 3\n3 4\n',
        type: 'graph', mainKey: 'n', edgesKey: 'edges', distKey: 'dist', curKey: 'cur',
        title: 'dist = 当前入度，每次取入度 0 的最小点'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), m = tk.int();',
        '  var adj = [], indeg = [], edges = [], i, k;',
        '  for (i = 0; i <= n; i++) { adj.push([]); indeg.push(0); }',
        '  for (i = 0; i < m; i++) {',
        '    var a = tk.int(), b = tk.int();',
        '    adj[a].push(b); indeg[b]++; edges.push([a, b]);',
        '  }',
        '  var dist = [];',
        '  for (i = 0; i <= n; i++) dist.push(indeg[i]);',
        '  var used = [], ord = [];',
        '  for (i = 0; i <= n; i++) used.push(false);',
        '  var S = { n: n, m: m, edges: edges, dist: dist, cur: 0, order: [], ans: "" };',
        '  T.step(S, "统计入度完成，边方向为 u→v（u 先修）");',
        '  for (k = 0; k < n; k++) {',
        '    var pick = 0;',
        '    for (i = 1; i <= n; i++) if (!used[i] && indeg[i] === 0) { pick = i; break; }',
        '    if (pick === 0) break;',
        '    used[pick] = true;',
        '    S.cur = pick; ord.push(pick); S.order = ord.slice();',
        '    for (i = 0; i <= n; i++) dist[i] = indeg[i];',
        '    T.step(S, "取出入度为 0 的最小编号 " + pick);',
        '    for (i = 0; i < adj[pick].length; i++) indeg[adj[pick][i]]--;',
        '    for (i = 0; i <= n; i++) dist[i] = indeg[i];',
        '    T.step(S, "删去 " + pick + " 的所有出边，更新后继入度");',
        '  }',
        '  var ans;',
        '  if (ord.length !== n) { ans = "No"; S.ans = "No"; }',
        '  else { ans = ord.join(" "); S.ans = ans; }',
        '  T.step(S, "拓扑序长度 " + ord.length + " / " + n);',
        '  T.answer(ans);',
        '  return ans;',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), m = tk.int();',
        '  var adj = [], indeg = [], edges = [], i;',
        '  for (i = 0; i <= n; i++) { adj.push([]); indeg.push(0); }',
        '  for (i = 0; i < m; i++) {',
        '    var a = tk.int(), b = tk.int();',
        '    adj[a].push(b); indeg[b]++; edges.push([a, b]);',
        '  }',
        '  var dist = [];',
        '  for (i = 0; i <= n; i++) dist.push(indeg[i]);',
        '  var ord = [];',
        '  var S = { n: n, m: m, edges: edges, dist: dist, cur: 0, order: [], ans: "" };',
        '  T.step(S, "统计入度完成");',
        '  // TODO: 重复 n 次：在还没取过且入度为 0 的点里挑编号最小的 pick',
        '  //       取不到就说明有环，直接结束；取到后把它的所有后继入度 -1',
        '  // TODO: 若 ord 长度不足 n，输出 No；否则输出 ord（空格分隔）',
        '  T.answer(S.ans);',
        '  return S.ans;',
        '}'
      ].join('\n'),
      pseudo: [
        '统计每个点的入度 indeg[]',
        'repeat n times:',
        '  在所有未取出且 indeg = 0 的点中取编号最小的 u（没有则说明有环，退出）',
        '  输出 u；对 u 的每条出边 u→v 执行 indeg[v]--',
        '若输出点数 < n 则输出 No，否则输出这个序列'
      ],
      gen: 'function(r){ var n = 2 + Math.floor(Math.random()*6); var m = Math.floor(Math.random()*(n+2)); var s = n + " " + m; for (var i = 0; i < m; i++) { var a = 1 + Math.floor(Math.random()*n); var b = 1 + Math.floor(Math.random()*n); if (a === b) { i--; continue; } s += "\\n" + a + " " + b; } return s; }'
    },
    tips: [
      '要输出「字典序最小」的拓扑序，就必须每次在入度 0 的点里取编号最小的（用优先队列或直接扫描）。',
      '判环只看最终输出的点数是否等于 n，不需要额外写 DFS 判环。',
      '重边会让入度重复累加，但取边时也会重复减，逻辑仍然自洽。'
    ]
  });

  /* ========================================================================
   * p22 单源最短路（Dijkstra）
   * ======================================================================*/
  window.CSP.problems.push({
    id: 'p22', no: 22, title: '单源最短路', diff: 3, tier: '提高',
    knowledge: ['graph.shortest', 'ds.heap', 'graph.store'],
    limits: { time: '1s', memory: '128MB' },
    statement:
      '给定一张 n 个点、m 条边的**有向图**，点编号 1 到 n，每条边有一个**非负**整数权值。\n' +
      '给定源点 s，求 s 到每个点的最短路径长度。若某个点从 s 出发不可达，输出 -1。\n' +
      '做法：Dijkstra。用一个数组 d[] 记录当前最短路估计值，每轮从未确定过的点里取 d 最小的点确定它，' +
      '再用它的出边去松弛邻居。权值非负是 Dijkstra 正确性的前提。',
    inputFormat:
      '第一行三个整数 n, m, s（1 ≤ n ≤ 2000，0 ≤ m ≤ 10000，1 ≤ s ≤ n）。\n' +
      '接下来 m 行，每行三个整数 u, v, w（1 ≤ u, v ≤ n，0 ≤ w ≤ 10^9），表示一条从 u 到 v、长度为 w 的有向边。',
    outputFormat: '一行 n 个整数，第 i 个数表示 s 到 i 的最短路长度，不可达输出 -1。相邻数字用空格分隔。',
    samples: [
      {
        input: '5 6 1\n1 2 2\n1 3 5\n2 3 1\n2 4 4\n3 5 3\n4 5 1\n',
        output: '0 2 3 6 6',
        explain: '到 3 走 1→2→3 更短（3 < 5）；到 5 有两条长度都是 6 的路。'
      }
    ],
    tests: [
      { input: '5 6 1\n1 2 2\n1 3 5\n2 3 1\n2 4 4\n3 5 3\n4 5 1\n', output: '0 2 3 6 6', score: 20 },
      { input: '4 2 1\n1 2 7\n3 4 1\n', output: '0 7 -1 -1', score: 20 },
      { input: '3 3 1\n1 2 0\n2 3 0\n1 3 5\n', output: '0 0 0', score: 20 },
      { input: '1 0 1\n', output: '0', score: 20 },
      { input: '6 8 1\n1 2 4\n1 3 2\n2 4 5\n3 4 1\n4 5 3\n3 5 7\n5 6 2\n4 6 9\n', output: '0 4 2 3 6 8', score: 20 }
    ],
    std: {
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'typedef long long ll;',
        'int main(){',
        '  int n, m, s; scanf("%d %d %d", &n, &m, &s);',
        '  vector<vector<pair<int,ll>>> g(n + 1);',
        '  for (int i = 0; i < m; i++) { int u, v; ll w; scanf("%d %d %lld", &u, &v, &w); g[u].push_back(make_pair(v, w)); }',
        '  const ll INF = (ll)4e18;',
        '  vector<ll> d(n + 1, INF);',
        '  d[s] = 0;',
        '  priority_queue<pair<ll,int>, vector<pair<ll,int>>, greater<pair<ll,int>>> pq;',
        '  pq.push(make_pair(0LL, s));',
        '  while (!pq.empty()) {',
        '    pair<ll,int> t = pq.top(); pq.pop();',
        '    ll du = t.first; int u = t.second;',
        '    if (du > d[u]) continue;',
        '    for (size_t i = 0; i < g[u].size(); i++) {',
        '      int v = g[u][i].first; ll w = g[u][i].second;',
        '      if (du + w < d[v]) { d[v] = du + w; pq.push(make_pair(d[v], v)); }',
        '    }',
        '  }',
        '  for (int i = 1; i <= n; i++) { if (i > 1) printf(" "); if (d[i] >= INF) printf("-1"); else printf("%lld", d[i]); }',
        '  printf("\\n");',
        '  return 0;',
        '}'
      ].join('\n')
    },
    algo: {
      title: 'Dijkstra 逐点确定最短路',
      viz: {
        input: '5 6 1\n1 2 2\n1 3 5\n2 3 1\n2 4 4\n3 5 3\n4 5 1\n',
        type: 'graph', mainKey: 'n', edgesKey: 'edges', distKey: 'dist', curKey: 'cur',
        title: 'dist = 当前最短路估计值，-1 表示未确定/不可达'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), m = tk.int(), s = tk.int();',
        '  var adj = [], edges = [], i, k;',
        '  for (i = 0; i <= n; i++) adj.push([]);',
        '  for (i = 0; i < m; i++) {',
        '    var u = tk.int(), v = tk.int(), w = tk.int();',
        '    adj[u].push([v, w]);',
        '    edges.push([u, v, w]);',
        '  }',
        '  var dist = [], done = [];',
        '  for (i = 0; i <= n; i++) { dist.push(-1); done.push(false); }',
        '  dist[s] = 0;',
        '  var S = { n: n, m: m, edges: edges, dist: dist, cur: s, ans: "", src: s };',
        '  T.step(S, "源点 " + s + " 的距离设为 0");',
        '  for (k = 0; k < n; k++) {',
        '    var pick = 0;',
        '    for (i = 1; i <= n; i++) {',
        '      if (done[i] || dist[i] === -1) continue;',
        '      if (pick === 0 || dist[i] < dist[pick]) pick = i;',
        '    }',
        '    if (pick === 0) break;',
        '    done[pick] = true;',
        '    S.cur = pick;',
        '    T.step(S, "确定 " + pick + " 的最短路 = " + dist[pick]);',
        '    for (i = 0; i < adj[pick].length; i++) {',
        '      var v = adj[pick][i][0], w = adj[pick][i][1];',
        '      if (dist[v] === -1 || dist[pick] + w < dist[v]) dist[v] = dist[pick] + w;',
        '    }',
        '    T.step(S, "用 " + pick + " 松弛它的出边");',
        '  }',
        '  var out = [];',
        '  for (i = 1; i <= n; i++) out.push(String(dist[i]));',
        '  var ans = out.join(" ");',
        '  S.ans = ans;',
        '  T.answer(ans);',
        '  return ans;',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), m = tk.int(), s = tk.int();',
        '  var adj = [], edges = [], i;',
        '  for (i = 0; i <= n; i++) adj.push([]);',
        '  for (i = 0; i < m; i++) {',
        '    var u = tk.int(), v = tk.int(), w = tk.int();',
        '    adj[u].push([v, w]);',
        '    edges.push([u, v, w]);',
        '  }',
        '  var dist = [], done = [];   // dist = -1 表示不可达/未确定',
        '  for (i = 0; i <= n; i++) { dist.push(-1); done.push(false); }',
        '  dist[s] = 0;',
        '  var S = { n: n, m: m, edges: edges, dist: dist, cur: s, ans: "", src: s };',
        '  T.step(S, "源点距离设为 0");',
        '  // TODO: 重复 n 轮：从未确定的点中挑 dist 最小的 pick，标记 done',
        '  // TODO: 用 pick 的每条出边 (v, w) 松弛：dist[v] = min(dist[v], dist[pick] + w)',
        '  // 注意：dist[v] === -1 表示无穷大，要单独处理',
        '  var out = [];',
        '  for (i = 1; i <= n; i++) out.push(String(dist[i]));',
        '  S.ans = out.join(" ");',
        '  T.answer(S.ans);',
        '  return S.ans;',
        '}'
      ].join('\n'),
      pseudo: [
        'dist[] ← ∞，dist[s] ← 0',
        'repeat n times:',
        '  在未确定的点中取 dist 最小的 u（没有则退出）',
        '  标记 u 已确定；对每条出边 (u,v,w)：dist[v] ← min(dist[v], dist[u]+w)',
        '输出 dist[1..n]，∞ 记作 -1'
      ],
      gen: 'function(r){ var n = 2 + Math.floor(Math.random()*6); var m = Math.floor(Math.random()*(n*2)); var s = n + " " + m + " 1"; for (var i = 0; i < m; i++) { var u = 1 + Math.floor(Math.random()*n); var v = 1 + Math.floor(Math.random()*n); var w = Math.floor(Math.random()*10); s += "\\n" + u + " " + v + " " + w; } return s; }'
    },
    tips: [
      '边权可以为 0，所以「非负」不能用 w > 0 来判断，只能用 w ≥ 0。',
      '不可达要输出 -1；如果距离用 -1 当无穷大，松弛时务必先判断 dist[v] === -1。',
      '答案可能超过 int 范围（n·w 最大 2×10^12），C++ 必须开 long long。'
    ]
  });

  /* ========================================================================
   * p23 最小生成树（Kruskal + 并查集）
   * ======================================================================*/
  window.CSP.problems.push({
    id: 'p23', no: 23, title: '最小生成树', diff: 3, tier: '提高',
    knowledge: ['graph.mst', 'ds.dsu', 'basic.sort'],
    limits: { time: '1s', memory: '128MB' },
    statement:
      '给定一张 n 个点、m 条边的**无向连通（或非连通）图**，点编号 1 到 n，每条边有整数权值。\n' +
      '求它的最小生成树的边权之和（即用 n-1 条边把所有点连通的最小总权值）。\n' +
      '如果图不连通（无法把所有点连通），输出 -1。\n' +
      '做法：Kruskal。把边按权值从小到大排序，依次考虑每条边，' +
      '若它的两个端点还不在同一个并查集里，就选中它并把两个集合合并。',
    inputFormat:
      '第一行两个整数 n, m（1 ≤ n ≤ 1000，0 ≤ m ≤ 5000）。\n' +
      '接下来 m 行，每行三个整数 u, v, w（1 ≤ u, v ≤ n，0 ≤ w ≤ 10^6），表示连接 u 和 v、权值为 w 的无向边。',
    outputFormat: '一行一个整数：最小生成树的总权值；图不连通时输出 -1。',
    samples: [
      {
        input: '4 5\n1 2 1\n2 3 2\n3 4 3\n1 4 10\n2 4 4\n',
        output: '6',
        explain: '选 1-2(1)、2-3(2)、3-4(3)，总和 6。'
      }
    ],
    tests: [
      { input: '4 5\n1 2 1\n2 3 2\n3 4 3\n1 4 10\n2 4 4\n', output: '6', score: 20 },
      { input: '4 2\n1 2 1\n3 4 2\n', output: '-1', score: 20 },
      { input: '1 0\n', output: '0', score: 20 },
      { input: '3 4\n1 1 5\n1 2 3\n1 2 1\n2 3 2\n', output: '3', score: 20 },
      { input: '5 7\n1 2 4\n2 3 1\n3 4 6\n4 5 2\n5 1 3\n1 3 5\n2 5 7\n', output: '10', score: 20 }
    ],
    std: {
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'typedef long long ll;',
        'int fa[100005];',
        'int find(int x){ return fa[x] == x ? x : fa[x] = find(fa[x]); }',
        'int main(){',
        '  int n, m; scanf("%d %d", &n, &m);',
        '  vector<pair<ll, pair<int,int>>> e;',
        '  for (int i = 0; i < m; i++) { int u, v; ll w; scanf("%d %d %lld", &u, &v, &w); e.push_back(make_pair(w, make_pair(u, v))); }',
        '  sort(e.begin(), e.end());',
        '  for (int i = 1; i <= n; i++) fa[i] = i;',
        '  ll total = 0; int cnt = 0;',
        '  for (int i = 0; i < m; i++) {',
        '    int u = find(e[i].second.first), v = find(e[i].second.second);',
        '    if (u != v) { fa[u] = v; total += e[i].first; cnt++; }',
        '  }',
        '  if (cnt == n - 1) printf("%lld\\n", total); else printf("-1\\n");',
        '  return 0;',
        '}'
      ].join('\n')
    },
    algo: {
      title: 'Kruskal 排序 + 并查集合并',
      viz: {
        input: '4 5\n1 2 1\n2 3 2\n3 4 3\n1 4 10\n2 4 4\n',
        type: 'graph', mainKey: 'n', edgesKey: 'edges', distKey: 'dist', curKey: 'cur',
        title: 'dist = 并查集根编号（同根即已连通）'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), m = tk.int();',
        '  var edges = [], E = [], i, j;',
        '  for (i = 0; i < m; i++) {',
        '    var u = tk.int(), v = tk.int(), w = tk.int();',
        '    edges.push([u, v, w]);',
        '    E.push([u, v, w]);',
        '  }',
        '  E.sort(function (a, b) { return a[2] - b[2] || a[0] - b[0] || a[1] - b[1]; });',
        '  var fa = [];',
        '  for (i = 0; i <= n; i++) fa.push(i);',
        '  function find(x) { while (fa[x] !== x) { fa[x] = fa[fa[x]]; x = fa[x]; } return x; }',
        '  var dist = [];',
        '  for (i = 0; i <= n; i++) dist.push(i);',
        '  var S = { n: n, m: m, edges: edges, dist: dist, cur: 0, pick: [], ans: -1, chosen: 0, total: 0 };',
        '  T.step(S, "把 " + m + " 条边按权值从小到大排序");',
        '  var total = 0, chosen = 0;',
        '  for (i = 0; i < E.length; i++) {',
        '    var a = E[i][0], b = E[i][1], w = E[i][2];',
        '    S.cur = a; S.pick = [a, b, w];',
        '    T.step(S, "考察边 " + a + " - " + b + "（权 " + w + "）");',
        '    var ra = find(a), rb = find(b);',
        '    if (ra !== rb) {',
        '      fa[ra] = rb;',
        '      total += w; chosen++;',
        '      for (j = 1; j <= n; j++) dist[j] = find(j);',
        '      S.total = total; S.chosen = chosen;',
        '      T.step(S, "两端不连通，选中该边，累计 " + total);',
        '    } else {',
        '      T.step(S, "两端已连通，跳过该边（否则成环）");',
        '    }',
        '  }',
        '  var ans = (chosen === n - 1) ? String(total) : "-1";',
        '  S.ans = (chosen === n - 1) ? total : -1;',
        '  T.step(S, (chosen === n - 1) ? ("最小生成树总权值 " + total) : "图不连通，无生成树");',
        '  T.answer(ans);',
        '  return ans;',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), m = tk.int();',
        '  var edges = [], E = [], i;',
        '  for (i = 0; i < m; i++) {',
        '    var u = tk.int(), v = tk.int(), w = tk.int();',
        '    edges.push([u, v, w]);',
        '    E.push([u, v, w]);',
        '  }',
        '  // TODO: 把 E 按边权 w 升序排序（w 相同时按 u、v 排，保证确定性）',
        '  var fa = [];                       // 并查集',
        '  for (i = 0; i <= n; i++) fa.push(i);',
        '  var dist = [];',
        '  for (i = 0; i <= n; i++) dist.push(i);',
        '  var S = { n: n, m: m, edges: edges, dist: dist, cur: 0, pick: [], ans: -1, chosen: 0, total: 0 };',
        '  T.step(S, "准备 Kruskal");',
        '  // TODO: 依次考察排好序的每条边 (u,v,w)：find(u) != find(v) 就合并并累计权值',
        '  // TODO: 共选中 n-1 条边就成功，输出总权值；少于 n-1 条输出 -1',
        '  T.answer(String(S.ans));',
        '  return String(S.ans);',
        '}'
      ].join('\n'),
      pseudo: [
        'E ← 所有边，按 w 升序排序；fa[i] ← i',
        'total ← 0，cnt ← 0',
        'for (u,v,w) in E:',
        '  if find(u) ≠ find(v): fa[find(u)] ← find(v); total += w; cnt++',
        '若 cnt = n-1 输出 total，否则输出 -1'
      ],
      gen: 'function(r){ var n = 1 + Math.floor(Math.random()*6); var m = Math.floor(Math.random()*(n*2+1)); var s = n + " " + m; for (var i = 0; i < m; i++) { var u = 1 + Math.floor(Math.random()*n); var v = 1 + Math.floor(Math.random()*n); var w = Math.floor(Math.random()*10); s += "\\n" + u + " " + v + " " + w; } return s; }'
    },
    tips: [
      '必须先把边按权值排序再做并查集合并，顺序错了就不是最小生成树。',
      '自环（u = v）一定跳过，因为它对连通性毫无贡献。',
      '判断「图连通」的唯一标准是最终选中的边数等于 n-1；n = 1 时答案是 0。'
    ]
  });

  /* ========================================================================
   * p24 二分图判定（染色法）
   * ======================================================================*/
  window.CSP.problems.push({
    id: 'p24', no: 24, title: '二分图判定', diff: 3, tier: '提高',
    knowledge: ['graph.bipartite', 'graph.dfs', 'graph.store'],
    limits: { time: '1s', memory: '128MB' },
    statement:
      '给定一张 n 个点、m 条边的无向图（点编号 1 到 n）。' +
      '如果能把所有点染成 0 / 1 两种颜色，使得每条边的两个端点颜色都不同，它就是**二分图**。\n' +
      '请判定这张图是不是二分图。\n' +
      '若是二分图：第一行输出 `Yes`，第二行输出两个整数，分别表示颜色 0 和颜色 1 的点数。\n' +
      '若非二分图：只输出一行 `No`。\n' +
      '约定染色规则：每次进入一个尚未染色的连通块时，把该连通块中**编号最小的点**染成 0，' +
      '其余点的颜色由「相邻点异色」唯一确定。这样颜色 0 / 1 的点数是确定的。',
    inputFormat:
      '第一行两个整数 n, m（1 ≤ n ≤ 1000，0 ≤ m ≤ 5000）。\n' +
      '接下来 m 行，每行两个整数 u, v（1 ≤ u, v ≤ n），表示一条无向边。',
    outputFormat:
      '二分图：第一行 `Yes`，第二行两个整数（颜色 0 的点数、颜色 1 的点数），空格分隔。\n' +
      '非二分图：一行 `No`。',
    samples: [
      {
        input: '4 4\n1 2\n2 3\n3 4\n4 1\n',
        output: 'Yes\n2 2',
        explain: '四元环：1,3 染 0，2,4 染 1，两类各 2 个。'
      }
    ],
    tests: [
      { input: '4 4\n1 2\n2 3\n3 4\n4 1\n', output: 'Yes\n2 2', score: 20 },
      { input: '3 3\n1 2\n2 3\n3 1\n', output: 'No', score: 20 },
      { input: '3 0\n', output: 'Yes\n3 0', score: 20 },
      { input: '5 4\n1 2\n1 3\n3 4\n3 5\n', output: 'Yes\n3 2', score: 20 },
      { input: '5 5\n1 2\n2 3\n3 4\n4 5\n5 1\n', output: 'No', score: 20 }
    ],
    std: {
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main(){',
        '  int n, m; scanf("%d %d", &n, &m);',
        '  vector<vector<int>> g(n + 1);',
        '  for (int i = 0; i < m; i++) { int u, v; scanf("%d %d", &u, &v); g[u].push_back(v); g[v].push_back(u); }',
        '  vector<int> col(n + 1, -1);',
        '  bool ok = true;',
        '  for (int s = 1; s <= n && ok; s++) {',
        '    if (col[s] != -1) continue;',
        '    col[s] = 0;',
        '    vector<int> st; st.push_back(s);',
        '    while (!st.empty() && ok) {',
        '      int u = st.back(); st.pop_back();',
        '      for (size_t i = 0; i < g[u].size(); i++) {',
        '        int v = g[u][i];',
        '        if (col[v] == -1) { col[v] = 1 - col[u]; st.push_back(v); }',
        '        else if (col[v] == col[u]) { ok = false; break; }',
        '      }',
        '    }',
        '  }',
        '  if (!ok) { printf("No\\n"); return 0; }',
        '  int c0 = 0, c1 = 0;',
        '  for (int i = 1; i <= n; i++) { if (col[i] == 0) c0++; else c1++; }',
        '  printf("Yes\\n%d %d\\n", c0, c1);',
        '  return 0;',
        '}'
      ].join('\n')
    },
    algo: {
      title: '染色法判定二分图',
      viz: {
        input: '4 4\n1 2\n2 3\n3 4\n4 1\n',
        type: 'graph', mainKey: 'n', edgesKey: 'edges', distKey: 'dist', curKey: 'cur',
        title: 'dist = 染色结果（-1 未染色，0 / 1 两种颜色）'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), m = tk.int();',
        '  var adj = [], edges = [], i;',
        '  for (i = 0; i <= n; i++) adj.push([]);',
        '  for (i = 0; i < m; i++) {',
        '    var u = tk.int(), v = tk.int();',
        '    adj[u].push(v); adj[v].push(u);',
        '    edges.push([u, v]);',
        '  }',
        '  var dist = [];',
        '  for (i = 0; i <= n; i++) dist.push(-1);',
        '  dist[0] = 0;',
        '  var S = { n: n, m: m, edges: edges, dist: dist, cur: 0, ok: true, ans: "" };',
        '  T.step(S, "初始所有点都未染色（-1）");',
        '  var ok = true, s;',
        '  for (s = 1; s <= n && ok; s++) {',
        '    if (dist[s] !== -1) continue;',
        '    dist[s] = 0;',
        '    var st = [s];',
        '    S.cur = s;',
        '    T.step(S, "连通块起点 " + s + " 染成 0");',
        '    while (st.length > 0 && ok) {',
        '      var x = st.pop();',
        '      S.cur = x;',
        '      T.step(S, "取出点 " + x + "（颜色 " + dist[x] + "）");',
        '      for (i = 0; i < adj[x].length; i++) {',
        '        var y = adj[x][i];',
        '        if (dist[y] === -1) { dist[y] = 1 - dist[x]; st.push(y); }',
        '        else if (dist[y] === dist[x]) { ok = false; S.ok = false; S.bad = [x, y]; break; }',
        '      }',
        '      if (!ok) { T.step(S, "点 " + x + " 与 " + S.bad[1] + " 同色，冲突！"); break; }',
        '    }',
        '  }',
        '  var ans;',
        '  if (!ok) { ans = "No"; S.ans = "No"; }',
        '  else {',
        '    var c0 = 0, c1 = 0;',
        '    for (i = 1; i <= n; i++) { if (dist[i] === 0) c0++; else c1++; }',
        '    ans = "Yes\\n" + c0 + " " + c1;',
        '    S.c0 = c0; S.c1 = c1; S.ans = ans;',
        '  }',
        '  T.step(S, ok ? "染色完成，是二分图" : "存在奇环，不是二分图");',
        '  T.answer(ans);',
        '  return ans;',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), m = tk.int();',
        '  var adj = [], edges = [], i;',
        '  for (i = 0; i <= n; i++) adj.push([]);',
        '  for (i = 0; i < m; i++) {',
        '    var u = tk.int(), v = tk.int();',
        '    adj[u].push(v); adj[v].push(u);',
        '    edges.push([u, v]);',
        '  }',
        '  var dist = [];',
        '  for (i = 0; i <= n; i++) dist.push(-1);   // 这里借用 dist 存颜色',
        '  var S = { n: n, m: m, edges: edges, dist: dist, cur: 0, ok: true, ans: "" };',
        '  T.step(S, "初始所有点都未染色");',
        '  // TODO: 从 1 到 n 枚举，未染色的点作为新连通块起点，染成 0',
        '  // TODO: 用栈做 DFS：取出的点 x，若邻居 y 未染色则染 1-dist[x] 并压栈；',
        '  //       若 y 与 x 同色，说明出现了奇环，立即判定失败（ok = false）',
        '  // TODO: 成功则输出 Yes 与两种颜色的点数，失败输出 No',
        '  T.answer(S.ans);',
        '  return S.ans;',
        '}'
      ].join('\n'),
      pseudo: [
        'col[] ← -1',
        'for s ← 1 to n: if col[s] = -1 then col[s] ← 0, 栈 ← {s}',
        '  while 栈非空: u ← 弹栈',
        '    for each v in adj[u]:',
        '      if col[v] = -1 then col[v] ← 1 - col[u], 压栈 v',
        '      else if col[v] = col[u] then 输出 No 并结束',
        '统计 col = 0 / 1 的点数，输出 Yes 与两个计数'
      ],
      gen: 'function(r){ var n = 2 + Math.floor(Math.random()*6); var m = Math.floor(Math.random()*(n+3)); var s = n + " " + m; for (var i = 0; i < m; i++) { var u = 1 + Math.floor(Math.random()*n); var v = 1 + Math.floor(Math.random()*n); if (u === v) { i--; continue; } s += "\\n" + u + " " + v; } return s; }'
    },
    tips: [
      '图可能不连通，必须对每个连通块分别染色，不能只从 1 号点搜一次。',
      '判定失败的充要条件是存在奇环（奇数长度的环），染色冲突时立刻退出。',
      '孤立点自成连通块，按约定染成 0，会被计入颜色 0 的点数。'
    ]
  });

  /* ========================================================================
   * p25 树上最近公共祖先（LCA）
   * ======================================================================*/
  window.CSP.problems.push({
    id: 'p25', no: 25, title: '最近公共祖先', diff: 4, tier: '提高+',
    knowledge: ['graph.lca', 'graph.dfs', 'graph.store'],
    limits: { time: '1s', memory: '128MB' },
    statement:
      '给定一棵 n 个结点的树，结点编号 1 到 n，**根约定为 1 号点**。\n' +
      '有 q 次询问，每次给定两个结点 a, b，求它们的最近公共祖先 LCA(a, b)，' +
      '即同时是 a 和 b 祖先的结点中深度最大的那一个。\n' +
      '做法（数据小，暴力即可）：先从根 BFS 一遍求出每个点的父亲 father[] 和深度 depth[]，' +
      '询问时先把较深的点一步步往上爬，直到两点深度相同，再让两点同时往上爬直到相遇。',
    inputFormat:
      '第一行两个整数 n, q（1 ≤ n, q ≤ 2000）。\n' +
      '接下来 n-1 行，每行两个整数 u, v（1 ≤ u, v ≤ n），表示树上的一条边。\n' +
      '接下来 q 行，每行两个整数 a, b（1 ≤ a, b ≤ n），表示一次询问。',
    outputFormat: '共 q 行，第 i 行一个整数，表示第 i 次询问的 LCA。',
    samples: [
      {
        input: '5 3\n1 2\n1 3\n3 4\n3 5\n2 4\n4 5\n2 3\n',
        output: '1\n3\n1',
        explain: 'LCA(2,4)=1，LCA(4,5)=3，LCA(2,3)=1。'
      }
    ],
    tests: [
      { input: '5 3\n1 2\n1 3\n3 4\n3 5\n2 4\n4 5\n2 3\n', output: '1\n3\n1', score: 20 },
      { input: '4 3\n1 2\n2 3\n3 4\n4 2\n3 4\n1 4\n', output: '2\n3\n1', score: 20 },
      { input: '2 2\n1 2\n1 1\n2 2\n', output: '1\n2', score: 20 },
      { input: '5 3\n1 2\n1 3\n1 4\n1 5\n2 3\n4 5\n1 5\n', output: '1\n1\n1', score: 20 },
      { input: '8 4\n1 2\n2 3\n3 4\n2 5\n5 6\n5 7\n7 8\n4 6\n8 6\n3 8\n7 8\n', output: '2\n5\n2\n7', score: 20 }
    ],
    std: {
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main(){',
        '  int n, q; scanf("%d %d", &n, &q);',
        '  vector<vector<int>> g(n + 1);',
        '  for (int i = 0; i < n - 1; i++) { int u, v; scanf("%d %d", &u, &v); g[u].push_back(v); g[v].push_back(u); }',
        '  vector<int> par(n + 1, 0), dep(n + 1, 0), vis(n + 1, 0);',
        '  queue<int> qu; qu.push(1); vis[1] = 1;',
        '  while (!qu.empty()) {',
        '    int u = qu.front(); qu.pop();',
        '    for (size_t i = 0; i < g[u].size(); i++) {',
        '      int v = g[u][i];',
        '      if (!vis[v]) { vis[v] = 1; par[v] = u; dep[v] = dep[u] + 1; qu.push(v); }',
        '    }',
        '  }',
        '  for (int i = 0; i < q; i++) {',
        '    int a, b; scanf("%d %d", &a, &b);',
        '    while (dep[a] > dep[b]) a = par[a];',
        '    while (dep[b] > dep[a]) b = par[b];',
        '    while (a != b) { a = par[a]; b = par[b]; }',
        '    printf("%d\\n", a);',
        '  }',
        '  return 0;',
        '}'
      ].join('\n')
    },
    algo: {
      title: 'BFS 预处理深度 + 暴力上爬求 LCA',
      viz: {
        input: '5 2\n1 2\n1 3\n3 4\n3 5\n2 4\n4 5\n',
        type: 'graph', mainKey: 'n', edgesKey: 'edges', distKey: 'dist', curKey: 'cur',
        title: 'dist = 深度（到根的距离）'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), q = tk.int();',
        '  var adj = [], edges = [], i;',
        '  for (i = 0; i <= n; i++) adj.push([]);',
        '  for (i = 0; i < n - 1; i++) {',
        '    var u = tk.int(), v = tk.int();',
        '    adj[u].push(v); adj[v].push(u);',
        '    edges.push([u, v]);',
        '  }',
        '  var par = [], dep = [];',
        '  for (i = 0; i <= n; i++) { par.push(0); dep.push(0); }',
        '  var S = { n: n, m: n - 1, edges: edges, dist: dep, cur: 1, ans: "" };',
        '  T.step(S, "建好树，准备从根 1 号点 BFS");',
        '  var q1 = [1], head = 0, vis = [];',
        '  for (i = 0; i <= n; i++) vis.push(false);',
        '  vis[1] = true;',
        '  while (head < q1.length) {',
        '    var x = q1[head]; head++;',
        '    S.cur = x;',
        '    T.step(S, "结点 " + x + " 深度 " + dep[x] + "，记录其子结点");',
        '    for (i = 0; i < adj[x].length; i++) {',
        '      var y = adj[x][i];',
        '      if (!vis[y]) { vis[y] = true; par[y] = x; dep[y] = dep[x] + 1; q1.push(y); }',
        '    }',
        '  }',
        '  S.dist = dep;',
        '  T.step(S, "深度预处理完成");',
        '  var out = [];',
        '  for (var t = 0; t < q; t++) {',
        '    var a = tk.int(), b = tk.int();',
        '    var x0 = a, y0 = b;',
        '    while (dep[x0] > dep[y0]) { x0 = par[x0]; S.cur = x0; T.step(S, "询问 " + a + "," + b + "：深的点爬到 " + x0); }',
        '    while (dep[y0] > dep[x0]) { y0 = par[y0]; S.cur = y0; T.step(S, "询问 " + a + "," + b + "：深的点爬到 " + y0); }',
        '    while (x0 !== y0) { x0 = par[x0]; y0 = par[y0]; S.cur = x0; T.step(S, "询问 " + a + "," + b + "：两点同时爬到 " + x0 + " 和 " + y0); }',
        '    out.push(String(x0));',
        '    S.cur = x0;',
        '    T.step(S, "LCA(" + a + "," + b + ") = " + x0);',
        '  }',
        '  var ans = out.join("\\n");',
        '  S.ans = ans;',
        '  T.answer(ans);',
        '  return ans;',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), q = tk.int();',
        '  var adj = [], edges = [], i;',
        '  for (i = 0; i <= n; i++) adj.push([]);',
        '  for (i = 0; i < n - 1; i++) {',
        '    var u = tk.int(), v = tk.int();',
        '    adj[u].push(v); adj[v].push(u);',
        '    edges.push([u, v]);',
        '  }',
        '  var par = [], dep = [];',
        '  for (i = 0; i <= n; i++) { par.push(0); dep.push(0); }',
        '  var S = { n: n, m: n - 1, edges: edges, dist: dep, cur: 1, ans: "" };',
        '  T.step(S, "准备从根 1 号点 BFS");',
        '  // TODO: 从 1 号点 BFS，求出每个点的父亲 par[] 和深度 dep[]，同时把 dep 写进 S.dist',
        '  var out = [];',
        '  // TODO: 依次处理 q 个询问：先把深的点上爬对齐深度，再同步上爬直到相遇',
        '  // TODO: 每行输出一次询问的 LCA',
        '  S.ans = out.join("\\n");',
        '  T.answer(S.ans);',
        '  return S.ans;',
        '}'
      ].join('\n'),
      pseudo: [
        '根 ← 1，BFS 求 par[] 与 dep[]',
        'for each query (a, b):',
        '  while dep[a] > dep[b]: a ← par[a]',
        '  while dep[b] > dep[a]: b ← par[b]',
        '  while a ≠ b: a ← par[a]; b ← par[b]',
        '  输出 a'
      ],
      gen: 'function(r){ var n = 1 + Math.floor(Math.random()*7); var s = n + " 2"; for (var i = 2; i <= n; i++) s += "\\n" + (1 + Math.floor(Math.random()*(i-1))) + " " + i; for (var k = 0; k < 2; k++) s += "\\n" + (1 + Math.floor(Math.random()*n)) + " " + (1 + Math.floor(Math.random()*n)); return s; }'
    },
    tips: [
      '树是无向边，BFS 时必须记录 vis 防止从儿子走回父亲。',
      '两个点深度对齐后才能同时上爬；a 是 b 祖先时直接就是答案，不要少输出。',
      '根结点 1 的深度规定为 0，父亲记为 0（哨兵）。'
    ]
  });

  /* ========================================================================
   * p26 树的直径
   * ======================================================================*/
  window.CSP.problems.push({
    id: 'p26', no: 26, title: '树的直径', diff: 4, tier: '提高+',
    knowledge: ['graph.diameter', 'graph.dfs', 'graph.bfs'],
    limits: { time: '1s', memory: '128MB' },
    statement:
      '给定一棵 n 个结点的**带权树**（边权为正整数），结点编号 1 到 n。\n' +
      '树的「直径」指树上距离最远的两点之间的距离。请输出这个距离。\n' +
      '做法（两次 BFS/DFS）：先任取一点（比如 1 号点）出发，找到距离它最远的点 A；' +
      '再从 A 出发，找到距离 A 最远的距离，这个距离就是树的直径。',
    inputFormat:
      '第一行一个整数 n（1 ≤ n ≤ 2000）。\n' +
      '接下来 n-1 行，每行三个整数 u, v, w（1 ≤ u, v ≤ n，1 ≤ w ≤ 10^6），表示 u 与 v 之间有一条长度为 w 的边。',
    outputFormat: '一行一个整数，表示树的直径（最远两点间的距离和）。',
    samples: [
      {
        input: '4\n1 2 1\n2 3 2\n2 4 3\n',
        output: '5',
        explain: '最远的是 3 和 4，距离 2 + 3 = 5。'
      }
    ],
    tests: [
      { input: '4\n1 2 1\n2 3 2\n2 4 3\n', output: '5', score: 20 },
      { input: '4\n1 2 10\n2 3 20\n3 4 30\n', output: '60', score: 20 },
      { input: '1\n', output: '0', score: 20 },
      { input: '4\n1 2 5\n1 3 7\n1 4 2\n', output: '12', score: 20 },
      { input: '7\n1 2 3\n2 3 4\n3 4 5\n2 5 1\n5 6 1\n6 7 1\n', output: '12', score: 20 }
    ],
    std: {
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'typedef long long ll;',
        'int n;',
        'vector<vector<pair<int,ll>>> g;',
        'pair<int,ll> bfs(int src){',
        '  vector<ll> d(n + 1, -1);',
        '  queue<int> q; d[src] = 0; q.push(src);',
        '  int far = src;',
        '  while (!q.empty()) {',
        '    int u = q.front(); q.pop();',
        '    if (d[u] > d[far] || (d[u] == d[far] && u < far)) far = u;',
        '    for (size_t i = 0; i < g[u].size(); i++) {',
        '      int v = g[u][i].first; ll w = g[u][i].second;',
        '      if (d[v] == -1) { d[v] = d[u] + w; q.push(v); }',
        '    }',
        '  }',
        '  return make_pair(far, d[far]);',
        '}',
        'int main(){',
        '  scanf("%d", &n);',
        '  g.assign(n + 1, vector<pair<int,ll>>());',
        '  for (int i = 0; i < n - 1; i++) { int u, v; ll w; scanf("%d %d %lld", &u, &v, &w); g[u].push_back(make_pair(v, w)); g[v].push_back(make_pair(u, w)); }',
        '  int a = bfs(1).first;',
        '  printf("%lld\\n", bfs(a).second);',
        '  return 0;',
        '}'
      ].join('\n')
    },
    algo: {
      title: '两次 BFS 求树的直径',
      viz: {
        input: '4 3\n1 2 1\n2 3 2\n2 4 3\n',
        type: 'graph', mainKey: 'n', edgesKey: 'edges', distKey: 'dist', curKey: 'cur',
        title: 'dist = 离本轮起点的距离'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int();',
        '  var adj = [], edges = [], i;',
        '  for (i = 0; i <= n; i++) adj.push([]);',
        '  for (i = 0; i < n - 1; i++) {',
        '    var u = tk.int(), v = tk.int(), w = tk.int();',
        '    adj[u].push([v, w]); adj[v].push([u, w]);',
        '    edges.push([u, v, w]);',
        '  }',
        '  var dist = [];',
        '  for (i = 0; i <= n; i++) dist.push(-1);',
        '  var S = { n: n, m: n - 1, edges: edges, dist: dist, cur: 1, src: 1, far: 1, ans: 0 };',
        '  T.step(S, "建好带权树，共 " + n + " 个结点");',
        '  function bfs(src) {',
        '    var d = [], j;',
        '    for (j = 0; j <= n; j++) d.push(-1);',
        '    var q = [src], head = 0;',
        '    d[src] = 0;',
        '    var far = src;',
        '    S.src = src; S.cur = src; S.dist = d; S.far = far;',
        '    T.step(S, "从 " + src + " 号点出发 BFS");',
        '    while (head < q.length) {',
        '      var x = q[head]; head++;',
        '      S.cur = x;',
        '      if (d[x] > d[far] || (d[x] === d[far] && x < far)) far = x;',
        '      S.far = far;',
        '      T.step(S, "访问 " + x + "，距离 " + d[x] + "，当前最远点 " + far);',
        '      for (j = 0; j < adj[x].length; j++) {',
        '        var y = adj[x][j][0], w = adj[x][j][1];',
        '        if (d[y] === -1) { d[y] = d[x] + w; q.push(y); }',
        '      }',
        '      S.dist = d;',
        '    }',
        '    return [far, d[far]];',
        '  }',
        '  var r1 = bfs(1);',
        '  var A = r1[0];',
        '  T.step(S, "从 1 号点出发最远的点是 " + A);',
        '  var r2 = bfs(A);',
        '  var ans = r2[1];',
        '  S.ans = ans;',
        '  T.step(S, "从 " + A + " 出发最远距离 = " + ans + "，即直径");',
        '  T.answer(String(ans));',
        '  return String(ans);',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int();',
        '  var adj = [], edges = [], i;',
        '  for (i = 0; i <= n; i++) adj.push([]);',
        '  for (i = 0; i < n - 1; i++) {',
        '    var u = tk.int(), v = tk.int(), w = tk.int();',
        '    adj[u].push([v, w]); adj[v].push([u, w]);',
        '    edges.push([u, v, w]);',
        '  }',
        '  var dist = [];',
        '  for (i = 0; i <= n; i++) dist.push(-1);',
        '  var S = { n: n, m: n - 1, edges: edges, dist: dist, cur: 1, src: 1, far: 1, ans: 0 };',
        '  T.step(S, "建好带权树");',
        '  // TODO: 写一个 bfs(src)：返回 [最远点编号, 最远距离]，把每步距离写进 S.dist',
        '  // TODO: A ← bfs(1) 的最远点；直径 ← bfs(A) 的最远距离',
        '  T.answer(String(S.ans));',
        '  return String(S.ans);',
        '}'
      ].join('\n'),
      pseudo: [
        'A ← 从 1 出发距离最远的点',
        'D ← 从 A 出发距离最远的距离',
        '输出 D'
      ],
      gen: 'function(r){ var n = 1 + Math.floor(Math.random()*7); var s = "" + n; for (var i = 2; i <= n; i++) s += "\\n" + (1 + Math.floor(Math.random()*(i-1))) + " " + i + " " + (1 + Math.floor(Math.random()*9)); return s; }'
    },
    tips: [
      '两次 BFS 只对「边权非负」的树成立；本题边权为正，可以直接用。',
      'n = 1 时没有边，直径规定为 0，别让 BFS 崩掉。',
      '距离可能很大，C++ 用 long long；BFS 里最远点的初值要设成起点本身。'
    ]
  });

  /* ========================================================================
   * p27 DAG 路径计数（DAG 上 DP）
   * ======================================================================*/
  window.CSP.problems.push({
    id: 'p27', no: 27, title: 'DAG 路径计数', diff: 4, tier: '提高+',
    knowledge: ['graph.dagdp', 'graph.toposort', 'dp.memo'],
    limits: { time: '1s', memory: '128MB' },
    statement:
      '给定一张有 n 个点、m 条边的**有向无环图（DAG）**，点编号 1 到 n。\n' +
      '请求出从 1 号点出发、到 n 号点结束的不同路径条数，答案对 10^9+7 取模。\n' +
      '两条路径不同，当且仅当它们经过的边序列不同（点可以重复经过，但 DAG 中不会有环）。\n' +
      '做法：先在 DAG 上做拓扑排序，然后按拓扑序 DP：' +
      '设 f[v] 为从 1 到 v 的路径条数，则 f[1] = 1，对每条边 u→v 有 f[v] += f[u]。',
    inputFormat:
      '第一行两个整数 n, m（1 ≤ n ≤ 2000，0 ≤ m ≤ 10000）。\n' +
      '接下来 m 行，每行两个整数 u, v（1 ≤ u, v ≤ n，u ≠ v），表示一条从 u 指向 v 的有向边。\n' +
      '数据保证这张图是有向无环图（DAG）。',
    outputFormat: '一行一个整数：从 1 号点到 n 号点的路径条数对 10^9+7 取模的结果。',
    samples: [
      {
        input: '4 4\n1 2\n1 3\n2 4\n3 4\n',
        output: '2',
        explain: '1→2→4 与 1→3→4，共 2 条。'
      }
    ],
    tests: [
      { input: '4 4\n1 2\n1 3\n2 4\n3 4\n', output: '2', score: 20 },
      { input: '2 0\n', output: '0', score: 20 },
      { input: '2 1\n1 2\n', output: '1', score: 20 },
      { input: '6 7\n1 2\n1 3\n2 4\n3 4\n4 5\n4 6\n5 6\n', output: '4', score: 20 },
      {
        input: '46 89\n1 2\n2 3\n3 4\n4 5\n5 6\n6 7\n7 8\n8 9\n9 10\n10 11\n11 12\n12 13\n13 14\n14 15\n15 16\n16 17\n17 18\n18 19\n19 20\n20 21\n21 22\n22 23\n23 24\n24 25\n25 26\n26 27\n27 28\n28 29\n29 30\n30 31\n31 32\n32 33\n33 34\n34 35\n35 36\n36 37\n37 38\n38 39\n39 40\n40 41\n41 42\n42 43\n43 44\n44 45\n45 46\n1 3\n2 4\n3 5\n4 6\n5 7\n6 8\n7 9\n8 10\n9 11\n10 12\n11 13\n12 14\n13 15\n14 16\n15 17\n16 18\n17 19\n18 20\n19 21\n20 22\n21 23\n22 24\n23 25\n24 26\n25 27\n26 28\n27 29\n28 30\n29 31\n30 32\n31 33\n32 34\n33 35\n34 36\n35 37\n36 38\n37 39\n38 40\n39 41\n40 42\n41 43\n42 44\n43 45\n44 46\n',
        output: '836311896',
        score: 20
      }
    ],
    std: {
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'const long long MOD = 1000000007LL;',
        'int main(){',
        '  int n, m; scanf("%d %d", &n, &m);',
        '  vector<vector<int>> g(n + 1);',
        '  vector<int> indeg(n + 1, 0);',
        '  for (int i = 0; i < m; i++) { int u, v; scanf("%d %d", &u, &v); g[u].push_back(v); indeg[v]++; }',
        '  vector<long long> f(n + 1, 0);',
        '  f[1] = 1;',
        '  queue<int> q;',
        '  for (int i = 1; i <= n; i++) if (indeg[i] == 0) q.push(i);',
        '  while (!q.empty()) {',
        '    int u = q.front(); q.pop();',
        '    for (size_t i = 0; i < g[u].size(); i++) {',
        '      int v = g[u][i];',
        '      if (v != 1) f[v] = (f[v] + f[u]) % MOD;',
        '      if (--indeg[v] == 0) q.push(v);',
        '    }',
        '  }',
        '  printf("%lld\\n", f[n] % MOD);',
        '  return 0;',
        '}'
      ].join('\n')
    },
    algo: {
      title: '拓扑序上做路径计数 DP',
      viz: {
        input: '4 4\n1 2\n1 3\n2 4\n3 4\n',
        type: 'graph', mainKey: 'n', edgesKey: 'edges', distKey: 'dist', curKey: 'cur',
        title: 'dist = f[v]，从 1 到 v 的路径条数'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), m = tk.int();',
        '  var adj = [], indeg = [], edges = [], i;',
        '  for (i = 0; i <= n; i++) { adj.push([]); indeg.push(0); }',
        '  for (i = 0; i < m; i++) {',
        '    var u = tk.int(), v = tk.int();',
        '    adj[u].push(v); indeg[v]++;',
        '    edges.push([u, v]);',
        '  }',
        '  var MOD = 1000000007;',
        '  var dist = [];',
        '  for (i = 0; i <= n; i++) dist.push(0);',
        '  dist[1] = 1;',
        '  var left = [];',
        '  for (i = 0; i <= n; i++) left.push(indeg[i]);',
        '  var S = { n: n, m: m, edges: edges, dist: dist, cur: 1, ans: 0 };',
        '  T.step(S, "f[1] = 1，其余为 0；开始 Kahn 拓扑排序");',
        '  var q = [], head = 0;',
        '  for (i = 1; i <= n; i++) if (left[i] === 0) q.push(i);',
        '  while (head < q.length) {',
        '    var x = q[head]; head++;',
        '    S.cur = x;',
        '    T.step(S, "取出 " + x + "，它的 f = " + dist[x]);',
        '    for (i = 0; i < adj[x].length; i++) {',
        '      var y = adj[x][i];',
        '      if (y !== 1) dist[y] = (dist[y] + dist[x]) % MOD;',
        '      left[y]--;',
        '      if (left[y] === 0) q.push(y);',
        '    }',
        '    T.step(S, "把 f[" + x + "] 累加给它所有后继");',
        '  }',
        '  var ans = dist[n] % MOD;',
        '  S.ans = ans;',
        '  T.step(S, "答案 f[" + n + "] = " + ans);',
        '  T.answer(String(ans));',
        '  return String(ans);',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), m = tk.int();',
        '  var adj = [], indeg = [], edges = [], i;',
        '  for (i = 0; i <= n; i++) { adj.push([]); indeg.push(0); }',
        '  for (i = 0; i < m; i++) {',
        '    var u = tk.int(), v = tk.int();',
        '    adj[u].push(v); indeg[v]++;',
        '    edges.push([u, v]);',
        '  }',
        '  var MOD = 1000000007;',
        '  var dist = [];',
        '  for (i = 0; i <= n; i++) dist.push(0);   // dist[v] 就是 f[v]',
        '  dist[1] = 1;',
        '  var left = [];',
        '  for (i = 0; i <= n; i++) left.push(indeg[i]);',
        '  var S = { n: n, m: m, edges: edges, dist: dist, cur: 1, ans: 0 };',
        '  T.step(S, "f[1] = 1，其余为 0");',
        '  // TODO: 用入度为 0 的点做 Kahn 拓扑排序',
        '  // TODO: 每取出一个点 x，就对每条出边 x→y 做 f[y] = (f[y] + f[x]) % MOD，',
        '  //       同时把 y 的剩余入度 -1，减到 0 就入队',
        '  // TODO: 答案就是 f[n]',
        '  T.answer(String(S.ans));',
        '  return String(S.ans);',
        '}'
      ].join('\n'),
      pseudo: [
        'f[1] ← 1，其余 f[v] ← 0；indeg 统计入度',
        '队列 ← 所有入度为 0 的点',
        'while 队列非空: u ← 队首出队',
        '  for each edge u→v: f[v] ← (f[v] + f[u]) mod 1e9+7; indeg[v]--; if indeg[v]=0 then v 入队',
        '输出 f[n]'
      ],
      gen: 'function(r){ var n = 2 + Math.floor(Math.random()*6); var es = []; for (var i = 1; i <= n; i++) for (var j = i+1; j <= n; j++) if (Math.random() < 0.4) es.push(i + " " + j); var s = n + " " + es.length; for (var k = 0; k < es.length; k++) s += "\\n" + es[k]; return s; }'
    },
    tips: [
      'DP 必须按拓扑序进行：只有所有指向 v 的点都算完了，f[v] 才是最终值。',
      '题目求的是「从 1 到 n」，所以 f[1] 初值为 1，且 1 号点本身不再接受贡献。',
      '路径条数增长极快，每一步都要取模，否则会溢出（C++ 用 long long，模 10^9+7）。'
    ]
  });

})();
