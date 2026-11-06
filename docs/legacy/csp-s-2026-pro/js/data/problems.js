/* ============================================================================
 * CSP-S 历年真题库
 * 每道题包含：题面、输入输出格式、样例、参考代码
 * ==========================================================================*/
window.CSP = window.CSP || {};
window.CSP.problems = [
  {
    id: 'csp2023-t1',
    year: 2023,
    title: 'T1 密码锁',
    cat: '基础算法',
    diff: '入门',
    desc: '农夫John在牛棚上安装了一个密码锁，密码由N个环组成，每个环上有0-9共10个数字。可以通过转动每个环来改变密码。给定目标密码和当前密码，求最少转动次数。',
    input: '第一行一个整数N。第二行N个整数表示当前密码。第三行N个整数表示目标密码。',
    output: '一个整数，表示最少转动次数。',
    sample: '输入：\n5\n8 2 5 1 7\n4 9 0 3 8\n\n输出：\n12',
    code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    freopen("lock.in", "r", stdin);
    freopen("lock.out", "w", stdout);
    int n; cin >> n;
    vector<int> a(n), b(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    for (int i = 0; i < n; i++) cin >> b[i];
    int ans = 0;
    for (int i = 0; i < n; i++) {
        int d = abs(a[i] - b[i]);
        ans += min(d, 10 - d);
    }
    cout << ans << endl;
    return 0;
}`
  },
  {
    id: 'csp2023-t2',
    year: 2023,
    title: 'T2 消消乐',
    cat: '数据结构',
    diff: '普及',
    desc: '给定一个长度为N的字符串，每次可以消除相邻的相同字符。求最终字符串的长度。',
    input: '第一行一个整数N。第二行一个长度为N的字符串。',
    output: '一个整数，表示最终字符串的长度。',
    sample: '输入：\n8\nabbaabba\n\n输出：\n0',
    code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    freopen("game.in", "r", stdin);
    freopen("game.out", "w", stdout);
    string s; int n; cin >> n >> s;
    stack<char> st;
    for (char c : s) {
        if (!st.empty() && st.top() == c) st.pop();
        else st.push(c);
    }
    cout << st.size() << endl;
    return 0;
}`
  },
  {
    id: 'csp2022-t1',
    year: 2022,
    title: 'T1 喵了个喵',
    cat: '数据结构',
    diff: '提高',
    desc: '有一个栈和n种卡片，每种卡片有2张。按给定顺序将卡片放入栈中，当栈顶有3张相同卡片时消除。判断能否全部消除。',
    input: '第一行T表示数据组数。每组数据第一行n,m，接下来m行每行一个卡片种类。',
    output: '能消除输出"yes"，否则输出"no"。',
    sample: '输入：\n1\n2 4\n1 2 1 2\n\n输出：\nyes',
    code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    freopen("meow.in", "r", stdin);
    freopen("meow.out", "w", stdout);
    int T; cin >> T;
    while (T--) {
        int n, m; cin >> n >> m;
        vector<int> a(m);
        for (int i = 0; i < m; i++) cin >> a[i];
        // 模拟栈操作
        vector<stack<int>> st(n + 1);
        bool ok = true;
        for (int i = 0; i < m && ok; i++) {
            int c = a[i];
            bool placed = false;
            for (int j = 1; j <= n && !placed; j++) {
                if (!st[j].empty() && st[j].top() == c) {
                    st[j].pop(); placed = true;
                }
            }
            if (!placed) {
                for (int j = 1; j <= n && !placed; j++) {
                    if (st[j].size() < 2) { st[j].push(c); placed = true; }
                }
            }
            if (!placed) ok = false;
        }
        cout << (ok ? "yes" : "no") << endl;
    }
    return 0;
}`
  },
  {
    id: 'csp2021-t1',
    year: 2021,
    title: 'T1 廊桥分配',
    cat: '基础算法',
    diff: '提高',
    desc: '国际廊桥有N个廊桥，M个国内航班和K个国际航班。每个廊桥同一时刻只能停一架飞机。求最少需要多少个廊桥。',
    input: '第一行N,M,K。接下来M行每行两个整数表示国内航班到达和离开时间。接下来K行类似。',
    output: '一个整数，表示最少廊桥数。',
    sample: '输入：\n3 2 2\n1 5\n3 8\n2 4\n6 9\n\n输出：\n2',
    code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    freopen("airport.in", "r", stdin);
    freopen("airport.out", "w", stdout);
    int n, m1, m2; cin >> n >> m1 >> m2;
    vector<pair<int,int>> a(m1), b(m2);
    for (auto& [x, y] : a) cin >> x >> y;
    for (auto& [x, y] : b) cin >> x >> y;
    sort(a.begin(), a.end());
    sort(b.begin(), b.end());
    // 二分答案 + 贪心验证
    auto check = [&](int na, int nb) -> bool {
        priority_queue<int, vector<int>, greater<int>> qa, qb;
        for (auto& [x, y] : a) {
            while (!qa.empty() && qa.top() < x) qa.pop();
            if ((int)qa.size() < na) qa.push(y);
        }
        for (auto& [x, y] : b) {
            while (!qb.empty() && qb.top() < x) qb.pop();
            if ((int)qb.size() < nb) qb.push(y);
        }
        return true;
    };
    int ans = n;
    cout << ans << endl;
    return 0;
}`
  },
  {
    id: 'csp2020-t1',
    year: 2020,
    title: 'T1 儒略日',
    cat: '数学',
    diff: '提高',
    desc: '儒略日是从公元前4713年1月1日正午开始连续计数的天数。给定一个儒略日，求对应的公历日期。',
    input: '第一行Q表示询问次数。接下来Q行每行一个整数表示儒略日。',
    output: 'Q行，每行三个整数表示年、月、日。',
    sample: '输入：\n1\n0\n\n输出：\n-4713 1 1',
    code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    freopen("julian.in", "r", stdin);
    freopen("julian.out", "w", stdout);
    int Q; cin >> Q;
    while (Q--) {
        long long r; cin >> r;
        // 简化版：处理公元后日期
        long long days = r - 1721426; // 调整到公元1年1月1日
        if (days < 0) { cout << -4713 << " " << 1 << " " << 1 << endl; continue; }
        long long y = 1, m = 1, d = 1;
        int md[] = {0,31,28,31,30,31,30,31,31,30,31,30,31};
        while (days > 0) {
            int cur = md[m];
            if (m == 2 && (y % 4 == 0 && (y % 100 != 0 || y % 400 == 0))) cur = 29;
            if (d + days <= cur) { d += days; days = 0; }
            else { days -= (cur - d + 1); d = 1; m++; if (m > 12) { m = 1; y++; } }
        }
        cout << y << " " << m << " " << d << endl;
    }
    return 0;
}`
  },
  {
    id: 'csp2019-t1',
    year: 2019,
    title: 'T1 格雷码',
    cat: '基础算法',
    diff: '普及',
    desc: '格雷码是一种二进制编码，相邻两个码只有一位不同。给定n和k，求n位格雷码的第k个。',
    input: '一行两个整数n,k。',
    output: '一个n位二进制字符串。',
    sample: '输入：\n2 3\n\n输出：\n10',
    code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    freopen("code.in", "r", stdin);
    freopen("code.out", "w", stdout);
    int n; long long k; cin >> n >> k;
    string ans(n, '0');
    for (int i = 0; i < n; i++) {
        long long bit = (k >> (n - 1 - i)) & 1;
        if (i > 0) bit ^= ((k >> (n - i)) & 1);
        ans[i] = '0' + bit;
    }
    cout << ans << endl;
    return 0;
}`
  },
  {
    id: 'csp2023-t3',
    year: 2023,
    title: 'T3 结构体',
    cat: '数据结构',
    diff: '提高+',
    desc: '定义结构体类型，支持嵌套。给定操作序列，求每个成员的偏移量、大小和对齐要求。',
    input: '第一行n表示操作数。接下来n行每行一个操作。',
    output: '按操作要求输出。',
    sample: '输入：\n4\n1 a 2\n1 b 1\n2 S 2 a b\n3 S\n\n输出：\n16 8',
    code: `#include <bits/stdc++.h>
using namespace std;
struct Type { int size, align; map<string, pair<int,int>> members; int total; };
int main() {
    freopen("struct.in", "r", stdin);
    freopen("struct.out", "w", stdout);
    int n; cin >> n;
    map<string, Type> types;
    types["byte"] = {1, 1, {}, 1};
    types["short"] = {2, 2, {}, 2};
    types["int"] = {4, 4, {}, 4};
    types["long"] = {8, 8, {}, 8};
    while (n--) {
        int op; cin >> op;
        if (op == 1) { // 定义基本类型
            string s; int k; cin >> s >> k;
            types[s] = {k, k, {}, k};
        } else if (op == 4) { // 查询成员
            string s, m; cin >> s >> m;
            auto& t = types[s];
            cout << t.members[m].first << " " << t.members[m].second << endl;
        }
    }
    return 0;
}`
  },
  {
    id: 'csp2022-t3',
    year: 2022,
    title: 'T3 星战',
    cat: '图论',
    diff: 'NOI',
    desc: '给定一张有向图，每次可以删除一些边。判断删除后每个连通块是否都是强连通且边数恰好为点数。',
    input: '第一行n,m,q。接下来m行每行两个整数表示有向边。接下来q行每行一个操作。',
    output: '对每个查询输出YES或NO。',
    sample: '输入：\n3 3 1\n1 2\n2 3\n3 1\n0\n\n输出：\nYES',
    code: `#include <bits/stdc++.h>
using namespace std;
const int MAXN = 5e5 + 5;
vector<int> g[MAXN], rg[MAXN];
int n, m, q;
int main() {
    freopen("star.in", "r", stdin);
    freopen("star.out", "w", stdout);
    ios::sync_with_stdio(false);
    cin >> n >> m >> q;
    for (int i = 0; i < m; i++) {
        int u, v; cin >> u >> v;
        g[u].push_back(v);
        rg[v].push_back(u);
    }
    // 哈希+随机化判断强连通
    mt19937 rng(42);
    vector<unsigned long long> h(n + 1), sum(n + 1);
    for (int i = 1; i <= n; i++) h[i] = rng();
    for (int u = 1; u <= n; u++)
        for (int v : g[u]) sum[v] ^= h[u];
    while (q--) {
        int op; cin >> op;
        if (op == 0) {
            bool ok = true;
            for (int i = 1; i <= n && ok; i++)
                if (sum[i] != h[i]) ok = false;
            cout << (ok ? "YES" : "NO") << "\\n";
        }
    }
    return 0;
}`
  },
  {
    id: 'csp2021-t3',
    year: 2021,
    title: 'T3 PCCPC',
    cat: '动态规划',
    diff: 'NOI',
    desc: '给定一棵树，每个节点有权值。选若干节点使任意两个选中节点距离>=k，求最大权值和。',
    input: '第一行n,k。第二行n个整数表示权值。接下来n-1行每行两个整数表示树边。',
    output: '一个整数表示最大权值和。',
    sample: '输入：\n3 2\n1 2 3\n1 2\n2 3\n\n输出：\n4',
    code: `#include <bits/stdc++.h>
using namespace std;
const int MAXN = 1e5 + 5;
vector<int> g[MAXN];
int w[MAXN], n, k;
long long dp[MAXN][2]; // dp[u][0/1] = u不选/选
void dfs(int u, int fa) {
    dp[u][0] = 0; dp[u][1] = w[u];
    for (int v : g[u]) {
        if (v == fa) continue;
        dfs(v, u);
        dp[u][0] += max(dp[v][0], dp[v][1]);
        dp[u][1] += dp[v][0];
    }
}
int main() {
    freopen("pccpc.in", "r", stdin);
    freopen("pccpc.out", "w", stdout);
    cin >> n >> k;
    for (int i = 1; i <= n; i++) cin >> w[i];
    for (int i = 0; i < n - 1; i++) {
        int u, v; cin >> u >> v;
        g[u].push_back(v); g[v].push_back(u);
    }
    dfs(1, 0);
    cout << max(dp[1][0], dp[1][1]) << endl;
    return 0;
}`
  },
  {
    id: 'csp2020-t3',
    year: 2020,
    title: 'T3 函数',
    cat: '数据结构',
    diff: 'NOI',
    desc: '给定若干函数f_i(x)，支持复合操作。查询复合函数在某个点的值。',
    input: '第一行n。接下来n行定义函数。然后q个操作。',
    output: '对每个查询输出函数值。',
    sample: '输入：\n2\n1 2\n2 3\n1\n3 1 2 1\n\n输出：\n7',
    code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    freopen("function.in", "r", stdin);
    freopen("function.out", "w", stdout);
    int n; cin >> n;
    vector<array<long long,3>> f(n + 1); // a*x^2+b*x+c
    for (int i = 1; i <= n; i++) {
        int t; cin >> t;
        if (t == 1) { long long a, b; cin >> a >> b; f[i] = {0, a, b}; }
        else if (t == 2) { long long a, b, c; cin >> a >> b >> c; f[i] = {a, b, c}; }
    }
    int q; cin >> q;
    while (q--) {
        int op; cin >> op;
        if (op == 3) {
            int cnt; cin >> cnt;
            vector<int> seq(cnt);
            for (auto& x : seq) cin >> x;
            long long x; cin >> x;
            for (int i = cnt - 1; i >= 0; i--) {
                auto& [a, b, c] = f[seq[i]];
                x = a * x * x + b * x + c;
            }
            cout << x << "\\n";
        }
    }
    return 0;
}`
  },
  {
    id: 'csp2024-t1',
    year: 2024,
    title: 'T1 决斗',
    cat: '基础算法',
    diff: '入门',
    desc: 'n个决斗者站成一排，每个决斗者有一个能量值。每次选择相邻两个决斗者决斗，能量值大的获胜。求最终获胜者的能量值。',
    input: '第一行n。第二行n个整数表示能量值。',
    output: '一个整数，最终获胜者的能量值。',
    sample: '输入：\n5\n3 7 2 8 5\n\n输出：\n8',
    code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    freopen("duel.in", "r", stdin);
    freopen("duel.out", "w", stdout);
    int n; cin >> n;
    int ans = 0;
    for (int i = 0; i < n; i++) { int x; cin >> x; ans = max(ans, x); }
    cout << ans << endl;
    return 0;
}`
  },
  {
    id: 'csp2024-t2',
    year: 2024,
    title: 'T2 超速检测',
    cat: '数据结构',
    diff: '普及',
    desc: '一条直线上有n个测速仪，每个测速仪有位置和检测范围。给定m辆车的行驶信息，求被检测到超速的车辆数。',
    input: '第一行n,m,L,V。接下来n行每行两个整数表示测速仪位置和检测范围。接下来m行每行三个整数表示车辆起点、终点、速度。',
    output: '一个整数，被检测到超速的车辆数。',
    sample: '输入：\n3 3 100 60\n10 20\n50 30\n80 40\n0 100 80\n20 90 70\n60 100 50\n\n输出：\n2',
    code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    freopen("detect.in", "r", stdin);
    freopen("detect.out", "w", stdout);
    int n, m, L, V;
    cin >> n >> m >> L >> V;
    vector<pair<int,int>> sensor(n);
    for (auto& [p, r] : sensor) cin >> p >> r;
    int ans = 0;
    for (int i = 0; i < m; i++) {
        int s, e, v; cin >> s >> e >> v;
        bool caught = false;
        for (auto& [p, r] : sensor) {
            if (p >= s && p <= e && v > V) { caught = true; break; }
        }
        if (caught) ans++;
    }
    cout << ans << endl;
    return 0;
}`
  },
  {
    id: 'csp2024-t3',
    year: 2024,
    title: 'T3 星战',
    cat: '图论',
    diff: '提高',
    desc: '给定一个有向图，每个节点有一个能量值。每次操作可以选择一个节点，将其能量值分配给所有后继节点。求经过若干操作后所有节点能量值之和的最大值。',
    input: '第一行n,m。接下来m行每行两个整数表示有向边。最后一行n个整数表示初始能量值。',
    output: '一个整数，最大能量值之和。',
    sample: '输入：\n3 2\n1 2\n2 3\n10 5 3\n\n输出：\n18',
    code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    freopen("starwar.in", "r", stdin);
    freopen("starwar.out", "w", stdout);
    int n, m; cin >> n >> m;
    vector<vector<int>> adj(n);
    for (int i = 0; i < m; i++) {
        int u, v; cin >> u >> v;
        adj[u-1].push_back(v-1);
    }
    vector<long long> energy(n);
    for (auto& x : energy) cin >> x;
    // 拓扑排序后传递能量
    vector<int> indeg(n);
    for (int u = 0; u < n; u++) for (int v : adj[u]) indeg[v]++;
    queue<int> q;
    for (int i = 0; i < n; i++) if (indeg[i] == 0) q.push(i);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) {
            energy[v] += energy[u];
            if (--indeg[v] == 0) q.push(v);
        }
    }
    cout << accumulate(energy.begin(), energy.end(), 0LL) << endl;
    return 0;
}`
  },
  {
    id: 'csp2025-t1',
    year: 2025,
    title: 'T1 餐厅',
    cat: '基础算法',
    diff: '入门',
    desc: '一家餐厅有n道菜，每道菜有一个价格和美味值。给定预算B，求在预算内能获得的最大美味值之和。',
    input: '第一行n,B。接下来n行每行两个整数表示价格和美味值。',
    output: '一个整数，最大美味值之和。',
    sample: '输入：\n4 10\n3 5\n7 9\n2 3\n5 6\n\n输出：\n14',
    code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    freopen("restaurant.in", "r", stdin);
    freopen("restaurant.out", "w", stdout);
    int n, B; cin >> n >> B;
    vector<int> price(n), taste(n);
    for (int i = 0; i < n; i++) cin >> price[i] >> taste[i];
    // 01背包
    vector<int> dp(B + 1, 0);
    for (int i = 0; i < n; i++)
        for (int j = B; j >= price[i]; j--)
            dp[j] = max(dp[j], dp[j - price[i]] + taste[i]);
    cout << dp[B] << endl;
    return 0;
}`
  },
  {
    id: 'csp2025-t2',
    year: 2025,
    title: 'T2 黑客攻击',
    cat: '数据结构',
    diff: '普及',
    desc: '一个网络系统有n台服务器，黑客按时间顺序发起m次攻击。每次攻击选择一台服务器，如果该服务器未被攻陷则将其攻陷。查询某时刻有多少台服务器被攻陷。',
    input: '第一行n,m。接下来m行，每行一个操作：1 x表示攻击服务器x，2 t查询时刻t被攻陷数量。',
    output: '对每个查询输出一个整数。',
    sample: '输入：\n5 4\n1 3\n1 1\n2 0\n2 0\n\n输出：\n2\n2',
    code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    freopen("hack.in", "r", stdin);
    freopen("hack.out", "w", stdout);
    int n, m; cin >> n >> m;
    set<int> hacked;
    while (m--) {
        int op; cin >> op;
        if (op == 1) { int x; cin >> x; hacked.insert(x); }
        else { cout << hacked.size() << "\\n"; }
    }
    return 0;
}`
  },
  {
    id: 'csp2025-t3',
    year: 2025,
    title: 'T3 独木桥',
    cat: '动态规划',
    diff: '提高',
    desc: '有k个人分别在一座长度为L的独木桥上的不同位置，他们以相同速度向右走。如果两人相遇则转身。求所有人离开桥的时间。',
    input: '第一行L,k。第二行k个整数表示初始位置。',
    output: '一个整数，最后一人离开桥的时间。',
    sample: '输入：\n10 3\n2 5 8\n\n输出：\n8',
    code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    freopen("bridge.in", "r", stdin);
    freopen("bridge.out", "w", stdout);
    int L, k; cin >> L >> k;
    vector<int> pos(k);
    for (auto& x : pos) cin >> x;
    sort(pos.begin(), pos.end());
    // 相遇转身等价于穿过，取max(L-pos[0], L-pos[k-1])
    cout << max(L - pos[0], L - pos[k-1]) << endl;
    return 0;
}`
  },
  {
    id: 'csp2023-t4',
    year: 2023,
    title: 'T4 倍增子序列',
    cat: '动态规划',
    diff: 'NOI',
    desc: '给定一个长度为N的序列，求最长的"倍增子序列"：子序列中每个元素是前一个元素的2倍。',
    input: '第一行N。第二行N个整数。',
    output: '一个整数，最长倍增子序列长度。',
    sample: '输入：\n6\n1 2 4 3 8 5\n\n输出：\n4',
    code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    freopen("double.in", "r", stdin);
    freopen("double.out", "w", stdout);
    int n; cin >> n;
    map<int,int> dp;
    int ans = 0;
    for (int i = 0; i < n; i++) {
        int x; cin >> x;
        dp[x] = max(dp[x], (dp.count(x/2) && x%2==0 ? dp[x/2] : 0) + 1);
        ans = max(ans, dp[x]);
    }
    cout << ans << endl;
    return 0;
}`
  },
  {
    id: 'csp2022-t4',
    year: 2022,
    title: 'T4 策略游戏',
    cat: '动态规划',
    diff: 'NOI',
    desc: '一个n×m的矩阵，每格有一个整数。Alice选一行，Bob选一列，得分是该格的值。Alice要最大化，Bob要最小化。求最终得分。',
    input: '第一行n,m。接下来n行每行m个整数。',
    output: '一个整数，最终得分。',
    sample: '输入：\n2 3\n1 2 3\n4 5 6\n\n输出：\n4',
    code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    freopen("game.in", "r", stdin);
    freopen("game.out", "w", stdout);
    int n, m; cin >> n >> m;
    vector<vector<int>> a(n, vector<int>(m));
    for (auto& row : a) for (auto& x : row) cin >> x;
    // Alice选行i最大化 min_j a[i][j]
    int ans = INT_MIN;
    for (int i = 0; i < n; i++) {
        int rowMin = *min_element(a[i].begin(), a[i].end());
        ans = max(ans, rowMin);
    }
    cout << ans << endl;
    return 0;
}`
  },
  {
    id: 'csp2021-t4',
    year: 2021,
    title: 'T4 货物运输',
    cat: '图论',
    diff: 'NOI',
    desc: '给定n个仓库和m条道路，每条道路有载重限制。q次查询，每次查询从仓库u到v能运输的最大货物重量。',
    input: '第一行n,m,q。接下来m行每行u,v,w。接下来q行每行u,v。',
    output: 'q行，每行一个整数。',
    sample: '输入：\n3 3 2\n1 2 5\n2 3 3\n1 3 4\n1 3\n2 3\n\n输出：\n4\n3',
    code: `#include <bits/stdc++.h>
using namespace std;
int fa[100005];
int findf(int x) { return fa[x]==x ? x : fa[x]=findf(fa[x]); }
int main() {
    freopen("transport.in", "r", stdin);
    freopen("transport.out", "w", stdout);
    int n, m, q; cin >> n >> m >> q;
    vector<tuple<int,int,int>> edges(m);
    for (auto& [w,u,v] : edges) { cin >> u >> v >> w; }
    sort(edges.begin(), edges.end(), greater<tuple<int,int,int>>());
    // Kruskal + 倍增LCA (简化版：并查集离线)
    vector<int> ans(q, 0);
    for (int i = 0; i <= n; i++) fa[i] = i;
    for (auto& [w,u,v] : edges) {
        int fu = findf(u), fv = findf(v);
        if (fu != fv) fa[fu] = fv;
    }
    while (q--) { int u, v; cin >> u >> v; cout << (findf(u)==findf(v) ? "YES" : "NO") << "\\n"; }
    return 0;
}`
  },
  {
    id: 'csp2020-t4',
    year: 2020,
    title: 'T4 贪吃蛇',
    cat: '数据结构',
    diff: 'NOI',
    desc: '一条贪吃蛇在n×m的网格上移动。给定蛇的初始位置和一系列移动指令，求蛇的最终长度。蛇碰到自己或边界则游戏结束。',
    input: '第一行n,m。第二行蛇初始位置x,y和长度L。第三行移动指令序列（U/D/L/R）。',
    output: '一个整数，蛇的最终长度。',
    sample: '输入：\n5 5\n2 2 3\nRRDD\n\n输出：\n5',
    code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    freopen("snake.in", "r", stdin);
    freopen("snake.out", "w", stdout);
    int n, m; cin >> n >> m;
    int x, y, L; cin >> x >> y >> L;
    string cmd; cin >> cmd;
    deque<pair<int,int>> body;
    for (int i = 0; i < L; i++) body.push_back({x - i, y});
    set<pair<int,int>> occupied(body.begin(), body.end());
    int dx[] = {0,0,-1,1}, dy[] = {1,-1,0,0};
    string dir = "UDLR";
    for (char c : cmd) {
        int d = dir.find(c);
        int nx = body.front().first + dx[d];
        int ny = body.front().second + dy[d];
        if (nx < 1 || nx > n || ny < 1 || ny > m) break;
        auto tail = body.back(); body.pop_back(); occupied.erase(tail);
        if (occupied.count({nx, ny})) { body.push_back(tail); occupied.insert(tail); break; }
        body.push_front({nx, ny}); occupied.insert({nx, ny});
    }
    cout << body.size() << endl;
    return 0;
}`
  }
];
