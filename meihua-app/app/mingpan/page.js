'use client';
import { useState, useRef, useEffect, useCallback } from "react";
import { astro } from 'iztro';

// ===== BILINGUAL UI TEXTS =====
const TX = {
  zh: {
    back: '← 返回', title: '命盘解析', langToggle: 'EN',
    inputTitle: '输入你的出生信息', birthday: '阳历生日', hour: '出生时辰', gender: '性别',
    male: '男', female: '女', submit: '一键排盘',
    hourNames: ['子时 (23-1)', '丑时 (1-3)', '寅时 (3-5)', '卯时 (5-7)', '辰时 (7-9)', '巳时 (9-11)',
      '午时 (11-13)', '未时 (13-15)', '申时 (15-17)', '酉时 (17-19)', '戌时 (19-21)', '亥时 (21-23)'],
    tab0: '综合人生', tab1: '年运解读',
    klineTitle: '人生 K 线图', ceiling: '上限', peak: '巅峰',
    lifeReading: '人生综合解读', advice: '注意事项', chartTitle: '紫微命盘',
    annualTitle: '年运解读', thisYear: '今年', nextYear: '明年',
    highlights: '利好', caution: '注意',
    career: '事业', love: '感情', wealth: '财运', health: '健康', children: '子女',
    fourHua: '生年四化', restart: '重新排盘',
    aiTitle: '问命师', aiPlaceholder: '问关于你命运的问题...', aiSend: '发送',
    aiLimit: '今日免费额度已用完 (3/3)，升级 $4.99/月 无限对话',
    footer: '紫微斗数 · AI 解读 · 仅供参考',
    levelGreat: '大吉', levelGood: '吉', levelWarn: '凶', levelMixed: '吉凶参半',
    noMajorStars: '空宫（借对宫星耀）',
  },
  en: {
    back: '← Back', title: 'Destiny Chart', langToggle: '中文',
    inputTitle: 'Enter Your Birth Info', birthday: 'Birthday (Solar)', hour: 'Birth Hour', gender: 'Gender',
    male: 'Male', female: 'Female', submit: 'Generate Chart',
    hourNames: ['Zi (23-1)', 'Chou (1-3)', 'Yin (3-5)', 'Mao (5-7)', 'Chen (7-9)', 'Si (9-11)',
      'Wu (11-13)', 'Wei (13-15)', 'Shen (15-17)', 'You (17-19)', 'Xu (19-21)', 'Hai (21-23)'],
    tab0: 'Life Reading', tab1: 'Annual Fortune',
    klineTitle: 'Life K-Line Chart', ceiling: 'Ceiling', peak: 'Peak',
    lifeReading: 'Life Overview', advice: 'Key Reminders', chartTitle: 'Zi Wei Chart',
    annualTitle: 'Annual Fortune', thisYear: 'This Year', nextYear: 'Next Year',
    highlights: 'Favorable', caution: 'Caution',
    career: 'Career', love: 'Love', wealth: 'Wealth', health: 'Health', children: 'Children',
    fourHua: 'Birth Year Transformations', restart: 'New Chart',
    aiTitle: 'Ask the Master', aiPlaceholder: 'Ask about your destiny...', aiSend: 'Send',
    aiLimit: 'Free quota reached (3/3). Upgrade $4.99/mo for unlimited.',
    footer: 'Zi Wei Dou Shu · AI Reading · For Reference Only',
    levelGreat: 'Auspicious', levelGood: 'Good', levelWarn: 'Warning', levelMixed: 'Mixed',
    noMajorStars: 'Empty (borrows opposite stars)',
  }
};

// ===== STYLE CONSTANTS =====
const C = { bg: "#f7f7f7", card: "#fff", t1: "#111", t2: "#555", t3: "#999",
  love: "#d44060", career: "#2563eb", health: "#16a34a", wealth: "#d97706", child: "#7c3aed",
  safe: "#16a34a", warn: "#ea580c", danger: "#dc2626" };
const DIM = {
  love: { zh: "爱情", en: "Love", c: C.love },
  career: { zh: "事业", en: "Career", c: C.career },
  health: { zh: "健康", en: "Health", c: C.health },
  wealth: { zh: "财富", en: "Wealth", c: C.wealth },
  children: { zh: "子女", en: "Children", c: C.child }
};
const sC = { background: C.card, border: "1px solid #eee", borderRadius: 10, padding: 14, marginBottom: 10 };
const HUA_COLOR = { "禄": C.safe, "权": C.danger, "科": C.career, "忌": "#888" };
const HUA_BG = { "禄": "#dcfce7", "权": "#fee2e2", "科": "#dbeafe", "忌": "#f3f4f6" };

// ===== STAR SCORING TABLES =====
const BRIGHT_SCORE = { '庙': 5, '旺': 4, '得': 3, '利': 2, '平': 1, '不': 0, '陷': -1 };
const MUTAGEN_SCORE = { '禄': 4, '权': 3, '科': 2, '忌': -4 };
const POS_MINOR = ['左辅', '右弼', '天魁', '天钺', '文昌', '文曲', '禄存', '天马'];
const NEG_MINOR = ['火星', '铃星', '地劫', '地空', '擎羊', '陀罗'];

// Dimension → which palaces affect it (primary, secondary, tertiary)
const DIM_PALACES = {
  career: ['官禄', '命宫', '迁移'],
  love: ['夫妻', '命宫', '福德'],
  wealth: ['财帛', '命宫', '田宅'],
  health: ['疾厄', '命宫', '父母'],
  children: ['子女', '命宫', '田宅'],
};
const DIM_WEIGHTS = [0.5, 0.3, 0.2]; // primary, secondary, tertiary

// ===== K-LINE CHART COMPONENT (Canvas) =====
function KLine({ data, lang }) {
  const cv = useRef(null), tip = useRef(null), box = useRef(null);
  const dk = Object.keys(DIM);
  const draw = useCallback(() => {
    const c = cv.current; if (!c || !data) return;
    const dp = window.devicePixelRatio || 1;
    const W = box.current.getBoundingClientRect().width, H = Math.min(360, window.innerHeight * 0.4);
    c.width = W * dp; c.height = H * dp; c.style.width = W + "px"; c.style.height = H + "px";
    const x = c.getContext("2d"); x.setTransform(dp, 0, 0, dp, 0, 0);
    const P = { t: 22, r: 18, b: 40, l: 42 }, PW = W - P.l - P.r, PH = H - P.t - P.b;
    let gM = 0;
    dk.forEach(k => { if (data[k]?.max) gM = Math.max(gM, data[k].max); });
    gM = Math.ceil(gM / 50) * 50 || 100;
    const toX = v => P.l + (v / 80) * PW, toY = v => P.t + (1 - v / gM) * PH;
    x.clearRect(0, 0, W, H);
    const st = gM <= 100 ? 20 : gM <= 200 ? 40 : gM <= 300 ? 50 : 100;
    for (let v = 0; v <= gM; v += st) { x.strokeStyle = "#eee"; x.lineWidth = 0.5; x.beginPath(); x.moveTo(P.l, toY(v)); x.lineTo(W - P.r, toY(v)); x.stroke(); x.fillStyle = "#bbb"; x.font = "9px -apple-system,sans-serif"; x.textAlign = "right"; x.fillText(v, P.l - 4, toY(v) + 3); }
    for (let v = 0; v <= 80; v += 10) {
      x.strokeStyle = "#f5f5f5"; x.beginPath(); x.moveTo(toX(v), P.t); x.lineTo(toX(v), H - P.b); x.stroke();
      x.fillStyle = "#999"; x.font = "9px -apple-system,sans-serif"; x.textAlign = "center";
      x.fillText(lang === "en" ? v : v + "岁", toX(v), H - P.b + 12);
    }
    if (data._curAge != null) { const a2 = toX(data._curAge); x.strokeStyle = "#ccc"; x.setLineDash([3, 3]); x.lineWidth = 1; x.beginPath(); x.moveTo(a2, P.t); x.lineTo(a2, H - P.b); x.stroke(); x.setLineDash([]); x.fillStyle = "#999"; x.font = "9px -apple-system,sans-serif"; x.textAlign = "center"; x.fillText(lang === "en" ? "← Now" : "← 当前", a2 + 18, P.t + 10); }
    const sm = (pts, col) => {
      const f = pts.filter(p => p[1] != null); if (f.length < 2) return;
      x.strokeStyle = col; x.lineWidth = 2; x.lineJoin = "round"; x.lineCap = "round";
      x.beginPath();
      for (let i = 0; i < f.length; i++) {
        if (i === 0) { x.moveTo(toX(f[i][0]), toY(f[i][1])); continue; }
        const t2 = 0.3, px = toX(f[i - 1][0]), py = toY(f[i - 1][1]), xx = toX(f[i][0]), yy = toY(f[i][1]);
        const ppx = i > 1 ? toX(f[i - 2][0]) : px, ppy = i > 1 ? toY(f[i - 2][1]) : py;
        const nx = i < f.length - 1 ? toX(f[i + 1][0]) : xx, ny = i < f.length - 1 ? toY(f[i + 1][1]) : yy;
        x.bezierCurveTo(px + (xx - ppx) * t2, py + (yy - ppy) * t2, xx - (nx - px) * t2, yy - (ny - py) * t2, xx, yy);
      }
      x.stroke();
      const g = x.createLinearGradient(0, P.t, 0, H - P.b); g.addColorStop(0, col + "0D"); g.addColorStop(1, col + "02");
      x.fillStyle = g; x.beginPath();
      for (let i = 0; i < f.length; i++) { if (i === 0) { x.moveTo(toX(f[i][0]), toY(f[i][1])); continue; } const t3 = 0.3, px2 = toX(f[i - 1][0]), py2 = toY(f[i - 1][1]), xx2 = toX(f[i][0]), yy2 = toY(f[i][1]); const ppx2 = i > 1 ? toX(f[i - 2][0]) : px2, ppy2 = i > 1 ? toY(f[i - 2][1]) : py2; const nx2 = i < f.length - 1 ? toX(f[i + 1][0]) : xx2, ny2 = i < f.length - 1 ? toY(f[i + 1][1]) : yy2; x.bezierCurveTo(px2 + (xx2 - ppx2) * t3, py2 + (yy2 - ppy2) * t3, xx2 - (nx2 - px2) * t3, yy2 - (ny2 - py2) * t3, xx2, yy2); }
      x.lineTo(toX(f[f.length - 1][0]), H - P.b); x.lineTo(toX(f[0][0]), H - P.b); x.closePath(); x.fill();
    };
    dk.forEach(k => { if (data[k]?.hide) return; sm(data[k]?.points || [], DIM[k]?.c || "#999"); });
    c._p = { P, PW, gM, toX, toY };
  }, [data, dk, lang]);
  useEffect(() => { draw(); window.addEventListener("resize", draw); return () => window.removeEventListener("resize", draw); }, [draw]);
  const mm = e => {
    const c2 = cv.current, t2 = tip.current; if (!c2?._p || !data) { if (t2) t2.style.display = "none"; return; }
    const r = c2.getBoundingClientRect(), mx = e.clientX - r.left, { P, PW } = c2._p;
    const xv = Math.round((mx - P.l) / PW * 80);
    if (xv < 0 || xv > 80) { t2.style.display = "none"; return; }
    const ip = (pts) => { if (!pts) return null; const f = pts.filter(p => p[1] != null); for (let i = 0; i < f.length - 1; i++) { if (xv >= f[i][0] && xv <= f[i + 1][0]) { const t3 = (xv - f[i][0]) / (f[i + 1][0] - f[i][0]); return Math.round(f[i][1] + t3 * (f[i + 1][1] - f[i][1])); } } return null; };
    let h = `<div style="font-weight:700;font-size:12px;border-bottom:1px solid #eee;padding-bottom:2px;margin-bottom:2px">${lang === "en" ? "Age " + xv : xv + "岁"}</div>`;
    let any = false;
    dk.forEach(k => { if (data[k]?.hide) return; const v = ip(data[k]?.points); if (v != null) { any = true; h += `<div style="display:flex;justify-content:space-between;font-size:11px"><span style="color:${DIM[k]?.c}">${DIM[k]?.[lang === "en" ? "en" : "zh"]}</span><span>${v}/${data[k].max}</span></div>`; } });
    if (!any) { t2.style.display = "none"; return; }
    t2.innerHTML = h; t2.style.display = "block"; let tx = mx + 12; if (tx + 160 > r.width) tx = mx - 170; t2.style.left = tx + "px"; t2.style.top = Math.max(2, e.clientY - r.top - 14) + "px";
  };
  return (<div ref={box} style={{ position: "relative" }}><canvas ref={cv} onMouseMove={mm} onMouseLeave={() => { if (tip.current) tip.current.style.display = "none"; }} style={{ width: "100%", cursor: "crosshair" }} /><div ref={tip} style={{ display: "none", position: "absolute", background: "#fff", border: "1px solid #e5e5e5", borderRadius: 5, padding: "5px 8px", fontSize: 11, pointerEvents: "none", zIndex: 100, minWidth: 130, boxShadow: "0 3px 10px rgba(0,0,0,.06)" }} /></div>);
}

// ===== PALACE GRID =====
function PalaceGrid({ astrolabe, lang }) {
  if (!astrolabe) return null;
  const palaces = astrolabe.palaces;
  const pm = { "巳": [0, 0], "午": [1, 0], "未": [2, 0], "申": [3, 0], "辰": [0, 1], "酉": [3, 1], "卯": [0, 2], "戌": [3, 2], "寅": [0, 3], "丑": [1, 3], "子": [2, 3], "亥": [3, 3] };
  const isEN = lang === 'en';
  const palaceNameEN = { '命宫': 'Life', '兄弟': 'Siblings', '夫妻': 'Spouse', '子女': 'Children', '财帛': 'Wealth', '疾厄': 'Health', '迁移': 'Travel', '交友': 'Friends', '官禄': 'Career', '田宅': 'Property', '福德': 'Fortune', '父母': 'Parents' };
  const isMing = (p) => p.earthlyBranch === astrolabe.earthlyBranchOfSoulPalace;
  const isBody = (p) => p.isBodyPalace;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gridTemplateRows: "repeat(4,1fr)", gap: 1, width: "100%", aspectRatio: "1", background: "#ddd", border: "1px solid #ccc", borderRadius: 4, overflow: "hidden" }}>
      {palaces.map(p => {
        const pos = pm[p.earthlyBranch] || [0, 0];
        const ming = isMing(p);
        const body = isBody(p);
        return (
          <div key={p.name} style={{ gridColumn: pos[0] + 1, gridRow: pos[1] + 1, background: ming ? "#fffbeb" : body ? "#f0fdf4" : "#fff", padding: "4px 5px", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: isEN ? 8 : 10, fontWeight: 600, color: ming ? "#b45309" : body ? "#15803d" : "#333", lineHeight: 1.2 }}>
                {isEN ? (palaceNameEN[p.name] || p.name) : p.name}
                {ming ? (isEN ? " ★" : " [命]") : ""}{body ? (isEN ? " ◎" : " [身]") : ""}
              </span>
              <span style={{ fontSize: 7, color: "#ccc" }}>{p.heavenlyStem}{p.earthlyBranch}</span>
            </div>
            <div style={{ flex: 1 }}>
              {p.majorStars.map((s, i) => (
                <div key={i} style={{ fontSize: isEN ? 9 : 11, fontWeight: 600, color: "#111", lineHeight: 1.2 }}>
                  {s.name}
                  {s.brightness && <span style={{ fontSize: 7, marginLeft: 2, color: "#aaa" }}>{s.brightness}</span>}
                  {s.mutagen && <span style={{ fontSize: 7, marginLeft: 2, padding: "0 2px", borderRadius: 2, background: HUA_BG[s.mutagen] || "#f3f4f6", color: HUA_COLOR[s.mutagen] || "#888" }}>{s.mutagen}</span>}
                </div>
              ))}
              {p.minorStars.length > 0 && <div style={{ fontSize: 8, color: "#bbb", lineHeight: 1.1, marginTop: 1 }}>{p.minorStars.map(s => s.name).join(" ")}</div>}
            </div>
            {p.decadal?.range && <div style={{ fontSize: 7, color: "#ddd", textAlign: "right" }}>{p.decadal.range[0]}-{p.decadal.range[1]}</div>}
          </div>
        );
      })}
      <div style={{ gridColumn: "2/4", gridRow: "2/4", background: "#fafafa", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 8, gap: 2 }}>
        <div style={{ fontSize: isEN ? 13 : 15, fontWeight: 800, letterSpacing: isEN ? 1 : 4 }}>{isEN ? "Zi Wei Dou Shu" : "紫微斗数"}</div>
        <div style={{ width: "40%", height: 1, background: "#ddd" }} />
        <div style={{ fontSize: 11, color: "#666", textAlign: "center", lineHeight: 1.5 }}>
          <strong>{astrolabe.chineseDate}</strong>
        </div>
        <div style={{ fontSize: 10, color: "#888" }}>{astrolabe.fiveElementsClass} · {astrolabe.zodiac}</div>
      </div>
    </div>
  );
}

// ===== SCORING ENGINE =====
function scorePalace(palace) {
  if (!palace) return 30;
  let s = 40;
  for (const star of palace.majorStars) {
    s += (BRIGHT_SCORE[star.brightness] || 1) * 5;
    if (star.mutagen) s += (MUTAGEN_SCORE[star.mutagen] || 0) * 3;
  }
  for (const star of palace.minorStars) {
    const n = star.name;
    if (POS_MINOR.some(p => n.includes(p))) s += 4;
    if (NEG_MINOR.some(p => n.includes(p))) s -= 4;
    if (star.mutagen) s += (MUTAGEN_SCORE[star.mutagen] || 0) * 2;
  }
  if (palace.majorStars.length === 0) s -= 8;
  return Math.max(5, Math.min(100, s));
}

function generateKLineFromChart(astrolabe) {
  const result = {};
  const birthYear = parseInt(astrolabe.solarDate.split('-')[0]);
  const now = new Date();
  const curAge = now.getFullYear() - birthYear;

  for (const [dim, palaceNames] of Object.entries(DIM_PALACES)) {
    // Score natal palaces
    const natalScores = palaceNames.map((pn, i) => {
      const p = astrolabe.palace(pn);
      return scorePalace(p) * DIM_WEIGHTS[i];
    });
    const natalBase = natalScores.reduce((a, b) => a + b, 0);

    // For each decade, get the decade palace and add its contribution
    const points = [];
    const palacesArr = astrolabe.palaces;

    for (let age = 0; age <= 80; age += 5) {
      // Find which decade this age falls in
      let decadePalace = null;
      for (const p of palacesArr) {
        if (p.decadal?.range && age >= p.decadal.range[0] && age <= p.decadal.range[1]) {
          decadePalace = p;
          break;
        }
      }

      let decadeBonus = 0;
      if (decadePalace) {
        decadeBonus = (scorePalace(decadePalace) - 40) * 0.5;
      }

      // Age growth curve: ramps up to peak, then declines
      let ageFactor;
      if (dim === 'health') {
        ageFactor = age <= 30 ? 0.9 + age * 0.003 : 1.0 - (age - 30) * 0.005;
      } else if (dim === 'children') {
        ageFactor = age < 20 ? 0 : age <= 40 ? (age - 20) * 0.05 : 1.0 - (age - 40) * 0.008;
      } else {
        ageFactor = age <= 10 ? 0.2 + age * 0.03 : age <= 50 ? 0.5 + (age - 10) * 0.0125 : 1.0 - (age - 50) * 0.006;
      }

      const raw = (natalBase + decadeBonus) * Math.max(0.1, ageFactor);
      const scaled = Math.round(raw * 3.5); // Scale to ~0-350 range
      points.push([age, dim === 'children' && age < 20 ? null : Math.max(5, Math.min(400, scaled))]);
    }

    // Find max and peak
    const validPts = points.filter(p => p[1] != null);
    const maxVal = Math.max(...validPts.map(p => p[1]));
    const peakPt = validPts.find(p => p[1] === maxVal);
    const peakAge = peakPt ? peakPt[0] : 40;

    result[dim] = {
      points,
      max: Math.ceil(maxVal / 50) * 50,
      peak: `${Math.max(0, peakAge - 5)}-${peakAge + 5}`,
      hide: false,
    };
  }

  result._curAge = curAge;
  return result;
}

// ===== LIFE READING GENERATOR =====
function generateLifeReading(astrolabe, lang) {
  const isEN = lang === 'en';
  const readings = [];
  const advice = [];

  // 命宫 reading
  const soul = astrolabe.palace('命宫');
  if (soul) {
    const stars = soul.majorStars.map(s => s.name).join(isEN ? ' + ' : '、');
    const mutagenStars = soul.majorStars.filter(s => s.mutagen);
    const mutagenText = mutagenStars.map(s => `${s.name}化${s.mutagen}`).join('、');
    readings.push({
      title: isEN ? `Life Palace: ${stars || 'Empty'}` : `命宫 · ${stars || '空宫'}`,
      text: isEN
        ? `Your Life Palace contains ${stars || 'no major stars'}. ${mutagenText ? `Key transformation: ${mutagenText}. ` : ''}This shapes your core personality and destiny trajectory. ${soul.majorStars.length === 0 ? 'An empty Life Palace borrows power from the opposite palace, making you adaptable.' : ''}`
        : `命宫坐${stars || '空宫'}。${mutagenText ? `关键四化：${mutagenText}。` : ''}这决定了你的核心性格和命运走向。${soul.majorStars.length === 0 ? '命宫空宫借对宫星耀，为人灵活多变。' : ''}`,
    });
  }

  // 财帛宫 reading
  const wealth = astrolabe.palace('财帛');
  if (wealth) {
    const stars = wealth.majorStars.map(s => s.name).join(isEN ? ' + ' : '、');
    readings.push({
      title: isEN ? `Wealth Palace: ${stars || 'Empty'}` : `财帛宫 · ${stars || '空宫'}`,
      text: isEN
        ? `Your Wealth Palace with ${stars || 'no major stars'} indicates your financial pattern. ${wealth.isBodyPalace ? '★ Your Body Palace falls in the Wealth Palace — extremely rare! Your life purpose is deeply tied to financial achievement.' : ''}`
        : `财帛宫坐${stars || '空宫'}，决定了你的财运模式。${wealth.isBodyPalace ? '★ 身宫落在财帛宫——极为罕见的格局！你一生的成就感与财富紧密绑定。' : ''}`,
    });
  }

  // 夫妻宫 reading
  const spouse = astrolabe.palace('夫妻');
  if (spouse) {
    const stars = spouse.majorStars.map(s => s.name).join(isEN ? ' + ' : '、');
    readings.push({
      title: isEN ? `Marriage Palace: ${stars || 'Empty'}` : `夫妻宫 · ${stars || '空宫'}`,
      text: isEN
        ? `Your Marriage Palace contains ${stars || 'no major stars'}. This reveals the nature of your romantic relationships and the type of partner most compatible with you.`
        : `夫妻宫坐${stars || '空宫'}。这揭示了你感情关系的本质和最适合你的伴侣类型。`,
    });
  }

  // 官禄宫 reading
  const career = astrolabe.palace('官禄');
  if (career) {
    const stars = career.majorStars.map(s => s.name).join(isEN ? ' + ' : '、');
    readings.push({
      title: isEN ? `Career Palace: ${stars || 'Empty'}` : `官禄宫 · ${stars || '空宫'}`,
      text: isEN
        ? `Your Career Palace with ${stars || 'no major stars'} shapes your professional path. ${career.majorStars.length === 0 ? 'An empty Career Palace borrows from the Wealth Palace — your career success is directly tied to money.' : ''}`
        : `官禄宫坐${stars || '空宫'}，塑造了你的事业路线。${career.majorStars.length === 0 ? '官禄宫空宫借对宫财帛之力——你的事业成就直接与赚钱挂钩。' : ''}`,
    });
  }

  // Generate advice from key patterns
  const horoscope = astrolabe.horoscope();
  const curDecade = horoscope?.decadal;
  if (curDecade) {
    advice.push(isEN
      ? `Current decade: ${curDecade.heavenlyStem}${curDecade.earthlyBranch} decade. Focus on leveraging this period's strengths.`
      : `当前大限：${curDecade.heavenlyStem}${curDecade.earthlyBranch}大限。把握好这个阶段的优势。`);
  }

  // Four transformations advice
  const fourHua = [];
  astrolabe.palaces.forEach(p => {
    p.majorStars.forEach(s => {
      if (s.mutagen && s.scope === 'origin') {
        fourHua.push({ star: s.name, type: s.mutagen, palace: p.name });
      }
    });
  });
  if (fourHua.find(h => h.type === '忌')) {
    const ji = fourHua.find(h => h.type === '忌');
    advice.push(isEN
      ? `Watch out: ${ji.star} Ji (忌) in ${ji.palace}. This area needs extra attention throughout life.`
      : `注意：${ji.star}化忌在${ji.palace}，此方面需要一生留意。`);
  }
  if (fourHua.find(h => h.type === '禄')) {
    const lu = fourHua.find(h => h.type === '禄');
    advice.push(isEN
      ? `Your blessing: ${lu.star} Lu (禄) in ${lu.palace}. This is your greatest natural advantage.`
      : `你的福报：${lu.star}化禄在${lu.palace}，这是你最大的天然优势。`);
  }

  return { readings, advice, fourHua };
}

// ===== ANNUAL READING GENERATOR =====
function generateAnnualReading(astrolabe, lang) {
  const isEN = lang === 'en';
  const now = new Date();
  const thisYear = now.getFullYear();
  const years = [thisYear, thisYear + 1];
  const results = [];

  for (const year of years) {
    const dateStr = `${year}-${now.getMonth() + 1}-${now.getDate()}`;
    let horo;
    try { horo = astrolabe.horoscope(dateStr); } catch { continue; }
    if (!horo) continue;

    const yearly = horo.yearly;
    const highlights = [];
    const cautions = [];

    // Check yearly mutagen (四化)
    if (yearly?.mutagen) {
      yearly.mutagen.forEach((starName, i) => {
        const types = ['禄', '权', '科', '忌'];
        if (i < 4 && starName) {
          const type = types[i];
          if (type === '禄' || type === '权') {
            highlights.push(isEN
              ? `${starName} gains ${type === '禄' ? 'Prosperity (禄)' : 'Authority (权)'} this year`
              : `${starName}化${type}，今年${type === '禄' ? '财运亨通' : '有权威加持'}`);
          } else if (type === '忌') {
            cautions.push(isEN
              ? `${starName} carries Obstruction (忌) — be cautious in related areas`
              : `${starName}化忌——相关方面需谨慎`);
          }
        }
      });
    }

    // Decade context
    const decadal = horo.decadal;
    if (highlights.length === 0) {
      highlights.push(isEN
        ? `${year} falls in the ${decadal?.heavenlyStem || ''}${decadal?.earthlyBranch || ''} decade`
        : `${year}年处于${decadal?.heavenlyStem || ''}${decadal?.earthlyBranch || ''}大限`);
    }

    // Determine level
    const luCount = yearly?.mutagen?.filter((_, i) => i === 0)?.length || 0;
    const jiCount = yearly?.mutagen?.filter((_, i) => i === 3)?.length || 0;
    let level = 'good';
    if (luCount > 0 && jiCount === 0) level = 'great';
    else if (jiCount > 0 && luCount === 0) level = 'warn';
    else if (jiCount > 0 && luCount > 0) level = 'mixed';

    results.push({
      year,
      ganZhi: `${yearly?.heavenlyStem || ''}${yearly?.earthlyBranch || ''}`,
      level,
      highlights,
      cautions,
    });
  }

  return results;
}

// ===== AI CHAT COMPONENT =====
function AIChat({ astrolabe, lang }) {
  const t = TX[lang];
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  const todayKey = `ai_count_${new Date().toDateString()}`;
  const getCount = () => parseInt(localStorage.getItem(todayKey) || '0');
  const incCount = () => { const c = getCount() + 1; localStorage.setItem(todayKey, c); return c; };

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const send = async () => {
    if (!input.trim() || loading) return;
    if (getCount() >= 3) return;
    const userMsg = input.trim();
    setInput('');
    setMsgs(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);
    incCount();

    // Build chart summary for AI
    const chartSummary = astrolabe ? JSON.stringify({
      date: astrolabe.chineseDate,
      gender: astrolabe.gender,
      fiveElements: astrolabe.fiveElementsClass,
      zodiac: astrolabe.zodiac,
      palaces: astrolabe.palaces.map(p => ({
        name: p.name,
        stars: p.majorStars.map(s => `${s.name}${s.brightness ? '(' + s.brightness + ')' : ''}${s.mutagen ? '化' + s.mutagen : ''}`),
        minor: p.minorStars.map(s => s.name),
        decade: p.decadal?.range,
      })),
    }) : '';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...msgs.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })), { role: 'user', content: userMsg }],
          chartData: chartSummary,
          lang,
        }),
      });
      const data = await res.json();
      setMsgs(prev => [...prev, { role: 'assistant', text: data.reply || (lang === 'en' ? 'Unable to respond.' : '暂时无法回答。') }]);
    } catch {
      setMsgs(prev => [...prev, { role: 'assistant', text: lang === 'en' ? 'Network error. Please try again.' : '网络错误，请重试。' }]);
    }
    setLoading(false);
  };

  const remaining = 3 - getCount();

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{ position: 'fixed', bottom: 20, right: 20, width: 56, height: 56, borderRadius: '50%', background: '#111', color: '#fff', border: 'none', fontSize: 24, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        💬
      </button>
    );
  }

  return (
    <div style={{ position: 'fixed', bottom: 0, right: 0, left: 0, height: '55vh', background: '#fff', borderTop: '1px solid #e5e5e5', borderRadius: '16px 16px 0 0', boxShadow: '0 -4px 20px rgba(0,0,0,0.1)', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #eee' }}>
        <span style={{ fontSize: 15, fontWeight: 700 }}>{t.aiTitle}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: remaining > 0 ? '#888' : C.danger }}>{remaining}/3</span>
          <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#999' }}>×</button>
        </div>
      </div>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {msgs.length === 0 && <div style={{ textAlign: 'center', color: '#ccc', fontSize: 13, marginTop: 40 }}>{lang === 'en' ? 'Ask anything about your destiny chart' : '问任何关于你命盘的问题'}</div>}
        {msgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
            <div style={{ maxWidth: '80%', padding: '10px 14px', borderRadius: 14, background: m.role === 'user' ? '#111' : '#f2f2f7', color: m.role === 'user' ? '#fff' : '#111', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && <div style={{ textAlign: 'center', color: '#ccc', fontSize: 12 }}>...</div>}
        <div ref={endRef} />
      </div>
      {/* Input */}
      {remaining > 0 ? (
        <div style={{ display: 'flex', gap: 8, padding: '10px 16px', borderTop: '1px solid #eee' }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder={t.aiPlaceholder} style={{ flex: 1, padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: 10, fontSize: 14, outline: 'none' }} />
          <button onClick={send} disabled={loading || !input.trim()} style={{ padding: '10px 18px', background: '#111', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.5 : 1 }}>{t.aiSend}</button>
        </div>
      ) : (
        <div style={{ padding: '14px 16px', borderTop: '1px solid #eee', textAlign: 'center', fontSize: 13, color: C.danger }}>{t.aiLimit}</div>
      )}
    </div>
  );
}

// ===== MAIN PAGE =====
export default function MingPanPage() {
  const [lang, setLang] = useState('zh');
  const [page, setPage] = useState('input'); // 'input' | 'result'
  const [tab, setTab] = useState(0); // 0=综合人生, 1=年运
  const [birthday, setBirthday] = useState('');
  const [hour, setHour] = useState(0);
  const [gender, setGender] = useState('女');
  const [chart, setChart] = useState(null); // iztro astrolabe
  const [kline, setKline] = useState(null);
  const [lifeData, setLifeData] = useState(null);
  const [annualData, setAnnualData] = useState(null);
  const t = TX[lang];

  const doChart = () => {
    if (!birthday) return;
    try {
      const a = astro.bySolar(birthday, hour, gender === '男' ? '男' : '女', true, 'zh-CN');
      setChart(a);
      setKline(generateKLineFromChart(a));
      setLifeData(generateLifeReading(a, lang));
      setAnnualData(generateAnnualReading(a, lang));
      setPage('result');
      setTab(0);
    } catch (err) {
      alert(lang === 'en' ? 'Invalid date or time. Please check.' : '日期或时间有误，请检查。');
    }
  };

  // Regenerate readings when language changes
  useEffect(() => {
    if (chart) {
      setLifeData(generateLifeReading(chart, lang));
      setAnnualData(generateAnnualReading(chart, lang));
    }
  }, [lang, chart]);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", color: C.t1 }}>
      <div style={{ maxWidth: 540, margin: "0 auto", padding: "0 16px" }}>

        {/* TOP BAR */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0 4px" }}>
          <a href="/" style={{ fontSize: 13, color: "#999", textDecoration: "none" }}>{t.back}</a>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{t.title}</span>
          <button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} style={{ padding: "5px 10px", background: "rgba(0,0,0,0.05)", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, color: "#555" }}>{t.langToggle}</button>
        </div>

        {/* ========== INPUT PAGE ========== */}
        {page === 'input' && (
          <div style={{ paddingTop: 20, paddingBottom: 60 }}>
            <div style={{ textAlign: 'center', marginBottom: 30 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>☯</div>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>{t.inputTitle}</h2>
            </div>
            <div style={{ ...sC, padding: 20 }}>
              {/* Birthday */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: C.t2, display: 'block', marginBottom: 6 }}>{t.birthday}</label>
                <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)} style={{ width: '100%', padding: 12, border: '1px solid #e5e5e5', borderRadius: 10, fontSize: 16, background: '#fafafa', color: C.t1 }} />
              </div>
              {/* Hour */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: C.t2, display: 'block', marginBottom: 6 }}>{t.hour}</label>
                <select value={hour} onChange={e => setHour(parseInt(e.target.value))} style={{ width: '100%', padding: 12, border: '1px solid #e5e5e5', borderRadius: 10, fontSize: 16, background: '#fafafa', color: C.t1 }}>
                  {t.hourNames.map((h, i) => <option key={i} value={i}>{h}</option>)}
                </select>
              </div>
              {/* Gender */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: C.t2, display: 'block', marginBottom: 6 }}>{t.gender}</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {['男', '女'].map(g => (
                    <button key={g} onClick={() => setGender(g)} style={{ flex: 1, padding: 12, border: gender === g ? '2px solid #111' : '1px solid #e5e5e5', borderRadius: 10, background: gender === g ? '#f5f5f5' : '#fff', fontSize: 15, fontWeight: gender === g ? 600 : 400, cursor: 'pointer', color: C.t1 }}>
                      {g === '男' ? t.male : t.female}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={doChart} disabled={!birthday} style={{ width: '100%', padding: 16, background: birthday ? '#111' : '#d1d1d6', color: '#fff', border: 'none', borderRadius: 12, fontSize: 17, fontWeight: 600, cursor: birthday ? 'pointer' : 'not-allowed' }}>{t.submit}</button>
          </div>
        )}

        {/* ========== RESULT PAGE ========== */}
        {page === 'result' && chart && (
          <div style={{ paddingBottom: 80 }}>
            {/* Info bar */}
            <div style={{ textAlign: 'center', padding: '12px 0', fontSize: 12, color: '#999' }}>
              {chart.chineseDate} · {chart.time} · {chart.fiveElementsClass} · {chart.zodiac} · {chart.sign}
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid #e5e5e5", marginBottom: 12, position: 'sticky', top: 0, background: C.bg, zIndex: 10 }}>
              {[t.tab0, t.tab1].map((tl, i) => (
                <button key={i} onClick={() => setTab(i)} style={{ flex: 1, padding: "12px 0", fontSize: 14, fontWeight: tab === i ? 600 : 400, color: tab === i ? "#111" : "#999", background: "none", border: "none", borderBottom: tab === i ? "2px solid #111" : "2px solid transparent", cursor: "pointer" }}>{tl}</button>
              ))}
            </div>

            {/* ===== TAB 0: 综合人生 ===== */}
            {tab === 0 && (<>
              {/* K-line */}
              {kline && (
                <div style={sC}>
                  <div style={{ fontSize: 14, fontWeight: 600, textAlign: "center", marginBottom: 8 }}>{t.klineTitle}</div>
                  <div style={{ display: "flex", justifyContent: "center", gap: 5, marginBottom: 8, flexWrap: "wrap" }}>
                    {Object.entries(DIM).map(([k, m]) => (
                      <button key={k} onClick={() => setKline(prev => ({ ...prev, [k]: { ...prev[k], hide: !prev[k]?.hide } }))} style={{ padding: "3px 10px", fontSize: 11, borderRadius: 12, border: `1px solid ${kline[k]?.hide ? "#ddd" : m.c}`, background: kline[k]?.hide ? "#f5f5f5" : "#fff", color: kline[k]?.hide ? "#ccc" : m.c, cursor: "pointer" }}>
                        {m[lang === "en" ? "en" : "zh"]}
                      </button>
                    ))}
                  </div>
                  <KLine data={kline} lang={lang} />
                  <div style={{ marginTop: 10 }}>
                    {Object.entries(DIM).map(([k]) => kline[k] && (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #f5f5f5", fontSize: 11 }}>
                        <span style={{ color: DIM[k]?.c, fontWeight: 500 }}>{DIM[k]?.[lang === "en" ? "en" : "zh"]}</span>
                        <span style={{ color: "#aaa" }}>{t.ceiling} {kline[k].max} · {t.peak} {kline[k].peak}{lang === 'zh' ? '岁' : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Life Readings */}
              {lifeData && (<>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, paddingBottom: 6, borderBottom: "2px solid #111" }}>{t.lifeReading}</div>
                {lifeData.readings.map((r, i) => (
                  <div key={i} style={{ ...sC, borderLeft: `3px solid ${[C.t1, C.wealth, C.love, C.career][i] || C.t2}` }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: "#222" }}>{r.title}</div>
                    {r.text.split("\n").filter(Boolean).map((p, j) => (
                      <p key={j} style={{ fontSize: 12.5, color: "#555", lineHeight: 1.9, margin: "0 0 6px" }}>{p}</p>
                    ))}
                  </div>
                ))}

                {lifeData.advice.length > 0 && (
                  <div style={{ ...sC, borderLeft: "3px solid #111", marginTop: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{t.advice}</div>
                    {lifeData.advice.map((a, i) => (
                      <p key={i} style={{ fontSize: 12, color: "#666", lineHeight: 1.7, margin: "0 0 3px" }}>· {a}</p>
                    ))}
                  </div>
                )}

                {/* Four Transformations */}
                {lifeData.fourHua.length > 0 && (
                  <div style={{ ...sC, marginTop: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{t.fourHua}</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {lifeData.fourHua.map((h, i) => (
                        <span key={i} style={{ fontSize: 12 }}>
                          {h.star}
                          <span style={{ fontSize: 8, marginLeft: 2, padding: "0 3px", borderRadius: 2, color: "#fff", background: HUA_COLOR[h.type] || "#888" }}>{h.type}</span>
                          <span style={{ color: "#bbb", fontSize: 10 }}>→{h.palace}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>)}

              {/* Palace Grid */}
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, paddingBottom: 6, borderBottom: "2px solid #111" }}>{t.chartTitle}</div>
                <PalaceGrid astrolabe={chart} lang={lang} />
              </div>
            </>)}

            {/* ===== TAB 1: 年运解读 ===== */}
            {tab === 1 && annualData && (<>
              {annualData.map((yr, yi) => (
                <div key={yi} style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, paddingBottom: 6, borderBottom: "2px solid #111" }}>
                    {yi === 0 ? t.thisYear : t.nextYear} · {yr.year} · {yr.ganZhi}
                  </div>

                  {/* Level badge */}
                  {(() => {
                    const lc = yr.level === "great" ? C.safe : yr.level === "good" ? C.career : yr.level === "warn" ? C.warn : C.wealth;
                    const lb = yr.level === "great" ? "#f0fdf4" : yr.level === "good" ? "#eff6ff" : yr.level === "warn" ? "#fef2f2" : "#fffbeb";
                    const lvLabel = yr.level === "great" ? t.levelGreat : yr.level === "good" ? t.levelGood : yr.level === "warn" ? t.levelWarn : t.levelMixed;
                    return (
                      <div style={{ display: 'inline-block', fontSize: 11, padding: "3px 10px", borderRadius: 10, background: lb, color: lc, fontWeight: 600, marginBottom: 10 }}>{lvLabel}</div>
                    );
                  })()}

                  {yr.highlights.length > 0 && (
                    <div style={{ ...sC, borderLeft: `3px solid ${C.safe}` }}>
                      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: C.safe }}>{t.highlights}</div>
                      {yr.highlights.map((h, i) => (
                        <p key={i} style={{ fontSize: 12, color: "#666", lineHeight: 1.7, margin: "0 0 2px" }}>✦ {h}</p>
                      ))}
                    </div>
                  )}

                  {yr.cautions.length > 0 && (
                    <div style={{ ...sC, borderLeft: `3px solid ${C.warn}` }}>
                      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: C.warn }}>{t.caution}</div>
                      {yr.cautions.map((h, i) => (
                        <p key={i} style={{ fontSize: 12, color: "#666", lineHeight: 1.7, margin: "0 0 2px" }}>⚠ {h}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </>)}

            {/* Restart button */}
            <button onClick={() => { setPage('input'); setChart(null); setKline(null); }} style={{ width: '100%', padding: 14, background: '#111', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 10 }}>{t.restart}</button>
          </div>
        )}

        <div style={{ textAlign: "center", fontSize: 10, color: "#ddd", padding: "16px 0 32px" }}>{t.footer}</div>
      </div>

      {/* AI Chat Floating Window */}
      {page === 'result' && chart && <AIChat astrolabe={chart} lang={lang} />}
    </div>
  );
}
