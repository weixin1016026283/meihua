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
    personality: '性格命格', careerDir: '事业方向', lovePattern: '感情模式',
    wealthPattern: '财运格局', healthNote: '健康提醒',
    lifeReading: '人生综合解读', advice: '注意事项', chartTitle: '紫微命盘',
    annualTitle: '年运解读', thisYear: '今年', nextYear: '明年',
    annualCareer: '事业', annualLove: '感情', annualWealth: '财运', annualHealth: '健康',
    annualOverall: '综合', annualAdvice: '年度建议',
    highlights: '利好', caution: '注意',
    career: '事业', love: '感情', wealth: '财运', health: '健康', children: '子女',
    fourHua: '生年四化', restart: '重新排盘',
    aiTitle: '问命师', aiPlaceholder: '问关于你命运的问题...', aiSend: '发送',
    aiWelcome: '你好！我是AI命理师，已经看过你的完整命盘。\n你可以问我任何关于事业、感情、财运、健康的问题。',
    aiExamples: ['我的事业什么时候最旺？', '我适合什么类型的工作？', '今年感情运如何？'],
    aiLimit: '今日免费额度已用完 (3/3)',
    upgrade: '解锁无限AI命理咨询', upgradePrice: '$3.49/月',
    footer: '紫微斗数 · AI 解读 · 仅供参考',
    levelGreat: '大吉', levelGood: '吉', levelWarn: '凶', levelMixed: '吉凶参半',
    noMajorStars: '空宫（借对宫星耀）',
    decadeLabel: '当前大限',
  },
  en: {
    back: '← Back', title: 'Destiny Chart', langToggle: '中文',
    inputTitle: 'Enter Your Birth Info', birthday: 'Birthday (Solar)', hour: 'Birth Hour', gender: 'Gender',
    male: 'Male', female: 'Female', submit: 'Generate Chart',
    hourNames: ['Zi (23-1)', 'Chou (1-3)', 'Yin (3-5)', 'Mao (5-7)', 'Chen (7-9)', 'Si (9-11)',
      'Wu (11-13)', 'Wei (13-15)', 'Shen (15-17)', 'You (17-19)', 'Xu (19-21)', 'Hai (21-23)'],
    tab0: 'Life Reading', tab1: 'Annual Fortune',
    klineTitle: 'Life K-Line Chart', ceiling: 'Ceiling', peak: 'Peak',
    personality: 'Personality & Destiny', careerDir: 'Career Direction', lovePattern: 'Love & Relationships',
    wealthPattern: 'Wealth & Finance', healthNote: 'Health Reminders',
    lifeReading: 'Life Overview', advice: 'Key Reminders', chartTitle: 'Zi Wei Chart',
    annualTitle: 'Annual Fortune', thisYear: 'This Year', nextYear: 'Next Year',
    annualCareer: 'Career', annualLove: 'Love', annualWealth: 'Wealth', annualHealth: 'Health',
    annualOverall: 'Overview', annualAdvice: 'Annual Advice',
    highlights: 'Favorable', caution: 'Caution',
    career: 'Career', love: 'Love', wealth: 'Wealth', health: 'Health', children: 'Children',
    fourHua: 'Birth Year Transformations', restart: 'New Chart',
    aiTitle: 'Ask the Master', aiPlaceholder: 'Ask about your destiny...', aiSend: 'Send',
    aiWelcome: "Hi! I'm your AI astrology master. I've analyzed your complete birth chart.\nAsk me anything about career, love, wealth, or health.",
    aiExamples: ['When will my career peak?', 'What career suits me?', "How's my love life this year?"],
    aiLimit: 'Free quota reached (3/3)',
    upgrade: 'Unlock unlimited AI consultation', upgradePrice: '$3.49/mo',
    footer: 'Zi Wei Dou Shu · AI Reading · For Reference Only',
    levelGreat: 'Auspicious', levelGood: 'Good', levelWarn: 'Warning', levelMixed: 'Mixed',
    noMajorStars: 'Empty (borrows opposite stars)',
    decadeLabel: 'Current Decade',
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

// ===== TRANSLATION MAPS =====
const FIVE_EN = { '水二局': 'Water 2nd', '木三局': 'Wood 3rd', '金四局': 'Metal 4th', '土五局': 'Earth 5th', '火六局': 'Fire 6th' };
const ZODIAC_EN = { '鼠': 'Rat', '牛': 'Ox', '虎': 'Tiger', '兔': 'Rabbit', '龙': 'Dragon', '蛇': 'Snake', '马': 'Horse', '羊': 'Goat', '猴': 'Monkey', '鸡': 'Rooster', '狗': 'Dog', '猪': 'Pig' };
const SIGN_EN = { '白羊座': 'Aries', '金牛座': 'Taurus', '双子座': 'Gemini', '巨蟹座': 'Cancer', '狮子座': 'Leo', '处女座': 'Virgo', '天秤座': 'Libra', '天蝎座': 'Scorpio', '射手座': 'Sagittarius', '摩羯座': 'Capricorn', '水瓶座': 'Aquarius', '双鱼座': 'Pisces' };
const BRIGHT_EN = { '庙': 'Temple', '旺': 'Prosperous', '得': 'Gain', '利': 'Beneficial', '平': 'Balanced', '不': 'Weak', '陷': 'Trapped' };
const MUTAGEN_EN = { '禄': 'Lu (Prosperity)', '权': 'Quan (Authority)', '科': 'Ke (Fame)', '忌': 'Ji (Obstruction)' };
const PALACE_EN = { '命宫': 'Life', '兄弟': 'Siblings', '夫妻': 'Spouse', '子女': 'Children', '财帛': 'Wealth', '疾厄': 'Health', '迁移': 'Travel', '交友': 'Friends', '官禄': 'Career', '田宅': 'Property', '福德': 'Fortune', '父母': 'Parents' };
const STAR_EN = { '紫微': 'Emperor', '天机': 'Advisor', '太阳': 'Sun', '武曲': 'Warrior', '天同': 'Harmony', '廉贞': 'Passion', '天府': 'Treasury', '太阴': 'Moon', '贪狼': 'Wolf', '巨门': 'Gate', '天相': 'Minister', '天梁': 'Beam', '七杀': 'Killer', '破军': 'Breaker' };
const TIME_EN = { '子': 'Zi', '丑': 'Chou', '寅': 'Yin', '卯': 'Mao', '辰': 'Chen', '巳': 'Si', '午': 'Wu', '未': 'Wei', '申': 'Shen', '酉': 'You', '戌': 'Xu', '亥': 'Hai' };
const MINOR_STAR_EN = {
  '左辅': 'Left Ast.', '右弼': 'Right Ast.', '天魁': 'Leader', '天钺': 'Hook',
  '文昌': 'Literary', '文曲': 'Musical', '禄存': 'Stored $', '天马': 'Horse',
  '火星': 'Fire', '铃星': 'Bell', '地劫': 'Robbery', '地空': 'Void',
  '擎羊': 'Ram', '陀罗': 'Top', '天喜': 'Joy', '红鸾': 'Phoenix',
  '天刑': 'Punish', '天姚': 'Beauty', '天哭': 'Weep', '天虚': 'Empty',
  '龙池': 'Dragon', '凤阁': 'Tower', '解神': 'Resolver', '天官': 'Official',
  '天福': 'Blessing', '华盖': 'Canopy', '咸池': 'Pool', '天德': 'Virtue',
  '月德': 'Moon V.', '恩光': 'Grace', '天贵': 'Noble', '三台': 'Platform',
  '八座': 'Seat', '孤辰': 'Lonely', '寡宿': 'Widow', '蜚廉': 'Fei',
  '破碎': 'Broken', '天才': 'Genius', '天寿': 'Long Life', '截空': 'Cutoff',
  '旬空': 'Period V.', '台辅': 'Aid', '封诰': 'Seal',
};
const STEM_EN = { '甲': 'Jiǎ', '乙': 'Yǐ', '丙': 'Bǐng', '丁': 'Dīng', '戊': 'Wù', '己': 'Jǐ', '庚': 'Gēng', '辛': 'Xīn', '壬': 'Rén', '癸': 'Guǐ' };
const BRANCH_EN = { '子': 'Zǐ', '丑': 'Chǒu', '寅': 'Yín', '卯': 'Mǎo', '辰': 'Chén', '巳': 'Sì', '午': 'Wǔ', '未': 'Wèi', '申': 'Shēn', '酉': 'Yǒu', '戌': 'Xū', '亥': 'Hài' };
function translateGanZhi(stem, branch, isEN) {
  if (!isEN) return `${stem || ''}${branch || ''}`;
  return `${STEM_EN[stem] || stem || ''} ${BRANCH_EN[branch] || branch || ''}`.trim();
}

// ===== MUTAGEN & BRIGHTNESS EFFECTS =====
const MUTAGEN_EFFECT = {
  '禄': { zh: '而且这方面自带好运加成——财运、人缘、机遇都比一般人更好。', en: 'Plus, you have a natural luck bonus here — fortune, connections, and opportunities are all enhanced.' },
  '权': { zh: '同时你在这方面有很强的掌控欲和决断力，适合争取主导地位。', en: 'You also have strong drive for control here — ideal for taking charge and asserting leadership.' },
  '科': { zh: '同时你在这方面容易获得好名声和贵人帮助，适合公众场合和学术发展。', en: 'You also attract recognition and mentors in this area — favorable for public and academic pursuits.' },
  '忌': { zh: '不过要注意，这方面也是你容易遇到阻碍的地方，需要格外谨慎。', en: 'However, be aware this is also where you face the most obstacles — extra caution is needed.' },
};
const STAR_DOMAIN = {
  '紫微': { zh: '权力和地位', en: 'power and status' }, '天机': { zh: '智慧和变化', en: 'wisdom and change' },
  '太阳': { zh: '光明和公众认可', en: 'public recognition' }, '武曲': { zh: '财务和执行力', en: 'finance and execution' },
  '天同': { zh: '福气和安逸', en: 'blessings and comfort' }, '廉贞': { zh: '感情和艺术创造', en: 'passion and creativity' },
  '天府': { zh: '财库和稳定', en: 'treasury and stability' }, '太阴': { zh: '房产和内在世界', en: 'property and inner life' },
  '贪狼': { zh: '欲望和社交', en: 'ambition and social skills' }, '巨门': { zh: '口才和分析', en: 'communication and analysis' },
  '天相': { zh: '服务和协调', en: 'service and diplomacy' }, '天梁': { zh: '庇荫和教育', en: 'protection and mentorship' },
  '七杀': { zh: '魄力和开拓', en: 'courage and pioneering' }, '破军': { zh: '变革和重建', en: 'disruption and renewal' },
};

// ===== STAR INTERPRETATION DATABASE (14 Main Stars) =====
const SI = {
  '紫微': {
    en: 'Emperor',
    soul: {
      zh: '你天生具有统帅之才，做事果断有魄力，目光长远，骨子里不甘居于人下。你给人的第一印象是沉稳大气、有距离感，但内心志向极高。中年后是你事业的黄金期，有望在所在领域占据核心地位。你的最大优势是领导力和战略眼光，最大挑战是容易孤傲自负——学会倾听和团队合作，能让你走得更远、更高。',
      en: 'You are a natural-born commander — decisive, far-sighted, and fundamentally unwilling to play a supporting role. Your first impression is one of quiet authority and composure, though your ambitions run deep. Your golden period starts in your 40s, when you can rise to a central position in your field. Your greatest strength is strategic leadership; your greatest challenge is arrogance — learning to listen and collaborate will amplify your power significantly.',
    },
    career: { zh: '最适合管理、决策、统筹类岗位，比如企业高管、部门负责人、创业者。你有驾驭大局的能力，不适合机械重复的执行工作。30岁前是积累人脉和经验的关键期，35-50岁是你的事业黄金期，最适合在这个阶段冲击更高的位置。建议：尽早建立自己的管理风格，多培养核心团队。', en: 'Ideal for executive leadership — CEO, department head, or founder. You command the big picture and should avoid repetitive tasks. Before 30, focus on building networks and experience. Ages 35-50 are your golden career window — aim for top positions during this period. Tip: develop your management style early and cultivate a loyal core team.' },
    love: { zh: '感情中你是主导者，需要同样有主见、独立自主的伴侣。太弱势或太依赖的人会让你窒息。28岁以后恋爱、30岁以后结婚往往更幸福——早婚容易因事业心太强而忽略另一半。建议：每周至少留一个完整的晚上给伴侣，这是维系关系的关键。', en: 'You lead in relationships and need a partner who is equally independent and strong-minded. Overly dependent partners will suffocate you. Dating after 28 and marrying after 30 tends to bring more happiness — early marriage suffers from career-first priorities. Tip: reserve at least one full evening per week for your partner — this is key to keeping the relationship strong.' },
    wealth: { zh: '正财运很好，靠能力和地位积累财富。你善于管理大笔资金，有投资眼光，适合长线价值投资和房产。40岁后进入财运鼎盛期。不适合短线投机，容易因为急于求成而亏损。建议：35岁前以储蓄和稳健投资为主，35岁后可以加大投资力度。', en: 'Strong earned income through ability and status. Skilled at managing significant capital with good investment instincts — ideal for long-term value investing and real estate. Wealth peaks after 40. Avoid short-term speculation. Tip: focus on saving and conservative investing before 35, then increase investment allocation after 35.' },
    health: { zh: '最需要注意心血管和血压问题，尤其是45岁以后、高压工作时期。建议：每年做心脏和血管方面的体检，保持每周3次以上有氧运动，控制工作时间避免过劳。50岁后要特别注意血压监测。', en: 'Primary risk: cardiovascular and blood pressure issues, especially after 45 and during high-stress periods. Tip: get annual heart and vascular screenings, maintain 3+ cardio sessions per week, control work hours to prevent burnout. After 50, monitor blood pressure regularly.' },
  },
  '天机': {
    en: 'Advisor',
    soul: {
      zh: '你是天生的谋略家和思考者。头脑敏锐，善于分析和规划，能从复杂局面中找到最优解。但你的弱点也很明显——想太多、犹豫不决，容易在选择中反复纠结。你适合做"军师"角色，用智慧影响他人。内心敏感，情绪波动较大。你的最大优势是分析力和洞察力，最大挑战是需要学会果断行动，别让犹豫错过时机。',
      en: 'You are a born strategist and thinker with a razor-sharp mind that excels at analysis and planning, finding optimal solutions in complex situations. However, your weakness is equally clear — overthinking, indecisiveness, and agonizing over choices. You thrive as the "brain" behind the scenes. Emotionally sensitive with frequent mood shifts. Your greatest strength is analytical insight; your greatest challenge is learning to act decisively before opportunities pass.',
    },
    career: { zh: '最适合顾问、策划、技术、教育、研究类工作，比如数据分析师、战略咨询师、研究员、程序员。你是出色的参谋和幕后推手，不一定要站在台前。25-35岁确定专业方向，35-50岁是专业深度变现的黄金期。切忌频繁跳槽——每次换赛道都是重新开始，选定方向就深耕到底。', en: 'Best suited for advising, planning, tech, and research — data analyst, strategy consultant, researcher, or developer. You excel behind the scenes. Ages 25-35: lock in your specialty. Ages 35-50: monetize your depth. Critical: avoid job-hopping — every career switch resets your progress. Choose a direction and go deep.' },
    love: { zh: '你重视精神交流和灵魂共鸣，外表不是你的第一选项。但你容易想太多、分析过度，把简单的感情变得复杂。最佳伴侣是情绪稳定、有主见但不强势的人。建议：约会时放下手机、关掉分析模式，用心感受对方。恋爱不需要"最优解"。', en: 'You prioritize intellectual connection over appearances, but you overanalyze and complicate simple feelings. Your ideal partner is emotionally stable, opinionated but not domineering. Tip: on dates, put away your phone and turn off your analytical brain — love does not require an "optimal solution."' },
    wealth: { zh: '靠脑力和专业技能赚钱是你的正道。财运有起伏，不适合高风险投资。最好的赚钱方式是知识付费、咨询收费、专业培训等智力变现。30岁前投资自己的技能，30岁后开始做稳健的理财规划。', en: 'Income through intellect and expertise is your proper path. Finances fluctuate, so avoid high-risk investments. Best income channels: knowledge products, consulting fees, professional training. Before 30, invest in your skills. After 30, start conservative wealth planning.' },
    health: { zh: '最需要注意的是神经系统问题：失眠、焦虑、偏头痛。肝胆也需关注。35岁以后要特别小心。建议：坚持每天30分钟的运动（散步即可），睡前1小时不看手机，减少咖啡摄入。定期检查肝功能。', en: 'Primary risks: nervous system issues — insomnia, anxiety, migraines. Liver and gallbladder also need attention, especially after 35. Tips: 30 minutes daily exercise (even walking helps), no screens 1 hour before bed, reduce caffeine intake. Get regular liver function tests.' },
  },
  '太阳': {
    en: 'Sun',
    soul: {
      zh: '你热情大方、乐于助人，像太阳一样照亮周围的人。你天性慷慨，有强烈的责任感和正义感，在社交圈中往往是核心人物。不过你也是个"劳碌命"——习惯付出，却不善于为自己争取回报。你的最大优势是感染力和号召力，最大挑战是学会适当"自私"，在付出的同时也照顾好自己的利益。男性在这方面的运势尤其突出，女性则通过努力获得成就。',
      en: 'You are warm, generous, and naturally helpful — you light up everyone around you. With strong responsibility and a sense of justice, you are often the center of social circles. However, you also tend toward a "busy destiny" — giving freely but struggling to claim rewards for yourself. Your greatest strength is charisma and influence; your greatest challenge is learning healthy self-interest alongside your generosity. For men, this trait is especially favorable; for women, it brings achievement through hard work.',
    },
    career: { zh: '最适合面向大众的工作：教师、媒体人、公务员、公关经理、公益组织负责人。你天生有感染力和号召力，需要"抛头露面"的角色才能发挥最大价值。30-45岁是事业上升最快的阶段。建议：多做公开演讲和社交活动，你的影响力会随着曝光度增长。', en: 'Best suited for public-facing roles: teacher, media personality, civil servant, PR manager, nonprofit leader. Your charisma demands visibility to reach its full potential. Ages 30-45 are your fastest career growth phase. Tip: seek public speaking opportunities — your influence grows with exposure.' },
    love: { zh: '你对伴侣很好，但容易因为忙于事业和社交而忽略另一半。最佳伴侣是温和内敛型——TA能理解你的忙碌并在背后支持你。建议：每天至少20分钟的"专注陪伴"，不看手机不谈工作，只关注对方。这比任何昂贵礼物都管用。', en: 'You treat partners well but neglect them due to career and social commitments. Your ideal partner is the gentle, introverted type who understands your busy nature. Tip: dedicate at least 20 minutes daily to "focused attention" — no phone, no work talk, just your partner. This beats any expensive gift.' },
    wealth: { zh: '赚钱能力不差，但花销也大——你慷慨好客，不善于拒绝朋友的借钱和请客。财来财去是常态。建议：工资到账后立刻转30%到储蓄账户，强制自己存钱。社交花费设置月度上限。40岁前做好储蓄，40岁后财运会更稳定。', en: 'You earn well but spend freely — generous and hospitable, you struggle to say no to friends and social spending. Money flows in and out easily. Tip: auto-transfer 30% of income to savings on payday. Set a monthly cap on social spending. Focus on saving before 40; finances stabilize after.' },
    health: { zh: '最需要注意眼睛、血压和心脏问题，40岁以后风险增加。你容易因为工作太忙而透支身体。建议：每年做眼科检查和心脏检查，保证每天7小时以上睡眠，学会说"不"——减少不必要的应酬。', en: 'Primary risks: eyes, blood pressure, and heart — risk increases after 40. You tend to overwork and burn out. Tips: annual eye and cardiac exams, ensure 7+ hours of sleep daily, learn to say "no" to reduce unnecessary social obligations.' },
  },
  '武曲': {
    en: 'Warrior',
    soul: {
      zh: '你果断刚毅，有天生的理财直觉。性格直来直去，不喜欢拐弯抹角，做事讲究效率和结果。你天生和金钱有缘——对数字敏感、善于理财，这是你的一大天赋。你可能不善言辞，但行动力极强。性格偏孤傲，不容易亲近，但一旦认定就非常忠诚。你的最大优势是执行力和财务直觉，最大挑战是学会柔软沟通，别让刚硬性格赶走身边的人。',
      en: 'You are resolute, decisive, and blessed with an innate financial instinct. Direct, efficiency-driven, and results-oriented — your destiny is closely tied to money. You have a natural talent for numbers and wealth management. You may not be eloquent, but your execution is exceptional. Somewhat aloof and hard to approach, yet deeply loyal once committed. Your greatest strength is execution and financial sense; your greatest challenge is learning softer communication to keep people close.',
    },
    career: { zh: '最适合金融、投资、工程、技术类工作，比如基金经理、投行分析师、工程师、项目经理。你是天生的执行者和理财高手，创业做生意也有优势。不过你的短板在于沟通——最好找个会说话的合伙人互补。30-45岁是创业和投资的最佳时间窗口。建议：先在大公司积累3-5年经验和人脉，再考虑独立发展。', en: 'Best suited for finance, investment, engineering, tech — fund manager, investment analyst, engineer, project manager. Natural executor and financial expert. Entrepreneurship is viable, but partner with a strong communicator. Ages 30-45: prime window for business and investment. Tip: accumulate 3-5 years of experience at established firms before going independent.' },
    love: { zh: '你在感情中有些木讷——不懂浪漫但非常忠诚。容易因为不善表达让对方感到冷漠。30岁以后再结婚更幸福，早婚波折多。建议：每周主动说一次"我爱你"或做一件小事表达关心，哪怕很不自然也要坚持——这对你的关系至关重要。', en: 'You are loyal but inexpressive — partners may mistake sincerity for coldness. Marriage after 30 tends to be much more successful. Tip: make a point of expressing affection weekly — say "I love you" or do a small caring gesture. Even if it feels unnatural, persistence matters enormously for your relationships.' },
    wealth: { zh: '财运是你最大的天赋之一！你天生有赚钱的嗅觉和理财的能力。最适合做价值投资、创业、管理资产。30岁前以储蓄和学习理财为主，30-50岁大胆投资，50岁后转向保守。注意：不要急功近利，你的财富靠的是长期积累而非一夜暴富。推荐投资方向：指数基金、优质房产、实体生意。', en: 'Wealth is one of your greatest gifts! Natural money sense and financial talent. Best for value investing, entrepreneurship, and asset management. Before 30: save and learn investing. Ages 30-50: invest boldly. After 50: shift conservative. Don\'t rush — your wealth comes from accumulation, not overnight wins. Recommended: index funds, quality real estate, hands-on businesses.' },
    health: { zh: '最需要注意肺和呼吸系统问题，秋冬季节尤其要小心。也要注意金属利器造成的外伤风险。建议：戒烟或远离二手烟，秋冬注意保暖，每年做肺功能检查。从事体力劳动或运动时注意安全防护。', en: 'Primary risk: lungs and respiratory system, especially in autumn and winter. Also higher risk of injuries from metal or sharp objects. Tips: quit smoking or avoid secondhand smoke, stay warm in cold months, get annual lung function tests. Use proper safety gear during physical work and sports.' },
  },
  '天同': {
    en: 'Harmony',
    soul: {
      zh: '你温和随性、与世无争，是朋友圈里最好相处的人。你追求安逸舒适的生活，不喜欢激烈竞争。你有不错的艺术天赋和审美能力，但最大的问题是缺乏冲劲——容易安于现状、不思进取。你需要适当的压力来激发潜能，否则容易虚度光阴。你的最大优势是亲和力和好人缘，最大挑战是给自己设定目标和压力，别让舒适区变成了局限。',
      en: 'You are gentle, easygoing, and the most likable person in any circle. You pursue comfort and avoid intense competition. You have artistic talent and aesthetic sense, but your biggest challenge is lack of drive — complacency comes naturally. You need moderate pressure to unlock your potential, otherwise time slips away. Your greatest strength is approachability and likability; your greatest challenge is setting goals and pushing yourself beyond your comfort zone.',
    },
    career: { zh: '最适合服务业、艺术、教育、心理咨询、餐饮等温暖的行业，比如心理咨询师、幼教老师、甜品师、客服主管。不适合高压竞争的环境。你的优势是亲和力和耐心。建议：找一份自己真心热爱的工作，比赚多少钱更重要——你在开心的状态下才能发挥最大价值。35岁以后事业会逐渐稳定。', en: 'Best suited for warm industries: counselor, preschool teacher, pastry chef, customer service lead. Avoid high-pressure competition. Your strength is approachability and patience. Tip: find work you genuinely love — for you, job satisfaction matters more than salary. You perform best when happy. Career stabilizes after 35.' },
    love: { zh: '你是温柔体贴的伴侣，感情中不计较、很包容。但要注意：别太委曲求全——适当表达自己的需求不是自私！你容易被强势的人吸引，但这类关系往往让你委屈。最佳伴侣是温和但有主见的人。建议：恋爱中定期问自己"我开心吗？"，如果答案是否定的，勇敢说出来。', en: 'You are a gentle, caring partner — tolerant and undemanding. But be careful: don\'t sacrifice too much — expressing needs is NOT selfish! You\'re attracted to dominant types, but these relationships often leave you unhappy. Your ideal partner is gentle but decisive. Tip: regularly ask yourself "Am I happy?" in relationships — if not, speak up courageously.' },
    wealth: { zh: '你不太追求大富大贵，够用就好。财运平稳但不会暴富。最适合稳健的储蓄和保守投资（定期存款、国债、货币基金）。最大的财务风险是太安逸导致收入停滞——建议设定一个年收入增长目标，哪怕很小（比如每年涨5%），逼自己进步。', en: 'You don\'t chase great wealth — enough is enough. Finances are steady but unlikely to boom. Best for conservative investments: savings accounts, government bonds, money market funds. Your biggest financial risk is income stagnation from complacency. Tip: set a modest annual income growth target (even 5%) to push yourself forward.' },
    health: { zh: '最需要注意肾脏和泌尿系统，尤其是40岁以后。精神上容易有懒散倾向，缺乏运动会加速身体退化。建议：每天至少走6000步，每周游泳或瑜伽2次。保持社交活动，防止精神懈怠。每年检查肾功能。', en: 'Primary risk: kidneys and urinary system, especially after 40. Mental tendency toward lethargy accelerates physical decline. Tips: walk at least 6,000 steps daily, swim or do yoga twice weekly. Stay socially active to prevent mental apathy. Annual kidney function tests.' },
  },
  '廉贞': {
    en: 'Passion',
    soul: {
      zh: '你是一个复杂而有魅力的人。多才多艺、感情丰富，在艺术和人际方面很有天赋。你的性格有两面性——对外热情奔放，内心却可能孤独敏感。你的感情经历往往比较丰富。做事投入、有韧性，但也容易走极端。你的最大优势是才华和个人魅力，最大挑战是控制执念——好的方面是专注，坏的方面是容易钻牛角尖。',
      en: 'You are a complex, magnetic personality — versatile, emotionally rich, and gifted in arts and social dynamics. You have two sides: outwardly passionate and vibrant, inwardly lonely and sensitive. Your love life tends to be eventful and intense. You are deeply committed and resilient, but prone to extremes. Your greatest strength is talent and personal magnetism; your greatest challenge is managing obsession — focus is good, but tunnel vision is not.',
    },
    career: { zh: '最适合艺术、娱乐、法律、政治、公关等领域，比如设计师、演员、律师、活动策划、自媒体博主。你能文能武，可塑性极强。25-30岁是探索期，30-45岁是发力期。建议：选赛道时跟着热情走，但一旦选定就不要轻易换。别在情绪低落时做重大职业决策。', en: 'Best suited for arts, entertainment, law, politics, PR — designer, performer, attorney, event planner, content creator. Remarkably adaptable across fields. Ages 25-30: exploration phase. Ages 30-45: acceleration phase. Tip: follow your passion when choosing, but commit once you decide. Never make career changes during emotional lows.' },
    love: { zh: '感情浓烈是你的特点——爱得深也伤得深。容易吃醋、占有欲强，这是你感情中最大的隐患。最佳伴侣是情绪稳定、包容力强的人。建议：当嫉妒情绪上来时，先冷静10分钟再反应。感情中要学会信任和放手，抓得太紧反而会把对方推走。', en: 'Intense love is your hallmark — you love deeply and hurt deeply. Jealousy and possessiveness are your biggest relationship risks. Ideal partner: emotionally stable and tolerant. Tip: when jealousy strikes, pause 10 minutes before reacting. Learn trust and letting go — holding too tight pushes people away.' },
    wealth: { zh: '偏财运不错，靠才华和人脉赚钱。收入可能不太稳定，但爆发力很强——一个好项目就能赚很多。最适合创意行业、自媒体变现、版权收入。建议：不稳定收入期间保持3-6个月的生活储备金，高收入时立刻存下50%。', en: 'Good windfall luck — income through talent and connections. Earnings fluctuate but have strong burst potential — one good project can be very lucrative. Best channels: creative industries, content monetization, royalty income. Tip: maintain 3-6 months living expenses in reserves during lean periods; save 50% immediately during high-income periods.' },
    health: { zh: '最需要注意生殖系统和皮肤问题，30岁以后要更加关注。精神压力大时特别容易出现身体症状（如皮肤过敏、失眠）。建议：学会情绪管理和压力释放（冥想、运动、艺术创作都很好），保持规律作息。每年做皮肤检查。', en: 'Primary risks: reproductive system and skin issues, increasingly important after 30. Mental stress directly triggers physical symptoms (skin allergies, insomnia). Tips: practice emotional management — meditation, exercise, and creative outlets all work well. Maintain regular sleep schedule. Annual dermatology checkups.' },
  },
  '天府': {
    en: 'Treasury',
    soul: {
      zh: '你稳重大气、可靠踏实，是别人眼中值得信赖的人。你保守务实，不喜欢冒险，做事有条有理。你天生有守财和积累的能力，善于管理和经营。你可能不是最有冲劲的人，但你是最不容易失败的人——因为你从不做没把握的事。你的最大优势是稳定性和财务管理能力，最大挑战是别太保守，适当冒险才能抓住更大的机会。',
      en: 'You are steady, reliable, and trustworthy — the person everyone counts on. Conservative and practical, you dislike risk and approach everything methodically. You have an innate ability to preserve and accumulate wealth, skilled at management and operations. You may not be the most aggressive, but you are the least likely to fail — because you never act without certainty. Your greatest strength is stability and financial skill; your greatest challenge is learning to take calculated risks for bigger rewards.',
    },
    career: { zh: '最适合银行、政府、大企业、房地产等稳定行业，比如银行经理、公务员、地产经纪人、财务总监。你不适合高风险创业，但在大组织中能步步高升。28-40岁是升职最快的阶段。建议：进一个好平台比什么都重要，选对公司就深耕，靠业绩和口碑稳步上升。', en: 'Best for stable industries: banking, government, real estate, large corporations — bank manager, civil servant, realtor, CFO. Not suited for high-risk startups, but you can climb steadily in established organizations. Ages 28-40: fastest promotion period. Tip: choosing the right platform matters most — join a good company and build your reputation through consistent performance.' },
    love: { zh: '你在感情中追求稳定和安全感，对伴侣忠诚专一，但不太浪漫。你倾向于传统的感情模式——恋爱、结婚、买房、安定下来。最佳伴侣是同样务实稳定的人。建议：偶尔制造一些小浪漫（送花、写卡片、计划约会），你的伴侣会非常感动。28-32岁是最佳结婚年龄。', en: 'You seek stability and security in love — loyal, devoted, but not very romantic. You prefer the traditional path: dating, marriage, homeownership, settling down. Ideal partner: equally practical and stable. Tip: create small romantic gestures occasionally (flowers, cards, planned dates) — your partner will be deeply touched. Best marriage age: 28-32.' },
    wealth: { zh: '财运是你最大的优势之一！你是天生的守财人，善于理财、投资房产、积累资产。虽然不会一夜暴富，但一辈子不缺钱。最推荐的投资方向：优质房产（最适合你）、长期国债、蓝筹股。建议：25岁开始定投，35岁前争取拥有第一套房产。', en: 'Wealth is one of your greatest strengths! You are a natural wealth preserver — skilled at financial management, real estate, and asset building. You won\'t get rich overnight, but you\'ll never lack money. Best investments: quality real estate (your sweet spot), long-term bonds, blue-chip stocks. Tip: start regular investing at 25; aim to own your first property by 35.' },
    health: { zh: '最需要注意脾胃和消化系统问题。你的饮食规律直接影响整体健康。建议：三餐定时定量，少吃生冷和辛辣食物，每天饭后散步15分钟帮助消化。40岁后每年做一次胃镜检查。保持好的饮食习惯是你健康的基石。', en: 'Primary risk: digestive system — stomach and spleen issues. Your eating habits directly impact overall health. Tips: eat three regular meals at fixed times, avoid cold and spicy foods, take 15-minute walks after meals. Annual endoscopy after 40. Consistent eating habits are the foundation of your health.' },
  },
  '太阴': {
    en: 'Moon',
    soul: {
      zh: '你温柔细腻、感性敏锐，有天生的艺术气质和审美能力。你内心世界丰富，善于感知他人的情绪。你与房产和家庭有密切的缘分——买房、置业方面运气不错。你重视内在世界多过外在表现，可能给人文静、不太主动的印象。你的最大优势是敏感的洞察力和艺术天赋，最大挑战是容易多愁善感，需要保持积极的社交来平衡情绪。女性在这方面尤其优雅端庄，男性则内心细腻，感情运不错。',
      en: 'You are gentle, sensitive, and artistically gifted with a rich inner world, naturally attuned to others\' emotions. You have a special connection to property and home — real estate ventures tend to favor you. You value your inner life over outward display, appearing quiet and reserved. Your greatest strength is emotional intelligence and artistic talent; your greatest challenge is managing melancholy — stay socially active to balance your emotions. Women express this as elegance; men as emotional depth with strong relationship luck.',
    },
    career: { zh: '最适合需要细腻感受力的领域：室内设计师、心理咨询师、美容行业、房地产经纪人、摄影师、插画师。与女性相关的行业也很适合。你在夜间工作效率可能更高。28-40岁是事业发展的最佳阶段。建议：发展你的审美优势，把"好品味"转化为收入来源。', en: 'Best for fields requiring sensitivity: interior designer, psychologist, beauty industry, realtor, photographer, illustrator. Industries serving women are favorable. You may be more productive at night. Ages 28-40: prime career phase. Tip: develop your aesthetic advantage — turn "good taste" into a revenue stream.' },
    love: { zh: '你是浪漫多情的人，重视精神层面的连接。感情世界丰富，但容易多愁善感，一句无心的话可能让你难过很久。最佳伴侣是阳光开朗、能给你安全感又懂得欣赏你内心世界的人。建议：感情低落时不要做重大决定，找朋友聊聊或者出去走走。26-32岁是最佳恋爱结婚时期。', en: 'Romantic and emotionally deep, you value spiritual connections — a careless word can linger with you for days. Your ideal partner is sunny, secure, and appreciates your rich inner world. Tip: don\'t make relationship decisions during emotional lows — talk to a friend or take a walk instead. Best period for love and marriage: ages 26-32.' },
    wealth: { zh: '房产运极佳——买房、置业是你最好的投资方式。财富积累是细水长流型，不会暴富但会逐渐殷实。夜间工作或副业可能是额外收入来源。建议：尽早买第一套房，哪怕小一点也好。25岁开始每月固定存款，35岁前拥有自己的不动产。', en: 'Exceptional real estate luck — property is your best investment vehicle. Wealth accumulates gradually, not explosively. Evening side projects may bring extra income. Tip: buy your first property as early as possible, even if small. Start monthly fixed savings at 25; own real estate by 35.' },
    health: { zh: '最需要注意眼睛问题和精神健康（情绪低落、抑郁倾向），女性还要关注妇科。35岁以后风险增加。建议：每天保证至少30分钟的户外阳光，每周和朋友见面1-2次（社交对你的心理健康非常重要）。每年检查视力，保持积极的生活态度。', en: 'Primary risks: eye issues and mental health (mood swings, depression tendency); women should also monitor gynecological health. Risk increases after 35. Tips: get at least 30 minutes of outdoor sunlight daily, meet friends 1-2 times weekly (socializing is crucial for your mental health). Annual eye exams. Maintain an active lifestyle.' },
  },
  '贪狼': {
    en: 'Wolf',
    soul: {
      zh: '你是社交场上的明星——才华横溢、人缘极好、兴趣广泛。你天生有强烈的好奇心和欲望，想要尝试人生的各种可能性。你魅力十足，异性缘极旺，身边从不缺追求者。你的最大优势是才华和适应力，最大挑战是聚焦——什么都想要反而分散精力。成功的关键是选定一个方向深耕，别让多才多艺变成了样样通样样松。',
      en: 'You are the star of any social gathering — talented, charming, and endlessly curious. You have intense desires and want to explore every possibility life offers. Your appeal to the opposite sex is extraordinary — you never lack admirers. Your greatest strength is versatility and adaptability; your greatest challenge is focus — wanting everything dilutes your energy. The key to success is committing to one direction, rather than spreading yourself thin across many.',
    },
    career: { zh: '最适合需要人际魅力和创造力的领域：娱乐主播、销售冠军、社交媒体运营、公关经理、餐饮老板、外交官。你如鱼得水的地方就是需要"搞定人"的场合。25-35岁是最佳探索期，35-50岁是收获期。建议：选定一个方向深耕3-5年，别频繁换赛道——你什么都能做，但只有专注才能做到顶尖。', en: 'Best where charm and creativity are valued: entertainer, top salesperson, social media manager, PR director, restaurant owner, diplomat. You thrive in "people" environments. Ages 25-35: exploration. Ages 35-50: harvest. Tip: commit to one direction for 3-5 years — you can do anything, but only focus gets you to the top.' },
    love: { zh: '你的异性缘极旺，身边从不缺追求者，但也容易沉迷新鲜感。你的感情经历往往非常丰富——这既是优势也是风险。长期关系需要你学会克制和专一。建议：当你觉得"腻了"的时候，不是换人的信号，而是需要和现任一起创造新鲜感的信号。30岁以后的感情更成熟稳定。', en: 'Your romantic appeal is extraordinary — admirers are always around, but so is the temptation of novelty. Your love life is eventful, which is both an advantage and a risk. Tip: when you feel "bored," it\'s not a signal to find someone new — it\'s a signal to create freshness with your current partner. Relationships after 30 tend to be more mature and stable.' },
    wealth: { zh: '你善于赚钱也善于花钱——赚得快花得更快。偏财运不错，适合做生意、投资、经营副业。但消费欲望也很强。建议：收入到手后立刻存30%到不易取出的账户，然后剩下的随意花。把你的社交能力变现——人脉就是钱脉。最忌大手大脚没有积蓄。', en: 'You earn well AND spend well — often faster than you earn. Good windfall luck for business and investment, but spending desire is equally strong. Tip: immediately save 30% of income into a hard-to-access account, then spend the rest freely. Monetize your social skills — your network IS your net worth. Avoid having zero savings.' },
    health: { zh: '最需要注意肝胆问题和性方面的健康，35岁以后风险增加。应酬多时要特别控制饮酒。建议：每周至少有2天完全不喝酒，每年做一次肝功能和泌尿系统检查。社交虽好，但要给身体留休息时间——你的精力不是无限的。', en: 'Primary risks: liver/gallbladder and sexual health, risk rises after 35. Control alcohol during social events. Tips: at least 2 alcohol-free days per week, annual liver function and urological exams. Socializing is great, but give your body rest time — your energy is not unlimited.' },
  },
  '巨门': {
    en: 'Gate',
    soul: {
      zh: '你口才出众、分析能力极强，是天生的辩论家和研究者。你善于发现问题、追根溯源，有很强的批判性思维。但你一生容易遭遇是非口舌——别人可能误解你的善意，或者你的直言不讳得罪人。你的最大优势是分析力和表达力，最大挑战是学会"说对话"——用你的口才去建设关系而非破坏关系，话说对了就是最大的武器。',
      en: 'You have exceptional eloquence and analytical power — a born debater and researcher. You excel at finding problems and getting to the root cause, with strong critical thinking. However, you are prone to disputes and misunderstandings throughout life — others may misread your intentions, or your bluntness may offend. Your greatest strength is communication and analysis; your greatest challenge is using your words to build rather than destroy relationships.',
    },
    career: { zh: '最适合需要口才和分析力的领域：律师、教师、记者、分析师、销售主管、辩论教练。你的专业深度是核心竞争力——越深越赚钱。25-30岁打基础，30-45岁是靠专业变现的黄金期。建议：考证、读研、写文章，不断提升你的"专业权威性"，这是你最好的护城河。', en: 'Best for fields valuing eloquence: lawyer, teacher, journalist, analyst, sales director, debate coach. Your depth of expertise is your moat — the deeper, the more valuable. Ages 25-30: build foundations. Ages 30-45: monetize expertise. Tip: certifications, graduate studies, published writing — continuously build your professional authority.' },
    love: { zh: '你在感情中最大的挑战是"嘴"——容易说太多、说太直，无意中伤人。和伴侣的口角可能频繁。最佳伴侣是大度包容、不爱计较的人。建议：吵架时先深呼吸5次再开口，把"你怎么总是..."换成"我感觉..."。有时候沉默真的是金。', en: 'Your biggest relationship challenge is your mouth — saying too much, too bluntly, unintentionally hurtful. Arguments with partners can be frequent. Ideal partner: generous, easygoing, not easily offended. Tip: take 5 deep breaths before speaking during arguments. Replace "you always..." with "I feel..." — sometimes silence really is golden.' },
    wealth: { zh: '靠口才和专业知识赚钱是你的正道。最适合律师、教师、顾问、培训师等知识变现的工作。但要注意：你容易因为口舌之争导致财务损失（打官司、得罪客户等）。建议：工作中学会"该说的说，不该说的忍"，用你的口才赚钱而不是惹麻烦。', en: 'Income through eloquence and expertise is your proper path — law, teaching, consulting, training. But be careful: disputes and bluntness can cause financial losses (lawsuits, offended clients). Tip: at work, learn "say what needs saying, hold back what doesn\'t" — use your words to earn, not to create problems.' },
    health: { zh: '最需要注意口腔和消化系统问题（胃炎、口腔溃疡等），30岁以后更明显。精神层面容易因为人际冲突而焦虑失眠。建议：保持口腔卫生，少吃辛辣刺激食物。遇到人际矛盾时练习"课题分离"——别人的问题不是你的问题。每周做1-2次放松活动（瑜伽、冥想、泡澡都好）。', en: 'Primary risks: oral and digestive issues (gastritis, mouth ulcers), more pronounced after 30. Mental stress from conflicts causes anxiety and insomnia. Tips: maintain oral hygiene, reduce spicy food. Practice "topic separation" for interpersonal conflicts — others\' problems aren\'t yours. Weekly relaxation activities: yoga, meditation, or hot baths.' },
  },
  '天相': {
    en: 'Minister',
    soul: {
      zh: '你温厚谦和、善于察言观色，是天生的协调者和辅佐者。你为人正派、注重礼仪，在任何团队中都是让人放心的存在。你做事讲规矩、守信用，但也因此容易被条条框框束缚。你的最大优势是协调力和可靠性，最大挑战是培养独立性——你习惯跟随而非引领，容易受周围人影响。找到一个值得跟随的好团队或好领导，是你成功的关键。',
      en: 'You are warm, diplomatic, and naturally attuned to social dynamics — a born coordinator and supporter. Principled, courteous, and the reliable presence in any team. You are rule-abiding and trustworthy, but this can also constrain you. Your greatest strength is coordination and reliability; your greatest challenge is cultivating independence — you habitually follow rather than lead, easily influenced by others. Finding a worthy team or leader is your key to success.',
    },
    career: { zh: '最适合辅助性但不可或缺的角色：行政总监、人力资源经理、公关专员、总经理秘书、公务员。你不一定要做一把手，但你是最好的二把手。在大组织中发展比自己创业有利得多。25-35岁选对平台，35-50岁稳步升迁。建议：找一个你欣赏的领导或团队，跟对人比什么都重要。', en: 'Best for indispensable support roles: admin director, HR manager, PR specialist, executive secretary, civil servant. You may not be the top leader, but you are the best second-in-command. Large organizations suit you better than solo entrepreneurship. Ages 25-35: choose the right platform. Ages 35-50: steady promotion. Tip: find a leader you admire — following the right person matters most.' },
    love: { zh: '你是迁就型的伴侣——善解人意、配合度高。但最大的风险是失去自我！你的好脾气容易被强势的人利用。最佳伴侣是温和但不强势的人。建议：每段关系中都要有自己的"底线清单"（哪些事情是不能妥协的），写下来并坚持。你值得被好好对待。', en: 'You are an accommodating partner — empathetic and cooperative. But your biggest risk is losing yourself! Your good temper can be exploited. Ideal partner: gentle but not domineering. Tip: in every relationship, maintain a "non-negotiables list" (things you won\'t compromise on) — write it down and stick to it. You deserve to be treated well.' },
    wealth: { zh: '稳定的薪资收入最适合你。不善于冒险投资，但稳扎稳打可以积累可观的财富。最推荐：房产、指数基金、银行理财。建议：每月固定存入收入的25%到投资账户，选择自动定投不用操心。30岁前开始，50岁时会有惊喜。你不需要暴富，稳定就是最大的财富。', en: 'Steady salary income suits you best. Not suited for risky investments, but methodical saving accumulates impressive wealth. Best options: property, index funds, bank products. Tip: auto-invest 25% of monthly income — set it and forget it. Start before 30; you\'ll be pleasantly surprised by 50. You don\'t need to get rich quick — stability IS wealth.' },
    health: { zh: '最需要注意皮肤和过敏问题（湿疹、荨麻疹等），换季时特别明显。工作压力容易直接转化为身体症状。建议：保持皮肤清洁和保湿，换季时注意防护。学会说"不"来减轻压力——你不需要让所有人满意。每年做一次过敏原检测。', en: 'Primary risks: skin and allergy issues (eczema, hives), especially during seasonal changes. Work stress directly manifests as physical symptoms. Tips: maintain skin hygiene and moisturizing, protect during season changes. Learn to say "no" to reduce stress — you don\'t need to please everyone. Annual allergy testing.' },
  },
  '天梁': {
    en: 'Beam',
    soul: {
      zh: '你正直稳重、乐于助人，有长者之风。你天生具有教导和保护他人的倾向，在朋友圈中往往扮演"大哥大姐"的角色。你一生贵人运很好，遇到困难时总有人帮忙，逢凶化吉的能力很强。你的最大优势是正义感和贵人运，最大挑战是别太爱说教——好为人师有时会让人觉得你自以为是。多做善事，晚年运势会特别好。',
      en: 'You are upright, mature, and naturally inclined to help and protect others. You often play the "big brother/sister" role in your circles. You enjoy strong mentor luck throughout life — help arrives when you need it most, with a remarkable ability to turn bad situations around. Your greatest strength is integrity and the support network you build; your greatest challenge is the tendency to lecture — unsolicited advice can come across as self-righteous. Charitable works pay dividends, especially in later years.',
    },
    career: { zh: '最适合助人的行业：医生、教师、社工、慈善机构负责人、公务员、养老行业。你的耐心和正义感是核心优势。和老人、弱势群体相关的工作特别适合你。30-50岁是事业稳步上升的阶段，50岁以后反而越来越好。建议：不要急于求成，你的价值在于积累和口碑——时间是你最好的朋友。', en: 'Best for helping professions: doctor, teacher, social worker, nonprofit leader, civil servant, elder care. Your patience and justice are core strengths. Ages 30-50: steady career growth. After 50: you actually get better with age. Tip: don\'t rush — your value comes from accumulation and reputation. Time is your greatest ally.' },
    love: { zh: '你适合"大龄恋爱"——30岁以后的感情往往更成熟幸福。你有年龄差恋爱的倾向，可能偏好比自己大或小不少的人。你在感情中是保护者的角色，需要被需要。建议：不要急着结婚，遇到对的人比什么都重要。32岁以后结婚幸福指数更高。', en: 'You suit "late-blooming love" — relationships after 30 tend to be more mature and happy. You lean toward age-gap partnerships, preferring significantly older or younger partners. In love, you are the protector who needs to be needed. Tip: don\'t rush marriage — finding the right person matters most. Marriages after 32 have higher happiness rates for you.' },
    wealth: { zh: '你不以财富为人生目标，但一辈子不缺钱——你的贵人运很好，关键时刻总有人帮你。最适合的收入来源是服务和教育相关的工作。建议：不需要太担心财务安全，但建议30岁前建立一个稳定的储蓄计划。你的财务安全来自于你的好人缘和贵人帮助。', en: 'Wealth is not your life goal, but you will never lack money — your mentor luck ensures help at critical moments. Best income from service and education fields. Tip: don\'t worry too much about finances, but establish a stable savings plan before 30. Your financial security comes from your excellent relationships and the support network you naturally build.' },
    health: { zh: '好消息：你的健康基底很好，是天生的长寿体质。但要注意脾胃消化问题和慢性病的预防（尤其是50岁以后）。建议：保持规律的作息和饮食即可，不需要特别折腾。每天散步、早睡早起就是最好的养生。60岁以后注意定期全面体检。', en: 'Good news: your health foundation is strong — you are naturally inclined toward longevity. Watch for digestive issues and chronic disease prevention, especially after 50. Tips: maintain regular eating and sleeping habits — nothing extreme is needed. Daily walks and early bedtimes are your best health practices. Comprehensive annual exams after 60.' },
  },
  '七杀': {
    en: 'Killer',
    soul: {
      zh: '你是天生的将军——霸气、果断、敢于冒险。你有极强的开拓精神和执行力，面对困难从不退缩。你性格刚烈，独来独往，不喜欢受人约束。你的人生通常大起大落，但你享受这种刺激。你的最大优势是勇气和开拓精神，最大挑战是学会柔软——过于孤傲容易与人对立，刚柔并济才能成大事。',
      en: 'You are a born warrior — bold, decisive, and unafraid of risk. You have exceptional pioneering spirit and execution ability, never retreating from difficulty. Your personality is fierce and independent — you dislike constraints. Your life tends toward dramatic highs and lows, which you actually enjoy. Your greatest strength is courage and pioneering spirit; your greatest challenge is learning flexibility — excessive confrontation creates enemies, and balance is key to greatness.',
    },
    career: { zh: '最适合需要魄力和开拓精神的领域：创业者、投资人、军警、运动员、探险家、高管变革推动者。你不适合朝九晚五的稳定工作——你需要挑战和刺激。你的竞争优势在于别人不敢做的事你敢。25-30岁打基础，30-45岁是最佳冲刺期。建议：创业前先在行业里积累资源，不要裸辞冒险。', en: 'Best for bold, pioneering roles: entrepreneur, investor, military, athlete, adventurer, corporate change agent. 9-to-5 routines will suffocate you — you need challenge. Your edge: you dare what others won\'t. Ages 25-30: build foundations. Ages 30-45: prime sprint period. Tip: accumulate industry resources before launching a business — don\'t leap without a net.' },
    love: { zh: '感情波折较多——你太强势、太独立，容易让伴侣感到有距离。最佳伴侣是同样有主见但懂得退让的人。建议：在亲密关系中主动展示脆弱的一面，这不是示弱，而是信任。每周至少有一个"温柔时刻"——给对方做顿饭、说句体贴的话。30岁以后的感情更成熟。', en: 'Love life tends turbulent — intensity and independence create distance. Ideal partner: equally opinionated but willing to compromise. Tip: show vulnerability in intimate relationships — this is not weakness, it\'s trust. Have at least one "gentle moment" weekly — cook for your partner, say something caring. Relationships after 30 are more mature.' },
    wealth: { zh: '大起大落型财运——你要么很有钱，要么赔得很惨。你适合高风险高回报的投资，但一定要控制仓位，绝不把所有钱投在一个项目上。建议：投资时设定"止损线"（比如亏20%就撤），赚钱时存入安全账户至少30%。最适合的方向：创业、股权投资、高增长行业。保持至少6个月的生活储备金不动。', en: 'Feast-or-famine finances — either very wealthy or heavy losses. High-risk, high-reward investing suits you, but always manage position size and never concentrate in one project. Tip: set stop-loss rules (exit at 20% loss), save at least 30% of profits to a safe account. Best directions: startups, equity investment, high-growth sectors. Maintain 6 months of living expenses untouched.' },
    health: { zh: '最需要注意外伤、手术和意外事故，尤其是从事高风险运动或驾车时。你的高能量生活方式让你容易忽视身体信号。建议：开车时专注驾驶，运动时穿戴防护装备，不要忽视小伤小痛。35岁以后每年做全面体检。保持适度的运动而不是极限运动。', en: 'Primary risks: injuries, surgeries, and accidents, especially during high-risk sports and driving. Your high-energy lifestyle makes you ignore body signals. Tips: focus while driving, wear protective gear during sports, never dismiss minor pains. Annual comprehensive exams after 35. Moderate exercise over extreme sports.' },
  },
  '破军': {
    en: 'Breaker',
    soul: {
      zh: '你是天生的变革者——不安于现状，永远在寻找下一个挑战。你的一生注定多变动，换工作、换城市、甚至换人生方向对你来说是常态。你习惯打破旧格局再重建新秩序——先破后立。你的最大优势是创新力和勇气，最大挑战是坚持——太不安分、缺乏持续性。如果能在变化中坚持一个核心方向，你将大有作为。',
      en: 'You are a born disruptor — restless, always seeking the next challenge. Your life is destined for frequent changes: jobs, cities, even life directions shift regularly. You break old patterns to create new order — destroy before rebuilding. Your greatest strength is innovation and courage; your greatest challenge is consistency — restlessness scatters your energy. If you can maintain a core direction amid the changes, you will achieve great things.',
    },
    career: { zh: '最适合需要创新和变革的领域：创业、产品研发、改革推动者、自由职业者、顾问、创意总监。你不适合一成不变的工作——需要新鲜感和挑战。但注意：每次变动至少积累2-3年经验再走，频繁跳槽会浪费你的积累。25-35岁是最佳尝试期，35岁以后选定一个方向扎根。建议：保留一个"核心技能"不变，其他的随意变化。', en: 'Best for innovation and change: entrepreneur, product developer, change agent, freelancer, consultant, creative director. Monotonous work will drive you crazy — novelty is essential. But note: stay at least 2-3 years per move to accumulate value. Ages 25-35: prime exploration phase. After 35: root in one direction. Tip: keep one "core skill" constant; let everything else change.' },
    love: { zh: '感情生活也多变——你可能经历多段认真的感情。你对伴侣有较高要求，发现问题后更倾向于放弃而非修复。最佳伴侣是包容力强、能跟上你节奏变化的人。建议：每段关系遇到问题时先尝试解决，别一遇困难就想换人。有时候坚持才是真正的勇敢。30岁以后的感情更稳定。', en: 'Your love life mirrors your restless nature — multiple serious relationships are likely. You have high standards and tend to abandon rather than repair. Ideal partner: tolerant, adaptable to your changing rhythm. Tip: when problems arise, try solving them first — don\'t default to starting over. Sometimes persistence is the real courage. Relationships after 30 are more stable.' },
    wealth: { zh: '大起大落型财运——你可能一夜暴富也可能突然负债。每次人生变动都会带来财务波动。建议：无论收入多高都保持6个月的应急储备金不动。投资分散到3个以上不同领域。最适合的赚钱方式：靠创新和变革赚钱（新项目、新赛道、新模式），但不要All in单一项目。', en: 'Extreme financial swings — overnight wealth or sudden debt are both possible. Each life change brings financial volatility. Tips: always maintain 6 months emergency fund regardless of income. Diversify investments across 3+ sectors. Best income strategy: earn through innovation (new projects, new sectors, new models), but never go all-in on a single venture.' },
    health: { zh: '最需要注意意外伤害和皮肤问题。你的高能量生活方式让身体容易疲劳。建议：每次重大变动后给自己1-2周的恢复期，不要连轴转。保持充足睡眠（你比别人更需要休息），每天涂防晒霜保护皮肤。35岁以后控制生活节奏，别把自己当铁人。', en: 'Primary risks: accidental injuries and skin issues. Your high-energy lifestyle leads to exhaustion. Tips: after major life changes, allow 1-2 weeks of recovery — don\'t push non-stop. Prioritize sleep (you need more rest than most), wear sunscreen daily. After 35, pace yourself — you\'re not invincible.' },
  },
};

// ===== SCORING TABLES =====
const BRIGHT_SCORE = { '庙': 5, '旺': 4, '得': 3, '利': 2, '平': 1, '不': 0, '陷': -1 };
const MUTAGEN_SCORE = { '禄': 4, '权': 3, '科': 2, '忌': -4 };
const POS_MINOR = ['左辅', '右弼', '天魁', '天钺', '文昌', '文曲', '禄存', '天马'];
const NEG_MINOR = ['火星', '铃星', '地劫', '地空', '擎羊', '陀罗'];
const DIM_PALACES = {
  career: ['官禄', '命宫', '迁移'], love: ['夫妻', '命宫', '福德'],
  wealth: ['财帛', '命宫', '田宅'], health: ['疾厄', '命宫', '父母'],
  children: ['子女', '命宫', '田宅'],
};
const DIM_WEIGHTS = [0.5, 0.3, 0.2];
const PALACE_TO_DIM = { '命宫': 'overall', '迁移': 'overall', '官禄': 'career', '交友': 'career', '夫妻': 'love', '福德': 'love', '财帛': 'wealth', '田宅': 'wealth', '疾厄': 'health', '父母': 'health', '子女': 'children', '兄弟': 'social' };

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
                {isEN ? (PALACE_EN[p.name] || p.name) : p.name}
                {ming ? (isEN ? " ★" : " [命]") : ""}{body ? (isEN ? " ◎" : " [身]") : ""}
              </span>
              <span style={{ fontSize: 7, color: "#ccc" }}>{translateGanZhi(p.heavenlyStem, p.earthlyBranch, isEN)}</span>
            </div>
            <div style={{ flex: 1 }}>
              {p.majorStars.map((s, i) => (
                <div key={i} style={{ fontSize: isEN ? 9 : 11, fontWeight: 600, color: "#111", lineHeight: 1.2 }}>
                  {isEN ? (STAR_EN[s.name] || s.name) : s.name}
                  {s.brightness && <span style={{ fontSize: 7, marginLeft: 2, color: "#aaa" }}>{isEN ? (BRIGHT_EN[s.brightness] || s.brightness) : s.brightness}</span>}
                  {s.mutagen && <span style={{ fontSize: 7, marginLeft: 2, padding: "0 2px", borderRadius: 2, background: HUA_BG[s.mutagen] || "#f3f4f6", color: HUA_COLOR[s.mutagen] || "#888" }}>{isEN ? (MUTAGEN_EN[s.mutagen] || s.mutagen) : s.mutagen}</span>}
                </div>
              ))}
              {p.minorStars.length > 0 && <div style={{ fontSize: 8, color: "#bbb", lineHeight: 1.1, marginTop: 1 }}>{p.minorStars.map(s => isEN ? (MINOR_STAR_EN[s.name] || s.name) : s.name).join(" ")}</div>}
              {p.adjectiveStars?.length > 0 && <div style={{ fontSize: 7, color: "#d4d4d4", lineHeight: 1.1, marginTop: 1 }}>{p.adjectiveStars.map(s => isEN ? (MINOR_STAR_EN[s.name] || s.name) : s.name).join(" ")}</div>}
            </div>
            {p.decadal?.range && <div style={{ fontSize: 7, color: "#ddd", textAlign: "right" }}>{p.decadal.range[0]}-{p.decadal.range[1]}</div>}
          </div>
        );
      })}
      <div style={{ gridColumn: "2/4", gridRow: "2/4", background: "#fafafa", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 8, gap: 2 }}>
        <div style={{ fontSize: isEN ? 13 : 15, fontWeight: 800, letterSpacing: isEN ? 1 : 4 }}>{isEN ? "Zi Wei Dou Shu" : "紫微斗数"}</div>
        <div style={{ width: "40%", height: 1, background: "#ddd" }} />
        <div style={{ fontSize: 11, color: "#666", textAlign: "center", lineHeight: 1.5 }}>
          <strong>{isEN ? astrolabe.solarDate : astrolabe.chineseDate}</strong>
        </div>
        <div style={{ fontSize: 10, color: "#888" }}>
          {isEN ? (FIVE_EN[astrolabe.fiveElementsClass] || astrolabe.fiveElementsClass) : astrolabe.fiveElementsClass}
          {' · '}
          {isEN ? (ZODIAC_EN[astrolabe.zodiac] || astrolabe.zodiac) : astrolabe.zodiac}
        </div>
      </div>
    </div>
  );
}

// ===== SCORING ENGINE (Enhanced) =====
const STAR_RANK = {
  '紫微': 1.4, '天府': 1.3, '武曲': 1.3, '太阳': 1.2, '太阴': 1.2,
  '七杀': 1.25, '破军': 1.2, '贪狼': 1.15, '廉贞': 1.1,
  '天机': 1.1, '天同': 1.0, '巨门': 1.1, '天相': 1.05, '天梁': 1.05,
};

function scorePalace(palace) {
  if (!palace) return 25;
  let s = 35;
  for (const star of palace.majorStars) {
    const rank = STAR_RANK[star.name] || 1.0;
    s += (BRIGHT_SCORE[star.brightness] || 1) * 6 * rank;
    if (star.mutagen) s += (MUTAGEN_SCORE[star.mutagen] || 0) * 4;
  }
  for (const star of palace.minorStars) {
    const n = star.name;
    if (POS_MINOR.some(p => n.includes(p))) s += 5;
    if (NEG_MINOR.some(p => n.includes(p))) s -= 5;
    if (star.mutagen) s += (MUTAGEN_SCORE[star.mutagen] || 0) * 3;
  }
  if (palace.majorStars.length === 0) s -= 12;
  return Math.max(5, Math.min(100, s));
}

function computeChartEnergy(astrolabe) {
  const life = scorePalace(astrolabe.palace('命宫'));
  const fortune = scorePalace(astrolabe.palace('福德'));
  let body = 50;
  for (const p of astrolabe.palaces) {
    if (p.isBodyPalace) { body = scorePalace(p); break; }
  }
  const avg = (life * 0.4 + fortune * 0.3 + body * 0.3);
  if (avg >= 70) return 1.6;
  if (avg >= 55) return 1.2;
  if (avg >= 40) return 1.0;
  if (avg >= 25) return 0.75;
  return 0.55;
}

function hasVolatileStars(astrolabe) {
  const allStars = [];
  astrolabe.palaces.forEach(p => {
    p.majorStars.forEach(s => allStars.push(s.name));
    p.minorStars.forEach(s => allStars.push(s.name));
  });
  const hasKiller = allStars.includes('七杀') || allStars.includes('破军');
  const hasCalm = allStars.includes('天同') || allStars.includes('太阴');
  const hasFire = allStars.some(n => n.includes('火星') || n.includes('铃星'));
  return { hasKiller, hasCalm, hasFire };
}

function generateKLineFromChart(astrolabe) {
  const result = {};
  const birthYear = parseInt(astrolabe.solarDate.split('-')[0]);
  const now = new Date();
  const curAge = now.getFullYear() - birthYear;
  const energy = computeChartEnergy(astrolabe);
  const { hasKiller, hasCalm, hasFire } = hasVolatileStars(astrolabe);

  for (const [dim, palaceNames] of Object.entries(DIM_PALACES)) {
    const natalScores = palaceNames.map((pn, i) => {
      const p = astrolabe.palace(pn);
      return scorePalace(p) * DIM_WEIGHTS[i];
    });
    const natalBase = natalScores.reduce((a, b) => a + b, 0);
    const points = [];
    const palacesArr = astrolabe.palaces;

    for (let age = 0; age <= 80; age += 5) {
      let decadePalace = null;
      for (const p of palacesArr) {
        if (p.decadal?.range && age >= p.decadal.range[0] && age <= p.decadal.range[1]) {
          decadePalace = p; break;
        }
      }
      let decadeBonus = 0;
      if (decadePalace) {
        const ds = scorePalace(decadePalace);
        decadeBonus = (ds - 35) * 0.8;
        // Extra bonus/penalty from decade palace mutagen
        for (const star of decadePalace.majorStars) {
          if (star.mutagen) decadeBonus += (MUTAGEN_SCORE[star.mutagen] || 0) * 2;
        }
      }

      let ageFactor;
      if (dim === 'health') {
        ageFactor = age <= 30 ? 0.9 + age * 0.003 : 1.0 - (age - 30) * 0.006;
      } else if (dim === 'children') {
        ageFactor = age < 20 ? 0 : age <= 40 ? (age - 20) * 0.05 : 1.0 - (age - 40) * 0.008;
      } else {
        ageFactor = age <= 10 ? 0.15 + age * 0.035 : age <= 50 ? 0.5 + (age - 10) * 0.0125 : 1.0 - (age - 50) * 0.007;
      }

      // Volatility modifiers
      let volatility = 0;
      if (hasKiller && (dim === 'career' || dim === 'wealth')) {
        volatility = (Math.sin(age * 0.6) * 8);
      }
      if (hasCalm && (dim === 'love' || dim === 'health')) {
        volatility *= 0.3; // Smoother curves
      }
      if (hasFire && age >= 35 && age <= 50) {
        volatility += (dim === 'career' || dim === 'wealth') ? 6 : 0;
      }

      const raw = (natalBase + decadeBonus + volatility) * Math.max(0.1, ageFactor) * energy;
      const scaled = Math.round(raw * 3.0);
      points.push([age, dim === 'children' && age < 20 ? null : Math.max(5, Math.min(600, scaled))]);
    }

    const validPts = points.filter(p => p[1] != null);
    const maxVal = Math.max(...validPts.map(p => p[1]));
    const peakPt = validPts.find(p => p[1] === maxVal);
    const peakAge = peakPt ? peakPt[0] : 40;

    result[dim] = { points, max: Math.ceil(maxVal / 50) * 50, peak: `${Math.max(0, peakAge - 5)}-${peakAge + 5}`, hide: false };
  }
  result._curAge = curAge;
  return result;
}

// ===== FOLLOW-UP QUESTION GENERATOR =====
function getSectionQuestions(key, palace, lang) {
  const isEN = lang === 'en';
  const stars = palace?.majorStars.map(s => isEN ? (STAR_EN[s.name] || s.name) : s.name).join(isEN ? ' and ' : '和') || '';
  const QS = {
    personality: isEN ? [
      `With ${stars} in my Life Palace, what are my biggest strengths and blind spots?`,
      `What lifestyle and daily habits best support my personality type?`,
    ] : [
      `我命宫有${stars}，性格上最大的优势和盲点是什么？`,
      `什么生活习惯和方式最适合我的命格？`,
    ],
    career: isEN ? [
      `What 3 specific careers or industries suit me best? Why?`,
      `When exactly will my career peak? How should I prepare?`,
      `Should I start my own business or work for others?`,
    ] : [
      `我最适合的3个具体行业或岗位是什么？为什么？`,
      `我事业的巅峰期在什么年龄？该如何把握？`,
      `我适合创业还是打工？`,
    ],
    love: isEN ? [
      `What type of partner is my ideal match? Age, personality, occupation?`,
      `When is the best time for me to marry? What patterns should I avoid?`,
    ] : [
      `我最理想的伴侣是什么类型？年龄差、性格、职业？`,
      `我什么时候结婚最好？感情中该避免什么模式？`,
    ],
    wealth: isEN ? [
      `What investment strategy works best for me? Stocks, real estate, or business?`,
      `When is my financial peak? What traps should I avoid?`,
    ] : [
      `我最适合什么投资方式？股票、房产、还是创业？`,
      `我财运最旺在什么年龄？需要避开什么财务陷阱？`,
    ],
    health: isEN ? [
      `Which specific organs are most at risk for me? How serious, and at what age?`,
      `What specific prevention methods and lifestyle changes can protect my health?`,
    ] : [
      `我身体最容易出问题的器官是什么？严不严重？什么年龄段最危险？`,
      `我该怎么预防和化解健康隐患？有什么具体的养生方法？`,
    ],
  };
  return QS[key] || [];
}

// ===== LIFE READING GENERATOR (Star-Specific) =====
function brightMod(brightness, lang) {
  const b = BRIGHT_SCORE[brightness] || 1;
  if (b >= 4) return lang === 'en' ? ' This influence is at its strongest in your chart — the effects above are very pronounced.' : '这些特质在你身上表现得非常明显，影响力很强。';
  if (b >= 2) return lang === 'en' ? ' This influence is moderately strong — you\'ll experience these traits steadily.' : '这些特质在你身上表现稳定，是可以依赖的优势。';
  if (b >= 0) return '';
  return lang === 'en' ? ' This influence is somewhat muted — you may need to work harder to activate these qualities.' : '这些特质需要你主动去激发，不会自动显现，但通过努力可以弥补。';
}

function buildStarReading(palace, category, lang) {
  if (!palace) return '';
  const isEN = lang === 'en';
  const stars = palace.majorStars;
  if (stars.length === 0) {
    return isEN
      ? 'This palace is empty — it borrows power from the opposite palace, giving you flexibility and adaptability in this area. The specific influence depends on the stars in the opposing position.'
      : '此宫为空宫，借对宫星耀之力。这赋予你在此方面的灵活性和适应力，具体影响取决于对宫星耀的组合。';
  }

  let text = '';
  for (const star of stars) {
    const entry = SI[star.name];
    if (!entry) continue;

    const reading = entry[category];
    if (!reading) continue;

    const starLabel = isEN ? (entry.en || STAR_EN[star.name] || star.name) : star.name;
    const brightLabel = star.brightness ? (isEN ? (BRIGHT_EN[star.brightness] || star.brightness) : star.brightness) : '';

    if (category === 'soul') {
      text += (isEN ? reading.en : reading.zh);
      text += brightMod(star.brightness, lang);
    } else {
      // Conclusion first, technical reference in parentheses at the end
      text += (isEN ? reading.en : reading.zh);
      const ref = brightLabel ? `${starLabel}·${brightLabel}` : starLabel;
      text += isEN ? ` (${ref})` : `（${ref}）`;
    }

    if (star.mutagen) {
      const me = MUTAGEN_EFFECT[star.mutagen];
      if (me) text += ' ' + (isEN ? me.en : me.zh);
    }
    text += '\n\n';
  }
  return text.trim();
}

// ===== HOLISTIC DIMENSION CONTEXT (cross-chart analysis) =====
function buildDimensionContext(astrolabe, dimKey, mainPalaceName, lang) {
  const isEN = lang === 'en';
  const parts = [];

  // Relevant palaces for each dimension (primary + related)
  const DIM_RELATED = {
    personality: ['命宫', '迁移', '福德'],
    career: ['官禄', '命宫', '迁移', '财帛'],
    love: ['夫妻', '命宫', '福德', '迁移'],
    wealth: ['财帛', '命宫', '田宅', '福德'],
    health: ['疾厄', '命宫', '父母', '福德'],
  };
  const relatedPalaces = DIM_RELATED[dimKey] || [mainPalaceName];

  // 1. Body palace significance
  const bodyPalace = astrolabe.palaces.find(p => p.isBodyPalace);
  if (bodyPalace && relatedPalaces.includes(bodyPalace.name)) {
    const bodyStars = bodyPalace.majorStars.map(s => isEN ? (STAR_EN[s.name] || s.name) : s.name).join(isEN ? '+' : '+');
    const palRef = isEN ? (PALACE_EN[bodyPalace.name] || bodyPalace.name) : bodyPalace.name;
    parts.push(isEN
      ? `Your Body Palace falls in ${palRef} — this means your life energy, sense of achievement, and personal identity are deeply tied to this area.${bodyStars ? ` With ${bodyStars} here, this dimension carries extra weight in your life fulfillment.` : ''}`
      : `你的身宫落在${bodyPalace.name}——这意味着你一生的成就感和身份认同都与这方面密切相关。${bodyStars ? `身宫有${bodyStars}加持，这是你人生最重要的发力方向。` : ''}`
    );
  }

  // 2. Four transformations directly affecting this dimension
  const dimFourHua = [];
  astrolabe.palaces.forEach(p => {
    p.majorStars.forEach(s => {
      if (s.mutagen && relatedPalaces.includes(p.name)) {
        dimFourHua.push({ star: s.name, mutagen: s.mutagen, palace: p.name });
      }
    });
  });
  for (const eff of dimFourHua) {
    const sn = isEN ? (STAR_EN[eff.star] || eff.star) : eff.star;
    const pn = isEN ? (PALACE_EN[eff.palace] || eff.palace) : eff.palace;
    const domain = STAR_DOMAIN[eff.star];
    const dm = domain ? (isEN ? domain.en : domain.zh) : '';
    if (eff.mutagen === '禄') {
      parts.push(isEN
        ? `Key advantage: ${sn} carries Prosperity in your ${pn} Palace${dm ? ` — ${dm} is naturally blessed for you` : ''}. This gives you a built-in luck bonus here that most people don't have. Lean into this strength proactively.`
        : `关键优势：${eff.star}化禄落在${eff.palace}${dm ? `——${dm}方面是你天生的福报` : ''}。大多数人没有这个加成，你要主动利用好这份好运。`
      );
    } else if (eff.mutagen === '忌') {
      parts.push(isEN
        ? `Key challenge: ${sn} carries Obstruction in your ${pn} Palace${dm ? ` — ${dm} faces recurring obstacles` : ''}. This is your lifelong growth area. Don't avoid difficulties here — facing them head-on actually turns challenges into advantages.`
        : `关键课题：${eff.star}化忌落在${eff.palace}${dm ? `——${dm}方面是你这辈子反复遇到挑战的地方` : ''}。不要回避这里的困难——正面应对反而能化险为夷，这是你成长最快的领域。`
      );
    } else if (eff.mutagen === '权') {
      parts.push(isEN
        ? `Driving force: ${sn} carries Authority in your ${pn} Palace — you have unusually strong ambition and control in this area. Use this energy to take charge and lead.`
        : `驱动力：${eff.star}化权落在${eff.palace}——你在这方面有异常强烈的掌控欲和进取心，适合主动争取话语权和主导地位。`
      );
    } else if (eff.mutagen === '科') {
      parts.push(isEN
        ? `Hidden asset: ${sn} carries Fame in your ${pn} Palace — you naturally attract recognition and mentors in this area. Public-facing activities here will boost your reputation significantly.`
        : `隐性优势：${eff.star}化科落在${eff.palace}——你在这方面容易获得好名声和贵人帮助，适合做对外公开的活动来提升声誉。`
      );
    }
  }

  // 3. Opposing palace influence (对宫)
  const OPPOSITE = { '命宫': '迁移', '迁移': '命宫', '夫妻': '官禄', '官禄': '夫妻', '财帛': '福德', '福德': '财帛', '疾厄': '父母', '父母': '疾厄', '子女': '田宅', '田宅': '子女', '兄弟': '交友', '交友': '兄弟' };
  const oppName = OPPOSITE[mainPalaceName];
  if (oppName) {
    const oppPalace = astrolabe.palace(oppName);
    if (oppPalace?.majorStars.length > 0) {
      const oppStars = oppPalace.majorStars.map(s => {
        const sn = isEN ? (STAR_EN[s.name] || s.name) : s.name;
        const br = s.brightness ? (isEN ? BRIGHT_EN[s.brightness] : s.brightness) : '';
        return br ? `${sn}(${br})` : sn;
      }).join(isEN ? ', ' : '、');
      const oppRef = isEN ? (PALACE_EN[oppName] || oppName) : oppName;
      parts.push(isEN
        ? `Opposite palace influence: ${oppStars} in your ${oppRef} Palace casts its influence across, adding a layer of ${oppPalace.majorStars.map(s => { const d = STAR_DOMAIN[s.name]; return d ? d.en : ''; }).filter(Boolean).join(' and ')} energy to this area.`
        : `对宫影响：${oppName}有${oppStars}，隔宫照入，为这个领域增添了${oppPalace.majorStars.map(s => { const d = STAR_DOMAIN[s.name]; return d ? d.zh : ''; }).filter(Boolean).join('和')}的能量。`
      );
    }
  }

  // 4. Best decade for this dimension
  const palacesArr = astrolabe.palaces;
  let bestDecade = null, bestScore = 0;
  for (const p of palacesArr) {
    if (!p.decadal?.range) continue;
    // Score this decade by checking stars relevant to this dimension
    const ds = scorePalace(p);
    // Also check if decade palace has mutagen bonus for this dimension
    let bonus = 0;
    for (const s of p.majorStars) {
      if (s.mutagen === '禄' || s.mutagen === '权') bonus += 10;
      if (s.mutagen === '忌') bonus -= 8;
    }
    const total = ds + bonus;
    if (total > bestScore) { bestScore = total; bestDecade = p; }
  }
  if (bestDecade?.decadal?.range) {
    const r = bestDecade.decadal.range;
    const decStars = bestDecade.majorStars.map(s => isEN ? (STAR_EN[s.name] || s.name) : s.name).join(isEN ? '+' : '+');
    parts.push(isEN
      ? `Peak timing: Your strongest decade overall is ages ${r[0]}-${r[1]} (${decStars} period)${bestScore > 70 ? ' — this is an exceptionally powerful window, plan major moves around it.' : ' — align your biggest goals with this energy.'}`
      : `巅峰时机：你最强的大限在${r[0]}-${r[1]}岁（${decStars}大限）${bestScore > 70 ? '——这是一个非常强势的时间窗口，重大决策要围绕这个阶段来规划。' : '——把你最大的目标和这个时期的能量对齐。'}`
    );
  }

  // 5. Minor star influences in main palace
  const mainP = astrolabe.palace(mainPalaceName);
  if (mainP) {
    const posMinor = mainP.minorStars.filter(s => POS_MINOR.some(p => s.name.includes(p)));
    const negMinor = mainP.minorStars.filter(s => NEG_MINOR.some(p => s.name.includes(p)));
    if (posMinor.length > 0) {
      const names = posMinor.map(s => isEN ? (MINOR_STAR_EN[s.name] || s.name) : s.name).join(isEN ? ', ' : '、');
      parts.push(isEN
        ? `Supporting stars: ${names} in this palace provide additional luck, mentors, and favorable circumstances.`
        : `辅助力量：此宫有${names}，增加了贵人运、好运和有利条件。`
      );
    }
    if (negMinor.length > 0) {
      const names = negMinor.map(s => isEN ? (MINOR_STAR_EN[s.name] || s.name) : s.name).join(isEN ? ', ' : '、');
      parts.push(isEN
        ? `Watch out: ${names} in this palace may bring occasional disruptions or unexpected obstacles — stay alert and don't get complacent.`
        : `注意事项：此宫有${names}，可能带来偶尔的干扰或意外阻碍——保持警觉，不要掉以轻心。`
      );
    }
  }

  return parts.length > 0 ? '\n\n' + parts.join('\n\n') : '';
}

function generateLifeReading(astrolabe, lang) {
  const isEN = lang === 'en';
  const sections = [];

  // 1. Personality (命宫)
  const soulPalace = astrolabe.palace('命宫');
  const soulText = buildStarReading(soulPalace, 'soul', lang) + buildDimensionContext(astrolabe, 'personality', '命宫', lang);
  if (soulText) {
    sections.push({
      key: 'personality',
      title: isEN ? 'Personality & Destiny' : '性格命格',
      subtitle: (() => {
        const stars = soulPalace?.majorStars.map(s => isEN ? (STAR_EN[s.name] || s.name) : s.name).join(isEN ? ' + ' : '、');
        return isEN ? `Life Palace: ${stars || 'Empty'}` : `命宫 · ${stars || '空宫'}`;
      })(),
      text: soulText,
      color: C.t1,
      questions: getSectionQuestions('personality', soulPalace, lang),
    });
  }

  // 2. Career (官禄宫)
  const careerPalace = astrolabe.palace('官禄');
  const careerText = buildStarReading(careerPalace, 'career', lang) + buildDimensionContext(astrolabe, 'career', '官禄', lang);
  if (careerText) {
    sections.push({
      key: 'career',
      title: isEN ? 'Career Direction' : '事业方向',
      subtitle: (() => {
        const stars = careerPalace?.majorStars.map(s => isEN ? (STAR_EN[s.name] || s.name) : s.name).join(isEN ? ' + ' : '、');
        return isEN ? `Career Palace: ${stars || 'Empty'}` : `官禄宫 · ${stars || '空宫'}`;
      })(),
      text: careerText,
      color: C.career,
      questions: getSectionQuestions('career', careerPalace, lang),
    });
  }

  // 3. Love (夫妻宫)
  const lovePalace = astrolabe.palace('夫妻');
  const loveText = buildStarReading(lovePalace, 'love', lang) + buildDimensionContext(astrolabe, 'love', '夫妻', lang);
  if (loveText) {
    sections.push({
      key: 'love',
      title: isEN ? 'Love & Relationships' : '感情模式',
      subtitle: (() => {
        const stars = lovePalace?.majorStars.map(s => isEN ? (STAR_EN[s.name] || s.name) : s.name).join(isEN ? ' + ' : '、');
        return isEN ? `Spouse Palace: ${stars || 'Empty'}` : `夫妻宫 · ${stars || '空宫'}`;
      })(),
      text: loveText,
      color: C.love,
      questions: getSectionQuestions('love', lovePalace, lang),
    });
  }

  // 4. Wealth (财帛宫)
  const wealthPalace = astrolabe.palace('财帛');
  const wealthText = buildStarReading(wealthPalace, 'wealth', lang) + buildDimensionContext(astrolabe, 'wealth', '财帛', lang);
  if (wealthText) {
    sections.push({
      key: 'wealth',
      title: isEN ? 'Wealth & Finance' : '财运格局',
      subtitle: (() => {
        const stars = wealthPalace?.majorStars.map(s => isEN ? (STAR_EN[s.name] || s.name) : s.name).join(isEN ? ' + ' : '、');
        return isEN ? `Wealth Palace: ${stars || 'Empty'}` : `财帛宫 · ${stars || '空宫'}`;
      })(),
      text: wealthText,
      color: C.wealth,
      questions: getSectionQuestions('wealth', wealthPalace, lang),
    });
  }

  // 5. Health (疾厄宫)
  const healthPalace = astrolabe.palace('疾厄');
  const healthText = buildStarReading(healthPalace, 'health', lang) + buildDimensionContext(astrolabe, 'health', '疾厄', lang);
  if (healthText) {
    sections.push({
      key: 'health',
      title: isEN ? 'Health Reminders' : '健康提醒',
      subtitle: (() => {
        const stars = healthPalace?.majorStars.map(s => isEN ? (STAR_EN[s.name] || s.name) : s.name).join(isEN ? ' + ' : '、');
        return isEN ? `Health Palace: ${stars || 'Empty'}` : `疾厄宫 · ${stars || '空宫'}`;
      })(),
      text: healthText,
      color: C.health,
      questions: getSectionQuestions('health', healthPalace, lang),
    });
  }

  // Advice
  const advice = [];
  let horoscope;
  try { horoscope = astrolabe.horoscope(); } catch {}
  const curDecade = horoscope?.decadal;
  if (curDecade) {
    advice.push(isEN
      ? `Current decade: ${translateGanZhi(curDecade.heavenlyStem, curDecade.earthlyBranch, true)}. This 10-year period shapes your current opportunities — align your efforts with its energy.`
      : `当前大限：${curDecade.heavenlyStem}${curDecade.earthlyBranch}大限。这个十年决定了你当前的机遇方向——顺势而为是关键。`);
  }

  // Four transformations
  const fourHua = [];
  astrolabe.palaces.forEach(p => {
    p.majorStars.forEach(s => {
      if (s.mutagen) fourHua.push({ star: s.name, type: s.mutagen, palace: p.name });
    });
  });

  if (fourHua.find(h => h.type === '忌')) {
    const ji = fourHua.find(h => h.type === '忌');
    const palaceDim = PALACE_TO_DIM[ji.palace];
    const dimLabel = palaceDim ? (isEN ? palaceDim : { overall: '整体', career: '事业', love: '感情', wealth: '财务', health: '健康', children: '子女', social: '社交' }[palaceDim] || ji.palace) : ji.palace;
    advice.push(isEN
      ? `Life challenge: ${STAR_EN[ji.star] || ji.star} carries Ji (Obstruction) in your ${PALACE_EN[ji.palace] || ji.palace} Palace. Your ${dimLabel} area requires lifelong attention and extra care.`
      : `人生课题：${ji.star}化忌落在${ji.palace}。你的${dimLabel}方面是一生需要重点关注的领域，遇到困难不要回避，正面应对反而能化险为夷。`);
  }
  if (fourHua.find(h => h.type === '禄')) {
    const lu = fourHua.find(h => h.type === '禄');
    const palaceDim = PALACE_TO_DIM[lu.palace];
    const dimLabel = palaceDim ? (isEN ? palaceDim : { overall: '整体', career: '事业', love: '感情', wealth: '财务', health: '健康', children: '子女', social: '社交' }[palaceDim] || lu.palace) : lu.palace;
    advice.push(isEN
      ? `Greatest blessing: ${STAR_EN[lu.star] || lu.star} carries Lu (Prosperity) in your ${PALACE_EN[lu.palace] || lu.palace} Palace. Your ${dimLabel} area is your strongest natural advantage — lean into it.`
      : `最大福报：${lu.star}化禄落在${lu.palace}。你的${dimLabel}方面是你最大的天然优势，要充分利用。`);
  }

  // Life summary — synthesize key insights
  const summary = (() => {
    const soul = soulPalace?.majorStars[0];
    const soulName = soul ? (isEN ? (STAR_EN[soul.name] || soul.name) : soul.name) : '';
    const careerStar = careerPalace?.majorStars[0];
    const careerName = careerStar ? (isEN ? (STAR_EN[careerStar.name] || careerStar.name) : careerStar.name) : '';
    const luHua = fourHua.find(h => h.type === '禄');
    const jiHua = fourHua.find(h => h.type === '忌');
    const luArea = luHua ? (isEN ? (PALACE_EN[luHua.palace] || luHua.palace) : luHua.palace) : '';
    const jiArea = jiHua ? (isEN ? (PALACE_EN[jiHua.palace] || jiHua.palace) : jiHua.palace) : '';

    if (isEN) {
      let s = '';
      if (soulName) s += `Your core nature is shaped by the ${soulName} star — this defines your fundamental temperament and life direction. `;
      if (careerName) s += `In career, the ${careerName} star guides your professional path. `;
      if (luArea) s += `Your greatest natural blessing lies in the ${luArea} area — lean into this strength. `;
      if (jiArea) s += `Your life lesson centers on ${jiArea} — challenges here are opportunities for growth. `;
      s += 'Focus on your strengths, stay aware of your blind spots, and align your actions with your chart\'s natural energy for the best outcomes.';
      return s;
    } else {
      let s = '';
      if (soulName) s += `你的命格核心是${soulName}星——这决定了你的根本性格和人生方向。`;
      if (careerName) s += `事业上，${careerName}星主导你的职业路径。`;
      if (luArea) s += `你最大的天赋在${luArea}方面——充分发挥这个优势是成功的关键。`;
      if (jiArea) s += `人生课题集中在${jiArea}方面——这里的挑战是你成长的机会。`;
      s += '发挥所长，留意盲区，顺应命盘的能量方向，方能事半功倍。';
      return s;
    }
  })();

  return { sections, advice, fourHua, summary };
}

// ===== ANNUAL READING GENERATOR (Per-Dimension) =====
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
    const mutagenStars = yearly?.mutagen || [];
    const mutagenTypes = ['禄', '权', '科', '忌'];

    // Map yearly mutagen to palaces
    const yearlyEffects = [];
    mutagenStars.forEach((starName, i) => {
      if (!starName || i >= 4) return;
      const type = mutagenTypes[i];
      let palaceName = null;
      try {
        const starObj = astrolabe.star(starName);
        const starPalace = starObj?.palace();
        palaceName = starPalace?.name;
      } catch {}
      yearlyEffects.push({ star: starName, type, palace: palaceName });
    });

    // Build per-dimension readings
    const dimensions = [];
    const dimMap = {
      career: { palaces: ['官禄', '命宫', '迁移'], label: isEN ? 'Career' : '事业', color: C.career },
      love: { palaces: ['夫妻', '福德', '子女'], label: isEN ? 'Love' : '感情', color: C.love },
      wealth: { palaces: ['财帛', '田宅'], label: isEN ? 'Wealth' : '财运', color: C.wealth },
      health: { palaces: ['疾厄', '父母'], label: isEN ? 'Health' : '健康', color: C.health },
    };

    for (const [dim, config] of Object.entries(dimMap)) {
      const effects = yearlyEffects.filter(e => e.palace && config.palaces.includes(e.palace));
      let text = '';
      let level = 'neutral';

      if (effects.length > 0) {
        for (const eff of effects) {
          const domain = STAR_DOMAIN[eff.star];
          const domainText = domain ? (isEN ? domain.en : domain.zh) : eff.star;
          const starRef = isEN ? (STAR_EN[eff.star] || eff.star) : eff.star;
          const palaceRef = isEN ? (PALACE_EN[eff.palace] || eff.palace) : eff.palace;
          if (eff.type === '禄') {
            text += isEN
              ? `Great year for ${domainText}! Expansion and new initiatives are strongly favored. Seize opportunities proactively. (${starRef} Lu → ${palaceRef})\n`
              : `今年${domainText}方面运势大旺，是拓展和突破的好时机，适合主动争取机会。（${starRef}化禄入${palaceRef}）\n`;
            level = 'great';
          } else if (eff.type === '权') {
            text += isEN
              ? `Your influence and control over ${domainText} strengthens significantly. Take charge and assert your position. (${starRef} Quan → ${palaceRef})\n`
              : `${domainText}方面掌控力增强，适合主动出击、争取更多主导权和话语权。（${starRef}化权入${palaceRef}）\n`;
            if (level !== 'great') level = 'good';
          } else if (eff.type === '科') {
            text += isEN
              ? `Recognition and reputation in ${domainText} are on the rise. Favorable for learning, exams, and public-facing activities. (${starRef} Ke → ${palaceRef})\n`
              : `${domainText}方面声名提升，利学习、考试和社交活动，贵人运旺。（${starRef}化科入${palaceRef}）\n`;
            if (level === 'neutral') level = 'good';
          } else if (eff.type === '忌') {
            text += isEN
              ? `Challenges ahead in ${domainText}. Exercise caution, avoid major decisions, and be patient — obstacles are temporary. (${starRef} Ji → ${palaceRef})\n`
              : `${domainText}方面容易遇到阻碍和波折。谨慎行事，避免冲动决策，耐心等待转机。（${starRef}化忌入${palaceRef}）\n`;
            level = level === 'great' ? 'mixed' : 'warn';
          }
        }
      } else {
        text = isEN
          ? `No major yearly transformations directly affect this area. A relatively stable year for ${config.label.toLowerCase()} — maintain your current course.`
          : `今年没有重大流年四化直接影响此方面，运势相对平稳。保持现有节奏即可。`;
      }

      const dimQs = {
        career: isEN
          ? [`What specific career moves should I make in ${year}?`, `Are there months I should be extra cautious at work?`]
          : [`${year}年事业上我应该做什么具体的调整？`, `哪几个月工作上要特别小心？`],
        love: isEN
          ? [`How will my love life change in ${year}? Any key months?`, `What should I do to improve my relationships this year?`]
          : [`${year}年感情会有什么变化？哪几个月是关键？`, `今年我该怎么改善感情运？`],
        wealth: isEN
          ? [`What are the best months for investment in ${year}?`, `What financial risks should I watch for this year?`]
          : [`${year}年什么时候适合投资？`, `今年需要注意什么财务风险？`],
        health: isEN
          ? [`What health issues should I watch for in ${year}? Which months?`, `What specific prevention steps should I take this year?`]
          : [`${year}年健康上要注意什么？哪几个月最危险？`, `今年有什么具体的养生建议？`],
      };
      // Generate action suggestion based on level
      let action = '';
      const actionMap = {
        career: {
          great: isEN ? 'Action: Pursue promotions, launch new projects, expand your network actively.' : '行动建议：积极争取晋升，启动新项目，主动拓展人脉。',
          good: isEN ? 'Action: Steady progress — consolidate gains and build your reputation.' : '行动建议：稳中求进，巩固成果，积累口碑。',
          warn: isEN ? 'Action: Stay low-profile, avoid job changes, focus on skill-building.' : '行动建议：低调行事，避免跳槽，专注提升技能。',
          mixed: isEN ? 'Action: Seize opportunities cautiously — advance but keep a safety net.' : '行动建议：谨慎把握机会——进取的同时留好后路。',
          neutral: isEN ? 'Action: Maintain current momentum, no major changes needed.' : '行动建议：保持现有节奏，无需大幅调整。',
        },
        love: {
          great: isEN ? 'Action: Perfect time for dating, proposals, or deepening commitment.' : '行动建议：适合表白、求婚或深化感情，主动出击。',
          good: isEN ? 'Action: Invest time in relationships — small gestures create big impact.' : '行动建议：多花时间经营感情，小细节带来大改变。',
          warn: isEN ? 'Action: Avoid rushing into new relationships. Focus on self-improvement.' : '行动建议：不宜急于开展新恋情，专注自我提升。',
          mixed: isEN ? 'Action: Communicate openly with your partner — patience resolves conflicts.' : '行动建议：多与伴侣坦诚沟通，耐心化解矛盾。',
          neutral: isEN ? 'Action: Stable period — nurture existing connections.' : '行动建议：感情平稳期，用心维护现有关系。',
        },
        wealth: {
          great: isEN ? 'Action: Increase investment, explore side income, negotiate raises.' : '行动建议：适合加大投资，开拓副业，争取加薪。',
          good: isEN ? 'Action: Steady wealth growth — stick to proven investment strategies.' : '行动建议：财运稳增，坚持已验证的投资策略。',
          warn: isEN ? 'Action: Tighten budget, avoid large purchases, build emergency fund.' : '行动建议：控制开支，避免大额消费，储备应急资金。',
          mixed: isEN ? 'Action: Diversify investments — don\'t concentrate risk.' : '行动建议：分散投资，不要把风险集中在一处。',
          neutral: isEN ? 'Action: Maintain current financial plan, avoid speculation.' : '行动建议：维持现有财务计划，避免投机。',
        },
        health: {
          great: isEN ? 'Action: Great time to start fitness routines or health goals.' : '行动建议：适合开始健身计划或健康目标。',
          good: isEN ? 'Action: Maintain healthy habits — exercise and sleep are key.' : '行动建议：保持良好习惯，运动和睡眠是关键。',
          warn: isEN ? 'Action: Schedule checkups, reduce stress, prioritize rest.' : '行动建议：安排体检，减少压力，优先保证休息。',
          mixed: isEN ? 'Action: Monitor weak areas, don\'t ignore minor symptoms.' : '行动建议：关注薄弱环节，不要忽视小症状。',
          neutral: isEN ? 'Action: Maintain regular health routines.' : '行动建议：保持规律的健康作息。',
        },
      };
      action = actionMap[dim]?.[level] || actionMap[dim]?.neutral || '';

      dimensions.push({ dim, label: config.label, text: text.trim(), level, color: config.color, questions: dimQs[dim] || [], action });
    }

    // Overall level
    const hasLu = yearlyEffects.some(e => e.type === '禄');
    const hasJi = yearlyEffects.some(e => e.type === '忌');
    let level = 'good';
    if (hasLu && !hasJi) level = 'great';
    else if (hasJi && !hasLu) level = 'warn';
    else if (hasJi && hasLu) level = 'mixed';

    // Overall advice
    const advice = [];
    if (hasLu) {
      const luEff = yearlyEffects.find(e => e.type === '禄');
      advice.push(isEN
        ? `This year's biggest opportunity lies in ${PALACE_EN[luEff?.palace] || 'your chart'} — seize it proactively.`
        : `今年最大的机遇在${luEff?.palace || '盘面'}方面——要主动把握。`);
    }
    if (hasJi) {
      const jiEff = yearlyEffects.find(e => e.type === '忌');
      advice.push(isEN
        ? `This year's main challenge is in ${PALACE_EN[jiEff?.palace] || 'your chart'} — be patient and avoid impulsive actions.`
        : `今年的主要挑战在${jiEff?.palace || '盘面'}方面——保持耐心，避免冲动。`);
    }

    const decadal = horo.decadal;
    advice.push(isEN
      ? `You are in the ${translateGanZhi(decadal?.heavenlyStem, decadal?.earthlyBranch, true)} decade — ${year === thisYear ? 'align your actions with this decade\'s energy' : 'prepare for the shifts this period brings'}.`
      : `${year}年处于${decadal?.heavenlyStem || ''}${decadal?.earthlyBranch || ''}大限——${year === thisYear ? '顺势而为是当下最佳策略' : '提前做好规划和准备'}。`);

    results.push({
      year,
      ganZhi: translateGanZhi(yearly?.heavenlyStem, yearly?.earthlyBranch, isEN),
      level,
      dimensions,
      advice,
    });
  }

  return results;
}

// ===== AI CHAT COMPONENT (Improved) =====
function AIChat({ astrolabe, lang, pendingQ, clearPendingQ, unlocked }) {
  const t = TX[lang];
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const sendRef = useRef(null);

  const todayKey = `ai_count_${new Date().toDateString()}`;
  const getCount = () => parseInt(localStorage.getItem(todayKey) || '0');
  const incCount = () => { const c = getCount() + 1; localStorage.setItem(todayKey, c); return c; };

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  // Handle external questions from follow-up buttons
  useEffect(() => {
    if (pendingQ && !loading && (unlocked || getCount() < 3)) {
      setOpen(true);
      // Small delay to ensure chat is open before sending
      setTimeout(() => { if (sendRef.current) sendRef.current(pendingQ); }, 100);
      if (clearPendingQ) clearPendingQ();
    }
  }, [pendingQ]);

  const send = useCallback(async (text) => {
    const userMsg = (text || input).trim();
    if (!userMsg || loading) return;
    if (!unlocked && getCount() >= 3) return;
    setInput('');
    setMsgs(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);
    incCount();

    const chartSummary = astrolabe ? JSON.stringify({
      date: astrolabe.chineseDate, solarDate: astrolabe.solarDate,
      gender: astrolabe.gender, fiveElements: astrolabe.fiveElementsClass,
      zodiac: astrolabe.zodiac, sign: astrolabe.sign,
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
  }, [input, loading, msgs, astrolabe, lang]);

  // Keep sendRef in sync
  useEffect(() => { sendRef.current = send; }, [send]);

  const remaining = unlocked ? 999 : 3 - getCount();

  if (!open) {
    return (
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }}>
        <div style={{ maxWidth: 540, margin: '0 auto' }}>
          <button onClick={() => setOpen(true)} style={{ width: '100%', padding: '14px 20px', background: '#111', color: '#fff', border: 'none', borderRadius: '16px 16px 0 0', fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 -4px 20px rgba(0,0,0,0.15)' }}>
            <span style={{ fontSize: 18 }}>💬</span>
            {t.aiTitle}
            <span style={{ fontSize: 11, opacity: 0.7, marginLeft: 4 }}>{unlocked ? (lang === 'en' ? '(Unlimited)' : '(无限)') : `(${remaining}/3 ${lang === 'en' ? 'free' : '免费'})`}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', bottom: 0, right: 0, left: 0, height: '60vh', background: '#fff', borderTop: '1px solid #e5e5e5', borderRadius: '16px 16px 0 0', boxShadow: '0 -4px 20px rgba(0,0,0,0.1)', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
      <style>{`@keyframes aiBounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }`}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #eee' }}>
        <span style={{ fontSize: 15, fontWeight: 700 }}>{t.aiTitle}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: remaining > 0 ? '#888' : C.danger }}>{unlocked ? '∞' : `${remaining}/3`}</span>
          <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#999' }}>×</button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {msgs.length === 0 && (
          <div style={{ marginTop: 10 }}>
            <div style={{ background: '#f2f2f7', padding: '12px 16px', borderRadius: 14, fontSize: 14, lineHeight: 1.7, color: '#111', whiteSpace: 'pre-wrap', marginBottom: 12 }}>{t.aiWelcome}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {t.aiExamples.map((ex, i) => (
                <button key={i} onClick={() => send(ex)} disabled={remaining <= 0} style={{ padding: '10px 14px', background: '#fff', border: '1px solid #e5e5e5', borderRadius: 10, fontSize: 13, color: '#555', cursor: remaining > 0 ? 'pointer' : 'not-allowed', textAlign: 'left' }}>{ex}</button>
              ))}
            </div>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
            <div style={{ maxWidth: '80%', padding: '10px 14px', borderRadius: 14, background: m.role === 'user' ? '#111' : '#f2f2f7', color: m.role === 'user' ? '#fff' : '#111', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 10 }}>
            <div style={{ maxWidth: '80%', padding: '12px 18px', borderRadius: 14, background: '#f2f2f7', fontSize: 14, color: '#999', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="ai-loading-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#999', animation: 'aiBounce 1.2s infinite ease-in-out', animationDelay: '0s' }} />
              <span className="ai-loading-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#999', animation: 'aiBounce 1.2s infinite ease-in-out', animationDelay: '0.2s' }} />
              <span className="ai-loading-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#999', animation: 'aiBounce 1.2s infinite ease-in-out', animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      {remaining > 0 ? (
        <div style={{ display: 'flex', gap: 8, padding: '10px 16px', borderTop: '1px solid #eee' }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder={t.aiPlaceholder} style={{ flex: 1, padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: 10, fontSize: 14, outline: 'none' }} />
          <button onClick={() => send()} disabled={loading || !input.trim()} style={{ padding: '10px 18px', background: '#111', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.5 : 1 }}>{t.aiSend}</button>
        </div>
      ) : (
        <div style={{ padding: '14px 16px', borderTop: '1px solid #eee', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: C.danger, marginBottom: 4 }}>{t.aiLimit}</div>
          <div style={{ fontSize: 11, color: '#999', marginBottom: 8 }}>{lang === 'en' ? 'Subscription is tied to your current device/network' : '订阅绑定当前设备/网络'}</div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button onClick={async () => {
              try {
                const res = await fetch('/api/checkout', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ mode: 'subscription' }),
                });
                const data = await res.json();
                if (data.url) window.location.href = data.url;
                else alert(data.error || (lang === 'en' ? 'Payment not configured yet.' : '支付功能尚未配置。'));
              } catch { alert(lang === 'en' ? 'Payment error. Please try again.' : '支付出错，请重试。'); }
            }} style={{ padding: '10px 24px', background: '#111', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>{t.upgrade} — {t.upgradePrice}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== MAIN PAGE =====
export default function MingPanPage() {
  const [lang, setLang] = useState('zh');
  const [page, setPage] = useState('input');
  const [tab, setTab] = useState(0);
  const [birthday, setBirthday] = useState('');
  const [hour, setHour] = useState(0);
  const [gender, setGender] = useState('女');
  const [chart, setChart] = useState(null);
  const [kline, setKline] = useState(null);
  const [lifeData, setLifeData] = useState(null);
  const [annualData, setAnnualData] = useState(null);
  const [pendingQ, setPendingQ] = useState(null);
  const [aiUnlocked, setAiUnlocked] = useState(false);
  const t = TX[lang];

  // Check for payment success on load (IP-based, stored in localStorage)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ai_unlocked');
      if (stored) {
        const exp = parseInt(stored);
        if (exp > Date.now()) { setAiUnlocked(true); return; }
        else localStorage.removeItem('ai_unlocked');
      }
      const params = new URLSearchParams(window.location.search);
      if (params.get('unlocked') === 'true' || params.get('session_id')) {
        localStorage.setItem('ai_unlocked', String(Date.now() + 30 * 24 * 60 * 60 * 1000));
        setAiUnlocked(true);
        window.history.replaceState({}, '', '/mingpan');
      }
    }
  }, []);

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
    } catch {
      alert(lang === 'en' ? 'Invalid date or time. Please check.' : '日期或时间有误，请检查。');
    }
  };

  useEffect(() => {
    if (chart) {
      setLifeData(generateLifeReading(chart, lang));
      setAnnualData(generateAnnualReading(chart, lang));
    }
  }, [lang, chart]);

  // Translate info bar
  const infoBar = chart ? (lang === 'en'
    ? `${chart.solarDate} · ${TIME_EN[chart.time?.[0]] || chart.time} · ${FIVE_EN[chart.fiveElementsClass] || chart.fiveElementsClass} · ${ZODIAC_EN[chart.zodiac] || chart.zodiac} · ${SIGN_EN[chart.sign] || chart.sign}`
    : `${chart.chineseDate} · ${chart.time} · ${chart.fiveElementsClass} · ${chart.zodiac} · ${chart.sign}`
  ) : '';

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
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: C.t2, display: 'block', marginBottom: 6 }}>{t.birthday}</label>
                <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)} style={{ width: '100%', padding: 12, border: '1px solid #e5e5e5', borderRadius: 10, fontSize: 16, background: '#fafafa', color: C.t1 }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: C.t2, display: 'block', marginBottom: 6 }}>{t.hour}</label>
                <select value={hour} onChange={e => setHour(parseInt(e.target.value))} style={{ width: '100%', padding: 12, border: '1px solid #e5e5e5', borderRadius: 10, fontSize: 16, background: '#fafafa', color: C.t1 }}>
                  {t.hourNames.map((h, i) => <option key={i} value={i}>{h}</option>)}
                </select>
              </div>
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
          <div style={{ paddingBottom: 100 }}>
            {/* Info bar */}
            <div style={{ textAlign: 'center', padding: '12px 0', fontSize: 12, color: '#999' }}>{infoBar}</div>

            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid #e5e5e5", marginBottom: 12, position: 'sticky', top: 0, background: C.bg, zIndex: 10 }}>
              {[t.tab0, t.tab1].map((tl, i) => (
                <button key={i} onClick={() => setTab(i)} style={{ flex: 1, padding: "12px 0", fontSize: 14, fontWeight: tab === i ? 600 : 400, color: tab === i ? "#111" : "#999", background: "none", border: "none", borderBottom: tab === i ? "2px solid #111" : "2px solid transparent", cursor: "pointer" }}>{tl}</button>
              ))}
            </div>

            {/* ===== TAB 0: Life Reading ===== */}
            {tab === 0 && (<>
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

              {/* Life Reading Sections */}
              {lifeData && (<>
                {lifeData.sections.map((sec, i) => (
                  <div key={sec.key} style={{ ...sC, borderLeft: `3px solid ${sec.color}`, marginTop: i === 0 ? 6 : 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2, color: "#111" }}>{sec.title}</div>
                    <div style={{ fontSize: 11, color: "#999", marginBottom: 10 }}>{sec.subtitle}</div>
                    {sec.text.split("\n\n").filter(Boolean).map((p, j) => (
                      <p key={j} style={{ fontSize: 13, color: "#444", lineHeight: 1.9, margin: "0 0 10px" }}>{p}</p>
                    ))}
                    {sec.questions?.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8, paddingTop: 8, borderTop: '1px solid #f0f0f0' }}>
                        <div style={{ fontSize: 11, color: '#bbb', marginBottom: 2 }}>{lang === 'en' ? 'Ask AI for details:' : '问AI了解更多：'}</div>
                        {sec.questions.map((q, qi) => (
                          <button key={qi} onClick={() => setPendingQ(q)} style={{ padding: '8px 12px', background: '#f8f8f8', border: '1px solid #e8e8e8', borderRadius: 8, fontSize: 12, color: '#555', cursor: 'pointer', textAlign: 'left', lineHeight: 1.4 }}>
                            💬 {q}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {lifeData.advice.length > 0 && (
                  <div style={{ ...sC, borderLeft: "3px solid #111", marginTop: 6 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{t.advice}</div>
                    {lifeData.advice.map((a, i) => (
                      <p key={i} style={{ fontSize: 13, color: "#555", lineHeight: 1.8, margin: "0 0 6px" }}>· {a}</p>
                    ))}
                  </div>
                )}

                {lifeData.summary && (
                  <div style={{ ...sC, borderLeft: '3px solid #7c3aed', marginTop: 6, background: '#faf5ff' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: '#7c3aed' }}>{lang === 'en' ? 'Life Summary' : '人生总结'}</div>
                    <p style={{ fontSize: 13, color: '#555', lineHeight: 1.9, margin: 0 }}>{lifeData.summary}</p>
                  </div>
                )}

                {lifeData.fourHua.length > 0 && (
                  <div style={{ ...sC, marginTop: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{t.fourHua}</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {lifeData.fourHua.map((h, i) => (
                        <span key={i} style={{ fontSize: 12 }}>
                          {lang === 'en' ? (STAR_EN[h.star] || h.star) : h.star}
                          <span style={{ fontSize: 8, marginLeft: 2, padding: "0 3px", borderRadius: 2, color: "#fff", background: HUA_COLOR[h.type] || "#888" }}>{lang === 'en' ? (MUTAGEN_EN[h.type] || h.type) : h.type}</span>
                          <span style={{ color: "#bbb", fontSize: 10 }}>→{lang === 'en' ? (PALACE_EN[h.palace] || h.palace) : h.palace}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>)}

              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, paddingBottom: 6, borderBottom: "2px solid #111" }}>{t.chartTitle}</div>
                <PalaceGrid astrolabe={chart} lang={lang} />
              </div>
            </>)}

            {/* ===== TAB 1: Annual Reading ===== */}
            {tab === 1 && annualData && (<>
              {annualData.map((yr, yi) => (
                <div key={yi} style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, paddingBottom: 6, borderBottom: "2px solid #111" }}>
                    {yi === 0 ? t.thisYear : t.nextYear} · {yr.year} · {yr.ganZhi}
                  </div>

                  {(() => {
                    const lc = yr.level === "great" ? C.safe : yr.level === "good" ? C.career : yr.level === "warn" ? C.warn : C.wealth;
                    const lb = yr.level === "great" ? "#f0fdf4" : yr.level === "good" ? "#eff6ff" : yr.level === "warn" ? "#fef2f2" : "#fffbeb";
                    const lvLabel = yr.level === "great" ? t.levelGreat : yr.level === "good" ? t.levelGood : yr.level === "warn" ? t.levelWarn : t.levelMixed;
                    return <div style={{ display: 'inline-block', fontSize: 11, padding: "3px 10px", borderRadius: 10, background: lb, color: lc, fontWeight: 600, marginBottom: 12 }}>{lvLabel}</div>;
                  })()}

                  {/* Per-dimension cards */}
                  {yr.dimensions.map((dim) => (
                    <div key={dim.dim} style={{ ...sC, borderLeft: `3px solid ${dim.color}` }}>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: dim.color }}>{dim.label}</div>
                      {dim.text.split("\n").filter(Boolean).map((line, li) => (
                        <p key={li} style={{ fontSize: 12.5, color: "#555", lineHeight: 1.8, margin: "0 0 4px" }}>{line}</p>
                      ))}
                      {dim.action && (
                        <div style={{ marginTop: 8, padding: '8px 10px', background: '#f8faf8', borderRadius: 6, fontSize: 12, color: '#16a34a', fontWeight: 500, lineHeight: 1.6 }}>
                          {dim.action}
                        </div>
                      )}
                      {dim.questions?.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 6, paddingTop: 6, borderTop: '1px solid #f0f0f0' }}>
                          {dim.questions.map((q, qi) => (
                            <button key={qi} onClick={() => setPendingQ(q)} style={{ padding: '7px 10px', background: '#f8f8f8', border: '1px solid #e8e8e8', borderRadius: 8, fontSize: 11, color: '#555', cursor: 'pointer', textAlign: 'left', lineHeight: 1.4 }}>
                              💬 {q}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Annual advice */}
                  {yr.advice.length > 0 && (
                    <div style={{ ...sC, borderLeft: '3px solid #111' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{t.annualAdvice}</div>
                      {yr.advice.map((a, ai) => (
                        <p key={ai} style={{ fontSize: 12, color: "#666", lineHeight: 1.7, margin: "0 0 3px" }}>· {a}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </>)}

            <button onClick={() => { setPage('input'); setChart(null); setKline(null); }} style={{ width: '100%', padding: 14, background: '#111', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 10 }}>{t.restart}</button>
          </div>
        )}

        <div style={{ textAlign: "center", fontSize: 10, color: "#ddd", padding: "16px 0 32px" }}>{t.footer}</div>
      </div>

      {page === 'result' && chart && <AIChat astrolabe={chart} lang={lang} pendingQ={pendingQ} clearPendingQ={() => setPendingQ(null)} unlocked={aiUnlocked} />}
    </div>
  );
}
