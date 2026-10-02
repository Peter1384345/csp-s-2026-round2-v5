/* ============================================================================
 * CSP-S 2026 第二轮 · 提高级数据结构与算法题（p44–p50）
 * ----------------------------------------------------------------------------
 * 内容契约见 docs/CONTENT-SCHEMA.md；知识点 id 取自 js/data/syllabus.js；
 * 追踪 API 见 js/core/trace.js。
 *   p44 线段树（区间求和 + 单点修改）        knowledge: ds.segtree
 *   p45 懒标记线段树（区间加 + 区间求和）    knowledge: ds.lazy
 *   p46 字典树 Trie（前缀计数）              knowledge: ds.trie
 *   p47 归并排序与逆序对（分治）             knowledge: basic.divide
 *   p48 汉诺塔（递归）                       knowledge: basic.recursion
 *   p49 约瑟夫环（链表）                     knowledge: ds.linked
 *   p50 长度不超过 k 的最大子段和（单调队列优化 DP） knowledge: dp.opt
 * ==========================================================================*/
(function () {
  'use strict';
  window.CSP = window.CSP || {};
  window.CSP.problems = window.CSP.problems || [];

  /* ======================================================================
   * p44 线段树 —— 区间求和 + 单点修改
   * ==================================================================== */
  window.CSP.problems.push({
    id: 'p44', no: 44, title: '线段树区间求和', diff: 5, tier: '提高+',
    knowledge: ['ds.segtree'],
    limits: { time: '1s', memory: '256MB' },
    statement: '给定一个长度为 N 的数列 a₁, a₂, …, a_N，需要支持两种操作，共 Q 次：\n- `1 p x`：把 a_p 的值**修改**为 x（是赋值，不是加上 x）；\n- `2 l r`：询问 a_l + a_{l+1} + … + a_r 的值。\n\n' +
      '数据规模较大，逐项累加会超时，请使用**线段树**：把每个区间 [l, r] 的和存放在树的节点里，' +
      '根节点管理 [1, N]，节点 p 的左右儿子分别是 2p 与 2p+1，叶子节点对应单个位置。\n\n' +
      '要求：建树 O(N)，单点修改 O(log N)，区间查询 O(log N)。',
    inputFormat: '第一行两个整数 N, Q（1 ≤ N, Q ≤ 2×10^5）。\n' +
      '第二行 N 个整数 a₁, a₂, …, a_N（|a_i| ≤ 10^9），相邻两数之间用一个空格隔开。\n' +
      '接下来 Q 行，每行是 `1 p x`（1 ≤ p ≤ N，|x| ≤ 10^9）或 `2 l r`（1 ≤ l ≤ r ≤ N）之一。',
    outputFormat: '对每个操作 2 输出一行一个整数，表示该区间的和。',
    samples: [
      { input: '5 3\n1 2 3 4 5\n2 1 5\n1 3 10\n2 2 4', output: '15\n16', explain: '先查 [1,5] 得 1+2+3+4+5 = 15；再把 a₃ 改成 10，此时数列为 1 2 10 4 5，[2,4] = 2+10+4 = 16。' }
    ],
    tests: [
      { input: '5 3\n1 2 3 4 5\n2 1 5\n1 3 10\n2 2 4\n', output: "15\n16", score: 20 },
      { input: '1 3\n-5\n2 1 1\n1 1 7\n2 1 1\n', output: "-5\n7", score: 20 },
      { input: '8 4\n3 3 3 3 3 3 3 3\n2 1 8\n1 4 0\n2 1 8\n2 4 4\n', output: "24\n21\n0", score: 20 },
      { input: '6 5\n-1 -2 -3 -4 -5 -6\n2 1 6\n2 3 3\n1 3 100\n2 2 4\n2 1 1\n', output: "-21\n-3\n94\n-1", score: 20 },
      { input: '16 6\n1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16\n2 1 16\n2 5 11\n1 8 -100\n2 1 16\n2 8 8\n2 9 12\n', output: "136\n56\n28\n-100\n42", score: 20 }
    ],
    std: {
      code: `#include <bits/stdc++.h>
using namespace std;
int n, q;
vector<long long> a;
long long t[800005];
void build(int p, int l, int r) {
    if (l == r) { t[p] = a[l]; return; }
    int m = (l + r) >> 1;
    build(p << 1, l, m);
    build(p << 1 | 1, m + 1, r);
    t[p] = t[p << 1] + t[p << 1 | 1];
}
void update(int p, int l, int r, int pos, long long v) {
    if (l == r) { t[p] = v; return; }
    int m = (l + r) >> 1;
    if (pos <= m) update(p << 1, l, m, pos, v);
    else update(p << 1 | 1, m + 1, r, pos, v);
    t[p] = t[p << 1] + t[p << 1 | 1];
}
long long query(int p, int l, int r, int ql, int qr) {
    if (ql <= l && r <= qr) return t[p];
    int m = (l + r) >> 1;
    long long s = 0;
    if (ql <= m) s += query(p << 1, l, m, ql, qr);
    if (qr > m) s += query(p << 1 | 1, m + 1, r, ql, qr);
    return s;
}
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n >> q;
    a.assign(n + 1, 0);
    for (int i = 1; i <= n; i++) cin >> a[i];
    build(1, 1, n);
    while (q--) {
        int op;
        cin >> op;
        if (op == 1) {
            int p; long long x;
            cin >> p >> x;
            update(1, 1, n, p, x);
        } else {
            int l, r;
            cin >> l >> r;
            cout << query(1, 1, n, l, r) << endl;
        }
    }
    return 0;
}`
    },
    algo: {
      title: '递归线段树：区间求和 + 单点修改',
      viz: {
        input: '4 3\n1 2 3 4\n2 1 3\n1 2 5\n2 2 4',
        type: 'array', mainKey: 't', pointers: ['p'], highlight: ['p'],
        labels: { p: '当前节点' },
        title: '线段树底层数组 t[]（根下标 1，左右儿子 2p 与 2p+1）'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), q = tk.int();',
        '  var a = [0], i;',
        '  for (i = 1; i <= n; i++) a.push(tk.int());',
        '  var t = [];',
        '  for (i = 0; i < 4 * n + 8; i++) t.push(0);',
        '  var S = { n: n, a: a, t: t, p: 1, l: 1, r: n, pos: 0, val: 0, ql: 1, qr: 1, ans: 0, res: [] };',
        '  T.step(S, "建树前：线段树底层数组 t[] 全是 0");',
        '  function build(p, l, r) {',
        '    S.p = p; S.l = l; S.r = r;',
        '    if (l === r) { t[p] = a[l]; T.step(S, "叶子节点 " + p + " 对应位置 " + l + "，赋值 " + a[l]); return; }',
        '    var m = (l + r) >> 1;',
        '    T.step(S, "节点 " + p + " 管理区间 [" + l + ", " + r + "]，中点 " + m);',
        '    build(p << 1, l, m);',
        '    build(p << 1 | 1, m + 1, r);',
        '    t[p] = t[p << 1] + t[p << 1 | 1];',
        '    T.step(S, "回溯合并：t[" + p + "] = " + t[p << 1] + " + " + t[p << 1 | 1] + " = " + t[p]);',
        '  }',
        '  function update(p, l, r, pos, v) {',
        '    S.p = p; S.l = l; S.r = r; S.pos = pos; S.val = v;',
        '    if (l === r) { t[p] = v; T.step(S, "到达叶子 " + p + "，t[" + p + "] 改成 " + v); return; }',
        '    var m = (l + r) >> 1;',
        '    T.step(S, "修改位置 " + pos + "：考察节点 " + p + " 的区间 [" + l + ", " + r + "]");',
        '    if (pos <= m) { S.p = p << 1; T.step(S, "pos ≤ " + m + "，转向左儿子 " + (p << 1)); update(p << 1, l, m, pos, v); }',
        '    else { S.p = p << 1 | 1; T.step(S, "pos > " + m + "，转向右儿子 " + (p << 1 | 1)); update(p << 1 | 1, m + 1, r, pos, v); }',
        '    t[p] = t[p << 1] + t[p << 1 | 1];',
        '    T.step(S, "回溯重算：t[" + p + "] = " + t[p]);',
        '  }',
        '  function query(p, l, r, ql, qr) {',
        '    S.p = p; S.l = l; S.r = r; S.ql = ql; S.qr = qr;',
        '    if (ql <= l && r <= qr) { S.ans = t[p]; T.step(S, "节点 " + p + " 的区间被完全包含，返回 t[" + p + "] = " + t[p]); return t[p]; }',
        '    var m = (l + r) >> 1;',
        '    T.step(S, "节点 " + p + " 区间 [" + l + ", " + r + "] 与查询 [" + ql + ", " + qr + "] 相交，继续分裂");',
        '    var s = 0;',
        '    if (ql <= m) s += query(p << 1, l, m, ql, qr);',
        '    if (qr > m) s += query(p << 1 | 1, m + 1, r, ql, qr);',
        '    S.ans = s;',
        '    T.step(S, "合并节点 " + p + " 的查询结果 " + s);',
        '    return s;',
        '  }',
        '  build(1, 1, n);',
        '  T.step(S, "建树完成，根节点 t[1] = " + t[1]);',
        '  for (var k = 0; k < q; k++) {',
        '    var op = tk.int();',
        '    if (op === 1) {',
        '      var pos = tk.int(), val = tk.int();',
        '      update(1, 1, n, pos, val);',
        '      T.step(S, "单点修改完成：a[" + pos + "] = " + val + "，t[1] = " + t[1]);',
        '    } else {',
        '      var ql = tk.int(), qr = tk.int();',
        '      S.ql = ql; S.qr = qr;',
        '      S.ans = query(1, 1, n, ql, qr);',
        '      S.res.push(S.ans);',
        '      T.step(S, "区间 [" + ql + ", " + qr + "] 的和是 " + S.ans);',
        '    }',
        '  }',
        '  var out = S.res.join("\\n");',
        '  T.answer(out);',
        '  return out;',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), q = tk.int();',
        '  var a = [0], i;',
        '  for (i = 1; i <= n; i++) a.push(tk.int());',
        '  var t = [];',
        '  for (i = 0; i < 4 * n + 8; i++) t.push(0);',
        '  var S = { n: n, a: a, t: t, p: 1, l: 1, r: n, pos: 0, val: 0, ql: 1, qr: 1, ans: 0, res: [] };',
        '  T.step(S, "初始状态：t[] 全是 0，还没有建树");',
        '  // TODO(1) 建树 build(p, l, r)：l == r 时 t[p] = a[l]；',
        '  //         否则先递归 build(2p, l, m) 与 build(2p+1, m+1, r)，再 t[p] = t[2p] + t[2p+1]。',
        '  // TODO(2) 单点修改 update(p, l, r, pos, v)：按 pos 与中点 m 的关系往一边走，',
        '  //         到叶子把 t[p] 改成 v，回溯时重算 t[p] = t[2p] + t[2p+1]。',
        '  // TODO(3) 区间查询 query(p, l, r, ql, qr)：[l, r] 被 [ql, qr] 完全包含时返回 t[p]，',
        '  //         否则 ql ≤ m 就查左儿子、qr > m 就查右儿子，两者相加。',
        '  // 注意：每个分支里都要更新 S 中用于可视化的字段（p、l、r 等）并调用 T.step(S, note)。',
        '  for (var k = 0; k < q; k++) {',
        '    var op = tk.int();',
        '    if (op === 1) { S.pos = tk.int(); S.val = tk.int(); }',
        '    else { S.ql = tk.int(); S.qr = tk.int(); }',
        '  }',
        '  var out = S.res.join("\\n");',
        '  T.answer(out);',
        '  return out;',
        '}'
      ].join('\n'),
      pseudo: [
        'build(p, l, r): if l = r then t[p] ← a[l]',
        '                else m ← ⌊(l+r)/2⌋; build(2p, l, m); build(2p+1, m+1, r); t[p] ← t[2p] + t[2p+1]',
        'update(p, l, r, pos, v): 走到叶子后 t[p] ← v，回溯时重新合并',
        'query(p, l, r, ql, qr): 完全包含则返回 t[p]，否则分裂到 2p / 2p+1 求和'
      ],
      gen: 'function(r){ var n = 1 + Math.floor(Math.random()*8); var q = 1 + Math.floor(Math.random()*6); var s = n + " " + q + "\\n"; var a = []; for (var i = 0; i < n; i++) a.push(Math.floor(Math.random()*21) - 10); s += a.join(" ") + "\\n"; for (var j = 0; j < q; j++) { if (Math.random() < 0.5) { s += "1 " + (1 + Math.floor(Math.random()*n)) + " " + (Math.floor(Math.random()*21) - 10) + "\\n"; } else { var l = 1 + Math.floor(Math.random()*n); var rr = l + Math.floor(Math.random()*(n - l + 1)); s += "2 " + l + " " + rr + "\\n"; } } return s; }'
    },
    tips: [
      '线段树数组要开到 4N 以上，否则 N 接近 2 的幂时右儿子会越界',
      '操作 1 是「把 a_p 赋值为 x」而不是「增加 x」，两者写法完全不同',
      '递归时区间端点是 [l, m] 与 [m+1, r]，写成 [l, m-1] 会死循环'
    ]
  });

  /* ======================================================================
   * p45 懒标记线段树 —— 区间加 + 区间求和
   * ==================================================================== */
  window.CSP.problems.push({
    id: 'p45', no: 45, title: '区间加与区间求和', diff: 5, tier: '提高+',
    knowledge: ['ds.lazy'],
    limits: { time: '1s', memory: '256MB' },
    statement: '给定长度为 N 的数列 a₁, a₂, …, a_N，维护 Q 次操作：\n- `1 l r v`：把 a_l, a_{l+1}, …, a_r 全部**加上** v；\n- `2 l r`：询问 a_l + a_{l+1} + … + a_r。\n\n' +
      '朴素做法每次区间加要 O(N)，无法承受。请使用**带懒标记（lazy tag）的线段树**：\n' +
      '当某个节点的区间被修改区间**完全包含**时，直接修改该节点的 sum 并打上懒标记，' +
      '不必继续往下递归；只有当需要访问它的儿子时，才把懒标记下传（pushdown）。\n\n' +
      '要求：两种操作均为 O(log N)。',
    inputFormat: '第一行两个整数 N, Q（1 ≤ N, Q ≤ 2×10^5）。\n' +
      '第二行 N 个整数 a₁, a₂, …, a_N（|a_i| ≤ 10^9）。\n' +
      '接下来 Q 行，每行是 `1 l r v`（1 ≤ l ≤ r ≤ N，|v| ≤ 10^9）或 `2 l r`（1 ≤ l ≤ r ≤ N）之一。',
    outputFormat: '对每个操作 2 输出一行一个整数，表示该区间的和。',
    samples: [
      { input: '5 4\n1 2 3 4 5\n2 1 5\n1 2 4 3\n2 1 3\n2 2 5', output: '15\n12\n23', explain: '[1,5] = 15；[2,4] 各加 3 后数列为 1 5 6 7 5；[1,3] = 12，[2,5] = 5+6+7+5 = 23。' }
    ],
    tests: [
      { input: '5 4\n1 2 3 4 5\n2 1 5\n1 2 4 3\n2 1 3\n2 2 5\n', output: "15\n12\n23", score: 20 },
      { input: '1 3\n7\n2 1 1\n1 1 1 5\n2 1 1\n', output: "7\n12", score: 20 },
      { input: '8 4\n1 1 1 1 1 1 1 1\n1 1 8 2\n2 1 8\n1 1 4 -5\n2 1 8\n', output: "24\n4", score: 20 },
      { input: '6 5\n-1 2 -3 4 -5 6\n1 3 5 10\n2 1 6\n2 3 5\n1 1 6 -1\n2 2 4\n', output: "33\n26\n20", score: 20 },
      { input: '12 6\n5 4 3 2 1 0 -1 -2 -3 -4 -5 -6\n2 1 12\n1 4 9 7\n2 5 12\n1 1 6 -9\n2 1 6\n2 7 11\n', output: "-6\n15\n-18\n6", score: 20 }
    ],
    std: {
      code: `#include <bits/stdc++.h>
using namespace std;
int n, q;
vector<long long> a;
long long sum[800005], lz[800005];
void build(int p, int l, int r) {
    if (l == r) { sum[p] = a[l]; return; }
    int m = (l + r) >> 1;
    build(p << 1, l, m);
    build(p << 1 | 1, m + 1, r);
    sum[p] = sum[p << 1] + sum[p << 1 | 1];
}
void apply(int p, int l, int r, long long v) {
    sum[p] += v * (r - l + 1);
    lz[p] += v;
}
void pushdown(int p, int l, int r) {
    if (lz[p] == 0) return;
    int m = (l + r) >> 1;
    apply(p << 1, l, m, lz[p]);
    apply(p << 1 | 1, m + 1, r, lz[p]);
    lz[p] = 0;
}
void update(int p, int l, int r, int ql, int qr, long long v) {
    if (ql <= l && r <= qr) { apply(p, l, r, v); return; }
    pushdown(p, l, r);
    int m = (l + r) >> 1;
    if (ql <= m) update(p << 1, l, m, ql, qr, v);
    if (qr > m) update(p << 1 | 1, m + 1, r, ql, qr, v);
    sum[p] = sum[p << 1] + sum[p << 1 | 1];
}
long long query(int p, int l, int r, int ql, int qr) {
    if (ql <= l && r <= qr) return sum[p];
    pushdown(p, l, r);
    int m = (l + r) >> 1;
    long long s = 0;
    if (ql <= m) s += query(p << 1, l, m, ql, qr);
    if (qr > m) s += query(p << 1 | 1, m + 1, r, ql, qr);
    return s;
}
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n >> q;
    a.assign(n + 1, 0);
    for (int i = 1; i <= n; i++) cin >> a[i];
    build(1, 1, n);
    while (q--) {
        int op, l, r;
        cin >> op >> l >> r;
        if (op == 1) {
            long long v;
            cin >> v;
            update(1, 1, n, l, r, v);
        } else {
            cout << query(1, 1, n, l, r) << endl;
        }
    }
    return 0;
}`
    },
    algo: {
      title: '带懒标记的线段树：区间加 + 区间求和',
      viz: {
        input: '4 3\n1 2 3 4\n2 1 4\n1 2 3 2\n2 1 2',
        type: 'array', mainKey: 'sum', pointers: ['p'], highlight: ['p'],
        labels: { p: '当前节点' },
        title: '线段树的 sum[]（lazy 标记见右侧变量面板）'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), q = tk.int();',
        '  var a = [0], i;',
        '  for (i = 1; i <= n; i++) a.push(tk.int());',
        '  var sum = [], lz = [];',
        '  for (i = 0; i < 4 * n + 8; i++) { sum.push(0); lz.push(0); }',
        '  var S = { n: n, a: a, sum: sum, lz: lz, p: 1, l: 1, r: n, ql: 1, qr: 1, val: 0, ans: 0, res: [] };',
        '  T.step(S, "建树前：sum[] 与 lazy[] 全是 0");',
        '  function build(p, l, r) {',
        '    S.p = p; S.l = l; S.r = r;',
        '    if (l === r) { sum[p] = a[l]; T.step(S, "叶子 " + p + " 对应 a[" + l + "] = " + a[l]); return; }',
        '    var m = (l + r) >> 1;',
        '    T.step(S, "节点 " + p + " 管理区间 [" + l + ", " + r + "]");',
        '    build(p << 1, l, m);',
        '    build(p << 1 | 1, m + 1, r);',
        '    sum[p] = sum[p << 1] + sum[p << 1 | 1];',
        '    T.step(S, "回溯：sum[" + p + "] = " + sum[p]);',
        '  }',
        '  function apply(p, l, r, v) {',
        '    sum[p] += v * (r - l + 1);',
        '    lz[p] += v;',
        '    S.p = p; S.l = l; S.r = r; S.val = v;',
        '    T.step(S, "节点 " + p + " 管 " + (r - l + 1) + " 个数，整体加 " + v + "：sum = " + sum[p] + "，lazy = " + lz[p]);',
        '  }',
        '  function pushdown(p, l, r) {',
        '    if (lz[p] === 0) return;',
        '    var m = (l + r) >> 1, v = lz[p];',
        '    S.p = p; S.l = l; S.r = r;',
        '    T.step(S, "节点 " + p + " 带着懒标记 " + v + "，必须下传给两个儿子");',
        '    apply(p << 1, l, m, v);',
        '    apply(p << 1 | 1, m + 1, r, v);',
        '    lz[p] = 0;',
        '    S.p = p;',
        '    T.step(S, "节点 " + p + " 的懒标记清零");',
        '  }',
        '  function update(p, l, r, ql, qr, v) {',
        '    S.p = p; S.l = l; S.r = r; S.ql = ql; S.qr = qr; S.val = v;',
        '    if (ql <= l && r <= qr) { apply(p, l, r, v); return; }',
        '    pushdown(p, l, r);',
        '    var m = (l + r) >> 1;',
        '    T.step(S, "节点 " + p + " 只被部分覆盖，向儿子递归");',
        '    if (ql <= m) update(p << 1, l, m, ql, qr, v);',
        '    if (qr > m) update(p << 1 | 1, m + 1, r, ql, qr, v);',
        '    sum[p] = sum[p << 1] + sum[p << 1 | 1];',
        '    S.p = p;',
        '    T.step(S, "回溯重算 sum[" + p + "] = " + sum[p]);',
        '  }',
        '  function query(p, l, r, ql, qr) {',
        '    S.p = p; S.l = l; S.r = r; S.ql = ql; S.qr = qr;',
        '    if (ql <= l && r <= qr) { T.step(S, "节点 " + p + " 被完全覆盖，返回 sum[" + p + "] = " + sum[p]); return sum[p]; }',
        '    pushdown(p, l, r);',
        '    var m = (l + r) >> 1, s = 0;',
        '    T.step(S, "节点 " + p + " 部分覆盖，先下传标记再分裂查询");',
        '    if (ql <= m) s += query(p << 1, l, m, ql, qr);',
        '    if (qr > m) s += query(p << 1 | 1, m + 1, r, ql, qr);',
        '    return s;',
        '  }',
        '  build(1, 1, n);',
        '  T.step(S, "建树完成，sum[1] = " + sum[1]);',
        '  for (var k = 0; k < q; k++) {',
        '    var op = tk.int(), l = tk.int(), r = tk.int();',
        '    if (op === 1) {',
        '      var v = tk.int();',
        '      update(1, 1, n, l, r, v);',
        '      T.step(S, "区间 [" + l + ", " + r + "] 整体加 " + v + " 完成");',
        '    } else {',
        '      var got = query(1, 1, n, l, r);',
        '      S.ans = got;',
        '      S.res.push(got);',
        '      T.step(S, "区间 [" + l + ", " + r + "] 的和 = " + got);',
        '    }',
        '  }',
        '  var out = S.res.join("\\n");',
        '  T.answer(out);',
        '  return out;',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), q = tk.int();',
        '  var a = [0], i;',
        '  for (i = 1; i <= n; i++) a.push(tk.int());',
        '  var sum = [], lz = [];',
        '  for (i = 0; i < 4 * n + 8; i++) { sum.push(0); lz.push(0); }',
        '  var S = { n: n, a: a, sum: sum, lz: lz, p: 1, l: 1, r: n, ql: 1, qr: 1, val: 0, ans: 0, res: [] };',
        '  T.step(S, "初始状态：sum[] 与 lazy[] 全是 0");',
        '  // TODO(1) 建树 build(p, l, r)：叶子 sum[p] = a[l]，否则递归后 sum[p] = sum[2p] + sum[2p+1]。',
        '  // TODO(2) 打标记 apply(p, l, r, v)：sum[p] += v * (r - l + 1)，同时 lz[p] += v。',
        '  // TODO(3) 下传 pushdown(p, l, r)：若 lz[p] ≠ 0，把 lz[p] 分别 apply 到两个儿子，再把自己清零。',
        '  // TODO(4) 区间加 update(p, l, r, ql, qr, v)：完全覆盖就 apply 并返回；',
        '  //         否则先 pushdown，再按 ql ≤ m、qr > m 递归，最后重算 sum[p]。',
        '  // TODO(5) 区间查询 query(p, l, r, ql, qr)：完全覆盖返回 sum[p]；否则先 pushdown 再分裂求和。',
        '  // 每一步都要更新 S 中用于可视化的字段并调用 T.step(S, note)。',
        '  for (var k = 0; k < q; k++) {',
        '    var op = tk.int(), l = tk.int(), r = tk.int();',
        '    if (op === 1) { S.val = tk.int(); } else { S.ql = l; S.qr = r; }',
        '  }',
        '  var out = S.res.join("\\n");',
        '  T.answer(out);',
        '  return out;',
        '}'
      ].join('\n'),
      pseudo: [
        'apply(p, l, r, v): sum[p] += v·(r−l+1); lz[p] += v',
        'pushdown(p, l, r): if lz[p] ≠ 0 then apply(2p, …, lz[p]); apply(2p+1, …, lz[p]); lz[p] ← 0',
        'update: 完全覆盖 → apply；否则 pushdown 后递归两个儿子并重算 sum[p]',
        'query:  完全覆盖 → 返回 sum[p]；否则 pushdown 后分裂求和'
      ],
      gen: 'function(r){ var n = 1 + Math.floor(Math.random()*8); var q = 1 + Math.floor(Math.random()*6); var s = n + " " + q + "\\n"; var a = []; for (var i = 0; i < n; i++) a.push(Math.floor(Math.random()*21) - 10); s += a.join(" ") + "\\n"; for (var j = 0; j < q; j++) { var l = 1 + Math.floor(Math.random()*n); var rr = l + Math.floor(Math.random()*(n - l + 1)); if (Math.random() < 0.5) { s += "1 " + l + " " + rr + " " + (Math.floor(Math.random()*11) - 5) + "\\n"; } else { s += "2 " + l + " " + rr + "\\n"; } } return s; }'
    },
    tips: [
      'pushdown 的两个儿子区间必须写对：左儿子是 [l, m]、右儿子是 [m+1, r]',
      'apply 时 sum 要加 v × 区间长度，只加 v 是最常见的错误',
      '查询也要 pushdown：否则父亲身上的懒标记没被算进去，答案会偏小'
    ]
  });

  /* ======================================================================
   * p46 字典树 Trie —— 前缀计数
   * ==================================================================== */
  window.CSP.problems.push({
    id: 'p46', no: 46, title: '前缀计数', diff: 4, tier: '提高',
    knowledge: ['ds.trie'],
    limits: { time: '1s', memory: '256MB' },
    statement: '给定 N 个由小写英文字母组成的字符串（**允许重复**），再给出 M 个查询串。\n' +
      '对每个查询串 p，回答：这 N 个字符串中，以 p 作为**前缀**的字符串有多少个（重复出现的字符串按出现次数重复计数）。\n\n' +
      '例如已插入 `apple`、`app`、`apply` 三个串，前缀 `app` 对应 3 个，前缀 `appl` 对应 2 个。\n\n' +
      '请使用**字典树（Trie）**：每个节点代表一个前缀，从根到某节点的路径拼起来就是该前缀；' +
      '插入时每经过一个节点就让该节点的计数 +1，查询时沿字符边走到底，走不动说明前缀不存在，答案是 0。',
    inputFormat: '第一行一个整数 N（1 ≤ N ≤ 10^5）。\n' +
      '接下来 N 行，每行一个非空小写字母串。\n' +
      '接下来一行一个整数 M（1 ≤ M ≤ 10^5），再接下来 M 行每行一个非空小写字母串作为前缀查询。\n' +
      '保证所有字符串的总长度不超过 2×10^5。',
    outputFormat: '对每个查询输出一行一个整数，表示以该串为前缀的字符串个数。',
    samples: [
      { input: '5\napple\napp\napply\nban\nbanana\n3\napp\nban\nca', output: '3\n2\n0', explain: 'app 开头的有 apple、app、apply 共 3 个；ban 开头的有 ban、banana 共 2 个；不存在 ca 开头的串。' }
    ],
    tests: [
      { input: '5\napple\napp\napply\nban\nbanana\n3\napp\nban\nca\n', output: "3\n2\n0", score: 20 },
      { input: '1\na\n2\na\nb\n', output: "1\n0", score: 20 },
      { input: '4\nab\nab\nab\nab\n2\nab\na\n', output: "4\n4", score: 20 },
      { input: '6\nabcd\nabce\nabcf\nb\nbc\nbcd\n4\nabc\nbcd\nz\nb\n', output: "3\n1\n0\n3", score: 20 },
      { input: '8\na\naa\naaa\naaaa\nb\nba\nbaa\nbaaa\n5\na\nba\naaa\nc\nbaaa\n', output: "4\n3\n2\n0\n1", score: 20 }
    ],
    std: {
      code: `#include <bits/stdc++.h>
using namespace std;
int ch[400005][26];
int cnt[400005];
int tot = 1;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    string s;
    for (int i = 0; i < n; i++) {
        cin >> s;
        int p = 1;
        for (size_t j = 0; j < s.size(); j++) {
            int c = s[j] - 'a';
            if (!ch[p][c]) ch[p][c] = ++tot;
            p = ch[p][c];
            cnt[p]++;
        }
    }
    int m;
    cin >> m;
    for (int i = 0; i < m; i++) {
        cin >> s;
        int p = 1;
        for (size_t j = 0; j < s.size(); j++) {
            int c = s[j] - 'a';
            if (!ch[p][c]) { p = 0; break; }
            p = ch[p][c];
        }
        cout << (p ? cnt[p] : 0) << endl;
    }
    return 0;
}`
    },
    algo: {
      title: '字典树：边插入边统计每个节点被经过的次数',
      viz: {
        input: '5\napple\napp\napply\nban\nbanana\n3\napp\nban\nca',
        type: 'tree', mainKey: 'cnt', childrenKey: 'children', curKey: 'cur', valKey: 'cnt',
        title: '字典树（节点编号，节点下方数字 = 经过它的字符串个数）'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int();',
        '  var children = {}; children[1] = [];',
        '  var cnt = [0, 0];',
        '  var _go = {};',
        '  var tot = 1, i;',
        '  var S = { n: n, children: children, cnt: cnt, root: 1, cur: 1, pos: 0, word: "", pre: "", ans: 0, res: [] };',
        '  T.step(S, "初始化：字典树只有根节点 1（代表空前缀）");',
        '  function find(p, c) {',
        '    if (!_go[p]) return 0;',
        '    return _go[p][c] || 0;',
        '  }',
        '  function insert(w) {',
        '    var p = 1, j, c, nx;',
        '    S.cur = 1; S.word = w; S.pos = 0;',
        '    T.step(S, "插入单词 " + w + "，从根节点 1 出发");',
        '    for (j = 0; j < w.length; j++) {',
        '      c = w.charAt(j);',
        '      nx = find(p, c);',
        '      if (nx === 0) {',
        '        tot = tot + 1;',
        '        nx = tot;',
        '        cnt.push(0);',
        '        children[nx] = [];',
        '        if (!_go[p]) _go[p] = {};',
        '        _go[p][c] = nx;',
        '        children[p].push(nx);',
        '        S.cur = nx; S.pos = j;',
        '        T.step(S, "没有字符 " + c + " 的边，新建节点 " + nx);',
        '      }',
        '      p = nx;',
        '      cnt[p] = cnt[p] + 1;',
        '      S.cur = p; S.pos = j;',
        '      T.step(S, "沿字符 " + c + " 走到节点 " + p + "，经过它的串数变为 " + cnt[p]);',
        '    }',
        '  }',
        '  function query(w) {',
        '    var p = 1, j, c, nx;',
        '    S.cur = 1; S.pre = w;',
        '    T.step(S, "查询前缀 " + w + "，从根节点 1 出发");',
        '    for (j = 0; j < w.length; j++) {',
        '      c = w.charAt(j);',
        '      nx = find(p, c);',
        '      if (nx === 0) {',
        '        S.cur = 0;',
        '        T.step(S, "没有字符 " + c + " 的边，前缀 " + w + " 对应的串数为 0");',
        '        return 0;',
        '      }',
        '      p = nx;',
        '      S.cur = p; S.pos = j;',
        '      T.step(S, "沿字符 " + c + " 走到节点 " + p);',
        '    }',
        '    T.step(S, "前缀 " + w + " 落在节点 " + p + " 上，共有 " + cnt[p] + " 个串以它开头");',
        '    return cnt[p];',
        '  }',
        '  for (i = 0; i < n; i++) insert(tk.next());',
        '  var m = tk.int();',
        '  for (i = 0; i < m; i++) {',
        '    var got = query(tk.next());',
        '    S.ans = got;',
        '    S.res.push(got);',
        '    T.step(S, "本次查询答案 " + got);',
        '  }',
        '  var out = S.res.join("\\n");',
        '  T.answer(out);',
        '  return out;',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int();',
        '  var children = {}; children[1] = [];',
        '  var cnt = [0, 0];',
        '  var _go = {};',
        '  var tot = 1, i;',
        '  var S = { n: n, children: children, cnt: cnt, root: 1, cur: 1, pos: 0, word: "", pre: "", ans: 0, res: [] };',
        '  T.step(S, "初始状态：字典树只有根节点 1");',
        '  // 提示：可以用 _go[p][c]（下划线开头的变量不会进入可视化快照）记录节点 p 经过字符 c 连向哪个儿子，',
        '  //       children[p] 是可视化用的「节点 → 儿子编号列表」，cnt[p] 是经过节点 p 的字符串个数。',
        '  // TODO(1) insert(w)：从 p = 1 开始，对每个字符 c：',
        '  //         若 p 没有 c 这条边，就新建节点（编号 ++tot），把边接到 _go 与 children 上；',
        '  //         然后 p 走到该儿子，cnt[p] += 1。',
        '  // TODO(2) query(w)：从 p = 1 开始沿字符走，走不到就返回 0；走完返回 cnt[p]。',
        '  // 每一步都要维护 S.cur（当前节点）等可视化字段并调用 T.step(S, note)。',
        '  for (i = 0; i < n; i++) tk.next();',
        '  var m = tk.int();',
        '  for (i = 0; i < m; i++) { tk.next(); S.res.push(0); }',
        '  var out = S.res.join("\\n");',
        '  T.answer(out);',
        '  return out;',
        '}'
      ].join('\n'),
      pseudo: [
        'insert(w): p ← root',
        '  for c in w: if 没有 c 的边 then 新建节点并连边; p ← 儿子; cnt[p] ← cnt[p] + 1',
        'query(w): p ← root',
        '  for c in w: if 没有 c 的边 then return 0; p ← 儿子',
        '  return cnt[p]'
      ],
      gen: 'function(r){ var al = "ab"; function rs(k){ var s = ""; for (var i = 0; i < k; i++) s += al.charAt(Math.floor(Math.random()*al.length)); return s; } var n = 1 + Math.floor(Math.random()*6); var w = []; var s = n + "\\n"; for (var i = 0; i < n; i++) { var t = rs(1 + Math.floor(Math.random()*4)); w.push(t); s += t + "\\n"; } var m = 1 + Math.floor(Math.random()*5); s += m + "\\n"; for (var j = 0; j < m; j++) s += rs(1 + Math.floor(Math.random()*4)) + "\\n"; return s; }'
    },
    tips: [
      '重复的字符串要重复计数：插入时每经过一个节点都要 +1，而不是只在串尾 +1',
      '查询到的节点计数就是答案，不要漏掉「前缀本身就是一个完整串」的情况',
      '节点总数最多是总长度 + 1，数组开小了会 RE'
    ]
  });

  /* ======================================================================
   * p47 分治与归并 —— 归并排序 + 逆序对
   * ==================================================================== */
  window.CSP.problems.push({
    id: 'p47', no: 47, title: '归并与逆序对', diff: 4, tier: '提高',
    knowledge: ['basic.divide'],
    limits: { time: '1s', memory: '256MB' },
    statement: '给定一个长度为 N 的数列 a₁, a₂, …, a_N，请完成两件事：\n' +
      '1. 把它从小到大排序（相等的数保持任意顺序均可，因为值相同无法区分）；\n' +
      '2. 统计**逆序对**的个数，即满足 i < j 且 a_i > a_j 的数对 (i, j) 的数量。\n\n' +
      '请用**分治**的**归并排序**完成：把区间一分为二，先递归排好左右两半，再合并。\n' +
      '合并时若右半当前的数更小，说明它比左半剩下的每一个数都小，' +
      '一次就能确定「左半剩余个数」个逆序对——这正是归并排序能顺带统计逆序对的原因。\n\n' +
      '要求时间复杂度 O(N log N)。',
    inputFormat: '第一行一个整数 N（1 ≤ N ≤ 2×10^5）。\n' +
      '第二行 N 个整数 a₁, a₂, …, a_N（|a_i| ≤ 10^9），相邻两数之间用一个空格隔开。',
    outputFormat: '第一行 N 个整数，为从小到大排序后的数列，相邻两数之间用一个空格隔开。\n' +
      '第二行一个整数，表示逆序对个数（保证不超过 64 位有符号整数范围）。',
    samples: [
      { input: '5\n4 2 5 1 3', output: '1 2 3 4 5\n6', explain: '排序后为 1 2 3 4 5；逆序对是 (4,2)、(4,1)、(4,3)、(2,1)、(5,1)、(5,3)，共 6 个。' }
    ],
    tests: [
      { input: '5\n4 2 5 1 3\n', output: "1 2 3 4 5\n6", score: 20 },
      { input: '1\n7\n', output: "7\n0", score: 20 },
      { input: '8\n1 1 1 1 1 1 1 1\n', output: "1 1 1 1 1 1 1 1\n0", score: 20 },
      { input: '10\n10 9 8 7 6 5 4 3 2 1\n', output: "1 2 3 4 5 6 7 8 9 10\n45", score: 20 },
      { input: '16\n3 -1 3 0 -5 2 2 7 -3 4 4 -4 1 6 -2 0\n', output: "-5 -4 -3 -2 -1 0 0 1 2 2 3 3 4 4 6 7\n58", score: 20 }
    ],
    std: {
      code: `#include <bits/stdc++.h>
using namespace std;
int n;
vector<long long> a, tmp;
long long inv = 0;
void ms(int l, int r) {
    if (l >= r) return;
    int m = (l + r) >> 1;
    ms(l, m);
    ms(m + 1, r);
    int x = l, y = m + 1, k = l;
    while (x <= m && y <= r) {
        if (a[x] <= a[y]) tmp[k++] = a[x++];
        else { tmp[k++] = a[y++]; inv += (m - x + 1); }
    }
    while (x <= m) tmp[k++] = a[x++];
    while (y <= r) tmp[k++] = a[y++];
    for (k = l; k <= r; k++) a[k] = tmp[k];
}
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n;
    a.assign(n, 0);
    tmp.assign(n, 0);
    for (int i = 0; i < n; i++) cin >> a[i];
    ms(0, n - 1);
    for (int i = 0; i < n; i++) {
        if (i) cout << ' ';
        cout << a[i];
    }
    cout << endl;
    cout << inv << endl;
    return 0;
}`
    },
    algo: {
      title: '归并排序：合并时顺便数出逆序对',
      viz: {
        input: '6\n5 2 4 6 1 3',
        type: 'array', mainKey: 'a', pointers: ['i', 'j', 'k'], highlight: ['i', 'j'],
        title: '归并排序（i 左半指针，j 右半指针，k 写入位置）'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int();',
        '  var a = [], tmp = [], i;',
        '  for (i = 0; i < n; i++) { a.push(tk.int()); tmp.push(0); }',
        '  var S = { n: n, a: a, tmp: tmp, l: 0, r: n - 1, i: 0, j: 0, k: 0, inv: 0 };',
        '  T.step(S, "初始数组，逆序对计数 inv = 0");',
        '  function ms(l, r) {',
        '    if (l >= r) return;',
        '    var m = (l + r) >> 1;',
        '    S.l = l; S.r = r;',
        '    T.step(S, "把区间 [" + l + ", " + r + "] 从中间分成 " + m + " 与 " + (m + 1) + " 两半");',
        '    ms(l, m);',
        '    ms(m + 1, r);',
        '    var x = l, y = m + 1, k = l;',
        '    while (x <= m && y <= r) {',
        '      S.i = x; S.j = y; S.k = k;',
        '      if (a[x] <= a[y]) {',
        '        tmp[k] = a[x];',
        '        T.step(S, "左半 " + a[x] + " ≤ 右半 " + a[y] + "，先取左边的 " + a[x] + " 放进 tmp[" + k + "]");',
        '        x++;',
        '      } else {',
        '        tmp[k] = a[y];',
        '        S.inv = S.inv + (m - x + 1);',
        '        T.step(S, "右半 " + a[y] + " 更小：它比左半剩下的 " + (m - x + 1) + " 个数都小，逆序对 +" + (m - x + 1) + "，累计 " + S.inv);',
        '        y++;',
        '      }',
        '      k++;',
        '    }',
        '    while (x <= m) { S.i = x; S.k = k; tmp[k] = a[x]; T.step(S, "右半已用完，把剩下的 " + a[x] + " 放进 tmp[" + k + "]"); x++; k++; }',
        '    while (y <= r) { S.j = y; S.k = k; tmp[k] = a[y]; T.step(S, "左半已用完，把剩下的 " + a[y] + " 放进 tmp[" + k + "]"); y++; k++; }',
        '    for (k = l; k <= r; k++) a[k] = tmp[k];',
        '    S.k = r;',
        '    T.step(S, "区间 [" + l + ", " + r + "] 已有序，写回原数组");',
        '  }',
        '  ms(0, n - 1);',
        '  var out = a.join(" ") + "\\n" + S.inv;',
        '  T.answer(out);',
        '  return out;',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int();',
        '  var a = [], tmp = [], i;',
        '  for (i = 0; i < n; i++) { a.push(tk.int()); tmp.push(0); }',
        '  var S = { n: n, a: a, tmp: tmp, l: 0, r: n - 1, i: 0, j: 0, k: 0, inv: 0 };',
        '  T.step(S, "初始数组，逆序对计数 inv = 0");',
        '  // TODO 实现分治函数 ms(l, r)：',
        '  //   if (l >= r) return;',
        '  //   m = (l + r) >> 1;  ms(l, m);  ms(m + 1, r);   // 先递归排好左右两半',
        '  //   x = l, y = m + 1, k = l;',
        '  //   while (x <= m && y <= r):',
        '  //      若 a[x] <= a[y] 就把 a[x] 放进 tmp[k++]（x 右移）；',
        '  //      否则把 a[y] 放进 tmp[k++]，并让 S.inv += (m - x + 1)（y 右移）。',
        '  //   收尾：把剩下的 x 段、y 段依次放进 tmp，再把 tmp[l..r] 写回 a。',
        '  // 每次比较/写入都要更新 S.i、S.j、S.k 并调用 T.step(S, note)。',
        '  var out = a.join(" ") + "\\n" + S.inv;',
        '  T.answer(out);',
        '  return out;',
        '}'
      ].join('\n'),
      pseudo: [
        'ms(l, r): if l ≥ r then return',
        '  m ← ⌊(l+r)/2⌋; ms(l, m); ms(m+1, r)',
        '  x ← l; y ← m+1; k ← l',
        '  while x ≤ m 且 y ≤ r:',
        '    if a[x] ≤ a[y] then tmp[k++] ← a[x++]',
        '    else tmp[k++] ← a[y++]; inv ← inv + (m − x + 1)',
        '  收尾后把 tmp[l..r] 写回 a'
      ],
      gen: 'function(r){ var n = 1 + Math.floor(Math.random()*12); var a = []; for (var i = 0; i < n; i++) a.push(Math.floor(Math.random()*21) - 10); return n + "\\n" + a.join(" ") + "\\n"; }'
    },
    tips: [
      '统计逆序对时是 inv += (m - x + 1)，而不是 +1：右半一个数比左半剩余的一整段都小',
      '相等时取左半（a[x] <= a[y]），用 < 会把相等的数也算成逆序对',
      '合并用的 tmp 数组要反复复用，递归里不要每次新建大数组'
    ]
  });

  /* ======================================================================
   * p48 递归 —— 汉诺塔移动方案
   * ==================================================================== */
  window.CSP.problems.push({
    id: 'p48', no: 48, title: '汉诺塔移动方案', diff: 2, tier: '普及-',
    knowledge: ['basic.recursion'],
    limits: { time: '1s', memory: '128MB' },
    statement: '汉诺塔由三根柱子 A、B、C 和 N 个大小互不相同的圆盘组成。开始时 N 个圆盘全部套在 A 柱上，' +
      '从下到上由大到小排列。\n\n' +
      '一次移动只能把某根柱子最上面的一个圆盘搬到另一根柱子的顶部，且**任何时刻都不允许大盘压在小盘之上**。\n\n' +
      '请输出把 N 个圆盘全部从 A 柱搬到 C 柱的完整移动方案。\n\n' +
      '递归思路：想把 N 个盘从 A 搬到 C，可以先把上面的 N − 1 个盘从 A 搬到 B（借助 C），' +
      '再把最大的盘从 A 搬到 C，最后把 N − 1 个盘从 B 搬到 C（借助 A）；N = 1 时直接搬。\n' +
      '按这个顺序输出的方案正好是最少步数方案，共 2^N − 1 步。',
    inputFormat: '一行一个整数 N（1 ≤ N ≤ 10）。',
    outputFormat: '共 2^N − 1 行，每行形如 `X->Y`，表示把 X 柱最上面的圆盘移动到 Y 柱，' +
      '其中 X、Y ∈ {A, B, C}。按执行顺序输出。',
    samples: [
      { input: '2', output: 'A->B\nA->C\nB->C', explain: '先把小盘 A->B，再把大盘 A->C，最后小盘 B->C。' }
    ],
    tests: [
      { input: '2\n', output: "A->B\nA->C\nB->C", score: 20 },
      { input: '1\n', output: "A->C", score: 20 },
      { input: '3\n', output: "A->C\nA->B\nC->B\nA->C\nB->A\nB->C\nA->C", score: 20 },
      { input: '5\n', output: "A->C\nA->B\nC->B\nA->C\nB->A\nB->C\nA->C\nA->B\nC->B\nC->A\nB->A\nC->B\nA->C\nA->B\nC->B\nA->C\nB->A\nB->C\nA->C\nB->A\nC->B\nC->A\nB->A\nB->C\nA->C\nA->B\nC->B\nA->C\nB->A\nB->C\nA->C", score: 20 },
      { input: '8\n', output: "A->B\nA->C\nB->C\nA->B\nC->A\nC->B\nA->B\nA->C\nB->C\nB->A\nC->A\nB->C\nA->B\nA->C\nB->C\nA->B\nC->A\nC->B\nA->B\nC->A\nB->C\nB->A\nC->A\nC->B\nA->B\nA->C\nB->C\nA->B\nC->A\nC->B\nA->B\nA->C\nB->C\nB->A\nC->A\nB->C\nA->B\nA->C\nB->C\nB->A\nC->A\nC->B\nA->B\nC->A\nB->C\nB->A\nC->A\nB->C\nA->B\nA->C\nB->C\nA->B\nC->A\nC->B\nA->B\nA->C\nB->C\nB->A\nC->A\nB->C\nA->B\nA->C\nB->C\nA->B\nC->A\nC->B\nA->B\nC->A\nB->C\nB->A\nC->A\nC->B\nA->B\nA->C\nB->C\nA->B\nC->A\nC->B\nA->B\nC->A\nB->C\nB->A\nC->A\nB->C\nA->B\nA->C\nB->C\nB->A\nC->A\nC->B\nA->B\nC->A\nB->C\nB->A\nC->A\nC->B\nA->B\nA->C\nB->C\nA->B\nC->A\nC->B\nA->B\nA->C\nB->C\nB->A\nC->A\nB->C\nA->B\nA->C\nB->C\nA->B\nC->A\nC->B\nA->B\nC->A\nB->C\nB->A\nC->A\nC->B\nA->B\nA->C\nB->C\nA->B\nC->A\nC->B\nA->B\nA->C\nB->C\nB->A\nC->A\nB->C\nA->B\nA->C\nB->C\nB->A\nC->A\nC->B\nA->B\nC->A\nB->C\nB->A\nC->A\nB->C\nA->B\nA->C\nB->C\nA->B\nC->A\nC->B\nA->B\nA->C\nB->C\nB->A\nC->A\nB->C\nA->B\nA->C\nB->C\nB->A\nC->A\nC->B\nA->B\nC->A\nB->C\nB->A\nC->A\nC->B\nA->B\nA->C\nB->C\nA->B\nC->A\nC->B\nA->B\nC->A\nB->C\nB->A\nC->A\nB->C\nA->B\nA->C\nB->C\nB->A\nC->A\nC->B\nA->B\nC->A\nB->C\nB->A\nC->A\nB->C\nA->B\nA->C\nB->C\nA->B\nC->A\nC->B\nA->B\nA->C\nB->C\nB->A\nC->A\nB->C\nA->B\nA->C\nB->C\nA->B\nC->A\nC->B\nA->B\nC->A\nB->C\nB->A\nC->A\nC->B\nA->B\nA->C\nB->C\nA->B\nC->A\nC->B\nA->B\nA->C\nB->C\nB->A\nC->A\nB->C\nA->B\nA->C\nB->C\nB->A\nC->A\nC->B\nA->B\nC->A\nB->C\nB->A\nC->A\nB->C\nA->B\nA->C\nB->C\nA->B\nC->A\nC->B\nA->B\nA->C\nB->C\nB->A\nC->A\nB->C\nA->B\nA->C\nB->C", score: 20 }
    ],
    std: {
      code: `#include <bits/stdc++.h>
using namespace std;
void hanoi(int k, char from, char to, char via) {
    if (k == 1) {
        cout << from << "->" << to << endl;
        return;
    }
    hanoi(k - 1, from, via, to);
    cout << from << "->" << to << endl;
    hanoi(k - 1, via, to, from);
}
int main() {
    ios::sync_with_stdio(false);
    int n;
    cin >> n;
    hanoi(n, 'A', 'C', 'B');
    return 0;
}`
    },
    algo: {
      title: '递归：hanoi(k, from, to, via)',
      viz: {
        input: '3',
        type: 'stack', mainKey: 'frames',
        title: '递归调用栈（右端是当前最深的一层）'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int();',
        '  var S = { n: n, frames: [], disk: 0, from: "A", to: "C", via: "B", done: 0 };',
        '  var moves = [];',
        '  T.step(S, "开始：把 " + n + " 个盘从 A 柱借助 B 柱搬到 C 柱");',
        '  function hanoi(k, from, to, via) {',
        '    S.disk = k; S.from = from; S.to = to; S.via = via;',
        '    S.frames.push("hanoi(" + k + "," + from + "->" + to + ")");',
        '    T.step(S, "进入 hanoi(" + k + ", " + from + " -> " + to + ")，辅助柱是 " + via);',
        '    if (k === 1) {',
        '      moves.push(from + "->" + to);',
        '      S.done = moves.length;',
        '      T.step(S, "只剩 1 个盘：直接 " + from + " -> " + to);',
        '    } else {',
        '      hanoi(k - 1, from, via, to);',
        '      moves.push(from + "->" + to);',
        '      S.done = moves.length;',
        '      S.disk = k; S.from = from; S.to = to; S.via = via;',
        '      T.step(S, "第 " + k + " 号盘（最大的那个）从 " + from + " 移到 " + to);',
        '      hanoi(k - 1, via, to, from);',
        '    }',
        '    S.frames.pop();',
        '    T.step(S, "hanoi(" + k + ", " + from + " -> " + to + ") 完成，返回上一层");',
        '  }',
        '  hanoi(n, "A", "C", "B");',
        '  var out = moves.join("\\n");',
        '  T.answer(out);',
        '  return out;',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int();',
        '  var S = { n: n, frames: [], disk: 0, from: "A", to: "C", via: "B", done: 0 };',
        '  var moves = [];',
        '  T.step(S, "开始：把 " + n + " 个盘从 A 柱借助 B 柱搬到 C 柱");',
        '  // TODO 实现递归函数 hanoi(k, from, to, via)，把 k 个盘从 from 柱搬到 to 柱（via 是中转柱）：',
        '  //   k === 1 时：直接把 from -> to 记入 moves；',
        '  //   否则：hanoi(k-1, from, via, to);  记录 from -> to;  hanoi(k-1, via, to, from);',
        '  // 每次进入函数把 "hanoi(k,from->to)" 压入 S.frames、返回前弹出，并调用 T.step(S, note)。',
        '  // 最后调用 hanoi(n, "A", "C", "B")。',
        '  var out = moves.join("\\n");',
        '  T.answer(out);',
        '  return out;',
        '}'
      ].join('\n'),
      pseudo: [
        'hanoi(k, from, to, via):',
        '  if k = 1 then 输出 from->to; return',
        '  hanoi(k−1, from, via, to)',
        '  输出 from->to',
        '  hanoi(k−1, via, to, from)'
      ],
      gen: 'function(r){ return String(1 + Math.floor(Math.random()*6)); }'
    },
    tips: [
      '三个柱子的角色顺序极易写反：先搬 to−via 那一段，最后一段才是 via→to',
      'n = 1 必须单独处理，否则递归会一直往下降导致栈溢出',
      'n 很大时输出行数是 2^n − 1，本题保证 n ≤ 10，最多 1023 行'
    ]
  });

  /* ======================================================================
   * p49 链表 —— 约瑟夫环
   * ==================================================================== */
  window.CSP.problems.push({
    id: 'p49', no: 49, title: '约瑟夫环', diff: 3, tier: '普及+',
    knowledge: ['ds.linked'],
    limits: { time: '1s', memory: '128MB' },
    statement: 'N 个人围成一圈，编号依次为 1, 2, …, N。从 1 号开始报数，每次报到 M 的人出圈，' +
      '然后由他的下一个人重新从 1 开始报数，如此反复，直到所有人出圈。\n\n' +
      '请按出圈顺序输出所有人的编号。\n\n' +
      '出圈的人要从环里「摘掉」，请用**链表**模拟：用 next[i] 表示编号 i 的下一个人。' +
      '当编号 x 出圈时，只需让它的前驱直接指向 x 的后继（next[prev] = next[x]），' +
      '这样每一步都是 O(1)，总复杂度 O(NM)。',
    inputFormat: '一行两个整数 N, M（1 ≤ N ≤ 1000，1 ≤ M ≤ 1000）。',
    outputFormat: '一行 N 个整数，按出圈顺序输出每个人的编号，相邻两数之间用一个空格隔开。',
    samples: [
      { input: '8 3', output: '3 6 1 5 2 8 4 7', explain: '1、2 报 1、2，3 报 3 出圈；接着 4、5 报 1、2，6 报 3 出圈；依此类推。' }
    ],
    tests: [
      { input: '8 3\n', output: "3 6 1 5 2 8 4 7", score: 20 },
      { input: '1 1\n', output: "1", score: 20 },
      { input: '5 1\n', output: "1 2 3 4 5", score: 20 },
      { input: '7 7\n', output: "7 1 3 6 2 4 5", score: 20 },
      { input: '20 5\n', output: "5 10 15 20 6 12 18 4 13 1 9 19 11 3 17 16 2 8 14 7", score: 20 }
    ],
    std: {
      code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<int> nxt(n + 1);
    for (int i = 1; i <= n; i++) nxt[i] = (i == n ? 1 : i + 1);
    int prev = n, cur = 1;
    vector<int> out;
    while ((int)out.size() < n) {
        for (int c = 1; c < m; c++) {
            prev = cur;
            cur = nxt[cur];
        }
        out.push_back(cur);
        nxt[prev] = nxt[cur];
        cur = nxt[cur];
    }
    for (int i = 0; i < (int)out.size(); i++) {
        if (i) cout << ' ';
        cout << out[i];
    }
    cout << endl;
    return 0;
}`
    },
    algo: {
      title: '静态链表模拟约瑟夫环',
      viz: {
        input: '8 3',
        type: 'array', mainKey: 'nxt', pointers: ['prev', 'cur'], highlight: ['cur'],
        labels: { prev: '前驱', cur: '当前' },
        title: '静态链表 next[]：next[i] 是 i 的下一个人（下标 0 不使用）'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), m = tk.int();',
        '  var nxt = [0], i;',
        '  for (i = 1; i <= n; i++) nxt.push(i === n ? 1 : i + 1);',
        '  var S = { n: n, m: m, nxt: nxt, prev: n, cur: 1, cnt: 1, out: [] };',
        '  T.step(S, "n = " + n + " 个人围成环，next[i] 表示 i 的下一个人");',
        '  var prev = n, cur = 1;',
        '  while (S.out.length < n) {',
        '    S.prev = prev; S.cur = cur;',
        '    for (S.cnt = 1; S.cnt < m; S.cnt++) {',
        '      T.step(S, "编号 " + cur + " 报 " + S.cnt + "，继续报下一个");',
        '      prev = cur;',
        '      cur = nxt[cur];',
        '      S.prev = prev; S.cur = cur;',
        '    }',
        '    T.step(S, "编号 " + cur + " 报到 " + m + "，出圈");',
        '    S.out.push(cur);',
        '    nxt[prev] = nxt[cur];',
        '    T.step(S, "让 " + prev + " 直接指向 " + nxt[cur] + "，把 " + cur + " 从环里摘掉");',
        '    cur = nxt[cur];',
        '  }',
        '  var out = S.out.join(" ");',
        '  T.answer(out);',
        '  return out;',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), m = tk.int();',
        '  var nxt = [0], i;',
        '  for (i = 1; i <= n; i++) nxt.push(i === n ? 1 : i + 1);',
        '  var S = { n: n, m: m, nxt: nxt, prev: n, cur: 1, cnt: 1, out: [] };',
        '  T.step(S, "n = " + n + " 个人围成环，next[i] 表示 i 的下一个人");',
        '  // TODO 用链表模拟：维护 prev（前驱）与 cur（当前报数的人），初始 prev = n, cur = 1。',
        '  //   每一轮：把 cur 沿 next 前进 m − 1 次（每走一步前先把 prev 更新为 cur）；',
        '  //   然后 cur 出圈（push 进 S.out），令 nxt[prev] = nxt[cur]，再让 cur = nxt[cur]。',
        '  //   直到 S.out 里有 n 个人为止。每次移动和出圈都要调用 T.step(S, note) 记录状态。',
        '  var out = S.out.join(" ");',
        '  T.answer(out);',
        '  return out;',
        '}'
      ].join('\n'),
      pseudo: [
        'next[i] ← i+1（next[n] ← 1）',
        'prev ← n; cur ← 1',
        'while 已出圈人数 < n:',
        '  重复 m−1 次: prev ← cur; cur ← next[cur]',
        '  输出 cur; next[prev] ← next[cur]; cur ← next[cur]'
      ],
      gen: 'function(r){ var n = 1 + Math.floor(Math.random()*12); var m = 1 + Math.floor(Math.random()*7); return n + " " + m; }'
    },
    tips: [
      '初始前驱是 n 而不是 n − 1：环是首尾相接的',
      '出圈后 cur 要走到 next[cur]，而 prev 保持不动（它已经直接指向新的 cur 了）',
      'M = 1 时内层循环一次都不执行，第一个人直接出圈，注意别多走一步'
    ]
  });

  /* ======================================================================
   * p50 DP 优化 —— 长度不超过 k 的最大子段和
   * ==================================================================== */
  window.CSP.problems.push({
    id: 'p50', no: 50, title: '长度不超过 k 的最大子段和', diff: 5, tier: '提高+',
    knowledge: ['dp.opt'],
    limits: { time: '1s', memory: '256MB' },
    statement: '给定一个长度为 N 的整数数列 a₁, a₂, …, a_N，以及一个整数 k。' +
      '请找出一段长度**不超过 k** 的连续子段（长度至少为 1），使其元素之和最大，输出这个最大值。\n\n' +
      '记前缀和 S₀ = 0，S_i = a₁ + … + a_i，那么以 i 结尾、长度不超过 k 的子段和的最大值是\n' +
      'S_i − min{ S_j : max(0, i − k) ≤ j ≤ i − 1 }。\n\n' +
      '随着 i 增大，j 的合法区间是一个**左右都单调右移的窗口**，因此可以用**单调队列**维护窗口内 S 的最小值：' +
      '队首就是最小值的下标，入队前把队尾所有不小于 S_i 的下标弹掉，出队时把滑出窗口的下标从队首弹掉。\n\n' +
      '这样总时间复杂度为 O(N)，比朴素的 O(Nk) 快得多。',
    inputFormat: '第一行两个整数 N, k（1 ≤ k ≤ N ≤ 2×10^5）。\n' +
      '第二行 N 个整数 a₁, a₂, …, a_N（|a_i| ≤ 10^9），相邻两数之间用一个空格隔开。',
    outputFormat: '一行一个整数，表示长度不超过 k 的子段的最大和。',
    samples: [
      { input: '6 3\n2 -1 4 -5 3 2', output: '5', explain: '子段 [1,3] = 2−1+4 = 5，子段 [5,6] = 3+2 = 5，长度都不超过 3，最大值为 5。' }
    ],
    tests: [
      { input: '6 3\n2 -1 4 -5 3 2\n', output: "5", score: 20 },
      { input: '1 1\n-7\n', output: "-7", score: 20 },
      { input: '5 5\n1 2 3 4 5\n', output: "15", score: 20 },
      { input: '6 2\n-3 -1 -4 -1 -5 -9\n', output: "-1", score: 20 },
      { input: '12 4\n3 -2 5 -1 4 -6 2 2 1 -3 6 -2\n', output: "8", score: 20 }
    ],
    std: {
      code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, k;
    cin >> n >> k;
    vector<long long> pre(n + 1, 0);
    for (int i = 1; i <= n; i++) {
        long long x;
        cin >> x;
        pre[i] = pre[i - 1] + x;
    }
    deque<int> dq;
    dq.push_back(0);
    long long best = LLONG_MIN;
    for (int i = 1; i <= n; i++) {
        while (!dq.empty() && dq.front() < i - k) dq.pop_front();
        best = max(best, pre[i] - pre[dq.front()]);
        while (!dq.empty() && pre[dq.back()] >= pre[i]) dq.pop_back();
        dq.push_back(i);
    }
    cout << best << endl;
    return 0;
}`
    },
    algo: {
      title: '单调队列优化 DP：窗口内前缀和的最小值',
      viz: {
        input: '6 3\n2 -1 4 -5 3 2',
        type: 'array', mainKey: 'pre', pointers: ['i', 'head'], highlight: ['i'],
        labels: { i: 'i', head: '队首' },
        title: '前缀和 pre[] 与单调队列队首 head（head 处即窗口内最小的 pre）'
      },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), k = tk.int();',
        '  var a = [0], i;',
        '  for (i = 1; i <= n; i++) a.push(tk.int());',
        '  var pre = [0];',
        '  for (i = 1; i <= n; i++) pre.push(pre[i - 1] + a[i]);',
        '  var dq = [0];',
        '  var S = { n: n, k: k, a: a, pre: pre, i: 0, head: 0, tail: 0, dq: [0], best: -1000000000000000000 };',
        '  T.step(S, "前缀和 pre[] 已算好，单调队列里先放入 j = 0");',
        '  for (i = 1; i <= n; i++) {',
        '    while (dq.length > 0 && dq[0] < i - k) dq.shift();',
        '    S.i = i; S.head = dq[0]; S.tail = dq[dq.length - 1]; S.dq = dq.slice();',
        '    var cand = pre[i] - pre[dq[0]];',
        '    if (cand > S.best) S.best = cand;',
        '    T.step(S, "i = " + i + "：队首 j = " + dq[0] + " 是窗口内 pre 最小处，pre[" + i + "] - pre[" + dq[0] + "] = " + cand + "，当前最优 " + S.best);',
        '    while (dq.length > 0 && pre[dq[dq.length - 1]] >= pre[i]) dq.pop();',
        '    dq.push(i);',
        '    S.i = i; S.head = dq[0]; S.tail = dq[dq.length - 1]; S.dq = dq.slice();',
        '    T.step(S, "把 j = " + i + " 放入队尾并保持 pre 递增，队列为 [" + dq.join(", ") + "]");',
        '  }',
        '  var out = String(S.best);',
        '  T.answer(out);',
        '  return out;',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), k = tk.int();',
        '  var a = [0], i;',
        '  for (i = 1; i <= n; i++) a.push(tk.int());',
        '  var pre = [0];',
        '  for (i = 1; i <= n; i++) pre.push(pre[i - 1] + a[i]);',
        '  var dq = [0];',
        '  var S = { n: n, k: k, a: a, pre: pre, i: 0, head: 0, tail: 0, dq: [0], best: -1000000000000000000 };',
        '  T.step(S, "前缀和 pre[] 已算好，单调队列里先放入 j = 0");',
        '  // TODO 用单调队列求长度不超过 k 的最大子段和：',
        '  //   for (i = 1; i <= n; i++) {',
        '  //     1) 队首滑出窗口就弹掉：while (dq[0] < i - k) dq.shift();',
        '  //     2) 用 pre[i] - pre[dq[0]] 更新最大值 S.best；',
        '  //     3) 把队尾所有 pre 值 ≥ pre[i] 的下标弹掉，再把 i 入队；',
        '  //     4) 维护 S.i / S.head / S.tail / S.dq 并调用 T.step(S, note)。',
        '  //   }',
        '  var out = String(S.best);',
        '  T.answer(out);',
        '  return out;',
        '}'
      ].join('\n'),
      pseudo: [
        'pre[0] ← 0; pre[i] ← pre[i−1] + a[i]',
        'dq ← {0}; best ← −∞',
        'for i ← 1 to N:',
        '  while dq 非空 且 dq.head < i − k: 弹出队首',
        '  best ← max(best, pre[i] − pre[dq.head])',
        '  while dq 非空 且 pre[dq.tail] ≥ pre[i]: 弹出队尾',
        '  把 i 压入队尾',
        '输出 best'
      ],
      gen: 'function(r){ var n = 1 + Math.floor(Math.random()*12); var k = 1 + Math.floor(Math.random()*n); var a = []; for (var i = 0; i < n; i++) a.push(Math.floor(Math.random()*21) - 10); return n + " " + k + "\\n" + a.join(" ") + "\\n"; }'
    },
    tips: [
      '窗口是前一个下标区间 [i − k, i − 1]，滑出条件写成 < i − k，写成 ≤ 会多算一个位置',
      '弹队尾要用 ≥ pre[i] 而不是 > ：保留更小的前缀和永远不吃亏',
      '答案至少是单个元素的值，best 的初值必须足够小（如 LLONG_MIN），不要初始化成 0'
    ]
  });
})();
