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
    upgrade: '解锁无限AI命理咨询', upgradePrice: '$4.99/月',
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
    upgrade: 'Unlock unlimited AI consultation', upgradePrice: '$4.99/mo',
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

// ===== MUTAGEN & BRIGHTNESS EFFECTS =====
const MUTAGEN_EFFECT = {
  '禄': { zh: '化禄加持，如虎添翼——财运、人缘、机遇大增。', en: 'Lu (Prosperity) transformation — enhanced fortune, connections, and opportunities.' },
  '权': { zh: '化权加持，掌控力和决断力大增，适合争取主导地位。', en: 'Quan (Authority) transformation — amplified control and decisiveness.' },
  '科': { zh: '化科加持，声名远播，贵人运旺，利学术和公众事务。', en: 'Ke (Fame) transformation — recognition, mentors, ideal for public/academic pursuits.' },
  '忌': { zh: '化忌影响，此方面容易遇到阻碍，需格外谨慎应对。', en: 'Ji (Obstruction) transformation — challenges in this area, proceed with extra caution.' },
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
      zh: '紫微帝星坐命，你天生具有统帅之才。做事果断有魄力，目光长远，从骨子里不甘居于人下。你给人的第一印象是沉稳大气、有距离感，但内心志向极高。中年后是你事业的黄金期，有望在所在领域占据核心地位。需注意：紫微坐命者容易孤傲自负，学会倾听和团队合作能让你走得更远。',
      en: 'The Emperor Star in your Life Palace marks you as a natural-born commander. You are decisive, far-sighted, and fundamentally unwilling to play a supporting role. Your first impression is one of quiet authority and composure. Your golden period starts in your 40s, when you can rise to a central position in your field. Caution: Emperor Star natives tend toward arrogance — learning to listen and collaborate will amplify your power significantly.',
    },
    career: { zh: '最适合管理、决策、统筹类岗位。创业或走高管路线皆宜。你有驾驭大局的能力，不适合机械重复的执行工作。中年后事业运最旺，40岁前是积累期。', en: 'Ideal for management, strategy, and executive leadership. Entrepreneurship suits you well. You have the ability to command the big picture and should avoid repetitive tasks. Career peaks strongly after 40 — the years before are for building your foundation.' },
    love: { zh: '感情中你是主导者，需要同样有主见、独立自主的伴侣。太弱势或太依赖的人会让你窒息。晚婚往往更幸福——早婚容易因事业心太强而忽略另一半的感受。', en: 'You lead in relationships and need a partner who is equally independent and strong-minded. Overly dependent partners will suffocate you. Later marriage tends to bring more happiness — early marriage often suffers from your career-first priorities.' },
    wealth: { zh: '正财运佳，靠能力和地位积累财富。你善于管理大笔资金，有投资眼光，但不宜投机冒险。财运在40岁后进入鼎盛期。', en: 'Strong earned income through ability and status. You are skilled at managing significant capital and have investment acumen, but should avoid gambling and speculation. Wealth peaks after 40.' },
    health: { zh: '注意心血管和血压问题，尤其是高压工作时。定期体检很重要。', en: 'Watch for cardiovascular and blood pressure issues, especially under work stress. Regular checkups are important.' },
  },
  '天机': {
    en: 'Advisor',
    soul: {
      zh: '天机星坐命，你是天生的谋略家和思考者。头脑敏锐，善于分析和规划，能从复杂局面中找到最优解。但你的弱点也很明显——想太多、犹豫不决，容易在选择中反复纠结。你适合做"军师"角色，用智慧影响他人。内心敏感，情绪波动较大，需要学会果断行动。',
      en: 'The Advisor Star makes you a born strategist and thinker. You have a razor-sharp mind that excels at analysis and planning, finding optimal solutions in complex situations. However, your weakness is equally clear — overthinking, indecisiveness, and agonizing over choices. You thrive as the "brain" behind the scenes. Emotionally sensitive with frequent mood shifts, you need to learn decisive action.',
    },
    career: { zh: '适合顾问、策划、技术、教育、研究类工作。你是出色的参谋和幕后推手，不一定要站在台前。IT、咨询、学术研究都是好方向。注意：频繁跳槽对你不利，选定方向就深耕。', en: 'Ideal for consulting, planning, technology, education, and research. You excel as an advisor or behind-the-scenes strategist. IT, consulting, and academia are strong paths. Note: job-hopping hurts you — commit to a direction and go deep.' },
    love: { zh: '你重视精神交流和灵魂共鸣，外表不是第一选项。但容易想太多、分析过度，把简单的感情变复杂。建议少分析、多感受，用心而不是用脑去恋爱。', en: 'You prioritize intellectual connection and soul resonance over appearances. However, you tend to overanalyze and complicate simple feelings. Try to feel more and think less — love with your heart, not your brain.' },
    wealth: { zh: '靠脑力和专业技能赚钱。财运有起伏，不宜做高风险投资。适合知识付费、咨询收费等智力变现方式。', en: 'Income comes through intellect and expertise. Finances fluctuate — avoid high-risk investments. Knowledge monetization and consulting fees are ideal income streams.' },
    health: { zh: '注意神经系统、失眠、焦虑问题。肝胆也需关注。减少熬夜和精神内耗。', en: 'Watch for nervous system issues, insomnia, and anxiety. Liver and gallbladder need attention. Reduce late nights and mental exhaustion.' },
  },
  '太阳': {
    en: 'Sun',
    soul: {
      zh: '太阳星坐命，你热情大方、乐于助人，像太阳一样照亮周围的人。你天性慷慨，有强烈的责任感和正义感，在社交圈中往往是核心人物。但太阳坐命也意味着"劳碌命"——你习惯付出，却不善于为自己争取回报。男命太阳旺尤佳，女命太阳旺则辛劳但有成就。',
      en: 'The Sun Star in your Life Palace makes you warm, generous, and naturally helpful — you light up everyone around you. With strong responsibility and a sense of justice, you are often the center of social circles. However, the Sun also means a "busy destiny" — you give freely but struggle to claim rewards for yourself. For men, a bright Sun is especially favorable; for women, it brings achievement through hard work.',
    },
    career: { zh: '适合公共事务、教育、媒体、政治、公益等面向大众的工作。你天生有感染力和号召力，适合需要"抛头露面"的角色。公务员、教师、媒体人都是好选择。', en: 'Ideal for public affairs, education, media, politics, and social work. You have natural charisma and persuasion, thriving in public-facing roles. Government, teaching, and media are strong career choices.' },
    love: { zh: '你对伴侣很好，但容易因为忙于事业和社交而忽略另一半。需要有意识地为感情留出时间和精力。另一半往往是温和内敛型。', en: 'You treat your partner well but tend to neglect them due to career and social commitments. Make conscious effort to reserve time and energy for love. Your ideal partner is often the gentle, introverted type.' },
    wealth: { zh: '赚钱能力不差，但花销也大——你慷慨好客，不善于拒绝。财来财去是常态。建议强制储蓄，不要太大方。', en: 'You earn well but spend freely — generous and hospitable, you struggle to say no. Money flows in and out easily. Enforce a savings plan and curb excessive generosity.' },
    health: { zh: '注意眼睛、血压和心脏。工作太忙时容易透支身体。一定要保证休息。', en: 'Watch for eye, blood pressure, and heart issues. You tend to overwork. Ensure adequate rest.' },
  },
  '武曲': {
    en: 'Warrior',
    soul: {
      zh: '武曲星坐命，你果断刚毅，有天生的理财直觉。性格直来直去，不喜欢拐弯抹角，做事讲究效率和结果。武曲是紫微斗数中最强的财星之一，坐命者往往与金钱有不解之缘。你可能不善言辞，但行动力极强。性格偏孤傲，不容易亲近，但一旦认定就非常忠诚。',
      en: 'The Warrior Star gives you a resolute, decisive nature with an innate financial instinct. You are direct, efficiency-driven, and results-oriented. As one of the strongest wealth stars in Zi Wei Dou Shu, it ties your destiny closely to money. You may not be eloquent, but your execution is exceptional. Somewhat aloof and hard to approach, but deeply loyal once committed.',
    },
    career: { zh: '金融、投资、工程、技术、军警类工作最适合你。你是天生的执行者和理财高手。创业做生意也有优势，但最好找个会说话的合伙人——你的短板在沟通。', en: 'Finance, investment, engineering, technology, and military/law enforcement suit you best. You are a natural executor and financial expert. Business entrepreneurship works well, but partner with a communicator — your weakness is social skills.' },
    love: { zh: '你在感情中有些木讷，不懂浪漫但很忠诚。容易因为不善表达而让对方感到冷漠。建议多学会表达爱意。晚婚更幸福，早婚波折多。', en: 'You are loyal but inexpressive in love — your partner may mistake sincerity for coldness. Learn to express affection more openly. Later marriage tends to be much more successful.' },
    wealth: { zh: '这是你的最大天赋之一！你天生有赚钱的嗅觉和理财的能力。适合做投资、创业、管理资产。正财偏财都不错，但要避免急功近利。', en: 'This is one of your greatest gifts! You have a natural nose for money and talent for wealth management. Excellent for investment, entrepreneurship, and asset management. Both earned and windfall income are strong, but avoid impatience.' },
    health: { zh: '注意肺、呼吸系统问题。也要小心金属利器造成的外伤。', en: 'Watch for lung and respiratory issues. Also be cautious of injuries from metal or sharp objects.' },
  },
  '天同': {
    en: 'Harmony',
    soul: {
      zh: '天同福星坐命，你温和随性、与世无争，是朋友圈里最好相处的人。你追求安逸舒适的生活，不喜欢激烈竞争。天同坐命者有艺术天赋和审美能力，但最大的问题是缺乏冲劲——容易安于现状、不思进取。你需要适当的压力来激发潜能，否则容易虚度光阴。',
      en: 'The Harmony Star blesses you with a gentle, easygoing nature — you are the most likable person in any circle. You pursue comfort and avoid intense competition. You have artistic talent and aesthetic sense, but your biggest challenge is lack of drive — complacency comes naturally. You need moderate pressure to unlock your potential, otherwise time slips away.',
    },
    career: { zh: '适合服务业、艺术、教育、心理咨询、餐饮等让人感到温暖的行业。不适合高压竞争的环境。你的优势是亲和力和耐心，适合需要人际沟通的岗位。', en: 'Service industries, arts, education, counseling, and hospitality suit your warm nature. Avoid high-pressure competitive environments. Your strengths are approachability and patience — roles requiring interpersonal skills are ideal.' },
    love: { zh: '你是温柔体贴的伴侣，感情中不计较、很包容。但要注意别太委曲求全——适当表达需求不是自私。你容易被强势的人吸引。', en: 'You are a gentle, caring partner — tolerant and undemanding in love. Be careful not to sacrifice too much — expressing your needs is not selfish. You tend to be attracted to dominant personalities.' },
    wealth: { zh: '你不太追求大富大贵，够用就好。财运平稳但不会暴富。适合稳健投资，不要冒险。最大的财务风险是太安逸导致收入停滞。', en: 'You do not chase great wealth — enough is enough. Finances are steady but unlikely to boom. Stick to conservative investments. Your biggest financial risk is stagnating income due to complacency.' },
    health: { zh: '注意肾脏和泌尿系统。精神上容易有懒散倾向，需要保持运动习惯。', en: 'Watch for kidney and urinary issues. Tendency toward lethargy — maintain a regular exercise habit.' },
  },
  '廉贞': {
    en: 'Passion',
    soul: {
      zh: '廉贞星坐命，你是一个复杂而有魅力的人。多才多艺、感情丰富，在艺术和人际方面有天赋。你的性格有两面性——对外热情奔放，内心却可能孤独敏感。廉贞是"次桃花星"，坐命者感情经历往往丰富。你做事投入、有韧性，但也容易走极端。好的方面是才华横溢，坏的方面是执念太深。',
      en: 'The Passion Star gives you a complex, magnetic personality. Versatile, emotionally rich, and gifted in arts and social dynamics. You have two sides — outwardly passionate and vibrant, inwardly lonely and sensitive. As a secondary romance star, your love life tends to be eventful. You are deeply committed and resilient, but prone to extremes. Your talent is undeniable, but so is your tendency toward obsession.',
    },
    career: { zh: '适合艺术、娱乐、法律、政治、公关等需要才华和人际能力的领域。你能文能武，可塑性极强。但要注意别太情绪化地做职业决策。', en: 'Arts, entertainment, law, politics, and PR suit your talent and social skills. You are remarkably adaptable and capable in diverse fields. Avoid making career decisions based on emotions.' },
    love: { zh: '感情浓烈是你的特点——爱得深也伤得深。容易吃醋、占有欲强。建议找情绪稳定的伴侣来平衡你的激情。感情上要学会放手和信任。', en: 'Intense love is your hallmark — you love deeply and hurt deeply. Jealousy and possessiveness come naturally. Seek an emotionally stable partner to balance your passion. Learn to let go and trust.' },
    wealth: { zh: '偏财运不错，靠才华和人脉赚钱。收入可能不稳定但爆发力强。适合创意行业或自媒体变现。', en: 'Good windfall luck — income through talent and connections. Earnings may fluctuate but have strong burst potential. Creative industries and content monetization suit you.' },
    health: { zh: '注意生殖系统和皮肤问题。精神压力大时容易导致身体不适。', en: 'Watch for reproductive system and skin issues. Physical symptoms often manifest under mental stress.' },
  },
  '天府': {
    en: 'Treasury',
    soul: {
      zh: '天府星坐命，你稳重大气、可靠踏实，是别人眼中值得信赖的人。你保守务实，不喜欢冒险，做事有条有理。天府是"库藏之星"，坐命者天生有守财和积累的能力。你可能不是最有冲劲的人，但你是最不容易失败的人——因为你从不做没把握的事。缺点是可能过于保守，错失机会。',
      en: 'The Treasury Star makes you steady, reliable, and trustworthy — the person everyone counts on. Conservative and practical, you dislike risk and approach everything methodically. As the "vault star," you have an innate ability to preserve and accumulate wealth. You may not be the most aggressive, but you are the least likely to fail — because you never act without certainty. The downside: excessive caution can mean missed opportunities.',
    },
    career: { zh: '银行、政府、大企业、房地产等稳定的行业最适合你。你不适合高风险创业，但在大组织中能步步高升。管理资产、行政管理都是你的强项。', en: 'Banking, government, large corporations, and real estate suit your stable nature. High-risk startups are not for you, but you can climb steadily in established organizations. Asset management and administration are your strengths.' },
    love: { zh: '你在感情中追求稳定和安全感。对伴侣忠诚专一，但不太浪漫。你倾向于传统的感情模式——结婚、买房、安定下来。', en: 'You seek stability and security in love. Loyal and devoted but not very romantic. You prefer the traditional path — marriage, homeownership, and settling down.' },
    wealth: { zh: '这是你的最大优势之一。天府坐命者是天生的守财人，善于理财、投资房产、积累资产。虽然不会暴富，但一辈子不缺钱。适合长线投资和不动产。', en: 'This is one of your greatest strengths. Treasury natives are natural wealth preservers — skilled at financial management, real estate investment, and asset building. You may not get rich quick, but you will never lack money. Long-term investments and property are ideal.' },
    health: { zh: '注意脾胃和消化系统。饮食规律很重要。', en: 'Watch for digestive system issues. Regular eating habits are important.' },
  },
  '太阴': {
    en: 'Moon',
    soul: {
      zh: '太阴星坐命，你温柔细腻、感性敏锐，有天生的艺术气质和审美能力。你内心世界丰富，善于感知他人的情绪。太阴是"田宅星"，与房产和家庭有密切关系。你重视内在世界多过外在表现，可能给人文静、不太主动的印象。女命太阴旺端庄优雅；男命太阴旺则内心细腻，常能遇到好伴侣。',
      en: 'The Moon Star gives you a gentle, sensitive, and artistically gifted nature. Your inner world is rich, and you are naturally attuned to others\' emotions. As the property star, your destiny is closely tied to real estate and home. You value your inner life over outward display, appearing quiet and reserved. For women, a bright Moon brings elegance; for men, it means emotional depth and often a wonderful spouse.',
    },
    career: { zh: '艺术、设计、房地产、夜间经济、美容、心理咨询等都适合你。你在需要细腻感受力的领域有独特优势。也适合与女性相关的行业。', en: 'Arts, design, real estate, nighttime industries, beauty, and psychology suit you. You have a unique advantage in fields requiring sensitivity and emotional intelligence. Industries serving women are also favorable.' },
    love: { zh: '你是浪漫多情的人，重视精神层面的连接。感情世界丰富，但容易多愁善感。理想的伴侣是能给你安全感又懂得欣赏你内心世界的人。', en: 'Romantic and emotionally deep, you value spiritual connections in love. Your emotional world is rich but prone to melancholy. Your ideal partner provides security while appreciating your inner world.' },
    wealth: { zh: '房产运极佳，适合投资不动产。财富积累偏向细水长流型，不会暴富但会逐渐殷实。夜间工作或副业可能是额外收入来源。', en: 'Exceptional real estate luck — property investment is highly favorable. Wealth accumulates gradually rather than explosively. Side income from evening work or projects is likely.' },
    health: { zh: '注意眼睛问题。女性注意妇科。精神层面容易有抑郁倾向，保持社交很重要。', en: 'Watch for eye problems. Women should monitor gynecological health. Tendency toward depression — maintaining social connections is crucial.' },
  },
  '贪狼': {
    en: 'Wolf',
    soul: {
      zh: '贪狼星坐命，你是社交场上的明星——才华横溢、人缘极好、兴趣广泛。你天生有强烈的好奇心和欲望，想要尝试人生的各种可能性。贪狼是紫微斗数第一桃花星，坐命者魅力十足，异性缘极旺。你的优势是才华和适应力，劣势是贪心不足——什么都想要，反而分散精力。成功的关键在于聚焦。',
      en: 'The Wolf Star makes you the star of any social gathering — talented, charming, and endlessly curious. You have intense desires and want to explore every possibility life offers. As the #1 romance star in Zi Wei Dou Shu, your appeal to the opposite sex is extraordinary. Your strength is versatility and adaptability; your weakness is greed — wanting everything dilutes your focus. The key to your success is concentration.',
    },
    career: { zh: '娱乐、销售、社交媒体、外交、餐饮、公关等都适合。你在需要人际魅力和创造力的领域如鱼得水。但要避免频繁换赛道——选定一个方向深耕才能出头。', en: 'Entertainment, sales, social media, diplomacy, hospitality, and PR suit you perfectly. You thrive wherever charm and creativity are valued. But avoid constantly switching fields — commit to one direction for real success.' },
    love: { zh: '桃花极旺，感情经历丰富甚至过于丰富。你的魅力让身边从不缺追求者，但也容易沉迷新鲜感。长期关系需要你学会克制和专一。注意区分爱情和新鲜感。', en: 'Exceptional romantic appeal — your love life is eventful, perhaps too eventful. You never lack admirers, but easily chase novelty. Long-term commitment requires you to learn self-discipline. Distinguish love from infatuation.' },
    wealth: { zh: '你善于赚钱也善于花钱。偏财运不错，适合做生意和投资。但消费欲望也很强，建议控制花销。可以通过社交能力变现。', en: 'You are excellent at making money AND spending it. Good windfall luck, suitable for business and investment. But your spending desire is strong — budget carefully. Your social skills are a monetizable asset.' },
    health: { zh: '注意肝胆问题和性方面的健康。应酬多时要控制饮酒。', en: 'Watch for liver/gallbladder issues and sexual health. Control alcohol consumption during social occasions.' },
  },
  '巨门': {
    en: 'Gate',
    soul: {
      zh: '巨门星坐命，你口才出众、分析能力极强，是天生的辩论家和研究者。你善于发现问题、追根溯源，有很强的批判性思维。但巨门是"暗曜"，坐命者一生容易遭遇是非口舌——别人可能误解你的善意，或者你的直言不讳得罪人。你的核心挑战是学会"说对话"——用你的口才建设而非破坏关系。',
      en: 'The Gate Star gives you exceptional eloquence and analytical power — a born debater and researcher. You excel at finding problems and getting to the root cause, with strong critical thinking. However, as a "dark star," you are prone to disputes and misunderstandings throughout life. Others may misread your intentions, or your bluntness may offend. Your core challenge: learn to use your words to build rather than destroy relationships.',
    },
    career: { zh: '法律、教育、研究、媒体、销售、客服等需要口才的领域是你的天下。律师、教师、记者、分析师都是好选择。你的专业深度是核心竞争力。', en: 'Law, education, research, media, sales, and customer service — any field valuing eloquence is your domain. Lawyer, teacher, journalist, and analyst are excellent choices. Your depth of expertise is your core advantage.' },
    love: { zh: '你在感情中容易说太多或说错话——嘴上不饶人是你的通病。和伴侣的口角纠纷可能频繁。建议学会沉默是金，多倾听少评判。找一个能包容你直来直去的人。', en: 'In love, you tend to say too much or say the wrong thing — being unsparing with words is your Achilles\' heel. Arguments with partners can be frequent. Learn that silence is golden; listen more, judge less. Find someone who can handle your directness.' },
    wealth: { zh: '靠口才和专业知识赚钱是正道。适合做老师、律师、顾问等知识变现的工作。但注意：巨门坐命者容易因为口舌之争造成财务损失。', en: 'Income through eloquence and expertise is your proper path — teaching, law, consulting. But note: Gate Star natives can suffer financial losses through disputes and legal issues. Choose your battles wisely.' },
    health: { zh: '注意口腔和消化系统问题。精神层面容易因为人际冲突而焦虑失眠。', en: 'Watch for oral and digestive issues. Mental stress from interpersonal conflicts can cause anxiety and insomnia.' },
  },
  '天相': {
    en: 'Minister',
    soul: {
      zh: '天相星坐命，你温厚谦和、善于察言观色，是天生的协调者和辅佐者。你为人正派、注重礼仪，在任何团队中都是让人放心的存在。天相是"印星"，坐命者做事讲规矩、守信用，但也因此容易被约束。你的弱点是依赖性较强——习惯跟随而非引领，容易受周围人影响。成功关键在于找到值得辅佐的"明主"。',
      en: 'The Minister Star makes you warm, diplomatic, and naturally attuned to social dynamics — a born coordinator and supporter. You are principled, courteous, and the reliable presence in any team. As the "seal star," you are rule-abiding and trustworthy, but this can also constrain you. Your weakness is dependency — you habitually follow rather than lead, easily influenced by others. Your key to success: find a worthy leader to serve.',
    },
    career: { zh: '行政管理、人力资源、公关、秘书、公务员等辅助性但不可或缺的角色最适合你。你不一定要做一把手，但你是最好的二把手。在大组织中发展比自己创业更有利。', en: 'Administrative management, HR, PR, executive assistant, and civil service — supportive but indispensable roles suit you best. You may not be the top leader, but you are the best second-in-command. Developing within large organizations is more favorable than solo entrepreneurship.' },
    love: { zh: '你是迁就型的伴侣——善解人意、配合度高。但要注意别失去自我。你的好脾气容易被强势的人利用，建议保持底线和原则。', en: 'You are an accommodating partner — empathetic and cooperative. But be careful not to lose yourself. Your good temper can be exploited by dominant personalities. Maintain your boundaries and principles.' },
    wealth: { zh: '稳定的薪资收入最适合你。你不善于冒险投资，但通过稳扎稳打可以积累可观的财富。房产和基金等保守投资是好选择。', en: 'Steady salary income suits you best. You are not suited for risky investments, but can accumulate considerable wealth through consistent, methodical saving. Property and index funds are good choices.' },
    health: { zh: '注意皮肤和过敏问题。工作压力容易转化为身体上的反应。', en: 'Watch for skin and allergy issues. Work stress often manifests as physical symptoms.' },
  },
  '天梁': {
    en: 'Beam',
    soul: {
      zh: '天梁星坐命，你正直稳重、乐于助人，有长者之风。你天生具有教导和保护他人的倾向，在朋友圈中往往扮演"大哥大姐"的角色。天梁是"荫星"，坐命者一生贵人运佳，逢凶化吉的能力强。但你的弱点是容易说教——好为人师，有时会让人觉得自以为是。你的命格适合积德行善，晚年运势尤其好。',
      en: 'The Beam Star gives you an upright, mature character with a natural inclination to help and protect others. You often play the "big brother/sister" role in your circles. As the "shadow star," you enjoy strong mentor luck throughout life and a remarkable ability to turn bad situations around. Your weakness: a tendency to lecture — sometimes coming across as self-righteous. Your chart favors charitable works, with especially strong fortune in later years.',
    },
    career: { zh: '医疗、教育、慈善、宗教、社会工作等助人的行业最适合你。你也适合做公务员或从事与老人、弱势群体相关的工作。你的耐心和正义感是核心优势。', en: 'Medicine, education, charity, religion, and social work suit your helping nature. Civil service and work with elderly or vulnerable populations are also ideal. Your patience and sense of justice are core strengths.' },
    love: { zh: '你在感情中偏"大龄恋爱"——晚婚反而更幸福。有年龄差恋爱的倾向（你偏好比自己大或小很多的人）。你在感情中像保护者，需要被需要。', en: 'You favor "late-blooming love" — later marriage is often happier. You tend toward age-gap relationships (preferring significantly older or younger partners). In love, you are the protector who needs to be needed.' },
    wealth: { zh: '你不以财富为人生目标，但一辈子不缺钱。贵人运佳，关键时刻总有人帮你。适合与服务和教育相关的收入来源。不需要担心财务安全。', en: 'Wealth is not your life goal, but you will never lack money. Strong mentor luck means help arrives at critical moments. Service and education-related income suit you. Financial security is assured.' },
    health: { zh: '天梁是长寿星，健康基底好。但要注意脾胃和慢性病的预防。保持规律生活即可。', en: 'The Beam is a longevity star — your health foundation is strong. Watch for digestive issues and chronic disease prevention. A regular lifestyle is sufficient.' },
  },
  '七杀': {
    en: 'Killer',
    soul: {
      zh: '七杀星坐命，你是天生的将军——霸气、果断、敢于冒险。你有极强的开拓精神和执行力，面对困难从不退缩。七杀坐命者性格刚烈，独来独往，不喜欢受人约束。你的人生通常大起大落，但你享受这种刺激。弱点是过于孤傲，容易与人对立。你需要学会柔和的一面——刚柔并济才能成大事。',
      en: 'The Seven Killings Star makes you a born warrior — bold, decisive, and unafraid of risk. You have exceptional pioneering spirit and execution ability, never retreating from difficulty. Your personality is fierce and independent — you dislike constraints. Your life tends toward dramatic highs and lows, which you actually enjoy. Your weakness: excessive aloofness and confrontation. Learning to balance strength with flexibility is key to greatness.',
    },
    career: { zh: '创业、军警、体育、投资、高风险行业都适合你。你是天生的开拓者，不适合朝九晚五的稳定工作。你的竞争优势在于别人不敢做的事，你敢。', en: 'Entrepreneurship, military, sports, investment, and high-risk industries suit you. You are a natural pioneer, unsuited for 9-to-5 routines. Your competitive edge: you dare to do what others won\'t.' },
    love: { zh: '感情波折较多——你太强势、太独立，容易让伴侣感到有距离。需要给对方空间也给自己柔软的余地。找一个能理解你"战士本色"的人。', en: 'Love life tends to be turbulent — your intensity and independence can create distance. Give your partner space and allow yourself vulnerability. Find someone who understands your "warrior nature."' },
    wealth: { zh: '大起大落型财运——要么很有钱，要么赔得很惨。你适合高风险高回报的投资，但一定要控制仓位。不要把所有鸡蛋放在一个篮子里。', en: 'Feast-or-famine finances — either very wealthy or heavy losses. High-risk, high-reward investments suit you, but always manage position sizing. Never put all eggs in one basket.' },
    health: { zh: '注意外伤、手术和意外。从事高风险运动时要特别小心。不要忽视小伤。', en: 'Watch for injuries, surgeries, and accidents. Extra caution during high-risk activities. Never ignore minor injuries.' },
  },
  '破军': {
    en: 'Breaker',
    soul: {
      zh: '破军星坐命，你是天生的变革者——不安于现状，永远在寻找下一个挑战。你的一生注定多变动，换工作、换城市、甚至换人生方向对你来说是常态。破军有"先破后立"的特质，你习惯打破旧格局再重建新秩序。优势是创新力和勇气，劣势是太不安分——缺乏持续性。如果能在变化中坚持一个核心方向，将大有作为。',
      en: 'The Army Breaker makes you a born disruptor — restless, always seeking the next challenge. Your life is destined for frequent changes: jobs, cities, even life directions shift regularly. You embody "destroy before rebuilding" — breaking old patterns to create new order. Your strengths: innovation and courage. Your weakness: restlessness and lack of consistency. If you can maintain a core direction amid the changes, you will achieve great things.',
    },
    career: { zh: '开创型工作、创新研发、改革推动者、自由职业等变化大的领域适合你。你不适合一成不变的工作，需要新鲜感和挑战。但注意别太频繁跳槽，每次变动至少积累2-3年经验。', en: 'Pioneering roles, innovation, change management, and freelancing suit your dynamic nature. You are unsuited for monotonous work and need novelty and challenge. But avoid job-hopping too frequently — accumulate at least 2-3 years of experience per move.' },
    love: { zh: '感情生活也多变——可能经历多段认真的感情甚至多次婚姻。你对伴侣有较高要求，容易在发现问题后选择放弃而非修复。建议学会在亲密关系中坚持和包容。', en: 'Your love life mirrors your restless nature — multiple serious relationships or marriages are possible. You have high standards and tend to abandon rather than repair when problems arise. Learn persistence and tolerance in intimate relationships.' },
    wealth: { zh: '财运大起大落——你可能一夜暴富也可能突然负债。每次变动都可能带来财务波动。建议保持应急储备金，不要把所有资产投入单一项目。', en: 'Extreme financial swings — you could become wealthy overnight or suddenly face debt. Each life change brings financial volatility. Maintain an emergency fund and never concentrate all assets in one venture.' },
    health: { zh: '注意意外伤害和皮肤问题。你的高能量生活方式需要更多的休息和恢复时间。', en: 'Watch for accidental injuries and skin issues. Your high-energy lifestyle demands more rest and recovery time.' },
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
              <span style={{ fontSize: 7, color: "#ccc" }}>{p.heavenlyStem}{p.earthlyBranch}</span>
            </div>
            <div style={{ flex: 1 }}>
              {p.majorStars.map((s, i) => (
                <div key={i} style={{ fontSize: isEN ? 9 : 11, fontWeight: 600, color: "#111", lineHeight: 1.2 }}>
                  {s.name}{isEN && STAR_EN[s.name] ? ` (${STAR_EN[s.name]})` : ''}
                  {s.brightness && <span style={{ fontSize: 7, marginLeft: 2, color: "#aaa" }}>{isEN ? (BRIGHT_EN[s.brightness] || s.brightness) : s.brightness}</span>}
                  {s.mutagen && <span style={{ fontSize: 7, marginLeft: 2, padding: "0 2px", borderRadius: 2, background: HUA_BG[s.mutagen] || "#f3f4f6", color: HUA_COLOR[s.mutagen] || "#888" }}>{isEN ? (MUTAGEN_EN[s.mutagen] || s.mutagen) : s.mutagen}</span>}
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
      if (decadePalace) decadeBonus = (scorePalace(decadePalace) - 40) * 0.5;

      let ageFactor;
      if (dim === 'health') {
        ageFactor = age <= 30 ? 0.9 + age * 0.003 : 1.0 - (age - 30) * 0.005;
      } else if (dim === 'children') {
        ageFactor = age < 20 ? 0 : age <= 40 ? (age - 20) * 0.05 : 1.0 - (age - 40) * 0.008;
      } else {
        ageFactor = age <= 10 ? 0.2 + age * 0.03 : age <= 50 ? 0.5 + (age - 10) * 0.0125 : 1.0 - (age - 50) * 0.006;
      }

      const raw = (natalBase + decadeBonus) * Math.max(0.1, ageFactor);
      const scaled = Math.round(raw * 3.5);
      points.push([age, dim === 'children' && age < 20 ? null : Math.max(5, Math.min(400, scaled))]);
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

// ===== LIFE READING GENERATOR (Star-Specific) =====
function brightMod(brightness, lang) {
  const b = BRIGHT_SCORE[brightness] || 1;
  if (b >= 4) return lang === 'en' ? ' Star at peak brilliance — its power is maximized.' : ' 星耀庙旺，力量发挥到极致。';
  if (b >= 2) return lang === 'en' ? ' Star at moderate strength — steady performance.' : ' 星耀得利，发挥稳定。';
  if (b >= 0) return '';
  return lang === 'en' ? ' Star in a weakened position — extra effort needed.' : ' 星耀落陷，力量受限，需要加倍努力。';
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

    // Add star name header
    const starLabel = isEN ? `${star.name} (${entry.en || STAR_EN[star.name] || star.name})` : star.name;
    const brightLabel = star.brightness ? (isEN ? ` [${BRIGHT_EN[star.brightness] || star.brightness}]` : ` [${star.brightness}]`) : '';

    if (category === 'soul') {
      // For soul palace, use the full soul reading
      text += (isEN ? reading.en : reading.zh);
      text += brightMod(star.brightness, lang);
    } else {
      // For other categories, use the category reading
      text += `【${starLabel}${brightLabel}】 `;
      text += (isEN ? reading.en : reading.zh);
    }

    // Add mutagen effect
    if (star.mutagen) {
      const me = MUTAGEN_EFFECT[star.mutagen];
      if (me) text += ' ' + (isEN ? me.en : me.zh);
    }
    text += '\n\n';
  }
  return text.trim();
}

function generateLifeReading(astrolabe, lang) {
  const isEN = lang === 'en';
  const sections = [];

  // 1. Personality (命宫)
  const soulText = buildStarReading(astrolabe.palace('命宫'), 'soul', lang);
  if (soulText) {
    sections.push({
      key: 'personality',
      title: isEN ? 'Personality & Destiny' : '性格命格',
      subtitle: (() => {
        const soul = astrolabe.palace('命宫');
        const stars = soul?.majorStars.map(s => isEN ? `${s.name} (${STAR_EN[s.name] || s.name})` : s.name).join(isEN ? ' + ' : '、');
        return isEN ? `Life Palace: ${stars || 'Empty'}` : `命宫 · ${stars || '空宫'}`;
      })(),
      text: soulText,
      color: C.t1,
    });
  }

  // 2. Career (官禄宫)
  const careerText = buildStarReading(astrolabe.palace('官禄'), 'career', lang);
  if (careerText) {
    sections.push({
      key: 'career',
      title: isEN ? 'Career Direction' : '事业方向',
      subtitle: (() => {
        const p = astrolabe.palace('官禄');
        const stars = p?.majorStars.map(s => isEN ? `${s.name} (${STAR_EN[s.name] || s.name})` : s.name).join(isEN ? ' + ' : '、');
        return isEN ? `Career Palace: ${stars || 'Empty'}` : `官禄宫 · ${stars || '空宫'}`;
      })(),
      text: careerText,
      color: C.career,
    });
  }

  // 3. Love (夫妻宫)
  const loveText = buildStarReading(astrolabe.palace('夫妻'), 'love', lang);
  if (loveText) {
    sections.push({
      key: 'love',
      title: isEN ? 'Love & Relationships' : '感情模式',
      subtitle: (() => {
        const p = astrolabe.palace('夫妻');
        const stars = p?.majorStars.map(s => isEN ? `${s.name} (${STAR_EN[s.name] || s.name})` : s.name).join(isEN ? ' + ' : '、');
        return isEN ? `Spouse Palace: ${stars || 'Empty'}` : `夫妻宫 · ${stars || '空宫'}`;
      })(),
      text: loveText,
      color: C.love,
    });
  }

  // 4. Wealth (财帛宫)
  const wealthText = buildStarReading(astrolabe.palace('财帛'), 'wealth', lang);
  if (wealthText) {
    sections.push({
      key: 'wealth',
      title: isEN ? 'Wealth & Finance' : '财运格局',
      subtitle: (() => {
        const p = astrolabe.palace('财帛');
        const stars = p?.majorStars.map(s => isEN ? `${s.name} (${STAR_EN[s.name] || s.name})` : s.name).join(isEN ? ' + ' : '、');
        return isEN ? `Wealth Palace: ${stars || 'Empty'}` : `财帛宫 · ${stars || '空宫'}`;
      })(),
      text: wealthText,
      color: C.wealth,
    });
  }

  // 5. Health (疾厄宫)
  const healthText = buildStarReading(astrolabe.palace('疾厄'), 'health', lang);
  if (healthText) {
    sections.push({
      key: 'health',
      title: isEN ? 'Health Reminders' : '健康提醒',
      subtitle: (() => {
        const p = astrolabe.palace('疾厄');
        const stars = p?.majorStars.map(s => isEN ? `${s.name} (${STAR_EN[s.name] || s.name})` : s.name).join(isEN ? ' + ' : '、');
        return isEN ? `Health Palace: ${stars || 'Empty'}` : `疾厄宫 · ${stars || '空宫'}`;
      })(),
      text: healthText,
      color: C.health,
    });
  }

  // Advice
  const advice = [];
  let horoscope;
  try { horoscope = astrolabe.horoscope(); } catch {}
  const curDecade = horoscope?.decadal;
  if (curDecade) {
    advice.push(isEN
      ? `Current decade: ${curDecade.heavenlyStem}${curDecade.earthlyBranch}. This 10-year period shapes your current opportunities — align your efforts with its energy.`
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
      ? `Life challenge: ${ji.star} (${STAR_EN[ji.star] || ji.star}) carries Ji (忌) in your ${PALACE_EN[ji.palace] || ji.palace} Palace. Your ${dimLabel} area requires lifelong attention and extra care.`
      : `人生课题：${ji.star}化忌落在${ji.palace}。你的${dimLabel}方面是一生需要重点关注的领域，遇到困难不要回避，正面应对反而能化险为夷。`);
  }
  if (fourHua.find(h => h.type === '禄')) {
    const lu = fourHua.find(h => h.type === '禄');
    const palaceDim = PALACE_TO_DIM[lu.palace];
    const dimLabel = palaceDim ? (isEN ? palaceDim : { overall: '整体', career: '事业', love: '感情', wealth: '财务', health: '健康', children: '子女', social: '社交' }[palaceDim] || lu.palace) : lu.palace;
    advice.push(isEN
      ? `Greatest blessing: ${lu.star} (${STAR_EN[lu.star] || lu.star}) carries Lu (禄) in your ${PALACE_EN[lu.palace] || lu.palace} Palace. Your ${dimLabel} area is your strongest natural advantage — lean into it.`
      : `最大福报：${lu.star}化禄落在${lu.palace}。你的${dimLabel}方面是你最大的天然优势，要充分利用。`);
  }

  return { sections, advice, fourHua };
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
          if (eff.type === '禄') {
            text += isEN
              ? `${eff.star} (${STAR_EN[eff.star] || eff.star}) brings Prosperity to your ${PALACE_EN[eff.palace] || eff.palace} Palace — ${domainText} thrives this year. Excellent time for expansion and new initiatives.\n`
              : `${eff.star}化禄入${eff.palace}——${domainText}方面运势大旺，是拓展和突破的好时机。\n`;
            level = 'great';
          } else if (eff.type === '权') {
            text += isEN
              ? `${eff.star} (${STAR_EN[eff.star] || eff.star}) brings Authority to your ${PALACE_EN[eff.palace] || eff.palace} Palace — increased control over ${domainText}. Take initiative and assert yourself.\n`
              : `${eff.star}化权入${eff.palace}——${domainText}方面掌控力增强，适合主动出击、争取更多主导权。\n`;
            if (level !== 'great') level = 'good';
          } else if (eff.type === '科') {
            text += isEN
              ? `${eff.star} (${STAR_EN[eff.star] || eff.star}) brings Fame to your ${PALACE_EN[eff.palace] || eff.palace} Palace — recognition in ${domainText}. Academic and social endeavors are favored.\n`
              : `${eff.star}化科入${eff.palace}——${domainText}方面声名提升，利学习、考试和社交活动。\n`;
            if (level === 'neutral') level = 'good';
          } else if (eff.type === '忌') {
            text += isEN
              ? `${eff.star} (${STAR_EN[eff.star] || eff.star}) brings Obstruction to your ${PALACE_EN[eff.palace] || eff.palace} Palace — challenges in ${domainText}. Exercise caution, avoid major decisions, and be patient.\n`
              : `${eff.star}化忌入${eff.palace}——${domainText}方面容易遇到阻碍和波折。谨慎行事，避免冲动决策，耐心等待转机。\n`;
            level = level === 'great' ? 'mixed' : 'warn';
          }
        }
      } else {
        text = isEN
          ? `No major yearly transformations directly affect this area. A relatively stable year for ${config.label.toLowerCase()} — maintain your current course.`
          : `今年没有重大流年四化直接影响此方面，运势相对平稳。保持现有节奏即可。`;
      }

      dimensions.push({ dim, label: config.label, text: text.trim(), level, color: config.color });
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
      ? `You are in the ${decadal?.heavenlyStem || ''}${decadal?.earthlyBranch || ''} decade — ${year === thisYear ? 'align your actions with this decade\'s energy' : 'prepare for the shifts this period brings'}.`
      : `${year}年处于${decadal?.heavenlyStem || ''}${decadal?.earthlyBranch || ''}大限——${year === thisYear ? '顺势而为是当下最佳策略' : '提前做好规划和准备'}。`);

    results.push({
      year,
      ganZhi: `${yearly?.heavenlyStem || ''}${yearly?.earthlyBranch || ''}`,
      level,
      dimensions,
      advice,
    });
  }

  return results;
}

// ===== AI CHAT COMPONENT (Improved) =====
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

  const send = async (text) => {
    const userMsg = (text || input).trim();
    if (!userMsg || loading) return;
    if (getCount() >= 3) return;
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
  };

  const remaining = 3 - getCount();

  if (!open) {
    return (
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }}>
        <div style={{ maxWidth: 540, margin: '0 auto' }}>
          <button onClick={() => setOpen(true)} style={{ width: '100%', padding: '14px 20px', background: '#111', color: '#fff', border: 'none', borderRadius: '16px 16px 0 0', fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 -4px 20px rgba(0,0,0,0.15)' }}>
            <span style={{ fontSize: 18 }}>💬</span>
            {t.aiTitle}
            <span style={{ fontSize: 11, opacity: 0.7, marginLeft: 4 }}>({remaining}/3 {lang === 'en' ? 'free' : '免费'})</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', bottom: 0, right: 0, left: 0, height: '60vh', background: '#fff', borderTop: '1px solid #e5e5e5', borderRadius: '16px 16px 0 0', boxShadow: '0 -4px 20px rgba(0,0,0,0.1)', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #eee' }}>
        <span style={{ fontSize: 15, fontWeight: 700 }}>{t.aiTitle}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: remaining > 0 ? '#888' : C.danger }}>{remaining}/3</span>
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
        {loading && <div style={{ textAlign: 'center', color: '#ccc', fontSize: 12, padding: 10 }}>...</div>}
        <div ref={endRef} />
      </div>
      {remaining > 0 ? (
        <div style={{ display: 'flex', gap: 8, padding: '10px 16px', borderTop: '1px solid #eee' }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder={t.aiPlaceholder} style={{ flex: 1, padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: 10, fontSize: 14, outline: 'none' }} />
          <button onClick={() => send()} disabled={loading || !input.trim()} style={{ padding: '10px 18px', background: '#111', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.5 : 1 }}>{t.aiSend}</button>
        </div>
      ) : (
        <div style={{ padding: '14px 16px', borderTop: '1px solid #eee', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: C.danger, marginBottom: 8 }}>{t.aiLimit}</div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button style={{ padding: '10px 24px', background: '#111', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>{t.upgrade} — {t.upgradePrice}</button>
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

                {lifeData.fourHua.length > 0 && (
                  <div style={{ ...sC, marginTop: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{t.fourHua}</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {lifeData.fourHua.map((h, i) => (
                        <span key={i} style={{ fontSize: 12 }}>
                          {h.star}{lang === 'en' && STAR_EN[h.star] ? ` (${STAR_EN[h.star]})` : ''}
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

      {page === 'result' && chart && <AIChat astrolabe={chart} lang={lang} />}
    </div>
  );
}
