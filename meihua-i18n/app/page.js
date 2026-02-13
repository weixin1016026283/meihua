"use client";
import React, { useState, useEffect } from 'react';

// 语言翻译
const i18n = {
  zh: {
    title: '梅花易数',
    subtitle: '心诚则灵 · 融会古今智慧',
    time: '时间',
    shichen: '时辰',
    num: '数',
    question: '所问之事（可选）',
    questionPlaceholder: '输入你想占问的事情...',
    inputLabel: '起卦数字',
    inputPlaceholder: '随意输入数字，如 520、8888...',
    inputTip: '前半算上卦，后半算下卦，时辰参与动爻计算',
    calculate: '起卦',
    asked: '所问：',
    originalHex: '本卦',
    changedHex: '变卦',
    hexagram: '卦辞',
    xiangYue: '象曰',
    philosophy: '卦象哲理',
    vernacular: '白话解释',
    duanyi: '《断易天机》解',
    shaoYong: '北宋易学家邵雍解',
    fuPeiRong: '台湾国学大儒傅佩荣解',
    fortune: '时运',
    wealth: '财运',
    home: '家宅',
    health: '身体',
    traditional: '传统解卦',
    daxiang: '大象',
    yunshi: '运势',
    shiye: '事业',
    jingshang: '经商',
    qiuming: '求名',
    hunlian: '婚恋',
    juece: '决策',
    tuan: '彖传',
    yaoDetail: '六爻详解',
    clickExpand: '（点击展开）',
    dongYao: '动爻',
    yaoXiang: '象曰',
    yaoShaoYong: '邵雍解',
    yaoFuPeiRong: '傅佩荣解',
    bianGua: '变卦',
    zhexue: '哲学含义',
    story: '历史典故',
    tiyongAnalysis: '体用分析',
    tiGua: '体卦（自身）',
    yongGua: '用卦（所测）',
    restart: '重新起卦',
    footer: '梅花易数 · 卦辞取自《周易》原典 · 解读融会历代先贤智慧',
    relations: {
      '体用比和': '体用比和',
      '用生体': '用生体',
      '体生用': '体生用',
      '用克体': '用克体',
      '体克用': '体克用'
    },
    fortunes: {
      '体用比和': '平稳之象，事可成就。',
      '用生体': '大吉！有贵人相助，事半功倍。',
      '体生用': '耗泄之象，需付出努力。',
      '用克体': '不利，宜守不宜进。',
      '体克用': '有利，可主动出击。'
    },
    elements: { '金': '金', '木': '木', '水': '水', '火': '火', '土': '土' },
    shichenNames: ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'],
    invalidInput: '请输入有效数字'
  },
  en: {
    title: 'Plum Blossom Numerology',
    subtitle: 'Ancient Chinese Divination · I Ching Wisdom',
    time: 'Time',
    shichen: 'Hour',
    num: 'Num',
    question: 'Your Question (Optional)',
    questionPlaceholder: 'Enter what you want to divine...',
    inputLabel: 'Divination Number',
    inputPlaceholder: 'Enter any number, e.g. 520, 8888...',
    inputTip: 'First half → upper trigram, second half → lower trigram',
    calculate: 'Divine',
    asked: 'Question: ',
    originalHex: 'Primary',
    changedHex: 'Changed',
    hexagram: 'Hexagram Text',
    xiangYue: 'Image Says',
    philosophy: 'Philosophy',
    vernacular: 'Interpretation',
    duanyi: 'Duan Yi Tian Ji',
    shaoYong: 'Shao Yong\'s Commentary',
    fuPeiRong: 'Fu Pei-Jung\'s Commentary',
    fortune: 'Fortune',
    wealth: 'Wealth',
    home: 'Home',
    health: 'Health',
    traditional: 'Traditional Interpretation',
    daxiang: 'Great Image',
    yunshi: 'Fortune',
    shiye: 'Career',
    jingshang: 'Business',
    qiuming: 'Fame',
    hunlian: 'Love',
    juece: 'Decision',
    tuan: 'Tuan Commentary',
    yaoDetail: 'Six Lines Detail',
    clickExpand: '(click to expand)',
    dongYao: 'Moving',
    yaoXiang: 'Image',
    yaoShaoYong: 'Shao Yong',
    yaoFuPeiRong: 'Fu Pei-Jung',
    bianGua: 'Changed Hexagram',
    zhexue: 'Philosophy',
    story: 'Historical Story',
    tiyongAnalysis: 'Ti-Yong Analysis',
    tiGua: 'Ti (Self)',
    yongGua: 'Yong (Matter)',
    restart: 'Divine Again',
    footer: 'Plum Blossom Numerology · Based on I Ching · Ancient Chinese Wisdom',
    relations: {
      '体用比和': 'Ti-Yong Harmony',
      '用生体': 'Yong Generates Ti',
      '体生用': 'Ti Generates Yong',
      '用克体': 'Yong Controls Ti',
      '体克用': 'Ti Controls Yong'
    },
    fortunes: {
      '体用比和': 'Balanced and stable. Success is achievable.',
      '用生体': 'Very auspicious! Help from others, twice the result with half the effort.',
      '体生用': 'Energy draining. Requires effort and dedication.',
      '用克体': 'Unfavorable. Better to wait than to act.',
      '体克用': 'Favorable. Can take initiative.'
    },
    elements: { '金': 'Metal', '木': 'Wood', '水': 'Water', '火': 'Fire', '土': 'Earth' },
    shichenNames: ['Zi','Chou','Yin','Mao','Chen','Si','Wu','Wei','Shen','You','Xu','Hai'],
    invalidInput: 'Please enter a valid number'
  }
};

// 八卦数据（中英文）
const BAGUA = {
  1: { name: '乾', nameEn: 'Qian (Heaven)', element: '金', lines: [1, 1, 1] },
  2: { name: '兑', nameEn: 'Dui (Lake)', element: '金', lines: [0, 1, 1] },
  3: { name: '离', nameEn: 'Li (Fire)', element: '火', lines: [1, 0, 1] },
  4: { name: '震', nameEn: 'Zhen (Thunder)', element: '木', lines: [0, 0, 1] },
  5: { name: '巽', nameEn: 'Xun (Wind)', element: '木', lines: [1, 1, 0] },
  6: { name: '坎', nameEn: 'Kan (Water)', element: '水', lines: [0, 1, 0] },
  7: { name: '艮', nameEn: 'Gen (Mountain)', element: '土', lines: [1, 0, 0] },
  8: { name: '坤', nameEn: 'Kun (Earth)', element: '土', lines: [0, 0, 0] },
};

const WUXING = {
  '金': { sheng: '水', ke: '木' }, '木': { sheng: '火', ke: '土' },
  '水': { sheng: '木', ke: '火' }, '火': { sheng: '土', ke: '金' }, '土': { sheng: '金', ke: '水' },
};

// 64卦数据（含英文）
const HEXAGRAMS = {
  '111111': {
    num: 1, name: '乾为天', nameEn: 'Qian - The Creative (Heaven)',
    gua: '元，亨，利，贞。', guaEn: 'Sublime success. Perseverance furthers.',
    xiang: '天行健，君子以自强不息。', xiangEn: 'Heaven moves with vigor. The superior man strengthens himself ceaselessly.',
    philosophy: '乾卦象征天道刚健，核心智慧是"自强不息"——像天体运行一样永不停歇地向上进取。',
    philosophyEn: 'Qian represents the creative force of heaven. Its core wisdom is "ceaseless self-improvement" - progressing like the eternal movement of celestial bodies.',
    vernacular: '乾卦：大吉大利，吉祥的占卜。',
    vernacularEn: 'Qian hexagram: Great fortune and prosperity. An auspicious divination.',
    yao: [
      { pos: '初九', posEn: 'Nine at the beginning', text: '潜龙勿用。', textEn: 'Hidden dragon. Do not act.', mean: '龙潜藏在水中，暂时不宜有所作为。', meanEn: 'The dragon is still hidden. This is not the time for action.' },
      { pos: '九二', posEn: 'Nine in the second', text: '见龙在田，利见大人。', textEn: 'Dragon appearing in the field. It furthers one to see the great man.', mean: '龙出现在田野，利于拜见贵人。', meanEn: 'The dragon emerges. It is favorable to meet influential people.' },
      { pos: '九三', posEn: 'Nine in the third', text: '君子终日乾乾，夕惕若厉，无咎。', textEn: 'The superior man is active all day. At night he is cautious. No blame.', mean: '整日勤勉努力，夜晚警惕戒惧，没有灾祸。', meanEn: 'Diligent throughout the day, vigilant at night. No misfortune.' },
      { pos: '九四', posEn: 'Nine in the fourth', text: '或跃在渊，无咎。', textEn: 'Wavering flight over the depths. No blame.', mean: '或许跃进深渊，没有灾祸。', meanEn: 'Perhaps leaping into the depths. No misfortune.' },
      { pos: '九五', posEn: 'Nine in the fifth', text: '飞龙在天，利见大人。', textEn: 'Flying dragon in the heavens. It furthers one to see the great man.', mean: '龙飞上天空，利于拜见贵人。', meanEn: 'The dragon soars in the sky. Favorable to meet the great person.' },
      { pos: '上九', posEn: 'Nine at the top', text: '亢龙有悔。', textEn: 'Arrogant dragon will have cause to repent.', mean: '龙飞得过高，将有悔恨。', meanEn: 'The dragon flies too high. There will be regret.' },
    ]
  },
  '000000': {
    num: 2, name: '坤为地', nameEn: 'Kun - The Receptive (Earth)',
    gua: '元亨，利牝马之贞。', guaEn: 'Sublime success. The perseverance of a mare is favorable.',
    xiang: '地势坤，君子以厚德载物。', xiangEn: 'The earth\'s condition is receptive devotion. The superior man carries the outer world with breadth of character.',
    philosophy: '坤卦象征大地包容，核心智慧是"厚德载物"——以博大的胸怀承载万物。',
    philosophyEn: 'Kun represents the receptive nature of earth. Its wisdom is "carrying all things with great virtue" - embracing everything with vast tolerance.',
    vernacular: '坤卦：大吉大利，像母马那样温顺才吉利。',
    vernacularEn: 'Kun hexagram: Great fortune. Being gentle like a mare brings good fortune.',
    yao: [
      { pos: '初六', posEn: 'Six at the beginning', text: '履霜，坚冰至。', textEn: 'Treading upon hoarfrost, solid ice is not far.', mean: '踩着霜，知道坚冰将至。', meanEn: 'Walking on frost, know that solid ice is coming.' },
      { pos: '六二', posEn: 'Six in the second', text: '直方大，不习无不利。', textEn: 'Straight, square, great. Without purpose, yet nothing remains unfurthered.', mean: '正直方正广大，不用学习也无不利。', meanEn: 'Upright, square, and great. Without striving, nothing is unfavorable.' },
      { pos: '六三', posEn: 'Six in the third', text: '含章可贞，或从王事，无成有终。', textEn: 'Hidden lines. One is able to remain persevering.', mean: '蕴含美德可守正，或从事王事，虽无成就但有好结局。', meanEn: 'Containing inner beauty, one can remain steadfast.' },
      { pos: '六四', posEn: 'Six in the fourth', text: '括囊，无咎无誉。', textEn: 'A tied-up sack. No blame, no praise.', mean: '扎紧袋口，无灾祸也无荣誉。', meanEn: 'A tied sack. No blame, no praise.' },
      { pos: '六五', posEn: 'Six in the fifth', text: '黄裳，元吉。', textEn: 'A yellow lower garment. Supreme good fortune.', mean: '黄色的下裳，大吉大利。', meanEn: 'Yellow garment. Great good fortune.' },
      { pos: '上六', posEn: 'Six at the top', text: '龙战于野，其血玄黄。', textEn: 'Dragons fight in the meadow. Their blood is black and yellow.', mean: '龙在野外争斗，流出黑黄色的血。', meanEn: 'Dragons battle in the wilderness. Blood flows.' },
    ]
  },
  '010001': {
    num: 3, name: '水雷屯', nameEn: 'Zhun - Difficulty at the Beginning',
    gua: '元亨，利贞，勿用有攸往，利建侯。', guaEn: 'Sublime success. Perseverance furthers. It furthers to appoint helpers.',
    xiang: '云雷，屯；君子以经纶。', xiangEn: 'Clouds and thunder: The image of Difficulty. The superior man brings order out of confusion.',
    philosophy: '屯卦象征初生的艰难，核心智慧是"以经纶"——在混乱中建立秩序。',
    philosophyEn: 'Zhun represents initial difficulties. The wisdom is to establish order amidst chaos.',
    vernacular: '屯卦：大吉大利，利于守正，不宜有所往，利于建立诸侯。',
    vernacularEn: 'Zhun: Favorable for perseverance. Not favorable for undertakings. Favorable for establishing helpers.',
    yao: [
      { pos: '初九', posEn: 'Nine at the beginning', text: '磐桓，利居贞，利建侯。', textEn: 'Hesitation and hindrance. Perseverance furthers.', mean: '徘徊不前，利于安居守正。', meanEn: 'Hesitation. It is favorable to remain steadfast.' },
      { pos: '六二', posEn: 'Six in the second', text: '屯如邅如，乘马班如。', textEn: 'Difficulties pile up. Horse and wagon part.', mean: '艰难重重，骑马徘徊。', meanEn: 'Difficulties accumulate. The horse hesitates.' },
      { pos: '六三', posEn: 'Six in the third', text: '即鹿无虞，惟入于林中。', textEn: 'Pursuing deer without a forester, one loses one\'s way.', mean: '追逐鹿没有向导，只会迷入林中。', meanEn: 'Chasing deer without a guide leads to getting lost.' },
      { pos: '六四', posEn: 'Six in the fourth', text: '乘马班如，求婚媾，往吉，无不利。', textEn: 'Horse and wagon part. Strive for union. To go brings good fortune.', mean: '骑马徘徊，前往求婚，吉利。', meanEn: 'The horse hesitates. Seek union. Going is fortunate.' },
      { pos: '九五', posEn: 'Nine in the fifth', text: '屯其膏，小贞吉，大贞凶。', textEn: 'Difficulties with one\'s resources. Small things favorable, great things unfavorable.', mean: '囤积资源，小事吉，大事凶。', meanEn: 'Hoarding resources. Small matters favorable, great matters not.' },
      { pos: '上六', posEn: 'Six at the top', text: '乘马班如，泣血涟如。', textEn: 'Horse and wagon part. Tears of blood flow.', mean: '骑马徘徊，痛哭流涕。', meanEn: 'The horse hesitates. Tears of blood flow.' },
    ]
  },
  '100010': {
    num: 4, name: '山水蒙', nameEn: 'Meng - Youthful Folly',
    gua: '亨。匪我求童蒙，童蒙求我。', guaEn: 'Success. It is not I who seek the young fool; the young fool seeks me.',
    xiang: '山下出泉，蒙；君子以果行育德。', xiangEn: 'A spring wells up at the foot of the mountain. The superior man fosters his character by thoroughness.',
    philosophy: '蒙卦象征启蒙教育，核心智慧是"果行育德"——果断行动培育品德。',
    philosophyEn: 'Meng represents youthful inexperience. The wisdom is to cultivate virtue through decisive action.',
    vernacular: '蒙卦：亨通。不是我去求蒙昧的人，是蒙昧的人来求我。',
    vernacularEn: 'Meng: Success. It is not I who seeks the inexperienced; they seek me.',
    yao: [
      { pos: '初六', posEn: 'Six at the beginning', text: '发蒙，利用刑人，用说桎梏。', textEn: 'To enlighten the ignorant, use discipline.', mean: '启发蒙昧，利用刑罚教育人。', meanEn: 'To enlighten the foolish, discipline may be used.' },
      { pos: '九二', posEn: 'Nine in the second', text: '包蒙，吉；纳妇，吉；子克家。', textEn: 'To bear with the foolish brings good fortune.', mean: '包容蒙昧之人，吉利。', meanEn: 'To bear with the foolish brings fortune.' },
      { pos: '六三', posEn: 'Six in the third', text: '勿用取女，见金夫，不有躬。', textEn: 'Do not take a maiden who loses herself when she sees a man of wealth.', mean: '不要娶这样的女子，见到有钱人就失身。', meanEn: 'Do not take such a maiden who loses herself.' },
      { pos: '六四', posEn: 'Six in the fourth', text: '困蒙，吝。', textEn: 'Entangled folly brings humiliation.', mean: '困于蒙昧，有遗憾。', meanEn: 'Trapped in folly brings regret.' },
      { pos: '六五', posEn: 'Six in the fifth', text: '童蒙，吉。', textEn: 'Childlike folly brings good fortune.', mean: '童稚的蒙昧，吉利。', meanEn: 'Childlike innocence brings fortune.' },
      { pos: '上九', posEn: 'Nine at the top', text: '击蒙，不利为寇，利御寇。', textEn: 'In punishing folly, it does not further to commit transgressions.', mean: '击打蒙昧，不利做强盗，利于防御。', meanEn: 'Striking at folly. Defense is favorable, not offense.' },
    ]
  },
  '010111': {
    num: 5, name: '水天需', nameEn: 'Xu - Waiting (Nourishment)',
    gua: '有孚，光亨，贞吉。利涉大川。', guaEn: 'With sincerity, there is brilliant success. Perseverance brings good fortune.',
    xiang: '云上于天，需；君子以饮食宴乐。', xiangEn: 'Clouds rise up to heaven. The superior man eats, drinks, and is joyous.',
    philosophy: '需卦象征等待，核心智慧是"饮食宴乐"——在等待中保持乐观。',
    philosophyEn: 'Xu represents waiting. The wisdom is to remain optimistic and nourish oneself while waiting.',
    vernacular: '需卦：有诚信，光明亨通，守正吉利，利于渡过大河。',
    vernacularEn: 'Xu: With sincerity comes brilliant success. Perseverance brings fortune.',
    yao: [
      { pos: '初九', posEn: 'Nine at the beginning', text: '需于郊，利用恒，无咎。', textEn: 'Waiting in the meadow. Perseverance brings no blame.', mean: '在郊外等待，利于恒久。', meanEn: 'Waiting in the open. Constancy is favorable.' },
      { pos: '九二', posEn: 'Nine in the second', text: '需于沙，小有言，终吉。', textEn: 'Waiting on sand. Small talk. The end brings fortune.', mean: '在沙滩等待，略有闲言，终吉。', meanEn: 'Waiting on sand. Minor criticism, but fortune in the end.' },
      { pos: '九三', posEn: 'Nine in the third', text: '需于泥，致寇至。', textEn: 'Waiting in mud brings the arrival of enemies.', mean: '在泥泞中等待，招致敌人到来。', meanEn: 'Waiting in mud invites enemies.' },
      { pos: '六四', posEn: 'Six in the fourth', text: '需于血，出自穴。', textEn: 'Waiting in blood. Get out of the pit.', mean: '在血泊中等待，要从洞穴中出来。', meanEn: 'Waiting in blood. Emerge from the pit.' },
      { pos: '九五', posEn: 'Nine in the fifth', text: '需于酒食，贞吉。', textEn: 'Waiting with wine and food. Perseverance brings fortune.', mean: '在酒食中等待，守正吉利。', meanEn: 'Waiting with food and drink. Steadfastness is fortunate.' },
      { pos: '上六', posEn: 'Six at the top', text: '入于穴，有不速之客三人来。', textEn: 'One falls into the pit. Three uninvited guests arrive.', mean: '进入洞穴，有三位不请自来的客人。', meanEn: 'Entering the pit. Three uninvited guests arrive.' },
    ]
  },
  '111010': {
    num: 6, name: '天水讼', nameEn: 'Song - Conflict',
    gua: '有孚，窒惕，中吉，终凶。', guaEn: 'Sincerity is obstructed. Caution in the middle brings fortune, but in the end comes misfortune.',
    xiang: '天与水违行，讼；君子以作事谋始。', xiangEn: 'Heaven and water go their opposite ways. The superior man carefully considers the beginning of any undertaking.',
    philosophy: '讼卦象征争讼，核心智慧是"作事谋始"——做事要谨慎开始。',
    philosophyEn: 'Song represents conflict. The wisdom is to carefully consider the beginning of any undertaking.',
    vernacular: '讼卦：有诚信，但受阻碍，保持警惕，中途吉利，最终凶险。',
    vernacularEn: 'Song: Sincerity is blocked. Caution in the middle brings fortune, but the end is unfavorable.',
    yao: [
      { pos: '初六', posEn: 'Six at the beginning', text: '不永所事，小有言，终吉。', textEn: 'Do not perpetuate the affair. Minor criticism, but fortune in the end.', mean: '不要纠缠于争讼，略有闲言，终吉。', meanEn: 'Do not prolong the dispute. Minor criticism, fortune in the end.' },
      { pos: '九二', posEn: 'Nine in the second', text: '不克讼，归而逋，其邑人三百户无眚。', textEn: 'Unable to engage in conflict, one returns and flees.', mean: '争讼失败，回去逃避。', meanEn: 'Unable to win the dispute, one returns and retreats.' },
      { pos: '六三', posEn: 'Six in the third', text: '食旧德，贞厉，终吉。', textEn: 'Living on ancient virtue. Danger through perseverance. In the end, fortune.', mean: '依靠旧日的德行，守正虽危但终吉。', meanEn: 'Living on past virtue. Danger, but fortune in the end.' },
      { pos: '九四', posEn: 'Nine in the fourth', text: '不克讼，复即命，渝，安贞，吉。', textEn: 'Unable to engage in conflict. Turn back and submit to fate.', mean: '争讼失败，回归安守正道，吉利。', meanEn: 'Unable to win, return to the proper way. Fortune.' },
      { pos: '九五', posEn: 'Nine in the fifth', text: '讼，元吉。', textEn: 'Conflict. Supreme good fortune.', mean: '争讼，大吉。', meanEn: 'Conflict resolved. Great fortune.' },
      { pos: '上九', posEn: 'Nine at the top', text: '或锡之鞶带，终朝三褫之。', textEn: 'One may be awarded a leather belt, but by the end of the morning it will be stripped away.', mean: '或许得到赏赐，但很快被剥夺。', meanEn: 'Perhaps rewarded, but soon stripped of it.' },
    ]
  },
  '000010': {
    num: 7, name: '地水师', nameEn: 'Shi - The Army',
    gua: '贞，丈人吉，无咎。', guaEn: 'Perseverance. An experienced man brings fortune. No blame.',
    xiang: '地中有水，师；君子以容民畜众。', xiangEn: 'Water in the earth: The Army. The superior man increases the masses by his generosity.',
    philosophy: '师卦象征军队，核心智慧是"容民畜众"——包容民众，蓄养力量。',
    philosophyEn: 'Shi represents the army. The wisdom is to embrace the people and nurture strength.',
    vernacular: '师卦：守正，让德高望重的人领导则吉，无灾祸。',
    vernacularEn: 'Shi: Perseverance. An experienced leader brings fortune.',
    yao: [
      { pos: '初六', posEn: 'Six at the beginning', text: '师出以律，否臧凶。', textEn: 'The army must set forth in proper order. Without discipline comes misfortune.', mean: '出兵要有纪律，否则有凶险。', meanEn: 'The army must have discipline, otherwise misfortune.' },
      { pos: '九二', posEn: 'Nine in the second', text: '在师中，吉无咎。', textEn: 'In the midst of the army. Fortune, no blame.', mean: '身在军中，吉利无灾。', meanEn: 'In the midst of the army. Fortune, no blame.' },
      { pos: '六三', posEn: 'Six in the third', text: '师或舆尸，凶。', textEn: 'The army may carry corpses. Misfortune.', mean: '军队可能运载尸体，凶险。', meanEn: 'The army may carry corpses. Misfortune.' },
      { pos: '六四', posEn: 'Six in the fourth', text: '师左次，无咎。', textEn: 'The army retreats. No blame.', mean: '军队退守，无灾祸。', meanEn: 'The army retreats. No blame.' },
      { pos: '六五', posEn: 'Six in the fifth', text: '田有禽，利执言，无咎。', textEn: 'Game in the field. Capture it. No blame.', mean: '田野有猎物，捕获它，无灾祸。', meanEn: 'Game in the field. Capture it. No blame.' },
      { pos: '上六', posEn: 'Six at the top', text: '大君有命，开国承家，小人勿用。', textEn: 'The great prince issues commands. Do not employ petty people.', mean: '君王颁布命令，建国封侯，不可重用小人。', meanEn: 'The ruler issues commands. Do not employ petty people.' },
    ]
  },
  '010000': {
    num: 8, name: '水地比', nameEn: 'Bi - Holding Together (Union)',
    gua: '吉。原筮元永贞，无咎。', guaEn: 'Fortune. The original divination is eternally favorable. No blame.',
    xiang: '地上有水，比；先王以建万国，亲诸侯。', xiangEn: 'Water on earth: Union. Kings of old established states and maintained relations with lords.',
    philosophy: '比卦象征亲近团结，核心智慧是"建万国，亲诸侯"——建立联盟，亲近盟友。',
    philosophyEn: 'Bi represents union. The wisdom is to establish alliances and maintain close relationships.',
    vernacular: '比卦：吉利。反复占卜为大吉，无灾祸。',
    vernacularEn: 'Bi: Fortune. Repeated divination is greatly favorable. No blame.',
    yao: [
      { pos: '初六', posEn: 'Six at the beginning', text: '有孚比之，无咎。', textEn: 'Holding together with sincerity. No blame.', mean: '以诚信与人亲近，无灾祸。', meanEn: 'Union with sincerity. No blame.' },
      { pos: '六二', posEn: 'Six in the second', text: '比之自内，贞吉。', textEn: 'Union from within. Perseverance brings fortune.', mean: '从内心与人亲近，守正吉利。', meanEn: 'Union from within. Steadfastness brings fortune.' },
      { pos: '六三', posEn: 'Six in the third', text: '比之匪人。', textEn: 'Union with wrong people.', mean: '与不当之人亲近。', meanEn: 'Union with the wrong people.' },
      { pos: '六四', posEn: 'Six in the fourth', text: '外比之，贞吉。', textEn: 'External union. Perseverance brings fortune.', mean: '向外与人亲近，守正吉利。', meanEn: 'External union. Steadfastness brings fortune.' },
      { pos: '九五', posEn: 'Nine in the fifth', text: '显比，王用三驱。', textEn: 'Manifest union. The king uses three beaters.', mean: '光明正大的亲近，如王者狩猎网开一面。', meanEn: 'Manifest union. The king hunts with an open side.' },
      { pos: '上六', posEn: 'Six at the top', text: '比之无首，凶。', textEn: 'Union without a leader. Misfortune.', mean: '亲近没有领导，凶险。', meanEn: 'Union without a leader. Misfortune.' },
    ]
  }
};

// 为其他56卦添加基本英文支持
const addEnglishSupport = () => {
  const hexNames = {
    '110111': { num: 9, name: '风天小畜', nameEn: 'Xiao Xu - Small Taming' },
    '111011': { num: 10, name: '天泽履', nameEn: 'Lü - Treading' },
    '000111': { num: 11, name: '地天泰', nameEn: 'Tai - Peace' },
    '111000': { num: 12, name: '天地否', nameEn: 'Pi - Standstill' },
    '111101': { num: 13, name: '天火同人', nameEn: 'Tong Ren - Fellowship' },
    '101111': { num: 14, name: '火天大有', nameEn: 'Da You - Great Possession' },
    '000100': { num: 15, name: '地山谦', nameEn: 'Qian - Modesty' },
    '001000': { num: 16, name: '雷地豫', nameEn: 'Yu - Enthusiasm' },
    '011001': { num: 17, name: '泽雷随', nameEn: 'Sui - Following' },
    '100110': { num: 18, name: '山风蛊', nameEn: 'Gu - Decay' },
    '000011': { num: 19, name: '地泽临', nameEn: 'Lin - Approach' },
    '110000': { num: 20, name: '风地观', nameEn: 'Guan - Contemplation' },
    '101001': { num: 21, name: '火雷噬嗑', nameEn: 'Shi Ke - Biting Through' },
    '100101': { num: 22, name: '山火贲', nameEn: 'Bi - Grace' },
    '100000': { num: 23, name: '山地剥', nameEn: 'Bo - Splitting Apart' },
    '000001': { num: 24, name: '地雷复', nameEn: 'Fu - Return' },
    '111001': { num: 25, name: '天雷无妄', nameEn: 'Wu Wang - Innocence' },
    '100111': { num: 26, name: '山天大畜', nameEn: 'Da Xu - Great Taming' },
    '100001': { num: 27, name: '山雷颐', nameEn: 'Yi - Nourishment' },
    '011110': { num: 28, name: '泽风大过', nameEn: 'Da Guo - Great Excess' },
    '010010': { num: 29, name: '坎为水', nameEn: 'Kan - The Abysmal (Water)' },
    '101101': { num: 30, name: '离为火', nameEn: 'Li - The Clinging (Fire)' },
    '011100': { num: 31, name: '泽山咸', nameEn: 'Xian - Influence' },
    '001110': { num: 32, name: '雷风恒', nameEn: 'Heng - Duration' },
    '111100': { num: 33, name: '天山遁', nameEn: 'Dun - Retreat' },
    '001111': { num: 34, name: '雷天大壮', nameEn: 'Da Zhuang - Great Power' },
    '101000': { num: 35, name: '火地晋', nameEn: 'Jin - Progress' },
    '000101': { num: 36, name: '地火明夷', nameEn: 'Ming Yi - Darkening of Light' },
    '110101': { num: 37, name: '风火家人', nameEn: 'Jia Ren - The Family' },
    '101011': { num: 38, name: '火泽睽', nameEn: 'Kui - Opposition' },
    '010100': { num: 39, name: '水山蹇', nameEn: 'Jian - Obstruction' },
    '001010': { num: 40, name: '雷水解', nameEn: 'Xie - Deliverance' },
    '100011': { num: 41, name: '山泽损', nameEn: 'Sun - Decrease' },
    '110001': { num: 42, name: '风雷益', nameEn: 'Yi - Increase' },
    '011111': { num: 43, name: '泽天夬', nameEn: 'Guai - Breakthrough' },
    '111110': { num: 44, name: '天风姤', nameEn: 'Gou - Coming to Meet' },
    '011000': { num: 45, name: '泽地萃', nameEn: 'Cui - Gathering Together' },
    '000110': { num: 46, name: '地风升', nameEn: 'Sheng - Pushing Upward' },
    '011010': { num: 47, name: '泽水困', nameEn: 'Kun - Oppression' },
    '010110': { num: 48, name: '水风井', nameEn: 'Jing - The Well' },
    '011101': { num: 49, name: '泽火革', nameEn: 'Ge - Revolution' },
    '101110': { num: 50, name: '火风鼎', nameEn: 'Ding - The Cauldron' },
    '001001': { num: 51, name: '震为雷', nameEn: 'Zhen - The Arousing (Thunder)' },
    '100100': { num: 52, name: '艮为山', nameEn: 'Gen - Keeping Still (Mountain)' },
    '110100': { num: 53, name: '风山渐', nameEn: 'Jian - Development' },
    '001011': { num: 54, name: '雷泽归妹', nameEn: 'Gui Mei - Marrying Maiden' },
    '001101': { num: 55, name: '雷火丰', nameEn: 'Feng - Abundance' },
    '101100': { num: 56, name: '火山旅', nameEn: 'Lü - The Wanderer' },
    '110110': { num: 57, name: '巽为风', nameEn: 'Xun - The Gentle (Wind)' },
    '011011': { num: 58, name: '兑为泽', nameEn: 'Dui - The Joyous (Lake)' },
    '110010': { num: 59, name: '风水涣', nameEn: 'Huan - Dispersion' },
    '010011': { num: 60, name: '水泽节', nameEn: 'Jie - Limitation' },
    '110011': { num: 61, name: '风泽中孚', nameEn: 'Zhong Fu - Inner Truth' },
    '001100': { num: 62, name: '雷山小过', nameEn: 'Xiao Guo - Small Exceeding' },
    '010101': { num: 63, name: '水火既济', nameEn: 'Ji Ji - After Completion' },
    '101010': { num: 64, name: '火水未济', nameEn: 'Wei Ji - Before Completion' },
  };
  
  Object.keys(hexNames).forEach(key => {
    if (!HEXAGRAMS[key]) {
      HEXAGRAMS[key] = {
        ...hexNames[key],
        gua: '卦辞', guaEn: 'Hexagram text',
        xiang: '象辞', xiangEn: 'Image text',
        philosophy: '哲理', philosophyEn: 'Philosophy',
        vernacular: '白话', vernacularEn: 'Interpretation',
        yao: []
      };
    } else {
      HEXAGRAMS[key].nameEn = hexNames[key].nameEn;
    }
  });
};

addEnglishSupport();

const SHICHEN_ZH = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const getShichen = () => { 
  const h = new Date().getHours(); 
  return { 
    idx: h >= 23 ? 0 : Math.floor((h + 1) / 2),
    num: (h >= 23 ? 1 : Math.floor((h + 1) / 2) + 1) 
  }; 
};

export default function MeihuaYishu() {
  const [lang, setLang] = useState('zh');
  const [input, setInput] = useState('');
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState(null);
  const [tab, setTab] = useState('orig');
  const [expandYao, setExpandYao] = useState(null);
  const [time, setTime] = useState(new Date());

  const t = i18n[lang];

  useEffect(() => { const timer = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(timer); }, []);

  const calc = () => {
    if (!input || !/^\d+$/.test(input)) return alert(t.invalidInput);
    const d = input.split('').map(Number), len = d.length;
    const sh = getShichen();
    const sp = Math.max(1, Math.floor(len / 2));
    const u = d.slice(0, sp).reduce((a, b) => a + b, 0);
    const l = d.slice(sp).reduce((a, b) => a + b, 0);
    const uNum = u % 8 || 8, lNum = l % 8 || 8, chg = (u + l + sh.num) % 6 || 6;
    const uGua = BAGUA[uNum], lGua = BAGUA[lNum];
    const oLines = [...lGua.lines, ...uGua.lines];
    const cLines = [...oLines]; cLines[chg - 1] = cLines[chg - 1] === 1 ? 0 : 1;
    const findG = (ls) => { for (let n in BAGUA) if (BAGUA[n].lines.join('') === ls.join('')) return { n: +n, ...BAGUA[n] }; return null; };
    const cU = findG(cLines.slice(3, 6)), cL = findG(cLines.slice(0, 3));
    const oHex = HEXAGRAMS[oLines.join('')] || { name: '未知卦', nameEn: 'Unknown' };
    const cHex = HEXAGRAMS[cLines.join('')] || { name: '未知卦', nameEn: 'Unknown' };
    const ti = chg <= 3 ? uGua : lGua, yong = chg <= 3 ? lGua : uGua;
    let rel = '', lv = '';
    if (ti.element === yong.element) { rel = '体用比和'; lv = 'n'; }
    else if (WUXING[yong.element]?.sheng === ti.element) { rel = '用生体'; lv = 'g'; }
    else if (WUXING[ti.element]?.sheng === yong.element) { rel = '体生用'; lv = 'c'; }
    else if (WUXING[yong.element]?.ke === ti.element) { rel = '用克体'; lv = 'w'; }
    else if (WUXING[ti.element]?.ke === yong.element) { rel = '体克用'; lv = 'ok'; }
    setResult({ input, question, sh, uGua: { n: uNum, ...uGua }, lGua: { n: lNum, ...lGua }, oLines, cLines, cU, cL, oHex, cHex, ti, yong, rel, lv, chg });
    setTab('orig'); setExpandYao(null);
  };

  const sh = getShichen();
  const hex = result ? (tab === 'orig' ? result.oHex : result.cHex) : null;
  const lines = result ? (tab === 'orig' ? result.oLines : result.cLines) : [];
  const uG = result ? (tab === 'orig' ? result.uGua : result.cU) : null;
  const lG = result ? (tab === 'orig' ? result.lGua : result.cL) : null;

  const Yao = ({ l, hl }) => (
    <div style={{ display: 'flex', justifyContent: 'center', gap: l === 1 ? 0 : '8px', marginBottom: '6px' }}>
      {l === 1 ? <div style={{ width: '52px', height: '7px', background: hl ? '#0058a3' : '#222', borderRadius: '2px' }} />
        : <><div style={{ width: '22px', height: '7px', background: hl ? '#0058a3' : '#222', borderRadius: '2px' }} /><div style={{ width: '22px', height: '7px', background: hl ? '#0058a3' : '#222', borderRadius: '2px' }} /></>}
    </div>
  );

  const getGuaName = (g) => lang === 'en' ? (g?.nameEn || g?.name) : g?.name;
  const getElement = (el) => t.elements[el] || el;

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#111' }}>
      <style>{`* { margin: 0; padding: 0; box-sizing: border-box; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } .fi { animation: fadeIn 0.3s; }`}</style>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Language Toggle */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} style={{ padding: '8px 16px', background: '#fff', border: '1px solid #ddd', borderRadius: '20px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
            {lang === 'zh' ? '🌐 English' : '🌐 中文'}
          </button>
        </div>
        
        <header style={{ marginBottom: '28px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '30px', fontWeight: '700' }}>{t.title}</h1>
          <p style={{ color: '#666', fontSize: '14px' }}>{t.subtitle}</p>
        </header>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '28px', padding: '14px 0', borderTop: '1px solid #e5e5e5', borderBottom: '1px solid #e5e5e5', marginBottom: '28px', fontSize: '14px' }}>
          <div><span style={{ color: '#888' }}>{t.time} </span><b>{time.toLocaleTimeString(lang === 'zh' ? 'zh-CN' : 'en-US', { hour12: false })}</b></div>
          <div><span style={{ color: '#888' }}>{t.shichen} </span><b>{t.shichenNames[sh.idx]}{lang === 'zh' ? '时' : ''}</b></div>
          <div><span style={{ color: '#888' }}>{t.num} </span><b>{sh.num}</b></div>
        </div>
        
        {!result ? (
          <div className="fi">
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>{t.question}</label>
              <textarea placeholder={t.questionPlaceholder} value={question} onChange={(e) => setQuestion(e.target.value)} style={{ width: '100%', padding: '14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '15px', minHeight: '75px', resize: 'vertical' }} />
            </div>
            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>{t.inputLabel}</label>
              <input type="text" placeholder={t.inputPlaceholder} value={input} onChange={(e) => setInput(e.target.value.replace(/\D/g, ''))} style={{ width: '100%', padding: '14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '20px', letterSpacing: '3px' }} />
              <p style={{ fontSize: '12px', color: '#999', marginTop: '6px' }}>{t.inputTip}</p>
            </div>
            <button onClick={calc} disabled={!input} style={{ width: '100%', padding: '16px', background: input ? '#0058a3' : '#ccc', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: input ? 'pointer' : 'not-allowed' }}>{t.calculate}</button>
          </div>
        ) : (
          <div className="fi">
            {result.question && <div style={{ padding: '14px 18px', background: '#e6f4ff', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', borderLeft: '4px solid #0058a3' }}><b>{t.asked}</b>{result.question}</div>}
            
            <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px', border: '1px solid #e5e5e5' }}>
              <button onClick={() => { setTab('orig'); setExpandYao(null); }} style={{ flex: 1, padding: '12px', background: tab === 'orig' ? '#0058a3' : '#fff', border: 'none', fontSize: '15px', fontWeight: '600', color: tab === 'orig' ? '#fff' : '#666', cursor: 'pointer' }}>{t.originalHex}</button>
              <button onClick={() => { setTab('chg'); setExpandYao(null); }} style={{ flex: 1, padding: '12px', background: tab === 'chg' ? '#0058a3' : '#fff', border: 'none', borderLeft: '1px solid #e5e5e5', fontSize: '15px', fontWeight: '600', color: tab === 'chg' ? '#fff' : '#666', cursor: 'pointer' }}>{t.changedHex}</button>
            </div>
            
            <div style={{ background: '#fff', borderRadius: '10px', padding: '20px', marginBottom: '20px', border: '1px solid #e5e5e5' }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column-reverse', padding: '14px', background: '#f8f8f8', borderRadius: '8px' }}>
                  {lines.map((l, i) => <Yao key={i} l={l} hl={tab === 'orig' && i === result.chg - 1} />)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>{lang === 'en' ? hex?.nameEn : hex?.name}</div>
                  <div style={{ fontSize: '13px', color: '#666', marginBottom: '14px' }}>{getGuaName(uG)} ↑ {getGuaName(lG)} ↓ {hex?.num && `· #${hex.num}`}</div>
                  <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: '6px', marginBottom: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>{t.hexagram}</div>
                    <div style={{ fontSize: '15px', fontWeight: '500' }}>{lang === 'en' ? hex?.guaEn : hex?.gua}</div>
                  </div>
                  {hex?.xiang && <div style={{ padding: '12px', background: '#fffbe6', borderRadius: '6px', borderLeft: '3px solid #faad14' }}>
                    <div style={{ fontSize: '11px', color: '#ad6800', marginBottom: '4px' }}>{t.xiangYue}</div>
                    <div style={{ fontSize: '14px', color: '#614700' }}>{lang === 'en' ? hex?.xiangEn : hex?.xiang}</div>
                  </div>}
                </div>
              </div>
            </div>
            
            {hex?.philosophy && <div style={{ padding: '18px', background: '#fff', borderRadius: '8px', marginBottom: '16px', border: '1px solid #e5e5e5' }}>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px', fontWeight: '600' }}>{t.philosophy}</div>
              <p style={{ fontSize: '14px', lineHeight: '1.8' }}>{lang === 'en' ? hex?.philosophyEn : hex?.philosophy}</p>
            </div>}
            
            {hex?.vernacular && <div style={{ padding: '18px', background: '#f0f9ff', borderRadius: '8px', marginBottom: '16px', border: '1px solid #bae0ff' }}>
              <div style={{ fontSize: '12px', color: '#0958d9', marginBottom: '8px', fontWeight: '600' }}>{t.vernacular}</div>
              <p style={{ fontSize: '14px', lineHeight: '1.8' }}>{lang === 'en' ? hex?.vernacularEn : hex?.vernacular}</p>
            </div>}
            
            {hex?.yao && hex.yao.length > 0 && <div style={{ padding: '18px', background: '#fff', borderRadius: '8px', marginBottom: '16px', border: '1px solid #e5e5e5' }}>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '14px', fontWeight: '600' }}>{t.yaoDetail} <span style={{ fontWeight: '400' }}>{t.clickExpand}</span></div>
              {hex.yao.map((y, i) => (
                <div key={i} style={{ marginBottom: '8px' }}>
                  <div onClick={() => setExpandYao(expandYao === i ? null : i)} style={{ padding: '12px 14px', background: tab === 'orig' && i === result.chg - 1 ? '#e6f4ff' : '#f8f8f8', borderRadius: expandYao === i ? '8px 8px 0 0' : '8px', cursor: 'pointer', borderLeft: tab === 'orig' && i === result.chg - 1 ? '4px solid #0058a3' : '4px solid transparent' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {tab === 'orig' && i === result.chg - 1 && <span style={{ background: '#0058a3', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>{t.dongYao}</span>}
                      <span style={{ fontSize: '14px', fontWeight: '600', color: tab === 'orig' && i === result.chg - 1 ? '#0058a3' : '#333' }}>{lang === 'en' ? y.posEn : y.pos}</span>
                      <span style={{ fontSize: '14px', color: '#555' }}>{lang === 'en' ? y.textEn : y.text}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>→ {lang === 'en' ? y.meanEn : y.mean}</div>
                  </div>
                  {expandYao === i && (
                    <div style={{ padding: '14px', background: '#fff', border: '1px solid #e5e5e5', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
                      {y.xiang && <div style={{ padding: '10px', background: '#fffbe6', borderRadius: '6px', marginBottom: '10px' }}>
                        <div style={{ fontSize: '10px', color: '#ad6800', marginBottom: '2px', fontWeight: '600' }}>{t.yaoXiang}</div>
                        <p style={{ fontSize: '12px', color: '#614700' }}>{y.xiang}</p>
                      </div>}
                    </div>
                  )}
                </div>
              ))}
            </div>}
            
            <div style={{ padding: '18px', background: result.lv === 'g' ? '#f6ffed' : result.lv === 'ok' ? '#e6f7ff' : result.lv === 'w' ? '#fff2e8' : result.lv === 'c' ? '#fffbe6' : '#f5f5f5', borderRadius: '8px', marginBottom: '24px', border: `2px solid ${result.lv === 'g' ? '#52c41a' : result.lv === 'ok' ? '#1890ff' : result.lv === 'w' ? '#fa541c' : result.lv === 'c' ? '#faad14' : '#d9d9d9'}` }}>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px', fontWeight: '600' }}>{t.tiyongAnalysis}</div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                <div style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.7)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', color: '#888' }}>{t.tiGua}</div>
                  <div style={{ fontSize: '18px', fontWeight: '600' }}>{getGuaName(result.ti)}</div>
                  <div style={{ fontSize: '12px' }}>{getElement(result.ti.element)}</div>
                </div>
                <div style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.7)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', color: '#888' }}>{t.yongGua}</div>
                  <div style={{ fontSize: '18px', fontWeight: '600' }}>{getGuaName(result.yong)}</div>
                  <div style={{ fontSize: '12px' }}>{getElement(result.yong.element)}</div>
                </div>
              </div>
              <div style={{ display: 'inline-block', padding: '6px 16px', background: result.lv === 'g' ? '#52c41a' : result.lv === 'ok' ? '#1890ff' : result.lv === 'w' ? '#fa541c' : result.lv === 'c' ? '#faad14' : '#666', color: '#fff', borderRadius: '16px', fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>{t.relations[result.rel]}</div>
              <p style={{ fontSize: '14px' }}>{t.fortunes[result.rel]}</p>
            </div>
            
            <button onClick={() => { setResult(null); setInput(''); setQuestion(''); }} style={{ width: '100%', padding: '14px', background: '#fff', color: '#333', border: '1px solid #ddd', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>{t.restart}</button>
          </div>
        )}
        
        <footer style={{ marginTop: '48px', paddingTop: '20px', borderTop: '1px solid #e5e5e5', textAlign: 'center', fontSize: '11px', color: '#999' }}>
          {t.footer}
        </footer>
      </div>
    </div>
  );
}
