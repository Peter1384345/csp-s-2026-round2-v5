/* ============================================================================
 * CSP-S 2026 第二轮 · 题目数据（图论进阶 + 字符串进阶） p58–p64
 * ----------------------------------------------------------------------------
 * 每道题同时提供：
 *   std.code      参考 C++17 程序（真实编译评测用）
 *   algo.ref      JS 追踪版参考实现（输出与 C++ 完全一致）
 *   algo.userTemplate  给用户改的起步代码（挖空 + TODO）
 *   algo.viz      可视化描述（小规模输入：点数 ≤ 7、边数 ≤ 10、字符串长度 ≤ 12）
 *   algo.gen      随机数据生成器源码字符串（对拍用）
 * 所有图论题的点编号一律从 1 开始。
 * ==========================================================================*/
(function () {
  'use strict';
  window.CSP = window.CSP || {};
  window.CSP.problems = window.CSP.problems || [];

  /* ========================================================================
   * p58 强连通分量（Tarjan）
   * ======================================================================*/
  window.CSP.problems.push({
    id: 'p58', no: 58, title: '强连通分量', diff: 4, tier: '省选-',
    knowledge: ['graph.scc', 'graph.dfs', 'graph.store'],
    limits: { time: '1s', memory: '128MB' },
    statement:
      '给定一张 n 个点、m 条边的**有向图**，点编号为 1 到 n（可能有重边，没有自环）。\n' +
      '如果两个点 u、v 满足「u 能到达 v，且 v 能到达 u」，就称它们强连通。' +
      '强连通关系把全部点划分成若干个**强连通分量（SCC）**：每个点恰好属于一个分量。\n' +
      '请求出强连通分量的个数，并输出每个分量里的点。\n' +
      '输出约定：\n' +
      '- 第一行输出分量个数 k；\n' +
      '- 接下来 k 行，每行输出一个分量内的所有点编号，按**从小到大**排列，用空格分隔；\n' +
      '- 各分量之间按「该分量内最小编号」从小到大排列。\n' +
      '做法：Tarjan 算法。DFS 时给每个点记录时间戳 dfn（第几个被访问）和 low' +
      '（沿搜索树往下能追溯到的最早的、还在栈里的点的时间戳）。' +
      '当某个点满足 low[u] = dfn[u] 时，从栈顶一直弹到 u，弹出的这些点恰好组成一个强连通分量。',
    inputFormat:
      '第一行两个整数 n, m（1 ≤ n ≤ 1000，0 ≤ m ≤ 5000）。\n' +
      '接下来 m 行，每行两个整数 u, v（1 ≤ u, v ≤ n，u ≠ v），表示一条从 u 指向 v 的有向边。',
    outputFormat:
      '第一行一个整数 k，表示强连通分量个数。\n' +
      '接下来 k 行，第 i 行是第 i 个分量内的点编号，升序、空格分隔。',
    samples: [
      {
        input: '5 4\n1 2\n2 3\n3 1\n4 5\n',
        output: '3\n1 2 3\n4\n5',
        explain: '1,2,3 互相可达成一个分量；4 到 5 有边但没有回路，各自单独成分量。'
      }
    ],
    tests: [
      { input: '5 4\n1 2\n2 3\n3 1\n4 5\n', output: '3\n1 2 3\n4\n5', score: 20 },
      { input: '3 3\n1 2\n2 3\n3 1\n', output: '1\n1 2 3', score: 20 },
      { input: '3 3\n1 2\n2 3\n3 2\n', output: '2\n1\n2 3', score: 20 },
      { input: '1 0\n', output: '1\n1', score: 20 },
      { input: '6 7\n1 2\n2 3\n3 1\n3 4\n4 5\n5 4\n5 6\n', output: '3\n1 2 3\n4 5\n6', score: 20 }
    ],
    std: {
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int n, m, tmr, cid;',
        'vector<vector<int>> g;',
        'vector<int> dfn, low, instk, stk;',
        'vector<vector<int>> comps;',
        'void dfs(int u){',
        '  dfn[u] = low[u] = ++tmr;',
        '  stk.push_back(u); instk[u] = 1;',
        '  for (size_t i = 0; i < g[u].size(); i++) {',
        '    int v = g[u][i];',
        '    if (!dfn[v]) { dfs(v); low[u] = min(low[u], low[v]); }',
        '    else if (instk[v]) low[u] = min(low[u], dfn[v]);',
        '  }',
        '  if (low[u] == dfn[u]) {',
        '    cid++;',
        '    vector<int> mem;',
        '    while (true) {',
        '      int x = stk.back(); stk.pop_back(); instk[x] = 0; mem.push_back(x);',
        '      if (x == u) break;',
        '    }',
        '    sort(mem.begin(), mem.end());',
        '    comps.push_back(mem);',
        '  }',
        '}',
        'int main(){',
        '  scanf("%d %d", &n, &m);',
        '  g.assign(n + 1, vector<int>());',
        '  for (int i = 0; i < m; i++) { int u, v; scanf("%d %d", &u, &v); g[u].push_back(v); }',
        '  dfn.assign(n + 1, 0); low.assign(n + 1, 0); instk.assign(n + 1, 0);',
        '  tmr = 0; cid = 0;',
        '  for (int i = 1; i <= n; i++) if (!dfn[i]) dfs(i);',
        '  sort(comps.begin(), comps.end(), [](const vector<int>& a, const vector<int>& b){ return a[0] < b[0]; });',
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
      title: 'Tarjan 求强连通分量（dfn / low + 栈）',
      viz: {
        input: '5 4\n1 2\n2 3\n3 1\n4 5\n',
        type: 'graph', mainKey: 'n', edgesKey: 'edges', distKey: 'dist', curKey: 'cur',
        title: 'dist = 分量编号（0 表示尚未确定）'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), m = tk.int();',
        '  var adj = [], edges = [], i;',
        '  for (i = 0; i <= n; i++) adj.push([]);',
        '  for (i = 0; i < m; i++) {',
        '    var u = tk.int(), v = tk.int();',
        '    adj[u].push(v);',
        '    edges.push([u, v]);',
        '  }',
        '  var dfn = [], low = [], instk = [], stk = [], dist = [];',
        '  for (i = 0; i <= n; i++) { dfn.push(0); low.push(0); instk.push(false); dist.push(0); }',
        '  var comps = [], tmr = 0;',
        '  var S = { n: n, m: m, edges: edges, dist: dist, cur: 0, dfn: dfn.slice(), low: low.slice(), stack: [], comps: [], ans: "" };',
        '  T.step(S, "有向图建图完成：n = " + n + "，m = " + m);',
        '  function dfs(u) {',
        '    tmr++; dfn[u] = low[u] = tmr;',
        '    stk.push(u); instk[u] = true;',
        '    S.cur = u; S.dfn = dfn.slice(); S.low = low.slice(); S.stack = stk.slice();',
        '    T.step(S, "访问点 " + u + "：dfn = low = " + tmr + "，压入栈");',
        '    for (var k = 0; k < adj[u].length; k++) {',
        '      var v = adj[u][k];',
        '      if (dfn[v] === 0) {',
        '        dfs(v);',
        '        if (low[v] < low[u]) low[u] = low[v];',
        '        S.cur = u; S.dfn = dfn.slice(); S.low = low.slice();',
        '        T.step(S, "回溯：low[" + u + "] = min(low[" + u + "], low[" + v + "]) = " + low[u]);',
        '      } else if (instk[v]) {',
        '        if (dfn[v] < low[u]) low[u] = dfn[v];',
        '        S.cur = u; S.dfn = dfn.slice(); S.low = low.slice();',
        '        T.step(S, "边 " + u + " → " + v + " 指向栈内点，low[" + u + "] = " + low[u]);',
        '      } else {',
        '        S.cur = u;',
        '        T.step(S, "边 " + u + " → " + v + " 指向别的分量的点，忽略");',
        '      }',
        '    }',
        '    if (low[u] === dfn[u]) {',
        '      var mem = [];',
        '      while (true) {',
        '        var x = stk.pop(); instk[x] = false; dist[x] = comps.length + 1;',
        '        mem.push(x);',
        '        if (x === u) break;',
        '      }',
        '      mem.sort(function (a, b) { return a - b; });',
        '      comps.push(mem);',
        '      S.cur = u; S.stack = stk.slice(); S.comps = comps.slice(); S.dist = dist;',
        '      T.step(S, "low[" + u + "] = dfn[" + u + "]，弹出分量 {" + mem.join(" ") + "}");',
        '    }',
        '  }',
        '  for (i = 1; i <= n; i++) if (dfn[i] === 0) dfs(i);',
        '  comps.sort(function (a, b) { return a[0] - b[0]; });',
        '  var out = [String(comps.length)];',
        '  for (i = 0; i < comps.length; i++) out.push(comps[i].join(" "));',
        '  var ans = out.join("\\n");',
        '  S.comps = comps.slice(); S.ans = ans;',
        '  T.step(S, "共 " + comps.length + " 个强连通分量");',
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
        '    adj[u].push(v);',
        '    edges.push([u, v]);',
        '  }',
        '  var dfn = [], low = [], instk = [], stk = [], dist = [];',
        '  for (i = 0; i <= n; i++) { dfn.push(0); low.push(0); instk.push(false); dist.push(0); }',
        '  var comps = [], tmr = 0;',
        '  var S = { n: n, m: m, edges: edges, dist: dist, cur: 0, dfn: dfn.slice(), low: low.slice(), stack: [], comps: [], ans: "" };',
        '  T.step(S, "有向图建图完成");',
        '  // TODO 1: 写 dfs(u)：dfn[u] = low[u] = ++tmr，压栈并标记在栈中；',
        '  //         对每条出边 u→v：v 未访问就 dfs(v) 后用 low[v] 更新 low[u]；',
        '  //         v 在栈中就用自己的 dfn[v] 更新 low[u]',
        '  // TODO 2: dfs(u) 结束时若 low[u] === dfn[u]，从栈里弹到 u，这些点组成一个分量',
        '  //         把分量内点升序排序后存入 comps（每一步都要 T.step(S, note)）',
        '  // TODO 3: 所有分量按「分量内最小编号」升序，输出 k 与每个分量',
        '  T.answer(String(comps.length));',
        '  return String(comps.length);',
        '}'
      ].join('\n'),
      pseudo: [
        'DFS(u): dfn[u] ← low[u] ← ++tmr; 压栈 u，标记在栈中',
        '  for each edge u→v:',
        '    if dfn[v] = 0 then DFS(v); low[u] ← min(low[u], low[v])',
        '    else if v 在栈中 then low[u] ← min(low[u], dfn[v])',
        '  if low[u] = dfn[u] then 反复弹栈直到弹出 u，得到分量 {…}',
        '各分量按最小编号升序输出'
      ],
      gen: 'function(r){ var n = 2 + Math.floor(Math.random()*5); var m = Math.floor(Math.random()*10); var s = n + " " + m; for (var i = 0; i < m; i++) { var u = 1 + Math.floor(Math.random()*n); var v = 1 + Math.floor(Math.random()*n); if (u === v) { i--; continue; } s += "\\n" + u + " " + v; } return s; }'
    },
    tips: [
      'low[u] 用 low[v] 更新只发生在 v 是 u 的搜索树儿子时；如果 v 已经访问过且不在栈里（属于别的分量），绝不能再用它更新。',
      '弹栈要一直弹到 u 本身，弹出序列是「逆拓扑」的反向，本题要求按分量最小编号升序输出，所以最后还要排序。',
      '孤立点也会在 low[u] = dfn[u] 时弹出一个大小为 1 的分量，别漏掉。'
    ]
  });

  /* ========================================================================
   * p59 树链剖分：树上路径点权和
   * ======================================================================*/
  window.CSP.problems.push({
    id: 'p59', no: 59, title: '树上路径点权和', diff: 5, tier: '省选-',
    knowledge: ['graph.hld', 'graph.dfs', 'graph.lca'],
    limits: { time: '1s', memory: '128MB' },
    statement:
      '给定一棵 n 个结点的无根树，结点编号 1 到 n，**约定根为 1 号点**，每个点有一个正整数点权 w[i]。\n' +
      '有 q 次询问，每次给出两个点 a, b，请回答**从 a 到 b 的简单路径**上所有点的点权之和（包含 a 和 b 本身）。\n' +
      '做法：树链剖分。\n' +
      '- 第一次 DFS 求出每个点的父亲 fa、深度 dep、子树大小 sz，并选出重儿子 son（子树最大的儿子）；\n' +
      '- 第二次 DFS 按「先走重儿子」的顺序给每个点重新编号 dfn，得到若干条重链，每个点记录它所在重链的链顶 top；\n' +
      '- 把点权按 dfn 顺序排成一维数组并求前缀和 P；一条重链上从 top 到 u 的点权和就是 P[dfn[u]] - P[dfn[top]-1]；\n' +
      '- 询问时：只要两点不在同一条重链上，就让链顶较深的那一段整体计入答案，并跳到链顶的父亲；' +
      '最后两点在同一条重链上时，把两者之间的这一段计入答案。',
    inputFormat:
      '第一行两个整数 n, q（1 ≤ n, q ≤ 10^5）。\n' +
      '第二行 n 个整数 w[1..n]（1 ≤ w[i] ≤ 10^6），表示每个点的点权。\n' +
      '接下来 n-1 行，每行两个整数 u, v（1 ≤ u, v ≤ n），表示树上的一条边，保证构成一棵树。\n' +
      '接下来 q 行，每行两个整数 a, b（1 ≤ a, b ≤ n），表示一次询问。',
    outputFormat: '共 q 行，第 i 行一个整数，表示第 i 次询问路径上的点权和。',
    samples: [
      {
        input: '5 2\n1 2 3 4 5\n1 2\n1 3\n3 4\n3 5\n4 5\n2 3\n',
        output: '12\n6',
        explain: '路径 4-3-5 的点权和是 4+3+5=12；路径 2-1-3 是 2+1+3=6。'
      }
    ],
    tests: [
      { input: '5 2\n1 2 3 4 5\n1 2\n1 3\n3 4\n3 5\n4 5\n2 3\n', output: '12\n6', score: 20 },
      { input: '1 1\n7\n1 1\n', output: '7', score: 20 },
      { input: '3 2\n5 5 5\n1 2\n2 3\n1 3\n1 1\n', output: '15\n5', score: 20 },
      { input: '4 3\n1 2 3 4\n1 2\n1 3\n1 4\n2 3\n3 4\n2 4\n', output: '6\n8\n7', score: 20 },
      { input: '6 3\n1 1 2 3 5 8\n1 2\n2 3\n3 4\n4 5\n5 6\n1 6\n2 5\n3 4\n', output: '20\n11\n5', score: 20 }
    ],
    std: {
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'typedef long long ll;',
        'int n, q, tmr;',
        'vector<vector<int>> g;',
        'vector<ll> w, P;',
        'vector<int> fa, dep, sz, son, top, dfn, rnk;',
        'void dfs1(int u, int f){',
        '  fa[u] = f; dep[u] = dep[f] + 1; sz[u] = 1; son[u] = 0;',
        '  for (size_t i = 0; i < g[u].size(); i++) {',
        '    int v = g[u][i];',
        '    if (v == f) continue;',
        '    dfs1(v, u);',
        '    sz[u] += sz[v];',
        '    if (!son[u] || sz[v] > sz[son[u]]) son[u] = v;',
        '  }',
        '}',
        'void dfs2(int u, int tp){',
        '  top[u] = tp; dfn[u] = ++tmr; rnk[tmr] = u;',
        '  if (son[u]) dfs2(son[u], tp);',
        '  for (size_t i = 0; i < g[u].size(); i++) {',
        '    int v = g[u][i];',
        '    if (v == fa[u] || v == son[u]) continue;',
        '    dfs2(v, v);',
        '  }',
        '}',
        'll query(int u, int v){',
        '  ll res = 0;',
        '  while (top[u] != top[v]) {',
        '    if (dep[top[u]] < dep[top[v]]) swap(u, v);',
        '    res += P[dfn[u]] - P[dfn[top[u]] - 1];',
        '    u = fa[top[u]];',
        '  }',
        '  if (dep[u] > dep[v]) swap(u, v);',
        '  res += P[dfn[v]] - P[dfn[u] - 1];',
        '  return res;',
        '}',
        'int main(){',
        '  scanf("%d %d", &n, &q);',
        '  w.assign(n + 1, 0);',
        '  for (int i = 1; i <= n; i++) scanf("%lld", &w[i]);',
        '  g.assign(n + 1, vector<int>());',
        '  for (int i = 0; i < n - 1; i++) { int u, v; scanf("%d %d", &u, &v); g[u].push_back(v); g[v].push_back(u); }',
        '  fa.assign(n + 1, 0); dep.assign(n + 1, 0); sz.assign(n + 1, 0); son.assign(n + 1, 0);',
        '  top.assign(n + 1, 0); dfn.assign(n + 1, 0); rnk.assign(n + 1, 0);',
        '  tmr = 0;',
        '  dfs1(1, 0);',
        '  dfs2(1, 1);',
        '  P.assign(n + 1, 0);',
        '  for (int i = 1; i <= n; i++) P[i] = P[i - 1] + w[rnk[i]];',
        '  for (int t = 0; t < q; t++) {',
        '    int a, b; scanf("%d %d", &a, &b);',
        '    printf("%lld\\n", query(a, b));',
        '  }',
        '  return 0;',
        '}'
      ].join('\n')
    },
    algo: {
      title: '树链剖分：重链上跳 + 前缀和',
      viz: {
        input: '5 2\n1 2 3 4 5\n1 2\n1 3\n3 4\n3 5\n4 5\n2 3\n',
        type: 'graph', mainKey: 'n', edgesKey: 'edges', distKey: 'dist', curKey: 'cur',
        title: 'dist = 深度（重链用 top 标记）'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), q = tk.int();',
        '  var w = [0], i;',
        '  for (i = 1; i <= n; i++) w.push(tk.int());',
        '  var adj = [], edges = [];',
        '  for (i = 0; i <= n; i++) adj.push([]);',
        '  for (i = 0; i < n - 1; i++) {',
        '    var u = tk.int(), v = tk.int();',
        '    adj[u].push(v); adj[v].push(u);',
        '    edges.push([u, v]);',
        '  }',
        '  var fa = [], dep = [], sz = [], son = [], top = [], dfn = [], rnk = [];',
        '  for (i = 0; i <= n; i++) { fa.push(0); dep.push(0); sz.push(0); son.push(0); top.push(0); dfn.push(0); rnk.push(0); }',
        '  var S = { n: n, m: n - 1, edges: edges, dist: dep, cur: 1, sz: sz.slice(), son: son.slice(), top: top.slice(), ans: "" };',
        '  T.step(S, "建树完成：根为 1 号点，准备第一次 DFS");',
        '  function dfs1(u, f) {',
        '    fa[u] = f; dep[u] = dep[f] + 1; sz[u] = 1; son[u] = 0;',
        '    S.cur = u;',
        '    T.step(S, "第一次 DFS 进入点 " + u + "，深度 " + dep[u]);',
        '    for (var k = 0; k < adj[u].length; k++) {',
        '      var v = adj[u][k];',
        '      if (v === f) continue;',
        '      dfs1(v, u);',
        '      sz[u] += sz[v];',
        '      if (son[u] === 0 || sz[v] > sz[son[u]]) son[u] = v;',
        '    }',
        '    S.sz = sz.slice(); S.son = son.slice();',
        '    T.step(S, "点 " + u + " 子树大小 " + sz[u] + "，重儿子 " + (son[u] === 0 ? "无" : son[u]));',
        '  }',
        '  dfs1(1, 0);',
        '  var tmr = 0;',
        '  function dfs2(u, tp) {',
        '    top[u] = tp; tmr++; dfn[u] = tmr; rnk[tmr] = u;',
        '    S.cur = u; S.top = top.slice();',
        '    T.step(S, "第二次 DFS：点 " + u + " 属于重链（链顶 " + tp + "），dfn = " + tmr);',
        '    if (son[u] !== 0) dfs2(son[u], tp);',
        '    for (var k = 0; k < adj[u].length; k++) {',
        '      var v = adj[u][k];',
        '      if (v === fa[u] || v === son[u]) continue;',
        '      dfs2(v, v);',
        '    }',
        '  }',
        '  dfs2(1, 1);',
        '  var P = [0];',
        '  for (i = 1; i <= n; i++) P.push(P[i - 1] + w[rnk[i]]);',
        '  T.step(S, "把点权按 dfn 顺序展平并求出前缀和数组 P");',
        '  var out = [];',
        '  for (var t = 0; t < q; t++) {',
        '    var a = tk.int(), b = tk.int();',
        '    var x = a, y = b, res = 0;',
        '    while (top[x] !== top[y]) {',
        '      if (dep[top[x]] < dep[top[y]]) { var tp2 = x; x = y; y = tp2; }',
        '      res += P[dfn[x]] - P[dfn[top[x]] - 1];',
        '      S.cur = x; S.res = res;',
        '      T.step(S, "询问 (" + a + ", " + b + ")：整段累加重链 " + top[x] + " → " + x + "，当前 " + res);',
        '      x = fa[top[x]];',
        '    }',
        '    if (dep[x] > dep[y]) { var tp3 = x; x = y; y = tp3; }',
        '    res += P[dfn[y]] - P[dfn[x] - 1];',
        '    S.cur = x; S.res = res;',
        '    T.step(S, "同一重链内累加 " + x + " → " + y + "，本询问答案 " + res);',
        '    out.push(String(res));',
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
        '  var w = [0], i;',
        '  for (i = 1; i <= n; i++) w.push(tk.int());',
        '  var adj = [], edges = [];',
        '  for (i = 0; i <= n; i++) adj.push([]);',
        '  for (i = 0; i < n - 1; i++) {',
        '    var u = tk.int(), v = tk.int();',
        '    adj[u].push(v); adj[v].push(u);',
        '    edges.push([u, v]);',
        '  }',
        '  var fa = [], dep = [], sz = [], son = [], top = [], dfn = [], rnk = [];',
        '  for (i = 0; i <= n; i++) { fa.push(0); dep.push(0); sz.push(0); son.push(0); top.push(0); dfn.push(0); rnk.push(0); }',
        '  var S = { n: n, m: n - 1, edges: edges, dist: dep, cur: 1, sz: sz.slice(), son: son.slice(), top: top.slice(), ans: "" };',
        '  T.step(S, "建树完成，根为 1 号点");',
        '  // TODO 1: dfs1(u, f)：求 dep / sz / son（重儿子 = 子树最大的儿子）',
        '  // TODO 2: dfs2(u, tp)：先给 u 编 dfn 号、记录 top[u] = tp，',
        '  //         再递归重儿子（继承链顶 tp），最后递归其余轻儿子（各自成为新链顶）',
        '  // TODO 3: 按 dfn 顺序把点权展平成数组，求前缀和 P',
        '  // TODO 4: 对每个询问 (a, b)：不在同一条重链时把链顶较深的一整段用 P 相减计入答案，',
        '  //         并跳到链顶的父亲；最后同链时用 P 相减补上两点之间的一段',
        '  var out = [];',
        '  S.ans = out.join("\\n");',
        '  T.answer(S.ans);',
        '  return S.ans;',
        '}'
      ].join('\n'),
      pseudo: [
        ' dfs1(u, f): dep[u] ← dep[f]+1; sz[u] ← 1',
        '  for each child v: dfs1(v, u); sz[u] += sz[v]; 若 sz[v] 最大则 son[u] ← v',
        'dfs2(u, tp): top[u] ← tp; dfn[u] ← ++tmr; rnk[tmr] ← u',
        '  若 son[u] 存在则 dfs2(son[u], tp); 对其余儿子 v 执行 dfs2(v, v)',
        'P[i] ← P[i-1] + w[rnk[i]]',
        'query(u, v): while top[u] ≠ top[v]: 让链顶深的先跳，累加 P[dfn[u]]-P[dfn[top[u]]-1]，u ← fa[top[u]]',
        '  最后累加 P[dfn[较深者]] - P[dfn[较浅者]-1]'
      ],
      gen: 'function(r){ var n = 1 + Math.floor(Math.random()*6); var q = 1 + Math.floor(Math.random()*2); var w = []; for (var i = 0; i < n; i++) w.push(1 + Math.floor(Math.random()*9)); var s = n + " " + q + "\\n" + w.join(" "); for (var j = 2; j <= n; j++) s += "\\n" + (1 + Math.floor(Math.random()*(j-1))) + " " + j; for (var t = 0; t < q; t++) s += "\\n" + (1 + Math.floor(Math.random()*n)) + " " + (1 + Math.floor(Math.random()*n)); return s; }'
    },
    tips: [
      'dfs2 必须先递归重儿子再递归轻儿子，这样同一条重链上的 dfn 才是连续区间，前缀和才能直接相减。',
      '轻儿子的链顶是它自己，不是父亲；写成 dfs2(v, tp) 就错了。',
      '点权之和最大可达 10^5 × 10^6 = 10^11，C++ 必须开 long long。'
    ]
  });

  /* ========================================================================
   * p60 网络流：最大流（Dinic）
   * ======================================================================*/
  window.CSP.problems.push({
    id: 'p60', no: 60, title: '最大流', diff: 5, tier: '省选-',
    knowledge: ['graph.netflow', 'graph.bfs', 'graph.store'],
    limits: { time: '1s', memory: '128MB' },
    statement:
      '给定一张 n 个点、m 条边的**有向图**，点编号 1 到 n，每条边有一个**正整数容量**。\n' +
      '把 1 号点看作源点 s，把 n 号点看作汇点 t，请求出从 s 到 t 的**最大流**。\n' +
      '本题数据规模很小，但请你用 **Dinic 算法** 求解：\n' +
      '- 先用 BFS 给残量网络分层（level[v] 表示从 s 出发至少经过几条还有剩余容量的边才能到 v）；\n' +
      '- 再在「层号恰好 +1」的边上做 DFS 多路增广，一条增广路上的流量受最小剩余容量限制；\n' +
      '- 反复「BFS 分层 + DFS 增广」，直到汇点不可达为止，累计的流量就是最大流。',
    inputFormat:
      '第一行两个整数 n, m（2 ≤ n ≤ 6，0 ≤ m ≤ 12）。\n' +
      '接下来 m 行，每行三个整数 u, v, c（1 ≤ u, v ≤ n，u ≠ v，1 ≤ c ≤ 100），表示一条从 u 到 v、容量为 c 的有向边。',
    outputFormat: '一行一个整数，表示从 1 号点到 n 号点的最大流。',
    samples: [
      {
        input: '4 5\n1 2 3\n1 3 2\n2 3 1\n2 4 2\n3 4 4\n',
        output: '5',
        explain: '1→2→4 推 2，1→3→4 推 2，剩余 1→2→3→4 再推 1，合计 5。'
      }
    ],
    tests: [
      { input: '4 5\n1 2 3\n1 3 2\n2 3 1\n2 4 2\n3 4 4\n', output: '5', score: 20 },
      { input: '2 1\n1 2 7\n', output: '7', score: 20 },
      { input: '2 0\n', output: '0', score: 20 },
      { input: '3 3\n1 2 5\n2 3 5\n1 3 1\n', output: '6', score: 20 },
      { input: '5 7\n1 2 10\n1 3 10\n2 4 10\n3 4 10\n4 5 15\n2 5 2\n3 5 2\n', output: '19', score: 20 }
    ],
    std: {
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'typedef long long ll;',
        'struct Edge { int to; ll cap; int rev; };',
        'vector<vector<Edge>> g;',
        'vector<int> level, iter;',
        'void addEdge(int u, int v, ll c){',
        '  g[u].push_back((Edge){v, c, (int)g[v].size()});',
        '  g[v].push_back((Edge){u, 0, (int)g[u].size() - 1});',
        '}',
        'void bfsLevel(int s){',
        '  fill(level.begin(), level.end(), -1);',
        '  queue<int> q; level[s] = 0; q.push(s);',
        '  while (!q.empty()) {',
        '    int u = q.front(); q.pop();',
        '    for (size_t i = 0; i < g[u].size(); i++) {',
        '      Edge &e = g[u][i];',
        '      if (e.cap > 0 && level[e.to] < 0) { level[e.to] = level[u] + 1; q.push(e.to); }',
        '    }',
        '  }',
        '}',
        'll dfsAug(int u, int t, ll f){',
        '  if (u == t) return f;',
        '  for (int &i = iter[u]; i < (int)g[u].size(); i++) {',
        '    Edge &e = g[u][i];',
        '    if (e.cap > 0 && level[e.to] == level[u] + 1) {',
        '      ll d = dfsAug(e.to, t, min(f, e.cap));',
        '      if (d > 0) { e.cap -= d; g[e.to][e.rev].cap += d; return d; }',
        '    }',
        '  }',
        '  return 0;',
        '}',
        'int main(){',
        '  int n, m; scanf("%d %d", &n, &m);',
        '  g.assign(n + 1, vector<Edge>());',
        '  for (int i = 0; i < m; i++) { int u, v; ll c; scanf("%d %d %lld", &u, &v, &c); addEdge(u, v, c); }',
        '  int s = 1, t = n;',
        '  level.assign(n + 1, -1); iter.assign(n + 1, 0);',
        '  ll flow = 0;',
        '  const ll INF = (ll)1e18;',
        '  while (true) {',
        '    bfsLevel(s);',
        '    if (level[t] < 0) break;',
        '    fill(iter.begin(), iter.end(), 0);',
        '    while (true) {',
        '      ll f = dfsAug(s, t, INF);',
        '      if (f == 0) break;',
        '      flow += f;',
        '    }',
        '  }',
        '  printf("%lld\\n", flow);',
        '  return 0;',
        '}'
      ].join('\n')
    },
    algo: {
      title: 'Dinic：BFS 分层 + DFS 多路增广',
      viz: {
        input: '4 5\n1 2 3\n1 3 2\n2 3 1\n2 4 2\n3 4 4\n',
        type: 'graph', mainKey: 'n', edgesKey: 'edges', distKey: 'dist', curKey: 'cur',
        title: 'dist = BFS 分层 level（-1 表示本轮不可达）'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), m = tk.int();',
        '  var adj = [], edges = [], i;',
        '  for (i = 0; i <= n; i++) adj.push([]);',
        '  for (i = 0; i < m; i++) {',
        '    var u = tk.int(), v = tk.int(), c = tk.int();',
        '    edges.push([u, v, c]);',
        '    adj[u].push([v, c, adj[v].length]);',
        '    adj[v].push([u, 0, adj[u].length - 1]);',
        '  }',
        '  var level = [], iter = [];',
        '  for (i = 0; i <= n; i++) { level.push(-1); iter.push(0); }',
        '  var s = 1, t = n, total = 0, INF = 1000000000;',
        '  var S = { n: n, m: m, edges: edges, dist: level, cur: s, src: s, sink: t, flow: 0, ans: 0 };',
        '  T.step(S, "建好残量网络：源点 1，汇点 " + n);',
        '  function bfs() {',
        '    for (var k = 0; k <= n; k++) level[k] = -1;',
        '    level[s] = 0;',
        '    var q = [s], h = 0;',
        '    while (h < q.length) {',
        '      var x = q[h]; h++;',
        '      for (var j = 0; j < adj[x].length; j++) {',
        '        var e = adj[x][j];',
        '        if (e[1] > 0 && level[e[0]] < 0) { level[e[0]] = level[x] + 1; q.push(e[0]); }',
        '      }',
        '    }',
        '    S.cur = s; S.dist = level;',
        '    T.step(S, "BFS 分层完成，汇点的层号 = " + level[t]);',
        '  }',
        '  function dfsAug(u, limit) {',
        '    if (u === t) return limit;',
        '    S.cur = u;',
        '    while (iter[u] < adj[u].length) {',
        '      var e = adj[u][iter[u]];',
        '      if (e[1] > 0 && level[e[0]] === level[u] + 1) {',
        '        var d = dfsAug(e[0], Math.min(limit, e[1]));',
        '        if (d > 0) { e[1] -= d; adj[e[0]][e[2]][1] += d; return d; }',
        '      }',
        '      iter[u]++;',
        '    }',
        '    return 0;',
        '  }',
        '  while (true) {',
        '    bfs();',
        '    if (level[t] < 0) break;',
        '    for (i = 0; i <= n; i++) iter[i] = 0;',
        '    while (true) {',
        '      var f = dfsAug(s, INF);',
        '      if (f === 0) break;',
        '      total += f;',
        '      S.flow = total; S.cur = s;',
        '      T.step(S, "增广成功：本次推流 " + f + "，累计流量 " + total);',
        '    }',
        '  }',
        '  S.flow = total; S.ans = total;',
        '  T.step(S, "汇点已不可达，最大流 = " + total);',
        '  T.answer(String(total));',
        '  return String(total);',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), m = tk.int();',
        '  var adj = [], edges = [], i;',
        '  for (i = 0; i <= n; i++) adj.push([]);',
        '  for (i = 0; i < m; i++) {',
        '    var u = tk.int(), v = tk.int(), c = tk.int();',
        '    edges.push([u, v, c]);',
        '    adj[u].push([v, c, adj[v].length]);       // 正向边，残量 c',
        '    adj[v].push([u, 0, adj[u].length - 1]);   // 反向边，残量 0',
        '  }',
        '  var level = [], iter = [];',
        '  for (i = 0; i <= n; i++) { level.push(-1); iter.push(0); }',
        '  var s = 1, t = n, total = 0, INF = 1000000000;',
        '  var S = { n: n, m: m, edges: edges, dist: level, cur: s, src: s, sink: t, flow: 0, ans: 0 };',
        '  T.step(S, "建好残量网络，源点 1，汇点 " + n);',
        '  // TODO 1: bfs()：把 level 全部置 -1，从 s 出发只走残量 > 0 的边分层',
        '  // TODO 2: dfsAug(u, limit)：u === t 时返回 limit；否则沿「level 恰好 +1」的边递归，',
        '  //         成功后把正向边残量 -= d、反向边残量 += d，返回 d；当前弧用 iter[u] 优化',
        '  // TODO 3: 反复 BFS 分层；若 level[t] < 0 就结束；否则清空 iter 后不断 dfsAug(s, INF) 累加流量',
        '  T.answer(String(total));',
        '  return String(total);',
        '}'
      ].join('\n'),
      pseudo: [
        'while true:',
        '  BFS 分层：level[] ← -1；level[s] ← 0；只走残量 > 0 的边',
        '  if level[t] < 0 then break',
        '  iter[] ← 0',
        '  while (f ← DFS(s, ∞)) > 0: flow += f',
        'DFS(u, f): if u = t then return f',
        '  for each 残量 > 0 且 level[to] = level[u]+1 的边 (u, to, cap):',
        '    d ← DFS(to, min(f, cap)); if d > 0 then cap -= d; rev.cap += d; return d',
        '  return 0'
      ],
      gen: 'function(r){ var n = 2 + Math.floor(Math.random()*5); var m = Math.floor(Math.random()*8); var s = n + " " + m; for (var i = 0; i < m; i++) { var u = 1 + Math.floor(Math.random()*n); var v = 1 + Math.floor(Math.random()*n); if (u === v) { i--; continue; } s += "\\n" + u + " " + v + " " + (1 + Math.floor(Math.random()*9)); } return s; }'
    },
    tips: [
      '反向边一定要建，容量从 0 开始；忘了反向边就只能贪心，结果偏小。',
      'DFS 增广必须限制在「层号恰好 +1」的边上，否则可能绕圈或做出无效增广。',
      '每次 DFS 返回 0 时要换下一条出边（当前弧 iter[u]++），否则同一条死边会被反复试探导致超时。'
    ]
  });

  /* ========================================================================
   * p61 树上差分：多次路径加
   * ======================================================================*/
  window.CSP.problems.push({
    id: 'p61', no: 61, title: '路径加与点权统计', diff: 4, tier: '提高+',
    knowledge: ['graph.treediff', 'graph.lca', 'graph.dfs'],
    limits: { time: '1s', memory: '128MB' },
    statement:
      '给定一棵 n 个结点的树，结点编号 1 到 n，**约定根为 1 号点**，初始时每个点的权值都是 0。\n' +
      '有 m 次操作，每次给出两个点 u, v，表示把从 u 到 v 的简单路径上**所有点**的权值都加 1（包含 u 和 v 本身）。\n' +
      '请你输出 m 次操作全部做完之后，每个点 1..n 的权值。\n' +
      '做法：**树上差分**。设 l = LCA(u, v)，则一次「路径加 1」等价于下面四个点上的差分标记：\n' +
      '- cnt[u] += 1，cnt[v] += 1；\n' +
      '- cnt[l] -= 1，若 l 不是根则 cnt[fa[l]] -= 1。\n' +
      '做完所有标记后，自底向上把每个点的 cnt 加到父亲上（即 cnt[u] 最终 = 自己的标记 + 所有儿子的最终值），' +
      '得到的 cnt[1..n] 就是每个点被覆盖的次数。',
    inputFormat:
      '第一行两个整数 n, m（1 ≤ n, m ≤ 2000）。\n' +
      '接下来 n-1 行，每行两个整数 u, v（1 ≤ u, v ≤ n），表示树上的一条边，保证构成一棵树。\n' +
      '接下来 m 行，每行两个整数 u, v（1 ≤ u, v ≤ n），表示一次路径加操作。',
    outputFormat: '一行 n 个整数，第 i 个数表示最终第 i 个点的权值，相邻数字用空格分隔。',
    samples: [
      {
        input: '5 2\n1 2\n1 3\n3 4\n3 5\n4 5\n2 3\n',
        output: '1 1 2 1 1',
        explain: '路径 4-3-5 给 4、3、5 各 +1；路径 2-1-3 给 2、1、3 各 +1，于是 3 号点是 2。'
      }
    ],
    tests: [
      { input: '5 2\n1 2\n1 3\n3 4\n3 5\n4 5\n2 3\n', output: '1 1 2 1 1', score: 20 },
      { input: '1 1\n1 1\n', output: '1', score: 20 },
      { input: '2 1\n1 2\n1 2\n', output: '1 1', score: 20 },
      { input: '3 2\n1 2\n2 3\n1 3\n1 2\n', output: '2 2 1', score: 20 },
      { input: '6 3\n1 2\n1 3\n2 4\n2 5\n3 6\n4 5\n5 6\n4 6\n', output: '2 3 2 2 2 2', score: 20 }
    ],
    std: {
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'typedef long long ll;',
        'int n, m;',
        'vector<vector<int>> g;',
        'vector<int> par, dep;',
        'vector<ll> cnt;',
        'void dfs1(int u, int f){',
        '  par[u] = f; dep[u] = dep[f] + 1;',
        '  for (size_t i = 0; i < g[u].size(); i++) { int v = g[u][i]; if (v != f) dfs1(v, u); }',
        '}',
        'int lca(int a, int b){',
        '  while (dep[a] > dep[b]) a = par[a];',
        '  while (dep[b] > dep[a]) b = par[b];',
        '  while (a != b) { a = par[a]; b = par[b]; }',
        '  return a;',
        '}',
        'void dfs2(int u, int f){',
        '  for (size_t i = 0; i < g[u].size(); i++) {',
        '    int v = g[u][i];',
        '    if (v == f) continue;',
        '    dfs2(v, u);',
        '    cnt[u] += cnt[v];',
        '  }',
        '}',
        'int main(){',
        '  scanf("%d %d", &n, &m);',
        '  g.assign(n + 1, vector<int>());',
        '  for (int i = 0; i < n - 1; i++) { int u, v; scanf("%d %d", &u, &v); g[u].push_back(v); g[v].push_back(u); }',
        '  par.assign(n + 1, 0); dep.assign(n + 1, 0); cnt.assign(n + 1, 0);',
        '  dfs1(1, 0);',
        '  for (int i = 0; i < m; i++) {',
        '    int u, v; scanf("%d %d", &u, &v);',
        '    int w = lca(u, v);',
        '    cnt[u]++; cnt[v]++; cnt[w]--;',
        '    if (par[w]) cnt[par[w]]--;',
        '  }',
        '  dfs2(1, 0);',
        '  for (int i = 1; i <= n; i++) { if (i > 1) printf(" "); printf("%lld", cnt[i]); }',
        '  printf("\\n");',
        '  return 0;',
        '}'
      ].join('\n')
    },
    algo: {
      title: '树上差分标记 + 自底向上汇总',
      viz: {
        input: '5 2\n1 2\n1 3\n3 4\n3 5\n4 5\n2 3\n',
        type: 'graph', mainKey: 'n', edgesKey: 'edges', distKey: 'dist', curKey: 'cur',
        title: 'dist = 差分标记（汇总后即各点权值）'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), m = tk.int();',
        '  var adj = [], edges = [], i;',
        '  for (i = 0; i <= n; i++) adj.push([]);',
        '  for (i = 0; i < n - 1; i++) {',
        '    var u = tk.int(), v = tk.int();',
        '    adj[u].push(v); adj[v].push(u);',
        '    edges.push([u, v]);',
        '  }',
        '  var fa = [], dep = [], cnt = [];',
        '  for (i = 0; i <= n; i++) { fa.push(0); dep.push(0); cnt.push(0); }',
        '  var S = { n: n, m: m, edges: edges, dist: cnt, cur: 1, ans: "" };',
        '  T.step(S, "建树完成，初始所有点权值为 0");',
        '  function dfs1(u, f) {',
        '    fa[u] = f; dep[u] = dep[f] + 1;',
        '    S.cur = u;',
        '    T.step(S, "第一次 DFS：点 " + u + " 深度 " + dep[u] + "，父亲 " + f);',
        '    for (var k = 0; k < adj[u].length; k++) {',
        '      var v = adj[u][k];',
        '      if (v !== f) dfs1(v, u);',
        '    }',
        '  }',
        '  dfs1(1, 0);',
        '  for (var t = 0; t < m; t++) {',
        '    var a = tk.int(), b = tk.int();',
        '    var x = a, y = b;',
        '    while (dep[x] > dep[y]) x = fa[x];',
        '    while (dep[y] > dep[x]) y = fa[y];',
        '    while (x !== y) { x = fa[x]; y = fa[y]; }',
        '    var w = x;',
        '    cnt[a]++; cnt[b]++; cnt[w]--;',
        '    if (fa[w] !== 0) cnt[fa[w]]--;',
        '    S.cur = w;',
        '    T.step(S, "操作 " + (t + 1) + "：路径 " + a + " - " + b + "，LCA = " + w + "，打差分标记");',
        '  }',
        '  function dfs2(u, f) {',
        '    for (var k = 0; k < adj[u].length; k++) {',
        '      var v = adj[u][k];',
        '      if (v === f) continue;',
        '      dfs2(v, u);',
        '      cnt[u] += cnt[v];',
        '    }',
        '    S.cur = u;',
        '    T.step(S, "点 " + u + " 汇总子树差分，最终权值 = " + cnt[u]);',
        '  }',
        '  dfs2(1, 0);',
        '  var out = [];',
        '  for (i = 1; i <= n; i++) out.push(String(cnt[i]));',
        '  var ans = out.join(" ");',
        '  S.ans = ans;',
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
        '  for (i = 0; i < n - 1; i++) {',
        '    var u = tk.int(), v = tk.int();',
        '    adj[u].push(v); adj[v].push(u);',
        '    edges.push([u, v]);',
        '  }',
        '  var fa = [], dep = [], cnt = [];',
        '  for (i = 0; i <= n; i++) { fa.push(0); dep.push(0); cnt.push(0); }',
        '  var S = { n: n, m: m, edges: edges, dist: cnt, cur: 1, ans: "" };',
        '  T.step(S, "建树完成，初始点权全为 0");',
        '  // TODO 1: 从根 1 号点 DFS，求出每个点的父亲 fa[] 和深度 dep[]',
        '  // TODO 2: 对每次操作 (u, v)：先求出 l = LCA(u, v)（先对齐深度再一起上爬），',
        '  //         然后 cnt[u]++; cnt[v]++; cnt[l]--; if (fa[l]) cnt[fa[l]]--;',
        '  // TODO 3: 再 DFS 一次自底向上汇总：cnt[u] += cnt[每个儿子]',
        '  var out = [];',
        '  S.ans = out.join(" ");',
        '  T.answer(S.ans);',
        '  return S.ans;',
        '}'
      ].join('\n'),
      pseudo: [
        'DFS 求 fa[] 与 dep[]',
        'for each op (u, v):',
        '  l ← LCA(u, v)',
        '  cnt[u]++; cnt[v]++; cnt[l]--; if fa[l] ≠ 0 then cnt[fa[l]]--',
        'DFS2(u): for each child v: DFS2(v); cnt[u] += cnt[v]',
        '输出 cnt[1..n]'
      ],
      gen: 'function(r){ var n = 1 + Math.floor(Math.random()*6); var m = 1 + Math.floor(Math.random()*3); var s = n + " " + m; var i; for (i = 2; i <= n; i++) s += "\\n" + (1 + Math.floor(Math.random()*(i-1))) + " " + i; for (i = 0; i < m; i++) s += "\\n" + (1 + Math.floor(Math.random()*n)) + " " + (1 + Math.floor(Math.random()*n)); return s; }'
    },
    tips: [
      '路径两端要各 +1，LCA 处要 -1，LCA 的父亲处还要再 -1；少减那一次会把整条祖先链也加上。',
      'LCA 是根时没有父亲，这时不能对 fa[根] 做减法（否则会写到下标 0 上）。',
      '差分只是标记，必须再做一遍「儿子加到父亲」的自底向上汇总，才能得到真正的点权。'
    ]
  });

  /* ========================================================================
   * p62 欧拉路（Hierholzer）
   * ======================================================================*/
  window.CSP.problems.push({
    id: 'p62', no: 62, title: '欧拉路判定与构造', diff: 5, tier: '省选-',
    knowledge: ['graph.euler', 'graph.dfs', 'graph.store'],
    limits: { time: '1s', memory: '128MB' },
    statement:
      '给定一张 n 个点、m 条边的**无向图**，点编号 1 到 n（允许重边，没有自环，保证 m ≥ 1）。\n' +
      '所谓欧拉回路，是指一条**恰好经过每条边一次**、并且回到起点的路径；' +
      '欧拉路径则只要求恰好经过每条边一次，起点和终点可以不同。\n' +
      '请按下面的约定输出：\n' +
      '- 若存在欧拉回路：第一行输出 `Circuit`，第二行输出一条欧拉回路经过的点编号序列（共 m+1 个数）。\n' +
      '- 若不存在欧拉回路但存在欧拉路径：第一行输出 `Path`，第二行输出一条欧拉路径经过的点编号序列（共 m+1 个数）。\n' +
      '- 若都不存在：只输出一行 `No`。\n' +
      '判定与起点约定：\n' +
      '- 算出每个点的度数。若**所有**点度数为偶数，则存在欧拉回路，起点取编号最小的非孤立点；\n' +
      '- 若**恰好有两个**点度数为奇数，则存在欧拉路径（无欧拉回路），起点取编号较小的那个奇度点；\n' +
      '- 其余情况不存在欧拉路。\n' +
      '- 另外要求所有边必须同属一个连通块（孤立点不影响）。\n' +
      '做法：Hierholzer。从起点出发，能走就走（优先走编号小的邻点），走到死胡同时把当前点计入答案并回退，' +
      '最后把答案序列**整体翻转**就是一条合法欧拉路。',
    inputFormat:
      '第一行两个整数 n, m（1 ≤ n ≤ 300，1 ≤ m ≤ 1000）。\n' +
      '接下来 m 行，每行两个整数 u, v（1 ≤ u, v ≤ n，u ≠ v），表示一条连接 u 和 v 的无向边（可能是重边）。',
    outputFormat:
      '第一行是 `Circuit`、`Path` 或 `No`。\n' +
      '若不是 `No`，第二行输出 m+1 个点编号，用空格分隔，表示一条欧拉回路 / 欧拉路径。',
    samples: [
      {
        input: '4 4\n1 2\n2 3\n3 1\n3 4\n',
        output: 'Path\n3 1 2 3 4',
        explain: '3、4 是仅有的两个奇度点，从 3 走到 4：3→1→2→3→4 恰好经过每条边一次。'
      }
    ],
    tests: [
      { input: '4 4\n1 2\n2 3\n3 1\n3 4\n', output: 'Path\n3 1 2 3 4', score: 20 },
      { input: '3 3\n1 2\n2 3\n3 1\n', output: 'Circuit\n1 2 3 1', score: 20 },
      { input: '2 2\n1 2\n2 1\n', output: 'Circuit\n1 2 1', score: 20 },
      { input: '4 2\n1 2\n3 4\n', output: 'No', score: 20 },
      { input: '5 5\n1 2\n2 3\n3 1\n3 4\n4 5\n', output: 'Path\n3 1 2 3 4 5', score: 20 }
    ],
    std: {
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int n, m;',
        'vector<pair<int,int>> adj[305];',
        'vector<int> eu, ev, deg;',
        'int main(){',
        '  scanf("%d %d", &n, &m);',
        '  eu.resize(m); ev.resize(m); deg.assign(n + 1, 0);',
        '  for (int i = 0; i < m; i++) {',
        '    int u, v; scanf("%d %d", &u, &v);',
        '    eu[i] = u; ev[i] = v;',
        '    adj[u].push_back(make_pair(v, i));',
        '    adj[v].push_back(make_pair(u, i));',
        '    deg[u]++; deg[v]++;',
        '  }',
        '  for (int i = 1; i <= n; i++) sort(adj[i].begin(), adj[i].end());',
        '  int root = 0;',
        '  for (int i = 1; i <= n; i++) if (deg[i] > 0) { root = i; break; }',
        '  vector<int> seen(n + 1, 0);',
        '  if (root) {',
        '    queue<int> q; q.push(root); seen[root] = 1;',
        '    while (!q.empty()) {',
        '      int u = q.front(); q.pop();',
        '      for (size_t i = 0; i < adj[u].size(); i++) { int v = adj[u][i].first; if (!seen[v]) { seen[v] = 1; q.push(v); } }',
        '    }',
        '  }',
        '  for (int i = 1; i <= n; i++) if (deg[i] > 0 && !seen[i]) { printf("No\\n"); return 0; }',
        '  int odd = 0, firstOdd = 0, firstDeg = 0;',
        '  for (int i = 1; i <= n; i++) {',
        '    if (deg[i] % 2) { odd++; if (!firstOdd) firstOdd = i; }',
        '    if (deg[i] > 0 && !firstDeg) firstDeg = i;',
        '  }',
        '  string type; int start = -1;',
        '  if (odd == 0) { type = "Circuit"; start = firstDeg; }',
        '  else if (odd == 2) { type = "Path"; start = firstOdd; }',
        '  else { printf("No\\n"); return 0; }',
        '  vector<int> used(m, 0), ptr(n + 1, 0), stk, circ;',
        '  stk.push_back(start);',
        '  while (!stk.empty()) {',
        '    int u = stk.back();',
        '    while (ptr[u] < (int)adj[u].size() && used[adj[u][ptr[u]].second]) ptr[u]++;',
        '    if (ptr[u] < (int)adj[u].size()) {',
        '      int e = adj[u][ptr[u]].second;',
        '      used[e] = 1;',
        '      stk.push_back(eu[e] == u ? ev[e] : eu[e]);',
        '    } else {',
        '      circ.push_back(u);',
        '      stk.pop_back();',
        '    }',
        '  }',
        '  reverse(circ.begin(), circ.end());',
        '  printf("%s\\n", type.c_str());',
        '  for (size_t i = 0; i < circ.size(); i++) { if (i) printf(" "); printf("%d", circ[i]); }',
        '  printf("\\n");',
        '  return 0;',
        '}'
      ].join('\n')
    },
    algo: {
      title: 'Hierholzer 逐步走边 + 死胡同回退',
      viz: {
        input: '4 4\n1 2\n2 3\n3 1\n3 4\n',
        type: 'graph', mainKey: 'n', edgesKey: 'edges', distKey: 'dist', curKey: 'cur',
        title: 'dist = 每个点的度数'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), m = tk.int();',
        '  var adj = [], eu = [], ev = [], deg = [], edges = [], i;',
        '  for (i = 0; i <= n; i++) { adj.push([]); deg.push(0); }',
        '  for (i = 0; i < m; i++) {',
        '    var u = tk.int(), v = tk.int();',
        '    eu.push(u); ev.push(v);',
        '    adj[u].push([v, i]); adj[v].push([u, i]);',
        '    deg[u]++; deg[v]++;',
        '    edges.push([u, v]);',
        '  }',
        '  for (i = 1; i <= n; i++) adj[i].sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });',
        '  var S = { n: n, m: m, edges: edges, dist: deg, cur: 0, stack: [], circ: [], ans: "" };',
        '  T.step(S, "统计每个点的度数，邻接表按 (邻点, 边号) 升序排列");',
        '  var seen = [];',
        '  for (i = 0; i <= n; i++) seen.push(false);',
        '  var root = 0;',
        '  for (i = 1; i <= n; i++) if (deg[i] > 0) { root = i; break; }',
        '  var q = [root], h = 0;',
        '  seen[root] = true;',
        '  while (h < q.length) {',
        '    var x0 = q[h]; h++;',
        '    for (i = 0; i < adj[x0].length; i++) {',
        '      var y0 = adj[x0][i][0];',
        '      if (!seen[y0]) { seen[y0] = true; q.push(y0); }',
        '    }',
        '  }',
        '  var conn = true;',
        '  for (i = 1; i <= n; i++) if (deg[i] > 0 && !seen[i]) conn = false;',
        '  var odd = 0, firstOdd = 0, firstDeg = 0;',
        '  for (i = 1; i <= n; i++) {',
        '    if (deg[i] % 2 === 1) { odd++; if (firstOdd === 0) firstOdd = i; }',
        '    if (deg[i] > 0 && firstDeg === 0) firstDeg = i;',
        '  }',
        '  S.cur = root;',
        '  T.step(S, "奇度点个数 = " + odd + "，所有边" + (conn ? "在同一连通块" : "不在同一连通块"));',
        '  var type, start;',
        '  if (!conn) { type = ""; start = -1; }',
        '  else if (odd === 0) { type = "Circuit"; start = firstDeg; }',
        '  else if (odd === 2) { type = "Path"; start = firstOdd; }',
        '  else { type = ""; start = -1; }',
        '  if (type === "") {',
        '    S.ans = "No";',
        '    T.step(S, "不存在欧拉回路，也不存在欧拉路径");',
        '    T.answer("No");',
        '    return "No";',
        '  }',
        '  var used = [], ptr = [];',
        '  for (i = 0; i < m; i++) used.push(false);',
        '  for (i = 0; i <= n; i++) ptr.push(0);',
        '  var stk = [start], circ = [];',
        '  S.cur = start; S.stack = stk.slice(); S.circ = [];',
        '  T.step(S, "从起点 " + start + " 出发，开始走边");',
        '  while (stk.length > 0) {',
        '    var cur = stk[stk.length - 1];',
        '    while (ptr[cur] < adj[cur].length && used[adj[cur][ptr[cur]][1]]) ptr[cur]++;',
        '    S.cur = cur;',
        '    if (ptr[cur] < adj[cur].length) {',
        '      var e = adj[cur][ptr[cur]][1];',
        '      var nv = (eu[e] === cur) ? ev[e] : eu[e];',
        '      used[e] = true;',
        '      stk.push(nv);',
        '      S.stack = stk.slice();',
        '      T.step(S, "走过边 " + cur + " - " + nv + "（第 " + e + " 条边）");',
        '    } else {',
        '      circ.push(cur);',
        '      stk.pop();',
        '      S.stack = stk.slice(); S.circ = circ.slice();',
        '      T.step(S, "点 " + cur + " 已无未走过的边，回退并把它记入序列");',
        '    }',
        '  }',
        '  circ.reverse();',
        '  S.circ = circ.slice(); S.cur = start;',
        '  T.step(S, "翻转后得到欧拉" + (type === "Circuit" ? "回路" : "路径") + "：" + circ.join(" "));',
        '  var ans = type + "\\n" + circ.join(" ");',
        '  S.ans = ans;',
        '  T.answer(ans);',
        '  return ans;',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), m = tk.int();',
        '  var adj = [], eu = [], ev = [], deg = [], edges = [], i;',
        '  for (i = 0; i <= n; i++) { adj.push([]); deg.push(0); }',
        '  for (i = 0; i < m; i++) {',
        '    var u = tk.int(), v = tk.int();',
        '    eu.push(u); ev.push(v);',
        '    adj[u].push([v, i]); adj[v].push([u, i]);',
        '    deg[u]++; deg[v]++;',
        '    edges.push([u, v]);',
        '  }',
        '  // 提示：adj[i] 里存的是 [邻点, 边号]，排序时用 (a, b) => a[0]-b[0] || a[1]-b[1]',
        '  var S = { n: n, m: m, edges: edges, dist: deg, cur: 0, stack: [], circ: [], ans: "" };',
        '  T.step(S, "建图完成，准备判定");',
        '  // TODO 1: 统计奇度点个数 odd 与编号最小的非孤立点 firstDeg、最小的奇度点 firstOdd',
        '  // TODO 2: 用 BFS 判断所有度 > 0 的点是否连通；不连通直接输出 No',
        '  // TODO 3: odd === 0 输出 Circuit（起点 firstDeg）；odd === 2 输出 Path（起点 firstOdd）；否则 No',
        '  // TODO 4: Hierholzer：栈顶 u，若还有没走过的出边就走过去（标记该边已用），',
        '  //         否则把 u 记入 circ 并弹栈；最后把 circ 翻转输出',
        '  T.answer(S.ans);',
        '  return S.ans;',
        '}'
      ].join('\n'),
      pseudo: [
        '统计 deg[]；若有度 > 0 的点不连通 → 输出 No',
        'odd ← 度数为奇数的点数；firstOdd ← 最小编号的奇度点；firstDeg ← 最小编号的非孤立点',
        'if odd = 0 then type ← Circuit, start ← firstDeg',
        'else if odd = 2 then type ← Path, start ← firstOdd',
        'else 输出 No',
        '栈 ← {start}',
        'while 栈非空:',
        '  u ← 栈顶；把 u 已经用过的出边跳过',
        '  if u 还有没用过的边 (u,v) then 标记该边已用，把 v 压栈',
        '  else 把 u 记入 circ，弹栈',
        '翻转 circ，输出 type 与 circ'
      ],
      gen: 'function(r){ var n = 2 + Math.floor(Math.random()*4); var m = 1 + Math.floor(Math.random()*6); var s = n + " " + m; for (var i = 0; i < m; i++) { var u = 1 + Math.floor(Math.random()*n); var v = 1 + Math.floor(Math.random()*n); if (u === v) { i--; continue; } s += "\\n" + u + " " + v; } return s; }'
    },
    tips: [
      '「所有边连通」要按边判断：只关心度数大于 0 的点，孤立点不能算作不连通。',
      '奇度点个数只能是 0 或 2 时才可能有解；出现 4 个及以上奇度点一定无解。',
      'Hierholzer 得到的序列是「死胡同优先」的逆序，最后一定要整体翻转才是合法路径。'
    ]
  });

  /* ========================================================================
   * p63 AC 自动机：多模式串出现次数
   * ======================================================================*/
  window.CSP.problems.push({
    id: 'p63', no: 63, title: '多模式串匹配', diff: 5, tier: '省选-',
    knowledge: ['str.ac', 'ds.trie', 'str.kmp'],
    limits: { time: '1s', memory: '256MB' },
    statement:
      '给定 n 个只含小写字母的非空**模式串**，以及一个只含小写字母的非空**文本串** T。\n' +
      '请分别统计每个模式串在 T 中出现的次数。**可重叠**：例如 `aa` 在 `aaa` 中出现 2 次。\n' +
      '做法：**AC 自动机**。\n' +
      '1. 把所有模式串插进一棵 Trie（字典树），每个结点代表某个模式串的一个前缀；\n' +
      '2. 用 BFS 求出每个结点的失配指针 fail：fail[v] 指向「v 所代表字符串的最长真后缀」对应的结点；' +
      '若某个字符的儿子不存在，就把这条转移直接指向 fail 的对应转移（补全自动机）；\n' +
      '3. 把文本串在自动机上跑一遍，每走到一个结点就把它「经过次数 +1」；\n' +
      '4. 按 BFS 的**逆序**把每个结点的计数加到 fail 指向的结点上——' +
      '这样结点上的最终计数就等于「这个前缀作为后缀出现过多少次」，也就是以它为结尾的模式串出现次数。',
    inputFormat:
      '第一行一个整数 n（1 ≤ n ≤ 100）。\n' +
      '接下来 n 行，每行一个只含小写字母的非空模式串，长度不超过 50。\n' +
      '最后一行一个只含小写字母的非空文本串 T，长度不超过 10^5。',
    outputFormat: '共 n 行，第 i 行一个整数，表示第 i 个模式串在 T 中出现的次数（可重叠）。',
    samples: [
      {
        input: '3\na\nab\nabc\nabababc\n',
        output: '3\n3\n1',
        explain: 'a 出现在第 1、3、5 位；ab 出现在第 1、3、5 位；abc 只出现在第 5 位。'
      }
    ],
    tests: [
      { input: '3\na\nab\nabc\nabababc\n', output: '3\n3\n1', score: 20 },
      { input: '1\nz\nabc\n', output: '0', score: 20 },
      { input: '2\naa\naaa\naaaaa\n', output: '4\n3', score: 20 },
      { input: '1\nabab\nababab\n', output: '2', score: 20 },
      { input: '3\nb\nbb\nbbb\nabbbab\n', output: '4\n2\n1', score: 20 }
    ],
    std: {
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main(){',
        '  int n;',
        '  if (scanf("%d", &n) != 1) return 0;',
        '  vector<string> pat(n);',
        '  int maxNodes = 2;',
        '  for (int i = 0; i < n; i++) { char buf[105]; scanf("%s", buf); pat[i] = buf; maxNodes += (int)pat[i].size(); }',
        '  vector<vector<int>> ch(maxNodes, vector<int>(26, 0));',
        '  vector<int> fail(maxNodes, 0), vis(maxNodes, 0), ord;',
        '  int tot = 1;',
        '  for (int i = 0; i < n; i++) {',
        '    int u = 1;',
        '    for (size_t j = 0; j < pat[i].size(); j++) {',
        '      int c = pat[i][j] - \'a\';',
        '      if (!ch[u][c]) ch[u][c] = ++tot;',
        '      u = ch[u][c];',
        '    }',
        '  }',
        '  queue<int> q;',
        '  for (int c = 0; c < 26; c++) {',
        '    if (ch[1][c]) { fail[ch[1][c]] = 1; q.push(ch[1][c]); ord.push_back(ch[1][c]); }',
        '    else ch[1][c] = 1;',
        '  }',
        '  while (!q.empty()) {',
        '    int u = q.front(); q.pop();',
        '    for (int c = 0; c < 26; c++) {',
        '      int v = ch[u][c];',
        '      if (v) { fail[v] = ch[fail[u]][c]; q.push(v); ord.push_back(v); }',
        '      else ch[u][c] = ch[fail[u]][c];',
        '    }',
        '  }',
        '  char txt[100005];',
        '  scanf("%s", txt);',
        '  string text = txt;',
        '  int u = 1;',
        '  for (size_t i = 0; i < text.size(); i++) { u = ch[u][text[i] - \'a\']; vis[u]++; }',
        '  for (int i = (int)ord.size() - 1; i >= 0; i--) { int v = ord[i]; vis[fail[v]] += vis[v]; }',
        '  for (int i = 0; i < n; i++) {',
        '    int x = 1;',
        '    for (size_t j = 0; j < pat[i].size(); j++) x = ch[x][pat[i][j] - \'a\'];',
        '    printf("%d\\n", vis[x]);',
        '  }',
        '  return 0;',
        '}'
      ].join('\n')
    },
    algo: {
      title: 'AC 自动机：Trie + fail 指针 + 逆序累加',
      viz: {
        input: '3\na\nab\nabc\nabababc\n',
        type: 'string', mainKey: 'text',
        pointers: ['i'], highlight: ['i'], labels: { i: 'i' },
        title: '文本串在自动机上的扫描位置 i'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), i, c, j;',
        '  var pat = [];',
        '  for (i = 0; i < n; i++) pat.push(tk.next());',
        '  var text = tk.next();',
        '  var ch = [], fail = [], cnt = [], ord = [];',
        '  function newNode() {',
        '    var a = [];',
        '    for (var k = 0; k < 26; k++) a.push(-1);',
        '    ch.push(a); fail.push(0); cnt.push(0);',
        '    return ch.length - 1;',
        '  }',
        '  var root = newNode();',
        '  var S = { n: n, text: text.split(""), i: 0, node: root, pats: pat, res: [], ans: "" };',
        '  for (i = 0; i < n; i++) S.res.push(0);',
        '  T.step(S, "读入 " + n + " 个模式串与文本串，开始建 Trie");',
        '  for (i = 0; i < n; i++) {',
        '    var u = root;',
        '    for (j = 0; j < pat[i].length; j++) {',
        '      c = pat[i].charCodeAt(j) - 97;',
        '      if (ch[u][c] === -1) ch[u][c] = newNode();',
        '      u = ch[u][c];',
        '      S.node = u; S.i = j;',
        '      T.step(S, "插入第 " + (i + 1) + " 个模式串的第 " + j + " 个字符，到达结点 " + u);',
        '    }',
        '  }',
        '  var q = [], h = 0;',
        '  for (c = 0; c < 26; c++) {',
        '    if (ch[root][c] !== -1) { fail[ch[root][c]] = root; q.push(ch[root][c]); ord.push(ch[root][c]); }',
        '    else ch[root][c] = root;',
        '  }',
        '  while (h < q.length) {',
        '    var x = q[h]; h++;',
        '    for (c = 0; c < 26; c++) {',
        '      var v = ch[x][c];',
        '      if (v !== -1) { fail[v] = ch[fail[x]][c]; q.push(v); ord.push(v); }',
        '      else ch[x][c] = ch[fail[x]][c];',
        '    }',
        '    S.node = x;',
        '    T.step(S, "BFS 处理结点 " + x + "，补全它的转移并设置儿子的 fail");',
        '  }',
        '  var cur = root;',
        '  for (i = 0; i < text.length; i++) {',
        '    cur = ch[cur][text.charCodeAt(i) - 97];',
        '    cnt[cur]++;',
        '    S.i = i; S.node = cur;',
        '    T.step(S, "文本第 " + i + " 位是 \'" + text.charAt(i) + "\'，走到结点 " + cur);',
        '  }',
        '  for (i = ord.length - 1; i >= 0; i--) {',
        '    var vv = ord[i];',
        '    cnt[fail[vv]] += cnt[vv];',
        '    S.node = vv;',
        '    T.step(S, "把结点 " + vv + " 的计数沿 fail 累加到结点 " + fail[vv]);',
        '  }',
        '  var out = [];',
        '  for (i = 0; i < n; i++) {',
        '    var x2 = root;',
        '    for (j = 0; j < pat[i].length; j++) x2 = ch[x2][pat[i].charCodeAt(j) - 97];',
        '    out.push(String(cnt[x2]));',
        '    S.res[i] = cnt[x2];',
        '  }',
        '  var ans = out.join("\\n");',
        '  S.ans = ans; S.i = 0;',
        '  T.step(S, "统计完成：各模式串出现次数为 " + out.join(" "));',
        '  T.answer(ans);',
        '  return ans;',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), i, j, c;',
        '  var pat = [];',
        '  for (i = 0; i < n; i++) pat.push(tk.next());',
        '  var text = tk.next();',
        '  var ch = [], fail = [], cnt = [], ord = [];',
        '  function newNode() {',
        '    var a = [];',
        '    for (var k = 0; k < 26; k++) a.push(-1);',
        '    ch.push(a); fail.push(0); cnt.push(0);',
        '    return ch.length - 1;',
        '  }',
        '  var root = newNode();',
        '  var S = { n: n, text: text.split(""), i: 0, node: root, pats: pat, res: [], ans: "" };',
        '  for (i = 0; i < n; i++) S.res.push(0);',
        '  T.step(S, "读入模式串与文本串");',
        '  // TODO 1: 把每个模式串插入 Trie（结点用 ch[u][c] 存儿子，-1 表示没有）',
        '  // TODO 2: BFS 建 fail：根的儿子 fail ← root；对结点 x 的每个字符 c，',
        '  //         若儿子 v 存在则 fail[v] ← ch[fail[x]][c] 并入队，否则 ch[x][c] ← ch[fail[x]][c]',
        '  //         同时用 ord 记录 BFS 顺序',
        '  // TODO 3: 把文本串在自动机上跑一遍，每到一个结点就 cnt[结点]++',
        '  // TODO 4: 按 ord 的逆序执行 cnt[fail[v]] += cnt[v]',
        '  // TODO 5: 每个模式串沿着 Trie 走到末尾结点，输出 cnt[该结点]',
        '  var out = [];',
        '  S.ans = out.join("\\n");',
        '  T.answer(S.ans);',
        '  return S.ans;',
        '}'
      ].join('\n'),
      pseudo: [
        'for each 模式串 P: 沿 Trie 插入，u ← root；字符不存在就新建结点',
        'BFS(root): 根的儿子 fail ← root 并入队',
        '  while 队列非空: x ← 出队；for c in 0..25:',
        '    v ← ch[x][c]; if v 存在 then fail[v] ← ch[fail[x]][c], v 入队',
        '    else ch[x][c] ← ch[fail[x]][c]',
        'u ← root',
        'for i ← 0 to |T|-1: u ← ch[u][T[i]]; cnt[u]++',
        'for v in 逆 BFS 序: cnt[fail[v]] += cnt[v]',
        'for each 模式串: 沿 Trie 走到底得到结点 x，输出 cnt[x]'
      ],
      gen: 'function(r){ var n = 1 + Math.floor(Math.random()*3); var pats = []; for (var i = 0; i < n; i++) { var L = 1 + Math.floor(Math.random()*3); var p = ""; for (var j = 0; j < L; j++) p += "ab".charAt(Math.floor(Math.random()*2)); pats.push(p); } var T = ""; var tl = 2 + Math.floor(Math.random()*6); for (var k = 0; k < tl; k++) T += "ab".charAt(Math.floor(Math.random()*2)); return n + "\\n" + pats.join("\\n") + "\\n" + T; }'
    },
    tips: [
      'fail 的求法：根的儿子失配指向根；其余结点 v 的 fail 等于 fail[父] 的对应字符儿子，必须按 BFS 序求。',
      '统计出现次数时要在失配链上传播：只把文本经过的结点 +1 是不够的，必须按 BFS 逆序 cnt[fail[v]] += cnt[v]。',
      '模式串可能重复，也可能互为前缀/后缀（如 a、ab、abab），沿 fail 传播才能全部统计到。'
    ]
  });

  /* ========================================================================
   * p64 后缀数组与 Z 函数
   * ======================================================================*/
  window.CSP.problems.push({
    id: 'p64', no: 64, title: 'Z 函数与后缀数组', diff: 5, tier: '省选-',
    knowledge: ['str.z', 'str.sa', 'str.basic'],
    limits: { time: '1s', memory: '128MB' },
    statement:
      '给定一个只含小写字母的非空字符串 s，设它的长度为 n，字符位置从 1 开始编号。\n' +
      '请输出两行结果：\n' +
      '- 第一行：$n$ 个整数，即 **Z 数组**。约定 z[0] = n；对 i ≥ 1，z[i] 表示「s 从第 i 位开始的后缀」' +
      '与「s 本身」的**最长公共前缀**长度（字符串按 0 起编号，z 数组按 0 起输出）。\n' +
      '- 第二行：$n$ 个整数，即 **后缀数组** sa。把 s 的全部 n 个后缀按字典序从小到大排序，' +
      'sa[i] 就是排在第 i 小（从 1 开始计数）的那个后缀的**起始位置（1 起）**。\n' +
      '由于所有后缀长度互不相同，任意两个后缀都不会相等，所以排序结果是唯一的。\n' +
      '数据很小，Z 数组可以直接用 O(n^2) 的暴力求，后缀数组直接对后缀做比较排序即可。',
    inputFormat: '一行一个只含小写字母的非空字符串 s（1 ≤ |s| ≤ 100）。',
    outputFormat: '第一行 n 个整数，为 Z 数组（z[0] 恒等于 n）；第二行 n 个整数，为后缀数组 sa（1 起的起始位置）。',
    samples: [
      {
        input: 'abab',
        output: '4 0 2 0\n3 1 4 2',
        explain: '后缀 ab(3) < abab(1) < b(4) < bab(2)；Z 数组分别为 4、0、2、0。'
      }
    ],
    tests: [
      { input: 'abab\n', output: '4 0 2 0\n3 1 4 2', score: 20 },
      { input: 'a\n', output: '1\n1', score: 20 },
      { input: 'aaaa\n', output: '4 3 2 1\n4 3 2 1', score: 20 },
      { input: 'abcab\n', output: '5 0 0 2 0\n4 1 5 2 3', score: 20 },
      { input: 'aabaaab\n', output: '7 1 0 2 3 1 0\n4 5 1 6 2 7 3', score: 20 }
    ],
    std: {
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main(){',
        '  string s;',
        '  if (!(cin >> s)) return 0;',
        '  int n = (int)s.size();',
        '  vector<int> z(n, 0);',
        '  z[0] = n;',
        '  for (int i = 1; i < n; i++) {',
        '    int k = 0;',
        '    while (i + k < n && s[k] == s[i + k]) k++;',
        '    z[i] = k;',
        '  }',
        '  vector<int> sa(n);',
        '  for (int i = 0; i < n; i++) sa[i] = i + 1;',
        '  sort(sa.begin(), sa.end(), [&](int a, int b){ return s.substr(a - 1) < s.substr(b - 1); });',
        '  for (int i = 0; i < n; i++) { if (i) printf(" "); printf("%d", z[i]); }',
        '  printf("\\n");',
        '  for (int i = 0; i < n; i++) { if (i) printf(" "); printf("%d", sa[i]); }',
        '  printf("\\n");',
        '  return 0;',
        '}'
      ].join('\n')
    },
    algo: {
      title: '暴力 Z 函数 + 后缀字典序排序',
      viz: {
        input: 'abab',
        type: 'string', mainKey: 's',
        pointers: ['i'], highlight: ['i'], labels: { i: 'i' },
        title: 'Z 数组与后缀数组的计算位置 i'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var s = tk.next();',
        '  var n = s.length, i, k, j;',
        '  var z = [];',
        '  for (i = 0; i < n; i++) z.push(0);',
        '  var S = { s: s.split(""), n: n, i: 0, k: 0, z: z.slice(), sa: [], ans: "" };',
        '  z[0] = n;',
        '  T.step(S, "字符串长度 n = " + n + "，约定 z[0] = n");',
        '  for (i = 1; i < n; i++) {',
        '    k = 0;',
        '    while (i + k < n && s.charAt(k) === s.charAt(i + k)) k++;',
        '    z[i] = k;',
        '    S.i = i; S.k = k; S.z = z.slice();',
        '    T.step(S, "z[" + i + "] = " + k + "：与 s 的最长公共前缀长度");',
        '  }',
        '  var sa = [];',
        '  for (i = 0; i < n; i++) sa.push(i + 1);',
        '  for (i = 0; i < n; i++) {',
        '    var best = i;',
        '    for (j = i + 1; j < n; j++) {',
        '      if (s.substr(sa[j] - 1) < s.substr(sa[best] - 1)) best = j;',
        '    }',
        '    var tmp = sa[i]; sa[i] = sa[best]; sa[best] = tmp;',
        '    S.sa = sa.slice(); S.i = i;',
        '    T.step(S, "选出第 " + (i + 1) + " 小的后缀，起始位置是 " + sa[i]);',
        '  }',
        '  var ans = z.join(" ") + "\\n" + sa.join(" ");',
        '  S.ans = ans; S.i = 0;',
        '  T.step(S, "Z 数组与后缀数组都计算完成");',
        '  T.answer(ans);',
        '  return ans;',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var s = tk.next();',
        '  var n = s.length, i, j;',
        '  var z = [];',
        '  for (i = 0; i < n; i++) z.push(0);',
        '  var S = { s: s.split(""), n: n, i: 0, k: 0, z: z.slice(), sa: [], ans: "" };',
        '  z[0] = n;',
        '  T.step(S, "字符串长度 n = " + n);',
        '  // TODO 1: 对 i = 1..n-1，暴力求 z[i]：令 k = 0，',
        '  //         当 i + k < n 且 s[k] === s[i + k] 时 k++，最后 z[i] = k',
        '  var sa = [];',
        '  // TODO 2: sa 初值为 1..n（每个后缀的起始位置）',
        '  // TODO 3: 把 sa 按对应后缀的字典序升序排序（可以直接比较 s.substr(pos-1)）',
        '  // TODO 4: 输出 z 数组与 sa 数组，各一行，空格分隔',
        '  var ans = z.join(" ") + "\\n" + sa.join(" ");',
        '  S.ans = ans;',
        '  T.answer(ans);',
        '  return ans;',
        '}'
      ].join('\n'),
      pseudo: [
        'z[0] ← n',
        'for i ← 1 to n-1:',
        '  k ← 0',
        '  while i+k < n and s[k] = s[i+k]: k++',
        '  z[i] ← k',
        'sa ← [1, 2, …, n]',
        '把 sa 按 s 的对应后缀字典序升序排序',
        '输出 z 数组与 sa 数组'
      ],
      gen: 'function(r){ var n = 1 + Math.floor(Math.random()*8); var s = ""; for (var i = 0; i < n; i++) s += "ab".charAt(Math.floor(Math.random()*2)); return s; }'
    },
    tips: [
      'Z 数组按 0 起输出，且题目约定 z[0] = n，不要按「真前缀」的定义把 z[0] 写成 0。',
      '后缀数组 sa 里存的是**起始位置**（1 起），不是排名；写反了会得到完全不同的序列。',
      '字符串比较用 std::string 的 operator< 或 JS 的 <，都是从第一位开始逐字符比较，短且是前缀时更小，符合字典序。'
    ]
  });

})();
