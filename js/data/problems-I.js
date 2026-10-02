/* ============================================================================
 * 题库 I 组：搜索与高级技巧补齐 (p65–p69)
 *   p65 N 皇后方案数        search.dfs
 *   p66 双向 BFS 无权最短路  search.bidir
 *   p67 迭代加深搜索         search.itdeep
 *   p68 折半搜索             search.meet
 *   p69 分块                 ds.blocksqrt
 * ==========================================================================*/
(function () {
  'use strict';
  window.CSP = window.CSP || {};
  window.CSP.problems = window.CSP.problems || [];

  /* ---------------------------------------------------------------- p65 --- */
  window.CSP.problems.push({
    id: 'p65', no: 65, title: 'N 皇后方案数', diff: 4, tier: '提高+',
    knowledge: ['search.dfs', 'basic.recursion'],
    limits: { time: '1s', memory: '128MB' },
    statement: '在 n × n 的棋盘上摆放 n 个皇后，要求任意两个皇后都不在同一行、同一列、同一条斜线上。\n求一共有多少种摆法。',
    inputFormat: '一行一个整数 n（1 ≤ n ≤ 10）。',
    outputFormat: '一个整数，表示合法摆法的数量；无解输出 0。',
    samples: [{ input: '4', output: '2', explain: '4 皇后共有 2 种摆法。' }],
    tests: [
      { input: '1\n', output: '1', score: 20 },
      { input: '2\n', output: '0', score: 20 },
      { input: '4\n', output: '2', score: 20 },
      { input: '6\n', output: '4', score: 20 },
      { input: '8\n', output: '92', score: 20 }
    ],
    std: {
      code: '#include <bits/stdc++.h>\nusing namespace std;\nint n,ans=0,col[16],d1[32],d2[32];\nvoid dfs(int r){if(r==n){ans++;return;}for(int c=0;c<n;c++){if(col[c]||d1[r+c]||d2[r-c+n])continue;col[c]=d1[r+c]=d2[r-c+n]=1;dfs(r+1);col[c]=d1[r+c]=d2[r-c+n]=0;}}\nint main(){cin>>n;dfs(0);cout<<ans<<endl;return 0;}'
    },
    algo: {
      title: 'DFS 逐行放置 + 三组冲突标记剪枝',
      viz: { input: '4', type: 'array', mainKey: 'cols', pointers: ['row'], title: '每行皇后所在列' },
      ref: [
        'function solve(input, T){',
        '  var n = T.tokens.int();',
        '  var cols = [], d1 = {}, d2 = {}, cnt = 0;',
        '  var S = { n: n, row: 0, cols: cols, ans: 0 };',
        '  T.step(S, "在 " + n + "×" + n + " 棋盘上放 " + n + " 个皇后");',
        '  function dfs(r){',
        '    S.row = r; S.cols = cols; S.ans = cnt;',
        '    if (r === n) { cnt++; S.ans = cnt; T.step(S, "第 " + n + " 行放完，得到一个合法方案"); return; }',
        '    for (var c = 0; c < n; c++) {',
        '      var a = r + c, b = r - c + n;',
        '      if (cols.indexOf(c) >= 0 || d1[a] || d2[b]) continue;',
        '      cols.push(c); d1[a] = 1; d2[b] = 1;',
        '      S.row = r; S.ans = cnt;',
        '      T.step(S, "第 " + r + " 行放在第 " + c + " 列（列/斜线都不冲突）");',
        '      dfs(r + 1);',
        '      cols.pop(); d1[a] = 0; d2[b] = 0;',
        '    }',
        '  }',
        '  dfs(0);',
        '  T.answer(String(cnt));',
        '  return String(cnt);',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var n = T.tokens.int();',
        '  var cols = [], d1 = {}, d2 = {}, cnt = 0;',
        '  var S = { n: n, row: 0, cols: cols, ans: 0 };',
        '  T.step(S, "开始搜索");',
        '  function dfs(r){',
        '    // TODO: 递归终止条件（r === n 时计数 +1）',
        '    // TODO: 枚举第 r 行的每一列 c，判断列冲突用 cols、两条斜线用 r+c 与 r-c+n',
        '    // TODO: 放置后递归 dfs(r+1)，回溯时撤销标记；每一步都要调用 T.step',
        '  }',
        '  dfs(0);',
        '  T.answer(String(cnt));',
        '  return String(cnt);',
        '}'
      ].join('\n'),
      pseudo: ['cnt ← 0', 'dfs(r):', '  if r = n then cnt++, return', '  for c ← 0 to n-1', '    if 列 c 或斜线 r+c 或 r-c+n 被占用 then continue', '    标记并 dfs(r+1)，然后撤销'],
      gen: 'function(r){ var n = 1 + Math.floor(Math.random()*6); return String(n); }'
    },
    tips: ['斜线用 r + c 和 r - c + n 两个下标统一表示，避免负数下标', 'n ≤ 10 时纯 DFS 足够快；n 更大才需要位运算优化']
  });

  /* ---------------------------------------------------------------- p66 --- */
  window.CSP.problems.push({
    id: 'p66', no: 66, title: '双向 BFS 无权最短路', diff: 4, tier: '提高+',
    knowledge: ['search.bidir', 'graph.bfs'],
    limits: { time: '1s', memory: '128MB' },
    statement: '给定一张 n 个点 m 条边的无向无权图，求从点 1 到点 n 的最短路径长度（经过的边数）。\n当起点到终点的分支很多时，从起点和终点同时扩展（双向 BFS）可以显著减少搜索规模。',
    inputFormat: '第一行两个整数 n, m（1 ≤ n ≤ 1000，0 ≤ m ≤ 5000）。\n接下来 m 行，每行两个整数 u, v，表示一条无向边。',
    outputFormat: '一个整数，表示从 1 到 n 的最短边数；若不可达输出 -1。',
    samples: [{ input: '5 5\n1 2\n2 3\n3 5\n1 4\n4 5', output: '2', explain: '路径 1 → 4 → 5，只需 2 条边。' }],
    tests: [
      { input: '5 5\n1 2\n2 3\n3 5\n1 4\n4 5\n', output: '2', score: 20 },
      { input: '1 0\n', output: '0', score: 20 },
      { input: '3 1\n1 2\n', output: '-1', score: 20 },
      { input: '4 4\n1 2\n2 3\n3 4\n1 4\n', output: '1', score: 20 },
      { input: '7 6\n1 2\n2 3\n3 4\n4 5\n5 6\n6 7\n', output: '6', score: 20 }
    ],
    std: {
      code: '#include <bits/stdc++.h>\nusing namespace std;\nint main(){int n,m;cin>>n>>m;vector<vector<int>>g(n+1);for(int i=0;i<m;i++){int u,v;cin>>u>>v;g[u].push_back(v);g[v].push_back(u);}\nvector<int>d1(n+1,-1),d2(n+1,-1);queue<int>q1,q2;d1[1]=0;d2[n]=0;q1.push(1);q2.push(n);\nif(1==n){cout<<0<<endl;return 0;}\nwhile(!q1.empty()&&!q2.empty()){\n if(q1.size()>q2.size()){swap(q1,q2);swap(d1,d2);}\n int s=q1.size();while(s--){int u=q1.front();q1.pop();for(int v:g[u]){if(d1[v]!=-1)continue;d1[v]=d1[u]+1;if(d2[v]!=-1){cout<<d1[v]+d2[v]<<endl;return 0;}q1.push(v);}}\n}\ncout<<-1<<endl;return 0;}'
    },
    algo: {
      title: '双向 BFS：两端轮流扩展，相遇即最短',
      viz: { input: '5 5\n1 2\n2 3\n3 5\n1 4\n4 5', type: 'graph', mainKey: 'n', edgesKey: 'edges', distKey: 'dist', curKey: 'cur', title: '双端扩展' },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), m = tk.int();',
        '  var g = [], i, u, v;',
        '  for (i = 0; i <= n; i++) g.push([]);',
        '  var edges = [];',
        '  for (i = 0; i < m; i++) { u = tk.int(); v = tk.int(); g[u].push(v); g[v].push(u); edges.push([u, v]); }',
        '  var dis = [], vis = [], cur = 0, ans = -1;',
        '  for (i = 0; i <= n; i++) { dis.push(-1); vis.push(0); }',
        '  var S = { n: n, edges: edges, dist: dis.slice(1), cur: cur, ans: -1, queue: [] };',
        '  T.step(S, "建图完成，点数 " + n + " 边数 " + m);',
        '  if (n === 1) { T.answer("0"); return "0"; }',
        '  var d1 = {}, d2 = {}, q1 = [1], q2 = [n], step = 0;',
        '  d1[1] = 0; d2[n] = 0;',
        '  S.dist = dis.slice(1);',
        '  T.step(S, "从 1 与 " + n + " 两端同时开始 BFS");',
        '  while (q1.length && q2.length) {',
        '    if (q1.length > q2.length) { var tq = q1; q1 = q2; q2 = tq; var td = d1; d1 = d2; d2 = td; }',
        '    var layer = q1.length;',
        '    while (layer--) {',
        '      var x = q1.shift();',
        '      S.cur = x; S.queue = q1.slice();',
        '      for (i = 0; i < g[x].length; i++) {',
        '        var y = g[x][i];',
        '        if (d1[y] !== undefined) continue;',
        '        d1[y] = d1[x] + 1;',
        '        if (d2[y] !== undefined) { ans = d1[y] + d2[y]; S.ans = ans; S.cur = y; T.step(S, "两端在点 " + y + " 相遇，最短路 = " + ans); T.answer(String(ans)); return String(ans); }',
        '        q1.push(y);',
        '        for (var k = 1; k <= n; k++) dis[k] = (d1[k] !== undefined ? d1[k] : (d2[k] !== undefined ? d2[k] : -1));',
        '        S.dist = dis.slice(1);',
        '        T.step(S, "扩展 " + x + " → " + y + "，距离 " + d1[y]);',
        '      }',
        '    }',
        '  }',
        '  T.answer(String(ans));',
        '  return String(ans);',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), m = tk.int();',
        '  var g = [], i;',
        '  for (i = 0; i <= n; i++) g.push([]);',
        '  var edges = [];',
        '  for (i = 0; i < m; i++) { var u = tk.int(), v = tk.int(); g[u].push(v); g[v].push(u); edges.push([u, v]); }',
        '  var dis = []; for (i = 0; i <= n; i++) dis.push(-1);',
        '  var S = { n: n, edges: edges, dist: dis.slice(1), cur: 0, ans: -1, queue: [] };',
        '  T.step(S, "建图完成");',
        '  // TODO: 分别从 1 和 n 开始 BFS，用两个距离数组 d1 / d2',
        '  // TODO: 每次挑队列较短的一端扩展一层；发现某点同时被两端访问到时，答案为 d1[y]+d2[y]',
        '  var ans = -1;',
        '  T.answer(String(ans));',
        '  return String(ans);',
        '}'
      ].join('\n'),
      pseudo: ['q1 ← {1}, q2 ← {n}', 'while 两端队列都非空', '  优先扩展较短的一端', '  扩展一层，遇到另一端访问过的点 y', '    答案 = d1[y] + d2[y]'],
      gen: 'function(r){ var n = 2 + Math.floor(Math.random()*5); var es = []; for (var i=1;i<n;i++) es.push([i, i+1]); var m = es.length; return n + " " + m + "\\n" + es.map(function(e){return e[0]+" "+e[1];}).join("\\n"); }'
    },
    tips: ['每次优先扩展队列较短的一端，双向 BFS 的效率才体现得出来', '两端距离相加时不要重复计算相遇点本身', 'n = 1 时答案是 0，要特判']
  });

  /* ---------------------------------------------------------------- p67 --- */
  window.CSP.problems.push({
    id: 'p67', no: 67, title: '迭代加深求最少操作', diff: 4, tier: '提高+',
    knowledge: ['search.itdeep', 'search.dfs'],
    limits: { time: '1s', memory: '128MB' },
    statement: '给定整数 a 与 b，每次操作可以把当前数 x 变成 x + 1、x - 1 或 2x。\n求把 a 变成 b 所需要的最少操作次数。\n数据保证答案不超过 20。',
    inputFormat: '一行两个整数 a, b（0 ≤ a, b ≤ 10^6）。',
    outputFormat: '一个整数，表示最少操作次数。',
    samples: [{ input: '3 10', output: '3', explain: '3 → 4（+1）→ 5（+1）→ 10（×2），共 3 步。' }],
    tests: [
      { input: '3 10\n', output: '3', score: 20 },
      { input: '1 1\n', output: '0', score: 20 },
      { input: '1 8\n', output: '3', score: 20 },
      { input: '5 6\n', output: '1', score: 20 },
      { input: '0 5\n', output: '4', score: 20 }
    ],
    std: {
      code: '#include <bits/stdc++.h>\nusing namespace std;\nint a,b,lim;bool ok;\nvoid dfs(long long x,int dep){\n if(ok)return;\n if(x==b){ok=true;return;}\n if(dep>=lim)return;\n dfs(x+1,dep+1);        if(ok)return;\n dfs(x*2,dep+1);        if(ok)return;\n if(x>0)dfs(x-1,dep+1);\n}\nint main(){cin>>a>>b;if(a==b){cout<<0<<endl;return 0;}for(lim=1;lim<=20;lim++){ok=false;dfs(a,0);if(ok){cout<<lim<<endl;return 0;}}return 0;}'
    },
    algo: {
      title: '迭代加深：逐步放宽步数上限，第一次搜到即为最优',
      viz: { input: '3 10', type: 'array', mainKey: 'path', pointers: [], highlight: [], title: '搜索路径' },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var a = tk.int(), b = tk.int();',
        '  var found = -1, lim;',
        '  var S = { a: a, b: b, lim: 0, depth: 0, cur: a, path: [a], ans: -1 };',
        '  T.step(S, "把 " + a + " 变成 " + b);',
        '  function dfs(x, dep, path) {',
        '    if (found >= 0) return;',
        '    S.depth = dep; S.cur = x; S.path = path.slice(); S.lim = lim;',
        '    T.step(S, "深度上限 " + lim + "，当前 " + x + "（已用 " + dep + " 步）");',
        '    if (x === b) { found = dep; S.ans = dep; T.step(S, "到达目标，需要 " + dep + " 步"); return; }',
        '    if (dep >= lim) return;',
        '    dfs(x + 1, dep + 1, path.concat([x + 1]));',
        '    if (found >= 0) return;',
        '    dfs(x * 2, dep + 1, path.concat([x * 2]));',
        '    if (found >= 0) return;',
        '    if (x - 1 >= 0) dfs(x - 1, dep + 1, path.concat([x - 1]));',
        '  }',
        '  for (lim = 0; lim <= 20 && found < 0; lim++) dfs(a, 0, [a]);',
        '  T.answer(String(found < 0 ? -1 : found));',
        '  return String(found < 0 ? -1 : found);',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var a = tk.int(), b = tk.int();',
        '  var found = -1, lim;',
        '  var S = { a: a, b: b, lim: 0, depth: 0, cur: a, path: [a], ans: -1 };',
        '  T.step(S, "把 " + a + " 变成 " + b);',
        '  function dfs(x, dep, path) {',
        '    // TODO: 到达 b 就记录答案；dep 达到 lim 就剪枝返回',
        '    // TODO: 依次尝试 x+1、x*2、x-1 三种操作，每一步调用 T.step',
        '  }',
        '  // TODO: 从 lim = 0 开始逐层放宽上限（迭代加深），找到即最优',
        '  for (lim = 0; lim <= 20 && found < 0; lim++) dfs(a, 0, [a]);',
        '  T.answer(String(found < 0 ? -1 : found));',
        '  return String(found < 0 ? -1 : found);',
        '}'
      ].join('\n'),
      pseudo: ['for lim ← 0 to 20', '  从 a 出发 DFS，深度不超过 lim', '  一旦到达 b，答案 = lim（当前深度）'],
      gen: 'function(r){ var a = Math.floor(Math.random()*4); var b = a + 1 + Math.floor(Math.random()*7); return a + " " + b; }'
    },
    tips: ['迭代加深适合「搜索树很深但答案很浅」的问题：既省空间（DFS）又能保证最优（逐层放宽）', '每轮都要清空「是否找到」的状态，否则会提前退出']
  });

  /* ---------------------------------------------------------------- p68 --- */
  window.CSP.problems.push({
    id: 'p68', no: 68, title: '折半搜索计数', diff: 4, tier: '提高+',
    knowledge: ['search.meet', 'basic.enumerate'],
    limits: { time: '1s', memory: '128MB' },
    statement: '给定 n 个整数和一个目标值 S，求有多少个子集（可以为空集）的元素之和恰好等于 S。\n当 n 较大时，直接枚举 2^n 个子集不可行，可以把集合分成两半分别枚举再合并（折半搜索，meet in the middle）。',
    inputFormat: '第一行两个整数 n, S（1 ≤ n ≤ 34，0 ≤ S ≤ 10^9）。\n第二行 n 个整数 a_i（0 ≤ a_i ≤ 10^6）。',
    outputFormat: '一个整数，表示和为 S 的子集个数（结果保证在 64 位整数范围内）。',
    samples: [{ input: '4 5\n1 2 3 4', output: '2', explain: '1+4 = 5，2+3 = 5，共 2 个子集。' }],
    tests: [
      { input: '4 5\n1 2 3 4\n', output: '2', score: 20 },
      { input: '1 0\n0\n', output: '2', score: 20 },
      { input: '3 100\n1 2 3\n', output: '0', score: 20 },
      { input: '5 6\n1 2 3 4 5\n', output: '3', score: 20 },
      { input: '6 10\n1 2 3 4 5 6\n', output: '5', score: 20 }
    ],
    std: {
      code: '#include <bits/stdc++.h>\nusing namespace std;\nint main(){int n;long long S;cin>>n>>S;vector<long long>a(n);for(auto&x:a)cin>>x;\nint h=n/2;vector<long long>A,B;\nfor(int m=0;m<(1<<h);m++){long long s=0;for(int i=0;i<h;i++)if(m>>i&1)s+=a[i];A.push_back(s);}\nint n2=n-h;for(int m=0;m<(1<<n2);m++){long long s=0;for(int i=0;i<n2;i++)if(m>>i&1)s+=a[h+i];B.push_back(s);}\nsort(B.begin(),B.end());long long ans=0;\nfor(long long x:A){long long need=S-x;ans+=upper_bound(B.begin(),B.end(),need)-lower_bound(B.begin(),B.end(),need);}\ncout<<ans<<endl;return 0;}'
    },
    algo: {
      title: '折半搜索：前半枚举 + 后半排序 + 二分配对',
      viz: { input: '4 5\n1 2 3 4', type: 'array', mainKey: 'sumsB', pointers: [], highlight: ['hi'], title: '右半部分子集和' },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), S = tk.int();',
        '  var a = tk.ints(n);',
        '  var h = Math.floor(n / 2);',
        '  var S1 = { n: n, target: S, half: h, a: a, left: [], sumsB: [], hi: -1, lo: -1, ans: 0 };',
        '  T.step(S1, "目标 " + S + "，拆成前 " + h + " 个和后 " + (n - h) + " 个");',
        '  function enumSums(arr, base) {',
        '    var sums = [], m, i, s;',
        '    for (m = 0; m < (1 << arr.length); m++) {',
        '      s = 0;',
        '      for (i = 0; i < arr.length; i++) if ((m >> i) & 1) s += arr[i];',
        '      sums.push(s);',
        '    }',
        '    return sums;',
        '  }',
        '  var A = enumSums(a.slice(0, h), 0);',
        '  var B = enumSums(a.slice(h), h);',
        '  B.sort(function (x, y) { return x - y; });',
        '  S1.left = A; S1.sumsB = B.slice();',
        '  T.step(S1, "前半得到 " + A.length + " 个子集和，后半 " + B.length + " 个并已排序");',
        '  var ans = 0;',
        '  for (var k = 0; k < A.length; k++) {',
        '    var need = S - A[k];',
        '    var lo = 0, hi = B.length, mid;',
        '    while (lo < hi) { mid = (lo + hi) >> 1; if (B[mid] < need) lo = mid + 1; else hi = mid; }',
        '    var l = lo;',
        '    lo = 0; hi = B.length;',
        '    while (lo < hi) { mid = (lo + hi) >> 1; if (B[mid] <= need) lo = mid + 1; else hi = mid; }',
        '    var r = lo;',
        '    S1.hi = r - 1; S1.lo = l; S1.ans = ans + (r - l);',
        '    T.step(S1, "左半和 " + A[k] + "，需要在右半找 " + need + "，命中 " + (r - l) + " 个");',
        '    ans += (r - l);',
        '  }',
        '  S1.ans = ans;',
        '  T.step(S1, "总计 " + ans + " 个子集");',
        '  T.answer(String(ans));',
        '  return String(ans);',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), S = tk.int();',
        '  var a = tk.ints(n);',
        '  var h = Math.floor(n / 2);',
        '  var st = { n: n, target: S, half: h, a: a, left: [], sumsB: [], hi: -1, lo: -1, ans: 0 };',
        '  T.step(st, "开始折半搜索");',
        '  // TODO: 枚举前半所有子集和 A，后半所有子集和 B',
        '  // TODO: 把 B 排序，然后对每个 A[k] 用二分统计 B 中等于 S-A[k] 的个数',
        '  var ans = 0;',
        '  st.ans = ans;',
        '  T.answer(String(ans));',
        '  return String(ans);',
        '}'
      ].join('\n'),
      pseudo: ['A ← 前半所有子集和', 'B ← 后半所有子集和，并排序', 'ans ← 0', 'for x in A', '  ans += count(B == S - x)  // 二分'],
      gen: 'function(r){ var n = 2 + Math.floor(Math.random()*6); var a = []; for (var i=0;i<n;i++) a.push(1+Math.floor(Math.random()*5)); var S = 3 + Math.floor(Math.random()*8); return n + " " + S + "\\n" + a.join(" "); }'
    },
    tips: ['空集也算一个子集：n=1 且 a_1=0、S=0 时答案是 2', '后半枚举结果一定要排序后才能二分；用 lower_bound/upper_bound 同时定位左右端点']
  });

  /* ---------------------------------------------------------------- p69 --- */
  window.CSP.problems.push({
    id: 'p69', no: 69, title: '分块维护区间和', diff: 4, tier: '提高+',
    knowledge: ['ds.blocksqrt', 'basic.prefix'],
    limits: { time: '1s', memory: '128MB' },
    statement: '给定 n 个整数，支持两种操作：\n- `1 x v`：把第 x 个数修改为 v；\n- `2 l r`：询问区间 [l, r] 的元素之和。\n请用「分块」（把序列切成若干块，每块维护块内和）实现。',
    inputFormat: '第一行两个整数 n, q（1 ≤ n, q ≤ 1000）。\n第二行 n 个整数。\n接下来 q 行，每行一个操作。',
    outputFormat: '对每个操作 2 输出一行，表示区间和。',
    samples: [{ input: '5 4\n1 2 3 4 5\n2 1 5\n1 3 10\n2 2 4\n2 3 3', output: '15\n16\n10', explain: '初始 1..5 和为 15；把第 3 个改为 10 后，[2,4] 的和是 2+10+4 = 16，[3,3] 是 10。' }],
    tests: [
      { input: '5 4\n1 2 3 4 5\n2 1 5\n1 3 10\n2 2 4\n2 3 3\n', output: '15\n16\n10', score: 20 },
      { input: '1 2\n7\n2 1 1\n1 1 3\n', output: '7', score: 20 },
      { input: '4 3\n1 1 1 1\n2 1 4\n1 2 5\n2 1 4\n', output: '4\n8', score: 20 },
      { input: '6 2\n2 4 6 8 10 12\n2 2 5\n2 1 6\n', output: '28\n42', score: 20 },
      { input: '3 3\n0 0 0\n2 1 3\n1 2 9\n2 2 2\n', output: '0\n9', score: 20 }
    ],
    std: {
      code: '#include <bits/stdc++.h>\nusing namespace std;\nint a[1005],bl[1005],bs;\nlong long sumb[1005];\nint main(){int n,q;cin>>n>>q;bs=(int)sqrt(n)+1;for(int i=1;i<=n;i++){cin>>a[i];bl[i]=(i-1)/bs+1;sumb[bl[i]]+=a[i];}\nwhile(q--){int op;cin>>op;if(op==1){int x;long long v;cin>>x>>v;sumb[bl[x]]+=v-a[x];a[x]=v;}else{int l,r;cin>>l>>r;long long s=0;if(bl[l]==bl[r]){for(int i=l;i<=r;i++)s+=a[i];}else{for(int i=l;i<=bl[l]*bs;i++)s+=a[i];for(int b=bl[l]+1;b<=bl[r]-1;b++)s+=sumb[b];for(int i=(bl[r]-1)*bs+1;i<=r;i++)s+=a[i];}cout<<s<<endl;}}\nreturn 0;}'
    },
    algo: {
      title: '分块：整块直接用块和，零散元素暴力累加',
      viz: { input: '5 4\n1 2 3 4 5\n2 1 5\n1 3 10\n2 2 4\n2 3 3', type: 'array', mainKey: 'a', pointers: ['l', 'r'], highlight: [], title: '原数组（下标 0 起）' },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), q = tk.int();',
        '  var a = [0], i;',
        '  for (i = 1; i <= n; i++) a.push(tk.int());',
        '  var bs = Math.floor(Math.sqrt(n)) + 1;',
        '  var bl = [0], sumb = [];',
        '  for (i = 1; i <= n; i++) { bl[i] = Math.floor((i - 1) / bs) + 1; sumb[bl[i]] = (sumb[bl[i]] || 0) + a[i]; }',
        '  var S = { n: n, bs: bs, a: a.slice(1), blk: bl.slice(1), sumb: sumb.slice(), l: 0, r: 0, ans: 0, out: [] };',
        '  T.step(S, "分块完成：块长 " + bs + "，共 " + Math.max(1, Math.ceil(n / bs)) + " 块");',
        '  var out = [];',
        '  for (var qi = 0; qi < q; qi++) {',
        '    var op = tk.int();',
        '    if (op === 1) {',
        '      var x = tk.int(), v = tk.int();',
        '      sumb[bl[x]] += v - a[x];',
        '      a[x] = v;',
        '      S.a = a.slice(1); S.sumb = sumb.slice(); S.l = x - 1; S.r = x - 1;',
        '      T.step(S, "把第 " + x + " 个改为 " + v + "，同步更新第 " + bl[x] + " 块的块和");',
        '    } else {',
        '      var l = tk.int(), r = tk.int(), s = 0, b;',
        '      if (bl[l] === bl[r]) {',
        '        for (i = l; i <= r; i++) s += a[i];',
        '        S.l = l - 1; S.r = r - 1; S.ans = s;',
        '        T.step(S, "同一块内暴力求和 [" + l + ", " + r + "] = " + s);',
        '      } else {',
        '        for (i = l; i <= bl[l] * bs; i++) s += a[i];',
        '        S.l = l - 1; S.r = bl[l] * bs - 1; S.ans = s;',
        '        T.step(S, "左零散部分 [" + l + ", " + (bl[l] * bs) + "] 累加 = " + s);',
        '        for (b = bl[l] + 1; b <= bl[r] - 1; b++) s += sumb[b];',
        '        S.l = bl[l] * bs; S.r = (bl[r] - 1) * bs - 1; S.ans = s;',
        '        T.step(S, "中间整块直接加块和，累计 = " + s);',
        '        for (i = (bl[r] - 1) * bs + 1; i <= r; i++) s += a[i];',
        '        S.l = (bl[r] - 1) * bs; S.r = r - 1; S.ans = s;',
        '        T.step(S, "右零散部分 [" + ((bl[r] - 1) * bs + 1) + ", " + r + "] 累加 = " + s);',
        '      }',
        '      out.push(s);',
        '      S.out = out.slice();',
        '    }',
        '  }',
        '  T.answer(out.join("\\n"));',
        '  return out.join("\\n");',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), q = tk.int();',
        '  var a = [0], i;',
        '  for (i = 1; i <= n; i++) a.push(tk.int());',
        '  var bs = Math.floor(Math.sqrt(n)) + 1;',
        '  var bl = [0], sumb = [];',
        '  for (i = 1; i <= n; i++) { bl[i] = Math.floor((i - 1) / bs) + 1; sumb[bl[i]] = (sumb[bl[i]] || 0) + a[i]; }',
        '  var S = { n: n, bs: bs, a: a.slice(1), blk: bl.slice(1), sumb: sumb.slice(), l: 0, r: 0, ans: 0, out: [] };',
        '  T.step(S, "分块完成");',
        '  var out = [];',
        '  for (var qi = 0; qi < q; qi++) {',
        '    var op = tk.int();',
        '    if (op === 1) {',
        '      var x = tk.int(), v = tk.int();',
        '      // TODO: 修改 a[x]，并且只更新它所在块的块和 sumb',
        '    } else {',
        '      var l = tk.int(), r = tk.int(), s = 0;',
        '      // TODO: 同块暴力；跨块 = 左零散 + 中间整块（用 sumb）+ 右零散',
        '      out.push(s);',
        '    }',
        '  }',
        '  T.answer(out.join("\\n"));',
        '  return out.join("\\n");',
        '}'
      ].join('\n'),
      pseudo: ['bs ← sqrt(n)', 'block(i) ← (i-1)/bs + 1', '查询 [l,r]：', '  同块 → 暴力累加', '  跨块 → 左零散 + 中间 sumb 求和 + 右零散'],
      gen: 'function(r){ var n = 3 + Math.floor(Math.random()*5); var a = []; for (var i=0;i<n;i++) a.push(Math.floor(Math.random()*6)); var qs = ["2 1 " + n]; var m = 1 + Math.floor(Math.random()*2); for (var k=0;k<m;k++) qs.push("1 " + (1+Math.floor(Math.random()*n)) + " " + Math.floor(Math.random()*6)); qs.push("2 1 " + n); return n + " " + qs.length + "\\n" + a.join(" ") + "\\n" + qs.join("\\n"); }'
    },
    tips: ['块长取 sqrt(n) 时，单次修改 O(1)、单次查询 O(sqrt(n))', '跨块查询时不要把两端的整块算重：中间块是 bl[l]+1 到 bl[r]-1', '修改时要同步维护块和，否则后续整块累加会错']
  });
})();
