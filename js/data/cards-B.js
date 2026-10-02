/* ============================================================================
 * CSP-S 2026 第二轮 · 知识卡（图论 + 动态规划）  cards-B.js
 * ----------------------------------------------------------------------------
 * 覆盖 syllabus.js 中 cat 为「图论」「动态规划」的全部 25 个 id。
 * 字段格式见 docs/CONTENT-SCHEMA.md 第六节。
 * ==========================================================================*/
(function () {
  'use strict';
  window.CSP = window.CSP || {};
  window.CSP.cards = window.CSP.cards || {};

  /* ========================================================================
   *                              图  论
   * ======================================================================*/

  window.CSP.cards['graph.store'] = {
    definition: '把图的点与边的连接关系存进数组结构，供遍历和各类图算法调用。',
    keyPoints: [
      '邻接矩阵 g[u][v] 判边 O(1)，适合 n≤1000 的稠密图，空间 O(n²)。',
      '邻接表 vector<pair<int,int>> g[N] 适合稀疏图，空间 O(n+m)，一次遍历总代价 O(n+m)。',
      '链式前向星用 head/nxt/to/w 四个数组加边计数器 ec，head 初始化为 -1，遍历用 for(i=head[u];~i;i=nxt[i])。',
      '无向图每条边要 add(u,v) 与 add(v,u) 各调一次，边数组容量开 2*m。',
      '带权边把权值一起存进边结构；要按边排序时单独存 Edge{u,v,w} 数组。'
    ],
    complexity: '邻接表：空间 O(n+m)，遍历 O(n+m)；邻接矩阵：空间 O(n²)，判边 O(1)',
    pitfalls: [
      '链式前向星的 head 数组必须初始化为 -1，若为 0 会把 0 号边与"无后继"混淆导致死循环。',
      '加边计数器 ec 从 0 还是 1 开始要全程序统一，反向边用 i^1 时下标必须成对。',
      '多组数据时邻接表要 clear()、前向星要重新 memset(head,-1)，否则上次的边残留。'
    ],
    template: [
      'int head[N],nxt[M],to[M],w[M],ec;',
      'void add(int u,int v,int x){',
      '  to[ec]=v; w[ec]=x; nxt[ec]=head[u]; head[u]=ec++;',
      '}',
      '// 初始化：memset(head,-1,sizeof head); ec=0;',
      '// 遍历：for(int i=head[u];~i;i=nxt[i]){ int v=to[i]; }'
    ].join('\n'),
    pattern: '题面出现「n 个点 m 条边」且 m 与 n 同阶甚至远小于 n²，就用邻接表/前向星建图；要 O(1) 判重边或 n≤1000 稠密图才用邻接矩阵。',
    related: []
  };

  window.CSP.cards['graph.dfs'] = {
    definition: '从起点沿一条路走到底再回溯的图遍历，用递归或显式栈实现。',
    keyPoints: [
      '进入节点立刻打 vis 标记，避免无向图在父子边之间来回递归。',
      'DFS 序 dfn 与子树大小 size 让子树变成连续区间 [dfn[u], dfn[u]+size[u]-1]，是线段树维护子树的桥梁。',
      '连通块计数：对每个未访问点各启动一次 DFS。',
      '递归深度最坏为 n，链状图会爆栈，必要时改手写栈迭代或开大系统栈。',
      '回溯时合并信息（如 size[u]+=size[v]）是树形结构统计的通用套路。'
    ],
    complexity: '邻接表下时间 O(n+m)，空间 O(n)（含最坏 O(n) 的递归栈）',
    pitfalls: [
      '忘记标记 vis，无向图会在同一条边上反复递归直到栈溢出。',
      '多测不清空 vis/dfn/size，第二组数据直接算错。',
      '在递归中做了全局修改却没有回溯，污染兄弟分支。'
    ],
    template: [
      'int vis[N],dfn[N],sz[N],timer;',
      'void dfs(int u){',
      '  vis[u]=1; dfn[u]=++timer; sz[u]=1;',
      '  for(int i=head[u];~i;i=nxt[i]){',
      '    int v=to[i]; if(vis[v]) continue;',
      '    dfs(v); sz[u]+=sz[v];',
      '  }',
      '}'
    ].join('\n'),
    pattern: '题面出现「连通块个数」「子树大小/子树和」「能否从某点到达」「需要回溯枚举方案」，优先写 DFS。',
    related: []
  };

  window.CSP.cards['graph.bfs'] = {
    definition: '按距起点层数逐层扩展的遍历，用队列实现，天然求出无权图最短路。',
    keyPoints: [
      '手写数组队列 q[N] 配 head/tail 指针，比 STL queue 常数更小。',
      '入队时就标记 vis/d 数组，若等出队才标记会让同一点重复入队，复杂度退化到 O(nm)。',
      '第一次访问到某点的层数就是它到起点的无权最短路长度。',
      '多源 BFS：把所有源点初始入队且 dist=0，一次 BFS 求出每点到最近源的距离。',
      '0-1 边权图用双端队列（权 0 入队首、权 1 入队尾）做 0-1 BFS。'
    ],
    complexity: '时间 O(n+m)，空间 O(n)',
    pitfalls: [
      '出队时才标记访问，导致同一点被反复入队，稀疏图上超时。',
      'dist 全初始化为 -1 后忘记把源点置 0，或把源点也判成不可达。',
      '边权不全为 1 时仍用普通 BFS，得到的不是最短路。'
    ],
    template: [
      'int q[N],d[N],h=0,t=0;',
      'void bfs(int s){',
      '  memset(d,-1,sizeof d); d[s]=0; q[t++]=s;',
      '  while(h<t){ int u=q[h++];',
      '    for(int i=head[u];~i;i=nxt[i]){ int v=to[i];',
      '      if(d[v]<0){ d[v]=d[u]+1; q[t++]=v; } } }',
      '}'
    ].join('\n'),
    pattern: '题面出现「最少步数」「最短时间」「每步代价相同」「同时从多个起点扩散」，就用 BFS 求无权最短路。',
    related: []
  };

  window.CSP.cards['graph.toposort'] = {
    definition: '给有向无环图排出线性序，使每条边 u→v 中 u 都排在 v 的前面。',
    keyPoints: [
      'Kahn 算法：统计入度 deg[]，把入度 0 的点入队，出队时把邻居入度减 1，减到 0 就入队。',
      '出队计数 cnt 小于 n 说明图中有环，拓扑排序同时就是判环工具。',
      '拓扑序是 DAG 上 DP 的天然阶段顺序，按拓扑序转移即可免去记忆化。',
      '要求字典序最小需把队列换成优先队列，代价是 O((n+m)log n)。',
      'DFS 法求逆拓扑序（出栈序）也可，但判环与最小字典序不如 Kahn 直观。'
    ],
    complexity: '时间 O(n+m)，空间 O(n+m)',
    pitfalls: [
      '不判环，带环图只输出不足 n 个点却被当作合法拓扑序使用。',
      '把普通队列当优先队列用，却期望得到字典序最小的答案。',
      '多测没有重新初始化入度数组，入度被上一次反复减成负数。'
    ],
    template: [
      'int deg[N],q[N],h=0,t=0,cnt=0;',
      'for(int i=1;i<=n;i++) if(!deg[i]) q[t++]=i;',
      'while(h<t){',
      '  int u=q[h++]; cnt++;',
      '  for(int i=head[u];~i;i=nxt[i])',
      '    if(--deg[to[i]]==0) q[t++]=to[i];',
      '}',
      '// cnt<n 说明存在环'
    ].join('\n'),
    pattern: '题面出现「先后顺序」「任务依赖」「A 必须在 B 之前完成」「判断是否成环」，立刻想到拓扑排序。',
    related: []
  };

  window.CSP.cards['graph.shortest'] = {
    definition: '求两点间边权和最小的路径，按边权性质选 Dijkstra、SPFA/Bellman-Ford 或 Floyd。',
    keyPoints: [
      'Dijkstra 用优先队列贪心，只适用于非负边权：它假定已出堆点的距离不会再被改小。',
      '有负权边时该假定失效，必须改用 Bellman-Ford/SPFA；有负环则最短路不存在。',
      'Floyd 三重循环中 k 必须是最外层（枚举中转点），O(n³) 适合 n≤400，还能顺带求传递闭包。',
      '分层图最短路：把「点 × 状态」建成虚拟点，用最短路求解带限制的路径问题。',
      'SPFA 用队列松弛，平均 O(km)，出题人可构造网格图卡到 O(nm)。'
    ],
    complexity: 'Dijkstra 堆优化 O((n+m)log n)；SPFA 平均 O(km)、最坏 O(nm)；Floyd O(n³)，空间 O(n²)',
    pitfalls: [
      '存在负权边却用 Dijkstra，答案偏大且不易察觉。',
      'priority_queue 默认大根堆，需写成 greater<pair<ll,int>> 或存负距离。',
      'dist 用 int 存不下累加边权（开 long long），且 INF 设得太大相加溢出变负数。',
      '堆中同点旧记录不判 if(d>dist[u]) continue，会重复松弛浪费大量时间。'
    ],
    template: [
      'priority_queue<pair<ll,int>,vector<pair<ll,int>>,greater<>> pq;',
      'dist[s]=0; pq.push({0,s});',
      'while(!pq.empty()){',
      '  auto [d,u]=pq.top(); pq.pop();',
      '  if(d>dist[u]) continue;',
      '  for(int i=head[u];~i;i=nxt[i]){ int v=to[i]; ll nd=d+w[i];',
      '    if(nd<dist[v]){ dist[v]=nd; pq.push({nd,v}); } }',
      '}'
    ].join('\n'),
    pattern: '题面出现「最少花费」「最短路径」「边权非负」用 Dijkstra；有负权用 SPFA/Bellman-Ford；n≤400 且多组查询用 Floyd。',
    related: []
  };

  window.CSP.cards['graph.mst'] = {
    definition: '在连通无向图中选 n-1 条边使总权最小且不成环，即最小生成树。',
    keyPoints: [
      'Kruskal：把所有边按权升序排序，用并查集判断两端是否已连通，能合并就加入，凑满 n-1 条停止。',
      '并查集配合路径压缩与按 rank 合并，单次判断接近 O(α(n))，总复杂度由排序主导。',
      'Prim 朴素 O(n²) 适合稠密图，堆优化 O(m log n) 适合稀疏图。',
      '最小生成树上的最大边即最小瓶颈路：任意两点间使最大边最小的路径一定在 MST 上。',
      '若有 k 个连通块则得到最小生成森林，边数为 n-k。'
    ],
    complexity: 'Kruskal 时间 O(m log m)、空间 O(n+m)；Prim 朴素 O(n²)，堆优化 O(m log n)',
    pitfalls: [
      '并查集忘记初始化 fa[i]=i，或 find 未做路径压缩导致超时。',
      '图不连通时只加了不到 n-1 条边，却直接输出总和而不判无解。',
      '排序比较函数写成降序或漏掉重边，影响正确答案。'
    ],
    template: [
      'sort(e,e+m,[](const Edge&a,const Edge&b){return a.w<b.w;});',
      'for(int i=1;i<=n;i++) fa[i]=i;',
      'long long ans=0; int cnt=0;',
      'for(int i=0;i<m&&cnt<n-1;i++){',
      '  int a=find(e[i].u),b=find(e[i].v);',
      '  if(a!=b){ fa[a]=b; ans+=e[i].w; cnt++; }',
      '}',
      '// cnt<n-1 说明图不连通'
    ].join('\n'),
    pattern: '题面出现「用最少代价把所有点连通」「铺设最短线路」「n 个点 n-1 条边」，就用最小生成树。',
    related: []
  };

  window.CSP.cards['graph.bipartite'] = {
    definition: '能把点集分成两部使每条边都跨部的图；等价于图中不含奇环。',
    keyPoints: [
      '黑白染色：BFS/DFS 给邻居染相反颜色，一旦出现邻里同色即非二分图。',
      '判奇环也可用带权并查集维护到根的奇偶性，或判断 DFS 遇到的非树边两端层数奇偶。',
      '二分图最大匹配用匈牙利算法：对左部每个点尝试找增广路。',
      '匈牙利中 vis 标记本次增广访问过的右部点，每轮增广前必须清空，而 match 数组是长期匹配不能清。',
      'KM 算法/Hopcroft-Karp 可分别处理带权匹配与 O(E√V) 的最大匹配。'
    ],
    complexity: '二分图判定 O(n+m)；匈牙利最大匹配 O(V·E)（实际远小于上界）',
    pitfalls: [
      '匈牙利忘记每轮清空 vis，增广路找不到导致匹配数偏少。',
      '只枚举了有边的单侧点做匹配，应遍历左部全部点。',
      '图不连通时只染色了起点所在连通块，漏判其余分量的奇环。'
    ],
    template: [
      'bool dfs(int u){',
      '  for(int v:g[u]){ if(vis[v]) continue; vis[v]=1;',
      '    if(!mt[v]||dfs(mt[v])){ mt[v]=u; return true; } }',
      '  return false;',
      '}',
      '// 主循环：for(i=1..n){ memset(vis,0,sizeof vis); ans+=dfs(i); }'
    ].join('\n'),
    pattern: '题面出现「分成两组」「互不冲突地配对」「一条边两端只能选一个」，就考虑二分图判定或匹配。',
    related: []
  };

  window.CSP.cards['graph.scc'] = {
    definition: '有向图中极大的强连通子图；Tarjan 用 dfn/low 一次 DFS 求出并可缩点成 DAG。',
    keyPoints: [
      'dfn 是访问时间戳，low[u] 是 u 及其子树能回溯到的最小 dfn。',
      '用栈保存尚未确定分量的点，当 low[u]==dfn[u] 时把栈顶到 u 一起弹出，它们构成一个强连通分量。',
      '缩点：把每个 SCC 当新点，重边去重后得到 DAG，之后可拓扑排序或 DAG-DP。',
      '割点判据 low[v]>=dfn[u]（根需有至少两个儿子），桥判据 low[v]>dfn[u]。',
      '更新 low[u] 时，对已在栈中的点用 dfn[v]，对已出栈的横叉边忽略。'
    ],
    complexity: '时间 O(n+m)，空间 O(n+m)',
    pitfalls: [
      '更新 low 对已访问点错用 low[v]（可能已被其他分量更新），应只在 v 仍在栈中时用 dfn[v]。',
      'dfn/low/栈/ins 数组多测未清空，或 tarjan 递归未覆盖所有点。',
      '缩点后未去重边，入度/出度统计偏大影响后续 DP。'
    ],
    template: [
      'void tarjan(int u){',
      '  dfn[u]=low[u]=++idx; st[++top]=u; ins[u]=1;',
      '  for(int v:g[u]){',
      '    if(!dfn[v]){ tarjan(v); low[u]=min(low[u],low[v]); }',
      '    else if(ins[v]) low[u]=min(low[u],dfn[v]);',
      '  }',
      '  if(low[u]==dfn[u]){ ++scc; int v;',
      '    do{ v=st[top--]; ins[v]=0; sccno[v]=scc; }while(v!=u); }',
      '}'
    ].join('\n'),
    pattern: '题面出现「互相可达」「能走回来」「环形依赖」「缩点后最值」，就用 Tarjan 求强连通分量。',
    related: []
  };

  window.CSP.cards['graph.dagdp'] = {
    definition: '在 DAG 上按拓扑序推进状态，用 DP 求最长路、路径方案数等无后效性最值。',
    keyPoints: [
      '先拓扑排序得到阶段顺序，再沿边把 dp[u] 转移到 dp[v]，天然无后效性。',
      '最长路：dp[v]=max(dp[v],dp[u]+w)；计数：dp[v]+=dp[u] 并取模。',
      '也可用记忆化搜索逆推，代码更短但递归深度大时有栈风险。',
      '图中存在环时必须先 Tarjan 缩点，否则状态在环上互相依赖无法收敛。',
      '起点不唯一时把所有入度 0 的点 dp 初始化为 0（或题设基础值）。'
    ],
    complexity: '时间 O(n+m)，空间 O(n+m)',
    pitfalls: [
      '不判环直接在一般有向图上跑，环上的转移会得到错误结果。',
      'dp 的初值与转移方向没对齐：求最长路要初始化为 -INF，求最短路要初始化为 INF。',
      '方案计数忘记取模或在中途就该取模，导致溢出。'
    ],
    template: [
      'for(int i=0;i<n;i++){',
      '  int u=q[i];',
      '  for(int j=head[u];~j;j=nxt[j]){',
      '    int v=to[j];',
      '    if(dp[u]+w[j]>dp[v]) dp[v]=dp[u]+w[j];',
      '  }',
      '}',
      '// q[] 为拓扑序，dp 初始 -INF，入度为 0 的点置 0'
    ].join('\n'),
    pattern: '题面出现「DAG 上最长/最短路」「路径条数」「依赖关系上的最值」，就在拓扑序上做 DP。',
    related: []
  };

  window.CSP.cards['graph.lca'] = {
    definition: '树上两点的最近公共祖先，倍增法用 fa[k][u] 一次跳 2^k 层定位。',
    keyPoints: [
      '预处理 fa[0][u]=父节点、dep[u]；递推 fa[k][u]=fa[k-1][fa[k-1][u]]，只需求到 LOG=⌈log2 n⌉。',
      '查询：先把较深的点用二进制差值跳到同深度，再从大到小同时上跳，相遇后返回父节点。',
      '两点距离 = dep[u]+dep[v]-2*dep[lca(u,v)]；树上路径计数几乎都以此为基础。',
      '常数更小的替代方案：Euler 序 + ST 表 O(1) 查询，或树链剖分求 LCA。',
      '根的 fa[k][root] 指向自己或 0，配合 dep 判断即可安全跳。'
    ],
    complexity: '预处理 O(n log n)，单次查询 O(log n)，空间 O(n log n)',
    pitfalls: [
      '倍增预处理内外层顺序写反（必须先枚举 k 再枚举 u），用到未计算的 fa[k-1]。',
      '跳同深度时忘记 dep 判断，导致越过根节点或跳到 0 号点。',
      '深度差应按位枚举 k 而不是无脑循环，否则边界处理容易出错。'
    ],
    template: [
      'int lca(int u,int v){',
      '  if(dep[u]<dep[v]) swap(u,v);',
      '  for(int k=LOG;k>=0;k--) if(dep[fa[k][u]]>=dep[v]) u=fa[k][u];',
      '  if(u==v) return u;',
      '  for(int k=LOG;k>=0;k--) if(fa[k][u]!=fa[k][v]) u=fa[k][u],v=fa[k][v];',
      '  return fa[0][u];',
      '}'
    ].join('\n'),
    pattern: '题面出现「树上两点的最近公共祖先」「树上路径长度」「路径上修改/查询」，先预处理倍增 LCA。',
    related: []
  };

  window.CSP.cards['graph.treediff'] = {
    definition: '把树上路径的批量加减转化为几个点上的差分，最后一遍后序 DFS 求和还原。',
    keyPoints: [
      '点差分：路径 u-v 整体 +w，则 d[u]+=w, d[v]+=w, d[lca]-=w, d[fa[lca]]-=w。',
      '边差分：路径上每条边 +w，则 d[u]+=w, d[v]+=w, d[lca]-=2w，最后把 d[v] 下放到边 (fa[v],v)。',
      '还原：后序 DFS 把 d[v] 累加到 d[u]，得到的 d[u] 就是 u 处的真实覆盖值。',
      '配合倍增 LCA，处理 m 条路径的总复杂度 O((n+m)log n)。',
      '常见用途：统计每条边被多少条路径覆盖、每个点被多少条路径经过。'
    ],
    complexity: '时间 O((n+m)log n)（含 LCA），空间 O(n log n)',
    pitfalls: [
      '点差分与边差分的修正项不同（-w 与 -2w），混用结果必然错。',
      '边差分统计时把根节点的值也算进去，但根没有父边。',
      'lca 恰好等于 u 或 v 时公式退化，需要给根设置虚拟 0 号父亲并判空。'
    ],
    template: [
      '// 点差分：路径 u-v 各点 +1',
      'int l=lca(u,v);',
      'd[u]++; d[v]++; d[l]--; if(fa[0][l]) d[fa[0][l]]--;',
      '',
      '// 后序还原',
      'void dfs(int u,int p){',
      '  for(int v:g[u]) if(v!=p){ dfs(v,u); d[u]+=d[v]; }',
      '}'
    ].join('\n'),
    pattern: '题面出现「若干条路径，最后统计每个点/每条边被经过几次」，就用树上差分。',
    related: []
  };

  window.CSP.cards['graph.diameter'] = {
    definition: '树的直径是最远两点间的距离；两遍 DFS 或树形 DP 求得，重心使最大子树最小。',
    keyPoints: [
      '两遍 DFS：从任意点找最远点 A，再从 A 找最远点 B，dist(A,B) 即直径（要求边权非负）。',
      '树形 DP：对每个点取向下最长链 d1 与次长链 d2，ans=max(ans,d1+d2)，可同时处理负权。',
      '直径的中点（一个或两个）属于树的重心；求重心是使 max(最大子树, n-子树) 最小的点。',
      '树上任意点到最远点的路径端点必是直径的两端之一。',
      '直径可作树上路径问题的枢纽：所有直径交于一点或一条路径。'
    ],
    complexity: 'O(n) 时间，O(n) 空间（两遍 DFS 与树形 DP 均线性）',
    pitfalls: [
      '边权可为负时两遍 DFS 的贪心不成立，必须改用树形 DP。',
      '第二次 DFS 前忘记清空 dist/vis，把上一次的距离带进来。',
      '求次长链时取了与最长链同一个儿子的值，导致 d1+d2 重复计算一条边。'
    ],
    template: [
      'void dfs(int u,int p){',
      '  for(auto [v,w]:g[u]) if(v!=p){',
      '    dfs(v,u);',
      '    if(d1[v]+w>d1[u]){ d2[u]=d1[u]; d1[u]=d1[v]+w; }',
      '    else if(d1[v]+w>d2[u]) d2[u]=d1[v]+w;',
      '  }',
      '  ans=max(ans,d1[u]+d2[u]);',
      '}'
    ].join('\n'),
    pattern: '题面出现「树上最远的两点」「最长路径」「最小的最大子树」，就是树的直径或重心。',
    related: []
  };

  window.CSP.cards['graph.hld'] = {
    definition: '树链剖分把树拆成若干重链并按 DFS 序映射到线段树，以维护路径与子树信息。',
    keyPoints: [
      '两遍 DFS：第一遍求 size 与重儿子（size 最大的儿子），第二遍优先进入重儿子分配 dfn。',
      '剖分后同一条重链上的 dfn 连续，可直接交给线段树做区间操作。',
      '路径操作：top 不同就让 top 较深的链整段处理并上跳，直到同链再做区间操作。',
      '子树操作：子树恰好是区间 [dfn[u], dfn[u]+size[u]-1]。',
      '维护边权时把边权下放到深度较大的端点，转为点权问题。'
    ],
    complexity: '预处理 O(n)，单次路径操作 O(log² n)，单次子树操作 O(log n)，空间 O(n)',
    pitfalls: [
      '第二遍 DFS 未优先走重儿子，导致重链 dfn 不连续、方案完全错误。',
      '跳链时比较 dep[top[u]] 而不是 dep[u]，或先跳后查写反了顺序。',
      '线段树下标混用原编号与 dfn 值，导致更新位置错乱。'
    ],
    template: [
      'void pathQuery(int u,int v){',
      '  while(top[u]!=top[v]){',
      '    if(dep[top[u]]<dep[top[v]]) swap(u,v);',
      '    seg.query(dfn[top[u]],dfn[u]);',
      '    u=fa[top[u]];',
      '  }',
      '  if(dep[u]>dep[v]) swap(u,v);',
      '  seg.query(dfn[u],dfn[v]);',
      '}'
    ].join('\n'),
    pattern: '题面出现「树上路径加/求和」「子树修改」「路径第 k 大」且 n 达 1e5，就是树链剖分加线段树。',
    related: []
  };

  window.CSP.cards['graph.netflow'] = {
    definition: '在带容量的网络上求最大流；Dinic 用分层图加多路增广，最大流等于最小割。',
    keyPoints: [
      '边成对存储：i 为正向边、i^1 为反向边；增广时正向容量减 d、反向容量加 d。',
      'BFS 按残量网络给点标层次 lev，DFS 只沿 lev[v]==lev[u]+1 的边增广，保证效率。',
      '当前弧优化 cur[u]：记录该点已尝试到的边，避免重复扫描无用边。',
      '最大流最小割定理：最小割容量等于最大流；二分图匹配、项目选择等问题可建模为流。',
      'INF 容量要足够大（如 1e18 或所有源出边之和），并配合 long long。'
    ],
    complexity: 'Dinic 一般 O(n²m)，单位容量图 O(m√m)，实际运行远快于理论上界',
    pitfalls: [
      '反向边下标不成对（add 顺序不对）导致 i^1 取到错误的边，流量混乱。',
      '每轮 BFS 后忘记重置 cur 数组，当前弧优化失效甚至漏增广。',
      '容量用 int 存储，大容量题目中增广溢出或 INF 不够大导致答案偏小。'
    ],
    template: [
      'bool bfs(){ memset(lev,-1,sizeof lev); queue<int>q; q.push(s); lev[s]=0;',
      '  while(!q.empty()){ int u=q.front(); q.pop();',
      '    for(int i=head[u];~i;i=nxt[i]) if(cap[i]>0&&lev[to[i]]<0)',
      '      { lev[to[i]]=lev[u]+1; q.push(to[i]); } }',
      '  return lev[t]>=0; }',
      'll dfs(int u,ll f){ if(u==t) return f;',
      '  for(int &i=cur[u];~i;i=nxt[i]) if(cap[i]>0&&lev[to[i]]==lev[u]+1){',
      '    ll d=dfs(to[i],min(f,cap[i])); if(d){cap[i]-=d;cap[i^1]+=d;return d;} }',
      '  return 0; }'
    ].join('\n'),
    pattern: '题面出现「每条管道容量有限，最多能运多少」「最小代价割断所有通路」「带限制的匹配」，就用网络流。',
    related: []
  };

  window.CSP.cards['graph.euler'] = {
    definition: '一笔画问题：经过图中每条边恰好一次的路径，判据是奇度（或出入度差）点数。',
    keyPoints: [
      '无向图欧拉回路：所有点度数为偶且所有非孤立点连通；欧拉路：恰有两个奇度点，它们是起点与终点。',
      '有向图欧拉回路：所有点入度等于出度；欧拉路：恰一点出度=入度+1（起点）、一点入度=出度+1（终点）。',
      'Hierholzer 算法：DFS 走到不能走为止，回溯时把点压入答案，最后逆序输出即为欧拉路径。',
      '无向图要按边打删除标记（used[i]=used[i^1]=1），不能只标记点，否则重边会漏走。',
      '起点选择：有奇度点必须从奇度点出发，全偶则从任意非孤立点出发。'
    ],
    complexity: 'O(n+m) 时间，O(n+m) 空间',
    pitfalls: [
      '只判度数不判连通性，非连通图（多个含边分量）被误判为存在欧拉路。',
      '无向图用点访问标记代替边标记，遇到重边或需要重复经过时出错。',
      '起点随便取，导致存在奇度点时找出的路径不合法。'
    ],
    template: [
      'void dfs(int u){',
      '  for(int &i=cur[u];~i;i=nxt[i]){',
      '    if(used[i]) continue;',
      '    used[i]=used[i^1]=1;',
      '    dfs(to[i]);',
      '  }',
      '  ans[++cnt]=u;',
      '}',
      '// 逆序输出 ans[cnt..1]，起点取奇度点'
    ].join('\n'),
    pattern: '题面出现「一笔画」「每条边恰好走一次」「不重复地走遍所有道路」，就是欧拉路判定加 Hierholzer。',
    related: []
  };

  /* ========================================================================
   *                            动 态 规 划
   * ======================================================================*/

  window.CSP.cards['dp.linear'] = {
    definition: '状态沿序列下标线性推进的 DP，如最大子段和、数字三角形、最长上升子序列。',
    keyPoints: [
      '写 DP 先明确三件事：状态含义、转移方程、边界与非法状态初值。',
      '最大子段和：dp[i]=max(dp[i-1]+a[i], a[i])，可压成一个滚动变量，答案取过程中最大值。',
      '一维只依赖上一行时可滚动数组压空间，但要确认枚举方向不会覆盖还没用到的旧值。',
      '无后效性是前提：若 dp[i] 依赖 dp[j](j>i)，需要重排阶段顺序或改记忆化搜索。',
      '答案是 dp[n] 还是 max{dp[i]} 要按题意区分，多数最值题是后者。'
    ],
    complexity: '时间 O(n) 或 O(n²)（视状态数），空间可由 O(n²) 滚动优化到 O(n)',
    pitfalls: [
      '初值统一写 0，导致负数场景下「什么都不选」被当成合法方案。',
      '滚动数组枚举方向写反，把本行结果覆盖到本行后续计算中。',
      '只输出 dp[n]，但题目要求的是全局最大（如最大子段和可以为负）。'
    ],
    template: [
      '// 最大子段和',
      'long long best=-1e18, cur=0;',
      'for(int i=1;i<=n;i++){',
      '  cur=max(cur+(long long)a[i],(long long)a[i]);',
      '  best=max(best,cur);',
      '}',
      'cout<<best<<endl;'
    ].join('\n'),
    pattern: '题面出现「序列上取一段/选若干个使总和最大」「第 i 个位置的最优值由前面推来」，就是线性 DP。',
    related: []
  };

  window.CSP.cards['dp.knapsack'] = {
    definition: '在容量限制下从物品中选取使价值最大的方案，分 01 背包、完全背包、多重背包三类。',
    keyPoints: [
      '01 背包一维写法：体积 j 从 V 倒序枚举到 v[i]，保证每件物品最多用一次。',
      '完全背包体积正序枚举，等价于允许同一件物品被反复选取。',
      '恰好装满时 dp[0]=0、其余为 -INF；不要求装满则全部初始化为 0。',
      '多重背包用二进制拆分（1,2,4,…,余数）转成 01 背包，复杂度 O(V log n)。',
      '分组背包按组枚举，每组内先枚举体积再枚举组内物品，保证一组只能选一个。'
    ],
    complexity: '时间 O(nV)，空间 O(V)；多重背包二进制拆分后 O(V log n)',
    pitfalls: [
      '01 背包体积写成正序枚举，退化成完全背包使答案偏大。',
      '恰好装满的 -INF 与 0 混淆，非法转移被当作合法方案输出。',
      '用价值做下标、价值很大时数组开不下，应交换状态维度或改搜索。'
    ],
    template: [
      '// 01 背包（倒序）',
      'for(int i=1;i<=n;i++)',
      '  for(int j=V;j>=v[i];j--)',
      '    dp[j]=max(dp[j],dp[j-v[i]]+w[i]);',
      '',
      '// 完全背包把第二行改成 j=v[i]; j<=V; j++',
      '// 恰好装满：dp[0]=0，其余 dp=-INF'
    ].join('\n'),
    pattern: '题面出现「背包容量有限」「每件物品有体积和价值，最多选一次/可重复选」，就是背包模型。',
    related: []
  };

  window.CSP.cards['dp.lis'] = {
    definition: 'LIS 求最长严格上升子序列长度，LCS 求两个串的最长公共子序列长度。',
    keyPoints: [
      'O(n²) LIS：dp[i]=max(dp[j])+1，要求 j<i 且 a[j]<a[i]。',
      'O(n log n) LIS：维护 g[k] 表示长度 k 的上升子序列的最小结尾，用 lower_bound 找到第一个不小于 a[i] 的位置替换。',
      '严格上升用 lower_bound，非降（不下降）用 upper_bound，是本题最容易混的一步。',
      'g 数组本身不是答案子序列，只有它的长度才是 LIS 长度。',
      'LCS：a[i]==b[j] 时 dp[i][j]=dp[i-1][j-1]+1，否则取 max(dp[i-1][j], dp[i][j-1])。'
    ],
    complexity: 'LIS 二分 O(n log n)、朴素 O(n²)；LCS O(nm)，空间可滚动到 O(m)',
    pitfalls: [
      '把二分维护的 g 数组当成最长上升子序列输出，得到的是错误序列。',
      '严格与非严格用错 lower_bound/upper_bound，长度偏大或偏小。',
      'LCS 直接用二维 O(nm) 空间，n,m 上万时 MLE，需要滚动数组或 Hirschberg。'
    ],
    template: [
      '// O(n log n) 严格上升 LIS',
      'int g[N],len=0;',
      'for(int i=1;i<=n;i++){',
      '  int p=lower_bound(g,g+len,a[i])-g;',
      '  g[p]=a[i];',
      '  if(p==len) len++;',
      '}',
      '// len 即答案；非降序列改用 upper_bound'
    ].join('\n'),
    pattern: '题面出现「最长上升/不下降子序列」「最少修改几次变成单调」「两串最长公共部分」，就用 LIS/LCS。',
    related: []
  };

  window.CSP.cards['dp.interval'] = {
    definition: '状态定义在区间 [l,r] 上的 DP，由长度递增递推，枚举断点合并两个子区间。',
    keyPoints: [
      '按区间长度 len 从 2 到 n 枚举，再枚举左端点 l，保证子区间一定先被算过。',
      '合并类（石子合并）：dp[l][r]=min/max(dp[l][k]+dp[k+1][r])，最后加上区间和 sum(l,r)。',
      '环形区间 DP：把数组复制一份接在后面变成 2n 的长度，答案在所有长度为 n 的区间中取。',
      '配对类（括号、删数）转移要判断 a[l] 与 a[r] 能否配对，再决定是否 dp[l][r]=dp[l+1][r-1]+2。',
      '区间 DP 常满足四边形不等式，此时断点单调可用 O(n²) 优化。'
    ],
    complexity: '时间 O(n³)，空间 O(n²)；四边形不等式优化后时间 O(n²)',
    pitfalls: [
      '断点 k 的范围写错（应为 k<r），或长度与左端点的枚举顺序颠倒。',
      'len=1 的基础状态（如单个石子代价 0）未初始化，或非法区间没设 INF。',
      '环形问题没有复制一倍数组，或最后取值时区间端点范围取错。'
    ],
    template: [
      'for(int len=2;len<=n;len++)',
      '  for(int l=1;l+len-1<=n;l++){',
      '    int r=l+len-1; dp[l][r]=INF;',
      '    for(int k=l;k<r;k++)',
      '      dp[l][r]=min(dp[l][r],dp[l][k]+dp[k+1][r]);',
      '    dp[l][r]+=sum[r]-sum[l-1];',
      '  }'
    ].join('\n'),
    pattern: '题面出现「合并相邻两堆」「区间取数/删数」「回文分割」，就是区间 DP。',
    related: []
  };

  window.CSP.cards['dp.tree'] = {
    definition: '在树的子树结构上合并信息的 DP，先递归求出儿子的答案再合并到父节点。',
    keyPoints: [
      '必须后序：先 dfs 到叶子算出儿子的 dp 值，再在父节点做合并，顺序不能反。',
      '经典模型 dp[u][0/1] 表示选或不选 u；若选 u 则儿子必不选，则 f[u][1]+=f[v][0]。',
      '树上背包 dp[u][j] 表示 u 的子树中选 j 个点的最优值，合并时枚举给儿子分配的体积。',
      '合并时用 j<=min(sz[u],V) 与 k<=min(sz[v],V-j) 剪枝，把 O(nV²) 降到 O(nV)。',
      '换根 DP：第一遍求以 1 为根的答案，第二遍沿边把根移动，用父答案减去/加上儿子贡献。'
    ],
    complexity: '普通树形 DP O(n)；树上背包带上界剪枝为 O(nV)，空间 O(nV)',
    pitfalls: [
      '先合并儿子再递归计算，拿到的是未初始化的 dp 值。',
      '树上背包合并循环没有按 sz 剪枝，复杂度退化为 O(nV²) 超时。',
      '父亲与儿子的转移方向写反（例如选父亲的约束施加错对象）。'
    ],
    template: [
      'void dfs(int u,int p){',
      '  f[u][0]=0; f[u][1]=w[u];',
      '  for(int v:g[u]) if(v!=p){',
      '    dfs(v,u);',
      '    f[u][0]+=max(f[v][0],f[v][1]);',
      '    f[u][1]+=f[v][0];',
      '  }',
      '}'
    ].join('\n'),
    pattern: '题面出现「树上选点，选了父亲就不能选儿子」「子树的方案数/最值」「每个子树独立决策」，就是树形 DP。',
    related: []
  };

  window.CSP.cards['dp.bitmask'] = {
    definition: '用二进制位表示集合选取状态的 DP，状态数 2^n，适合 n≤20 的选取或顺序问题。',
    keyPoints: [
      '状态 S 的第 i 位为 1 表示选了元素 i；判断用 (S>>i)&1，置位用 S|(1<<i)。',
      '枚举 S 的所有子集用 for(T=S; T; T=(T-1)&S)，可做到不重不漏。',
      '典型转移：dp[S|(1<<i)]=min(dp[S|(1<<i)], dp[S]+cost(S,i))，先枚举 S 再枚举未选点。',
      '只关心固定元素的题，可先给初值加上该位的掩码再做转移。',
      'TSP 类问题 dp[S][i] 表示已访问集合 S 且当前在 i，答案取 min(dp[FULL][i]+w[i][起点])。'
    ],
    complexity: '时间 O(2^n · n)，空间 O(2^n)（带附加维时为 O(2^n · n)）',
    pitfalls: [
      '不估算 n 就直接写，n>20 时 2^n 时间与空间都爆炸。',
      '枚举子集的技巧写成 T-1 而不是 (T-1)&S，会枚举出非子集状态。',
      'dp 数组未全部初始化为 INF，导致非法状态参与转移。'
    ],
    template: [
      'memset(dp,0x3f,sizeof dp); dp[0]=0;',
      'for(int S=0;S<(1<<n);S++){',
      '  if(dp[S]>INF) continue;',
      '  for(int i=0;i<n;i++) if(!((S>>i)&1))',
      '    dp[S|(1<<i)]=min(dp[S|(1<<i)],dp[S]+cost[S][i]);',
      '}',
      '// 枚举子集：for(int T=S;T;T=(T-1)&S)'
    ].join('\n'),
    pattern: '题面出现「n≤20」「每个人/任务只能选一次」「集合覆盖」「最短哈密顿回路」，就用状压 DP。',
    related: []
  };

  window.CSP.cards['dp.digit'] = {
    definition: '按数位从高到低统计区间内满足条件的数的个数，用 limit 与 lead 标记刻画约束。',
    keyPoints: [
      '答案为 f(R)-f(L-1)；状态含 pos（位数）、limit（是否贴着上界）、lead（是否有前导零）及题目附加量。',
      'limit 为真时当前位上限是 a[pos]，否则是 9；这一位取满则下一位 limit 仍为真。',
      'lead 用于「前导零不算真实数字」的统计，例如数位出现次数、不允许有前导零的数。',
      '记忆化只对 !limit 的状态缓存，因为 limit 状态在整棵搜索树中只会出现一次。',
      'L-1 可能为 -1，需要在入口特判或让数位分解自然返回 0。'
    ],
    complexity: 'O(位数 × 状态数 × 10)，位数为 log10 n，通常视作 O(log n)',
    pitfalls: [
      '漏掉 lead 前导零标记，把前导零当成真实的 0 计入统计。',
      '对 limit=1 的状态也做了记忆化，导致不同上界约束之间互相污染。',
      'L=0 时传入 -1 没有特判，数位分解出错或死循环。'
    ],
    template: [
      'int a[N],dp[N][STATES];',
      'int dfs(int p,int lim,int lead,int st){',
      '  if(p==0) return check(st);',
      '  int &res=dp[p][st];',
      '  if(!lim&&res>=0) return res;',
      '  int up=lim?a[p]:9, s=0;',
      '  for(int d=0;d<=up;d++)',
      '    s+=dfs(p-1,lim&&d==up,lead&&d==0,trans(st,d));',
      '  return lim?s:(res=s);',
      '}'
    ].join('\n'),
    pattern: '题面出现「统计 [L,R] 中有多少个数满足…」「数位之和」「不含某数字」，就是数位 DP。',
    related: []
  };

  window.CSP.cards['dp.prob'] = {
    definition: '以概率或期望作为状态值的 DP，利用期望线性性把总期望拆成每步贡献之和。',
    keyPoints: [
      '期望线性性 E[X+Y]=E[X]+E[Y]，常把「总期望」拆成每个元素被选中的概率之和。',
      '倒推更常用：f[i]=Σ p[i][j]·(f[j]+cost(i,j))，边界是终态的 f=0。',
      '正推适合概率题（dp 表示到达该状态的概率），倒推适合期望题（dp 表示从该状态出发的期望）。',
      '无限重复型（如不断抽卡）可列方程解出，或用几何分布 E=1/p。',
      '全程用 double/long double，最终按题目要求保留小数位。'
    ],
    complexity: '与同规模普通 DP 相同：O(状态数 × 转移数)',
    pitfalls: [
      '状态定义与转移方向不匹配（用概率的式子算期望），结果量纲都不对。',
      '大量累加用 float 或不做 eps 判断，精度误差导致答案超出容差。',
      '忘记设置终态边界（f[end]=0），递推永远不收敛。'
    ],
    template: [
      '// 期望倒推',
      'for(int i=n-1;i>=0;i--){',
      '  f[i]=0;',
      '  for(int j=0;j<m;j++)',
      '    f[i]+=p[i][j]*(f[i+1]+c[i][j]);',
      '}',
      'printf("%.10f\\n",f[0]);'
    ].join('\n'),
    pattern: '题面出现「期望得分」「平均次数」「概率为 p」「直到成功为止」，就用概率期望 DP。',
    related: []
  };

  window.CSP.cards['dp.opt'] = {
    definition: '用单调队列、斜率优化、决策单调性等手段把 DP 转移的复杂度降下一维。',
    keyPoints: [
      '单调队列优化：转移形如 dp[i]=min(dp[j]+w(i-j)) 且 j 的取值是滑动窗口、决策点单调，可 O(n) 完成。',
      '斜率优化：转移形如 dp[i]=min(dp[j]+a[i]·b[j])，把每个 j 看作点 (b[j], dp[j])，用凸包/二分查询最优决策。',
      '决策单调性（四边形不等式）：最优决策点 opt[i] 单调不减，用分治或单调栈 O(n log n)。',
      '写出转移式后先判断它属于哪一类形式，再选优化手段，不要盲目套模板。',
      '数据结构优化：转移等价于区间最值时用线段树/树状数组维护 O(log n)。'
    ],
    complexity: '单调队列 O(n)；斜率优化 O(n)（带二分 O(n log n)）；分治优化 O(n log n)；相较 O(n²) 降一维',
    pitfalls: [
      '单调队列出队首时没有判断是否过期（超出窗口范围）。',
      '斜率优化比较斜率用 double 有精度误差，应交叉相乘改用整数比较。',
      '没有验证决策单调性就直接套分治/单调栈优化，结果错误。'
    ],
    template: [
      '// 单调队列：dp[i]=min(dp[j])+a[i]，j∈[i-k,i-1]',
      'int h=1,t=0;',
      'for(int i=1;i<=n;i++){',
      '  while(h<=t&&q[h]<i-k) h++;',
      '  dp[i]=dp[q[h]]+a[i];',
      '  while(h<=t&&dp[q[t]]>=dp[i]) t--;',
      '  q[++t]=i;',
      '}'
    ].join('\n'),
    pattern: '题面出现「n 达 1e5~1e6 的 DP」「转移是取连续一段的最值」「决策点有单调性」，就想 DP 优化。',
    related: []
  };

  window.CSP.cards['dp.memo'] = {
    definition: '用记忆化数组缓存递归子问题答案的搜索式 DP，适合转移方向不直观的问题。',
    keyPoints: [
      '函数入口先查缓存，命中直接返回；算完写回缓存；缓存初值用 -1 表示未计算。',
      '与递推等价，但递归顺序自动满足拓扑序，无需手工推导枚举顺序。',
      '复杂度仍为 状态数 × 单状态转移量，与递推相同。',
      '适合图上 DP、博弈（必胜必败态）、树上 DP 与状态不规则的题。',
      '递归深度大时应转递推或手写栈，避免栈溢出与常数过大。'
    ],
    complexity: '时间 O(状态数 × 转移数)，空间 O(状态数 + 递归深度)',
    pitfalls: [
      '缓存初值用 0，与合法的答案 0 混淆，导致子问题被误认为已算过。',
      '记忆化下标映射与状态定义不一致（少一维或顺序错），命中错误缓存。',
      '递归中修改了全局数组却没有回溯，污染其它分支的结果。'
    ],
    template: [
      'int f[N];',
      'int dfs(int x){',
      '  if(x==0) return 1;',
      '  if(f[x]>=0) return f[x];',
      '  int res=0;',
      '  for(int y:pre[x]) res=(res+dfs(y))%MOD;',
      '  return f[x]=res;',
      '}',
      '// 主函数：memset(f,-1,sizeof f);'
    ].join('\n'),
    pattern: '题面出现「方案数」「从某状态出发的最优值」且转移关系复杂难以定序，就写记忆化搜索。',
    related: []
  };
})();
