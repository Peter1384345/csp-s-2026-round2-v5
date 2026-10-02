/* ============================================================================
 * CSP-S 2026 第二轮 · 知识卡 C 卷 (cards-C.js)
 * ----------------------------------------------------------------------------
 * 覆盖板块：字符串 + 数学 + 搜索 + 综合技巧，共 36 张卡。
 * id 全部取自 js/data/syllabus.js（权威清单）。
 * 字段格式见 docs/CONTENT-SCHEMA.md 第六节。
 * ==========================================================================*/
(function () {
  'use strict';
  window.CSP = window.CSP || {};
  window.CSP.cards = window.CSP.cards || {};

  /* ========================================================================
   * 一、字符串
   * ======================================================================*/

  window.CSP.cards['str.basic'] = {
    definition: '字符串的存储、遍历与常用操作，是 KMP、哈希等字符串算法的共同基础。',
    keyPoints: [
      'C++ string 可直接用 + 连接、== 比较、s.substr(pos,len) 取子串、s.find(t) 查找，长度用 s.size()',
      '读入含空格的整行要用 getline(cin, s)，且在使用之前先 getchar() 吞掉上一行残留的换行符',
      '遍历所有子串是 O(n^2) 个，若对每个子串再调 substr 做比较，总复杂度会退化到 O(n^3)',
      '字符串按字典序比较（strcmp 返回负/零/正），字符与下标互转常用 s[i]-"a" 得到 0..25',
      '字符数组作为 C 风格字符串时末尾必须有 \'\\0\'，下标范围是 0..len，别把 len 写成 len-1'
    ],
    complexity: '遍历一遍 O(n)；枚举全部子串 O(n^2) 个、总长度 O(n^3)；单次 substr 复制 O(len)',
    pitfalls: [
      '在 getline 前忘记 getchar()/cin.ignore()，会读进一个空行导致整道题错位',
      '用 substr(pos, len) 时把第二个参数当成了结束下标（它其实是长度）',
      '多测数据之间忘记清空全局字符串/数组，上一组的结果污染下一组'
    ],
    template: [
      'string s; getline(cin, s);',
      'int n = s.size();',
      'for (int i = 0; i < n; i++)',
      '  for (int j = i; j < n; j++) {',
      '    string t = s.substr(i, j - i + 1);   // 子串 s[i..j]',
      '    // 对 t 做统计/判重',
      '  }'
    ].join('\n'),
    pattern: '题面要求「按字典序输出」「统计某个子串出现次数」「把字符串按分隔符拆成若干段」且规模不大时。',
    related: []
  };

  window.CSP.cards['str.kmp'] = {
    definition: '利用前缀函数 nxt 在 O(n+m) 内完成单模式串匹配，并刻画字符串的周期结构。',
    keyPoints: [
      'nxt[i] 定义为 s[0..i] 的最长相等真前缀真后缀长度，nxt[0]=0，从小到大递推',
      '失配时反复令 j = nxt[j-1] 回退，直到 s[i]==s[j] 或 j==0，均摊复杂度 O(n)',
      '做匹配时常把串拼成 p + "#" + t 一次求前缀函数：nxt[i]==m 即模式串在文本中出现一次',
      '最小循环节长度为 len - nxt[len-1]，且当 len % (len - nxt[len-1]) == 0 时才是完整周期',
      'nxt 数组本身可复用：求所有 border 就是不断 nxt[j-1] 回跳'
    ],
    complexity: '预处理 O(m)。匹配 O(n+m)。空间 O(m)（n 为文本长、m 为模式串长）',
    pitfalls: [
      '下标从 0 开始的 nxt[j-1] 与从 1 开始的 nxt[j] 混用，是 KMP 最高频的错',
      '匹配成功后直接退出，忘记 j = nxt[j-1] 继续找下一次出现',
      '模式串自身长度超过文本时仍从 i=0 开始扫，需先判 m > n'
    ],
    template: [
      'vector<int> prefix(const string &s) {   // s = p + "#" + t',
      '  int n = s.size(); vector<int> nxt(n, 0);',
      '  for (int i = 1, j = 0; i < n; i++) {',
      '    while (j && s[i] != s[j]) j = nxt[j - 1];',
      '    if (s[i] == s[j]) j++;',
      '    nxt[i] = j;                          // nxt[i]==m 即匹配成功',
      '  }',
      '  return nxt;',
      '}'
    ].join('\n'),
    pattern: '题面出现「一个文本串里某个模式串出现了几次 / 出现在哪些位置」「求最小循环节」时。',
    related: []
  };

  window.CSP.cards['str.hash'] = {
    definition: '把字符串映射成整数，用前后缀哈希在 O(1) 内判断任意两子串是否相等。',
    keyPoints: [
      '进制哈希：h[i] = h[i-1]*B + s[i]，子串 [l,r] 的哈希为 h[r] - h[l-1]*B^(r-l+1)',
      'B 取 131 或 13331 等大于字符集的大质数，预处理 pow 数组避免重复计算',
      '防卡三选一：unsigned long long 自然溢出、双模数（1e9+7 与 1e9+9）、随机 base',
      '子串比较先比长度，长度不同直接不等；配合二分可求最长公共前缀 LCP',
      '反串再求一遍哈希即可 O(1) 判断回文子串'
    ],
    complexity: '预处理 O(n)；单次子串查询 O(1)。空间 O(n)（h 与 pow 数组）',
    pitfalls: [
      '算子串哈希时忘记乘 pow[r-l+1]，这是最典型的错误',
      '用 int 存储哈希值：乘法会溢出成负数，必须用 unsigned long long 或 long long 加取模',
      '只用一个固定模数会被出题人构造数据卡掉（Codeforces 上有经典 hack），优先双模数或随机 base'
    ],
    template: [
      'typedef unsigned long long ull;',
      'const ull B = 131;',
      'ull h[N], pw[N];',
      'void init(const string &s) { pw[0] = 1;',
      '  for (int i = 0; i < (int)s.size(); i++) {',
      '    h[i + 1] = h[i] * B + (unsigned char)s[i];',
      '    pw[i + 1] = pw[i] * B; } }',
      'ull get(int l, int r) {          // 1-indexed，返回 s[l..r] 的哈希',
      '  return h[r] - h[l - 1] * pw[r - l + 1]; }'
    ].join('\n'),
    pattern: '题目要「多次询问两个子串是否相同」「判重/判回文」「求最长重复子串」而不想写后缀数组时。',
    related: []
  };

  window.CSP.cards['str.manacher'] = {
    definition: '线性求每个回文中心的最长回文半径，O(n) 得到最长回文子串与所有回文串信息。',
    keyPoints: [
      '在字符间与两端插入分隔符 #（首尾再加 ^ 与 $ 作哨兵），把奇回文与偶回文统一处理',
      '维护当前已触及的最右回文右边界 mx 及其中心 mid，利用对称点 2*mid-i 直接继承半径',
      'p[i] = min(p[2*mid-i], mx-i) 后继续暴力向两边扩展，总扩展次数是 O(n) 的',
      '原串中最长回文子串长度 = max(p[i]) - 1；以 i 为中心的回文对应原串区间可反算',
      'p[i]-1 同时给出了以 i 为中心的极长回文串长度，是回文划分 DP 的常用预处理'
    ],
    complexity: '时间 O(n)，空间 O(n)（n 为插入分隔符后的长度，约 2n+3）',
    pitfalls: [
      'p 数组只开 n 大小，插入 # 后长度接近 2n，会越界 RE',
      '对称继承的条件写成 i <= mx（应为 i < mx），边界处理错会多算半径',
      '忘记首尾哨兵 ^ $ 或用了会出现在原串里的字符，导致扩展越界'
    ],
    template: [
      'string t = "^#";',
      'for (char c : s) { t += c; t += \'#\'; }',
      't += \'$\';',
      'int n = t.size(); vector<int> p(n, 0);',
      'int mid = 0, mx = 0;',
      'for (int i = 1; i < n - 1; i++) {',
      '  p[i] = mx > i ? min(p[2 * mid - i], mx - i) : 1;',
      '  while (t[i + p[i]] == t[i - p[i]]) p[i]++;',
      '  if (i + p[i] > mx) { mx = i + p[i]; mid = i; }',
      '}',
      '// 最长回文子串长度 = *max_element(p.begin(), p.end()) - 1'
    ].join('\n'),
    pattern: '题面要「最长回文子串」「回文子串的个数/划分方案数」「每个位置为中心的回文长度」时。',
    related: []
  };

  window.CSP.cards['str.z'] = {
    definition: 'Z 函数 z[i] 表示 s 与它的后缀 s[i..] 的最长公共前缀长度（扩展 KMP）。',
    keyPoints: [
      '维护当前匹配到最右的区间 [l, r)，即 s[l..r-1] 与 s 的前缀相等且 r 最大',
      '若 i < r，先令 z[i] = min(r - i, z[i - l])，再做暴力扩展；否则从 0 开始扩展',
      '扩展后若 i + z[i] > r，更新 l = i, r = i + z[i]，均摊 O(n)',
      '扩展 KMP：对 s + "#" + t 求 Z 函数，z[m+1+i] 就是 t 的后缀 i 与 s 的 LCP',
      'z[0] 常约定为 n 或 0，使用前先确认统一'
    ],
    complexity: '时间 O(n)，空间 O(n)（n 为求 Z 函数的串长）',
    pitfalls: [
      '拼接串用的分隔符必须不出现在原字符集中，否则 LCP 会跨越边界变长',
      '先暴力扩展再更新 [l,r] 盒子的顺序写反，导致盒子信息过期',
      'z[0] 约定不统一：有的实现给 n 有的给 0，与其他代码混用时出错'
    ],
    template: [
      'vector<int> zfunc(const string &s) {',
      '  int n = s.size(); vector<int> z(n, 0);',
      '  for (int i = 1, l = 0, r = 0; i < n; i++) {',
      '    if (i < r) z[i] = min(r - i, z[i - l]);',
      '    while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;',
      '    if (i + z[i] > r) { l = i; r = i + z[i]; }',
      '  }',
      '  return z;',
      '}'
    ].join('\n'),
    pattern: '题面要「每个后缀与模式串的 LCP」「字符串匹配的所有出现位置」「前后缀相等关系」时。',
    related: []
  };

  window.CSP.cards['str.ac'] = {
    definition: '在 Trie 上建 fail 失配指针，一次扫描文本即可匹配多个模式串。',
    keyPoints: [
      '先把所有模式串插入 Trie，节点存 cnt 表示该节点结尾的模式串编号/数量',
      'BFS 逐层求 fail：fail[v] = ch[fail[u]][c]，根的直接儿子 fail 指向根（0 号节点）',
      '匹配文本时沿 Trie 走，走不动就跳 fail，每到一个节点沿 fail 链累计答案',
      '统计每个模式串出现次数可建 fail 树，在树上做子树和，避免匹配时暴力跳链',
      '需要「统计子树内出现次数」时把 fail 视作父亲建树，DFS 序 + 树状数组可动态维护'
    ],
    complexity: '建树 O(Σ|模式串| × 字符集)；匹配 O(|文本|)；空间 O(节点数 × 字符集)',
    pitfalls: [
      '把 0 号根节点的 fail 指向自己或未初始化，导致死循环',
      '为了图方便把不存在的儿子直接指向 fail 的儿子（路径压缩），会让 fail 树结构失真，无法统计子树和',
      '答案要开 long long：同一模式串可能在文本中重叠出现很多次'
    ],
    template: [
      'int ch[N][26], fail[N], cnt[N], tot = 0;',
      'void insert(const string &s) { int u = 0;',
      '  for (char c : s) { int &v = ch[u][c - \'a\'];',
      '    if (!v) v = ++tot; u = v; } cnt[u]++; }',
      'void build() { queue<int> q;',
      '  for (int c = 0; c < 26; c++) if (ch[0][c]) fail[ch[0][c]] = 0, q.push(ch[0][c]);',
      '  while (!q.empty()) { int u = q.front(); q.pop();',
      '    for (int c = 0; c < 26; c++) { int v = ch[u][c]; if (!v) continue;',
      '      fail[v] = ch[fail[u]][c]; q.push(v); } } }',
      '// 匹配：u = ch[u][t[i]]（不存在则 u = ch[fail[u]][t[i]]，根有出边兜底）'
    ].join('\n'),
    pattern: '题面出现「多个模式串同时在一个文本里匹配」「若干个关键词各出现了几次」「敏感词过滤」时。',
    related: []
  };

  window.CSP.cards['str.sa'] = {
    definition: '后缀数组 sa[i] 表示排名第 i 的后缀起点，rk 是其逆排列，height 描述相邻 LCP。',
    keyPoints: [
      '倍增法：第 k 轮按 (rk[i], rk[i+k]) 双关键字排序，排名互不相同即结束，共 O(log n) 轮',
      '用基数排序（对第二关键字再对第一关键字桶排）可把每轮降到 O(n)，总复杂度 O(n log n)',
      'height[i] = LCP(sa[i-1], sa[i])，用性质 height[rk[i]] ≥ height[rk[i-1]] - 1 递推，总 O(n)',
      '任意两后缀的 LCP 等于它们在 sa 中区间内 height 的最小值，可用 ST 表 O(1) 查询',
      '本质不同的子串数 = n(n+1)/2 - Σ height[i]'
    ],
    complexity: '倍增 + sort 为 O(n log^2 n)；倍增 + 基数排序为 O(n log n)；height O(n)；空间 O(n)',
    pitfalls: [
      '第二关键字越界时补 0（或 -1）处理不一致，导致排名比较出错',
      'sa、rk、height 三者下标从 0 还是 1 开始混用',
      'height 递推时没判断 height[rk[i]] > 0 就直接减 1，得到负数'
    ],
    template: [
      'vector<int> sa(n), rk(n), tmp(n);',
      'for (int i = 0; i < n; i++) sa[i] = i, rk[i] = (unsigned char)s[i];',
      'for (int k = 1;; k <<= 1) {',
      '  auto cmp = [&](int a, int b) {',
      '    if (rk[a] != rk[b]) return rk[a] < rk[b];',
      '    return (a + k < n ? rk[a + k] : -1) < (b + k < n ? rk[b + k] : -1); };',
      '  sort(sa.begin(), sa.end(), cmp);',
      '  tmp[sa[0]] = 0;',
      '  for (int i = 1; i < n; i++) tmp[sa[i]] = tmp[sa[i - 1]] + cmp(sa[i - 1], sa[i]);',
      '  rk = tmp;',
      '  if (rk[sa[n - 1]] == n - 1) break;',
      '}'
    ].join('\n'),
    pattern: '题面要「本质不同子串个数」「最长重复子串」「比较任意两个后缀的字典序」「多模式串与后缀的 LCP」时。',
    related: []
  };

  window.CSP.cards['str.palindrome'] = {
    definition: '回文串的判定、最长回文子串、回文划分与本质不同回文子串的计数。',
    keyPoints: [
      '暴力判定双指针 O(len)；求最长回文子串有 2n-1 个中心，从中心向两边扩展 O(n^2)',
      'Manacher 或正反哈希 + 二分可把最长回文子串/回文判定降到 O(n) 与 O(log n)',
      '回文划分 DP：f[i] = Σ f[j]（s[j+1..i] 为回文），用 Manacher 预处理每个中心的回文区间加速',
      '本质不同回文子串个数可用回文自动机（PAM）在 O(n) 内求出',
      '哈希判回文要同时维护正串与反串两套哈希，比较时注意反映射的下标换算'
    ],
    complexity: '暴力判定 O(len)；中心扩展 O(n^2)；Manacher/PAM O(n)；哈希 + 二分 O(n log n)',
    pitfalls: [
      '空串与单字符都是回文，边界处理时容易漏掉',
      '回文中心共有 2n-1 个（n 个字符中心 + n-1 个间隙中心），只枚举 n 个会漏掉偶回文',
      '哈希判回文时反串下标算错，正反哈希比较的区间未对齐'
    ],
    template: [
      'bool isPal(const string &s) {',
      '  int l = 0, r = s.size() - 1;',
      '  while (l < r) if (s[l++] != s[r--]) return false;',
      '  return true; }',
      'int longest(const string &s) { int n = s.size(), best = 0;',
      '  for (int c = 0; c < 2 * n - 1; c++) {',
      '    int l = c / 2, r = l + c % 2;',
      '    while (l >= 0 && r < n && s[l] == s[r]) l--, r++;',
      '    best = max(best, r - l - 1); }',
      '  return best; }'
    ].join('\n'),
    pattern: '题面出现「回文」「正着读反着读一样」「把串划分成若干回文段」时。',
    related: []
  };

  /* ========================================================================
   * 二、数学
   * ======================================================================*/

  window.CSP.cards['math.gcd'] = {
    definition: '辗转相除法求最大公约数，并用扩展欧几里得解一次不定方程与同余方程。',
    keyPoints: [
      'gcd(a,b) = gcd(b, a%b)，边界 gcd(a,0) = a；递归深度是 O(log) 级别',
      'lcm(a,b) = a / gcd(a,b) * b，必须先除后乘，否则 a*b 可能溢出',
      'exgcd 求解 ax + by = gcd(a,b)：递归式 d = exgcd(b, a%b, y, x) 后 y -= a/b*x',
      'exgcd 是迭代写法的基础：循环交换系数并做 t = a%b, a = b, b = t，可避免递归',
      'ax ≡ c (mod m) 有解当且仅当 gcd(a,m) | c，通解为 x0 + k*(m/g)，取最小非负整数解要 %(m/g)'
    ],
    complexity: 'gcd 与 exgcd 均为 O(log min(a,b))，空间 O(1)（迭代）/O(log)（递归）',
    pitfalls: [
      '先算 a*b/gcd 溢出：必须写成 a/gcd*b',
      'exgcd 解出负系数或负解时忘记取模到 [0, m)',
      'a、b 传入负数或 0 时直接调用，未特判导致结果异常'
    ],
    template: [
      'long long exgcd(long long a, long long b, long long &x, long long &y) {',
      '  if (!b) { x = 1; y = 0; return a; }',
      '  long long d = exgcd(b, a % b, y, x);',
      '  y -= a / b * x;',
      '  return d;',
      '}',
      'long long inv(long long a, long long m) {   // 要求 gcd(a,m)==1',
      '  long long x, y; exgcd(a, m, x, y);',
      '  return (x % m + m) % m;',
      '}'
    ].join('\n'),
    pattern: '题面出现「最大公约数/最小公倍数」「求同余方程 ax ≡ b (mod m) 的解」「分数化简」时。',
    related: []
  };

  window.CSP.cards['math.prime'] = {
    definition: '素数筛法、质因数分解与素性判定，是数论类题目的基础设施。',
    keyPoints: [
      '线性筛（欧拉筛）每个合数只被其最小质因子筛一次，O(n)，同时可求最小质因子 v[i]',
      '记录 v[i] 后分解质因数只需不断 v[x] 除下去，复杂度 O(log x)',
      '埃氏筛 O(n log log n) 代码更短常数更小，n ≤ 1e6 时完全够用',
      '试除法分解单个 n 是 O(√n)，适合 n ≤ 1e12；先筛出 √n 内的素数再试除更快',
      'n 可达 1e18 的素性判定用 Miller-Rabin（底数取 2,3,5,7,11,13,17,19,23,29,31,37 即可）'
    ],
    complexity: '线性筛 O(n) 时间 / O(n) 空间；试除分解 O(√n)；Miller-Rabin O(k log^3 n)',
    pitfalls: [
      '筛法从 i=1 开始或没特判 n<2，把 1 当成素数',
      '线性筛里漏写 if (i % p[j] == 0) break，导致同一合数被重复筛',
      '分解到最后剩余 x > 1 时忘记它本身也是一个质因子'
    ],
    template: [
      'vector<int> p; vector<bool> vis(N);',
      'for (int i = 2; i < N; i++) {',
      '  if (!vis[i]) p.push_back(i);',
      '  for (int j = 0; j < (int)p.size() && i * p[j] < N; j++) {',
      '    vis[i * p[j]] = true;',
      '    if (i % p[j] == 0) break;      // 保证每个合数只被最小质因子筛一次',
      '  }',
      '}',
      '// 试除分解：for (int i = 2; i * i <= x; i++) while (x % i == 0) ...;',
      '// 循环结束后若 x > 1，则 x 是剩下的那个质因子'
    ].join('\n'),
    pattern: '题面出现「素数个数」「分解质因数」「n 的约数个数/约数和」「1e6 以内的数论预处理」时。',
    related: []
  };

  window.CSP.cards['math.mod'] = {
    definition: '模意义下的加减乘与乘法逆元，是组合数、矩阵、哈希等算法的公共基础。',
    keyPoints: [
      '加法取模：直接 (a+b)%m；减法取模：(a-b%m+m)%m，负数取模结果仍为负是 C++ 的坑',
      '乘法逆元：m 为素数时 a^(m-2)（费马小定理），一般情况用 exgcd 解 ax ≡ 1 (mod m)',
      '线性递推逆元：inv[1]=1，inv[i] = (m - m/i) * inv[m%i] % m，O(n) 求出 1..n 的逆元',
      '组合数预处理阶乘 fac 与逆元阶乘 ifac，C(n,k) = fac[n]*ifac[k]%m*ifac[n-k]%m，O(1) 查询',
      '所有乘法必须先转 long long，int * int 会溢出后再取模，结果完全错误'
    ],
    complexity: '快速幂/费马求逆元 O(log m)；线性递推逆元 O(n)；组合数查询 O(1)',
    pitfalls: [
      '负数取模未修正：(a - b) % m 可能是负数，要写成 ((a-b)%m+m)%m',
      '模数不是素数时仍用费马小定理 a^(m-2)，必须改用 exgcd 或欧拉定理',
      'int 类型做乘法取模溢出，长整型是硬性要求'
    ],
    template: [
      'long long qpow(long long a, long long b, long long m) {',
      '  long long r = 1 % m; a %= m;',
      '  for (; b; b >>= 1, a = a * a % m) if (b & 1) r = r * a % m;',
      '  return r;',
      '}',
      '// 组合数预处理（m 为素数）',
      'fac[0] = 1; for (int i = 1; i <= n; i++) fac[i] = fac[i-1] * i % m;',
      'ifac[n] = qpow(fac[n], m - 2, m);',
      'for (int i = n; i; i--) ifac[i-1] = ifac[i] * i % m;',
      '// C(n,k) = fac[n] * ifac[k] % m * ifac[n-k] % m'
    ].join('\n'),
    pattern: '题面出现「答案对 1e9+7 取模」「求组合数/排列数」「模意义下做除法」时。',
    related: []
  };

  window.CSP.cards['math.pow'] = {
    definition: '二进制拆分指数，把 a^b 从 O(b) 降到 O(log b)，并可推广到矩阵。',
    keyPoints: [
      '循环 while(b) { if (b&1) r = r*a%m; a = a*a%m; b >>= 1; }，每轮把底数平方',
      'b = 0 时结果为 1；若模数 m = 1 则答案为 0，所以初值写成 1 % m 最稳妥',
      '进入循环前先做 a %= m，底数可能比模数大',
      '指数很大（如 b 是 long long）或需要对指数取模时，注意费马小定理只适用于底数与模数互素',
      'a、m 较大导致 a*a 溢出 int 甚至 long long 时，改用龟速乘（倍增加法）取模'
    ],
    complexity: '时间 O(log b)，空间 O(1)',
    pitfalls: [
      '忘记 b = 0 时返回 1（或 m = 1 时应为 0）',
      '底数没有先取模，导致中间乘法溢出',
      '用 int 存中间乘积：a*a 在 a 接近 1e9 时直接溢出'
    ],
    template: [
      'long long qpow(long long a, long long b, long long m) {',
      '  long long r = 1 % m;',
      '  a %= m;',
      '  for (; b; b >>= 1) {',
      '    if (b & 1) r = r * a % m;',
      '    a = a * a % m;',
      '  }',
      '  return r;',
      '}'
    ].join('\n'),
    pattern: '题面出现「求 a^b mod p」「模意义下的除法（即乘逆元）」「快速幂作为子过程」时。',
    related: []
  };

  window.CSP.cards['math.matrix'] = {
    definition: '矩阵乘法与矩阵快速幂，用于线性递推加速和图上定长路径计数。',
    keyPoints: [
      '矩阵乘法 (AB)ij = Σ A[i][k]*B[k][j]，只有 i×k 乘 k×j 才合法，结果规模 i×j',
      '三重循环用 i-k-j 顺序，内层对 j 连续访问，缓存友好且可跳过 A[i][k]==0',
      '矩阵快速幂与原快速幂骨架完全一致，区别是初值为单位矩阵（a[i][i]=1）而非 1',
      '线性递推 f[n] = Σ c_k f[n-k] 可写成转移矩阵的 n 次幂，O(k^3 log n) 求出任意项',
      '图上求恰好走 L 步的路径数：邻接矩阵的 L 次幂，M^L[u][v] 就是方案数'
    ],
    complexity: '单次乘法 O(n^3)；矩阵快速幂 O(n^3 log k)；空间 O(n^2)（n 为矩阵阶数，k 为指数）',
    pitfalls: [
      '三重循环写成 i-j-k，常数大且容易忘记清零累加数组',
      '单位矩阵只在主对角线置 1，其他位置必须为 0（用结构体默认构造清零）',
      '模数下累加时忘记先转 long long，或忘记每步取模导致溢出'
    ],
    template: [
      'struct Mat { long long a[N][N]; };',
      'Mat mul(const Mat &A, const Mat &B, int n, long long m) { Mat C{};',
      '  for (int i = 0; i < n; i++) for (int k = 0; k < n; k++) { if (!A.a[i][k]) continue;',
      '    for (int j = 0; j < n; j++) C.a[i][j] = (C.a[i][j] + A.a[i][k] * B.a[k][j]) % m; }',
      '  return C; }',
      'Mat qpow(Mat A, long long b, int n, long long m) { Mat R{};',
      '  for (int i = 0; i < n; i++) R.a[i][i] = 1 % m;',
      '  for (; b; b >>= 1, A = mul(A, A, n, m)) if (b & 1) R = mul(R, A, n, m);',
      '  return R; }'
    ].join('\n'),
    pattern: '题面出现「n 极大但递推阶数很小（n ≤ 1e18, k ≤ 100）」「图上走恰好 k 步的方案数」时。',
    related: []
  };

  window.CSP.cards['math.comb'] = {
    definition: '组合数的计算方法、二项式定理与常用组合恒等式。',
    keyPoints: [
      '递推式 C(n,k) = C(n-1,k) + C(n-1,k-1)，适合 n ≤ 5000 且模数任意（含非素数）',
      '阶乘 + 逆元预处理适合 n ≤ 1e6、模数为素数，单次查询 O(1)',
      'Lucas 定理：C(n,k) ≡ C(n%p, k%p) * C(n/p, k/p) (mod p)，处理 n 远大于素数模数 p 的情况',
      '常用恒等式：C(n,k)=C(n,n-k)、Σ C(n,i)=2^n、Σ (-1)^i C(n,i)=0、范德蒙德卷积 Σ C(a,i)C(b,k-i)=C(a+b,k)',
      '二项式定理 (a+b)^n = Σ C(n,k) a^k b^(n-k)，是把组合数与多项式联系起来的桥梁'
    ],
    complexity: '递推 O(n^2)；预处理 O(n) + 查询 O(1)；Lucas O(p + log_p n)',
    pitfalls: [
      'n < k 或 k < 0 时未返回 0，导致数组越界或答案错误',
      '模数不是素数时仍用阶乘 + 逆元，必须改用递推或 CRT 分解',
      '计算中忘记取模或先乘后模导致溢出'
    ],
    template: [
      'const long long M = 1000000007;',
      'long long fac[N], ifac[N];',
      'long long C(int n, int k) {',
      '  if (k < 0 || k > n) return 0;',
      '  return fac[n] * ifac[k] % M * ifac[n - k] % M;',
      '}',
      'long long lucas(long long n, long long k) {   // M 为素数',
      '  if (!k) return 1;',
      '  return C(n % M, k % M) * lucas(n / M, k / M) % M;',
      '}'
    ].join('\n'),
    pattern: '题面出现「求方案数」「杨辉三角」「从 n 个里选 k 个」「计数结果对质数取模且组合数上标极大」时。',
    related: []
  };

  window.CSP.cards['math.inclusion'] = {
    definition: '把「求并集大小」转化为「若干个交集大小的带符号和」的计数技巧。',
    keyPoints: [
      '公式 |A1 ∪ … ∪ An| = Σ|Ai| - Σ|Ai∩Aj| + Σ|Ai∩Aj∩Ak| - …，符号由参与交集的集合个数奇偶决定',
      '哪一项是正、哪一项是负：交集由奇数个集合组成取 +，偶数个取 -，写代码时用 popcount 判奇偶',
      '枚举方式用 for (mask = 1; mask < (1<<n); mask++) 累加符号，或 DFS 逐层带符号递归',
      '「恰好 k 个」常转化为「至少 k 个」再用容斥：ans = Σ_{j≥k} (-1)^(j-k) C(j,k) * (至少 j 个的方案数)',
      'min-max 容斥：max(S) = Σ (-1)^(|T|+1) min(T)，可把难求的最大值转成好求的最小值'
    ],
    complexity: '枚举 2^n 个子集，总时间 O(2^n × 单个交集的计算代价)',
    pitfalls: [
      '符号写反（应为奇数个集合取正），样例过不了却在数据上 WA',
      '漏掉空集项或多算空集：循环必须从 mask = 1 开始',
      '「恰好」与「至少」互转时的组合数系数 C(j,k) 忘记乘'
    ],
    template: [
      'long long ans = 0;',
      'for (int mask = 1; mask < (1 << n); mask++) {',
      '  long long cur = calc(mask);       // 该子集所有集合交集的大小',
      '  if (__builtin_popcount(mask) & 1) ans += cur;',
      '  else ans -= cur;',
      '}'
    ].join('\n'),
    pattern: '题面出现「至少满足一个条件」「不能被某些数整除的个数」「恰好 k 个位置满足」时。',
    related: []
  };

  window.CSP.cards['math.prob'] = {
    definition: '用期望的线性性把复杂随机变量的期望拆成若干简单期望之和。',
    keyPoints: [
      'E[X+Y] = E[X] + E[Y] 对任意（不必独立的）随机变量成立，是期望题最强工具',
      'E[cX] = cE[X]；乘积只有在 X、Y 独立时才有 E[XY] = E[X]E[Y]',
      '期望 DP 多为逆推：E[i] = Σ p(i→j) * (E[j] + w(i,j))，边界是终态的 E = 0',
      '概率 DP 正推：f[i] 表示到达 i 的概率，转移需保证所有出边概率之和为 1',
      '取模意义下「除以概率」要用乘逆元代替除法，概率本身也要转成模意义下的数'
    ],
    complexity: '取决于状态数与转移数，通常为 O(状态数 × 平均转移数)',
    pitfalls: [
      '无条件使用 E[XY] = E[X]E[Y]（只有独立才成立），是最常见的推导错误',
      '逆推 DP 的边界设错，或把 E[i] 的递推方向与图的边方向弄反',
      '取模时用整数除法代替乘逆元，答案直接错'
    ],
    template: [
      '// 逆推期望 DP：E[n] = 0，E[i] = Σ p * (E[j] + w)',
      'for (int i = n - 1; i >= 0; i--) {',
      '  double e = 0;',
      '  for (int k = 0; k < (int)tr[i].size(); k++)',
      '    e += tr[i][k].p * (E[tr[i][k].to] + tr[i][k].w);',
      '  E[i] = e;',
      '}'
    ].join('\n'),
    pattern: '题面出现「期望」「平均次数」「概率为 p/q」「随机过程直到某条件停止」时。',
    related: []
  };

  window.CSP.cards['math.game'] = {
    definition: '用 SG 函数与异或和判定公平组合博弈（Impartial Game）的胜负。',
    keyPoints: [
      '必败态（P 态）的 SG 值为 0；SG(x) = mex{SG(y) | x 能一步走到 y}，mex 是最小未出现非负整数',
      '整个游戏由若干互相独立的子游戏组成时，总 SG = 各子游戏 SG 的异或和',
      '总 SG ≠ 0 先手必胜，总 SG = 0 先手必败（前提：双方可选操作只取决于当前状态）',
      'Nim 游戏：各堆石子数异或和非 0 必胜，必胜策略是把某堆取到使异或和变 0',
      'SG 函数常有周期规律，n 很大时先打表找周期，再用周期直接算'
    ],
    complexity: '单个状态 O(后继状态数)；打表 O(状态数 × 转移数)；空间 O(状态数)',
    pitfalls: [
      '把「必胜态」与「SG ≠ 0」当成无条件等价（子游戏必须互相独立才成立）',
      '子游戏划分错误：互相不独立的博弈不能直接异或',
      '求 mex 的 vis 数组忘记每轮清空，或 mex 循环上界开得太小'
    ],
    template: [
      'int sg[N], mv[N][K], cnt[N];',
      'for (int i = 0; i < n; i++) {',
      '  bool vis[64] = {false};',
      '  for (int j = 0; j < cnt[i]; j++) vis[sg[mv[i][j]]] = true;',
      '  int g = 0; while (vis[g]) g++;',
      '  sg[i] = g;',
      '}',
      '// 总 SG = sg[x1] ^ sg[x2] ^ ...；非 0 先手必胜',
      '// n 很大时：打印前若干项找周期'
    ].join('\n'),
    pattern: '题面出现「两人轮流操作」「取走最后一颗石子的人赢」「问先手有没有必胜策略」时。',
    related: []
  };

  window.CSP.cards['math.geometry'] = {
    definition: '用向量、叉积与点积处理点线位置关系、面积、凸包等几何问题。',
    keyPoints: [
      '叉积 cross(a,b) = ax*by - ay*bx，其符号判定 b 在有向直线 a 的左侧还是右侧，为 0 表示共线',
      '点积 dot(a,b) = ax*bx + ay*by，为 0 表示垂直，为正表示锐角、为负表示钝角',
      '凸包 Andrew 算法：先按 (x,y) 排序，再分别扫出下凸壳与上凸壳，用 cross ≤ 0 弹栈',
      '多边形面积 = |Σ cross(P[i], P[i+1])| / 2（P[n] = P[0]），结果是两倍面积，尽量保留整数',
      '能整数绝对不用浮点：所有比较都用叉积的符号完成，避免 eps 争议'
    ],
    complexity: '凸包 O(n log n)（排序主导）；旋转卡壳求直径 O(n)；点线判定 O(1)',
    pitfalls: [
      '用 double 比较大小，精度误差导致凸包多/少点，WA 且难以调试',
      '弹栈条件 < 0 与 ≤ 0 的选择决定共线点是否保留，需按题意确认',
      '叉积用 int 计算溢出，坐标到 1e9 时乘积达 1e18，必须开 long long'
    ],
    template: [
      'struct P { long long x, y; };',
      'long long cross(P o, P a, P b) {',
      '  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);',
      '}',
      '// Andrew 凸包：按 (x,y) 排序后先扫下凸壳、再扫上凸壳',
      'sort(p, p + n, [](P a, P b) { return a.x != b.x ? a.x < b.x : a.y < b.y; });',
      'int t = 0;',
      'for (int i = 0; i < n; i++) {',
      '  while (t >= 2 && cross(h[t-2], h[t-1], p[i]) <= 0) t--;',
      '  h[t++] = p[i];',
      '}',
      '// 上凸壳反向再扫一遍，拼接时去掉首尾重复点'
    ].join('\n'),
    pattern: '题面出现「凸包」「点在多边形内」「线段相交」「旋转卡壳求最远点对」时。',
    related: []
  };

  window.CSP.cards['math.linear'] = {
    definition: '高斯消元用初等行变换把线性方程组化为阶梯形，同时求出秩与行列式。',
    keyPoints: [
      '逐列处理：在第 i 列从第 i 行往下选绝对值最大的非零行作为主元并交换，避免除零与精度崩溃',
      '把第 i 行归一化后消去其他所有行的第 i 列（高斯-约旦消元），直接得到解，省去回代',
      '无解判定：出现形如 0 = 非零 的行；无穷多解判定：有效方程数（秩）小于未知数个数',
      '模素数意义下消元把除法换成乘逆元，全程整数运算，比分块 CRT 更简单可靠',
      '浮点版本必须用 eps 判 0（通常 1e-8），且 eps 过大会把有效主元当 0 而误判秩'
    ],
    complexity: '时间 O(n^3)，空间 O(n^2)（n 为方程个数/未知数个数）',
    pitfalls: [
      '不选主元直接除，遇到主元为 0 时除零或数值爆炸',
      'eps 取值不当（过大丢解、过小精度不足），浮点题建议用 fabs(...) < 1e-8',
      '无解与无穷多解的判定顺序写反，输出错误的分类'
    ],
    template: [
      'for (int i = 0; i < n; i++) {',
      '  int p = i;',
      '  for (int j = i; j < n; j++) if (fabs(a[j][i]) > fabs(a[p][i])) p = j;',
      '  swap(a[i], a[p]);',
      '  if (fabs(a[i][i]) < eps) continue;        // 该列无主元，秩不足',
      '  for (int j = 0; j < n; j++) { if (j == i) continue;',
      '    double t = a[j][i] / a[i][i];',
      '    for (int k = i; k <= n; k++) a[j][k] -= t * a[i][k]; }',
      '}',
      '// 无自由元时解为 x[i] = a[i][n] / a[i][i]'
    ].join('\n'),
    pattern: '题面出现「解方程组」「求矩阵的秩/行列式」「线性基与异或方程组」「n ≤ 500 的方程组」时。',
    related: []
  };

  window.CSP.cards['math.bsgs'] = {
    definition: '大步小步算法（Baby-Step Giant-Step）求解离散对数 a^x ≡ b (mod p)。',
    keyPoints: [
      '设 m = ⌈√p⌉，把 x 写成 i*m + j（0 ≤ j < m），则 a^(i*m+j) ≡ b 移项得 a^j ≡ b * (a^(-m))^i',
      '第一步枚举 j = 0..m-1，把 a^j 的值与 j 存入哈希表（重复出现时保留最小的 j）',
      '第二步从 b 开始每轮乘 a^(-m)，枚举 i = 0..m-1，查表命中则答案为 i*m + j',
      '要求 gcd(a,p) = 1 才能用逆元；不互素时先约去公因子规约，或用扩展 BSGS',
      'p 为素数时 a^(-m) 用快速幂求 a^(p-1-m) 或直接对 a^m 求逆元'
    ],
    complexity: '时间 O(√p)，空间 O(√p)（哈希表存 √p 个元素）',
    pitfalls: [
      '未处理 a 与 p 不互素的情况，直接用逆元得到错误答案',
      'b = 1 时答案应为 0（x = 0），忘记特判会被判错',
      'm 取太小（如 floor(√p)）导致最大解 i*m+j < p 覆盖不全而漏解'
    ],
    template: [
      'long long bsgs(long long a, long long b, long long p) {',
      '  a %= p; b %= p;',
      '  if (b == 1 % p) return 0;                       // x = 0 特判',
      '  long long m = (long long)ceil(sqrt((double)p)) + 1;',
      '  map<long long, long long> mp; long long e = 1;',
      '  for (long long j = 0; j < m; j++) { if (!mp.count(e)) mp[e] = j; e = e * a % p; }',
      '  long long inv = qpow(e, p - 2, p);              // inv = a^(-m)',
      '  for (long long i = 0; i < m; i++) {',
      '    if (mp.count(b)) return i * m + mp[b];',
      '    b = b * inv % p; }',
      '  return -1;                                      // 无解',
      '}'
    ].join('\n'),
    pattern: '题面出现「求最小的 x 使 a^x ≡ b (mod p)」「离散对数」「模意义下的幂方程」时。',
    related: []
  };

  /* ========================================================================
   * 三、搜索
   * ======================================================================*/

  window.CSP.cards['search.dfs'] = {
    definition: '深度优先搜索：沿一条路径走到底再回溯，配合剪枝枚举方案或遍历状态。',
    keyPoints: [
      '递归参数携带当前状态，进入分支时打标记（vis[i] = 1），回溯时立即还原（vis[i] = 0）',
      '剪枝优先级：可行性剪枝 > 最优性剪枝 > 搜索顺序优化（先试分支少/收益大的选择）',
      '把候选按关键字排序后优先搜索更可能出解的方案（如背包按性价比降序），能大幅提前剪枝',
      '同一状态被多次访问且与到达路径无关时可记忆化，把搜索改造成 DP',
      '递归层数与栈空间相关，深度可达 1e5 时改用显式栈或改写成迭代'
    ],
    complexity: '最坏 O(分支数^深度)；剪枝后通常远小于该上界，空间 O(深度)',
    pitfalls: [
      '忘记在回溯处撤销 vis 标记，或反过来忘记进入时标记，导致同一元素被重复使用',
      '剪枝写成 return 而非 continue，误把整层循环提前终止',
      '递归过深导致爆栈（RE），大深度时需手写栈'
    ],
    template: [
      'void dfs(int dep, int sum) {',
      '  if (sum > best) return;                 // 最优性剪枝',
      '  if (dep == n) { best = min(best, sum); return; }',
      '  for (int i = 0; i < n; i++) {',
      '    if (vis[i]) continue;',
      '    if (sum + w[i] > lim) continue;       // 可行性剪枝',
      '    vis[i] = 1;',
      '    dfs(dep + 1, sum + w[i]);',
      '    vis[i] = 0;                           // 回溯还原',
      '  }',
      '}'
    ].join('\n'),
    pattern: '题面出现「求所有方案/方案数」「n ≤ 20 的枚举」「连通块统计」且需要及时剪枝时。',
    related: []
  };

  window.CSP.cards['search.bfs'] = {
    definition: '广度优先搜索按层扩展，在边权全为 1 的图上求最少步数或最短路径。',
    keyPoints: [
      '用数组模拟队列：q[h++] 取队首、q[t++] 入队，比 STL queue 快',
      '访问标记必须在「入队时」完成，而不是「出队时」，否则同一状态会被重复入队导致内存爆炸',
      '首次访问到目标即最短，因为 BFS 是按距离单调递增扩展的',
      '多源 BFS：把所有起点一次性入队并置 dist = 0，相当于加了一个超级源点',
      '状态空间大时用哈希/编码判重（字符串 map、康托展开、状态压缩成整数）'
    ],
    complexity: '时间 O(V + E)，空间 O(V)（V 为状态数、E 为转移数）',
    pitfalls: [
      '出队时才标记访问，导致重复入队、队列爆空间或超时',
      '队列开得比状态数小，越界后答案随机错',
      '多源 BFS 只把第一个起点入队，或忘记把起点 dist 清零'
    ],
    template: [
      'int q[N], h = 0, t = 0;',
      'q[t++] = s; vis[s] = 1; dist[s] = 0;',
      'while (h < t) {',
      '  int u = q[h++];',
      '  for (int k = 0; k < (int)g[u].size(); k++) {',
      '    int v = g[u][k];',
      '    if (vis[v]) continue;',
      '    vis[v] = 1; dist[v] = dist[u] + 1; q[t++] = v;',
      '    if (v == e) break;',
      '  }',
      '}'
    ].join('\n'),
    pattern: '题面出现「最少步数」「最短操作次数」「边权为 1 的最短路」「扩散/染色」时。',
    related: []
  };

  window.CSP.cards['search.bidir'] = {
    definition: '从起点与终点同时进行 BFS，在中间相遇，把指数级搜索降到平方根级。',
    keyPoints: [
      '维护两个队列与两个距离数组 d1（起点侧）、d2（终点侧），每轮只扩展一层',
      '状态被两侧都访问到时即相遇，答案为 d1[x] + d2[x]；要在扩展新节点时立即检查对方数组',
      '要求状态转移可逆（无向边），否则终点侧无法反向扩展',
      '复杂度从 b^d 降到 b^(d/2)，例如 d = 20、b = 2 时从百万降到千级',
      '两侧的层数不要强行对齐，按「哪侧队列小就扩展哪侧」可在一定情况下更省'
    ],
    complexity: '时间 O(b^(d/2))，空间 O(b^(d/2))（b 为分支数、d 为答案深度）',
    pitfalls: [
      '每次扩展整层写成只扩展一个节点，退化成普通 BFS 甚至更慢',
      '相遇判断只在出队时做，漏掉更早相遇导致答案不是最小',
      '两侧状态编码方式不统一，同一个状态在两侧被当成不同的键'
    ],
    template: [
      'int extend(queue<int> &q, vector<int> &d, const vector<int> &od) {',
      '  for (int sz = q.size(); sz--; ) {              // 每次只扩展一层',
      '    int u = q.front(); q.pop();',
      '    for (int k = 0; k < (int)g[u].size(); k++) {',
      '      int v = g[u][k];',
      '      if (d[v] >= 0) continue;',
      '      d[v] = d[u] + 1;',
      '      if (od[v] >= 0) return d[v] + od[v];       // 双向相遇',
      '      q.push(v); } }',
      '  return -1;',
      '}'
    ].join('\n'),
    pattern: '题面出现「最少步数」但状态空间巨大（十亿级）、单纯 BFS 会 TLE/MLE 时。',
    related: []
  };

  window.CSP.cards['search.astar'] = {
    definition: '用估价函数 f = g + h 引导优先扩展最有希望的状态；IDA* 是其迭代加深版本。',
    keyPoints: [
      'g 是从起点到当前的实际代价，h 是对到终点剩余代价的估计，f = g + h 越小越优先扩展',
      'h 必须满足「不高估」（admissible），否则求出的答案可能不是最优；h = 0 时退化为 Dijkstra',
      '优先队列按 f 从小到大取；同一状态可能多次入队，需用 g 数组跳过已过期的旧状态',
      'h 越好（越接近真值）剪枝越强，常见 h：曼哈顿距离、不在目标位置的元素个数、剩余最小边权之和',
      'IDA*：把「放回优先队列」换成「f > limit 就剪枝」的迭代加深 DFS，内存 O(深度)'
    ],
    complexity: '时间取决于 h 的质量，最坏等同 BFS/Dijkstra；空间 O(已扩展状态数)（IDA* 为 O(深度)）',
    pitfalls: [
      'h 高估导致第一次到达终点就返回，答案偏大',
      '优先队列中同一状态重复入队，忘记用 if (c.g > g[c.u]) continue; 跳过',
      'IDA* 的初始 limit 取得过大，失去迭代加深的剪枝意义'
    ],
    template: [
      'struct Sta { int u, g, f;',
      '  bool operator<(const Sta &o) const { return f > o.f; } };',
      'priority_queue<Sta> pq;',
      'g[s] = 0; pq.push({s, 0, h[s]});',
      'while (!pq.empty()) {',
      '  Sta c = pq.top(); pq.pop();',
      '  if (c.g > g[c.u]) continue;              // 过期状态',
      '  if (c.u == t) return c.g;',
      '  for (auto &e : gr[c.u]) { int ng = c.g + e.w;',
      '    if (ng < g[e.v]) { g[e.v] = ng; pq.push({e.v, ng, ng + h[e.v]}); } }',
      '}'
    ].join('\n'),
    pattern: '题面出现「最少步数 + 有明确的距离下界」「八数码/十五数码」「k 短路」时。',
    related: []
  };

  window.CSP.cards['search.itdeep'] = {
    definition: '迭代加深 DFS：按深度上限逐层加深搜索，兼得 DFS 的省空间与 BFS 的最短步数。',
    keyPoints: [
      '外层 for (limit = 0; ; limit++) 逐层加大深度上限，内层 DFS 只搜索深度不超过 limit 的分支',
      '第一次搜到目标时的 limit 即最短步数，因为浅层一定先于深层被完整搜索',
      '重复搜索浅层的代价可忽略：分支数为 b 时总代价仍是 O(b^limit)（等比级数）',
      '配合估价函数 h：若 g + h > limit 立即剪枝，就是 IDA*，搜索效率大幅提升',
      '适合「状态空间巨大但答案步数很小」以及内存受限（BFS 会 MLE）的场景'
    ],
    complexity: '时间 O(b^limit × 常数)，空间 O(limit)（b 为分支数、limit 为答案深度）',
    pitfalls: [
      'limit 没有上界导致无解时死循环（应设 maxd 或先判可达性）',
      '剪枝写成 g + h >= limit，把恰好等于 limit 的合法解剪掉',
      '提前找到解后没有及时 return，继续搜完全部叶子浪费大量时间'
    ],
    template: [
      'bool dfs(int u, int g, int limit) {',
      '  if (u == t) return true;',
      '  if (g + h[u] > limit) return false;      // 估价剪枝（g+h<=limit 才继续）',
      '  for (int k = 0; k < (int)gr[u].size(); k++) {',
      '    int v = gr[u][k];',
      '    if (g + 1 > limit) continue;',
      '    if (dfs(v, g + 1, limit)) return true;',
      '  }',
      '  return false;',
      '}',
      'for (int limit = 0; limit <= maxd; limit++)',
      '  if (dfs(s, 0, limit)) { ans = limit; break; }'
    ].join('\n'),
    pattern: '题面出现「最少步数」但状态数巨大、BFS 会 MLE，或「步数不超过 k（k 很小）」时。',
    related: []
  };

  window.CSP.cards['search.meet'] = {
    definition: '折半搜索：把 n 个元素的问题拆成两半各枚举 2^(n/2)，再合并答案。',
    keyPoints: [
      '把元素分成前后两半，分别枚举各自的所有子集并记录对应的值（和、异或和、方案数等）',
      '合并时对后半的结果排序，再用二分/双指针为每个前半结果寻找满足条件的后半结果',
      '适用于 n ≤ 40 的子集和、子集异或、恰好装满等「2^n 暴力」问题',
      '合并前先去重与排序，能显著减少常数；注意空集这一项要不要计入',
      '进阶：后半的每个子集也可携带额外信息（如所选个数），把合并条件变成多维查询'
    ],
    complexity: '时间 O(2^(n/2) log 2^(n/2))，空间 O(2^(n/2))',
    pitfalls: [
      'n = 40 时 2^40 不可行，必须折半；但 n 很小时折半反而更慢，注意判断',
      '合并统计「方案数」时写成二分查找一个值，忘记用 upper_bound - lower_bound 统计个数',
      '两半划分不均匀（如 n 为奇数时前后差 1 以上），导致复杂度上升'
    ],
    template: [
      'vector<long long> A, B;',
      'int h1 = n / 2, h2 = n - h1;',
      'for (int m = 0; m < (1 << h1); m++) {',
      '  long long s = 0;',
      '  for (int i = 0; i < h1; i++) if (m >> i & 1) s += w[i];',
      '  A.push_back(s); }',
      'for (int m = 0; m < (1 << h2); m++) {',
      '  long long s = 0;',
      '  for (int i = 0; i < h2; i++) if (m >> i & 1) s += w[h1 + i];',
      '  B.push_back(s); }',
      'sort(B.begin(), B.end());   // 再对每个 A 的值二分统计 B 中满足条件的个数'
    ].join('\n'),
    pattern: '题面出现「n ≤ 40 的子集和/异或问题」「选或不选且要凑出目标值」「2^n 暴力超时」时。',
    related: []
  };

  /* ========================================================================
   * 四、综合技巧
   * ======================================================================*/

  window.CSP.cards['adv.offline'] = {
    definition: '离线处理：先读入全部询问，重新排序后统一回答，再按原顺序输出。',
    keyPoints: [
      '把询问按某个关键字（右端点、左端点、权值、时间）排序后一遍扫过，避免在线数据结构的限制',
      '经典应用：区间不同数个数（按右端点排序 + 树状数组只保留每个数最后一次出现的位置）',
      '时间倒流：把「删除」操作离线后倒着做变成「插入」，并查集维护连通性时非常好用',
      '答案必须存进数组，最后按原始询问编号输出；处理顺序与输出顺序解耦是关键',
      '需要强制在线的题目（如带交互、答案依赖上一次询问）不能离线，先读清题意'
    ],
    complexity: '排序 O(q log q)，扫描加数据结构 O((n + q) log n)；空间 O(n + q)',
    pitfalls: [
      '处理完忘记按原始编号输出（或输出顺序弄反）',
      '排序关键字相同时次序不稳定，若依赖处理顺序需补齐第二关键字',
      '离线后仍保留了「删除」操作，忘记时间倒流把删除改写成插入'
    ],
    template: [
      '// 区间不同数个数：按右端点排序，树状数组维护「每个值最后出现位置」',
      'sort(qs, qs + q, [](Q a, Q b) { return a.r < b.r; });',
      'int p = 0;',
      'for (int i = 0; i < q; i++) {',
      '  while (p <= qs[i].r) {',
      '    if (last[a[p]]) add(last[a[p]], -1);   // 旧位置撤销',
      '    add(p, 1); last[a[p]] = p; p++;',
      '  }',
      '  ans[qs[i].id] = sum(qs[i].l, qs[i].r);',
      '}',
      '// 最后按 id 输出 ans[]'
    ].join('\n'),
    pattern: '题面出现「m 次询问区间……」且没有强制在线、一次扫过能维护的信息比在线版简单时。',
    related: []
  };

  window.CSP.cards['adv.scanline'] = {
    definition: '沿一个维度排序成事件后依次扫描，用数据结构维护另一维度上的信息。',
    keyPoints: [
      '把每个对象拆成两个事件（进入 / 离开），按扫描维度排序，逐个处理',
      '矩形面积并：对 x 扫描，线段树维护 y 轴上被覆盖的长度；覆盖次数 cnt 与有效长度 len 分开维护',
      '覆盖长度线段树的关键：不做 pushdown，只在 cnt > 0 时把 len 设为整段长度，为 0 时用儿子合并',
      '求窗口最值类问题可用单调队列代替线段树，把 O(n log n) 降到 O(n)',
      '坐标范围大时先离散化，只在端点处切分区间'
    ],
    complexity: '时间 O(n log n)（排序 + 线段树），空间 O(n)',
    pitfalls: [
      '区间边界按「左闭右开」处理，写成左闭右闭导致面积重复或遗漏',
      '覆盖计数线段树错误地下传标记，破坏了「cnt 不 pushdown」的写法',
      '离散化后忘记处理相邻端点之间的实际坐标差，长度算成下标差'
    ],
    template: [
      '// 矩形面积并：矩形拆成左右两条竖边事件',
      'sort(ev, ev + 2 * n, [](E a, E b) { return a.x < b.x; });',
      'long long ans = 0;',
      'for (int i = 0; i < 2 * n; i++) {',
      '  if (i) ans += (ev[i].x - ev[i - 1].x) * len[1];  // 上一位移贡献的面积',
      '  update(1, ev[i].l, ev[i].r, ev[i].d);            // d = +1 / -1',
      '}',
      '// update 中：cnt>0 时 len = ys[r+1]-ys[l]，否则叶子为 0、内部节点由儿子合并'
    ].join('\n'),
    pattern: '题面出现「矩形面积并/周长并」「数轴上区间覆盖次数」「时间轴上的区间贡献」时。',
    related: []
  };

  window.CSP.cards['adv.cdq'] = {
    definition: 'CDQ 分治：在归并过程中统计「左半区间对右半区间」的贡献，把动态问题化静态。',
    keyPoints: [
      '分治区间 [l, r]：先递归左右两半，再统计左半对右半的贡献（跨区间贡献）',
      '统计前把两半分别按第二维排序，用双指针 + 树状数组处理第三维，避免每层重新排序可先归并',
      '三维偏序（a ≤, b ≤, c ≤）标准做法：按 a 排序去重，CDQ 处理 b，树状数组处理 c',
      '前提是「贡献可独立累加」：右半区间的答案 = 左半贡献 + 右半内部贡献',
      '用过的树状数组位置要记录并逐点清空，不能整体 memset（否则每层 O(值域)）'
    ],
    complexity: '时间 O(n log^2 n)，空间 O(n)（n 为元素个数）',
    pitfalls: [
      '统计完忘记清空树状数组，污染后续分支的答案',
      '存在完全相同的元素时未去重、排序比较用 < 还是 ≤ 不统一，导致相同的点互相漏算',
      '递归边界写成 l < r 而不是 l == r 时返回，造成无限递归'
    ],
    template: [
      'void cdq(int l, int r) {',
      '  if (l == r) return;',
      '  int mid = (l + r) >> 1; cdq(l, mid); cdq(mid + 1, r); int i = l, j = mid + 1, k = l;',
      '  while (j <= r) {',
      '    while (i <= mid && p[i].b <= p[j].b) { bit.add(p[i].c, 1); tmp[k++] = p[i++]; }',
      '    p[j].ans += bit.sum(p[j].c);              // 左半 b 更小且 c 更小的贡献',
      '    tmp[k++] = p[j++];',
      '  }',
      '  for (int t = l; t < i; t++) bit.add(p[t].c, -1);   // 清空树状数组',
      '  while (i <= mid) tmp[k++] = p[i++];',
      '  for (int t = l; t <= r; t++) p[t] = tmp[t];        // 归并回去',
      '}'
    ].join('\n'),
    pattern: '题面出现「三维偏序」「带修改的计数问题」「形如 i<j 且 a_i<a_j 且 b_i<b_j 的统计」时。',
    related: []
  };

  window.CSP.cards['adv.overall'] = {
    definition: '整体二分：把所有询问一起二分答案，一次 check 判定一批询问，适合第 k 小类问题。',
    keyPoints: [
      '在答案值域 [L, R] 上二分 mid，用数据结构统计每个询问在 mid 左侧的贡献并判定其答案落在哪半边',
      '递归时把操作序列与询问序列一起分成左右两组，分别递归到 [L, mid] 与 [mid+1, R]',
      '适用条件：答案存在单调性（可比大小）、单次修改的贡献可累加、判定与询问独立',
      '相比每个询问单独二分（O(q log V log n)），整体二分共享了数据结构操作，常数更优',
      '每层结束必须清空数据结构（撤销本层做过的修改）'
    ],
    complexity: '时间 O((n + q) log V log n)，空间 O(n + q)（V 为答案值域）',
    pitfalls: [
      '操作与询问没有按时间序一起划分，导致时间维度错乱',
      '每层结束忘记撤销数据结构中的修改',
      '值域过大未离散化（应只在出现的候选值上二分）'
    ],
    template: [
      'void solve(int l, int r, vector<int> &op, vector<int> &q) {',
      '  if (l == r) { for (int id : q) ans[id] = val[l]; return; }',
      '  int mid = (l + r) >> 1;',
      '  // 1. 把「前半区间的修改」应用到数据结构，并记录影响',
      '  // 2. 对每个询问统计当前贡献 cnt',
      '  //    cnt >= k 归入左组，否则 k -= cnt 归入右组',
      '  // 3. 撤销步骤 1 的所有修改',
      '  solve(l, mid, lop, lq);',
      '  solve(mid + 1, r, rop, rq);',
      '}'
    ].join('\n'),
    pattern: '题面出现「多次询问区间第 k 小」「带修改的第 k 大」「二分答案的判定代价高但可共享」时。',
    related: []
  };

  window.CSP.cards['adv.random'] = {
    definition: '随机化算法：用随机数简化判定、构造权值或抽样，以期望复杂度或极小错误率取胜。',
    keyPoints: [
      '随机权值哈希：给每个元素赋随机 64 位权值，用异或和判断两个多重集是否相等（冲突概率极低）',
      '随机快排/Treap：随机选基准或随机优先级，期望复杂度 O(n log n)，避免被有序数据卡成 O(n^2)',
      '蒙特卡洛：随机撒点估计面积/期望值，精度随 1/√N 提升，适合答案允许误差的题',
      '随机化贪心/模拟退火：多次随机初值 + 局部调整，适合求最优解但不好精确求解的场景',
      '随机数的质量很重要：用 mt19937_64 并配合 chrono 播种，不要用没 srand 的 rand()'
    ],
    complexity: '期望复杂度依具体算法而定（随机快排期望 O(n log n)，蒙特卡洛误差 O(1/√N)）',
    pitfalls: [
      'rand() 未 srand 或范围只有 32767，随机性严重不足',
      '单次随机化算法有极小概率出错，关键题应多次运行取最优/增加随机次数',
      '用固定种子提交被出题人卡，正式提交时可换成时间种子'
    ],
    template: [
      '#include <random>',
      '#include <chrono>',
      'mt19937_64 rng(chrono::steady_clock::now().time_since_epoch().count());',
      'long long rnd(long long l, long long r) { return l + rng() % (r - l + 1); }',
      '// 随机权值哈希：w[i] = rnd(1, 1e18)，比较两集合时异或 w 即可'
    ].join('\n'),
    pattern: '题面出现「判断两个多重集是否相同」「随机化数据/求近似最优」「正解过于复杂但可接受极小错误率」时。',
    related: []
  };

  window.CSP.cards['adv.construct'] = {
    definition: '构造题：按约束直接给出任意一组合法解，常需特判无解与小规模分类讨论。',
    keyPoints: [
      '先手玩小数据（n = 1, 2, 3）打表找规律，再猜通项并验证，最后写分段构造',
      '常见套路：按奇偶分类、按 k 的倍数分段、对称构造、先构造一个基础解再局部微调',
      '必须处理无解情况：如要求的次数超过上界、n 太小无法构造，输出 -1 或 NO',
      '构造题通常「答案不唯一」，样例只是其中一种，不要试图复现样例输出',
      '写完用暴力检查器（spj 思路）验证自己构造的解是否满足全部约束'
    ],
    complexity: '通常 O(n) 或 O(n log n)，取决于构造方式',
    pitfalls: [
      '漏判无解情况直接输出构造结果，被判 WA',
      '只过样例不做小数据暴力验证，边界（n 很小、k 很大）时构造崩坏',
      '误以为输出必须与样例完全相同，白白浪费大量时间'
    ],
    template: [
      '// 构造题流程：小数据打表 -> 找规律 -> 分段讨论 -> 特判无解',
      'if (noSolution) { cout << -1 << "\\n"; return 0; }',
      'if (n == 1) { cout << 1 << "\\n"; return 0; }',
      'if (n % 2 == 0) { /* 偶数情形构造 */ }',
      'else            { /* 奇数情形构造 */ }',
      '// 输出后建议再用 O(n^2) 的检查器验证一遍合法性'
    ].join('\n'),
    pattern: '题面出现「构造一个长度为 n 的序列使得……」「输出任意一组解」「不存在则输出 -1」时。',
    related: []
  };

  window.CSP.cards['adv.interactive'] = {
    definition: '交互题：通过标准输入输出与评测机对话，需严格遵守询问次数与刷新约定。',
    keyPoints: [
      '每次输出询问后必须刷新缓冲区：C++ 用 cout << endl 或 cout.flush() / fflush(stdout)',
      '询问次数有硬性上限，先估算算法需要的次数（如二分 ⌈log2 n⌉）再写，留出安全余量',
      '减少询问的技巧：一次读取返回的多个信息、二分/倍增定位、利用已知条件排除区间',
      '多组数据时要重新开始交互；不要缓存上次的返回值',
      '本地测试可以用管道或手写一个交互器模拟，但要注意 EOF 与刷新时机'
    ],
    complexity: '询问次数通常为 O(log n) 或题目给定上限；每次交互为 O(1) I/O',
    pitfalls: [
      '忘记 flush 导致评测机一直等待，报 Idle limit exceeded 或 TLE',
      '询问次数超限直接被判 WA',
      '提前 return 后不再读取剩余输入，后续多测数据错乱'
    ],
    template: [
      'int lo = 1, hi = n;',
      'while (lo < hi) {',
      '  int mid = (lo + hi) / 2;',
      '  cout << "? " << mid << endl;      // endl 自带 flush',
      '  int r; cin >> r;',
      '  if (r) hi = mid; else lo = mid + 1;',
      '}',
      'cout << "! " << lo << endl;',
      'return 0;'
    ].join('\n'),
    pattern: '题面出现「你可以进行最多 k 次询问」「交互库」「每次询问返回……」「猜数/二分定位」时。',
    related: []
  };

  window.CSP.cards['adv.io'] = {
    definition: '输入输出优化：用更快的读写方式与批量输出，避免 I/O 成为程序的性能瓶颈。',
    keyPoints: [
      'C++ 首选 ios::sync_with_stdio(false); cin.tie(nullptr); 可让 cin/cout 提速数倍',
      '输出换行用 \'\\n\' 而非 endl：endl 每次都会刷新缓冲区，大数据量下开销极大',
      '需要更快时手写快读（getchar 逐字符读入并自行解析整数）与快输（递归/缓冲输出）',
      '关闭同步后不要与 scanf/printf 混用，否则读写顺序错乱',
      '输出量极大（百万行）时先拼进字符串再一次 write/puts，比分多次 cout 快得多'
    ],
    complexity: '快读按字符处理，整体与输入规模成线性关系（常数远小于 cin）',
    pitfalls: [
      '关同步后又混用 scanf/printf，输入输出顺序错乱',
      '大量使用 endl，刷新次数过多导致 TLE',
      '快读没有处理负号和文件结束（EOF），遇到负数或空输入时出错'
    ],
    template: [
      'ios::sync_with_stdio(false);',
      'cin.tie(nullptr);',
      'inline int rd() {',
      '  int x = 0, f = 1; char c = getchar();',
      '  for (; c < \'0\' || c > \'9\'; c = getchar()) if (c == \'-\') f = -1;',
      '  for (; c >= \'0\' && c <= \'9\'; c = getchar()) x = x * 10 + c - \'0\';',
      '  return x * f;',
      '}'
    ].join('\n'),
    pattern: '题面出现「n, m ≤ 1e6」「输入为大量整数」「输出百万行」「TLE 且算法复杂度已最优」时。',
    related: []
  };

  window.CSP.cards['adv.stress'] = {
    definition: '对拍：用随机数据反复比较暴力程序与正解的输出，快速定位错误并复现。',
    keyPoints: [
      '三件套：gen（生成随机数据）、brute（保证正确的暴力）、std（待验证的正解）',
      '循环执行 gen > in, brute < in > a, std < in > b，用 fc/diff 比较，一旦不同就停下并保存数据',
      'gen 使用可复现的随机种子并打印种子，出错时能一键还原那一组数据',
      '随机数据要覆盖边界与特殊结构：最小值、最大值、全相同、n = 1、稀疏/稠密图',
      'Windows 用批处理或 PowerShell 脚本，Linux 用 bash 循环；也可以写在一个 C++ 程序里直接对拍'
    ],
    complexity: '每轮代价为一次暴力 + 一次正解的运行时间，通常几轮即可暴露错误',
    pitfalls: [
      'gen 的随机范围过小，测不出大数据下的错误',
      '出错后没有保存输入文件，无法复现问题',
      'brute 与 std 的输入格式不一致（多读/少读），对拍结果全是错'
    ],
    template: [
      '// 对拍脚本（Windows 批处理）',
      ':loop',
      'gen.exe > in.txt',
      'brute.exe < in.txt > a.txt',
      'std.exe   < in.txt > b.txt',
      'fc a.txt b.txt > nul || (echo WA! & pause)',
      'goto loop',
      '// Linux：while true; do ./gen > in; ./brute < in > a; ./std < in > b;',
      '//        diff a b || break; done'
    ].join('\n'),
    pattern: '题面/代码「WA 了但样例全过」「不确定贪心结论是否成立」「大模拟写完后自检」时。',
    related: []
  };

  window.CSP.cards['adv.strategy'] = {
    definition: 'CSP-S 考场策略：按性价比分配时间，保底拿分、写完必测、留足检查时间。',
    keyPoints: [
      '开考先花 5 分钟通读四题，按「可做性 × 分值」决定开题顺序，不要按题号硬做',
      'T1 目标 30 分钟内 AC；T2 稳拿正解或高分部分分；T3/T4 先写暴力 + 特殊性质（如 n 小、树、链）拿分',
      '每道题写完立刻验证：过样例 → 手造边界（n=1、全相同、最大规模）→ 有条件就对拍',
      '不会的题也必须提交暴力或特判输出，部分分往往是省一与省二的分界',
      '最后 30 分钟停止写新代码，专查：文件输入输出文件名、数组大小、long long、多测清空、return 0'
    ],
    complexity: '时间分配建议：4 题共 4 小时，平均每题 45 分钟 + 最后 30 分钟统一检查',
    pitfalls: [
      '忘记写 freopen 的文件名（CSP-S 需要提交 .cpp，通常使用标准输入输出，务必按题目要求确认）',
      '在一道题上死磕超过一小时，挤占其他题的时间',
      '数组开小或忘记开 long long，大数据点直接 RE/WA，丢失大量分数'
    ],
    template: [
      '// 每题固定框架，减少低级错误',
      '#include <bits/stdc++.h>',
      'using namespace std;',
      'int main() {',
      '  freopen("problem.in", "r", stdin);    // 按题目要求决定是否使用',
      '  freopen("problem.out", "w", stdout);  // CSP-S 若要求标准 I/O 则删掉两行',
      '  ios::sync_with_stdio(false); cin.tie(nullptr);',
      '  // 1. 写暴力保底  2. 写正解  3. 对拍验证  4. 补特殊性质',
      '  return 0;',
      '}'
    ].join('\n'),
    pattern: '进入考场后制定整体作答计划，以及一道题卡住时决定「继续磕还是换题先拿分」时。',
    related: []
  };
})();
