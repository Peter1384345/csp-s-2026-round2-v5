/* ============================================================================
 * C++ 参考解 · 独立验证 (tools/verify-cpp.js)
 *   把每题 std.code 拿到 Wandbox 真实编译运行，与 tests[i].output 逐字节比对。
 *   这是对出题 agent 自测结果的独立复核（Lead 侧验收）。
 *   用法: node tools/verify-cpp.js [--only p01,p02] [--force]
 *   结果缓存在 tools/.cppverify.json，避免重复请求。
 * ==========================================================================*/
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const CACHE_FILE = path.join(__dirname, '.cppverify.json');
const force = process.argv.includes('--force');
const onlyArg = process.argv.find(a => a.startsWith('--only'));
const only = onlyArg ? (onlyArg.split('=')[1] || '').split(',').filter(Boolean) : null;

/* ---- 加载数据 ---- */
const win = {}; win.window = win;
const ctx = vm.createContext(win);
['js/data/syllabus.js', 'js/data/problems-A.js', 'js/data/problems-B.js', 'js/data/problems-C.js',
  'js/data/problems-D.js', 'js/data/problems-E.js',
  'js/data/problems-F.js', 'js/data/problems-G.js', 'js/data/problems-H.js'].forEach(f => {
    try { vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f }); }
    catch (e) { console.log(`⚠ 跳过 ${f}: ${e.message.split('\n')[0]}`); }
  });
const problems = (win.CSP.problems || []).filter(p => p && p.std && p.std.code && p.tests);

let cache = {};
if (!force && fs.existsSync(CACHE_FILE)) {
  try { cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')); } catch (e) { cache = {}; }
}
function saveCache() { try { fs.writeFileSync(CACHE_FILE, JSON.stringify(cache)); } catch (e) { } }

function norm(s) {
  return String(s == null ? '' : s).replace(/\r\n?/g, '\n')
    .split('\n').map(l => l.replace(/\s+$/, '')).join('\n').replace(/\n+$/, '').trim();
}
function h(s) { let x = 5381, i = s.length; while (i) x = (x * 33) ^ s.charCodeAt(--i); return (x >>> 0).toString(36) + s.length; }

function isCapacity(msg) {
  return /OCI runtime error|crun|Resource temporarily unavailable|timeout|Service Unavailable|429|502|503|504/i.test(String(msg || ''));
}

async function compileAndRun(code, stdin, attempt = 0) {
  try {
    const r = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ compiler: 'gcc-13.2.0', code, stdin })
    });
    if (r.status === 429 || r.status >= 500) throw new Error('http ' + r.status);
    const j = await r.json();
    const cerr = (j.compiler_error || '').trim();
    const perr = (j.program_error || '').trim();
    // 编译服务本身容量不足 → 重试，不能当作 CE/RE
    if (isCapacity(cerr) || isCapacity(perr)) {
      if (attempt < 6) {
        await new Promise(ok => setTimeout(ok, 2000 * (attempt + 1)));
        return compileAndRun(code, stdin, attempt + 1);
      }
      return { verdict: 'NETERR', error: '编译服务容量不足: ' + (cerr || perr).slice(0, 120) };
    }
    if (cerr) return { verdict: 'CE', error: cerr.slice(0, 500) };
    if (j.status !== 0 && j.status != null) return { verdict: 'RE', error: String(perr || j.program_message || '').slice(0, 300) };
    return { verdict: 'OK', output: j.program_output || '' };
  } catch (e) {
    if (attempt < 6) {
      await new Promise(ok => setTimeout(ok, 2000 * (attempt + 1)));
      return compileAndRun(code, stdin, attempt + 1);
    }
    return { verdict: 'NETERR', error: e.message };
  }
}

async function main() {
  const list = only ? problems.filter(p => only.includes(p.id)) : problems;
  console.log(`待验证题目: ${list.length}，测试点: ${list.reduce((s, p) => s + p.tests.length, 0)}`);
  let pass = 0, fail = 0, net = 0, cached = 0;
  const failures = [];

  const tasks = [];
  list.forEach(p => p.tests.forEach((t, i) => tasks.push({ p, t, i })));

  let idx = 0;
  async function worker() {
    while (idx < tasks.length) {
      const job = tasks[idx++];
      const key = h(job.p.std.code) + '|' + h(job.t.input);
      let res = cache[key];
      if (res && !force) cached++;
      else {
        res = await compileAndRun(job.p.std.code, job.t.input);
        cache[key] = res;
        if ((pass + fail) % 10 === 0) saveCache();
      }
      if (res.verdict === 'NETERR') { net++; failures.push(`${job.p.id} #${job.i + 1} 网络失败: ${res.error}`); continue; }
      if (res.verdict !== 'OK') { fail++; failures.push(`${job.p.id} #${job.i + 1} ${res.verdict}: ${res.error}`); continue; }
      if (norm(res.output) !== norm(job.t.output)) {
        fail++;
        failures.push(`${job.p.id} #${job.i + 1} 输出不一致\n      期望: ${JSON.stringify(norm(job.t.output).slice(0, 160))}\n      实际: ${JSON.stringify(norm(res.output).slice(0, 160))}`);
      } else pass++;
      process.stdout.write(`\r  进度 ${pass + fail + net}/${tasks.length}  通过 ${pass}  失败 ${fail}  `);
    }
  }
  await Promise.all([worker(), worker()]);
  saveCache();

  console.log('\n' + '='.repeat(72));
  console.log(`C++ 独立验证：通过 ${pass} / ${pass + fail + net}   失败 ${fail}   网络失败 ${net}   （缓存命中 ${cached}）`);
  if (failures.length) {
    console.log('\n失败明细：');
    failures.forEach(f => console.log('  - ' + f));
    process.exit(1);
  }
  console.log('✅ 全部测试点均与 C++ 参考程序输出一致');
}
main();
