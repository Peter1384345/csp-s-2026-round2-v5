/* ============================================================================
 * CSP-S 2026 第二轮 · 知识卡 A 卷
 * 覆盖：基础算法（13 张） + 数据结构（16 张），共 29 张
 * id 全部来自 js/data/syllabus.js，格式遵循 docs/CONTENT-SCHEMA.md 第六节
 * ==========================================================================*/
(function () {
  'use strict';
  window.CSP = window.CSP || {};
  window.CSP.cards = window.CSP.cards || {};

  /* ======================== 基础算法 ======================== */

  window.CSP.cards['basic.simulate'] = {
    definition: '按题面给出的规则一步步执行，用代码忠实还原整个过程并得到答案。',
    keyPoints: [
      '先把题意翻译成「状态 + 操作序列」：明确每一步改变哪些变量，再动手写代码。',
      '把重复的规则抽成函数（如「过一天」「走一轮」），主循环只负责推进轮次与边界判断。',
      '用数组或结构体保存全部状态，避免零散变量导致漏更新。',
      '可能超时时先写最直白的暴力对齐题意，再考虑找循环节、矩阵加速等优化。'
    ],
    complexity: '时间 O(总操作步数)（常为 轮数 × 每轮开销），空间 O(状态规模)',
    pitfalls: [
      '边界轮次判断错：最后一轮只执行一半流程时多算或少算。',
      '累计量超出 int 范围，总步数/累计值应用 long long。',
      '状态传递用了副本而不是引用（函数参数忘记写 &），改了半天状态没变。'
    ],
    template: `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; scanf("%d", &n);
    vector<int> a(n);
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    long long ans = 0;
    // TODO: 按题面规则逐步模拟，每一步更新 ans
    printf("%lld\n", ans);
    return 0;
}`,
    pattern: '题面给出明确而机械的规则（报数、排队、日期推算、棋盘走子）却没有明显模型 —— 直接模拟，重点在边界。',
    related: []
  };

  window.CSP.cards['basic.enumerate'] = {
    definition: '在有限解空间中穷举所有可能，逐一验证并取最优值或计数。',
    keyPoints: [
      '先估算解空间大小，确保最坏情况也在时限内（约 1e7~1e8 次简单操作）。',
      '确定枚举维度的嵌套顺序，把范围小、能提前剪枝的维度放在外层。',
      '循环边界写清楚（用 < n 还是 <= n），必要时统一 1-indexed 减少特判。',
      '枚举子集用位运算：for (mask = 0; mask < (1 << n); mask++) 配合 mask >> i & 1。'
    ],
    complexity: '时间 O(|解空间| × 单次验证代价)，空间 O(1) 或 O(n)',
    pitfalls: [
      '循环上界写成 n+1 或用 <= 导致越界或最后一位多算。',
      '1 << n 在 n >= 31 时 int 溢出，必须写 1LL << n。',
      '剪枝条件写在循环体内部而不是循环条件上，复杂度一点没降。'
    ],
    template: `for (int i = 0; i < n; i++)
    for (int j = i + 1; j < n; j++)
        if (check(i, j)) ans = max(ans, val(i, j));
// 子集枚举
for (int mask = 0; mask < (1 << n); mask++) {
    for (int i = 0; i < n; i++)
        if (mask >> i & 1) { /* 选中第 i 个 */ }
}`,
    pattern: '数据范围很小（n ≤ 20 或 n ≤ 2000）却要求「所有方案」「最优值」—— 先想枚举/暴力，再想优化。',
    related: []
  };

  window.CSP.cards['basic.recursion'] = {
    definition: '函数直接或间接调用自身，把大问题拆成同构的更小子问题求解。',
    keyPoints: [
      '写清递归三要素：参数含义、终止（边界）条件、向子问题转移的公式。',
      '每层只关心「本层做什么 + 交给下一层什么」，不要试图在脑中展开全部层。',
      '递归深度超过 1e5 会爆栈，此时改写成显式栈的迭代写法。',
      '存在重复子问题就加记忆化数组，可把指数级递归降为状态数级别。'
    ],
    complexity: '时间 O(递归节点数 × 单层代价)，空间 O(递归深度)（栈帧开销）',
    pitfalls: [
      '漏写终止条件或终止条件不可达，导致无限递归爆栈（RE）。',
      '递归返回值忘记接收或忘记 return，上层拿到垃圾值。',
      '记忆化数组的「未访问」初值与合法答案冲突（如用 0 表示未算，但 0 是合法解）。'
    ],
    template: `long long memo[N];
long long dfs(int x) {
    if (x == 0) return 1;                 // 边界
    if (memo[x] != -1) return memo[x];    // 记忆化
    long long res = 0;
    for (int i = 1; i <= x; i++)
        res += dfs(x - i);
    return memo[x] = res;                 // 边算边存
}`,
    pattern: '问题能「拆成同样形状的更小子问题」，或定义本身就是一个递推式 —— 递归 + 记忆化。',
    related: []
  };

  window.CSP.cards['basic.divide'] = {
    definition: '把问题分成若干规模更小的子问题分别求解，再合并子问题答案得到原解。',
    keyPoints: [
      '分治三步：分解（mid = (l + r) >> 1）、递归求解左右、合并跨中点或左右的贡献。',
      '归并排序的合并用双指针取较小值，顺带统计逆序对（右半元素先出时答案 += mid - i + 1）。',
      '合并代价决定总复杂度：O(n) 合并 → O(n log n)；若合并要排序则 O(n log² n)。',
      '统计「跨区间」贡献时先让两侧有序，避免 O(n²) 逐个检查。'
    ],
    complexity: '时间 O(n log n)（共 log n 层，每层 O(n)），空间 O(n)（归并临时数组）',
    pitfalls: [
      '临时数组拷回原数组的下标范围写错（把 [l,r] 写成 [0,n) 覆盖了别的数据）。',
      '逆序对答案要用 long long，n = 1e5 时最多可达约 5e9。',
      '分治区间必须不重不漏，写成 [l,mid] 与 [mid+1,r] 配合 mid=(l+r)>>1 才不会死循环。'
    ],
    template: `void msort(int l, int r) {
    if (l >= r) return;
    int mid = (l + r) >> 1;
    msort(l, mid); msort(mid + 1, r);
    int i = l, j = mid + 1, k = l;
    while (i <= mid && j <= r) {
        if (a[i] <= a[j]) tmp[k++] = a[i++];      // <= 保证稳定
        else { ans += mid - i + 1; tmp[k++] = a[j++]; }  // 统计逆序对
    }
    while (i <= mid) tmp[k++] = a[i++]; while (j <= r) tmp[k++] = a[j++];
    for (int t = l; t <= r; t++) a[t] = tmp[t];
}`,
    pattern: '「逆序对」「统计满足 i<j 且 a[i]>a[j] 的点对」「每次把区间对半分」—— 归并分治或 CDQ 分治。',
    related: []
  };

  window.CSP.cards['basic.greedy'] = {
    definition: '每一步都选当前看来最优的决策，且这些局部最优能推出全局最优。',
    keyPoints: [
      '先猜结论（按什么关键字排序、每次选哪个），再用「交换论证」或归纳法证明其正确性。',
      '常见排序关键字：区间调度按右端点升序、带时限任务按截止时间、配对问题按较小值。',
      '优先队列是贪心的标配：每次取出当前最优候选，处理完把新候选放回。',
      '证明不出来就用小数据对拍暴力验证结论，考场不要凭感觉下结论。'
    ],
    complexity: '时间 O(n log n)（多为一次排序或堆操作），空间 O(n)',
    pitfalls: [
      '把「局部最优」当成「全局最优」而不验证，典型反例是 0/1 背包按单位价值贪心。',
      '排序比较函数不满足严格弱序（cmp 里用 <=）导致 std::sort 越界崩溃。',
      '用浮点数做贪心比较，注意改用整数交叉相乘避免精度误差。'
    ],
    template: `sort(a + 1, a + n + 1, [](const P &x, const P &y) {
    return x.r < y.r;                        // 按右端点排序
});
int cnt = 0; long long last = -1e18;
for (int i = 1; i <= n; i++)
    if (a[i].l >= last) { cnt++; last = a[i].r; }
printf("%d\\n", cnt);`,
    pattern: '题面问「最多能选多少个互不冲突的」「最小代价完成所有任务」且决策看似只影响局部 —— 贪心 + 排序。',
    related: []
  };

  window.CSP.cards['basic.sort'] = {
    definition: '把序列按关键字重排成有序序列，是二分、双指针、去重等算法的前置步骤。',
    keyPoints: [
      '竞赛默认用 std::sort（内省排序，最坏 O(n log n)），不要手写冒泡/选择排序。',
      '结构体排序用 cmp 或 lambda，关键字相同时要有确定的次级关键字以保证严格弱序。',
      '需要保持相等元素相对次序用 stable_sort；只需名次可「排序后取下标」或离散化。',
      '值域很小时计数/桶排序可做到 O(n + V)，基数排序可做到 O(n log V)。'
    ],
    complexity: '时间 O(n log n)（比较排序）；空间 O(log n) 递归栈，stable_sort 需 O(n)',
    pitfalls: [
      'cmp 写成 a.v <= b.v 会触发「invalid comparator」，导致 RE 或结果错乱。',
      '对下标排序时忘记按值比较，写成了 cmp(i, j) { return i < j; }。',
      'sort(a, a+n) 与 sort(a+1, a+n+1) 混用，造成首元素没排序或越界。'
    ],
    template: `struct Node { int v, id; };
bool cmp(const Node &a, const Node &b) {
    if (a.v != b.v) return a.v < b.v;        // 主关键字
    return a.id < b.id;                      // 次级关键字，保证严格弱序
}
sort(v.begin(), v.end(), cmp);
sort(a + 1, a + n + 1);                      // 1-indexed 写法`,
    pattern: '题目需要「有序」「第 k 小」「两数之和」或贪心前先规整顺序 —— 先排序。',
    related: []
  };

  window.CSP.cards['basic.binary'] = {
    definition: '在单调序列中折半缩小范围查找目标，或利用答案的单调性做判定式二分。',
    keyPoints: [
      '二分查找统一用「查第一个 >= x」模板（左闭右开或闭区间），比随手写边界更不容易错。',
      '二分答案三步：确定答案上下界、写 check(mid) 判定函数、按「最小可行 / 最大可行」选收缩方向。',
      'check 必须关于 mid 单调（单调不减或单调不增），否则二分不成立。',
      '有序容器优先用 lower_bound / upper_bound，省去手写边界。'
    ],
    complexity: '时间 O(log n)（查找）或 O(log V × check 代价)（二分答案），空间 O(1)',
    pitfalls: [
      'while (l < r) 里 mid = (l+r)/2 与 mid = (l+r+1)/2 用错方向导致死循环。',
      '二分答案的上下界开小了，最优解落在界外时返回错误答案。',
      'l + r 溢出 int，应写成 l + (r - l) / 2。'
    ],
    template: `int l = 1, r = n, ans = -1;
while (l <= r) {
    int mid = l + (r - l) / 2;
    if (check(mid)) { ans = mid; r = mid - 1; }   // 求最小可行
    else l = mid + 1;
}
// 有序数组中第一个 >= x 的位置
int p = lower_bound(a + 1, a + n + 1, x) - a;`,
    pattern: '「最小值最大」「最大值最小」「第 k 小」「答案单调且可判定」—— 二分答案。',
    related: []
  };

  window.CSP.cards['basic.twopointer'] = {
    definition: '用两个下标同向或相向扫描序列，把 O(n²) 的双重枚举降为 O(n)。',
    keyPoints: [
      '同向双指针（尺取法）要求区间扩张收缩满足单调性：右指针只增，左指针也只增。',
      '相向双指针用于有序数组两数之和：和偏小移左指针，和偏大移右指针。',
      '快慢指针可在链表上求中点、判环（Floyd 判圈算法）。',
      '移动哪一侧由「当前状态与目标的偏序关系」唯一确定，这是正确性的关键。'
    ],
    complexity: '时间 O(n)（每个指针最多移动 n 次），空间 O(1)',
    pitfalls: [
      '左指针越过右指针后仍继续统计，导致区间非法、答案偏大。',
      '滑动窗口收缩时忘记把移出元素的贡献减掉，窗口状态与区间不一致。',
      '在无序数组上直接套双指针做两数之和，正确性失效（必须先排序）。'
    ],
    template: `int l = 1, sum = 0, ans = 0;
for (int r = 1; r <= n; r++) {
    sum += a[r];                              // 右指针扩张
    while (l <= r && sum > S) sum -= a[l++];  // 左指针收缩
    if (sum == S) ans++;
}
printf("%d\\n", ans);`,
    pattern: '「连续子段和」「最短/最长满足条件的区间」「有序数组两数之和」—— 双指针/尺取。',
    related: []
  };

  window.CSP.cards['basic.prefix'] = {
    definition: '预处理前缀累加值，使任意区间和能在 O(1) 内查询。',
    keyPoints: [
      '一维：s[i] = s[i-1] + a[i]，区间 [l,r] 的和为 s[r] - s[l-1]。',
      '二维：s[i][j] = s[i-1][j] + s[i][j-1] - s[i-1][j-1] + a[i][j]（容斥），查询同理容斥。',
      '前缀异或同样可减：xor(l..r) = px[r] ^ px[l-1]，可用于异或类区间查询。',
      '多次静态区间查询时前缀和优于线段树（同为查询，常数更小且代码更短）。'
    ],
    complexity: '预处理 O(n)，单次查询 O(1)，空间 O(n)（二维为 O(nm)）',
    pitfalls: [
      '数组没开到 n+1，访问 s[l-1] 当 l=1 时越界（务必 1-indexed 且 s[0]=0）。',
      '前缀和超出 int 范围，累加数组与答案要用 long long。',
      '二维前缀和查询里该减 1 的下标没减，写成 s[x2][y2]-s[x1][y2]-s[x2][y1]+s[x1][y1]。'
    ],
    template: `long long s[N + 1];
for (int i = 1; i <= n; i++) s[i] = s[i - 1] + a[i];
auto query = [&](int l, int r) { return s[r] - s[l - 1]; };
// 二维前缀和
s[i][j] = s[i-1][j] + s[i][j-1] - s[i-1][j-1] + a[i][j];
// 二维查询 [x1,y1]..[x2,y2]
long long q = s[x2][y2] - s[x1-1][y2] - s[x2][y1-1] + s[x1-1][y1-1];`,
    pattern: '「多次询问区间和」「连续子段统计」「区间异或」—— 前缀和预处理。',
    related: []
  };

  window.CSP.cards['basic.diff'] = {
    definition: '用差分数组把「区间整体加减」变成两次单点修改，最后前缀和还原。',
    keyPoints: [
      '一维：对 [l,r] 加 v 即 d[l] += v, d[r+1] -= v；还原时 a[i] = a[i-1] + d[i]。',
      '差分适合「多次修改、最后一次统一查询」的离线场景；要在线查询需配树状数组/线段树。',
      '二维差分：矩形加 v 修改四个角 (x1,y1)+v、(x2+1,y1)-v、(x1,y2+1)-v、(x2+1,y2+1)+v。',
      '树上差分（点）：u→v 路径加 v，则 d[u]+=v, d[v]+=v, d[lca]-=v, d[fa[lca]]-=v。'
    ],
    complexity: '单次区间修改 O(1)，最终还原 O(n)，空间 O(n)',
    pitfalls: [
      'd[r+1] 在 r=n 时越界，差分数组要开到 n+2。',
      '还原时忘记从前往后累加前缀和，直接把 d[i] 当结果输出。',
      '边差分与点差分公式不同（边差分为 d[u]++, d[v]++, d[lca]-=2），混用必错。'
    ],
    template: `long long d[N + 2];
for (int i = 1; i <= m; i++) {
    int l, r, v; scanf("%d%d%d", &l, &r, &v);
    d[l] += v; d[r + 1] -= v;                 // 区间 [l,r] 加 v
}
long long cur = 0;
for (int i = 1; i <= n; i++) { cur += d[i]; a[i] = cur; }   // 前缀和还原`,
    pattern: '「m 次区间加，最后问每个位置的值」「区间操作离线可合并」—— 差分 + 前缀和还原。',
    related: []
  };

  window.CSP.cards['basic.discretize'] = {
    definition: '把大值域、只关心相对大小的数据映射到 1..k 的连续整数，便于开数组或用下标维护。',
    keyPoints: [
      '标准流程：拷贝原数组 → sort 排序 → unique 去重 → lower_bound 查名次（+1 变 1-indexed）。',
      '离散化后 k ≤ n，可放心开 k 大小的树状数组、线段树或计数数组。',
      '若需保留相等元素的先后顺序且要稳定编号，可用 stable_sort 或先记录原下标。',
      '离线可用排序 + 双指针代替二分，整体从 O(n log n) 变常数更小的排序主导。'
    ],
    complexity: '时间 O(n log n)（排序 + 每次二分查找），空间 O(n)',
    pitfalls: [
      '忘记 unique，同一值被映射成多个编号，导致区间统计出错。',
      '用 upper_bound 使编号从 0 开始，而树状数组要求下标 ≥ 1。',
      '对原数组排序后丢失了原下标，没有在离散化前保存映射关系。'
    ],
    template: `vector<int> b(a + 1, a + n + 1);
sort(b.begin(), b.end());
b.erase(unique(b.begin(), b.end()), b.end());
for (int i = 1; i <= n; i++)
    a[i] = lower_bound(b.begin(), b.end(), a[i]) - b.begin() + 1;  // 1-indexed`,
    pattern: '「值域 1e9 但只有 n ≤ 1e5 个数」「需要拿数值当下标」—— 离散化到 1..k。',
    related: []
  };

  window.CSP.cards['basic.highprec'] = {
    definition: '用数组按位存储超出内置整数范围的大整数，手工实现加、减、乘、除。',
    keyPoints: [
      '低位存放在小下标（a[0] 是个位），进位从低位向高位传递，输出时倒序。',
      '加法逐位相加带进位；减法保证大减小，不够减时借位 +10。',
      '乘法 O(nm)：c[i+j] += a[i] * b[j]，最后统一从低位向高位处理进位。',
      '除以低精度整数：从高位到低位逐位试商，余数 ×10 再加下一位。'
    ],
    complexity: '加减 O(n)，乘法 O(nm)，除以低精度 O(n)，空间 O(n+m)',
    pitfalls: [
      '忘记去掉前导零，输出出现 000123；但结果恰好为 0 时要保留一个 0。',
      '减法未保证被减数更大，产生负数位。',
      '乘法中间结果 c[i+j] 可能超出 int，要用 long long 或每步及时进位。'
    ],
    template: `string add(string A, string B) {          // 字符串版高精度加法
    string C; int i = A.size() - 1, j = B.size() - 1, c = 0;
    while (i >= 0 || j >= 0 || c) {
        int s = c;
        if (i >= 0) s += A[i--] - '0';
        if (j >= 0) s += B[j--] - '0';
        C += char('0' + s % 10); c = s / 10;
    }
    reverse(C.begin(), C.end()); return C;
}`,
    pattern: '题目要求精确的「几千位大数」加减乘（阶乘、2^n、斐波那契第 n 项）—— 高精度数组。',
    related: []
  };

  window.CSP.cards['basic.complexity'] = {
    definition: '分析算法时间与空间随输入规模增长的数量级，用来判断能否通过时限与内存。',
    keyPoints: [
      '以最坏情况为准，写出操作次数关于 n 的表达式，只保留最高阶项并去掉常数。',
      '常用换算：1 秒约 1e8 次简单运算；n ≤ 1e5 配 O(n log n)，n ≤ 1e3 可 O(n²)，n ≤ 20 可 O(2^n)。',
      '空间按 int 4B、long long 8B 估算，128MB 约可放 3.3e7 个 int。',
      '递归的空间复杂度要算栈深度，时间再优也可能因深递归爆栈。'
    ],
    complexity: '常见量级 O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2^n) < O(n!)',
    pitfalls: [
      '把 O(n log n) 误当成 O(n)，数据规模放大后直接超时。',
      '忽略常数与 STL 开销：同为 O(n log n)，set 常比 sort 慢数倍。',
      '只算主体循环，漏算排序、建图、离散化等预处理开销。'
    ],
    template: `// 估算口诀（1 秒 ≈ 1e8 次基本运算）
// n=1e5  -> O(n log n) ≈ 1.7e6  可过；O(n^2) = 1e10 超时
// n=1e3  -> O(n^2) = 1e6        可过
// n=20   -> O(2^n) ≈ 1e6        可过
// 内存：int a[1e7] ≈ 40MB；long long a[1e7] ≈ 80MB`,
    pattern: '读完题先算复杂度：数据范围决定算法，1e5 想 O(n log n)，1e9 想 O(log n)。',
    related: []
  };

  /* ======================== 数据结构 ======================== */

  window.CSP.cards['ds.stack'] = {
    definition: '后进先出（LIFO）的线性表，只能在栈顶插入和删除元素。',
    keyPoints: [
      '数组模拟最快：st[++top] = x 入栈，y = st[top--] 出栈，top 初值 0 表示空栈。',
      'STL 用 stack<int>，注意 pop() 不返回值，取栈顶必须先 top() 再 pop()。',
      '典型应用：括号匹配、表达式求值、中缀转后缀、DFS 非递归、进制转换。',
      '栈能维护「尚未完成的上下文」，天然适合需要回退到上一层的场景。'
    ],
    complexity: '单次入栈/出栈 O(1)，空间 O(n)',
    pitfalls: [
      '出栈前没有判空（top == 0 或 empty()），导致越界或未定义行为。',
      'STL 使用顺序颠倒，写成 s.pop(); int t = s.top();。',
      'top 初始化成 0 还是 -1 与判空条件不匹配，空栈判断失效。'
    ],
    template: `int st[N], top = 0;
st[++top] = x;               // 入栈
int y = st[top--];           // 出栈
if (top == 0) { /* 栈空 */ }
// STL 写法
stack<int> s; s.push(x);
int t = s.top(); s.pop();    // 先取再弹`,
    pattern: '「最后出现的先处理」「配对/抵消/回退」「括号、表达式求值」—— 栈。',
    related: []
  };

  window.CSP.cards['ds.queue'] = {
    definition: '先进先出（FIFO）的线性表，在队尾入队、在队首出队。',
    keyPoints: [
      '数组模拟：q[++tail] = x 入队，u = q[head++] 出队，head 与 tail 都从 1/0 起要一致。',
      '循环队列用 head、tail 对 N 取模，并空出一个位置以区分「队空」与「队满」。',
      'STL 用 queue<int>，push/pop/front/back 各司其职，pop 同样不返回值。',
      '典型应用：BFS 层次遍历、模拟排队、单调队列的底层容器。'
    ],
    complexity: '单次入队/出队 O(1)，空间 O(n)',
    pitfalls: [
      '判空条件写成 head == tail 而不是 head > tail，导致循环不终止。',
      '循环队列不空出位置，无法区分队空与队满。',
      'BFS 中入队时没有立刻标记 vis，同一节点被重复入队导致超时或答案错。'
    ],
    template: `int q[N], head = 1, tail = 0;
q[++tail] = s;                            // 入队
while (head <= tail) {                    // 非空
    int u = q[head++];                    // 出队
    for (int v : g[u])
        if (!vis[v]) { vis[v] = 1; q[++tail] = v; }   // 入队即标记
}`,
    pattern: '「按到达顺序依次处理」「一层一层向外扩展」「求最短步数」—— 队列/BFS。',
    related: []
  };

  window.CSP.cards['ds.monostack'] = {
    definition: '栈内元素保持单调，入栈时弹掉破坏单调性的元素，用来求最近的更大/更小元素。',
    keyPoints: [
      '求「左边第一个比它小的元素」用单调递增栈：while (top && a[st[top]] >= a[i]) top--; 栈顶即答案。',
      '弹出条件用 >= 还是 > 决定相等元素算不算「更小」，必须与题意一致。',
      '每个元素至多入栈一次、出栈一次，因此总复杂度是 O(n)。',
      '求右边第一个更大元素就从右往左扫；两侧都要求就正反各扫一次。'
    ],
    complexity: '时间 O(n)（均摊，每元素进出栈各一次），空间 O(n)',
    pitfalls: [
      '弹出条件写反或该带等号没带，相等元素的答案出错。',
      '栈里存下标却在比较时用 st[top] 而忘了套 a[]，比较的是下标而非值。',
      '弹出后忘记把当前元素入栈，栈永远为空。'
    ],
    template: `int st[N], top = 0, L[N];
for (int i = 1; i <= n; i++) {
    while (top && a[st[top]] >= a[i]) top--;   // 弹出条件：破坏单调就弹
    L[i] = top ? st[top] : 0;                  // 左边第一个更小的位置
    st[++top] = i;                             // 当前元素入栈
}`,
    pattern: '「每个数左边/右边第一个比它大/小的位置」「柱状图最大矩形」「接雨水」—— 单调栈。',
    related: []
  };

  window.CSP.cards['ds.monoqueue'] = {
    definition: '用双端队列维护窗口内元素的单调性，O(1) 取出滑动窗口的最值。',
    keyPoints: [
      '队列存下标；出队分两类：队首过期（q.front() <= i-k）弹出，队尾破坏单调（a[q.back()] >= a[i]）弹出。',
      '求窗口最小值用单调递增队列（队首最小），求最大值用单调递减队列。',
      '必须用 deque 或数组双端队列，普通 queue 无法从队尾弹出。',
      '常用于优化 DP：dp[i] = min(dp[j]) + w，其中 j 被限制在长度为 k 的窗口内。'
    ],
    complexity: '时间 O(n)（每个下标至多进出队一次），空间 O(k)',
    pitfalls: [
      '先入队还是先取答案的顺序颠倒，导致窗口大小差 1 或答案取到元素自身。',
      '过期判断写成 < i-k 而不是 <= i-k，窗口实际长度变成 k+1。',
      '用 queue 实现却调用 pop_back()，编译不过或语义错误。'
    ],
    template: `deque<int> q;
for (int i = 1; i <= n; i++) {
    while (!q.empty() && q.front() <= i - k) q.pop_front();  // 队首过期
    while (!q.empty() && a[q.back()] >= a[i]) q.pop_back();  // 维持单调
    q.push_back(i);
    if (i >= k) printf("%d ", a[q.front()]);                 // 窗口最小值
}`,
    pattern: '「长度为 k 的窗口内的最大值/最小值」「DP 转移只依赖最近 k 个状态」—— 单调队列。',
    related: []
  };

  window.CSP.cards['ds.linked'] = {
    definition: '用指针或数组下标把数据串成链，插入删除 O(1)，随机访问 O(n)。',
    keyPoints: [
      '竞赛推荐「数组模拟链表」：nxt[i]、pre[i] 存下标，避免 new/delete 的开销与内存泄漏。',
      '单链表插入：nxt[x] = nxt[p]; nxt[p] = x; 删除：nxt[p] = nxt[nxt[p]]。',
      '双向链表删除节点 x 要同时改 nxt[pre[x]] = nxt[x] 与 pre[nxt[x]] = pre[x]。',
      '典型应用：邻接表存图（head/nxt 数组）、约瑟夫环、链表反转、LRU。'
    ],
    complexity: '插入/删除 O(1)（已知前驱），查找 O(n)，空间 O(n)',
    pitfalls: [
      '删除前没保存 next 指针，删除后无法继续遍历链表。',
      '数组模拟中把下标 0 当普通节点用，而 0 通常表示空指针（真实节点必须从 1 开始）。',
      '尾插时忘记更新尾指针，或忘记把新节点的 nxt 置为 0/-1。'
    ],
    template: `int head = 0, nxt[N], val[N];   // 0 表示空，节点编号从 1 开始
void insert(int p, int x) { nxt[x] = nxt[p]; nxt[p] = x; }
void del(int p) { nxt[p] = nxt[nxt[p]]; }
// 遍历
for (int i = nxt[head]; i; i = nxt[i]) printf("%d ", val[i]);`,
    pattern: '「频繁在中间插入/删除」「按顺序维护一个动态序列」—— 链表（数组模拟）。',
    related: []
  };

  window.CSP.cards['ds.heap'] = {
    definition: '完全二叉树结构，堆顶始终是最值，支持 O(log n) 插入与删除堆顶。',
    keyPoints: [
      'STL 默认大根堆 priority_queue<int>；小根堆写 priority_queue<int, vector<int>, greater<int>>。',
      '手写堆：插入放到末尾后上浮 sift-up；删堆顶用末尾元素覆盖堆顶后下沉 sift-down。',
      '需要「删除任意元素」用懒惰删除堆：另开一个「待删计数堆」，pop 时循环弹掉被标记的堆顶。',
      '堆可用于堆排序、求第 k 大、Dijkstra、合并多条有序链。'
    ],
    complexity: '插入 O(log n)，取堆顶 O(1)，删除堆顶 O(log n)，建堆 O(n)',
    pitfalls: [
      'greater<int> 漏写 <int> 或漏 include <functional>，编译报错。',
      '用 priority_queue 存结构体却忘记重载 operator<，编译报错。',
      '懒惰删除时只弹一次，忘记循环弹出所有已标记删除的堆顶元素。'
    ],
    template: `priority_queue<int> mx;                                // 大根堆
priority_queue<int, vector<int>, greater<int>> mn;     // 小根堆
mx.push(x); mn.push(x);
int t = mx.top(); mx.pop();
struct Node { int d, u;
    bool operator<(const Node &o) const { return d > o.d; } };  // 小根堆`,
    pattern: '「每次取当前最大/最小」「动态维护前 k 大」「合并多条有序链」—— 堆/优先队列。',
    related: []
  };

  window.CSP.cards['ds.dsu'] = {
    definition: '维护若干不相交集合，支持快速合并两个集合与查询元素所属集合。',
    keyPoints: [
      'fa[x] 记录父节点，find(x) 沿父链上溯到根，根满足 fa[x] == x。',
      '路径压缩：find 时把沿途节点直接挂到根上，均摊接近 O(1)。',
      '按大小（或按秩）合并：把小子树挂到大子树根上，避免树退化成链。',
      '扩展：带权并查集维护到根的距离；种类并查集开 k 倍点表示与根的相对关系。'
    ],
    complexity: '时间 O(α(n)) 均摊（实用中近似 O(1)），空间 O(n)',
    pitfalls: [
      '初始化只写了 fa[i] = i，忘记把 sz[i] 初始化为 1。',
      'join 时忘记先 find 出两个根，直接 fa[u] = v 会破坏整棵子树的父指针。',
      '只做路径压缩而不按大小合并，某些构造数据仍会退化。',
      '路径压缩会破坏 rank 语义，改用 size 更安全。'
    ],
    template: `int fa[N], sz[N];
int find(int x) { return fa[x] == x ? x : fa[x] = find(fa[x]); }  // 路径压缩
void join(int x, int y) {
    x = find(x); y = find(y);
    if (x == y) return;
    if (sz[x] < sz[y]) swap(x, y);       // 按大小合并
    fa[y] = x; sz[x] += sz[y];
}
// 初始化：for (i) fa[i] = i, sz[i] = 1;`,
    pattern: '「动态连通性」「判断两点是否连通」「合并集合」「Kruskal 求 MST」—— 并查集。',
    related: []
  };

  window.CSP.cards['ds.bit'] = {
    definition: '用 lowbit 划分区间的树状数组，支持单点修改与前缀查询，均为 O(log n)。',
    keyPoints: [
      'lowbit(x) = x & (-x)，即 x 二进制最低位 1 及其后面所有 0 组成的值。',
      '修改：for (i = x; i <= n; i += lowbit(i)) c[i] += v；查询前缀：for (i = x; i; i -= lowbit(i)) ans += c[i]。',
      '区间和 [l,r] = sum(r) - sum(l-1)；下标必须从 1 开始，c[0] 恒为 0。',
      '差分树状数组可支持「区间加 + 单点查」；统计逆序对用值域树状数组倒序插入。'
    ],
    complexity: '单点修改 O(log n)，前缀/区间查询 O(log n)，空间 O(n)',
    pitfalls: [
      '下标从 0 开始时 lowbit(0) == 0 会造成死循环，务必 1-indexed。',
      '用树状数组维护区间最值（不可减信息），修改时无法回退导致答案偏大。',
      '前缀和超过 int 范围，c[] 与答案都要用 long long。',
      '查询循环写成 for (i = x; i > 0; i -= lowbit(i)) 却在别处漏了 i>0 判断。'
    ],
    template: `int n; long long c[N];
int lowbit(int x) { return x & -x; }
void add(int i, long long v) { for (; i <= n; i += lowbit(i)) c[i] += v; }
long long sum(int i) {
    long long s = 0;
    for (; i; i -= lowbit(i)) s += c[i];    // i 降到 0 即停
    return s;
}
long long query(int l, int r) { return sum(r) - sum(l - 1); }`,
    pattern: '「单点改 + 前缀/区间和」「动态求逆序对」「值域计数动态更新」—— 树状数组。',
    related: []
  };

  window.CSP.cards['ds.segtree'] = {
    definition: '把区间递归二分成树形结构，每个节点维护一段区间的聚合信息，支持区间查询与单点修改。',
    keyPoints: [
      '数组要开到 4n；节点 p 的左右儿子为 p<<1 与 p<<1|1，区间 [l,r] 的中点为 (l+r)>>1。',
      'build 递归建树；update 修改单点后 pushup 更新父节点；query 按区间交集递归取答案。',
      'pushup 把左右儿子信息合并到父节点（sum 相加、max 取大、矩阵相乘等）。',
      '区间查询时若当前节点区间被完全覆盖就直接返回，否则只向有交集的儿子递归再合并。'
    ],
    complexity: '建树 O(n)，单点修改 O(log n)，区间查询 O(log n)，空间 O(4n)',
    pitfalls: [
      '数组只开 2n 导致下标越界（必须 4n 或补齐到 2 的幂）。',
      'query 时没有判断区间是否相交，向不相交的儿子递归得到错误答案。',
      '叶子节点 l == r 没有写终止条件，造成无限递归爆栈。',
      '递归区间写成 [l,mid] 与 [mid,r] 导致死循环，必须是 [l,mid] 与 [mid+1,r]。'
    ],
    template: `int t[N << 2];
void build(int p, int l, int r) {
    if (l == r) { t[p] = a[l]; return; }
    int m = (l + r) >> 1;
    build(p << 1, l, m); build(p << 1 | 1, m + 1, r);
    t[p] = t[p << 1] + t[p << 1 | 1];          // pushup
}
void upd(int p, int l, int r, int x, int v) {
    if (l == r) { t[p] = v; return; }
    int m = (l + r) >> 1;
    if (x <= m) upd(p << 1, l, m, x, v); else upd(p << 1 | 1, m + 1, r, x, v);
    t[p] = t[p << 1] + t[p << 1 | 1];
}`,
    pattern: '「区间查询 + 单点修改」「区间最值/区间和」且数据规模不允许每次 O(n) 查询 —— 线段树。',
    related: []
  };

  window.CSP.cards['ds.lazy'] = {
    definition: '带懒标记的线段树，把区间修改的标记暂存节点，访问到才下传，使区间修改 O(log n)。',
    keyPoints: [
      'add[p] 表示「p 覆盖的整段都被加了 add[p]，但还没下传给儿子」。',
      'pushdown(p,l,r)：若 add[p] != 0，把标记累加到左右儿子的 add 与其自身值（加值 × 儿子区间长度），再清零 add[p]。',
      '递归进儿子之前必须 pushdown，递归返回之后必须 pushup。',
      '多种标记复合时要规定下传顺序（如「赋值 + 加法」中赋值标记应覆盖加法标记）。'
    ],
    complexity: '区间修改 O(log n)，区间查询 O(log n)，空间 O(4n)',
    pitfalls: [
      '修改/查询前忘记 pushdown，儿子的值没跟上父节点的修改。',
      'pushdown 时给儿子加值忘记乘儿子区间长度（区间加必须乘 len）。',
      '递归结束后忘记 pushup，父节点的值过期。',
      '两类标记叠加时下传顺序写反，先传赋值再传加法会得到错误结果。'
    ],
    template: `long long t[N << 2], add[N << 2];
void pushdown(int p, int l, int r) {
    if (!add[p]) return; int m = (l + r) >> 1; long long v = add[p];
    add[p << 1] += v, t[p << 1] += v * (m - l + 1);
    add[p << 1 | 1] += v, t[p << 1 | 1] += v * (r - m); add[p] = 0;
}
void upd(int p, int l, int r, int L, int R, long long v) {
    if (L <= l && r <= R) { t[p] += v * (r - l + 1), add[p] += v; return; }
    pushdown(p, l, r); int m = (l + r) >> 1;
    if (L <= m) upd(p << 1, l, m, L, R, v); if (R > m) upd(p << 1 | 1, m + 1, r, L, R, v);
    t[p] = t[p << 1] + t[p << 1 | 1];
}`,
    pattern: '「区间加 + 区间求和」「区间赋值 + 区间最值」等区间修改与区间查询混合 —— 懒标记线段树。',
    related: []
  };

  window.CSP.cards['ds.st'] = {
    definition: '倍增预处理每个位置起长度为 2^k 的区间最值，O(1) 回答静态区间最值（RMQ）。',
    keyPoints: [
      'st[k][i] 表示区间 [i, i+2^k-1] 的最值，转移 st[k][i] = max(st[k-1][i], st[k-1][i+2^(k-1)])。',
      '查询 [l,r]：k = lg[r-l+1]，答案 = max(st[k][l], st[k][r-2^k+1])，两段重叠不影响最值。',
      '预处理 lg[i] = lg[i>>1] + 1，避免每次调用慢速的 log()。',
      '只适用于「可重复贡献」的运算（max/min/gcd），区间和会因为重叠被重复计算。'
    ],
    complexity: '预处理 O(n log n)，单次查询 O(1)，空间 O(n log n)',
    pitfalls: [
      '第一维只开到 log n 而不是 log n + 1，k 取到边界时越界。',
      '把 ST 表用于区间求和，重叠部分被算两次导致答案偏大。',
      '查询写成 st[k][r - (1 << k)] 少加了 1，区间右端错位。',
      'n = 1e6 时 n log n 的空间（约 2e7 个 int）可能超过内存限制。'
    ],
    template: `int st[20][N], lg[N];
for (int i = 2; i <= n; i++) lg[i] = lg[i >> 1] + 1;
for (int i = 1; i <= n; i++) st[0][i] = a[i];
for (int k = 1; (1 << k) <= n; k++)
    for (int i = 1; i + (1 << k) - 1 <= n; i++)
        st[k][i] = max(st[k - 1][i], st[k - 1][i + (1 << (k - 1))]);
int qmax(int l, int r) {
    int k = lg[r - l + 1];
    return max(st[k][l], st[k][r - (1 << k) + 1]);
}`,
    pattern: '「静态数组、大量区间最值询问、没有修改」—— ST 表；若带修改则改用线段树。',
    related: []
  };

  window.CSP.cards['ds.trie'] = {
    definition: '把字符串按字符逐层建树，公共前缀共享节点，用于字符串检索与异或最值。',
    keyPoints: [
      'ch[u][c] 表示节点 u 经字符 c 到达的儿子编号，新节点用 ++tot 分配（根建议为 1，0 表示空）。',
      '插入：从根出发逐字符向下，没有儿子就新建，走到末尾给节点打 cnt/end 标记。',
      '查询：能走完则存在；end 标记用于区分「完整单词」与「只是某个词的前缀」。',
      '01-Trie 把整数按二进制从高位到低位插入，可在 O(位数) 内求最大异或对。'
    ],
    complexity: '插入/查询 O(L)（L 为串长），空间 O(总字符数 × 字符集大小)',
    pitfalls: [
      '节点数组开小（应为 总长度 × 字符集；01-Trie 为 n × 31）。',
      '根编号用 0 又用 0 表示「不存在」，造成死循环或误判（建议根为 1）。',
      '查询时没判断儿子是否存在就直接向下走，导致越界。',
      '多组测试数据只清了 ch[1] 没有清空全部节点，残留数据导致答案错。'
    ],
    template: `int ch[N][26], cnt[N], tot = 1;      // 根为 1，0 表示不存在
void ins(const char *s) {
    int u = 1;
    for (int i = 0; s[i]; i++) {
        int c = s[i] - 'a';
        if (!ch[u][c]) ch[u][c] = ++tot;
        u = ch[u][c];
    }
    cnt[u]++;                            // 标记单词结尾
}`,
    pattern: '「前缀/单词是否存在」「字符串集合检索」「最大异或对」—— 字典树 / 01-Trie。',
    related: []
  };

  window.CSP.cards['ds.hash'] = {
    definition: '把任意键映射成固定范围的整数下标，实现期望 O(1) 的插入与查询。',
    keyPoints: [
      '整数哈希常用取模：h = (k % M + M) % M，M 取大质数以降低冲突率。',
      '冲突处理两种：开放寻址（线性探测）与拉链法（每个桶挂链表/vector/链式前向星）。',
      '字符串哈希用多项式：h = h * base + s[i]，配 unsigned long long 自然溢出或双模数降低冲突。',
      '竞赛优先手写哈希或 unordered_map；需要有序遍历或前驱后继才用 map/set。'
    ],
    complexity: '期望时间 O(1)/次操作，最坏 O(n)；空间 O(n)',
    pitfalls: [
      'unordered_map 会被针对性的 hack 数据卡成 O(n)，考场用自定义随机哈希或 map 兜底。',
      '取模结果为负却没加 M 修正，用作数组下标时越界。',
      '双模数哈希只对一个模数取模，另一个忘了，等于白写。',
      '多组数据用 clear() 清表可能很慢，直接重建或用时间戳标记更快。'
    ],
    template: `const int M = 1000003;               // 大质数
int head[M], nxt[N], tot; long long key[N], val[N];
void put(long long k, long long v) {
    int h = (k % M + M) % M;
    key[++tot] = k; val[tot] = v; nxt[tot] = head[h]; head[h] = tot;
}
int get(long long k) {               // 返回下标，0 表示不存在
    for (int i = head[(k % M + M) % M]; i; i = nxt[i]) if (key[i] == k) return i;
    return 0;
}`,
    pattern: '「判断元素是否出现过」「统计出现次数」「两数/子串配对」—— 哈希表。',
    related: []
  };

  window.CSP.cards['ds.balanced'] = {
    definition: '维护有序集合并支持插入、删除、查前驱后继与第 k 小的平衡二叉搜索树结构。',
    keyPoints: [
      '考场优先用 pb_ds：tree<int, null_type, less<int>, rb_tree_tag, tree_order_statistics_node_update>。',
      '常用接口：insert/erase、order_of_key(x) 求「小于 x 的个数」、find_by_order(k) 求第 k 小（0-indexed）。',
      '判存在用 find(x) != end()；pb_ds 中先 find 拿到迭代器再 erase 最安全。',
      '手写可用 Treap / 替罪羊树；只需前驱后继且离线时，树状数组 + 离散化也能替代。'
    ],
    complexity: '单次插入/删除/查询 O(log n)，空间 O(n)',
    pitfalls: [
      'find_by_order(k) 是 0-indexed，与题目「第 k 小」的 1-indexed 差 1。',
      'pb_ds 中 erase(key) 对不存在的元素不安全，应先 find 再 erase(迭代器)。',
      'order_of_key(x) 统计的是「严格小于 x」的个数，不是小于等于。',
      '整棵树 clear() 后直接继续使用而未重新初始化。'
    ],
    template: `#include <ext/pb_ds/assoc_container.hpp>
#include <ext/pb_ds/tree_policy.hpp>
using namespace __gnu_pbds;
tree<int, null_type, less<int>, rb_tree_tag,
     tree_order_statistics_node_update> T;
T.insert(x);
int cnt = T.order_of_key(x);        // 小于 x 的个数
int kth = *T.find_by_order(k);      // 第 k 小（0-indexed）`,
    pattern: '「动态插入删除 + 查排名/第 k 小/前驱后继」—— 平衡树或 pb_ds。',
    related: []
  };

  window.CSP.cards['ds.blocksqrt'] = {
    definition: '把序列分成 √n 大小的块，整块整体处理、边角暴力，用于区间修改与查询。',
    keyPoints: [
      '块大小取 √n（或 sqrt(n)+1），块编号 bl[i] = (i-1)/B+1，预处理每块的左右端点 L[b]、R[b]。',
      '区间操作时：中间整块打懒标记或直接取块汇总值，左右两个边角块逐元素暴力。',
      '块内维护有序数组可支持「块内二分」「区间第 k 小」等查询。',
      '分块的核心是「用 O(√n) 的代价代替复杂数据结构」，常数小、好写、易调试。'
    ],
    complexity: '区间操作 O(√n)（整块 O(√n) 个 + 边角 O(√n) 元素），空间 O(n)',
    pitfalls: [
      '块大小取成固定常数没有随 n 调整，复杂度退化。',
      '边角块暴力时没有先下传该块的懒标记，结果错误。',
      '没有特判 l 与 r 落在同一块的情况，暴力范围算错。'
    ],
    template: `int B = sqrt(n) + 1, m = (n + B - 1) / B;
int bl[N], L[M], R[M], tag[M], a[N];
for (int i = 1; i <= n; i++) bl[i] = (i - 1) / B + 1;
for (int b = 1; b <= m; b++) { L[b] = (b - 1) * B + 1; R[b] = min(n, b * B); }
void upd(int l, int r, int v) {
    if (bl[l] == bl[r]) { for (int i = l; i <= r; i++) a[i] += v; return; }
    for (int i = l; i <= R[bl[l]]; i++) a[i] += v;      // 左边角
    for (int i = L[bl[r]]; i <= r; i++) a[i] += v;      // 右边角
    for (int b = bl[l] + 1; b < bl[r]; b++) tag[b] += v; // 中间整块
}`,
    pattern: '「区间修改 + 区间查询但线段树不好维护/合并」「需要块内排序二分」—— 分块。',
    related: []
  };

  window.CSP.cards['ds.mo'] = {
    definition: '把询问按块排序后离线处理，靠指针移动维护当前区间答案，均摊 O(n√n)。',
    keyPoints: [
      '块大小取 n / sqrt(q)（或 sqrt(n)）；排序：左端点所在块升序，同块内按右端点奇偶交替升降。',
      'add(pos) / del(pos) 必须能快速更新当前答案（如计数数组 + 维护「当前不同数个数」）。',
      '指针移动四个 while 的顺序：先扩展后收缩，可避免中间出现非法（r < l）区间。',
      '扩展形态：带修改莫队增加时间戳一维；树上莫队用欧拉序把树拍成序列。'
    ],
    complexity: '时间 O(n√q)（普通莫队），空间 O(n + q)',
    pitfalls: [
      '排序时不用块编号而是直接按 l 排序，复杂度退化为 O(nq)。',
      'del 时把计数减成负数或忘记同步更新答案，导致结果错。',
      '块大小写死 sqrt(n)，而询问数 q 远小于 n 时效率不高（应按 n/sqrt(q) 调整）。',
      '奇偶优化写反只影响常数不影响正确性，但常数会明显变大。'
    ],
    template: `int B = max(1, (int)(n / sqrt((double)max(1, q))));
sort(qs, qs + q, [&](const Q &x, const Q &y) {
    int bx = x.l / B, by = y.l / B;
    if (bx != by) return bx < by;
    return (bx & 1) ? x.r > y.r : x.r < y.r;      // 奇偶优化
});
int l = 1, r = 0;
for (int i = 0; i < q; i++) {
    while (l > qs[i].l) add(--l); while (r < qs[i].r) add(++r);
    while (l < qs[i].l) del(l++); while (r > qs[i].r) del(r--);
    ans[qs[i].id] = cur;
}`,
    pattern: '「只有询问没有修改（或修改很少）+ 区间计数很难在线维护 + 可以离线」—— 莫队。',
    related: []
  };

})();
