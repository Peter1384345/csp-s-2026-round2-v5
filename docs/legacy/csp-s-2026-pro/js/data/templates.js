/* ============================================================================
 * CSP-S 2026 PRO · 代码模板速查数据
 * 每个模板包含：id, category, name, difficulty, description, code, problems
 * ==========================================================================*/
(function () {
  'use strict';
  window.CSP = window.CSP || {};
  window.CSP.templates = [

  /* ==================== 基础算法 ==================== */
  {
    id: 'tpl-binary', cat: '基础算法', name: '二分查找 / 二分答案', diff: 'S',
    desc: '在有序序列中查找目标值，或对单调性问题求最优解。CSP-S常考二分答案。',
    code: `// 二分查找 - 在有序数组中找目标值
int binarySearch(int a[], int n, int target) {
    int l = 0, r = n - 1;
    while (l <= r) {
        int mid = l + (r - l) / 2;
        if (a[mid] == target) return mid;
        else if (a[mid] < target) l = mid + 1;
        else r = mid - 1;
    }
    return -1;
}

// 二分答案 - 求满足条件的最小值
bool check(int x) {
    // 判断x是否满足条件
    return true;
}

int binaryAnswer() {
    int l = L_MIN, r = R_MAX;
    while (l < r) {
        int mid = (l + r) / 2;
        if (check(mid)) r = mid;
        else l = mid + 1;
    }
    return l;
}`,
    problems: ['P1571', 'P1678', 'P1918', 'P2920']
  },
  {
    id: 'tpl-prefix', cat: '基础算法', name: '前缀和（一维+二维）', diff: 'J',
    desc: '快速求区间和，一维和二维前缀和都是常考基础。',
    code: `// 一维前缀和
int a[MAXN], s[MAXN];
for (int i = 1; i <= n; i++) s[i] = s[i-1] + a[i];
// 区间 [l, r] 的和
int sum = s[r] - s[l-1];

// 二维前缀和
int a[MAXN][MAXN], s[MAXN][MAXN];
for (int i = 1; i <= n; i++)
    for (int j = 1; j <= m; j++)
        s[i][j] = a[i][j] + s[i-1][j] + s[i][j-1] - s[i-1][j-1];
// 子矩阵 (x1,y1)~(x2,y2) 的和
int sum = s[x2][y2] - s[x1-1][y2] - s[x2][y1-1] + s[x1-1][y1-1];`,
    problems: ['P6568', 'P6625', 'P1147', 'P3662']
  },
  {
    id: 'tpl-diff', cat: '基础算法', name: '差分（一维+二维）', diff: 'J',
    desc: '对区间进行加减操作后还原数组，常与前缀和配合使用。',
    code: `// 一维差分：对区间 [l, r] 加 v
int d[MAXN];
void add(int l, int r, int v) { d[l] += v; d[r+1] -= v; }
// 还原：求前缀和
for (int i = 1; i <= n; i++) d[i] += d[i-1];

// 二维差分：对子矩阵加 v
void add2D(int x1, int y1, int x2, int y2, int v) {
    d[x1][y1] += v; d[x2+1][y1] -= v;
    d[x1][y2+1] -= v; d[x2+1][y2+1] += v;
}
// 还原：求二维前缀和
for (int i = 1; i <= n; i++)
    for (int j = 1; j <= m; j++)
        d[i][j] += d[i-1][j] + d[i][j-1] - d[i-1][j-1];`,
    problems: ['P2367', 'P3397', 'P5542', 'P9094']
  },
  {
    id: 'tpl-bfs', cat: '基础算法', name: 'BFS 广度优先搜索', diff: 'J',
    desc: '层序遍历，求最短路径/最少步数。常用于网格图最短路。',
    code: `int dist[MAXN][MAXM]; bool vis[MAXN][MAXM];
int dx[] = {0, 0, 1, -1}, dy[] = {1, -1, 0, 0};

void bfs(int sx, int sy) {
    queue<pair<int,int>> q;
    q.push({sx, sy});
    vis[sx][sy] = true; dist[sx][sy] = 0;
    while (!q.empty()) {
        auto [x, y] = q.front(); q.pop();
        for (int i = 0; i < 4; i++) {
            int nx = x + dx[i], ny = y + dy[i];
            if (nx < 1 || nx > n || ny < 1 || ny > m) continue;
            if (vis[nx][ny] || g[nx][ny] == '#') continue;
            vis[nx][ny] = true;
            dist[nx][ny] = dist[x][y] + 1;
            q.push({nx, ny});
        }
    }
}`,
    problems: ['P1596', 'P1443', 'P1746', 'P1332']
  },
  {
    id: 'tpl-dfs', cat: '基础算法', name: 'DFS 深度优先搜索', diff: 'J',
    desc: '递归遍历，用于连通性判断、排列组合、路径搜索等。',
    code: `bool vis[MAXN];
void dfs(int u, int fa) {
    vis[u] = true;
    for (int i = head[u]; i; i = e[i].next) {
        int v = e[i].to;
        if (v == fa || vis[v]) continue;
        dfs(v, u);
    }
}

// 回溯法 - 全排列
int path[MAXN]; bool used[MAXN];
void permute(int step, int n) {
    if (step == n + 1) { /* 处理一组排列 */ return; }
    for (int i = 1; i <= n; i++) {
        if (!used[i]) {
            used[i] = true; path[step] = i;
            permute(step + 1, n);
            used[i] = false;
        }
    }
}`,
    problems: []
  },
  {
    id: 'tpl-discretize', cat: '基础算法', name: '离散化', diff: 'S',
    desc: '将大范围数据映射到小范围，常配合树状数组/线段树使用。',
    code: `int a[MAXN], b[MAXN];
vector<int> vals;
void discretize() {
    for (int i = 1; i <= n; i++) vals.push_back(a[i]);
    sort(vals.begin(), vals.end());
    vals.erase(unique(vals.begin(), vals.end()), vals.end());
    for (int i = 1; i <= n; i++)
        b[i] = lower_bound(vals.begin(), vals.end(), a[i]) - vals.begin() + 1;
}`,
    problems: []
  },
  {
    id: 'tpl-greedy', cat: '基础算法', name: '贪心', diff: 'S',
    desc: '每步选当前最优决策，需证明局部最优能推出全局最优。',
    code: `// 区间调度：按右端点排序，选最多不冲突区间
sort(a + 1, a + n + 1, [](const P &x, const P &y) {
    return x.r < y.r;
});
int cnt = 0; long long last = -1e18;
for (int i = 1; i <= n; i++)
    if (a[i].l >= last) { cnt++; last = a[i].r; }`,
    problems: ['P1208', 'P1090', 'P1223']
  },

  /* ==================== 图论 ==================== */
  {
    id: 'tpl-graph-store', cat: '图论', name: '链式前向星（建图）', diff: 'S',
    desc: 'CSP-S最常用的建图方式，比vector邻接表更高效。',
    code: `struct Edge { int to, next, w; } e[MAXM];
int head[MAXN], cnt = 0;

void addEdge(int u, int v, int w) {
    e[++cnt] = {v, head[u], w};
    head[u] = cnt;
}

// 遍历
for (int i = head[u]; i; i = e[i].next) {
    int v = e[i].to, w = e[i].w;
}`,
    problems: []
  },
  {
    id: 'tpl-toposort', cat: '图论', name: '拓扑排序', diff: 'S',
    desc: '对DAG进行线性排序，常用于依赖关系、DP顺序。',
    code: `int inDeg[MAXN];
queue<int> q;
vector<int> topo;

void topoSort() {
    for (int i = 1; i <= n; i++)
        if (inDeg[i] == 0) q.push(i);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        topo.push_back(u);
        for (int i = head[u]; i; i = e[i].next) {
            int v = e[i].to;
            if (--inDeg[v] == 0) q.push(v);
        }
    }
}`,
    problems: ['P1807', 'P1038', 'P3243', 'P1113']
  },
  {
    id: 'tpl-dsu', cat: '图论', name: '并查集（含带权）', diff: 'S',
    desc: '判断连通性、合并集合。带权并查集是进阶考点。',
    code: `int fa[MAXN];
void init() { for(int i=1;i<=n;i++) fa[i]=i; }
int find(int x) { return fa[x]==x ? x : fa[x]=find(fa[x]); }
void merge(int x, int y) { fa[find(x)] = find(y); }

// 带权并查集
int fa[MAXN], d[MAXN]; // d[x] = x到根的距离
int find(int x) {
    if (fa[x] == x) return x;
    int root = find(fa[x]);
    d[x] += d[fa[x]];
    return fa[x] = root;
}`,
    problems: ['P8654', 'P6121', 'P1196', 'P8710']
  },
  {
    id: 'tpl-mst', cat: '图论', name: '最小生成树（Kruskal+Prim）', diff: 'S',
    desc: 'Kruskal（并查集+排序）和Prim（堆优化）两种方法。',
    code: `// Kruskal
struct Edge { int u, v, w; } edges[MAXM];
bool operator<(Edge a, Edge b) { return a.w < b.w; }

int kruskal() {
    sort(edges + 1, edges + m + 1);
    init(); // 并查集初始化
    int sum = 0, cnt = 0;
    for (int i = 1; i <= m && cnt < n - 1; i++) {
        int u = edges[i].u, v = edges[i].v;
        if (find(u) != find(v)) {
            merge(u, v); sum += edges[i].w; cnt++;
        }
    }
    return cnt == n - 1 ? sum : -1;
}

// Prim (堆优化)
int prim() {
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> pq;
    bool vis[MAXN] = {};
    pq.push({0, 1});
    int sum = 0, cnt = 0;
    while (!pq.empty() && cnt < n) {
        auto [w, u] = pq.top(); pq.pop();
        if (vis[u]) continue;
        vis[u] = true; sum += w; cnt++;
        for (int i = head[u]; i; i = e[i].next)
            if (!vis[e[i].to]) pq.push({e[i].w, e[i].to});
    }
    return sum;
}`,
    problems: ['P1546', 'P3366', 'P2212', 'P2330']
  },
  {
    id: 'tpl-shortest', cat: '图论', name: '最短路（Dijkstra+Floyd）', diff: 'S',
    desc: 'Dijkstra+堆优化（非负权）、Floyd（全源）、SPFA（负权）。',
    code: `// Dijkstra + 堆优化
int dist[MAXN]; bool vis[MAXN];
void dijkstra(int s) {
    memset(dist, 0x3f, sizeof dist);
    memset(vis, 0, sizeof vis);
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> pq;
    dist[s] = 0; pq.push({0, s});
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (vis[u]) continue;
        vis[u] = true;
        for (int i = head[u]; i; i = e[i].next) {
            int v = e[i].to;
            if (dist[v] > dist[u] + e[i].w) {
                dist[v] = dist[u] + e[i].w;
                pq.push({dist[v], v});
            }
        }
    }
}

// Floyd 全源最短路
void floyd() {
    for (int k = 1; k <= n; k++)
        for (int i = 1; i <= n; i++)
            for (int j = 1; j <= n; j++)
                dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]);
}`,
    problems: ['P2935', 'P2176', 'P1186', 'P2371', 'P4568']
  },
  {
    id: 'tpl-tarjan', cat: '图论', name: 'Tarjan（SCC+割点+割边）', diff: 'S',
    desc: '求割点、割边、强连通分量（缩点）、边双/点双连通分量。',
    code: `int dfn[MAXN], low[MAXN], timer = 0;
int stk[MAXN], top = 0;
bool inStk[MAXN];
int scc[MAXN], sccCnt = 0;

void tarjan(int u) {
    dfn[u] = low[u] = ++timer;
    stk[++top] = u; inStk[u] = true;
    for (int i = head[u]; i; i = e[i].next) {
        int v = e[i].to;
        if (!dfn[v]) {
            tarjan(v);
            low[u] = min(low[u], low[v]);
        } else if (inStk[v]) {
            low[u] = min(low[u], dfn[v]);
        }
    }
    if (dfn[u] == low[u]) {
        sccCnt++;
        while (true) {
            int v = stk[top--];
            scc[v] = sccCnt; inStk[v] = false;
            if (v == u) break;
        }
    }
}
// 割点: low[v] >= dfn[u] (u非根) 或 u是根且有>=2子树
// 割边: low[v] > dfn[u]`,
    problems: ['P1656', 'P2863', 'P3387', 'P3388', 'P8436']
  },
  {
    id: 'tpl-lca', cat: '图论', name: 'LCA（倍增在线）', diff: 'S',
    desc: '树上两点最近公共祖先，倍增法在线查询。',
    code: `int fa[MAXN][21], dep[MAXN];

void dfs(int u, int f) {
    dep[u] = dep[f] + 1;
    fa[u][0] = f;
    for (int j = 1; j <= 20; j++)
        fa[u][j] = fa[fa[u][j-1]][j-1];
    for (int i = head[u]; i; i = e[i].next)
        if (e[i].to != f) dfs(e[i].to, u);
}

int lca(int x, int y) {
    if (dep[x] < dep[y]) swap(x, y);
    for (int j = 20; j >= 0; j--)
        if (dep[fa[x][j]] >= dep[y]) x = fa[x][j];
    if (x == y) return x;
    for (int j = 20; j >= 0; j--)
        if (fa[x][j] != fa[y][j]) { x = fa[x][j]; y = fa[y][j]; }
    return fa[x][0];
}`,
    problems: ['P3379', 'P8805', 'P10113', 'P4427']
  },
  {
    id: 'tpl-diff-constraint', cat: '图论', name: '差分约束', diff: 'S',
    desc: '将不等式约束转化为图上最短路问题，用SPFA求解。',
    code: `// x[v] - x[u] <= w  =>  建边 u -> v, 权值 w
// 求最大值：最短路 (dist[v] <= dist[u] + w)
// 求最小值：最长路 (建边 v -> u, 权值 -w)
// 超级源点 0 向所有点连边权0，判断负环

int dist[MAXN], cnt[MAXN]; bool inQ[MAXN];
queue<int> q;
bool spfa(int s) {
    memset(dist, 0x3f, sizeof dist);
    memset(cnt, 0, sizeof cnt);
    memset(inQ, 0, sizeof inQ);
    dist[s] = 0; q.push(s); inQ[s] = true;
    while (!q.empty()) {
        int u = q.front(); q.pop(); inQ[u] = false;
        for (int i = head[u]; i; i = e[i].next) {
            int v = e[i].to;
            if (dist[v] > dist[u] + e[i].w) {
                dist[v] = dist[u] + e[i].w;
                cnt[v] = cnt[u] + 1;
                if (cnt[v] >= n) return false; // 负环
                if (!inQ[v]) { q.push(v); inQ[v] = true; }
            }
        }
    }
    return true;
}`,
    problems: ['P6145', 'P5960', 'P3275', 'P7624']
  },
  {
    id: 'tpl-bipartite', cat: '图论', name: '二分图（染色+匈牙利）', diff: 'S',
    desc: '二分图判定（染色法）和二分图最大匹配（匈牙利算法）。',
    code: `// 染色法判定二分图
int color[MAXN]; // 0未染色, 1和-1两种颜色
bool isBipartite(int u, int c) {
    color[u] = c;
    for (int i = head[u]; i; i = e[i].next) {
        int v = e[i].to;
        if (!color[v]) {
            if (!isBipartite(v, -c)) return false;
        } else if (color[v] == color[u]) return false;
    }
    return true;
}

// 匈牙利算法 - 最大匹配
int match[MAXN]; bool vis[MAXN];
bool hungary(int u) {
    for (int i = head[u]; i; i = e[i].next) {
        int v = e[i].to;
        if (!vis[v]) {
            vis[v] = true;
            if (!match[v] || hungary(match[v])) {
                match[v] = u; return true;
            }
        }
    }
    return false;
}`,
    problems: ['P10378', 'P1525', 'P3386', 'P1129']
  },

  /* ==================== 树论 ==================== */
  {
    id: 'tpl-bit', cat: '树论', name: '树状数组', diff: 'S',
    desc: '支持单点修改+区间查询，或区间修改+单点查询。代码短、常数小。',
    code: `int c[MAXN], n;
int lowbit(int x) { return x & (-x); }

void update(int x, int v) {
    for (; x <= n; x += lowbit(x)) c[x] += v;
}

int query(int x) {
    int s = 0;
    for (; x > 0; x -= lowbit(x)) s += c[x];
    return s;
}

// 区间修改 + 单点查询（差分树状数组）
void rangeAdd(int l, int r, int v) {
    update(l, v); update(r+1, -v);
}
int pointQuery(int x) { return query(x); }`,
    problems: ['P5200', 'P3374', 'P3368', 'P6186', 'P3960']
  },
  {
    id: 'tpl-segtree', cat: '树论', name: '线段树（lazy标记）', diff: 'S',
    desc: '区间修改+区间查询，支持lazy标记。CSP-S核心数据结构。',
    code: `int sum[MAXN*4], lazy[MAXN*4];

void pushup(int p) { sum[p] = sum[p*2] + sum[p*2+1]; }
void pushdown(int p, int len) {
    if (lazy[p]) {
        sum[p*2] += lazy[p] * (len - len/2);
        sum[p*2+1] += lazy[p] * (len/2);
        lazy[p*2] += lazy[p]; lazy[p*2+1] += lazy[p];
        lazy[p] = 0;
    }
}

void build(int p, int l, int r) {
    if (l == r) { sum[p] = a[l]; return; }
    int mid = (l + r) / 2;
    build(p*2, l, mid); build(p*2+1, mid+1, r);
    pushup(p);
}

void update(int p, int l, int r, int ql, int qr, int v) {
    if (ql <= l && r <= qr) { sum[p] += v*(r-l+1); lazy[p] += v; return; }
    pushdown(p, r-l+1);
    int mid = (l + r) / 2;
    if (ql <= mid) update(p*2, l, mid, ql, qr, v);
    if (qr > mid) update(p*2+1, mid+1, r, ql, qr, v);
    pushup(p);
}

int query(int p, int l, int r, int ql, int qr) {
    if (ql <= l && r <= qr) return sum[p];
    pushdown(p, r-l+1);
    int mid = (l + r) / 2, res = 0;
    if (ql <= mid) res += query(p*2, l, mid, ql, qr);
    if (qr > mid) res += query(p*2+1, mid+1, r, ql, qr);
    return res;
}`,
    problems: ['P1276', 'P1531', 'P1198', 'P1607', 'P2471']
  },
  {
    id: 'tpl-trie', cat: '树论', name: '字典树 Trie（含0/1 Trie）', diff: 'S',
    desc: '高效存储和查询字符串前缀，0/1 Trie用于异或最值。',
    code: `// 字符串 Trie
int ch[MAXN][26], cnt = 0;
bool isEnd[MAXN];

void insert(const char* s) {
    int u = 0;
    for (; *s; s++) {
        int c = *s - 'a';
        if (!ch[u][c]) ch[u][c] = ++cnt;
        u = ch[u][c];
    }
    isEnd[u] = true;
}

bool find(const char* s) {
    int u = 0;
    for (; *s; s++) {
        int c = *s - 'a';
        if (!ch[u][c]) return false;
        u = ch[u][c];
    }
    return isEnd[u];
}

// 0/1 Trie - 异或最值
int ch[MAXN*31][2], cnt = 0;
void insert(int x) {
    int u = 0;
    for (int i = 30; i >= 0; i--) {
        int b = (x >> i) & 1;
        if (!ch[u][b]) ch[u][b] = ++cnt;
        u = ch[u][b];
    }
}
int queryMaxXor(int x) {
    int u = 0, res = 0;
    for (int i = 30; i >= 0; i--) {
        int b = (x >> i) & 1;
        if (ch[u][!b]) { res |= (1 << i); u = ch[u][!b]; }
        else u = ch[u][b];
    }
    return res;
}`,
    problems: ['P3879', 'P2580', 'P8306', 'P4551']
  },
  {
    id: 'tpl-hld', cat: '树论', name: '树链剖分', diff: 'NOI',
    desc: '将树转化为线性序列，配合线段树进行路径/子树操作。',
    code: `int fa[MAXN], dep[MAXN], sz[MAXN], son[MAXN];
int top[MAXN], dfn[MAXN], rnk[MAXN], timer = 0;

void dfs1(int u, int f) {
    fa[u] = f; dep[u] = dep[f] + 1; sz[u] = 1;
    for (int i = head[u]; i; i = e[i].next) {
        int v = e[i].to; if (v == f) continue;
        dfs1(v, u); sz[u] += sz[v];
        if (sz[v] > sz[son[u]]) son[u] = v;
    }
}
void dfs2(int u, int t) {
    top[u] = t; dfn[u] = ++timer; rnk[timer] = u;
    if (!son[u]) return;
    dfs2(son[u], t);
    for (int i = head[u]; i; i = e[i].next) {
        int v = e[i].to;
        if (v != fa[u] && v != son[u]) dfs2(v, v);
    }
}
// 路径修改/查询：跳重链
void updatePath(int x, int y, int v) {
    while (top[x] != top[y]) {
        if (dep[top[x]] < dep[top[y]]) swap(x, y);
        update(1, 1, n, dfn[top[x]], dfn[x], v);
        x = fa[top[x]];
    }
    if (dep[x] > dep[y]) swap(x, y);
    update(1, 1, n, dfn[x], dfn[y], v);
}`,
    problems: ['P3384', 'P2146', 'P2486', 'P4114']
  },

  /* ==================== 动态规划 ==================== */
  {
    id: 'tpl-linear-dp', cat: '动态规划', name: '线性DP（LIS+LCS）', diff: 'S',
    desc: 'LIS、LCS、数字三角形等经典线性DP。',
    code: `// LIS - 最长上升子序列 O(n log n)
int a[MAXN], dp[MAXN], len = 0;
for (int i = 1; i <= n; i++) {
    int pos = lower_bound(dp + 1, dp + len + 1, a[i]) - dp;
    dp[pos] = a[i];
    len = max(len, pos);
}

// LCS - 最长公共子序列
int f[MAXN][MAXN];
for (int i = 1; i <= n; i++)
    for (int j = 1; j <= m; j++) {
        if (a[i] == b[j]) f[i][j] = f[i-1][j-1] + 1;
        else f[i][j] = max(f[i-1][j], f[i][j-1]);
    }`,
    problems: ['P1020', 'P1091', 'P1439', 'P2758']
  },
  {
    id: 'tpl-knapsack', cat: '动态规划', name: '背包DP（01+完全+多重）', diff: 'S',
    desc: '0/1背包、完全背包、多重背包、分组背包。',
    code: `// 0/1背包
int dp[MAXW];
for (int i = 1; i <= n; i++)
    for (int j = W; j >= w[i]; j--)
        dp[j] = max(dp[j], dp[j-w[i]] + v[i]);

// 完全背包
for (int i = 1; i <= n; i++)
    for (int j = w[i]; j <= W; j++)
        dp[j] = max(dp[j], dp[j-w[i]] + v[i]);

// 多重背包 (二进制拆分)
for (int i = 1; i <= n; i++) {
    int num = c[i];
    for (int k = 1; k <= num; k *= 2) {
        for (int j = W; j >= k*w[i]; j--)
            dp[j] = max(dp[j], dp[j-k*w[i]] + k*v[i]);
        num -= k;
    }
    if (num > 0)
        for (int j = W; j >= num*w[i]; j--)
            dp[j] = max(dp[j], dp[j-num*w[i]] + num*v[i]);
}`,
    problems: ['P1048', 'P1616', 'P1776', 'P1757', 'P4832']
  },
  {
    id: 'tpl-interval-dp', cat: '动态规划', name: '区间DP', diff: 'S',
    desc: '枚举区间长度和分割点，如石子合并。',
    code: `// 石子合并
int f[MAXN][MAXN], s[MAXN]; // s是前缀和
for (int len = 2; len <= n; len++)
    for (int l = 1; l + len - 1 <= n; l++) {
        int r = l + len - 1;
        f[l][r] = INT_MAX;
        for (int k = l; k < r; k++)
            f[l][r] = min(f[l][r], f[l][k] + f[k+1][r] + s[r] - s[l-1]);
    }`,
    problems: ['P1775', 'P1063', 'P2858', 'P3146']
  },
  {
    id: 'tpl-tree-dp', cat: '动态规划', name: '树形DP（直径+舞会）', diff: 'S',
    desc: '在树上做DP，如树的直径、树的重心、树形背包等。',
    code: `// 树的直径 (树形DP)
int d1[MAXN], d2[MAXN], ans = 0;
void dfs(int u, int fa) {
    for (int i = head[u]; i; i = e[i].next) {
        int v = e[i].to; if (v == fa) continue;
        dfs(v, u);
        if (d1[v] + e[i].w > d1[u]) {
            d2[u] = d1[u]; d1[u] = d1[v] + e[i].w;
        } else if (d1[v] + e[i].w > d2[u]) {
            d2[u] = d1[v] + e[i].w;
        }
    }
    ans = max(ans, d1[u] + d2[u]);
}

// 没有上司的舞会 (树形DP选/不选)
int f[MAXN][2]; // f[u][0]不选u, f[u][1]选u
void dfs(int u) {
    f[u][1] = val[u];
    for (int i = head[u]; i; i = e[i].next) {
        int v = e[i].to;
        dfs(v);
        f[u][0] += max(f[v][0], f[v][1]);
        f[u][1] += f[v][0];
    }
}`,
    problems: ['P8625', 'P3047', 'P8935', 'P2014', 'P1273']
  },
  {
    id: 'tpl-bitmask-dp', cat: '动态规划', name: '状压DP（TSP）', diff: 'S',
    desc: '用二进制表示状态，适用于小规模集合问题。',
    code: `// TSP 旅行商问题
int f[1<<MAXN][MAXN];
// f[S][i] = 已访问集合S，当前在i的最短路径
memset(f, 0x3f, sizeof f);
f[1][0] = 0; // 从0出发
for (int S = 1; S < (1<<n); S++)
    for (int i = 0; i < n; i++) {
        if (!(S >> i & 1)) continue;
        for (int j = 0; j < n; j++) {
            if (S >> j & 1) continue;
            f[S | (1<<j)][j] = min(f[S | (1<<j)][j], f[S][i] + dist[i][j]);
        }
    }`,
    problems: ['P7859', 'P8687', 'P3052', 'P2704']
  },
  {
    id: 'tpl-monoqueue-dp', cat: '动态规划', name: '单调队列优化DP', diff: 'S',
    desc: '利用单调队列将DP转移从O(n)优化到O(1)。',
    code: `// 滑动窗口最大值
deque<int> dq; // 存下标
for (int i = 1; i <= n; i++) {
    while (!dq.empty() && a[dq.back()] <= a[i]) dq.pop_back();
    dq.push_back(i);
    while (!dq.empty() && dq.front() <= i - k) dq.pop_front();
    if (i >= k) // 窗口最大值 = a[dq.front()];
}

// 单调队列优化DP: f[i] = min(f[j]) + cost, j in [i-k, i-1]
deque<int> dq;
for (int i = 1; i <= n; i++) {
    while (!dq.empty() && f[dq.back()] >= f[i-1]) dq.pop_back();
    dq.push_back(i-1);
    while (!dq.empty() && dq.front() < i - k) dq.pop_front();
    f[i] = f[dq.front()] + cost[i];
}`,
    problems: ['P1886', 'P1725', 'P2627', 'P3522']
  },

  /* ==================== 数学 ==================== */
  {
    id: 'tpl-qpow', cat: '数学', name: '快速幂（含矩阵快速幂）', diff: 'S',
    desc: 'O(log n)计算幂，常配合取模运算。',
    code: `long long qpow(long long a, long long b, long long mod) {
    long long res = 1; a %= mod;
    while (b > 0) {
        if (b & 1) res = res * a % mod;
        a = a * a % mod; b >>= 1;
    }
    return res;
}

// 矩阵快速幂
struct Matrix { long long m[2][2]; };
Matrix mul(Matrix a, Matrix b, long long mod) {
    Matrix c = {};
    for (int i = 0; i < 2; i++)
        for (int j = 0; j < 2; j++)
            for (int k = 0; k < 2; k++)
                c.m[i][j] = (c.m[i][j] + a.m[i][k] * b.m[k][j]) % mod;
    return c;
}
Matrix matPow(Matrix a, long long b, long long mod) {
    Matrix res = {{{1,0},{0,1}}};
    while (b > 0) {
        if (b & 1) res = mul(res, a, mod);
        a = mul(a, a, mod); b >>= 1;
    }
    return res;
}`,
    problems: ['P1226', 'P3390', 'P1939', 'P1306']
  },
  {
    id: 'tpl-gcd', cat: '数学', name: 'GCD/LCM/扩展欧几里得', diff: 'J',
    desc: '辗转相除法求最大公约数，扩展欧几里得求逆元。',
    code: `long long gcd(long long a, long long b) {
    return b ? gcd(b, a % b) : a;
}
long long lcm(long long a, long long b) {
    return a / gcd(a, b) * b;
}

// 扩展欧几里得: ax + by = gcd(a,b)
long long exgcd(long long a, long long b, long long &x, long long &y) {
    if (!b) { x = 1; y = 0; return a; }
    long long d = exgcd(b, a % b, y, x);
    y -= a / b * x;
    return d;
}`,
    problems: []
  },
  {
    id: 'tpl-prime-sieve', cat: '数学', name: '素数筛（欧拉筛+分解质因数）', diff: 'J',
    desc: '埃氏筛和欧拉筛（线性筛），求素数表。',
    code: `// 欧拉筛 (线性筛)
bool vis[MAXN];
int primes[MAXN], cnt = 0;
void eulerSieve(int n) {
    for (int i = 2; i <= n; i++) {
        if (!vis[i]) primes[++cnt] = i;
        for (int j = 1; j <= cnt && i * primes[j] <= n; j++) {
            vis[i * primes[j]] = true;
            if (i % primes[j] == 0) break;
        }
    }
}

// 分解质因数
void factorize(int x) {
    for (int i = 2; i * i <= x; i++) {
        if (x % i == 0) {
            int cnt = 0;
            while (x % i == 0) { x /= i; cnt++; }
            // i 是质因子，cnt 是指数
        }
    }
    if (x > 1) { /* x 是质因子 */ }
}`,
    problems: []
  },
  {
    id: 'tpl-comb', cat: '数学', name: '组合数学（杨辉三角+逆元）', diff: 'S',
    desc: '排列组合、杨辉三角、用逆元求组合数。',
    code: `// 杨辉三角求组合数
int comb[MAXN][MAXN];
void initComb() {
    for (int i = 0; i < MAXN; i++) {
        comb[i][0] = 1;
        for (int j = 1; j <= i; j++)
            comb[i][j] = (comb[i-1][j-1] + comb[i-1][j]) % MOD;
    }
}

// 逆元求组合数 (MOD为质数)
long long fac[MAXN], inv[MAXN];
void initFac() {
    fac[0] = 1;
    for (int i = 1; i < MAXN; i++) fac[i] = fac[i-1] * i % MOD;
    inv[MAXN-1] = qpow(fac[MAXN-1], MOD-2, MOD);
    for (int i = MAXN-2; i >= 0; i--) inv[i] = inv[i+1] * (i+1) % MOD;
}
long long C(int n, int m) {
    return fac[n] * inv[m] % MOD * inv[n-m] % MOD;
}`,
    problems: []
  },

  /* ==================== 字符串 ==================== */
  {
    id: 'tpl-kmp', cat: '字符串', name: 'KMP', diff: 'S',
    desc: '线性时间字符串匹配，利用next数组避免回溯。',
    code: `int nxt[MAXN]; // next数组
void getNext(const char* p) {
    int m = strlen(p);
    nxt[0] = -1;
    int j = -1;
    for (int i = 1; i < m; i++) {
        while (j >= 0 && p[j+1] != p[i]) j = nxt[j];
        if (p[j+1] == p[i]) j++;
        nxt[i] = j;
    }
}
int kmp(const char* s, const char* p) {
    getNext(p);
    int n = strlen(s), m = strlen(p);
    int j = -1;
    for (int i = 0; i < n; i++) {
        while (j >= 0 && p[j+1] != s[i]) j = nxt[j];
        if (p[j+1] == s[i]) j++;
        if (j == m - 1) return i - m + 1; // 匹配位置
    }
    return -1;
}`,
    problems: ['P3375', 'P4391', 'P4824']
  },
  {
    id: 'tpl-strhash', cat: '字符串', name: '字符串哈希', diff: 'S',
    desc: '将字符串映射为数值，快速比较子串是否相等。',
    code: `typedef unsigned long long ull;
const ull BASE = 131;
ull h[MAXN], pw[MAXN];

void initHash(const char* s) {
    int n = strlen(s + 1);
    pw[0] = 1;
    for (int i = 1; i <= n; i++) {
        h[i] = h[i-1] * BASE + s[i];
        pw[i] = pw[i-1] * BASE;
    }
}
// 子串 s[l..r] 的哈希值
ull getHash(int l, int r) {
    return h[r] - h[l-1] * pw[r-l+1];
}`,
    problems: ['P3370', 'P1043', 'P4503']
  },

  /* ==================== 数据结构 ==================== */
  {
    id: 'tpl-st', cat: '数据结构', name: 'ST表（RMQ）', diff: 'S',
    desc: 'O(1)查询区间最值，不支持修改。',
    code: `int st[MAXN][21];
int lg2(int x) { return x ? __lg(x) : -1; }

void build() {
    for (int j = 1; j <= 20; j++)
        for (int i = 1; i + (1<<j) - 1 <= n; i++)
            st[i][j] = max(st[i][j-1], st[i+(1<<(j-1))][j-1]);
}
int query(int l, int r) {
    int k = lg2(r - l + 1);
    return max(st[l][k], st[r-(1<<k)+1][k]);
}`,
    problems: ['P3865', 'P2880', 'P2048']
  },
  {
    id: 'tpl-monostack', cat: '数据结构', name: '单调栈', diff: 'S',
    desc: '维护单调性的栈，求下一个更大/更小元素。',
    code: `// 求每个元素右边第一个比它大的元素
stack<int> stk;
int a[MAXN], ans[MAXN];
for (int i = n; i >= 1; i--) {
    while (!stk.empty() && a[stk.top()] <= a[i]) stk.pop();
    ans[i] = stk.empty() ? 0 : stk.top();
    stk.push(i);
}`,
    problems: ['P5788', 'P2422', 'P1901']
  },
  {
    id: 'tpl-heap', cat: '数据结构', name: '优先队列/对顶堆', diff: 'S',
    desc: '大根堆、小根堆、对顶堆求动态中位数。',
    code: `// 大根堆
priority_queue<int> maxHeap;
// 小根堆
priority_queue<int, vector<int>, greater<int>> minHeap;

// 对顶堆 - 动态中位数
priority_queue<int> leftHeap;  // 左半部分，大根堆
priority_queue<int, vector<int>, greater<int>> rightHeap; // 右半部分，小根堆

void addNum(int x) {
    if (leftHeap.empty() || x <= leftHeap.top()) leftHeap.push(x);
    else rightHeap.push(x);
    // 平衡：左堆大小 = 右堆大小 或 右堆大小+1
    if (leftHeap.size() > rightHeap.size() + 1) {
        rightHeap.push(leftHeap.top()); leftHeap.pop();
    } else if (rightHeap.size() > leftHeap.size()) {
        leftHeap.push(rightHeap.top()); rightHeap.pop();
    }
}
int getMedian() { return leftHeap.top(); }`,
    problems: ['P1090', 'P1168', 'P1801', 'P2048']
  },

  /* ==================== 考试模板 ==================== */
  {
    id: 'tpl-skeleton', cat: '考试模板', name: '万能头文件+主函数模板', diff: 'J',
    desc: 'CSP-S考试必备的代码骨架，包含freopen和快读。',
    code: `#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
const int MAXN = 100005;
const int MOD = 1e9 + 7;
const int INF = 0x3f3f3f3f;

int main() {
    freopen("xxx.in", "r", stdin);
    freopen("xxx.out", "w", stdout);
    ios::sync_with_stdio(false);
    cin.tie(0);
    // ...
    return 0;
}`,
    problems: []
  },
  {
    id: 'tpl-datagen', cat: '考试模板', name: '对拍数据生成器', diff: 'S',
    desc: '生成随机数据用于对拍验证。',
    code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    srand(time(0));
    int n = rand() % 100 + 1;
    printf("%d\\n", n);
    for (int i = 1; i <= n; i++)
        printf("%d ", rand() % 1000);
    return 0;
}`,
    problems: []
  },

  /* ==================== 补充模板 ==================== */
  {
    id: 'tpl-spfa', cat: '图论', name: 'SPFA（含负环检测）', diff: 'S',
    desc: '处理负权边最短路，可检测负环。注意SPFA容易被卡，慎用。',
    code: `int dist[MAXN], cnt[MAXN]; bool inQ[MAXN];
queue<int> q;

bool spfa(int s) {
    memset(dist, 0x3f, sizeof dist);
    memset(cnt, 0, sizeof cnt);
    memset(inQ, 0, sizeof inQ);
    dist[s] = 0; q.push(s); inQ[s] = true;
    while (!q.empty()) {
        int u = q.front(); q.pop(); inQ[u] = false;
        for (int i = head[u]; i; i = e[i].next) {
            int v = e[i].to;
            if (dist[v] > dist[u] + e[i].w) {
                dist[v] = dist[u] + e[i].w;
                cnt[v] = cnt[u] + 1;
                if (cnt[v] >= n) return false; // 负环
                if (!inQ[v]) { q.push(v); inQ[v] = true; }
            }
        }
    }
    return true;
}`,
    problems: ['P3385', 'P1993', 'P1938']
  },
  {
    id: 'tpl-digit-dp', cat: '动态规划', name: '数位DP', diff: 'S',
    desc: '统计区间内满足条件的数的个数，逐位枚举+记忆化。',
    code: `int a[20], dp[20][STATE]; // STATE根据题意定义
int dfs(int pos, int state, bool limit, bool lead) {
    if (pos == 0) return /* 满足条件的返回值 */;
    if (!limit && !lead && dp[pos][state] != -1) return dp[pos][state];
    int up = limit ? a[pos] : 9;
    int res = 0;
    for (int d = 0; d <= up; d++) {
        // 前导零处理
        bool nlead = lead && (d == 0);
        bool nlimit = limit && (d == up);
        int nstate = /* 更新状态 */;
        res += dfs(pos - 1, nstate, nlimit, nlead);
    }
    if (!limit && !lead) dp[pos][state] = res;
    return res;
}

int solve(long long x) {
    int len = 0;
    while (x) { a[++len] = x % 10; x /= 10; }
    memset(dp, -1, sizeof dp);
    return dfs(len, 0, true, true);
}
// 答案 = solve(r) - solve(l - 1)`,
    problems: ['P2602', 'P4124', 'P3413', 'P6218']
  },
  {
    id: 'tpl-moalgo', cat: '数据结构', name: '莫队算法', diff: 'S',
    desc: '离线处理区间查询，通过排序+双指针优化复杂度到O(n√n)。',
    code: `int block; // block = sqrt(n)
struct Query { int l, r, id; } qs[MAXN];

bool cmp(Query a, Query b) {
    if (a.l / block != b.l / block) return a.l < b.l;
    return (a.l / block & 1) ? a.r < b.r : a.r > b.r; // 奇偶优化
}

int cnt[MAXN], ans[MAXN], curAns;

void add(int x) { /* 加入元素x，更新curAns */ }
void del(int x) { /* 删除元素x，更新curAns */ }

void moSolve() {
    block = sqrt(n);
    sort(qs + 1, qs + m + 1, cmp);
    int l = 1, r = 0;
    for (int i = 1; i <= m; i++) {
        while (l > qs[i].l) add(a[--l]);
        while (r < qs[i].r) add(a[++r]);
        while (l < qs[i].l) del(a[l++]);
        while (r > qs[i].r) del(a[r--]);
        ans[qs[i].id] = curAns;
    }
}`,
    problems: ['P1494', 'P2709', 'P3901', 'P5268']
  },
  {
    id: 'tpl-block', cat: '数据结构', name: '分块', diff: 'S',
    desc: '将序列分成√n块，块内暴力/块间标记，平衡修改与查询。',
    code: `int block, num, L[MAXN], R[MAXN], belong[MAXN];
long long a[MAXN], tag[MAXN], sum[MAXN];

void build() {
    block = sqrt(n); num = (n + block - 1) / block;
    for (int i = 1; i <= num; i++) {
        L[i] = (i - 1) * block + 1;
        R[i] = min(i * block, n);
    }
    for (int i = 1; i <= n; i++) belong[i] = (i - 1) / block + 1;
    for (int i = 1; i <= num; i++)
        for (int j = L[i]; j <= R[i]; j++) sum[i] += a[j];
}

void update(int l, int r, long long v) {
    int bl = belong[l], br = belong[r];
    if (bl == br) {
        for (int i = l; i <= r; i++) { a[i] += v; sum[bl] += v; }
        return;
    }
    for (int i = l; i <= R[bl]; i++) { a[i] += v; sum[bl] += v; }
    for (int i = L[br]; i <= r; i++) { a[i] += v; sum[br] += v; }
    for (int i = bl + 1; i <= br - 1; i++) { tag[i] += v; sum[i] += v * (R[i] - L[i] + 1); }
}

long long query(int l, int r) {
    int bl = belong[l], br = belong[r];
    long long res = 0;
    if (bl == br) {
        for (int i = l; i <= r; i++) res += a[i] + tag[bl];
        return res;
    }
    for (int i = l; i <= R[bl]; i++) res += a[i] + tag[bl];
    for (int i = L[br]; i <= r; i++) res += a[i] + tag[br];
    for (int i = bl + 1; i <= br - 1; i++) res += sum[i];
    return res;
}`,
    problems: ['P2801', 'P3372', 'P5046', 'P4145']
  },
  {
    id: 'tpl-acauto', cat: '字符串', name: 'AC自动机', diff: 'S',
    desc: '多模式串匹配，Trie+KMP的fail指针，常配合DP使用。',
    code: `int ch[MAXN][26], fail[MAXN], cnt = 0;
bool isEnd[MAXN];

void insert(const char* s) {
    int u = 0;
    for (; *s; s++) {
        int c = *s - 'a';
        if (!ch[u][c]) ch[u][c] = ++cnt;
        u = ch[u][c];
    }
    isEnd[u] = true;
}

void buildFail() {
    queue<int> q;
    for (int c = 0; c < 26; c++)
        if (ch[0][c]) q.push(ch[0][c]);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int c = 0; c < 26; c++) {
            if (ch[u][c]) {
                fail[ch[u][c]] = ch[fail[u]][c];
                isEnd[ch[u][c]] |= isEnd[fail[ch[u][c]]];
                q.push(ch[u][c]);
            } else {
                ch[u][c] = ch[fail[u]][c];
            }
        }
    }
}

// 在文本s中查找所有模式串出现
void query(const char* s) {
    int u = 0;
    for (; *s; s++) {
        u = ch[u][*s - 'a'];
        if (isEnd[u]) { /* 匹配到某个模式串 */ }
    }
}`,
    problems: ['P3808', 'P3796', 'P5357', 'P2444']
  },
  {
    id: 'tpl-tree-diff', cat: '树论', name: '树上差分', diff: 'S',
    desc: '在树上对路径进行加减操作，利用LCA和差分思想。',
    code: `// 路径 u->v 加1: d[u]++, d[v]++, d[lca]--, d[fa[lca]]--
// 子树和 = dfs后子树内所有d的和

int d[MAXN]; // 差分数组

void pathAdd(int u, int v, int lca) {
    d[u]++; d[v]++;
    d[lca]--; d[fa[lca][0]]--;
}

// dfs求子树和还原
int sum[MAXN];
void dfsSum(int u, int f) {
    sum[u] = d[u];
    for (int i = head[u]; i; i = e[i].next) {
        int v = e[i].to; if (v == f) continue;
        dfsSum(v, u);
        sum[u] += sum[v];
    }
}`,
    problems: ['P3128', 'P8805', 'P9142']
  }
  ];

  // 按分类组织
  window.CSP.templateCats = ['基础算法', '图论', '树论', '动态规划', '数学', '字符串', '数据结构', '考试模板'];
})();
