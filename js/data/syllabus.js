/* ============================================================================
 * CSP-S 2026 第二轮 · 考纲知识树 (syllabus.js)
 * ----------------------------------------------------------------------------
 * 这是全站知识点的权威清单（id 唯一且稳定，题目/知识卡/掌握度统计都引用它）。
 * 依据 CCF《NOI 大纲》提高级 + CSP-S 第二轮（机试）实际命题范围整理。
 * level: 1=入门必会  2=提高核心  3=高阶冲刺
 * ==========================================================================*/
(function () {
  'use strict';
  window.CSP = window.CSP || {};
  window.CSP.syllabus = [
    /* ---------------- 基础算法 ---------------- */
    { id: 'basic.simulate',   cat: '基础算法', name: '模拟',            level: 1 },
    { id: 'basic.enumerate',  cat: '基础算法', name: '枚举与暴力',       level: 1 },
    { id: 'basic.recursion',  cat: '基础算法', name: '递归',            level: 1 },
    { id: 'basic.divide',     cat: '基础算法', name: '分治与归并',       level: 2 },
    { id: 'basic.greedy',     cat: '基础算法', name: '贪心',            level: 2 },
    { id: 'basic.sort',       cat: '基础算法', name: '排序',            level: 1 },
    { id: 'basic.binary',     cat: '基础算法', name: '二分查找/二分答案', level: 2 },
    { id: 'basic.twopointer', cat: '基础算法', name: '双指针',          level: 1 },
    { id: 'basic.prefix',     cat: '基础算法', name: '前缀和',          level: 1 },
    { id: 'basic.diff',       cat: '基础算法', name: '差分',            level: 1 },
    { id: 'basic.discretize', cat: '基础算法', name: '离散化',          level: 2 },
    { id: 'basic.highprec',   cat: '基础算法', name: '高精度运算',       level: 1 },
    { id: 'basic.complexity', cat: '基础算法', name: '复杂度分析',       level: 1 },

    /* ---------------- 数据结构 ---------------- */
    { id: 'ds.stack',        cat: '数据结构', name: '栈',              level: 1 },
    { id: 'ds.queue',        cat: '数据结构', name: '队列',            level: 1 },
    { id: 'ds.monostack',    cat: '数据结构', name: '单调栈',          level: 2 },
    { id: 'ds.monoqueue',    cat: '数据结构', name: '单调队列',        level: 2 },
    { id: 'ds.linked',       cat: '数据结构', name: '链表',            level: 1 },
    { id: 'ds.heap',         cat: '数据结构', name: '堆/优先队列',      level: 2 },
    { id: 'ds.dsu',          cat: '数据结构', name: '并查集',          level: 2 },
    { id: 'ds.bit',          cat: '数据结构', name: '树状数组',        level: 2 },
    { id: 'ds.segtree',      cat: '数据结构', name: '线段树',          level: 3 },
    { id: 'ds.lazy',         cat: '数据结构', name: '懒标记线段树',     level: 3 },
    { id: 'ds.st',           cat: '数据结构', name: 'ST表（RMQ）',     level: 2 },
    { id: 'ds.trie',         cat: '数据结构', name: '字典树',          level: 3 },
    { id: 'ds.hash',         cat: '数据结构', name: '哈希表',          level: 2 },
    { id: 'ds.balanced',     cat: '数据结构', name: '平衡树',          level: 3 },
    { id: 'ds.blocksqrt',    cat: '数据结构', name: '分块',            level: 3 },
    { id: 'ds.mo',           cat: '数据结构', name: '莫队',            level: 3 },

    /* ---------------- 图论 ---------------- */
    { id: 'graph.store',     cat: '图论',   name: '图的存储与建图',     level: 1 },
    { id: 'graph.dfs',       cat: '图论',   name: 'DFS 遍历',         level: 1 },
    { id: 'graph.bfs',       cat: '图论',   name: 'BFS 遍历',         level: 1 },
    { id: 'graph.toposort',  cat: '图论',   name: '拓扑排序',         level: 2 },
    { id: 'graph.shortest',  cat: '图论',   name: '最短路',           level: 2 },
    { id: 'graph.mst',       cat: '图论',   name: '最小生成树',        level: 2 },
    { id: 'graph.bipartite', cat: '图论',   name: '二分图与匹配',      level: 3 },
    { id: 'graph.scc',       cat: '图论',   name: '强连通分量/Tarjan', level: 3 },
    { id: 'graph.dagdp',     cat: '图论',   name: 'DAG 上 DP',       level: 2 },
    { id: 'graph.lca',       cat: '图论',   name: 'LCA 最近公共祖先',  level: 3 },
    { id: 'graph.treediff',  cat: '图论',   name: '树上差分',         level: 3 },
    { id: 'graph.diameter',  cat: '图论',   name: '树的直径/重心',     level: 2 },
    { id: 'graph.hld',       cat: '图论',   name: '树链剖分',         level: 3 },
    { id: 'graph.netflow',   cat: '图论',   name: '网络流',           level: 3 },
    { id: 'graph.euler',     cat: '图论',   name: '欧拉路',           level: 3 },

    /* ---------------- 动态规划 ---------------- */
    { id: 'dp.linear',   cat: '动态规划', name: '线性DP',            level: 1 },
    { id: 'dp.knapsack', cat: '动态规划', name: '背包',              level: 2 },
    { id: 'dp.lis',      cat: '动态规划', name: 'LIS/LCS',          level: 2 },
    { id: 'dp.interval', cat: '动态规划', name: '区间DP',            level: 2 },
    { id: 'dp.tree',     cat: '动态规划', name: '树形DP',            level: 3 },
    { id: 'dp.bitmask',  cat: '动态规划', name: '状压DP',            level: 3 },
    { id: 'dp.digit',    cat: '动态规划', name: '数位DP',            level: 3 },
    { id: 'dp.prob',     cat: '动态规划', name: '概率期望DP',        level: 3 },
    { id: 'dp.opt',      cat: '动态规划', name: 'DP优化',            level: 3 },
    { id: 'dp.memo',     cat: '动态规划', name: '记忆化搜索',         level: 2 },

    /* ---------------- 字符串 ---------------- */
    { id: 'str.basic',      cat: '字符串', name: '字符串基础',        level: 1 },
    { id: 'str.kmp',        cat: '字符串', name: 'KMP',             level: 2 },
    { id: 'str.hash',       cat: '字符串', name: '字符串哈希',        level: 2 },
    { id: 'str.manacher',   cat: '字符串', name: 'Manacher',        level: 3 },
    { id: 'str.z',          cat: '字符串', name: 'Z函数/扩展KMP',     level: 3 },
    { id: 'str.ac',         cat: '字符串', name: 'AC自动机',         level: 3 },
    { id: 'str.sa',         cat: '字符串', name: '后缀数组',          level: 3 },
    { id: 'str.palindrome', cat: '字符串', name: '回文串',           level: 2 },

    /* ---------------- 数学 ---------------- */
    { id: 'math.gcd',       cat: '数学', name: '数论基础',           level: 1 },
    { id: 'math.prime',     cat: '数学', name: '素数筛与质因数分解',   level: 2 },
    { id: 'math.mod',       cat: '数学', name: '模运算与逆元',        level: 2 },
    { id: 'math.pow',       cat: '数学', name: '快速幂',            level: 1 },
    { id: 'math.matrix',    cat: '数学', name: '矩阵乘法与矩阵快速幂', level: 3 },
    { id: 'math.comb',      cat: '数学', name: '组合数学',           level: 2 },
    { id: 'math.inclusion', cat: '数学', name: '容斥原理',           level: 3 },
    { id: 'math.prob',      cat: '数学', name: '概率与期望',         level: 3 },
    { id: 'math.game',      cat: '数学', name: '博弈论/SG函数',      level: 3 },
    { id: 'math.geometry',  cat: '数学', name: '计算几何',           level: 3 },
    { id: 'math.linear',    cat: '数学', name: '高斯消元/线性代数',    level: 3 },
    { id: 'math.bsgs',      cat: '数学', name: 'BSGS/离散对数',      level: 3 },

    /* ---------------- 搜索 ---------------- */
    { id: 'search.dfs',      cat: '搜索', name: 'DFS与剪枝',          level: 1 },
    { id: 'search.bfs',      cat: '搜索', name: 'BFS搜索',           level: 1 },
    { id: 'search.bidir',    cat: '搜索', name: '双向BFS',           level: 3 },
    { id: 'search.astar',    cat: '搜索', name: 'A*/IDA*',          level: 3 },
    { id: 'search.itdeep',   cat: '搜索', name: '迭代加深',           level: 3 },
    { id: 'search.meet',     cat: '搜索', name: '折半搜索',           level: 3 },

    /* ---------------- 综合与考场技巧 ---------------- */
    { id: 'adv.offline',  cat: '综合技巧', name: '离线处理',         level: 2 },
    { id: 'adv.scanline', cat: '综合技巧', name: '扫描线',           level: 3 },
    { id: 'adv.cdq',      cat: '综合技巧', name: 'CDQ分治',          level: 3 },
    { id: 'adv.overall',  cat: '综合技巧', name: '整体二分',          level: 3 },
    { id: 'adv.random',   cat: '综合技巧', name: '随机化算法',        level: 3 },
    { id: 'adv.construct',cat: '综合技巧', name: '构造题',           level: 2 },
    { id: 'adv.interactive', cat: '综合技巧', name: '交互题',         level: 3 },
    { id: 'adv.io',       cat: '综合技巧', name: '输入输出优化',      level: 1 },
    { id: 'adv.stress',   cat: '综合技巧', name: '对拍',             level: 2 },
    { id: 'adv.strategy', cat: '综合技巧', name: '考场策略',          level: 1 }
  ];
})();
