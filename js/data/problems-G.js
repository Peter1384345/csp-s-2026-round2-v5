/* ============================================================================
 * CSP-S 2026 第二轮 · 高阶数学与 DP 题组 (problems-G.js) — p51 ~ p57
 * ----------------------------------------------------------------------------
 * 本文件补齐此前没有题目的 7 个考点：
 *   p51  dp.digit        数位 DP
 *   p52  dp.prob / math.prob   概率期望 DP
 *   p53  math.game       博弈论 / SG 函数
 *   p54  math.inclusion  容斥原理（+ math.prime 质因数分解）
 *   p55  math.linear     高斯消元
 *   p56  math.geometry   计算几何（叉积）
 *   p57  math.bsgs       BSGS / 离散对数
 *
 * 每题同时提供：
 *   std.code           参考 C++17 程序（真实评测 / 验证用）
 *   algo.ref           JS 追踪版参考实现（输出与 C++ 完全一致）
 *   algo.userTemplate  挖空的起步代码
 *   algo.viz           可视化描述（可视化输入规模很小，步数 ≤ 200）
 *   algo.gen           随机数据生成器（对拍用）
 *
 * 为规避 JS 与 C++ 的浮点格式差异，本文件中所有题目都只输出整数或
 * 最简分数 p/q，绝不输出浮点数。
 *
 * 依赖：window.CSP.problems（数组），知识点 id 取自 js/data/syllabus.js
 * ==========================================================================*/
(function () {
  'use strict';
  window.CSP = window.CSP || {};
  window.CSP.problems = window.CSP.problems || [];

  /* ==========================================================================
   * p51 幸运数字计数（数位 DP）
   * ========================================================================*/
  window.CSP.problems.push({
    id: 'p51', no: 51, title: '幸运数字计数', diff: 4, tier: '提高+',
    knowledge: ['dp.digit'],
    limits: { time: '1s', memory: '128MB' },
    statement: '我们称一个正整数是「幸运数」，当且仅当它的十进制表示（无前导零）同时满足：\n' +
      '- 不含数字 4；\n' +
      '- 各位数字之和是 3 的倍数。\n' +
      '给定区间 [L, R]，求其中幸运数的个数。\n' +
      '例如 1..20 中，3、6、9、12、15、18 是幸运数，共 6 个；而 4、14 含 4，10、11 的数位和不是 3 的倍数。',
    inputFormat: '一行两个整数 L, R（1 ≤ L ≤ R ≤ 10^15）。',
    outputFormat: '一行一个整数，表示 [L, R] 中幸运数的个数。',
    samples: [
      {
        input: '1 20',
        output: '6',
        explain: '3, 6, 9, 12, 15, 18 的数位和分别为 3, 6, 9, 3, 6, 9，且都不含 4'
      }
    ],
    tests: [
      { input: '1 20\n', output: '6', score: 20 },
      { input: '1 1000\n', output: '242', score: 20 },
      { input: '4 4\n', output: '0', score: 20 },
      { input: '1 1000000000000000\n', output: '68630377364882', score: 20 },
      { input: '123456789 987654321\n', output: '108974829', score: 20 }
    ],
    std: {
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int D[20], len;',
        'long long memo[20][3];',
        'long long dfs(int pos, int mod, int tight){',
        '    if(pos==len) return mod==0?1:0;',
        '    if(!tight && memo[pos][mod]>=0) return memo[pos][mod];',
        '    int up = tight ? D[pos] : 9;',
        '    long long res=0;',
        '    for(int d=0; d<=up; d++){',
        '        if(d==4) continue;',
        '        res += dfs(pos+1, (mod+d)%3, tight && d==up);',
        '    }',
        '    if(!tight) memo[pos][mod]=res;',
        '    return res;',
        '}',
        'long long upTo(long long n){',
        '    if(n<0) return 0;',
        '    len=0;',
        '    if(n==0) D[len++]=0;',
        '    else { long long x=n; while(x>0){ D[len++]=x%10; x/=10; } reverse(D,D+len); }',
        '    memset(memo,-1,sizeof(memo));',
        '    return dfs(0,0,1);',
        '}',
        'int main(){',
        '    long long L,R;',
        '    if(!(cin>>L>>R)) return 0;',
        '    cout << upTo(R)-upTo(L-1) << endl;',
        '    return 0;',
        '}'
      ].join('\n')
    },
    algo: {
      title: '数位 DP：按位枚举 + 数位和模 3 状态',
      viz: {
        input: '1 30',
        type: 'array', mainKey: 'ds', pointers: ['pos'], highlight: ['pos'],
        title: '数位 DP：当前枚举到哪一位'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var L = tk.int(), R = tk.int();',
        '  var S = { ds: [], pos: 0, mod: 0, tight: 1, res: 0, limit: R };',
        '  function digitsOf(n){',
        '    var ds = [], x = n;',
        '    if (x === 0) ds = [0];',
        '    while (x > 0) { ds.unshift(x % 10); x = Math.floor(x / 10); }',
        '    return ds;',
        '  }',
        '  function upTo(n){',
        '    if (n < 0) { T.step(S, "上界为负，返回 0"); return 0; }',
        '    var ds = digitsOf(n);',
        '    S.ds = ds; S.limit = n; S.pos = 0; S.mod = 0; S.tight = 1; S.res = 0;',
        '    T.step(S, "统计 [0, " + n + "] 中幸运数的个数（共 " + ds.length + " 位）");',
        '    var memo = {};',
        '    function dfs(pos, mod, tight){',
        '      S.pos = pos; S.mod = mod; S.tight = tight ? 1 : 0;',
        '      if (pos === ds.length){',
        '        T.step(S, mod === 0 ? "枚举完毕：数位和模 3 为 0，计入答案" : "枚举完毕：数位和模 3 为 " + mod + "，不计入");',
        '        return mod === 0 ? 1 : 0;',
        '      }',
        '      var key = pos + "|" + mod;',
        '      if (!tight && memo[key] !== undefined){',
        '        S.res = memo[key];',
        '        T.step(S, "记忆化命中 dfs(" + pos + ", " + mod + ") = " + memo[key]);',
        '        return memo[key];',
        '      }',
        '      var up = tight ? ds[pos] : 9, res = 0, d;',
        '      for (d = 0; d <= up; d++){',
        '        if (d === 4) continue;',
        '        res += dfs(pos + 1, (mod + d) % 3, tight && d === up);',
        '      }',
        '      if (!tight) memo[key] = res;',
        '      S.res = res;',
        '      T.step(S, "第 " + pos + " 位枚举 0.." + up + "（跳过 4），合法后缀 " + res + " 个");',
        '      return res;',
        '    }',
        '    return dfs(0, 0, true);',
        '  }',
        '  var cR = upTo(R);',
        '  var cL = upTo(L - 1);',
        '  S.res = cR - cL; S.ds = digitsOf(R); S.pos = 0;',
        '  T.step(S, "答案 = " + cR + " - " + cL + " = " + S.res);',
        '  T.answer(String(S.res));',
        '  return String(S.res);',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var L = tk.int(), R = tk.int();',
        '  var S = { ds: [], pos: 0, mod: 0, tight: 1, res: 0, limit: R };',
        '  function digitsOf(n){',
        '    var ds = [], x = n;',
        '    if (x === 0) ds = [0];',
        '    while (x > 0) { ds.unshift(x % 10); x = Math.floor(x / 10); }',
        '    return ds;',
        '  }',
        '  // TODO: 实现 upTo(n)：统计 [0, n] 中的幸运数个数',
        '  //   思路：把 n 拆成数位数组，从高位到低位枚举，状态为 (当前位 pos, 数位和模 3, 是否贴着上界 tight)',
        '  //   转移：本位数取 0..up（跳过 4），累加所有合法后缀的方案数；!tight 时用记忆化避免重复计算',
        '  //   注意：去掉前导零的写法不影响数位和（0 不改变模 3 的余数），最后记得把 0 本身扣掉',
        '  //   var cR = upTo(R), cL = upTo(L - 1); 答案是 cR - cL',
        '  // 提示：参考 algo.ref，每进入一个状态都要 T.step(S, note)',
        '  var ans = 0;',
        '  S.res = ans;',
        '  T.answer(String(ans));',
        '  return String(ans);',
        '}'
      ].join('\n'),
      pseudo: [
        'dfs(pos, mod, tight):',
        '  if pos = len: return mod = 0 ? 1 : 0',
        '  up ← tight ? d[pos] : 9',
        '  res ← 0',
        '  for x ← 0 to up:',
        '    if x = 4 then continue',
        '    res ← res + dfs(pos+1, (mod+x) mod 3, tight and x = up)',
        '  return res',
        'answer ← upTo(R) - upTo(L-1)'
      ],
      gen: 'function(r){ var L = 1 + Math.floor(Math.random()*900); var R = L + Math.floor(Math.random()*900); return L + " " + R; }'
    },
    tips: [
      '记忆化只能用于 !tight 的状态，贴着上界的状态每个前缀只有一个，不能复用',
      '去掉前导零：本题中 0 既不等于 4 也不改变数位和模 3，所以把前导零当普通 0 处理即可，最后减去多算的 0',
      'R 可达 10^15，逐个数枚举必然超时，必须按位 DP'
    ]
  });

  /* ==========================================================================
   * p52 走廊期望步数（概率期望 DP）
   * ========================================================================*/
  window.CSP.problems.push({
    id: 'p52', no: 52, title: '走廊期望步数', diff: 4, tier: '提高+',
    knowledge: ['dp.prob', 'math.prob'],
    limits: { time: '1s', memory: '128MB' },
    statement: '一条从位置 0 到位置 n 的走廊，你初始站在 0 号位置，目标是走到 n 号位置。\n' +
      '当你在位置 i（0 ≤ i < n）时，你会等概率地选择 k ∈ {1, 2, …, m} 中的一个整数，然后走到位置 min(i + k, n)。\n' +
      '也就是说，如果 i + k 超过了 n，你会直接停到终点 n。一到终点就立刻停止。\n' +
      '求从 0 号位置出发到达 n 号位置所需步数的期望值。',
    inputFormat: '一行两个整数 n, m（1 ≤ n ≤ 12，1 ≤ m ≤ 4）。',
    outputFormat: '一行，期望值的最简分数 p/q（q ≥ 1，p、q 互质）；若期望值是整数，则只输出这个整数。',
    samples: [
      {
        input: '3 2',
        output: '9/4',
        explain: 'E[3]=0，E[2]=1+E[3]=1，E[1]=1+(E[2]+E[3])/2=3/2，E[0]=1+(E[1]+E[2])/2=9/4'
      }
    ],
    tests: [
      { input: '3 2\n', output: '9/4', score: 20 },
      { input: '1 1\n', output: '1', score: 20 },
      { input: '5 3\n', output: '229/81', score: 20 },
      { input: '12 4\n', output: '21811165/4194304', score: 20 },
      { input: '7 1\n', output: '7', score: 20 }
    ],
    std: {
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'typedef long long ll;',
        'struct F { ll p, q; };',
        'll g2(ll a, ll b){ a=llabs(a); b=llabs(b); while(b){ ll t=a%b; a=b; b=t; } return a?a:1; }',
        'F mk(ll p, ll q){ if(q<0){ p=-p; q=-q; } ll g=g2(p,q); return F{p/g, q/g}; }',
        'F fadd(F x, F y){ return mk(x.p*y.q + y.p*x.q, x.q*y.q); }',
        'F fdiv(F x, ll k){ return mk(x.p, x.q*k); }',
        'string fs(F f){ if(f.q==1) return to_string(f.p); return to_string(f.p)+"/"+to_string(f.q); }',
        'int main(){',
        '    int n,m;',
        '    if(!(cin>>n>>m)) return 0;',
        '    vector<F> E(n+1, F{0,1});',
        '    for(int i=n-1;i>=0;i--){',
        '        F s{0,1};',
        '        for(int j=1;j<=m;j++) s = fadd(s, E[min(i+j,n)]);',
        '        E[i] = fadd(F{1,1}, fdiv(s, m));',
        '    }',
        '    cout << fs(E[0]) << endl;',
        '    return 0;',
        '}'
      ].join('\n')
    },
    algo: {
      title: '期望 DP：E[i] = 1 + (Σ E[min(i+j,n)]) / m，从终点倒推',
      viz: {
        input: '3 2',
        type: 'array', mainKey: 'E', pointers: ['i'], highlight: ['i'],
        title: '期望 DP：E[0..n]（最简分数）'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), m = tk.int();',
        '  function gcd(a, b){ a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }',
        '  function mk(p, q){ if (q < 0) { p = -p; q = -q; } var g = gcd(p, q); return [p / g, q / g]; }',
        '  function fadd(x, y){ return mk(x[0] * y[1] + y[0] * x[1], x[1] * y[1]); }',
        '  function fdiv(x, k){ return mk(x[0], x[1] * k); }',
        '  function fs(f){ return f[1] === 1 ? String(f[0]) : f[0] + "/" + f[1]; }',
        '  var E = [], i;',
        '  for (i = 0; i <= n; i++) E.push([0, 1]);',
        '  var S = { n: n, m: m, E: [], i: n, j: 0, val: "", ans: "" };',
        '  function show(){ var o = [], t; for (t = 0; t <= n; t++) o.push(fs(E[t])); return o; }',
        '  S.E = show();',
        '  T.step(S, "E[" + n + "] = 0（已在终点），从后往前递推");',
        '  for (i = n - 1; i >= 0; i--){',
        '    S.i = i;',
        '    var sum = [0, 1], j;',
        '    for (j = 1; j <= m; j++){',
        '      var nx = Math.min(i + j, n);',
        '      S.j = j;',
        '      sum = fadd(sum, E[nx]);',
        '      T.step(S, "从 " + i + " 走 " + j + " 步到 " + nx + "，期望和累计 " + fs(sum));',
        '    }',
        '    E[i] = fadd([1, 1], fdiv(sum, m));',
        '    S.E = show();',
        '    S.val = fs(E[i]);',
        '    T.step(S, "E[" + i + "] = 1 + (" + fs(sum) + ")/" + m + " = " + S.val);',
        '  }',
        '  S.val = fs(E[0]); S.i = 0; S.ans = S.val;',
        '  T.step(S, "从 0 出发到达 " + n + " 的期望步数 = " + S.val);',
        '  T.answer(S.val);',
        '  return S.val;',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), m = tk.int();',
        '  function gcd(a, b){ a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }',
        '  function mk(p, q){ if (q < 0) { p = -p; q = -q; } var g = gcd(p, q); return [p / g, q / g]; }',
        '  function fadd(x, y){ return mk(x[0] * y[1] + y[0] * x[1], x[1] * y[1]); }',
        '  function fdiv(x, k){ return mk(x[0], x[1] * k); }',
        '  function fs(f){ return f[1] === 1 ? String(f[0]) : f[0] + "/" + f[1]; }',
        '  var E = [], i;',
        '  for (i = 0; i <= n; i++) E.push([0, 1]);',
        '  var S = { n: n, m: m, E: [], i: n, j: 0, val: "", ans: "" };',
        '  // TODO: 从 i = n-1 倒推到 i = 0，维护精确分数 (分子, 分母)',
        '  //   转移：E[i] = 1 + ( Σ_{j=1..m} E[min(i+j, n)] ) / m',
        '  //   每一步把 E 的分数形式写回 S.E（字符串数组），并 T.step(S, note)',
        '  // 提示：全程用整数分子/分母 + gcd 约分，不要用浮点数',
        '  var ans = fs(E[0]);',
        '  T.answer(ans);',
        '  return ans;',
        '}'
      ].join('\n'),
      pseudo: [
        'E[n] ← 0',
        'for i ← n-1 downto 0:',
        '  s ← 0',
        '  for j ← 1 to m: s ← s + E[min(i+j, n)]',
        '  E[i] ← 1 + s / m',
        'answer ← E[0]（最简分数）'
      ],
      gen: 'function(r){ var n = 1 + Math.floor(Math.random()*12); var m = 1 + Math.floor(Math.random()*4); return n + " " + m; }'
    },
    tips: [
      '期望 DP 通常「从终点往起点推」：E[n] = 0 是边界，E[i] 只依赖编号更大的状态',
      '答案要求精确分数，必须用整数分子分母 + gcd 约分，浮点会丢精度',
      '当 i + k > n 时是「直接到终点」，即 E[min(i+k, n)] = E[n] = 0，不要写成留在原地'
    ]
  });

  /* ==========================================================================
   * p53 取石子游戏（SG 函数）
   * ========================================================================*/
  window.CSP.problems.push({
    id: 'p53', no: 53, title: '取石子游戏', diff: 3, tier: '提高',
    knowledge: ['math.game'],
    limits: { time: '1s', memory: '128MB' },
    statement: '有 n 堆石子，第 i 堆有 a_i 个。两人轮流操作，每次必须选择一堆并从中取走 1 到 k 个石子（不能不取，也不能超过该堆剩余数量）。\n' +
      '取走最后一颗石子的人获胜。问：在双方都采取最优策略的前提下，先手是否必胜？\n' +
      '- 单堆的 SG 值：SG(x) = x mod (k + 1)。\n' +
      '- 多堆局面必胜当且仅当各堆 SG 值的异或和不为 0（SG 定理）。',
    inputFormat: '第一行两个整数 n, k（1 ≤ n ≤ 10^5，1 ≤ k ≤ 10^9）。\n' +
      '第二行 n 个整数 a_1, a_2, …, a_n（0 ≤ a_i ≤ 10^9）。',
    outputFormat: '一行，若先手必胜输出 Yes，否则输出 No。',
    samples: [
      {
        input: '3 3\n1 2 3',
        output: 'No',
        explain: '每堆可取 1..3 个，SG(x) = x mod 4，SG 值为 1,2,3，异或和 1^2^3 = 0，先手必败'
      }
    ],
    tests: [
      { input: '3 3\n1 2 3\n', output: 'No', score: 20 },
      { input: '2 2\n3 5\n', output: 'Yes', score: 20 },
      { input: '4 5\n7 7 7 7\n', output: 'No', score: 20 },
      { input: '1 10\n100\n', output: 'Yes', score: 20 },
      {
        input: '5 1000000000\n1000000000 999999999 500000000 123456789 987654321\n',
        output: 'Yes', score: 20
      }
    ],
    std: {
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main(){',
        '    long long n,k;',
        '    if(!(cin>>n>>k)) return 0;',
        '    long long x=0;',
        '    for(long long i=0;i<n;i++){',
        '        long long a; cin>>a;',
        '        x ^= (a % (k+1));',
        '    }',
        '    cout << (x ? "Yes" : "No") << endl;',
        '    return 0;',
        '}'
      ].join('\n')
    },
    algo: {
      title: 'SG 定理：SG(a_i) = a_i mod (k+1)，异或和判胜负',
      viz: {
        input: '3 3\n1 2 3',
        type: 'array', mainKey: 'a', pointers: ['i'], highlight: ['i'],
        title: '逐堆求 SG 值并异或'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), k = tk.int();',
        '  var a = tk.ints(n);',
        '  var S = { n: n, k: k, a: a, i: 0, sg: 0, x: 0, win: 0 };',
        '  T.step(S, "共 " + n + " 堆，每堆每次可取出 1.." + k + " 个，SG(x) = x mod " + (k + 1));',
        '  for (S.i = 0; S.i < n; S.i++){',
        '    S.sg = a[S.i] % (k + 1);',
        '    S.x = (S.x ^ S.sg);',
        '    T.step(S, "第 " + S.i + " 堆有 " + a[S.i] + " 个 → SG = " + S.sg + "，异或和 = " + S.x);',
        '  }',
        '  S.win = (S.x !== 0) ? 1 : 0;',
        '  T.step(S, S.win ? "异或和不为 0，先手必胜" : "异或和为 0，先手必败");',
        '  T.answer(S.win ? "Yes" : "No");',
        '  return S.win ? "Yes" : "No";',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), k = tk.int();',
        '  var a = tk.ints(n);',
        '  var S = { n: n, k: k, a: a, i: 0, sg: 0, x: 0, win: 0 };',
        '  T.step(S, "共 " + n + " 堆，每堆每次可取出 1.." + k + " 个");',
        '  // TODO: 求出每堆的 SG 值（每次可取 1..k 个时 SG(x) = x mod (k+1)）',
        '  //   把它们全部异或起来得到 S.x，异或和不为 0 则先手必胜（SG 定理）',
        '  //   每处理完一堆都要 T.step(S, note)',
        '  S.win = 0;',
        '  T.answer(S.win ? "Yes" : "No");',
        '  return S.win ? "Yes" : "No";',
        '}'
      ].join('\n'),
      pseudo: [
        'x ← 0',
        'for i ← 1 to n:',
        '  sg ← a[i] mod (k+1)',
        '  x ← x xor sg',
        'answer ← x ≠ 0 ? "Yes" : "No"'
      ],
      gen: 'function(r){ var n = 1 + Math.floor(Math.random()*5); var k = 1 + Math.floor(Math.random()*6); var a = []; for (var i=0;i<n;i++) a.push(Math.floor(Math.random()*15)); return n + " " + k + "\\n" + a.join(" "); }'
    },
    tips: [
      'SG 定理：多堆局面的 SG 值等于各堆 SG 值的异或和，为 0 则先手必败',
      '每堆可取 1..k 个时 SG(x) = x mod (k+1)，k = 1 时就是 x mod 2',
      '别忘了 a_i 可以为 0：空堆的 SG 值为 0，异或时等于没加'
    ]
  });

  /* ==========================================================================
   * p54 与 m 不互质的数（容斥原理）
   * ========================================================================*/
  window.CSP.problems.push({
    id: 'p54', no: 54, title: '与 m 不互质的数', diff: 4, tier: '提高+',
    knowledge: ['math.inclusion', 'math.prime'],
    limits: { time: '1s', memory: '128MB' },
    statement: '给定 n 和 m，求 1..n 中有多少个整数 i 满足 gcd(i, m) > 1（即 i 与 m 不互质）。\n' +
      '- 先把 m 分解质因数，得到所有互异素因子 p_1, …, p_t。\n' +
      '- i 与 m 不互质 ⇔ i 被某个 p_j 整除。\n' +
      '- 用容斥原理统计：|∪ A_j| = Σ|A_j| − Σ|A_j∩A_l| + …，其中 A_j 是 1..n 中 p_j 的倍数集合，\n' +
      '  任意若干素因子交集的大小为 ⌊n / (它们的乘积)⌋，符号由选中的素因子个数奇偶决定。',
    inputFormat: '一行两个整数 n, m（1 ≤ n ≤ 10^9，1 ≤ m ≤ 10^9）。',
    outputFormat: '一行一个整数，表示 1..n 中与 m 不互质的数的个数。',
    samples: [
      {
        input: '10 6',
        output: '7',
        explain: 'm = 6 = 2×3，1..10 中 2 的倍数有 5 个，3 的倍数有 3 个，6 的倍数有 1 个，5+3−1 = 7'
      }
    ],
    tests: [
      { input: '10 6\n', output: '7', score: 20 },
      { input: '1 1\n', output: '0', score: 20 },
      { input: '100 30\n', output: '74', score: 20 },
      { input: '1000000000 999999937\n', output: '1', score: 20 },
      { input: '1000000000 510510\n', output: '819474645', score: 20 }
    ],
    std: {
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main(){',
        '    long long n,m;',
        '    if(!(cin>>n>>m)) return 0;',
        '    vector<long long> pr;',
        '    long long x=m;',
        '    for(long long p=2;p*p<=x;p++)',
        '        if(x%p==0){ pr.push_back(p); while(x%p==0) x/=p; }',
        '    if(x>1) pr.push_back(x);',
        '    int k=pr.size();',
        '    long long ans=0;',
        '    for(int mask=1; mask<(1<<k); mask++){',
        '        long long prod=1; int bits=0; bool ok=true;',
        '        for(int j=0;j<k;j++) if(mask>>j&1){',
        '            if(prod > n/pr[j]){ ok=false; break; }',
        '            prod *= pr[j]; bits++;',
        '        }',
        '        if(!ok) continue;',
        '        long long c = n/prod;',
        '        ans += (bits%2 ? c : -c);',
        '    }',
        '    cout << ans << endl;',
        '    return 0;',
        '}'
      ].join('\n')
    },
    algo: {
      title: '容斥原理：枚举互异素因子的子集，奇加偶减',
      viz: {
        input: '10 6',
        type: 'array', mainKey: 'primes', pointers: ['i'], highlight: ['i'],
        title: '互异素因子与子集枚举'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), m = tk.int();',
        '  var x = m, primes = [], p;',
        '  for (p = 2; p * p <= x; p++){',
        '    if (x % p === 0){',
        '      primes.push(p);',
        '      while (x % p === 0) x = x / p;',
        '    }',
        '  }',
        '  if (x > 1) primes.push(x);',
        '  var S = { n: n, m: m, primes: primes, i: -1, mask: 0, prod: 1, bits: 0, sign: 1, cnt: 0, ans: 0 };',
        '  T.step(S, "把 " + m + " 分解为互异素因子 [" + primes.join(", ") + "]，共 " + primes.length + " 个");',
        '  var total = 0, k = primes.length, mask, j, prod, bits, ok, sub;',
        '  for (mask = 1; mask < (1 << k); mask++){',
        '    prod = 1; bits = 0; ok = true;',
        '    for (j = 0; j < k; j++){',
        '      if (mask & (1 << j)){',
        '        S.i = j; S.mask = mask;',
        '        if (prod > Math.floor(n / primes[j])){',
        '          ok = false; S.prod = prod;',
        '          T.step(S, "再乘上 " + primes[j] + " 后乘积会超过 n，该子集交集为空");',
        '          break;',
        '        }',
        '        prod = prod * primes[j]; bits++;',
        '        T.step(S, "子集加入素因子 " + primes[j] + "，当前乘积 " + prod);',
        '      }',
        '    }',
        '    if (!ok) continue;',
        '    sub = Math.floor(n / prod);',
        '    S.prod = prod; S.bits = bits; S.cnt = sub; S.sign = (bits % 2 === 1) ? 1 : -1;',
        '    total = total + S.sign * sub; S.ans = total;',
        '    T.step(S, (S.sign > 0 ? "加上" : "减去") + "能被 " + prod + " 整除的 " + sub + " 个，累计 " + total);',
        '  }',
        '  S.ans = total; S.i = -1;',
        '  T.step(S, "1.." + n + " 中与 " + m + " 不互质的数共 " + total + " 个");',
        '  T.answer(String(total));',
        '  return String(total);',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), m = tk.int();',
        '  var x = m, primes = [], p;',
        '  for (p = 2; p * p <= x; p++){',
        '    if (x % p === 0){',
        '      primes.push(p);',
        '      while (x % p === 0) x = x / p;',
        '    }',
        '  }',
        '  if (x > 1) primes.push(x);',
        '  var S = { n: n, m: m, primes: primes, i: -1, mask: 0, prod: 1, bits: 0, sign: 1, cnt: 0, ans: 0 };',
        '  T.step(S, "把 " + m + " 分解为互异素因子 [" + primes.join(", ") + "]，共 " + primes.length + " 个");',
        '  // TODO: 枚举所有非空子集（共 2^k - 1 个），用容斥统计 p_j 的倍数个数',
        '  //   子集乘积 prod = Π p_j：如果 prod > n 则交集为空，跳过',
        '  //   否则交集大小为 floor(n / prod)，选中素数个数为奇数则加、偶数则减',
        '  //   每个子集处理完都要 T.step(S, note)',
        '  var total = 0;',
        '  S.ans = total;',
        '  T.answer(String(total));',
        '  return String(total);',
        '}'
      ].join('\n'),
      pseudo: [
        '把 m 分解为互异素因子 p[1..k]',
        'ans ← 0',
        'for mask ← 1 to 2^k - 1:',
        '  prod ← Π p[j] (mask 第 j 位为 1)',
        '  if prod > n then continue',
        '  c ← floor(n / prod)',
        '  ans ← ans + (popcount(mask) 为奇数 ? c : -c)',
        'answer ← ans'
      ],
      gen: 'function(r){ var m = 1 + Math.floor(Math.random()*1000); var n = 1 + Math.floor(Math.random()*10000); return n + " " + m; }'
    },
    tips: [
      '容斥的符号是「奇加偶减」：选 1 个素因子加，选 2 个减，选 3 个加……',
      '计算子集乘积时先判断 prod > n 就跳过，否则乘积可能溢出（本题 n ≤ 10^9，注意用除法判断）',
      'm = 1 时没有任何素因子，答案是 0（1 与 1 互质）'
    ]
  });

  /* ==========================================================================
   * p55 高斯消元解方程组
   * ========================================================================*/
  window.CSP.problems.push({
    id: 'p55', no: 55, title: '高斯消元解方程组', diff: 4, tier: '提高+',
    knowledge: ['math.linear'],
    limits: { time: '1s', memory: '128MB' },
    statement: '给定一个 n 元一次方程组 A·x = b，保证系数矩阵的行列式不为 0（解唯一）。\n' +
      '请用高斯消元法求出 x_1, x_2, …, x_n。\n' +
      '- 本题允许解是分数，请用精确分数运算（不要用浮点数）。\n' +
      '- 消元过程：每列选一个非零主元所在行交换到当前行，把主元化为 1，再用它消去其它行的该列。',
    inputFormat: '第一行一个整数 n（1 ≤ n ≤ 5）。\n' +
      '接下来 n 行，每行 n + 1 个整数 a_{i1} a_{i2} … a_{in} b_i（|a_{ij}| ≤ 9，|b_i| ≤ 100）。',
    outputFormat: '一行 n 个数，依次为 x_1, x_2, …, x_n。每个数若为整数就输出整数本身，否则输出最简分数 p/q（q > 0，p、q 互质）。相邻两个数之间用一个空格隔开。',
    samples: [
      {
        input: '2\n1 1 3\n1 -1 1',
        output: '2 1',
        explain: 'x1 + x2 = 3，x1 − x2 = 1，解得 x1 = 2，x2 = 1'
      }
    ],
    tests: [
      { input: '2\n1 1 3\n1 -1 1\n', output: '2 1', score: 20 },
      { input: '1\n2 1\n', output: '1/2', score: 20 },
      { input: '3\n1 1 1 6\n2 -1 1 3\n1 2 -1 2\n', output: '1 2 3', score: 20 },
      { input: '4\n2 1 0 0 4\n1 3 1 0 10\n0 1 4 1 18\n0 0 1 2 11\n', output: '1 2 3 4', score: 20 },
      {
        input: '5\n3 1 0 0 1 6\n1 2 1 0 0 0\n0 1 3 1 0 7\n0 0 1 2 1 8\n1 0 0 1 4 21\n',
        output: '1 -2 3 0 5', score: 20
      }
    ],
    std: {
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'typedef long long ll;',
        'struct F { ll p, q; };',
        'll g2(ll a, ll b){ a=llabs(a); b=llabs(b); while(b){ ll t=a%b; a=b; b=t; } return a?a:1; }',
        'F mk(ll p, ll q){ if(q<0){ p=-p; q=-q; } ll g=g2(p,q); return F{p/g, q/g}; }',
        'F fmul(F a, F b){ return mk(a.p*b.p, a.q*b.q); }',
        'F fdiv(F a, F b){ return mk(a.p*b.q, a.q*b.p); }',
        'F fsub(F a, F b){ return mk(a.p*b.q - b.p*a.q, a.q*b.q); }',
        'bool fzero(F a){ return a.p==0; }',
        'string fs(F a){ if(a.q==1) return to_string(a.p); return to_string(a.p)+"/"+to_string(a.q); }',
        'int main(){',
        '    int n;',
        '    if(!(cin>>n)) return 0;',
        '    vector<vector<F>> M(n, vector<F>(n+1));',
        '    for(int i=0;i<n;i++) for(int j=0;j<=n;j++){ ll v; cin>>v; M[i][j]=F{v,1}; }',
        '    for(int col=0; col<n; col++){',
        '        int piv=-1;',
        '        for(int r=col;r<n;r++) if(!fzero(M[r][col])){ piv=r; break; }',
        '        if(piv!=col) swap(M[col], M[piv]);',
        '        F pv = M[col][col];',
        '        for(int c=col;c<=n;c++) M[col][c] = fdiv(M[col][c], pv);',
        '        for(int r=0;r<n;r++){',
        '            if(r==col) continue;',
        '            F f = M[r][col];',
        '            if(fzero(f)) continue;',
        '            for(int c=col;c<=n;c++) M[r][c] = fsub(M[r][c], fmul(f, M[col][c]));',
        '        }',
        '    }',
        '    for(int i=0;i<n;i++){ if(i) cout<<\' \'; cout<<fs(M[i][n]); }',
        '    cout<<endl;',
        '    return 0;',
        '}'
      ].join('\n')
    },
    algo: {
      title: '高斯-约当消元：选主元 → 归一 → 消去其它行（精确分数）',
      viz: {
        input: '2\n1 1 3\n1 -1 1',
        type: 'matrix', mainKey: 'M', highlight: ['i', 'j'],
        title: '增广矩阵（含最后一列 b）'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int();',
        '  function gcd(a, b){ a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }',
        '  function FR(p, q){ if (q < 0) { p = -p; q = -q; } var g = gcd(p, q); return [p / g, q / g]; }',
        '  function fmul(a, b){ return FR(a[0] * b[0], a[1] * b[1]); }',
        '  function fdiv(a, b){ return FR(a[0] * b[1], a[1] * b[0]); }',
        '  function fsub(a, b){ return FR(a[0] * b[1] - b[0] * a[1], a[1] * b[1]); }',
        '  function fz(a){ return a[0] === 0; }',
        '  function fs(a){ return a[1] === 1 ? String(a[0]) : a[0] + "/" + a[1]; }',
        '  var M = [], i, j;',
        '  for (i = 0; i < n; i++){ var row = []; for (j = 0; j <= n; j++) row.push(FR(tk.int(), 1)); M.push(row); }',
        '  function disp(){ var o = [], r, c; for (r = 0; r < n; r++){ var rr = []; for (c = 0; c <= n; c++) rr.push(fs(M[r][c])); o.push(rr); } return o; }',
        '  var S = { n: n, M: disp(), i: 0, j: 0, pivot: "" };',
        '  T.step(S, "n = " + n + "，写出增广矩阵（最后一列是常数项 b）");',
        '  for (var col = 0; col < n; col++){',
        '    var piv = -1, r;',
        '    for (r = col; r < n; r++) if (!fz(M[r][col])) { piv = r; break; }',
        '    if (piv !== col){ var t = M[col]; M[col] = M[piv]; M[piv] = t; }',
        '    var pv = M[col][col];',
        '    S.i = col; S.j = col; S.pivot = fs(pv); S.M = disp();',
        '    T.step(S, "第 " + col + " 列选第 " + piv + " 行为主元行，主元 = " + S.pivot + (piv !== col ? "（已交换）" : ""));',
        '    var c;',
        '    for (c = col; c <= n; c++) M[col][c] = fdiv(M[col][c], pv);',
        '    for (r = 0; r < n; r++){',
        '      if (r === col) continue;',
        '      var f = M[r][col];',
        '      if (fz(f)) continue;',
        '      for (c = col; c <= n; c++) M[r][c] = fsub(M[r][c], fmul(f, M[col][c]));',
        '    }',
        '    S.i = col; S.j = col; S.M = disp();',
        '    T.step(S, "把第 " + col + " 行归一化，并用它消去其它行的第 " + col + " 列");',
        '  }',
        '  var out = [];',
        '  for (i = 0; i < n; i++) out.push(fs(M[i][n]));',
        '  S.i = n - 1; S.j = n; S.M = disp();',
        '  T.step(S, "回代完成，解为 (" + out.join(", ") + ")");',
        '  T.answer(out.join(" "));',
        '  return out.join(" ");',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int();',
        '  function gcd(a, b){ a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }',
        '  function FR(p, q){ if (q < 0) { p = -p; q = -q; } var g = gcd(p, q); return [p / g, q / g]; }',
        '  function fmul(a, b){ return FR(a[0] * b[0], a[1] * b[1]); }',
        '  function fdiv(a, b){ return FR(a[0] * b[1], a[1] * b[0]); }',
        '  function fsub(a, b){ return FR(a[0] * b[1] - b[0] * a[1], a[1] * b[1]); }',
        '  function fz(a){ return a[0] === 0; }',
        '  function fs(a){ return a[1] === 1 ? String(a[0]) : a[0] + "/" + a[1]; }',
        '  var M = [], i, j;',
        '  for (i = 0; i < n; i++){ var row = []; for (j = 0; j <= n; j++) row.push(FR(tk.int(), 1)); M.push(row); }',
        '  var S = { n: n, M: [], i: 0, j: 0, pivot: "" };',
        '  // TODO: 高斯-约当消元（全程使用精确分数 [分子, 分母]）',
        '  //   for col = 0..n-1:',
        '  //     在第 col..n-1 行中找一个 M[r][col] ≠ 0 的主元行，交换到第 col 行',
        '  //     把主元行整体除以主元（fdiv），使 M[col][col] = 1',
        '  //     对每一行 r ≠ col，用它减去 (M[r][col] × 主元行)，消掉该列',
        '  //     每次消元后把 M 的字符串形式写回 S.M，并 T.step(S, note)',
        '  var out = [];',
        '  for (i = 0; i < n; i++) out.push("0");',
        '  T.answer(out.join(" "));',
        '  return out.join(" ");',
        '}'
      ].join('\n'),
      pseudo: [
        'for col ← 0 to n-1:',
        '  在第 col..n-1 行中找 M[r][col] ≠ 0 的主元行，交换到 col 行',
        '  pv ← M[col][col]',
        '  第 col 行整行除以 pv',
        '  for r ← 0 to n-1, r ≠ col:',
        '    f ← M[r][col]',
        '    第 r 行 ← 第 r 行 - f × 第 col 行',
        'answer ← M[i][n] (i = 0..n-1)'
      ],
      gen: 'function(r){ var n = 1 + Math.floor(Math.random()*4), i, j; var x = [], A = [], b = []; for (i=0;i<n;i++) x.push(Math.floor(Math.random()*5) - 2); for (i=0;i<n;i++){ var row = [], s = 0; for (j=0;j<n;j++){ var v = (i===j) ? (4 + Math.floor(Math.random()*4)) : (Math.floor(Math.random()*3) - 1); row.push(v); s += v * x[j]; } A.push(row); b.push(s); } var lines = [n]; for (i=0;i<n;i++) lines.push(A[i].join(" ") + " " + b[i]); return lines.join("\\n"); }'
    },
    tips: [
      '必须用精确分数运算：本题答案是分数时，浮点误差会导致输出格式对不上',
      '选主元时要找「当前列非零」的行；若整列全零说明行列式为 0，本题保证不会出现',
      '消元后用归一化的主元行去消其它行的同一列（高斯-约当），最后最后一列就是解'
    ]
  });

  /* ==========================================================================
   * p56 点在有向直线的哪一侧（计算几何 · 叉积）
   * ========================================================================*/
  window.CSP.problems.push({
    id: 'p56', no: 56, title: '点在有向直线的哪一侧', diff: 3, tier: '提高',
    knowledge: ['math.geometry'],
    limits: { time: '1s', memory: '128MB' },
    statement: '平面上给出两个不同的点 A、B，它们确定一条有向直线 A → B，再给出 m 个点 P_1..P_m。\n' +
      '对每个点 P，请判断它与这条有向直线的关系，规则如下（全部基于叉积，只用整数运算）：\n' +
      '- 令 cr = (B.x − A.x)(P.y − A.y) − (B.y − A.y)(P.x − A.x)；\n' +
      '- cr > 0：P 在有向直线 A → B 的左侧，输出 L；\n' +
      '- cr < 0：P 在右侧，输出 R；\n' +
      '- cr = 0 且 (P − A)·(P − B) ≤ 0：P 落在线段 AB 上，输出 S；\n' +
      '- cr = 0 但 P 在直线 AB 上且在线段 AB 之外，输出 0。',
    inputFormat: '第一行四个整数 Ax Ay Bx By（|坐标| ≤ 10^4，且 A ≠ B）。\n' +
      '第二行一个整数 m（1 ≤ m ≤ 8）。\n' +
      '接下来 m 行，每行两个整数 Px Py（|坐标| ≤ 10^4）。',
    outputFormat: '共 m 行，第 i 行是第 i 个点的判定结果，取值为 L、R、S、0 之一。',
    samples: [
      {
        input: '0 0 4 0\n4\n2 3\n2 -3\n2 0\n5 0',
        output: 'L\nR\nS\n0',
        explain: 'A→B 沿 x 轴正方向：(2,3) 在左侧，(2,−3) 在右侧，(2,0) 在线段上，(5,0) 在延长线上'
      }
    ],
    tests: [
      { input: '0 0 4 0\n4\n2 3\n2 -3\n2 0\n5 0\n', output: 'L\nR\nS\n0', score: 20 },
      { input: '1 1 3 3\n4\n0 0\n2 2\n1 3\n4 4\n', output: '0\nS\nL\n0', score: 20 },
      { input: '-3 -2 2 5\n3\n0 0\n-1 2\n5 -9\n', output: 'R\nL\nR', score: 20 },
      { input: '0 0 0 5\n3\n1 2\n-1 3\n0 6\n', output: 'R\nL\n0', score: 20 },
      { input: '2 1 7 4\n5\n0 0\n1 1\n4 0\n3 2\n9 9\n', output: 'L\nL\nR\nL\nL', score: 20 }
    ],
    std: {
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main(){',
        '    long long ax,ay,bx,by;',
        '    if(!(cin>>ax>>ay>>bx>>by)) return 0;',
        '    int m; cin>>m;',
        '    for(int i=0;i<m;i++){',
        '        long long px,py; cin>>px>>py;',
        '        long long cr = (bx-ax)*(py-ay) - (by-ay)*(px-ax);',
        '        if(cr>0) cout<<"L\\n";',
        '        else if(cr<0) cout<<"R\\n";',
        '        else {',
        '            long long dot = (px-ax)*(px-bx) + (py-ay)*(py-by);',
        '            cout << (dot<=0 ? "S" : "0") << "\\n";',
        '        }',
        '    }',
        '    return 0;',
        '}'
      ].join('\n')
    },
    algo: {
      title: '叉积判侧：cr = (B−A) × (P−A)，符号决定左 / 右',
      viz: {
        input: '0 0 4 0\n4\n2 3\n2 -3\n2 0\n5 0',
        type: 'matrix', mainKey: 'pts', highlight: ['i', 'j'],
        title: '待判定的点（每行一个点，两列是 x、y）'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var ax = tk.int(), ay = tk.int(), bx = tk.int(), by = tk.int();',
        '  var m = tk.int();',
        '  var pts = [], i;',
        '  for (i = 0; i < m; i++) pts.push([tk.int(), tk.int()]);',
        '  var S = { pts: pts, i: 0, j: 0, ax: ax, ay: ay, bx: bx, by: by, cr: 0, res: "" };',
        '  T.step(S, "有向直线 A(" + ax + "," + ay + ") → B(" + bx + "," + by + ")，共 " + m + " 个待判点");',
        '  var out = [];',
        '  for (S.i = 0; S.i < m; S.i++){',
        '    var px = pts[S.i][0], py = pts[S.i][1], t;',
        '    S.j = 0; S.cr = (bx - ax) * (py - ay);',
        '    T.step(S, "第 " + S.i + " 个点 (" + px + "," + py + ")：读横坐标，先算 (Bx−Ax)(Py−Ay) = " + S.cr);',
        '    S.j = 1; S.cr = (by - ay) * (px - ax);',
        '    T.step(S, "再读纵坐标，算 (By−Ay)(Px−Ax) = " + S.cr);',
        '    S.cr = (bx - ax) * (py - ay) - (by - ay) * (px - ax);',
        '    if (S.cr > 0) t = "L";',
        '    else if (S.cr < 0) t = "R";',
        '    else {',
        '      var dot = (px - ax) * (px - bx) + (py - ay) * (py - by);',
        '      t = (dot <= 0) ? "S" : "0";',
        '    }',
        '    out.push(t);',
        '    S.res = out.join(" "); S.j = 1;',
        '    T.step(S, "叉积 = " + S.cr + "，判定结果 " + t + "（当前 " + S.res + "）");',
        '  }',
        '  var ans = out.join("\\n");',
        '  T.answer(ans);',
        '  return ans;',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var ax = tk.int(), ay = tk.int(), bx = tk.int(), by = tk.int();',
        '  var m = tk.int();',
        '  var pts = [], i;',
        '  for (i = 0; i < m; i++) pts.push([tk.int(), tk.int()]);',
        '  var S = { pts: pts, i: 0, j: 0, ax: ax, ay: ay, bx: bx, by: by, cr: 0, res: "" };',
        '  T.step(S, "有向直线 A(" + ax + "," + ay + ") → B(" + bx + "," + by + ")，共 " + m + " 个待判点");',
        '  var out = [];',
        '  // TODO: 对每个点 P 计算叉积 cr = (Bx−Ax)(Py−Ay) − (By−Ay)(Px−Ax)',
        '  //   cr > 0 → "L"；cr < 0 → "R"；cr = 0 时再看点积 (P−A)·(P−B)：≤ 0 为 "S"，否则为 "0"',
        '  //   每判定一个点都要 T.step(S, note)，并把已得结果写进 S.res',
        '  var ans = out.join("\\n");',
        '  T.answer(ans);',
        '  return ans;',
        '}'
      ].join('\n'),
      pseudo: [
        'for i ← 1 to m:',
        '  cr ← (B.x-A.x)(P.y-A.y) - (B.y-A.y)(P.x-A.x)',
        '  if cr > 0 then 输出 L',
        '  else if cr < 0 then 输出 R',
        '  else',
        '    dot ← (P.x-A.x)(P.x-B.x) + (P.y-A.y)(P.y-B.y)',
        '    输出 dot ≤ 0 ? S : 0'
      ],
      gen: 'function(r){ var ax = Math.floor(Math.random()*11)-5, ay = Math.floor(Math.random()*11)-5; var bx = Math.floor(Math.random()*11)-5, by = Math.floor(Math.random()*11)-5; var m = 1 + Math.floor(Math.random()*5); var lines = [ax+" "+ay+" "+bx+" "+by, String(m)]; for (var i=0;i<m;i++) lines.push((Math.floor(Math.random()*13)-6) + " " + (Math.floor(Math.random()*13)-6)); return lines.join("\\n"); }'
    },
    tips: [
      '叉积 (B−A)×(P−A) 的符号表示 P 在有向直线 A→B 的哪一侧：正为左、负为右',
      '叉积为 0 只说明共线，还要用点积 (P−A)·(P−B) ≤ 0 判断是否落在线段上',
      '全程整数运算，不要开方、不要除法，避免精度问题'
    ]
  });

  /* ==========================================================================
   * p57 离散对数（BSGS 大步小步算法）
   * ========================================================================*/
  window.CSP.problems.push({
    id: 'p57', no: 57, title: '离散对数', diff: 5, tier: '省选-',
    knowledge: ['math.bsgs', 'math.pow'],
    limits: { time: '1s', memory: '128MB' },
    statement: '给定素数 p 以及整数 a、b，求最小的非负整数 x，使得 a^x ≡ b (mod p)。若不存在这样的 x，输出 −1。\n' +
      '用 BSGS（Baby-Step Giant-Step）算法：\n' +
      '- 令 m = ⌈√p⌉，把 x 写成 x = i·m + j（0 ≤ j < m）；\n' +
      '- 先把所有 a^j mod p（0 ≤ j < m）存进哈希表（小步）；\n' +
      '- 原式变为 a^(i·m) · a^j ≡ b，即 a^j ≡ b · (a^(−m))^i，枚举 i = 0, 1, … 查表即可（大步）。\n' +
      '由于 p 是素数且 1 ≤ a < p，a 一定存在模 p 的逆元，可以用费马小定理求 a^(−m) = (a^m)^(p−2)。',
    inputFormat: '一行三个整数 p, a, b（2 ≤ p ≤ 10^9 且 p 为素数，1 ≤ a, b < p）。',
    outputFormat: '一行一个整数，表示最小的非负整数解 x；若不存在则输出 -1。',
    samples: [
      {
        input: '23 5 6',
        output: '18',
        explain: '5^18 mod 23 = 6，且 0..17 中没有更小的解'
      }
    ],
    tests: [
      { input: '23 5 6\n', output: '18', score: 20 },
      { input: '7 2 3\n', output: '-1', score: 20 },
      { input: '101 7 99\n', output: '39', score: 20 },
      { input: '1000000007 5 123456789\n', output: '981640996', score: 20 },
      { input: '1000000007 1 2\n', output: '-1', score: 20 }
    ],
    std: {
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'typedef long long ll;',
        'll mulmod(ll a, ll b, ll m){ return (__int128)a*b%m; }',
        'll pw(ll a, ll e, ll m){ ll r=1%m; a%=m; while(e){ if(e&1) r=mulmod(r,a,m); a=mulmod(a,a,m); e>>=1; } return r; }',
        'int main(){',
        '    ll p,a,b;',
        '    if(!(cin>>p>>a>>b)) return 0;',
        '    ll m = (ll)ceil(sqrt((long double)p));',
        '    while(m*m < p) m++;',
        '    unordered_map<ll,ll> tb;',
        '    tb.reserve((size_t)m*2+10);',
        '    ll cur = 1%p;',
        '    for(ll j=0;j<m;j++){',
        '        if(!tb.count(cur)) tb[cur]=j;',
        '        cur = mulmod(cur,a,p);',
        '    }',
        '    ll gm = pw(a,m,p);',
        '    ll ginv = pw(gm, p-2, p);',
        '    ll x = -1, g = b;',
        '    for(ll i=0;i<=m;i++){',
        '        auto it = tb.find(g);',
        '        if(it != tb.end()){ x = i*m + it->second; break; }',
        '        g = mulmod(g, ginv, p);',
        '    }',
        '    cout << x << endl;',
        '    return 0;',
        '}'
      ].join('\n')
    },
    algo: {
      title: 'BSGS：小步建表 a^j，大步乘 a^(−m) 查表',
      viz: {
        input: '23 5 6',
        type: 'array', mainKey: 'baby', pointers: ['j'], highlight: ['j'],
        title: '小步表 a^j mod p'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var p = tk.int(), a = tk.int(), b = tk.int();',
        '  var Bp = BigInt(p);',
        '  function mul(x, y){ return Number((BigInt(x) * BigInt(y)) % Bp); }',
        '  function pw(base, e){ var r = 1 % p, B = base % p, E = e; while (E > 0){ if (E & 1) r = mul(r, B); B = mul(B, B); E = Math.floor(E / 2); } return r; }',
        '  var m = Math.ceil(Math.sqrt(p));',
        '  var stride = Math.max(1, Math.ceil(m / 24));',
        '  var baby = [], disp = [], tbl = {}, cur = 1 % p, j;',
        '  var S = { p: p, a: a, b: b, m: m, baby: disp, j: -1, i: -1, cur: 0, ans: "" };',
        '  T.step(S, "p = " + p + "，块大小 m = ceil(sqrt(p)) = " + m + "，每隔 " + stride + " 步记录一次画面");',
        '  for (j = 0; j < m; j++){',
        '    S.j = j; S.cur = cur;',
        '    baby.push(cur);',
        '    if (disp.length < 64) disp.push(cur);',
        '    if (tbl[cur] === undefined) tbl[cur] = j;',
        '    if (j % stride === 0) T.step(S, "小步 j = " + j + "：a^" + j + " mod p = " + cur);',
        '    cur = mul(cur, a);',
        '  }',
        '  var gm = pw(a, m), ginv = pw(gm, p - 2), x = -1, g = b;',
        '  for (var i = 0; i <= m; i++){',
        '    S.i = i; S.cur = g;',
        '    if (tbl[g] !== undefined){',
        '      x = i * m + tbl[g];',
        '      T.step(S, "大步 i = " + i + " 命中 " + g + "（对应小步 j = " + tbl[g] + "），x = " + x);',
        '      break;',
        '    }',
        '    if (i % stride === 0) T.step(S, "大步 i = " + i + "：b·(a^-m)^i = " + g + "，表中无匹配");',
        '    g = mul(g, ginv);',
        '  }',
        '  S.ans = String(x);',
        '  T.step(S, x >= 0 ? "最小非负解 x = " + x : "不存在这样的 x，输出 -1");',
        '  T.answer(String(x));',
        '  return String(x);',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var p = tk.int(), a = tk.int(), b = tk.int();',
        '  var Bp = BigInt(p);',
        '  function mul(x, y){ return Number((BigInt(x) * BigInt(y)) % Bp); }',
        '  function pw(base, e){ var r = 1 % p, B = base % p, E = e; while (E > 0){ if (E & 1) r = mul(r, B); B = mul(B, B); E = Math.floor(E / 2); } return r; }',
        '  var m = Math.ceil(Math.sqrt(p));',
        '  var stride = Math.max(1, Math.ceil(m / 24));',
        '  var baby = [], disp = [], tbl = {}, cur = 1 % p, j;',
        '  var S = { p: p, a: a, b: b, m: m, baby: disp, j: -1, i: -1, cur: 0, ans: "" };',
        '  T.step(S, "p = " + p + "，块大小 m = ceil(sqrt(p)) = " + m);',
        '  // TODO: BSGS（注意数最大到 10^9，两个数相乘会超过 2^53，请用 mul/pw 里的 BigInt 取模乘法）',
        '  //   1) 小步：for j = 0..m-1 存下 a^j mod p，哈希表里只保留最小的 j',
        '  //   2) 大步：令 g = b，每次 g ← g · (a^m)^(p-2) mod p，若 g 在表中则 x = i·m + 表中值',
        '  //   循环 i = 0..m，找到就 break；找不到说明无解，输出 -1',
        '  //   小规模数据可以每步 T.step(S, note)，大 p 请按 stride 抽样记录',
        '  var x = -1;',
        '  S.ans = String(x);',
        '  T.answer(String(x));',
        '  return String(x);',
        '}'
      ].join('\n'),
      pseudo: [
        'm ← ceil(sqrt(p))',
        'cur ← 1；for j ← 0 to m-1: 表[cur] ← j（只记最小 j）；cur ← cur·a mod p',
        'g ← b；ginv ← (a^m)^(p-2) mod p',
        'for i ← 0 to m:',
        '  若 g 在表中，则 x ← i·m + 表[g]，结束',
        '  g ← g·ginv mod p',
        'answer ← x（找不到为 -1）'
      ],
      gen: 'function(r){ var ps = [23, 101, 1009, 1000000007]; var p = ps[Math.floor(Math.random()*ps.length)]; var a = 2 + Math.floor(Math.random()*(p-2)); var b = 1 + Math.floor(Math.random()*(p-1)); return p + " " + a + " " + b; }'
    },
    tips: [
      'a 与 p 互质（p 为素数且 a < p）时才有逆元，(a^m)^(p−2) 就是 a^(−m)',
      '小步表里同一个值可能出现多次，要保留最小的 j，否则求出的 x 不是最小的',
      '大整数乘法：JS 里 10^9 × 10^9 超过 2^53，必须用 BigInt（或拆位乘法）取模'
    ]
  });
})();
