/* ============================================================================
 * CSP-S 2026 第二轮 · 动态规划题组 (problems-D.js) — p28 ~ p35
 * ----------------------------------------------------------------------------
 * 本文件包含 8 道动态规划题目，每题都同时提供：
 *   std.code       参考 C++17 程序（评测/验证用）
 *   algo.ref       JS 追踪版参考实现（输出与 C++ 完全一致）
 *   algo.userTemplate  挖空的起步代码
 *   algo.viz       可视化描述
 *   algo.gen       随机数据生成器（对拍用）
 *
 * 依赖：window.CSP.problems（数组），知识点 id 取自 js/data/syllabus.js
 * ==========================================================================*/
(function () {
  'use strict';
  window.CSP = window.CSP || {};
  window.CSP.problems = window.CSP.problems || [];

  /* ==========================================================================
   * p28 数字三角形（线性 DP）
   * ========================================================================*/
  window.CSP.problems.push({
    id: 'p28', no: 28, title: '数字三角形', diff: 2, tier: '普及-',
    knowledge: ['dp.linear'],
    limits: { time: '1s', memory: '128MB' },
    statement: '给定一个 n 行的数字三角形，第 i 行有 i 个整数。\n' +
      '从三角形顶部出发，每一步只能走向下一行的「正下方」或「右下方」，一直走到最底行。\n' +
      '求所有路径中，经过的数字之和的最大值。\n' +
      '- 路径的长度固定为 n，恰好经过每行的一个数。\n' +
      '- 数字可以是负数，此时也要老老实实选一条最优路径。',
    inputFormat: '第一行一个整数 n（1 ≤ n ≤ 1000）。\n' +
      '接下来 n 行，第 i 行有 i 个整数，表示三角形第 i 行从左到右的数字（|数字| ≤ 10^4）。',
    outputFormat: '一行一个整数，表示从顶到底的最大数字和。',
    samples: [
      {
        input: '5\n7\n3 8\n8 1 0\n2 7 4 4\n4 5 2 6 5',
        output: '30',
        explain: '路径 7 → 3 → 8 → 7 → 5，和为 30'
      }
    ],
    tests: [
      { input: '5\n7\n3 8\n8 1 0\n2 7 4 4\n4 5 2 6 5\n', output: '30', score: 20 },
      { input: '1\n5\n', output: '5', score: 20 },
      { input: '3\n-1\n-2 -3\n-4 -5 -6\n', output: '-7', score: 20 },
      {
        input: '10\n-7\n-7 8\n-6 -14 19\n7 12 -3 0\n7 16 12 17 2\n-19 8 16 9 1 -10\n-19 9 -16 14 11 8 -13\n14 -11 -11 1 4 16 -19 -10\n15 4 1 19 19 18 20 11 8\n7 -18 5 5 -8 13 1 -13 13 0\n',
        output: '104', score: 20
      },
      {
        input: '17\n23\n86 74\n76 55 41\n75 92 56 68\n2 76 13 73 4\n65 58 20 87 10 52\n9 73 11 9 47 76 80\n13 75 96 30 1 52 91 80\n26 18 71 22 10 73 23 2 48\n45 59 0 40 55 45 16 49 75 67\n94 12 50 19 40 59 35 39 28 12 51\n18 82 69 82 54 85 97 53 48 67 89 58\n30 48 56 47 86 52 62 72 29 26 25 51 10\n9 36 20 79 57 67 60 47 0 88 31 94 99 94\n43 26 28 11 49 98 94 58 53 26 73 50 40 66 21\n92 88 47 3 98 33 62 25 11 64 74 76 48 96 84 26\n62 36 57 12 3 40 22 19 38 37 85 54 36 51 13 42 47\n',
        output: '1134', score: 20
      }
    ],
    std: {
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main(){',
        '    int n;',
        '    if(!(cin>>n)) return 0;',
        '    vector<vector<long long>> a(n, vector<long long>(n, 0));',
        '    for(int i=0;i<n;i++) for(int j=0;j<=i;j++) cin>>a[i][j];',
        '    vector<vector<long long>> dp(n, vector<long long>(n, 0));',
        '    for(int j=0;j<n;j++) dp[n-1][j]=a[n-1][j];',
        '    for(int i=n-2;i>=0;i--)',
        '        for(int j=0;j<=i;j++)',
        '            dp[i][j]=a[i][j]+max(dp[i+1][j], dp[i+1][j+1]);',
        '    cout<<dp[0][0]<<endl;',
        '    return 0;',
        '}'
      ].join('\n')
    },
    algo: {
      title: '自底向上的线性 DP（dp 表示从该格到底部的最大和）',
      viz: {
        input: '4\n1\n2 3\n4 5 6\n7 8 9 10\n',
        type: 'matrix', mainKey: 'dp', highlight: ['i', 'j'],
        title: '数字三角形 dp 表'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), i, j;',
        '  var a = [];',
        '  for (i = 0; i < n; i++) { var row = []; for (j = 0; j <= i; j++) row.push(tk.int()); a.push(row); }',
        '  var dp = [];',
        '  for (i = 0; i < n; i++) { var r = []; for (j = 0; j < n; j++) r.push(0); dp.push(r); }',
        '  var S = { n: n, a: a, dp: dp, i: n - 1, j: 0, ans: 0 };',
        '  for (j = 0; j < n; j++) dp[n - 1][j] = a[n - 1][j];',
        '  T.step(S, "最后一行作为 DP 边界：dp = 数字本身");',
        '  for (i = n - 2; i >= 0; i--) {',
        '    S.i = i;',
        '    for (j = 0; j <= i; j++) {',
        '      S.j = j;',
        '      dp[i][j] = a[i][j] + Math.max(dp[i + 1][j], dp[i + 1][j + 1]);',
        '      T.step(S, "dp[" + i + "][" + j + "] = " + a[i][j] + " + max(" + dp[i + 1][j] + ", " + dp[i + 1][j + 1] + ")");',
        '    }',
        '  }',
        '  S.ans = dp[0][0];',
        '  T.answer(String(S.ans));',
        '  return String(S.ans);',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), i, j;',
        '  var a = [];',
        '  for (i = 0; i < n; i++) { var row = []; for (j = 0; j <= i; j++) row.push(tk.int()); a.push(row); }',
        '  var dp = [];',
        '  for (i = 0; i < n; i++) { var r = []; for (j = 0; j < n; j++) r.push(0); dp.push(r); }',
        '  var S = { n: n, a: a, dp: dp, i: n - 1, j: 0, ans: 0 };',
        '  // TODO: 定义状态 dp[i][j] = 从 (i,j) 走到最底行的最大数字和',
        '  // 转移：dp[i][j] = a[i][j] + max(dp[i+1][j], dp[i+1][j+1])，边界是最底行',
        '  // 提示：参考 algo.ref，每个格子填完后都要 T.step(S, note)',
        '  T.answer(String(S.ans));',
        '  return String(S.ans);',
        '}'
      ].join('\n'),
      pseudo: [
        'for j ← 0 to n-1: dp[n-1][j] ← a[n-1][j]',
        'for i ← n-2 downto 0',
        '  for j ← 0 to i',
        '    dp[i][j] ← a[i][j] + max(dp[i+1][j], dp[i+1][j+1])',
        'answer ← dp[0][0]'
      ],
      gen: 'function(r){ var n = 2 + Math.floor(Math.random()*6), s = n + "\\n"; for (var i = 0; i < n; i++) { var row = []; for (var j = 0; j <= i; j++) row.push(Math.floor(Math.random()*21) - 10); s += row.join(" ") + "\\n"; } return s; }'
    },
    tips: [
      '状态定义「从 (i,j) 到底部的最大和」是自底向上的，比自顶向下少处理一层边界',
      'n=1 时要能直接输出唯一的数字，别让循环写越界',
      '数字可能是负数，初值千万不要无脑设成 0'
    ]
  });

  /* ==========================================================================
   * p29 01 背包
   * ========================================================================*/
  window.CSP.problems.push({
    id: 'p29', no: 29, title: '01 背包', diff: 3, tier: '普及+',
    knowledge: ['dp.knapsack'],
    limits: { time: '1s', memory: '128MB' },
    statement: '有一个容量为 V 的背包和 n 件物品。第 i 件物品的重量是 w_i，价值是 v_i。\n' +
      '每件物品**最多只能选一次**（选或不选）。\n' +
      '在总重量不超过背包容量的前提下，求能获得的最大总价值。\n' +
      '- 物品不能拆分，只能整件拿走。',
    inputFormat: '第一行两个整数 n, V（1 ≤ n ≤ 100，1 ≤ V ≤ 1000）。\n' +
      '接下来 n 行，每行两个整数 w_i, v_i（1 ≤ w_i ≤ 1000，0 ≤ v_i ≤ 10^4）。',
    outputFormat: '一行一个整数，表示最大总价值。',
    samples: [
      {
        input: '4 5\n2 3\n3 4\n4 5\n5 6',
        output: '7',
        explain: '选第 1、2 件物品：重量 2 + 3 = 5，价值 3 + 4 = 7'
      }
    ],
    tests: [
      { input: '4 5\n2 3\n3 4\n4 5\n5 6\n', output: '7', score: 20 },
      { input: '3 3\n5 100\n1 7\n2 9\n', output: '16', score: 20 },
      { input: '3 6\n4 5\n3 4\n2 3\n', output: '8', score: 20 },
      {
        input: '12 18\n4 16\n8 3\n5 15\n2 10\n8 9\n5 2\n5 2\n6 4\n2 13\n8 3\n1 27\n4 11\n',
        output: '92', score: 20
      },
      {
        input: '16 25\n9 22\n4 34\n9 30\n8 11\n11 9\n3 24\n6 32\n4 39\n12 40\n7 49\n9 30\n3 29\n9 6\n4 20\n5 39\n8 39\n',
        output: '197', score: 20
      }
    ],
    std: {
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main(){',
        '    int n, V;',
        '    if(!(cin>>n>>V)) return 0;',
        '    vector<int> w(n+1, 0), v(n+1, 0);',
        '    for(int i=1;i<=n;i++) cin>>w[i]>>v[i];',
        '    vector<vector<int>> dp(n+1, vector<int>(V+1, 0));',
        '    for(int i=1;i<=n;i++)',
        '        for(int j=0;j<=V;j++){',
        '            dp[i][j]=dp[i-1][j];',
        '            if(j>=w[i]) dp[i][j]=max(dp[i][j], dp[i-1][j-w[i]]+v[i]);',
        '        }',
        '    cout<<dp[n][V]<<endl;',
        '    return 0;',
        '}'
      ].join('\n')
    },
    algo: {
      title: '二维 01 背包：dp[i][j] 表示前 i 件物品、容量 j 的最大价值',
      viz: {
        input: '4 5\n2 3\n3 4\n4 5\n5 6\n',
        type: 'matrix', mainKey: 'dp', highlight: ['i', 'j'],
        title: '01 背包 dp 表'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), V = tk.int(), i, j;',
        '  var w = [], v = [];',
        '  for (i = 1; i <= n; i++) { w[i] = tk.int(); v[i] = tk.int(); }',
        '  var dp = [];',
        '  for (i = 0; i <= n; i++) { var r = []; for (j = 0; j <= V; j++) r.push(0); dp.push(r); }',
        '  var S = { n: n, V: V, w: w, v: v, dp: dp, i: 0, j: 0, ans: 0 };',
        '  T.step(S, "边界：一件物品都不选时价值为 0");',
        '  for (i = 1; i <= n; i++) {',
        '    S.i = i;',
        '    for (j = 0; j <= V; j++) {',
        '      S.j = j;',
        '      var best = dp[i - 1][j];',
        '      if (j >= w[i] && dp[i - 1][j - w[i]] + v[i] > best) best = dp[i - 1][j - w[i]] + v[i];',
        '      dp[i][j] = best;',
        '      T.step(S, "物品" + i + " 容量" + j + "：dp = " + best);',
        '    }',
        '  }',
        '  S.ans = dp[n][V];',
        '  T.answer(String(S.ans));',
        '  return String(S.ans);',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), V = tk.int(), i, j;',
        '  var w = [], v = [];',
        '  for (i = 1; i <= n; i++) { w[i] = tk.int(); v[i] = tk.int(); }',
        '  var dp = [];',
        '  for (i = 0; i <= n; i++) { var r = []; for (j = 0; j <= V; j++) r.push(0); dp.push(r); }',
        '  var S = { n: n, V: V, w: w, v: v, dp: dp, i: 0, j: 0, ans: 0 };',
        '  // TODO: dp[i][j] = 只考虑前 i 件物品、容量为 j 时的最大价值',
        '  // 转移：不选第 i 件 dp[i-1][j]；选第 i 件 dp[i-1][j-w[i]] + v[i]（要求 j >= w[i]）',
        '  // 提示：参考 algo.ref，每填一格都要 T.step(S, note)',
        '  T.answer(String(S.ans));',
        '  return String(S.ans);',
        '}'
      ].join('\n'),
      pseudo: [
        'dp[0][j] ← 0',
        'for i ← 1 to n',
        '  for j ← 0 to V',
        '    dp[i][j] ← dp[i-1][j]',
        '    if j ≥ w[i] then dp[i][j] ← max(dp[i][j], dp[i-1][j-w[i]] + v[i])',
        'answer ← dp[n][V]'
      ],
      gen: 'function(r){ var n = 1 + Math.floor(Math.random()*8), V = 1 + Math.floor(Math.random()*15), s = n + " " + V + "\\n"; for (var i = 0; i < n; i++) s += (1 + Math.floor(Math.random()*8)) + " " + (1 + Math.floor(Math.random()*30)) + "\\n"; return s; }'
    },
    tips: [
      '注意区分「01 背包」与「完全背包」：这里每件物品只能用一次，所以转移来自 i-1 行',
      '维度是 (n+1) × (V+1)，第 0 行/列是空物品、容量 0 的边界',
      'w_i 可能大于 V，此时必须跳过这件物品而不是越界访问'
    ]
  });

  /* ==========================================================================
   * p30 完全背包 · 零钱兑换
   * ========================================================================*/
  window.CSP.problems.push({
    id: 'p30', no: 30, title: '零钱兑换', diff: 3, tier: '普及+',
    knowledge: ['dp.knapsack'],
    limits: { time: '1s', memory: '128MB' },
    statement: '有 n 种面值的硬币，第 i 种面值为 c_i，**每种硬币都有无限多枚**。\n' +
      '现在要凑出恰好 M 的金额，问最少需要多少枚硬币。\n' +
      '如果无论怎么凑都凑不出来，输出 -1。\n' +
      '- 这是完全背包模型：每种物品（硬币）可以取任意多件。',
    inputFormat: '第一行两个整数 n, M（1 ≤ n ≤ 100，1 ≤ M ≤ 10000）。\n' +
      '第二行 n 个整数 c_i，表示硬币面值（1 ≤ c_i ≤ 10000）。',
    outputFormat: '一行一个整数：最少硬币枚数；无法凑出输出 -1。',
    samples: [
      { input: '3 11\n1 2 5', output: '3', explain: '11 = 5 + 5 + 1，共 3 枚' }
    ],
    tests: [
      { input: '3 11\n1 2 5\n', output: '3', score: 20 },
      { input: '2 7\n3 5\n', output: '-1', score: 20 },
      { input: '1 1\n2\n', output: '-1', score: 20 },
      { input: '3 27\n1 5 7\n', output: '5', score: 20 },
      { input: '5 63\n5 7 9 8 8\n', output: '7', score: 20 }
    ],
    std: {
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main(){',
        '    int n, M;',
        '    if(!(cin>>n>>M)) return 0;',
        '    vector<int> c(n);',
        '    for(int i=0;i<n;i++) cin>>c[i];',
        '    const int INF = 1000000000;',
        '    vector<int> dp(M+1, INF);',
        '    dp[0]=0;',
        '    for(int i=0;i<n;i++)',
        '        for(int j=c[i]; j<=M; j++)',
        '            if(dp[j-c[i]] + 1 < dp[j]) dp[j] = dp[j-c[i]] + 1;',
        '    if(dp[M] >= INF) cout<<-1<<endl; else cout<<dp[M]<<endl;',
        '    return 0;',
        '}'
      ].join('\n')
    },
    algo: {
      title: '完全背包：一维 dp，容量从小到大枚举',
      viz: {
        input: '3 7\n1 3 4\n',
        type: 'array', mainKey: 'dp', highlight: ['j'],
        title: '凑出各金额的最少硬币数'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), M = tk.int(), i, j;',
        '  var c = [];',
        '  for (i = 0; i < n; i++) c.push(tk.int());',
        '  var INF = 1000000000;',
        '  var dp = [];',
        '  for (j = 0; j <= M; j++) dp.push(j === 0 ? 0 : INF);',
        '  var S = { n: n, M: M, c: c, dp: dp, i: 0, j: 0, ans: 0 };',
        '  T.step(S, "dp[0]=0（凑 0 元不用硬币），其余为无穷大");',
        '  for (i = 0; i < n; i++) {',
        '    S.i = i;',
        '    for (j = c[i]; j <= M; j++) {',
        '      S.j = j;',
        '      if (dp[j - c[i]] + 1 < dp[j]) dp[j] = dp[j - c[i]] + 1;',
        '      T.step(S, "面值 " + c[i] + "：凑 " + j + " 元最少 " + (dp[j] >= INF ? "∞" : dp[j]) + " 枚");',
        '    }',
        '  }',
        '  S.ans = dp[M] >= INF ? -1 : dp[M];',
        '  T.answer(String(S.ans));',
        '  return String(S.ans);',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), M = tk.int(), i, j;',
        '  var c = [];',
        '  for (i = 0; i < n; i++) c.push(tk.int());',
        '  var INF = 1000000000;',
        '  var dp = [];',
        '  for (j = 0; j <= M; j++) dp.push(j === 0 ? 0 : INF);',
        '  var S = { n: n, M: M, c: c, dp: dp, i: 0, j: 0, ans: 0 };',
        '  // TODO: dp[j] = 凑出金额 j 所需的最少硬币数',
        '  // 完全背包要正序枚举容量：dp[j] = min(dp[j], dp[j - c[i]] + 1)',
        '  // 提示：参考 algo.ref，每更新一格都要 T.step(S, note)',
        '  T.answer(String(S.ans));',
        '  return String(S.ans);',
        '}'
      ].join('\n'),
      pseudo: [
        'dp[0] ← 0, dp[j>0] ← ∞',
        'for each coin c',
        '  for j ← c to M',
        '    dp[j] ← min(dp[j], dp[j-c] + 1)',
        'answer ← dp[M] = ∞ ? -1 : dp[M]'
      ],
      gen: 'function(r){ var n = 1 + Math.floor(Math.random()*4), M = 1 + Math.floor(Math.random()*40), c = []; for (var i = 0; i < n; i++) c.push(1 + Math.floor(Math.random()*9)); return n + " " + M + "\\n" + c.join(" ") + "\\n"; }'
    },
    tips: [
      '完全背包与 01 背包的唯一区别：容量 j 是**正序**枚举，这样同一种硬币可以重复使用',
      'dp 初值必须设成「无穷大」而不是 0，否则最小值会被空方案污染',
      '面值可能比 M 大，此时该硬币的循环体一次都不执行，不会越界'
    ]
  });

  /* ==========================================================================
   * p31 最长上升子序列 LIS
   * ========================================================================*/
  window.CSP.problems.push({
    id: 'p31', no: 31, title: '最长上升子序列', diff: 3, tier: '普及+',
    knowledge: ['dp.lis'],
    limits: { time: '1s', memory: '128MB' },
    statement: '给定一个长度为 n 的整数序列 a_1, a_2, …, a_n。\n' +
      '请找出最长的**严格上升**子序列的长度。\n' +
      '子序列指的是从原序列中删除若干元素（可以不删）后，剩下的元素保持原顺序得到的序列。\n' +
      '- 严格上升：后一个数必须**大于**前一个数。',
    inputFormat: '第一行一个整数 n（1 ≤ n ≤ 1000）。\n' +
      '第二行 n 个整数 a_i（|a_i| ≤ 10^9）。',
    outputFormat: '一行一个整数，表示最长上升子序列的长度。',
    samples: [
      {
        input: '8\n10 9 2 5 3 7 101 18',
        output: '4',
        explain: '2 → 3 → 7 → 101（或 2 → 5 → 7 → 101），长度为 4'
      }
    ],
    tests: [
      { input: '8\n10 9 2 5 3 7 101 18\n', output: '4', score: 20 },
      { input: '1\n5\n', output: '1', score: 20 },
      { input: '5\n5 4 3 2 1\n', output: '1', score: 20 },
      { input: '6\n1 2 3 4 5 6\n', output: '6', score: 20 },
      { input: '20\n6 10 2 7 2 7 4 5 7 11 2 5 10 4 9 4 2 6 3 3\n', output: '5', score: 20 }
    ],
    std: {
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main(){',
        '    int n;',
        '    if(!(cin>>n)) return 0;',
        '    vector<long long> a(n);',
        '    for(int i=0;i<n;i++) cin>>a[i];',
        '    vector<int> dp(n, 1);',
        '    int ans = 1;',
        '    for(int i=0;i<n;i++){',
        '        for(int j=0;j<i;j++)',
        '            if(a[j] < a[i] && dp[j] + 1 > dp[i]) dp[i] = dp[j] + 1;',
        '        if(dp[i] > ans) ans = dp[i];',
        '    }',
        '    cout<<ans<<endl;',
        '    return 0;',
        '}'
      ].join('\n')
    },
    algo: {
      title: 'O(n²) 线性 DP：dp[i] 表示以 a[i] 结尾的最长上升子序列长度',
      viz: {
        input: '6\n3 1 4 1 5 9\n',
        type: 'array', mainKey: 'dp', pointers: ['i', 'j'], highlight: ['i', 'j'],
        title: '各位置结尾的 LIS 长度'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), i, j;',
        '  var a = tk.ints(n);',
        '  var dp = [];',
        '  for (i = 0; i < n; i++) dp.push(1);',
        '  var S = { n: n, a: a, dp: dp, i: 0, j: 0, bestJ: -1, ans: 0 };',
        '  T.step(S, "初始：每个位置自己就是一个长度 1 的上升子序列");',
        '  for (i = 0; i < n; i++) {',
        '    S.i = i; S.bestJ = -1;',
        '    for (j = 0; j < i; j++) {',
        '      S.j = j;',
        '      if (a[j] < a[i] && dp[j] + 1 > dp[i]) { dp[i] = dp[j] + 1; S.bestJ = j; }',
        '      T.step(S, "a[" + j + "]=" + a[j] + " vs a[" + i + "]=" + a[i] + " → dp[" + i + "]=" + dp[i]);',
        '    }',
        '    T.step(S, "以 a[" + i + "]=" + a[i] + " 结尾的 LIS 长度 = " + dp[i]);',
        '  }',
        '  var ans = 0;',
        '  for (i = 0; i < n; i++) if (dp[i] > ans) ans = dp[i];',
        '  S.ans = ans;',
        '  T.answer(String(S.ans));',
        '  return String(S.ans);',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), i, j;',
        '  var a = tk.ints(n);',
        '  var dp = [];',
        '  for (i = 0; i < n; i++) dp.push(1);',
        '  var S = { n: n, a: a, dp: dp, i: 0, j: 0, bestJ: -1, ans: 0 };',
        '  // TODO: dp[i] = 以 a[i] 结尾的最长上升子序列长度',
        '  // 转移：若 j < i 且 a[j] < a[i]，则 dp[i] = max(dp[i], dp[j] + 1)',
        '  // 提示：参考 algo.ref，每次比较后都要 T.step(S, note)',
        '  T.answer(String(S.ans));',
        '  return String(S.ans);',
        '}'
      ].join('\n'),
      pseudo: [
        'for i ← 0 to n-1: dp[i] ← 1',
        'for i ← 0 to n-1',
        '  for j ← 0 to i-1',
        '    if a[j] < a[i] then dp[i] ← max(dp[i], dp[j] + 1)',
        'answer ← max(dp)'
      ],
      gen: 'function(r){ var n = 1 + Math.floor(Math.random()*12), a = []; for (var i = 0; i < n; i++) a.push(1 + Math.floor(Math.random()*10)); return n + "\\n" + a.join(" ") + "\\n"; }'
    },
    tips: [
      '严格上升用 a[j] < a[i]；如果题目改成「不下降」，要写成 a[j] <= a[i]',
      '答案是 max(dp[i]) 而不是 dp[n-1]',
      'n ≤ 1000 时 O(n²) 足够；n 更大时需要用「贪心 + 二分」做到 O(n log n)'
    ]
  });

  /* ==========================================================================
   * p32 最长公共子序列 LCS
   * ========================================================================*/
  window.CSP.problems.push({
    id: 'p32', no: 32, title: '最长公共子序列', diff: 3, tier: '普及+',
    knowledge: ['dp.lis'],
    limits: { time: '1s', memory: '128MB' },
    statement: '给定两个只含小写字母的字符串 A 和 B。\n' +
      '求它们的最长公共子序列的长度。\n' +
      '子序列是从字符串中删去若干字符（可以不删）后，剩下的字符保持原相对顺序得到的序列；\n' +
      '公共子序列就是同时是 A 的子序列、又是 B 的子序列的字符串。',
    inputFormat: '第一行一个字符串 A，第二行一个字符串 B（1 ≤ |A|, |B| ≤ 1000，只含小写字母）。',
    outputFormat: '一行一个整数，表示最长公共子序列的长度。',
    samples: [
      { input: 'abcde\nace', output: '3', explain: '公共子序列 "ace" 长度为 3' }
    ],
    tests: [
      { input: 'abcde\nace\n', output: '3', score: 20 },
      { input: 'abc\nabc\n', output: '3', score: 20 },
      { input: 'abc\ndef\n', output: '0', score: 20 },
      { input: 'aaaa\naa\n', output: '2', score: 20 },
      { input: 'bcaabacccccbbb\ncbbabcbbbaaac\n', output: '7', score: 20 }
    ],
    std: {
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main(){',
        '    string A, B;',
        '    if(!(cin>>A)) return 0;',
        '    cin>>B;',
        '    int n = (int)A.size(), m = (int)B.size();',
        '    vector<vector<int>> dp(n+1, vector<int>(m+1, 0));',
        '    for(int i=1;i<=n;i++)',
        '        for(int j=1;j<=m;j++){',
        '            if(A[i-1]==B[j-1]) dp[i][j]=dp[i-1][j-1]+1;',
        '            else dp[i][j]=max(dp[i-1][j], dp[i][j-1]);',
        '        }',
        '    cout<<dp[n][m]<<endl;',
        '    return 0;',
        '}'
      ].join('\n')
    },
    algo: {
      title: '二维线性 DP：dp[i][j] 表示 A 前 i 个字符与 B 前 j 个字符的 LCS',
      viz: {
        input: 'abcde\nace\n',
        type: 'matrix', mainKey: 'dp', highlight: ['i', 'j'],
        title: 'LCS 的 dp 表（行=A，列=B）'
      },
      ref: [
        'function solve(input, T){',
        '  var L = T.lines;',
        '  var A = (L[0] || "").trim(), B = (L[1] || "").trim();',
        '  var n = A.length, m = B.length, i, j;',
        '  var dp = [];',
        '  for (i = 0; i <= n; i++) { var r = []; for (j = 0; j <= m; j++) r.push(0); dp.push(r); }',
        '  var S = { n: n, m: m, A: A, B: B, dp: dp, i: 0, j: 0, ans: 0 };',
        '  T.step(S, "边界：空串与任何串的 LCS 都是 0");',
        '  for (i = 1; i <= n; i++) {',
        '    S.i = i;',
        '    for (j = 1; j <= m; j++) {',
        '      S.j = j;',
        '      if (A.charAt(i - 1) === B.charAt(j - 1)) dp[i][j] = dp[i - 1][j - 1] + 1;',
        '      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);',
        '      T.step(S, "A[" + i + "]=" + A.charAt(i - 1) + " 与 B[" + j + "]=" + B.charAt(j - 1) + " → dp=" + dp[i][j]);',
        '    }',
        '  }',
        '  S.ans = dp[n][m];',
        '  T.answer(String(S.ans));',
        '  return String(S.ans);',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var L = T.lines;',
        '  var A = (L[0] || "").trim(), B = (L[1] || "").trim();',
        '  var n = A.length, m = B.length, i, j;',
        '  var dp = [];',
        '  for (i = 0; i <= n; i++) { var r = []; for (j = 0; j <= m; j++) r.push(0); dp.push(r); }',
        '  var S = { n: n, m: m, A: A, B: B, dp: dp, i: 0, j: 0, ans: 0 };',
        '  // TODO: dp[i][j] = A 的前 i 个字符与 B 的前 j 个字符的 LCS 长度',
        '  // 若 A[i-1] == B[j-1]：dp[i][j] = dp[i-1][j-1] + 1',
        '  // 否则：dp[i][j] = max(dp[i-1][j], dp[i][j-1])',
        '  // 提示：参考 algo.ref，每填一格都要 T.step(S, note)',
        '  T.answer(String(S.ans));',
        '  return String(S.ans);',
        '}'
      ].join('\n'),
      pseudo: [
        'dp[0][*] ← 0, dp[*][0] ← 0',
        'for i ← 1 to n',
        '  for j ← 1 to m',
        '    if A[i-1] = B[j-1] then dp[i][j] ← dp[i-1][j-1] + 1',
        '    else dp[i][j] ← max(dp[i-1][j], dp[i][j-1])',
        'answer ← dp[n][m]'
      ],
      gen: 'function(r){ var al = "abc"; function rs(k){ var s = ""; for (var i = 0; i < k; i++) s += al.charAt(Math.floor(Math.random()*3)); return s; } return rs(2 + Math.floor(Math.random()*8)) + "\\n" + rs(2 + Math.floor(Math.random()*8)) + "\\n"; }'
    },
    tips: [
      '下标 1-based，取字符时别忘了 A[i-1]、B[j-1]',
      '字符不同时是取「上」和「左」的最大值，不是加 1',
      'dp 数组开 (n+1) × (m+1)，第 0 行/列表示空前缀，天然是 0'
    ]
  });

  /* ==========================================================================
   * p33 区间 DP · 石子合并
   * ========================================================================*/
  window.CSP.problems.push({
    id: 'p33', no: 33, title: '石子合并', diff: 4, tier: '提高',
    knowledge: ['dp.interval', 'basic.prefix'],
    limits: { time: '1s', memory: '128MB' },
    statement: '有 n 堆石子排成一排，第 i 堆有 a_i 颗石子。\n' +
      '每次操作可以合并**相邻**的两堆石子，合并的代价等于这两堆石子数量之和；\n' +
      '合并后的新堆石子数也等于两堆之和，并回到原来的位置。\n' +
      '经过 n-1 次操作后所有石子合并成一堆，求总代价的最小值。\n' +
      '- 例如 1 3 5 2：先合并 1、3（代价 4，得到 4 5 2），再合并 5、2（代价 7，得到 4 7），最后合并（代价 11），总代价 22。',
    inputFormat: '第一行一个整数 n（1 ≤ n ≤ 300）。\n' +
      '第二行 n 个整数 a_i（1 ≤ a_i ≤ 1000），表示每堆石子的数量。',
    outputFormat: '一行一个整数，表示合并成一堆的最小总代价。',
    samples: [
      { input: '4\n1 3 5 2', output: '22', explain: '(1+3)+(5+2)+(4+7) = 4+7+11 = 22' }
    ],
    tests: [
      { input: '4\n1 3 5 2\n', output: '22', score: 20 },
      { input: '1\n5\n', output: '0', score: 20 },
      { input: '2\n1 2\n', output: '3', score: 20 },
      { input: '5\n4 1 1 4 2\n', output: '26', score: 20 },
      { input: '12\n16 5 14 2 22 17 11 14 10 16 25 22\n', output: '610', score: 20 }
    ],
    std: {
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main(){',
        '    int n;',
        '    if(!(cin>>n)) return 0;',
        '    vector<long long> pre(n+1, 0), a(n+1, 0);',
        '    for(int i=1;i<=n;i++){ cin>>a[i]; pre[i]=pre[i-1]+a[i]; }',
        '    const long long INF = (long long)4e18;',
        '    vector<vector<long long>> dp(n+2, vector<long long>(n+2, 0));',
        '    for(int len=2; len<=n; len++)',
        '        for(int i=1; i+len-1<=n; i++){',
        '            int j = i+len-1;',
        '            dp[i][j] = INF;',
        '            for(int k=i;k<j;k++)',
        '                dp[i][j] = min(dp[i][j], dp[i][k] + dp[k+1][j] + pre[j] - pre[i-1]);',
        '        }',
        '    cout<<dp[1][n]<<endl;',
        '    return 0;',
        '}'
      ].join('\n')
    },
    algo: {
      title: '区间 DP：dp[i][j] 表示把区间 [i,j] 合并成一堆的最小代价',
      viz: {
        input: '4\n1 3 5 2\n',
        type: 'matrix', mainKey: 'dp', highlight: ['i', 'j'],
        title: '区间 DP 表（dp[i][j]）'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), i, j, k, len;',
        '  var a = [0], pre = [0];',
        '  for (i = 1; i <= n; i++) { a[i] = tk.int(); pre[i] = pre[i - 1] + a[i]; }',
        '  var INF = 1000000000;',
        '  var dp = [];',
        '  for (i = 0; i <= n + 1; i++) { var r = []; for (j = 0; j <= n + 1; j++) r.push(0); dp.push(r); }',
        '  var S = { n: n, a: a, pre: pre, dp: dp, i: 0, j: 0, k: 0, ans: 0 };',
        '  T.step(S, "边界：长度为 1 的区间不需要合并，代价为 0");',
        '  for (len = 2; len <= n; len++) {',
        '    for (i = 1; i + len - 1 <= n; i++) {',
        '      j = i + len - 1;',
        '      S.i = i; S.j = j;',
        '      dp[i][j] = INF;',
        '      for (k = i; k < j; k++) {',
        '        S.k = k;',
        '        var val = dp[i][k] + dp[k + 1][j] + pre[j] - pre[i - 1];',
        '        if (val < dp[i][j]) dp[i][j] = val;',
        '      }',
        '      T.step(S, "合并 [" + i + "," + j + "] 的最小代价 = " + dp[i][j]);',
        '    }',
        '  }',
        '  S.ans = dp[1][n];',
        '  T.answer(String(S.ans));',
        '  return String(S.ans);',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), i, j, k, len;',
        '  var a = [0], pre = [0];',
        '  for (i = 1; i <= n; i++) { a[i] = tk.int(); pre[i] = pre[i - 1] + a[i]; }',
        '  var INF = 1000000000;',
        '  var dp = [];',
        '  for (i = 0; i <= n + 1; i++) { var r = []; for (j = 0; j <= n + 1; j++) r.push(0); dp.push(r); }',
        '  var S = { n: n, a: a, pre: pre, dp: dp, i: 0, j: 0, k: 0, ans: 0 };',
        '  // TODO: 按区间长度从小到大枚举；dp[i][j] = min over k of dp[i][k] + dp[k+1][j] + (pre[j]-pre[i-1])',
        '  // 提示：参考 algo.ref，每确定一个区间都要 T.step(S, note)',
        '  T.answer(String(S.ans));',
        '  return String(S.ans);',
        '}'
      ].join('\n'),
      pseudo: [
        'for len ← 2 to n',
        '  for i ← 1 to n-len+1',
        '    j ← i + len - 1; dp[i][j] ← ∞',
        '    for k ← i to j-1',
        '      dp[i][j] ← min(dp[i][j], dp[i][k] + dp[k+1][j] + pre[j]-pre[i-1])',
        'answer ← dp[1][n]'
      ],
      gen: 'function(r){ var n = 1 + Math.floor(Math.random()*7), a = []; for (var i = 0; i < n; i++) a.push(1 + Math.floor(Math.random()*20)); return n + "\\n" + a.join(" ") + "\\n"; }'
    },
    tips: [
      '必须按「区间长度」从小到大枚举，短区间的答案要先算好',
      '合并代价用前缀和 O(1) 求出：pre[j] - pre[i-1]',
      '循环是第一关键字长度、第二关键字左端点，写反会用到还没算的区间'
    ]
  });

  /* ==========================================================================
   * p34 状压 DP · 任务分配
   * ========================================================================*/
  window.CSP.problems.push({
    id: 'p34', no: 34, title: '任务分配', diff: 4, tier: '提高',
    knowledge: ['dp.bitmask'],
    limits: { time: '1s', memory: '128MB' },
    statement: '有 n 个人和 n 项任务（编号都是 1…n）。第 i 个人完成第 j 项任务需要花费 c[i][j] 的代价。\n' +
      '现在要求每个人恰好负责一项任务，每项任务恰好由一个人负责，求总代价的最小值。\n' +
      '- 这是一个 n × n 的「一对一分配」问题，可以用二进制集合（状压）表示「哪些任务已经被分配」。',
    inputFormat: '第一行一个整数 n（1 ≤ n ≤ 8）。\n' +
      '接下来 n 行，每行 n 个整数，第 i 行第 j 个数表示 c[i][j]（1 ≤ c[i][j] ≤ 10^4）。',
    outputFormat: '一行一个整数，表示最小的总代价。',
    samples: [
      {
        input: '3\n23 13 25\n32 2 3\n36 39 29',
        output: '52',
        explain: '第 1 人做任务 2（13），第 2 人做任务 3（3），第 3 人做任务 1（36），总代价 52'
      }
    ],
    tests: [
      { input: '3\n23 13 25\n32 2 3\n36 39 29\n', output: '52', score: 20 },
      { input: '4\n13 26 36 32\n30 37 21 21\n4 27 37 3\n4 36 23 40\n', output: '54', score: 20 },
      { input: '5\n21 36 2 25 13\n13 21 16 15 34\n18 39 30 40 30\n35 2 5 2 28\n6 26 10 6 36\n', output: '53', score: 20 },
      {
        input: '6\n15 24 30 20 37 16\n31 35 37 21 20 13\n27 29 16 38 6 5\n19 23 22 29 29 3\n32 24 2 40 37 35\n13 26 2 12 38 14\n',
        output: '69', score: 20
      },
      {
        input: '6\n3 14 8 3 20 7\n12 4 19 14 16 11\n16 5 13 2 9 20\n15 2 6 9 6 3\n7 20 12 16 15 11\n19 8 17 20 12 5\n',
        output: '32', score: 20
      }
    ],
    std: {
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main(){',
        '    int n;',
        '    if(!(cin>>n)) return 0;',
        '    vector<vector<int>> c(n, vector<int>(n));',
        '    for(int i=0;i<n;i++) for(int j=0;j<n;j++) cin>>c[i][j];',
        '    int full = 1 << n;',
        '    const int INF = 1000000000;',
        '    vector<int> dp(full, INF);',
        '    dp[0] = 0;',
        '    for(int mask=0; mask<full; mask++){',
        '        int pc = __builtin_popcount((unsigned)mask);',
        '        if(pc == n) continue;',
        '        for(int j=0;j<n;j++)',
        '            if(!((mask>>j)&1)){',
        '                int nm = mask | (1<<j);',
        '                dp[nm] = min(dp[nm], dp[mask] + c[pc][j]);',
        '            }',
        '    }',
        '    cout << dp[full-1] << endl;',
        '    return 0;',
        '}'
      ].join('\n')
    },
    algo: {
      title: '状压 DP：dp[mask] 表示前 popcount(mask) 个人完成任务集合 mask 的最小代价',
      viz: {
        input: '3\n23 13 25\n32 2 3\n36 39 29\n',
        type: 'array', mainKey: 'dp', pointers: ['mask'], highlight: ['mask'],
        title: '各任务集合的最小代价'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), i, j;',
        '  var c = [];',
        '  for (i = 0; i < n; i++) { var row = []; for (j = 0; j < n; j++) row.push(tk.int()); c.push(row); }',
        '  var full = 1 << n, INF = 1000000000;',
        '  var dp = [];',
        '  for (i = 0; i < full; i++) dp.push(INF);',
        '  dp[0] = 0;',
        '  var S = { n: n, c: c, dp: dp, mask: 0, j: 0, pc: 0, ans: 0 };',
        '  T.step(S, "初始：dp[0] = 0，空集合不需要任何代价");',
        '  for (var mask = 0; mask < full; mask++) {',
        '    var pc = 0;',
        '    for (i = 0; i < n; i++) if ((mask >> i) & 1) pc++;',
        '    S.mask = mask; S.pc = pc;',
        '    if (pc === n) continue;',
        '    for (j = 0; j < n; j++) {',
        '      if ((mask >> j) & 1) continue;',
        '      S.j = j;',
        '      var nm = mask | (1 << j);',
        '      if (dp[mask] + c[pc][j] < dp[nm]) dp[nm] = dp[mask] + c[pc][j];',
        '      T.step(S, "第 " + (pc + 1) + " 人做任务 " + (j + 1) + "，集合 " + nm + " 代价 " + dp[nm]);',
        '    }',
        '  }',
        '  S.ans = dp[full - 1];',
        '  T.answer(String(S.ans));',
        '  return String(S.ans);',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), i, j;',
        '  var c = [];',
        '  for (i = 0; i < n; i++) { var row = []; for (j = 0; j < n; j++) row.push(tk.int()); c.push(row); }',
        '  var full = 1 << n, INF = 1000000000;',
        '  var dp = [];',
        '  for (i = 0; i < full; i++) dp.push(INF);',
        '  dp[0] = 0;',
        '  var S = { n: n, c: c, dp: dp, mask: 0, j: 0, pc: 0, ans: 0 };',
        '  // TODO: mask 的二进制第 j 位表示「第 j 项任务已被分配」',
        '  // 当前 mask 里 1 的个数 pc 就是「下一位该出场的员工编号（从 0 开始）」',
        '  // 转移：dp[mask | (1<<j)] = min(dp[mask | (1<<j)], dp[mask] + c[pc][j])',
        '  // 提示：参考 algo.ref，每次尝试转移都要 T.step(S, note)',
        '  T.answer(String(S.ans));',
        '  return String(S.ans);',
        '}'
      ].join('\n'),
      pseudo: [
        'dp[0] ← 0, dp[mask>0] ← ∞',
        'for mask ← 0 to 2^n - 1',
        '  pc ← popcount(mask)',
        '  if pc = n then continue',
        '  for j ← 0 to n-1 with bit j not in mask',
        '    dp[mask | (1<<j)] ← min(dp[mask | (1<<j)], dp[mask] + c[pc][j])',
        'answer ← dp[2^n - 1]'
      ],
      gen: 'function(r){ var n = 1 + Math.floor(Math.random()*5), s = n + "\\n"; for (var i = 0; i < n; i++) { var row = []; for (var j = 0; j < n; j++) row.push(1 + Math.floor(Math.random()*20)); s += row.join(" ") + "\\n"; } return s; }'
    },
    tips: [
      'mask 里 1 的个数 = 已经分配出去的任务数 = 下一位员工的编号，二者天然同步',
      'dp 大小是 2^n，n ≤ 8 时只有 256 个状态，非常快',
      '别忘记给 dp 设「无穷大」初值，否则未到达的状态会污染最小值'
    ]
  });

  /* ==========================================================================
   * p35 树形 DP · 没有上司的舞会
   * ========================================================================*/
  window.CSP.problems.push({
    id: 'p35', no: 35, title: '没有上司的舞会', diff: 4, tier: '提高',
    knowledge: ['dp.tree', 'graph.dfs'],
    limits: { time: '1s', memory: '128MB' },
    statement: '公司里有 n 名员工，编号 1…n，1 号是整个公司的老板（树根）。\n' +
      '第 i 名员工有快乐值 r_i。公司要举办一场舞会，但有个规定：\n' +
      '如果某名员工参加舞会，那么他的**直接上司**就不能参加；\n' +
      '同时，如果某名员工不参加，他的直接下属可以参加也可以不参加。\n' +
      '求参会员工快乐值总和的最大值。\n' +
      '- 输入给出的是一棵以 1 为根的有根树。',
    inputFormat: '第一行一个整数 n（1 ≤ n ≤ 1000）。\n' +
      '第二行 n 个整数 r_1 … r_n（|r_i| ≤ 10^4），表示每名员工的快乐值。\n' +
      '接下来 n-1 行，每行两个整数 u v，表示 u 是 v 的直接上司。',
    outputFormat: '一行一个整数，表示参会员工快乐值总和的最大值。',
    samples: [
      {
        input: '7\n1 2 3 4 5 6 7\n1 2\n1 3\n2 4\n2 5\n3 6\n6 7',
        output: '19',
        explain: '选 3、4、5、7：3+4+5+7 = 19（3 与 6 是上下级，6 与 7 是上下级，都没冲突）'
      }
    ],
    tests: [
      { input: '7\n1 2 3 4 5 6 7\n1 2\n1 3\n2 4\n2 5\n3 6\n6 7\n', output: '19', score: 20 },
      { input: '1\n9\n', output: '9', score: 20 },
      { input: '3\n-5 -4 -3\n1 2\n1 3\n', output: '0', score: 20 },
      { input: '4\n10 1 1 1\n1 2\n2 3\n3 4\n', output: '11', score: 20 },
      {
        input: '15\n18 14 24 16 10 18 13 15 2 3 14 1 13 26 30\n1 2\n2 3\n2 4\n4 5\n3 6\n6 7\n7 8\n5 9\n8 10\n9 11\n2 12\n6 13\n7 14\n6 15\n',
        output: '157', score: 20
      }
    ],
    std: {
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main(){',
        '    int n;',
        '    if(!(cin>>n)) return 0;',
        '    vector<long long> val(n+1, 0);',
        '    for(int i=1;i<=n;i++) cin>>val[i];',
        '    vector<vector<int>> g(n+1);',
        '    for(int i=0;i<n-1;i++){ int u,v; cin>>u>>v; g[u].push_back(v); }',
        '    vector<int> order; vector<int> st;',
        '    st.push_back(1);',
        '    while(!st.empty()){',
        '        int u = st.back(); st.pop_back();',
        '        order.push_back(u);',
        '        for(size_t t=0;t<g[u].size();t++) st.push_back(g[u][t]);',
        '    }',
        '    vector<long long> dp0(n+1, 0), dp1(n+1, 0);',
        '    for(int idx=(int)order.size()-1; idx>=0; idx--){',
        '        int u = order[idx];',
        '        long long a0 = 0, a1 = val[u];',
        '        for(size_t t=0;t<g[u].size();t++){',
        '            int v = g[u][t];',
        '            a0 += max(dp0[v], dp1[v]);',
        '            a1 += dp0[v];',
        '        }',
        '        dp0[u] = a0; dp1[u] = a1;',
        '    }',
        '    cout << max(dp0[1], dp1[1]) << endl;',
        '    return 0;',
        '}'
      ].join('\n')
    },
    algo: {
      title: '树形 DP：dp[u][0/1] 表示 u 不参加 / 参加时子树内的最大快乐值',
      viz: {
        input: '5\n1 2 3 4 5\n1 2\n1 3\n2 4\n3 5\n',
        type: 'matrix', mainKey: 'dp', highlight: ['i', 'j'],
        title: 'dp[节点][0=不参加, 1=参加]'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), i;',
        '  var val = [0];',
        '  for (i = 1; i <= n; i++) val.push(tk.int());',
        '  var children = [];',
        '  for (i = 0; i <= n; i++) children.push([]);',
        '  for (i = 0; i < n - 1; i++) { var u = tk.int(), v = tk.int(); children[u].push(v); }',
        '  var order = [], st = [1];',
        '  while (st.length) {',
        '    var x = st.pop(); order.push(x);',
        '    for (i = 0; i < children[x].length; i++) st.push(children[x][i]);',
        '  }',
        '  var dp = [];',
        '  for (i = 0; i <= n; i++) dp.push([0, 0]);',
        '  var S = { n: n, val: val, children: children, dp: dp, i: 1, j: 0, ans: 0 };',
        '  T.step(S, "先做一次 DFS 拿到「父亲在前」的顺序，再倒着 DP");',
        '  for (var idx = order.length - 1; idx >= 0; idx--) {',
        '    var u = order[idx], a0 = 0, a1 = val[u];',
        '    for (i = 0; i < children[u].length; i++) {',
        '      var v = children[u][i];',
        '      a0 += Math.max(dp[v][0], dp[v][1]);',
        '      a1 += dp[v][0];',
        '    }',
        '    dp[u][0] = a0; dp[u][1] = a1;',
        '    S.i = u; S.j = 0;',
        '    T.step(S, "节点 " + u + " 不参加：dp = " + a0);',
        '    S.j = 1;',
        '    T.step(S, "节点 " + u + " 参加：dp = " + a1);',
        '  }',
        '  S.ans = Math.max(dp[1][0], dp[1][1]);',
        '  T.answer(String(S.ans));',
        '  return String(S.ans);',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), i;',
        '  var val = [0];',
        '  for (i = 1; i <= n; i++) val.push(tk.int());',
        '  var children = [];',
        '  for (i = 0; i <= n; i++) children.push([]);',
        '  for (i = 0; i < n - 1; i++) { var u = tk.int(), v = tk.int(); children[u].push(v); }',
        '  var order = [], st = [1];',
        '  while (st.length) {',
        '    var x = st.pop(); order.push(x);',
        '    for (i = 0; i < children[x].length; i++) st.push(children[x][i]);',
        '  }',
        '  var dp = [];',
        '  for (i = 0; i <= n; i++) dp.push([0, 0]);',
        '  var S = { n: n, val: val, children: children, dp: dp, i: 1, j: 0, ans: 0 };',
        '  // TODO: 按 DFS 序的逆序（先儿子后父亲）自底向上计算',
        '  // dp[u][0] = Σ max(dp[v][0], dp[v][1])   （u 不参加，下属随意）',
        '  // dp[u][1] = val[u] + Σ dp[v][0]         （u 参加，下属都不能参加）',
        '  // 提示：参考 algo.ref，每个节点算完都要 T.step(S, note)',
        '  T.answer(String(S.ans));',
        '  return String(S.ans);',
        '}'
      ].join('\n'),
      pseudo: [
        'DFS 求出「父亲在前」的序列 order',
        'for idx ← order.length-1 downto 0',
        '  u ← order[idx]',
        '  dp[u][0] ← Σ_children max(dp[v][0], dp[v][1])',
        '  dp[u][1] ← val[u] + Σ_children dp[v][0]',
        'answer ← max(dp[1][0], dp[1][1])'
      ],
      gen: 'function(r){ var n = 1 + Math.floor(Math.random()*8), s = n + "\\n", v = []; for (var i = 0; i < n; i++) v.push(Math.floor(Math.random()*21) - 5); s += v.join(" ") + "\\n"; for (var x = 2; x <= n; x++) s += (1 + Math.floor(Math.random()*(x-1))) + " " + x + "\\n"; return s; }'
    },
    tips: [
      '快乐值可能为负，答案允许是 0（一个人都不请）',
      '状态定义：dp[u][0] = u 不参加时子树最大快乐值，dp[u][1] = u 参加时',
      '必须自底向上（先算儿子再算父亲），递归实现要注意 n 较大时的栈深度'
    ]
  });
})();
