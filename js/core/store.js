/* ============================================================================
 * 本地数据存储 (store.js)
 *   用户 / 提交记录 / 每题最高分 / 知识点掌握度 / 模拟赛 / 错题本
 *   全部存 localStorage，纯前端零依赖。
 *
 *   知识点标记联动：
 *     - 每次提交若未满分 → 该题关联的知识点自动标记为 flagged（红卡：待巩固）
 *     - 用户可在知识图谱里手动标记 掌握 / 待巩固
 *     - 满分通关 → 若该知识点没有其他错的题，自动转为 mastered
 * ==========================================================================*/
(function (global) {
  'use strict';

  var KEY = 'csp-s-v5-store';
  var listeners = [];

  var defaultState = function () {
    return {
      version: 5,
      user: null,
      subs: [],                 // {sid, pid, verdict, score, passed, total, code, ms, ts}
      kstate: {},               // knowledgeId -> {state:'mastered'|'learning'|'flagged', wrong:0, right:0, ts}
      knote: {},                // knowledgeId -> 用户备注
      mock: null,               // {examId, endsAt, startAt, answers:{pid:score}}
      notes: {},                // pid -> 个人笔记
      favorites: {},            // pid -> true
      lastProblem: null,
      settings: { fontSize: 13, autoJudge: true, judgeEndpoint: 'https://wandbox.org/api/compile.json' }
    };
  };

  var S = defaultState();

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var o = JSON.parse(raw);
        S = Object.assign(defaultState(), o);
        S.settings = Object.assign(defaultState().settings, o.settings || {});
      }
    } catch (e) { S = defaultState(); }
    return S;
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* quota */ }
    listeners.forEach(function (fn) { try { fn(S); } catch (e) { } });
  }

  function onChange(fn) { listeners.push(fn); }

  /* ------------------------------------------------------------ 用户 --- */
  function login(name) {
    S.user = { name: String(name || '').trim().slice(0, 20) || '选手', ts: Date.now() };
    save();
    return S.user;
  }
  function logout() { S.user = null; save(); }

  /* ---------------------------------------------------------- 提交记录 --- */
  function nextId() { return 'S' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 90 + 10); }

  function addSubmission(sub) {
    sub.sid = sub.sid || nextId();
    sub.ts = sub.ts || Date.now();
    S.subs.unshift(sub);
    if (S.subs.length > 600) S.subs.length = 600;
    if (sub.verdict) applyKnowledge(sub);
    S.lastProblem = sub.pid;
    save();
    return sub;
  }

  /** 错题 → 知识点标红；满分 → 尝试转掌握 */
  function applyKnowledge(sub) {
    var probs = (global.CSP && global.CSP.problems) || [];
    var p = probs.filter(function (x) { return x.id === sub.pid; })[0];
    if (!p || !p.knowledge) return;
    var full = Number(sub.score) >= 100;
    p.knowledge.forEach(function (kid) {
      var k = S.kstate[kid] || (S.kstate[kid] = { state: 'none', wrong: 0, right: 0, ts: 0 });
      if (full) {
        k.right++;
        k.ts = Date.now();
        if (k.state !== 'flagged') k.state = 'mastered';
        else if (k.wrong > 0 && k.right >= k.wrong) { /* 仍需复习 */ }
      } else {
        k.wrong++;
        k.state = 'flagged';
        k.ts = Date.now();
      }
    });
  }

  function bestScore(pid) {
    var best = -1;
    S.subs.forEach(function (s) { if (s.pid === pid && s.score > best) best = s.score; });
    return best;
  }
  function attempts(pid) {
    var n = 0;
    S.subs.forEach(function (s) { if (s.pid === pid) n++; });
    return n;
  }
  /** 状态：null 未做 / 'part' 部分分 / 'done' 满分 / 'wa' 0 分 */
  function status(pid) {
    var b = bestScore(pid);
    if (b < 0) return null;
    if (b >= 100) return 'done';
    if (b > 0) return 'part';
    return 'wa';
  }
  function problemSubs(pid) {
    return S.subs.filter(function (s) { return s.pid === pid; });
  }
  function wrongBook() {
    var seen = {}, out = [];
    S.subs.forEach(function (s) {
      if (s.score >= 100) return;
      if (seen[s.pid]) return;
      var b = bestScore(s.pid);
      if (b >= 100) return;               // 后来满分了就不再算错题
      seen[s.pid] = 1;
      out.push(s.pid);
    });
    return out;
  }

  /* ------------------------------------------------------------ 知识点 --- */
  function kstate(id) { return S.kstate[id] || { state: 'none', wrong: 0, right: 0, ts: 0 }; }
  function setKstate(id, state) {
    var k = S.kstate[id] || (S.kstate[id] = { state: 'none', wrong: 0, right: 0, ts: 0 });
    k.state = state;
    k.ts = Date.now();
    save();
  }
  function flaggedKnowledge() {
    return Object.keys(S.kstate).filter(function (k) { return S.kstate[k].state === 'flagged'; });
  }
  function masteredKnowledge() {
    return Object.keys(S.kstate).filter(function (k) { return S.kstate[k].state === 'mastered'; });
  }
  /** 掌握度：mastered=1, learning=0.5, flagged=0.2, none=0 */
  function mastery() {
    var syl = (global.CSP && global.CSP.syllabus) || [];
    if (!syl.length) return { pct: 0, mastered: 0, total: 0 };
    var score = 0;
    syl.forEach(function (k) {
      var st = kstate(k.id).state;
      score += st === 'mastered' ? 1 : st === 'learning' ? 0.5 : st === 'flagged' ? 0.2 : 0;
    });
    return {
      pct: Math.round(score / syl.length * 100),
      mastered: masteredKnowledge().length,
      total: syl.length
    };
  }

  /* ------------------------------------------------------------ 模拟赛 --- */
  function startMock(examId, minutes) {
    S.mock = { examId: examId, startAt: Date.now(), endsAt: Date.now() + minutes * 60000, answers: {} };
    save();
    return S.mock;
  }
  function endMock() { S.mock = null; save(); }
  function mockRemain() {
    if (!S.mock) return 0;
    return Math.max(0, S.mock.endsAt - Date.now());
  }
  function mockRecord(examId, score, detail) {
    S.mockHistory = S.mockHistory || [];
    S.mockHistory.push({ examId: examId, score: score, ts: Date.now(), detail: detail });
    S.mock = null;
    save();
  }

  /* -------------------------------------------------------- 统计 / 导入 --- */
  function stats() {
    var probs = (global.CSP && global.CSP.problems) || [];
    var done = 0, part = 0, totalScore = 0, subs = S.subs.length, ac = 0;
    probs.forEach(function (p) {
      var st = status(p.id);
      if (st === 'done') done++;
      else if (st === 'part' || st === 'wa') part++;
      var b = bestScore(p.id);
      if (b > 0) totalScore += b;
    });
    S.subs.forEach(function (s) { if (s.score >= 100) ac++; });
    return {
      done: done, part: part, total: probs.length, subs: subs, ac: ac,
      totalScore: totalScore, maxScore: probs.length * 100,
      wrong: wrongBook().length, flagged: flaggedKnowledge().length,
      mastery: mastery()
    };
  }

  /** 最近 N 天活跃度（用于首页热力图） */
  function activity(days) {
    days = days || 28;
    var map = {}, now = new Date();
    for (var i = 0; i < days; i++) {
      var d = new Date(now.getTime() - i * 86400000);
      map[fmtDate(d)] = 0;
    }
    S.subs.forEach(function (s) {
      var k = fmtDate(new Date(s.ts));
      if (map[k] !== undefined) map[k]++;
    });
    var out = [];
    for (var j = days - 1; j >= 0; j--) {
      var dd = fmtDate(new Date(now.getTime() - j * 86400000));
      out.push({ date: dd, n: map[dd] });
    }
    return out;
  }
  function fmtDate(d) {
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
  }

  function reset(all) {
    if (all) { S = defaultState(); }
    else { S.subs = []; S.kstate = {}; S.knote = {}; S.notes = {}; S.favorites = {}; S.mockHistory = []; S.mock = null; }
    save();
  }

  function exportJSON() { return JSON.stringify(S, null, 2); }
  function importJSON(txt) {
    var o = JSON.parse(txt);
    S = Object.assign(defaultState(), o);
    save();
  }

  global.CSP = global.CSP || {};
  global.CSP.store = {
    S: function () { return S; },
    load: load, save: save, onChange: onChange,
    login: login, logout: logout,
    addSubmission: addSubmission, bestScore: bestScore, attempts: attempts,
    status: status, problemSubs: problemSubs, wrongBook: wrongBook,
    kstate: kstate, setKstate: setKstate, flaggedKnowledge: flaggedKnowledge,
    masteredKnowledge: masteredKnowledge, mastery: mastery,
    startMock: startMock, endMock: endMock, mockRemain: mockRemain, mockRecord: mockRecord,
    stats: stats, activity: activity, fmtDate: fmtDate,
    reset: reset, exportJSON: exportJSON, importJSON: importJSON
  };
})(typeof window !== 'undefined' ? window : globalThis);
