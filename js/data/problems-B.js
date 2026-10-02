/* ============================================================================
 * CSP-S 2026 第二轮 · 数据结构题（p10–p18）
 * ----------------------------------------------------------------------------
 * 内容契约见 docs/CONTENT-SCHEMA.md；知识点 id 取自 js/data/syllabus.js；
 * 追踪 API 见 js/core/trace.js。
 * ==========================================================================*/
(function () {
  'use strict';
  window.CSP = window.CSP || {};
  window.CSP.problems = window.CSP.problems || [];

  /* ======================================================================
   * p10 栈 —— 后缀表达式求值
   * ==================================================================== */
  window.CSP.problems.push({
    id: 'p10', no: 10, title: '后缀表达式求值', diff: 2, tier: '普及-',
    knowledge: ['ds.stack', 'basic.simulate'],
    limits: { time: '1s', memory: '128MB' },
    statement: '后缀表达式（又称逆波兰式）是一种不需要括号的表达式表示法：运算符紧跟在它的两个操作数之后。\n例如中缀表达式 (3 + 4) × 5 写成后缀形式就是 `3 4 + 5 *`。\n\n给定一个合法的后缀表达式，其中：\n- 操作数是不超过 10^6 的非负整数；\n- 运算符只有 `+`、`-`、`*`、`/` 四种，其中 `/` 表示整除（结果向零取整）；\n- 运算符与操作数之间用空格分隔。\n\n请用栈计算出该表达式的值。\n\n保证：表达式的所有中间结果与最终结果的绝对值都不超过 10^9；除法运算中除数不为 0。',
    inputFormat: '一行，包含若干个用空格分隔的记号，依次构成一个合法的后缀表达式。记号个数不超过 10^5。',
    outputFormat: '一个整数，表示该后缀表达式的值。',
    samples: [
      { input: '3 4 + 5 *', output: '35', explain: '先算 3 + 4 = 7，再算 7 × 5 = 35。' }
    ],
    tests: [
      { input: '3 4 + 5 *\n', output: '35', score: 20 },
      { input: '7 2 3 * -\n', output: '1', score: 20 },
      { input: '100 10 /\n', output: '10', score: 20 },
      { input: '2 3 + 4 5 + *\n', output: '45', score: 20 },
      { input: '9 3 / 2 2 * + 10 -\n', output: '-3', score: 20 }
    ],
    std: {
      code: `#include <bits/stdc++.h>
using namespace std;
int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    vector<long long> st;
    string s;
    while (cin >> s) {
        if (s.size() == 1 && (s == "+" || s == "-" || s == "*" || s == "/")) {
            long long b = st.back(); st.pop_back();
            long long a = st.back(); st.pop_back();
            long long r;
            if (s == "+") r = a + b;
            else if (s == "-") r = a - b;
            else if (s == "*") r = a * b;
            else r = a / b;
            st.push_back(r);
        } else {
            st.push_back(stoll(s));
        }
    }
    cout << st.back() << endl;
    return 0;
}`
    },
    algo: {
      title: '用一个栈扫一遍后缀表达式',
      viz: { input: '3 4 + 5 *', type: 'stack', mainKey: 'stk', title: '操作数栈（栈顶在右）' },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var S = { stk: [], token: "", a: 0, b: 0, r: 0, ans: 0 };',
        '  T.step(S, "从左到右扫描后缀表达式");',
        '  while (tk.left() > 0) {',
        '    var s = tk.next();',
        '    S.token = s;',
        '    if (s.length === 1 && (s === "+" || s === "-" || s === "*" || s === "/")) {',
        '      S.b = S.stk.pop();',
        '      S.a = S.stk.pop();',
        '      if (s === "+") S.r = S.a + S.b;',
        '      else if (s === "-") S.r = S.a - S.b;',
        '      else if (s === "*") S.r = S.a * S.b;',
        '      else S.r = Math.trunc(S.a / S.b);',
        '      S.stk.push(S.r);',
        '      T.step(S, "弹出 " + S.a + " 和 " + S.b + "，算得 " + S.a + " " + s + " " + S.b + " = " + S.r + "，压回栈");',
        '    } else {',
        '      var v = parseInt(s, 10);',
        '      S.stk.push(v);',
        '      T.step(S, "读入操作数 " + v + "，压入栈");',
        '    }',
        '  }',
        '  S.ans = S.stk[S.stk.length - 1];',
        '  T.answer(String(S.ans));',
        '  return String(S.ans);',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var S = { stk: [], token: "", a: 0, b: 0, r: 0, ans: 0 };',
        '  T.step(S, "从左到右扫描后缀表达式");',
        '  while (tk.left() > 0) {',
        '    var s = tk.next();',
        '    S.token = s;',
        '    // TODO: 如果 s 是运算符 + - * /，就从栈顶弹出 b、再弹出 a，',
        '    //       计算 a op b 后压回栈；否则把 s 解析成整数压入栈。',
        '    // 注意：每处理完一个记号都要调用 T.step(S, note) 记录状态。',
        '  }',
        '  S.ans = S.stk[S.stk.length - 1];',
        '  T.answer(String(S.ans));',
        '  return String(S.ans);',
        '}'
      ].join('\n'),
      pseudo: [
        'stk ← 空栈',
        'for 每个记号 t in 表达式',
        '  if t 是运算符 then',
        '    b ← pop(); a ← pop(); push(a op b)',
        '  else push(值(t))',
        '输出 stk 的栈顶'
      ],
      gen: 'function(r){ var parts = [String(1 + Math.floor(Math.random()*9))]; var n = 1 + Math.floor(Math.random()*4); for (var i = 0; i < n; i++) { parts.push(String(1 + Math.floor(Math.random()*9))); parts.push("+-*".charAt(Math.floor(Math.random()*3))); } return parts.join(" "); }'
    },
    tips: [
      '先弹出的是右操作数 b，后弹出的才是左操作数 a，减法和除法写反了就是 0 分',
      'C++ 的整除是向零取整，负数时和向下取整（floor）结果不同',
      '本题记号数可达 10^5，务必用 O(记号数) 的栈解法，不要反复扫描字符串'
    ]
  });

  /* ======================================================================
   * p11 队列 —— 机器翻译（容量固定的缓存模拟）
   * ==================================================================== */
  window.CSP.problems.push({
    id: 'p11', no: 11, title: '机器翻译', diff: 2, tier: '普及-',
    knowledge: ['ds.queue', 'basic.simulate'],
    limits: { time: '1s', memory: '128MB' },
    statement: '小晨的电脑上安装了一个机器翻译软件，他经常用这个软件来翻译英语文章。\n\n这个翻译软件的原理很简单：它只是从头到尾，依次将每个英文单词用对应的中文含义来替换。对于每个英文单词，软件会先在内存中查找这个单词的中文含义：如果内存中有，软件就直接用它进行翻译；如果内存中没有，软件就会在外存中的词典内查找，查出单词的中文含义然后翻译，并将这个单词和它的译义一起放入内存，以备后续的查找和翻译。\n\n假设内存中有 M 个单元，每个单元能存放一个单词和它的译义。每当软件要把一个新单词存入内存前：\n- 如果当前内存中已存入的单词数不超过 M − 1，软件会把新单词存入一个未使用的内存单元；\n- 如果内存中已存入 M 个单词，软件会清空最早进入内存的那个单词，腾出单元来存放新单词。\n\n假设一篇英语文章的长度为 N 个单词。给定这篇待译文章，翻译软件需要去外存查找多少次词典？',
    inputFormat: '第一行两个整数 N, M（1 ≤ M ≤ N ≤ 1000），分别表示文章的长度和内存的容量。\n第二行 N 个整数，每个整数在 [0, 1000] 之间，表示一个单词（相同整数代表同一个单词），相邻两数之间用一个空格隔开。',
    outputFormat: '一个整数，表示翻译软件需要去外存查找词典的次数。',
    samples: [
      { input: '5 2\n1 2 3 1 2', output: '5', explain: '依次查 1、2、3（淘汰 1）、1（淘汰 2）、2（淘汰 3），共 5 次。' }
    ],
    tests: [
      { input: '5 2\n1 2 3 1 2\n', output: '5', score: 20 },
      { input: '1 1\n5\n', output: '1', score: 20 },
      { input: '6 3\n1 1 1 1 1 1\n', output: '1', score: 20 },
      { input: '10 1\n1 2 3 4 5 6 7 8 9 10\n', output: '10', score: 20 },
      { input: '8 3\n7 7 8 8 9 7 8 9\n', output: '3', score: 20 }
    ],
    std: {
      code: `#include <bits/stdc++.h>
using namespace std;
int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    if (!(cin >> n >> m)) return 0;
    vector<int> cnt(1005, 0);
    queue<int> q;
    int ans = 0;
    for (int i = 0; i < n; i++) {
        int x; cin >> x;
        if (cnt[x] == 0) {
            ans++;
            if ((int)q.size() == m) { cnt[q.front()]--; q.pop(); }
            q.push(x);
            cnt[x]++;
        }
    }
    cout << ans << endl;
    return 0;
}`
    },
    algo: {
      title: '用队列模拟内存，队首是最早进入的单词',
      viz: { input: '5 2\n1 2 3 1 2', type: 'array', mainKey: 'q', title: '内存中的单词（队首在左）' },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), m = tk.int();',
        '  var a = tk.ints(n);',
        '  var S = { q: [], n: n, m: m, word: 0, hit: false, i: 0, ans: 0 };',
        '  T.step(S, "内存容量 M = " + m + "，共 " + n + " 个单词待翻译");',
        '  for (S.i = 0; S.i < n; S.i++) {',
        '    S.word = a[S.i];',
        '    S.hit = S.q.indexOf(S.word) >= 0;',
        '    if (S.hit) {',
        '      T.step(S, "单词 " + S.word + " 已在内存中，直接翻译");',
        '    } else {',
        '      S.ans++;',
        '      if (S.q.length === m) S.q.shift();',
        '      S.q.push(S.word);',
        '      T.step(S, "单词 " + S.word + " 不在内存，第 " + S.ans + " 次查词典并放入内存");',
        '    }',
        '  }',
        '  T.answer(String(S.ans));',
        '  return String(S.ans);',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), m = tk.int();',
        '  var a = tk.ints(n);',
        '  var S = { q: [], n: n, m: m, word: 0, hit: false, i: 0, ans: 0 };',
        '  T.step(S, "内存容量 M = " + m + "，共 " + n + " 个单词待翻译");',
        '  for (S.i = 0; S.i < n; S.i++) {',
        '    S.word = a[S.i];',
        '    // TODO: 判断 S.word 是否已经在队列 S.q 中（用 indexOf）。',
        '    //   若不在：答案 +1；若队列已满（长度为 m）先 shift 掉队首；再 push 进队尾。',
        '    //   每一步都要用 T.step(S, note) 记录状态。',
        '  }',
        '  T.answer(String(S.ans));',
        '  return String(S.ans);',
        '}'
      ].join('\n'),
      pseudo: [
        'q ← 空队列, ans ← 0',
        'for i ← 1 to N',
        '  if word[i] 不在 q 中 then',
        '    ans ← ans + 1',
        '    if |q| = M then 弹出队首',
        '    push(word[i])',
        '输出 ans'
      ],
      gen: 'function(r){ var n = 1 + Math.floor(Math.random()*12); var m = 1 + Math.floor(Math.random()*Math.min(n, 4)); var a = []; for (var i = 0; i < n; i++) a.push(Math.floor(Math.random()*5)); return n + " " + m + "\\n" + a.join(" "); }'
    },
    tips: [
      '内存已满时清空的是「最早进入内存」的单词，即队首，不是最久未使用的',
      '同一单词在内存中最多出现一次，所以只在「不在内存」时才入队',
      'N 最大 1000，队列用 std::queue 或数组模拟都足够快'
    ]
  });

  /* ======================================================================
   * p12 单调栈 —— 下一个更大元素
   * ==================================================================== */
  window.CSP.problems.push({
    id: 'p12', no: 12, title: '下一个更大元素', diff: 3, tier: '普及+',
    knowledge: ['ds.monostack'],
    limits: { time: '1s', memory: '128MB' },
    statement: '给出一个长度为 N 的整数序列 a₁, a₂, …, a_N。\n\n对每个 1 ≤ i ≤ N，请求出满足 j > i 且 a_j > a_i 的**最小**下标 j；如果不存在这样的 j，则该位置的答案为 0。',
    inputFormat: '第一行一个整数 N（1 ≤ N ≤ 5 × 10^5）。\n第二行 N 个整数 a₁, a₂, …, a_N（0 ≤ a_i ≤ 10^9），相邻两数之间用一个空格隔开。',
    outputFormat: '一行 N 个整数，其中第 i 个数表示第 i 个元素的答案；若不存在则输出 0。相邻两数之间用一个空格隔开。',
    samples: [
      { input: '5\n3 1 4 2 5', output: '3 3 5 5 0', explain: 'a₁ = 3 右侧第一个比它大的是 a₃ = 4，故答案为 3；a₂ = 1 同理为 3；a₃ = 4 → 5；a₄ = 2 → 5；a₅ = 5 右侧没有更大的，答案为 0。' }
    ],
    tests: [
      { input: '5\n3 1 4 2 5\n', output: '3 3 5 5 0', score: 20 },
      { input: '6\n6 5 4 3 2 1\n', output: '0 0 0 0 0 0', score: 20 },
      { input: '6\n1 2 3 4 5 6\n', output: '2 3 4 5 6 0', score: 20 },
      { input: '10\n5 3 8 3 8 4 9 1 7 9\n', output: '3 3 7 5 7 7 0 9 10 0', score: 20 },
      { input: '12\n2 9 4 4 7 1 8 3 6 5 9 0\n', output: '2 0 5 5 7 7 11 9 11 11 0 0', score: 20 }
    ],
    std: {
      code: `#include <bits/stdc++.h>
using namespace std;
int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    if (!(cin >> n)) return 0;
    vector<long long> a(n + 1);
    for (int i = 1; i <= n; i++) cin >> a[i];
    vector<int> ans(n + 1, 0), st;
    st.reserve(n);
    for (int i = n; i >= 1; i--) {
        while (!st.empty() && a[st.back()] <= a[i]) st.pop_back();
        ans[i] = st.empty() ? 0 : st.back();
        st.push_back(i);
    }
    for (int i = 1; i <= n; i++) {
        if (i > 1) cout << ' ';
        cout << ans[i];
    }
    cout << endl;
    return 0;
}`
    },
    algo: {
      title: '从右往左扫描，维护一个单调递减的下标栈',
      viz: { input: '5\n3 1 4 2 5', type: 'array', mainKey: 'a', pointers: ['i'], highlight: ['i'], title: '单调栈 · 下一个更大元素' },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int();',
        '  var a = tk.ints(n);',
        '  var ans = [], st = [], i;',
        '  for (i = 0; i < n; i++) ans.push(0);',
        '  var S = { a: a, n: n, i: 0, st: st, top: -1, ans: ans };',
        '  T.step(S, "从右往左扫描，栈中保存「可能成为答案」的下标");',
        '  for (S.i = n - 1; S.i >= 0; S.i--) {',
        '    while (S.st.length > 0 && S.a[S.st[S.st.length - 1]] <= S.a[S.i]) S.st.pop();',
        '    S.top = S.st.length > 0 ? S.st[S.st.length - 1] : -1;',
        '    S.ans[S.i] = S.top + 1;',
        '    S.st.push(S.i);',
        '    T.step(S, "i = " + (S.i + 1) + "（a = " + S.a[S.i] + "），下一个更大元素下标为 " + S.ans[S.i]);',
        '  }',
        '  var out = S.ans.join(" ");',
        '  T.answer(out);',
        '  return out;',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int();',
        '  var a = tk.ints(n);',
        '  var ans = [], st = [], i;',
        '  for (i = 0; i < n; i++) ans.push(0);',
        '  var S = { a: a, n: n, i: 0, st: st, top: -1, ans: ans };',
        '  T.step(S, "从右往左扫描，栈中保存「可能成为答案」的下标");',
        '  for (S.i = n - 1; S.i >= 0; S.i--) {',
        '    // TODO: 先不断弹出栈顶那些 a 值 <= a[S.i] 的下标（它们不可能再成为答案），',
        '    //       然后栈顶就是答案（栈空则记为 -1），最后把 S.i 压栈。',
        '    //       S.ans 里存的是「1 基下标」，不存在时存 0。每轮都要 T.step。',
        '  }',
        '  var out = S.ans.join(" ");',
        '  T.answer(out);',
        '  return out;',
        '}'
      ].join('\n'),
      pseudo: [
        'st ← 空栈（保存下标，对应 a 值单调递减）',
        'for i ← N down to 1',
        '  while st 非空 且 a[top(st)] ≤ a[i]',
        '    弹出栈顶',
        '  ans[i] ← st 空 ? 0 : top(st)',
        '  push(i)',
        '输出 ans[1..N]'
      ],
      gen: 'function(r){ var n = 1 + Math.floor(Math.random()*10); var a = []; for (var i = 0; i < n; i++) a.push(Math.floor(Math.random()*10)); return n + "\\n" + a.join(" "); }'
    },
    tips: [
      '题目要求严格更大，所以弹栈条件是 a[栈顶] ≤ a[i]（带等号）',
      '栈里存的是下标而不是数值，比较大小时要取 a[栈顶]',
      '从右往左扫一遍即可 O(N)；对每个 i 向左暴力找是 O(N²)，只能过小数据'
    ]
  });

  /* ======================================================================
   * p13 单调队列 —— 滑动窗口最大值
   * ==================================================================== */
  window.CSP.problems.push({
    id: 'p13', no: 13, title: '滑动窗口最大值', diff: 3, tier: '提高',
    knowledge: ['ds.monoqueue'],
    limits: { time: '1s', memory: '128MB' },
    statement: '有一个长为 N 的序列 a，以及一个大小为 K 的滑动窗口。窗口从序列的最左端开始，每次向右滑动一个单位，直到窗口的右端到达序列末尾。\n\n你的任务是：对于窗口滑过的每一个位置，求出窗口内所有元素的最大值。',
    inputFormat: '第一行两个整数 N, K（1 ≤ K ≤ N ≤ 10^6）。\n第二行 N 个整数 a₁, a₂, …, a_N（|a_i| ≤ 10^9），相邻两数之间用一个空格隔开。',
    outputFormat: '一行 N − K + 1 个整数，其中第 i 个数表示第 i 个窗口（覆盖下标 i … i + K − 1）中元素的最大值。相邻两数之间用一个空格隔开。',
    samples: [
      { input: '8 3\n1 3 -1 -3 5 3 6 7', output: '3 3 5 5 6 7', explain: '6 个窗口的最大值依次为 3, 3, 5, 5, 6, 7。' }
    ],
    tests: [
      { input: '8 3\n1 3 -1 -3 5 3 6 7\n', output: '3 3 5 5 6 7', score: 20 },
      { input: '1 1\n5\n', output: '5', score: 20 },
      { input: '5 5\n4 2 7 1 9\n', output: '9', score: 20 },
      { input: '6 2\n-1 -2 -3 -4 -5 -6\n', output: '-1 -2 -3 -4 -5', score: 20 },
      { input: '10 4\n2 1 5 3 6 4 8 9 7 0\n', output: '5 6 6 8 9 9 9', score: 20 }
    ],
    std: {
      code: `#include <bits/stdc++.h>
using namespace std;
int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, k;
    if (!(cin >> n >> k)) return 0;
    vector<long long> a(n + 1);
    for (int i = 1; i <= n; i++) cin >> a[i];
    deque<int> dq;
    vector<long long> res;
    for (int i = 1; i <= n; i++) {
        while (!dq.empty() && dq.front() <= i - k) dq.pop_front();
        while (!dq.empty() && a[dq.back()] <= a[i]) dq.pop_back();
        dq.push_back(i);
        if (i >= k) res.push_back(a[dq.front()]);
    }
    for (size_t i = 0; i < res.size(); i++) {
        if (i) cout << ' ';
        cout << res[i];
    }
    cout << endl;
    return 0;
}`
    },
    algo: {
      title: '单调队列：队首永远是当前窗口的最大值',
      viz: { input: '8 3\n1 3 -1 -3 5 3 6 7', type: 'array', mainKey: 'a', pointers: ['i'], title: '滑动窗口最大值 · 单调队列' },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), k = tk.int();',
        '  var a = tk.ints(n);',
        '  var dq = [], res = [];',
        '  var S = { a: a, n: n, k: k, i: 0, dq: dq, front: -1, res: res };',
        '  T.step(S, "窗口大小 K = " + k + "，队列中存下标，对应 a 值单调递减");',
        '  for (S.i = 0; S.i < n; S.i++) {',
        '    while (S.dq.length > 0 && S.dq[0] <= S.i - k) S.dq.shift();',
        '    while (S.dq.length > 0 && S.a[S.dq[S.dq.length - 1]] <= S.a[S.i]) S.dq.pop();',
        '    S.dq.push(S.i);',
        '    if (S.i >= k - 1) {',
        '      S.front = S.dq[0];',
        '      S.res.push(S.a[S.front]);',
        '      T.step(S, "窗口 [" + (S.i - k + 2) + ", " + (S.i + 1) + "] 的最大值是 " + S.a[S.front]);',
        '    } else {',
        '      T.step(S, "把 i = " + (S.i + 1) + " 加入队列，窗口还没满 " + k + " 个数");',
        '    }',
        '  }',
        '  var out = S.res.join(" ");',
        '  T.answer(out);',
        '  return out;',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), k = tk.int();',
        '  var a = tk.ints(n);',
        '  var dq = [], res = [];',
        '  var S = { a: a, n: n, k: k, i: 0, dq: dq, front: -1, res: res };',
        '  T.step(S, "窗口大小 K = " + k + "，队列中存下标，对应 a 值单调递减");',
        '  for (S.i = 0; S.i < n; S.i++) {',
        '    // TODO: 1) 若队首下标已经滑出窗口（<= i - k）就 shift 掉；',
        '    //       2) 若队尾对应的 a 值 <= a[S.i] 就 pop 掉，保持单调；',
        '    //       3) push(S.i)；当 i >= k - 1 时把 a[队首] 记入 S.res。',
        '    //       每轮都要 T.step(S, note)。',
        '  }',
        '  var out = S.res.join(" ");',
        '  T.answer(out);',
        '  return out;',
        '}'
      ].join('\n'),
      pseudo: [
        'dq ← 空双端队列（存下标）',
        'for i ← 1 to N',
        '  while 队首 ≤ i − K: 弹出队首',
        '  while a[队尾] ≤ a[i]: 弹出队尾',
        '  队尾插入 i',
        '  if i ≥ K then 输出 a[队首]'
      ],
      gen: 'function(r){ var n = 1 + Math.floor(Math.random()*10); var k = 1 + Math.floor(Math.random()*n); var a = []; for (var i = 0; i < n; i++) a.push(Math.floor(Math.random()*21) - 10); return n + " " + k + "\\n" + a.join(" "); }'
    },
    tips: [
      '队列里存的是下标，比较大小必须写 a[dq.back()]，直接比下标就错了',
      '先弹出过期下标，再维护单调性，顺序不能颠倒',
      'N 可达 10^6，必须 O(N)；每个下标最多进出队一次'
    ]
  });

  /* ======================================================================
   * p14 堆 / 优先队列 —— 合并果子
   * ==================================================================== */
  window.CSP.problems.push({
    id: 'p14', no: 14, title: '合并果子', diff: 3, tier: '提高',
    knowledge: ['ds.heap', 'basic.greedy'],
    limits: { time: '1s', memory: '128MB' },
    statement: '在一个果园里，多多已经将所有的果子打了下来，而且按果子的不同种类分成了不同的堆。多多决定把所有的果子合成一堆。\n\n每一次合并，多多可以把两堆果子合并到一起，消耗的体力等于两堆果子的重量之和。可以看出，所有的果子经过 N − 1 次合并之后，就只剩下一堆了。多多在合并果子时总共消耗的体力等于每次合并所耗体力之和。\n\n因为还要花大力气把这些果子搬回家，所以多多在合并果子时要尽可能地节省体力。假定每个果子重量都为 1，并且已知果子的种类数和每种果子的数目，你的任务是设计出合并的次序方案，使多多耗费的体力最少，并输出这个最小的体力耗费值。\n\n例如有 3 种果子，数目依次为 1、2、9：可以先将 1、2 两堆合并，新堆数目为 3，耗费体力为 3；接着将新堆与原先的第三堆合并，又得到新的堆，数目为 12，耗费体力为 12。所以多多总共耗费体力 3 + 12 = 15，可以证明 15 是最小的体力耗费值。',
    inputFormat: '共两行。\n第一行是一个整数 N（1 ≤ N ≤ 10^5），表示果子的种类数。\n第二行包含 N 个整数，用空格分隔，第 i 个整数 a_i（1 ≤ a_i ≤ 2 × 10^4）是第 i 种果子的数目。',
    outputFormat: '一个整数，即最小的体力耗费值。保证答案不超过 10^9。',
    samples: [
      { input: '3\n1 2 9', output: '15', explain: '先合并 1 和 2 耗费 3，再合并 3 和 9 耗费 12，总共 15。' }
    ],
    tests: [
      { input: '3\n1 2 9\n', output: '15', score: 20 },
      { input: '4\n1 2 3 4\n', output: '19', score: 20 },
      { input: '1\n5\n', output: '0', score: 20 },
      { input: '2\n3 5\n', output: '8', score: 20 },
      { input: '6\n9 1 8 2 7 3\n', output: '69', score: 20 }
    ],
    std: {
      code: `#include <bits/stdc++.h>
using namespace std;
int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    if (!(cin >> n)) return 0;
    priority_queue<long long, vector<long long>, greater<long long> > pq;
    for (int i = 0; i < n; i++) { long long x; cin >> x; pq.push(x); }
    long long ans = 0;
    while (pq.size() > 1) {
        long long x = pq.top(); pq.pop();
        long long y = pq.top(); pq.pop();
        ans += x + y;
        pq.push(x + y);
    }
    cout << ans << endl;
    return 0;
}`
    },
    algo: {
      title: '小根堆：每次取出最轻的两堆合并',
      viz: { input: '3\n1 2 9', type: 'bars', mainKey: 'heap', title: '小根堆（堆顶为当前最轻的一堆）' },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int();',
        '  var a = tk.ints(n);',
        '  var h = [], i;',
        '  function up(arr, p) {',
        '    while (p > 0) {',
        '      var q = (p - 1) >> 1;',
        '      if (arr[q] <= arr[p]) break;',
        '      var t = arr[q]; arr[q] = arr[p]; arr[p] = t;',
        '      p = q;',
        '    }',
        '  }',
        '  function down(arr, p) {',
        '    var sz = arr.length;',
        '    for (;;) {',
        '      var l = 2 * p + 1, r = 2 * p + 2, best = p;',
        '      if (l < sz && arr[l] < arr[best]) best = l;',
        '      if (r < sz && arr[r] < arr[best]) best = r;',
        '      if (best === p) break;',
        '      var t = arr[best]; arr[best] = arr[p]; arr[p] = t;',
        '      p = best;',
        '    }',
        '  }',
        '  for (i = 0; i < n; i++) { h.push(a[i]); up(h, h.length - 1); }',
        '  var S = { heap: h, n: n, x: 0, y: 0, cost: 0, ans: 0, round: 0 };',
        '  T.step(S, "把所有果子堆建成小根堆，堆顶是最轻的一堆");',
        '  while (h.length > 1) {',
        '    S.x = h[0]; h[0] = h[h.length - 1]; h.pop(); if (h.length > 0) down(h, 0);',
        '    S.y = h[0]; h[0] = h[h.length - 1]; h.pop(); if (h.length > 0) down(h, 0);',
        '    S.cost = S.x + S.y;',
        '    S.ans += S.cost;',
        '    S.round++;',
        '    h.push(S.cost); up(h, h.length - 1);',
        '    T.step(S, "第 " + S.round + " 次合并 " + S.x + " 和 " + S.y + "，耗费 " + S.cost + "，累计 " + S.ans);',
        '  }',
        '  T.answer(String(S.ans));',
        '  return String(S.ans);',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int();',
        '  var a = tk.ints(n);',
        '  var h = [], i;',
        '  function up(arr, p) {',
        '    while (p > 0) {',
        '      var q = (p - 1) >> 1;',
        '      if (arr[q] <= arr[p]) break;',
        '      var t = arr[q]; arr[q] = arr[p]; arr[p] = t;',
        '      p = q;',
        '    }',
        '  }',
        '  function down(arr, p) {',
        '    var sz = arr.length;',
        '    for (;;) {',
        '      var l = 2 * p + 1, r = 2 * p + 2, best = p;',
        '      if (l < sz && arr[l] < arr[best]) best = l;',
        '      if (r < sz && arr[r] < arr[best]) best = r;',
        '      if (best === p) break;',
        '      var t = arr[best]; arr[best] = arr[p]; arr[p] = t;',
        '      p = best;',
        '    }',
        '  }',
        '  for (i = 0; i < n; i++) { h.push(a[i]); up(h, h.length - 1); }',
        '  var S = { heap: h, n: n, x: 0, y: 0, cost: 0, ans: 0, round: 0 };',
        '  T.step(S, "把所有果子堆建成小根堆，堆顶是最轻的一堆");',
        '  // TODO: 只要堆里还剩 2 个以上的元素，就重复：',
        '  //       取出堆顶最小的两堆 x、y，累加耗费 x + y，再把 x + y 放回堆中。',
        '  //       每次合并后用 T.step(S, note) 记录状态。',
        '  T.answer(String(S.ans));',
        '  return String(S.ans);',
        '}'
      ].join('\n'),
      pseudo: [
        'heap ← 由 a 建成小根堆',
        'ans ← 0',
        'while |heap| > 1',
        '  x ← 取堆顶并删除',
        '  y ← 取堆顶并删除',
        '  ans ← ans + x + y',
        '  把 x + y 插入 heap',
        '输出 ans'
      ],
      gen: 'function(r){ var n = 1 + Math.floor(Math.random()*6); var a = []; for (var i = 0; i < n; i++) a.push(1 + Math.floor(Math.random()*20)); return n + "\\n" + a.join(" "); }'
    },
    tips: [
      '每步都必须合并当前最轻的两堆，这才是最优策略（哈夫曼思想）',
      'N = 1 时不需要任何合并，答案是 0，别漏掉这个边界',
      '总耗费可能超过 int 范围，C++ 里用 long long，堆元素类型也要一起改'
    ]
  });

  /* ======================================================================
   * p15 并查集 —— 连通块计数
   * ==================================================================== */
  window.CSP.problems.push({
    id: 'p15', no: 15, title: '连通块计数', diff: 3, tier: '提高',
    knowledge: ['ds.dsu'],
    limits: { time: '1s', memory: '128MB' },
    statement: '给出一个 N 个点、M 条边的无向图（可能有重边，也可能有自环）。点的编号为 1 … N。\n\n请统计这个图中共有多少个连通块。所谓连通块，是指一个极大的点集，集合内任意两点之间都可以通过若干条边互相到达。孤立的点自身也算作一个连通块。',
    inputFormat: '第一行两个整数 N, M（1 ≤ N ≤ 10^5，0 ≤ M ≤ 2 × 10^5）。\n接下来 M 行，每行两个整数 u, v（1 ≤ u, v ≤ N），表示一条连接 u 和 v 的无向边。',
    outputFormat: '一个整数，表示图中连通块的个数。',
    samples: [
      { input: '5 3\n1 2\n3 4\n2 3', output: '2', explain: '点 1、2、3、4 通过边连成一块，点 5 孤立，共 2 个连通块。' }
    ],
    tests: [
      { input: '5 3\n1 2\n3 4\n2 3\n', output: '2', score: 20 },
      { input: '3 0\n', output: '3', score: 20 },
      { input: '6 5\n1 2\n2 3\n4 5\n5 6\n3 4\n', output: '1', score: 20 },
      { input: '4 6\n1 2\n1 3\n1 4\n2 3\n2 4\n3 4\n', output: '1', score: 20 },
      { input: '7 4\n1 2\n3 4\n5 6\n6 7\n', output: '3', score: 20 }
    ],
    std: {
      code: `#include <bits/stdc++.h>
using namespace std;
vector<int> fa;
int find(int x) {
    while (fa[x] != x) { fa[x] = fa[fa[x]]; x = fa[x]; }
    return x;
}
int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    if (!(cin >> n >> m)) return 0;
    fa.resize(n + 1);
    for (int i = 1; i <= n; i++) fa[i] = i;
    int cnt = n;
    for (int i = 0; i < m; i++) {
        int u, v; cin >> u >> v;
        int ru = find(u), rv = find(v);
        if (ru != rv) { fa[ru] = rv; cnt--; }
    }
    cout << cnt << endl;
    return 0;
}`
    },
    algo: {
      title: '并查集：每合并两个不同集合，连通块数减一',
      viz: { input: '5 4\n1 2\n3 4\n2 3\n3 5', type: 'array', mainKey: 'fa', pointers: ['u', 'v'], title: '并查集的父指针数组 fa[]' },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), m = tk.int();',
        '  var fa = [], i;',
        '  for (i = 0; i <= n; i++) fa.push(i);',
        '  var S = { n: n, m: m, fa: fa, u: 0, v: 0, ru: 0, rv: 0, cnt: n, k: 0 };',
        '  T.step(S, "初始时每个点各自成块，共有 " + n + " 个连通块");',
        '  for (S.k = 0; S.k < m; S.k++) {',
        '    S.u = tk.int();',
        '    S.v = tk.int();',
        '    var x = S.u;',
        '    while (S.fa[x] !== x) { S.fa[x] = S.fa[S.fa[x]]; x = S.fa[x]; }',
        '    S.ru = x;',
        '    var y = S.v;',
        '    while (S.fa[y] !== y) { S.fa[y] = S.fa[S.fa[y]]; y = S.fa[y]; }',
        '    S.rv = y;',
        '    if (S.ru !== S.rv) {',
        '      S.fa[S.ru] = S.rv;',
        '      S.cnt--;',
        '      T.step(S, "边 (" + S.u + ", " + S.v + ") 连接了两个不同集合，合并后剩 " + S.cnt + " 块");',
        '    } else {',
        '      T.step(S, "边 (" + S.u + ", " + S.v + ") 的两端已在同一块中，忽略");',
        '    }',
        '  }',
        '  T.answer(String(S.cnt));',
        '  return String(S.cnt);',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), m = tk.int();',
        '  var fa = [], i;',
        '  for (i = 0; i <= n; i++) fa.push(i);',
        '  var S = { n: n, m: m, fa: fa, u: 0, v: 0, ru: 0, rv: 0, cnt: n, k: 0 };',
        '  T.step(S, "初始时每个点各自成块，共有 " + n + " 个连通块");',
        '  for (S.k = 0; S.k < m; S.k++) {',
        '    S.u = tk.int();',
        '    S.v = tk.int();',
        '    // TODO: 沿着 fa 向上找 S.u 和 S.v 所在集合的代表元 ru、rv（顺便路径压缩）；',
        '    //       若 ru != rv，就把 fa[ru] = rv 并把 S.cnt 减 1；否则什么都不做。',
        '    //       每一轮都要 T.step(S, note)。',
        '  }',
        '  T.answer(String(S.cnt));',
        '  return String(S.cnt);',
        '}'
      ].join('\n'),
      pseudo: [
        'fa[i] ← i, cnt ← N',
        'for 每条边 (u, v)',
        '  ru ← find(u), rv ← find(v)',
        '  if ru ≠ rv then',
        '    fa[ru] ← rv; cnt ← cnt − 1',
        '输出 cnt'
      ],
      gen: 'function(r){ var n = 2 + Math.floor(Math.random()*6); var m = Math.floor(Math.random()*8); var s = n + " " + m; for (var i = 0; i < m; i++) { s += "\\n" + (1 + Math.floor(Math.random()*n)) + " " + (1 + Math.floor(Math.random()*n)); } return s; }'
    },
    tips: [
      '重边和自环不需要特判：两端本来就在同一集合，find 后相等即可',
      '路径压缩写 fa[x] = fa[fa[x]] 可以防止深链退化成 O(N) 一次操作',
      'M 可以为 0，此时答案就是 N'
    ]
  });

  /* ======================================================================
   * p16 树状数组 —— 单点修改 + 区间求和
   * ==================================================================== */
  window.CSP.problems.push({
    id: 'p16', no: 16, title: '单点修改与区间求和', diff: 4, tier: '提高+',
    knowledge: ['ds.bit'],
    limits: { time: '1s', memory: '256MB' },
    statement: '给定一个长度为 N 的数列 a₁, a₂, …, a_N，你需要支持以下两种操作，共 Q 次：\n\n- `1 x v`：把 a_x 增加 v（v 可以为负数）；\n- `2 l r`：询问 a_l + a_{l+1} + … + a_r 的值。\n\n请对每个询问操作输出答案。\n\n要求单次操作的复杂度为 O(log N)，总复杂度 O((N + Q) log N)。',
    inputFormat: '第一行两个整数 N, Q（1 ≤ N, Q ≤ 2 × 10^5）。\n第二行 N 个整数 a₁, a₂, …, a_N（|a_i| ≤ 10^9），相邻两数之间用一个空格隔开。\n接下来 Q 行，每行为 `1 x v` 或 `2 l r`（1 ≤ x, l, r ≤ N，l ≤ r，|v| ≤ 10^9）。',
    outputFormat: '对每个 `2` 操作输出一行一个整数，表示对应区间的和。',
    samples: [
      { input: '5 5\n1 2 3 4 5\n2 1 5\n1 2 10\n2 1 5\n1 5 -3\n2 2 4', output: '15\n25\n19', explain: '初始 a₁..a₅ 的和为 15；a₂ 增加 10 后总和变为 25；a₅ 减少 3 后 a₂ + a₃ + a₄ = 12 + 3 + 4 = 19。' }
    ],
    tests: [
      { input: '5 5\n1 2 3 4 5\n2 1 5\n1 2 10\n2 1 5\n1 5 -3\n2 2 4\n', output: '15\n25\n19', score: 20 },
      { input: '1 3\n7\n2 1 1\n1 1 5\n2 1 1\n', output: '7\n12', score: 20 },
      { input: '3 4\n1 1 1\n2 1 3\n1 3 100\n2 3 3\n2 1 3\n', output: '3\n101\n103', score: 20 },
      { input: '4 3\n5 5 5 5\n1 1 -5\n2 1 4\n2 2 3\n', output: '15\n10', score: 20 },
      { input: '6 5\n2 4 6 8 10 12\n2 2 5\n1 3 1\n2 1 6\n1 1 -2\n2 1 3\n', output: '28\n43\n11', score: 20 }
    ],
    std: {
      code: `#include <bits/stdc++.h>
using namespace std;
int n, q;
vector<long long> bit;
void add(int i, long long v) {
    for (; i <= n; i += i & -i) bit[i] += v;
}
long long qry(int i) {
    long long s = 0;
    for (; i > 0; i -= i & -i) s += bit[i];
    return s;
}
int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    if (!(cin >> n >> q)) return 0;
    bit.assign(n + 1, 0);
    for (int i = 1; i <= n; i++) { long long x; cin >> x; add(i, x); }
    for (int k = 0; k < q; k++) {
        int op; cin >> op;
        if (op == 1) {
            int x; long long v; cin >> x >> v;
            add(x, v);
        } else {
            int l, r; cin >> l >> r;
            cout << qry(r) - qry(l - 1) << endl;
        }
    }
    return 0;
}`
    },
    algo: {
      title: '树状数组：单点加沿 i += lowbit 上溯，前缀和沿 i -= lowbit 下溯',
      viz: { input: '4 3\n1 2 3 4\n2 1 4\n1 2 5\n2 1 4', type: 'array', mainKey: 'bit', pointers: ['i'], title: '树状数组 bit[]（下标从 1 开始）' },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), q = tk.int();',
        '  var a = tk.ints(n);',
        '  var bit = [], i;',
        '  for (i = 0; i <= n; i++) bit.push(0);',
        '  for (i = 1; i <= n; i++) {',
        '    for (var p = i; p <= n; p += p & -p) bit[p] += a[i - 1];',
        '  }',
        '  var S = { a: a, n: n, q: q, bit: bit, i: 0, lowbit: 1, op: 0, x: 0, v: 0, l: 0, r: 0, ans: 0, res: [] };',
        '  T.step(S, "由原数组建好树状数组 bit[]，bit[i] 管理长度 lowbit(i) 的一段区间");',
        '  for (var k = 0; k < q; k++) {',
        '    S.op = tk.int();',
        '    if (S.op === 1) {',
        '      S.x = tk.int();',
        '      S.v = tk.int();',
        '      for (S.i = S.x; S.i <= n; S.i += S.i & -S.i) {',
        '        S.lowbit = S.i & -S.i;',
        '        S.bit[S.i] += S.v;',
        '        T.step(S, "a[" + S.x + "] 增加 " + S.v + "：bit[" + S.i + "]（管 " + S.lowbit + " 个数）也要加上 " + S.v);',
        '      }',
        '    } else {',
        '      S.l = tk.int();',
        '      S.r = tk.int();',
        '      var right = 0, left = 0;',
        '      for (S.i = S.r; S.i > 0; S.i -= S.i & -S.i) {',
        '        S.lowbit = S.i & -S.i;',
        '        right += S.bit[S.i];',
        '        S.ans = right;',
        '        T.step(S, "求前缀和 [1.." + S.r + "]：累加 bit[" + S.i + "]（管 " + S.lowbit + " 个数）");',
        '      }',
        '      for (S.i = S.l - 1; S.i > 0; S.i -= S.i & -S.i) {',
        '        S.lowbit = S.i & -S.i;',
        '        left += S.bit[S.i];',
        '        S.ans = left;',
        '        T.step(S, "求前缀和 [1.." + (S.l - 1) + "]：累加 bit[" + S.i + "]（管 " + S.lowbit + " 个数）");',
        '      }',
        '      S.ans = right - left;',
        '      S.res.push(S.ans);',
        '      T.step(S, "区间 [" + S.l + ", " + S.r + "] 的和 = " + right + " - " + left + " = " + S.ans);',
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
        '  var a = tk.ints(n);',
        '  var bit = [], i;',
        '  for (i = 0; i <= n; i++) bit.push(0);',
        '  for (i = 1; i <= n; i++) {',
        '    for (var p = i; p <= n; p += p & -p) bit[p] += a[i - 1];',
        '  }',
        '  var S = { a: a, n: n, q: q, bit: bit, i: 0, lowbit: 1, op: 0, x: 0, v: 0, l: 0, r: 0, ans: 0, res: [] };',
        '  T.step(S, "由原数组建好树状数组 bit[]，bit[i] 管理长度 lowbit(i) 的一段区间");',
        '  for (var k = 0; k < q; k++) {',
        '    S.op = tk.int();',
        '    if (S.op === 1) {',
        '      S.x = tk.int();',
        '      S.v = tk.int();',
        '      // TODO: 单点修改：从 i = x 出发，每次 i += i & -i，把 s.v 加到 bit[i] 上，',
        '      //       直到 i > n。每一步用 T.step(S, note) 记录。',
        '    } else {',
        '      S.l = tk.int();',
        '      S.r = tk.int();',
        '      // TODO: 区间查询：分别求前缀和 [1..r] 与 [1..l-1]（从 i 出发每次 i -= i & -i 累加 bit[i]），',
        '      //       两者相减得到区间和，push 进 S.res，并用 T.step 记录。',
        '    }',
        '  }',
        '  var out = S.res.join("\\n");',
        '  T.answer(out);',
        '  return out;',
        '}'
      ].join('\n'),
      pseudo: [
        'add(i, v): while i ≤ N: bit[i] += v; i += i & −i',
        'sum(i): s ← 0; while i > 0: s += bit[i]; i −= i & −i; return s',
        '操作 1 x v → add(x, v)',
        '操作 2 l r → sum(r) − sum(l − 1)'
      ],
      gen: 'function(r){ var n = 1 + Math.floor(Math.random()*6); var q = 1 + Math.floor(Math.random()*5); var s = n + " " + q + "\\n"; var a = []; for (var i = 0; i < n; i++) a.push(Math.floor(Math.random()*21) - 10); s += a.join(" ") + "\\n"; for (var j = 0; j < q; j++) { if (Math.random() < 0.5) { s += "1 " + (1 + Math.floor(Math.random()*n)) + " " + (Math.floor(Math.random()*11) - 5) + "\\n"; } else { var l = 1 + Math.floor(Math.random()*n); var rr = l + Math.floor(Math.random()*(n - l + 1)); s += "2 " + l + " " + rr + "\\n"; } } return s; }'
    },
    tips: [
      '树状数组下标必须从 1 开始，lowbit(i) = i & (-i) 是它管理的区间长度',
      '区间和 = 前缀和(r) − 前缀和(l − 1)，l = 1 时前缀和(0) = 0',
      '操作 1 是「把 a_x 增加 v」而不是「赋值为 v」，别写成赋值'
    ]
  });

  /* ======================================================================
   * p17 ST 表 —— 静态区间最大值
   * ==================================================================== */
  window.CSP.problems.push({
    id: 'p17', no: 17, title: '静态区间最大值', diff: 4, tier: '提高+',
    knowledge: ['ds.st'],
    limits: { time: '1s', memory: '256MB' },
    statement: '给定一个长度为 N 的数列 a₁, a₂, …, a_N 和 Q 次询问。每次询问给出 l, r，请你回答 a_l, a_{l+1}, …, a_r 中的最大值。\n\n数列在整个询问过程中不会发生变化。\n\n要求预处理 O(N log N)，单次询问 O(1)。',
    inputFormat: '第一行两个整数 N, Q（1 ≤ N ≤ 10^5，1 ≤ Q ≤ 10^5）。\n第二行 N 个整数 a₁, a₂, …, a_N（|a_i| ≤ 10^9），相邻两数之间用一个空格隔开。\n接下来 Q 行，每行两个整数 l, r（1 ≤ l ≤ r ≤ N）。',
    outputFormat: '对每次询问输出一行一个整数，表示该区间的最大值。',
    samples: [
      { input: '5 3\n3 1 4 1 5\n1 5\n2 4\n3 3', output: '5\n4\n4', explain: 'max(3,1,4,1,5) = 5；max(1,4,1) = 4；max(4) = 4。' }
    ],
    tests: [
      { input: '5 3\n3 1 4 1 5\n1 5\n2 4\n3 3\n', output: '5\n4\n4', score: 20 },
      { input: '1 1\n7\n1 1\n', output: '7', score: 20 },
      { input: '6 2\n1 2 3 4 5 6\n1 6\n4 5\n', output: '6\n5', score: 20 },
      { input: '4 3\n9 8 7 6\n2 3\n1 1\n1 4\n', output: '8\n9\n9', score: 20 },
      { input: '8 4\n5 5 5 5 5 5 5 5\n1 8\n3 5\n2 2\n7 8\n', output: '5\n5\n5\n5', score: 20 }
    ],
    std: {
      code: `#include <bits/stdc++.h>
using namespace std;
int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    if (!(cin >> n >> q)) return 0;
    vector< vector<long long> > st(1, vector<long long>(n + 1, 0));
    for (int i = 1; i <= n; i++) cin >> st[0][i];
    int K = 1;
    while ((1 << K) <= n) K++;
    st.resize(K, vector<long long>(n + 1, 0));
    for (int k = 1; k < K; k++)
        for (int i = 1; i + (1 << k) - 1 <= n; i++)
            st[k][i] = max(st[k - 1][i], st[k - 1][i + (1 << (k - 1))]);
    while (q--) {
        int l, r;
        cin >> l >> r;
        int k = 0;
        while ((1 << (k + 1)) <= r - l + 1) k++;
        cout << max(st[k][l], st[k][r - (1 << k) + 1]) << endl;
    }
    return 0;
}`
    },
    algo: {
      title: 'ST 表：预处理 2^k 长度的区间最大值，询问 O(1) 拼接两段',
      viz: { input: '5 2\n3 1 4 1 5\n1 5\n2 4', type: 'array', mainKey: 'a', pointers: ['l', 'r'], title: 'ST 表 · 静态区间最大值' },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), q = tk.int();',
        '  var a = tk.ints(n);',
        '  var LOG = [], i, k;',
        '  for (i = 0; i <= n; i++) LOG.push(0);',
        '  for (i = 2; i <= n; i++) LOG[i] = LOG[i >> 1] + 1;',
        '  var K = LOG[n] + 1;',
        '  var st = [[0].concat(a)];',
        '  for (k = 1; k < K; k++) {',
        '    var row = [];',
        '    for (i = 0; i <= n; i++) row.push(0);',
        '    st.push(row);',
        '  }',
        '  for (k = 1; k < K; k++) {',
        '    for (i = 1; i + (1 << k) - 1 <= n; i++) {',
        '      st[k][i] = Math.max(st[k - 1][i], st[k - 1][i + (1 << (k - 1))]);',
        '    }',
        '  }',
        '  var S = { a: a, n: n, st: st, LOG: LOG, l: 0, r: 0, len: 0, k: 0, ans: 0, res: [] };',
        '  T.step(S, "预处理完毕：st[k][i] 表示从 i 开始的 2^k 个数的最大值");',
        '  for (var t = 0; t < q; t++) {',
        '    S.l = tk.int() - 1;',
        '    S.r = tk.int() - 1;',
        '    S.len = S.r - S.l + 1;',
        '    S.k = LOG[S.len];',
        '    S.ans = Math.max(st[S.k][S.l + 1], st[S.k][S.r + 2 - (1 << S.k)]);',
        '    S.res.push(S.ans);',
        '    T.step(S, "询问 [" + (S.l + 1) + ", " + (S.r + 1) + "]：长度 " + S.len + "，用两段 2^" + S.k + " 覆盖，最大值 " + S.ans);',
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
        '  var a = tk.ints(n);',
        '  var LOG = [], i, k;',
        '  for (i = 0; i <= n; i++) LOG.push(0);',
        '  for (i = 2; i <= n; i++) LOG[i] = LOG[i >> 1] + 1;',
        '  var K = LOG[n] + 1;',
        '  var st = [[0].concat(a)];',
        '  for (k = 1; k < K; k++) {',
        '    var row = [];',
        '    for (i = 0; i <= n; i++) row.push(0);',
        '    st.push(row);',
        '  }',
        '  // TODO: 递推填表：st[k][i] = max(st[k-1][i], st[k-1][i + 2^(k-1)])。',
        '  var S = { a: a, n: n, st: st, LOG: LOG, l: 0, r: 0, len: 0, k: 0, ans: 0, res: [] };',
        '  T.step(S, "预处理完毕：st[k][i] 表示从 i 开始的 2^k 个数的最大值");',
        '  for (var t = 0; t < q; t++) {',
        '    S.l = tk.int() - 1;',
        '    S.r = tk.int() - 1;',
        '    // TODO: 令 len = r - l + 1，k = LOG[len]（即 len 的二进制位数减一），',
        '    //       答案为 max(st[k][l+1], st[k][r+2 - 2^k])，push 进 S.res 并 T.step。',
        '  }',
        '  var out = S.res.join("\\n");',
        '  T.answer(out);',
        '  return out;',
        '}'
      ].join('\n'),
      pseudo: [
        'st[0][i] ← a[i]',
        'for k ← 1 to ⌊log₂ N⌋',
        '  for i ← 1 to N − 2^k + 1',
        '    st[k][i] ← max(st[k−1][i], st[k−1][i + 2^(k−1)])',
        '询问(l, r): k ← ⌊log₂(r − l + 1)⌋',
        '  输出 max(st[k][l], st[k][r − 2^k + 1])'
      ],
      gen: 'function(r){ var n = 1 + Math.floor(Math.random()*8); var q = 1 + Math.floor(Math.random()*4); var s = n + " " + q + "\\n"; var a = []; for (var i = 0; i < n; i++) a.push(Math.floor(Math.random()*31) - 15); s += a.join(" ") + "\\n"; for (var j = 0; j < q; j++) { var l = 1 + Math.floor(Math.random()*n); var rr = l + Math.floor(Math.random()*(n - l + 1)); s += l + " " + rr + "\\n"; } return s; }'
    },
    tips: [
      'st[k][i] 覆盖 [i, i + 2^k − 1]，预处理时边界是 i + 2^k − 1 ≤ N',
      '询问时 k = ⌊log₂(len)⌋，两段 2^k 必须完全盖住 [l, r]，所以第二段从 r − 2^k + 1 开始',
      'ST 表只能处理「不修改」的 RMQ；如果要支持修改，请改用线段树'
    ]
  });

  /* ======================================================================
   * p18 哈希表 —— 数对计数
   * ==================================================================== */
  window.CSP.problems.push({
    id: 'p18', no: 18, title: '数对计数', diff: 2, tier: '普及+',
    knowledge: ['ds.hash'],
    limits: { time: '1s', memory: '128MB' },
    statement: '给定 N 个整数 a₁, a₂, …, a_N 和一个目标值 T。\n\n请你统计有多少个数对 (i, j) 满足 i < j 且 a_i + a_j = T。\n\n注意：数值相同但下标不同的两个元素算作不同的元素，因此所有满足 i < j 的下标对都要分别计数。例如 a = (2, 2, 2, 2)、T = 4 时，任意两个下标都满足条件，共 6 对。',
    inputFormat: '第一行两个整数 N, T（1 ≤ N ≤ 2 × 10^5，−10^9 ≤ T ≤ 10^9）。\n第二行 N 个整数 a₁, a₂, …, a_N（−10^9 ≤ a_i ≤ 10^9），相邻两数之间用一个空格隔开。',
    outputFormat: '一个整数，表示满足 a_i + a_j = T 且 i < j 的数对个数。',
    samples: [
      { input: '4 9\n2 7 11 15', output: '1', explain: '只有 a₁ + a₂ = 2 + 7 = 9 一对满足条件。' }
    ],
    tests: [
      { input: '4 9\n2 7 11 15\n', output: '1', score: 20 },
      { input: '5 6\n1 2 3 4 5\n', output: '2', score: 20 },
      { input: '4 4\n2 2 2 2\n', output: '6', score: 20 },
      { input: '3 0\n-1 0 1\n', output: '1', score: 20 },
      { input: '6 10\n5 5 5 5 5 5\n', output: '15', score: 20 }
    ],
    std: {
      code: `#include <bits/stdc++.h>
using namespace std;
int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    long long T;
    if (!(cin >> n >> T)) return 0;
    unordered_map<long long, long long> cnt;
    cnt.reserve((size_t)n * 2 + 10);
    long long ans = 0;
    for (int i = 0; i < n; i++) {
        long long x; cin >> x;
        unordered_map<long long, long long>::iterator it = cnt.find(T - x);
        if (it != cnt.end()) ans += it->second;
        cnt[x]++;
    }
    cout << ans << endl;
    return 0;
}`
    },
    algo: {
      title: '边扫描边用哈希表统计：先查 T − a[i] 出现次数，再把自己插入',
      viz: { input: '4 9\n2 7 11 15', type: 'array', mainKey: 'a', pointers: ['j'], title: '哈希表统计数对' },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), target = tk.int();',
        '  var a = tk.ints(n);',
        '  var cnt = {};',
        '  var S = { a: a, n: n, target: target, j: 0, x: 0, need: 0, hit: 0, ans: 0, cnt: cnt };',
        '  T.step(S, "目标值 T = " + target + "，从左往右扫描，哈希表记录已经出现过的数");',
        '  for (S.j = 0; S.j < n; S.j++) {',
        '    S.x = a[S.j];',
        '    S.need = target - S.x;',
        '    S.hit = cnt[String(S.need)] || 0;',
        '    S.ans += S.hit;',
        '    cnt[String(S.x)] = (cnt[String(S.x)] || 0) + 1;',
        '    T.step(S, "a[" + (S.j + 1) + "] = " + S.x + "，前面有 " + S.hit + " 个 " + S.need + "，累计 " + S.ans + " 对");',
        '  }',
        '  T.answer(String(S.ans));',
        '  return String(S.ans);',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var n = tk.int(), target = tk.int();',
        '  var a = tk.ints(n);',
        '  var cnt = {};',
        '  var S = { a: a, n: n, target: target, j: 0, x: 0, need: 0, hit: 0, ans: 0, cnt: cnt };',
        '  T.step(S, "目标值 T = " + target + "，从左往右扫描，哈希表记录已经出现过的数");',
        '  for (S.j = 0; S.j < n; S.j++) {',
        '    S.x = a[S.j];',
        '    // TODO: 令 need = target - x，从哈希表 cnt 中取出 need 已经出现的次数累加到 S.ans；',
        '    //       然后把 x 的出现次数加一。注意顺序：必须先查后插，才能保证 i < j。',
        '    //       每一轮都要 T.step(S, note)。',
        '  }',
        '  T.answer(String(S.ans));',
        '  return String(S.ans);',
        '}'
      ].join('\n'),
      pseudo: [
        'cnt ← 空哈希表, ans ← 0',
        'for j ← 1 to N',
        '  ans ← ans + cnt[T − a[j]]',
        '  cnt[a[j]] ← cnt[a[j]] + 1',
        '输出 ans'
      ],
      gen: 'function(r){ var n = 1 + Math.floor(Math.random()*8); var v = 1 + Math.floor(Math.random()*5); var arr = []; for (var i = 0; i < n; i++) arr.push(Math.floor(Math.random()*(2*v + 1)) - v); var t = Math.floor(Math.random()*(2*v + 1)) - v; return n + " " + t + "\\n" + arr.join(" "); }'
    },
    tips: [
      '必须先查询再插入，否则同一元素会和自己配成一对',
      '哈希表里存的是「出现次数」而不是「是否出现过」，否则 2 2 2 2 这类数据会算错',
      '答案最大约 2 × 10^10，C++ 请用 long long；unordered_map 记得 reserve 防被卡'
    ]
  });
})();
