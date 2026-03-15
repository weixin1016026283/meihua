// Shared city data for both home page and mingpan page
// Format: [zhName, enName, longitude, utcOffset, hasDST, region]

export const CITIES = [
  // China (UTC+8, no DST)
  ['北京','Beijing',116.4,8,0,'cn'],['上海','Shanghai',121.5,8,0,'cn'],
  ['广州','Guangzhou',113.3,8,0,'cn'],['深圳','Shenzhen',114.1,8,0,'cn'],
  ['成都','Chengdu',104.1,8,0,'cn'],['重庆','Chongqing',106.5,8,0,'cn'],
  ['武汉','Wuhan',114.3,8,0,'cn'],['西安',"Xi'an",108.9,8,0,'cn'],
  ['南京','Nanjing',118.8,8,0,'cn'],['杭州','Hangzhou',120.2,8,0,'cn'],
  ['天津','Tianjin',117.2,8,0,'cn'],['长沙','Changsha',112.9,8,0,'cn'],
  ['郑州','Zhengzhou',113.7,8,0,'cn'],['济南','Jinan',117.0,8,0,'cn'],
  ['沈阳','Shenyang',123.4,8,0,'cn'],['大连','Dalian',121.6,8,0,'cn'],
  ['哈尔滨','Harbin',126.6,8,0,'cn'],['长春','Changchun',125.3,8,0,'cn'],
  ['昆明','Kunming',102.7,8,0,'cn'],['贵阳','Guiyang',106.7,8,0,'cn'],
  ['南宁','Nanning',108.4,8,0,'cn'],['福州','Fuzhou',119.3,8,0,'cn'],
  ['合肥','Hefei',117.3,8,0,'cn'],['石家庄','Shijiazhuang',114.5,8,0,'cn'],
  ['太原','Taiyuan',112.5,8,0,'cn'],['南昌','Nanchang',115.9,8,0,'cn'],
  ['兰州','Lanzhou',103.8,8,0,'cn'],['西宁','Xining',101.8,8,0,'cn'],
  ['银川','Yinchuan',106.3,8,0,'cn'],['呼和浩特','Hohhot',111.7,8,0,'cn'],
  ['拉萨','Lhasa',91.1,8,0,'cn'],['乌鲁木齐','Urumqi',87.6,8,0,'cn'],
  ['香港','Hong Kong',114.2,8,0,'cn'],['澳门','Macau',113.5,8,0,'cn'],
  ['台北','Taipei',121.6,8,0,'cn'],
  // United States
  ['纽约','New York',-74.0,-5,1,'us'],['洛杉矶','Los Angeles',-118.2,-8,1,'us'],
  ['芝加哥','Chicago',-87.6,-6,1,'us'],['休斯顿','Houston',-95.4,-6,1,'us'],
  ['凤凰城','Phoenix',-112.1,-7,0,'us'],['费城','Philadelphia',-75.2,-5,1,'us'],
  ['圣安东尼奥','San Antonio',-98.5,-6,1,'us'],['圣地亚哥','San Diego',-117.2,-8,1,'us'],
  ['达拉斯','Dallas',-96.8,-6,1,'us'],['圣何塞','San Jose',-121.9,-8,1,'us'],
  ['奥斯汀','Austin',-97.7,-6,1,'us'],['旧金山','San Francisco',-122.4,-8,1,'us'],
  ['西雅图','Seattle',-122.3,-8,1,'us'],['丹佛','Denver',-105.0,-7,1,'us'],
  ['华盛顿','Washington DC',-77.0,-5,1,'us'],['波士顿','Boston',-71.1,-5,1,'us'],
  ['纳什维尔','Nashville',-86.8,-6,1,'us'],['波特兰','Portland',-122.7,-8,1,'us'],
  ['拉斯维加斯','Las Vegas',-115.1,-8,1,'us'],['亚特兰大','Atlanta',-84.4,-5,1,'us'],
  ['迈阿密','Miami',-80.2,-5,1,'us'],['明尼阿波利斯','Minneapolis',-93.3,-6,1,'us'],
  ['坦帕','Tampa',-82.5,-5,1,'us'],['新奥尔良','New Orleans',-90.1,-6,1,'us'],
  ['匹兹堡','Pittsburgh',-80.0,-5,1,'us'],['辛辛那提','Cincinnati',-84.5,-5,1,'us'],
  ['圣路易斯','St. Louis',-90.2,-6,1,'us'],['奥兰多','Orlando',-81.4,-5,1,'us'],
  ['克利夫兰','Cleveland',-81.7,-5,1,'us'],['底特律','Detroit',-83.0,-5,1,'us'],
  ['盐湖城','Salt Lake City',-111.9,-7,1,'us'],['萨克拉门托','Sacramento',-121.5,-8,1,'us'],
  ['堪萨斯城','Kansas City',-94.6,-6,1,'us'],['巴尔的摩','Baltimore',-76.6,-5,1,'us'],
  ['密尔沃基','Milwaukee',-87.9,-6,1,'us'],['檀香山','Honolulu',-157.8,-10,0,'us'],
  ['安克雷奇','Anchorage',-149.9,-9,1,'us'],['夏洛特','Charlotte',-80.8,-5,1,'us'],
  ['罗利','Raleigh',-78.6,-5,1,'us'],['印第安纳波利斯','Indianapolis',-86.2,-5,1,'us'],
  ['哥伦布','Columbus',-83.0,-5,1,'us'],
  // Additional US states
  ['伯明翰','Birmingham AL',-86.8,-6,1,'us'],['小石城','Little Rock',-92.3,-6,1,'us'],
  ['哈特福德','Hartford',-72.7,-5,1,'us'],['威尔明顿','Wilmington DE',-75.5,-5,1,'us'],
  ['博伊西','Boise',-116.2,-7,1,'us'],['得梅因','Des Moines',-93.6,-6,1,'us'],
  ['威奇托','Wichita',-97.3,-6,1,'us'],['路易维尔','Louisville',-85.8,-5,1,'us'],
  ['波特兰缅因','Portland ME',-70.3,-5,1,'us'],['杰克逊','Jackson MS',-90.2,-6,1,'us'],
  ['比灵斯','Billings',-108.5,-7,1,'us'],['奥马哈','Omaha',-96.0,-6,1,'us'],
  ['曼彻斯特','Manchester NH',-71.5,-5,1,'us'],['纽瓦克','Newark',-74.2,-5,1,'us'],
  ['阿尔伯克基','Albuquerque',-106.7,-7,1,'us'],['法戈','Fargo',-96.8,-6,1,'us'],
  ['俄克拉荷马城','Oklahoma City',-97.5,-6,1,'us'],['普罗维登斯','Providence',-71.4,-5,1,'us'],
  ['查尔斯顿','Charleston SC',-79.9,-5,1,'us'],['苏福尔斯','Sioux Falls',-96.7,-6,1,'us'],
  ['伯灵顿','Burlington VT',-73.2,-5,1,'us'],['弗吉尼亚海滩','Virginia Beach',-76.0,-5,1,'us'],
  ['查尔斯顿西弗','Charleston WV',-81.6,-5,1,'us'],['夏延','Cheyenne',-104.8,-7,1,'us'],
  // Canada
  ['多伦多','Toronto',-79.4,-5,1,'ca'],['温哥华','Vancouver',-123.1,-8,1,'ca'],
  ['蒙特利尔','Montreal',-73.6,-5,1,'ca'],['卡尔加里','Calgary',-114.1,-7,1,'ca'],
  ['埃德蒙顿','Edmonton',-113.5,-7,1,'ca'],['渥太华','Ottawa',-75.7,-5,1,'ca'],
  ['温尼伯','Winnipeg',-97.1,-6,1,'ca'],
  // Europe
  ['伦敦','London',-0.1,0,1,'eu'],['巴黎','Paris',2.3,1,1,'eu'],
  ['柏林','Berlin',13.4,1,1,'eu'],['马德里','Madrid',-3.7,1,1,'eu'],
  ['罗马','Rome',12.5,1,1,'eu'],['阿姆斯特丹','Amsterdam',4.9,1,1,'eu'],
  ['布鲁塞尔','Brussels',4.4,1,1,'eu'],['维也纳','Vienna',16.4,1,1,'eu'],
  ['慕尼黑','Munich',11.6,1,1,'eu'],['苏黎世','Zurich',8.5,1,1,'eu'],
  ['斯德哥尔摩','Stockholm',18.1,1,1,'eu'],['哥本哈根','Copenhagen',12.6,1,1,'eu'],
  ['都柏林','Dublin',-6.3,0,1,'eu'],['莫斯科','Moscow',37.6,3,0,'eu'],
  ['圣彼得堡','Saint Petersburg',30.3,3,0,'eu'],['新西伯利亚','Novosibirsk',82.9,7,0,'eu'],
  ['叶卡捷琳堡','Yekaterinburg',60.6,5,0,'eu'],['喀山','Kazan',49.1,3,0,'eu'],
  ['下诺夫哥罗德','Nizhny Novgorod',44.0,3,0,'eu'],['车里雅宾斯克','Chelyabinsk',61.4,5,0,'eu'],
  ['萨马拉','Samara',50.2,4,0,'eu'],['鄂木斯克','Omsk',73.4,6,0,'eu'],
  ['顿河畔罗斯托夫','Rostov-on-Don',39.7,3,0,'eu'],['乌法','Ufa',56.0,5,0,'eu'],
  ['克拉斯诺亚尔斯克','Krasnoyarsk',93.0,7,0,'eu'],['沃罗涅日','Voronezh',39.2,3,0,'eu'],
  ['伏尔加格勒','Volgograd',44.5,3,0,'eu'],['海参崴','Vladivostok',131.9,10,0,'eu'],
  ['伊斯坦布尔','Istanbul',29.0,3,0,'eu'],['里斯本','Lisbon',-9.1,0,1,'eu'],
  ['华沙','Warsaw',21.0,1,1,'eu'],['布拉格','Prague',14.4,1,1,'eu'],
  ['赫尔辛基','Helsinki',24.9,2,1,'eu'],['雅典','Athens',23.7,2,1,'eu'],
  ['奥斯陆','Oslo',10.8,1,1,'eu'],['布达佩斯','Budapest',19.0,1,1,'eu'],
  ['布加勒斯特','Bucharest',26.1,2,1,'eu'],['基辅','Kyiv',30.5,2,1,'eu'],
  ['贝尔格莱德','Belgrade',20.5,1,1,'eu'],['萨格勒布','Zagreb',16.0,1,1,'eu'],
  // Asia (outside China)
  ['东京','Tokyo',139.7,9,0,'as'],['首尔','Seoul',127.0,9,0,'as'],
  ['新加坡','Singapore',103.8,8,0,'as'],['曼谷','Bangkok',100.5,7,0,'as'],
  ['吉隆坡','Kuala Lumpur',101.7,8,0,'as'],['雅加达','Jakarta',106.8,7,0,'as'],
  ['马尼拉','Manila',121.0,8,0,'as'],['迪拜','Dubai',55.3,4,0,'as'],
  ['河内','Hanoi',105.8,7,0,'as'],['胡志明市','Ho Chi Minh City',106.7,7,0,'as'],
  ['金边','Phnom Penh',104.9,7,0,'as'],['仰光','Yangon',96.2,6.5,0,'as'],
  ['德黑兰','Tehran',51.4,3.5,0,'as'],['利雅得','Riyadh',46.7,3,0,'as'],
  ['特拉维夫','Tel Aviv',34.8,2,1,'as'],['多哈','Doha',51.5,3,0,'as'],
  ['伊斯兰堡','Islamabad',73.0,5,0,'as'],['达卡','Dhaka',90.4,6,0,'as'],
  ['科伦坡','Colombo',79.9,5.5,0,'as'],['加德满都','Kathmandu',85.3,5.75,0,'as'],
  ['安曼','Amman',35.9,2,1,'as'],['科威特城','Kuwait City',47.9,3,0,'as'],
  // India (UTC+5.5, no DST)
  ['新德里','New Delhi',77.2,5.5,0,'in'],['孟买','Mumbai',72.9,5.5,0,'in'],
  ['班加罗尔','Bangalore',77.6,5.5,0,'in'],['金奈','Chennai',80.3,5.5,0,'in'],
  ['加尔各答','Kolkata',88.4,5.5,0,'in'],['海得拉巴','Hyderabad',78.5,5.5,0,'in'],
  ['艾哈迈达巴德','Ahmedabad',72.6,5.5,0,'in'],['浦那','Pune',73.9,5.5,0,'in'],
  ['斋浦尔','Jaipur',75.8,5.5,0,'in'],['勒克瑙','Lucknow',81.0,5.5,0,'in'],
  ['巴特那','Patna',85.1,5.5,0,'in'],['博帕尔','Bhopal',77.4,5.5,0,'in'],
  ['昌迪加尔','Chandigarh',76.8,5.5,0,'in'],['布巴内什瓦尔','Bhubaneswar',85.8,5.5,0,'in'],
  ['果阿','Panaji',73.8,5.5,0,'in'],['蒂鲁瓦南塔普拉姆','Thiruvananthapuram',76.9,5.5,0,'in'],
  ['古瓦哈提','Guwahati',91.7,5.5,0,'in'],['赖布尔','Raipur',81.6,5.5,0,'in'],
  ['兰契','Ranchi',85.3,5.5,0,'in'],['德拉敦','Dehradun',78.0,5.5,0,'in'],
  ['西隆','Shillong',91.9,5.5,0,'in'],['因帕尔','Imphal',93.9,5.5,0,'in'],
  ['甘托克','Gangtok',88.6,5.5,0,'in'],['斯利那加','Srinagar',74.8,5.5,0,'in'],
  ['阿加尔塔拉','Agartala',91.3,5.5,0,'in'],
  // Oceania
  ['悉尼','Sydney',151.2,10,1,'oc'],['墨尔本','Melbourne',144.9,10,1,'oc'],
  ['布里斯班','Brisbane',153.0,10,0,'oc'],['奥克兰','Auckland',174.8,12,1,'oc'],
  ['珀斯','Perth',115.9,8,0,'oc'],
  // Latin America
  ['墨西哥城','Mexico City',-99.1,-6,1,'la'],['圣保罗','São Paulo',-46.6,-3,0,'la'],
  ['布宜诺斯艾利斯','Buenos Aires',-58.4,-3,0,'la'],['利马','Lima',-77.0,-5,0,'la'],
  ['波哥大','Bogotá',-74.1,-5,0,'la'],['圣地亚哥','Santiago',-70.7,-4,1,'la'],
  ['加拉加斯','Caracas',-66.9,-4,0,'la'],['基多','Quito',-78.5,-5,0,'la'],
  ['哈瓦那','Havana',-82.4,-5,1,'la'],['圣何塞哥','San José CR',-84.1,-6,0,'la'],
  ['巴拿马城','Panama City',-79.5,-5,0,'la'],
  // Africa & Middle East
  ['开罗','Cairo',31.2,2,0,'af'],['开普敦','Cape Town',18.4,2,1,'af'],
  ['约翰内斯堡','Johannesburg',28.0,2,0,'af'],['拉各斯','Lagos',3.4,1,0,'af'],
  ['内罗毕','Nairobi',36.8,3,0,'af'],
  ['卡萨布兰卡','Casablanca',-7.6,1,0,'af'],['亚的斯亚贝巴','Addis Ababa',38.7,3,0,'af'],
  ['阿克拉','Accra',-0.2,0,0,'af'],['达累斯萨拉姆','Dar es Salaam',39.3,3,0,'af'],
  ['阿尔及尔','Algiers',3.1,1,0,'af'],['金沙萨','Kinshasa',15.3,1,0,'af'],
  ['突尼斯','Tunis',10.2,1,0,'af'],
];

export const REGION_LABELS = {
  us: ['美国', 'United States'], cn: ['中国', 'China'], in: ['印度', 'India'],
  ca: ['加拿大', 'Canada'], eu: ['欧洲', 'Europe'], as: ['亚洲', 'Asia'],
  oc: ['大洋洲', 'Oceania'], la: ['拉丁美洲', 'Latin America'], af: ['非洲/中东', 'Africa / Middle East'],
};

export const REGION_ORDER = ['us', 'cn', 'in', 'ca', 'eu', 'as', 'oc', 'la', 'af'];

export const CITY_COUNTRY = {
  // Europe
  'London': ['英国','United Kingdom'], 'Dublin': ['爱尔兰','Ireland'],
  'Paris': ['法国','France'], 'Berlin': ['德国','Germany'], 'Munich': ['德国','Germany'],
  'Madrid': ['西班牙','Spain'], 'Rome': ['罗马','Italy'], 'Amsterdam': ['荷兰','Netherlands'],
  'Brussels': ['比利时','Belgium'], 'Vienna': ['奥地利','Austria'], 'Zurich': ['瑞士','Switzerland'],
  'Stockholm': ['瑞典','Sweden'], 'Copenhagen': ['丹麦','Denmark'],
  'Moscow': ['俄罗斯','Russia'], 'Saint Petersburg': ['俄罗斯','Russia'],
  'Novosibirsk': ['俄罗斯','Russia'], 'Yekaterinburg': ['俄罗斯','Russia'],
  'Kazan': ['俄罗斯','Russia'], 'Nizhny Novgorod': ['俄罗斯','Russia'],
  'Chelyabinsk': ['俄罗斯','Russia'], 'Samara': ['俄罗斯','Russia'],
  'Omsk': ['俄罗斯','Russia'], 'Rostov-on-Don': ['俄罗斯','Russia'],
  'Ufa': ['俄罗斯','Russia'], 'Krasnoyarsk': ['俄罗斯','Russia'],
  'Voronezh': ['俄罗斯','Russia'], 'Volgograd': ['俄罗斯','Russia'],
  'Vladivostok': ['俄罗斯','Russia'],
  'Istanbul': ['土耳其','Turkey'], 'Lisbon': ['葡萄牙','Portugal'], 'Warsaw': ['波兰','Poland'],
  'Prague': ['捷克','Czech Republic'], 'Helsinki': ['芬兰','Finland'], 'Athens': ['希腊','Greece'],
  'Oslo': ['挪威','Norway'], 'Budapest': ['匈牙利','Hungary'], 'Bucharest': ['罗马尼亚','Romania'],
  'Kyiv': ['乌克兰','Ukraine'], 'Belgrade': ['塞尔维亚','Serbia'], 'Zagreb': ['克罗地亚','Croatia'],
  // Asia
  'Tokyo': ['日本','Japan'], 'Seoul': ['韩国','South Korea'], 'Singapore': ['新加坡','Singapore'],
  'Bangkok': ['泰国','Thailand'], 'Kuala Lumpur': ['马来西亚','Malaysia'],
  'Jakarta': ['印度尼西亚','Indonesia'], 'Manila': ['菲律宾','Philippines'],
  'Dubai': ['阿联酋','UAE'], 'Hanoi': ['越南','Vietnam'], 'Ho Chi Minh City': ['越南','Vietnam'],
  'Phnom Penh': ['柬埔寨','Cambodia'], 'Yangon': ['缅甸','Myanmar'],
  'Tehran': ['伊朗','Iran'], 'Riyadh': ['沙特阿拉伯','Saudi Arabia'],
  'Tel Aviv': ['以色列','Israel'], 'Doha': ['卡塔尔','Qatar'],
  'Islamabad': ['巴基斯坦','Pakistan'], 'Dhaka': ['孟加拉国','Bangladesh'],
  'Colombo': ['斯里兰卡','Sri Lanka'], 'Kathmandu': ['尼泊尔','Nepal'],
  'Amman': ['约旦','Jordan'], 'Kuwait City': ['科威特','Kuwait'],
  // Oceania
  'Sydney': ['澳大利亚','Australia'], 'Melbourne': ['澳大利亚','Australia'],
  'Brisbane': ['澳大利亚','Australia'], 'Perth': ['澳大利亚','Australia'],
  'Auckland': ['新西兰','New Zealand'],
  // Latin America
  'Mexico City': ['墨西哥','Mexico'], 'São Paulo': ['巴西','Brazil'],
  'Buenos Aires': ['阿根廷','Argentina'], 'Lima': ['秘鲁','Peru'],
  'Bogotá': ['哥伦比亚','Colombia'], 'Santiago': ['智利','Chile'],
  'Caracas': ['委内瑞拉','Venezuela'], 'Quito': ['厄瓜多尔','Ecuador'],
  'Havana': ['古巴','Cuba'], 'San José CR': ['哥斯达黎加','Costa Rica'],
  'Panama City': ['巴拿马','Panama'],
  // Africa & Middle East
  'Cairo': ['埃及','Egypt'], 'Cape Town': ['南非','South Africa'],
  'Johannesburg': ['南非','South Africa'], 'Lagos': ['尼日利亚','Nigeria'],
  'Nairobi': ['肯尼亚','Kenya'], 'Casablanca': ['摩洛哥','Morocco'],
  'Addis Ababa': ['埃塞俄比亚','Ethiopia'], 'Accra': ['加纳','Ghana'],
  'Dar es Salaam': ['坦桑尼亚','Tanzania'], 'Algiers': ['阿尔及利亚','Algeria'],
  'Kinshasa': ['刚果','DR Congo'], 'Tunis': ['突尼斯','Tunisia'],
};

// Filter cities by search query
export function filterCities(query, lang) {
  if (!query.trim()) return CITIES;
  const q = query.toLowerCase();
  return CITIES.filter(c => {
    if (c[0].includes(query) || c[1].toLowerCase().includes(q)) return true;
    const rl = REGION_LABELS[c[5]];
    if (rl && (rl[0].includes(query) || rl[1].toLowerCase().includes(q))) return true;
    const cc = CITY_COUNTRY[c[1]];
    if (cc && (cc[0].includes(query) || cc[1].toLowerCase().includes(q))) return true;
    return false;
  });
}
