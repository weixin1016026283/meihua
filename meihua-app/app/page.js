"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
const CoinToss = dynamic(() => import('../components/CoinToss'), { ssr: false });
import { HEX_NAMES_EN, BAGUA, WUXING, GUA_GUIDANCE, HEXAGRAMS, SHICHEN, getShichen, findG } from '../lib/hexData';
import { calcCoinHex } from '../lib/calcCoin';
import { CITIES, REGION_LABELS, REGION_ORDER, CITY_COUNTRY, filterCities } from '../lib/cities';

// ==================== 语言配置 ====================
const i18n = {
  zh: {
    title: 'Ask Anything', subtitle: '心诚则灵 · 融会古今智慧', mingpanLink: '命盘解析',
    landingTitle: '星问 · StarAsk', landingSubtitle: '问天问地问自己',
    askCard: '有问必答', askDesc: '一个问题，60秒给你方向', askAction: '立即占问',
    askPromo: '融合周易古智慧与AI，给你清晰的下一步建议',
    askFit: '适合：当下决策 / 感情纠结 / 工作选择',
    mingpanCard: '人生解读', mingpanDesc: '看未来1-10年的人生趋势与节奏', backToHome: '← 返回',
    mingpanPromo: '基于你的出生信息，生成专属的性格、事业、感情、财运完整报告',
    mingpanFit: '适合：长期规划 / 职业路径 / 关系模式',
    lifeInputTitle: '输入你的出生信息',
    lifeBirthday: '阳历生日', lifeHour: '出生时辰', lifeGender: '性别',
    lifeMale: '男', lifeFemale: '女', lifeSubmit: '生成解读',
    lifeBirthPlace: '出生地', lifeCitySearch: '搜索城市...',
    lifeHourNames: ['子时 (23-1)', '丑时 (1-3)', '寅时 (3-5)', '卯时 (5-7)', '辰时 (7-9)', '巳时 (9-11)',
      '午时 (11-13)', '未时 (13-15)', '申时 (15-17)', '酉时 (17-19)', '戌时 (19-21)', '亥时 (21-23)'],
    time: '时间', shichen: '时辰', num: '数',
    question: '所问之事', questionPlaceholder: '输入你想占问的事情...',
    questionTip: '心中默念三遍你要问的问题，保持专注。问题越具体，解读越准确。',
    inputLabel: '起卦数字', inputPlaceholder: '输入2–10位数字，如 36、888、52019…',
    inputTip: '想一个和你所问之事有关联的数字。或者，默念三遍你的问题，脑海中浮现的第一个数字。',
    calculate: '起卦', asked: '所问：',
    originalHex: '本卦', changedHex: '变卦',
    guaCi: '卦辞', xiangYue: '象曰', tuan: '彖传',
    philosophy: '卦象哲理', vernacular: '白话解释',
    duanyi: '断易天机', shaoYong: '邵雍解', fuPeiRong: '傅佩荣解',
    traditional: '传统解卦', yaoDetail: '六爻详解', clickExpand: '（点击展开）',
    dongYao: '动爻', tiyongAnalysis: '体用分析',
    tiGua: '体卦（自身）', yongGua: '用卦（所测）', restart: '重新起卦',
    footer: '梅花易数 · 卦辞取自《周易》原典',
    feedback: '反馈 · 微信：weixin407367 · Instagram：wei___xinnnnie',
    aiTitle: 'AI 解卦大师',
    aiWelcome: '我是AI解卦大师，精通梅花易数。你可以针对这个卦象问我任何问题，我会结合卦理给你具体的建议。',
    aiPlaceholder: '问关于这个卦象的问题...',
    aiSend: '发送',
    aiLimit: '本月免费次数已用完',
    aiExamples: ['这个卦象对我的问题来说是好是坏？', '这件事什么时候会有结果？', '根据卦象我应该怎么做？'],
    upgrade: '解锁无限提问',
    upgradePrice: '$4.99/月',
    upgradePriceYear: '$39/年',
    mostPopular: '最受欢迎',
    paywallBullets: ['精确时机窗口（什么时候行动）', '个性化行动方案（下一步怎么做）', '无限AI追问解读'],
    cancelSub: '取消订阅', cancelConfirm: '确定要取消订阅吗？取消后将在当前计费周期结束后失效。', cancelSuccess: '订阅已取消，将在计费周期结束后失效。', cancelFail: '取消失败，请重试。',
    aiAutoLoading: 'AI正在解读你的卦象...', aiAutoLabel: 'AI解读',
    tradLabels: { daxiang: '大象', yunshi: '运势', shiye: '事业', jingshang: '经商', qiuming: '求名', hunlian: '婚恋', juece: '决策' },
    fuLabels: { shiyun: '时运', caiyun: '财运', jiazhai: '家宅', shenti: '身体' },
    yaoLabels: { xiang: '象曰', vernacular: '白话', shaoYong: '邵雍解', biangua: '变卦', zhexue: '哲学含义', story: '历史典故' },
    elements: { '金': '金', '木': '木', '水': '水', '火': '火', '土': '土' },
    shichenNames: ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'],
    relations: { bihe: '体用比和', yongShengTi: '用生体', tiShengYong: '体生用', yongKeTi: '用克体', tiKeYong: '体克用' },
    fortunes: { bihe: '平稳之象，事可成就。', yongShengTi: '大吉！有贵人相助，事半功倍。', tiShengYong: '耗泄之象，需付出努力。', yongKeTi: '不利，宜守不宜进。', tiKeYong: '有利，可主动出击。' },
    invalidInput: '请至少输入2位数字',
    reading: '卦象解读',
    readingCurrent: '当前状况',
    readingInner: '内在实质',
    readingOuter: '外在表现',
    readingResult: '发展结果',
    readingAdvice: '建议',
    // 智能解读新增
    readingBenGua: '本卦（当前状况）',
    readingTiYong: '体用分析（核心判断）',
    readingTi: '体卦（你）',
    readingYong: '用卦（事）',
    readingBianGua: '变卦（最终结果）',
    readingForYou: '针对你的问题',
    horaryTitle: '占星解读',
    horaryForYou: '占星：针对你的问题',
    readingReason: '查看解卦依据',
    readingReasonTitle: '解卦依据',
    fortuneLabels: { great: '大吉', good: '吉', neutral: '平', effort: '需努力', bad: '不利' },
    tiYongLabels: {
      yongShengTi: '用生体（大吉）',
      tiKeYong: '体克用（小吉）',
      bihe: '体用比和',
      tiShengYong: '体生用（耗泄）',
      yongKeTi: '用克体（不利）'
    },
    tiYongDesc: {
      yongShengTi: '用卦五行生体卦五行，外部环境助力于你，事情不费力即可成功。',
      tiKeYong: '体卦五行克用卦五行，你能掌控局面，事情可成但需费力。',
      bihe: '体卦与用卦五行相同，双方势均力敌，事情平稳顺遂。',
      tiShengYong: '体卦五行生用卦五行，你的精力会外泄到事情上，需要付出较多努力。',
      yongKeTi: '用卦五行克体卦五行，外部力量压制你，事情难以顺利进行。'
    },
    bianGuaLabels: {
      shengTi: '变卦生体',
      tiKe: '体克变卦',
      bihe: '变卦与体比和',
      tiSheng: '体生变卦',
      keTi: '变卦克体'
    },
    bianGuaDesc: {
      shengTi: '最终结果对你有利，结局会比过程更好。',
      tiKe: '最终你能掌控结果，事情可成。',
      bihe: '最终结果平稳，事情会有个稳定的结局。',
      tiSheng: '最终仍需付出，但会有所收获。',
      keTi: '最终结果不太理想，需要注意风险。'
    },
    adviceLabels: {
      yes: '建议：✅ 可以',
      caution: '建议：⚠️ 谨慎可行',
      no: '建议：❌ 暂缓',
      timing: '时机判断',
      method: '行动建议',
      prediction: '发展趋势'
    },
    reasonSteps: {
      step1: '动爻在第{chg}爻（{pos}），故{yongPos}卦为用、{tiPos}卦为体。',
      step2: '体卦{ti}（{tiE}）与用卦{yong}（{yongE}）{rel}。',
      step3: '变卦{bian}，{bianRel}，代表最终结果{bianResult}。',
      step4: '本卦{ben}的核心指引："{guide}"。',
      step5: '应期推算：卦数{num1}+{num2}={total}，动爻{chg}，约{months}个月后有变化。',
      step6: '体卦{element}旺于{season}，此时行动最有利。'
    },
    seasons: {
      spring: '春季（2-4月）',
      summer: '夏季（5-7月）',
      autumn: '秋季（8-10月）',
      winter: '冬季（11-1月）',
      sijiMonth: '四季月（3、6、9、12月）'
    },
    timeAdvice: {
      now: '现在',
      monthsLater: '{n}个月后',
      notNow: '不宜行动，先积累观望',
      canPrepare: '可以开始接触机会',
      goodWindow: '较好的行动窗口',
      bestTime: '最佳时机',
      avoidTime: '避开'
    },
    actionSteps: {
      career: {
        title: '行动步骤',
        step1Bad: '现阶段：在现有岗位积累经验，提升技能',
        step2Bad: '2-3个月后：开始关注市场，有选择地投简历',
        step3Bad: '{n}个月后：如有合适offer可以考虑接受',
        step4Bad: '注意信号：有人主动邀请、行业出现利好时可提前行动',
        step1Good: '现阶段：可以主动出击，积极投递简历',
        step2Good: '面试时：展示自信，体卦{element}旺时谈判更有利',
        step3Good: '注意：{avoidSeason}期间决策需更谨慎'
      }
    }
  },
  en: {
    title: 'Ask Anything', subtitle: 'Get clear answers for love, career, and money', mingpanLink: 'Destiny Chart',
    landingTitle: 'StarAsk', landingSubtitle: 'Get your personalized reading in 60 seconds',
    askCard: 'Ask Anything', askDesc: 'One question. Clear next step in 60 seconds.', askAction: 'Start Quick Reading',
    askPromo: 'Ancient I Ching wisdom meets AI — get a clear, actionable answer in seconds',
    askFit: 'Best for: immediate decisions, relationship clarity, work choices',
    mingpanCard: 'Life Reading', mingpanDesc: 'Your long-term life map (1–10 years)', backToHome: '← Back',
    mingpanPromo: 'Based on your birth info, get a full personality, career, love & wealth report',
    mingpanFit: 'Best for: long-term planning, career path, relationship pattern',
    lifeInputTitle: 'Enter Your Birth Info',
    lifeBirthday: 'Birthday (Solar)', lifeHour: 'Birth Hour', lifeGender: 'Gender',
    lifeMale: 'Male', lifeFemale: 'Female', lifeSubmit: 'Generate Reading',
    lifeBirthPlace: 'Birthplace', lifeCitySearch: 'Search city...',
    lifeHourNames: ['11pm - 1am', '1am - 3am', '3am - 5am', '5am - 7am', '7am - 9am', '9am - 11am',
      '11am - 1pm', '1pm - 3pm', '3pm - 5pm', '5pm - 7pm', '7pm - 9pm', '9pm - 11pm'],
    time: 'Time', shichen: 'Hour', num: 'Num',
    question: 'Your Question', questionPlaceholder: 'What guidance are you seeking?',
    questionTip: 'Silently repeat your question three times and stay focused. The more specific your question, the more accurate the reading.',
    inputLabel: 'Enter a Number', inputPlaceholder: '2–10 digits, e.g. 36, 888, 52019…',
    inputTip: 'Think of a number connected to your question. Or, repeat your question silently three times and use the first number that comes to mind.',
    calculate: 'Divine', asked: 'Question: ',
    originalHex: 'Primary', changedHex: 'Changed',
    guaCi: 'Oracle', xiangYue: 'Wisdom', tuan: 'Commentary',
    philosophy: 'Life Lesson', vernacular: 'Interpretation',
    duanyi: 'Classical Analysis', shaoYong: 'Master Shao', fuPeiRong: 'Modern View',
    traditional: 'Traditional Reading', yaoDetail: 'Line Details', clickExpand: '(tap to expand)',
    dongYao: 'Moving Line', tiyongAnalysis: 'Energy Reading',
    tiGua: 'Your Energy', yongGua: 'Situation', restart: 'Ask Again',
    footer: 'Plum Blossom Divination · I Ching Wisdom',
    feedback: 'Feedback · WeChat: weixin407367 · Instagram: wei___xinnnnie',
    aiTitle: 'AI Divination Master',
    aiWelcome: 'I am an AI divination expert specializing in Plum Blossom divination. Ask me anything about your hexagram and I\'ll give you specific, actionable guidance.',
    aiPlaceholder: 'Ask about your hexagram...',
    aiSend: 'Send',
    aiLimit: 'Monthly free limit reached',
    aiExamples: ['What is my next best move?', 'When is my best timing window?', 'What mistake should I avoid now?'],
    upgrade: 'Unlock Full Reading',
    upgradePrice: '$4.99/mo',
    upgradePriceYear: '$39/year',
    mostPopular: 'Most Popular',
    paywallBullets: ['Precise timing window (when to act)', 'Personalized action plan (what to do next)', 'Unlimited follow-up AI questions'],
    cancelSub: 'Cancel subscription', cancelConfirm: 'Are you sure you want to cancel? Your access will continue until the end of the current billing period.', cancelSuccess: 'Subscription cancelled. Access continues until billing period ends.', cancelFail: 'Cancel failed. Please try again.',
    aiAutoLoading: 'AI is analyzing your hexagram...', aiAutoLabel: 'AI',
    tradLabels: { daxiang: 'Image', yunshi: 'Fortune', shiye: 'Career', jingshang: 'Business', qiuming: 'Reputation', hunlian: 'Love', juece: 'Decision' },
    fuLabels: { shiyun: 'Timing', caiyun: 'Wealth', jiazhai: 'Home', shenti: 'Health' },
    yaoLabels: { xiang: 'Image', vernacular: 'Meaning', shaoYong: 'Master Shao', biangua: 'Change', zhexue: 'Philosophy', story: 'Story' },
    elements: { '金': 'Metal', '木': 'Wood', '水': 'Water', '火': 'Fire', '土': 'Earth' },
    shichenNames: ['Zi','Chou','Yin','Mao','Chen','Si','Wu','Wei','Shen','You','Xu','Hai'],
    relations: { bihe: 'Harmony', yongShengTi: 'Supported', tiShengYong: 'Giving', yongKeTi: 'Challenged', tiKeYong: 'In Control' },
    fortunes: { bihe: 'Balanced — things unfold at their own pace.', yongShengTi: 'Great fortune — support is on the way.', tiShengYong: 'Takes effort and patience, but it\'s achievable.', yongKeTi: 'Unfavorable — hold your ground and wait for the tide to turn.', tiKeYong: 'Favorable — you\'re in a strong position to act.' },
    invalidInput: 'Please enter at least 2 digits',
    reading: 'Your Reading',
    readingCurrent: 'Current Situation',
    readingInner: 'Inner Reality',
    readingOuter: 'External Appearance',
    readingResult: 'Outcome',
    readingAdvice: 'Advice',
    // 智能解读新增
    readingBenGua: 'Primary Hexagram (Current)',
    readingTiYong: 'Energy Analysis (Core)',
    readingTi: 'You',
    readingYong: 'Situation',
    readingBianGua: 'Changed Hexagram (Outcome)',
    readingForYou: 'For Your Question',
    horaryTitle: 'Astrological Reading',
    horaryForYou: 'Astrology: For Your Question',
    readingReason: 'View Analysis Details',
    readingReasonTitle: 'Analysis Details',
    fortuneLabels: { great: 'Excellent', good: 'Favorable', neutral: 'Neutral', effort: 'Effort Needed', bad: 'Unfavorable' },
    tiYongLabels: {
      yongShengTi: 'Supported (Excellent)',
      tiKeYong: 'In Control (Good)',
      bihe: 'Balanced',
      tiShengYong: 'Giving (Draining)',
      yongKeTi: 'Challenged (Unfavorable)'
    },
    tiYongDesc: {
      yongShengTi: 'The circumstances are in your favor — help and support are likely to come your way.',
      tiKeYong: 'You hold the upper hand here — taking initiative will move things forward.',
      bihe: 'Forces are evenly matched — steady, consistent effort is your best bet.',
      tiShengYong: 'You\'re putting in more than you\'re getting back right now — stay the course, it\'ll pay off.',
      yongKeTi: 'Outside forces are pushing back — hold off for now and wait for a better opening.'
    },
    bianGuaLabels: {
      shengTi: 'Outcome supports you',
      tiKe: 'You control outcome',
      bihe: 'Stable outcome',
      tiSheng: 'Effort needed for outcome',
      keTi: 'Challenging outcome'
    },
    bianGuaDesc: {
      shengTi: 'The final result favors you — the ending is better than the journey.',
      tiKe: 'You\'ll be the one steering this to the finish — success is within reach.',
      bihe: 'Things will land in a stable place — no dramatic swings either way.',
      tiSheng: 'Keep putting in the effort — the payoff will follow.',
      keTi: 'The final result may fall short of expectations — go in with a realistic plan.'
    },
    adviceLabels: {
      yes: '✅ Go for it',
      caution: '⚠️ Proceed carefully',
      no: '❌ Hold off for now',
      timing: 'Timing',
      method: 'How to Approach It',
      prediction: 'Forecast'
    },
    reasonSteps: {
      step1: 'Moving line at position {chg} ({pos}), so {yongPos} is Yong, {tiPos} is Ti.',
      step2: 'Ti hexagram {ti} ({tiE}) and Yong hexagram {yong} ({yongE}): {rel}.',
      step3: 'Changed hexagram {bian}, {bianRel}, indicating {bianResult} outcome.',
      step4: 'Primary hexagram {ben} guidance: "{guide}".',
      step5: 'Timing: Hexagram numbers {num1}+{num2}={total}, moving line {chg}, change expected in ~{months} months.',
      step6: 'Ti element {element} is strongest in {season}, best time for action.'
    },
    seasons: {
      spring: 'Spring (Feb–Apr)',
      summer: 'Summer (May–Jul)',
      autumn: 'Fall (Aug–Oct)',
      winter: 'Winter (Nov–Jan)',
      sijiMonth: 'Seasonal transition months (Mar, Jun, Sep, Dec)'
    },
    timeAdvice: {
      now: 'Now',
      monthsLater: 'In {n} months',
      notNow: 'Not the right moment — prepare and stay alert',
      canPrepare: 'Start scoping opportunities',
      goodWindow: 'Good time to move',
      bestTime: 'Best time to act',
      avoidTime: 'Avoid'
    },
    actionSteps: {
      career: {
        title: 'Action Steps',
        step1Bad: 'Right now: Strengthen your skills and hold your ground',
        step2Bad: 'In 2–3 months: Start scoping the market, apply selectively',
        step3Bad: 'Around {n} months out: Be open to the right opportunity',
        step4Bad: 'Watch for: Recruiter outreach, market improvements',
        step1Good: 'Right now: Go for it — take initiative and apply actively',
        step2Good: 'In interviews: Lead with confidence; negotiate when timing is in your favor',
        step3Good: 'Heads up: Slow down during {avoidSeason}'
      }
    }
  }
};


// ==================== 占星算法模块 (Horary Astrology Engine) ====================

// --- 黄道十二星座 ---
const ZODIAC = [
  { name: 'Aries', zh: '白羊', element: 'Fire', modality: 'Cardinal', ruler: 'Mars' },
  { name: 'Taurus', zh: '金牛', element: 'Earth', modality: 'Fixed', ruler: 'Venus' },
  { name: 'Gemini', zh: '双子', element: 'Air', modality: 'Mutable', ruler: 'Mercury' },
  { name: 'Cancer', zh: '巨蟹', element: 'Water', modality: 'Cardinal', ruler: 'Moon' },
  { name: 'Leo', zh: '狮子', element: 'Fire', modality: 'Fixed', ruler: 'Sun' },
  { name: 'Virgo', zh: '处女', element: 'Earth', modality: 'Mutable', ruler: 'Mercury' },
  { name: 'Libra', zh: '天秤', element: 'Air', modality: 'Cardinal', ruler: 'Venus' },
  { name: 'Scorpio', zh: '天蝎', element: 'Water', modality: 'Fixed', ruler: 'Mars' },
  { name: 'Sagittarius', zh: '射手', element: 'Fire', modality: 'Mutable', ruler: 'Jupiter' },
  { name: 'Capricorn', zh: '摩羯', element: 'Earth', modality: 'Cardinal', ruler: 'Saturn' },
  { name: 'Aquarius', zh: '水瓶', element: 'Air', modality: 'Fixed', ruler: 'Saturn' },
  { name: 'Pisces', zh: '双鱼', element: 'Water', modality: 'Mutable', ruler: 'Jupiter' },
];

const PLANET_NAMES_ZH = { Sun:'太阳', Moon:'月亮', Mercury:'水星', Venus:'金星', Mars:'火星', Jupiter:'木星', Saturn:'土星' };
const PLANET_LIST = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn'];

// 行星光晕（Lilly moiety orbs，度）
const PLANET_ORBS = { Sun:17, Moon:12.5, Mercury:7, Venus:8, Mars:7.5, Jupiter:12, Saturn:10 };
// 行星平均每日速度（度/天）
const AVG_SPEEDS = { Sun:0.9856, Moon:13.176, Mercury:1.383, Venus:1.2, Mars:0.524, Jupiter:0.0831, Saturn:0.0335 };

// --- 必要尊严表 (Essential Dignity) ---
// 入庙 Domicile：行星 → 守护的星座索引数组
const H_DOMICILE = { Sun:[4], Moon:[3], Mercury:[2,5], Venus:[1,6], Mars:[0,7], Jupiter:[8,11], Saturn:[9,10] };
// 耀升 Exaltation：行星 → { sign: 星座索引 }
const H_EXALTATION = { Sun:{sign:0}, Moon:{sign:1}, Mercury:{sign:5}, Venus:{sign:11}, Mars:{sign:9}, Jupiter:{sign:3}, Saturn:{sign:6} };
// 落陷 Detriment：行星 → 星座索引数组（入庙对面）
const H_DETRIMENT = { Sun:[10], Moon:[9], Mercury:[8,11], Venus:[7,0], Mars:[6,1], Jupiter:[2,5], Saturn:[3,4] };
// 入弱 Fall：行星 → { sign: 星座索引 }（耀升对面）
const H_FALL = { Sun:{sign:6}, Moon:{sign:7}, Mercury:{sign:11}, Venus:{sign:5}, Mars:{sign:3}, Jupiter:{sign:9}, Saturn:{sign:0} };

// 三方主星 Triplicity（昼/夜/参与三方主星，按手册表格）
const H_TRIPLICITY = {
  Fire:  { day:'Sun',    night:'Jupiter', part:'Saturn'  },
  Earth: { day:'Venus',  night:'Moon',    part:'Mars'    },
  Air:   { day:'Saturn', night:'Mercury', part:'Jupiter' },
  Water: { day:'Mars',   night:'Venus',   part:'Moon'    },
};

// --- 界 Term / Bound (+2) ---
// 埃及界表：每星座分5段，每段由一颗行星主管 [planet, endDeg]
// endDeg 是该段在星座内的结束度数
const H_TERMS = {
  0:  [['Jupiter',6],['Venus',12],['Mercury',20],['Mars',25],['Saturn',30]],   // Aries
  1:  [['Venus',8],['Mercury',14],['Jupiter',22],['Saturn',27],['Mars',30]],    // Taurus
  2:  [['Mercury',6],['Jupiter',12],['Venus',17],['Mars',24],['Saturn',30]],    // Gemini
  3:  [['Mars',7],['Venus',13],['Mercury',19],['Jupiter',26],['Saturn',30]],    // Cancer
  4:  [['Jupiter',6],['Venus',11],['Saturn',18],['Mercury',24],['Mars',30]],    // Leo
  5:  [['Mercury',7],['Venus',17],['Jupiter',21],['Mars',28],['Saturn',30]],    // Virgo
  6:  [['Saturn',6],['Mercury',14],['Jupiter',21],['Venus',28],['Mars',30]],    // Libra
  7:  [['Mars',7],['Venus',11],['Mercury',19],['Jupiter',24],['Saturn',30]],    // Scorpio
  8:  [['Jupiter',12],['Venus',17],['Mercury',21],['Saturn',26],['Mars',30]],   // Sagittarius
  9:  [['Mercury',7],['Jupiter',14],['Venus',22],['Saturn',26],['Mars',30]],    // Capricorn
  10: [['Mercury',7],['Venus',13],['Jupiter',20],['Mars',25],['Saturn',30]],    // Aquarius
  11: [['Venus',12],['Jupiter',16],['Mercury',19],['Mars',28],['Saturn',30]],   // Pisces
};

// --- 面 Face / Decan (+1) ---
// 每星座3×10°面，按迦勒底行星序列循环：Mars,Sun,Venus,Mercury,Moon,Saturn,Jupiter
const _FACE_SEQUENCE = ['Mars','Sun','Venus','Mercury','Moon','Saturn','Jupiter'];
function _getFaceRuler(signIdx, degInSign) {
  const decanIdx = Math.min(2, Math.floor(degInSign / 10)); // 0, 1, 2
  const globalDecan = signIdx * 3 + decanIdx; // 0-35
  return _FACE_SEQUENCE[globalDecan % 7];
}

// --- 问题特定阿拉伯点 Arabic Parts ---
const H_ARABIC_PARTS = {
  love:    { name:'Part of Marriage',  zh:'婚姻点', formula:'asc+desc-venus' },
  career:  { name:'Part of Fortune',   zh:'福点',   formula:'standard' },
  money:   { name:'Part of Fortune',   zh:'福点',   formula:'standard' },
  health:  { name:'Part of Sickness',  zh:'疾病点', formula:'asc+mars-saturn' },
  study:   { name:'Part of Knowledge', zh:'知识点', formula:'asc+sun-mercury' },
  travel:  { name:'Part of Travel',    zh:'旅行点', formula:'asc+9cusp-9ruler' },
  legal:   { name:'Part of Lawsuits',  zh:'诉讼点', formula:'asc+mars-saturn' },
  family:  { name:'Part of Father',    zh:'父母点', formula:'asc+saturn-sun' },
  find:    { name:'Part of Fortune',   zh:'福点',   formula:'standard' },
  general: { name:'Part of Fortune',   zh:'福点',   formula:'standard' },
};

// --- 行星喜乐宫 Planetary Joy ---
// 行星在特定宫位有额外加分（Lilly传统），宫位编号→行星
const H_PLANETARY_JOY = {
  Mercury: 1,   // 水星喜乐于第1宫
  Moon: 3,      // 月亮喜乐于第3宫
  Venus: 5,     // 金星喜乐于第5宫
  Mars: 6,      // 火星喜乐于第6宫
  Sun: 9,       // 太阳喜乐于第9宫
  Jupiter: 11,  // 木星喜乐于第11宫
  Saturn: 12,   // 土星喜乐于第12宫
};

// --- Antiscion 对称星座映射（关于巨蟹0°/摩羯0°轴）---
// Aries↔Virgo, Taurus↔Leo, Gemini↔Cancer, Libra↔Pisces, Scorpio↔Aquarius, Sagittarius↔Capricorn
const _ANTISCION_SIGN_PAIRS = { 0:5, 5:0, 1:4, 4:1, 2:3, 3:2, 6:11, 11:6, 7:10, 10:7, 8:9, 9:8 };

// --- 相位定义 ---
const H_ASPECTS = [
  { name:'Conjunction', zh:'合相', angle:0, nature:'neutral', weight:3 },
  { name:'Sextile', zh:'六分相', angle:60, nature:'harmonious', weight:2 },
  { name:'Square', zh:'四分相', angle:90, nature:'tense', weight:-2 },
  { name:'Trine', zh:'三合相', angle:120, nature:'harmonious', weight:3 },
  { name:'Opposition', zh:'对冲', angle:180, nature:'tense', weight:-3 },
];

// --- 恒星表 (J2000 黄经度) ---
const H_FIXED_STARS = [
  { name:'Algol', zh:'大陵五', lon2000:56.17, nature:'malefic', score:-4 },
  { name:'Aldebaran', zh:'毕宿五', lon2000:69.68, nature:'mixed', score:1 },
  { name:'Regulus', zh:'轩辕十四', lon2000:149.83, nature:'benefic', score:4 },
  { name:'Spica', zh:'角宿一', lon2000:203.83, nature:'benefic', score:4 },
  { name:'Antares', zh:'心宿二', lon2000:249.78, nature:'malefic', score:-3 },
];

// --- 问题类型 → 宫位映射 ---
const H_QUESTION_HOUSES = { love:7, career:10, money:2, health:6, study:9, travel:9, legal:7, family:4, find:2, general:1 };

// --- 应期对照表（星座模式 × 宫位性质 → 时间单位）---
const H_TIMING_GRID = {
  Cardinal: { angular:'days', succedent:'weeks', cadent:'months' },
  Fixed: { angular:'months', succedent:'quarters', cadent:'years' },
  Mutable: { angular:'weeks', succedent:'months', cadent:'quarters' },
};

// ==================== 天文计算引擎 ====================

const DEG = Math.PI / 180;
const _norm360 = (d) => ((d % 360) + 360) % 360;
const _sinD = (d) => Math.sin(d * DEG);
const _cosD = (d) => Math.cos(d * DEG);
const _atan2D = (y, x) => Math.atan2(y, x) / DEG;

// 儒略日计算
function _toJD(date) {
  const y = date.getUTCFullYear(), m = date.getUTCMonth() + 1, d = date.getUTCDate();
  const h = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  let Y = y, M = m;
  if (M <= 2) { Y -= 1; M += 12; }
  const A = Math.floor(Y / 100), B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + d + h / 24 + B - 1524.5;
}

// T = 儒略世纪（自J2000.0起）
function _T(jd) { return (jd - 2451545.0) / 36525.0; }

// --- 太阳位置 (Meeus Ch.25 简化) ---
function _calcSun(T) {
  const L0 = _norm360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M = _norm360(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const C = (1.9146 - 0.004817 * T - 0.000014 * T * T) * _sinD(M)
          + (0.019993 - 0.000101 * T) * _sinD(2 * M) + 0.00029 * _sinD(3 * M);
  const lon = _norm360(L0 + C);
  // 章动修正（简化）
  const omega = 125.04 - 1934.136 * T;
  const lonCorr = lon - 0.00569 - 0.00478 * _sinD(omega);
  return { lon: _norm360(lonCorr), speed: 0.9856 };
}

// --- 月亮位置 (Meeus Ch.47 简化，主要周期项) ---
function _calcMoon(T) {
  const Lp = _norm360(218.3165 + 481267.8813 * T);
  const D = _norm360(297.8502 + 445267.1115 * T);
  const M = _norm360(357.5291 + 35999.0503 * T);
  const Mp = _norm360(134.9634 + 477198.8676 * T);
  const F = _norm360(93.2720 + 483202.0175 * T);

  // 主要黄经修正项（前20项）
  let dL = 0;
  dL += 6288774 * _sinD(Mp);
  dL += 1274027 * _sinD(2*D - Mp);
  dL += 658314 * _sinD(2*D);
  dL += 213618 * _sinD(2*Mp);
  dL += -185116 * _sinD(M);
  dL += -114332 * _sinD(2*F);
  dL += 58793 * _sinD(2*D - 2*Mp);
  dL += 57066 * _sinD(2*D - M - Mp);
  dL += 53322 * _sinD(2*D + Mp);
  dL += 45758 * _sinD(2*D - M);
  dL += -40923 * _sinD(M - Mp);
  dL += -34720 * _sinD(D);
  dL += -30383 * _sinD(M + Mp);
  dL += 15327 * _sinD(2*D - 2*F);
  dL += -12528 * _sinD(Mp + 2*F);
  dL += 10980 * _sinD(Mp - 2*F);
  dL += 10675 * _sinD(4*D - Mp);
  dL += 10034 * _sinD(3*Mp);
  dL += 8548 * _sinD(4*D - 2*Mp);
  dL += -7888 * _sinD(2*D + M - Mp);

  const lon = _norm360(Lp + dL / 1000000);
  return { lon, speed: 13.176 };
}

// --- 行星位置（简化轨道要素法，基于Meeus/Schlyter）---
// 轨道要素：[N0, N1, i0, i1, w0, w1, a, e0, e1, M0, M1]
// N=升交点经度, i=轨道倾角, w=近日点幅角, a=半长轴(AU), e=离心率, M=平近点角
// 单位：度，速率为度/天（d=自J2000.0的天数）
const _ORB_ELEMENTS = {
  Mercury: { N:[48.3313,3.24587e-5], i:[7.0047,5.00e-8], w:[29.1241,1.01444e-5], a:0.387098, e:[0.205635,5.59e-10], M:[168.6562,4.0923344368] },
  Venus:   { N:[76.6799,2.46590e-5], i:[3.3946,2.75e-8], w:[54.891,1.38374e-5], a:0.723330, e:[0.006773,-1.302e-9], M:[48.0052,1.6021302244] },
  Mars:    { N:[49.5574,2.11081e-5], i:[1.8497,-1.78e-8], w:[286.5016,2.92961e-5], a:1.523688, e:[0.093405,2.516e-9], M:[18.6021,0.5240207766] },
  Jupiter: { N:[100.4542,1.38671e-5], i:[1.3030,-1.557e-7], w:[273.8777,1.64505e-5], a:5.20256, e:[0.048498,4.469e-9], M:[19.8950,0.0830853001] },
  Saturn:  { N:[113.6634,2.38980e-5], i:[2.4886,-1.081e-7], w:[339.3939,2.97661e-5], a:9.55475, e:[0.055546,-9.499e-9], M:[316.9670,0.0334442282] },
};

// 地球轨道要素（用于日心→地心转换）
const _EARTH_ORB = { w:[282.9404,4.70935e-5], a:1.000000, e:[0.016709,-1.151e-9], M:[356.0470,0.9856002585] };

// 解开普勒方程（迭代法）
function _solveKepler(M, e) {
  const Mr = M * DEG;
  let E = Mr + e * Math.sin(Mr) * (1.0 + e * Math.cos(Mr));
  for (let i = 0; i < 10; i++) {
    const dE = (E - e * Math.sin(E) - Mr) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-8) break;
  }
  return E / DEG;
}

// 计算单个行星的日心黄经
function _heliocentricLon(orb, d) {
  const N = orb.N[0] + orb.N[1] * d;
  const i = orb.i[0] + orb.i[1] * d;
  const w = orb.w[0] + orb.w[1] * d;
  const a = orb.a;
  const e = orb.e[0] + orb.e[1] * d;
  const M = _norm360(orb.M[0] + orb.M[1] * d);
  const E = _solveKepler(M, e);
  const xv = a * (_cosD(E) - e);
  const yv = a * Math.sqrt(1 - e * e) * _sinD(E);
  const v = _atan2D(yv, xv);
  const r = Math.sqrt(xv * xv + yv * yv);
  // 日心黄道坐标
  const xh = r * (_cosD(N) * _cosD(v + w) - _sinD(N) * _sinD(v + w) * _cosD(i));
  const yh = r * (_sinD(N) * _cosD(v + w) + _cosD(N) * _sinD(v + w) * _cosD(i));
  const zh = r * (_sinD(v + w) * _sinD(i));
  return { xh, yh, zh, r, lon: _norm360(v + w + N) };
}

// 地球位置
function _earthPos(d) {
  const w = _EARTH_ORB.w[0] + _EARTH_ORB.w[1] * d;
  const e = _EARTH_ORB.e[0] + _EARTH_ORB.e[1] * d;
  const M = _norm360(_EARTH_ORB.M[0] + _EARTH_ORB.M[1] * d);
  const E = _solveKepler(M, e);
  const xv = _cosD(E) - e;
  const yv = Math.sqrt(1 - e * e) * _sinD(E);
  const v = _atan2D(yv, xv);
  const r = Math.sqrt(xv * xv + yv * yv);
  const lonSun = _norm360(v + w);
  return { x: r * _cosD(lonSun), y: r * _sinD(lonSun), z: 0, lon: lonSun, r };
}

// 日心→地心转换
function _calcPlanet(planetName, d) {
  const orb = _ORB_ELEMENTS[planetName];
  if (!orb) return null;
  const h = _heliocentricLon(orb, d);
  const earth = _earthPos(d);
  const xg = h.xh - earth.x;
  const yg = h.yh - earth.y;
  const zg = h.zh - earth.z;
  const lon = _norm360(_atan2D(yg, xg));
  return { lon };
}

// 行星速度（有限差分法）
function _calcSpeed(planetName, d) {
  const dt = 0.5; // 半天
  let p1, p2;
  if (planetName === 'Sun') { p1 = _calcSun(_T(2451545.0 + d - dt)); p2 = _calcSun(_T(2451545.0 + d + dt)); }
  else if (planetName === 'Moon') { p1 = _calcMoon(_T(2451545.0 + d - dt)); p2 = _calcMoon(_T(2451545.0 + d + dt)); }
  else { p1 = _calcPlanet(planetName, d - dt); p2 = _calcPlanet(planetName, d + dt); }
  if (!p1 || !p2) return 0;
  let diff = p2.lon - p1.lon;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff / (2 * dt);
}

// 月亮北交点（平均交点）
function _calcNorthNode(T) {
  return _norm360(125.0446 - 1934.1363 * T + 0.0020754 * T * T);
}

// 获取所有行星位置
function _getAllPlanets(date) {
  const jd = _toJD(date);
  const T = _T(jd);
  const d = jd - 2451545.0;
  const planets = {};
  const sun = _calcSun(T);
  planets.Sun = { lon: sun.lon };
  const moon = _calcMoon(T);
  planets.Moon = { lon: moon.lon };
  for (const p of ['Mercury','Venus','Mars','Jupiter','Saturn']) {
    const pos = _calcPlanet(p, d);
    planets[p] = pos || { lon: 0 };
  }
  // 计算速度和逆行
  for (const p of PLANET_LIST) {
    const spd = _calcSpeed(p, d);
    planets[p].speed = spd;
    planets[p].isRetrograde = spd < 0 && p !== 'Sun' && p !== 'Moon';
  }
  // 每颗行星的投影点和反投影点
  for (const p of PLANET_LIST) {
    planets[p].antiscion = _calcAntiscion(planets[p].lon);
    planets[p].contraAntiscion = _calcContraAntiscion(planets[p].lon);
  }
  planets._northNode = _calcNorthNode(T);
  planets._T = T;
  planets._d = d;
  return planets;
}

// ==================== 占星分析引擎 ====================

// KP报数法：数字 → 上升度数（手册 6.11 节）
function _kpAscendant(inputStr) {
  let N = parseInt(inputStr, 10);
  if (isNaN(N) || N <= 0) N = 1;
  N = ((N - 1) % 249) + 1; // 归一化到 1-249
  const interval = 360 / 249;
  const ascDeg = (N - 1) * interval;
  const signIdx = Math.floor(ascDeg / 30);
  return { deg: ascDeg, signIdx, degInSign: ascDeg % 30, kpNum: N, sign: ZODIAC[signIdx] };
}

// 等宫制（每宫30°）
function _calcHouses(ascDeg) {
  const houses = [];
  for (let i = 0; i < 12; i++) {
    const cusp = _norm360(ascDeg + i * 30);
    const si = Math.floor(cusp / 30) % 12;
    const type = [0,3,6,9].includes(i) ? 'angular' : [1,4,7,10].includes(i) ? 'succedent' : 'cadent';
    houses.push({ num: i + 1, cusp, signIdx: si, sign: ZODIAC[si], type });
  }
  return houses;
}

// 行星落入哪个宫位（含5度规则）
function _planetInHouse(pLon, houses) {
  for (let i = 0; i < 12; i++) {
    const nextIdx = (i + 1) % 12;
    const cusp = houses[i].cusp;
    const nextCusp = houses[nextIdx].cusp;
    let lo = cusp, hi = nextCusp;
    if (hi < lo) hi += 360;
    let pl = pLon;
    if (pl < lo) pl += 360;
    if (pl >= lo && pl < hi) {
      // 5度规则：距下一宫头<5°则算下一宫
      let distToNext = hi - pl;
      if (distToNext < 5) return houses[nextIdx];
      return houses[i];
    }
  }
  return houses[0];
}

// 必要尊严评分（含界+2、面+1、昼夜三方区分）
function _essentialDignity(planet, signIdx, degInSign, isDayChart) {
  let score = 0;
  const dignities = [];
  // 入庙 Domicile +5
  if (H_DOMICILE[planet]?.includes(signIdx)) { score += 5; dignities.push('domicile'); }
  // 耀升 Exaltation +4
  if (H_EXALTATION[planet]?.sign === signIdx) { score += 4; dignities.push('exaltation'); }
  // 三方 Triplicity +3（区分昼/夜/参与三方主星）
  const elem = ZODIAC[signIdx].element;
  const trip = H_TRIPLICITY[elem];
  if (trip) {
    if (isDayChart && trip.day === planet) { score += 3; dignities.push('triplicity_day'); }
    else if (!isDayChart && trip.night === planet) { score += 3; dignities.push('triplicity_night'); }
    else if (trip.part === planet) { score += 3; dignities.push('triplicity_part'); }
  }
  // 界 Term / Bound +2
  const deg = degInSign !== undefined ? degInSign : 15; // fallback
  const terms = H_TERMS[signIdx];
  if (terms) {
    for (const [ruler, endDeg] of terms) {
      if (deg < endDeg) {
        if (ruler === planet) { score += 2; dignities.push('term'); }
        break;
      }
    }
  }
  // 面 Face / Decan +1
  if (_getFaceRuler(signIdx, deg) === planet) { score += 1; dignities.push('face'); }
  // 落陷 Detriment -5
  if (H_DETRIMENT[planet]?.includes(signIdx)) { score -= 5; dignities.push('detriment'); }
  // 入弱 Fall -4
  if (H_FALL[planet]?.sign === signIdx) { score -= 4; dignities.push('fall'); }
  // 游荡 Peregrine -5：无任何正面尊严（入庙/耀升/三方/界/面都没有）
  const positiveDigs = ['domicile','exaltation','triplicity_day','triplicity_night','triplicity_part','term','face'];
  if (!dignities.some(d => positiveDigs.includes(d))) {
    if (!dignities.some(d => d === 'detriment' || d === 'fall')) {
      score -= 5; dignities.push('peregrine');
    }
  }
  return { score, dignities };
}

// 偶然尊严评分（含行星喜乐宫）
function _accidentalDignity(planet, houseType, houseNum, speed, isRetrograde, sunLon, pLon) {
  let score = 0;
  const notes = [];
  // 宫位力量
  if (houseType === 'angular') { score += 5; notes.push('angular'); }
  else if (houseType === 'succedent') { score += 2; notes.push('succedent'); }
  else { score -= 2; notes.push('cadent'); }
  // 行星喜乐宫 Planetary Joy +2
  if (H_PLANETARY_JOY[planet] === houseNum) { score += 2; notes.push('joy'); }
  // 速度
  const avg = AVG_SPEEDS[planet] || 1;
  if (Math.abs(speed) > avg) { score += 2; notes.push('fast'); }
  // 逆行
  if (isRetrograde) { score -= 5; notes.push('retrograde'); }
  // 焦伤/Cazimi（太阳自身不检查）
  if (planet !== 'Sun') {
    let dist = Math.abs(pLon - sunLon);
    if (dist > 180) dist = 360 - dist;
    if (dist < 17 / 60) { score += 5; notes.push('cazimi'); }
    else if (dist < 8.5) { score -= 5; notes.push('combust'); }
    else if (dist < 17) { score -= 2; notes.push('under_sunbeams'); }
  }
  return { score, notes };
}

// 两行星间的相位检测（Lilly光晕平分法）
function _findAspect(p1Name, p1Lon, p1Spd, p2Name, p2Lon, p2Spd) {
  const orb = ((PLANET_ORBS[p1Name] || 7) + (PLANET_ORBS[p2Name] || 7)) / 2;
  let diff = _norm360(p1Lon - p2Lon);
  if (diff > 180) diff = 360 - diff;
  for (const asp of H_ASPECTS) {
    const sep = Math.abs(diff - asp.angle);
    if (sep <= orb) {
      // 判断入相/出相
      // 快星向慢星靠拢 = applying
      const faster = Math.abs(p1Spd) > Math.abs(p2Spd) ? 1 : 2;
      let fLon = faster === 1 ? p1Lon : p2Lon;
      let sLon = faster === 1 ? p2Lon : p1Lon;
      let fSpd = faster === 1 ? p1Spd : p2Spd;
      // 简化判断：角距在减小 = applying
      let angleDiff = _norm360(sLon - fLon);
      if (angleDiff > 180) angleDiff -= 360;
      const applying = (fSpd > 0 && angleDiff > 0) || (fSpd < 0 && angleDiff < 0);
      return { aspect: asp, orb: sep, applying, degreesToPerfect: sep };
    }
  }
  return null;
}

// 月亮分析：空亡、燃烧径、下一个相位
function _analyzeMoon(moonLon, moonSpd, planets) {
  // 燃烧径 Via Combusta：天秤15°(195°) ~ 天蝎15°(225°)
  const isViaCombusta = moonLon >= 195 && moonLon <= 225;
  // 角宿一豁免（天秤~24°，即204°±2°）
  const spicaExempt = moonLon >= 202 && moonLon <= 206;

  // 空亡 Void of Course：月亮在当前星座内不再形成任何入相相位
  const moonSign = Math.floor(moonLon / 30);
  const degRemaining = 30 - (moonLon % 30);
  let isVOC = true;
  let nextAspectPlanet = null;
  let nextAspectType = null;

  // 检查月亮在离开当前星座前是否会形成新的精确相位
  for (const pName of PLANET_LIST) {
    if (pName === 'Moon') continue;
    const pLon = planets[pName].lon;
    for (const asp of H_ASPECTS) {
      // 月亮需要到达的目标度数
      const targets = [_norm360(pLon + asp.angle), _norm360(pLon - asp.angle)];
      for (const target of targets) {
        let dist = _norm360(target - moonLon);
        if (dist > 180) continue; // 只看前方
        if (dist <= degRemaining && dist > 0.5) {
          isVOC = false;
          if (!nextAspectPlanet || dist < _norm360((nextAspectPlanet._targetDist || 999))) {
            nextAspectPlanet = pName;
            nextAspectType = asp;
          }
        }
      }
    }
  }

  return { isViaCombusta: isViaCombusta && !spicaExempt, isVOC, nextAspectPlanet, nextAspectType };
}

// 转宫法 Derivative Houses
// derivativeRoot = 从第几宫开始转（如问"妻子的钱"：root=7, offset=2 → 实际第8宫）
// 返回实际宫位编号 (1-12)
function _deriveHouse(rootHouse, offsetHouse) {
  // rootHouse: 转宫起点（如7=配偶），offsetHouse: 从起点数第几宫（如2=财帛）
  // 结果 = ((rootHouse - 1) + (offsetHouse - 1)) % 12 + 1
  return ((rootHouse - 1 + offsetHouse - 1) % 12) + 1;
}

// 征象星识别（支持转宫法）
// derivativeRoot: 如果有值，则把该宫作为"新1宫"来推导事物宫
function _identifySignificators(qType, houses, derivativeRoot) {
  const querentHouse = 1;
  let quesitedHouse;
  if (derivativeRoot && derivativeRoot > 0 && derivativeRoot <= 12) {
    // 转宫法：以 derivativeRoot 为新的第1宫
    const baseHouse = H_QUESTION_HOUSES[qType] || 1;
    quesitedHouse = _deriveHouse(derivativeRoot, baseHouse);
  } else {
    quesitedHouse = H_QUESTION_HOUSES[qType] || 1;
  }
  const querentSign = houses[0].signIdx;
  const quesitedSign = houses[quesitedHouse - 1].signIdx;
  return {
    querent: ZODIAC[querentSign].ruler,
    quesited: ZODIAC[quesitedSign].ruler,
    querentHouse, quesitedHouse,
    querentSign, quesitedSign,
    derivativeRoot: derivativeRoot || null,
  };
}

// 互容检测
function _checkMutualReception(planets) {
  const receptions = [];
  for (let i = 0; i < PLANET_LIST.length; i++) {
    for (let j = i + 1; j < PLANET_LIST.length; j++) {
      const p1 = PLANET_LIST[i], p2 = PLANET_LIST[j];
      const s1 = Math.floor(planets[p1].lon / 30);
      const s2 = Math.floor(planets[p2].lon / 30);
      // 入庙互容
      if (H_DOMICILE[p1]?.includes(s2) && H_DOMICILE[p2]?.includes(s1)) {
        receptions.push({ p1, p2, type: 'domicile', score: 5 });
      }
      // 耀升互容
      if (H_EXALTATION[p1]?.sign === s2 && H_EXALTATION[p2]?.sign === s1) {
        receptions.push({ p1, p2, type: 'exaltation', score: 4 });
      }
    }
  }
  return receptions;
}

// 福点 Part of Fortune
function _calcPartOfFortune(ascDeg, sunLon, moonLon, isDayChart) {
  if (isDayChart) return _norm360(ascDeg + moonLon - sunLon);
  return _norm360(ascDeg + sunLon - moonLon);
}

// 恒星合相检测（±1.5°，含岁差修正）
function _checkFixedStars(planets, year) {
  const precession = (year - 2000) * 50.3 / 3600; // 度
  const hits = [];
  for (const star of H_FIXED_STARS) {
    const starLon = star.lon2000 + precession;
    for (const pName of PLANET_LIST) {
      let dist = Math.abs(planets[pName].lon - starLon);
      if (dist > 180) dist = 360 - dist;
      if (dist <= 1.5) {
        hits.push({ planet: pName, star, orb: dist });
      }
    }
  }
  return hits;
}

// 投影点 Antiscion（关于巨蟹0°/摩羯0°轴的镜像）
// 正确算法：星座内度数取 (30° - degInSign)，星座映射到对称星座
// Aries 10° → Virgo 20°, Gemini 15° → Cancer 15°, Scorpio 5° → Aquarius 25°
function _calcAntiscion(lon) {
  const signIdx = Math.floor(lon / 30) % 12;
  const degInSign = lon % 30;
  const mirrorSign = _ANTISCION_SIGN_PAIRS[signIdx];
  const mirrorDeg = 30 - degInSign;
  return _norm360(mirrorSign * 30 + (mirrorDeg >= 30 ? 0 : mirrorDeg));
}

// 反投影点 Contra-Antiscion（关于白羊0°/天秤0°轴的镜像）
// 即 Antiscion 的对冲点（+180°）
function _calcContraAntiscion(lon) {
  return _norm360(_calcAntiscion(lon) + 180);
}

// ==================== 动态干扰模拟系统 ====================
// 模拟未来15°内行星运动轨迹，检测 Prohibition / Refranation / Frustration

// 辅助：模拟行星向前移动 stepDeg 度后的黄经
function _simForward(lon, speed, stepDays) {
  return _norm360(lon + speed * stepDays);
}

// 综合干扰检测（动态版 _checkInterference）
// 返回 { prohibition, refranation, frustration } 全部结果
function _checkInterference(sig1Name, sig2Name, planets) {
  const s1 = planets[sig1Name], s2 = planets[sig2Name];
  const sigAsp = _findAspect(sig1Name, s1.lon, s1.speed, sig2Name, s2.lon, s2.speed);
  const result = { prohibition: null, refranation: false, frustration: false };

  // --- Refranation（撤回）检测 ---
  // 1) 任一征象星逆行 → 无法完成入相
  if (s1.isRetrograde || s2.isRetrograde) {
    result.refranation = true;
  }
  // 2) 速度极慢（接近站相，<10%平均速度）→ 即将逆行
  const s1Avg = AVG_SPEEDS[sig1Name] || 1;
  const s2Avg = AVG_SPEEDS[sig2Name] || 1;
  if (!result.refranation) {
    if (Math.abs(s1.speed) < s1Avg * 0.1 && s1.speed > 0) result.refranation = true;
    if (Math.abs(s2.speed) < s2Avg * 0.1 && s2.speed > 0) result.refranation = true;
  }
  // 3) 动态模拟：检查未来每步行星速度变化趋势
  if (!result.refranation && sigAsp && sigAsp.applying) {
    const relSpeed = Math.abs(s1.speed - s2.speed);
    const daysToAspect = relSpeed > 0.001 ? sigAsp.degreesToPerfect / relSpeed : 999;
    if (daysToAspect < 90) { // 只检查合理范围内
      // 用有限差分检测加速度（速度在减小 = 可能逆行）
      const fasterName = Math.abs(s1.speed) > Math.abs(s2.speed) ? sig1Name : sig2Name;
      const fp = planets[fasterName];
      const d = planets._d;
      // 当前速度 vs 1天后速度
      const spdNow = fp.speed;
      const spdLater = _calcSpeed(fasterName, d + 1);
      // 如果速度正在快速下降且接近0，即将逆行
      if (spdNow > 0 && spdLater < spdNow * 0.5 && spdLater < s1Avg * 0.3) {
        result.refranation = true;
      }
    }
  }

  if (!sigAsp || !sigAsp.applying) return result;

  // --- Prohibition（拦截）动态检测 ---
  // 计算征象星相位完成所需天数
  const relSpeed = Math.abs(s1.speed - s2.speed);
  const daysToSigAsp = relSpeed > 0.001 ? sigAsp.degreesToPerfect / relSpeed : 999;

  // 逐行星检查：模拟运动，检测第三方是否在征象星相位完成前先插入
  for (const pName of PLANET_LIST) {
    if (pName === sig1Name || pName === sig2Name) continue;
    const p = planets[pName];

    // 对 sig1 和 sig2 分别检查
    for (const [sigName, sigP] of [[sig1Name, s1], [sig2Name, s2]]) {
      const aspToSig = _findAspect(pName, p.lon, p.speed, sigName, sigP.lon, sigP.speed);
      if (aspToSig && aspToSig.applying) {
        const relSpdToSig = Math.abs(p.speed - sigP.speed);
        const daysToBlock = relSpdToSig > 0.001 ? aspToSig.degreesToPerfect / relSpdToSig : 999;
        if (daysToBlock < daysToSigAsp) {
          // 进一步验证：模拟到 daysToBlock 天后，确认相位确实精确
          const pFuture = _simForward(p.lon, p.speed, daysToBlock);
          const sigFuture = _simForward(sigP.lon, sigP.speed, daysToBlock);
          let fDiff = _norm360(pFuture - sigFuture);
          if (fDiff > 180) fDiff = 360 - fDiff;
          const isExact = Math.abs(fDiff - aspToSig.aspect.angle) < 1;
          if (isExact) {
            result.prohibition = { blocker: pName, target: sigName, aspect: aspToSig.aspect.name, daysUntil: daysToBlock };
            break;
          }
        }
      }
    }
    if (result.prohibition) break;
  }

  // --- Frustration（挫折）动态检测 ---
  // 快星在完成相位前换座
  const fasterName = Math.abs(s1.speed) > Math.abs(s2.speed) ? sig1Name : sig2Name;
  const fp = planets[fasterName];
  const degToSignEnd = 30 - (fp.lon % 30);
  const daysFasterToSignEnd = Math.abs(fp.speed) > 0.001 ? degToSignEnd / Math.abs(fp.speed) : 999;
  if (daysFasterToSignEnd < daysToSigAsp) {
    result.frustration = true;
  }

  return result;
}

// 光线传播 Translation of Light
function _checkTranslation(sig1Name, sig2Name, planets) {
  for (const pName of PLANET_LIST) {
    if (pName === sig1Name || pName === sig2Name) continue;
    const p = planets[pName];
    if (Math.abs(p.speed) <= Math.abs(planets[sig1Name].speed)) continue;
    if (Math.abs(p.speed) <= Math.abs(planets[sig2Name].speed)) continue;
    // 快星先与一方出相，再与另一方入相
    const asp1 = _findAspect(pName, p.lon, p.speed, sig1Name, planets[sig1Name].lon, planets[sig1Name].speed);
    const asp2 = _findAspect(pName, p.lon, p.speed, sig2Name, planets[sig2Name].lon, planets[sig2Name].speed);
    if (asp1 && !asp1.applying && asp2 && asp2.applying) return { translator: pName, from: sig1Name, to: sig2Name };
    if (asp2 && !asp2.applying && asp1 && asp1.applying) return { translator: pName, from: sig2Name, to: sig1Name };
  }
  return null;
}

// 光线汇聚 Collection of Light（增强版：A→C 且 B→C 入相，即使 A-B 无直接相位也算成事）
function _checkCollection(sig1Name, sig2Name, planets) {
  for (const pName of PLANET_LIST) {
    if (pName === sig1Name || pName === sig2Name) continue;
    const p = planets[pName];
    // 第三方比两个征象星都慢（经典定义）
    if (Math.abs(p.speed) >= Math.abs(planets[sig1Name].speed)) continue;
    if (Math.abs(p.speed) >= Math.abs(planets[sig2Name].speed)) continue;
    // A 和 B 都在入相于 C
    const asp1 = _findAspect(sig1Name, planets[sig1Name].lon, planets[sig1Name].speed, pName, p.lon, p.speed);
    const asp2 = _findAspect(sig2Name, planets[sig2Name].lon, planets[sig2Name].speed, pName, p.lon, p.speed);
    if (asp1 && asp1.applying && asp2 && asp2.applying) {
      return { collector: pName, asp1Nature: asp1.aspect.nature, asp2Nature: asp2.aspect.nature };
    }
  }
  return null;
}

// 围攻 Besiegement 检测（行星两侧分别被火星和土星夹住）
function _checkBesiegement(planetName, planets) {
  const pLon = planets[planetName].lon;
  let marsLon = planets.Mars.lon;
  let satLon = planets.Saturn.lon;
  // 归一化：以目标行星为参考点
  let dMars = _norm360(marsLon - pLon);
  let dSat = _norm360(satLon - pLon);
  // 一个在前(0-180)一个在后(180-360)才算围攻
  const marsAhead = dMars > 0 && dMars < 180;
  const satAhead = dSat > 0 && dSat < 180;
  if (marsAhead !== satAhead) {
    // 且两颗凶星距目标行星不超过12°
    const marsClose = Math.min(dMars, 360 - dMars) < 12;
    const satClose = Math.min(dSat, 360 - dSat) < 12;
    if (marsClose && satClose) return true;
  }
  return false;
}

// 月亮最后相位 (Last Aspect) — 月亮在当前星座内最近的出相相位
function _moonLastAspect(moonLon, planets) {
  let lastPlanet = null, lastAspect = null, closestDist = Infinity;
  for (const pName of PLANET_LIST) {
    if (pName === 'Moon') continue;
    const pLon = planets[pName].lon;
    for (const asp of H_ASPECTS) {
      const targets = [_norm360(pLon + asp.angle), _norm360(pLon - asp.angle)];
      for (const target of targets) {
        let dist = _norm360(moonLon - target); // 月亮已经过去了多少度
        if (dist > 180) continue;
        if (dist > 0.5 && dist < closestDist) {
          // 确保target在同一个星座内
          const moonSign = Math.floor(moonLon / 30);
          const targetSign = Math.floor(target / 30);
          if (moonSign === targetSign) {
            closestDist = dist;
            lastPlanet = pName;
            lastAspect = asp;
          }
        }
      }
    }
  }
  return lastPlanet ? { planet: lastPlanet, aspect: lastAspect, degAgo: closestDist } : null;
}

// 单向接纳 Reception 检测（A在B的入庙/耀升星座中 → B接纳A）
function _checkReceptions(planets) {
  const receptions = [];
  for (const pA of PLANET_LIST) {
    for (const pB of PLANET_LIST) {
      if (pA === pB) continue;
      const sA = Math.floor(planets[pA].lon / 30);
      // pA在pB的入庙星座中 → pB以入庙接纳pA
      if (H_DOMICILE[pB]?.includes(sA)) {
        receptions.push({ received: pA, by: pB, type: 'domicile' });
      }
      // pA在pB的耀升星座中 → pB以耀升接纳pA
      if (H_EXALTATION[pB]?.sign === sA) {
        receptions.push({ received: pA, by: pB, type: 'exaltation' });
      }
    }
  }
  return receptions;
}

// Antiscion/Contra-Antiscion 相位检测：投影点与其他行星形成合相
function _checkAntiscions(planets) {
  const hits = [];
  for (let i = 0; i < PLANET_LIST.length; i++) {
    const p1 = PLANET_LIST[i];
    const anti1 = planets[p1].antiscion;
    const cAnti1 = planets[p1].contraAntiscion;
    for (let j = i + 1; j < PLANET_LIST.length; j++) {
      const p2 = PLANET_LIST[j];
      const p2Lon = planets[p2].lon;
      // 投影点合相容许度 2°（严格版）
      let dist = Math.abs(anti1 - p2Lon);
      if (dist > 180) dist = 360 - dist;
      if (dist < 2) {
        hits.push({ p1, p2, type: 'antiscion', orb: dist });
      }
      // 反向检查 p2 → p1
      const anti2 = planets[p2].antiscion;
      let dist2 = Math.abs(anti2 - planets[p1].lon);
      if (dist2 > 180) dist2 = 360 - dist2;
      if (dist2 < 2 && dist >= 2) {
        hits.push({ p1: p2, p2: p1, type: 'antiscion', orb: dist2 });
      }
      // 反投影点（contra-antiscion，相当于隐性对冲）
      let cDist = Math.abs(cAnti1 - p2Lon);
      if (cDist > 180) cDist = 360 - cDist;
      if (cDist < 2) {
        hits.push({ p1, p2, type: 'contra-antiscion', orb: cDist });
      }
    }
  }
  return hits;
}

// 计算特定问题的阿拉伯点
function _calcArabicPart(qType, ascDeg, houses, planets, isDayChart) {
  const partDef = H_ARABIC_PARTS[qType] || H_ARABIC_PARTS.general;
  let lon;
  switch (partDef.formula) {
    case 'standard': // Part of Fortune
      lon = _calcPartOfFortune(ascDeg, planets.Sun.lon, planets.Moon.lon, isDayChart);
      break;
    case 'asc+desc-venus': // Part of Marriage: ASC + DSC - Venus
      lon = _norm360(ascDeg + _norm360(ascDeg + 180) - planets.Venus.lon);
      break;
    case 'asc+mars-saturn': // Part of Sickness / Lawsuits
      lon = _norm360(ascDeg + planets.Mars.lon - planets.Saturn.lon);
      break;
    case 'asc+sun-mercury': // Part of Knowledge
      lon = _norm360(ascDeg + planets.Sun.lon - planets.Mercury.lon);
      break;
    case 'asc+saturn-sun': // Part of Father
      lon = _norm360(ascDeg + planets.Saturn.lon - planets.Sun.lon);
      break;
    case 'asc+9cusp-9ruler': { // Part of Travel
      const h9 = houses[8]; // 9th house
      const ruler9 = ZODIAC[h9.signIdx].ruler;
      lon = _norm360(ascDeg + h9.cusp - planets[ruler9].lon);
      break;
    }
    default:
      lon = _calcPartOfFortune(ascDeg, planets.Sun.lon, planets.Moon.lon, isDayChart);
  }
  return { name: partDef.name, zh: partDef.zh, lon, signIdx: Math.floor(lon / 30), degInSign: lon % 30 };
}

// 应期估算
function _estimateTiming(degToPerfect, modality, houseType) {
  const unit = H_TIMING_GRID[modality]?.[houseType] || 'months';
  const val = Math.max(1, Math.round(degToPerfect));
  return { value: val, unit };
}

// 问题类型检测（复用现有正则模式）
function _detectQType(q) {
  if (!q) return 'general';
  if (/感情|爱情|婚姻|恋爱|对象|结婚|分手|romantic|romance|dating|girlfriend|boyfriend|marriage/i.test(q)) return 'love';
  if (/工作|事业|跳槽|升职|面试|创业|career|job|work|promotion|interview/i.test(q)) return 'career';
  if (/财|钱|投资|理财|股|money|wealth|invest|finance|stock/i.test(q)) return 'money';
  if (/身体|健康|病|医|手术|health|sick|medical|surgery/i.test(q)) return 'health';
  if (/学习|学业|考试|留学|exam|study|school|university/i.test(q)) return 'study';
  if (/出行|旅游|搬家|移民|travel|trip|move|relocate/i.test(q)) return 'travel';
  if (/官司|诉讼|法律|合同|court|lawsuit|legal/i.test(q)) return 'legal';
  if (/家庭|家人|父母|子女|family|parents|children/i.test(q)) return 'family';
  if (/在哪|丢了|失物|where|find|lost/i.test(q)) return 'find';
  return 'general';
}

// ==================== 主卓卦分析函数 ====================
function performHoraryReading(inputStr, questionText, date, derivativeRoot) {
  const now = date || new Date();
  const planets = _getAllPlanets(now);
  const asc = _kpAscendant(inputStr);
  const houses = _calcHouses(asc.deg);

  // 行星落宫
  for (const pName of PLANET_LIST) {
    const p = planets[pName];
    p._name = pName;
    p.signIdx = Math.floor(p.lon / 30);
    p.sign = ZODIAC[p.signIdx];
    p.degInSign = p.lon % 30;
    p.house = _planetInHouse(p.lon, houses);
  }

  // 昼夜盘判断：太阳在地平线上（7-12宫简化为上半球）= 昼
  const sunHouse = planets.Sun.house.num;
  const isDayChart = sunHouse >= 7 && sunHouse <= 12;

  // 尊严评分（传入isDayChart和degInSign用于完整计算）
  for (const pName of PLANET_LIST) {
    const p = planets[pName];
    p.essential = _essentialDignity(pName, p.signIdx, p.degInSign, isDayChart);
    p.accidental = _accidentalDignity(pName, p.house.type, p.house.num, p.speed, p.isRetrograde, planets.Sun.lon, p.lon);
    // 直行加分 +4（逆行已在accidental中扣分，直行且速度正常额外加分）
    if (!p.isRetrograde && pName !== 'Sun' && pName !== 'Moon') {
      p.accidental.score += 4; p.accidental.notes.push('direct');
    }
    p.totalScore = p.essential.score + p.accidental.score;
  }

  // 问题类型和征象星（支持转宫法）
  const qType = _detectQType(questionText);
  const sigs = _identifySignificators(qType, houses, derivativeRoot);
  const querent = planets[sigs.querent];
  const quesited = planets[sigs.quesited];

  // 月亮作为问卦者共同征象星（Horary传统：月亮始终辅助代表问卦者）
  const moonCoSig = planets.Moon;

  // 征象星间的相位
  const sigAspect = _findAspect(sigs.querent, querent.lon, querent.speed, sigs.quesited, quesited.lon, quesited.speed);

  // 月亮分析
  const moonAna = _analyzeMoon(planets.Moon.lon, planets.Moon.speed, planets);

  // 月亮最后相位（上下文参考）
  const moonLastAsp = _moonLastAspect(planets.Moon.lon, planets);

  // 月亮与事物星的相位（月亮作为共同征象星的关键判断）
  const moonToQuesited = _findAspect('Moon', planets.Moon.lon, planets.Moon.speed, sigs.quesited, quesited.lon, quesited.speed);

  // 月亮与问卦者征象星的相位
  const moonToQuerent = _findAspect('Moon', planets.Moon.lon, planets.Moon.speed, sigs.querent, querent.lon, querent.speed);

  // 互容
  const mutualReceptions = _checkMutualReception(planets);

  // 单向接纳
  const receptions = _checkReceptions(planets);

  // 福点
  const partOfFortune = _calcPartOfFortune(asc.deg, planets.Sun.lon, planets.Moon.lon, isDayChart);
  const pofHouse = _planetInHouse(partOfFortune, houses);

  // 问题特定阿拉伯点
  const arabicPart = _calcArabicPart(qType, asc.deg, houses, planets, isDayChart);
  const arabicPartHouse = _planetInHouse(arabicPart.lon, houses);

  // 恒星
  const fixedStarHits = _checkFixedStars(planets, now.getFullYear());

  // 动态干扰检测（拦截/撤回/挫折一体化模拟）
  const interference = sigs.querent !== sigs.quesited ? _checkInterference(sigs.querent, sigs.quesited, planets) : { prohibition: null, refranation: false, frustration: false };
  const prohibition = interference.prohibition;
  const refranation = interference.refranation;
  const frustration = interference.frustration;

  // 围攻
  const querentBesieged = _checkBesiegement(sigs.querent, planets);
  const quesitedBesieged = _checkBesiegement(sigs.quesited, planets);

  // 光线传播/汇聚
  const translation = sigs.querent !== sigs.quesited ? _checkTranslation(sigs.querent, sigs.quesited, planets) : null;
  const collection = sigs.querent !== sigs.quesited ? _checkCollection(sigs.querent, sigs.quesited, planets) : null;

  // Antiscion（投影点）相位
  const antiscions = _checkAntiscions(planets);

  // 北交点
  const northNodeLon = planets._northNode;
  const southNodeLon = _norm360(northNodeLon + 180);
  // 检查交点与征象星合相
  let nodeNote = null;
  for (const pName of [sigs.querent, sigs.quesited]) {
    let dN = Math.abs(planets[pName].lon - northNodeLon); if (dN > 180) dN = 360 - dN;
    let dS = Math.abs(planets[pName].lon - southNodeLon); if (dS > 180) dS = 360 - dS;
    if (dN < 5) nodeNote = { planet: pName, node: 'north', orb: dN };
    if (dS < 5) nodeNote = { planet: pName, node: 'south', orb: dS };
  }

  // === 综合评分 ===
  let score = 0;
  // 征象星力量（权重30%）
  score += querent.totalScore * 0.15;
  score += quesited.totalScore * 0.15;
  // 征象星间相位（权重最高）
  if (sigAspect) {
    if (sigAspect.applying) score += sigAspect.aspect.weight * 2;
    else score += sigAspect.aspect.weight * 0.5; // 出相权重低
  } else {
    score -= 2; // 无相位
  }
  // 月亮（共同征象星）
  if (moonToQuesited && moonToQuesited.applying && moonToQuesited.aspect.nature !== 'tense') score += 2;
  if (moonToQuesited && moonToQuesited.applying && moonToQuesited.aspect.nature === 'tense') score -= 1;
  if (moonAna.isVOC) score -= 4;
  if (moonAna.isViaCombusta) score -= 3;
  // 月亮最后相位上下文
  if (moonLastAsp && moonLastAsp.aspect.nature === 'tense') score -= 0.5;
  // 特殊条件
  if (mutualReceptions.length > 0) score += 3;
  if (translation) score += 3;
  if (collection) score += 2;
  if (prohibition) score -= 3;
  if (refranation) score -= 2;
  if (frustration) score -= 2;
  // 围攻
  if (querentBesieged) score -= 3;
  if (quesitedBesieged) score -= 2;
  // 单向接纳（征象星间的接纳）
  const sigReception = receptions.find(r =>
    (r.received === sigs.querent && r.by === sigs.quesited) ||
    (r.received === sigs.quesited && r.by === sigs.querent)
  );
  if (sigReception) score += 2;
  // 投影点（Antiscion）命中征象星
  const sigAntiscion = antiscions.find(a =>
    [sigs.querent, sigs.quesited].includes(a.p1) || [sigs.querent, sigs.quesited].includes(a.p2)
  );
  if (sigAntiscion) score += 1.5;
  // 恒星
  for (const hit of fixedStarHits) score += hit.star.score * 0.5;
  // 交点
  if (nodeNote) score += nodeNote.node === 'north' ? 2 : -2;
  // 福点/阿拉伯点在好宫
  if (pofHouse.type === 'angular') score += 1;
  if (arabicPartHouse.type === 'angular') score += 0.5;
  // 阿拉伯点与征象星合相
  for (const pName of [sigs.querent, sigs.quesited]) {
    let dAP = Math.abs(planets[pName].lon - arabicPart.lon);
    if (dAP > 180) dAP = 360 - dAP;
    if (dAP < 5) score += 1;
  }

  score = Math.max(-10, Math.min(10, Math.round(score * 10) / 10));

  // 判定
  let verdict, verdictKey;
  if (score >= 5) { verdict = 'strongly_favorable'; verdictKey = 'great'; }
  else if (score >= 2) { verdict = 'favorable'; verdictKey = 'good'; }
  else if (score >= -1) { verdict = 'uncertain'; verdictKey = 'neutral'; }
  else if (score >= -4) { verdict = 'unfavorable'; verdictKey = 'bad'; }
  else { verdict = 'strongly_unfavorable'; verdictKey = 'bad'; }

  // 应期
  let timing = null;
  if (sigAspect && sigAspect.applying) {
    const mod = querent.sign.modality;
    const ht = querent.house.type;
    timing = _estimateTiming(sigAspect.degreesToPerfect, mod, ht);
  }

  return {
    asc, houses, planets, isDayChart,
    sigs, querent, quesited, sigAspect,
    moonAna, moonLastAsp, moonToQuesited, moonToQuerent, moonCoSig,
    mutualReceptions, receptions, partOfFortune, pofHouse,
    arabicPart, arabicPartHouse,
    fixedStarHits, prohibition, refranation, frustration,
    querentBesieged, quesitedBesieged,
    translation, collection, antiscions, sigAntiscion, sigReception,
    nodeNote,
    score, verdict, verdictKey, timing, qType,
  };
};

export default function MeihuaYishu() {
  const [lang, setLang] = useState('en');
  const [mode, setMode] = useState(null); // null=landing, 'ask'=Ask Anything
  const [expandedTile, setExpandedTile] = useState('ask'); // auto-expand ask tile on load
  const [lifeBirthday, setLifeBirthday] = useState('');
  const [lifeHour, setLifeHour] = useState(0);
  const [lifeGender, setLifeGender] = useState('女');
  const [lifeCityQuery, setLifeCityQuery] = useState('');
  const [lifeBirthLoc, setLifeBirthLoc] = useState(null);
  const [showLifeCityDD, setShowLifeCityDD] = useState(false);
  const lifeCityRef = useRef(null);
  const [askStep, setAskStep] = useState('question'); // 'question' or 'divine'
  const [input, setInput] = useState('');
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState(null);
  const [tab, setTab] = useState('orig');
  const [detailTab, setDetailTab] = useState('meihua');
  const [expandYao, setExpandYao] = useState(null);
  const [time, setTime] = useState(null);
  const [flags, setFlags] = useState({ choice_analysis: true, timing_section: true, career_section: true, love_section: true, horary_astrology: false });

  // AI Chat state
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMsgs, setAiMsgs] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiUnlocked, setAiUnlocked] = useState(false);
  // Auto AI reading state (embedded in core reading)
  const [autoAiReply, setAutoAiReply] = useState(null);
  const [autoAiLoading, setAutoAiLoading] = useState(false);
  const [aiHistory, setAiHistory] = useState([]); // [{id, label, hexName, msgs, ts}]
  const [expandedHist, setExpandedHist] = useState(null);
  const [aiSessionId, setAiSessionId] = useState(null); // current session ID
  const [feedbackSent, setFeedbackSent] = useState(null); // 'up' | 'down' | null
  const aiEndRef = useRef(null);

  const t = i18n[lang];
  const trackedReadingDoneRef = useRef(false);

  const getFunnelSessionId = () => {
    if (typeof window === 'undefined') return null;
    let id = localStorage.getItem('funnel_session_id');
    if (!id) {
      id = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem('funnel_session_id', id);
    }
    return id;
  };

  const trackEvent = (event, meta = {}) => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        session_id: getFunnelSessionId(),
        page: window.location.pathname,
        source: params.get('utm_source') || null,
        lang,
        meta,
      }),
    }).catch(() => {});
  };
  const ASK_URL = process.env.NEXT_PUBLIC_MEIHUA_ASK_URL || '';
  const MINGPAN_URL = process.env.NEXT_PUBLIC_MINGPAN_URL || '/mingpan';

  const goAsk = () => {
    if (!ASK_URL) { setMode('ask'); return; }
    window.location.href = ASK_URL;
  };

  // --- localStorage helpers for AI history ---
  const MH_HISTORY_KEY = 'meihua_ai_history';
  const loadAiHistory = () => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem(MH_HISTORY_KEY) || '[]'); } catch { return []; }
  };
  const saveAiHistory = (hist) => {
    if (typeof window === 'undefined') return;
    // Keep max 20 sessions, trim old ones
    const trimmed = hist.slice(0, 20);
    try { localStorage.setItem(MH_HISTORY_KEY, JSON.stringify(trimmed)); } catch {}
  };
  const makeSessionId = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  // Load history from localStorage on mount
  useEffect(() => { setAiHistory(loadAiHistory()); }, []);

  // Support direct entry: /?mode=ask (used by /askanything)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'ask') setMode('ask');
  }, []);

  // Close life city dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (lifeCityRef.current && !lifeCityRef.current.contains(e.target)) setShowLifeCityDD(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // When result changes (new divination), set up session
  useEffect(() => {
    if (result && result.question && result.oHex?.name) {
      const sid = makeSessionId();
      setAiSessionId(sid);
      setAiMsgs([]);
    }
  }, [result?.question, result?.oHex?.name]);

  // Persist current session to localStorage whenever aiMsgs changes
  useEffect(() => {
    if (!aiSessionId || !result) return;
    const hist = loadAiHistory();
    const idx = hist.findIndex(h => h.id === aiSessionId);
    const entry = {
      id: aiSessionId,
      label: result.question,
      hexName: result.oHex?.name || '',
      msgs: aiMsgs,
      ts: Date.now(),
    };
    if (aiMsgs.length === 0 && idx === -1) return; // don't save empty new sessions
    if (idx >= 0) {
      if (aiMsgs.length > 0) hist[idx] = entry;
    } else if (aiMsgs.length > 0) {
      hist.unshift(entry);
    }
    // Sort by most recent
    hist.sort((a, b) => b.ts - a.ts);
    saveAiHistory(hist);
    setAiHistory(hist);
    // Also save latest message to Supabase (fire-and-forget)
    if (aiMsgs.length > 0) {
      const last = aiMsgs[aiMsgs.length - 1];
      fetch('/api/chat-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: aiSessionId, page_type: 'meihua', role: last.role, content: last.text }),
      }).catch(() => {});
    }
  }, [aiMsgs]);

  useEffect(() => { setTime(new Date()); const timer = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(timer); }, []);
  useEffect(() => { fetch('/api/flags').then(r => r.json()).then(setFlags).catch(() => {}); }, []);

  // Funnel: session start
  useEffect(() => {
    trackEvent('session_start', { mode: mode || 'landing' });
  }, []);

  // Funnel: reading done
  useEffect(() => {
    if (result && !trackedReadingDoneRef.current) {
      trackedReadingDoneRef.current = true;
      trackEvent('reading_done', {
        question_length: (result.question || '').length,
        has_ai: !!result.ai,
      });
    }
    if (!result) trackedReadingDoneRef.current = false;
  }, [result]);

  // Fetch quota and subscription status from server
  const [aiRemaining, setAiRemaining] = useState(3);
  const fetchQuota = useCallback(() => {
    fetch('/api/quota').then(r => r.json()).then(d => {
      setAiRemaining(d.remaining);
      setAiUnlocked(d.unlocked);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Handle Stripe redirect
    const params = new URLSearchParams(window.location.search);
    const sid = params.get('session_id');
    if (params.get('checkout_cancelled') === 'true') {
      trackEvent('checkout_cancelled', { source: 'stripe_cancel_return' });
      window.history.replaceState({}, '', '/');
    }
    if (params.get('unlocked') === 'true' || sid) {
      window.history.replaceState({}, '', '/');
      if (sid) {
        fetch('/api/subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stripe_session_id: sid }),
        }).then(() => fetchQuota()).catch(() => {});
        trackEvent('paid_success', { stripe_session_id: sid });
      } else {
        fetchQuota();
        trackEvent('paid_success', { source: 'unlocked_query' });
      }
    } else {
      fetchQuota();
    }
  }, [fetchQuota]);

  useEffect(() => { aiEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [aiMsgs]);

  // Build hexagram context for AI — handles both plum blossom and coin methods
  const buildHexContext = useCallback(() => {
    if (!result) return '';
    const r = result;
    const oHexName = lang === 'en' ? (HEX_NAMES_EN[r.oHex?.name] || r.oHex?.name) : r.oHex?.name;
    const cHexName = lang === 'en' ? (HEX_NAMES_EN[r.cHex?.name] || r.cHex?.name) : r.cHex?.name;

    if (r.method === 'coin') {
      // Coin divination: include changing lines info and reading focus
      const YAO_NAMES = { 9: lang === 'en' ? 'Old Yang (changing)' : '老阳（动）', 7: lang === 'en' ? 'Young Yang' : '少阳', 8: lang === 'en' ? 'Young Yin' : '少阴', 6: lang === 'en' ? 'Old Yin (changing)' : '老阴（动）' };
      const yaoDesc = r.yaoValues?.map((v, i) => `Line ${i + 1}: ${YAO_NAMES[v]}`).join(', ');
      const focus = r.readingFocus;
      // Get the specific yao texts that should be read
      let keyTexts = '';
      if (focus?.primary?.content === 'yaoCi' && focus.primary.positions) {
        const hex = focus.primary.source === 'ben' ? r.oHex : r.cHex;
        keyTexts = focus.primary.positions.map(pos => {
          const y = hex?.yao?.[pos];
          return y ? `${lang === 'en' ? (y.posEn || y.pos) : y.pos}: ${lang === 'en' ? (y.textEn || y.text) : y.text}` : '';
        }).filter(Boolean).join('\n');
      }
      // Ti-Yong info for coin
      const tiName = lang === 'en' ? (r.ti?.nameEn || r.ti?.name) : r.ti?.name;
      const yongName = lang === 'en' ? (r.yong?.nameEn || r.yong?.name) : r.yong?.name;
      const tiEl = lang === 'en' ? (t.elements[r.ti?.element] || r.ti?.element) : r.ti?.element;
      const yongEl = lang === 'en' ? (t.elements[r.yong?.element] || r.yong?.element) : r.yong?.element;
      const relDesc = t.relations[r.relKey] || r.relKey;
      // Determine ti position
      const lowerHasChg = r.changingLines?.some(i => i < 3);
      const upperHasChg = r.changingLines?.some(i => i >= 3);
      const tiPos = (!lowerHasChg && !upperHasChg) ? 'N/A' : (lowerHasChg && !upperHasChg) ? 'upper' : (upperHasChg && !lowerHasChg) ? 'lower' : 'mixed';

      // Map relKey to simple judgment
      const JUDGMENT_MAP = { yongShengTi: lang === 'en' ? 'favorable' : '吉', tiKeYong: lang === 'en' ? 'slightly favorable' : '小吉', bihe: lang === 'en' ? 'neutral' : '平', tiShengYong: lang === 'en' ? 'slightly unfavorable' : '小凶', yongKeTi: lang === 'en' ? 'unfavorable' : '凶' };
      const tiYongJudgment = r.ti && r.relKey ? (JUDGMENT_MAP[r.relKey] || null) : null;
      // Mutual hexagram (互卦)
      const huGuaLines = r.huLower && r.huUpper ? [...r.huLower.lines, ...r.huUpper.lines].join('') : null;
      const huGuaHex = huGuaLines ? HEXAGRAMS[huGuaLines] : null;
      const huGuaName = huGuaHex ? (lang === 'en' ? (HEX_NAMES_EN[huGuaHex.name] || huGuaHex.name) : huGuaHex.name) : undefined;

      return JSON.stringify({
        method: 'coin',
        question: r.question,
        primaryHexagram: oHexName,
        changedHexagram: cHexName,
        numChangingLines: r.numChanging,
        changingLinePositions: r.changingLines?.map(i => i + 1),
        yaoValues: yaoDesc,
        readingRule: lang === 'en' ? focus?.ruleEn : focus?.ruleZh,
        keyTexts: keyTexts || undefined,
        guaCi: lang === 'en' ? (r.oHex?.guaEn || r.oHex?.gua) : r.oHex?.gua,
        changedGuaCi: lang === 'en' ? (r.cHex?.guaEn || r.cHex?.gua) : r.cHex?.gua,
        upperTrigram: lang === 'en' ? (r.uGua?.nameEn || r.uGua?.name) : r.uGua?.name,
        lowerTrigram: lang === 'en' ? (r.lGua?.nameEn || r.lGua?.name) : r.lGua?.name,
        tiGua: r.ti ? { name: tiName, element: tiEl, position: tiPos } : undefined,
        yongGua: r.yong ? { name: yongName, element: yongEl } : undefined,
        tiYongRelation: r.numChanging > 0 ? relDesc : undefined,
        tiYongJudgment: tiYongJudgment || undefined,
        huGua: huGuaName,
      });
    }

    // Plum blossom method
    const tiName = lang === 'en' ? (r.ti?.nameEn || r.ti?.name) : r.ti?.name;
    const yongName = lang === 'en' ? (r.yong?.nameEn || r.yong?.name) : r.yong?.name;
    const relDesc = t.relations[r.relKey] || r.relKey;
    return JSON.stringify({
      method: 'plumBlossom',
      question: r.question,
      primaryHexagram: oHexName,
      changedHexagram: cHexName,
      tiGua: `${tiName} (${lang === 'en' ? (t.elements[r.ti?.element] || r.ti?.element) : r.ti?.element})`,
      yongGua: `${yongName} (${lang === 'en' ? (t.elements[r.yong?.element] || r.yong?.element) : r.yong?.element})`,
      tiYongRelation: relDesc,
      movingLine: r.chg,
      upperTrigram: lang === 'en' ? (r.uGua?.nameEn || r.uGua?.name) : r.uGua?.name,
      lowerTrigram: lang === 'en' ? (r.lGua?.nameEn || r.lGua?.name) : r.lGua?.name,
      guaCi: lang === 'en' ? (r.oHex?.guaEn || r.oHex?.gua) : r.oHex?.gua,
    });
  }, [result, lang, t]);

  const sendAi = useCallback(async (text) => {
    const userMsg = (text || aiInput).trim();
    if (!userMsg || aiLoading) return;
    if (!aiUnlocked && aiRemaining <= 0) return;
    setAiInput('');
    setAiMsgs(prev => [...prev, { role: 'user', text: userMsg }]);
    setAiLoading(true);
    try {
      const res = await fetch('/api/meihua-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...aiMsgs.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })), { role: 'user', content: userMsg }],
          hexData: buildHexContext(),
          lang,
          method: result?.method || 'plumBlossom',
        }),
      });
      const data = await res.json();
      if (data.quota_exceeded) {
        setAiRemaining(0);
        setAiMsgs(prev => [...prev, { role: 'assistant', text: data.reply }]);
      } else {
        setAiMsgs(prev => [...prev, { role: 'assistant', text: data.reply || (lang === 'en' ? 'Unable to respond.' : '暂时无法回答。') }]);
        fetchQuota();
      }
    } catch {
      setAiMsgs(prev => [...prev, { role: 'assistant', text: lang === 'en' ? 'Network error. Please try again.' : '网络错误，请重试。' }]);
    }
    setAiLoading(false);
  }, [aiInput, aiLoading, aiMsgs, aiUnlocked, aiRemaining, buildHexContext, lang, fetchQuota]);

  // Auto AI reading: triggered after divination to give AI-powered answer
  const triggerAutoAiReading = useCallback(async (rd) => {
    setAutoAiReply(null);
    setAutoAiLoading(true);
    const oHexName = lang === 'en' ? (HEX_NAMES_EN[rd.oHex?.name] || rd.oHex?.name) : rd.oHex?.name;
    const cHexName = lang === 'en' ? (HEX_NAMES_EN[rd.cHex?.name] || rd.cHex?.name) : rd.cHex?.name;
    const today = new Date().toLocaleDateString('en-CA');
    let hexData, autoPrompt;

    if (rd.method === 'coin') {
      // Coin divination — build context with changing lines and reading focus
      const YAO_NAMES = { 9: lang === 'en' ? 'Old Yang (changing)' : '老阳（动）', 7: lang === 'en' ? 'Young Yang' : '少阳', 8: lang === 'en' ? 'Young Yin' : '少阴', 6: lang === 'en' ? 'Old Yin (changing)' : '老阴（动）' };
      const yaoDesc = rd.yaoValues?.map((v, i) => `${lang === 'en' ? `Line ${i+1}` : `第${i+1}爻`}: ${YAO_NAMES[v]}`).join(', ');
      const focus = rd.readingFocus;
      // Get key yao texts for AI context
      let keyTexts = '';
      if (focus?.primary?.content === 'yaoCi' && focus.primary.positions) {
        const hex = focus.primary.source === 'ben' ? rd.oHex : rd.cHex;
        keyTexts = focus.primary.positions.map(pos => {
          const y = hex?.yao?.[pos];
          return y ? `${lang === 'en' ? (y.posEn || y.pos) : y.pos}: ${lang === 'en' ? (y.textEn || y.text) : y.text} — ${lang === 'en' ? (y.meanEn || y.mean) : y.mean}` : '';
        }).filter(Boolean).join('\n');
      }
      if (focus?.secondary?.content === 'yaoCi' && focus.secondary.positions) {
        const hex = focus.secondary.source === 'ben' ? rd.oHex : rd.cHex;
        const secTexts = focus.secondary.positions.map(pos => {
          const y = hex?.yao?.[pos];
          return y ? `${lang === 'en' ? (y.posEn || y.pos) : y.pos}: ${lang === 'en' ? (y.textEn || y.text) : y.text} — ${lang === 'en' ? (y.meanEn || y.mean) : y.mean}` : '';
        }).filter(Boolean).join('\n');
        if (secTexts) keyTexts += '\n' + secTexts;
      }
      // Ti-Yong for coin auto reading
      const coinTiName = lang === 'en' ? (rd.ti?.nameEn || rd.ti?.name) : rd.ti?.name;
      const coinYongName = lang === 'en' ? (rd.yong?.nameEn || rd.yong?.name) : rd.yong?.name;
      const coinTiEl = lang === 'en' ? (t.elements[rd.ti?.element] || rd.ti?.element) : rd.ti?.element;
      const coinYongEl = lang === 'en' ? (t.elements[rd.yong?.element] || rd.yong?.element) : rd.yong?.element;
      const coinRelDesc = t.relations[rd.relKey] || rd.relKey;

      // Map relKey to simple judgment
      const COIN_JUDGMENT = { yongShengTi: lang === 'en' ? 'favorable' : '吉', tiKeYong: lang === 'en' ? 'slightly favorable' : '小吉', bihe: lang === 'en' ? 'neutral' : '平', tiShengYong: lang === 'en' ? 'slightly unfavorable' : '小凶', yongKeTi: lang === 'en' ? 'unfavorable' : '凶' };
      const coinJudgment = rd.ti && rd.relKey ? (COIN_JUDGMENT[rd.relKey] || null) : null;
      // Mutual hexagram (互卦)
      const huLines = rd.huLower && rd.huUpper ? [...rd.huLower.lines, ...rd.huUpper.lines].join('') : null;
      const huHex = huLines ? HEXAGRAMS[huLines] : null;
      const huName = huHex ? (lang === 'en' ? (HEX_NAMES_EN[huHex.name] || huHex.name) : huHex.name) : undefined;

      hexData = JSON.stringify({
        method: 'coin', question: rd.question,
        primaryHexagram: oHexName,
        primaryMeaning: lang === 'en' ? (rd.oHex?.duanyiEn || rd.oHex?.duanyi) : rd.oHex?.duanyi,
        changedHexagram: cHexName,
        changedMeaning: rd.numChanging > 0 ? (lang === 'en' ? (rd.cHex?.duanyiEn || rd.cHex?.duanyi) : rd.cHex?.duanyi) : undefined,
        huGua: huName,
        huGuaMeaning: huHex ? (lang === 'en' ? (huHex.duanyiEn || huHex.duanyi) : huHex.duanyi) : undefined,
        numChangingLines: rd.numChanging,
        changingLinePositions: rd.changingLines?.map(i => i + 1),
        yaoValues: yaoDesc,
        readingRule: lang === 'en' ? focus?.ruleEn : focus?.ruleZh,
        keyTexts: keyTexts || undefined,
        guaCi: lang === 'en' ? (rd.oHex?.guaEn || rd.oHex?.gua) : rd.oHex?.gua,
        changedGuaCi: rd.numChanging > 0 ? (lang === 'en' ? (rd.cHex?.guaEn || rd.cHex?.gua) : rd.cHex?.gua) : undefined,
        upperTrigram: lang === 'en' ? (rd.uGua?.nameEn || rd.uGua?.name) : rd.uGua?.name,
        lowerTrigram: lang === 'en' ? (rd.lGua?.nameEn || rd.lGua?.name) : rd.lGua?.name,
        tiGua: rd.ti ? { name: coinTiName, element: coinTiEl } : undefined,
        yongGua: rd.yong ? { name: coinYongName, element: coinYongEl } : undefined,
        tiYongRelation: rd.numChanging > 0 ? coinRelDesc : undefined,
        tiYongJudgment: coinJudgment || undefined,
      });
      autoPrompt = lang === 'en'
        ? `Today is ${today}. The user cast coins and asked: "${rd.question}"\n\nAnswer directly. Start with a clear judgment (yes/no/likely/wait), then explain naturally:\n- What the key message means for their situation (in plain language, not literal classical translation)\n- What the process will look like (if mutual hexagram info exists)\n- Where things ultimately head (from changed hexagram meaning)\n- Time-relevant advice tied to today's date\nOne flowing paragraph, no headers or lists. Do NOT repeat hexagram data. Under 300 words.`
        : `今天是${today}。用户通过掷币起卦，问的是："${rd.question}"\n\n直接回答用户的问题。开头就给判断（能/不能/可能/等等），然后像聊天一样自然地解释为什么：\n- 关键提示意味着什么（用大白话，不要翻译古文原文）\n- 过程中会经历什么（如果有互卦信息）\n- 最终走向如何（用变卦含义）\n- 结合今天日期给出有时效性的建议\n一段话说完，不要分层、不要加标题。不要复述卦象数据。300字以内。`;
    } else {
      // Plum blossom method — original logic
      const tiName = lang === 'en' ? (rd.ti?.nameEn || rd.ti?.name) : rd.ti?.name;
      const yongName = lang === 'en' ? (rd.yong?.nameEn || rd.yong?.name) : rd.yong?.name;
      const relDesc = t.relations[rd.relKey] || rd.relKey;
      hexData = JSON.stringify({
        method: 'plumBlossom', question: rd.question, primaryHexagram: oHexName, changedHexagram: cHexName,
        tiGua: `${tiName} (${lang === 'en' ? (t.elements[rd.ti?.element] || rd.ti?.element) : rd.ti?.element})`,
        yongGua: `${yongName} (${lang === 'en' ? (t.elements[rd.yong?.element] || rd.yong?.element) : rd.yong?.element})`,
        tiYongRelation: relDesc, movingLine: rd.chg,
        upperTrigram: lang === 'en' ? (rd.uGua?.nameEn || rd.uGua?.name) : rd.uGua?.name,
        lowerTrigram: lang === 'en' ? (rd.lGua?.nameEn || rd.lGua?.name) : rd.lGua?.name,
        guaCi: lang === 'en' ? (rd.oHex?.guaEn || rd.oHex?.gua) : rd.oHex?.gua,
      });
      autoPrompt = lang === 'en'
        ? `Today is ${today}. The user asked: "${rd.question}"\n\nBased on the hexagram data, give a direct answer. Start with a clear yes/no/likely/unlikely judgment, then explain why in plain language — include what the process will look like and where things ultimately head. Give time-relevant advice using today's date.\nCRITICAL: Do NOT use any I Ching jargon. Write as if explaining to a friend. Do NOT repeat hexagram data. Under 300 words.`
        : `今天是${today}。用户问的是："${rd.question}"\n\n根据卦象数据，直接回答用户的问题。先给出明确的判断（能/不能/可能/不太适合等），再用大白话解释为什么——包括过程中会经历什么、最终走向如何。结合今天日期给出有时效性的建议。【重要】绝对不要使用任何不像是人话的词语。要跟朋友说话一样说话。不要复述卦象数据。300字以内。`;
    }
    try {
      const res = await fetch('/api/meihua-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: autoPrompt }], hexData, lang, method: rd.method || 'plumBlossom' }),
      });
      const data = await res.json();
      if (data.quota_exceeded) {
        setAiRemaining(0);
      } else {
        const reply = data.reply || '';
        if (reply) {
          setAutoAiReply(reply);
          const synthQ = lang === 'en' ? `Interpret this hexagram for my question: "${rd.question}"` : `请解读这个卦象，回答我的问题："${rd.question}"`;
          setAiMsgs([{ role: 'user', text: synthQ }, { role: 'assistant', text: reply }]);
        }
        fetchQuota();
      }
    } catch { /* network error — rule-based reading still shows below */ }
    setAutoAiLoading(false);
  }, [lang, t, fetchQuota]);

  const calc = (overrideInput) => {
    const useInput = (typeof overrideInput === 'string' ? overrideInput : '') || input;
    if (!useInput || !/^\d+$/.test(useInput) || useInput.length < 2) return alert(t.invalidInput);
    const d = useInput.split('').map(Number), len = d.length;
    const sh = getShichen();
    const sp = Math.max(1, Math.floor(len / 2));
    const u = d.slice(0, sp).reduce((a, b) => a + b, 0);
    const l = d.slice(sp).reduce((a, b) => a + b, 0);
    const uNum = u % 8 || 8, lNum = l % 8 || 8, chg = (u + l + sh.num) % 6 || 6;
    const uGua = BAGUA[uNum], lGua = BAGUA[lNum];
    const oLines = [...lGua.lines, ...uGua.lines];
    const cLines = [...oLines]; cLines[chg - 1] = cLines[chg - 1] === 1 ? 0 : 1;
    const cU = findG(cLines.slice(3, 6)), cL = findG(cLines.slice(0, 3));
    const oHex = HEXAGRAMS[oLines.join('')] || { name: '未知卦', nameEn: 'Unknown' };
    const cHex = HEXAGRAMS[cLines.join('')] || { name: '未知卦', nameEn: 'Unknown' };
    const ti = chg <= 3 ? uGua : lGua, yong = chg <= 3 ? lGua : uGua;
    let relKey = '', lv = '';
    if (ti.element === yong.element) { relKey = 'bihe'; lv = 'n'; }
    else if (WUXING[yong.element]?.sheng === ti.element) { relKey = 'yongShengTi'; lv = 'g'; }
    else if (WUXING[ti.element]?.sheng === yong.element) { relKey = 'tiShengYong'; lv = 'c'; }
    else if (WUXING[yong.element]?.ke === ti.element) { relKey = 'yongKeTi'; lv = 'w'; }
    else if (WUXING[ti.element]?.ke === yong.element) { relKey = 'tiKeYong'; lv = 'ok'; }
    setResult({ method: 'plumBlossom', input: useInput, question, sh, u, l, uNum, lNum, chg, uGua: { n: uNum, ...uGua }, lGua: { n: lNum, ...lGua }, oLines, cLines, cU, cL, oHex, cHex, ti, yong, relKey, lv });
    const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    if (!isLocal) {
      if (question.trim()) fetch('/api/log-question', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question }) }).catch(() => {});
      fetch('/api/save-reading', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        session_id: makeSessionId(),
        type: 'meihua',
        input_data: { input: useInput, question, shichen: sh },
        result_data: { oHex: oHex?.name, cHex: cHex?.name, ti: ti?.name, yong: yong?.name, tiElement: ti?.element, yongElement: yong?.element, relKey, lv, chg },
        lang,
      })}).catch(() => {});
    }
    setTab('orig'); setExpandYao(null);
    // Auto AI reading: call AI to directly answer the user's question
    setAutoAiReply(null); setAutoAiLoading(false);
    const canAutoAi = aiUnlocked || aiRemaining > 0;
    if (canAutoAi && question.trim()) {
      triggerAutoAiReading({ question, oHex, cHex, ti, yong, relKey, chg, uGua: { n: uNum, ...uGua }, lGua: { n: lNum, ...lGua } });
    }
  };

  const sh = getShichen();
  const hex = result ? (tab === 'orig' ? result.oHex : result.cHex) : null;
  const lines = result ? (tab === 'orig' ? result.oLines : result.cLines) : [];
  const uG = result ? (tab === 'orig' ? result.uGua : result.cU) : null;
  const lG = result ? (tab === 'orig' ? result.lGua : result.cL) : null;

  // 辅助函数：获取八卦名称
  const getGuaName = (g) => lang === 'en' ? (g?.nameEn || g?.name) : g?.name;
  // 辅助函数：获取卦名
  const getHexName = (h) => lang === 'en' ? (h?.nameEn || HEX_NAMES_EN[h?.name] || h?.name) : h?.name;
  // 辅助函数：获取五行名称
  const getElement = (el) => t.elements[el] || el;
  // 辅助函数：根据语言获取文本
  const getText = (zh, en) => lang === 'en' ? (en || zh) : zh;
  // 辅助函数：获取傅佩荣解
  const getFu = (fu, key) => lang === 'en' ? (fu?.[key + 'En'] || fu?.[key]) : fu?.[key];
  // 辅助函数：获取传统解卦
  const getTrad = (trad, key) => lang === 'en' ? (trad?.[key + 'En'] || trad?.[key]) : trad?.[key];

  // 智能解读生成函数 - 增强版
  const generateSmartReading = () => {
    if (!result || !result.question) return null;
    
    const q = result.question;
    const { ti, yong, oHex, cHex, chg, uGua, lGua, cU, cL } = result;
    
    // === 应期推断 ===
    const guaNumbers = { '乾': 1, '兑': 2, '离': 3, '震': 4, '巽': 5, '坎': 6, '艮': 7, '坤': 8 };
    const tiNum = guaNumbers[ti.name] || 1;
    const yongNum = guaNumbers[yong.name] || 1;
    const totalNum = tiNum + yongNum;
    
    // 五行对应的旺季
    const elementSeasons = {
      '木': { best: lang === 'en' ? 'Spring (Feb-Apr)' : '春季（2-4月）', bad: lang === 'en' ? 'Autumn (Aug-Oct)' : '秋季（8-10月）' },
      '火': { best: lang === 'en' ? 'Summer (May-Jul)' : '夏季（5-7月）', bad: lang === 'en' ? 'Winter (Nov-Jan)' : '冬季（11-1月）' },
      '土': { best: lang === 'en' ? 'Seasonal months (Mar, Jun, Sep, Dec)' : '四季月（3、6、9、12月）', bad: lang === 'en' ? 'Spring (Feb-Apr)' : '春季（2-4月）' },
      '金': { best: lang === 'en' ? 'Autumn (Aug-Oct)' : '秋季（8-10月）', bad: lang === 'en' ? 'Summer (May-Jul)' : '夏季（5-7月）' },
      '水': { best: lang === 'en' ? 'Winter (Nov-Jan)' : '冬季（11-1月）', bad: lang === 'en' ? 'Seasonal months' : '四季月' },
    };
    const tiSeason = elementSeasons[ti.element] || { best: '', bad: '' };
    
    // 应期月数 → 在 totalLevel 之后精确计算（十种法 + 卦数法）

    // === 体用五行生克分析 ===
    const tiElement = ti.element;
    const yongElement = yong.element;
    
    let tiYongRelKey = '';
    let tiYongLevel = 0;
    
    if (tiElement === yongElement) {
      tiYongRelKey = 'bihe'; tiYongLevel = 1;
    } else if (WUXING[yongElement]?.sheng === tiElement) {
      tiYongRelKey = 'yongShengTi'; tiYongLevel = 2;
    } else if (WUXING[tiElement]?.sheng === yongElement) {
      tiYongRelKey = 'tiShengYong'; tiYongLevel = -1;
    } else if (WUXING[tiElement]?.ke === yongElement) {
      tiYongRelKey = 'tiKeYong'; tiYongLevel = 1;
    } else if (WUXING[yongElement]?.ke === tiElement) {
      tiYongRelKey = 'yongKeTi'; tiYongLevel = -2;
    }
    
    // === 变卦与体卦关系 ===
    const cYong = chg <= 3 ? cL : cU;
    const cYongElement = cYong?.element;
    let bianGuaRelKey = '';
    let bianGuaLevel = 0;
    
    if (cYongElement) {
      if (cYongElement === tiElement) {
        bianGuaRelKey = 'bihe'; bianGuaLevel = 1;
      } else if (WUXING[cYongElement]?.sheng === tiElement) {
        bianGuaRelKey = 'shengTi'; bianGuaLevel = 2;
      } else if (WUXING[tiElement]?.sheng === cYongElement) {
        bianGuaRelKey = 'tiSheng'; bianGuaLevel = 0;
      } else if (WUXING[tiElement]?.ke === cYongElement) {
        bianGuaRelKey = 'tiKe'; bianGuaLevel = 1;
      } else if (WUXING[cYongElement]?.ke === tiElement) {
        bianGuaRelKey = 'keTi'; bianGuaLevel = -1;
      }
    }
    
    const totalLevel = tiYongLevel + bianGuaLevel;

    // === 精确应期推算（梅花易数·十种法 + 卦数法）===
    // 月令五行：公历月 → 对应地支五行
    // 1月丑土,2月寅木,3月卯木,4月辰土,5月巳火,6月午火
    // 7月未土,8月申金,9月酉金,10月戌土,11月亥水,12月子水
    const now = new Date();
    const curMonth = now.getMonth() + 1;
    const mthEleMap = {1:'土',2:'木',3:'木',4:'土',5:'火',6:'火',7:'土',8:'金',9:'金',10:'土',11:'水',12:'水'};
    const mthEle = mthEleMap[curMonth] || '土';

    // 旺衰判断（旺=与月令同五行，相=月令生之；否则为休囚死）
    const isWX = (el) => {
      if (!el) return false;
      if (el === mthEle) return true;                    // 旺（比和）
      if (WUXING[mthEle]?.sheng === el) return true;     // 相（月令生之）
      return false;                                       // 休囚死
    };
    const tiWang   = isWX(tiElement);
    const yongWang = isWX(yongElement);

    // 互卦计算（梅花易数：下互=爻2-4，上互=爻3-5）
    const _gBits = {'乾':[1,1,1],'兑':[1,1,0],'离':[1,0,1],'震':[1,0,0],'巽':[0,1,1],'坎':[0,1,0],'艮':[0,0,1],'坤':[0,0,0]};
    const _bToN  = {};
    Object.entries(_gBits).forEach(([n,b])=>{ _bToN[b.join('')]=n; });
    const _uB = _gBits[uGua?.name] || [0,0,0];
    const _lB = _gBits[lGua?.name] || [0,0,0];
    const huXiaNm = _bToN[[_lB[1],_lB[2],_uB[0]].join('')] || ''; // 下互（爻2-4）
    const huShNm  = _bToN[[_lB[2],_uB[0],_uB[1]].join('')] || ''; // 上互（爻3-5）
    const _gEle   = {'乾':'金','兑':'金','离':'火','震':'木','巽':'木','坎':'水','艮':'土','坤':'土'};
    const huXiaEl = _gEle[huXiaNm] || '';
    const huShEl  = _gEle[huShNm]  || '';
    const bianEl  = cYongElement   || '';  // 变卦（用之变）五行

    // 全卦生体判断（用+下互+上互+变卦，逐一检查）
    const _shTi   = (el) => el && WUXING[el]?.sheng === tiElement;
    const _keTi   = (el) => el && WUXING[el]?.ke    === tiElement;
    const yongST  = _shTi(yongElement);
    const hxST    = _shTi(huXiaEl);
    const hsST    = _shTi(huShEl);
    const bianST  = _shTi(bianEl);
    const anyShTi = yongST || hxST || hsST || bianST; // 卦中是否存在生体之卦

    // 克体延误（按先天数累加，仅互卦和变卦计入；用卦克体本身即凶象）
    let delayDays = 0;
    if (_keTi(huXiaEl)) delayDays += guaNumbers[huXiaNm]    || 0;
    if (_keTi(huShEl))  delayDays += guaNumbers[huShNm]     || 0;
    if (_keTi(bianEl))  delayDays += guaNumbers[cYong?.name] || 0;

    /* ═══════════════════════════════════════════════════════════════════
       旧应期算法（十种法 + 卦数法混合版）— 已隐藏，保留备查
       ═══════════════════════════════════════════════════════════════════
    let _OLD_timingEle = tiElement;
    let _OLD_timingNote = '';
    // ... 十种法 timingNote 分支 (tiKeYong/tiShengYong/yongKeTi/yongShengTi/bihe) ...
    let _OLD_speedMod = yongST ? 0.7 : (hxST||hsST) ? 1.0 : bianST ? 1.4 : 1.0;
    const _OLD_chgPosMod = [0,0.6,0.8,0.95,1.1,1.3,1.6][chg] || 1.0;
    const _OLD_bianSpeedMod = {shengTi:0.85,tiKe:0.9,bihe:1.0,tiSheng:1.1,keTi:1.25}[bianGuaRelKey] ?? 1.0;
    const _OLD_rawVal = Math.round((tiNum+yongNum)*_OLD_speedMod*_OLD_chgPosMod*_OLD_bianSpeedMod);
    // 旺相休囚死 → 单位档位（0=天,1=周,2=月,3=年）
    // 见 git 历史 / 完整代码已替换为下方新框架
    ═══════════════════════════════════════════════════════════════════ */

    // ══════════════════════════════════════════════════════════════════
    // 新应期框架（逢旺则应统一框架）
    // 原则：
    //   1. 时机元素 = 用卦五行
    //   2. 旺相休囚死 → 时间尺度（天/近月/中月/远月/年）
    //   3. 逢旺则应 = 时机元素第N个旺月作为应期锚点
    //   4. 卦数 + 爻位 + 变卦 → N 的大小（远近微调）
    // ══════════════════════════════════════════════════════════════════

    // A. 时机元素 = 用卦五行
    const timingEle = yongElement;

    // B. 旺相休囚死
    let timingStrength;
    if (timingEle === mthEle)                          timingStrength = '旺';
    else if (WUXING[mthEle]?.sheng === timingEle)      timingStrength = '相';
    else if (WUXING[timingEle]?.sheng === mthEle)      timingStrength = '休';
    else if (WUXING[timingEle]?.ke === mthEle)         timingStrength = '囚';
    else                                                timingStrength = '死';

    // C. 尺度档位（0=天, 1=近月1-3, 2=中月3-6, 3=远月6-18, 4=年）
    const strengthBaseScale = { '旺': 0, '相': 1, '休': 2, '囚': 3, '死': 4 };
    let unitScale = strengthBaseScale[timingStrength];
    // 体用关系微调（用生体→缩短一档，用克体→延长一档）
    if (tiYongRelKey === 'yongShengTi') unitScale = Math.max(0, unitScale - 1);
    else if (tiYongRelKey === 'yongKeTi') unitScale = Math.min(4, unitScale + 1);
    // 问题类型软约束（floor/ceiling）
    const isScaleImmediate = /快递|包裹|外卖|回复|today|tomorrow|delivery|parcel|reply|package/i.test(q);
    const isScaleLong = /结婚|买房|购房|移民|退休|marr(?:y|ied|iage)|buy.*house|immigrate|retire/i.test(q);
    if (isScaleImmediate) unitScale = Math.min(1, unitScale);
    if (isScaleLong)      unitScale = Math.max(3, unitScale);

    // D. 逢旺月（timing 元素的旺月 + 最近一次旺月距今月数）
    const eleWangMonths = { '木':[2,3], '火':[5,6], '土':[1,4,7,10], '金':[8,9], '水':[11,12] };
    const wangMonths = eleWangMonths[timingEle] || [];
    const wangFreq = wangMonths.length;                            // 年旺次数
    const wangInterval = wangFreq > 0 ? Math.round(12 / wangFreq) : 12; // 两次旺月间隔
    let fengWangMonth = null, fengWangAway = 0;
    for (let i = 1; i <= 13; i++) {
      const m = ((curMonth - 1 + i) % 12) + 1;
      if (wangMonths.includes(m)) { fengWangMonth = m; fengWangAway = i; break; }
    }

    // E. 动爻位置修正（初爻=近，六爻=远）
    const chgPosMod = [0, 0.7, 0.85, 1.0, 1.1, 1.25, 1.5][chg] || 1.0;
    // F. 变卦速度反馈（变生体→快，变克体→慢）
    const bianSpeedMod = { shengTi: 0.85, tiKe: 0.9, bihe: 1.0, tiSheng: 1.1, keTi: 1.2 }[bianGuaRelKey] ?? 1.0;
    // G. 卦数归一化（guaSum 越大越远）
    const guaSum = tiNum + yongNum;          // 2–16
    const guaRatio = (guaSum - 2) / 14;     // 0.0–1.0

    // 月名
    const monthNamesCN = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
    const monthNamesEN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const curYear = now.getFullYear();
    const timingSeason = elementSeasons[timingEle] || tiSeason;
    // 五行英文名（EN模式下不显示中文字符）
    const eleNameEN = { '木': 'Wood', '火': 'Fire', '土': 'Earth', '金': 'Metal', '水': 'Water' };

    // H. 统一计算（逢旺则应为主锚点）
    let timingValue, timingUnitZH, timingUnitEN, yingqiMonths, targetMonthStr, fengWangNote, timingNote;

    if (unitScale === 0) {
      // 旺 → 天（当前已在旺季）
      timingValue = Math.max(1, Math.min(30, Math.round(guaSum * chgPosMod * bianSpeedMod)));
      timingUnitZH = '天'; timingUnitEN = 'day';
      yingqiMonths = 0;
      targetMonthStr = lang==='en' ? monthNamesEN[curMonth-1] : monthNamesCN[curMonth-1];
      fengWangNote = lang==='en' ? ' (timing is ideal right now)' : '（正值旺季，宜把握当下）';
      timingNote = lang==='en' ? 'The timing is right — move on this now.' : '当前正值旺季，时机已熟。';

    } else if (unitScale <= 3) {
      // 相/休/囚 → 月份（以旺月轮次数计）
      // 每档对应旺月轮次范围：相[0,1], 休[1,2], 囚[2,4]
      const [cycleMin, cycleMax] = { 1:[0,1], 2:[1,2], 3:[2,4] }[unitScale] || [0,1];
      const cycleCount = cycleMin + Math.round(guaRatio * (cycleMax - cycleMin));
      // 目标距今月数 = 最近旺月 + cycleCount × 旺月间隔
      let rawMonthsAway = fengWangAway + cycleCount * wangInterval;
      rawMonthsAway = Math.round(rawMonthsAway * chgPosMod * bianSpeedMod);
      // 档位月数上下限
      const [scaleMin, scaleMax] = { 1:[1,4], 2:[3,8], 3:[6,20] }[unitScale] || [1,12];
      yingqiMonths = Math.max(scaleMin, Math.min(scaleMax, rawMonthsAway));
      // 找距目标最近的旺月
      let targetFengWang = null;
      for (let i = Math.max(1, yingqiMonths - 1); i <= yingqiMonths + wangInterval; i++) {
        const m = ((curMonth - 1 + i) % 12) + 1;
        if (wangMonths.includes(m)) { targetFengWang = m; break; }
      }
      const tMonth = targetFengWang || ((curMonth - 1 + yingqiMonths) % 12) + 1;
      timingValue = yingqiMonths;
      timingUnitZH = '个月'; timingUnitEN = 'month';
      targetMonthStr = lang==='en' ? monthNamesEN[tMonth-1] : monthNamesCN[tMonth-1];
      fengWangNote = targetFengWang
        ? (lang==='en'
          ? ` (best window: ${monthNamesEN[targetFengWang-1]})`
          : `（${timingEle}逢旺${monthNamesCN[targetFengWang-1]}，最可能应期）`)
        : '';
      const stNoteEN = { '相': 'Things are lining up — expect results around', '休': 'Still building — likely around', '囚': 'Takes more time — aim for' }[timingStrength] || 'Likely around';
      timingNote = lang==='en'
        ? `${stNoteEN} ${targetMonthStr}.`
        : `${timingEle}今月${timingStrength}，逢旺则应，待旺月到来时应验。`;

    } else {
      // 死 → 年（月令克时机元素）
      const baseYears = Math.max(1, Math.round(1 + guaRatio * 3)); // 1–4年
      const targetYears = Math.max(1, Math.min(8, Math.round(baseYears * chgPosMod * bianSpeedMod)));
      timingValue = targetYears;
      timingUnitZH = '年'; timingUnitEN = 'year';
      yingqiMonths = targetYears * 12;
      const targetYear = curYear + targetYears;
      const peakMonth = fengWangMonth || wangMonths[0] || curMonth;
      targetMonthStr = lang==='en'
        ? `${monthNamesEN[peakMonth-1]} ${targetYear}`
        : `${targetYear}年${monthNamesCN[peakMonth-1]}`;
      fengWangNote = lang==='en'
        ? ` (most likely around ${monthNamesEN[peakMonth-1]} ${targetYear})`
        : `（大约${targetYear}年${monthNamesCN[peakMonth-1]}前后，${timingEle}逢旺时应验）`;
      timingNote = lang==='en'
        ? `This is a longer journey — give it time. Most likely around ${targetMonthStr}.`
        : `${timingEle}今月被克为死，事情以年为单位，${targetYear}年${timingEle}逢旺时应验。`;
    }

    // 延误提示
    const delayNote = delayDays > 0
      ? (lang==='en' ? ` (~${delayDays}-day delay from mid-process friction)` : `（中间有约${delayDays}天阻延）`)
      : '';

    // === 吉凶判断 ===
    let fortuneKey = '';
    if (totalLevel >= 3) fortuneKey = 'great';
    else if (totalLevel >= 1) fortuneKey = 'good';
    else if (totalLevel === 0) fortuneKey = 'neutral';
    else if (totalLevel >= -2) fortuneKey = 'bad';
    else fortuneKey = 'bad';
    
    // === 问题类型识别（扩展版）===
    // isLove 只匹配明确的感情词，避免"喜欢这份工作"、"love my job"、"relationship with client"等误触
    const isLove    = /感情|爱情|婚姻|恋爱|对象|结婚|分手|复合|暧昧|表白|脱单|男朋友|女朋友|老公|老婆|相亲|失恋|单身|桃花|romantic|romance|dating|girlfriend|boyfriend|ex-girlfriend|ex-boyfriend|breakup|crush|marriage/i.test(q);
    const isCareer  = /工作|事业|跳槽|升职|晋升|面试|创业|生意|offer|辞职|换工作|职场|老板|同事|项目|合作|career|job|work|business|interview|promotion|startup|colleague/i.test(q);
    const isMoney   = /财|钱|投资|理财|股|基金|收入|赚|贷款|负债|资金|融资|money|wealth|invest|finance|stock|fund|loan|income/i.test(q);
    const isHealth  = /身体|健康|病|医|治疗|手术|恢复|症状|检查|养生|作息|health|sick|medical|surgery|recover|symptom|hospital/i.test(q);
    const isStudy   = /学习|学业|考试|考研|高考|留学|升学|成绩|考核|学校|录取|exam|study|school|university|score|grade|academic/i.test(q);
    const isTravel  = /出行|旅游|旅行|搬家|搬迁|出差|移民|换城市|行程|出发|travel|trip|move|relocate|commute|journey/i.test(q);
    const isLegal   = /官司|诉讼|纠纷|法律|合同|仲裁|判决|起诉|律师|court|lawsuit|legal|contract|dispute|arbitration/i.test(q);
    const isFamily  = /家庭|家人|父母|子女|孩子|兄弟|姐妹|亲戚|家里|family|parents|children|sibling|relatives|household/i.test(q);
    const isFind    = /在哪|哪里|找不到|丢了|丢失|失物|where|find|lost|missing/i.test(q);
    const isPerson  = /他|她|对方|某人|朋友|同事|老板|领导|父母|家人|男朋友|女朋友|老公|老婆|\bhe\b|\bshe\b|\bthey\b|\bhim\b|\bher\b|\bboss\b|\bfriend\b/i.test(q);
    // 第三方视角检测：问的是别人，不是自己
    const hasFirstPersonZH = /我/.test(q);
    const hasFirstPersonEN = /\bI\b|\bmy\b|\bme\b|\bI'm\b|\bI've\b|\bI'll\b|\bI'd\b/.test(q);
    const hasFirstPerson   = hasFirstPersonZH || hasFirstPersonEN;
    const isAboutOther     = !hasFirstPerson || isPerson;
    // 提取第三方的名字（用于替换"你/you"）
    const _nameMatch = q.match(/how (?:is|does|will|did)\s+([A-Za-z]{2,})\b/i)
                    || q.match(/^([A-Z][a-z]{1,})\s+(?:is|will|has|can)\b/);
    const _stopWords = new Set(['the','this','that','it','my','your','his','her','their','our','its','a','an','how','what','when','where','why','who']);
    const detectedName = _nameMatch && !_stopWords.has((_nameMatch[1]||'').toLowerCase()) ? _nameMatch[1] : null;
    const subjectZH = detectedName || (q.includes('她') ? '她' : q.includes('他') ? '他' : '对方');
    const subjectEN = detectedName || ((/\bshe\b|\bher\b/i.test(q)) ? 'she' : (/\bhe\b|\bhim\b/i.test(q)) ? 'he' : 'they');
    // 时间点类问题：问的是"几点"（具体钟点），优先级高于时长类
    const isTimePoint = /几点|几时\b|什么时间点|what time\b|at what time/i.test(q);
    // 时长类问题：问的是"多少小时/分钟"（持续时长），isTimePoint 时不触发
    const isDuration = !isTimePoint && /几个小时|几小时|多少小时|多少分钟|几分钟|几个钟|睡多久|睡几小时|多长时间|how many hours|how long|how many minutes|how much time/i.test(q);
    // 卦数法：上卦数+下卦数 = 基础时间单位数
    const durationBase = tiNum + yongNum;
    const durationHours = Math.max(1, Math.min(24, totalLevel >= 1 ? Math.round(durationBase * 0.8) : totalLevel >= 0 ? durationBase : Math.round(durationBase * 1.2)));
    // 时间点推算：当前小时 + 卦数偏移 → 目标钟点
    const nowHour = now.getHours();
    const rawTargetHour = (nowHour + durationHours) % 24;
    const fmtHour = (h) => {
      const period = h < 6 ? '凌晨' : h < 12 ? '早上' : h < 14 ? '中午' : h < 19 ? '下午' : '晚上';
      const dh = h === 0 ? 12 : h > 12 ? h - 12 : h;
      return `${period}${dh}点`;
    };
    const targetClockZH = fmtHour(rawTargetHour);
    const targetClockEN = `${rawTargetHour < 10 ? '0' : ''}${rawTargetHour}:00 (${rawTargetHour < 12 ? 'AM' : 'PM'})`;
    
    // === 时间范围提取 - 关键！===
    const timeScope = {
      isToday: /今天|今日|今晚|今早|现在|此刻|today|tonight|now/i.test(q),
      isTomorrow: /明天|明日|明晚|tomorrow/i.test(q),
      isThisWeek: /这周|本周|这个星期|这礼拜|this week/i.test(q),
      isThisMonth: /这个月|本月|这月|this month/i.test(q),
      isThisYear: /今年|this year/i.test(q),
      isNear: /最近|近期|近来|这段时间|recently|soon/i.test(q),
      isLong: /以后|将来|未来|长远|eventually|future|later/i.test(q)
    };
    timeScope.hasSpecificTime = timeScope.isToday || timeScope.isTomorrow || timeScope.isThisWeek || timeScope.isThisMonth;
    timeScope.isShortTerm = timeScope.isToday || timeScope.isTomorrow || timeScope.isThisWeek;
    
    // 问题类型判断 - 优先级很重要
    const isWhy = /为什么|为啥|怎么回事|什么原因|啥原因|why|what happened|how come/i.test(q);
    // 时机类优先级提高 - "几点"、"什么时候"等
    const isTiming = /几点|什么时候|何时|多久|几时|啥时候|多长时间|时机|when|timing|how long|what time/i.test(q);
    const isYesNo = !isTiming && /会不会|能不能|会吗|能吗|吗$|是不是|有没有|会出|能成|可不可以|will i|can i|is it|will it|am i|do i|does|should i.*\?/i.test(q);
    const isDecision = /该不该|要不要|是否|选择|可以吗|行不行|好不好|适不适合|should i|whether|shall i/i.test(q);
    const isMethod = /怎么办|如何|怎样|该怎么|应该怎么|怎么做|how to|how do|how should|what should/i.test(q);
    const isPrediction = /会怎样|会如何|结果|前景|未来|发展|what will|future|result|outcome/i.test(q);
    const isChoice = /还是|或者|哪个|哪一个|选.*还是|or|which|choose between/i.test(q);
    const isAttitude = /态度|看法|想法|怎么看|怎么想|对我|think of me|attitude|opinion/i.test(q);

    // === 选择题：解析选项 + 权重评估 ===
    let choiceOptions = [];
    let choiceCategoryWeights = { career: 0, marriage: 0, investment: 0, money: 0, study: 0, other: -1 };
    let choiceRankedOptions = [];
    if (isChoice) {
      // 解析选项：按顿号/逗号/"还是"/"或者"/"or" 分割，过滤空词和无意义词
      const stopWords = /^(我|会|通过|怎么|还是|或者|哪个|哪一个|是|的|吗|呢|方式|方法|途径|路径|解决|问题|方向|情况|or|which|by|through|the|a|an|what|how|will|i)$/i;
      choiceOptions = q
        .split(/[，,、]|还是|或者|\bor\b/i)
        .map(p => p.replace(/[？?。！!]/g, '').trim())
        .filter(p => p.length >= 2 && p.length <= 15 && !stopWords.test(p));

      const tagOption = (opt) => {
        if (/工作|事业|职场|雇主|job|work|career|employment|employer/i.test(opt)) return 'career';
        if (/婚姻|结婚|嫁|娶|配偶|marriage|marry|spouse/i.test(opt)) return 'marriage';
        if (/eb.?5|investor|投资移民/i.test(opt)) return 'investment';
        if (/钱|财|投资|融资|money|invest|financial|fund/i.test(opt)) return 'money';
        if (/读书|留学|学业|study|school|education/i.test(opt)) return 'study';
        if (/其他|另外|别的|else|other/i.test(opt)) return 'other';
        return 'unknown';
      };

      // 体用关系 → 路径偏好
      if (tiYongRelKey === 'tiKeYong') {
        // 你主导局面 → 自己主动努力的路径（工作/学业）
        choiceCategoryWeights.career += 2;
        choiceCategoryWeights.study += 1;
      } else if (tiYongRelKey === 'yongShengTi') {
        // 外部主动帮你 → 需要他人协助的路径（婚姻担保、投资方）
        choiceCategoryWeights.marriage += 2;
        choiceCategoryWeights.investment += 1;
      } else if (tiYongRelKey === 'bihe') {
        // 力量相当 → 各路径机会接近
        choiceCategoryWeights.career += 1;
        choiceCategoryWeights.investment += 1;
      } else if (tiYongRelKey === 'tiShengYong') {
        // 你付出 → 投资/钱财类路径
        choiceCategoryWeights.investment += 1;
        choiceCategoryWeights.money += 1;
      } else if (tiYongRelKey === 'yongKeTi') {
        // 外部阻力 → 婚姻路径更难
        choiceCategoryWeights.marriage -= 1;
      }

      // 用卦五行 → 路径类型偏好
      if (yongElement === '金') {
        // 金 → 官方/制度/法律路径
        choiceCategoryWeights.career += 2;
        choiceCategoryWeights.investment += 1;
      } else if (yongElement === '火') {
        // 火 → 感情/社交
        choiceCategoryWeights.marriage += 2;
      } else if (yongElement === '水') {
        // 水 → 流通/钱财
        choiceCategoryWeights.investment += 1;
        choiceCategoryWeights.money += 1;
      } else if (yongElement === '木') {
        // 木 → 成长/教育
        choiceCategoryWeights.study += 2;
        choiceCategoryWeights.career += 1;
      } else if (yongElement === '土') {
        // 土 → 稳定/积累
        choiceCategoryWeights.investment += 1;
        choiceCategoryWeights.career += 1;
      }

      choiceRankedOptions = choiceOptions
        .map(opt => ({ text: opt, tag: tagOption(opt) }))
        .filter(o => o.tag !== 'other' && o.tag !== 'unknown')
        .sort((a, b) => (choiceCategoryWeights[b.tag] || 0) - (choiceCategoryWeights[a.tag] || 0));
    }

    // === 获取卦象指引 ===
    const guidance = GUA_GUIDANCE[oHex?.name] || { action: '', timing: '', method: '', actionEn: '', timingEn: '', methodEn: '' };
    const cGuidance = GUA_GUIDANCE[cHex?.name] || { action: '', timing: '', method: '', actionEn: '', timingEn: '', methodEn: '' };
    
    const getGuidance = (g, key) => lang === 'en' ? (g[key + 'En'] || g[key]) : g[key];

    // === 生成白话文回答 ===
    let questionType = lang === 'en' ? 'Reading' : '解读';
    let specificAdvice = '';

    // 五行对应的领域
    const fieldsByElement = {
      '金': { zh: '金融、银行、机械、汽车、珠宝', en: 'finance, banking, machinery, automotive, jewelry' },
      '木': { zh: '教育、出版、医疗、服装、设计', en: 'education, publishing, healthcare, fashion, design' },
      '水': { zh: '互联网、物流、旅游、传媒、贸易', en: 'internet, logistics, tourism, media, trade' },
      '火': { zh: '科技、电子、餐饮、娱乐、新能源', en: 'technology, electronics, F&B, entertainment, energy' },
      '土': { zh: '房地产、建筑、农业、仓储、矿业', en: 'real estate, construction, agriculture, storage, mining' },
    };

    // 五行对应的方位
    const directionByElement = {
      '金': { zh: '西方', en: 'west' },
      '木': { zh: '东方', en: 'east' },
      '水': { zh: '北方', en: 'north' },
      '火': { zh: '南方', en: 'south' },
      '土': { zh: '本地', en: 'local/central' },
    };

    // 八卦人物特征
    const guaTraits = {
      '乾': { zh: '强势领导型', en: 'strong leadership type' },
      '坤': { zh: '包容支持型', en: 'supportive type' },
      '震': { zh: '行动开创型', en: 'action-oriented type' },
      '巽': { zh: '灵活沟通型', en: 'flexible communicative type' },
      '坎': { zh: '智慧变通型', en: 'wise adaptable type' },
      '离': { zh: '热情展示型', en: 'expressive type' },
      '艮': { zh: '稳健踏实型', en: 'steady grounded type' },
      '兑': { zh: '社交表达型', en: 'social articulate type' },
    };

    // 有利五行（用于领域和方位建议）
    const favorableElement = (tiYongRelKey === 'yongShengTi' || tiYongRelKey === 'tiKeYong') ? yong.element : ti.element;

    // ========== 构建白话文回答 ==========
    // 辅助：根据level返回三档描述
    const dim = (level, good, mid, bad) => level >= 1 ? good : level === 0 ? mid : bad;

    // 贵人特征（用卦象推断）
    const guirenByGua = {
      '乾': { zh: '领导、上司、长辈男性', en: 'leader, superior, or older male figure' },
      '坤': { zh: '长辈女性、同事、合伙人', en: 'older female, colleague, or partner' },
      '震': { zh: '年轻男性、创业者、行动力强的人', en: 'young energetic man, entrepreneur' },
      '巽': { zh: '女性朋友、中间人、善于沟通的人', en: 'female friend, intermediary, or communicator' },
      '坎': { zh: '智慧型人物、法律/金融从业者', en: 'wise advisor, lawyer, or financial professional' },
      '离': { zh: '有名气的人、媒体/艺术从业者', en: 'influential person, media or arts professional' },
      '艮': { zh: '踏实稳重的老朋友、前辈', en: 'steady old friend or senior mentor' },
      '兑': { zh: '善于表达的朋友、律师、销售', en: 'articulate friend, lawyer, or salesperson' },
    };

    // 工作类型倾向（根据体卦推断）
    const workStyleByGua = {
      '乾': { zh: '管理岗、决策层', en: 'management or decision-making roles' },
      '坤': { zh: '执行岗、辅助类工作', en: 'execution or supportive roles' },
      '震': { zh: '开拓型、销售/创业', en: 'pioneering roles, sales or startups' },
      '巽': { zh: '灵活型、沟通/策划岗', en: 'flexible roles, communications or strategy' },
      '坎': { zh: '技术岗、研究/分析类', en: 'technical, research or analytical roles' },
      '离': { zh: '创意岗、展示/营销类', en: 'creative, marketing or presentation roles' },
      '艮': { zh: '稳定岗、专业技能类', en: 'stable, skill-based professional roles' },
      '兑': { zh: '社交岗、谈判/服务类', en: 'social, negotiation or service roles' },
    };

    // 感情中对方的性格与态度（用卦象推断）
    const loveStyleByGua = {
      '乾': { pos: { zh: '主动、有担当、重视你', en: 'proactive, responsible, values you' }, neg: { zh: '强势、不善表达柔情', en: 'dominant, struggles to show warmth' } },
      '坤': { pos: { zh: '温柔包容、愿意为你付出', en: 'gentle, nurturing, willing to give' }, neg: { zh: '太被动、需要你先开口', en: 'too passive, needs you to initiate' } },
      '震': { pos: { zh: '热情、会主动追你', en: 'passionate, will pursue you actively' }, neg: { zh: '情绪化、忽冷忽热', en: 'emotional and inconsistent' } },
      '巽': { pos: { zh: '体贴、善于沟通感情', en: 'considerate, emotionally communicative' }, neg: { zh: '犹豫不决、不够坦诚', en: 'indecisive, not fully open' } },
      '坎': { pos: { zh: '真心、感情深沉', en: 'sincere, deep feelings' }, neg: { zh: '心思重、不善于表达', en: 'overthinks, struggles to express feelings' } },
      '离': { pos: { zh: '热情浪漫、喜欢表达', en: 'romantic and expressive' }, neg: { zh: '表面热情、需观察真心', en: 'outwardly warm, verify sincerity over time' } },
      '艮': { pos: { zh: '稳重可靠、认真对待感情', en: 'steady and takes the relationship seriously' }, neg: { zh: '内敛、行动慢、需要耐心', en: 'reserved, slow to act, needs patience' } },
      '兑': { pos: { zh: '甜蜜活泼、喜欢你陪伴', en: 'sweet and lively, enjoys your company' }, neg: { zh: '话多行动少、需看实际行动', en: 'all talk — watch what they do, not say' } },
    };

    // 应期变量（now/curMonth/yingqiMonths/targetMonth/timingSeason 均在上方精确推算模块中定义）

    // 八卦英文名（用于英文版避免出现中文）
    const trigramNamesEN = { '乾': 'Heaven', '坤': 'Earth', '震': 'Thunder', '巽': 'Wind', '坎': 'Water', '离': 'Fire', '艮': 'Mountain', '兑': 'Lake' };
    const tiNameEN = trigramNamesEN[ti.name] || 'You';
    const yongNameEN = trigramNamesEN[yong.name] || 'the Situation';

    // ── 通用维度（永远显示）──
    const universalEN = () => {
      let s = '';

      // 1. 总体结论（无专业名词）
      if (totalLevel >= 2) s += `✅ Very favorable. `;
      else if (totalLevel >= 1) s += `🟡 Favorable. `;
      else if (totalLevel >= 0) s += `⚪ Mixed signals — could go either way. `;
      else s += `🔴 Conditions aren't in your favor right now. `;

      if (tiYongRelKey === 'yongShengTi') s += `The people and circumstances around you are working in your favor — support will come from helpful sources.`;
      else if (tiYongRelKey === 'tiKeYong') s += `You're in the driver's seat — taking initiative will move things forward.`;
      else if (tiYongRelKey === 'bihe') s += `The situation is evenly matched — patient, consistent effort is the way through.`;
      else if (tiYongRelKey === 'tiShengYong') s += `You're putting in more energy than you're getting back — stay the course, it will balance out.`;
      else s += `Outside forces are creating friction — don't push too hard; conserve your energy for the right moment.`;

      if (bianGuaLevel >= 1) s += ` In the end, things are likely to turn in your favor.`;
      else if (bianGuaLevel < 0) s += ` Keep an eye out — there may be complications further down the road.`;

      // 2. 核心解读（展开，无专业名词）
      s += `\n\n━━ Core Reading ━━`;

      s += `\n👤 Your position right now: `;
      if (tiYongLevel >= 2) s += `Strong — you have real leverage here. Your energy and timing align well, so confidence is warranted.`;
      else if (tiYongLevel >= 1) s += `Decent — you have some advantage, but it still needs effort to convert.`;
      else if (tiYongLevel === 0) s += `Neutral — neither strongly for nor against you. What you do next matters a lot.`;
      else s += `A bit weak — the situation isn't supporting you well. Holding back is smarter than forcing ahead right now.`;

      s += `\n🌍 What's around you (people & circumstances): `;
      if (tiYongRelKey === 'yongShengTi') s += `Actively helping you. People around you are inclined to support, and timing is on your side.`;
      else if (tiYongRelKey === 'tiKeYong') s += `You can shape it. The situation responds to what you do — take the lead.`;
      else if (tiYongRelKey === 'bihe') s += `About even. No major tailwind or headwind — it's a fair playing field.`;
      else if (tiYongRelKey === 'tiShengYong') s += `Drawing from you. You're investing more than you're receiving — not necessarily wrong, but be mindful of your limits.`;
      else s += `Pushing back. There's friction you can't fully control — move around it rather than through it.`;

      s += `\n⚡ What to do: ${getGuidance(guidance, 'action')}`;
      s += `\n💡 How to approach it: ${getGuidance(guidance, 'method')}`;
      s += `\n🚧 What to watch out for: ${getGuidance(guidance, 'timing')}`;

      s += `\n🔮 How this is likely to end: `;
      if (bianGuaLevel >= 2) s += `Ends well — the final outcome is more positive than the journey itself.`;
      else if (bianGuaLevel >= 1) s += `The ending is favorable, even if the path has bumps.`;
      else if (bianGuaLevel === 0) s += `Things stabilize — no dramatic change in the final outcome.`;
      else s += `There may be a harder stretch toward the end. Plan ahead so you're not caught off guard.`;

      // 3. 平/凶：改变结果的建议
      if (totalLevel <= 0) {
        s += `\n\n━━ How to Shift the Outcome ━━`;
        if (tiYongRelKey === 'yongKeTi') {
          s += `\nThe pressure you're feeling comes from outside — and fighting it head-on will make things worse. The smarter move is to step back, reduce friction, and wait for conditions to shift. Think of it as redirecting around the obstacle, not charging through it.`;
        } else if (tiYongRelKey === 'tiShengYong') {
          s += `\nYou're giving more than you're getting. Ask yourself honestly: is this investment sustainable? Setting boundaries or redirecting some of that energy elsewhere can break the cycle.`;
        } else {
          s += `\n${getGuidance(guidance, 'method')} Focus on what you can control. The most effective window is ${tiSeason.best} — save your bigger moves for then.`;
        }
        if (bianGuaLevel < 0) {
          s += ` Also, this isn't likely to resolve all at once — prepare for a second wave of challenge after the first hurdle passes.`;
        }
      }

      return s;
    };

    const universalZH = () => {
      let s = '';

      // 1. 总体结论
      if (totalLevel >= 2) s += `✅ 整体很好！`;
      else if (totalLevel >= 1) s += `🟡 还不错。`;
      else if (totalLevel >= 0) s += `⚪ 情况一般，有些复杂。`;
      else s += `🔴 目前形势不太有利。`;

      if (tiYongRelKey === 'yongShengTi') s += `外部力量在支持你，会有贵人和资源主动靠拢，顺水推舟。`;
      else if (tiYongRelKey === 'tiKeYong') s += `你掌握主动权，只要你出手，局面就会按你的意愿走。`;
      else if (tiYongRelKey === 'bihe') s += `双方力量差不多，稳扎稳打、按部就班是最好的策略。`;
      else if (tiYongRelKey === 'tiShengYong') s += `你在付出，但回报还没跟上——坚持正确方向，收获会来的。`;
      else s += `外部阻力比较大，不适合硬冲，保存实力、等待时机更明智。`;

      if (bianGuaLevel >= 1) s += `最终结果会往好的方向走。`;
      else if (bianGuaLevel < 0) s += `后期可能还有一些波折，要留意。`;

      // 2. 核心解读（展开）
      s += `\n\n━━ 核心解读 ━━`;

      s += `\n👤 你现在的状态：`;
      if (tiYongLevel >= 2) s += `强势有利，你占据主动，时机和能量都对你有利，可以放心推进。`;
      else if (tiYongLevel >= 1) s += `还不错，有一定优势，但仍需努力才能转化为结果。`;
      else if (tiYongLevel === 0) s += `中等，不特别有利也不特别不利，接下来怎么做很关键。`;
      else s += `稍弱，形势不太支持你，这时候等待比强行更聪明。`;

      s += `\n🌍 外部环境/周围情况：`;
      if (tiYongRelKey === 'yongShengTi') s += `主动帮你，周围的人和环境都倾向于支持你，时机也配合。`;
      else if (tiYongRelKey === 'tiKeYong') s += `你能影响它，局面会随你的行动而改变，你来主导。`;
      else if (tiYongRelKey === 'bihe') s += `大体持平，没有明显助力也没有明显阻力，靠自己稳步推进。`;
      else if (tiYongRelKey === 'tiShengYong') s += `在消耗你，你付出的多、得到的少，注意不要让自己过度透支。`;
      else s += `有阻力，外部环境在给你制造摩擦，正面硬刚不是好办法，找方法绕过去。`;

      s += `\n⚡ 该怎么做：${getGuidance(guidance, 'action')}`;
      s += `\n💡 行动方式：${getGuidance(guidance, 'method')}`;
      s += `\n🚧 需要注意：${getGuidance(guidance, 'timing')}`;

      s += `\n🔮 最终会怎样：`;
      if (bianGuaLevel >= 2) s += `结局不错，最终结果比过程要好得多。`;
      else if (bianGuaLevel >= 1) s += `结局向好，即使过程有些曲折，最后也会往好的方向走。`;
      else if (bianGuaLevel === 0) s += `结局平稳，不会有太大变化，基本维持现状。`;
      else s += `后面可能还有一道坎，提前做好准备，不要以为第一个问题解决就万事大吉。`;

      // 3. 平/凶：如何改变结果
      if (totalLevel <= 0) {
        s += `\n\n━━ 如何改变这个结果 ━━`;
        if (tiYongRelKey === 'yongKeTi') {
          s += `\n现在的压力来自外部，和它正面对抗只会更难。最聪明的做法是暂时退让、减少摩擦，等外部条件改变了再出手。就像水绕石走，不是软弱，是智慧。`;
        } else if (tiYongRelKey === 'tiShengYong') {
          s += `\n你现在付出的比得到的多，问问自己：这样的投入值得继续吗？适当设立边界、或者把精力转向别处，往往能打破这个消耗循环。`;
        } else {
          s += `\n${getGuidance(guidance, 'method')} 专注于自己能控制的部分。${tiSeason.best}是最有利的时间窗口，把重要的行动留到那时候。`;
        }
        if (bianGuaLevel < 0) {
          s += `另外，这件事可能不会一次性解决——第一关过了之后还有第二关，提前有心理准备。`;
        }
      }

      return s;
    };

    if (lang === 'en') {
      specificAdvice = universalEN();

      // ── 专属维度（按问题类型叠加）──
      // 互斥保护：有明确主题时，避免其他类型误触发
      // 感情板块：必须有感情关键词，且没有被事业/财运主导
      const showLoveEN = isLove && !(isCareer || isMoney) && flags.love_section;
      const showCareerEN = isCareer && flags.career_section;
      const showMoneyEN = isMoney && !isCareer;

      if (showCareerEN) {
        specificAdvice += `\n\n━━ Career Breakdown ━━`;
        specificAdvice += `\n📈 Promotion / Advancement: ${dim(tiYongLevel, 'Favorable — opportunity likely soon', 'Possible — you need to actively push for it', 'Unlikely now — build your foundation first')}`;
        specificAdvice += `\n🤝 Helpful People: ${tiYongRelKey === 'yongShengTi' ? `Yes — look for a ${guirenByGua[yong.name]?.en || 'senior figure'} nearby` : tiYongRelKey === 'tiKeYong' ? 'Rely on yourself mainly' : 'Limited support — be selective who you trust'}`;
        specificAdvice += `\n💼 Best Role Type: ${workStyleByGua[ti.name]?.en || 'varies'}`;
        specificAdvice += `\n🏭 Favorable Industries: ${fieldsByElement[favorableElement]?.en || 'various'}`;
        specificAdvice += `\n🧭 Favorable Direction: ${directionByElement[favorableElement]?.en || 'local'}`;
        specificAdvice += `\n🤝 Solo vs Partner: ${tiYongRelKey === 'yongShengTi' ? `Partner up — find a ${guaTraits[yong.name]?.en || 'supportive'} teammate` : tiYongRelKey === 'tiKeYong' || tiYongRelKey === 'bihe' ? 'Can lead independently' : 'Seek a strong partner to share the load'}`;
        if (totalLevel < 0) specificAdvice += `\n⚠️ Timing isn't ideal — use this period to prepare`;
      }

      if (showLoveEN) {
        const lStyle = loveStyleByGua[yong.name] || { pos: { en: 'caring' }, neg: { en: 'reserved' } };
        specificAdvice += `\n\n━━ Relationship Breakdown ━━`;
        specificAdvice += `\n💞 Overall prospect: ${dim(totalLevel, 'Positive — can develop well', 'Uncertain — needs time and nurturing', 'Challenging — adjust expectations')}`;
        specificAdvice += `\n🧠 Their personality: ${tiYongLevel >= 0 ? lStyle.pos.en : lStyle.neg.en}`;
        specificAdvice += `\n💬 Their feelings for you: ${dim(tiYongLevel, 'Warm — they lean toward you', 'Ambiguous — mixed feelings', 'Distant or guarded right now')}`;
        specificAdvice += `\n💍 How serious are they: ${dim(tiYongLevel, 'Serious — long-term intent is likely', 'Testing the waters — not fully committed yet', 'Casual — don\'t over-invest emotionally')}`;
        specificAdvice += `\n🔮 Long-term outcome: ${dim(bianGuaLevel, 'Turns favorable — deepening or commitment likely', 'Stays the same without a push', 'May drift apart without active effort')}`;
        specificAdvice += `\n📅 Best window to act: ${tiSeason.best || 'seasonal'}`;
      }

      if (showMoneyEN) {
        specificAdvice += `\n\n━━ Finance Breakdown ━━`;
        specificAdvice += `\n💰 Overall financial outlook: ${dim(totalLevel, 'Good — income and opportunity likely', 'Average — steady but not exceptional', 'Weak — focus on protecting what you have')}`;
        specificAdvice += `\n📊 How aggressive to be: ${dim(tiYongLevel, 'Can be moderately aggressive — conditions support it', 'Cautious — diversify and stay patient', 'Conservative — avoid new large commitments right now')}`;
        specificAdvice += `\n🏭 Favorable sectors: ${fieldsByElement[favorableElement]?.en || 'various'}`;
        specificAdvice += `\n⏰ Best time to move: ${tiSeason.best || 'seasonal'}`;
        specificAdvice += `\n🔚 How this ends: ${dim(bianGuaLevel, 'Profitable in the end', 'Break-even or modest gain', 'Risk of loss — set clear limits and exit early if needed')}`;
      }

      if (isHealth) {
        specificAdvice += `\n\n━━ Health Breakdown ━━`;
        specificAdvice += `\n🏥 Recovery outlook: ${dim(totalLevel, 'Positive — recovery is expected', 'Slow but manageable — patience needed', 'Challenging — seek professional help promptly')}`;
        specificAdvice += `\n💊 Treatment direction: ${dim(tiYongLevel, 'Current approach is working — stay the course', 'Consider a second opinion or complementary approach', 'Current approach may not be enough — reassess with a specialist')}`;
        specificAdvice += `\n🚧 What to watch: ${getGuidance(guidance, 'timing')}`;
        specificAdvice += `\n📅 Expected improvement window: ${tiSeason.best || 'seasonal'} (around ${targetMonthStr})`;
      }

      if (isStudy) {
        specificAdvice += `\n\n━━ Study / Exam Breakdown ━━`;
        specificAdvice += `\n📚 Chances of success: ${dim(totalLevel, 'Favorable — good chance', 'Possible — needs focused, consistent effort', 'Difficult — significant extra work required')}`;
        specificAdvice += `\n🎓 Will your effort pay off: ${dim(tiYongLevel, 'Yes — your work will be noticed and rewarded', 'Moderate — steady effort counts', 'Not immediately — results may come later, stay patient')}`;
        specificAdvice += `\n🤝 Will a teacher or mentor help: ${tiYongRelKey === 'yongShengTi' ? `Yes — a ${guirenByGua[yong.name]?.en || 'knowledgeable mentor'} can make a real difference` : 'Mainly self-driven — focus on your own preparation'}`;
        specificAdvice += `\n📅 Best period to study / take exams: ${tiSeason.best || 'seasonal'}`;
      }

      if (isTravel) {
        specificAdvice += `\n\n━━ Travel / Relocation Breakdown ━━`;
        specificAdvice += `\n✈️ Is now a good time to go: ${dim(totalLevel, 'Yes — timing is favorable', 'Neutral — fine to go if you need to, no strong push either way', 'Caution — delay if you can')}`;
        specificAdvice += `\n🧭 Best direction to head: ${directionByElement[favorableElement]?.en || 'local area'}`;
        specificAdvice += `\n📅 Best timing: ${tiSeason.best || 'seasonal'} (around ${targetMonthStr})`;
        specificAdvice += `\n🚧 What to be careful of: ${getGuidance(guidance, 'timing')}`;
      }

      if (isLegal) {
        specificAdvice += `\n\n━━ Legal / Dispute Breakdown ━━`;
        specificAdvice += `\n⚖️ How likely are you to win: ${dim(totalLevel, 'Favorable — you have the advantage', 'Uncertain — could go either way', 'Challenging — settling out of court may be wiser')}`;
        specificAdvice += `\n🤝 What the other side is likely to do: ${dim(tiYongLevel, 'Likely to cooperate or back down', 'May negotiate — stay firm but flexible', 'Resistant — they are prepared to fight, be ready')}`;
        specificAdvice += `\n🤝 Who can help you: ${guirenByGua[yong.name]?.en || 'a knowledgeable advisor or expert'}`;
        specificAdvice += `\n📅 Key timing window: ${tiSeason.best || 'seasonal'}`;
      }

      if (isFamily) {
        specificAdvice += `\n\n━━ Family Breakdown ━━`;
        specificAdvice += `\n🏠 Overall family harmony: ${dim(totalLevel, 'Good — people are supportive', 'Mixed — some friction but manageable', 'Strained — patience and careful communication are needed')}`;
        specificAdvice += `\n👥 Key person's attitude: ${dim(tiYongLevel, 'Supportive and cooperative', 'Neutral or non-committal', 'Resistant or conflicted — tread gently')}`;
        specificAdvice += `\n💡 Best way to handle it: ${getGuidance(guidance, 'method')}`;
      }

      if (isFind) {
        const dirByGua = { '乾': 'northwest, or a high place / metal cabinet', '坤': 'southwest, or a low spot / near the ground', '震': 'east, or near a door / noisy area', '巽': 'southeast, or near a window / ventilated spot', '坎': 'north, or near water / the bathroom', '离': 'south, or a bright spot / near electronics', '艮': 'northeast, or a corner / storage area', '兑': 'west, or near a gap / opening' };
        specificAdvice += `\n\n━━ Finding Lost Item ━━`;
        specificAdvice += `\n📍 Most likely location: ${dirByGua[yong.name] || 'an overlooked or unusual spot — retrace your steps'}`;
        specificAdvice += `\n🔍 Can it be found: ${dim(totalLevel, 'Likely — search carefully in the direction above', 'Possibly — may take some time', 'Difficult — it may have been moved or taken by someone else')}`;
      }

      if (isChoice && choiceOptions.length >= 2 && flags.choice_analysis) {
        const topOpt = choiceRankedOptions[0];
        const secondOpt = choiceRankedOptions[1];
        const otherOpt = choiceOptions.find(o => /other|else|another/i.test(o));
        const topScore = topOpt ? (choiceCategoryWeights[topOpt.tag] || 0) : -99;

        specificAdvice += `\n\n━━ Choice Analysis ━━`;

        if (topOpt) {
          if (topScore >= 2) {
            specificAdvice += `\n🎯 Most likely path: ${topOpt.text}`;
            specificAdvice += `\n\nThe hexagram points clearly — ${topOpt.text} aligns best with current indications.`;
          } else if (topScore >= 0) {
            specificAdvice += `\n🎯 Relatively more likely: ${topOpt.text}`;
            specificAdvice += `\n\nThere is some hexagram lean toward ${topOpt.text}, though not with strong certainty.`;
          } else {
            specificAdvice += `\n🎯 No clear hexagram lean — the listed options are roughly equal in likelihood.`;
          }
          if (secondOpt) specificAdvice += `\nSecond most likely: ${secondOpt.text}`;
          if (otherOpt && topScore < 2) {
            specificAdvice += `\n⚠️ "Other" possibility: The hexagram suggests the outcome ${totalLevel >= 1 ? 'aligns with one of your listed options' : 'may lie outside what you\'ve currently considered — an unexpected path may emerge'}.`;
          }
        } else {
          specificAdvice += `\n⚠️ Options couldn't be clearly matched to hexagram patterns. Try rephrasing with your two most likely choices.`;
        }

        specificAdvice += `\n\n📖 Reasoning: `;
        if (tiYongRelKey === 'tiKeYong') specificAdvice += `You control the situation — self-driven paths (e.g. work visa) are favored. `;
        else if (tiYongRelKey === 'yongShengTi') specificAdvice += `External forces actively help you — paths requiring outside assistance (marriage sponsorship, EB-5 investor) are more favored. `;
        else if (tiYongRelKey === 'bihe') specificAdvice += `Balanced energies — options are roughly equal; evaluate based on personal circumstances. `;
        else if (tiYongRelKey === 'tiShengYong') specificAdvice += `You are the one giving — paths requiring your own investment of resources are indicated. `;
        else if (tiYongRelKey === 'yongKeTi') specificAdvice += `External pressure is high — all paths face friction; external help is needed to move forward. `;

        if (yongElement === '金') specificAdvice += `Yong is Metal — points toward formal/institutional routes (official application channels).`;
        else if (yongElement === '火') specificAdvice += `Yong is Fire — Fire governs emotion and social ties, pointing toward relationship-based paths.`;
        else if (yongElement === '水') specificAdvice += `Yong is Water — Water governs flow and finance, pointing toward flexible or capital-based paths.`;
        else if (yongElement === '木') specificAdvice += `Yong is Wood — Wood governs growth and initiative, pointing toward personal development paths.`;
        else if (yongElement === '土') specificAdvice += `Yong is Earth — Earth governs stability and accumulation, pointing toward long-term steady paths.`;
      }

      if (isTimePoint) {
        specificAdvice += `\n\n━━ Time Estimate ━━`;
        specificAdvice += `\n⏰ Hexagram numbers: ${tiNum}+${yongNum}=${durationBase} → roughly ${durationHours} hour${durationHours !== 1 ? 's' : ''} from now → around ${targetClockEN}.`;
        specificAdvice += `\n${totalLevel >= 1 ? '✅ Favorable — likely on the earlier side.' : totalLevel >= 0 ? '⚪ Mixed — middle of the range.' : '🔴 Unfavorable — likely on the later side.'}`;
      } else if (isDuration) {
        specificAdvice += `\n\n━━ Duration Estimate ━━`;
        specificAdvice += `\n⏱️ Hexagram numbers: ${tiNum}+${yongNum}=${durationBase} → estimated about ${durationHours} hour${durationHours !== 1 ? 's' : ''}.`;
        specificAdvice += `\n${totalLevel >= 1 ? '✅ Favorable — lean toward the shorter end.' : totalLevel >= 0 ? '⚪ Mixed — middle of the range is most likely.' : '🔴 Unfavorable — lean toward the longer end.'}`;
      }

      // 时机（可通过 flag 关闭）
      if (flags.timing_section) {
        specificAdvice += `\n\n━━ Timing ━━`;
        if (isTimePoint || isDuration) {
          specificAdvice += `\n📅 ${timingSeason.best || 'Varies by season'}`;
          specificAdvice += `\n🔍 ${timingNote}`;
        } else {
          specificAdvice += `\n📅 ${timingSeason.best || 'Varies by season'}`;
          specificAdvice += `\n🔍 ${timingNote}`;
          specificAdvice += `\n📆 Estimated: ~${timingValue} ${timingUnitEN}${timingValue !== 1 ? 's' : ''} from now${fengWangNote || (unitScale >= 2 ? ` (around ${targetMonthStr})` : '')}${delayNote}`;
        }
      }

    } else {
      specificAdvice = universalZH();

      // ── 专属维度（按问题类型叠加）──
      // 互斥保护：有明确主题时，避免其他类型误触发
      const showLoveZH = isLove && !(isCareer || isMoney) && flags.love_section;
      const showMoneyZH = isMoney && !isCareer;

      if (isCareer && flags.career_section) {
        specificAdvice += `\n\n━━ 事业详细分析 ━━`;
        specificAdvice += `\n📈 升职/晋升机会：${dim(tiYongLevel, '有机会，近期可期', '有可能，需主动争取', '目前不太适合，先积累实力')}`;
        specificAdvice += `\n🤝 会不会有贵人帮你：${tiYongRelKey === 'yongShengTi' ? `有！留意身边${guirenByGua[yong.name]?.zh || '靠谱的人'}，他/她可以帮到你` : tiYongRelKey === 'tiKeYong' ? '主要靠自己，不必等待他人' : '贵人帮助有限，不宜轻信他人承诺'}`;
        specificAdvice += `\n💼 适合的工作方向：${workStyleByGua[ti.name]?.zh || '视情况而定'}`;
        specificAdvice += `\n🏭 有利行业：${fieldsByElement[favorableElement]?.zh || '多种'}`;
        specificAdvice += `\n🧭 有利方位：${directionByElement[favorableElement]?.zh || '本地'}`;
        specificAdvice += `\n🤝 合作还是单干：${tiYongRelKey === 'yongShengTi' ? `建议找伙伴，最好是${guaTraits[yong.name]?.zh || '靠谱'}类型的人` : tiYongRelKey === 'tiKeYong' || tiYongRelKey === 'bihe' ? '可以独立主导，自己说了算' : '建议找人搭档，分担压力'}`;
        if (totalLevel < 0) specificAdvice += `\n⚠️ 提醒：现在不是最佳时机，这段时间适合做准备，等时机到了再出手`;
      }

      if (showLoveZH) {
        const lStyle = loveStyleByGua[yong.name] || { pos: { zh: '温和体贴' }, neg: { zh: '比较被动' } };
        specificAdvice += `\n\n━━ 感情详细分析 ━━`;
        specificAdvice += `\n💞 整体前景：${dim(totalLevel, '乐观，有发展空间', '不确定，需要时间和耐心', '有阻碍，需要调整期待')}`;
        specificAdvice += `\n🧠 对方是什么性格的人：${tiYongLevel >= 0 ? lStyle.pos.zh : lStyle.neg.zh}`;
        specificAdvice += `\n💬 对方对你的态度：${dim(tiYongLevel, '倾向正面，对你有好感', '态度暧昧，还没下定决心', '目前比较疏远或有顾虑')}`;
        specificAdvice += `\n💍 对方有多认真：${dim(tiYongLevel, '比较认真，有长期在一起的意愿', '还在试探阶段，没完全确定', '可能只是随缘，不够认真，不要投入太多')}`;
        specificAdvice += `\n🔮 最终会怎样：${dim(bianGuaLevel, '结果向好，可能走向稳定关系', '维持现状，变化不大', '需要主动推进，不然容易就这样错过')}`;
        specificAdvice += `\n📅 最好在什么时候行动：${tiSeason.best || '因季节而定'}`;
      }

      if (showMoneyZH) {
        specificAdvice += `\n\n━━ 财运详细分析 ━━`;
        specificAdvice += `\n💰 整体财运怎么样：${dim(totalLevel, '不错，有进财和机会', '一般，正常收支', '偏弱，这段时间注意守财')}`;
        specificAdvice += `\n📊 投资的激进程度：${dim(tiYongLevel, '可以适度进取，条件支持', '稳健为主，分散风险', '保守为宜，避免大额新投入')}`;
        specificAdvice += `\n🏭 有利的方向/行业：${fieldsByElement[favorableElement]?.zh || '多种'}`;
        specificAdvice += `\n⏰ 最佳出手时机：${tiSeason.best || '因季节而定'}`;
        specificAdvice += `\n🔚 最终结果如何：${dim(bianGuaLevel, '有盈利，结果向好', '收支平衡或小赚', '有亏损风险，设好止损，及时离场')}`;
      }

      if (isHealth) {
        specificAdvice += `\n\n━━ 健康详细分析 ━━`;
        specificAdvice += `\n🏥 恢复前景：${dim(totalLevel, '乐观，预计能顺利恢复', '较慢，需要耐心调养', '有挑战，建议尽快寻求专业帮助')}`;
        specificAdvice += `\n💊 治疗方向：${dim(tiYongLevel, '当前方向有效，坚持即可', '考虑换个思路或寻求第二意见', '当前方案可能不够，建议重新评估')}`;
        specificAdvice += `\n⚡ 需注意：${getGuidance(guidance, 'timing')}`;
        specificAdvice += `\n📅 好转时间窗口：${tiSeason.best || '因季节而定'}（约${targetMonthStr}前后）`;
      }

      if (isStudy) {
        specificAdvice += `\n\n━━ 学业/考试详细分析 ━━`;
        specificAdvice += `\n📚 成功的可能性：${dim(totalLevel, '有利，成功概率比较大', '有可能，但需要全力以赴', '有难度，需要付出额外的努力')}`;
        specificAdvice += `\n🎓 你的努力有没有回报：${dim(tiYongLevel, '有，你的付出会被看到和认可', '一般，踏实积累会有效果', '回报可能不那么明显，但要保持耐心，种子在生长')}`;
        specificAdvice += `\n🤝 会不会有老师或贵人帮你：${tiYongRelKey === 'yongShengTi' ? `会，${guirenByGua[yong.name]?.zh || '一位关键人物'}能在这件事上帮到你很多` : '主要靠自己，专注于自己的准备'}`;
        specificAdvice += `\n📅 最好的复习/考试时期：${tiSeason.best || '因季节而定'}`;
      }

      if (isTravel) {
        specificAdvice += `\n\n━━ 出行/搬迁详细分析 ━━`;
        specificAdvice += `\n✈️ 现在适不适合出行：${dim(totalLevel, '适合，时机不错', '一般，有需要就去，没有强烈的信号', '建议暂缓，等等再说')}`;
        specificAdvice += `\n🧭 哪个方向比较有利：${directionByElement[favorableElement]?.zh || '本地或就近'}`;
        specificAdvice += `\n📅 最佳出行/搬迁时机：${tiSeason.best || '因季节而定'}（约${targetMonthStr}）`;
        specificAdvice += `\n🚧 需要注意的事：${getGuidance(guidance, 'timing')}`;
      }

      if (isLegal) {
        specificAdvice += `\n\n━━ 诉讼/纠纷详细分析 ━━`;
        specificAdvice += `\n⚖️ 胜算多大：${dim(totalLevel, '你这边比较占优势', '不太确定，各有胜算', '有挑战，考虑和解可能比硬打更划算')}`;
        specificAdvice += `\n🤝 对方会怎么做：${dim(tiYongLevel, '可能配合或主动让步', '不确定，可能会谈判', '对方准备硬刚，要做好持久战的准备')}`;
        specificAdvice += `\n🤝 谁能帮到你：${guirenByGua[yong.name]?.zh || '专业人士的建议'}`;
        specificAdvice += `\n📅 关键时机：${tiSeason.best || '因季节而定'}`;
      }

      if (isFamily) {
        specificAdvice += `\n\n━━ 家庭关系详细分析 ━━`;
        specificAdvice += `\n🏠 家庭氛围怎么样：${dim(totalLevel, '比较和睦，大家互相支持', '有些摩擦，但总体可控', '有些紧张，需要耐心和沟通')}`;
        specificAdvice += `\n👥 关键人物的态度：${dim(tiYongLevel, '支持你，愿意配合', '态度中立，没明确表态', '有些抵触或矛盾，需要小心处理')}`;
        specificAdvice += `\n💡 最好怎么处理：${getGuidance(guidance, 'method')}`;
      }

      if (isFind) {
        const dirByGua = { '乾': '西北方向，或者高处、金属柜旁边', '坤': '西南方向，或者低处、地面附近', '震': '东边，或者门口、有动静的地方', '巽': '东南方向，或者窗边、通风的地方', '坎': '北边，或者有水的地方、卫生间附近', '离': '南边，或者明亮的地方、电器旁', '艮': '东北方向，或者角落、储物处', '兑': '西边，或者有缺口的地方' };
        specificAdvice += `\n\n━━ 寻物分析 ━━`;
        specificAdvice += `\n📍 最可能在哪里：${dirByGua[yong.name] || '不常去或容易被忽视的地方，回想最后一次使用的场景'}`;
        specificAdvice += `\n🔍 能找回来吗：${dim(totalLevel, '大概率能找到，按上面的方向仔细找', '有可能，需要多花时间', '比较难，可能已经被移走或遗失了')}`;
      }

      if (isChoice && choiceOptions.length >= 2 && flags.choice_analysis) {
        const topOpt = choiceRankedOptions[0];
        const secondOpt = choiceRankedOptions[1];
        const otherOpt = choiceOptions.find(o => /其他|另外|别的/i.test(o));
        const topScore = topOpt ? (choiceCategoryWeights[topOpt.tag] || 0) : -99;
        const yongEleName = { '金': '金', '木': '木', '水': '水', '火': '火', '土': '土' }[yongElement] || yongElement;

        specificAdvice += `\n\n━━ 选择题分析 ━━`;

        if (topOpt) {
          if (topScore >= 2) {
            specificAdvice += `\n🎯 最可能的路径：${topOpt.text}`;
            specificAdvice += `\n\n卦象指向较明确，${topOpt.text}这条路与当前卦象最为吻合。`;
          } else if (topScore >= 0) {
            specificAdvice += `\n🎯 相对较可能的路径：${topOpt.text}`;
            specificAdvice += `\n\n卦象有一定倾向，${topOpt.text}的可能性相对较高，但并非十分确定。`;
          } else {
            specificAdvice += `\n🎯 卦象对所列选项指向不明确，各路径机会相近。`;
          }
          if (secondOpt) specificAdvice += `\n次选可能性：${secondOpt.text}`;
          if (otherOpt && topScore < 2) {
            specificAdvice += `\n⚠️ "其他"的可能性：${totalLevel >= 1 ? '卦象偏向你已列出的选项之一' : '卦象显示结果可能超出你目前预想的范围，存在你尚未想到的途径'}。`;
          }
        } else {
          specificAdvice += `\n⚠️ 卦象对所列选项的指向不明确，建议重新梳理你最看重的两个方向再问卦。`;
        }

        specificAdvice += `\n\n📖 判断依据：`;
        if (tiYongRelKey === 'tiKeYong') specificAdvice += `用卦被体克，局面由你主导，说明靠自身主动努力的路径（如工作签）更有力。`;
        else if (tiYongRelKey === 'yongShengTi') specificAdvice += `用卦生体，外力主动助你，说明需要他人协助的路径（如婚姻担保、投资移民）更有力。`;
        else if (tiYongRelKey === 'bihe') specificAdvice += `体用比和，力量相当，各路径机会接近，综合自身条件选择。`;
        else if (tiYongRelKey === 'tiShengYong') specificAdvice += `体生用，你在付出，指向需要你主动投入资源的路径。`;
        else if (tiYongRelKey === 'yongKeTi') specificAdvice += `用克体，外部阻力较大，各路径都有挑战，需要借助外力化解。`;

        if (yongElement === '金') specificAdvice += `用卦属金，指向官方/制度类正规申请通道。`;
        else if (yongElement === '火') specificAdvice += `用卦属火，火主感情与社交，指向人际关系类路径。`;
        else if (yongElement === '水') specificAdvice += `用卦属水，水主流通与财，指向资金或灵活变通的路径。`;
        else if (yongElement === '木') specificAdvice += `用卦属木，木主成长进取，指向个人发展类路径。`;
        else if (yongElement === '土') specificAdvice += `用卦属土，土主稳固积累，指向踏实积累的长期路径。`;
      }

      if (isTimePoint) {
        specificAdvice += `\n\n━━ 时间估算 ━━`;
        specificAdvice += `\n⏰ 卦数法：${tiNum}+${yongNum}=${durationBase}，从现在起约${durationHours}小时，预计在 ${targetClockZH} 前后。`;
        specificAdvice += `\n${totalLevel >= 1 ? '✅ 整体有利，偏向较早的时间点。' : totalLevel >= 0 ? '⚪ 情况一般，时间点居中。' : '🔴 条件不太顺，偏向较晚的时间点。'}`;
      } else if (isDuration) {
        specificAdvice += `\n\n━━ 时长估算 ━━`;
        specificAdvice += `\n⏱️ 卦数法：${tiNum}+${yongNum}=${durationBase}，推算时长约 ${durationHours} 小时。`;
        specificAdvice += `\n${totalLevel >= 1 ? '✅ 整体有利，偏向时长的下限（较短）。' : totalLevel >= 0 ? '⚪ 情况一般，时长居中。' : '🔴 条件不太顺，偏向时长的上限（较长）。'}`;
      }

      // 时机（可通过 flag 关闭）
      if (flags.timing_section) {
        specificAdvice += `\n\n━━ 时机推算 ━━`;
        if (isTimePoint || isDuration) {
          specificAdvice += `\n📅 最有利时间：${timingSeason.best || '四季皆可'}`;
          specificAdvice += `\n🔍 ${timingNote}`;
        } else {
          specificAdvice += `\n📅 最有利时间窗口：${timingSeason.best || '四季皆可'}`;
          specificAdvice += `\n🔍 推算依据：${timingNote}`;
          specificAdvice += `\n📆 预计时间：约${timingValue}${timingUnitZH}${fengWangNote || (unitScale >= 2 ? `（${targetMonthStr}前后）` : '')}${delayNote}`;
        }
      }
    }

    // === 第三方视角修正：将"你/You/your"替换为对应的第三方主语 ===
    if (isAboutOther) {
      if (lang === 'en') {
        // Correct possessive forms: they→their, she→her, he→his, name→name's
        const possEN = subjectEN === 'they' ? 'their' : subjectEN === 'she' ? 'her' : subjectEN === 'he' ? 'his' : subjectEN + "'s";
        const PossEN = possEN.charAt(0).toUpperCase() + possEN.slice(1);
        const SubEN  = subjectEN.charAt(0).toUpperCase() + subjectEN.slice(1);
        specificAdvice = specificAdvice
          .replace(/\bYou\b/g, SubEN)
          .replace(/\byou\b/g, subjectEN)
          .replace(/\bYour\b/g, PossEN)
          .replace(/\byour\b/g, possEN)
          .replace(/\byourself\b/g, subjectEN === 'they' ? 'themselves' : subjectEN === 'she' ? 'herself' : 'himself');
      } else {
        // 全局替换所有"你" → 第三方主语（中文无法用 \b，直接全替换最可靠）
        specificAdvice = specificAdvice.replace(/你/g, subjectZH);
      }
    }

    // === 构建解卦依据 ===
    const posText = chg <= 3 ? (lang === 'en' ? 'lower trigram' : '下卦') : (lang === 'en' ? 'upper trigram' : '上卦');
    const tiPosText = chg <= 3 ? (lang === 'en' ? 'upper' : '上') : (lang === 'en' ? 'lower' : '下');
    const yongPosText = chg <= 3 ? (lang === 'en' ? 'lower' : '下') : (lang === 'en' ? 'upper' : '上');
    const bianResultText = bianGuaLevel >= 1 ? (lang === 'en' ? 'favorable' : '向好') : bianGuaLevel === 0 ? (lang === 'en' ? 'stable' : '平稳') : (lang === 'en' ? 'challenging' : '有阻');

    let reason = '';
    if (lang === 'en') {
      reason = `[Analysis Details]\n`;
      reason += `1. The shifting line is at position ${chg} (in the ${posText}). This makes the ${yongPosText} trigram represent the situation, and the ${tiPosText} trigram represent you.\n`;
      reason += `2. You (${tiNameEN}, ${getElement(tiElement)}) vs. Situation (${yongNameEN}, ${getElement(yongElement)}): ${t.tiYongLabels[tiYongRelKey]}.\n`;
      reason += `3. The resulting hexagram is ${oHex?.nameEn || oHex?.name} → ${cHex?.nameEn || cHex?.name} (${t.bianGuaLabels[bianGuaRelKey]}), final outlook: ${bianResultText}.\n`;
      reason += `4. Core guidance: "${getGuidance(guidance, 'action')}"\n`;
      reason += `5. Timing: ${eleNameEN[timingEle]||timingEle} (${timingStrength}) → ${timingUnitEN}s scale. Line ${chg}/6 (pos×${chgPosMod}), bianMod×${bianSpeedMod}. ${timingNote} Best season: ${timingSeason.best}. Estimated: ~${timingValue} ${timingUnitEN}${timingValue!==1?'s':''}${fengWangNote || (unitScale>=2?` (around ${targetMonthStr})`:'')}${delayNote}.\n`;
      reason += `6. Calculation: guaSum(${tiNum}+${yongNum}=${guaSum}) ratio=${guaRatio.toFixed(2)}, pos×${chgPosMod}, bianMod×${bianSpeedMod} → ~${timingValue} ${timingUnitEN}${timingValue!==1?'s':''}.`;
    } else {
      reason = `【解卦依据】\n`;
      reason += `1. 动爻在第${chg}爻（${posText}），故${yongPosText}卦为用、${tiPosText}卦为体。\n`;
      reason += `2. 体卦${ti.name}（${tiElement}）与用卦${yong.name}（${yongElement}）${t.tiYongLabels[tiYongRelKey]}。\n`;
      reason += `3. 变卦${cHex?.name}，${t.bianGuaLabels[bianGuaRelKey]}，代表最终结果${bianResultText}。\n`;
      reason += `4. 本卦${oHex?.name}的核心指引："${getGuidance(guidance, 'action')}"。\n`;
      reason += `5. 应期推算：${timingEle}今月${timingStrength}，时间尺度${timingUnitZH}。动爻第${chg}爻（爻位修正×${chgPosMod}），变卦速度×${bianSpeedMod}。${timingNote} 旺季：${timingSeason.best}。预计约${timingValue}${timingUnitZH}${fengWangNote || (unitScale>=2?`（${targetMonthStr}前后）`:'')}${delayNote}。\n`;
      reason += `6. 计算：卦数(${tiNum}+${yongNum}=${guaSum})，guaRatio=${guaRatio.toFixed(2)}，爻位×${chgPosMod}，变卦×${bianSpeedMod} → 约${timingValue}${timingUnitZH}。`;
    }

    return {
      fortune: t.fortuneLabels[fortuneKey],
      fortuneKey,
      questionType,
      // 体用分析
      tiGua: lang === 'en' ? `${tiNameEN} (${getElement(ti.element)})` : `${ti.name}（${getElement(ti.element)}）`,
      yongGua: lang === 'en' ? `${yongNameEN} (${getElement(yong.element)})` : `${yong.name}（${getElement(yong.element)}）`,
      tiYongRelKey,
      tiYongLabel: t.tiYongLabels[tiYongRelKey],
      tiYongDesc: t.tiYongDesc[tiYongRelKey],
      // 变卦分析
      bianGuaName: getHexName(cHex),
      bianGuaRelKey,
      bianGuaLabel: t.bianGuaLabels[bianGuaRelKey],
      bianGuaDesc: t.bianGuaDesc[bianGuaRelKey],
      // 卦象信息
      benGuaName: getHexName(oHex),
      benGuaMeaning: getText(oHex?.vernacular, oHex?.vernacularEn),
      // 应期
      yingqi: { months: yingqiMonths, bestSeason: timingSeason.best, avoidSeason: timingSeason.bad, note: timingNote, delayDays },
      // 建议
      specificAdvice,
      reason,
      totalLevel
    };
  };

  // === 金钱卦智能解读 ===
  const generateCoinReading = () => {
    if (!result || !result.question || result.method !== 'coin') return null;

    const q = result.question;
    const { ti, yong, oHex, cHex, uGua, lGua, cU, cL, changingLines, numChanging, readingFocus } = result;

    // === Ti-Yong 五行分析 (supplementary for coin) ===
    const tiElement = ti?.element;
    const yongElement = yong?.element;

    let tiYongRelKey = result.relKey || '';
    let tiYongLevel = 0;
    if (tiElement === yongElement) { tiYongRelKey = 'bihe'; tiYongLevel = 1; }
    else if (WUXING[yongElement]?.sheng === tiElement) { tiYongRelKey = 'yongShengTi'; tiYongLevel = 2; }
    else if (WUXING[tiElement]?.sheng === yongElement) { tiYongRelKey = 'tiShengYong'; tiYongLevel = -1; }
    else if (WUXING[tiElement]?.ke === yongElement) { tiYongRelKey = 'tiKeYong'; tiYongLevel = 1; }
    else if (WUXING[yongElement]?.ke === tiElement) { tiYongRelKey = 'yongKeTi'; tiYongLevel = -2; }

    // === Changed hexagram relationship ===
    // For coin: use the changed hexagram's overall quality
    const cLowerEl = cL?.element;
    const cUpperEl = cU?.element;
    // Use the trigram that corresponds to where the changes are
    const lowerHasChange = changingLines?.some(i => i < 3);
    const upperHasChange = changingLines?.some(i => i >= 3);
    const cYongElement = numChanging === 0 ? tiElement
      : (lowerHasChange && !upperHasChange) ? cLowerEl
      : (upperHasChange && !lowerHasChange) ? cUpperEl
      : cLowerEl; // both have changes, use lower

    let bianGuaRelKey = '';
    let bianGuaLevel = 0;
    if (numChanging > 0 && cYongElement) {
      if (cYongElement === tiElement) { bianGuaRelKey = 'bihe'; bianGuaLevel = 1; }
      else if (WUXING[cYongElement]?.sheng === tiElement) { bianGuaRelKey = 'shengTi'; bianGuaLevel = 2; }
      else if (WUXING[tiElement]?.sheng === cYongElement) { bianGuaRelKey = 'tiSheng'; bianGuaLevel = 0; }
      else if (WUXING[tiElement]?.ke === cYongElement) { bianGuaRelKey = 'tiKe'; bianGuaLevel = 1; }
      else if (WUXING[cYongElement]?.ke === tiElement) { bianGuaRelKey = 'keTi'; bianGuaLevel = -1; }
    }

    const totalLevel = tiYongLevel + bianGuaLevel;

    // === Fortune ===
    let fortuneKey = '';
    if (totalLevel >= 3) fortuneKey = 'great';
    else if (totalLevel >= 1) fortuneKey = 'good';
    else if (totalLevel === 0) fortuneKey = 'neutral';
    else fortuneKey = 'bad';

    // === Oracle text extraction (from readingFocus) ===
    const isEn = lang === 'en';
    const getYaoText = (hex, pos) => {
      const y = hex?.yao?.[pos];
      if (!y) return null;
      return { pos: isEn ? (y.posEn || y.pos) : y.pos, text: isEn ? (y.textEn || y.text) : y.text, mean: isEn ? (y.meanEn || y.mean) : y.mean, vernacular: isEn ? (y.vernacularEn || y.vernacular) : y.vernacular };
    };
    const getGuaCiText = (hex) => ({ text: isEn ? (hex?.guaEn || hex?.gua) : hex?.gua, xiang: isEn ? (hex?.xiangEn || hex?.xiang) : hex?.xiang });

    let oracleTexts = [];
    const rf = readingFocus;
    if (rf) {
      if (rf.type === 'guaCi') {
        const g = getGuaCiText(oHex);
        oracleTexts.push({ label: isEn ? 'Primary Hexagram Oracle' : '本卦卦辞', text: g.text, sub: g.xiang });
      } else if (rf.type === 'singleYao' && changingLines?.length > 0) {
        const y = getYaoText(oHex, changingLines[0]);
        if (y) oracleTexts.push({ label: y.pos, text: y.text, sub: y.mean || y.vernacular });
      } else if (rf.type === 'twoYao' && changingLines?.length >= 2) {
        const upper = Math.max(...changingLines);
        const lower = Math.min(...changingLines);
        const y1 = getYaoText(oHex, upper);
        const y2 = getYaoText(oHex, lower);
        if (y1) oracleTexts.push({ label: `${y1.pos} ${isEn ? '(primary)' : '（主）'}`, text: y1.text, sub: y1.mean || y1.vernacular });
        if (y2) oracleTexts.push({ label: `${y2.pos} ${isEn ? '(secondary)' : '（辅）'}`, text: y2.text, sub: y2.mean || y2.vernacular });
      } else if (rf.type === 'bothGuaCi') {
        const g1 = getGuaCiText(oHex);
        const g2 = getGuaCiText(cHex);
        oracleTexts.push({ label: isEn ? 'Primary Oracle (main)' : '本卦卦辞（主）', text: g1.text, sub: g1.xiang });
        oracleTexts.push({ label: isEn ? 'Changed Oracle (secondary)' : '变卦卦辞（辅）', text: g2.text, sub: g2.xiang });
      } else if (rf.type === 'twoStableYao') {
        const stableLines = [0,1,2,3,4,5].filter(i => !changingLines.includes(i));
        const lower = Math.min(...stableLines);
        const upper = Math.max(...stableLines);
        const y1 = getYaoText(cHex, lower);
        const y2 = getYaoText(cHex, upper);
        if (y1) oracleTexts.push({ label: `${y1.pos} ${isEn ? '(primary)' : '（主）'}`, text: y1.text, sub: y1.mean || y1.vernacular });
        if (y2) oracleTexts.push({ label: `${y2.pos} ${isEn ? '(secondary)' : '（辅）'}`, text: y2.text, sub: y2.mean || y2.vernacular });
      } else if (rf.type === 'singleStableYao') {
        const stableLine = [0,1,2,3,4,5].find(i => !changingLines.includes(i));
        const y = getYaoText(cHex, stableLine);
        if (y) oracleTexts.push({ label: y.pos, text: y.text, sub: y.mean || y.vernacular });
      } else if (rf.type === 'yongJiu') {
        oracleTexts.push({ label: isEn ? 'Use of Nines' : '用九', text: oHex?.yongJiu?.text || '见群龙无首，吉。', sub: isEn ? (oHex?.yongJiu?.meaningEn || oHex?.yongJiu?.meaning) : oHex?.yongJiu?.meaning });
      } else if (rf.type === 'yongLiu') {
        oracleTexts.push({ label: isEn ? 'Use of Sixes' : '用六', text: oHex?.yongLiu?.text || '利永贞。', sub: isEn ? (oHex?.yongLiu?.meaningEn || oHex?.yongLiu?.meaning) : oHex?.yongLiu?.meaning });
      } else if (rf.type === 'bianGuaCi') {
        const g = getGuaCiText(cHex);
        oracleTexts.push({ label: isEn ? 'Changed Hexagram Oracle' : '变卦卦辞', text: g.text, sub: g.xiang });
      }
    }

    // === Guidance ===
    const guidance = GUA_GUIDANCE[oHex?.name] || { action: '', timing: '', method: '', actionEn: '', timingEn: '', methodEn: '' };
    const cGuidance = GUA_GUIDANCE[cHex?.name] || { action: '', timing: '', method: '', actionEn: '', timingEn: '', methodEn: '' };
    const getGuidance = (g, key) => lang === 'en' ? (g[key + 'En'] || g[key]) : g[key];

    // === Question type detection ===
    const isLove = /感情|爱情|婚姻|恋爱|对象|结婚|分手|复合|暧昧|表白|脱单|男朋友|女朋友|老公|老婆|相亲|失恋|单身|桃花|romantic|romance|dating|girlfriend|boyfriend|ex-girlfriend|ex-boyfriend|breakup|crush|marriage/i.test(q);
    const isCareer = /工作|事业|跳槽|升职|晋升|面试|创业|生意|offer|辞职|换工作|职场|老板|同事|项目|合作|career|job|work|business|interview|promotion|startup|colleague/i.test(q);
    const isMoney = /财|钱|投资|理财|股|基金|收入|赚|贷款|负债|资金|融资|money|wealth|invest|finance|stock|fund|loan|income/i.test(q);
    const isHealth = /身体|健康|病|医|治疗|手术|恢复|症状|检查|养生|health|sick|medical|surgery|recover|symptom|hospital/i.test(q);
    const isStudy = /学习|学业|考试|考研|高考|留学|升学|成绩|考核|学校|exam|study|school|university|score|grade|academic/i.test(q);
    const isTravel = /出行|旅游|旅行|搬家|搬迁|出差|移民|换城市|行程|travel|trip|move|relocate|commute|journey/i.test(q);
    const isFind = /在哪|哪里|找不到|丢了|丢失|失物|where|find|lost|missing/i.test(q);
    const isPerson = /他|她|对方|某人|朋友|同事|老板|领导|父母|家人|男朋友|女朋友|老公|老婆|\bhe\b|\bshe\b|\bthey\b|\bhim\b|\bher\b|\bboss\b|\bfriend\b/i.test(q);
    const hasFirstPerson = /我/.test(q) || /\bI\b|\bmy\b|\bme\b|\bI'm\b|\bI've\b|\bI'll\b|\bI'd\b/.test(q);
    const isAboutOther = !hasFirstPerson || isPerson;
    const _nameMatch = q.match(/how (?:is|does|will|did)\s+([A-Za-z]{2,})\b/i) || q.match(/^([A-Z][a-z]{1,})\s+(?:is|will|has|can)\b/);
    const _stopWords = new Set(['the','this','that','it','my','your','his','her','their','our','its','a','an','how','what','when','where','why','who']);
    const detectedName = _nameMatch && !_stopWords.has((_nameMatch[1]||'').toLowerCase()) ? _nameMatch[1] : null;
    const subjectZH = detectedName || (q.includes('她') ? '她' : q.includes('他') ? '他' : '对方');
    const subjectEN = detectedName || ((/\bshe\b|\bher\b/i.test(q)) ? 'she' : (/\bhe\b|\bhim\b/i.test(q)) ? 'he' : 'they');

    let questionType = lang === 'en' ? 'Reading' : '解读';

    // === Timing (应期) ===
    const guaNumbers = { '乾': 1, '兑': 2, '离': 3, '震': 4, '巽': 5, '坎': 6, '艮': 7, '坤': 8 };
    const tiNum = guaNumbers[ti?.name] || 1;
    const yongNum = guaNumbers[yong?.name] || 1;

    const elementSeasons = {
      '木': { best: lang === 'en' ? 'Spring (Feb-Apr)' : '春季（2-4月）', bad: lang === 'en' ? 'Autumn (Aug-Oct)' : '秋季（8-10月）' },
      '火': { best: lang === 'en' ? 'Summer (May-Jul)' : '夏季（5-7月）', bad: lang === 'en' ? 'Winter (Nov-Jan)' : '冬季（11-1月）' },
      '土': { best: lang === 'en' ? 'Seasonal months (Mar, Jun, Sep, Dec)' : '四季月（3、6、9、12月）', bad: lang === 'en' ? 'Spring (Feb-Apr)' : '春季（2-4月）' },
      '金': { best: lang === 'en' ? 'Autumn (Aug-Oct)' : '秋季（8-10月）', bad: lang === 'en' ? 'Summer (May-Jul)' : '夏季（5-7月）' },
      '水': { best: lang === 'en' ? 'Winter (Nov-Jan)' : '冬季（11-1月）', bad: lang === 'en' ? 'Seasonal months' : '四季月' },
    };
    const tiSeason = elementSeasons[tiElement] || { best: '', bad: '' };
    const timingSeason = elementSeasons[yongElement] || tiSeason;

    const now = new Date();
    const curMonth = now.getMonth() + 1;
    const mthEleMap = {1:'土',2:'木',3:'木',4:'土',5:'火',6:'火',7:'土',8:'金',9:'金',10:'土',11:'水',12:'水'};
    const mthEle = mthEleMap[curMonth] || '土';
    const timingEle = yongElement;

    let timingStrength;
    if (timingEle === mthEle) timingStrength = '旺';
    else if (WUXING[mthEle]?.sheng === timingEle) timingStrength = '相';
    else if (WUXING[timingEle]?.sheng === mthEle) timingStrength = '休';
    else if (WUXING[timingEle]?.ke === mthEle) timingStrength = '囚';
    else timingStrength = '死';

    const strengthBaseScale = { '旺': 0, '相': 1, '休': 2, '囚': 3, '死': 4 };
    let unitScale = strengthBaseScale[timingStrength];
    if (tiYongRelKey === 'yongShengTi') unitScale = Math.max(0, unitScale - 1);
    else if (tiYongRelKey === 'yongKeTi') unitScale = Math.min(4, unitScale + 1);

    // Changing lines position modifier — use average position for coin
    const avgChgPos = numChanging > 0 ? (changingLines.reduce((a, b) => a + b, 0) / numChanging) + 1 : 3;
    const chgPosMod = numChanging === 0 ? 1.0 : [0, 0.7, 0.85, 1.0, 1.1, 1.25, 1.5][Math.round(avgChgPos)] || 1.0;
    const bianSpeedMod = { shengTi: 0.85, tiKe: 0.9, bihe: 1.0, tiSheng: 1.1, keTi: 1.2 }[bianGuaRelKey] ?? 1.0;
    const guaSum = tiNum + yongNum;
    const guaRatio = (guaSum - 2) / 14;

    const eleWangMonths = { '木':[2,3], '火':[5,6], '土':[1,4,7,10], '金':[8,9], '水':[11,12] };
    const wangMonths = eleWangMonths[timingEle] || [];
    const wangInterval = wangMonths.length > 0 ? Math.round(12 / wangMonths.length) : 12;
    let fengWangMonth = null, fengWangAway = 0;
    for (let i = 1; i <= 13; i++) {
      const m = ((curMonth - 1 + i) % 12) + 1;
      if (wangMonths.includes(m)) { fengWangMonth = m; fengWangAway = i; break; }
    }

    const monthNamesCN = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
    const monthNamesEN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const curYear = now.getFullYear();

    let timingValue, timingUnitZH, timingUnitEN, yingqiMonths, targetMonthStr, fengWangNote, timingNote;

    if (unitScale === 0) {
      timingValue = Math.max(1, Math.min(30, Math.round(guaSum * chgPosMod * bianSpeedMod)));
      timingUnitZH = '天'; timingUnitEN = 'day';
      yingqiMonths = 0;
      targetMonthStr = lang === 'en' ? monthNamesEN[curMonth-1] : monthNamesCN[curMonth-1];
      fengWangNote = lang === 'en' ? ' (timing is ideal right now)' : '（正值旺季，宜把握当下）';
      timingNote = lang === 'en' ? 'The timing is right — move on this now.' : '当前正值旺季，时机已熟。';
    } else if (unitScale <= 3) {
      const [cycleMin, cycleMax] = { 1:[0,1], 2:[1,2], 3:[2,4] }[unitScale] || [0,1];
      const cycleCount = cycleMin + Math.round(guaRatio * (cycleMax - cycleMin));
      let rawMonthsAway = fengWangAway + cycleCount * wangInterval;
      rawMonthsAway = Math.round(rawMonthsAway * chgPosMod * bianSpeedMod);
      const [scaleMin, scaleMax] = { 1:[1,4], 2:[3,8], 3:[6,20] }[unitScale] || [1,12];
      yingqiMonths = Math.max(scaleMin, Math.min(scaleMax, rawMonthsAway));
      let targetFengWang = null;
      for (let i = Math.max(1, yingqiMonths - 1); i <= yingqiMonths + wangInterval; i++) {
        const m = ((curMonth - 1 + i) % 12) + 1;
        if (wangMonths.includes(m)) { targetFengWang = m; break; }
      }
      const tMonth = targetFengWang || ((curMonth - 1 + yingqiMonths) % 12) + 1;
      timingValue = yingqiMonths;
      timingUnitZH = '个月'; timingUnitEN = 'month';
      targetMonthStr = lang === 'en' ? monthNamesEN[tMonth-1] : monthNamesCN[tMonth-1];
      fengWangNote = targetFengWang ? (lang === 'en' ? ` (best window: ${monthNamesEN[targetFengWang-1]})` : `（旺月${monthNamesCN[targetFengWang-1]}，最可能应期）`) : '';
      const stNoteEN = { '相': 'Things are lining up — expect results around', '休': 'Still building — likely around', '囚': 'Takes more time — aim for' }[timingStrength] || 'Likely around';
      timingNote = lang === 'en' ? `${stNoteEN} ${targetMonthStr}.` : `当前${timingStrength}，待旺月到来时应验。`;
    } else {
      const baseYears = Math.max(1, Math.round(1 + guaRatio * 3));
      const targetYears = Math.max(1, Math.min(8, Math.round(baseYears * chgPosMod * bianSpeedMod)));
      timingValue = targetYears;
      timingUnitZH = '年'; timingUnitEN = 'year';
      yingqiMonths = targetYears * 12;
      const targetYear = curYear + targetYears;
      const peakMonth = fengWangMonth || wangMonths[0] || curMonth;
      targetMonthStr = lang === 'en' ? `${monthNamesEN[peakMonth-1]} ${targetYear}` : `${targetYear}年${monthNamesCN[peakMonth-1]}`;
      fengWangNote = lang === 'en' ? ` (most likely around ${monthNamesEN[peakMonth-1]} ${targetYear})` : `（大约${targetYear}年${monthNamesCN[peakMonth-1]}前后）`;
      timingNote = lang === 'en' ? `This is a longer journey — most likely around ${targetMonthStr}.` : `事情以年为单位，${targetYear}年前后应验。`;
    }

    // === Generate advice ===
    const trigramNamesEN = { '乾': 'Heaven', '坤': 'Earth', '震': 'Thunder', '巽': 'Wind', '坎': 'Water', '离': 'Fire', '艮': 'Mountain', '兑': 'Lake' };
    const tiNameEN = trigramNamesEN[ti?.name] || 'You';
    const yongNameEN = trigramNamesEN[yong?.name] || 'the Situation';
    const dim = (level, good, mid, bad) => level >= 1 ? good : level === 0 ? mid : bad;

    const favorableElement = (tiYongRelKey === 'yongShengTi' || tiYongRelKey === 'tiKeYong') ? yong?.element : ti?.element;
    const fieldsByElement = {
      '金': { zh: '金融、银行、机械、汽车、珠宝', en: 'finance, banking, machinery, automotive, jewelry' },
      '木': { zh: '教育、出版、医疗、服装、设计', en: 'education, publishing, healthcare, fashion, design' },
      '水': { zh: '互联网、物流、旅游、传媒、贸易', en: 'internet, logistics, tourism, media, trade' },
      '火': { zh: '科技、电子、餐饮、娱乐、新能源', en: 'technology, electronics, F&B, entertainment, energy' },
      '土': { zh: '房地产、建筑、农业、仓储、矿业', en: 'real estate, construction, agriculture, storage, mining' },
    };
    const directionByElement = {
      '金': { zh: '西方', en: 'west' }, '木': { zh: '东方', en: 'east' },
      '水': { zh: '北方', en: 'north' }, '火': { zh: '南方', en: 'south' },
      '土': { zh: '本地', en: 'local/central' },
    };
    const guirenByGua = {
      '乾': { zh: '领导、上司、长辈男性', en: 'leader, superior, or older male figure' },
      '坤': { zh: '长辈女性、同事、合伙人', en: 'older female, colleague, or partner' },
      '震': { zh: '年轻男性、创业者', en: 'young energetic man, entrepreneur' },
      '巽': { zh: '女性朋友、中间人', en: 'female friend, intermediary' },
      '坎': { zh: '智慧型人物、法律/金融从业者', en: 'wise advisor, lawyer, or financial professional' },
      '离': { zh: '有名气的人、媒体/艺术从业者', en: 'influential person, media or arts professional' },
      '艮': { zh: '踏实稳重的老朋友、前辈', en: 'steady old friend or senior mentor' },
      '兑': { zh: '善于表达的朋友、律师、销售', en: 'articulate friend, lawyer, or salesperson' },
    };
    const loveStyleByGua = {
      '乾': { pos: { zh: '主动、有担当、重视你', en: 'proactive, responsible, values you' }, neg: { zh: '强势、不善表达柔情', en: 'dominant, struggles to show warmth' } },
      '坤': { pos: { zh: '温柔包容、愿意为你付出', en: 'gentle, nurturing, willing to give' }, neg: { zh: '太被动、需要你先开口', en: 'too passive, needs you to initiate' } },
      '震': { pos: { zh: '热情、会主动追你', en: 'passionate, will pursue you actively' }, neg: { zh: '情绪化、忽冷忽热', en: 'emotional and inconsistent' } },
      '巽': { pos: { zh: '体贴、善于沟通感情', en: 'considerate, emotionally communicative' }, neg: { zh: '犹豫不决、不够坦诚', en: 'indecisive, not fully open' } },
      '坎': { pos: { zh: '真心、感情深沉', en: 'sincere, deep feelings' }, neg: { zh: '心思重、不善于表达', en: 'overthinks, struggles to express' } },
      '离': { pos: { zh: '热情浪漫、喜欢表达', en: 'romantic and expressive' }, neg: { zh: '表面热情、需观察真心', en: 'outwardly warm, verify sincerity' } },
      '艮': { pos: { zh: '稳重可靠、认真对待感情', en: 'steady and takes relationship seriously' }, neg: { zh: '内敛、行动慢、需要耐心', en: 'reserved, slow to act' } },
      '兑': { pos: { zh: '甜蜜活泼、喜欢你陪伴', en: 'sweet and lively, enjoys your company' }, neg: { zh: '话多行动少、需看实际行动', en: 'all talk — watch actions' } },
    };

    let specificAdvice = '';

    // --- Oracle text reading (coin-specific) ---
    const oracleRule = isEn ? rf?.ruleEn : rf?.ruleZh;

    if (lang === 'en') {
      // 1. Overall conclusion
      if (totalLevel >= 2) specificAdvice += `✅ Very favorable overall. `;
      else if (totalLevel >= 1) specificAdvice += `🟡 Favorable. `;
      else if (totalLevel >= 0) specificAdvice += `⚪ Mixed signals — could go either way. `;
      else specificAdvice += `🔴 Conditions aren't in your favor right now. `;

      if (tiYongRelKey === 'yongShengTi') specificAdvice += `External support is strong — help will come.`;
      else if (tiYongRelKey === 'tiKeYong') specificAdvice += `You're in the driver's seat — taking initiative moves things forward.`;
      else if (tiYongRelKey === 'bihe') specificAdvice += `The situation is evenly matched — steady effort is the way.`;
      else if (tiYongRelKey === 'tiShengYong') specificAdvice += `You're putting in more energy than you're getting back.`;
      else specificAdvice += `Outside forces are creating friction — don't push too hard.`;

      if (numChanging > 0 && bianGuaLevel >= 1) specificAdvice += ` Things are likely to turn in your favor.`;
      else if (numChanging > 0 && bianGuaLevel < 0) specificAdvice += ` Watch out — there may be complications down the road.`;
      else if (numChanging === 0) specificAdvice += ` The situation is stable — no major shifts expected.`;

      // 2. Oracle reading
      if (oracleTexts.length > 0) {
        specificAdvice += `\n\n━━ Oracle Reading ━━`;
        specificAdvice += `\n📋 ${oracleRule || 'Key reading:'}`;
        for (const ot of oracleTexts) {
          specificAdvice += `\n📜 ${ot.label}: "${ot.text}"`;
          if (ot.sub) specificAdvice += `\n→ ${ot.sub}`;
        }
      }

      // 3. Core reading
      specificAdvice += `\n\n━━ Core Reading ━━`;
      specificAdvice += `\n👤 Your position: `;
      if (tiYongLevel >= 2) specificAdvice += `Strong — you have real leverage here.`;
      else if (tiYongLevel >= 1) specificAdvice += `Decent — some advantage, needs effort to convert.`;
      else if (tiYongLevel === 0) specificAdvice += `Neutral — what you do next matters a lot.`;
      else specificAdvice += `A bit weak — holding back is smarter than forcing ahead.`;

      specificAdvice += `\n🌍 What's around you: `;
      if (tiYongRelKey === 'yongShengTi') specificAdvice += `Actively helping. People and timing are on your side.`;
      else if (tiYongRelKey === 'tiKeYong') specificAdvice += `You can shape it — take the lead.`;
      else if (tiYongRelKey === 'bihe') specificAdvice += `About even — no major tailwind or headwind.`;
      else if (tiYongRelKey === 'tiShengYong') specificAdvice += `Drawing from you — be mindful of your limits.`;
      else specificAdvice += `Pushing back — find ways around it rather than through it.`;

      specificAdvice += `\n⚡ What to do: ${getGuidance(guidance, 'action')}`;
      specificAdvice += `\n💡 How to approach it: ${getGuidance(guidance, 'method')}`;
      specificAdvice += `\n🚧 What to watch out for: ${getGuidance(guidance, 'timing')}`;

      specificAdvice += `\n🔮 How this is likely to end: `;
      if (numChanging === 0) specificAdvice += `Stable — the situation remains as it is for now.`;
      else if (bianGuaLevel >= 2) specificAdvice += `Ends well — outcome better than the journey.`;
      else if (bianGuaLevel >= 1) specificAdvice += `The ending is favorable.`;
      else if (bianGuaLevel === 0) specificAdvice += `Things stabilize — no dramatic change.`;
      else specificAdvice += `There may be a harder stretch ahead — plan accordingly.`;

      // Domain-specific sections
      const showLove = isLove && !(isCareer || isMoney);
      const showCareer = isCareer;
      const showMoney = isMoney && !isCareer;

      if (showCareer) {
        specificAdvice += `\n\n━━ Career Breakdown ━━`;
        specificAdvice += `\n📈 Advancement: ${dim(tiYongLevel, 'Favorable — opportunity likely', 'Possible — needs active push', 'Unlikely now — build foundation first')}`;
        specificAdvice += `\n🤝 Helpful People: ${tiYongRelKey === 'yongShengTi' ? `Yes — look for a ${guirenByGua[yong?.name]?.en || 'senior figure'}` : 'Rely mainly on yourself'}`;
        specificAdvice += `\n🏭 Favorable Industries: ${fieldsByElement[favorableElement]?.en || 'various'}`;
        specificAdvice += `\n🧭 Favorable Direction: ${directionByElement[favorableElement]?.en || 'local'}`;
      }
      if (showLove) {
        const lStyle = loveStyleByGua[yong?.name] || { pos: { en: 'caring' }, neg: { en: 'reserved' } };
        specificAdvice += `\n\n━━ Relationship Breakdown ━━`;
        specificAdvice += `\n💞 Overall prospect: ${dim(totalLevel, 'Positive — can develop well', 'Uncertain — needs time', 'Challenging — adjust expectations')}`;
        specificAdvice += `\n🧠 Their personality: ${tiYongLevel >= 0 ? lStyle.pos.en : lStyle.neg.en}`;
        specificAdvice += `\n💬 Their feelings: ${dim(tiYongLevel, 'Warm — they lean toward you', 'Ambiguous — mixed feelings', 'Distant or guarded')}`;
        specificAdvice += `\n🔮 Long-term: ${dim(bianGuaLevel, 'Turns favorable — deepening likely', 'Stays the same without a push', 'May drift apart without effort')}`;
      }
      if (showMoney) {
        specificAdvice += `\n\n━━ Finance Breakdown ━━`;
        specificAdvice += `\n💰 Outlook: ${dim(totalLevel, 'Good — income and opportunity likely', 'Average — steady but not exceptional', 'Weak — focus on protecting what you have')}`;
        specificAdvice += `\n🏭 Favorable sectors: ${fieldsByElement[favorableElement]?.en || 'various'}`;
        specificAdvice += `\n🔚 How this ends: ${dim(bianGuaLevel, 'Profitable in the end', 'Break-even or modest gain', 'Risk of loss — set clear limits')}`;
      }
      if (isHealth) {
        specificAdvice += `\n\n━━ Health Breakdown ━━`;
        specificAdvice += `\n🏥 Recovery: ${dim(totalLevel, 'Positive — recovery expected', 'Slow but manageable', 'Challenging — seek professional help')}`;
        specificAdvice += `\n📅 Improvement window: ${timingSeason.best || 'seasonal'} (around ${targetMonthStr})`;
      }
      if (isFind) {
        const dirByGua = { '乾': 'northwest, high place / metal cabinet', '坤': 'southwest, low spot / near ground', '震': 'east, near door / noisy area', '巽': 'southeast, near window', '坎': 'north, near water / bathroom', '离': 'south, bright spot / near electronics', '艮': 'northeast, corner / storage', '兑': 'west, near gap / opening' };
        specificAdvice += `\n\n━━ Finding Lost Item ━━`;
        specificAdvice += `\n📍 Most likely location: ${dirByGua[yong?.name] || 'retrace your steps'}`;
        specificAdvice += `\n🔍 Can it be found: ${dim(totalLevel, 'Likely — search carefully', 'Possibly — may take time', 'Difficult')}`;
      }

      // Timing
      specificAdvice += `\n\n━━ Timing ━━`;
      specificAdvice += `\n📅 Best window: ${timingSeason.best || 'anytime'}`;
      specificAdvice += `\n🔍 Basis: ${timingNote}`;
      specificAdvice += `\n📆 Estimated: ~${timingValue} ${timingUnitEN}${timingValue !== 1 ? 's' : ''}${fengWangNote || (unitScale >= 2 ? ` (around ${targetMonthStr})` : '')}`;

    } else {
      // Chinese version
      if (totalLevel >= 2) specificAdvice += `✅ 整体很好！`;
      else if (totalLevel >= 1) specificAdvice += `🟡 还不错。`;
      else if (totalLevel >= 0) specificAdvice += `⚪ 情况一般，有些复杂。`;
      else specificAdvice += `🔴 目前形势不太有利。`;

      if (tiYongRelKey === 'yongShengTi') specificAdvice += `外部力量在支持你，会有贵人和资源主动靠拢。`;
      else if (tiYongRelKey === 'tiKeYong') specificAdvice += `你掌握主动权，只要你出手，局面就会按你的意愿走。`;
      else if (tiYongRelKey === 'bihe') specificAdvice += `双方力量差不多，稳扎稳打是最好的策略。`;
      else if (tiYongRelKey === 'tiShengYong') specificAdvice += `你在付出，但回报还没跟上——坚持正确方向。`;
      else specificAdvice += `外部阻力比较大，不适合硬冲，保存实力更明智。`;

      if (numChanging > 0 && bianGuaLevel >= 1) specificAdvice += `最终结果会往好的方向走。`;
      else if (numChanging > 0 && bianGuaLevel < 0) specificAdvice += `后期可能还有波折，要留意。`;
      else if (numChanging === 0) specificAdvice += `局势稳定，暂无重大变化。`;

      // Oracle reading
      if (oracleTexts.length > 0) {
        specificAdvice += `\n\n━━ 卦辞解读 ━━`;
        specificAdvice += `\n📋 ${oracleRule || '关键解读：'}`;
        for (const ot of oracleTexts) {
          specificAdvice += `\n📜 ${ot.label}："${ot.text}"`;
          if (ot.sub) specificAdvice += `\n→ ${ot.sub}`;
        }
      }

      // Core reading
      specificAdvice += `\n\n━━ 核心解读 ━━`;
      specificAdvice += `\n👤 你现在的状态：`;
      if (tiYongLevel >= 2) specificAdvice += `强势有利，时机和能量都对你有利。`;
      else if (tiYongLevel >= 1) specificAdvice += `还不错，有一定优势，但仍需努力才能转化为结果。`;
      else if (tiYongLevel === 0) specificAdvice += `中等，接下来怎么做很关键。`;
      else specificAdvice += `稍弱，形势不太支持你，等待比强行更聪明。`;

      specificAdvice += `\n🌍 外部环境/周围情况：`;
      if (tiYongRelKey === 'yongShengTi') specificAdvice += `主动帮你，周围的人和环境都倾向于支持你。`;
      else if (tiYongRelKey === 'tiKeYong') specificAdvice += `你能影响它，局面会随你的行动而改变，你来主导。`;
      else if (tiYongRelKey === 'bihe') specificAdvice += `大体持平，靠自己稳步推进。`;
      else if (tiYongRelKey === 'tiShengYong') specificAdvice += `在消耗你，付出多、得到少，注意不要过度透支。`;
      else specificAdvice += `有阻力，外部环境在制造摩擦，找方法绕过去。`;

      specificAdvice += `\n⚡ 该怎么做：${getGuidance(guidance, 'action')}`;
      specificAdvice += `\n💡 行动方式：${getGuidance(guidance, 'method')}`;
      specificAdvice += `\n🚧 需要注意：${getGuidance(guidance, 'timing')}`;

      specificAdvice += `\n🔮 最终会怎样：`;
      if (numChanging === 0) specificAdvice += `局势平稳，维持现状，暂无大的变动。`;
      else if (bianGuaLevel >= 2) specificAdvice += `结局不错，最终结果比过程要好得多。`;
      else if (bianGuaLevel >= 1) specificAdvice += `结局向好，即使过程有些曲折。`;
      else if (bianGuaLevel === 0) specificAdvice += `结局平稳，基本维持现状。`;
      else specificAdvice += `后面可能还有一道坎，提前做好准备。`;

      // Domain-specific (Chinese)
      const showLove = isLove && !(isCareer || isMoney);
      const showCareer = isCareer;
      const showMoney = isMoney && !isCareer;

      if (showCareer) {
        specificAdvice += `\n\n━━ 事业详细分析 ━━`;
        specificAdvice += `\n📈 升职/晋升：${dim(tiYongLevel, '有利，机会近在眼前', '有可能，需要主动争取', '目前不太有利，先积累')}`;
        specificAdvice += `\n🤝 贵人：${tiYongRelKey === 'yongShengTi' ? `有，留意身边的${guirenByGua[yong?.name]?.zh || '长辈'}` : '主要靠自己'}`;
        specificAdvice += `\n🏭 有利行业：${fieldsByElement[favorableElement]?.zh || '多种'}`;
        specificAdvice += `\n🧭 有利方位：${directionByElement[favorableElement]?.zh || '本地'}`;
      }
      if (showLove) {
        const lStyle = loveStyleByGua[yong?.name] || { pos: { zh: '温和' }, neg: { zh: '保守' } };
        specificAdvice += `\n\n━━ 感情详细分析 ━━`;
        specificAdvice += `\n💞 总体前景：${dim(totalLevel, '可以发展，前景不错', '不太确定，需要时间', '有挑战，调整预期')}`;
        specificAdvice += `\n🧠 对方性格：${tiYongLevel >= 0 ? lStyle.pos.zh : lStyle.neg.zh}`;
        specificAdvice += `\n💬 对方态度：${dim(tiYongLevel, '温暖，对你有好感', '态度模糊', '比较冷淡或保守')}`;
        specificAdvice += `\n🔮 长期走向：${dim(bianGuaLevel, '会越来越好', '没有推力就维持现状', '可能渐行渐远')}`;
      }
      if (showMoney) {
        specificAdvice += `\n\n━━ 财运详细分析 ━━`;
        specificAdvice += `\n💰 总体财运：${dim(totalLevel, '不错，有进账机会', '一般，稳定为主', '偏弱，注意守财')}`;
        specificAdvice += `\n🏭 有利行业：${fieldsByElement[favorableElement]?.zh || '多种'}`;
        specificAdvice += `\n🔚 结果：${dim(bianGuaLevel, '最终有利', '持平或小利', '有亏损风险，设好止损')}`;
      }
      if (isHealth) {
        specificAdvice += `\n\n━━ 健康分析 ━━`;
        specificAdvice += `\n🏥 恢复前景：${dim(totalLevel, '乐观，可以恢复', '慢慢来，需耐心', '有挑战，及时就医')}`;
        specificAdvice += `\n📅 好转时间：${timingSeason.best || '因季节而定'}（约${targetMonthStr}）`;
      }
      if (isFind) {
        const dirByGua = { '乾': '西北方向，或者高处、金属柜旁', '坤': '西南方向，低处、地面附近', '震': '东边，门口、有动静的地方', '巽': '东南方向，窗边、通风的地方', '坎': '北边，有水的地方、卫生间', '离': '南边，明亮的地方、电器旁', '艮': '东北方向，角落、储物处', '兑': '西边，有缺口的地方' };
        specificAdvice += `\n\n━━ 寻物分析 ━━`;
        specificAdvice += `\n📍 最可能在哪里：${dirByGua[yong?.name] || '不常去的地方，回想最后使用场景'}`;
        specificAdvice += `\n🔍 能找回来吗：${dim(totalLevel, '大概率能找到', '有可能，需多花时间', '比较难')}`;
      }

      // Timing
      specificAdvice += `\n\n━━ 时机推算 ━━`;
      specificAdvice += `\n📅 最有利时间窗口：${timingSeason.best || '四季皆可'}`;
      specificAdvice += `\n🔍 推算依据：${timingNote}`;
      specificAdvice += `\n📆 预计时间：约${timingValue}${timingUnitZH}${fengWangNote || (unitScale >= 2 ? `（${targetMonthStr}前后）` : '')}`;
    }

    // Third-person correction
    if (isAboutOther) {
      if (lang === 'en') {
        const possEN = subjectEN === 'they' ? 'their' : subjectEN === 'she' ? 'her' : subjectEN === 'he' ? 'his' : subjectEN + "'s";
        const PossEN = possEN.charAt(0).toUpperCase() + possEN.slice(1);
        const SubEN = subjectEN.charAt(0).toUpperCase() + subjectEN.slice(1);
        specificAdvice = specificAdvice.replace(/\bYou\b/g, SubEN).replace(/\byou\b/g, subjectEN).replace(/\bYour\b/g, PossEN).replace(/\byour\b/g, possEN);
      } else {
        specificAdvice = specificAdvice.replace(/你/g, subjectZH);
      }
    }

    return {
      fortune: t.fortuneLabels[fortuneKey],
      fortuneKey,
      questionType,
      tiGua: lang === 'en' ? `${tiNameEN} (${t.elements[ti?.element] || ti?.element})` : `${ti?.name}（${t.elements[ti?.element] || ti?.element}）`,
      yongGua: lang === 'en' ? `${yongNameEN} (${t.elements[yong?.element] || yong?.element})` : `${yong?.name}（${t.elements[yong?.element] || yong?.element}）`,
      tiYongRelKey,
      tiYongLabel: t.tiYongLabels[tiYongRelKey],
      tiYongDesc: t.tiYongDesc[tiYongRelKey],
      bianGuaName: numChanging > 0 ? (lang === 'en' ? (HEX_NAMES_EN[cHex?.name] || cHex?.name) : cHex?.name) : (lang === 'en' ? 'No change' : '无变卦'),
      bianGuaRelKey,
      bianGuaLabel: numChanging > 0 ? t.bianGuaLabels[bianGuaRelKey] : (lang === 'en' ? 'Stable' : '稳定'),
      bianGuaDesc: numChanging > 0 ? t.bianGuaDesc[bianGuaRelKey] : (lang === 'en' ? 'No changing lines — situation remains as is' : '无变爻，局势维持现状'),
      benGuaName: lang === 'en' ? (HEX_NAMES_EN[oHex?.name] || oHex?.name) : oHex?.name,
      benGuaMeaning: lang === 'en' ? (oHex?.vernacularEn || oHex?.vernacular) : oHex?.vernacular,
      yingqi: { months: yingqiMonths, bestSeason: timingSeason.best, avoidSeason: timingSeason.bad, note: timingNote, delayDays: 0 },
      specificAdvice,
      reason: '',
      totalLevel
    };
  };

  // === 获取占星数据 ===
  const getHoraryData = () => {
    if (!result || !flags.horary_astrology) return null;
    try {
      return performHoraryReading(result.input, result.question, new Date());
    } catch (e) {
      console.error('Horary error:', e);
      return null;
    }
  };

  // === 冲突分类引擎 ===
  const _classifyConflict = (meihua, horary) => {
    if (!meihua || !horary) return { type: 'none', synthesisHint: 'single' };
    const mNorm = meihua.totalLevel / 4;   // -1..+1
    const hNorm = horary.score / 10;       // -1..+1
    const mPos = mNorm > 0.05, mNeg = mNorm < -0.05;
    const hPos = hNorm > 0.05, hNeg = hNorm < -0.05;

    // 1. 方向分歧：一正一负
    if ((mPos && hNeg) || (mNeg && hPos)) {
      return { type: 'direction', synthesisHint: mPos ? 'meihua_pos_horary_neg' : 'meihua_neg_horary_pos' };
    }
    // 同方向的情况
    if ((mPos && hPos) || (mNeg && hNeg)) {
      // 2. 时间分歧：方向一致但应期差2倍以上
      const mMonths = meihua.yingqi?.months;
      const hTiming = horary.timing;
      if (mMonths && hTiming) {
        const hMonths = hTiming.unit === 'days' ? hTiming.value / 30 : hTiming.unit === 'weeks' ? hTiming.value / 4 : hTiming.value;
        if (mMonths > 0 && hMonths > 0 && Math.max(mMonths, hMonths) / Math.min(mMonths, hMonths) >= 2) {
          return { type: 'timing', synthesisHint: hMonths < mMonths ? 'horary_sooner' : 'meihua_sooner', mMonths, hMonths };
        }
      }
      // 3. 条件分歧：方向一致但各有不同前提
      const hInterference = !!(horary.prohibition || horary.refranation || horary.frustration);
      const mBianShift = meihua.bianGuaRelKey === 'keTi' || meihua.bianGuaRelKey === 'shengTi';
      if (hInterference || mBianShift) {
        return { type: 'condition', synthesisHint: 'conditional', mCondition: meihua.bianGuaRelKey, hInterference };
      }
      // 4. 程度分歧：方向一致但强度差异大
      if (Math.abs(mNorm - hNorm) > 0.25) {
        return { type: 'degree', synthesisHint: Math.abs(mNorm) > Math.abs(hNorm) ? 'meihua_stronger' : 'horary_stronger' };
      }
    }
    // 5. 一致
    return { type: 'agreement', synthesisHint: (mPos || hPos) ? 'both_positive' : (mNeg || hNeg) ? 'both_negative' : 'both_neutral' };
  };

  // === 动态权重：按问题类型+置信度 ===
  const _getDynamicWeights = (qType, meihua, horary) => {
    const BASE = { love:{m:0.65,h:0.35}, career:{m:0.45,h:0.55}, money:{m:0.45,h:0.55}, health:{m:0.50,h:0.50}, study:{m:0.55,h:0.45}, travel:{m:0.40,h:0.60}, legal:{m:0.40,h:0.60}, find:{m:0.35,h:0.65}, family:{m:0.60,h:0.40}, general:{m:0.55,h:0.45} };
    let { m, h } = BASE[qType] || BASE.general;
    // 置信度
    let mConf = 'medium', hConf = 'medium';
    if (meihua) {
      const absM = Math.abs(meihua.totalLevel);
      mConf = absM >= 3 ? 'high' : absM >= 1 ? 'medium' : 'low';
    } else { mConf = 'none'; }
    if (horary) {
      const absH = Math.abs(horary.score);
      hConf = (absH >= 5 && horary.sigAspect && horary.sigAspect.applying) ? 'high' : absH >= 2 ? 'medium' : 'low';
      const interferenceCount = [horary.moonAna?.isVOC, horary.prohibition, horary.refranation, horary.frustration].filter(Boolean).length;
      if (interferenceCount >= 2 && hConf === 'high') hConf = 'medium';
      if (interferenceCount >= 2 && hConf === 'medium') hConf = 'low';
    } else { hConf = 'none'; }
    // 置信度倾斜 ±10%
    if (mConf === 'high' && hConf === 'low') { m += 0.10; h -= 0.10; }
    else if (hConf === 'high' && mConf === 'low') { h += 0.10; m -= 0.10; }
    // 夹紧 + 归一化
    m = Math.max(0.2, Math.min(0.8, m)); h = Math.max(0.2, Math.min(0.8, h));
    const total = m + h; m /= total; h /= total;
    return { m, h, mConf, hConf };
  };

  // === 叙事构建：方向分歧（辩证综合）===
  const _buildDirectionNarrative = (isEN, meihua, horary, conflict, weights) => {
    let body = '';
    const mIsPos = meihua && meihua.totalLevel > 0;
    if (isEN) {
      if (mIsPos) {
        body += `The two systems see this from different angles. `;
        body += `Your personal conditions look good — `;
        if (meihua.tiYongRelKey === 'bihe') body += `your energy aligns well with the situation. `;
        else if (meihua.tiYongRelKey === 'yongShengTi') body += `the environment naturally supports you. `;
        else if (meihua.tiYongRelKey === 'tiKeYong') body += `you have the ability to make this happen. `;
        else body += `the hexagram reading is positive. `;
        body += `However, the astrological timing raises concerns: `;
        if (horary.moonAna?.isVOC) body += `energy is currently stagnant. `;
        else if (horary.prohibition) body += `external interference may block progress. `;
        else if (horary.refranation) body += `a key factor may suddenly reverse. `;
        else if (horary.sigAspect && !horary.sigAspect.applying) body += `the window of opportunity is narrowing. `;
        else body += `external conditions are not yet aligned. `;
        body += `\n\nSuggestion: Your internal strengths are solid (hexagram), but external timing needs work (astrology). Prepare thoroughly, then act when conditions shift.`;
        if (horary.timing) {
          const u = horary.timing.unit === 'days' ? 'days' : horary.timing.unit === 'weeks' ? 'weeks' : 'months';
          body += ` Watch for changes in roughly ${horary.timing.value} ${u}.`;
        }
      } else {
        body += `The two systems tell different stories. `;
        body += `The astrological timing is favorable — `;
        if (horary.sigAspect && horary.sigAspect.applying && horary.sigAspect.aspect.nature === 'harmonious') body += `you and your goal are naturally converging. `;
        else body += `external conditions support progress. `;
        body += `But the hexagram signals internal weakness: `;
        if (meihua.tiYongRelKey === 'yongKeTi') body += `external pressures outweigh your current capacity. `;
        else if (meihua.tiYongRelKey === 'tiShengYong') body += `you may be overextending yourself. `;
        else body += `your personal conditions need strengthening. `;
        body += `\n\nSuggestion: The timing window is there (astrology), but shore up your weaknesses first (hexagram). Seek allies or strengthen your position before committing fully.`;
      }
    } else {
      if (mIsPos) {
        body += `两套系统从不同角度审视此事，看法有分歧。`;
        body += `从卦象来看，你自身条件不错——`;
        if (meihua.tiYongRelKey === 'bihe') body += `体用比和，你和事情的能量很匹配。`;
        else if (meihua.tiYongRelKey === 'yongShengTi') body += `外部自然助力你，不太需要费力。`;
        else if (meihua.tiYongRelKey === 'tiKeYong') body += `你有能力拿下这件事。`;
        else body += `卦象整体看好。`;
        body += `但星象方面有顾虑：`;
        if (horary.moonAna?.isVOC) body += `目前能量停滞，使劲也推不动。`;
        else if (horary.prohibition) body += `有外部因素可能中途干扰。`;
        else if (horary.refranation) body += `关键因素可能突然反转。`;
        else if (horary.sigAspect && !horary.sigAspect.applying) body += `机会窗口正在收窄。`;
        else body += `外部时机尚未成熟。`;
        body += `\n\n建议：你自身条件不错（梅花），但外部时机尚未成熟（星象）。先做好充分准备，等时机到了再行动。`;
        if (horary.timing) {
          const u = horary.timing.unit === 'days' ? '天' : horary.timing.unit === 'weeks' ? '周' : '个月';
          body += `留意大约${horary.timing.value}${u}后的变化。`;
        }
      } else {
        body += `两套系统给出了不同的信号。`;
        body += `星象时机不错——`;
        if (horary.sigAspect && horary.sigAspect.applying && horary.sigAspect.aspect.nature === 'harmonious') body += `你和目标正在自然靠近。`;
        else body += `外部条件支持你前进。`;
        body += `但卦象显示自身准备不足：`;
        if (meihua.tiYongRelKey === 'yongKeTi') body += `外部压力超过你目前的承受能力。`;
        else if (meihua.tiYongRelKey === 'tiShengYong') body += `你可能在这件事上付出过多、回报过少。`;
        else body += `你的内在条件需要加强。`;
        body += `\n\n建议：星象时机不错，但卦象显示自身准备不足。趁窗口期还在，抓紧补强自身，或找盟友借力。`;
      }
    }
    return body;
  };

  // === 叙事构建：时间分歧 ===
  const _buildTimingNarrative = (isEN, meihua, horary, conflict, weights) => {
    const shorter = conflict.synthesisHint === 'horary_sooner' ? 'horary' : 'meihua';
    const mM = Math.round(conflict.mMonths), hM = Math.round(conflict.hMonths);
    let body = '';
    if (isEN) {
      body += `Both systems agree on the general direction, but they differ on timing. `;
      if (shorter === 'horary') {
        body += `Astrologically, things could develop in about ${hM} month(s), while the hexagram suggests a longer cycle of around ${mM} month(s). `;
        body += `\n\nThis likely means: initial progress may come quickly, but full resolution takes longer. `;
      } else {
        body += `The hexagram suggests things could move within ${mM} month(s), while astrology points to a longer timeline of about ${hM} month(s). `;
        body += `\n\nYour personal readiness may come first, but external conditions take longer to align. `;
      }
      body += `Plan for the shorter window but be prepared for the longer one.`;
    } else {
      body += `两套系统方向一致，但时间窗口不同。`;
      if (shorter === 'horary') {
        body += `星象显示大约${hM}个月内可能有进展，而卦象指向更长的周期，约${mM}个月。`;
        body += `\n\n这意味着：短期内可能有初步进展，但完全落实需要更长时间。`;
      } else {
        body += `卦象显示约${mM}个月内可行，但星象指向更长的周期，约${hM}个月。`;
        body += `\n\n你个人的准备可能先到位，但外部条件需要更长时间才能配合。`;
      }
      body += `按短期窗口做准备，但心理上做好长线打算。`;
    }
    return body;
  };

  // === 叙事构建：条件分歧 ===
  const _buildConditionNarrative = (isEN, meihua, horary, conflict, weights) => {
    let body = '';
    if (isEN) {
      body += `Both systems point in the same direction, but each highlights different conditions. `;
      if (meihua) {
        if (meihua.bianGuaRelKey === 'shengTi') body += `The hexagram shows things improving over time — the trend is your ally. `;
        else if (meihua.bianGuaRelKey === 'keTi') body += `The hexagram warns of a late-stage reversal — don't let your guard down after initial success. `;
        if (meihua.tiYongRelKey === 'bihe') body += `Your energy matches the situation well. `;
        else if (meihua.tiYongRelKey === 'yongShengTi') body += `External support is strong. `;
        else if (meihua.tiYongRelKey === 'tiKeYong') body += `You can dominate this, but it takes sustained effort. `;
      }
      if (horary) {
        if (horary.prohibition) body += `Astrologically, watch out for third-party interference that could derail progress. `;
        if (horary.refranation) body += `A key factor may reverse unexpectedly — have a backup plan. `;
        if (horary.frustration) body += `The process could get sidetracked midway — stay focused. `;
        if (horary.mutualReceptions?.length > 0) body += `Finding allies will be especially valuable. `;
      }
      body += `\n\nSuggestion: The direction is clear, but success depends on navigating these specific conditions. Address both the hexagram's guidance and the astrological cautions.`;
    } else {
      body += `两套系统方向一致，但各自提出了不同的注意事项。`;
      if (meihua) {
        if (meihua.bianGuaRelKey === 'shengTi') body += `卦象显示事情有越来越好的趋势，时间是你的朋友。`;
        else if (meihua.bianGuaRelKey === 'keTi') body += `卦象提醒：后期可能生变，初期顺利不要放松警惕。`;
        if (meihua.tiYongRelKey === 'bihe') body += `你和事情的能量匹配度好。`;
        else if (meihua.tiYongRelKey === 'yongShengTi') body += `外部助力不错。`;
        else if (meihua.tiYongRelKey === 'tiKeYong') body += `你能主导局面，但需要持续用力。`;
      }
      if (horary) {
        if (horary.prohibition) body += `星象方面，要警惕第三方干扰，可能有人或事中途搅局。`;
        if (horary.refranation) body += `关键因素可能突然反转，建议准备备选方案。`;
        if (horary.frustration) body += `过程中可能被意外打断，保持专注。`;
        if (horary.mutualReceptions?.length > 0) body += `寻找合作伙伴会特别有价值。`;
      }
      body += `\n\n建议：大方向是明确的，但成败取决于如何应对这些具体条件。卦象和星象各自的提醒都值得留意。`;
    }
    return body;
  };

  // === 叙事构建：程度分歧 ===
  const _buildDegreeNarrative = (isEN, meihua, horary, conflict, weights) => {
    const stronger = conflict.synthesisHint === 'meihua_stronger' ? 'meihua' : 'horary';
    const sConf = stronger === 'meihua' ? weights.mConf : weights.hConf;
    let body = '';
    if (isEN) {
      body += `Both systems agree on the direction, but with different intensity. `;
      if (stronger === 'meihua') {
        body += `The hexagram gives a strong signal${sConf === 'high' ? ' (high confidence)' : ''}, while the stars are more moderate. `;
      } else {
        body += `The astrological picture is clear${sConf === 'high' ? ' (high confidence)' : ''}, while the hexagram is more reserved. `;
      }
      // Add meihua + horary details briefly
      if (meihua) {
        if (meihua.tiYongRelKey === 'yongShengTi') body += `The hexagram shows natural support from outside. `;
        else if (meihua.tiYongRelKey === 'tiKeYong') body += `You have the upper hand per the hexagram. `;
        else if (meihua.tiYongRelKey === 'yongKeTi') body += `The hexagram warns of resistance. `;
      }
      if (horary && horary.sigAspect && horary.sigAspect.applying) {
        const n = horary.sigAspect.aspect.nature;
        if (n === 'harmonious') body += `Stars show a smooth connection forming. `;
        else if (n === 'tense') body += `Stars show progress with friction. `;
      }
      body += `\n\nOverall, lean toward the ${stronger === 'meihua' ? 'hexagram' : 'astrological'} reading for confidence level.`;
    } else {
      body += `两套系统方向一致，但强度不同。`;
      if (stronger === 'meihua') {
        body += `卦象给出了较强的信号${sConf === 'high' ? '（置信度高）' : ''}，星象相对温和。`;
      } else {
        body += `星象的信号更明确${sConf === 'high' ? '（置信度高）' : ''}，卦象相对保守。`;
      }
      if (meihua) {
        if (meihua.tiYongRelKey === 'yongShengTi') body += `卦象显示外部自然助力。`;
        else if (meihua.tiYongRelKey === 'tiKeYong') body += `卦象显示你占优势。`;
        else if (meihua.tiYongRelKey === 'yongKeTi') body += `卦象提示有阻力。`;
      }
      if (horary && horary.sigAspect && horary.sigAspect.applying) {
        const n = horary.sigAspect.aspect.nature;
        if (n === 'harmonious') body += `星象显示顺畅的连接正在形成。`;
        else if (n === 'tense') body += `星象显示有进展但伴随摩擦。`;
      }
      body += `\n\n综合来看，以${stronger === 'meihua' ? '卦象' : '星象'}的判断为主要参考。`;
    }
    return body;
  };

  // === 叙事构建：一致/单系统（复用原有逻辑）===
  const _buildAgreementNarrative = (isEN, meihua, horary, effectiveCombined, weights) => {
    const mScore = meihua ? meihua.totalLevel : 0;
    const hScore = horary ? horary.score : 0;
    const bothGood = mScore > 0 && hScore > 0;
    const bothBad = mScore < 0 && hScore < 0;
    let body = '';
    if (isEN) {
      if (bothGood) body += `Both traditional and astrological analysis agree — the signs are positive. `;
      else if (bothBad) body += `Both systems suggest this won't be smooth sailing. `;
      else if (horary) body += `The two analyses give mixed signals, so the situation has layers worth examining. `;
      if (meihua) {
        if (meihua.tiYongRelKey === 'bihe') body += `From the hexagram perspective, your energy aligns well with the situation — you're in a natural position of strength. `;
        else if (meihua.tiYongRelKey === 'yongShengTi') body += `The situation naturally supports and benefits you — outside conditions are working in your favor. `;
        else if (meihua.tiYongRelKey === 'tiKeYong') body += `You have the upper hand over the situation, but it requires your active effort to seize it. `;
        else if (meihua.tiYongRelKey === 'tiShengYong') body += `You're putting in more than you're getting back — be careful not to overextend yourself. `;
        else if (meihua.tiYongRelKey === 'yongKeTi') body += `External forces are working against you — the environment is unfavorable and you may face strong resistance. `;
        if (meihua.bianGuaRelKey === 'shengTi') body += `The good news is that things are trending better over time. `;
        else if (meihua.bianGuaRelKey === 'keTi') body += `However, watch out — the trend may shift against you later. `;
      }
      if (horary) {
        if (horary.sigAspect && horary.sigAspect.applying) {
          const n = horary.sigAspect.aspect.nature;
          if (n === 'harmonious') body += `Star patterns show you and your goal are moving toward each other smoothly — a natural fit. `;
          else if (n === 'tense') body += `The stars show a connection forming, but it comes with friction — expect some struggle before results. `;
          else body += `The stars indicate a direct encounter between you and the matter — things are converging. `;
        } else if (horary.sigAspect) {
          body += `Astrologically, the connection between you and the goal is fading — the best window may be closing. `;
        } else {
          if (horary.translation) body += `There's no direct path, but someone or something can bridge the gap for you. `;
          else if (horary.collection) body += `You can't reach the goal alone, but a powerful third party could bring it together. `;
          else body += `The stars don't show a clear path to the goal right now — you may need a new approach or catalyst. `;
        }
        if (horary.moonAna?.isVOC) body += `Right now energy is stagnant — pushing hard won't help. Wait for things to shift naturally. `;
        if (horary.prohibition) body += `Be aware that something or someone may interfere with your plans. `;
        if (horary.mutualReceptions?.length > 0) body += `Cooperation and finding allies will be especially helpful here. `;
        if (horary.timing) {
          const u = horary.timing.unit === 'days' ? 'days' : horary.timing.unit === 'weeks' ? 'weeks' : 'months';
          body += `Expected timeframe: roughly ${horary.timing.value} ${u}. `;
        }
      }
      if (effectiveCombined > 0.15) body += `Overall, the outlook is positive — trust the process and take action when ready.`;
      else if (effectiveCombined > -0.15) body += `Overall, things could go either way. Stay alert, prepare well, and don't rush.`;
      else body += `Overall, this isn't the best time. Consider waiting, adjusting your plan, or exploring other options.`;
    } else {
      if (bothGood) body += `两套分析都指向好的结果，整体形势对你有利。`;
      else if (bothBad) body += `两套分析结果都不太乐观，这件事目前难度较大。`;
      else if (horary) body += `两套分析给出了不同的信号，说明事情有好有坏，需要仔细权衡。`;
      if (meihua) {
        if (meihua.tiYongRelKey === 'bihe') body += `从卦象来看，你和这件事的能量很匹配，你处于一个天然有利的位置。`;
        else if (meihua.tiYongRelKey === 'yongShengTi') body += `外部环境在帮你，你不需要太费力就能得到支持和助力。`;
        else if (meihua.tiYongRelKey === 'tiKeYong') body += `你在这件事上占主导，但需要你主动出击、积极争取才能拿下。`;
        else if (meihua.tiYongRelKey === 'tiShengYong') body += `你在这件事上付出多、回报少，小心消耗过大。`;
        else if (meihua.tiYongRelKey === 'yongKeTi') body += `外部压力比较大，环境对你不太友好，可能会遇到明显的阻力。`;
        if (meihua.bianGuaRelKey === 'shengTi') body += `好在事情有越来越好的趋势。`;
        else if (meihua.bianGuaRelKey === 'keTi') body += `但要注意，后面的走势可能会变差。`;
      }
      if (horary) {
        if (horary.sigAspect && horary.sigAspect.applying) {
          const n = horary.sigAspect.aspect.nature;
          if (n === 'harmonious') body += `从星象来看，你和你想要的东西正在自然靠近，是一种比较顺畅的连接。`;
          else if (n === 'tense') body += `星象显示你和目标之间有联系，但过程中免不了一些摩擦和压力。`;
          else body += `星象显示你和这件事正在直接碰撞，事情正在发生。`;
        } else if (horary.sigAspect) {
          body += `星象上看，你和目标的连接正在变弱，最好的窗口期可能在收窄。`;
        } else {
          if (horary.translation) body += `你和目标之间目前没有直接的路，但有中间人或机会可以帮你搭桥。`;
          else if (horary.collection) body += `靠自己很难直达目标，但如果有贵人或权威人士出手，事情有可能成。`;
          else body += `星象上暂时看不到你和目标之间的明确通道，可能需要换个思路或等待新的契机。`;
        }
        if (horary.moonAna?.isVOC) body += `现在是一个"空转"期，使劲推也推不动，不如等能量重新流动起来。`;
        if (horary.prohibition) body += `要留意，可能有人或事会中途插进来打乱你的计划。`;
        if (horary.mutualReceptions?.length > 0) body += `找到合作伙伴会特别有帮助，互相借力效果更好。`;
        if (horary.timing) {
          const u = horary.timing.unit === 'days' ? '天' : horary.timing.unit === 'weeks' ? '周' : '个月';
          body += `预计时间大约${horary.timing.value}${u}左右。`;
        }
      }
      if (effectiveCombined > 0.15) body += `总的来说，形势不错。做好准备，该出手时就出手。`;
      else if (effectiveCombined > -0.15) body += `总的来说，好坏参半。不要着急，做足功课，稳步推进。`;
      else body += `总的来说，现在不是最佳时机。建议等一等，或者调整方向再试。`;
    }
    return body;
  };

  // === 综合解读：融合梅花+占星（辩证综合版） ===
  const generateCombinedReading = (meihua, horary) => {
    const isEN = lang === 'en';
    const mScore = meihua ? meihua.totalLevel : 0;
    const hScore = horary ? horary.score : 0;

    // 动态权重
    const qType = horary ? horary.qType : 'general';
    const weights = _getDynamicWeights(qType, meihua, horary);

    // 加权综合分（归一化到 -1..+1）
    const mNorm = mScore / 4;
    const hNorm = hScore / 10;
    const rawCombined = (meihua ? mNorm * weights.m : 0) + (horary ? hNorm * weights.h : 0);
    const combined = (!meihua || !horary) ? rawCombined * 2 : rawCombined;

    // 冲突分类
    const conflict = _classifyConflict(meihua, horary);

    // 综合标题
    let headline, fortuneKey;
    if (conflict.type === 'direction') {
      if (combined > 0) { headline = isEN ? 'Conditionally Favorable — Address the Gaps' : '有条件地可行——需补短板'; }
      else { headline = isEN ? 'Mixed Signals — Weigh Internal vs External' : '内外信号不一——需权衡利弊'; }
      fortuneKey = 'neutral';
    } else {
      if (combined > 0.4) { headline = isEN ? 'Very Favorable — Go for It' : '大吉，可放心行动'; fortuneKey = 'great'; }
      else if (combined > 0.15) { headline = isEN ? 'Favorable — Timing Is Right' : '此事可成，宜把握时机'; fortuneKey = 'good'; }
      else if (combined > -0.15) { headline = isEN ? 'Uncertain — Patience Advised' : '尚待观察，静观其变'; fortuneKey = 'neutral'; }
      else if (combined > -0.4) { headline = isEN ? 'Caution Advised — Prepare More' : '需谨慎，多做准备'; fortuneKey = 'effort'; }
      else { headline = isEN ? 'Unfavorable — Consider Alternatives' : '不太有利，建议另寻出路'; fortuneKey = 'bad'; }
    }

    // 根据冲突类型选择叙事
    let body;
    if (conflict.type === 'direction') body = _buildDirectionNarrative(isEN, meihua, horary, conflict, weights);
    else if (conflict.type === 'timing') body = _buildTimingNarrative(isEN, meihua, horary, conflict, weights);
    else if (conflict.type === 'condition') body = _buildConditionNarrative(isEN, meihua, horary, conflict, weights);
    else if (conflict.type === 'degree') body = _buildDegreeNarrative(isEN, meihua, horary, conflict, weights);
    else body = _buildAgreementNarrative(isEN, meihua, horary, combined, weights);

    // === 直接回答：针对用户的具体问题给出明确答案 ===
    const _buildDirectAnswer = () => {
      const q = result?.question || '';
      if (!q.trim()) return null;

      // 检测问题子类型
      const isChoice = /选|还是|或者|哪个|哪种|哪一|A还是B|该.*还是|or |which|choose|pick|prefer/i.test(q);
      const isTiming = /什么时候|几月|何时|多久|多长时间|几天|when|how long|how soon|what time/i.test(q);
      const isAmount = /多少|赚多少|涨多少|亏多少|收益|回报率|how much|how many|how big|salary|pay/i.test(q);
      const isYesNo = /能不能|会不会|能否|是否|可以吗|行吗|行不行|好不好|成不成|值不值|should|can i|will i|is it|do i/i.test(q);
      const isDirection = /去哪|方向|方位|在哪|哪里|where|direction/i.test(q);
      const isPerson = /这个人|他\/她|对方|对象|人品|靠谱|this person|their character|trustworthy/i.test(q);

      const level = combined;  // -1..+1 normalized
      const mTL = meihua ? meihua.totalLevel : 0;
      const tiRel = meihua?.tiYongRelKey || '';

      // 八卦属性映射：描述特质
      const guaTraits = {
        '乾': { zh: '刚健、果断、高端', en: 'strong, decisive, premium' },
        '兑': { zh: '愉悦、社交、灵活', en: 'joyful, social, flexible' },
        '离': { zh: '光明、热情、高调', en: 'visible, passionate, prominent' },
        '震': { zh: '迅速、行动、变化', en: 'fast-moving, action-oriented, dynamic' },
        '巽': { zh: '柔和、渐进、稳健', en: 'gentle, gradual, steady' },
        '坎': { zh: '深层、隐蔽、有风险', en: 'deep, hidden, risky' },
        '艮': { zh: '稳定、踏实、保守', en: 'stable, grounded, conservative' },
        '坤': { zh: '包容、支持、大众', en: 'inclusive, supportive, mainstream' },
      };
      const tiName = result?.ti?.name || '';
      const yongName = result?.yong?.name || '';
      const tiTrait = guaTraits[tiName] || { zh: '', en: '' };
      const yongTrait = guaTraits[yongName] || { zh: '', en: '' };

      // 应期数据
      const mMonths = meihua?.yingqi?.months || 0;
      const bestSeason = meihua?.yingqi?.bestSeason || '';
      const hTiming = horary?.timing;

      let answer = null;

      if (isChoice) {
        // === 选择题：告诉用户选哪类 ===
        let choiceAdvice;
        if (isEN) {
          if (tiRel === 'bihe') choiceAdvice = `Either option works — go with your gut. Both paths have similar energy.`;
          else if (tiRel === 'yongShengTi') choiceAdvice = `Choose the option that offers more external support or resources. The one that "comes to you" rather than you having to chase.`;
          else if (tiRel === 'tiKeYong') choiceAdvice = `Choose the option where you have more control and initiative. The one you can actively shape.`;
          else if (tiRel === 'tiShengYong') choiceAdvice = `Choose the option that requires less investment and effort from you. Avoid the one that drains your resources.`;
          else if (tiRel === 'yongKeTi') choiceAdvice = `Choose the safer, more defensive option. Avoid the one with strong external competition or pressure.`;
          else choiceAdvice = `Look for the option that best matches your current strengths.`;
          // 加八卦特质提示
          if (tiTrait.en && yongTrait.en) {
            choiceAdvice += `\nYour energy is ${tiTrait.en}. The situation calls for something ${yongTrait.en}. Favor the option closer to your nature.`;
          }
        } else {
          if (tiRel === 'bihe') choiceAdvice = `两个选项能量接近，都可以，凭直觉选就好。`;
          else if (tiRel === 'yongShengTi') choiceAdvice = `选那个能给你更多支持和资源的。选"主动来找你"的那个，而不是你去追的那个。`;
          else if (tiRel === 'tiKeYong') choiceAdvice = `选你更能掌控、更能主导的那个。选你可以主动塑造的那个。`;
          else if (tiRel === 'tiShengYong') choiceAdvice = `选投入更少、消耗更小的那个。避开需要你大量付出的选项。`;
          else if (tiRel === 'yongKeTi') choiceAdvice = `选更稳妥、更保守的那个。避开竞争激烈或外部压力大的选项。`;
          else choiceAdvice = `选更符合你当下状态的那个。`;
          if (tiTrait.zh && yongTrait.zh) {
            choiceAdvice += `\n你的能量特质是"${tiTrait.zh}"，事情需要"${yongTrait.zh}"的特质。选更贴近你本性的那个。`;
          }
        }
        answer = { type: 'choice', text: choiceAdvice };

      } else if (isTiming) {
        // === 时间题：给出具体时间窗口 ===
        let timingText;
        const now = new Date();
        const curMonth = now.getMonth() + 1;
        if (isEN) {
          const parts = [];
          if (mMonths > 0) {
            const targetMonth = ((curMonth - 1 + Math.round(mMonths)) % 12) + 1;
            const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            parts.push(`Hexagram timing: around ${monthNames[targetMonth]} (in ~${Math.round(mMonths)} months)`);
          }
          if (hTiming) {
            const u = hTiming.unit === 'days' ? 'days' : hTiming.unit === 'weeks' ? 'weeks' : 'months';
            parts.push(`Astrological timing: ~${hTiming.value} ${u}`);
          }
          if (bestSeason) parts.push(`Best season: ${bestSeason}`);
          if (meihua?.yingqi?.avoidSeason) parts.push(`Avoid: ${meihua.yingqi.avoidSeason}`);
          if (parts.length === 0) parts.push(`No clear timing signal — stay alert for opportunities.`);
          timingText = parts.join('\n');
        } else {
          const parts = [];
          if (mMonths > 0) {
            const targetMonth = ((curMonth - 1 + Math.round(mMonths)) % 12) + 1;
            parts.push(`卦象应期：约${Math.round(mMonths)}个月后（${targetMonth}月前后）`);
          }
          if (hTiming) {
            const u = hTiming.unit === 'days' ? '天' : hTiming.unit === 'weeks' ? '周' : '个月';
            parts.push(`星象应期：约${hTiming.value}${u}`);
          }
          if (bestSeason) parts.push(`最佳时段：${bestSeason}`);
          if (meihua?.yingqi?.avoidSeason) parts.push(`不利时段：${meihua.yingqi.avoidSeason}`);
          if (parts.length === 0) parts.push(`暂无明确时间信号，保持关注。`);
          timingText = parts.join('\n');
        }
        answer = { type: 'timing', text: timingText };

      } else if (isAmount) {
        // === 数量/金额题：给出定性范围 ===
        let amtText;
        if (isEN) {
          if (mTL >= 3) amtText = `Strong returns expected. The reading is very positive — above your expectations.`;
          else if (mTL >= 1 && tiRel === 'yongShengTi') amtText = `Moderate to good returns. External factors work in your favor — expect a decent outcome.`;
          else if (mTL >= 1 && tiRel === 'tiKeYong') amtText = `Moderate returns, but you'll have to work for it. The gain matches your effort.`;
          else if (mTL === 0) amtText = `Break-even territory. Don't expect significant gains or losses — manage your expectations.`;
          else if (mTL >= -2 && tiRel === 'tiShengYong') amtText = `Likely a net loss. You'll invest more than you recover — cut your exposure.`;
          else if (mTL < -2) amtText = `High risk of significant loss. The reading strongly advises against this financial move.`;
          else amtText = `Below expectations. The returns won't match what you're hoping for.`;
          // 加变卦趋势
          if (meihua?.bianGuaRelKey === 'shengTi') amtText += `\nBut the trend improves — initial results may be modest, later ones better.`;
          else if (meihua?.bianGuaRelKey === 'keTi') amtText += `\nWarning: even if it starts well, returns may diminish over time.`;
        } else {
          if (mTL >= 3) amtText = `收益预期很好。卦象非常积极——可能超出你的预期。`;
          else if (mTL >= 1 && tiRel === 'yongShengTi') amtText = `收益中等偏好。外部因素帮你——回报不错。`;
          else if (mTL >= 1 && tiRel === 'tiKeYong') amtText = `收益中等，但要靠自己争取。一分耕耘一分收获。`;
          else if (mTL === 0) amtText = `基本持平。别期望太高，也不会亏太多。`;
          else if (mTL >= -2 && tiRel === 'tiShengYong') amtText = `大概率净亏。投入会大于回报——建议控制仓位。`;
          else if (mTL < -2) amtText = `亏损风险很大。卦象强烈不建议这笔投入。`;
          else amtText = `低于预期。回报达不到你期望的水平。`;
          if (meihua?.bianGuaRelKey === 'shengTi') amtText += `\n但趋势在变好——初期一般，后面会改善。`;
          else if (meihua?.bianGuaRelKey === 'keTi') amtText += `\n注意：即使开始不错，后期收益可能下滑。`;
        }
        answer = { type: 'amount', text: amtText };

      } else if (isPerson) {
        // === 人物题：基于用卦特质描述对方 ===
        let personText;
        if (isEN) {
          personText = yongTrait.en ? `This person's energy is ${yongTrait.en}.` : `Hard to read this person clearly.`;
          if (tiRel === 'yongShengTi') personText += ` They are supportive and beneficial to you.`;
          else if (tiRel === 'yongKeTi') personText += ` They may bring pressure or conflict — be cautious.`;
          else if (tiRel === 'bihe') personText += ` You two are compatible — similar energy.`;
          else if (tiRel === 'tiKeYong') personText += ` You have the upper hand in this dynamic.`;
          else if (tiRel === 'tiShengYong') personText += ` You tend to give more in this relationship.`;
        } else {
          personText = yongTrait.zh ? `这个人的能量特质：${yongTrait.zh}。` : `此人特质不太明显。`;
          if (tiRel === 'yongShengTi') personText += `对你有帮助，是助力型的人。`;
          else if (tiRel === 'yongKeTi') personText += `可能给你带来压力或冲突，需要小心。`;
          else if (tiRel === 'bihe') personText += `你们比较合拍，能量相近。`;
          else if (tiRel === 'tiKeYong') personText += `你在这段关系中占主导地位。`;
          else if (tiRel === 'tiShengYong') personText += `你在这段关系中付出更多。`;
        }
        answer = { type: 'person', text: personText };

      } else if (isDirection) {
        // === 方位题：八卦方位映射 ===
        const guaDir = { '乾': { zh: '西北方', en: 'northwest' }, '兑': { zh: '西方', en: 'west' }, '离': { zh: '南方', en: 'south' }, '震': { zh: '东方', en: 'east' }, '巽': { zh: '东南方', en: 'southeast' }, '坎': { zh: '北方', en: 'north' }, '艮': { zh: '东北方', en: 'northeast' }, '坤': { zh: '西南方', en: 'southwest' } };
        const yDir = guaDir[yongName] || { zh: '不确定', en: 'unclear' };
        answer = { type: 'direction', text: isEN ? `Direction indicated: ${yDir.en}. Look in this direction or area.` : `卦象指向：${yDir.zh}。往这个方位找或关注这个方向。` };

      } else if (isYesNo) {
        // === 是非题：明确回答能/不能 ===
        let ynText;
        if (isEN) {
          if (level > 0.3) ynText = `Yes — conditions are strongly in your favor.`;
          else if (level > 0.1) ynText = `Likely yes, but it requires effort and the right timing.`;
          else if (level > -0.1) ynText = `Uncertain. It could go either way — prepare for both outcomes.`;
          else if (level > -0.3) ynText = `Unlikely under current conditions. Consider adjusting your approach.`;
          else ynText = `No — the reading advises against it at this time.`;
        } else {
          if (level > 0.3) ynText = `能。条件很有利，放心去做。`;
          else if (level > 0.1) ynText = `大概率能，但需要努力和合适的时机。`;
          else if (level > -0.1) ynText = `不好说。可能成也可能不成——做好两手准备。`;
          else if (level > -0.3) ynText = `目前条件下比较难。建议调整方式再试。`;
          else ynText = `不能。卦象和星象都不建议现在做这件事。`;
        }
        answer = { type: 'yesno', text: ynText };
      }

      return answer;
    };

    // === 最终建议：一句话告诉用户该怎么做 ===
    const _buildVerdict = () => {
      // 确定哪个系统对这个问题更权威
      const qType = horary ? horary.qType : 'general';
      const trustSys = weights.m > weights.h ? 'meihua' : weights.h > weights.m ? 'horary' : 'both';
      const trustLabel = trustSys === 'meihua' ? (isEN ? 'hexagram' : '卦象') : trustSys === 'horary' ? (isEN ? 'astrology' : '星象') : (isEN ? 'both systems' : '两系统');
      const qTypeLabel = {
        love: isEN ? 'relationship questions' : '感情问题',
        career: isEN ? 'career questions' : '事业问题',
        money: isEN ? 'financial questions' : '财务问题',
        health: isEN ? 'health questions' : '健康问题',
        study: isEN ? 'academic questions' : '学业问题',
        travel: isEN ? 'travel questions' : '出行问题',
        legal: isEN ? 'legal questions' : '法律问题',
        find: isEN ? 'finding things' : '寻物问题',
        family: isEN ? 'family questions' : '家庭问题',
        general: isEN ? 'general questions' : '一般问题',
      }[qType] || (isEN ? 'this type of question' : '这类问题');

      // 行动指引：做/等/不做
      let action, actionIcon, reason, trustNote;

      if (conflict.type === 'agreement' || conflict.type === 'none') {
        // 两系统一致——直接听结论
        if (combined > 0.15) {
          actionIcon = '→';
          action = isEN ? 'Go ahead' : '可以行动';
          reason = isEN ? 'Both systems agree — conditions favor you.' : '两套系统意见一致，条件对你有利。';
        } else if (combined > -0.15) {
          actionIcon = '◇';
          action = isEN ? 'Wait and see' : '先观望';
          reason = isEN ? 'Both systems are lukewarm — no clear signal yet.' : '两系统都没有给出明确信号，建议再看看。';
        } else {
          actionIcon = '×';
          action = isEN ? 'Hold off' : '暂时不要动';
          reason = isEN ? 'Both systems advise against acting now.' : '两套系统都不看好，目前不宜行动。';
        }
        trustNote = '';
      } else if (conflict.type === 'direction') {
        // 方向冲突——最核心的场景
        const mIsPos = meihua && meihua.totalLevel > 0;
        if (trustSys === 'meihua' && mIsPos) {
          actionIcon = '→';
          action = isEN ? 'Prepare, then go' : '先准备，再行动';
          reason = isEN
            ? `For ${qTypeLabel}, the hexagram (your inner condition) matters most — and it looks good. But address the timing concerns from astrology first.`
            : `对于${qTypeLabel}，卦象（你的内在条件）更关键——目前看好。但星象提示的时机问题也要留意，建议做好准备再出手。`;
        } else if (trustSys === 'meihua' && !mIsPos) {
          actionIcon = '×';
          action = isEN ? 'Not yet — strengthen yourself first' : '先不急——先提升自己';
          reason = isEN
            ? `For ${qTypeLabel}, the hexagram (your inner condition) matters most — and it's not strong enough yet. Even though timing is okay, shore up your foundation first.`
            : `对于${qTypeLabel}，卦象（你的内在条件）更关键——目前还不够强。虽然星象时机尚可，但建议先补强自身再说。`;
        } else if (trustSys === 'horary' && mIsPos) {
          actionIcon = '◇';
          action = isEN ? 'You\'re ready, but wait for the right moment' : '你准备好了，但要等时机';
          reason = isEN
            ? `For ${qTypeLabel}, astrology (external timing) matters most — and it's not ideal yet. Your personal conditions are fine, so stay ready and watch for the window.`
            : `对于${qTypeLabel}，星象（外部时机）更关键——目前时机还不到。你自身条件不错，保持准备状态，等窗口出现就出手。`;
        } else {
          actionIcon = '×';
          action = isEN ? 'Hold off — rethink your approach' : '暂缓——换个思路';
          reason = isEN
            ? `For ${qTypeLabel}, astrology (external timing) matters most — and conditions are favorable. But your hexagram shows internal weakness, so the opportunity may not suit you right now.`
            : `对于${qTypeLabel}，星象（外部时机）更关键——外部条件不错。但卦象显示你内在条件不足，这个机会目前可能抓不住，建议调整策略。`;
        }
        trustNote = isEN
          ? `Why trust ${trustLabel}? For ${qTypeLabel}, ${trustSys === 'meihua' ? 'personal readiness and compatibility' : 'external timing and third-party factors'} are the deciding factor.`
          : `为什么更信${trustLabel}？因为${qTypeLabel}中，${trustSys === 'meihua' ? '个人状态和匹配度' : '外部时机和第三方因素'}是决定性的。`;
      } else if (conflict.type === 'timing') {
        actionIcon = '→';
        action = isEN ? 'Start now, plan for the long game' : '现在就开始，但做好长期打算';
        const shorter = conflict.synthesisHint === 'horary_sooner' ? (isEN ? 'astrology' : '星象') : (isEN ? 'hexagram' : '卦象');
        reason = isEN
          ? `Both systems agree on the direction. ${shorter} suggests earlier results — start with that timeline, but prepare for the full cycle.`
          : `两系统方向一致。${shorter}指向更早的时间——按这个节奏开始行动，但心理上做好完整周期的准备。`;
        trustNote = '';
      } else if (conflict.type === 'condition') {
        actionIcon = combined > 0 ? '→' : '◇';
        action = combined > 0
          ? (isEN ? 'Go ahead, but watch for these pitfalls' : '可以推进，但注意这些坑')
          : (isEN ? 'Proceed with caution' : '谨慎推进');
        reason = isEN
          ? 'Both systems point the same way but flag different risks. Address both — the hexagram\'s trend warning AND the astrology\'s interference alert.'
          : '两系统方向一致但各自发现了不同风险。卦象的趋势提醒和星象的干扰预警都要应对。';
        trustNote = '';
      } else if (conflict.type === 'degree') {
        const strongerLabel = conflict.synthesisHint === 'meihua_stronger' ? (isEN ? 'hexagram' : '卦象') : (isEN ? 'astrology' : '星象');
        if (combined > 0.15) {
          actionIcon = '→';
          action = isEN ? 'Go for it' : '可以行动';
        } else if (combined > -0.15) {
          actionIcon = '◇';
          action = isEN ? 'Cautiously optimistic' : '谨慎乐观';
        } else {
          actionIcon = '×';
          action = isEN ? 'Hold off' : '暂时不动';
        }
        reason = isEN
          ? `Both systems agree, but the ${strongerLabel} is more confident. Follow its lead.`
          : `两系统方向一致，但${strongerLabel}的信号更强。以它为主要参考。`;
        trustNote = '';
      } else {
        actionIcon = '◇';
        action = isEN ? 'Use your own judgment' : '结合自身情况判断';
        reason = isEN ? 'Only one system provided data.' : '只有一套系统给出了数据。';
        trustNote = '';
      }

      return { action, actionIcon, reason, trustNote, trustSys, trustLabel, qTypeLabel };
    };

    const verdict = _buildVerdict();
    const directAnswer = _buildDirectAnswer();

    return { headline, body, fortuneKey, combined, conflict, weights, verdict, directAnswer };
  };

  const Yao = ({ l, hl }) => (
    <div style={{ display: 'flex', justifyContent: 'center', gap: l === 1 ? 0 : '8px', marginBottom: '6px' }}>
      {l === 1 ? <div style={{ width: '48px', height: '6px', background: hl ? '#fff' : 'rgba(255,255,255,0.7)', borderRadius: '3px', boxShadow: hl ? '0 0 6px rgba(255,255,255,0.8)' : 'none' }} />
        : <><div style={{ width: '20px', height: '6px', background: hl ? '#fff' : 'rgba(255,255,255,0.7)', borderRadius: '3px' }} /><div style={{ width: '20px', height: '6px', background: hl ? '#fff' : 'rgba(255,255,255,0.7)', borderRadius: '3px' }} /></>}
    </div>
  );

  // iOS风格配色
  const theme = {
    primary: '#1d1d1f',
    bg: '#f2f2f7',
    cardBg: '#ffffff',
    textPrimary: '#1d1d1f',
    textSecondary: '#3c3c43',
    textTertiary: '#8e8e93',
    border: 'rgba(0,0,0,0.04)',
    success: '#34c759',  // 吉
    danger: '#ff3b30',   // 凶
  };
  
  // 五行颜色
  const wuxingColors = {
    '金': '#FFD700',  // 金色
    '木': '#228B22',  // 绿色
    '水': '#1E90FF',  // 蓝色
    '火': '#FF4500',  // 红色
    '土': '#8B4513',  // 棕色
    'Metal': '#FFD700',
    'Wood': '#228B22',
    'Water': '#1E90FF',
    'Fire': '#FF4500',
    'Earth': '#8B4513',
  };
  
  const getWuxingColor = (element) => wuxingColors[element] || theme.textPrimary;

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif', color: theme.textPrimary }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fi { animation: fadeIn 0.3s ease-out; }
        .card { background: ${theme.cardBg}; border-radius: 12px; }
        input:focus, textarea:focus { outline: none; }
        details summary { list-style: none; cursor: pointer; }
        details summary::-webkit-details-marker { display: none; }
      `}</style>
      
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px 16px' }}>

        {/* ==================== 入口页 (Landing) ==================== */}
        {mode === null && (
          <div className="fi">
            {/* 语言切换 */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
                style={{ padding: '6px 12px', background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: theme.primary }}>
                {lang === 'zh' ? 'EN' : 'ZH'}
              </button>
            </div>

            {/* 品牌标题 */}
            <div style={{ textAlign: 'center', marginBottom: '40px', marginTop: '20px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '700', letterSpacing: '1px', marginBottom: '8px' }}>{t.landingTitle}</h1>
              <p style={{ fontSize: '14px', color: theme.textTertiary }}>{t.landingSubtitle}</p>
            </div>

            {/* ===== Ask Anything 卡片 ===== */}
            <div style={{ marginBottom: '12px', background: theme.cardBg, border: expandedTile === 'ask' ? '2px solid ' + theme.primary : '1px solid rgba(0,0,0,0.06)', borderRadius: '16px', overflow: 'hidden', transition: 'all 0.2s' }}>
              <button
                onClick={() => setExpandedTile(expandedTile === 'ask' ? null : 'ask')}
                style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%', padding: '20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                <div style={{ fontSize: '32px', lineHeight: 1, flexShrink: 0 }}>✧</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '17px', fontWeight: '700', color: theme.textPrimary, marginBottom: '4px' }}>{t.askCard}</div>
                  <div style={{ fontSize: '13px', color: theme.textTertiary, lineHeight: 1.4 }}>{t.askPromo}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginTop: 4 }}>{t.askFit}</div>
                </div>
                <span style={{ fontSize: '18px', color: theme.textTertiary, flexShrink: 0, transform: expandedTile === 'ask' ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>→</span>
              </button>
              {expandedTile === 'ask' && (
                <div style={{ padding: '0 20px 20px' }}>
                  <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', marginBottom: '16px' }} />
                  <div style={{ padding: '16px', background: theme.bg, borderRadius: '12px', marginBottom: '12px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '500', color: theme.textSecondary, marginBottom: '6px', display: 'block' }}>{t.question}</label>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      {(lang === 'en'
                        ? ['Should I change jobs?', 'Will this relationship work out?', 'Is now a good time to invest?']
                        : ['我该换工作吗？', '这段感情有结果吗？', '现在是投资好时机吗？']
                      ).map(q => (
                        <button key={q} onClick={() => setQuestion(q)} style={{ padding: '4px 10px', background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '20px', fontSize: '11px', color: theme.textSecondary, cursor: 'pointer', whiteSpace: 'nowrap' }}>{q}</button>
                      ))}
                    </div>
                    <textarea
                      placeholder={t.questionPlaceholder}
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '10px', fontSize: '16px', minHeight: '80px', resize: 'none', background: theme.cardBg, color: theme.textPrimary }}
                    />
                    <p style={{ fontSize: '12px', color: theme.textTertiary, marginTop: '6px', textAlign: 'center' }}>{t.questionTip}</p>
                  </div>
                  <button
                    onClick={() => { if (question.trim()) { setMode('ask'); setAskStep('divine'); } }}
                    disabled={!question.trim()}
                    style={{
                      width: '100%', padding: '14px',
                      background: question.trim() ? theme.primary : '#d1d1d6',
                      color: '#fff', border: 'none', borderRadius: '12px',
                      fontSize: '16px', fontWeight: '600',
                      cursor: question.trim() ? 'pointer' : 'not-allowed'
                    }}
                  >
                    {t.askAction}
                  </button>
                </div>
              )}
            </div>

            {/* ===== Life Reading 卡片 ===== */}
            <div style={{ marginBottom: '12px', background: 'linear-gradient(135deg,#faf5ff,#f3f0ff)', border: expandedTile === 'life' ? '2px solid #7c3aed' : '1px solid rgba(124,58,237,0.18)', borderRadius: '16px', transition: 'all 0.2s' }}>
              <button
                onClick={() => setExpandedTile(expandedTile === 'life' ? null : 'life')}
                style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%', padding: '20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                <div style={{ fontSize: '32px', lineHeight: 1, flexShrink: 0 }}>☯</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '17px', fontWeight: '700', color: '#4c1d95' }}>{t.mingpanCard}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#7c3aed', lineHeight: 1.4 }}>{t.mingpanPromo}</div>
                  <div style={{ fontSize: '11px', color: '#7c3aed', opacity: 0.85, marginTop: 4 }}>{t.mingpanFit}</div>
                </div>
                <span style={{ fontSize: '18px', color: '#c4b5fd', flexShrink: 0, transform: expandedTile === 'life' ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>→</span>
              </button>
              {expandedTile === 'life' && (
                <div style={{ padding: '0 20px 20px' }}>
                  <div style={{ height: '1px', background: 'rgba(124,58,237,0.12)', marginBottom: '16px' }} />
                  <div style={{ padding: '16px', background: 'rgba(255,255,255,0.7)', borderRadius: '12px', marginBottom: '12px' }}>
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '500', color: '#4c1d95', display: 'block', marginBottom: '6px' }}>{t.lifeBirthday}</label>
                      <input type="date" value={lifeBirthday} onChange={e => setLifeBirthday(e.target.value)}
                        style={{ width: '100%', padding: '12px', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '10px', fontSize: '16px', background: '#fff', color: theme.textPrimary, boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '500', color: '#4c1d95', display: 'block', marginBottom: '6px' }}>{t.lifeHour}</label>
                      <select value={lifeHour} onChange={e => setLifeHour(parseInt(e.target.value))}
                        style={{ width: '100%', padding: '12px', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '10px', fontSize: '16px', background: '#fff', color: theme.textPrimary, boxSizing: 'border-box' }}>
                        {t.lifeHourNames.map((h, i) => <option key={i} value={i}>{h}</option>)}
                      </select>
                    </div>
                    {/* 出生地搜索 */}
                    <div style={{ marginBottom: '14px', position: 'relative' }} ref={lifeCityRef}>
                      <label style={{ fontSize: '13px', fontWeight: '500', color: '#4c1d95', display: 'block', marginBottom: '6px' }}>{t.lifeBirthPlace}</label>
                      {lifeBirthLoc ? (
                        <div style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', border: '2px solid #7c3aed', borderRadius: '10px', background: '#f3f0ff', fontSize: '15px', color: '#4c1d95' }}>
                          <span style={{ flex: 1 }}>{lang === 'en' ? lifeBirthLoc[1] : lifeBirthLoc[0]}</span>
                          <button onClick={() => { setLifeBirthLoc(null); setLifeCityQuery(''); }}
                            style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#999', padding: '0 4px', lineHeight: 1 }}>&times;</button>
                        </div>
                      ) : (
                        <input type="text" value={lifeCityQuery} placeholder={t.lifeCitySearch}
                          onChange={e => { setLifeCityQuery(e.target.value); setShowLifeCityDD(true); }}
                          onFocus={() => setShowLifeCityDD(true)}
                          style={{ width: '100%', padding: '12px', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '10px', fontSize: '16px', background: '#fff', color: theme.textPrimary, boxSizing: 'border-box' }} />
                      )}
                      {showLifeCityDD && !lifeBirthLoc && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, maxHeight: '220px', overflowY: 'auto', background: '#fff', border: '1px solid #e5e5e5', borderRadius: '10px', zIndex: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                          {REGION_ORDER.map(region => {
                            const cities = filterCities(lifeCityQuery, lang).filter(c => c[5] === region);
                            if (!cities.length) return null;
                            return (
                              <div key={region}>
                                <div style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 600, color: '#999', background: '#f9f9f9', borderBottom: '1px solid #f0f0f0' }}>{lang === 'en' ? REGION_LABELS[region][1] : REGION_LABELS[region][0]}</div>
                                {cities.map(c => (
                                  <div key={c[1]} onClick={() => { setLifeBirthLoc(c); setLifeCityQuery(''); setShowLifeCityDD(false); }}
                                    style={{ padding: '10px 12px', fontSize: '14px', cursor: 'pointer', borderBottom: '1px solid #f5f5f5' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#f0f4ff'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                                    {lang === 'en' ? c[1] : c[0]}
                                    {lang !== 'en' && <span style={{ fontSize: '11px', color: '#999', marginLeft: 6 }}>{c[1]}</span>}
                                    {CITY_COUNTRY[c[1]] && <span style={{ fontSize: '11px', color: '#bbb', marginLeft: 4 }}>{lang === 'en' ? CITY_COUNTRY[c[1]][1] : CITY_COUNTRY[c[1]][0]}</span>}
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                          {filterCities(lifeCityQuery, lang).length === 0 && <div style={{ padding: '12px', color: '#999', fontSize: '13px', textAlign: 'center' }}>{lang === 'en' ? 'No match' : '未找到'}</div>}
                        </div>
                      )}
                    </div>
                    <div>
                      <label style={{ fontSize: '13px', fontWeight: '500', color: '#4c1d95', display: 'block', marginBottom: '6px' }}>{t.lifeGender}</label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {['男', '女'].map(g => (
                          <button key={g} onClick={() => setLifeGender(g)}
                            style={{ flex: 1, padding: '12px', border: lifeGender === g ? '2px solid #7c3aed' : '1px solid rgba(124,58,237,0.2)', borderRadius: '10px', background: lifeGender === g ? '#f3f0ff' : '#fff', fontSize: '15px', fontWeight: lifeGender === g ? 600 : 400, cursor: 'pointer', color: '#4c1d95' }}>
                            {g === '男' ? t.lifeMale : t.lifeFemale}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!lifeBirthday || !lifeBirthLoc) { alert(lang === 'zh' ? '请填写生日和出生地' : 'Please fill in birthday and birthplace'); return; }
                      const params = new URLSearchParams({ birthday: lifeBirthday, hour: String(lifeHour), gender: lifeGender, lang, city: lifeBirthLoc[1] });
                      window.location.href = `${MINGPAN_URL}?${params.toString()}`;
                    }}
                    style={{
                      width: '100%', padding: '14px',
                      background: (lifeBirthday && lifeBirthLoc) ? '#4c1d95' : '#d1d1d6',
                      color: '#fff', border: 'none', borderRadius: '12px',
                      fontSize: '16px', fontWeight: '600',
                      cursor: (lifeBirthday && lifeBirthLoc) ? 'pointer' : 'not-allowed'
                    }}
                  >
                    {t.lifeSubmit}
                  </button>
                </div>
              )}
            </div>

            <footer style={{ marginTop: '60px', textAlign: 'center', fontSize: '12px', color: theme.textTertiary }}>
              {t.feedback}
              <div style={{ marginTop: '4px', fontSize: '10px', opacity: 0.5 }}>v{process.env.APP_VERSION}</div>
            </footer>
          </div>
        )}

        {/* ==================== Ask Anything 模式 ==================== */}
        {mode === 'ask' && (<>
        {/* 顶部栏 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button onClick={() => {
              // msgs already persisted to localStorage via useEffect
              setMode(null); setExpandedTile(null); setAskStep('question'); setResult(null); setInput(''); setQuestion(''); setAiOpen(false); setAiMsgs([]); setAiSessionId(null); setExpandedHist(null);
            }}
            style={{ padding: '6px 12px', background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: theme.primary }}>
            {t.backToHome}
          </button>
          <h1 style={{ fontSize: '17px', fontWeight: '600' }}>{t.title}</h1>
          <button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            style={{ padding: '6px 12px', background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: theme.primary }}>
            {lang === 'zh' ? 'EN' : 'ZH'}
          </button>
        </div>

        {!result ? (
          <div className="fi">
            {/* ===== Step 1: Question ===== */}
            {askStep === 'question' && (
              <>
                <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: theme.textSecondary, marginBottom: '8px', display: 'block' }}>{t.question}</label>
                  <textarea
                    placeholder={t.questionPlaceholder}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '10px', fontSize: '16px', minHeight: '100px', resize: 'none', background: theme.bg, color: theme.textPrimary }}
                  />
                  <p style={{ fontSize: '12px', color: theme.textTertiary, marginTop: '6px', textAlign: 'center' }}>{t.questionTip}</p>
                </div>
                <button
                  onClick={() => setAskStep('divine')}
                  disabled={!question.trim()}
                  style={{
                    width: '100%', padding: '16px',
                    background: question.trim() ? theme.primary : '#d1d1d6',
                    color: '#fff', border: 'none', borderRadius: '12px',
                    fontSize: '17px', fontWeight: '600',
                    cursor: question.trim() ? 'pointer' : 'not-allowed'
                  }}
                >
                  {lang === 'zh' ? '下一步' : 'Next'}
                </button>
              </>
            )}

            {/* ===== Step 2: Coin Toss + Number Input ===== */}
            {askStep === 'divine' && (
              <>
                {/* 问题回显 */}
                <div style={{ marginBottom: '16px', padding: '12px 16px', background: theme.cardBg, borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: '12px', color: theme.textTertiary, marginBottom: '4px' }}>{t.asked}</div>
                  <div style={{ fontSize: '15px', fontWeight: '500', color: theme.textPrimary }}>{question}</div>
                </div>

                {/* 掷币区域 — 全宽 */}
                <div style={{ marginBottom: '20px', borderRadius: '16px', overflow: 'hidden', height: '420px', border: '1px solid rgba(0,0,0,0.06)', position: 'relative' }}>
                  <CoinToss lang={lang} onComplete={(yaoValues) => {
                    // yaoValues = [7,8,9,7,6,8] (6 yao values, index 0=bottom)
                    setTimeout(() => {
                      const coinResult = calcCoinHex(yaoValues, question);
                      setResult(coinResult);
                      setInput(coinResult.input);
                      setTab('orig'); setExpandYao(null);
                      setAutoAiReply(null); setAutoAiLoading(false);
                      const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
                      if (!isLocal) {
                        if (question.trim()) fetch('/api/log-question', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question }) }).catch(() => {});
                        fetch('/api/save-reading', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                          session_id: makeSessionId(),
                          type: 'coin',
                          input_data: { input: coinResult.input, question, yaoValues },
                          result_data: { oHex: coinResult.oHex?.name, cHex: coinResult.cHex?.name, numChanging: coinResult.numChanging, changingLines: coinResult.changingLines, readingType: coinResult.readingFocus?.type },
                          lang,
                        })}).catch(() => {});
                      }
                      const canAutoAi = aiUnlocked || aiRemaining > 0;
                      if (canAutoAi && question.trim()) {
                        triggerAutoAiReading(coinResult);
                      }
                    }, 800);
                  }} />
                  {/* Skip coin toss shortcut */}
                  <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, textAlign: 'center' }}>
                    <button onClick={() => {
                      const rnd = String(Math.floor(Math.random() * 900) + 100);
                      setInput(rnd);
                      setTimeout(() => calc(rnd), 50);
                    }} style={{ padding: '6px 16px', background: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
                      {lang === 'en' ? 'Skip — use random number' : '跳过 — 随机起卦'}
                    </button>
                  </div>
                </div>

                {/* 分隔线 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.08)' }} />
                  <span style={{ fontSize: '12px', color: theme.textTertiary }}>{lang === 'zh' ? '或者' : 'OR'}</span>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.08)' }} />
                </div>

                {/* 数字输入 */}
                <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: theme.textSecondary, marginBottom: '8px', display: 'block' }}>
                    {lang === 'zh' ? '输入一个相关数字' : 'Enter a related number'}
                  </label>
                  <input
                    type="text"
                    placeholder={t.inputPlaceholder}
                    value={input}
                    onChange={(e) => setInput(e.target.value.replace(/\D/g, ''))}
                    style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '10px', fontSize: '16px', background: theme.bg, color: theme.textPrimary }}
                  />
                  <p style={{ fontSize: '12px', color: theme.textTertiary, marginTop: '6px', textAlign: 'center' }}>
                    {lang === 'zh' ? '如果你有一个与问题相关的数字，可以直接输入来起卦' : 'If you have a number related to your question, enter it to divine'}
                  </p>
                </div>
                <button
                  onClick={calc}
                  disabled={!input || input.length < 2}
                  style={{
                    width: '100%', padding: '16px',
                    background: (input && input.length >= 2) ? theme.primary : '#d1d1d6',
                    color: '#fff', border: 'none', borderRadius: '12px',
                    fontSize: '17px', fontWeight: '600',
                    cursor: (input && input.length >= 2) ? 'pointer' : 'not-allowed'
                  }}
                >
                  {t.calculate}
                </button>

                {/* 返回上一步 */}
                <button
                  onClick={() => setAskStep('question')}
                  style={{ width: '100%', padding: '12px', marginTop: '12px', background: 'none', border: 'none', fontSize: '14px', color: theme.textTertiary, cursor: 'pointer' }}
                >
                  {lang === 'zh' ? '← 修改问题' : '← Edit question'}
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="fi">
            {/* 问题显示 */}
            {result.question && (
              <div className="card" style={{ padding: '14px 16px', marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: theme.textTertiary, marginBottom: '4px' }}>{t.asked}</div>
                <div style={{ fontSize: '16px', fontWeight: '500' }}>{result.question}</div>
              </div>
            )}
            
            {/* (Coin reading info is now integrated into the generateCoinReading analysis below) */}

            {/* ========== 综合解读 + 详细解析 ========== */}
            {result.question && (() => {
              const r = result.method === 'coin' ? generateCoinReading() : generateSmartReading();
              if (!r) return null;
              const h = result.method !== 'coin' ? getHoraryData() : null;
              const cr = h ? generateCombinedReading(r, h) : { fortuneKey: r?.fortuneKey || 'neutral' };
              const fortuneColors = { great: '#34c759', good: '#34c759', neutral: '#8e8e93', effort: '#ff9500', bad: '#ff3b30' };
              const crColor = fortuneColors[cr.fortuneKey] || '#8e8e93';

              // 占星辅助函数
              const pN = (n) => lang === 'en' ? n : (PLANET_NAMES_ZH[n] || n);
              const sN = (s) => lang === 'en' ? s.name : s.zh;
              const aspZhMap = lang === 'en' ? { conjunction:'Conjunction', sextile:'Sextile', square:'Square', trine:'Trine', opposition:'Opposition' } : { conjunction:'合相', sextile:'六合', square:'刑相', trine:'三合', opposition:'冲相' };
              const degFmt = (deg) => { const d = Math.floor(deg % 30); const m = Math.floor((deg % 30 - d) * 60); return `${d}°${m < 10 ? '0' : ''}${m}'`; };
              const houseTypes = { angular: lang === 'en' ? 'Angular' : '始宫', succedent: lang === 'en' ? 'Succedent' : '续宫', cadent: lang === 'en' ? 'Cadent' : '果宫' };

              return (<>
              {/* --- 综合解读卡片（深色）— 仅占星开启时显示 --- */}
              {h && (
              <div style={{ padding: '20px', marginBottom: '12px', background: 'linear-gradient(135deg, #1d1d1f, #2c2c2e)', borderRadius: '14px', color: '#fff' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', marginBottom: '10px' }}>
                  {lang === 'zh' ? '综合解读' : 'Combined Reading'}
                </div>
                <div style={{ fontSize: '20px', fontWeight: '700', lineHeight: 1.4, marginBottom: '12px' }}>{cr.headline}</div>
                <div style={{ fontSize: '14px', lineHeight: 1.8, color: 'rgba(255,255,255,0.75)' }}>{cr.body}</div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                  <span style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.12)', borderRadius: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>◎ {lang === 'zh' ? '梅花易数' : 'Plum Blossom'}</span>
                  <span style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.12)', borderRadius: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>✦ {lang === 'zh' ? '星象推演' : 'Horary Astrology'}</span>
                </div>
              </div>
              )}

              {/* --- 最终建议卡片 — 仅占星开启时显示 --- */}
              {h && (cr.verdict || cr.directAnswer) && (() => {
                const v = cr.verdict;
                const da = cr.directAnswer;
                const isEN = lang === 'en';
                const actionColors = { '→': '#34c759', '◇': '#ff9500', '×': '#ff3b30' };
                const actionColor = actionColors[v?.actionIcon] || '#8e8e93';
                const daTypeLabels = {
                  choice: isEN ? 'YOUR CHOICE' : '你的选择',
                  timing: isEN ? 'TIME WINDOW' : '时间窗口',
                  amount: isEN ? 'EXPECTED RETURNS' : '收益预期',
                  yesno: isEN ? 'DIRECT ANSWER' : '直接回答',
                  direction: isEN ? 'DIRECTION' : '方位指引',
                  person: isEN ? 'PERSON READING' : '看人',
                };
                return (
                  <div className="card" style={{ padding: '20px', marginBottom: '12px', borderRadius: '14px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', bottom: 0, background: actionColor, borderRadius: '4px 0 0 4px' }} />
                    {/* 直接回答区域 */}
                    {da && (<>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: actionColor, flexShrink: 0 }} />
                        <span style={{ fontSize: '12px', fontWeight: '700', color: actionColor, letterSpacing: '0.5px' }}>
                          {daTypeLabels[da.type] || (isEN ? 'ANSWER' : '回答')}
                        </span>
                      </div>
                      <div style={{ fontSize: '16px', lineHeight: 1.75, fontWeight: '500', color: theme.textPrimary, whiteSpace: 'pre-line', marginBottom: '16px', paddingLeft: '12px' }}>
                        {da.text}
                      </div>
                    </>)}
                    {/* 行动建议区域 */}
                    {v && (
                      <div style={{ background: theme.bg, borderRadius: '10px', padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '14px', color: actionColor, fontWeight: '700', lineHeight: 1 }}>{v.actionIcon}</span>
                          <span style={{ fontSize: '15px', fontWeight: '700', color: actionColor }}>{v.action}</span>
                        </div>
                        <div style={{ fontSize: '13px', lineHeight: 1.7, color: theme.textSecondary }}>
                          {v.reason}
                        </div>
                        {v.trustNote && (
                          <div style={{ fontSize: '12px', lineHeight: 1.5, color: theme.textTertiary, marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${theme.border}` }}>
                            {v.trustNote}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* --- 两体系对照表（问题导向） --- */}
              {h && (() => {
                const isEN = lang === 'en';
                const qt = h.qType || 'general';
                const mPos = r.fortuneKey === 'great' || r.fortuneKey === 'good';
                const mNeu = r.fortuneKey === 'neutral';
                const hPos = h.verdictKey === 'great' || h.verdictKey === 'good';
                const hNeu = h.verdictKey === 'neutral';

                // === 问题类型对应的维度标签 ===
                const dimLabels = {
                  love: isEN
                    ? ['Likely Outcome', 'Right Time Now?', 'Main Obstacle', 'Relationship Quality', 'Best Window', 'Extra Advice']
                    : ['能否如愿', '现在适合吗', '主要障碍', '感情质量', '最佳时机', '额外提示'],
                  career: isEN
                    ? ['Likely Outcome', 'Right Time Now?', 'Main Obstacle', 'Career Outlook', 'Best Window', 'Extra Advice']
                    : ['能否成功', '现在适合吗', '主要障碍', '发展前景', '最佳时机', '额外提示'],
                  money: isEN
                    ? ['Likely Outcome', 'Right Time Now?', 'Main Obstacle', 'Return Outlook', 'Best Window', 'Extra Advice']
                    : ['能否获利', '现在适合吗', '主要障碍', '收益预期', '最佳时机', '额外提示'],
                  health: isEN
                    ? ['Likely Outcome', 'Current Trend?', 'Main Obstacle', 'Recovery Outlook', 'Best Window', 'Extra Advice']
                    : ['能否康复', '目前趋势', '主要障碍', '恢复前景', '最佳调理期', '额外提示'],
                  study: isEN
                    ? ['Likely Outcome', 'Right Time Now?', 'Main Obstacle', 'Academic Outlook', 'Best Window', 'Extra Advice']
                    : ['能否顺利', '现在适合吗', '主要障碍', '学业前景', '最佳时机', '额外提示'],
                  travel: isEN
                    ? ['Likely Outcome', 'Right Time Now?', 'Main Obstacle', 'Journey Quality', 'Best Window', 'Extra Advice']
                    : ['能否成行', '现在适合吗', '主要障碍', '出行质量', '最佳时机', '额外提示'],
                  find: isEN
                    ? ['Likely Outcome', 'Still Recoverable?', 'Main Obstacle', 'Item Condition', 'Best Window', 'Extra Advice']
                    : ['能否找到', '还能找回吗', '主要障碍', '物品状况', '最佳时机', '额外提示'],
                  legal: isEN
                    ? ['Likely Outcome', 'Right Time Now?', 'Main Obstacle', 'Case Outlook', 'Best Window', 'Extra Advice']
                    : ['能否胜诉', '现在适合吗', '主要障碍', '案件走向', '最佳时机', '额外提示'],
                  family: isEN
                    ? ['Likely Outcome', 'Right Time Now?', 'Main Obstacle', 'Family Harmony', 'Best Window', 'Extra Advice']
                    : ['能否如愿', '现在适合吗', '主要障碍', '家庭和谐度', '最佳时机', '额外提示'],
                  general: isEN
                    ? ['Likely Outcome', 'Right Time Now?', 'Main Obstacle', 'Outcome Quality', 'Best Window', 'Extra Advice']
                    : ['能否如愿', '现在适合吗', '主要障碍', '结果质量', '最佳时机', '额外提示'],
                };
                const dims = dimLabels[qt] || dimLabels.general;

                // ============ Row 1: 能否如愿 ============
                // 梅花：基于体用关系+变卦
                const mCanDo = (() => {
                  const yes = mPos;
                  const prefix = yes ? '✅ ' : mNeu ? '⚪ ' : '❌ ';
                  if (r.tiYongRelKey === 'bihe') return prefix + (isEN ? 'Ti-Yong harmonize — very likely' : '体用比和，条件成熟');
                  if (r.tiYongRelKey === 'yongShengTi') return prefix + (isEN ? 'External support strong — favorable' : '外部助力强，有利');
                  if (r.tiYongRelKey === 'tiKeYong') return prefix + (isEN ? 'You have the upper hand — achievable with effort' : '自身占优势，努力可成');
                  if (r.tiYongRelKey === 'tiShengYong') return prefix + (isEN ? 'You\'re giving too much — draining' : '付出过多，消耗大');
                  if (r.tiYongRelKey === 'yongKeTi') return prefix + (isEN ? 'Strong opposition — difficult' : '阻力很大，较难实现');
                  return prefix + (isEN ? (yes ? 'Likely' : 'Uncertain') : (yes ? '可以' : '不确定'));
                })();
                // 星象：基于征象星相位+整体分数
                const hCanDo = (() => {
                  const yes = hPos;
                  const prefix = yes ? '✅ ' : hNeu ? '⚪ ' : '❌ ';
                  if (h.sigAspect && h.sigAspect.applying) {
                    const n = h.sigAspect.aspect.nature;
                    if (n === 'harmonious') return prefix + (isEN ? 'Significators connecting smoothly — likely' : '征象星顺利连接，可成');
                    if (n === 'neutral') return prefix + (isEN ? 'Significators merging — strong potential' : '征象星汇合，潜力大');
                    return prefix + (isEN ? 'Achievable but with pressure and friction' : '可成但伴随压力和摩擦');
                  }
                  if (h.sigAspect && !h.sigAspect.applying) return prefix + (isEN ? 'Connection fading — window narrowing' : '联系渐弱，窗口收窄');
                  if (h.translation) return prefix + (isEN ? 'No direct link, but a mediator helps' : '无直接联系，但有中间人助力');
                  if (h.collection) return prefix + (isEN ? 'No direct link, but a third force brings together' : '无直接联系，第三方力量撮合');
                  return prefix + (isEN ? 'No clear connection — outcome uncertain' : '缺乏联系，结果不明');
                })();

                // ============ Row 2: 现在适合吗 ============
                const mNow = (() => {
                  const prefix = mPos ? '✅ ' : mNeu ? '⚪ ' : '❌ ';
                  if (r.totalLevel >= 3) return prefix + (isEN ? 'Conditions ripe, go ahead' : '条件成熟，宜行动');
                  if (r.totalLevel >= 1) return prefix + (isEN ? 'Mostly ready, minor preparation needed' : '基本成熟，稍作准备');
                  if (r.totalLevel === 0) return prefix + (isEN ? 'Not fully ripe yet, wait a bit' : '条件未完全成熟，再等等');
                  return prefix + (isEN ? 'Timing not right, patience needed' : '时机未到，需要耐心');
                })();
                const hNow = (() => {
                  const prefix = hPos ? '✅ ' : hNeu ? '⚪ ' : '❌ ';
                  if (h.moonAna.isVOC) return '❌ ' + (isEN ? 'Moon void — stagnant period, don\'t force it' : '月亮空亡＝停滞期，强求无效');
                  if (h.moonAna.isViaCombusta) return '❌ ' + (isEN ? 'Moon in danger zone — unstable period' : '月亮过焦伤之路＝动荡期，不宜');
                  if (h.sigAspect && h.sigAspect.applying && h.sigAspect.aspect.nature !== 'tense') return prefix + (isEN ? 'Energy building, good timing' : '能量正在汇聚，时机不错');
                  if (h.prohibition) return '❌ ' + (isEN ? 'Blocked by interference, not yet' : '有外力阻断，尚不适合');
                  if (h.refranation) return '❌ ' + (isEN ? 'Progress may reverse, hold off' : '进展可能倒退，建议暂缓');
                  if (h.score >= 2) return prefix + (isEN ? 'Stars favor action now' : '星象支持现在行动');
                  if (h.score >= -1) return prefix + (isEN ? 'Possible, but proceed carefully' : '可以，但需谨慎');
                  return prefix + (isEN ? 'Not ideal, better to wait' : '不太理想，最好再等');
                })();

                // ============ Row 3: 主要障碍 ============
                const mObs = (() => {
                  if (r.totalLevel >= 3) return isEN ? 'No major obstacles' : '无明显障碍';
                  if (r.tiYongRelKey === 'yongKeTi') return isEN ? 'Strong external opposition or competition' : '外部竞争或压力大（环境不利）';
                  if (r.tiYongRelKey === 'tiShengYong') return isEN ? 'Overcommitting energy, burnout risk' : '自身消耗过大（付出多回报少）';
                  if (r.tiYongRelKey === 'tiKeYong') return isEN ? 'Need sustained effort, can\'t relax' : '需持续努力，不能松懈';
                  if (r.bianGuaRelKey === 'keTi') return isEN ? 'Changed situation turns unfavorable' : '变化后形势转差';
                  return isEN ? 'Conditions not yet aligned' : '各方面条件尚未到位';
                })();
                const hObs = (() => {
                  const obs = [];
                  if (h.moonAna.isVOC) obs.push(isEN ? 'Stagnant energy, nothing moves' : '能量停滞，事情推不动');
                  if (h.prohibition) obs.push(isEN ? 'Third-party interference blocks progress' : '第三方干扰阻断进展');
                  if (h.refranation) obs.push(isEN ? 'Key factor may suddenly reverse' : '关键因素可能突然逆转');
                  if (h.frustration) obs.push(isEN ? 'Process gets derailed midway' : '过程中途被打断');
                  if (h.querentBesieged) obs.push(isEN ? 'You\'re under heavy pressure from multiple sides' : '你受到多方面压力');
                  if (h.quesitedBesieged) obs.push(isEN ? 'The target/goal faces pressure' : '目标/对象处境受压');
                  const qrDig = h.querent.essential.dignities || [];
                  const qsDig = h.quesited.essential.dignities || [];
                  if (qrDig.includes('detriment') || qrDig.includes('fall')) obs.push(isEN ? 'Your own condition is weak' : '自身状态不佳');
                  if (qsDig.includes('detriment') || qsDig.includes('fall')) obs.push(isEN ? 'The situation/target itself is weak' : '对象/环境本身条件差');
                  if (h.querent.isRetrograde) obs.push(isEN ? 'You may be hesitating or second-guessing' : '自身犹豫不决或在反复');
                  return obs.length > 0 ? obs.join('；') : (isEN ? 'No major obstacles' : '无明显障碍');
                })();

                // ============ Row 4: 结果质量 ============
                const mQuality = (() => {
                  // 变卦 + 总level
                  if (r.totalLevel >= 3) return isEN ? 'Excellent outcome, well-rounded result' : '结果圆满，各方面理想';
                  if (r.totalLevel >= 1) return isEN ? 'Good result, meets expectations' : '结果不错，基本符合期望';
                  if (r.totalLevel === 0) return isEN ? 'Average, no surprises either way' : '结果一般，不好不坏';
                  if (r.totalLevel >= -2) return isEN ? 'Below expectations, compromises likely' : '不如预期，可能需要妥协';
                  return isEN ? 'Poor result, significant gaps from ideal' : '结果不理想，与期望差距大';
                })();
                const hQuality = (() => {
                  const qsDig = h.quesited.essential.dignities || [];
                  const qsScore = h.quesited.totalScore;
                  // 事物星的力量代表事物本身的质量
                  if (qsDig.includes('domicile') || qsDig.includes('exaltation')) return isEN ? 'Target/goal in excellent condition' : '目标/对象本身条件极佳';
                  if (qsScore >= 3) return isEN ? 'Good quality, solid foundation' : '质量良好，基础扎实';
                  if (qsScore >= 0) return isEN ? 'Acceptable, nothing exceptional' : '尚可，但无突出优势';
                  if (qsDig.includes('detriment') || qsDig.includes('fall')) return isEN ? 'Weak foundation, quality concerns' : '基础薄弱，质量存疑';
                  return isEN ? 'Below average, manage expectations' : '低于平均，需调低期望';
                })();

                // ============ Row 5: 最佳时机 ============
                const mWin = (() => {
                  let s = r.yingqi && r.yingqi.bestSeason ? r.yingqi.bestSeason : (isEN ? 'Anytime' : '无特定限制');
                  if (r.yingqi && r.yingqi.months) s += '\n' + (isEN ? `Estimated ~${r.yingqi.months} month(s)` : `预计约${r.yingqi.months}个月`);
                  return s;
                })();
                const hWin = (() => {
                  if (h.timing) {
                    const u = h.timing.unit === 'days' ? (isEN ? 'days' : '天') : h.timing.unit === 'weeks' ? (isEN ? 'weeks' : '周') : (isEN ? 'months' : '个月');
                    return isEN ? `~${h.timing.value} ${u}` : `约${h.timing.value}${u}`;
                  }
                  if (h.moonAna.isVOC) return isEN ? 'Delayed — wait for energy shift' : '延迟——等待能量转变';
                  return isEN ? 'Timing unclear, watch for new developments' : '时间不确定，留意新动向';
                })();

                // ============ Row 6: 额外提示 ============
                const mTip = (() => {
                  const tips = [];
                  if (r.bianGuaRelKey === 'shengTi') tips.push(isEN ? 'Outcome improves over time' : '变卦生体＝越往后越好');
                  if (r.bianGuaRelKey === 'keTi') tips.push(isEN ? 'Watch for late-stage reversals' : '变卦克体＝后期可能生变');
                  if (r.bianGuaRelKey === 'bihe') tips.push(isEN ? 'Stable transition, smooth process' : '变卦比和＝过渡平稳');
                  if (r.yingqi && r.yingqi.avoidSeason) tips.push(isEN ? `Avoid: ${r.yingqi.avoidSeason}` : `不利时段：${r.yingqi.avoidSeason}`);
                  if (r.yingqi && r.yingqi.delayDays > 0) tips.push(isEN ? `Mid-process friction ~${r.yingqi.delayDays} days` : `过程中有约${r.yingqi.delayDays}天摩擦期`);
                  if (r.tiYongRelKey === 'tiShengYong') tips.push(isEN ? 'Don\'t overinvest, preserve energy' : '别投入太多，保存实力');
                  return tips.length > 0 ? tips.join('；') : (isEN ? 'Follow the flow, stay flexible' : '顺势而为，保持灵活');
                })();
                const hTip = (() => {
                  const tips = [];
                  if (h.mutualReceptions.length > 0) tips.push(isEN ? 'Cooperation is key — find allies' : '合作是关键，寻找盟友');
                  if (h.translation) tips.push(isEN ? 'A middleman or introducer can help' : '找中间人或引荐人有帮助');
                  if (h.collection) tips.push(isEN ? 'A higher authority figure can bring it together' : '可寻求权威人士撮合');
                  if (h.fixedStarHits.length > 0) {
                    const star = h.fixedStarHits[0];
                    if (star.star.score > 0) tips.push(isEN ? `Lucky star influence — extra boost` : `吉星照耀，有额外加持`);
                    if (star.star.score < 0) tips.push(isEN ? `Caution: volatile influence at play` : `注意：有不稳定因素在起作用`);
                  }
                  if (h.nodeNote && h.nodeNote.node === 'north') tips.push(isEN ? 'Karmic support — fated opportunity' : '命运助力，机缘天定');
                  if (h.nodeNote && h.nodeNote.node === 'south') tips.push(isEN ? 'Old patterns may repeat — stay aware' : '旧模式可能重演，保持觉察');
                  if (h.querent.isRetrograde) tips.push(isEN ? 'Revisit your true intention first' : '先重新审视自己的真实意愿');
                  if (h.moonAna.isVOC) tips.push(isEN ? 'Wait for a concrete trigger before acting' : '等出现明确契机再行动');
                  return tips.length > 0 ? tips.join('；') : (isEN ? 'Stay attentive to shifts in situation' : '留意形势变化，随机应变');
                })();

                // === 一致性（5+状态辩证版）===
                const conflictType = cr.conflict ? cr.conflict.type : 'agreement';
                let agreeText, agreeColor;
                if (conflictType === 'direction') {
                  agreeColor = '#ff9500';
                  if (r.totalLevel > 0) {
                    agreeText = isEN ? 'Meihua sees internal strength; horary warns of external obstacles' : '梅花看好内在条件，星象提示外部有阻碍';
                  } else {
                    agreeText = isEN ? 'Horary timing is favorable; hexagram shows readiness gaps' : '星象时机不错，但卦象显示自身准备不足';
                  }
                } else if (conflictType === 'degree') {
                  const strongerSys = cr.conflict.synthesisHint === 'meihua_stronger' ? (isEN ? 'Plum Blossom' : '梅花') : (isEN ? 'Horary' : '星象');
                  agreeText = isEN ? `Same direction, different intensity — trust ${strongerSys} more` : `方向一致，程度有别——以${strongerSys}为准`;
                  agreeColor = (mPos || hPos) ? '#86efac' : '#fdba74';
                } else if (conflictType === 'timing') {
                  agreeColor = '#60a5fa';
                  const shorter = cr.conflict.synthesisHint === 'horary_sooner' ? (isEN ? 'Horary' : '星象') : (isEN ? 'Plum Blossom' : '梅花');
                  const longer = cr.conflict.synthesisHint === 'horary_sooner' ? (isEN ? 'Plum Blossom' : '梅花') : (isEN ? 'Horary' : '星象');
                  agreeText = isEN ? `Same direction, different windows — short-term: ${shorter}, long-term: ${longer}` : `方向一致，时间窗口不同——短期看${shorter}，长期看${longer}`;
                } else if (conflictType === 'condition') {
                  agreeColor = '#fbbf24';
                  agreeText = isEN ? 'Same direction — but each sees different conditions to meet' : '方向一致，但各有不同的前提条件需要满足';
                } else {
                  // agreement / none
                  const bothGood = mPos && hPos;
                  const bothBad = !mPos && !mNeu && !hPos && !hNeu;
                  if (bothGood) { agreeText = isEN ? 'Both systems agree: Positive' : '两系统一致看好'; agreeColor = '#34c759'; }
                  else if (bothBad) { agreeText = isEN ? 'Both systems agree: Challenging' : '两系统一致看淡'; agreeColor = '#ff3b30'; }
                  else { agreeText = isEN ? 'Both systems see a neutral outlook' : '两系统均持观望态度'; agreeColor = '#8e8e93'; }
                }

                const rows = [
                  { dim: dims[0], m: mCanDo, h: hCanDo },
                  { dim: dims[1], m: mNow, h: hNow },
                  { dim: dims[2], m: mObs, h: hObs, warn: true },
                  { dim: dims[3], m: mQuality, h: hQuality },
                  { dim: dims[4], m: mWin, h: hWin },
                  { dim: dims[5], m: mTip, h: hTip },
                ];

                const cellStyle = (isWarn, text) => {
                  if (text.startsWith('✅')) return { color: '#34c759' };
                  if (text.startsWith('❌')) return { color: '#ff3b30' };
                  if (text.startsWith('⚪')) return { color: '#8e8e93' };
                  if (isWarn && text !== (isEN ? 'No major obstacles' : '无明显障碍')) return { color: '#ff9500' };
                  return {};
                };

                return (
                  <div style={{ marginBottom: '16px', marginTop: '14px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: theme.textTertiary, marginBottom: '8px', paddingLeft: '2px' }}>
                      {isEN ? 'Side-by-Side Comparison' : '两体系综合对照'}
                    </div>
                    <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: '14px' }}>
                      {/* 表头 */}
                      <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', background: 'linear-gradient(135deg, #1d1d1f, #2c2c2e)' }}>
                        <div style={{ padding: '10px 10px', fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.4)' }}></div>
                        <div style={{ padding: '10px 12px', fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.9)', borderLeft: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                          ◎ {isEN ? 'Plum Blossom' : '梅花易数'}
                        </div>
                        <div style={{ padding: '10px 12px', fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.9)', borderLeft: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                          ✦ {isEN ? 'Horary' : '星象推演'}
                        </div>
                      </div>
                      {/* 数据行 */}
                      {rows.map((row, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', borderTop: `1px solid ${theme.border}`, background: i % 2 === 0 ? theme.cardBg : theme.bg }}>
                          <div style={{ padding: '10px 10px', fontSize: '12px', fontWeight: '700', color: theme.textSecondary, lineHeight: '1.4' }}>
                            {row.dim}
                          </div>
                          <div style={{ padding: '10px 12px', fontSize: '12.5px', lineHeight: '1.6', borderLeft: `1px solid ${theme.border}`, whiteSpace: 'pre-line', ...cellStyle(row.warn, row.m) }}>
                            {row.m}
                          </div>
                          <div style={{ padding: '10px 12px', fontSize: '12.5px', lineHeight: '1.6', borderLeft: `1px solid ${theme.border}`, whiteSpace: 'pre-line', ...cellStyle(row.warn, row.h) }}>
                            {row.h}
                          </div>
                        </div>
                      ))}
                      {/* 底部一致性 */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 16px', borderTop: `1px solid ${theme.border}`, background: theme.bg }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: agreeColor, flexShrink: 0 }}></span>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: agreeColor }}>{agreeText}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* --- 详细解析标题 — 仅占星开启时显示 --- */}
              {h && (
              <div style={{ fontSize: '13px', fontWeight: '600', color: theme.textTertiary, marginBottom: '8px', paddingLeft: '2px' }}>
                {lang === 'zh' ? '详细解析' : 'Detailed Analysis'}
              </div>
              )}

              {/* --- 梅花/星象 Tab 切换 --- */}
              {h && (
              <div className="card" style={{ display: 'flex', padding: '4px', marginBottom: '12px', background: theme.bg }}>
                <button onClick={() => setDetailTab('meihua')} style={{ flex: 1, padding: '10px', background: detailTab === 'meihua' ? '#fff' : 'transparent', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', color: detailTab === 'meihua' ? theme.textPrimary : theme.textTertiary, cursor: 'pointer' }}>◎ {lang === 'zh' ? '梅花易数' : 'Plum Blossom'}</button>
                <button onClick={() => setDetailTab('horary')} style={{ flex: 1, padding: '10px', background: detailTab === 'horary' ? '#fff' : 'transparent', border: detailTab === 'horary' ? '1.5px solid #007AFF' : 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', color: detailTab === 'horary' ? '#007AFF' : theme.textTertiary, cursor: 'pointer' }}>✦ {lang === 'zh' ? '星象推演' : 'Horary Astrology'}</button>
              </div>
              )}

              {/* ====== 梅花易数 Tab ====== */}
              {detailTab === 'meihua' && (<>
                {/* 起卦参数 */}
                {result.method === 'coin' ? (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '12px', fontSize: '12px', color: theme.textTertiary }}>
                  <span>🪙 {lang === 'zh' ? '金钱卦（掷币法）' : 'Coin Divination'}</span>
                  <span>|</span>
                  <span>{result.numChanging} {lang === 'zh' ? '个变爻' : `changing line${result.numChanging !== 1 ? 's' : ''}`}</span>
                </div>
                ) : (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '12px', fontSize: '12px', color: theme.textTertiary }}>
                  <span>{t.shichen}{lang === 'zh' ? '：' : ': '}{t.shichenNames[result.sh?.idx]}{lang === 'zh' ? '时' : ''}</span>
                  <span>|</span>
                  <span>{t.num}{lang === 'zh' ? '：' : ': '}{result.sh?.num}</span>
                  <span>|</span>
                  <span>{t.time}{lang === 'zh' ? '：' : ': '}{time ? time.toLocaleTimeString(lang === 'zh' ? 'zh-CN' : 'en-US', { hour12: false }) : '--:--:--'}</span>
                </div>
                )}
                {/* AI 大师解读卡片 */}
                <div className="card" style={{ padding: '16px', marginBottom: '12px', background: 'linear-gradient(135deg, #1a1a2e, #16213e)', borderRadius: '14px', color: '#fff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '700' }}>{lang === 'en' ? 'AI Master Reading' : 'AI 大师解读'}</span>
                    <span style={{ marginLeft: '8px', fontSize: '10px', color: '#60a5fa', background: 'rgba(96,165,250,0.15)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>AI</span>
                    {!aiUnlocked && <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{aiRemaining > 0 ? `${aiRemaining}/3 ${lang === 'en' ? 'free' : '免费'}` : ''}</span>}
                  </div>
                  {autoAiLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 0' }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#60a5fa', animation: 'mhBounce 1.2s infinite ease-in-out' }} />
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#60a5fa', animation: 'mhBounce 1.2s infinite ease-in-out', animationDelay: '0.2s' }} />
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#60a5fa', animation: 'mhBounce 1.2s infinite ease-in-out', animationDelay: '0.4s' }} />
                      <span style={{ fontSize: '13px', color: '#60a5fa', marginLeft: '4px' }}>{t.aiAutoLoading}</span>
                    </div>
                  ) : autoAiReply ? (
                    <div>
                      <div style={{ fontSize: '14px', lineHeight: '1.8', color: 'rgba(255,255,255,0.85)', whiteSpace: 'pre-line' }}>{autoAiReply}</div>
                      {/* Follow-up section */}
                      <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>{lang === 'en' ? 'Want to know more? Ask a follow-up:' : '想了解更多？继续追问：'}</div>
                        {/* Inline input */}
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                          <input
                            value={aiInput}
                            onChange={e => setAiInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && aiInput.trim()) { setAiOpen(true); setTimeout(() => sendAi(aiInput.trim()), 150); setAiInput(''); } }}
                            placeholder={lang === 'en' ? 'Type your question...' : '输入你的问题...'}
                            disabled={!aiUnlocked && aiRemaining <= 0}
                            style={{ flex: 1, padding: '8px 12px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', fontSize: '13px', outline: 'none', opacity: (!aiUnlocked && aiRemaining <= 0) ? 0.4 : 1 }}
                          />
                          <button
                            onClick={() => { if (aiInput.trim()) { setAiOpen(true); setTimeout(() => sendAi(aiInput.trim()), 150); setAiInput(''); } }}
                            disabled={!aiInput.trim() || (!aiUnlocked && aiRemaining <= 0)}
                            style={{ padding: '8px 14px', background: 'rgba(96,165,250,0.8)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: (!aiInput.trim() || (!aiUnlocked && aiRemaining <= 0)) ? 0.4 : 1 }}
                          >{lang === 'en' ? 'Ask' : '问'}</button>
                        </div>
                        {/* Quick suggestions */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {(lang === 'en'
                            ? ['When will I see results?', 'What should I watch out for?', 'What should I do?']
                            : ['什么时候会有结果？', '有什么需要注意的？', '我应该怎么做？']
                          ).map((q, i) => (
                            <button key={i} onClick={() => { setAiOpen(true); setTimeout(() => sendAi(q), 150); }}
                              disabled={!aiUnlocked && aiRemaining <= 0}
                              style={{ padding: '5px 12px', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', fontSize: '11px', cursor: (!aiUnlocked && aiRemaining <= 0) ? 'not-allowed' : 'pointer', opacity: (!aiUnlocked && aiRemaining <= 0) ? 0.4 : 1 }}>
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                      {!aiUnlocked && (
                        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{lang === 'en' ? 'Want unlimited AI readings?' : '想要无限AI解读？'}</span>
                          <button onClick={async () => {
                            try {
                              const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'subscription', returnTo: '/', session_id: getFunnelSessionId() }) });
                              const data = await res.json();
                              if (data.url) window.location.href = data.url;
                            } catch {}
                          }} style={{ padding: '5px 14px', background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                            {t.upgradePrice}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '12px 0' }}>
                      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '10px' }}>{lang === 'en' ? 'AI reading uses your monthly free quota' : 'AI解读需消耗每月免费额度'}</div>
                      {!aiUnlocked && aiRemaining <= 0 ? (
                        <button onClick={async () => {
                          try {
                            const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'subscription', returnTo: '/', session_id: getFunnelSessionId() }) });
                            const data = await res.json();
                            if (data.url) window.location.href = data.url;
                          } catch {}
                        }} style={{ padding: '8px 20px', background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                          {t.upgrade} — {t.upgradePrice}
                        </button>
                      ) : null}
                    </div>
                  )}
                </div>
                {/* 卦象分析卡片 */}
                <div className="card" style={{ padding: '16px', marginBottom: '12px', borderLeft: `3px solid ${crColor}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '600' }}>{lang === 'en' ? 'Hexagram Analysis' : '卦象分析'}</span>
                    <span style={{ marginLeft: 'auto', padding: '4px 10px', background: fortuneColors[r.fortuneKey] === '#34c759' ? '#f0fff4' : fortuneColors[r.fortuneKey] === '#ff3b30' ? '#fff5f5' : '#f5f5f5', borderRadius: '6px', fontSize: '13px', fontWeight: '600', color: fortuneColors[r.fortuneKey] || '#8e8e93' }}>{r.fortune}</span>
                  </div>
                  <div style={{ fontSize: '15px', lineHeight: '1.8', color: theme.textSecondary, whiteSpace: 'pre-line' }}>{r.specificAdvice}</div>
                </div>

                {/* 卦象分析 */}
                <div className="card" style={{ padding: '16px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: theme.textSecondary, marginBottom: '12px' }}>{t.reading}</div>
                  <div style={{ padding: '12px', background: theme.bg, borderRadius: '10px', marginBottom: '10px' }}>
                    <div style={{ fontSize: '12px', color: theme.textTertiary, marginBottom: '4px' }}>{t.readingBenGua}</div>
                    <div style={{ fontSize: '16px', fontWeight: '600' }}>{r.benGuaName}</div>
                    <div style={{ fontSize: '14px', color: theme.textSecondary, marginTop: '4px' }}>{r.benGuaMeaning}</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                    <div style={{ padding: '10px', background: theme.bg, borderRadius: '10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: theme.textTertiary }}>{t.readingTi}</div>
                      <div style={{ fontSize: '15px', fontWeight: '600' }}>{r.tiGua}</div>
                    </div>
                    <div style={{ padding: '10px', background: theme.bg, borderRadius: '10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: theme.textTertiary }}>{t.readingYong}</div>
                      <div style={{ fontSize: '15px', fontWeight: '600' }}>{r.yongGua}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                    <span style={{ fontWeight: '600' }}>{r.tiYongLabel}</span>{lang === 'zh' ? '：' : ': '}{r.tiYongDesc}
                  </div>
                  <div style={{ padding: '12px', background: theme.bg, borderRadius: '10px', marginTop: '10px' }}>
                    <div style={{ fontSize: '12px', color: theme.textTertiary, marginBottom: '4px' }}>{t.readingBianGua}</div>
                    <div style={{ fontSize: '16px', fontWeight: '600' }}>{r.bianGuaName}</div>
                    <div style={{ fontSize: '14px', color: theme.textSecondary, marginTop: '4px' }}>{r.bianGuaLabel}{lang === 'zh' ? '：' : ': '}{r.bianGuaDesc}</div>
                  </div>
                </div>

                {/* 本卦/变卦切换 */}
                <div className="card" style={{ display: 'flex', padding: '4px', marginBottom: '12px', background: theme.bg }}>
                  <button onClick={() => { setTab('orig'); setExpandYao(null); }} style={{ flex: 1, padding: '10px', background: tab === 'orig' ? '#fff' : 'transparent', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', color: tab === 'orig' ? theme.textPrimary : theme.textTertiary, cursor: 'pointer' }}>{t.originalHex}</button>
                  <button onClick={() => { setTab('chg'); setExpandYao(null); }} style={{ flex: 1, padding: '10px', background: tab === 'chg' ? '#fff' : 'transparent', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', color: tab === 'chg' ? theme.textPrimary : theme.textTertiary, cursor: 'pointer' }}>{t.changedHex}</button>
                </div>
            
            {/* 卦象显示 */}
            <div className="card" style={{ padding: '16px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column-reverse', padding: '12px', background: '#1d1d1f', borderRadius: '12px' }}>
                  {lines.map((l, i) => <Yao key={i} l={l} hl={tab === 'orig' && (result.method === 'coin' ? (result.changingLines || []).includes(i) : i === result.chg - 1)} />)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>{getHexName(hex)}</div>
                  <div style={{ fontSize: '13px', color: theme.textTertiary, marginBottom: '12px' }}>{getGuaName(uG)} {'\u2191'} {getGuaName(lG)} {'\u2193'} {hex?.num && `#${hex.num}`}</div>
                  <div style={{ padding: '10px', background: theme.bg, borderRadius: '8px', marginBottom: '8px' }}>
                    <div style={{ fontSize: '11px', color: theme.textTertiary, marginBottom: '4px' }}>📖 {t.guaCi}</div>
                    <div style={{ fontSize: '14px', color: theme.textPrimary }}>{getText(hex?.gua, hex?.guaEn)}</div>
                  </div>
                  {hex?.xiang && <div style={{ padding: '10px', background: theme.bg, borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', color: theme.textTertiary, marginBottom: '4px' }}>📜 {t.xiangYue}</div>
                    <div style={{ fontSize: '14px', color: theme.textSecondary }}>{getText(hex?.xiang, hex?.xiangEn)}</div>
                  </div>}
                </div>
              </div>
            </div>
            
            {/* 详细内容 - iOS风格 */}
            {hex?.philosophy && <div className="card" style={{ padding: '14px 16px', marginBottom: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: theme.textSecondary, marginBottom: '6px' }}>{t.philosophy}</div>
              <p style={{ fontSize: '15px', lineHeight: '1.7', margin: 0, color: theme.textPrimary }}>{getText(hex?.philosophy, hex?.philosophyEn)}</p>
            </div>}
            
            {hex?.vernacular && <div className="card" style={{ padding: '14px 16px', marginBottom: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: theme.textSecondary, marginBottom: '6px' }}>{t.vernacular}</div>
              <p style={{ fontSize: '15px', lineHeight: '1.7', margin: 0, color: theme.textSecondary }}>{getText(hex?.vernacular, hex?.vernacularEn)}</p>
            </div>}
            
            {hex?.duanyi && <div className="card" style={{ padding: '14px 16px', marginBottom: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: theme.textSecondary, marginBottom: '6px' }}>{t.duanyi}</div>
              <p style={{ fontSize: '15px', lineHeight: '1.7', margin: 0, color: theme.textSecondary }}>{getText(hex?.duanyi, hex?.duanyiEn)}</p>
            </div>}
            
            {hex?.shaoYong && <div className="card" style={{ padding: '14px 16px', marginBottom: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: theme.textSecondary, marginBottom: '6px' }}>{t.shaoYong}</div>
              <p style={{ fontSize: '15px', lineHeight: '1.7', margin: 0, color: theme.textSecondary, whiteSpace: 'pre-line' }}>{getText(hex?.shaoYong, hex?.shaoYongEn)}</p>
            </div>}
            
            {hex?.fuPeiRong && <div className="card" style={{ padding: '14px 16px', marginBottom: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: theme.textSecondary, marginBottom: '10px' }}>{t.fuPeiRong}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
                <div style={{ padding: '8px 10px', background: theme.bg, borderRadius: '8px' }}><span style={{ color: theme.textTertiary }}>{t.fuLabels.shiyun}{lang === 'zh' ? '：' : ': '}</span>{getFu(hex?.fuPeiRong, 'shiyun')}</div>
                <div style={{ padding: '8px 10px', background: theme.bg, borderRadius: '8px' }}><span style={{ color: theme.textTertiary }}>{t.fuLabels.caiyun}{lang === 'zh' ? '：' : ': '}</span>{getFu(hex?.fuPeiRong, 'caiyun')}</div>
                <div style={{ padding: '8px 10px', background: theme.bg, borderRadius: '8px' }}><span style={{ color: theme.textTertiary }}>{t.fuLabels.jiazhai}{lang === 'zh' ? '：' : ': '}</span>{getFu(hex?.fuPeiRong, 'jiazhai')}</div>
                <div style={{ padding: '8px 10px', background: theme.bg, borderRadius: '8px' }}><span style={{ color: theme.textTertiary }}>{t.fuLabels.shenti}{lang === 'zh' ? '：' : ': '}</span>{getFu(hex?.fuPeiRong, 'shenti')}</div>
              </div>
            </div>}
            
            {hex?.traditional && <div className="card" style={{ padding: '14px 16px', marginBottom: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: theme.textSecondary, marginBottom: '10px' }}>{t.traditional}</div>
              {hex.traditional.daxiang && <div style={{ padding: '8px 10px', background: theme.bg, borderRadius: '8px', marginBottom: '6px', fontSize: '14px' }}><span style={{ color: theme.textTertiary }}>{t.tradLabels.daxiang}{lang === 'zh' ? '：' : ': '}</span>{getTrad(hex?.traditional, 'daxiang')}</div>}
              {hex.traditional.yunshi && <div style={{ padding: '8px 10px', background: theme.bg, borderRadius: '8px', marginBottom: '6px', fontSize: '14px' }}><span style={{ color: theme.textTertiary }}>{t.tradLabels.yunshi}{lang === 'zh' ? '：' : ': '}</span>{getTrad(hex?.traditional, 'yunshi')}</div>}
              {hex.traditional.shiye && <div style={{ padding: '8px 10px', background: theme.bg, borderRadius: '8px', marginBottom: '6px', fontSize: '14px' }}><span style={{ color: theme.textTertiary }}>{t.tradLabels.shiye}{lang === 'zh' ? '：' : ': '}</span>{getTrad(hex?.traditional, 'shiye')}</div>}
              {hex.traditional.jingshang && <div style={{ padding: '8px 10px', background: theme.bg, borderRadius: '8px', marginBottom: '6px', fontSize: '14px' }}><span style={{ color: theme.textTertiary }}>{t.tradLabels.jingshang}{lang === 'zh' ? '：' : ': '}</span>{getTrad(hex?.traditional, 'jingshang')}</div>}
              {hex.traditional.qiuming && <div style={{ padding: '8px 10px', background: theme.bg, borderRadius: '8px', marginBottom: '6px', fontSize: '14px' }}><span style={{ color: theme.textTertiary }}>{t.tradLabels.qiuming}{lang === 'zh' ? '：' : ': '}</span>{getTrad(hex?.traditional, 'qiuming')}</div>}
              {hex.traditional.hunlian && <div style={{ padding: '8px 10px', background: theme.bg, borderRadius: '8px', marginBottom: '6px', fontSize: '14px' }}><span style={{ color: theme.textTertiary }}>{t.tradLabels.hunlian}{lang === 'zh' ? '：' : ': '}</span>{getTrad(hex?.traditional, 'hunlian')}</div>}
              {hex.traditional.juece && <div style={{ padding: '8px 10px', background: theme.bg, borderRadius: '8px', fontSize: '14px' }}><span style={{ color: theme.textTertiary }}>{t.tradLabels.juece}{lang === 'zh' ? '：' : ': '}</span>{getTrad(hex?.traditional, 'juece')}</div>}
            </div>}
            
            {hex?.tuan && <div className="card" style={{ padding: '14px 16px', marginBottom: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: theme.textSecondary, marginBottom: '6px' }}>{t.tuan}</div>
              <p style={{ fontSize: '15px', lineHeight: '1.7', margin: 0, color: theme.textSecondary }}>{getText(hex?.tuan, hex?.tuanEn)}</p>
            </div>}
            
            {/* 六爻详解 */}
            {hex?.yao && <div className="card" style={{ padding: '14px 16px', marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: theme.textSecondary, marginBottom: '12px' }}>🎴 {t.yaoDetail}</div>
              {[...hex.yao].reverse().map((y, i) => {
                const realIdx = hex.yao.length - 1 - i;
                const isActive = tab === 'orig' && (result.method === 'coin' ? (result.changingLines || []).includes(realIdx) : realIdx === result.chg - 1);
                return (
                <div key={i} style={{ marginBottom: '8px' }}>
                  <div onClick={() => setExpandYao(expandYao === realIdx ? null : realIdx)} style={{ padding: '10px 12px', background: isActive ? '#e5e5e5' : theme.bg, borderRadius: expandYao === realIdx ? '8px 8px 0 0' : '8px', cursor: 'pointer', border: isActive ? '2px solid #1d1d1f' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isActive && <span style={{ background: '#1d1d1f', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>⚡ {t.dongYao}</span>}
                      <span style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary }}>{getText(y.pos, y.posEn)}</span>
                      <span style={{ fontSize: '14px', color: theme.textSecondary }}>{getText(y.text, y.textEn)}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: theme.textTertiary, marginTop: '4px' }}>→ {getText(y.mean, y.meanEn)}</div>
                  </div>
                  {expandYao === realIdx && (
                    <div style={{ padding: '12px', background: theme.bg, borderRadius: '0 0 8px 8px' }}>
                      {y.vernacular && <div style={{ padding: '8px 10px', background: '#fff', borderRadius: '6px', marginBottom: '6px' }}>
                        <div style={{ fontSize: '11px', color: theme.primary, marginBottom: '2px', fontWeight: '500' }}>{t.yaoLabels.vernacular}</div>
                        <p style={{ fontSize: '13px', margin: 0, color: theme.textSecondary }}>{getText(y.vernacular, y.vernacularEn)}</p>
                      </div>}
                      {y.xiang && <div style={{ padding: '8px 10px', background: theme.bg, borderRadius: '6px', marginBottom: '6px' }}>
                        <div style={{ fontSize: '11px', color: theme.textTertiary, marginBottom: '2px', fontWeight: '500' }}>📜 {t.yaoLabels.xiang}</div>
                        <p style={{ fontSize: '13px', margin: 0, color: theme.textSecondary }}>{getText(y.xiang, y.xiangEn)}</p>
                      </div>}
                      {y.shaoYong && <div style={{ padding: '8px 10px', background: theme.bg, borderRadius: '6px', marginBottom: '6px' }}>
                        <div style={{ fontSize: '11px', color: theme.textTertiary, marginBottom: '2px', fontWeight: '500' }}>👤 {t.yaoLabels.shaoYong}</div>
                        <p style={{ fontSize: '13px', margin: 0, color: theme.textSecondary }}>{getText(y.shaoYong, y.shaoYongEn)}</p>
                      </div>}
                      {y.fuPeiRong && <div style={{ padding: '8px 10px', background: '#fff', borderRadius: '6px', marginBottom: '6px' }}>
                        <div style={{ fontSize: '11px', color: theme.textTertiary, marginBottom: '4px', fontWeight: '500' }}>{t.fuPeiRong}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '12px', color: theme.textSecondary }}>
                          <div>{t.fuLabels.shiyun}{lang === 'zh' ? '：' : ': '}{getFu(y.fuPeiRong, 'shiyun')}</div>
                          <div>{t.fuLabels.caiyun}{lang === 'zh' ? '：' : ': '}{getFu(y.fuPeiRong, 'caiyun')}</div>
                          <div>{t.fuLabels.jiazhai}{lang === 'zh' ? '：' : ': '}{getFu(y.fuPeiRong, 'jiazhai')}</div>
                          <div>{t.fuLabels.shenti}{lang === 'zh' ? '：' : ': '}{getFu(y.fuPeiRong, 'shenti')}</div>
                        </div>
                      </div>}
                      {y.biangua && <div style={{ padding: '8px 10px', background: theme.bg, borderRadius: '6px', marginBottom: '6px' }}>
                        <div style={{ fontSize: '11px', color: theme.textTertiary, marginBottom: '2px', fontWeight: '500' }}>🔄 {t.yaoLabels.biangua}</div>
                        <p style={{ fontSize: '13px', margin: 0, color: theme.textSecondary }}>{getText(y.biangua, y.bianguaEn)}</p>
                      </div>}
                      {y.zhexue && <div style={{ padding: '8px 10px', background: theme.bg, borderRadius: '6px', marginBottom: '6px' }}>
                        <div style={{ fontSize: '11px', color: theme.textTertiary, marginBottom: '2px', fontWeight: '500' }}>💭 {t.yaoLabels.zhexue}</div>
                        <p style={{ fontSize: '13px', margin: 0, color: theme.textSecondary }}>{getText(y.zhexue, y.zhexueEn)}</p>
                      </div>}
                      {y.story && <div style={{ padding: '8px 10px', background: theme.bg, borderRadius: '6px' }}>
                        <div style={{ fontSize: '11px', color: theme.textTertiary, marginBottom: '2px', fontWeight: '500' }}>📚 {t.yaoLabels.story}</div>
                        <p style={{ fontSize: '13px', margin: 0, color: theme.textSecondary }}>{getText(y.story, y.storyEn)}</p>
                      </div>}
                    </div>
                  )}
                </div>
              )})}
            </div>}
            
            {/* 体用分析 */}
            {(
            <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: theme.textSecondary, marginBottom: '12px' }}>⚖️ {t.tiyongAnalysis}</div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <div style={{ flex: 1, padding: '12px', background: theme.bg, borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: theme.textTertiary, marginBottom: '4px' }}>{t.tiGua}</div>
                  <div style={{ fontSize: '18px', fontWeight: '600' }}>{getGuaName(result.ti)}</div>
                  <div style={{ fontSize: '12px', color: getWuxingColor(result.ti?.element), fontWeight: '500' }}>{getElement(result.ti?.element)}</div>
                </div>
                <div style={{ flex: 1, padding: '12px', background: theme.bg, borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: theme.textTertiary, marginBottom: '4px' }}>{t.yongGua}</div>
                  <div style={{ fontSize: '18px', fontWeight: '600' }}>{getGuaName(result.yong)}</div>
                  <div style={{ fontSize: '12px', color: getWuxingColor(result.yong?.element), fontWeight: '500' }}>{getElement(result.yong?.element)}</div>
                </div>
              </div>
              <div style={{ display: 'inline-block', padding: '6px 12px', background: result.lv === 'g' || result.lv === 'ok' ? theme.success : result.lv === 'w' || result.lv === 'c' ? theme.danger : theme.textTertiary, color: '#fff', borderRadius: '6px', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>{t.relations[result.relKey]}</div>
              <p style={{ fontSize: '14px', margin: 0, color: theme.textSecondary }}>{t.fortunes[result.relKey]}</p>
            </div>
            )}
              </>)}

              {/* ====== 星象推演 Tab ====== */}
              {detailTab === 'horary' && h && (() => {
                const moonSignIdx = Math.floor(h.planets.Moon.lon / 30);
                const sunSignIdx = Math.floor(h.planets.Sun.lon / 30);
                const now = new Date();
                const timeStr = now.toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', timeZoneName:'short' });
                const sLbl = (s) => s >= 5 ? (lang === 'en' ? 'Very Strong' : '非常强') : s >= 2 ? (lang === 'en' ? 'Strong' : '较强') : s >= 0 ? (lang === 'en' ? 'Moderate' : '中等') : s >= -3 ? (lang === 'en' ? 'Weak' : '较弱') : (lang === 'en' ? 'Very Weak' : '非常弱');
                const dignityTags = (ess, acc) => {
                  const tags = [];
                  const d = ess.dignities || [];
                  if (d.includes('domicile')) tags.push(lang === 'en' ? 'Domicile +5' : '入庙 +5');
                  if (d.includes('exaltation')) tags.push(lang === 'en' ? 'Exaltation +4' : '耀升 +4');
                  if (d.includes('triplicity_day')) tags.push(lang === 'en' ? 'Triplicity(Day) +3' : '三方主(昼) +3');
                  if (d.includes('triplicity_night')) tags.push(lang === 'en' ? 'Triplicity(Night) +3' : '三方主(夜) +3');
                  if (d.includes('triplicity_part')) tags.push(lang === 'en' ? 'Triplicity(Part) +3' : '三方主(参与) +3');
                  if (d.includes('term')) tags.push(lang === 'en' ? 'Term +2' : '界 +2');
                  if (d.includes('face')) tags.push(lang === 'en' ? 'Face +1' : '面 +1');
                  if (d.includes('detriment')) tags.push(lang === 'en' ? 'Detriment -5' : '落陷 -5');
                  if (d.includes('fall')) tags.push(lang === 'en' ? 'Fall -4' : '入弱 -4');
                  if (d.includes('peregrine')) tags.push(lang === 'en' ? 'Peregrine -5' : '游离 -5');
                  // 偶然尊严标签
                  const n = (acc && acc.notes) || [];
                  if (n.includes('joy')) tags.push(lang === 'en' ? 'Joy +2' : '喜乐宫 +2');
                  if (n.includes('cazimi')) tags.push(lang === 'en' ? 'Cazimi +5' : '日心 +5');
                  if (n.includes('combust')) tags.push(lang === 'en' ? 'Combust -5' : '焦伤 -5');
                  if (n.includes('under_sunbeams')) tags.push(lang === 'en' ? 'Under Beams -2' : '日光下 -2');
                  return tags;
                };
                // --- 生成占星白话文解读（仿梅花易数白话风格）---
                const genHoraryAdvice = () => {
                  const isEN = lang === 'en';
                  const qr = h.querent, qs = h.quesited;
                  const qrDigs = (qr.essential.dignities || []);
                  const qsDigs = (qs.essential.dignities || []);
                  const qTypeLabels = isEN
                    ? { career:'career prospects', love:'love life', money:'financial situation', health:'health condition', study:'academic endeavors', travel:'travel plans', find:'lost item', legal:'legal matter', family:'family situation', general:'question' }
                    : { career:'事业前景', love:'感情姻缘', money:'财务状况', health:'健康问题', study:'学业考试', travel:'出行计划', find:'寻物线索', legal:'法律诉讼', family:'家庭状况', general:'所问之事' };
                  const qLabel = qTypeLabels[h.qType] || qTypeLabels.general;
                  let text = '';

                  // ━━ 1. 总体结论 ━━
                  if (isEN) {
                    if (h.score >= 5) text += `✅ Very favorable for your ${qLabel}! `;
                    else if (h.score >= 2) text += `🟡 Looking good for your ${qLabel}. `;
                    else if (h.score >= -1) text += `⚪ Mixed signals — could go either way. `;
                    else text += `🔴 Not looking great right now. `;
                  } else {
                    if (h.score >= 5) text += `✅ 关于你的${qLabel}，星象非常看好！`;
                    else if (h.score >= 2) text += `🟡 关于你的${qLabel}，整体不错。`;
                    else if (h.score >= -1) text += `⚪ 关于你的${qLabel}，情况比较复杂，好坏参半。`;
                    else text += `🔴 关于你的${qLabel}，目前形势不太有利。`;
                  }

                  // 你和目标的连接
                  if (h.sigAspect && h.sigAspect.applying) {
                    const n = h.sigAspect.aspect.nature;
                    if (isEN) {
                      if (n === 'harmonious') text += `You and what you want are naturally coming together — things should flow smoothly without too much effort.`;
                      else if (n === 'tense') text += `There IS a connection forming, but expect some friction and struggle along the way. It can work, but you'll have to push through obstacles.`;
                      else text += `Something decisive is about to happen — you and the situation are converging directly.`;
                    } else {
                      if (n === 'harmonious') text += `你和你想要的结果正在自然靠近，过程会比较顺畅，不太需要额外使劲。`;
                      else if (n === 'tense') text += `你和目标之间有连接，但过程中会有摩擦和阻力。事情能成，但需要你去争取和克服。`;
                      else text += `决定性的时刻即将到来——你和这件事正在直接碰撞。`;
                    }
                  } else if (h.sigAspect && !h.sigAspect.applying) {
                    text += isEN ? `The best window seems to be closing — the peak moment may have already passed. Focus on what you can do now rather than what you missed.`
                      : `最好的窗口期似乎在收窄——高峰时刻可能已经过去了。把注意力放在现在能做的事上。`;
                  } else {
                    if (h.translation) text += isEN ? `There's no direct path right now, but a middleman or opportunity can bridge the gap for you.` : `目前没有直接的路，但可以通过中间人或机会来搭桥。`;
                    else if (h.collection) text += isEN ? `You can't reach the goal alone, but a powerful third party could bring it together.` : `靠自己很难直达目标，但如果有贵人出手，事情有可能成。`;
                    else text += isEN ? `There's no clear path to the goal right now — you may need a new approach or wait for a better opening.` : `目前看不到通往目标的明确通道——可能需要换个思路或者等待新的机会。`;
                  }

                  // ━━ 2. 核心解读 ━━
                  text += isEN ? `\n\n━━ Core Reading ━━` : `\n\n━━ 核心解读 ━━`;

                  // 你的状态
                  if (isEN) {
                    text += `\n👤 Your current state: `;
                    if (qr.totalScore >= 5) text += `Very strong. You're in an excellent position — confident, resourceful, and well-equipped for this.`;
                    else if (qr.totalScore >= 2) text += `Good shape. You have solid ground to stand on and decent resources at your disposal.`;
                    else if (qr.totalScore >= 0) text += `Average. Nothing special working for or against you — it's a level playing field.`;
                    else if (qr.totalScore >= -3) text += `A bit weak. You may feel uncertain, low on energy, or lacking the right resources.`;
                    else text += `Struggling. You're in a tough spot — low confidence, limited resources, or operating from an unfavorable position.`;
                    if (qr.isRetrograde) text += ` Also, you seem to be second-guessing yourself or revisiting a past decision.`;
                  } else {
                    text += `\n👤 你现在的状态：`;
                    if (qr.totalScore >= 5) text += `非常好。你目前状态极佳——信心充足、资源充沛，做这件事底气十足。`;
                    else if (qr.totalScore >= 2) text += `不错。你有一定的基础和资源，具备推进这件事的条件。`;
                    else if (qr.totalScore >= 0) text += `一般。没有特别有利或不利的因素，全看你接下来怎么做。`;
                    else if (qr.totalScore >= -3) text += `偏弱。你可能觉得底气不足、精力不够，或者缺少必要的条件。`;
                    else text += `比较困难。状态不太好——信心低、资源少，处境不太有利。`;
                    if (qr.isRetrograde) text += `而且，你似乎在犹豫不决，或者在反复考虑一个已经做过的决定。`;
                  }

                  // 事情/目标/对方的状态
                  if (isEN) {
                    text += `\n🎯 The situation/target: `;
                    if (qs.totalScore >= 5) text += `In excellent condition. What you're going for is real, solid, and worth pursuing.`;
                    else if (qs.totalScore >= 2) text += `Decent quality. The opportunity or situation has a good foundation.`;
                    else if (qs.totalScore >= 0) text += `Acceptable but nothing outstanding. Don't expect more than what's on the surface.`;
                    else if (qs.totalScore >= -3) text += `Questionable. The situation may not be as good as it seems — look closer before committing.`;
                    else text += `Weak or compromised. What you're going for has serious issues — the foundation isn't solid.`;
                    if (qs.isRetrograde) text += ` Warning: the situation itself may reverse or change fundamentally.`;
                  } else {
                    text += `\n🎯 事情/目标/对方的情况：`;
                    if (qs.totalScore >= 5) text += `非常好。你追求的这个东西是真实可靠的，值得争取。`;
                    else if (qs.totalScore >= 2) text += `还行。机会或局面有一定的基础。`;
                    else if (qs.totalScore >= 0) text += `一般般，没什么特别突出的。别期望太高。`;
                    else if (qs.totalScore >= -3) text += `有点问题。事情可能没有表面看起来那么好——深入了解后再决定。`;
                    else text += `不太靠谱。你追求的这个东西存在明显的问题——基础不扎实。`;
                    if (qs.isRetrograde) text += `注意：事情本身可能会逆转或发生根本性变化。`;
                  }

                  // 月亮 = 你的直觉和情绪流向
                  if (isEN) {
                    text += `\n🌙 Your intuition & emotional flow: `;
                    if (h.moonAna.isVOC) text += `Stalled. Right now your instincts have nothing to lock onto — it's like spinning your wheels. Don't force anything; wait for a clear signal.`;
                    else if (h.moonAna.isViaCombusta) text += `Turbulent. Your emotions are in a chaotic zone right now — things feel confusing or deceptive. Don't trust first impressions; double-check everything.`;
                    else if (h.moonToQuesited && h.moonToQuesited.applying && h.moonToQuesited.aspect.nature !== 'tense') text += `Aligned. Your gut feeling is pointing toward the goal — trust your instincts here, they're working for you.`;
                    else if (h.moonToQuesited && h.moonToQuesited.applying) text += `Active but tense. You're emotionally engaged with this, but there's anxiety or worry mixed in. That's natural — use it as fuel, not as a reason to freeze.`;
                    else text += `Neutral. Your emotional compass isn't strongly pulled in either direction. Stay open and observe.`;
                  } else {
                    text += `\n🌙 你的直觉和情绪：`;
                    if (h.moonAna.isVOC) text += `停滞状态。现在你的直觉找不到着力点——像是空转。不要硬推，等待明确的信号出现。`;
                    else if (h.moonAna.isViaCombusta) text += `混乱状态。情绪正处于一个不稳定的区域——事情看起来令人困惑甚至有欺骗性。不要相信第一印象，什么都要多确认。`;
                    else if (h.moonToQuesited && h.moonToQuesited.applying && h.moonToQuesited.aspect.nature !== 'tense') text += `方向一致。你的直觉正指向目标——相信你的感觉，它在帮你。`;
                    else if (h.moonToQuesited && h.moonToQuesited.applying) text += `活跃但紧张。你在情感上很投入，但伴随着焦虑。这是正常的——把它当作动力，不要因此退缩。`;
                    else text += `平稳。情绪上没有特别强烈的倾向，保持开放、静观其变。`;
                  }

                  // ━━ 3. 需要注意的事 ━━
                  const hasWarning = h.prohibition || h.refranation || h.frustration || h.querentBesieged || h.quesitedBesieged || h.moonAna.isVOC;
                  const hasHelp = h.mutualReceptions.length > 0 || h.translation || h.collection || h.sigReception;
                  if (hasWarning || hasHelp) {
                    text += isEN ? `\n\n━━ What to Watch For ━━` : `\n\n━━ 需要注意 ━━`;
                    if (isEN) {
                      if (h.prohibition) text += `\n⛔ Someone or something may step in and block your plans before they come together. Have a backup plan ready.`;
                      if (h.refranation) text += `\n⛔ One side might change their mind or pull back at a critical moment. Don't count on verbal promises — get things in writing.`;
                      if (h.frustration) text += `\n⛔ The whole situation may shift before it resolves. Stay flexible — what you're aiming for might transform into something different.`;
                      if (h.querentBesieged) text += `\n⚠️ You're under pressure from multiple directions. Before making any big moves, take a step back and decompress first.`;
                      if (h.quesitedBesieged) text += `\n⚠️ The situation itself is under stress from multiple sources — it may be unstable.`;
                      if (h.moonAna.isVOC && !h.prohibition) text += `\n⏸️ Energy is stagnant right now. Pushing hard won't help — wait for things to start moving again naturally.`;
                      if (h.mutualReceptions.length > 0) text += `\n🤝 Good news: there's genuine mutual benefit here. Both sides have something the other needs — find the deal that works for everyone.`;
                      if (h.translation) text += `\n🔗 A middleman, introducer, or connecting circumstance can help bridge the gap. Look for that bridge.`;
                      if (h.collection) text += `\n🔗 A person in authority (boss, mentor, institution) can bring things together. Seek their help.`;
                      if (h.sigReception) text += `\n🤝 One side is naturally inclined to help the other — there's goodwill to tap into.`;
                    } else {
                      if (h.prohibition) text += `\n⛔ 可能有人或事会半路插进来打乱你的计划。准备好备选方案。`;
                      if (h.refranation) text += `\n⛔ 某一方可能在关键时刻变卦或退缩。口头承诺不要太当真——重要的事落实到书面。`;
                      if (h.frustration) text += `\n⛔ 整个局面可能在事情成之前就变了。保持灵活——你追求的东西可能会变成另一个样子。`;
                      if (h.querentBesieged) text += `\n⚠️ 你正承受多方面的压力。在做重大决定之前，先退一步、缓一缓。`;
                      if (h.quesitedBesieged) text += `\n⚠️ 事情本身正在受到多方面的压力——局面可能不太稳定。`;
                      if (h.moonAna.isVOC && !h.prohibition) text += `\n⏸️ 现在是"空转"期，使劲推也推不动。等能量重新流动起来再说。`;
                      if (h.mutualReceptions.length > 0) text += `\n🤝 好消息：双方都有对方需要的东西，存在互利合作的基础。找到双赢的方案。`;
                      if (h.translation) text += `\n🔗 找个中间人、引荐人或者利用某个契机来搭桥，会很有帮助。`;
                      if (h.collection) text += `\n🔗 找有影响力的人（老板、前辈、组织）出面撮合，事情更容易成。`;
                      if (h.sigReception) text += `\n🤝 有一方天然愿意帮助另一方——有善意可以利用。`;
                    }
                  }

                  // ━━ 4. 时间预估 ━━
                  if (h.timing) {
                    const u = isEN ? (h.timing.unit === 'days' ? 'days' : h.timing.unit === 'weeks' ? 'weeks' : 'months') : (h.timing.unit === 'days' ? '天' : h.timing.unit === 'weeks' ? '周' : '个月');
                    text += isEN ? `\n\n━━ Timing ━━` : `\n\n━━ 时间预估 ━━`;
                    text += isEN ? `\n⏱️ Estimated timeframe: roughly ${h.timing.value} ${u}. ` : `\n⏱️ 预计大约需要${h.timing.value}${u}。`;
                    if (isEN) {
                      if (h.timing.unit === 'days') text += `Things are moving fast — stay alert and be ready to act.`;
                      else if (h.timing.unit === 'weeks') text += `Give it a few weeks to develop. Don't rush — let things unfold.`;
                      else text += `This is a longer game. Be patient and don't expect overnight results.`;
                    } else {
                      if (h.timing.unit === 'days') text += `事情进展会比较快——保持警觉，准备好随时行动。`;
                      else if (h.timing.unit === 'weeks') text += `给几周时间让事情发展，不要着急。`;
                      else text += `这是个较长的过程，要有耐心，别指望一蹴而就。`;
                    }
                  }

                  // ━━ 5. 建议 ━━
                  text += isEN ? `\n\n━━ What to Do ━━` : `\n\n━━ 行动建议 ━━`;
                  if (isEN) {
                    if (h.score >= 5) text += `\n💪 Go for it. Everything is lined up — be bold and decisive. Don't overthink when the signals are this clear.`;
                    else if (h.score >= 2) text += `\n👍 Move forward, but keep your eyes open. The conditions support you, but success still requires effort and attention to detail.`;
                    else if (h.score >= -1) text += `\n🤔 Proceed carefully. Don't rush into anything — gather more information, test the waters, and be ready to adjust.`;
                    else text += `\n✋ Hold off for now. This isn't the right moment. Regroup, refine your approach, and wait for better conditions.`;
                    if (h.sigAspect && h.sigAspect.applying && h.sigAspect.aspect.nature === 'harmonious') text += ` You have momentum — ride it.`;
                    else if (h.sigAspect && h.sigAspect.applying && h.sigAspect.aspect.nature === 'tense') text += ` Be ready for resistance. It's achievable, but you'll have to fight for it.`;
                    if (h.moonAna.isVOC && h.score < 2) text += ` Most importantly: wait. Forcing things now will likely lead nowhere.`;
                  } else {
                    if (h.score >= 5) text += `\n💪 放手去做。各方面都很配合——别犹豫，信号已经很清楚了。`;
                    else if (h.score >= 2) text += `\n👍 可以推进，但别掉以轻心。条件对你有利，但成功还是需要努力和细心。`;
                    else if (h.score >= -1) text += `\n🤔 谨慎行事。别急着做决定——多收集信息、试探一下，准备好随时调整方向。`;
                    else text += `\n✋ 建议暂缓。现在不是最好的时机。整理一下思路，调整方案，等待更好的条件。`;
                    if (h.sigAspect && h.sigAspect.applying && h.sigAspect.aspect.nature === 'harmonious') text += `你现在有顺风，顺势而为。`;
                    else if (h.sigAspect && h.sigAspect.applying && h.sigAspect.aspect.nature === 'tense') text += `要准备好面对阻力。事情能成，但得争取。`;
                    if (h.moonAna.isVOC && h.score < 2) text += `最重要的一点：等。现在硬推大概率白费力气。`;
                  }

                  // ━━ 6. 不利时的破解思路 ━━
                  if (h.score < 0) {
                    text += isEN ? `\n\n━━ How to Shift the Outcome ━━` : `\n\n━━ 如何改变局面 ━━`;
                    if (isEN) {
                      if (h.prohibition) text += `\nThe main blocker is external interference. Identify who or what might get in the way, and preemptively build relationships or remove that obstacle.`;
                      else if (h.moonAna.isVOC) text += `\nThe core issue is stagnant energy. You can't force this — but you CAN prepare. When the energy shifts (new moon, new month, new development), you'll be ready to pounce.`;
                      else if (qr.totalScore < 0) text += `\nThe weak link is your own condition. Focus on building yourself up first — health, confidence, skills, resources. Approach this from a position of strength.`;
                      else if (qs.totalScore < 0) text += `\nThe problem isn't you — it's what you're going for. Consider whether there's a better version of this goal, or if you need to look elsewhere entirely.`;
                      else text += `\nNo single factor is clearly to blame. Take a step back, look at the whole picture, and ask: is the timing right? Is my approach right? Am I aiming at the right target?`;
                    } else {
                      if (h.prohibition) text += `\n主要障碍是外部干扰。想想谁或什么可能挡路，提前搞好关系或消除这个障碍。`;
                      else if (h.moonAna.isVOC) text += `\n核心问题是能量停滞，强求无用。但你可以做好准备——等新的转机出现（新月、月初、新进展），你就能马上抓住。`;
                      else if (qr.totalScore < 0) text += `\n薄弱环节在你自己的状态。先把自己调整好——健康、信心、能力、资源都补上来。从一个强势的位置出发才更有把握。`;
                      else if (qs.totalScore < 0) text += `\n问题不在你，在你追求的那个东西。考虑一下是否有更好的选择，或者需不需要换个方向。`;
                      else text += `\n没有单一明显的原因。退后一步看全局，问自己：时机对不对？方法对不对？目标对不对？`;
                    }
                  }

                  return text;
                };

                const horaryAdviceText = genHoraryAdvice();
                const hFortuneLabel = h.score >= 5 ? (lang === 'en' ? 'Very Favorable' : '大吉')
                  : h.score >= 2 ? (lang === 'en' ? 'Favorable' : '吉')
                  : h.score >= -1 ? (lang === 'en' ? 'Uncertain' : '待定')
                  : h.score >= -4 ? (lang === 'en' ? 'Unfavorable' : '不利')
                  : (lang === 'en' ? 'Very Unfavorable' : '凶');
                const hFortuneColor = h.score >= 2 ? '#34c759' : h.score >= -1 ? '#8e8e93' : '#ff3b30';
                const hFortuneBg = h.score >= 2 ? '#f0fff4' : h.score >= -1 ? '#f5f5f5' : '#fff5f5';

                return (<>
                {/* 占星：针对你的问题 */}
                <div className="card" style={{ padding: '16px', marginBottom: '12px', borderLeft: `3px solid ${hFortuneColor}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '600' }}>{t.horaryForYou}</span>
                    <span style={{ marginLeft: 'auto', padding: '4px 10px', background: hFortuneBg, borderRadius: '6px', fontSize: '13px', fontWeight: '600', color: hFortuneColor }}>{hFortuneLabel}</span>
                  </div>
                  <div style={{ fontSize: '15px', lineHeight: '1.8', color: theme.textSecondary, whiteSpace: 'pre-line' }}>{horaryAdviceText}</div>
                </div>

                {/* ====== 专业星盘分析 Professional Chart Analysis ====== */}

                {/* 1. 星盘概览 Chart Overview */}
                <div className="card" style={{ padding: '16px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: theme.textSecondary, marginBottom: '12px' }}>
                    {lang === 'zh' ? '🌐 星盘概览' : '🌐 Chart Overview'}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div style={{ padding: '10px', background: theme.bg, borderRadius: '10px' }}>
                      <div style={{ fontSize: '11px', color: theme.textTertiary, marginBottom: '3px' }}>{lang === 'zh' ? '起盘时间' : 'Chart Time'}</div>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>{timeStr}</div>
                    </div>
                    <div style={{ padding: '10px', background: theme.bg, borderRadius: '10px' }}>
                      <div style={{ fontSize: '11px', color: theme.textTertiary, marginBottom: '3px' }}>{lang === 'zh' ? '昼夜盘' : 'Sect'}</div>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>{h.isDayChart ? (lang === 'zh' ? '☀️ 昼盘' : '☀️ Day Chart') : (lang === 'zh' ? '🌙 夜盘' : '🌙 Night Chart')}</div>
                    </div>
                    <div style={{ padding: '10px', background: theme.bg, borderRadius: '10px' }}>
                      <div style={{ fontSize: '11px', color: theme.textTertiary, marginBottom: '3px' }}>{lang === 'zh' ? '上升点 (ASC)' : 'Ascendant (ASC)'}</div>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>{sN(h.asc.sign)} {degFmt(h.asc.deg)}</div>
                      <div style={{ fontSize: '11px', color: theme.textTertiary }}>KP #{h.asc.kpNum || '-'}</div>
                    </div>
                    <div style={{ padding: '10px', background: theme.bg, borderRadius: '10px' }}>
                      <div style={{ fontSize: '11px', color: theme.textTertiary, marginBottom: '3px' }}>{lang === 'zh' ? '问题类型' : 'Question Type'}</div>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>{{ love: lang === 'zh' ? '感情' : 'Love', career: lang === 'zh' ? '事业' : 'Career', money: lang === 'zh' ? '财运' : 'Money', health: lang === 'zh' ? '健康' : 'Health', study: lang === 'zh' ? '学业' : 'Study', travel: lang === 'zh' ? '出行' : 'Travel', legal: lang === 'zh' ? '法律' : 'Legal', family: lang === 'zh' ? '家庭' : 'Family', find: lang === 'zh' ? '寻物' : 'Find', general: lang === 'zh' ? '综合' : 'General' }[h.qType] || h.qType}</div>
                      <div style={{ fontSize: '11px', color: theme.textTertiary }}>{lang === 'zh' ? `征象宫：1宫 vs ${h.sigs.quesitedHouse || '?'}宫` : `Houses: 1st vs ${h.sigs.quesitedHouse || '?'}th`}</div>
                    </div>
                    <div style={{ padding: '10px', background: theme.bg, borderRadius: '10px' }}>
                      <div style={{ fontSize: '11px', color: theme.textTertiary, marginBottom: '3px' }}>{lang === 'zh' ? '福点 (PoF)' : 'Part of Fortune'}</div>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>{sN(ZODIAC[Math.floor(h.partOfFortune / 30)])} {degFmt(h.partOfFortune)}</div>
                      <div style={{ fontSize: '11px', color: theme.textTertiary }}>{lang === 'zh' ? `第${h.pofHouse.num}宫（${houseTypes[h.pofHouse.type]}）` : `House ${h.pofHouse.num} (${houseTypes[h.pofHouse.type]})`}</div>
                    </div>
                    {h.arabicPart && <div style={{ padding: '10px', background: theme.bg, borderRadius: '10px' }}>
                      <div style={{ fontSize: '11px', color: theme.textTertiary, marginBottom: '3px' }}>{lang === 'zh' ? h.arabicPart.zh : h.arabicPart.name}</div>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>{sN(ZODIAC[h.arabicPart.signIdx])} {h.arabicPart.degInSign.toFixed(1)}°</div>
                      <div style={{ fontSize: '11px', color: theme.textTertiary }}>{lang === 'zh' ? `第${h.arabicPartHouse ? h.arabicPartHouse.num : '?'}宫` : `House ${h.arabicPartHouse ? h.arabicPartHouse.num : '?'}`}</div>
                    </div>}
                  </div>
                </div>

                {/* 2. 七星全览 All Planets */}
                <div className="card" style={{ padding: '16px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: theme.textSecondary, marginBottom: '12px' }}>
                    {lang === 'zh' ? '🪐 七星全览' : '🪐 Planetary Positions'}
                  </div>
                  {/* Table header */}
                  <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 42px 42px 36px 36px 36px', gap: '2px', padding: '6px 8px', background: theme.bg, borderRadius: '8px 8px 0 0', fontSize: '10px', fontWeight: '600', color: theme.textTertiary, textTransform: 'uppercase' }}>
                    <div>{lang === 'zh' ? '行星' : 'Planet'}</div>
                    <div>{lang === 'zh' ? '位置' : 'Position'}</div>
                    <div style={{ textAlign: 'center' }}>{lang === 'zh' ? '宫' : 'H.'}</div>
                    <div style={{ textAlign: 'center' }}>{lang === 'zh' ? '速度' : 'Spd'}</div>
                    <div style={{ textAlign: 'center' }}>{lang === 'zh' ? '必要' : 'Ess.'}</div>
                    <div style={{ textAlign: 'center' }}>{lang === 'zh' ? '偶然' : 'Acc.'}</div>
                    <div style={{ textAlign: 'center' }}>{lang === 'zh' ? '总分' : 'Tot.'}</div>
                  </div>
                  {/* Planet rows */}
                  {PLANET_LIST.map((pName, pi) => {
                    const pl = h.planets[pName];
                    const isSig = pName === h.sigs.querent || pName === h.sigs.quesited;
                    const sigRole = pName === h.sigs.querent ? (lang === 'zh' ? '问' : 'Q') : pName === h.sigs.quesited ? (lang === 'zh' ? '事' : 'Qs') : '';
                    return (
                      <div key={pName} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 42px 42px 36px 36px 36px', gap: '2px', padding: '7px 8px', background: isSig ? (pl.totalScore >= 0 ? '#f0fdf4' : '#fff5f5') : (pi % 2 === 0 ? theme.bg : 'transparent'), borderBottom: `1px solid ${theme.border}`, fontSize: '12px', alignItems: 'center' }}>
                        <div style={{ fontWeight: isSig ? '700' : '500' }}>
                          {pN(pName)}{pl.isRetrograde ? ' ℞' : ''}{sigRole ? <span style={{ fontSize: '9px', color: '#fff', background: pName === h.sigs.querent ? '#3b82f6' : '#e67e22', borderRadius: '3px', padding: '1px 3px', marginLeft: '2px' }}>{sigRole}</span> : ''}
                        </div>
                        <div style={{ fontSize: '11px' }}>
                          {sN(ZODIAC[pl.signIdx])} {degFmt(pl.lon)}
                        </div>
                        <div style={{ textAlign: 'center', fontSize: '11px' }}>{pl.house.num}</div>
                        <div style={{ textAlign: 'center', fontSize: '10px', color: pl.isRetrograde ? '#e53935' : theme.textTertiary }}>
                          {pl.speed !== undefined ? (pl.speed >= 0 ? '+' : '') + pl.speed.toFixed(2) + '°' : '-'}
                        </div>
                        <div style={{ textAlign: 'center', fontSize: '11px', fontWeight: '600', color: pl.essential.score >= 3 ? '#2e7d32' : pl.essential.score <= -3 ? '#c62828' : theme.textSecondary }}>
                          {pl.essential.score > 0 ? '+' : ''}{pl.essential.score}
                        </div>
                        <div style={{ textAlign: 'center', fontSize: '11px', fontWeight: '600', color: pl.accidental.score >= 3 ? '#2e7d32' : pl.accidental.score <= -3 ? '#c62828' : theme.textSecondary }}>
                          {pl.accidental.score > 0 ? '+' : ''}{pl.accidental.score}
                        </div>
                        <div style={{ textAlign: 'center', fontSize: '11px', fontWeight: '700', color: pl.totalScore >= 5 ? '#1b5e20' : pl.totalScore >= 2 ? '#2e7d32' : pl.totalScore >= 0 ? '#f57f17' : pl.totalScore >= -3 ? '#e65100' : '#c62828' }}>
                          {pl.totalScore > 0 ? '+' : ''}{pl.totalScore}
                        </div>
                      </div>
                    );
                  })}
                  {/* Expand dignity details for each planet */}
                  <div style={{ marginTop: '10px' }}>
                    {PLANET_LIST.map((pName) => {
                      const pl = h.planets[pName];
                      const tags = dignityTags(pl.essential, pl.accidental);
                      if (tags.length === 0) return null;
                      return (
                        <div key={pName + '_tags'} style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginBottom: '4px', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', fontWeight: '600', color: theme.textSecondary, minWidth: '36px' }}>{pN(pName)}</span>
                          {tags.map((tag, i) => (
                            <span key={i} style={{ padding: '1px 6px', background: tag.includes('+') ? '#e8f5e9' : tag.includes('-') ? '#ffebee' : '#f5f5f5', borderRadius: '8px', fontSize: '10px', color: tag.includes('+') ? '#2e7d32' : tag.includes('-') ? '#c62828' : theme.textTertiary }}>{tag}</span>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. 十二宫位 Houses */}
                <div className="card" style={{ padding: '16px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: theme.textSecondary, marginBottom: '12px' }}>
                    {lang === 'zh' ? '🏛️ 十二宫位' : '🏛️ Twelve Houses'}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                    {h.houses.map((house, hi) => {
                      const hNum = hi + 1;
                      const hType = house.type || (hNum % 3 === 1 ? 'angular' : hNum % 3 === 2 ? 'succedent' : 'cadent');
                      const typeBg = hType === 'angular' ? '#e3f2fd' : hType === 'succedent' ? '#f3e5f5' : '#f5f5f5';
                      const typeColor = hType === 'angular' ? '#1565c0' : hType === 'succedent' ? '#7b1fa2' : '#757575';
                      // planets in this house
                      const planetsInHouse = PLANET_LIST.filter(pn => h.planets[pn].house.num === hNum);
                      return (
                        <div key={hi} style={{ padding: '8px', background: theme.bg, borderRadius: '8px', borderLeft: `2px solid ${typeColor}` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                            <span style={{ fontSize: '12px', fontWeight: '700', color: theme.textPrimary }}>{hNum}</span>
                            <span style={{ fontSize: '9px', padding: '1px 4px', background: typeBg, color: typeColor, borderRadius: '4px' }}>{houseTypes[hType]}</span>
                          </div>
                          <div style={{ fontSize: '11px', color: theme.textSecondary }}>{sN(ZODIAC[house.signIdx])} {degFmt(house.cusp)}</div>
                          {planetsInHouse.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', marginTop: '3px' }}>
                              {planetsInHouse.map(pn => (
                                <span key={pn} style={{ fontSize: '9px', padding: '1px 4px', background: pn === h.sigs.querent ? '#bbdefb' : pn === h.sigs.quesited ? '#ffe0b2' : '#e0e0e0', borderRadius: '4px', fontWeight: '600' }}>{pN(pn)}{h.planets[pn].isRetrograde ? '℞' : ''}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '10px', color: theme.textTertiary, justifyContent: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><span style={{ width: '8px', height: '8px', background: '#e3f2fd', border: '1px solid #1565c0', borderRadius: '2px', display: 'inline-block' }}></span>{houseTypes.angular}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><span style={{ width: '8px', height: '8px', background: '#f3e5f5', border: '1px solid #7b1fa2', borderRadius: '2px', display: 'inline-block' }}></span>{houseTypes.succedent}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><span style={{ width: '8px', height: '8px', background: '#f5f5f5', border: '1px solid #757575', borderRadius: '2px', display: 'inline-block' }}></span>{houseTypes.cadent}</span>
                  </div>
                </div>

                {/* 4. 征象星深度分析 Significator Deep Dive */}
                <div className="card" style={{ padding: '16px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: theme.textSecondary, marginBottom: '12px' }}>
                    {lang === 'zh' ? '🔍 征象星深度分析' : '🔍 Significator Analysis'}
                  </div>
                  {[{ role: lang === 'zh' ? '问卜者主星 (1宫主)' : 'Querent Significator (1st ruler)', data: h.querent, name: h.sigs.querent, color: '#3b82f6' },
                    { role: lang === 'zh' ? `事物主星 (${h.sigs.quesitedHouse || '?'}宫主)` : `Quesited Significator (${h.sigs.quesitedHouse || '?'}th ruler)`, data: h.quesited, name: h.sigs.quesited, color: '#e67e22' }].map((sig, idx) => (
                    <div key={idx} style={{ padding: '12px', background: theme.bg, borderRadius: '10px', marginBottom: idx === 0 ? '10px' : 0, borderLeft: `3px solid ${sig.color}` }}>
                      {/* Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div>
                          <div style={{ fontSize: '10px', color: theme.textTertiary, marginBottom: '2px' }}>{sig.role}</div>
                          <div style={{ fontSize: '16px', fontWeight: '700', color: theme.textPrimary }}>{pN(sig.name)}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ padding: '3px 10px', background: sig.data.totalScore >= 2 ? '#e8f5e9' : sig.data.totalScore >= 0 ? '#fff8e1' : '#ffebee', borderRadius: '6px', fontSize: '13px', fontWeight: '700', color: sig.data.totalScore >= 2 ? '#2e7d32' : sig.data.totalScore >= 0 ? '#f57f17' : '#c62828' }}>
                            {sLbl(sig.data.totalScore)} ({sig.data.totalScore > 0 ? '+' : ''}{sig.data.totalScore})
                          </div>
                        </div>
                      </div>
                      {/* Position grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '8px' }}>
                        <div style={{ padding: '6px', background: theme.cardBg, borderRadius: '6px', textAlign: 'center' }}>
                          <div style={{ fontSize: '10px', color: theme.textTertiary }}>{lang === 'zh' ? '星座' : 'Sign'}</div>
                          <div style={{ fontSize: '12px', fontWeight: '600' }}>{sN(sig.data.sign)}</div>
                          <div style={{ fontSize: '10px', color: theme.textTertiary }}>{degFmt(sig.data.lon)}</div>
                        </div>
                        <div style={{ padding: '6px', background: theme.cardBg, borderRadius: '6px', textAlign: 'center' }}>
                          <div style={{ fontSize: '10px', color: theme.textTertiary }}>{lang === 'zh' ? '宫位' : 'House'}</div>
                          <div style={{ fontSize: '12px', fontWeight: '600' }}>{lang === 'zh' ? `第${sig.data.house.num}宫` : `H${sig.data.house.num}`}</div>
                          <div style={{ fontSize: '10px', color: theme.textTertiary }}>{houseTypes[sig.data.house.type]}</div>
                        </div>
                        <div style={{ padding: '6px', background: theme.cardBg, borderRadius: '6px', textAlign: 'center' }}>
                          <div style={{ fontSize: '10px', color: theme.textTertiary }}>{lang === 'zh' ? '速度' : 'Speed'}</div>
                          <div style={{ fontSize: '12px', fontWeight: '600', color: sig.data.isRetrograde ? '#e53935' : 'inherit' }}>
                            {sig.data.isRetrograde ? '℞' : ''}{sig.data.speed !== undefined ? (sig.data.speed >= 0 ? '+' : '') + sig.data.speed.toFixed(2) + '°/d' : '-'}
                          </div>
                          <div style={{ fontSize: '10px', color: theme.textTertiary }}>{sig.data.isRetrograde ? (lang === 'zh' ? '逆行中' : 'Retrograde') : (lang === 'zh' ? '直行' : 'Direct')}</div>
                        </div>
                      </div>
                      {/* Dignity breakdown */}
                      <div style={{ fontSize: '11px', marginBottom: '6px' }}>
                        <span style={{ fontWeight: '600', color: theme.textSecondary }}>{lang === 'zh' ? '必要尊严' : 'Essential Dignity'}: </span>
                        <span style={{ color: sig.data.essential.score >= 3 ? '#2e7d32' : sig.data.essential.score <= -3 ? '#c62828' : theme.textSecondary, fontWeight: '600' }}>{sig.data.essential.score > 0 ? '+' : ''}{sig.data.essential.score}</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginBottom: '6px' }}>
                        {(sig.data.essential.dignities || []).map((d, i) => {
                          const dMap = { domicile: lang === 'zh' ? '入庙' : 'Domicile', exaltation: lang === 'zh' ? '耀升' : 'Exaltation', triplicity_day: lang === 'zh' ? '三方主(昼)' : 'Trip.(Day)', triplicity_night: lang === 'zh' ? '三方主(夜)' : 'Trip.(Night)', triplicity_part: lang === 'zh' ? '三方主(参)' : 'Trip.(Part)', term: lang === 'zh' ? '界' : 'Term', face: lang === 'zh' ? '面' : 'Face', detriment: lang === 'zh' ? '落陷' : 'Detriment', fall: lang === 'zh' ? '入弱' : 'Fall', peregrine: lang === 'zh' ? '游离' : 'Peregrine' };
                          const isNeg = ['detriment', 'fall', 'peregrine'].includes(d);
                          return <span key={i} style={{ padding: '1px 6px', background: isNeg ? '#ffebee' : '#e8f5e9', borderRadius: '8px', fontSize: '10px', color: isNeg ? '#c62828' : '#2e7d32' }}>{dMap[d] || d}</span>;
                        })}
                        {(sig.data.essential.dignities || []).length === 0 && <span style={{ fontSize: '10px', color: theme.textTertiary }}>{lang === 'zh' ? '（无特殊尊严）' : '(No dignities)'}</span>}
                      </div>
                      <div style={{ fontSize: '11px', marginBottom: '6px' }}>
                        <span style={{ fontWeight: '600', color: theme.textSecondary }}>{lang === 'zh' ? '偶然尊严' : 'Accidental Dignity'}: </span>
                        <span style={{ color: sig.data.accidental.score >= 3 ? '#2e7d32' : sig.data.accidental.score <= -3 ? '#c62828' : theme.textSecondary, fontWeight: '600' }}>{sig.data.accidental.score > 0 ? '+' : ''}{sig.data.accidental.score}</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                        {(sig.data.accidental.notes || []).map((n, i) => {
                          const nMap = { angular: lang === 'zh' ? '始宫' : 'Angular', succedent: lang === 'zh' ? '续宫' : 'Succedent', cadent: lang === 'zh' ? '果宫' : 'Cadent', direct: lang === 'zh' ? '直行' : 'Direct', retrograde: lang === 'zh' ? '逆行' : 'Retrograde', fast: lang === 'zh' ? '快速' : 'Fast', slow: lang === 'zh' ? '缓慢' : 'Slow', combust: lang === 'zh' ? '焦伤' : 'Combust', under_sunbeams: lang === 'zh' ? '日光下' : 'Under Beams', cazimi: lang === 'zh' ? '日心' : 'Cazimi', joy: lang === 'zh' ? '喜乐宫' : 'Joy' };
                          const isNeg = ['cadent', 'retrograde', 'slow', 'combust', 'under_sunbeams'].includes(n);
                          const isPos = ['angular', 'direct', 'fast', 'cazimi', 'joy'].includes(n);
                          return <span key={i} style={{ padding: '1px 6px', background: isNeg ? '#ffebee' : isPos ? '#e8f5e9' : '#f5f5f5', borderRadius: '8px', fontSize: '10px', color: isNeg ? '#c62828' : isPos ? '#2e7d32' : theme.textTertiary }}>{nMap[n] || n}</span>;
                        })}
                      </div>
                      {/* Antiscion info for significators */}
                      {sig.data.antiscion !== undefined && (
                        <div style={{ fontSize: '10px', color: theme.textTertiary, marginTop: '6px' }}>
                          {lang === 'zh' ? '投影点' : 'Antiscion'}: {sN(ZODIAC[Math.floor(sig.data.antiscion / 30)])} {degFmt(sig.data.antiscion)}
                          {sig.data.contraAntiscion !== undefined && <> · {lang === 'zh' ? '反投影点' : 'Contra'}: {sN(ZODIAC[Math.floor(sig.data.contraAntiscion / 30)])} {degFmt(sig.data.contraAntiscion)}</>}
                        </div>
                      )}
                    </div>
                  ))}
                  {/* Moon as co-significator */}
                  {h.sigs.querent !== 'Moon' && h.sigs.quesited !== 'Moon' && (
                    <div style={{ padding: '10px', background: theme.bg, borderRadius: '10px', marginTop: '10px', borderLeft: '3px solid #9c27b0' }}>
                      <div style={{ fontSize: '10px', color: theme.textTertiary, marginBottom: '2px' }}>{lang === 'zh' ? '🌙 月亮（共同征象星）' : '🌙 Moon (Co-significator)'}</div>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>{sN(ZODIAC[moonSignIdx])} {degFmt(h.planets.Moon.lon)} · {lang === 'zh' ? `第${h.planets.Moon.house.num}宫` : `H${h.planets.Moon.house.num}`}</div>
                      <div style={{ fontSize: '11px', color: theme.textTertiary }}>{lang === 'zh' ? '总分' : 'Total'}: {h.planets.Moon.totalScore > 0 ? '+' : ''}{h.planets.Moon.totalScore} · {lang === 'zh' ? '速度' : 'Speed'}: {h.planets.Moon.speed !== undefined ? h.planets.Moon.speed.toFixed(2) + '°/d' : '-'}</div>
                    </div>
                  )}
                </div>

                {/* 5. 相位网络 Aspect Network */}
                <div className="card" style={{ padding: '16px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: theme.textSecondary, marginBottom: '12px' }}>
                    {lang === 'zh' ? '🔗 相位网络' : '🔗 Aspect Network'}
                  </div>
                  {/* Primary: Significator aspect */}
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: theme.textTertiary, marginBottom: '6px' }}>{lang === 'zh' ? '主征象星相位' : 'Primary Significator Aspect'}</div>
                    {h.sigAspect ? (
                      <div style={{ padding: '10px', background: h.sigAspect.aspect.nature === 'harmonious' ? '#f0fdf4' : h.sigAspect.aspect.nature === 'tense' ? '#fff5f5' : '#fefce8', borderRadius: '8px', border: `1px solid ${h.sigAspect.aspect.nature === 'harmonious' ? '#bbf7d0' : h.sigAspect.aspect.nature === 'tense' ? '#fecaca' : '#fef08a'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <div style={{ fontSize: '14px', fontWeight: '700' }}>
                            {pN(h.sigs.querent)} {aspZhMap[h.sigAspect.aspect.name] || h.sigAspect.aspect.name} {pN(h.sigs.quesited)}
                          </div>
                          <span style={{ padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '600', background: h.sigAspect.applying ? '#dcfce7' : '#fee2e2', color: h.sigAspect.applying ? '#166534' : '#991b1b' }}>
                            {h.sigAspect.applying ? (lang === 'zh' ? '入相' : 'Applying') : (lang === 'zh' ? '出相' : 'Separating')}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                          {lang === 'zh' ? '容许度' : 'Orb'}: {h.sigAspect.orb.toFixed(2)}° · {lang === 'zh' ? '性质' : 'Nature'}: {h.sigAspect.aspect.nature === 'harmonious' ? (lang === 'zh' ? '和谐' : 'Harmonious') : h.sigAspect.aspect.nature === 'tense' ? (lang === 'zh' ? '紧张' : 'Tense') : (lang === 'zh' ? '中性' : 'Neutral')} · {lang === 'zh' ? '权重' : 'Weight'}: {h.sigAspect.aspect.weight > 0 ? '+' : ''}{h.sigAspect.aspect.weight}
                        </div>
                        {h.sigAspect.applying && h.sigAspect.degreesToPerfect !== undefined && (
                          <div style={{ fontSize: '11px', color: theme.textTertiary, marginTop: '3px' }}>{lang === 'zh' ? '距精确相位' : 'To perfection'}: {h.sigAspect.degreesToPerfect.toFixed(2)}°</div>
                        )}
                      </div>
                    ) : (
                      <div style={{ padding: '10px', background: '#fff8e1', borderRadius: '8px', border: '1px solid #fef08a', fontSize: '13px', color: '#92400e' }}>
                        {lang === 'zh' ? '征象星之间无主要相位——事情需要外部推动力' : 'No major aspect between significators — an external catalyst needed'}
                      </div>
                    )}
                  </div>
                  {/* Moon aspects */}
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: theme.textTertiary, marginBottom: '6px' }}>{lang === 'zh' ? '月亮相位' : 'Moon Aspects'}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {h.moonToQuesited && (
                        <div style={{ padding: '8px 10px', background: theme.bg, borderRadius: '8px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>🌙→🎯 {pN('Moon')} {aspZhMap[h.moonToQuesited.aspect.name] || h.moonToQuesited.aspect.name} {pN(h.sigs.quesited)}</span>
                          <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '6px', background: h.moonToQuesited.applying ? '#dcfce7' : '#fee2e2', color: h.moonToQuesited.applying ? '#166534' : '#991b1b' }}>
                            {h.moonToQuesited.applying ? (lang === 'zh' ? '入相' : 'App.') : (lang === 'zh' ? '出相' : 'Sep.')} {h.moonToQuesited.orb.toFixed(1)}°
                          </span>
                        </div>
                      )}
                      {h.moonToQuerent && (
                        <div style={{ padding: '8px 10px', background: theme.bg, borderRadius: '8px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>🌙→👤 {pN('Moon')} {aspZhMap[h.moonToQuerent.aspect.name] || h.moonToQuerent.aspect.name} {pN(h.sigs.querent)}</span>
                          <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '6px', background: h.moonToQuerent.applying ? '#dcfce7' : '#fee2e2', color: h.moonToQuerent.applying ? '#166534' : '#991b1b' }}>
                            {h.moonToQuerent.applying ? (lang === 'zh' ? '入相' : 'App.') : (lang === 'zh' ? '出相' : 'Sep.')} {h.moonToQuerent.orb.toFixed(1)}°
                          </span>
                        </div>
                      )}
                      {h.moonLastAsp && (
                        <div style={{ padding: '8px 10px', background: '#faf5ff', borderRadius: '8px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>🌙← {lang === 'zh' ? '月亮上一个相位' : 'Moon last aspect'}: {aspZhMap[h.moonLastAsp.aspect.name] || h.moonLastAsp.aspect.name} {pN(h.moonLastAsp.planet)}</span>
                          <span style={{ fontSize: '10px', color: theme.textTertiary }}>{lang === 'zh' ? '揭示前因' : 'Past context'}</span>
                        </div>
                      )}
                      {h.moonAna.nextAspectPlanet && (
                        <div style={{ padding: '8px 10px', background: '#eff6ff', borderRadius: '8px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>🌙→ {lang === 'zh' ? '月亮下一个相位' : 'Moon next aspect'}: {h.moonAna.nextAspectType ? (aspZhMap[h.moonAna.nextAspectType.name] || h.moonAna.nextAspectType.name) : '?'} {pN(h.moonAna.nextAspectPlanet)}</span>
                          <span style={{ fontSize: '10px', color: theme.textTertiary }}>{lang === 'zh' ? '发展方向' : 'Direction'}</span>
                        </div>
                      )}
                      {!h.moonToQuesited && !h.moonToQuerent && !h.moonLastAsp && !h.moonAna.nextAspectPlanet && (
                        <div style={{ padding: '8px 10px', background: theme.bg, borderRadius: '8px', fontSize: '12px', color: theme.textTertiary }}>{lang === 'zh' ? '月亮无显著相位' : 'No notable Moon aspects'}</div>
                      )}
                    </div>
                  </div>
                  {/* All cross-planet aspects computed on-the-fly */}
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: theme.textTertiary, marginBottom: '6px' }}>{lang === 'zh' ? '全盘相位列表' : 'All Aspects'}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {(() => {
                        const allAsp = [];
                        for (let i = 0; i < PLANET_LIST.length; i++) {
                          for (let j = i + 1; j < PLANET_LIST.length; j++) {
                            const p1 = PLANET_LIST[i], p2 = PLANET_LIST[j];
                            const a = _findAspect(p1, h.planets[p1].lon, h.planets[p1].speed, p2, h.planets[p2].lon, h.planets[p2].speed);
                            if (a) allAsp.push({ p1, p2, ...a });
                          }
                        }
                        if (allAsp.length === 0) return <div style={{ fontSize: '12px', color: theme.textTertiary, padding: '6px' }}>{lang === 'zh' ? '无行星相位' : 'No aspects found'}</div>;
                        return allAsp.map((a, ai) => {
                          const natureColor = a.aspect.nature === 'harmonious' ? '#2e7d32' : a.aspect.nature === 'tense' ? '#c62828' : '#f57f17';
                          const natureBg = a.aspect.nature === 'harmonious' ? '#f0fdf4' : a.aspect.nature === 'tense' ? '#fff5f5' : '#fefce8';
                          return (
                            <div key={ai} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 8px', background: natureBg, borderRadius: '6px', fontSize: '11px' }}>
                              <span style={{ fontWeight: '600' }}>{pN(a.p1)} {aspZhMap[a.aspect.name] || a.aspect.name} {pN(a.p2)}</span>
                              <span style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <span style={{ color: theme.textTertiary }}>{a.orb.toFixed(1)}°</span>
                                <span style={{ padding: '1px 5px', borderRadius: '4px', fontSize: '10px', background: a.applying ? '#dcfce7' : '#fee2e2', color: a.applying ? '#166534' : '#991b1b' }}>{a.applying ? (lang === 'zh' ? '入' : 'A') : (lang === 'zh' ? '出' : 'S')}</span>
                              </span>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>

                {/* 6. 月亮专题 Moon Focus */}
                <div className="card" style={{ padding: '16px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: theme.textSecondary, marginBottom: '12px' }}>
                    {lang === 'zh' ? '🌙 月亮专题分析' : '🌙 Moon Analysis'}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                    <div style={{ padding: '10px', background: theme.bg, borderRadius: '8px' }}>
                      <div style={{ fontSize: '10px', color: theme.textTertiary, marginBottom: '2px' }}>{lang === 'zh' ? '位置' : 'Position'}</div>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>{sN(ZODIAC[moonSignIdx])} {degFmt(h.planets.Moon.lon)}</div>
                    </div>
                    <div style={{ padding: '10px', background: theme.bg, borderRadius: '8px' }}>
                      <div style={{ fontSize: '10px', color: theme.textTertiary, marginBottom: '2px' }}>{lang === 'zh' ? '宫位' : 'House'}</div>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>{lang === 'zh' ? `第${h.planets.Moon.house.num}宫（${houseTypes[h.planets.Moon.house.type]}）` : `House ${h.planets.Moon.house.num} (${houseTypes[h.planets.Moon.house.type]})`}</div>
                    </div>
                    <div style={{ padding: '10px', background: theme.bg, borderRadius: '8px' }}>
                      <div style={{ fontSize: '10px', color: theme.textTertiary, marginBottom: '2px' }}>{lang === 'zh' ? '速度' : 'Speed'}</div>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>{h.planets.Moon.speed !== undefined ? h.planets.Moon.speed.toFixed(2) + '°/d' : '-'}</div>
                      <div style={{ fontSize: '10px', color: theme.textTertiary }}>{lang === 'zh' ? '平均 13.18°/d' : 'Avg 13.18°/d'}</div>
                    </div>
                    <div style={{ padding: '10px', background: theme.bg, borderRadius: '8px' }}>
                      <div style={{ fontSize: '10px', color: theme.textTertiary, marginBottom: '2px' }}>{lang === 'zh' ? '总分' : 'Score'}</div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: h.planets.Moon.totalScore >= 2 ? '#2e7d32' : h.planets.Moon.totalScore >= 0 ? '#f57f17' : '#c62828' }}>
                        {h.planets.Moon.totalScore > 0 ? '+' : ''}{h.planets.Moon.totalScore} ({sLbl(h.planets.Moon.totalScore)})
                      </div>
                    </div>
                  </div>
                  {/* Status flags */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ padding: '8px 10px', borderRadius: '8px', fontSize: '12px', background: h.moonAna.isVOC ? '#ffebee' : '#e8f5e9', color: h.moonAna.isVOC ? '#c62828' : '#2e7d32', fontWeight: '600' }}>
                      {h.moonAna.isVOC ? '⚠️' : '✅'} {lang === 'zh' ? '空亡 (Void of Course)' : 'Void of Course'}: {h.moonAna.isVOC ? (lang === 'zh' ? '是——月亮在离开当前星座前不再形成任何入相相位' : 'Yes — Moon makes no applying aspects before leaving sign') : (lang === 'zh' ? '否——月亮活跃' : 'No — Moon is active')}
                    </div>
                    <div style={{ padding: '8px 10px', borderRadius: '8px', fontSize: '12px', background: h.moonAna.isViaCombusta ? '#ffebee' : '#f0fdf4', color: h.moonAna.isViaCombusta ? '#c62828' : '#2e7d32', fontWeight: '600' }}>
                      {h.moonAna.isViaCombusta ? '⚠️' : '✅'} {lang === 'zh' ? '焦伤之路 (Via Combusta)' : 'Via Combusta'}: {h.moonAna.isViaCombusta ? (lang === 'zh' ? '是——天秤15°~天蝎15°区间，暗藏危险' : 'Yes — Libra 15° to Scorpio 15°, hidden dangers') : (lang === 'zh' ? '否' : 'No')}
                    </div>
                    {h.moonAna.nextAspectPlanet && (
                      <div style={{ padding: '8px 10px', borderRadius: '8px', fontSize: '12px', background: '#eff6ff', color: '#1e40af' }}>
                        🔮 {lang === 'zh' ? `下一个相位：与${pN(h.moonAna.nextAspectPlanet)}的${h.moonAna.nextAspectType ? (aspZhMap[h.moonAna.nextAspectType.name] || h.moonAna.nextAspectType.name) : '?'}` : `Next aspect: ${h.moonAna.nextAspectType ? (h.moonAna.nextAspectType.name) : '?'} to ${pN(h.moonAna.nextAspectPlanet)}`}
                        {lang === 'zh' ? '——预示事情的下一步走向' : ' — indicates next development'}
                      </div>
                    )}
                  </div>
                </div>

                {/* 7. 特殊格局与敏感点 */}
                <div className="card" style={{ padding: '16px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: theme.textSecondary, marginBottom: '12px' }}>
                    {lang === 'zh' ? '⚡ 特殊格局与敏感点' : '⚡ Special Patterns & Sensitive Points'}
                  </div>
                  {/* Receptions */}
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: theme.textTertiary, marginBottom: '6px' }}>{lang === 'zh' ? '接纳与互容' : 'Receptions'}</div>
                    {h.mutualReceptions.length > 0 ? h.mutualReceptions.map((mr, i) => (
                      <div key={'mr' + i} style={{ padding: '8px 10px', background: '#e8f5e9', borderRadius: '8px', fontSize: '12px', marginBottom: '4px' }}>
                        🤝 <span style={{ fontWeight: '600' }}>{lang === 'zh' ? '互容' : 'Mutual Reception'}</span>: {pN(mr.p1)} ↔ {pN(mr.p2)} ({lang === 'zh' ? (mr.type === 'domicile' ? '入庙互容' : '耀升互容') : (mr.type === 'domicile' ? 'by Domicile' : 'by Exaltation')})
                      </div>
                    )) : <div style={{ padding: '6px 10px', background: theme.bg, borderRadius: '8px', fontSize: '11px', color: theme.textTertiary }}>{lang === 'zh' ? '无互容' : 'No mutual receptions'}</div>}
                    {h.sigReception && (
                      <div style={{ padding: '8px 10px', background: '#e8f5e9', borderRadius: '8px', fontSize: '12px', marginTop: '4px' }}>
                        🤝 <span style={{ fontWeight: '600' }}>{lang === 'zh' ? '单向接纳' : 'One-way Reception'}</span>: {pN(h.sigReception.received)} {lang === 'zh' ? '被' : 'received by'} {pN(h.sigReception.by)} {lang === 'zh' ? '以' + (h.sigReception.type === 'domicile' ? '入庙' : '耀升') + '接纳' : `(by ${h.sigReception.type})`}
                      </div>
                    )}
                  </div>
                  {/* Interference patterns */}
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: theme.textTertiary, marginBottom: '6px' }}>{lang === 'zh' ? '干扰格局' : 'Interference Patterns'}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {h.translation && (
                        <div style={{ padding: '8px 10px', background: '#e8f5e9', borderRadius: '8px', fontSize: '12px' }}>
                          🔗 <span style={{ fontWeight: '600' }}>{lang === 'zh' ? '光的传递' : 'Translation of Light'}</span>: {pN(h.translation.translator)} {lang === 'zh' ? '在两个征象星之间传递能量' : 'bridges both significators'}
                        </div>
                      )}
                      {h.collection && (
                        <div style={{ padding: '8px 10px', background: '#e8f5e9', borderRadius: '8px', fontSize: '12px' }}>
                          🔗 <span style={{ fontWeight: '600' }}>{lang === 'zh' ? '光的汇集' : 'Collection of Light'}</span>: {pN(h.collection.collector)} {lang === 'zh' ? '作为权威第三方聚拢双方' : 'unites both significators'}
                        </div>
                      )}
                      {h.prohibition && (
                        <div style={{ padding: '8px 10px', background: '#ffebee', borderRadius: '8px', fontSize: '12px' }}>
                          ⛔ <span style={{ fontWeight: '600' }}>{lang === 'zh' ? '禁止' : 'Prohibition'}</span>: {pN(h.prohibition.blocker)} {lang === 'zh' ? '在征象星完成相位前先行介入' : 'intervenes before aspect perfects'}
                        </div>
                      )}
                      {h.refranation && (
                        <div style={{ padding: '8px 10px', background: '#ffebee', borderRadius: '8px', fontSize: '12px' }}>
                          ⛔ <span style={{ fontWeight: '600' }}>{lang === 'zh' ? '退缩' : 'Refranation'}</span>: {lang === 'zh' ? '一颗征象星在相位完成前转为逆行' : 'A significator turns retrograde before perfection'}
                        </div>
                      )}
                      {h.frustration && (
                        <div style={{ padding: '8px 10px', background: '#ffebee', borderRadius: '8px', fontSize: '12px' }}>
                          ⛔ <span style={{ fontWeight: '600' }}>{lang === 'zh' ? '挫折' : 'Frustration'}</span>: {lang === 'zh' ? '征象星在相位完成前换座，局面突变' : 'Significator changes signs before aspect perfects'}
                        </div>
                      )}
                      {h.querentBesieged && (
                        <div style={{ padding: '8px 10px', background: '#ffebee', borderRadius: '8px', fontSize: '12px' }}>
                          ⚠️ <span style={{ fontWeight: '600' }}>{lang === 'zh' ? '问卜者被围攻' : 'Querent Besieged'}</span>: {lang === 'zh' ? '火星和土星从两侧夹击，感到巨大压力' : 'Mars and Saturn flank the querent, great pressure'}
                        </div>
                      )}
                      {h.quesitedBesieged && (
                        <div style={{ padding: '8px 10px', background: '#ffebee', borderRadius: '8px', fontSize: '12px' }}>
                          ⚠️ <span style={{ fontWeight: '600' }}>{lang === 'zh' ? '事物被围攻' : 'Quesited Besieged'}</span>: {lang === 'zh' ? '事物本身面临多方压力' : 'The matter itself is under multiple pressures'}
                        </div>
                      )}
                      {!h.translation && !h.collection && !h.prohibition && !h.refranation && !h.frustration && !h.querentBesieged && !h.quesitedBesieged && (
                        <div style={{ padding: '6px 10px', background: theme.bg, borderRadius: '8px', fontSize: '11px', color: theme.textTertiary }}>{lang === 'zh' ? '无特殊干扰格局' : 'No interference patterns detected'}</div>
                      )}
                    </div>
                  </div>
                  {/* Sensitive points */}
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: theme.textTertiary, marginBottom: '6px' }}>{lang === 'zh' ? '敏感点' : 'Sensitive Points'}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {/* Fixed Stars */}
                      {h.fixedStarHits.length > 0 ? h.fixedStarHits.map((hit, i) => (
                        <div key={'fs' + i} style={{ padding: '8px 10px', background: hit.star.score > 0 ? '#e8f5e9' : '#ffebee', borderRadius: '8px', fontSize: '12px' }}>
                          ⭐ <span style={{ fontWeight: '600' }}>{lang === 'zh' ? hit.star.zh : hit.star.name}</span> {aspZhMap['Conjunction'] || 'conj.'} {pN(hit.planet)}
                          <span style={{ marginLeft: '6px', fontSize: '10px', color: theme.textTertiary }}>({hit.star.nature === 'benefic' ? (lang === 'zh' ? '吉星' : 'Benefic') : hit.star.nature === 'malefic' ? (lang === 'zh' ? '凶星' : 'Malefic') : (lang === 'zh' ? '混合' : 'Mixed')}, {hit.star.score > 0 ? '+' : ''}{hit.star.score})</span>
                        </div>
                      )) : <div style={{ padding: '6px 10px', background: theme.bg, borderRadius: '8px', fontSize: '11px', color: theme.textTertiary }}>{lang === 'zh' ? '无恒星合相' : 'No fixed star conjunctions'}</div>}
                      {/* Lunar Nodes */}
                      {h.nodeNote ? (
                        <div style={{ padding: '8px 10px', background: h.nodeNote.node === 'north' ? '#e8f5e9' : '#fff8e1', borderRadius: '8px', fontSize: '12px' }}>
                          ☊ {pN(h.nodeNote.planet)} {lang === 'zh' ? '合' : 'conj.'} {h.nodeNote.node === 'north' ? (lang === 'zh' ? '北交点' : 'North Node') : (lang === 'zh' ? '南交点' : 'South Node')}
                          <span style={{ marginLeft: '4px', fontSize: '10px', color: theme.textTertiary }}>({lang === 'zh' ? '容许度' : 'orb'} {h.nodeNote.orb.toFixed(1)}°)</span>
                          <span style={{ marginLeft: '4px', fontSize: '11px' }}>{h.nodeNote.node === 'north' ? (lang === 'zh' ? '——与命运成长方向一致' : '— aligned with growth') : (lang === 'zh' ? '——涉及旧模式/业力' : '— karmic patterns')}</span>
                        </div>
                      ) : (
                        <div style={{ padding: '6px 10px', background: theme.bg, borderRadius: '8px', fontSize: '11px', color: theme.textTertiary }}>
                          ☊ {lang === 'zh' ? '北交点' : 'North Node'}: {sN(ZODIAC[Math.floor((h.planets._northNode || 0) / 30)])} {degFmt(h.planets._northNode || 0)} — {lang === 'zh' ? '未与征象星合相' : 'no conjunction with significators'}
                        </div>
                      )}
                      {/* Antiscion connections */}
                      {h.antiscions && h.antiscions.length > 0 ? h.antiscions.map((a, i) => (
                        <div key={'anti' + i} style={{ padding: '8px 10px', background: a.type === 'antiscion' ? '#e3f2fd' : '#fff3e0', borderRadius: '8px', fontSize: '12px' }}>
                          🔮 {a.type === 'antiscion' ? (lang === 'zh' ? '投影点' : 'Antiscion') : (lang === 'zh' ? '反投影点' : 'Contra-Antiscion')}: {pN(a.p1)} ↔ {pN(a.p2)}
                          <span style={{ marginLeft: '4px', fontSize: '10px', color: theme.textTertiary }}>({lang === 'zh' ? '容许度' : 'orb'} {a.orb.toFixed(1)}°)</span>
                        </div>
                      )) : <div style={{ padding: '6px 10px', background: theme.bg, borderRadius: '8px', fontSize: '11px', color: theme.textTertiary }}>{lang === 'zh' ? '无投影点连接' : 'No antiscion contacts'}</div>}
                    </div>
                  </div>
                </div>

                {/* 8. 应期与评分分解 Timing & Score */}
                <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: theme.textSecondary, marginBottom: '12px' }}>
                    {lang === 'zh' ? '📊 应期与评分分解' : '📊 Timing & Score Breakdown'}
                  </div>
                  {/* Timing */}
                  {h.timing && (
                    <div style={{ padding: '12px', background: theme.bg, borderRadius: '10px', textAlign: 'center', marginBottom: '12px' }}>
                      <div style={{ fontSize: '11px', color: theme.textTertiary, marginBottom: '4px' }}>{lang === 'zh' ? '应期推算' : 'Timing Estimate'}</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: theme.textPrimary }}>~{h.timing.value} {{ days: lang === 'zh' ? '天' : 'days', weeks: lang === 'zh' ? '周' : 'weeks', months: lang === 'zh' ? '月' : 'months' }[h.timing.unit]}</div>
                      <div style={{ fontSize: '10px', color: theme.textTertiary, marginTop: '4px' }}>
                        {lang === 'zh'
                          ? `计算依据：入相距离 ${h.sigAspect ? h.sigAspect.degreesToPerfect.toFixed(1) + '°' : '-'} · 星座性质 ${h.querent.sign.modality} · 宫位类型 ${houseTypes[h.querent.house.type]}`
                          : `Based on: aspect distance ${h.sigAspect ? h.sigAspect.degreesToPerfect.toFixed(1) + '°' : '-'} · sign modality ${h.querent.sign.modality} · house type ${houseTypes[h.querent.house.type]}`}
                      </div>
                    </div>
                  )}
                  {!h.timing && (
                    <div style={{ padding: '10px', background: '#fff8e1', borderRadius: '8px', fontSize: '12px', color: '#92400e', marginBottom: '12px', textAlign: 'center' }}>
                      {lang === 'zh' ? '无入相相位，无法推算应期' : 'No applying aspect — timing cannot be estimated'}
                    </div>
                  )}
                  {/* Score Decomposition */}
                  <div style={{ fontSize: '11px', fontWeight: '600', color: theme.textTertiary, marginBottom: '8px' }}>{lang === 'zh' ? '评分分解' : 'Score Decomposition'}</div>
                  {(() => {
                    const items = [];
                    // Querent strength
                    items.push({ label: lang === 'zh' ? `问卜者 ${pN(h.sigs.querent)} 力量 (×15%)` : `Querent ${pN(h.sigs.querent)} strength (×15%)`, value: +(h.querent.totalScore * 0.15).toFixed(1) });
                    // Quesited strength
                    items.push({ label: lang === 'zh' ? `事物 ${pN(h.sigs.quesited)} 力量 (×15%)` : `Quesited ${pN(h.sigs.quesited)} strength (×15%)`, value: +(h.quesited.totalScore * 0.15).toFixed(1) });
                    // Sig aspect
                    if (h.sigAspect) {
                      const aspVal = h.sigAspect.applying ? h.sigAspect.aspect.weight * 2 : h.sigAspect.aspect.weight * 0.5;
                      items.push({ label: lang === 'zh' ? `征象星相位 (${aspZhMap[h.sigAspect.aspect.name] || h.sigAspect.aspect.name}, ${h.sigAspect.applying ? '入相' : '出相'})` : `Sig. aspect (${h.sigAspect.aspect.name}, ${h.sigAspect.applying ? 'applying' : 'separating'})`, value: +aspVal.toFixed(1) });
                    } else {
                      items.push({ label: lang === 'zh' ? '无征象星相位' : 'No sig. aspect', value: -2 });
                    }
                    // Moon to quesited
                    if (h.moonToQuesited && h.moonToQuesited.applying) {
                      items.push({ label: lang === 'zh' ? `月亮入相${pN(h.sigs.quesited)} (${h.moonToQuesited.aspect.nature === 'tense' ? '紧张' : '和谐'})` : `Moon applying ${pN(h.sigs.quesited)} (${h.moonToQuesited.aspect.nature})`, value: h.moonToQuesited.aspect.nature === 'tense' ? -1 : 2 });
                    }
                    if (h.moonAna.isVOC) items.push({ label: lang === 'zh' ? '月亮空亡' : 'Moon VOC', value: -4 });
                    if (h.moonAna.isViaCombusta) items.push({ label: lang === 'zh' ? '焦伤之路' : 'Via Combusta', value: -3 });
                    if (h.moonLastAsp && h.moonLastAsp.aspect.nature === 'tense') items.push({ label: lang === 'zh' ? '月亮上一相位紧张' : 'Moon last asp. tense', value: -0.5 });
                    if (h.mutualReceptions.length > 0) items.push({ label: lang === 'zh' ? '互容' : 'Mutual Reception', value: 3 });
                    if (h.translation) items.push({ label: lang === 'zh' ? '光的传递' : 'Translation', value: 3 });
                    if (h.collection) items.push({ label: lang === 'zh' ? '光的汇集' : 'Collection', value: 2 });
                    if (h.prohibition) items.push({ label: lang === 'zh' ? '禁止' : 'Prohibition', value: -3 });
                    if (h.refranation) items.push({ label: lang === 'zh' ? '退缩' : 'Refranation', value: -2 });
                    if (h.frustration) items.push({ label: lang === 'zh' ? '挫折' : 'Frustration', value: -2 });
                    if (h.querentBesieged) items.push({ label: lang === 'zh' ? '问卜者被围攻' : 'Querent besieged', value: -3 });
                    if (h.quesitedBesieged) items.push({ label: lang === 'zh' ? '事物被围攻' : 'Quesited besieged', value: -2 });
                    if (h.sigReception) items.push({ label: lang === 'zh' ? '单向接纳' : 'One-way reception', value: 2 });
                    if (h.sigAntiscion) items.push({ label: lang === 'zh' ? '投影点命中' : 'Antiscion hit', value: 1.5 });
                    for (const hit of h.fixedStarHits) items.push({ label: `${lang === 'zh' ? hit.star.zh : hit.star.name} × ${pN(hit.planet)}`, value: +(hit.star.score * 0.5).toFixed(1) });
                    if (h.nodeNote) items.push({ label: `${pN(h.nodeNote.planet)} ${h.nodeNote.node === 'north' ? '☊' : '☋'}`, value: h.nodeNote.node === 'north' ? 2 : -2 });
                    if (h.pofHouse.type === 'angular') items.push({ label: lang === 'zh' ? '福点在始宫' : 'PoF angular', value: 1 });
                    if (h.arabicPartHouse && h.arabicPartHouse.type === 'angular') items.push({ label: lang === 'zh' ? `${h.arabicPart.zh}在始宫` : `${h.arabicPart.name} angular`, value: 0.5 });
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {items.map((it, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', background: it.value > 0 ? '#f0fdf4' : it.value < 0 ? '#fff5f5' : theme.bg, borderRadius: '6px', fontSize: '11px' }}>
                            <span style={{ color: theme.textSecondary }}>{it.label}</span>
                            <span style={{ fontWeight: '700', color: it.value > 0 ? '#2e7d32' : it.value < 0 ? '#c62828' : theme.textTertiary }}>{it.value > 0 ? '+' : ''}{it.value}</span>
                          </div>
                        ))}
                        {/* Total */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: h.score >= 2 ? '#e8f5e9' : h.score >= -1 ? '#fff8e1' : '#ffebee', borderRadius: '8px', marginTop: '4px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '700' }}>{lang === 'zh' ? '综合评分' : 'Total Score'}</span>
                          <span style={{ fontSize: '18px', fontWeight: '700', color: h.score >= 2 ? '#2e7d32' : h.score >= -1 ? '#f57f17' : '#c62828' }}>
                            {h.score > 0 ? '+' : ''}{h.score}
                          </span>
                        </div>
                        <div style={{ textAlign: 'center', padding: '8px', fontSize: '15px', fontWeight: '700', color: h.score >= 2 ? '#2e7d32' : h.score >= -1 ? '#f57f17' : '#c62828' }}>
                          {h.score >= 5 ? (lang === 'zh' ? '⭐ 非常有利' : '⭐ Very Favorable') : h.score >= 2 ? (lang === 'zh' ? '✅ 有利' : '✅ Favorable') : h.score >= -1 ? (lang === 'zh' ? '🟡 不确定' : '🟡 Uncertain') : h.score >= -4 ? (lang === 'zh' ? '⚠️ 不太有利' : '⚠️ Unfavorable') : (lang === 'zh' ? '🔴 非常不利' : '🔴 Very Unfavorable')}
                        </div>
                      </div>
                    );
                  })()}
                </div>
                </>);
              })()}

              </>);
            })()}

            {/* 重新起卦按钮 */}
            <div style={{ paddingBottom: aiOpen ? '0' : '70px' }}>
              <button
                onClick={() => {
                  // msgs already persisted to localStorage via useEffect
                  setResult(null); setInput(''); setQuestion(''); setAskStep('question'); setAiOpen(false); setAiMsgs([]); setAiSessionId(null); setExpandedHist(null);
                }}
                style={{ width: '100%', padding: '16px', background: theme.primary, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '17px', fontWeight: '600', cursor: 'pointer' }}
              >
                {t.restart}
              </button>
            </div>
          </div>
        )}
        {result && (
          <div style={{ margin: '20px auto 8px', maxWidth: 400, textAlign: 'center' }}>
            {feedbackSent ? (
              <div style={{ fontSize: 13, color: '#888' }}>{lang === 'en' ? '✓ Thanks for your feedback!' : '✓ 感谢反馈！'}</div>
            ) : (
              <div>
                <div style={{ fontSize: 12, color: '#aaa', marginBottom: 6 }}>{lang === 'en' ? 'Was this reading helpful?' : '这次解卦有帮助吗？'}</div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  {['up', 'down'].map(v => (
                    <button key={v} onClick={async () => {
                      setFeedbackSent(v);
                      try {
                        await fetch('/api/feedback', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            rating: v === 'up' ? 5 : 2,
                            sentiment: v === 'up' ? 'positive' : 'negative',
                            comment: '',
                            session_id: getFunnelSessionId(),
                          }),
                        });
                      } catch {}
                    }} style={{ fontSize: 22, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 8, transition: 'background 0.15s' }}>
                      {v === 'up' ? '👍' : '👎'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <footer style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: theme.textTertiary, paddingBottom: result ? '60px' : 0 }}>
          {t.footer}
          <div style={{ marginTop: '6px', fontSize: '11px' }}>{t.feedback}</div>
          <div style={{ marginTop: '4px', fontSize: '10px', opacity: 0.5 }}>v{process.env.APP_VERSION}</div>
        </footer>
        </>)}
      </div>

      {/* ===== AI CHAT PANEL (fixed bottom) ===== */}
      {result && result.question && (<>
        {!aiOpen ? (
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }}>
            <div style={{ maxWidth: 540, margin: '0 auto' }}>
              <button onClick={() => setAiOpen(true)} style={{ width: '100%', padding: '14px 20px', background: '#111', color: '#fff', border: 'none', borderRadius: '16px 16px 0 0', fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 -4px 20px rgba(0,0,0,0.15)' }}>
                <span style={{ fontSize: 18 }}>💬</span>
                {lang === 'en' ? 'Ask AI a Follow-up Question' : '继续追问AI大师'}
                <span style={{ fontSize: 11, opacity: 0.7, marginLeft: 4 }}>{aiUnlocked ? (lang === 'en' ? '(Unlimited)' : '(无限)') : `(${aiRemaining}/3 ${lang === 'en' ? 'free' : '免费'})`}</span>
              </button>
            </div>
          </div>
        ) : (
          <div style={{ position: 'fixed', bottom: 0, right: 0, left: 0, height: '60vh', background: '#fff', borderTop: '1px solid #e5e5e5', borderRadius: '16px 16px 0 0', boxShadow: '0 -4px 20px rgba(0,0,0,0.1)', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
            <style>{`@keyframes mhBounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }`}</style>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #eee' }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>{t.aiTitle}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {aiUnlocked && <button onClick={async () => {
                  if (!confirm(t.cancelConfirm)) return;
                  try {
                    const res = await fetch('/api/cancel-subscription', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
                    const data = await res.json();
                    if (data.ok) { alert(t.cancelSuccess); fetchQuota(); }
                    else { alert(data.error || t.cancelFail); }
                  } catch { alert(t.cancelFail); }
                }} style={{ fontSize: 10, color: '#999', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>{t.cancelSub}</button>}
                <span style={{ fontSize: 11, color: aiRemaining > 0 ? '#888' : '#ff3b30' }}>{aiUnlocked ? '∞' : `${aiRemaining}/3`}</span>
                <button onClick={() => setAiOpen(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#999' }}>×</button>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
              {/* History of past conversations from localStorage */}
              {(() => {
                const pastSessions = aiHistory.filter(h => h.id !== aiSessionId && h.msgs && h.msgs.length > 0);
                if (pastSessions.length === 0) return null;
                return (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#8e8e93', letterSpacing: '0.5px', marginBottom: 6 }}>{lang === 'en' ? 'PREVIOUS READINGS' : '历史解读'}</div>
                    {pastSessions.map((h, hi) => (
                      <div key={h.id || hi} style={{ marginBottom: 6 }}>
                        <button onClick={() => setExpandedHist(expandedHist === h.id ? null : h.id)} style={{ width: '100%', padding: '10px 12px', background: '#f2f2f7', border: 'none', borderRadius: expandedHist === h.id ? '10px 10px 0 0' : 10, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 12, color: '#8e8e93', transform: expandedHist === h.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>▶</span>
                          <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontSize: 13, color: '#3c3c43', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.label}</div>
                            {h.hexName && <div style={{ fontSize: 10, color: '#8e8e93', marginTop: 1 }}>{h.hexName}</div>}
                          </div>
                          <span style={{ fontSize: 10, color: '#8e8e93', whiteSpace: 'nowrap' }}>{h.msgs.length} {lang === 'en' ? 'msgs' : '条'}</span>
                        </button>
                        {expandedHist === h.id && (
                          <div style={{ background: '#fafafa', borderRadius: '0 0 10px 10px', padding: '8px 10px', maxHeight: 200, overflowY: 'auto' }}>
                            {h.msgs.map((m, mi) => (
                              <div key={mi} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 6 }}>
                                <div style={{ maxWidth: '85%', padding: '6px 10px', borderRadius: 10, background: m.role === 'user' ? '#ddd' : '#fff', fontSize: 12, lineHeight: 1.6, color: '#333', whiteSpace: 'pre-wrap' }}>
                                  {m.text}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
              {aiMsgs.length === 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ background: '#f2f2f7', padding: '12px 16px', borderRadius: 14, fontSize: 14, lineHeight: 1.7, color: '#111', whiteSpace: 'pre-wrap', marginBottom: 12 }}>{t.aiWelcome}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {t.aiExamples.map((ex, i) => (
                      <button key={i} onClick={() => sendAi(ex)} disabled={aiRemaining <= 0} style={{ padding: '10px 14px', background: '#fff', border: '1px solid #e5e5e5', borderRadius: 10, fontSize: 13, color: '#555', cursor: aiRemaining > 0 ? 'pointer' : 'not-allowed', textAlign: 'left' }}>{ex}</button>
                    ))}
                  </div>
                </div>
              )}
              {aiMsgs.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
                  <div style={{ maxWidth: '80%', padding: '10px 14px', borderRadius: 14, background: m.role === 'user' ? '#111' : '#f2f2f7', color: m.role === 'user' ? '#fff' : '#111', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                    {m.text}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 10 }}>
                  <div style={{ maxWidth: '80%', padding: '12px 18px', borderRadius: 14, background: '#f2f2f7', fontSize: 14, color: '#999', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#999', animation: 'mhBounce 1.2s infinite ease-in-out', animationDelay: '0s' }} />
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#999', animation: 'mhBounce 1.2s infinite ease-in-out', animationDelay: '0.2s' }} />
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#999', animation: 'mhBounce 1.2s infinite ease-in-out', animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}
              <div ref={aiEndRef} />
            </div>
            {aiRemaining > 0 ? (
              <div style={{ display: 'flex', gap: 8, padding: '10px 16px', borderTop: '1px solid #eee' }}>
                <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendAi()} placeholder={t.aiPlaceholder} style={{ flex: 1, padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: 10, fontSize: 14, outline: 'none' }} />
                <button onClick={() => sendAi()} disabled={aiLoading || !aiInput.trim()} style={{ padding: '10px 18px', background: '#111', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: aiLoading ? 0.5 : 1 }}>{t.aiSend}</button>
              </div>
            ) : (
              <div style={{ padding: '14px 16px', borderTop: '1px solid #eee', textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: '#ff3b30', marginBottom: 6 }}>{t.aiLimit}</div>
                <div style={{ fontSize: 11, color: '#999', marginBottom: 8 }}>{lang === 'en' ? 'Subscription is tied to your current device/network' : '订阅绑定当前设备/网络'}</div>
                <div style={{ background: '#f8f8f8', border: '1px solid #eee', borderRadius: 10, padding: '10px 12px', textAlign: 'left', marginBottom: 10 }}>
                  {(t.paywallBullets || []).map((b, i) => (
                    <div key={i} style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>• {b}</div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <button onClick={async () => {
                    try {
                      const res = await fetch('/api/checkout', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ mode: 'subscription', billing: 'monthly', returnTo: '/', session_id: getFunnelSessionId() }),
                      });
                      const data = await res.json();
                      if (data.url) window.location.href = data.url;
                      else alert(data.error || (lang === 'en' ? 'Payment not configured yet.' : '支付功能尚未配置。'));
                    } catch { alert(lang === 'en' ? 'Payment error. Please try again.' : '支付出错，请重试。'); }
                  }} style={{ padding: '10px 14px', background: '#111', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{t.upgradePrice}</button>
                  <button onClick={async () => {
                    try {
                      const res = await fetch('/api/checkout', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ mode: 'subscription', billing: 'annual', returnTo: '/', session_id: getFunnelSessionId() }),
                      });
                      const data = await res.json();
                      if (data.url) window.location.href = data.url;
                      else alert(data.error || (lang === 'en' ? 'Payment not configured yet.' : '支付功能尚未配置。'));
                    } catch { alert(lang === 'en' ? 'Payment error. Please try again.' : '支付出错，请重试。'); }
                  }} style={{ padding: '10px 14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', position: 'relative' }}>
                    <span style={{ position: 'absolute', top: -8, right: -6, background: '#f59e0b', color: '#fff', fontSize: 10, padding: '1px 6px', borderRadius: 999 }}>{t.mostPopular}</span>
                    {t.upgradePriceYear}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </>)}
    </div>
  );
}
