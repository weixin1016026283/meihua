'use client';
import { useState, useRef, useEffect, useCallback } from "react";

// ===== BILINGUAL UI TEXTS =====
const TX = {
  zh: {
    back: '← 返回首页',
    title: '命盘解析',
    comingSoonBadge: '开发中',
    comingSoonMsg: '完整的命盘解析功能即将上线，以下为示例命盘供参考。',
    sampleLabel: '示例命盘：1994年甲戌 · 九月廿一 · 酉时 · 女命',
    chartTitle: '紫微斗数命盘',
    tab0: '命盘 · 解读',
    tab1: 'K线 · 流年',
    tabCmp0: 'K线对比',
    tabCmp1: '危机预警',
    tabCmp2: '应对方案',
    addPerson: '+ 添加另一人 · 匹配关系',
    fourHuaTitle: '生年四化',
    deepReadings: '命盘深度解读',
    lifeAdvice: '人生建议',
    klineTitle: '人生 K 线图',
    klineCeiling: '上限',
    klinePeak: '巅峰',
    bestWindow: '最佳窗口：',
    lifeHighlights: '利好',
    lifeCaution: '注意',
    keyYearTitle: '关键流年解读',
    levelGreat: '大吉',
    levelGood: '吉',
    levelWarn: '凶',
    levelMixed: '吉凶混杂',
    yearSuffix: '年',
    currentYear: '虚岁',
    daxianLabel: '大限',
    compatScore: '综合匹配评分',
    yearByYear: '逐年时间线',
    survivalRate: '婚姻存活率',
    survivalBase: '基础：',
    survivalPrev: '预防后：',
    solveTitle: '化解：',
    footer: '紫微斗数 · AI 解读 · 仅供参考',
    langToggle: 'EN',
    backShort: '返回',
    compTitle: '关系匹配分析',
    compDesc: 'AI 分析两人命盘交互\n婚姻和谐度K线 · 危机预警 · 化解方案',
    compSample: '示例：甲戌女命 × 壬午男命 · 78分 · 强强联合型',
    compBtn: '查看示例匹配分析',
    p1Love: 'P1爱情',
    p2Love: 'P2爱情',
    harmony: '和谐度',
  },
  en: {
    back: '← Back to Home',
    title: 'Destiny Chart',
    comingSoonBadge: 'Coming Soon',
    comingSoonMsg: 'Full destiny chart analysis is under development. The sample chart below is for reference only.',
    sampleLabel: 'Sample: 1994, Jiaxu Year · 9th Lunar Month · Day 21 · You-hour · Female',
    chartTitle: 'Zi Wei Dou Shu Chart',
    tab0: 'Chart · Readings',
    tab1: 'K-Line · Forecasts',
    tabCmp0: 'K-Line',
    tabCmp1: 'Crisis Alerts',
    tabCmp2: 'Solutions',
    addPerson: '+ Add Another Person · Compatibility',
    fourHuaTitle: 'Birth Year Four Transformations',
    deepReadings: 'Deep Chart Analysis',
    lifeAdvice: 'Life Advice',
    klineTitle: 'Life K-Line Chart',
    klineCeiling: 'Ceiling',
    klinePeak: 'Peak',
    bestWindow: 'Best Window: ',
    lifeHighlights: 'Favorable',
    lifeCaution: 'Caution',
    keyYearTitle: 'Key Annual Forecasts',
    levelGreat: 'Auspicious',
    levelGood: 'Good',
    levelWarn: 'Warning',
    levelMixed: 'Mixed',
    yearSuffix: '',
    currentYear: 'Age',
    daxianLabel: 'Current Decade:',
    compatScore: 'Compatibility Score',
    yearByYear: 'Year-by-Year Timeline',
    survivalRate: 'Marriage Survival Rate',
    survivalBase: 'Baseline: ',
    survivalPrev: 'With Prevention: ',
    solveTitle: 'Solution: ',
    footer: 'Zi Wei Dou Shu · AI Reading · For Reference Only',
    langToggle: '中文',
    backShort: 'Back',
    compTitle: 'Compatibility Analysis',
    compDesc: 'AI cross-analysis of two charts\nHarmony K-Line · Crisis Alerts · Prevention Plans',
    compSample: 'Sample: Jia Xu Female × Ren Wu Male · Score 78 · Power Couple',
    compBtn: 'View Sample Compatibility',
    p1Love: 'P1 Love',
    p2Love: 'P2 Love',
    harmony: 'Harmony',
  }
};

// ===== STYLE CONSTANTS =====
const C = {bg:"#f7f7f7",t1:"#111",t2:"#555",t3:"#999",love:"#d44060",career:"#2563eb",health:"#16a34a",wealth:"#d97706",child:"#7c3aed",danger:"#dc2626",warn:"#ea580c",safe:"#16a34a",hL:"#16a34a",hQ:"#dc2626",hK:"#2563eb",hJ:"#888"};
const DIM = {love:{zh:"爱情",en:"Love",c:C.love},career:{zh:"事业",en:"Career",c:C.career},health:{zh:"健康",en:"Health",c:C.health},wealth:{zh:"财富",en:"Wealth",c:C.wealth},children:{zh:"子女",en:"Children",c:C.child}};
const sC = {background:"#fff",border:"1px solid #eee",borderRadius:8,padding:14,marginBottom:10};
const sB = p=>({width:"100%",padding:"13px",background:p?"#111":"#fff",color:p?"#fff":"#111",border:p?"none":"1px solid #ddd",borderRadius:8,fontSize:15,fontWeight:600,cursor:"pointer"});
// Combined hua color maps — handles both ZH ("禄") and EN ("Lu (禄)") formats
const HUA_COLOR = {"禄":C.hL,"权":C.hQ,"科":C.hK,"忌":C.hJ,"Lu (禄)":C.hL,"Quan (权)":C.hQ,"Ke (科)":C.hK,"Ji (忌)":C.hJ};
const HUA_BG    = {"禄":"#dcfce7","权":"#fee2e2","科":"#dbeafe","忌":"#f3f4f6","Lu (禄)":"#dcfce7","Quan (权)":"#fee2e2","Ke (科)":"#dbeafe","Ji (忌)":"#f3f4f6"};

// ===== ZH DEMO DATA =====
const DEMO_RD_ZH={basic:{lunarYear:"甲戌",lunarYearGan:"甲",lunarMonth:"九月",lunarDay:"廿一",shichen:"酉时",mingGong:"午",mingGongGanZhi:"丙午",shenGong:"子",shenGongPalace:"财帛宫",wuxingJu:"水二局",juNumber:2,daxianDir:"逆行",birthYear:1994},palaces:[{name:"命宫",pos:"午",ganZhi:"丙午",mainStars:["廉贞","破军"],auxStars:["火星","铃星"],hua:[{star:"廉贞",type:"禄"}],daxian:"2-11",isMing:true,isShen:false,isCurrent:false},{name:"兄弟宫",pos:"巳",ganZhi:"乙巳",mainStars:[],auxStars:["天刑"],hua:[],daxian:"12-21",isMing:false,isShen:false,isCurrent:false},{name:"夫妻宫",pos:"辰",ganZhi:"甲辰",mainStars:["天同","天梁"],auxStars:["火星"],hua:[],daxian:"22-31",isMing:false,isShen:false,isCurrent:false},{name:"子女宫",pos:"卯",ganZhi:"癸卯",mainStars:["天相"],auxStars:["天魁","天喜"],hua:[],daxian:"32-41",isMing:false,isShen:false,isCurrent:true},{name:"财帛宫",pos:"寅",ganZhi:"壬寅",mainStars:["巨门"],auxStars:["地劫"],hua:[],daxian:"42-51",isMing:false,isShen:true,isCurrent:false},{name:"疾厄宫",pos:"丑",ganZhi:"辛丑",mainStars:["贪狼"],auxStars:["天马"],hua:[],daxian:"52-61",isMing:false,isShen:false,isCurrent:false},{name:"迁移宫",pos:"子",ganZhi:"庚子",mainStars:["太阳"],auxStars:["天钺"],hua:[{star:"太阳",type:"忌"}],daxian:"62-71",isMing:false,isShen:false,isCurrent:false},{name:"交友宫",pos:"亥",ganZhi:"己亥",mainStars:["武曲","天府"],auxStars:["禄存"],hua:[],daxian:"72-81",isMing:false,isShen:false,isCurrent:false},{name:"事业宫",pos:"戌",ganZhi:"戊戌",mainStars:[],auxStars:["右弼"],hua:[],daxian:"",isMing:false,isShen:false,isCurrent:false},{name:"田宅宫",pos:"酉",ganZhi:"丁酉",mainStars:["太阴"],auxStars:["文曲"],hua:[],daxian:"",isMing:false,isShen:false,isCurrent:false},{name:"福德宫",pos:"申",ganZhi:"丙申",mainStars:["紫微","七杀"],auxStars:["天魁"],hua:[],daxian:"",isMing:false,isShen:false,isCurrent:false},{name:"父母宫",pos:"未",ganZhi:"乙未",mainStars:["天机"],auxStars:["文昌"],hua:[{star:"天机",type:"权"}],daxian:"",isMing:false,isShen:false,isCurrent:false}],fourHua:[{star:"廉贞",type:"禄",palace:"命宫"},{star:"破军",type:"权",palace:"命宫"},{star:"武曲",type:"科",palace:"交友宫"},{star:"太阳",type:"忌",palace:"迁移宫"}],kline:{love:{max:250,peak:"32-41岁",note:"夫妻宫天同天梁有底蕴",points:[[0,15],[5,18],[10,25],[15,35],[18,55],[22,85],[25,110],[28,140],[30,155],[32,160],[35,162],[38,155],[42,148],[46,140],[50,130],[52,118],[55,125],[58,142],[62,140],[68,135],[75,125],[80,115]]},career:{max:300,peak:"52-61岁",note:"巨门靠口才生财",points:[[0,10],[5,12],[10,20],[15,35],[20,55],[25,82],[28,95],[30,108],[32,120],[35,138],[38,155],[42,180],[46,210],[50,240],[52,270],[55,260],[58,240],[62,195],[68,175],[75,155],[80,140]]},health:{max:280,peak:"32-41岁",note:"廉贞化禄有正面加持",points:[[0,80],[5,120],[10,155],[15,170],[20,175],[25,178],[28,180],[30,182],[32,188],[35,190],[38,185],[42,178],[46,162],[50,148],[52,128],[55,118],[58,135],[62,140],[68,130],[75,115],[80,100]]},wealth:{max:380,peak:"52-61岁",note:"身宫财帛+禄马交驰",points:[[0,8],[5,10],[10,18],[15,30],[20,55],[25,88],[28,105],[30,120],[32,140],[35,165],[38,188],[42,235],[46,285],[50,320],[52,350],[55,340],[58,310],[62,268],[68,240],[75,210],[80,185]]},children:{max:250,peak:"32-41岁",note:"天相子女宫",points:[[0,null],[10,null],[20,null],[25,20],[28,55],[30,85],[32,140],[35,180],[38,200],[42,185],[46,165],[50,148],[55,125],[60,112],[68,105],[75,95],[80,85]]}},readings:[{title:"命宫 · 廉贞化禄+破军在午",text:"廉贞化禄坐命，精明干练，有领导才能。破军同宫加强开创精神，但也带来波动。"},{title:"身宫在财帛宫 · 巨门+地劫",text:"一生重心与财富紧密相关。天生善理财，以口才求财，适合咨询、教育、销售。"},{title:"夫妻宫 · 天同天梁+火星",text:"感情有底蕴，伴侣偏成熟稳重型。火星添波折，太阳化忌对照，付出多回报少。"},{title:"财帛宫为身宫—一生理财之命",text:"身宫落财帛极为罕见。52-61岁禄马交驰大限将达财富巅峰。"}],currentYear:{year:"2026",ganZhi:"丙午",age:32,daxianPalace:"卯宫(子女宫)",yearHua:[{star:"天同",type:"禄",palace:"夫妻宫"},{star:"天机",type:"权",palace:"父母宫"}],highlights:["天同化禄直入夫妻宫，感情大爆发之年","子女宫大限壮年，子女缘佳"],caution:["火星在夫妻宫，控制情绪","地劫在财帛，避免冲动消费"]},lifeAdvice:["当前32-41岁天相大限，是确立婚姻和家庭的最佳时期","感情上需控制火星带来的急躁","事业52-61岁才是巅峰，稳步积累","充分发挥身宫财帛的优势，主导家庭理财"],deepReadings:[{title:"💫 命格总论：廉贞化禄+破军 — 开创型领袖命格",text:"廉贞星本身就是十四主星中最精明、最有策略性的一颗，化禄后更是如虎添翼。你天生具备看穿本质的眼光和果断的决策力。破军同宫增添了「不破不立」的勇气——你不是那种守成的人，而是一个天生的开拓者。\n\n但火星铃星同守命宫，这是一把双刃剑：行动力极强，想到就做，但情绪来得快去得也快。年轻时容易因冲动得罪人或做错决定，30岁后逐渐学会控制火气，反而成为你的推动力。\n\n甲年生人廉贞化禄坐命，一生最大的福气就是：你做的事情，总能找到赚钱的路子。别人看到困难，你看到的是机会。"},{title:"💰 财富格局：身宫落财帛+禄马交驰 — 天生财主命",text:"身宫落在财帛宫，这在紫微斗数中是极为罕见的格局，意味着你这一生的成就感、存在价值、人生重心全都与「钱」紧密绑定。你不是那种视金钱如粪土的文艺青年——你对钱有天然的敏感度和掌控力。\n\n巨门星坐财帛宫，说明你的财路来自「口」——靠说话、沟通、专业知识赚钱。咨询、教育、培训、销售、中介、内容创作都是你的舞台。地劫同宫虽然表示偶尔有意外支出，但身宫的力量足以弥补。\n\n最重要的是：52-61岁贪狼+天马大限形成「禄马交驰」格局，这是紫微斗数中最强的财富组合之一。你的财富天花板（380）极高，而且是中晚年爆发型——35岁之前是积累期，不要着急。"},{title:"💕 感情格局：天同天梁+太阳化忌 — 付出型伴侣",text:"夫妻宫天同天梁同守，你需要的伴侣是成熟、稳重、有安全感的类型。天同带来的温柔和天梁带来的「老师感」叠加在一起，说明你的理想型是比你年长或者心智特别成熟的人。\n\n但火星在夫妻宫增加了感情的波折——你们之间不会太平淡，会有激烈的争吵，但也有热烈的和好。太阳化忌从迁移宫对照夫妻宫，这是最需要注意的：你在感情中天生容易「付出过多而被忽略」。\n\n当前32-41岁天相大限是确立终身伴侣的最佳窗口。2026年天同化禄直入夫妻宫，这一年感情运极强——如果你单身，很可能遇到对的人。"},{title:"📈 事业格局：大器晚成型",text:"事业宫空宫，借对宫财帛宫的巨门力量，说明你的事业成就与财富直接挂钩——你不是那种追求虚名的人，你的事业目标很实际：赚钱。\n\n命宫廉贞化禄+破军的组合最适合创业或在变化大的行业中发展。你在一个公司安安稳稳干一辈子的概率不大——你需要挑战，需要变化，需要自己做决定的空间。\n\n事业高峰来得比较晚：52-61岁贪狼天马大限才是真正的巅峰。年轻时不要因为事业进展慢而焦虑，你的格局是「厚积薄发」型的。"}],liunian:[{year:"2026",title:"丙午年 · 天同化禄入夫妻宫",level:"great",text:"今年是感情大年！流年天同化禄直接飞入夫妻宫的天同星上，形成双禄叠加。单身者极大概率遇到心仪对象，已有伴侣者关系会有质的飞跃。同时子女宫大限正当壮年，如有生育计划今年也是上佳时机。需要注意的是火星仍在夫妻宫，热烈之余要控制好脾气。"},{year:"2027",title:"丁未年 · 太阴化禄入田宅宫",level:"good",text:"太阴化禄飞入田宅宫的太阴星上，家庭运和不动产运极佳。适合购房置业、改善居住环境。家庭关系和睦，与母亲的关系特别好。"},{year:"2030",title:"庚戌年 · 太阳化禄但天同化忌",level:"mixed",text:"庚年天同化忌冲击夫妻宫天同星，感情可能出现矛盾。但太阳化禄也带来事业上的贵人运。这一年要特别注意沟通方式，不要因小事引发大矛盾。财务上还不错，但不宜做重大投资。"},{year:"2034",title:"甲寅年 · 廉贞化禄回照命宫",level:"great",text:"甲年四化和你的生年四化完全相同！廉贞化禄再次加持，事业财运双爆发。这一年特别适合创业、跳槽、开拓新业务。加上此时正在子女宫天相大限的中后段，人生各方面都在高位运行。"},{year:"2040",title:"庚申年 · 天同化忌+进入巨门大限",level:"warn",text:"庚年天同化忌再次冲击夫妻宫，加上42-51岁进入巨门+地劫的财帛大限，婚姻和财务都面临考验。巨门大限靠口才吃饭，但地劫带来财务波动。这一年特别需要稳健经营，不要冲动做大决定。"},{year:"2050",title:"庚午年 · 又一个庚年+贪狼大限",level:"warn",text:"庚年天同化忌三度冲击夫妻宫。但此时已在52-61岁贪狼天马大限，事业财富正在巅峰。主要矛盾是：你太忙了，没时间顾家。解决方案是让伴侣参与你的事业，把「各忙各的」变成「一起忙」。"}]};

const DEMO_CMP_ZH={score:78,verdict:"强强联合型",summary:"两人命盘互补性强。她的财帛身宫和他的禄存命宫在经济上形成支撑。主要挑战来自他的武曲化忌夫妻宫。",energyCeilings:{p1:{love:250,career:300,health:280,wealth:380},p2:{love:180,career:420,health:300,wealth:400}},bestWindow:{start:2029,end:2033,reason:"双方大限稳定，事业财富均上升"},harmonyByYear:[[2025,42],[2026,62],[2027,65],[2028,60],[2029,58],[2030,52],[2031,64],[2032,68],[2033,72],[2034,76],[2035,80],[2036,74],[2037,68],[2038,58],[2039,62],[2040,38],[2041,52],[2042,58],[2043,62],[2044,60],[2045,55],[2046,50],[2047,48],[2048,35],[2049,32],[2050,28],[2051,38],[2052,48],[2053,58],[2054,65],[2055,72],[2056,74],[2057,72],[2058,75],[2059,73],[2060,70]],p1Love:[[2025,80],[2026,145],[2027,155],[2028,160],[2029,148],[2030,120],[2031,148],[2032,152],[2033,155],[2034,158],[2035,162],[2036,145],[2037,132],[2038,110],[2039,118],[2040,78],[2041,105],[2042,112],[2043,118],[2044,115],[2045,108],[2046,102],[2047,98],[2048,135],[2049,142],[2050,128],[2051,115],[2052,110],[2053,118],[2054,125],[2055,132],[2056,138],[2057,135],[2058,142],[2059,140],[2060,135]],p2Love:[[2025,72],[2026,78],[2027,75],[2028,72],[2029,68],[2030,58],[2031,78],[2032,82],[2033,88],[2034,92],[2035,98],[2036,88],[2037,82],[2038,72],[2039,75],[2040,52],[2041,68],[2042,72],[2043,75],[2044,72],[2045,65],[2046,58],[2047,52],[2048,42],[2049,38],[2050,35],[2051,48],[2052,58],[2053,68],[2054,78],[2055,85],[2056,88],[2057,85],[2058,92],[2059,90],[2060,85]],crises:[{period:"2036-2038",level:2,title:"口舌危机",emoji:"⚡",description:"她进入巨门+地劫大限，变得直言不讳。他进入天梁+地空大限，精神空虚。两人同时踩地空/地劫，质疑婚姻。",solution:"将巨门口才导向事业。建立「冷静期」规则。"},{period:"2040年",level:3,title:"庚年引爆点",emoji:"💥",description:"庚申年天同化忌直冲她夫妻宫天同星。叠加巨门地劫大限，火上浇油。婚姻生死线。",solution:"提前2039年调整：增加单独相处时间，避免重大财务决定。"},{period:"2048-2052",level:4,title:"桃花危机期",emoji:"🌹",description:"她廉贞化禄+贪狼+天马大限，桃花大爆发。他七杀事业巅峰不顾家。2050年庚年叠加。",solution:"他必须在事业巅峰期留出家庭时间。一起做事业、一起出差。"}],timeline:[{year:"2026-2029",level:"safe",text:"确立期。天同化禄入夫妻宫。"},{year:"2030",level:"warm",text:"庚年天同化忌，影响可控。"},{year:"2031-2035",level:"safe",text:"蜜月期。和谐度最高。"},{year:"2036-2038",level:"warm",text:"口舌危机。争吵增多。"},{year:"2039-2041",level:"danger",text:"★★★ 高危。2040庚年。"},{year:"2042-2045",level:"warm",text:"双方忙事业，平淡期。"},{year:"2046-2052",level:"danger",text:"★★★★ 极高危。桃花+不顾家。"},{year:"2053-2060",level:"safe",text:"回暖期。越老越和谐。"}],survivalRate:{base:72,withPrevention:88},keyAdvice:[{title:"财务",text:"让她主管家庭财务，他负责开源。"},{title:"沟通",text:"他喜新鲜，她偏安稳。定期一起尝试新事物。"},{title:"节奏",text:"他事业巅峰早于她，互相支持对方节奏。"},{title:"子女",text:"2030-2038年生育黄金期。"}]};

// ===== EN DEMO DATA =====
const DEMO_RD_EN={basic:{lunarYear:"Jia Xu (甲戌)",lunarYearGan:"Jia (甲)",lunarMonth:"9th Month",lunarDay:"21st Day",shichen:"You Hour (酉时)",mingGong:"Wu (午)",mingGongGanZhi:"Bing Wu (丙午)",shenGong:"Zi (子)",shenGongPalace:"Wealth Palace",wuxingJu:"Water-2 Formation",juNumber:2,daxianDir:"Retrograde",birthYear:1994},palaces:[{name:"Life Palace (命宫)",pos:"午",ganZhi:"丙午",mainStars:["Lian Zhen (廉贞)","Po Jun (破军)"],auxStars:["Fire Star","Bell Star"],hua:[{star:"Lian Zhen (廉贞)",type:"Lu (禄)"}],daxian:"2-11",isMing:true,isShen:false,isCurrent:false},{name:"Siblings (兄弟宫)",pos:"巳",ganZhi:"乙巳",mainStars:[],auxStars:["Tian Xing"],hua:[],daxian:"12-21",isMing:false,isShen:false,isCurrent:false},{name:"Marriage (夫妻宫)",pos:"辰",ganZhi:"甲辰",mainStars:["Tian Tong (天同)","Tian Liang (天梁)"],auxStars:["Fire Star"],hua:[],daxian:"22-31",isMing:false,isShen:false,isCurrent:false},{name:"Children (子女宫)",pos:"卯",ganZhi:"癸卯",mainStars:["Tian Xiang (天相)"],auxStars:["Tian Kui","Tian Xi"],hua:[],daxian:"32-41",isMing:false,isShen:false,isCurrent:true},{name:"Wealth (财帛宫)",pos:"寅",ganZhi:"壬寅",mainStars:["Ju Men (巨门)"],auxStars:["Di Jie"],hua:[],daxian:"42-51",isMing:false,isShen:true,isCurrent:false},{name:"Health (疾厄宫)",pos:"丑",ganZhi:"辛丑",mainStars:["Tan Lang (贪狼)"],auxStars:["Tian Ma"],hua:[],daxian:"52-61",isMing:false,isShen:false,isCurrent:false},{name:"Travel (迁移宫)",pos:"子",ganZhi:"庚子",mainStars:["Tai Yang (太阳)"],auxStars:["Tian Yue"],hua:[{star:"Tai Yang (太阳)",type:"Ji (忌)"}],daxian:"62-71",isMing:false,isShen:false,isCurrent:false},{name:"Friends (交友宫)",pos:"亥",ganZhi:"己亥",mainStars:["Wu Qu (武曲)","Tian Fu (天府)"],auxStars:["Lu Cun"],hua:[],daxian:"72-81",isMing:false,isShen:false,isCurrent:false},{name:"Career (事业宫)",pos:"戌",ganZhi:"戊戌",mainStars:[],auxStars:["You Bi"],hua:[],daxian:"",isMing:false,isShen:false,isCurrent:false},{name:"Property (田宅宫)",pos:"酉",ganZhi:"丁酉",mainStars:["Tai Yin (太阴)"],auxStars:["Wen Qu"],hua:[],daxian:"",isMing:false,isShen:false,isCurrent:false},{name:"Fortune (福德宫)",pos:"申",ganZhi:"丙申",mainStars:["Zi Wei (紫微)","Qi Sha (七杀)"],auxStars:["Tian Kui"],hua:[],daxian:"",isMing:false,isShen:false,isCurrent:false},{name:"Parents (父母宫)",pos:"未",ganZhi:"乙未",mainStars:["Tian Ji (天机)"],auxStars:["Wen Chang"],hua:[{star:"Tian Ji (天机)",type:"Quan (权)"}],daxian:"",isMing:false,isShen:false,isCurrent:false}],fourHua:[{star:"Lian Zhen (廉贞)",type:"Lu (禄)",palace:"Life Palace"},{star:"Po Jun (破军)",type:"Quan (权)",palace:"Life Palace"},{star:"Wu Qu (武曲)",type:"Ke (科)",palace:"Friends Palace"},{star:"Tai Yang (太阳)",type:"Ji (忌)",palace:"Travel Palace"}],kline:{love:{max:250,peak:"Age 32-41",note:"Marriage palace has depth",points:[[0,15],[5,18],[10,25],[15,35],[18,55],[22,85],[25,110],[28,140],[30,155],[32,160],[35,162],[38,155],[42,148],[46,140],[50,130],[52,118],[55,125],[58,142],[62,140],[68,135],[75,125],[80,115]]},career:{max:300,peak:"Age 52-61",note:"Ju Men: wealth through speech",points:[[0,10],[5,12],[10,20],[15,35],[20,55],[25,82],[28,95],[30,108],[32,120],[35,138],[38,155],[42,180],[46,210],[50,240],[52,270],[55,260],[58,240],[62,195],[68,175],[75,155],[80,140]]},health:{max:280,peak:"Age 32-41",note:"Lian Zhen Lu boosts vitality",points:[[0,80],[5,120],[10,155],[15,170],[20,175],[25,178],[28,180],[30,182],[32,188],[35,190],[38,185],[42,178],[46,162],[50,148],[52,128],[55,118],[58,135],[62,140],[68,130],[75,115],[80,100]]},wealth:{max:380,peak:"Age 52-61",note:"Body palace in Wealth + Lu-Ma",points:[[0,8],[5,10],[10,18],[15,30],[20,55],[25,88],[28,105],[30,120],[32,140],[35,165],[38,188],[42,235],[46,285],[50,320],[52,350],[55,340],[58,310],[62,268],[68,240],[75,210],[80,185]]},children:{max:250,peak:"Age 32-41",note:"Tian Xiang in Children palace",points:[[0,null],[10,null],[20,null],[25,20],[28,55],[30,85],[32,140],[35,180],[38,200],[42,185],[46,165],[50,148],[55,125],[60,112],[68,105],[75,95],[80,85]]}},readings:[{title:"Life Palace: Lian Zhen Lu + Po Jun",text:"Sharp mind, decisive leadership. Po Jun adds pioneering spirit with volatility."},{title:"Body Palace in Wealth: Ju Men + Di Jie",text:"Life purpose tied to wealth. Natural financial talent. Career through communication."},{title:"Marriage Palace: Tian Tong + Tian Liang",text:"Prefers mature, stable partners. Fire Star adds passion and conflict."},{title:"Rare: Body Palace Falls in Wealth Palace",text:"Extremely rare formation. Peak wealth during age 52-61 with Lu-Ma Jiao Chi pattern."}],currentYear:{year:"2026",ganZhi:"Bing Wu",age:32,daxianPalace:"Mao Palace (Children)",yearHua:[{star:"Tian Tong",type:"Lu",palace:"Marriage Palace"},{star:"Tian Ji",type:"Quan",palace:"Parents Palace"}],highlights:["Tian Tong Lu enters Marriage Palace directly — big love year","Children Palace decade in prime — good for fertility"],caution:["Fire Star in Marriage Palace — control temper","Di Jie in Wealth — avoid impulsive spending"]},lifeAdvice:["Age 32-41 Tian Xiang decade: best window for marriage & family","Control Fire Star's impulsiveness in relationships","Career peaks at 52-61 — accumulate steadily now","Leverage your Wealth Body Palace — lead family finances"],deepReadings:[{title:"💫 Destiny Profile: Lian Zhen Lu + Po Jun — Pioneering Leader",text:"Lian Zhen is the most strategic of all 14 main stars. With the Lu (prosperity) transformation, it becomes extraordinarily powerful. You have an innate ability to see through to the essence of things and make decisive calls. Po Jun in the same palace adds the courage of \"destruction before creation\" — you're not someone who maintains the status quo, you're a natural pioneer.\n\nFire Star and Bell Star guarding your Life Palace is a double-edged sword: incredible action-orientation and drive, but emotions come and go quickly. In youth, impulsiveness may cause regrets; after 30, you learn to channel that fire into productive momentum.\n\nAs a Jia-year native with Lian Zhen Lu in your Life Palace, your greatest blessing is this: whatever you pursue, you'll find a way to monetize it. Where others see obstacles, you see opportunities."},{title:"💰 Wealth Pattern: Body Palace in Wealth + Lu-Ma Galloping — Born Financial Master",text:"Your Body Palace (Shen Gong) falling in the Wealth Palace is extremely rare in Zi Wei Dou Shu. It means your sense of achievement, self-worth, and life's center of gravity are all intimately tied to money. You have a natural sensitivity and command over finances.\n\nJu Men (Giant Gate) star in your Wealth Palace means your money comes from your \"mouth\" — through speaking, communication, and expertise. Consulting, education, training, sales, content creation are all your arena. Di Jie may cause occasional unexpected expenses, but your Body Palace power compensates.\n\nMost importantly: ages 52-61 feature the Tan Lang + Tian Ma decade forming the legendary \"Lu-Ma Jiao Chi\" (Prosperity Horse Galloping) pattern — one of the most powerful wealth combinations in Zi Wei Dou Shu. Your wealth ceiling (380) is extremely high, and you're a late-bloomer type. Before 35 is accumulation phase — don't rush."},{title:"💕 Love Pattern: Tian Tong + Tian Liang + Tai Yang Ji — The Giver",text:"Marriage Palace with Tian Tong and Tian Liang together means you need a partner who is mature, stable, and provides security. Tian Tong's gentleness plus Tian Liang's \"mentor energy\" suggest your ideal type is someone older or exceptionally emotionally mature.\n\nFire Star in the Marriage Palace adds turbulence — your relationship won't be boring. There will be passionate arguments and equally passionate reconciliations. Tai Yang Ji opposing from the Travel Palace is the key warning: you naturally tend to give too much in love while being overlooked.\n\nYour current decade (age 32-41, Tian Xiang) is the optimal window for finding a life partner. In 2026, Tian Tong Lu flies directly into your Marriage Palace — if you're single, there's a very high chance of meeting the right person this year."},{title:"📈 Career Pattern: Late Bloomer",text:"Your Career Palace is empty, borrowing power from the opposing Wealth Palace's Ju Men. This means career achievement is directly tied to financial success — you're not someone who chases fame; your goals are practical: making money.\n\nThe Lian Zhen Lu + Po Jun combination in your Life Palace is best suited for entrepreneurship or industries with high variability. The probability of you staying at one company your whole life is low — you need challenge, change, and the freedom to make your own decisions.\n\nCareer peak comes late: the Tan Lang + Tian Ma decade at age 52-61 is the true summit. Don't be anxious about slow career progress in your youth. Your pattern is the \"steady accumulation, explosive harvest\" type."}],liunian:[{year:"2026",title:"Bing Wu Year · Tian Tong Lu Enters Marriage Palace",level:"great",text:"This is THE love year! Annual Tian Tong Lu flies directly onto the Tian Tong star in your Marriage Palace, creating a double-prosperity overlay. Singles have a very high chance of meeting someone special. Those in relationships will see a qualitative leap. Also great for fertility planning as you're in the Children Palace decade. Watch out: Fire Star still in Marriage Palace — control your temper amid the excitement."},{year:"2027",title:"Ding Wei Year · Tai Yin Lu Enters Property Palace",level:"good",text:"Tai Yin Lu flies into your Property Palace onto Tai Yin itself — excellent for real estate and family life. Great year for buying property or improving living conditions. Harmonious family relationships, especially with your mother."},{year:"2030",title:"Geng Xu Year · Mixed: Tai Yang Lu but Tian Tong Ji",level:"mixed",text:"Geng-year brings Tian Tong Ji striking your Marriage Palace's Tian Tong star — potential relationship friction. But Tai Yang Lu also brings career benefactors. Pay extra attention to communication this year. Finances are okay but avoid major investments."},{year:"2034",title:"Jia Yin Year · Lian Zhen Lu Returns to Life Palace",level:"great",text:"Jia-year Four Transformations are identical to your birth-year pattern! Lian Zhen Lu reinforces your Life Palace again — career and wealth double explosion. Ideal year for starting a business, changing jobs, or expanding into new territory. You're in the strong middle of your Tian Xiang decade with everything running high."},{year:"2040",title:"Geng Shen Year · Tian Tong Ji + Entering Ju Men Decade",level:"warn",text:"Geng-year Tian Tong Ji strikes Marriage Palace again, compounded by entering the age 42-51 Ju Men + Di Jie decade. Both marriage and finances face testing. The Ju Men decade earns through speaking ability, but Di Jie brings financial volatility. Exercise extreme caution — no impulsive decisions."},{year:"2050",title:"Geng Wu Year · Third Geng Year + Tan Lang Decade",level:"warn",text:"Geng-year Tian Tong Ji hits Marriage Palace for the third time. But you're now in the age 52-61 Tan Lang + Tian Ma decade — career and wealth at peak. The main conflict: you're too busy for family. Solution: involve your partner in your work. Turn \"each doing their own thing\" into \"busy together\"."}]};

const DEMO_CMP_EN={score:78,verdict:"Power Couple",summary:"Strong complementary charts. Her Wealth Body Palace and his Lu Cun Life Palace create financial synergy. Main challenge: his Wu Qu Ji in Marriage Palace.",energyCeilings:{p1:{love:250,career:300,health:280,wealth:380},p2:{love:180,career:420,health:300,wealth:400}},bestWindow:{start:2029,end:2033,reason:"Both decades stable, career & wealth rising"},harmonyByYear:[[2025,42],[2026,62],[2027,65],[2028,60],[2029,58],[2030,52],[2031,64],[2032,68],[2033,72],[2034,76],[2035,80],[2036,74],[2037,68],[2038,58],[2039,62],[2040,38],[2041,52],[2042,58],[2043,62],[2044,60],[2045,55],[2046,50],[2047,48],[2048,35],[2049,32],[2050,28],[2051,38],[2052,48],[2053,58],[2054,65],[2055,72],[2056,74],[2057,72],[2058,75],[2059,73],[2060,70]],p1Love:[[2025,80],[2026,145],[2027,155],[2028,160],[2029,148],[2030,120],[2031,148],[2032,152],[2033,155],[2034,158],[2035,162],[2036,145],[2037,132],[2038,110],[2039,118],[2040,78],[2041,105],[2042,112],[2043,118],[2044,115],[2045,108],[2046,102],[2047,98],[2048,135],[2049,142],[2050,128],[2051,115],[2052,110],[2053,118],[2054,125],[2055,132],[2056,138],[2057,135],[2058,142],[2059,140],[2060,135]],p2Love:[[2025,72],[2026,78],[2027,75],[2028,72],[2029,68],[2030,58],[2031,78],[2032,82],[2033,88],[2034,92],[2035,98],[2036,88],[2037,82],[2038,72],[2039,75],[2040,52],[2041,68],[2042,72],[2043,75],[2044,72],[2045,65],[2046,58],[2047,52],[2048,42],[2049,38],[2050,35],[2051,48],[2052,58],[2053,68],[2054,78],[2055,85],[2056,88],[2057,85],[2058,92],[2059,90],[2060,85]],crises:[{period:"2036-2038",level:2,title:"Communication Crisis",emoji:"⚡",description:"She enters Ju Men + Di Jie decade — becomes brutally honest. He enters Tian Liang + Di Kong decade — spiritual emptiness. Both hit ground-void stars simultaneously, questioning the marriage.",solution:"Channel Ju Men's verbal power toward career. Establish a \"cooling off\" rule: separate during arguments, talk 24 hours later."},{period:"2040",level:3,title:"Geng Year Detonation",emoji:"💥",description:"Geng Shen year: Tian Tong Ji directly strikes her Marriage Palace Tian Tong star. Stacked on the Ju Men Di Jie decade — pouring oil on fire. Marriage survival line.",solution:"Prepare from 2039: increase quality alone time, avoid major financial decisions, schedule a \"second honeymoon\" trip."},{period:"2048-2052",level:4,title:"Romance Crisis Period",emoji:"🌹",description:"Her Lian Zhen Lu + Tan Lang + Tian Ma decade = romance explosion. He's at Qi Sha career peak, ignoring family. 2050 Geng year compounds everything. \"She's attracting attention + he's never home\" = maximum danger.",solution:"He MUST reserve family time during career peak. Work together, travel together. Financial stability is the best insurance."}],timeline:[{year:"2026-2029",level:"safe",text:"Establishment phase. Tian Tong Lu in Marriage Palace."},{year:"2030",level:"warm",text:"Geng year Tian Tong Ji, impact manageable."},{year:"2031-2035",level:"safe",text:"Honeymoon period. Harmony at highest."},{year:"2036-2038",level:"warm",text:"Communication crisis. Arguments increase."},{year:"2039-2041",level:"danger",text:"★★★ HIGH RISK. 2040 Geng year."},{year:"2042-2045",level:"warm",text:"Both busy with careers. Plateau period."},{year:"2046-2052",level:"danger",text:"★★★★ CRITICAL. Romance + neglect."},{year:"2053-2060",level:"safe",text:"Renewal. Increasingly harmonious with age."}],survivalRate:{base:72,withPrevention:88},keyAdvice:[{title:"Finances",text:"Let her manage household finances, he focuses on income generation."},{title:"Communication",text:"He craves novelty, she prefers stability. Try new things together regularly."},{title:"Pacing",text:"His career peaks before hers. Support each other's timing."},{title:"Children",text:"2030-2038 is the golden fertility window."}]};

// ===== K-LINE CHART =====
function KLine({ data, mode, ax, lang }) {
  const cv = useRef(null), tip = useRef(null), box = useRef(null);
  const dk = Object.keys(DIM);
  const draw = useCallback(() => {
    const c = cv.current; if (!c || !data) return;
    const dp = window.devicePixelRatio || 1;
    const W = box.current.getBoundingClientRect().width, H = Math.min(380, window.innerHeight * 0.42);
    c.width = W * dp; c.height = H * dp; c.style.width = W + "px"; c.style.height = H + "px";
    const x = c.getContext("2d"); x.setTransform(dp, 0, 0, dp, 0, 0);
    const P = {t:22,r:18,b:40,l:42}, PW = W-P.l-P.r, PH = H-P.t-P.b;
    const x0 = mode==="age"?0:(data._yr?.[0]||2025), x1 = mode==="age"?80:(data._yr?.[1]||2060);
    let gM = 0;
    dk.forEach(k => { if(data[k]?.max) gM=Math.max(gM,data[k].max); if(data[k+"_p2"]?.max) gM=Math.max(gM,data[k+"_p2"].max); });
    if(data.harmony?.max) gM=Math.max(gM,data.harmony.max);
    gM = Math.ceil(gM/50)*50||100;
    const toX = v => P.l+(v-x0)/(x1-x0)*PW, toY = v => P.t+(1-v/gM)*PH;
    x.clearRect(0,0,W,H);
    const st = gM<=100?20:gM<=200?40:gM<=300?50:100;
    for(let v=0;v<=gM;v+=st){ x.strokeStyle="#eee";x.lineWidth=0.5;x.beginPath();x.moveTo(P.l,toY(v));x.lineTo(W-P.r,toY(v));x.stroke();x.fillStyle="#bbb";x.font="9px -apple-system,sans-serif";x.textAlign="right";x.fillText(v,P.l-4,toY(v)+3); }
    const xs = mode==="age"?10:5;
    for(let v=x0;v<=x1;v+=xs){
      x.strokeStyle="#f5f5f5";x.beginPath();x.moveTo(toX(v),P.t);x.lineTo(toX(v),H-P.b);x.stroke();
      x.fillStyle="#999";x.font="9px -apple-system,sans-serif";x.textAlign="center";
      x.fillText(mode==="age"?(lang==="en"?"Age "+v:v+"岁"):""+v, toX(v), H-P.b+12);
      if(mode==="year"&&data._b1&&data._b2){x.fillStyle="#ddd";x.font="7px -apple-system,sans-serif";x.fillText((v-data._b1)+"/"+(v-data._b2),toX(v),H-P.b+21);}
    }
    if(ax!=null){const a2=toX(ax);x.strokeStyle="#ccc";x.setLineDash([3,3]);x.lineWidth=1;x.beginPath();x.moveTo(a2,P.t);x.lineTo(a2,H-P.b);x.stroke();x.setLineDash([]);x.fillStyle="#999";x.font="9px -apple-system,sans-serif";x.textAlign="center";x.fillText(lang==="en"?"← Now":"← 当前",a2+18,P.t+10);}
    const sm = (pts, col, dash, lw) => {
      const f = pts.filter(p=>p[1]!=null); if(f.length<2) return;
      x.strokeStyle=col;x.lineWidth=lw||2;x.lineJoin="round";x.lineCap="round";if(dash)x.setLineDash([5,3]);
      x.beginPath();
      for(let i=0;i<f.length;i++){if(i===0){x.moveTo(toX(f[i][0]),toY(f[i][1]));continue;}
        const t=0.3,px=toX(f[i-1][0]),py=toY(f[i-1][1]),xx=toX(f[i][0]),yy=toY(f[i][1]);
        const ppx=i>1?toX(f[i-2][0]):px,ppy=i>1?toY(f[i-2][1]):py;
        const nx=i<f.length-1?toX(f[i+1][0]):xx,ny=i<f.length-1?toY(f[i+1][1]):yy;
        x.bezierCurveTo(px+(xx-ppx)*t,py+(yy-ppy)*t,xx-(nx-px)*t,yy-(ny-py)*t,xx,yy);}
      x.stroke();x.setLineDash([]);
      const g=x.createLinearGradient(0,P.t,0,H-P.b);g.addColorStop(0,col+(dash?"06":"0D"));g.addColorStop(1,col+"02");
      x.fillStyle=g;x.beginPath();
      for(let i=0;i<f.length;i++){if(i===0){x.moveTo(toX(f[i][0]),toY(f[i][1]));continue;}const t2=0.3,px2=toX(f[i-1][0]),py2=toY(f[i-1][1]),xx2=toX(f[i][0]),yy2=toY(f[i][1]);const ppx2=i>1?toX(f[i-2][0]):px2,ppy2=i>1?toY(f[i-2][1]):py2;const nx2=i<f.length-1?toX(f[i+1][0]):xx2,ny2=i<f.length-1?toY(f[i+1][1]):yy2;x.bezierCurveTo(px2+(xx2-ppx2)*t2,py2+(yy2-ppy2)*t2,xx2-(nx2-px2)*t2,yy2-(ny2-py2)*t2,xx2,yy2);}
      x.lineTo(toX(f[f.length-1][0]),H-P.b);x.lineTo(toX(f[0][0]),H-P.b);x.closePath();x.fill();
    };
    dk.forEach(k=>{if(data[k]?.hide)return;sm(data[k]?.points||[],DIM[k]?.c||"#999",false,2);if(data[k+"_p2"]?.points)sm(data[k+"_p2"].points,DIM[k]?.c+"70",true,1.8);});
    if(data.harmony&&!data.harmony.hide){sm(data.harmony.points,"#111",false,3);data.harmony.points.forEach(pt=>{if(pt[1]==null)return;const cc=pt[1]>=70?C.safe:pt[1]>=50?C.warn:C.danger;x.fillStyle=cc;x.beginPath();x.arc(toX(pt[0]),toY(pt[1]),pt[1]<40?3:2,0,Math.PI*2);x.fill();});}
    c._p={P,PW,x0,x1,gM,toX,toY};
  },[data,mode,ax,dk,lang]);
  useEffect(()=>{draw();window.addEventListener("resize",draw);return()=>window.removeEventListener("resize",draw);},[draw]);
  const mm=e=>{
    const c2=cv.current,t2=tip.current;if(!c2?._p||!data){if(t2)t2.style.display="none";return;}
    const r=c2.getBoundingClientRect(),mx=e.clientX-r.left,{P,PW,x0,x1}=c2._p;
    const xv=Math.round((mx-P.l)/PW*(x1-x0)+x0);
    if(xv<x0||xv>x1){t2.style.display="none";return;}
    const ip=(pts,xv2)=>{if(!pts)return null;const f=pts.filter(p=>p[1]!=null);for(let i=0;i<f.length-1;i++){if(xv2>=f[i][0]&&xv2<=f[i+1][0]){const t3=(xv2-f[i][0])/(f[i+1][0]-f[i][0]);return Math.round(f[i][1]+t3*(f[i+1][1]-f[i][1]));}}return null;};
    const header = mode==="age"?(lang==="en"?"Age "+xv:xv+"岁"):(lang==="en"?xv:xv+"年");
    let h=`<div style="font-weight:700;font-size:12px;border-bottom:1px solid #eee;padding-bottom:2px;margin-bottom:2px">${header}</div>`;
    let any=false;
    if(data.harmony&&!data.harmony.hide){const v=ip(data.harmony.points,xv);if(v!=null){any=true;h+=`<div style="display:flex;justify-content:space-between;font-size:11px"><span>${lang==="en"?"Harmony":"和谐"}</span><span style="font-weight:600;color:${v>=70?C.safe:v>=50?C.warn:C.danger}">${v}/100</span></div>`;}}
    dk.forEach(k=>{if(data[k]?.hide)return;const v=ip(data[k]?.points,xv);if(v!=null){any=true;let s2=`${v}/${data[k].max}`;if(data[k+"_p2"]){const v2=ip(data[k+"_p2"].points,xv);s2=`${v||"-"} / ${v2||"-"}`;}h+=`<div style="display:flex;justify-content:space-between;font-size:11px"><span style="color:${DIM[k]?.c}">${DIM[k]?.[lang==="en"?"en":"zh"]}</span><span>${s2}</span></div>`;}});
    if(!any){t2.style.display="none";return;}
    t2.innerHTML=h;t2.style.display="block";let tx=mx+12;if(tx+160>r.width)tx=mx-170;t2.style.left=tx+"px";t2.style.top=Math.max(2,e.clientY-r.top-14)+"px";
  };
  return(<div ref={box} style={{position:"relative"}}><canvas ref={cv} onMouseMove={mm} onMouseLeave={()=>{if(tip.current)tip.current.style.display="none";}} style={{width:"100%",cursor:"crosshair"}}/><div ref={tip} style={{display:"none",position:"absolute",background:"#fff",border:"1px solid #e5e5e5",borderRadius:5,padding:"5px 8px",fontSize:11,pointerEvents:"none",zIndex:100,minWidth:130,boxShadow:"0 3px 10px rgba(0,0,0,.06)"}}/></div>);
}

// ===== GRID =====
function Grid({ palaces, basic, lang }) {
  if(!palaces||palaces.length<12) return null;
  const pm={"巳":[0,0],"午":[1,0],"未":[2,0],"申":[3,0],"辰":[0,1],"酉":[3,1],"卯":[0,2],"戌":[3,2],"寅":[0,3],"丑":[1,3],"子":[2,3],"亥":[3,3]};
  const isEn = lang === "en";
  // Trim "Name (中文)" → "Name " for EN; ZH names pass through unchanged
  const nm = s => s.split("(")[0].trimEnd();
  const huaShort = tp => tp.includes("(") ? tp.split("(")[0].trim() : tp;
  return(
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gridTemplateRows:"repeat(4,1fr)",gap:1,width:"100%",aspectRatio:"1",background:"#ddd",border:"1px solid #ccc",borderRadius:4,overflow:"hidden"}}>
      {palaces.map(p=>{
        const[c,r]=pm[p.pos]||[0,0];
        return(
          <div key={p.name} style={{gridColumn:c+1,gridRow:r+1,background:p.isMing?"#fffbeb":p.isShen?"#f0fdf4":"#fff",padding:"4px 5px",display:"flex",flexDirection:"column",overflow:"hidden",position:"relative"}}>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:isEn?8:10,fontWeight:600,color:p.isMing?"#b45309":p.isShen?"#15803d":"#333",lineHeight:1.2}}>
                {nm(p.name)}{!isEn&&p.isMing?" [命]":""}{!isEn&&p.isShen?" [身]":""}
              </span>
              <span style={{fontSize:7,color:"#ccc"}}>{p.ganZhi}</span>
            </div>
            <div style={{flex:1}}>
              {p.mainStars?.map((s,i)=>(
                <div key={i} style={{fontSize:isEn?9:11,fontWeight:600,color:"#111",lineHeight:1.2}}>
                  {nm(s)}
                  {p.hua?.filter(h=>h.star===s).map((h,j)=>(
                    <span key={j} style={{fontSize:7,marginLeft:2,padding:"0 2px",borderRadius:2,background:HUA_BG[h.type]||"#f3f4f6",color:HUA_COLOR[h.type]||"#888"}}>
                      {huaShort(h.type)}
                    </span>
                  ))}
                </div>
              ))}
              {p.auxStars?.length>0&&<div style={{fontSize:isEn?7:9,color:"#aaa",lineHeight:1.1}}>{p.auxStars.join(" ")}</div>}
            </div>
            <div style={{fontSize:7,color:p.isCurrent?"#7c3aed":"#ddd",textAlign:"right"}}>{p.daxian}</div>
            {p.isCurrent&&<div style={{position:"absolute",bottom:1,left:3,fontSize:6,color:"#7c3aed",background:"#f5f3ff",padding:"0 3px",borderRadius:2}}>{isEn?"Current":"当前"}</div>}
          </div>
        );
      })}
      <div style={{gridColumn:"2/4",gridRow:"2/4",background:"#fafafa",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:8,gap:2}}>
        {isEn ? <>
          <div style={{fontSize:13,fontWeight:800,letterSpacing:1}}>Zi Wei Dou Shu</div>
          <div style={{fontSize:9,color:"#aaa"}}>Purple Star Astrology</div>
          <div style={{width:"40%",height:1,background:"#ddd",margin:"3px 0"}}/>
          <div style={{fontSize:9,color:"#666",textAlign:"center",lineHeight:1.5}}>
            <strong>{basic?.lunarYear}</strong><br/>{basic?.lunarMonth} {basic?.lunarDay}<br/>{basic?.shichen}
          </div>
          <div style={{fontSize:8,color:"#888"}}>{basic?.wuxingJu} · {basic?.daxianDir}</div>
        </> : <>
          <div style={{fontSize:15,fontWeight:800,letterSpacing:4}}>紫微斗数</div>
          <div style={{width:"40%",height:1,background:"#ddd"}}/>
          <div style={{fontSize:11,color:"#666",textAlign:"center",lineHeight:1.5}}>
            <strong>{basic?.lunarYear}</strong>年 {basic?.lunarMonth}{basic?.lunarDay} {basic?.shichen}
          </div>
          <div style={{fontSize:10,color:"#888"}}>{basic?.wuxingJu} · {basic?.daxianDir}</div>
        </>}
      </div>
    </div>
  );
}

// ===== MAIN PAGE =====
export default function MingPanPage() {
  const [lang, setLang] = useState('zh');
  const t = TX[lang];

  // Switch demo data with language
  const rd = lang === 'en' ? DEMO_RD_EN : DEMO_RD_ZH;

  // kd holds hide-toggle state; points/max are the same in both languages
  const [kd, setKd] = useState(() => {
    const k = {};
    Object.keys(DEMO_RD_ZH.kline).forEach(d => { k[d] = {...DEMO_RD_ZH.kline[d], hide: false}; });
    return k;
  });
  const [ckd, setCkd] = useState(null);
  const [tab, setTab] = useState(0);
  const [ctab, setCTab] = useState(0);
  const [pg, setPg] = useState('result');
  const [showCompare, setShowCompare] = useState(false);

  // Switch comparison data with language
  const cmp = showCompare ? (lang === 'en' ? DEMO_CMP_EN : DEMO_CMP_ZH) : null;

  const curAge = 32;
  const dr = rd.deepReadings || [];
  const ly = rd.liunian || [];

  const loadCmpDemo = () => {
    setShowCompare(true);
    setCkd({_yr:[2025,2060],_b1:1994,_b2:2002,
      harmony:{max:100,points:DEMO_CMP_ZH.harmonyByYear,hide:false},
      love:{max:250,points:DEMO_CMP_ZH.p1Love,hide:false},
      love_p2:{max:180,points:DEMO_CMP_ZH.p2Love,hide:false}});
    setCTab(0); setPg('compare');
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",color:C.t1}}>
      <div style={{maxWidth:640,margin:"0 auto",padding:"0 16px"}}>

        {/* TOP BAR */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 0 4px"}}>
          <a href="/" style={{fontSize:13,color:"#999",textDecoration:"none"}}>{t.back}</a>
          <span style={{fontSize:14,fontWeight:600}}>{t.title}</span>
          <button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            style={{padding:"5px 10px",background:"rgba(0,0,0,0.05)",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,color:"#555"}}>
            {t.langToggle}
          </button>
        </div>

        {/* COMING SOON BANNER */}
        <div style={{background:"linear-gradient(135deg,#fff7ed,#fef3c7)",border:"1px solid #fde68a",borderRadius:10,padding:"12px 16px",margin:"10px 0 14px",display:"flex",alignItems:"flex-start",gap:10}}>
          <span style={{fontSize:18,lineHeight:1}}>🚧</span>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              <span style={{fontSize:13,fontWeight:700,color:"#92400e"}}>{t.comingSoonBadge}</span>
              <span style={{fontSize:10,padding:"1px 7px",background:"#fbbf24",color:"#fff",borderRadius:10,fontWeight:600}}>BETA</span>
            </div>
            <p style={{fontSize:12,color:"#78350f",lineHeight:1.7,margin:0}}>{t.comingSoonMsg}</p>
          </div>
        </div>

        {/* SAMPLE LABEL */}
        <div style={{fontSize:11,color:"#bbb",textAlign:"center",padding:"4px 0 10px"}}>{t.sampleLabel}</div>

        {/* RESULT PAGE */}
        {pg === 'result' && (
          <div style={{paddingBottom:40}}>
            <div style={{...sC,textAlign:"center",padding:"14px"}}>
              <h2 style={{fontSize:lang==="en"?15:18,fontWeight:700,letterSpacing:lang==="en"?1:3}}>{t.chartTitle}</h2>
              <p style={{fontSize:11,color:"#999",marginTop:3}}>{rd.basic?.lunarYear} · {rd.basic?.lunarMonth} {rd.basic?.lunarDay} · {rd.basic?.shichen} · {rd.basic?.wuxingJu}</p>
            </div>
            <div style={{display:"flex",borderBottom:"1px solid #e5e5e5",marginBottom:10}}>
              {[t.tab0, t.tab1].map((tl,i)=>(
                <button key={i} onClick={()=>setTab(i)} style={{flex:1,padding:"10px 0",fontSize:13,fontWeight:tab===i?600:400,color:tab===i?"#111":"#999",background:"none",border:"none",borderBottom:tab===i?"2px solid #111":"2px solid transparent",cursor:"pointer"}}>{tl}</button>
              ))}
            </div>

            {/* TAB 0: Chart + Readings */}
            {tab === 0 && <>
              <Grid palaces={rd.palaces} basic={rd.basic} lang={lang}/>
              {rd.fourHua && (
                <div style={{...sC,marginTop:8}}>
                  <div style={{fontSize:12,fontWeight:600,marginBottom:6}}>{t.fourHuaTitle} · {rd.basic?.lunarYearGan}</div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    {rd.fourHua.map((h,i)=>{
                      const sn = h.star.includes("(") ? h.star.split("(")[0].trimEnd() : h.star;
                      const tn = h.type.includes("(") ? h.type.split("(")[0].trim() : h.type;
                      return (
                        <span key={i} style={{fontSize:12}}>
                          {sn}
                          <span style={{fontSize:8,marginLeft:2,padding:"0 3px",borderRadius:2,color:"#fff",background:HUA_COLOR[h.type]||"#888"}}>{tn}</span>
                          <span style={{color:"#bbb",fontSize:10}}>→{h.palace}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
              <div style={{marginTop:14}}>
                <div style={{fontSize:14,fontWeight:700,marginBottom:10,paddingBottom:6,borderBottom:"2px solid #111"}}>{t.deepReadings}</div>
                {dr.map((r,i)=>(
                  <div key={i} style={{...sC,borderLeft:"3px solid "+(i===0?"#111":i===1?C.wealth:i===2?C.love:C.career)}}>
                    <div style={{fontSize:13,fontWeight:700,marginBottom:8,color:"#222"}}>{r.title}</div>
                    {(r.text||"").split("\n").filter(Boolean).map((p,j)=>(
                      <p key={j} style={{fontSize:12.5,color:"#555",lineHeight:1.9,margin:"0 0 8px"}}>{p}</p>
                    ))}
                  </div>
                ))}
              </div>
              {rd.lifeAdvice && (
                <div style={{...sC,borderLeft:"3px solid #111",marginTop:6}}>
                  <div style={{fontSize:12,fontWeight:600,marginBottom:6}}>{t.lifeAdvice}</div>
                  {rd.lifeAdvice.map((a,i)=>(
                    <p key={i} style={{fontSize:12,color:"#666",lineHeight:1.7,margin:"0 0 3px"}}>· {a}</p>
                  ))}
                </div>
              )}
            </>}

            {/* TAB 1: K-Line + Liunian */}
            {tab === 1 && <>
              {kd && (
                <div style={sC}>
                  <div style={{fontSize:13,fontWeight:600,textAlign:"center",marginBottom:8}}>{t.klineTitle}</div>
                  <div style={{display:"flex",justifyContent:"center",gap:5,marginBottom:8,flexWrap:"wrap"}}>
                    {Object.entries(DIM).map(([k,m])=>(
                      <button key={k} onClick={()=>setKd(prev=>({...prev,[k]:{...prev[k],hide:!prev[k]?.hide}}))}
                        style={{padding:"3px 10px",fontSize:11,borderRadius:12,border:`1px solid ${kd[k]?.hide?"#ddd":m.c}`,background:kd[k]?.hide?"#f5f5f5":"#fff",color:kd[k]?.hide?"#ccc":m.c,cursor:"pointer"}}>
                        {m[lang==="en"?"en":"zh"]}
                      </button>
                    ))}
                  </div>
                  <KLine data={kd} mode="age" ax={curAge} lang={lang}/>
                  <div style={{marginTop:10}}>
                    {Object.entries(rd.kline||{}).map(([k,v])=>(
                      <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid #f5f5f5",fontSize:11}}>
                        <span style={{color:DIM[k]?.c,fontWeight:500}}>{DIM[k]?.[lang==="en"?"en":"zh"]}</span>
                        <span style={{color:"#aaa"}}>{t.klineCeiling} {v.max} · {t.klinePeak} {v.peak}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {rd.currentYear && <>
                <div style={{...sC,borderLeft:"3px solid #2563eb"}}>
                  <div style={{fontSize:13,fontWeight:600,marginBottom:6}}>
                    {rd.currentYear.year}{lang==="en"?" ":""}{rd.currentYear.ganZhi}{t.yearSuffix} · {t.currentYear} {rd.currentYear.age}
                  </div>
                  <div style={{fontSize:11,color:"#888"}}>{t.daxianLabel} {rd.currentYear.daxianPalace}</div>
                </div>
                {rd.currentYear.highlights && (
                  <div style={{...sC,borderLeft:`3px solid ${C.safe}`}}>
                    <div style={{fontSize:12,fontWeight:600,marginBottom:4,color:C.safe}}>{t.lifeHighlights}</div>
                    {rd.currentYear.highlights.map((h,i)=>(
                      <p key={i} style={{fontSize:12,color:"#666",lineHeight:1.7,margin:"0 0 2px"}}>✦ {h}</p>
                    ))}
                  </div>
                )}
                {rd.currentYear.caution && (
                  <div style={{...sC,borderLeft:`3px solid ${C.warn}`}}>
                    <div style={{fontSize:12,fontWeight:600,marginBottom:4,color:C.warn}}>{t.lifeCaution}</div>
                    {rd.currentYear.caution.map((h,i)=>(
                      <p key={i} style={{fontSize:12,color:"#666",lineHeight:1.7,margin:"0 0 2px"}}>⚠ {h}</p>
                    ))}
                  </div>
                )}
              </>}
              {ly.length > 0 && (
                <div style={{marginTop:14}}>
                  <div style={{fontSize:14,fontWeight:700,marginBottom:10,paddingBottom:6,borderBottom:"2px solid #111"}}>{t.keyYearTitle}</div>
                  {ly.map((l,i)=>{
                    const lc = l.level==="great"?C.safe:l.level==="good"?"#2563eb":l.level==="warn"?C.warn:"#d97706";
                    const lb = l.level==="great"?"#f0fdf4":l.level==="good"?"#eff6ff":l.level==="warn"?"#fef2f2":"#fffbeb";
                    const lvLabel = l.level==="great"?t.levelGreat:l.level==="good"?t.levelGood:l.level==="warn"?t.levelWarn:t.levelMixed;
                    return (
                      <div key={i} style={{...sC,borderLeft:`3px solid ${lc}`,background:lb}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                          <span style={{fontSize:13,fontWeight:700,color:lc}}>{l.year}{t.yearSuffix}</span>
                          <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:lc+"18",color:lc,fontWeight:600}}>{lvLabel}</span>
                        </div>
                        <div style={{fontSize:12,fontWeight:600,color:"#333",marginBottom:6}}>{l.title}</div>
                        {(l.text||"").split("\n").filter(Boolean).map((p,j)=>(
                          <p key={j} style={{fontSize:12,color:"#555",lineHeight:1.8,margin:"0 0 4px"}}>{p}</p>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </>}
            <button onClick={() => setPg('addP')} style={{...sB(false),marginTop:14}}>{t.addPerson}</button>
          </div>
        )}

        {/* ADD PERSON PAGE */}
        {pg === 'addP' && (
          <div style={{paddingBottom:40}}>
            <button onClick={() => setPg('result')} style={{background:"none",border:"none",fontSize:13,color:"#999",cursor:"pointer",marginBottom:8}}>← {t.backShort}</button>
            <div style={{...sC,textAlign:"center",padding:24}}>
              <h3 style={{fontSize:16,fontWeight:700,marginBottom:6}}>{t.compTitle}</h3>
              <p style={{fontSize:12,color:"#888",lineHeight:1.8,marginBottom:16}}>
                {t.compDesc.split("\n").map((line,i)=><span key={i}>{line}{i===0&&<br/>}</span>)}
              </p>
              <div style={{fontSize:11,color:"#bbb",padding:"8px 12px",background:"#f9f9f9",borderRadius:6,marginBottom:16}}>{t.compSample}</div>
              <button onClick={loadCmpDemo} style={sB(true)}>{t.compBtn}</button>
            </div>
          </div>
        )}

        {/* COMPARE PAGE */}
        {pg === 'compare' && cmp && (
          <div style={{paddingBottom:40}}>
            <button onClick={() => setPg('result')} style={{background:"none",border:"none",fontSize:13,color:"#999",cursor:"pointer",marginBottom:8}}>← {t.backShort}</button>
            <div style={{...sC,textAlign:"center"}}>
              <p style={{fontSize:11,color:"#aaa"}}>{t.compatScore}</p>
              <div style={{fontSize:44,fontWeight:800,marginTop:2}}>{cmp.score}<span style={{fontSize:16,color:"#ccc"}}>/100</span></div>
              <p style={{fontSize:13,fontWeight:500,color:"#555",marginTop:2}}>{cmp.verdict}</p>
              <p style={{fontSize:11,color:"#888",marginTop:6,lineHeight:1.7}}>{cmp.summary}</p>
            </div>
            <div style={{display:"flex",borderBottom:"1px solid #e5e5e5",marginBottom:10}}>
              {[t.tabCmp0, t.tabCmp1, t.tabCmp2].map((tl,i)=>(
                <button key={i} onClick={()=>setCTab(i)} style={{flex:1,padding:"9px 0",fontSize:12,fontWeight:ctab===i?600:400,color:ctab===i?"#111":"#999",background:"none",border:"none",borderBottom:ctab===i?"2px solid #111":"2px solid transparent",cursor:"pointer"}}>{tl}</button>
              ))}
            </div>

            {ctab === 0 && ckd && (
              <div style={sC}>
                <div style={{fontSize:13,fontWeight:600,textAlign:"center",marginBottom:8}}>
                  {lang==="en"?"Destiny Intersection K-Line":"命运交汇 K 线图"}
                </div>
                <KLine data={ckd} mode="year" ax={2026} lang={lang}/>
                {cmp.bestWindow && (
                  <div style={{marginTop:10,padding:"8px 10px",background:"#f0fdf4",borderRadius:6,fontSize:11,color:C.safe}}>
                    {t.bestWindow}<strong>{cmp.bestWindow.start}-{cmp.bestWindow.end}{t.yearSuffix}</strong> — {cmp.bestWindow.reason}
                  </div>
                )}
                <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:8,fontSize:10,color:"#bbb"}}>
                  <span>—— {t.p1Love}</span>
                  <span>- - - {t.p2Love}</span>
                  <span>━━ {t.harmony}</span>
                </div>
              </div>
            )}

            {ctab === 1 && <>
              {cmp.crises?.map((cr,i)=>{
                const bc=cr.level>=4?C.danger:cr.level>=3?C.warn:cr.level>=2?"#eab308":"#aaa";
                return (
                  <div key={i} style={{...sC,borderLeft:`3px solid ${bc}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontSize:13,fontWeight:600,color:bc}}>{cr.emoji} {cr.title}</span>
                      <span style={{fontSize:10,color:bc}}>{"★".repeat(cr.level)}{"☆".repeat(4-cr.level)}</span>
                    </div>
                    <div style={{fontSize:10,color:"#aaa",marginBottom:4}}>{cr.period}</div>
                    <p style={{fontSize:12,color:"#555",lineHeight:1.8,margin:0}}>{cr.description}</p>
                  </div>
                );
              })}
              {cmp.timeline && (
                <div style={{marginTop:14}}>
                  <div style={{fontSize:13,fontWeight:600,marginBottom:10}}>{t.yearByYear}</div>
                  {cmp.timeline.map((tl,i)=>{
                    const dc=tl.level==="danger"?C.danger:tl.level==="warm"?C.warn:C.safe;
                    return (
                      <div key={i} style={{display:"flex",minHeight:40,marginBottom:1}}>
                        <div style={{width:72,flexShrink:0,fontSize:11,fontWeight:600,color:"#666",textAlign:"right",paddingRight:10,borderRight:"2px solid #eee",position:"relative",paddingTop:3}}>
                          {tl.year}
                          <div style={{position:"absolute",right:-4,top:5,width:6,height:6,borderRadius:"50%",background:dc}}/>
                        </div>
                        <div style={{flex:1,paddingLeft:14,fontSize:11,color:"#666",lineHeight:1.7,paddingBottom:6}}>{tl.text}</div>
                      </div>
                    );
                  })}
                </div>
              )}
              {cmp.survivalRate && (
                <div style={{...sC,textAlign:"center",marginTop:10}}>
                  <p style={{fontSize:11,color:"#aaa"}}>{t.survivalRate}</p>
                  <p style={{fontSize:12,color:"#666",marginTop:4}}>
                    {t.survivalBase}<strong style={{fontSize:16}}>{cmp.survivalRate.base}%</strong>
                    <span style={{margin:"0 10px",color:"#ddd"}}>→</span>
                    {t.survivalPrev}<strong style={{fontSize:16,color:C.safe}}>{cmp.survivalRate.withPrevention}%+</strong>
                  </p>
                </div>
              )}
            </>}

            {ctab === 2 && <>
              {cmp.crises?.map((cr,i)=>(
                <div key={i} style={{...sC,borderLeft:`3px solid ${C.safe}`}}>
                  <div style={{fontSize:12,fontWeight:600,marginBottom:4,color:C.safe}}>{t.solveTitle}{cr.title} ({cr.period})</div>
                  <p style={{fontSize:12,color:"#555",lineHeight:1.8,margin:0}}>{cr.solution}</p>
                </div>
              ))}
              {cmp.keyAdvice?.map((a,i)=>(
                <div key={i} style={{...sC,borderLeft:"3px solid #111"}}>
                  <div style={{fontSize:12,fontWeight:600,marginBottom:4}}>{a.title}</div>
                  <p style={{fontSize:12,color:"#555",lineHeight:1.8,margin:0}}>{a.text}</p>
                </div>
              ))}
            </>}
          </div>
        )}

        <div style={{textAlign:"center",fontSize:10,color:"#ddd",padding:"16px 0 32px"}}>{t.footer}</div>
      </div>
    </div>
  );
}
