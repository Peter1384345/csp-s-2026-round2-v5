/* ============================================================================
 * 知识星图布局自检 (tools/verify-starmap.js)
 *   直接调用真实的 js/views/starmap.js 渲染一次，检查：
 *     1. 90 颗星是否都拿到了坐标
 *     2. 任意两颗星的最小间距（离散程度）—— 太小说明挤在一起了
 *     3. 星点分布范围是否落在视野内
 *     4. 连线数量与端点是否都能解析
 *     5. 越界检查：有没有星跑到画布外
 * ==========================================================================*/
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');

/* 构造一个最小可用的浏览器环境：只满足 starmap.js 的依赖 */
const store = {};
const win = {
  localStorage: {
    _d: {},
    getItem: function (k) { return this._d[k] === undefined ? null : this._d[k]; },
    setItem: function (k, v) { this._d[k] = String(v); },
    removeItem: function (k) { delete this._d[k]; }
  }
};
win.window = win;
const ctx = vm.createContext(win);
ctx.localStorage = win.localStorage;
ctx.console = console;
ctx.Math = Math; ctx.JSON = JSON; ctx.Date = Date; ctx.Number = Number; ctx.Object = Object;

const FILES = [
  'js/data/syllabus.js', 'js/data/relations.js',  'js/data/problems-A.js', 'js/data/problems-B.js', 'js/data/problems-C.js',
  'js/data/problems-D.js', 'js/data/problems-E.js', 'js/data/problems-F.js',
  'js/data/problems-G.js', 'js/data/problems-H.js', 'js/data/problems-I.js',
  'js/data/problems-J.js', 'js/data/cards-A.js', 'js/data/cards-B.js', 'js/data/cards-C.js',
  'js/core/ui.js', 'js/core/render.js', 'js/core/store.js', 'js/views/starmap.js'
];
/* starmap.js 挂在 CSP.views 下，先把这个命名空间准备好 */
vm.runInContext('window.CSP = window.CSP || {}; window.CSP.views = window.CSP.views || {};', ctx, { filename: 'prelude' });

FILES.forEach(function (f) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) return;
  try { vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f }); }
  catch (e) { console.log('⚠ 跳过 ' + f + ': ' + e.message.split('\n')[0]); }
});
const CSP = win.CSP;
if (!CSP.views || !CSP.views.starmap) { console.log('❌ starmap 视图未加载'); process.exit(1); }

let html;
try { html = CSP.views.starmap(); }
catch (e) { console.log('❌ starmap() 抛异常: ' + e.message + '\n' + e.stack.split('\n').slice(0, 4).join('\n')); process.exit(1); }

/* 1. 星点坐标 */
const pts = [];
const re = /class="star[^"]*"\s+data-id="([^"]+)"[^>]*transform="translate\(([-\d.]+),([-\d.]+)\)"/g;
let m;
while ((m = re.exec(html)) !== null) pts.push({ id: m[1], x: +m[2], y: +m[3] });
/* 兜底：不同属性顺序时换一种匹配 */
if (!pts.length) {
  const re2 = /data-id="([^"]+)"[^>]*?translate\(([-\d.]+),([-\d.]+)\)/g;
  while ((m = re2.exec(html)) !== null) pts.push({ id: m[1], x: +m[2], y: +m[3] });
}

/* 2. 连线 */
const edges = [];
const ree = /class="sm-edge (prereq|co)"\s+data-a="([^"]+)"\s+data-b="([^"]+)"\s+d="([^"]*)"/g;
while ((m = ree.exec(html)) !== null) edges.push({ kind: m[1], a: m[2], b: m[3], d: m[4] });

const expected = (CSP.syllabus || []).length;
console.log('='.repeat(66));
console.log('知识星图布局自检');
console.log('='.repeat(66));
console.log(`  考纲考点: ${expected}   渲染出的星: ${pts.length}   连线: ${edges.length}` +
  `（依赖 ${edges.filter(e => e.kind === 'prereq').length} / 共现 ${edges.filter(e => e.kind === 'co').length}）`);

let bad = 0;
if (pts.length !== expected) { console.log(`  ❌ 星数量不符：期望 ${expected}，实际 ${pts.length}`); bad++; }
if (edges.some(e => !e.d)) { console.log('  ❌ 存在空路径的连线'); bad++; }
if (edges.some(e => /\bNaN\b/.test(e.d))) { console.log('  ❌ 连线路径含 NaN'); bad++; }

/* 3. 最小间距（离散度） */
let min = Infinity, pair = null;
for (let i = 0; i < pts.length; i++) {
  for (let j = i + 1; j < pts.length; j++) {
    const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
    if (d < min) { min = d; pair = [pts[i], pts[j]]; }
  }
}
console.log(`  任意两星最小间距: ${min.toFixed(1)}px` + (pair ? `  （${pair[0].id} ↔ ${pair[1].id}）` : ''));
if (min < 62) { console.log(`  ❌ 最挤的一对间距 ${min.toFixed(1)} < 62，星点不够离散`); bad++; }
else console.log('  ✅ 星点间距充足（标签不会互相压住）');

/* 4. 分布范围 / 越界 */
const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
const minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs);
const minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
console.log(`  分布范围: x ${minX.toFixed(0)}..${maxX.toFixed(0)}   y ${minY.toFixed(0)}..${maxY.toFixed(0)}`);
/* 画布尺寸从源码里读，避免改布局后这里写死失效 */
const src = fs.readFileSync(path.join(ROOT, 'js/views/starmap.js'), 'utf8');
const wm = src.match(/var W = (\d+), H = (\d+), CX = (\d+), CY = (\d+)/);
const CW = wm ? +wm[1] : 1500;
if (minX < 0 || minY < 0 || maxX > CW || maxY > CW) { console.log(`  ❌ 有星点超出画布 (${CW}×${CW})`); bad++; }
else console.log(`  ✅ 全部星点在画布内 (${CW}×${CW})`);

/* 5. 连线端点是否都能解析 */
const ids = {};
pts.forEach(p => { ids[p.id] = 1; });
const orphan = edges.filter(e => !ids[e.a] || !ids[e.b]);
if (orphan.length) { console.log(`  ❌ ${orphan.length} 条连线的端点找不到对应星`); bad++; }
else console.log('  ✅ 所有连线端点都能对应到星');

/* 6. 动效层：星星漂浮 / 星云 / 流星 / 能量光点 / 波纹 是否都渲染出来了 */
const anim = {
  float: (html.match(/class="star-float"/g) || []).length,
  halo: (html.match(/class="sm-halo"/g) || []).length,
  nebula: (html.match(/class="sm-neb"/g) || []).length,
  meteor: (html.match(/class="sm-meteor"/g) || []).length,
  pulse: (html.match(/class="sm-pulse"/g) || []).length,
  animMotion: (html.match(/<animateMotion/g) || []).length,
  mpath: (html.match(/<mpath/g) || []).length,
  twinkle: (html.match(/class="sm-dust"/g) || []).length,
  wave: (html.match(/class="sm-core-wave"/g) || []).length,
  rune: (html.match(/class="sm-rune/g) || []).length,
  co: (html.match(/class="sm-edge co"/g) || []).length
};
console.log('  动效元素: ' + Object.keys(anim).map(k => k + '=' + anim[k]).join('  '));
if (anim.float !== expected) { console.log(`  ❌ 漂浮层数量 ${anim.float} ≠ 星数 ${expected}`); bad++; }
if (anim.animMotion !== anim.pulse || anim.mpath !== anim.pulse) { console.log('  ❌ 能量光点与 animateMotion/mpath 数量不匹配'); bad++; }
if (anim.pulse < 20) { console.log(`  ❌ 能量光点太少 (${anim.pulse})`); bad++; }
[['星云', anim.nebula, 2], ['流星', anim.meteor, 3], ['星尘闪烁', anim.twinkle, 40], ['核心波纹', anim.wave, 2], ['法阵刻线环', anim.rune, 4]]
  .forEach(function (a) { if (a[1] < a[2]) { console.log(`  ❌ ${a[0]} 元素不足（${a[1]} < ${a[2]}）`); bad++; } });
if (!bad) console.log('  ✅ 动效层元素齐备（漂浮 / 闪烁 / 能量流动 / 星云 / 流星 / 波纹）');

/* 6b. 动效数量预算（只统计真正在动的元素；halo 现在是静态的，不计入） */
const budget = anim.float + anim.pulse + anim.twinkle + anim.co
  + anim.nebula + anim.meteor + anim.wave + anim.rune;
console.log(`  同时动画的元素约 ${budget} 个（预算 ≤ 320）`);
if (budget > 320) { console.log(`  ❌ 动效元素过多 (${budget})，应减少同时动画的数量`); bad++; }
else console.log('  ✅ 动效开销在预算内');

/* 6c. 护栏：批量元素上禁止 filter: drop-shadow。
   SVG 的 filter 会为每个元素单独开辟离屏层并跑一遍模糊；90 个星体同时带 filter
   曾把页面拖到严重掉帧。这里静态扫描 CSS，防止这个坑被重新踩回来。 */
(function () {
  const css = fs.readFileSync(path.join(ROOT, 'css/theme.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const offenders = [];
  css.split('}').forEach(function (rule) {
    if (!/filter\s*:\s*drop-shadow/.test(rule)) return;
    const sel = (rule.split('{')[0] || '').split('\n').pop().trim();
    if (!/\.(sm-body|sm-pulse|sm-halo|sm-dust|sm-edge|sm-neb|sm-tick|sm-star|star)/.test(sel)) return;
    if (/:(hover|focus)|\.(hl|dragging|nb)\b/.test(sel)) return;  // 只作用于个别元素的状态样式可以接受
    offenders.push(sel);
  });
  console.log(`  批量 filter 检查: ${offenders.length} 处${offenders.length ? ' → ' + offenders.join(' / ') : ''}`);
  if (offenders.length) {
    console.log('  ❌ 批量元素上仍有 filter，会显著掉帧（应改用半透明圆盘或径向渐变）');
    bad++;
  } else {
    console.log('  ✅ 无批量 filter（星体 / 光点 / 连线都不再用 drop-shadow）');
  }
})();

/* 7. 每颗星的动效参数是错相的，否则会整片一起闪 */
const fdels = [...html.matchAll(/--fd:([\d.]+)s;--fdl:(-[\d.]+)s/g)].map(m => +m[2]);
const uniqDelays = new Set(fdels.map(v => v.toFixed(2))).size;
console.log(`  漂浮相位: ${fdels.length} 颗星，${uniqDelays} 个不同延迟` +
  `（范围 ${Math.min(...fdels).toFixed(2)} ~ ${Math.max(...fdels).toFixed(2)}s）`);
if (fdels.length === expected && uniqDelays < expected * 0.6) { console.log('  ❌ 动效相位太集中，会看起来成片同闪'); bad++; }
else console.log('  ✅ 动效相位错开，星点是各自独立地呼吸');

console.log('');
if (bad) { console.log(`❌ 星图布局自检未通过（${bad} 项）`); process.exit(1); }
console.log('✅ 星图布局自检通过');
