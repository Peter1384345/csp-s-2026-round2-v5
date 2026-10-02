/* ============================================================================
 * CSP-S 2026 第二轮 · 题目数据 E 卷：字符串 + 数学 (p36–p43)
 * ----------------------------------------------------------------------------
 * 本题库遵循 docs/CONTENT-SCHEMA.md 的内容契约：
 *   每题包含 std(C++17 参考程序) / algo.ref(JS 追踪版) /
 *   algo.userTemplate(挖空起步代码) / algo.viz(可视化描述) / algo.gen(随机生成器)。
 *   测试点恰好 5 组，每组 20 分，tests[i].output 与 std.code 真实运行结果一致。
 * 本文件为纯静态脚本，禁止 import/export。
 * ==========================================================================*/
(function () {
  'use strict';
  window.CSP = window.CSP || {};
  window.CSP.problems = window.CSP.problems || [];

  /* ==========================================================================
   * p36 · KMP 字符串匹配
   * ========================================================================*/
  window.CSP.problems.push({
    id: 'p36', no: 36, title: '模式串出现位置', diff: 3, tier: '提高',
    knowledge: ['str.kmp', 'str.basic'],
    limits: { time: '1s', memory: '256MB' },
    statement: '给定一个文本串 S 和一个模式串 P（均只含小写字母），求 P 在 S 中所有出现的起始位置。\n位置从 1 开始编号，即 P 与 S 的第 k 个字符对齐时若完全相同，则称 P 在位置 k 出现。\n请按升序输出所有出现位置。\n\n数据范围：1 ≤ |P| ≤ |S| ≤ 10^6。',
    inputFormat: '第一行一个字符串 S，第二行一个字符串 P（两串中间无空格）。',
    outputFormat: '第一行一个整数 k，表示出现次数。\n若 k > 0，第二行输出 k 个升序整数，表示每次出现的起始位置（1 起）；若 k = 0，只输出第一行。',
    samples: [
      { input: 'abababa\naba', output: '3\n1 3 5', explain: 'S[1..3]=aba、S[3..5]=aba、S[5..7]=aba，共 3 次' }
    ],
    tests: [
      { input: 'abababa\naba\n', output: '3\n1 3 5', score: 20 },
      { input: 'aaaaa\naa\n', output: '4\n1 2 3 4', score: 20 },
      { input: 'abc\nz\n', output: '0', score: 20 },
      { input: 'mississippi\nissi\n', output: '2\n2 5', score: 20 },
      { input: 'abababab\nabab\n', output: '3\n1 3 5', score: 20 }
    ],
    std: {
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main(){',
        '    ios::sync_with_stdio(false);',
        '    cin.tie(nullptr);',
        '    string s, p;',
        '    if(!(cin >> s)) return 0;',
        '    cin >> p;',
        '    int n = (int)s.size(), m = (int)p.size();',
        '    vector<int> pi(m, 0);',
        '    for (int i = 1; i < m; i++) {',
        '        int j = pi[i-1];',
        '        while (j > 0 && p[i] != p[j]) j = pi[j-1];',
        '        if (p[i] == p[j]) j++;',
        '        pi[i] = j;',
        '    }',
        '    vector<int> res;',
        '    int j = 0;',
        '    for (int i = 0; i < n; i++) {',
        '        while (j > 0 && s[i] != p[j]) j = pi[j-1];',
        '        if (s[i] == p[j]) j++;',
        '        if (j == m) { res.push_back(i - m + 2); j = pi[j-1]; }',
        '    }',
        '    cout << res.size() << "\\n";',
        '    for (size_t k = 0; k < res.size(); k++) {',
        '        if (k) cout << " ";',
        '        cout << res[k];',
        '    }',
        '    if (!res.empty()) cout << "\\n";',
        '    return 0;',
        '}'
      ].join('\n')
    },
    algo: {
      title: 'KMP：前缀函数 + 线性扫描',
      viz: {
        input: 'abababc\nabab', type: 'string', mainKey: 's',
        pointers: ['i'], highlight: ['i'], labels: { i: 'i' },
        title: 'KMP 匹配过程（i 为文本指针）'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var s = tk.next(), p = tk.next();',
        '  var n = s.length, m = p.length;',
        '  var S = { n: n, m: m, s: s.split(""), p: p.split(""), pi: [], i: 0, j: 0, hits: [] };',
        '  for (var k = 0; k < m; k++) S.pi.push(0);',
        '  T.step(S, \'文本长度 \' + n + \'，模式长度 \' + m);',
        '  for (S.i = 1; S.i < m; S.i++) {',
        '    var j = S.pi[S.i - 1];',
        '    S.j = j;',
        '    while (j > 0 && p.charAt(S.i) !== p.charAt(j)) {',
        '      j = S.pi[j - 1];',
        '      S.j = j;',
        '      T.step(S, \'前缀失配：j 回退到 \' + j);',
        '    }',
        '    if (p.charAt(S.i) === p.charAt(j)) j++;',
        '    S.pi[S.i] = j;',
        '    S.j = j;',
        '    T.step(S, \'pi[\' + S.i + \'] = \' + j);',
        '  }',
        '  S.j = 0;',
        '  for (var t = 0; t < n; t++) {',
        '    S.i = t;',
        '    while (S.j > 0 && s.charAt(t) !== p.charAt(S.j)) {',
        '      S.j = S.pi[S.j - 1];',
        '      T.step(S, \'文本失配：j 回退到 \' + S.j);',
        '    }',
        '    if (s.charAt(t) === p.charAt(S.j)) S.j++;',
        '    if (S.j === m) {',
        '      S.hits.push(t - m + 2);',
        '      S.j = S.pi[S.j - 1];',
        '      T.step(S, \'在位置 \' + (t - m + 2) + \' 匹配成功\');',
        '    } else {',
        '      T.step(S, \'i = \' + t + \'，j = \' + S.j);',
        '    }',
        '  }',
        '  var NL = String.fromCharCode(10);',
        '  var ans = String(S.hits.length) + (S.hits.length ? NL + S.hits.join(" ") : "");',
        '  T.answer(ans);',
        '  return ans;',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var s = tk.next(), p = tk.next();',
        '  var S = { n: s.length, m: p.length, s: s.split(""), p: p.split(""), pi: [], i: 0, j: 0, hits: [] };',
        '  for (var k = 0; k < S.m; k++) S.pi.push(0);',
        '  T.step(S, \'已读入文本与模式串\');',
        '  // TODO 1: 计算模式串的前缀函数 pi（第 8–18 行参考实现），每步调用 T.step(S, note)',
        '  // TODO 2: 用 pi 在文本上线性扫描；匹配成功时把 1 起的起始位置压入 S.hits，并回退 j = pi[j-1]',
        '  var NL = String.fromCharCode(10);',
        '  var ans = String(S.hits.length) + (S.hits.length ? NL + S.hits.join(" ") : "");',
        '  T.answer(ans);',
        '  return ans;',
        '}'
      ].join('\n'),
      pseudo: [
        'pi[0] ← 0',
        'for i ← 1 to m-1',
        '  j ← pi[i-1]; while j>0 and P[i]≠P[j]: j ← pi[j-1]',
        '  if P[i]=P[j] then j++; pi[i] ← j',
        'j ← 0',
        'for i ← 0 to n-1',
        '  while j>0 and S[i]≠P[j]: j ← pi[j-1]',
        '  if S[i]=P[j] then j++',
        '  if j=m then 输出 i-m+2; j ← pi[j-1]'
      ],
      gen: 'function(r){ var n = 6 + Math.floor(Math.random()*10); var s = ""; for (var i=0;i<n;i++) s += "ab".charAt(Math.floor(Math.random()*2)); var m = 1 + Math.floor(Math.random()*3); var p = s.substr(Math.floor(Math.random()*n), m); return s + String.fromCharCode(10) + p; }'
    },
    tips: [
      '匹配成功后必须执行 j = pi[j-1]（而不是归零），否则会漏掉重叠出现',
      'cin >> s >> p 按空白读入，不会把行尾的 \\r 带进字符串，比 getline 更稳',
      '本题要用 O(n+m) 的 KMP；暴力 O(nm) 在 10^6 规模下必然超时'
    ]
  });

  /* ==========================================================================
   * p37 · 字符串哈希（判重）
   * ========================================================================*/
  window.CSP.problems.push({
    id: 'p37', no: 37, title: '字符串判重', diff: 3, tier: '提高',
    knowledge: ['str.hash', 'ds.hash'],
    limits: { time: '1s', memory: '256MB' },
    statement: '给定 n 个只含小写字母的字符串，请你统计其中**不同的**字符串有多少个。\n两个字符串相同，当且仅当它们长度相同且每一位字符都相同。\n\n数据范围：1 ≤ n ≤ 10^5，每个字符串长度在 1 到 100 之间。\n提示：把每个字符串用一个多项式哈希值来表示，再统计不同哈希值的个数即可。',
    inputFormat: '第一行一个整数 n。接下来 n 行，每行一个只含小写字母的非空字符串。',
    outputFormat: '一个整数，表示不同字符串的个数。',
    samples: [
      { input: '4\nab\nab\nabc\nab', output: '2', explain: '不同的串是 ab 和 abc，共 2 个' }
    ],
    tests: [
      { input: '4\nab\nab\nabc\nab\n', output: '2', score: 20 },
      { input: '1\nhello\n', output: '1', score: 20 },
      { input: '5\na\na\na\na\na\n', output: '1', score: 20 },
      { input: '6\nabc\nbca\ncab\nabc\ncba\nbac\n', output: '5', score: 20 },
      { input: '7\nxy\nxyz\nxy\nxyzx\nxy\nxyz\nxy\n', output: '3', score: 20 }
    ],
    std: {
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main(){',
        '    ios::sync_with_stdio(false);',
        '    cin.tie(nullptr);',
        '    int n; cin >> n;',
        '    vector<string> v(n);',
        '    for (int i = 0; i < n; i++) cin >> v[i];',
        '    sort(v.begin(), v.end());',
        '    v.erase(unique(v.begin(), v.end()), v.end());',
        '    cout << v.size() << "\\n";',
        '    return 0;',
        '}'
      ].join('\n')
    },
    algo: {
      title: '双哈希：逐字符滚动求哈希值，统计不同哈希值',
      viz: {
        input: '4\nab\nab\nabc\nab', type: 'string', mainKey: 'chars',
        pointers: ['i'], highlight: ['i'], labels: { i: 'i' },
        title: '逐字符计算哈希值'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int();',
        '  var M1 = 1000000007, M2 = 998244353, B = 131;',
        '  var seen = {};',
        '  var S = { n: n, k: 0, s: "", chars: [], i: 0, h1: 0, h2: 0, cnt: 0, keys: [] };',
        '  T.step(S, \'共 \' + n + \' 个字符串，用双哈希判重\');',
        '  for (S.k = 0; S.k < n; S.k++) {',
        '    var s = tk.next();',
        '    S.s = s; S.chars = s.split(""); S.i = 0; S.h1 = 0; S.h2 = 0;',
        '    T.step(S, \'处理第 \' + (S.k + 1) + \' 个字符串 \' + s);',
        '    for (S.i = 0; S.i < s.length; S.i++) {',
        '      var c = s.charCodeAt(S.i);',
        '      S.h1 = (S.h1 * B + c) % M1;',
        '      S.h2 = (S.h2 * B + c) % M2;',
        '      T.step(S, \'h = h * \' + B + \' + \' + c);',
        '    }',
        '    var key = S.h1 + "#" + S.h2;',
        '    if (!seen[key]) {',
        '      seen[key] = 1; S.cnt++; S.keys.push(S.h1);',
        '      T.step(S, \'哈希 \' + key + \' 首次出现，答案 +1\');',
        '    } else {',
        '      T.step(S, \'哈希 \' + key + \' 已经出现过\');',
        '    }',
        '  }',
        '  T.answer(String(S.cnt));',
        '  return String(S.cnt);',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int();',
        '  var M1 = 1000000007, M2 = 998244353, B = 131;',
        '  var seen = {};',
        '  var S = { n: n, k: 0, s: "", chars: [], i: 0, h1: 0, h2: 0, cnt: 0, keys: [] };',
        '  T.step(S, \'共 \' + n + \' 个字符串\');',
        '  // TODO 1: 对每个字符串逐字符滚动求哈希：h = (h * B + 字符编码) % MOD（建议双哈希）',
        '  // TODO 2: 用 seen 记录出现过的哈希值，首次出现时 S.cnt++，并调用 T.step(S, note)',
        '  T.answer(String(S.cnt));',
        '  return String(S.cnt);',
        '}'
      ].join('\n'),
      pseudo: [
        'cnt ← 0; seen ← 空集合',
        'for each string s:',
        '  h ← 0',
        '  for each char c in s: h ← (h * B + code(c)) mod M',
        '  if h ∉ seen then seen ← seen ∪ {h}; cnt++',
        '输出 cnt'
      ],
      gen: 'function(r){ var n = 1 + Math.floor(Math.random()*5); var out = String(n); for (var i=0;i<n;i++){ var L = 1 + Math.floor(Math.random()*3); var s = ""; for (var j=0;j<L;j++) s += "abc".charAt(Math.floor(Math.random()*3)); out += String.fromCharCode(10) + s; } return out; }'
    },
    tips: [
      '单模哈希在 10^5 个串的规模下可能被卡，建议双模（或 64 位自然溢出）',
      '哈希值要用 Number 计算时注意中间乘积：本模板中 h < 10^9、B = 131，乘积约 1.3×10^11，仍在 2^53 内安全',
      '字符串本身可以相同时，一定要用「集合」而不是「计数器」统计'
    ]
  });

  /* ==========================================================================
   * p38 · Manacher 最长回文子串
   * ========================================================================*/
  window.CSP.problems.push({
    id: 'p38', no: 38, title: '最长回文子串', diff: 4, tier: '提高+',
    knowledge: ['str.manacher', 'str.palindrome'],
    limits: { time: '1s', memory: '256MB' },
    statement: '给定一个只含小写字母的字符串 S，求它的最长回文子串的长度。\n回文串指正着读与倒着读完全相同的字符串，子串指 S 中连续的一段。\n\n数据范围：1 ≤ |S| ≤ 2×10^6。\n要求使用 Manacher 算法，时间复杂度 O(|S|)。',
    inputFormat: '一行一个只含小写字母的非空字符串 S。',
    outputFormat: '一个整数，表示最长回文子串的长度。',
    samples: [
      { input: 'babad', output: '3', explain: 'bab 与 aba 都是长度 3 的回文子串，最长长度为 3' }
    ],
    tests: [
      { input: 'babad\n', output: '3', score: 20 },
      { input: 'cbbd\n', output: '2', score: 20 },
      { input: 'a\n', output: '1', score: 20 },
      { input: 'forgeeksskeegfor\n', output: '10', score: 20 },
      { input: 'aaaa\n', output: '4', score: 20 }
    ],
    std: {
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main(){',
        '    ios::sync_with_stdio(false);',
        '    cin.tie(nullptr);',
        '    string s;',
        '    if(!(cin >> s)) return 0;',
        '    string t = "^#";',
        '    for (size_t i = 0; i < s.size(); i++) { t += s[i]; t += "#"; }',
        '    t += "$";',
        '    int N = (int)t.size();',
        '    vector<int> p(N, 0);',
        '    int c = 0, r = 0, best = 0;',
        '    for (int i = 1; i < N - 1; i++) {',
        '        int mir = 2 * c - i;',
        '        if (i < r) p[i] = min(r - i, p[mir]);',
        '        while (t[i + p[i] + 1] == t[i - p[i] - 1]) p[i]++;',
        '        if (i + p[i] > r) { c = i; r = i + p[i]; }',
        '        best = max(best, p[i]);',
        '    }',
        '    cout << best << "\\n";',
        '    return 0;',
        '}'
      ].join('\n')
    },
    algo: {
      title: 'Manacher：插入分隔符后中心扩展',
      viz: {
        input: 'abacaba', type: 'string', mainKey: 't',
        pointers: ['i', 'c', 'r'], highlight: ['i'],
        labels: { i: 'i 中心', c: 'C', r: 'R' },
        title: 'Manacher 中心扩展（t 为插入了 # 的串）'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var s = tk.next();',
        '  var t = "^#" + s.split("").join("#") + "#$";',
        '  var N = t.length;',
        '  var P = [];',
        '  for (var k = 0; k < N; k++) P.push(0);',
        '  var S = { s: s.split(""), t: t.split(""), p: P, n: s.length, i: 1, c: 0, r: 0, mir: 0, best: 0 };',
        '  T.step(S, \'插入分隔符后长度 \' + N + \'，开始中心扩展\');',
        '  for (S.i = 1; S.i < N - 1; S.i++) {',
        '    S.mir = 2 * S.c - S.i;',
        '    if (S.i < S.r) P[S.i] = Math.min(S.r - S.i, P[S.mir]);',
        '    while (t.charAt(S.i + P[S.i] + 1) === t.charAt(S.i - P[S.i] - 1)) P[S.i]++;',
        '    if (S.i + P[S.i] > S.r) { S.c = S.i; S.r = S.i + P[S.i]; }',
        '    if (P[S.i] > S.best) S.best = P[S.i];',
        '    T.step(S, \'以 \' + S.i + \' 为中心的回文半径 \' + P[S.i] + \'，当前最长 \' + S.best);',
        '  }',
        '  T.answer(String(S.best));',
        '  return String(S.best);',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var s = tk.next();',
        '  var t = "^#" + s.split("").join("#") + "#$";',
        '  var P = [];',
        '  for (var k = 0; k < t.length; k++) P.push(0);',
        '  var S = { s: s.split(""), t: t.split(""), p: P, n: s.length, i: 1, c: 0, r: 0, mir: 0, best: 0 };',
        '  T.step(S, \'已插入分隔符，长度 \' + t.length);',
        '  // TODO: 按 Manacher 的流程维护回文区间 [C-R, C+R]：',
        '  //   1) mir = 2*C - i；若 i < R 则 P[i] = min(R-i, P[mir])',
        '  //   2) 暴力向两侧扩展 while t[i+P[i]+1] === t[i-P[i]-1] 时 P[i]++',
        '  //   3) 若 i+P[i] > R 则更新 C、R；并用 P[i] 更新 best',
        '  //   每一步都要调用 T.step(S, note) 让画面能讲清发生了什么',
        '  T.answer(String(S.best));',
        '  return String(S.best);',
        '}'
      ].join('\n'),
      pseudo: [
        't ← "^#" + S 的每个字符间插 # + "#$"',
        'C ← 0, R ← 0, best ← 0',
        'for i ← 1 to N-2',
        '  mir ← 2C - i',
        '  if i < R then P[i] ← min(R-i, P[mir])',
        '  while t[i+P[i]+1] = t[i-P[i]-1] do P[i]++',
        '  if i+P[i] > R then C ← i, R ← i+P[i]',
        '  best ← max(best, P[i])'
      ],
      gen: 'function(r){ var n = 1 + Math.floor(Math.random()*10); var s = ""; for (var i=0;i<n;i++) s += "ab".charAt(Math.floor(Math.random()*2)); return s; }'
    },
    tips: [
      '插入分隔符后，原串回文长度恰好等于扩展出的半径 P[i]',
      '别忘了两端哨兵（^、$），否则 while 会越界',
      'for 循环的右端点是 N-2：两端哨兵本身不能作为回文中心'
    ]
  });

  /* ==========================================================================
   * p39 · 数论基础：扩展欧几里得解同余方程
   * ========================================================================*/
  window.CSP.problems.push({
    id: 'p39', no: 39, title: '同余方程的最小非负解', diff: 2, tier: '普及+',
    knowledge: ['math.gcd', 'math.mod'],
    limits: { time: '1s', memory: '128MB' },
    statement: '给定三个正整数 a, b, p，求解同余方程\n    a · x ≡ b (mod p)\n的最小非负整数解 x（即 0 ≤ x < p/gcd(a,p) 的那个解）。若方程无解，输出 -1。\n\n理论：方程有解当且仅当 gcd(a, p) 能整除 b；用扩展欧几里得算法求出 a·s + p·t = gcd(a,p) 的一组 (s, t)，即可构造出通解。\n\n数据范围：1 ≤ a, b, p ≤ 10^9。',
    inputFormat: '一行三个整数 a, b, p。',
    outputFormat: '一行一个整数：方程的最小非负整数解；若无解输出 -1。',
    samples: [
      { input: '3 1 7', output: '5', explain: '3×5 = 15 ≡ 1 (mod 7)' }
    ],
    tests: [
      { input: '3 1 7\n', output: '5', score: 20 },
      { input: '6 4 10\n', output: '4', score: 20 },
      { input: '4 5 8\n', output: '-1', score: 20 },
      { input: '123456789 987654321 1000000007\n', output: '167701868', score: 20 },
      { input: '1 999999999 1000000000\n', output: '999999999', score: 20 }
    ],
    std: {
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'typedef long long ll;',
        'll exgcd(ll a, ll b, ll &x, ll &y){',
        '    if (!b) { x = 1; y = 0; return a; }',
        '    ll x1, y1;',
        '    ll g = exgcd(b, a % b, x1, y1);',
        '    x = y1;',
        '    y = x1 - (a / b) * y1;',
        '    return g;',
        '}',
        'int main(){',
        '    ios::sync_with_stdio(false);',
        '    cin.tie(nullptr);',
        '    ll a, b, p;',
        '    cin >> a >> b >> p;',
        '    ll x, y;',
        '    ll g = exgcd(a, p, x, y);',
        '    if (b % g != 0) { cout << -1 << "\\n"; return 0; }',
        '    ll m = p / g;',
        '    ll ans = ((x % m) * ((b / g) % m)) % m;',
        '    ans = ((ans % m) + m) % m;',
        '    cout << ans << "\\n";',
        '    return 0;',
        '}'
      ].join('\n')
    },
    algo: {
      title: '扩展欧几里得：辗转相除求 Bézout 系数',
      viz: {
        input: '3 1 7', type: 'array', mainKey: 'seq',
        pointers: ['k'], highlight: ['k'],
        title: '辗转相除的余数序列'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var aS = tk.next(), bS = tk.next(), pS = tk.next();',
        '  var a = BigInt(aS), b = BigInt(bS), P = BigInt(pS);',
        '  var oldR = a, r = P, oldS = 1n, s = 0n;',
        '  var S = { a: Number(a), b: Number(b), p: Number(P), q: 0, rem: Number(P),',
        '            x: 0, g: 0, seq: [Number(a), Number(P)], k: 1, ans: "" };',
        '  T.step(S, \'解 \' + aS + "x ≡ " + bS + \' (mod \' + pS + \')，先做扩展欧几里得\');',
        '  while (r !== 0n) {',
        '    var q = oldR / r;',
        '    var nr = oldR - q * r;',
        '    var ns = oldS - q * s;',
        '    oldR = r; r = nr; oldS = s; s = ns;',
        '    S.q = Number(q);',
        '    S.rem = Number(oldR);',
        '    S.seq.push(Number(oldR));',
        '    S.k = S.seq.length - 1;',
        '    T.step(S, \'商 q = \' + S.q + \'，新的余数 = \' + S.rem);',
        '  }',
        '  var g = oldR;',
        '  S.g = Number(g);',
        '  var md = P / g;',
        '  var ans;',
        '  if (b % g !== 0n) {',
        '    ans = "-1";',
        '    T.step(S, \'gcd(a,p) = \' + Number(g) + \' 不能整除 \' + bS + \'，无解\');',
        '  } else {',
        '    var x0 = ((oldS % md) * ((b / g) % md)) % md;',
        '    x0 = ((x0 % md) + md) % md;',
        '    S.x = Number(x0);',
        '    ans = String(x0);',
        '    T.step(S, \'gcd = \' + Number(g) + \'，最小非负解 x = \' + ans);',
        '  }',
        '  S.ans = ans;',
        '  T.answer(ans);',
        '  return ans;',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var aS = tk.next(), bS = tk.next(), pS = tk.next();',
        '  var a = BigInt(aS), b = BigInt(bS), P = BigInt(pS);',
        '  var S = { a: Number(a), b: Number(b), p: Number(P), q: 0, rem: 0,',
        '            x: 0, g: 0, seq: [Number(a), Number(P)], k: 1, ans: "" };',
        '  T.step(S, \'开始求解 \' + aS + "x ≡ " + bS + \' (mod \' + pS + \')\');',
        '  // TODO 1: 迭代版扩展欧几里得：维护 (oldR, r) 与对应的 Bézout 系数 (oldS, s)',
        '  //         while (r !== 0n) { q = oldR / r; 同步更新 oldR,r,oldS,s; 每轮 T.step }',
        '  // TODO 2: 若 b % g !== 0 输出 -1；否则 x = oldS * (b/g) mod (P/g) 并归一化到 [0, P/g)',
        '  var ans = "-1";',
        '  S.ans = ans;',
        '  T.answer(ans);',
        '  return ans;',
        '}'
      ].join('\n'),
      pseudo: [
        'oldR ← a, r ← p; oldS ← 1, s ← 0',
        'while r ≠ 0:',
        '  q ← oldR div r',
        '  (oldR, r) ← (r, oldR - q·r)',
        '  (oldS, s) ← (s, oldS - q·s)',
        'g ← oldR',
        'if b mod g ≠ 0 then 输出 -1',
        'else x ← oldS · (b/g) mod (p/g)，输出归一化后的 x'
      ],
      gen: 'function(r){ var a = 1 + Math.floor(Math.random()*30); var p = 1 + Math.floor(Math.random()*30); var b = 1 + Math.floor(Math.random()*30); return a + " " + b + " " + p; }'
    },
    tips: [
      '必须用 long long / BigInt：Bézout 系数与商的乘积可能达到 10^18，int 一定溢出',
      '求出的 x 可能是负数，最后要 (x mod m + m) mod m 归一化',
      'p/g 才是模数：解不唯一，题目要求最小非负解，其周期是 p/gcd(a,p)'
    ]
  });

  /* ==========================================================================
   * p40 · 素数筛：区间素数计数
   * ========================================================================*/
  window.CSP.problems.push({
    id: 'p40', no: 40, title: '区间素数计数', diff: 3, tier: '普及+',
    knowledge: ['math.prime', 'basic.enumerate'],
    limits: { time: '1s', memory: '256MB' },
    statement: '给定两个整数 L 和 R，求区间 [L, R] 内素数的个数。\n素数指大于 1 且只有 1 和它本身两个因数的整数。\n\n数据范围：1 ≤ L ≤ R ≤ 10^6。\n要求用埃氏筛（或线性筛）在 O(R log log R) 时间内预处理出 [1, R] 内的所有素数。',
    inputFormat: '一行两个整数 L, R。',
    outputFormat: '一个整数，表示 [L, R] 内素数的个数。',
    samples: [
      { input: '2 30', output: '10', explain: '2,3,5,7,11,13,17,19,23,29 共 10 个' }
    ],
    tests: [
      { input: '2 30\n', output: '10', score: 20 },
      { input: '1 100\n', output: '25', score: 20 },
      { input: '100 200\n', output: '21', score: 20 },
      { input: '999900 1000000\n', output: '8', score: 20 },
      { input: '999983 999983\n', output: '1', score: 20 }
    ],
    std: {
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'int main(){',
        '    ios::sync_with_stdio(false);',
        '    cin.tie(nullptr);',
        '    int L, R;',
        '    cin >> L >> R;',
        '    vector<char> comp(R + 1, 0);',
        '    if (R >= 1) comp[1] = 1;',
        '    for (int i = 2; (long long)i * i <= R; i++) {',
        '        if (!comp[i]) {',
        '            for (long long j = (long long)i * i; j <= R; j += i) comp[(int)j] = 1;',
        '        }',
        '    }',
        '    int cnt = 0;',
        '    for (int x = max(L, 2); x <= R; x++) if (!comp[x]) cnt++;',
        '    cout << cnt << "\\n";',
        '    return 0;',
        '}'
      ].join('\n')
    },
    algo: {
      title: '埃氏筛：标记合数后统计区间',
      viz: {
        input: '2 20', type: 'array', mainKey: 'mark',
        pointers: ['i'], highlight: ['i'],
        title: '标记数组（下标即数字，1 表示合数）'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var L = tk.int(), R = tk.int();',
        '  var comp = new Uint8Array(R + 1);',
        '  if (R >= 1) comp[1] = 1;',
        '  var small = R <= 60;',
        '  var S = { L: L, R: R, i: 0, mark: [], cnt: 0 };',
        '  function view() {',
        '    var a = [];',
        '    for (var x = 0; x <= R; x++) a.push(comp[x]);',
        '    return a;',
        '  }',
        '  if (small) S.mark = view();',
        '  T.step(S, \'准备筛出 [1, \' + R + \'] 内的合数（大输入的标记数组不下发到画面）\');',
        '  var lim = Math.floor(Math.sqrt(R));',
        '  for (S.i = 2; S.i <= lim; S.i++) {',
        '    if (!comp[S.i]) {',
        '      for (var j = S.i * S.i; j <= R; j += S.i) comp[j] = 1;',
        '      if (small) S.mark = view();',
        '      T.step(S, \'用素数 \' + S.i + \' 划掉它的倍数\');',
        '    }',
        '  }',
        '  var x0 = L < 2 ? 2 : L;',
        '  for (var x = x0; x <= R; x++) if (!comp[x]) S.cnt++;',
        '  if (small) S.mark = view();',
        '  T.step(S, \'[\' + L + \', \' + R + \'] 中共有 \' + S.cnt + \' 个素数\');',
        '  T.answer(String(S.cnt));',
        '  return String(S.cnt);',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var L = tk.int(), R = tk.int();',
        '  var comp = new Uint8Array(R + 1);',
        '  if (R >= 1) comp[1] = 1;',
        '  var S = { L: L, R: R, i: 0, mark: [], cnt: 0 };',
        '  T.step(S, \'准备筛出 [1, \' + R + \'] 内的合数\');',
        '  // TODO 1: 埃氏筛：i 从 2 到 sqrt(R)，若 comp[i] == 0 则把 i*i, i*i+i, ... 全部标为合数',
        '  //         注意 1 不是素数，要先把 comp[1] 置 1',
        '  // TODO 2: 统计 [max(L,2), R] 中 comp[x] == 0 的个数（不要写进 S.mark 以免状态过大）',
        '  T.answer(String(S.cnt));',
        '  return String(S.cnt);',
        '}'
      ].join('\n'),
      pseudo: [
        'comp[1] ← 1',
        'for i ← 2 while i*i ≤ R',
        '  if comp[i] = 0 then',
        '    for j ← i*i to R step i: comp[j] ← 1',
        'cnt ← 0',
        'for x ← max(L,2) to R: if comp[x] = 0 then cnt++'
      ],
      gen: 'function(r){ var L = 1 + Math.floor(Math.random()*60); var R = L + Math.floor(Math.random()*60); return L + " " + R; }'
    },
    tips: [
      '1 不是素数，统计时下界要取 max(L, 2)，同时预处理时把 1 标成合数',
      '内层循环从 i*i 开始：比 i*i 小的 i 的倍数已经被更小的素数划掉了',
      'i*i 可能超出 int 范围（R 接近 10^6 时不会，但写 long long 更保险）'
    ]
  });

  /* ==========================================================================
   * p41 · 快速幂与费马小定理求逆元
   * ========================================================================*/
  window.CSP.problems.push({
    id: 'p41', no: 41, title: '快速幂与逆元', diff: 3, tier: '提高',
    knowledge: ['math.pow', 'math.mod'],
    limits: { time: '1s', memory: '128MB' },
    statement: '给定整数 a, b, p，其中 p 是素数且 1 ≤ a < p，请你计算：\n1. a^b mod p；\n2. a 在模 p 意义下的乘法逆元，即满足 a · x ≡ 1 (mod p) 的 x（由费马小定理，x = a^(p-2) mod p）。\n\n数据范围：1 ≤ a < p ≤ 10^9+7（p 为素数），0 ≤ b ≤ 10^9。\n要求用二进制快速幂，单次幂运算 O(log b)。',
    inputFormat: '一行三个整数 a, b, p。',
    outputFormat: '一行两个整数，依次是 a^b mod p 与 a^(-1) mod p。',
    samples: [
      { input: '2 10 1009', output: '15 505', explain: '2^10 = 1024 ≡ 15 (mod 1009)；2×505 = 1010 ≡ 1 (mod 1009)' }
    ],
    tests: [
      { input: '2 10 1009\n', output: '15 505', score: 20 },
      { input: '3 13 1000000007\n', output: '1594323 333333336', score: 20 },
      { input: '1 0 1000000007\n', output: '1 1', score: 20 },
      { input: '123456789 987654321 998244353\n', output: '730701112 25170271', score: 20 },
      { input: '2 1000000000 1000000007\n', output: '140625001 500000004', score: 20 }
    ],
    std: {
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'typedef long long ll;',
        'll qpow(ll a, ll e, ll p){',
        '    ll r = 1 % p; a %= p;',
        '    while (e > 0) {',
        '        if (e & 1) r = r * a % p;',
        '        a = a * a % p;',
        '        e >>= 1;',
        '    }',
        '    return r;',
        '}',
        'int main(){',
        '    ios::sync_with_stdio(false);',
        '    cin.tie(nullptr);',
        '    ll a, b, p;',
        '    cin >> a >> b >> p;',
        '    ll pw = qpow(a, b, p);',
        '    ll inv = qpow(a, p - 2, p);',
        '    cout << pw << " " << inv << "\\n";',
        '    return 0;',
        '}'
      ].join('\n')
    },
    algo: {
      title: '二进制快速幂（平方求幂）+ 费马小定理求逆元',
      viz: {
        input: '2 10 1009', type: 'array', mainKey: 'bits',
        pointers: ['k'], highlight: ['k'],
        title: '指数 b 的二进制位（从低位到高位）'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var aS = tk.next(), bS = tk.next(), pS = tk.next();',
        '  var a = BigInt(aS), b = BigInt(bS), P = BigInt(pS);',
        '  function mp(base, exp) {',
        '    var r = 1n, bb = base % P, ee = exp;',
        '    while (ee > 0n) {',
        '      if (ee & 1n) r = r * bb % P;',
        '      bb = bb * bb % P;',
        '      ee >>= 1n;',
        '    }',
        '    return r;',
        '  }',
        '  var S = { a: Number(a), b: bS, p: Number(P), base: Number(a % P), res: 1,',
        '            e: 0, bit: 0, bits: [], k: -1, pw: 1, inv: 0 };',
        '  T.step(S, \'计算 \' + aS + \'^\' + bS + \' mod \' + pS + \'，按指数的二进制位逐位平方\');',
        '  var base = a % P, res = 1n, e = b;',
        '  while (e > 0n) {',
        '    var bit = Number(e & 1n);',
        '    S.bit = bit;',
        '    S.bits.push(bit);',
        '    S.k = S.bits.length - 1;',
        '    if (bit === 1) res = res * base % P;',
        '    S.res = Number(res);',
        '    S.base = Number(base);',
        '    T.step(S, \'最低位 = \' + bit + \'，当前答案 res = \' + S.res);',
        '    base = base * base % P;',
        '    e >>= 1n;',
        '  }',
        '  S.pw = Number(res);',
        '  S.base = Number(base);',
        '  var inv = mp(a, P - 2n);',
        '  S.inv = Number(inv);',
        '  T.step(S, \'由费马小定理，逆元 = \' + aS + \'^(\' + pS + \'-2) mod \' + pS + \' = \' + S.inv);',
        '  var ans = S.pw + " " + S.inv;',
        '  T.answer(ans);',
        '  return ans;',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var aS = tk.next(), bS = tk.next(), pS = tk.next();',
        '  var a = BigInt(aS), b = BigInt(bS), P = BigInt(pS);',
        '  var S = { a: Number(a), b: bS, p: Number(P), base: Number(a % P), res: 1,',
        '            e: 0, bit: 0, bits: [], k: -1, pw: 1, inv: 0 };',
        '  T.step(S, \'计算 \' + aS + \'^\' + bS + \' mod \' + pS);',
        '  // TODO 1: 二进制快速幂：while (e > 0n) { 若最低位为 1 则 res = res*base % P; base = base*base % P; e >>= 1n; }',
        '  //         每轮把当前比特 push 到 S.bits 并 T.step，用于可视化',
        '  // TODO 2: 费马小定理求逆元 inv = a^(P-2) mod P（可复用同一段快速幂）',
        '  var ans = S.pw + " " + S.inv;',
        '  T.answer(ans);',
        '  return ans;',
        '}'
      ].join('\n'),
      pseudo: [
        'res ← 1, base ← a mod p',
        'while e > 0:',
        '  if e 是奇数 then res ← res · base mod p',
        '  base ← base · base mod p',
        '  e ← e div 2',
        '输出 res 与 a^(p-2) mod p'
      ],
      gen: 'function(r){ var ps = [1009, 10007, 998244353, 1000000007]; var p = ps[Math.floor(Math.random()*ps.length)]; var a = 1 + Math.floor(Math.random()*(p-1)); var b = Math.floor(Math.random()*1000); return a + " " + b + " " + p; }'
    },
    tips: [
      'a,b,p 可达 10^9，乘法结果 10^18 超出 double 精度，JS 里必须用 BigInt 或龟速乘',
      'b = 0 时 a^0 = 1（题目约定），别忘了 res 初值为 1',
      '费马小定理求逆元的前提是 p 为素数且 gcd(a, p) = 1，本题 1 ≤ a < p 已保证'
    ]
  });

  /* ==========================================================================
   * p42 · 组合数学：C(n,k) mod p
   * ========================================================================*/
  window.CSP.problems.push({
    id: 'p42', no: 42, title: '组合数取模', diff: 3, tier: '提高',
    knowledge: ['math.comb', 'math.mod'],
    limits: { time: '1s', memory: '128MB' },
    statement: '给定 n, k, p（p 是素数且 n < p），求组合数 C(n, k) 对 p 取模的结果。\n提示：由 C(n, i) = C(n, i-1) × (n-i+1) / i，只要用费马小定理把除以 i 换成乘 i 的逆元，就可以在 O(k log p) 内递推完成。\n\n数据范围：1 ≤ k ≤ n ≤ 10^6，n < p ≤ 10^9+7，p 为素数。',
    inputFormat: '一行三个整数 n, k, p。',
    outputFormat: '一个整数，表示 C(n, k) mod p。',
    samples: [
      { input: '6 3 1000000007', output: '20', explain: 'C(6,3) = 20' }
    ],
    tests: [
      { input: '5 2 1000000007\n', output: '10', score: 20 },
      { input: '6 3 1000000007\n', output: '20', score: 20 },
      { input: '1 1 1000000007\n', output: '1', score: 20 },
      { input: '1000000 2 1000000007\n', output: '999496507', score: 20 },
      { input: '10 5 998244353\n', output: '252', score: 20 }
    ],
    std: {
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'typedef long long ll;',
        'll qpow(ll a, ll e, ll p){',
        '    ll r = 1 % p; a %= p;',
        '    while (e > 0) { if (e & 1) r = r * a % p; a = a * a % p; e >>= 1; }',
        '    return r;',
        '}',
        'int main(){',
        '    ios::sync_with_stdio(false);',
        '    cin.tie(nullptr);',
        '    ll n, k, p;',
        '    cin >> n >> k >> p;',
        '    if (k > n - k) k = n - k;',
        '    ll res = 1 % p;',
        '    for (ll i = 1; i <= k; i++) {',
        '        res = res * ((n - i + 1) % p) % p;',
        '        res = res * qpow(i % p, p - 2, p) % p;',
        '    }',
        '    cout << res << "\\n";',
        '    return 0;',
        '}'
      ].join('\n')
    },
    algo: {
      title: '递推杨辉三角行：C(n,i) = C(n,i-1)·(n-i+1)·inv(i)',
      viz: {
        input: '6 3 1000000007', type: 'array', mainKey: 'row',
        pointers: ['i'], highlight: ['i'],
        title: '杨辉三角第 n 行的前缀 C(n,0..k)'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var nS = tk.next(), kS = tk.next(), pS = tk.next();',
        '  var n = BigInt(nS), k = BigInt(kS), P = BigInt(pS);',
        '  function mp(base, exp) {',
        '    var r = 1n, bb = base % P, ee = exp;',
        '    while (ee > 0n) {',
        '      if (ee & 1n) r = r * bb % P;',
        '      bb = bb * bb % P;',
        '      ee >>= 1n;',
        '    }',
        '    return r;',
        '  }',
        '  var S = { n: Number(n), k: Number(k), p: Number(P), i: 0, c: 1, row: [1], ans: 1 };',
        '  T.step(S, \'用递推 + 费马小定理求逆元计算 C(\' + nS + \',\' + kS + \') mod \' + pS);',
        '  var res = 1n;',
        '  for (var i = 1n; i <= k; i++) {',
        '    res = res * ((n - i + 1n) % P) % P;',
        '    res = res * mp(i, P - 2n) % P;',
        '    S.i = Number(i);',
        '    S.c = Number(res);',
        '    S.row.push(Number(res));',
        '    T.step(S, \'C(\' + nS + \',\' + Number(i) + \') = \' + S.c);',
        '  }',
        '  S.ans = Number(res);',
        '  T.answer(String(S.ans));',
        '  return String(S.ans);',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var nS = tk.next(), kS = tk.next(), pS = tk.next();',
        '  var n = BigInt(nS), k = BigInt(kS), P = BigInt(pS);',
        '  var S = { n: Number(n), k: Number(k), p: Number(P), i: 0, c: 1, row: [1], ans: 1 };',
        '  T.step(S, \'准备计算 C(\' + nS + \',\' + kS + \') mod \' + pS);',
        '  // TODO 1: 写一个快速幂 mp(base, exp) 求 base^exp mod P（用于费马小定理）',
        '  // TODO 2: 从 i = 1 递推到 i = k：res = res * (n-i+1) % P * mp(i, P-2) % P',
        '  //         每轮把结果 push 进 S.row 并 T.step(S, note)',
        '  T.answer(String(S.ans));',
        '  return String(S.ans);',
        '}'
      ].join('\n'),
      pseudo: [
        'k ← min(k, n-k)   // 对称优化',
        'res ← 1, row ← [1]',
        'for i ← 1 to k:',
        '  res ← res · (n-i+1) mod p',
        '  res ← res · i^(p-2) mod p',
        '  row.push(res)',
        '输出 res'
      ],
      gen: 'function(r){ var n = 1 + Math.floor(Math.random()*10); var k = 1 + Math.floor(Math.random()*n); return n + " " + k + " 1000000007"; }'
    },
    tips: [
      'n < p 是前提：否则 i 可能与 p 不互素，费马小定理失效（那要用 Lucas 定理）',
      '中间乘积最大 10^18，C++ 要用 long long，JS 要用 BigInt，否则精度丢失',
      '注意 n 可能很大而 k 很小：不要预处理 1..n 的阶乘，直接对 i 求逆元递推即可'
    ]
  });

  /* ==========================================================================
   * p43 · 矩阵乘法与矩阵快速幂（斐波那契）
   * ========================================================================*/
  window.CSP.problems.push({
    id: 'p43', no: 43, title: '斐波那契第 n 项', diff: 4, tier: '提高+',
    knowledge: ['math.matrix', 'math.pow'],
    limits: { time: '1s', memory: '128MB' },
    statement: '数列 F 满足 F(1) = F(2) = 1，F(n) = F(n-1) + F(n-2)（n ≥ 3）。\n给定 n 和模数 p，求 F(n) mod p。\n提示：用矩阵快速幂。由\n    [F(n+1), F(n); F(n), F(n-1)] = [1,1; 1,0]^(n-1)\n可知 F(n) 就是矩阵 M = [1,1; 1,0] 的 (n-1) 次幂的左上角元素。\n\n数据范围：1 ≤ n ≤ 10^18，2 ≤ p ≤ 10^9。',
    inputFormat: '一行两个整数 n, p。',
    outputFormat: '一个整数，表示 F(n) mod p。',
    samples: [
      { input: '10 1000', output: '55', explain: 'F(10) = 55' }
    ],
    tests: [
      { input: '10 1000\n', output: '55', score: 20 },
      { input: '1 1000\n', output: '1', score: 20 },
      { input: '2 1000\n', output: '1', score: 20 },
      { input: '1000000000000000000 1000000007\n', output: '209783453', score: 20 },
      { input: '50 998244353\n', output: '607336789', score: 20 }
    ],
    std: {
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'typedef long long ll;',
        'typedef array<array<ll,2>,2> Mat;',
        'll P;',
        'Mat mul(const Mat &A, const Mat &B){',
        '    Mat C{};',
        '    for (int i = 0; i < 2; i++)',
        '        for (int j = 0; j < 2; j++)',
        '            C[i][j] = (A[i][0] * B[0][j] + A[i][1] * B[1][j]) % P;',
        '    return C;',
        '}',
        'int main(){',
        '    ios::sync_with_stdio(false);',
        '    cin.tie(nullptr);',
        '    ll n;',
        '    cin >> n >> P;',
        '    Mat M = {{{1, 1}, {1, 0}}};',
        '    Mat R = {{{1, 0}, {0, 1}}};',
        '    ll e = n - 1;',
        '    while (e > 0) {',
        '        if (e & 1) R = mul(R, M);',
        '        M = mul(M, M);',
        '        e >>= 1;',
        '    }',
        '    cout << R[0][0] % P << "\\n";',
        '    return 0;',
        '}'
      ].join('\n')
    },
    algo: {
      title: '矩阵快速幂：把线性递推转成 2×2 矩阵幂',
      viz: {
        input: '10 1000', type: 'matrix', mainKey: 'R',
        title: '结果矩阵 R（R[0][0] 即答案）'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var nS = tk.next(), pS = tk.next();',
        '  var n = BigInt(nS), P = BigInt(pS);',
        '  function mul(A, B) {',
        '    var C = [[0n, 0n], [0n, 0n]];',
        '    for (var i = 0; i < 2; i++)',
        '      for (var j = 0; j < 2; j++)',
        '        C[i][j] = (A[i][0] * B[0][j] + A[i][1] * B[1][j]) % P;',
        '    return C;',
        '  }',
        '  function toN(M) {',
        '    return [[Number(M[0][0]), Number(M[0][1])], [Number(M[1][0]), Number(M[1][1])]];',
        '  }',
        '  var M = [[1n, 1n], [1n, 0n]];',
        '  var R = [[1n, 0n], [0n, 1n]];',
        '  var e = n - 1n;',
        '  var S = { n: nS, p: Number(P), bits: [], k: -1, bit: 0,',
        '            M: toN(M), R: toN(R), ans: 1 };',
        '  T.step(S, \'求 F(\' + nS + \') mod \' + pS + \'：计算 M^(n-1)，M = [[1,1],[1,0]]\');',
        '  while (e > 0n) {',
        '    var bit = Number(e & 1n);',
        '    S.bit = bit;',
        '    S.bits.push(bit);',
        '    S.k = S.bits.length - 1;',
        '    if (bit === 1) R = mul(R, M);',
        '    S.R = toN(R);',
        '    T.step(S, \'指数最低位 = \' + bit + (bit === 1 ? \'，结果矩阵乘上当前幂\' : \'，跳过当前幂\'));',
        '    M = mul(M, M);',
        '    S.M = toN(M);',
        '    e >>= 1n;',
        '  }',
        '  S.ans = Number(R[0][0]);',
        '  T.step(S, \'F(\' + nS + \') mod \' + pS + \' = \' + S.ans);',
        '  T.answer(String(S.ans));',
        '  return String(S.ans);',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var nS = tk.next(), pS = tk.next();',
        '  var n = BigInt(nS), P = BigInt(pS);',
        '  function mul(A, B) {',
        '    var C = [[0n, 0n], [0n, 0n]];',
        '    for (var i = 0; i < 2; i++)',
        '      for (var j = 0; j < 2; j++)',
        '        C[i][j] = (A[i][0] * B[0][j] + A[i][1] * B[1][j]) % P;',
        '    return C;',
        '  }',
        '  var M = [[1n, 1n], [1n, 0n]];',
        '  var R = [[1n, 0n], [0n, 1n]];',
        '  var S = { n: nS, p: Number(P), bits: [], k: -1, bit: 0,',
        '            M: [[1, 1], [1, 0]], R: [[1, 0], [0, 1]], ans: 1 };',
        '  T.step(S, \'求 F(\' + nS + \') mod \' + pS);',
        '  // TODO: 对 e = n - 1 做矩阵快速幂：',
        '  //   while (e > 0n) { if (e & 1n) R = mul(R, M); M = mul(M, M); e >>= 1n; }',
        '  //   每轮把 R、M 同步到 S.R、S.M（用 Number 转换），并 T.step(S, note)',
        '  T.answer(String(S.ans));',
        '  return String(S.ans);',
        '}'
      ].join('\n'),
      pseudo: [
        'M ← [[1,1],[1,0]], R ← I(单位矩阵)',
        'e ← n - 1',
        'while e > 0:',
        '  if e 是奇数 then R ← R · M',
        '  M ← M · M',
        '  e ← e div 2',
        '输出 R[0][0] mod p'
      ],
      gen: 'function(r){ var n = 1 + Math.floor(Math.random()*30); var p = 1000 + Math.floor(Math.random()*900); return n + " " + p; }'
    },
    tips: [
      'n = 1、2 时指数 n-1 = 0、1，单位矩阵的左上角恰好是 1，边界自然正确',
      '矩阵乘法的取模要在每次加法后做，C++ 用 long long 防止 10^18 溢出',
      'n 最大 10^18，必须用 long long 读入；矩阵快速幂的次数是 O(log n)'
    ]
  });

})();
