# 内容编写契约（内容作者必读）

本项目是**纯静态、零构建**的单页应用，部署在 GitHub Pages 上。
所有数据以「挂载到 `window.CSP`」的普通 JS 文件形式加载，**禁止使用 `import/export`、`require`**。

> 参考实现与「我的算法」都用同一套 **追踪 API**（见 `js/core/trace.js`），
> 因此每个题目**必须同时提供**：
> 1. `std`：参考 C++ 程序（用于真实评测 / 出题验证）
> 2. `algo.ref`：同题同解的 **JS 追踪版**（用于逐步可视化与对比）
> 3. `algo.userTemplate`：给用户改的起步代码（挖掉核心逻辑，留 TODO）

---

## 一、文件与命名

内容按批次分散在互不重叠的文件里，避免写冲突：

| 文件 | 内容 |
|------|------|
| `js/data/problems-A.js` | 基础算法题 p01–p09 |
| `js/data/problems-B.js` | 数据结构题 p10–p18 |
| `js/data/problems-C.js` | 图论/搜索题 p19–p27 |
| `js/data/problems-D.js` | 动态规划题 p28–p35 |
| `js/data/problems-E.js` | 字符串/数学题 p36–p43 |
| `js/data/cards-A.js` | 知识卡（基础算法 + 数据结构） |
| `js/data/cards-B.js` | 知识卡（图论 + 动态规划） |
| `js/data/cards-C.js` | 知识卡（字符串 + 数学 + 搜索 + 综合技巧） |

每个文件的结构固定为（以 problems 为例）：

```js
(function () {
  'use strict';
  window.CSP = window.CSP || {};
  window.CSP.problems = window.CSP.problems || [];
  window.CSP.problems.push( /* 题目对象 */ );
  window.CSP.problems.push( /* ... */ );
})();
```

**ID 必须唯一且严格按分配**（`p01`…`p43`），`no` 与数字部分一致。

---

## 二、题目对象字段

```js
{
  id: "p01",                       // 必填，全局唯一
  no: 1,                           // 必填，序号
  title: "数字统计",                // 必填，题名（中文，简洁）
  diff: 1,                         // 必填，1–6 难度（1 入门 … 6 NOI+）
  tier: "入门",                     // 必填，难度文案：入门/普及-/普及+/提高/提高+/省选-
  knowledge: ["basic.simulate", "basic.enumerate"],  // 必填，syllabus.js 中的 id，1–4 个
  limits: { time: "1s", memory: "128MB" },
  statement: "……",                 // 必填，题面（支持 \n 分段，可用 “- ” 列表）
  inputFormat: "……",               // 必填
  outputFormat: "……",              // 必填
  samples: [                       // 必填，至少 1 组
    { input: "2 22", output: "6", explain: "2..22 中共有 6 个数字 2" }
  ],
  tests: [                         // 必填，恰好 5 组隐藏测试点，每组 20 分
    { input: "1 100\n", output: "20", score: 20 }
  ],
  std: {                           // 必填，参考 C++ 程序（C++17，可用 bits/stdc++.h）
    code: "#include <bits/stdc++.h>\nusing namespace std;\nint main(){...}"
  },
  algo: {                          // 必填，可视化用
    title: "枚举每个数并逐位统计",    // 算法名
    viz: { /* 见第三节 */ },
    ref: "function solve(input, T){\n ... \n}",       // 必填，追踪版参考实现
    userTemplate: "function solve(input, T){\n ... \n}", // 必填，挖空起步代码
    pseudo: [                       // 可选：伪代码逐行（与 ref 的 T.step 行数无关，仅作文档）
      "ans ← 0", "for i ← L to R", "  while x > 0", "    if x mod 10 = 2 then ans++"
    ],
    gen: "function(r){}"            // 可选：随机数据生成器源码字符串（字符串形式！），用于对拍
  },
  tips: ["易错点1", "易错点2"]      // 可选，3 条以内
}
```

### 硬性要求

1. **测试点自洽**：`tests[i].output` 必须与 `std.code` 在该输入下的输出**完全一致**（会由脚本真实编译验证）。
2. **`algo.ref` 与 `std` 输出一致**：同一输入下，JS 追踪版 `T.answer(...)` 的内容必须等于 C++ 输出。
3. **输入规模小**：`tests` 中每个输入都要能被 **JS 追踪版在 2000 步以内**跑完
   （可视化会用它逐帧播放）。大数组/大 n 的题请把可视化输入固定为**小规模**，
   放在 `algo.viz.input` 里，可以不同于 `tests[0]`。
4. **`tests[0]` 建议与 `samples[0]` 相同**，方便对照。
5. 输出**不要有行尾多余空格**；允许末尾换行。

---

## 三、`viz` 结构（可视化渲染描述）

`viz` 告诉渲染器「每一步要画什么」。`state` 里的字段名就是绘制来源。

```js
viz: {
  input: "4 9\n2 7 11 15",   // 可视化专用输入（小规模），缺省用 samples[0].input
  type: "array",              // array | bars | matrix | graph | tree | string | stack
  mainKey: "a",               // 主结构取自 state 的哪个字段
  pointers: ["l", "r"],       // 取值为「下标」的变量，画成指针箭头
  highlight: ["i", "j"],      // 取值为「下标」的变量，画成高亮单元格
  labels: { l: "L", r: "R" }, // 可选：显示名替换
  title: "双指针查找"          // 可选：图形标题
}
```

各 `type` 的字段约定：

| type | mainKey 形态 | 附加字段 |
|------|-------------|---------|
| `array` | `[1,2,3]` 一维数组 | `pointers`/`highlight` 用下标变量 |
| `bars` | 数字数组（画柱状图，适合排序） | `highlight` 高亮柱 |
| `matrix` | `[[..],[..]]` 二维数组 | `highlight` 可用 `i`、`j` 两个下标变量定位 |
| `graph` | `n` 在 `mainKey` 无效时用 `nKey` | `edgesKey`（`[[u,v],...]` 或 `[[u,v,w],...]`）、`distKey`、`curKey` |
| `tree` | `childrenKey`：`{1:[2,3],2:[4]}` | `curKey`、`distKey` |
| `string` | 字符串或字符数组 | `pointers`/`highlight` 下标 |
| `stack` | 数组（画成竖排栈） | — |

`graph` 示例：
```js
type: "graph", mainKey: "n", edgesKey: "edges", distKey: "dist", curKey: "u"
// state 形如 { n: 4, edges: [[1,2,2],[1,3,5]], dist: [0,2,3,6], u: 2 }
```

---

## 四、追踪 API（`algo.ref` / `algo.userTemplate` 唯一可用约定）

```js
function solve(input, T) {
  // input 是完整输入字符串；用 T.tokens 读取
  var tk = T.tokens;          // T.tokens 是已就绪的分词器
  var n = tk.int(), m = tk.int();
  var a = tk.ints(n);

  var S = { a: a, n: n, i: 0, ans: 0 };   // S 就是「当前可见状态」
  T.step(S, '初始状态');                    // 记录一步（深拷贝快照）

  for (S.i = 0; S.i < n; S.i++) {
    S.ans += S.a[S.i];
    T.step(S, '累加 a[' + S.i + '] = ' + S.a[S.i]);   // 每步都调用 T.step
  }

  T.answer(String(S.ans));                  // 声明最终答案
  return String(S.ans);                     // 返回值也会被当作答案（二选一）
}
```

可用方法：

| 方法 | 作用 |
|------|------|
| `T.tokens.int() / .num() / .next() / .ints(n)` | 按空白分词读取输入 |
| `T.lines` | 输入按行切分的数组 |
| `T.step(state, note)` | 记录一步；`state` 必须包含 `viz` 用到的所有字段 |
| `T.answer(v)` | 声明最终答案（字符串），用于与标准算法比对 |
| `T.sig([...])` | 可选：只让这些字段参与「逐步一致性」比较 |

**注意事项**

- 只写 **ES5 语法**（`var` / `function`，不要箭头函数、不要 `let/const`、不要模板字符串？——
  **可以用 `const`/`let`/箭头函数/模板字符串**，浏览器按现代标准解析，Node 亦支持；但**不要用 `import/export`**）。
- **禁止 `console.log`**。
- 每步状态只放**可视化需要的小数据**（长度 ≤ 64 的数组），大数组不要塞进 state。
- `T.step` 的每一步都要让画面「讲得出发生了什么」，note 用中文，简短（≤ 40 字）。
- **步骤数控制在 200 步以内**为佳（可视化默认输入下）。

---

## 五、完整示例（照抄这个格式）

```js
(function () {
  'use strict';
  window.CSP = window.CSP || {};
  window.CSP.problems = window.CSP.problems || [];
  window.CSP.problems.push({
    id: 'p01', no: 1, title: '数字统计', diff: 1, tier: '入门',
    knowledge: ['basic.simulate', 'basic.enumerate'],
    limits: { time: '1s', memory: '128MB' },
    statement: '给定两个整数 L 和 R，统计区间 [L, R] 中数字 2 一共出现了多少次。\n例如 2 到 22 中，数字 2 出现在 2、12、20、21、22 里，共 6 次。',
    inputFormat: '一行两个整数 L, R（1 ≤ L ≤ R ≤ 10^6）。',
    outputFormat: '一个整数，表示数字 2 出现的总次数。',
    samples: [{ input: '2 22', output: '6', explain: '2,12,20,21,22 → 1+1+1+1+2 = 6' }],
    tests: [
      { input: '2 22\n', output: '6', score: 20 },
      { input: '1 100\n', output: '20', score: 20 },
      { input: '1 1000\n', output: '300', score: 20 },
      { input: '222 222\n', output: '3', score: 20 },
      { input: '100000 100000\n', output: '0', score: 20 }
    ],
    std: { code: '#include <bits/stdc++.h>\nusing namespace std;\nint main(){int L,R,ans=0;cin>>L>>R;for(int i=L;i<=R;i++){int x=i;while(x){if(x%10==2)ans++;x/=10;}}cout<<ans<<endl;return 0;}' },
    algo: {
      title: '枚举区间内每个数，逐位统计',
      viz: { input: '2 22', type: 'array', mainKey: 'digits', pointers: ['pos'], highlight: ['pos'], title: '逐位检查' },
      ref: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var L = tk.int(), R = tk.int();',
        '  var S = { L: L, R: R, cur: L, digits: [], pos: 0, ans: 0 };',
        '  T.step(S, "统计区间 [" + L + ", " + R + "]");',
        '  for (S.cur = L; S.cur <= R; S.cur++) {',
        '    var x = S.cur, ds = [];',
        '    while (x > 0) { ds.unshift(x % 10); x = Math.floor(x / 10); }',
        '    if (ds.length === 0) ds = [0];',
        '    S.digits = ds;',
        '    T.step(S, "检查 " + S.cur + "，数位 " + ds.join(""));',
        '    for (S.pos = 0; S.pos < ds.length; S.pos++) {',
        '      T.step(S, ds[S.pos] === 2 ? "第 " + S.pos + " 位是 2，计数 +1" : "第 " + S.pos + " 位不是 2");',
        '      if (ds[S.pos] === 2) S.ans++;',
        '    }',
        '  }',
        '  T.answer(String(S.ans));',
        '  return String(S.ans);',
        '}'
      ].join('\n'),
      userTemplate: [
        'function solve(input, T){',
        '  var tk = T.tokens;',
        '  var L = tk.int(), R = tk.int();',
        '  var S = { L: L, R: R, cur: L, digits: [], pos: 0, ans: 0 };',
        '  T.step(S, "统计区间 [" + L + ", " + R + "]");',
        '  // TODO: 枚举 L..R 的每个数，拆出它的每一位，统计等于 2 的位数',
        '  // 提示：参考 algo.ref，每一步都要调用 T.step(S, note)',
        '  T.answer(String(S.ans));',
        '  return String(S.ans);',
        '}'
      ].join('\n'),
      pseudo: ['ans ← 0', 'for i ← L to R', '  while x > 0', '    if x mod 10 = 2 then ans++', '    x ← x div 10'],
      gen: 'function(r){ var L = 1 + Math.floor(Math.random()*30); return L + " " + (L + Math.floor(Math.random()*30)); }'
    },
    tips: ['注意 0 的处理：拆位时 x=0 会一次都不进入循环', 'R 可达 10^6，逐位拆解的时间复杂度是 O((R-L)·log R)，完全够用']
  });
})();
```

---

## 六、知识卡对象字段（cards-*.js）

```js
(function () {
  'use strict';
  window.CSP = window.CSP || {};
  window.CSP.cards = window.CSP.cards || {};
  window.CSP.cards['basic.simulate'] = {
    definition: '一句话定义（≤ 60 字）',
    keyPoints: ['要点1', '要点2', '要点3'],   // 3–5 条，说清「怎么做」
    complexity: '时间 O(n)，空间 O(1)',
    pitfalls: ['易错点1', '易错点2'],          // 2–4 条，真实考场踩坑
    template: '#include <bits/stdc++.h>\n// 关键代码骨架（≤ 12 行）',
    pattern: '看到「……」「……」的题面，就往这个方向想',  // 识别套路
    related: ['p01', 'p02']                    // 相关题目 id（可选，尽量填）
  };
})();
```

**`id` 必须是 `js/data/syllabus.js` 中已存在的 id**，否则会被丢弃。
