// 金钱卦 (Coin Divination) calculation engine
// Separate from Plum Blossom (梅花易数) — builds hexagram directly from coin values
// and applies the 变爻断卦规则 (0-6 changing lines decision tree)

import { BAGUA, WUXING, HEXAGRAMS, HEX_NAMES_EN, GUA_GUIDANCE, findG } from './hexData';

// Yao position names (for display)
const YAO_POS_ZH = ['初', '二', '三', '四', '五', '上'];
const YAO_POS_EN = ['1st', '2nd', '3rd', '4th', '5th', '6th'];
function yaoTitle(pos, isYang) {
  const prefix = isYang ? '九' : '六';
  if (pos === 0) return '初' + prefix;
  if (pos === 5) return '上' + prefix;
  return prefix + YAO_POS_ZH[pos];
}
function yaoTitleEn(pos, isYang) {
  return `${YAO_POS_EN[pos]} line (${isYang ? 'Yang' : 'Yin'})`;
}

/**
 * 变爻断卦规则 — determine what to read based on number of changing lines
 * @param {object} oHex - original hexagram data from HEXAGRAMS
 * @param {object} cHex - changed hexagram data from HEXAGRAMS
 * @param {number[]} changingLines - 0-based indices of changing lines
 * @param {boolean[]} oIsYang - original line yin/yang for each position
 * @returns {object} readingFocus
 */
function getReadingFocus(oHex, cHex, changingLines, oIsYang) {
  const n = changingLines.length;
  const stableLines = [0, 1, 2, 3, 4, 5].filter(i => !changingLines.includes(i));

  switch (n) {
    case 0:
      return {
        type: 'guaCi',
        ruleZh: '六爻皆不变，以本卦卦辞断。',
        ruleEn: 'No changing lines — read the primary hexagram oracle.',
        primary: { source: 'ben', content: 'guaCi' },
      };

    case 1:
      return {
        type: 'singleYao',
        ruleZh: `一爻变（${yaoTitle(changingLines[0], oIsYang[changingLines[0]])}），以本卦该变爻爻辞断。`,
        ruleEn: `One changing line (${yaoTitleEn(changingLines[0], oIsYang[changingLines[0]])}) — read that line's text from the primary hexagram.`,
        primary: { source: 'ben', content: 'yaoCi', positions: changingLines },
      };

    case 2: {
      const upper = Math.max(changingLines[0], changingLines[1]);
      const lower = Math.min(changingLines[0], changingLines[1]);
      return {
        type: 'twoYao',
        ruleZh: `二爻变，以本卦两变爻爻辞断，${yaoTitle(upper, oIsYang[upper])}为主、${yaoTitle(lower, oIsYang[lower])}为辅。`,
        ruleEn: `Two changing lines — read both lines' texts from the primary hexagram. ${yaoTitleEn(upper, oIsYang[upper])} is primary.`,
        primary: { source: 'ben', content: 'yaoCi', positions: [upper], primaryIdx: upper },
        secondary: { source: 'ben', content: 'yaoCi', positions: [lower] },
      };
    }

    case 3:
      return {
        type: 'bothGuaCi',
        ruleZh: '三爻变，本卦卦辞为主、变卦卦辞为辅。',
        ruleEn: 'Three changing lines — primary hexagram oracle is main, changed hexagram oracle is secondary.',
        primary: { source: 'ben', content: 'guaCi' },
        secondary: { source: 'bian', content: 'guaCi' },
      };

    case 4: {
      const lowerStable = Math.min(stableLines[0], stableLines[1]);
      const upperStable = Math.max(stableLines[0], stableLines[1]);
      // Note: for 4 changing lines, read 变卦 stable lines. The yin/yang of stable lines in 变卦 is same as 本卦.
      return {
        type: 'twoStableYao',
        ruleZh: `四爻变，以变卦两不变爻爻辞断，${yaoTitle(lowerStable, oIsYang[lowerStable])}为主、${yaoTitle(upperStable, oIsYang[upperStable])}为辅。`,
        ruleEn: `Four changing lines — read the two stable lines from the changed hexagram. ${yaoTitleEn(lowerStable, oIsYang[lowerStable])} is primary.`,
        primary: { source: 'bian', content: 'yaoCi', positions: [lowerStable], primaryIdx: lowerStable },
        secondary: { source: 'bian', content: 'yaoCi', positions: [upperStable] },
      };
    }

    case 5:
      return {
        type: 'singleStableYao',
        ruleZh: `五爻变，以变卦唯一不变爻（${yaoTitle(stableLines[0], oIsYang[stableLines[0]])}）爻辞断。`,
        ruleEn: `Five changing lines — read the one stable line (${yaoTitleEn(stableLines[0], oIsYang[stableLines[0]])}) from the changed hexagram.`,
        primary: { source: 'bian', content: 'yaoCi', positions: stableLines },
      };

    case 6:
      if (oHex?.name === '乾为天') {
        return {
          type: 'yongJiu',
          ruleZh: '乾卦六爻全变，看用九：见群龙无首，吉。',
          ruleEn: 'All six lines change in Qian — read the special "Use of Nines": A group of dragons without a leader. Auspicious.',
          primary: { source: 'ben', content: 'yongJiu' },
        };
      }
      if (oHex?.name === '坤为地') {
        return {
          type: 'yongLiu',
          ruleZh: '坤卦六爻全变，看用六：利永贞。',
          ruleEn: 'All six lines change in Kun — read the special "Use of Sixes": Beneficial to remain steadfast forever.',
          primary: { source: 'ben', content: 'yongLiu' },
        };
      }
      return {
        type: 'bianGuaCi',
        ruleZh: '六爻全变（非乾坤），以变卦卦辞断。',
        ruleEn: 'All six lines change — read the changed hexagram oracle.',
        primary: { source: 'bian', content: 'guaCi' },
      };

    default:
      return { type: 'guaCi', ruleZh: '以本卦卦辞断。', ruleEn: 'Read the primary hexagram oracle.', primary: { source: 'ben', content: 'guaCi' } };
  }
}

/**
 * Extract the actual text content for a reading focus
 */
function extractReadingTexts(readingFocus, oHex, cHex, lang) {
  const texts = [];
  const isEn = lang === 'en';

  const extractOne = (spec) => {
    if (!spec) return null;
    const hex = spec.source === 'ben' ? oHex : cHex;
    if (!hex) return null;

    if (spec.content === 'guaCi') {
      return {
        label: spec.source === 'ben'
          ? (isEn ? 'Primary Hexagram Oracle' : '本卦卦辞')
          : (isEn ? 'Changed Hexagram Oracle' : '变卦卦辞'),
        text: isEn ? (hex.guaEn || hex.gua) : hex.gua,
        xiang: isEn ? (hex.xiangEn || hex.xiang) : hex.xiang,
      };
    }
    if (spec.content === 'yongJiu' && hex.yongJiu) {
      return {
        label: isEn ? 'Use of Nines (用九)' : '用九',
        text: isEn ? (hex.yongJiu.meaningEn || hex.yongJiu.meaning || hex.yongJiu.text) : hex.yongJiu.text,
        meaning: isEn ? (hex.yongJiu.meaningEn || hex.yongJiu.meaning) : hex.yongJiu.meaning,
      };
    }
    if (spec.content === 'yongLiu' && hex.yongLiu) {
      return {
        label: isEn ? 'Use of Sixes (用六)' : '用六',
        text: isEn ? (hex.yongLiu.meaningEn || hex.yongLiu.meaning || hex.yongLiu.text) : hex.yongLiu.text,
        meaning: isEn ? (hex.yongLiu.meaningEn || hex.yongLiu.meaning) : hex.yongLiu.meaning,
      };
    }
    if (spec.content === 'yaoCi' && hex.yao && spec.positions) {
      return spec.positions.map(pos => {
        const y = hex.yao[pos];
        if (!y) return null;
        return {
          label: isEn ? (y.posEn || y.pos) : y.pos,
          text: isEn ? (y.textEn || y.text) : y.text,
          mean: isEn ? (y.meanEn || y.mean) : y.mean,
          vernacular: isEn ? (y.vernacularEn || y.vernacular) : y.vernacular,
          pos,
          isPrimary: spec.primaryIdx === pos,
        };
      }).filter(Boolean);
    }
    return null;
  };

  return {
    primary: extractOne(readingFocus.primary),
    secondary: extractOne(readingFocus.secondary),
  };
}

/**
 * Ti-Yong analysis for coin divination (supplementary, not primary)
 * Only meaningful when changing lines are concentrated in one trigram
 */
function coinTiYong(oIsYang, changingLines) {
  if (changingLines.length === 0 || changingLines.length === 6) return null;

  const lowerHas = changingLines.some(i => i < 3);
  const upperHas = changingLines.some(i => i >= 3);

  const lGua = findG(oIsYang.slice(0, 3).map(y => y ? 1 : 0));
  const uGua = findG(oIsYang.slice(3, 6).map(y => y ? 1 : 0));

  let ti, yong;
  if (lowerHas && !upperHas) {
    ti = uGua; yong = lGua;
  } else if (upperHas && !lowerHas) {
    ti = lGua; yong = uGua;
  } else {
    // Both trigrams have changing lines — use the one with fewer changes as ti
    const lc = changingLines.filter(i => i < 3).length;
    const uc = changingLines.filter(i => i >= 3).length;
    if (lc < uc) { ti = lGua; yong = uGua; }
    else if (uc < lc) { ti = uGua; yong = lGua; }
    else return null; // equal changes, no clear ti/yong
  }

  if (!ti || !yong) return null;

  let relKey = '', lv = '';
  if (ti.element === yong.element) { relKey = 'bihe'; lv = 'n'; }
  else if (WUXING[yong.element]?.sheng === ti.element) { relKey = 'yongShengTi'; lv = 'g'; }
  else if (WUXING[ti.element]?.sheng === yong.element) { relKey = 'tiShengYong'; lv = 'c'; }
  else if (WUXING[yong.element]?.ke === ti.element) { relKey = 'yongKeTi'; lv = 'w'; }
  else if (WUXING[ti.element]?.ke === yong.element) { relKey = 'tiKeYong'; lv = 'ok'; }

  return { ti, yong, relKey, lv };
}

/**
 * Main coin hexagram calculation
 * @param {number[]} yaoValues - 6 values (6/7/8/9), index 0 = first toss = bottom line
 * @param {string} question - user's question
 * @returns {object} result compatible with page.js display
 */
export function calcCoinHex(yaoValues, question) {
  // 1. Build original hexagram lines directly from yao values
  const oIsYang = yaoValues.map(v => v === 9 || v === 7);
  const oLines = oIsYang.map(y => y ? 1 : 0);

  // 2. Identify changing lines (老阳9=changes, 老阴6=changes)
  const changingLines = [];
  yaoValues.forEach((v, i) => {
    if (v === 9 || v === 6) changingLines.push(i);
  });
  const numChanging = changingLines.length;

  // 3. Build changed hexagram (flip changing lines)
  const cLines = oLines.map((l, i) => changingLines.includes(i) ? (l === 1 ? 0 : 1) : l);

  // 4. Look up hexagrams
  const oHex = HEXAGRAMS[oLines.join('')] || { name: '未知卦', nameEn: 'Unknown' };
  const cHex = HEXAGRAMS[cLines.join('')] || { name: '未知卦', nameEn: 'Unknown' };

  // 5. Extract trigrams
  const lGua = findG(oLines.slice(0, 3));
  const uGua = findG(oLines.slice(3, 6));
  const cL = findG(cLines.slice(0, 3));
  const cU = findG(cLines.slice(3, 6));

  // 6. Apply 变爻断卦规则
  const readingFocus = getReadingFocus(oHex, cHex, changingLines, oIsYang);

  // 7. Ti-Yong analysis (supplementary for coin divination)
  const tiYongResult = coinTiYong(oIsYang, changingLines);
  const ti = tiYongResult?.ti || uGua;
  const yong = tiYongResult?.yong || lGua;
  const relKey = tiYongResult?.relKey || '';
  const lv = tiYongResult?.lv || '';

  // 8. Mutual hexagram (互卦)
  const huLower = findG([oLines[1], oLines[2], oLines[3]]);
  const huUpper = findG([oLines[2], oLines[3], oLines[4]]);

  return {
    method: 'coin',
    input: yaoValues.join(''),
    question,
    yaoValues,
    changingLines,
    numChanging,
    oLines,
    cLines,
    oHex,
    cHex,
    uGua: uGua ? { n: uGua.n, ...uGua } : null,
    lGua: lGua ? { n: lGua.n, ...lGua } : null,
    cU,
    cL,
    ti,
    yong,
    relKey,
    lv,
    readingFocus,
    huLower,
    huUpper,
    // Compatibility: use first changing line for display highlight, or 0
    chg: changingLines.length > 0 ? changingLines[0] + 1 : 0,
  };
}

export { getReadingFocus, extractReadingTexts, yaoTitle, yaoTitleEn };
