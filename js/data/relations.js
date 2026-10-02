/* ============================================================================
 * 知识星图的「连线」关系数据 (relations.js)
 * ----------------------------------------------------------------------------
 * 星与星之间的连线有两个来源：
 *   1. CSP.prereq  —— 人工梳理的「学习先后 / 依赖」关系（下面的表）
 *   2. 题目共现     —— 同一道题涉及的两个考点之间自动连一条线（前端实时算）
 * 一切连线都对应真实的学习含义，不是随机画线。
 * ==========================================================================*/
(function () {
  'use strict';
  window.CSP = window.CSP || {};

  /* [前置, 后续, 说明] —— 阅读方向：先学前置，再学后续 */
  window.CSP.prereq = [
    /* --- 基础算法内部脉络 --- */
    ['basic.simulate', 'basic.enumerate', '先会照着规则模拟，再谈枚举所有可能'],
    ['basic.enumerate', 'search.dfs', '枚举所有方案 → 递归枚举'],
    ['basic.recursion', 'search.dfs', '递归是搜索的形式基础'],
    ['basic.recursion', 'basic.divide', '递归 → 分治'],
    ['basic.sort', 'basic.binary', '有序才能二分'],
    ['basic.sort', 'basic.discretize', '排序是离散化的前置'],
    ['basic.enumerate', 'basic.sort', '排序本质是重新组织枚举结果'],
    ['basic.divide', 'adv.cdq', '分治思想 → CDQ 分治'],
    ['basic.divide', 'adv.overall', '整体二分是「分治 + 二分」的合体'],
    ['basic.binary', 'basic.divide', '二分是分治最简单的形态'],
    ['basic.prefix', 'basic.diff', '前缀和 ↔ 差分的逆运算'],
    ['basic.diff', 'ds.bit', '差分数组 → 用树状数组维护'],
    ['basic.prefix', 'ds.bit', '前缀和思想 → 树状数组'],
    ['basic.prefix', 'dp.linear', '前缀和常用来优化线性 DP'],
    ['basic.greedy', 'ds.heap', '堆是贪心的常用工具'],
    ['basic.highprec', 'math.mod', '高精度与取模是两套大数处理思路'],
    ['basic.complexity', 'adv.strategy', '会算复杂度才能定考场策略'],
    ['basic.complexity', 'dp.opt', '复杂度不够时才会去优化 DP'],

    /* --- 数据结构脉络 --- */
    ['ds.stack', 'ds.monostack', '栈 → 单调栈'],
    ['ds.queue', 'ds.monoqueue', '队列 → 单调队列'],
    ['ds.queue', 'graph.bfs', 'BFS 靠队列实现'],
    ['ds.stack', 'graph.dfs', 'DFS 靠栈 / 递归实现'],
    ['ds.monostack', 'graph.diameter', '单调栈常用于预处理'],
    ['ds.monoqueue', 'dp.opt', '单调队列优化 DP'],
    ['ds.heap', 'graph.shortest', 'Dijkstra 靠堆取最近点'],
    ['ds.heap', 'search.astar', 'A* 用堆按估价值扩展'],
    ['ds.dsu', 'graph.mst', 'Kruskal 依赖并查集'],
    ['ds.dsu', 'graph.treediff', '并查集常配合树上处理'],
    ['ds.bit', 'ds.segtree', '树状数组 → 线段树'],
    ['ds.segtree', 'ds.lazy', '线段树 → 懒标记'],
    ['ds.segtree', 'graph.hld', '树链剖分需要线段树维护'],
    ['ds.bit', 'ds.mo', '分块/Mo 队与树状数组同属「分段处理」家族'],
    ['ds.blocksqrt', 'ds.mo', '分块思想 → 莫队'],
    ['ds.bit', 'ds.blocksqrt', '同样是平衡修改与查询的代价'],
    ['ds.trie', 'str.ac', 'Trie 是 AC 自动机的骨架'],
    ['ds.trie', 'str.sa', '后缀结构也常建 Trie/后缀树'],
    ['ds.hash', 'str.hash', '哈希表 → 字符串哈希'],
    ['ds.st', 'graph.lca', 'LCA 倍增与 ST 表同源'],
    ['ds.balanced', 'adv.offline', '平衡树常与离线处理配合'],
    ['ds.monoqueue', 'ds.monostack', '都是「维护单调性丢无用元素」'],

    /* --- 图论脉络 --- */
    ['graph.store', 'graph.dfs', '先会存图'],
    ['graph.store', 'graph.bfs', '先会存图'],
    ['graph.dfs', 'graph.bfs', '两种遍历互为补充'],
    ['graph.dfs', 'graph.scc', 'Tarjan 基于 DFS 序'],
    ['graph.dfs', 'graph.euler', '欧拉路靠 DFS 回溯构造'],
    ['graph.bfs', 'graph.shortest', '无权图 BFS 即最短路'],
    ['graph.bfs', 'search.bidir', '双向 BFS 是 BFS 的加速'],
    ['graph.shortest', 'graph.dagdp', 'DAG 上按拓扑序松弛即最短路'],
    ['graph.toposort', 'graph.dagdp', '拓扑排序是 DAG 上 DP 的前提'],
    ['graph.toposort', 'graph.scc', '缩点后必须拓扑排序'],
    ['graph.scc', 'graph.dagdp', '缩点 → DAG 上 DP'],
    ['graph.dfs', 'graph.bipartite', '染色用 DFS/BFS'],
    ['graph.bipartite', 'graph.netflow', '二分图匹配 → 网络流'],
    ['graph.dfs', 'graph.lca', 'LCA 预处理基于遍历'],
    ['graph.lca', 'graph.treediff', '树上差分需要 LCA'],
    ['graph.lca', 'graph.hld', '树剖本质是「重链上的 LCA」'],
    ['graph.dfs', 'graph.diameter', '直径可两次 DFS/BFS'],
    ['graph.diameter', 'dp.tree', '树形 DP 的入门'],
    ['graph.dagdp', 'dp.memo', '记忆化搜索天生适合 DAG'],
    ['graph.mst', 'adv.offline', '离线边排序 + 并查集'],

    /* --- 动态规划脉络 --- */
    ['dp.linear', 'dp.knapsack', '线性 DP → 背包'],
    ['dp.linear', 'dp.lis', 'LIS/LCS 都是线性 DP'],
    ['dp.knapsack', 'dp.tree', '背包思想会挂在树上'],
    ['dp.linear', 'dp.interval', '线性 → 区间'],
    ['dp.interval', 'dp.opt', '区间 DP 常要优化'],
    ['dp.linear', 'dp.bitmask', '状态压缩是「把集合当状态」'],
    ['dp.bitmask', 'search.meet', '状压与折半搜索常互相替换'],
    ['dp.lis', 'dp.digit', '数位 DP 是「按位走」的线性 DP'],
    ['dp.memo', 'search.dfs', '记忆化搜索 = DFS + 剪枝表'],
    ['dp.linear', 'dp.prob', '概率期望 DP 也是线性递推'],
    ['dp.prob', 'math.prob', 'DP 与数学期望同源'],
    ['dp.tree', 'graph.dfs', '树形 DP 靠 DFS 后序'],
    ['dp.opt', 'basic.binary', '决策单调性常用二分'],
    ['dp.knapsack', 'math.comb', '计数类 DP 常与组合数结合'],

    /* --- 字符串脉络 --- */
    ['str.basic', 'str.kmp', '先熟悉字符串基本操作'],
    ['str.basic', 'str.hash', '哈希是字符串最通用的武器'],
    ['str.basic', 'str.palindrome', '回文是字符串的特殊结构'],
    ['str.hash', 'str.kmp', '哈希能替代部分 KMP 场景'],
    ['str.kmp', 'str.z', 'Z 函数与 KMP 同族'],
    ['str.kmp', 'str.ac', 'AC 自动机 = Trie 上的 KMP'],
    ['str.kmp', 'str.sa', '后缀数组与 KMP 都在描述重复结构'],
    ['str.palindrome', 'str.manacher', 'Manacher 专门求回文'],
    ['str.hash', 'str.manacher', '哈希也能判回文（但更慢）'],

    /* --- 数学脉络 --- */
    ['math.gcd', 'math.mod', 'gcd/exgcd 是模运算的核心'],
    ['math.mod', 'math.pow', '取模 + 快速幂'],
    ['math.pow', 'math.matrix', '快速幂思想 → 矩阵快速幂'],
    ['math.pow', 'math.bsgs', 'BSGS 用到快速幂与逆元'],
    ['math.mod', 'math.comb', '组合数取模需要逆元'],
    ['math.prime', 'math.gcd', '筛法求素数 → 数论基础'],
    ['math.prime', 'math.inclusion', '容斥常按素因子拆'],
    ['math.comb', 'math.inclusion', '容斥是组合计数的减法'],
    ['math.comb', 'dp.bitmask', '组合计数常配状压/容斥'],
    ['math.prob', 'math.game', '期望与博弈都基于概率模型'],
    ['math.linear', 'math.geometry', '几何题常化为解方程'],
    ['math.matrix', 'graph.dagdp', '矩阵/向量在图上递推'],
    ['math.bsgs', 'str.hash', '都是「空间换时间」的分块思想'],

    /* --- 搜索脉络 --- */
    ['search.dfs', 'search.itdeep', '迭代加深是「限制深度的 DFS」'],
    ['search.dfs', 'search.astar', 'IDA* = 迭代加深 + 估价剪枝'],
    ['search.dfs', 'search.meet', '折半搜索本质是双向枚举'],
    ['search.bfs', 'search.bidir', '双向 BFS 是 BFS 的对撞'],
    ['search.bfs', 'search.astar', 'A* = BFS + 优先队列 + 估价'],
    ['search.dfs', 'adv.construct', '构造题常用搜索/贪心构造'],
    ['search.meet', 'adv.random', '随机化常用来替代最坏情况枚举'],
    ['search.dfs', 'adv.random', '随机化搜索可打乱剪枝顺序'],

    /* --- 综合技巧脉络 --- */
    ['adv.io', 'adv.stress', '先会稳定读写再谈对拍'],
    ['adv.stress', 'adv.random', '对拍是检验随机化算法的标准手段'],
    ['adv.offline', 'adv.scanline', '扫描线是离线的经典形态'],
    ['adv.scanline', 'ds.segtree', '扫描线靠线段树维护区间'],
    ['adv.offline', 'adv.cdq', 'CDQ 分治是离线技巧'],
    ['adv.cdq', 'adv.overall', 'CDQ 与整体二分常互为替代'],
    ['adv.cdq', 'dp.opt', 'CDQ 可优化 1D/1D 型 DP'],
    ['adv.construct', 'adv.interactive', '交互题往往要求构造/决策'],
    ['adv.random', 'math.prob', '随机化需要概率分析'],
    ['adv.strategy', 'adv.stress', '考场策略里对拍是必备技能']
  ];
})();
