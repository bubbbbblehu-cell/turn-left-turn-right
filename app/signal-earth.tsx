"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import createGlobe, { type Globe, type Marker } from "cobe";

type CityId = "berlin" | "shanghai" | "taipei" | "tokyo" | "newyork" | "london" | "seoul" | "sydney" | "vienna" | "amsterdam" | "paris" | "copenhagen" | "lisbon" | "prague" | "singapore" | "bangkok" | "hongkong" | "mexicocity" | "saopaulo" | "capetown";
type PreviewPhase = "preview" | "performing" | "complete";
type GroupMove = "walk" | "dance" | "spin";
type SoundLayer = "signal" | "ambient" | "performance";
type FontMode = "fusion" | "trackpad";
type AssetKind = "城市专属" | "国家通用" | "照片追踪" | "概念占位" | "补充参考";

type SignalStory = {
  id: string;
  city: string;
  country: string;
  title: string;
  period: string;
  category: "城市常设" | "文化角色" | "艺术介入" | "公共倡议";
  summary: string;
  detail: string;
  image: string;
  credit: string;
  sourceUrl: string;
  cityId?: CityId;
  code?: string;
  english?: string;
  lat?: number;
  lon?: number;
  focalPoint: string;
  thumbnailZoom: number;
};

type MapPoint = {
  id: string;
  city: string;
  english: string;
  code: string;
  lat: number;
  lon: number;
  cityId?: CityId;
  storyId?: string;
  catalogId?: string;
  special: boolean;
};

type CatalogCity = {
  id: string;
  city: string;
  english: string;
  country: string;
  code: string;
  lat: number;
  lon: number;
  image?: string;
  sourceUrl?: string;
  credit?: string;
  note?: string;
  referenceScope?: "city" | "country" | "supplementary";
  evidenceType?: "pedestrian-figure" | "text-signal" | "pedestrian-button" | "traffic-scene" | "national-reference" | "historical";
};

type CountryCoverage = {
  code:string;
  code2:string;
  country:string;
  english:string;
  continent:string;
  capital:string;
  lat:number;
  lon:number;
  status:"verified-vector"|"verified-photo"|"commons-category"|"traffic-category"|"traffic-only"|"supplementary-only"|"research-needed";
  asset:string;
  note:string;
  categoryUrl:string;
};

type MapFeatureCard = {
  pointId: string;
  city: string;
  image: string;
  kicker: string;
  offsetX: number;
  offsetY: number;
  rotate: number;
};

type FocusRegion = {
  id: string;
  name: string;
  english: string;
  focusCity: string;
  focusCode: string;
  seedPointId: string;
  centerLat: number;
  centerLon: number;
  pointIds: string[];
  totalCount: number;
  specialCount: number;
  evidenceCount: number;
};

type City = {
  id: CityId;
  city: string;
  english: string;
  country: string;
  code: string;
  lat: number;
  lon: number;
  color: string;
  character: string;
  action: string;
  trigger: string;
  sound: string;
  duration: number;
  archive: string;
  assetKind: AssetKind;
  asset?: string;
  heroAsset?: "full" | "lower";
  referencePhoto?: string;
  referenceCredit?: string;
  caption: string;
  notes: number[];
};

const cities: Record<CityId, City> = {
  berlin: {
    id: "berlin", city: "柏林", english: "BERLIN", country: "德国", code: "BER", lat: 52.52, lon: 13.405,
    color: "#69ff94", character: "Ampelmännchen", action: "离开灯箱，在地下俱乐部跳一段 Techno。", trigger: "开始 Techno",
    sound: "信号脉冲 → 128 BPM", duration: 5200, archive: "开放 SVG · 声音草模", assetKind: "城市专属",
    asset: "/characters/berlin-green.svg", caption: "TECHNO / 128 BPM", notes: [110, 220, 275, 220],
  },
  shanghai: {
    id: "shanghai", city: "上海", english: "SHANGHAI", country: "中国", code: "SHA", lat: 31.2304, lon: 121.4737,
    color: "#6de6ff", character: "上海行人灯 · 动作占位", action: "穿过浦江，在陆家嘴天际线间绕塔穿行。", trigger: "穿过上海",
    sound: "上行脉冲 → 江面回声", duration: 4800, archive: "照片追踪 SVG · 中国通用参照", assetKind: "国家通用",
    asset: "/characters/photo-traced/shanghai.svg", heroAsset: "full",
    caption: "CROSSING THE RIVER", notes: [392, 523, 659, 784, 659, 523],
    referencePhoto: "/map-signals/countries/chn-pedestrian-signal.jpg", referenceCredit: "poeloq · CC BY 2.0 · 中国通用参照",
  },
  taipei: {
    id: "taipei", city: "台北", english: "TAIPEI", country: "中国台湾", code: "TPE", lat: 25.033, lon: 121.5654,
    color: "#c1ff54", character: "Xiaolüren · 动作占位", action: "跟随倒计时逐渐加速，绕过台北 101。", trigger: "启动倒计时",
    sound: "电子步进 → 加速提示", duration: 4500, archive: "照片追踪 SVG · 镜面反光待复核", assetKind: "照片追踪",
    asset: "/characters/photo-traced/taipei.svg", heroAsset: "full",
    caption: "COUNTDOWN / 09 → 00", notes: [988, 988, 1318, 988, 1568],
    referencePhoto: "/map-signals/taipei-little-green-man.jpg", referenceCredit: "Tiouraren · CC BY-SA 4.0",
  },
  tokyo: {
    id: "tokyo", city: "东京", english: "TOKYO", country: "日本", code: "TYO", lat: 35.6762, lon: 139.6503,
    color: "#8dffb1", character: "日本行人信号 · 国家通用", action: "在十字路口与四个方向的小人同步换步。", trigger: "同步穿越",
    sound: "鸟鸣提示 → 交叉节拍", duration: 4600, archive: "国家通用 SVG · 城市动作草模", assetKind: "国家通用",
    asset: "/characters/tokyo.svg", caption: "SCRAMBLE / SYNC", notes: [659, 784, 659, 988],
    heroAsset: "lower",
  },
  newyork: {
    id: "newyork", city: "纽约", english: "NEW YORK", country: "美国", code: "NYC", lat: 40.7128, lon: -74.006,
    color: "#f5f2d0", character: "MUTCD WALK · 美国通用", action: "跟随街区脉冲快速穿越大道，在倒计时前冲进地铁。", trigger: "冲过街区",
    sound: "路口脉冲 → 地铁低频", duration: 4300, archive: "美国通用 SVG · 城市动作草模", assetKind: "国家通用",
    asset: "/characters/new-york.svg", caption: "WALK / DON'T WALK", notes: [330, 440, 523, 659],
    heroAsset: "full",
  },
  london: {
    id: "london", city: "伦敦", english: "LONDON", country: "英国", code: "LON", lat: 51.5072, lon: -0.1276,
    color: "#80ff9c", character: "UK Green Man · 英国通用", action: "在雨幕和斑马线之间侧步，让红色巴士先行。", trigger: "穿过雨幕",
    sound: "过街提示 → 雨点切分", duration: 4700, archive: "英国通用 SVG · 城市动作草模", assetKind: "国家通用",
    asset: "/characters/london.svg", caption: "RAIN / ZEBRA CROSSING", notes: [523, 587, 659, 523],
    heroAsset: "full",
  },
  seoul: {
    id: "seoul", city: "首尔", english: "SEOUL", country: "韩国", code: "SEL", lat: 37.5665, lon: 126.978,
    color: "#73f7dc", character: "韩国行人信号 · 国家通用", action: "在夜色街区中召集分身，完成一段队形舞。", trigger: "开始队形舞",
    sound: "电子提示 → 分层节拍", duration: 5000, archive: "韩国通用 SVG · 城市动作草模", assetKind: "国家通用",
    asset: "/characters/seoul.svg", caption: "FORMATION / NIGHT", notes: [440, 659, 880, 659],
    heroAsset: "lower",
  },
  sydney: {
    id: "sydney", city: "悉尼", english: "SYDNEY", country: "澳大利亚", code: "SYD", lat: -33.8688, lon: 151.2093,
    color: "#8fffc9", character: "Australia Walk · 澳大利亚通用", action: "沿海港弧线散步，让步伐和轮渡节奏重合。", trigger: "沿港口散步",
    sound: "过街蜂鸣 → 轮渡汽笛", duration: 4900, archive: "澳大利亚通用 SVG · 城市动作草模", assetKind: "国家通用",
    asset: "/characters/sydney.svg", caption: "HARBOUR / WALK", notes: [392, 494, 587, 784],
    heroAsset: "lower",
  },
  vienna: {
    id: "vienna", city: "维也纳", english: "VIENNA", country: "奥地利", code: "VIE", lat: 48.2082, lon: 16.3738,
    color: "#ffd6ed", character: "维也纳情侣灯 · 概念双人占位", action: "两个信号人物离开灯箱，在环形街道上跳三拍华尔兹。", trigger: "跳一段华尔兹",
    sound: "信号音 → 三拍旋律", duration: 5200, archive: "城市实拍追踪 SVG · 来源可核验", assetKind: "照片追踪",
    asset: "/characters/photo-traced/vienna.svg", heroAsset: "full",
    caption: "WALTZ / 3·4", notes: [392, 523, 659, 523, 784, 659],
    referencePhoto: "/signal-sources/vienna-couple.jpg", referenceCredit: "Furkan Akkurt · CC BY-SA 4.0",
  },
  amsterdam: {
    id: "amsterdam", city: "阿姆斯特丹", english: "AMSTERDAM", country: "荷兰", code: "AMS", lat: 52.3676, lon: 4.9041,
    color: "#9eff6c", character: "自行车信号动作 · 概念占位", action: "骑行小人绕过运河桥，按铃后加入全球队伍。", trigger: "骑过运河",
    sound: "按钮提示 → 车铃与水声", duration: 4800, archive: "城市实拍追踪 SVG · 双人信号", assetKind: "照片追踪",
    asset: "/characters/photo-traced/amsterdam.svg", heroAsset: "full",
    caption: "CANAL / BICYCLE", notes: [659, 784, 1046, 784],
    referencePhoto: "/signal-sources/amsterdam-couple.jpg", referenceCredit: "Wikimedia Commons · CC BY-SA",
  },
  paris: {
    id: "paris", city: "巴黎", english: "PARIS", country: "法国", code: "PAR", lat: 48.8566, lon: 2.3522,
    color: "#f4ff9b", character: "法国行人灯 · 概念占位", action: "沿塞纳河岸换步，在街角灯光之间完成一段轻快侧行。", trigger: "沿河换步",
    sound: "过街提示 → 河岸回声", duration: 4600, archive: "城市实拍追踪 SVG · 来源可核验", assetKind: "照片追踪",
    asset: "/characters/photo-traced/paris.svg", heroAsset: "full",
    caption: "RIVERBANK / STEP", notes: [523, 659, 784, 659],
    referencePhoto: "/map-signals/paris-pedestrian-signal.jpg", referenceCredit: "Joseolgon · CC BY-SA 4.0",
  },
  copenhagen: {
    id: "copenhagen", city: "哥本哈根", english: "COPENHAGEN", country: "丹麦", code: "CPH", lat: 55.6761, lon: 12.5683,
    color: "#83ffd7", character: "自行车信号 · 概念占位", action: "加入自行车流，在港口桥面上保持节奏和安全距离。", trigger: "加入骑行队",
    sound: "自行车提示 → 港口风声", duration: 4700, archive: "照片追踪 SVG · 丹麦通用参照", assetKind: "国家通用",
    asset: "/characters/photo-traced/copenhagen.svg", heroAsset: "full",
    caption: "CYCLE FLOW / HARBOUR", notes: [440, 587, 740, 880],
    referencePhoto: "/map-signals/countries/dnk-pedestrian-signal.jpg", referenceCredit: "Thorsten Hartmann · CC BY-SA 3.0 · 丹麦通用参照",
  },
  lisbon: {
    id: "lisbon", city: "里斯本", english: "LISBON", country: "葡萄牙", code: "LIS", lat: 38.7223, lon: -9.1393,
    color: "#ffe56f", character: "葡萄牙行人灯 · 概念占位", action: "沿坡道向上走，在电车经过时停下，再继续攀升。", trigger: "走上坡道",
    sound: "脚步提示 → 电车铃声", duration: 4900, archive: "按钮图标追踪 SVG · 非灯内小人", assetKind: "补充参考",
    asset: "/characters/photo-traced/lisbon-button.svg", heroAsset: "full",
    caption: "UPHILL / TRAM", notes: [392, 494, 587, 698],
    referencePhoto: "/map-signals/lisbon-pedestrian-button.jpg", referenceCredit: "Jules Verne Times Two · CC BY-SA 4.0 · 城市按钮补充",
  },
  prague: {
    id: "prague", city: "布拉格", english: "PRAGUE", country: "捷克", code: "PRG", lat: 50.0755, lon: 14.4378,
    color: "#ffca92", character: "布拉格行人灯 / Ztohoven 参考", action: "在会旋转的卡夫卡头像与悬在街巷上方的弗洛伊德之间做钟摆式转身。", trigger: "穿过两处城市装置",
    sound: "过街提示 → 钟摆节拍", duration: 5000, archive: "艺术介入实拍追踪 SVG · 来源可核验", assetKind: "照片追踪",
    asset: "/characters/photo-traced/prague.svg", heroAsset: "full",
    caption: "CLOCKWORK / TURN", notes: [330, 494, 659, 494],
    referencePhoto: "/signal-sources/prague-ztohoven.jpg", referenceCredit: "ŠJů / Ztohoven · CC BY-SA 3.0",
  },
  singapore: {
    id: "singapore", city: "新加坡", english: "SINGAPORE", country: "新加坡", code: "SIN", lat: 1.3521, lon: 103.8198,
    color: "#73ffd1", character: "新加坡行人灯 · 概念占位", action: "在热带雨幕中准确穿过路口，进入连贯的遮雨连廊。", trigger: "穿过雨幕",
    sound: "过街提示 → 热带雨声", duration: 4600, archive: "城市实拍追踪 SVG · 来源可核验", assetKind: "照片追踪",
    asset: "/characters/photo-traced/singapore.svg", heroAsset: "full",
    caption: "RAIN / PRECISE CROSSING", notes: [659, 784, 988, 784],
    referencePhoto: "/map-signals/singapore-countdown-signal.jpg", referenceCredit: "Kryp · CC0",
  },
  bangkok: {
    id: "bangkok", city: "曼谷", english: "BANGKOK", country: "泰国", code: "BKK", lat: 13.7563, lon: 100.5018,
    color: "#ffdc73", character: "泰国行人灯 · 概念占位", action: "从高架步道落到河岸，让步伐与船只波纹交错。", trigger: "穿越高架",
    sound: "信号节拍 → 河船低频", duration: 4800, archive: "城市实拍追踪 SVG · 远景细节有限", assetKind: "照片追踪",
    asset: "/characters/photo-traced/bangkok.svg", heroAsset: "full",
    caption: "SKYWALK / RIVER", notes: [440, 554, 659, 831],
    referencePhoto: "/map-signals/city-references/bangkok-pedestrian-green.jpg", referenceCredit: "Alisdare Hickson · CC BY-SA 4.0 · Khlong Toei",
  },
  hongkong: {
    id: "hongkong", city: "香港", english: "HONG KONG", country: "中国", code: "HKG", lat: 22.3193, lon: 114.1694,
    color: "#75f4ff", character: "香港行人灯 · 概念占位", action: "沿城市垂直动线升降，在密集街区中寻找下一段绿灯。", trigger: "沿坡道上行",
    sound: "路口脉冲 → 城市垂直回声", duration: 4700, archive: "城市实拍追踪 SVG · 来源可核验", assetKind: "照片追踪",
    asset: "/characters/photo-traced/hong-kong.svg", heroAsset: "full",
    caption: "VERTICAL CITY / CLIMB", notes: [587, 740, 988, 1175],
    referencePhoto: "/map-signals/city-references/hong-kong-pedestrian-signal.jpg", referenceCredit: "Benlisquare · CC BY-SA 4.0 · Salisbury Road",
  },
  mexicocity: {
    id: "mexicocity", city: "墨西哥城", english: "MEXICO CITY", country: "墨西哥", code: "MEX", lat: 19.4326, lon: -99.1332,
    color: "#ffb36f", character: "墨西哥行人灯 · 概念占位", action: "穿过宽阔街区，在广场节拍中完成连续大步。", trigger: "穿过广场",
    sound: "路口提示 → 广场环境声", duration: 5000, archive: "城市实拍追踪 SVG · 来源可核验", assetKind: "照片追踪",
    asset: "/characters/photo-traced/mexico-city.svg", heroAsset: "full",
    caption: "PLAZA / LONG STRIDE", notes: [392, 523, 698, 784],
    referencePhoto: "/map-signals/city-references/mexico-city-pedestrian-red.jpg", referenceCredit: "Espumakid · CC BY-SA 3.0 · Mexico City",
  },
  saopaulo: {
    id: "saopaulo", city: "圣保罗", english: "SÃO PAULO", country: "巴西", code: "SAO", lat: -23.5505, lon: -46.6333,
    color: "#b5ff78", character: "巴西行人灯 · 概念占位", action: "在巨大街区网格间切换方向，把等待时间变成身体节拍。", trigger: "切换街区",
    sound: "城市脉冲 → 多层脚步", duration: 5000, archive: "城市实拍追踪 SVG · 来源可核验", assetKind: "照片追踪",
    asset: "/characters/photo-traced/sao-paulo.svg", heroAsset: "full",
    caption: "GRID / BODY RHYTHM", notes: [330, 440, 660, 880],
    referencePhoto: "/signal-sources/sao-paulo-signal.jpg", referenceCredit: "Morio · CC BY-SA 3.0",
  },
  capetown: {
    id: "capetown", city: "开普敦", english: "CAPE TOWN", country: "南非", code: "CPT", lat: -33.9249, lon: 18.4241,
    color: "#9eefff", character: "南非行人灯 · 概念占位", action: "迎着海风跨过山脚道路，在阵风中调整身体重心。", trigger: "迎风行走",
    sound: "信号提示 → 海风与长步", duration: 4900, archive: "照片追踪 SVG · 南非通用参照", assetKind: "国家通用",
    asset: "/characters/photo-traced/cape-town.svg", heroAsset: "full",
    caption: "WIND / BALANCE", notes: [349, 440, 587, 698],
    referencePhoto: "/map-signals/countries/south-africa-green-man.jpg", referenceCredit: "Wikimedia Commons · 南非通用参照",
  },
};

const signalStories: SignalStory[] = [
  {
    id: "prague-ztohoven", city: "布拉格", country: "捷克", title: "当信号灯开始做“不合规”的动作", period: "2007", category: "艺术介入",
    summary: "艺术团体 Ztohoven 把标准小人替换成喝酒、撒尿、躺倒与拄拐等日常姿态。",
    detail: "这不是一套官方新标准，而是发生在街头的介入行动。它最有意思的地方，是把只负责“走／停”的身体，突然变成有情绪、会失态、也会衰老的真实身体。",
    image: "/signal-sources/prague-ztohoven.jpg", credit: "ŠJů · CC BY-SA 3.0", sourceUrl: "https://commons.wikimedia.org/wiki/Category:Pedestrian_signals_amended_by_Ztohoven", cityId: "prague", focalPoint: "50% 44%", thumbnailZoom: 1.18,
  },
  {
    id: "vienna-couples", city: "维也纳", country: "奥地利", title: "一个人过街，也可以变成两个人", period: "2015—至今", category: "公共倡议",
    summary: "异性、男男与女女伴侣牵手走进红绿灯，头顶还亮着一颗心。",
    detail: "这批图形原为 Eurovision、Life Ball 与彩虹游行而设置，后来被保留下来。它既表达城市多元，也利用陌生图形让行人重新注意信号灯。",
    image: "/signal-sources/vienna-couple.jpg", credit: "Furkan Akkurt · CC BY-SA 4.0", sourceUrl: "https://www.wien.gv.at/en/transportation/diversity-themed-traffic-lights", cityId: "vienna", focalPoint: "51% 38%", thumbnailZoom: 1.32,
  },
  {
    id: "utrecht-miffy", city: "乌得勒支", country: "荷兰", title: "米菲兔负责告诉你什么时候过街", period: "城市常设", category: "城市常设",
    summary: "Dick Bruna 在乌得勒支创造的米菲兔，代替了普通行人剪影。",
    detail: "红灯时米菲安静等待，灯箱下方的白色 LED 逐步熄灭，像一条很慢的倒计时。它把儿童绘本的极简线条完整带进公共设施。",
    image: "/signal-stories/utrecht-miffy.jpg", credit: "Charlie Foxtrot66 · CC BY-SA 4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Nijntje_stoplicht-Utrecht-2020.jpg",
    code: "UTR", english: "UTRECHT", lat: 52.0907, lon: 5.1214, focalPoint: "58% 25%", thumbnailZoom: 1.48,
  },
  {
    id: "mainz-det", city: "美因茨", country: "德国", title: "电视台小人 Det 正式上岗", period: "2016—至今", category: "文化角色",
    summary: "ZDF 片间动画角色 Mainzelmännchen Det，成为德国第一套 Mainzelmännchen 信号灯。",
    detail: "它不是临时贴纸，而是专门制作的信号图形。第一处安装在车站与市中心之间的繁忙过街点，此后又扩展到城市其他地点。",
    image: "/signal-stories/mainz-mainzel.png", credit: "Bigbossfarin · CC0", sourceUrl: "https://mainz.de/en/angebote-entdecken/zu-gast-in-mainz/sehenswertes/Mainzelmaennchen-Ampel",
    code: "MZ", english: "MAINZ", lat: 49.9929, lon: 8.2473, focalPoint: "50% 50%", thumbnailZoom: 1.08,
  },
  {
    id: "munich-pumuckl", city: "慕尼黑", country: "德国", title: "小精灵一路跑回故事发生的街区", period: "2025—至今", category: "文化角色",
    summary: "红头发小精灵 Pumuckl 在绿灯里迈开大步，重新出现在 Lehel 街区。",
    detail: "信号灯的位置靠近经典电视剧的取景地和 Eder 木工作坊旧址。角色、故事与真实街区在同一个路口重新重合。",
    image: "/signal-stories/munich-pumuckl.jpg", credit: "Strubbl · CC BY-SA 4.0", sourceUrl: "https://www.muenchen.de/sehenswuerdigkeiten/aktuell/pumuckl-ampel-lehel-brunnen-luitpoldpark",
    code: "MUC", english: "MUNICH", lat: 48.1351, lon: 11.582, focalPoint: "47% 27%", thumbnailZoom: 1.34,
  },
  {
    id: "rotterdam-panda", city: "鹿特丹", country: "荷兰", title: "动物园门口，只留下两枚会发光的脚印", period: "2023", category: "城市常设",
    summary: "Blijdorp 动物园附近的信号灯没有画完整动物，只让小红熊猫脚印亮起。",
    detail: "竹纹灯杆和成对脚印一起构成线索。它不像吉祥物那样直接出现，而像一只刚刚穿过马路、暂时躲到画面外的小动物。",
    image: "/signal-stories/rotterdam-red-panda.jpg", credit: "AgainErick · CC BY-SA 4.0", sourceUrl: "https://commons.wikimedia.org/wiki/Category:Fun_pedestrian_signals",
    code: "RTM", english: "ROTTERDAM", lat: 51.9244, lon: 4.4777, focalPoint: "55% 26%", thumbnailZoom: 1.46,
  },
  {
    id: "berlin-ampelmann", city: "柏林", country: "德国", title: "一个交通符号，穿过了城市制度的变化", period: "1961—至今", category: "城市常设",
    summary: "戴宽檐帽的东德 Ampelmännchen 在统一后被保留，并成为柏林最容易被认出的街道角色之一。",
    detail: "它的姿势很适合动画：红灯张开双臂，绿灯大步前进。本项目让这一步继续走出灯箱，进入 Techno 舞池。",
    image: "/characters/berlin-green.svg", credit: "Wikimedia Commons · 开放 SVG", sourceUrl: "https://commons.wikimedia.org/wiki/File:Ampelmann_Gr%C3%BCn.svg", cityId: "berlin", focalPoint: "50% 50%", thumbnailZoom: 1,
  },
  {
    id: "london-pride", city: "伦敦", country: "英国", title: "牵手、性别符号与一整组 Pride 绿灯", period: "2016", category: "公共倡议",
    summary: "特拉法加广场周边约五十盏行人灯曾换上七种多元关系与性别图形。",
    detail: "这批图形由 TfL 内部设计，以牵手组合和跨性别符号替换熟悉的绿色行人，作为 Pride in London 的城市公共表达。",
    image: "/map-signals/london-pride-signals.jpg", credit: "DAVID HOLT · CC BY 2.0", sourceUrl: "https://www.london.gov.uk/press-releases/mayoral/diversity-pedestrian-traffic-signals", cityId: "london", focalPoint: "52% 45%", thumbnailZoom: 1.16,
  },
  {
    id: "edinburgh-pride", city: "爱丁堡", country: "英国", title: "Pride 游行路线上，绿人变成四种多元关系", period: "2019", category: "公共倡议",
    summary: "Siemens Mobility 为爱丁堡 Pride 临时替换了三十五个绿色行人信号图案。",
    detail: "四种图案分别表达 Lesbian、Gay、Trans 与异性关系；它们只在游行道路封闭期间展示，并非城市常设交通标准。",
    image: "/map-signals/edinburgh-pride-signal.jpg", credit: "Siemens Mobility media image · 发布前复核", sourceUrl: "https://news.siemens.co.uk/news/siemens-mobility-unveils-diversity-pedestrian-traffic-signals-for-edinburgh-pride", code: "EDI", english: "EDINBURGH", lat: 55.9533, lon: -3.1883, focalPoint: "50% 38%", thumbnailZoom: 1.34,
  },
  {
    id: "trier-marx", city: "特里尔", country: "德国", title: "Karl Marx 抱着书走过自己的出生地", period: "2018—至今", category: "文化角色",
    summary: "红灯里的 Marx 张开双臂，绿灯里的他留着长须、夹着书大步前进。",
    detail: "特里尔为 Marx 二百周年制作了这套 LED 图形，并把它安装在雕像与 Karl-Marx-Haus 附近的路口。",
    image: "/map-signals/trier-karl-marx.jpg", credit: "Leiflive · CC BY-SA 4.0", sourceUrl: "https://www.trier.de/aktuelles/nachrichten/13326.Mit-Marx-gehen-und-stehen.html", code: "TRI", english: "TRIER", lat: 49.7499, lon: 6.6371, focalPoint: "56% 52%", thumbnailZoom: 1.2,
  },
  {
    id: "wellington-carmen", city: "惠灵顿", country: "新西兰", title: "Carmen Rupe 在彩虹街区继续迈步", period: "2016—至今", category: "公共倡议",
    summary: "惠灵顿把本地跨性别表演者与活动家 Carmen Rupe 的轮廓放进 Cuba Street 周边信号灯。",
    detail: "同一套城市人物计划还包括 Kate Sheppard 与 John Plimmer，让不同历史人物在各自关联的街区指引行人。",
    image: "/map-signals/wellington-carmen.jpg", credit: "Gwcreative · CC BY 4.0", sourceUrl: "https://wellington.govt.nz/-/media/your-council/plans-policies-and-bylaws/plans-and-policies/annualreport/2015-16/wcc-annual-report-2015-16.pdf", code: "WLG", english: "WELLINGTON", lat: -41.2866, lon: 174.7756, focalPoint: "50% 49%", thumbnailZoom: 1.26,
  },
  {
    id: "hameln-pied-piper", city: "哈默尔恩", country: "德国", title: "吹笛人领着行人穿过故事发生的城市", period: "2019—至今", category: "文化角色",
    summary: "绿色行人披着斗篷、戴羽毛帽并吹着笛子，直接变成哈默尔恩最著名的传说角色。",
    detail: "城市在获得交通主管部门认可后使用更大的灯面，让吹笛人的姿态仍能被明确理解为正在行走。",
    image: "/map-signals/hameln-pied-piper.jpg", credit: "Axel Hindemith · CC BY-SA 3.0", sourceUrl: "https://www.hameln.de/de/buergerservice-verwaltung/die-stadtverwaltung/pressemitteilungen-und-kontakt/stadt-buerger/rattenfaengerampel-an-der-rathausquere-in-betrieb", code: "HML", english: "HAMELN", lat: 52.1083, lon: 9.3622, focalPoint: "50% 50%", thumbnailZoom: 1.08,
  },
];

const tracedSignalAssets: Record<string, { src:string; label:string }> = {
  "utrecht-miffy": { src:"/characters/utrecht-miffy-led.svg", label:"米菲兔真实红色 LED 剪影" },
  "mainz-det": { src:"/characters/mainz-det-led.svg", label:"Mainzelmännchen Det 真实青色 LED 剪影" },
  "munich-pumuckl": { src:"/characters/munich-pumuckl-led.svg", label:"Pumuckl 真实绿色 LED 剪影" },
};

const catalogCitySeeds = [
  ["kualalumpur","吉隆坡","KUALA LUMPUR","马来西亚","KUL",3.139,101.6869],
  ["jakarta","雅加达","JAKARTA","印度尼西亚","JKT",-6.2088,106.8456],
  ["manila","马尼拉","MANILA","菲律宾","MNL",14.5995,120.9842],
  ["hanoi","河内","HANOI","越南","HAN",21.0278,105.8342],
  ["hochiminh","胡志明市","HO CHI MINH CITY","越南","SGN",10.8231,106.6297],
  ["delhi","德里","DELHI","印度","DEL",28.6139,77.209],
  ["mumbai","孟买","MUMBAI","印度","BOM",19.076,72.8777],
  ["bengaluru","班加罗尔","BENGALURU","印度","BLR",12.9716,77.5946],
  ["kolkata","加尔各答","KOLKATA","印度","CCU",22.5726,88.3639],
  ["kathmandu","加德满都","KATHMANDU","尼泊尔","KTM",27.7172,85.324],
  ["dubai","迪拜","DUBAI","阿联酋","DXB",25.2048,55.2708],
  ["abudhabi","阿布扎比","ABU DHABI","阿联酋","AUH",24.4539,54.3773],
  ["doha","多哈","DOHA","卡塔尔","DOH",25.2854,51.531],
  ["madrid","马德里","MADRID","西班牙","MAD",40.4168,-3.7038],
  ["barcelona","巴塞罗那","BARCELONA","西班牙","BCN",41.3874,2.1686],
  ["rome","罗马","ROME","意大利","ROM",41.9028,12.4964],
  ["milan","米兰","MILAN","意大利","MIL",45.4642,9.19],
  ["brussels","布鲁塞尔","BRUSSELS","比利时","BRU",50.8503,4.3517],
  ["zurich","苏黎世","ZURICH","瑞士","ZRH",47.3769,8.5417],
  ["geneva","日内瓦","GENEVA","瑞士","GVA",46.2044,6.1432],
  ["oslo","奥斯陆","OSLO","挪威","OSL",59.9139,10.7522],
  ["stockholm","斯德哥尔摩","STOCKHOLM","瑞典","STO",59.3293,18.0686],
  ["helsinki","赫尔辛基","HELSINKI","芬兰","HEL",60.1699,24.9384],
  ["dublin","都柏林","DUBLIN","爱尔兰","DUB",53.3498,-6.2603],
  ["warsaw","华沙","WARSAW","波兰","WAW",52.2297,21.0122],
  ["krakow","克拉科夫","KRAKOW","波兰","KRK",50.0647,19.945],
  ["budapest","布达佩斯","BUDAPEST","匈牙利","BUD",47.4979,19.0402],
  ["athens","雅典","ATHENS","希腊","ATH",37.9838,23.7275],
  ["bucharest","布加勒斯特","BUCHAREST","罗马尼亚","BUH",44.4268,26.1025],
  ["sofia","索非亚","SOFIA","保加利亚","SOF",42.6977,23.3219],
  ["belgrade","贝尔格莱德","BELGRADE","塞尔维亚","BEG",44.7866,20.4489],
  ["zagreb","萨格勒布","ZAGREB","克罗地亚","ZAG",45.815,15.9819],
  ["ljubljana","卢布尔雅那","LJUBLJANA","斯洛文尼亚","LJU",46.0569,14.5058],
  ["bratislava","布拉迪斯拉发","BRATISLAVA","斯洛伐克","BTS",48.1486,17.1077],
  ["tallinn","塔林","TALLINN","爱沙尼亚","TLL",59.437,24.7536],
  ["riga","里加","RIGA","拉脱维亚","RIX",56.9496,24.1052],
  ["nairobi","内罗毕","NAIROBI","肯尼亚","NBO",-1.2921,36.8219],
  ["lagos","拉各斯","LAGOS","尼日利亚","LOS",6.5244,3.3792],
  ["accra","阿克拉","ACCRA","加纳","ACC",5.6037,-0.187],
  ["casablanca","卡萨布兰卡","CASABLANCA","摩洛哥","CAS",33.5731,-7.5898],
  ["marrakesh","马拉喀什","MARRAKESH","摩洛哥","RAK",31.6295,-7.9811],
  ["tunis","突尼斯","TUNIS","突尼斯","TUN",36.8065,10.1815],
  ["addisababa","亚的斯亚贝巴","ADDIS ABABA","埃塞俄比亚","ADD",8.9806,38.7578],
  ["johannesburg","约翰内斯堡","JOHANNESBURG","南非","JNB",-26.2041,28.0473],
  ["losangeles","洛杉矶","LOS ANGELES","美国","LAX",34.0522,-118.2437],
  ["sanfrancisco","旧金山","SAN FRANCISCO","美国","SFO",37.7749,-122.4194],
  ["chicago","芝加哥","CHICAGO","美国","CHI",41.8781,-87.6298],
  ["toronto","多伦多","TORONTO","加拿大","YTO",43.6532,-79.3832],
  ["vancouver","温哥华","VANCOUVER","加拿大","YVR",49.2827,-123.1207],
  ["montreal","蒙特利尔","MONTREAL","加拿大","YMQ",45.5019,-73.5674],
  ["havana","哈瓦那","HAVANA","古巴","HAV",23.1136,-82.3666],
  ["bogota","波哥大","BOGOTA","哥伦比亚","BOG",4.711,-74.0721],
  ["lima","利马","LIMA","秘鲁","LIM",-12.0464,-77.0428],
  ["santiago","圣地亚哥","SANTIAGO","智利","SCL",-33.4489,-70.6693],
  ["buenosaires","布宜诺斯艾利斯","BUENOS AIRES","阿根廷","BUE",-34.6037,-58.3816],
  ["riodejaneiro","里约热内卢","RIO DE JANEIRO","巴西","RIO",-22.9068,-43.1729],
  ["melbourne","墨尔本","MELBOURNE","澳大利亚","MEL",-37.8136,144.9631],
  ["brisbane","布里斯班","BRISBANE","澳大利亚","BNE",-27.4698,153.0251],
  ["auckland","奥克兰","AUCKLAND","新西兰","AKL",-36.8509,174.7645],
  ["perth","珀斯","PERTH","澳大利亚","PER",-31.9523,115.8613],
  ["reykjavik","雷克雅未克","REYKJAVIK","冰岛","REK",64.1466,-21.9426],
] as const;

const catalogCityDetails: Record<string,Partial<CatalogCity>> = {
  kathmandu: {
    image:"/map-signals/city-references/nepal-traffic-signal-sign.svg", sourceUrl:"https://commons.wikimedia.org/wiki/File:Nepal_road_sign_B17.svg", credit:"Nepali Department of Roads · Public Domain",
    note:"加德满都暂时没有找到许可清楚、能看见灯箱人物的街头近照。这里先放入尼泊尔道路部门《Traffic Signs Manual》里的‘前方交通信号’官方图形，明确标作国家规范参照，而不是城市小人。", referenceScope:"country",
  },
  doha: {
    image:"/map-signals/city-references/qatar-traffic-signal-sign.png", sourceUrl:"https://commons.wikimedia.org/wiki/File:QA_road_sign_W405.svg", credit:"State of Qatar Ministry of Transport · Public Domain",
    note:"多哈暂以卡塔尔交通控制手册中的‘前方交通信号’官方图形补位。它能确认当地规范，但不是行人灯实拍；城市小人仍保留为继续采集项。", referenceScope:"country",
  },
  budapest: {
    image:"/map-signals/city-references/budapest-pedestrian-signal.jpg", sourceUrl:"https://commons.wikimedia.org/wiki/File:Budapest_78-as_trolibusz.jpg", credit:"Patrick Nouhailler · CC BY-SA 2.0",
    note:"布达佩斯 78 路无轨电车旁拍到了当地行人信号。小人不是极近景，但城市、路口与许可都明确，因此可以作为同城实证继续核对。", referenceScope:"city",
  },
  bucharest: {
    image:"/map-signals/city-references/bucharest-first-traffic-light.jpg", sourceUrl:"https://commons.wikimedia.org/wiki/File:Nicolae_Ionescu_-_The_First_Electric_Traffic_Light_in_Bucharest.jpg", credit:"Nicolae Ionescu · Public Domain",
    note:"布加勒斯特先从城市信号史里出现：这张 1923—1935 年间的照片记录了当地第一座电动交通灯。它不是今天的行人小人，却是一份很有分量的城市档案。", referenceScope:"supplementary",
  },
  bratislava: {
    image:"/map-signals/city-references/bratislava-traffic-signal.jpg", sourceUrl:"https://commons.wikimedia.org/wiki/File:Dostojevsk%C3%A9ho_rad,_Bratislava.jpg", credit:"Rudko · Public Domain",
    note:"布拉迪斯拉发 Dostojevského rad 的路口信号与斑马线已找到。照片确认城市现场，灯内人物仍不够清楚，因此只列作交通补充。", referenceScope:"supplementary",
  },
  tallinn: {
    image:"/map-signals/city-references/tallinn-traffic-signal.jpg", sourceUrl:"https://commons.wikimedia.org/wiki/File:Improperly_adjusted_traffic_signals_in_Toompuiestee_and_Tehnika_intersection.JPG", credit:"Dmitry G · Public Domain",
    note:"塔林 Toompuiestee 与 Tehnika 路口的交通信号被清楚定位，原照片还记录了不合理的绿灯配时。它先补上城市信号现场，小人近景继续寻找。", referenceScope:"supplementary",
  },
  riga: {
    image:"/map-signals/city-references/riga-pedestrian-signal.jpg", sourceUrl:"https://commons.wikimedia.org/wiki/File:Red_light_in_Riga_(8531746119).jpg", credit:"Guillaume Speurt · CC BY-SA 2.0",
    note:"里加的红灯里不只站着一个人：两枚红色身影并排出现，姿势和灯罩都很清楚。这张图已经足以作为城市行人信号实证与抠图候选。", referenceScope:"city",
  },
  lagos: {
    image:"/map-signals/city-references/lagos-traffic-light.jpg", sourceUrl:"https://commons.wikimedia.org/wiki/File:Traffic_light_showing_how_the_bus_obey_the_light_in_Maryland_Lagos,_Nigeria.jpg", credit:"Olatunbosun Success · CC BY-SA 4.0",
    note:"拉各斯 Maryland 路口的灯、巴士和车流被同一张照片记录下来。它证明这座城市如何使用交通信号，但还不是可提取行人角色的近景。", referenceScope:"supplementary",
  },
  accra: {
    image:"/map-signals/city-references/accra-traffic-light.jpg", sourceUrl:"https://commons.wikimedia.org/wiki/File:AMP_1202.jpg", credit:"Amuzujoe · CC BY-SA 4.0",
    note:"阿克拉 Rawlings Park 的交通灯已在真实街景中找到。信号立在摊贩与车流之间，城市气息很完整；行人灯箱近照仍待补充。", referenceScope:"supplementary",
  },
  casablanca: {
    image:"/map-signals/city-references/morocco-traffic-light.jpg", sourceUrl:"https://commons.wikimedia.org/wiki/File:Traffic_light_Ait_Melloul_2020.jpg", credit:"Abdeaitali · CC BY-SA 4.0",
    note:"卡萨布兰卡暂用摩洛哥 Aït Melloul 的交通信号实拍作为国家参照。来源城市会保留，不会冒充卡萨布兰卡专属灯型。", referenceScope:"country",
  },
  marrakesh: {
    image:"/map-signals/city-references/morocco-traffic-light.jpg", sourceUrl:"https://commons.wikimedia.org/wiki/File:Traffic_light_Ait_Melloul_2020.jpg", credit:"Abdeaitali · CC BY-SA 4.0",
    note:"马拉喀什先接入已核验的摩洛哥交通信号实拍；照片来自 Aït Melloul，只说明国家现场，不虚构城市差异。", referenceScope:"country",
  },
  tunis: {
    image:"/map-signals/city-references/tunisia-traffic-signal.jpg", sourceUrl:"https://commons.wikimedia.org/wiki/File:FEUTN.JPG", credit:"Wikimedia Commons · 开放实拍",
    note:"突尼斯国家档案里找到一组同时包含红色行人与绿色方向信号的灯箱。拍摄城市尚未确认，所以只作国家参照，不直接写成突尼斯市实拍。", referenceScope:"country",
  },
  addisababa: {
    image:"/map-signals/city-references/addis-ababa-traffic-signal.jpg", sourceUrl:"https://commons.wikimedia.org/wiki/File:Addis_Abeba,_Ethiopia.jpg", credit:"Giustino · CC BY 2.0",
    note:"亚的斯亚贝巴 2005 年的街景中已经找到交通信号。灯体距离较远，不适合抠出小人，但足以补上有城市与许可信息的现场证据。", referenceScope:"supplementary",
  },
  jakarta: {
    image:"/characters/jakarta-pedestrian-light.svg",
    sourceUrl:"https://commons.wikimedia.org/wiki/File:JakIcon_Pedestrian_Light.svg",
    credit:"ITDP Indonesia + Transport for Jakarta · Public Domain",
    note:"这不是从街头照片里裁出的小人，而是雅加达公共交通导视规范中正式使用的行人灯图标。它先把城市自己的视觉语言补进地图，现场灯箱近照仍会继续采集。",
    referenceScope:"city",
  },
  kualalumpur: {
    image:"/map-signals/kuala-lumpur-countdown-signal.jpg",
    sourceUrl:"https://commons.wikimedia.org/wiki/File:KLtrafficlight.jpg",
    credit:"Two hundred percent · CC BY-SA 3.0",
    note:"吉隆坡把等绿灯变成一场小小的倒数。数字一格格减少，绿色小人像是在提醒你：别急，属于行人的几秒钟马上就来。",
    referenceScope:"city",
  },
  manila: {
    image:"/map-signals/manila-street-signals.jpg",
    sourceUrl:"https://commons.wikimedia.org/wiki/File:04580jfTaft_Avenue_Pablo_Ocampo_Street_Buildings_Malate_Manilafvf_01.jpg",
    credit:"Judgefloro · Public Domain",
    note:"在马尼拉 Malate，信号灯藏进招牌、电线与不断移动的车流里。我们先记下这个热闹路口，也继续等待一张能与小人正面相遇的近照。",
    referenceScope:"city", evidenceType:"traffic-scene",
  },
  delhi: {
    image:"/map-signals/india-udagamandalam-pedestrian-signal.jpg",
    sourceUrl:"https://commons.wikimedia.org/wiki/File:Pedestrian-Signal-Udagamandalam.jpg",
    credit:"Rsrikanth05 · CC BY-SA 3.0",
    note:"这位印度小人来自山城乌塔卡蒙德，先替我们打开观察印度路口的一扇窗。德里会不会有不同的步伐与声音？那个答案还留给下一次街头相遇。",
    referenceScope:"country",
  },
  madrid: {
    image:"/map-signals/madrid-pride-signal.jpg",
    sourceUrl:"https://commons.wikimedia.org/wiki/File:Gay_themed_pedestrian_traffic_light_on_Plaza_Espana_Madrid.jpg",
    credit:"Szombat78 · CC0",
    note:"马德里把彩虹悄悄放进西班牙广场的过街灯里。它不是每个路口都会出现的日常角色，却让一次普通的绿灯也带上了庆祝的意味。",
    referenceScope:"city",
  },
  barcelona: {
    image:"/map-signals/barcelona-pedestrian-signal.jpg",
    sourceUrl:"https://commons.wikimedia.org/wiki/File:E-Pedestrian_signal_green.JPG",
    credit:"ANKAWÜ · CC BY-SA 3.0",
    note:"巴塞罗那的绿色小人被完整拍进圆形灯罩：点阵颗粒清晰，抬起的腿与前倾身体让一个静止画面也保留了迈步感。",
    referenceScope:"city",
  },
  zurich: {
    image:"/map-signals/lugano-pedestrian-signal.jpg",
    sourceUrl:"https://commons.wikimedia.org/wiki/File:Pedestrian_signal_Switzerland_Lugano_traditional_green_20101231a.jpg",
    credit:"Sir James · CC BY-SA 3.0",
    note:"这位绿色小人来自卢加诺：姿势克制、轮廓清楚，很像瑞士路口安静而准确的节拍。苏黎世是否藏着自己的版本，我们还在沿街寻找。",
    referenceScope:"country",
  },
  geneva: {
    image:"/map-signals/geneva-tram-signal.jpg",
    sourceUrl:"https://commons.wikimedia.org/wiki/File:Gen%C3%A8va_tram_signal_00678_729x1296.jpg",
    credit:"Original mikz · CC BY-SA 4.0",
    note:"日内瓦先派来的是一枚有轨电车信号，而不是行人小人。它像城市交通乐谱里的一个音符；真正属于行人的角色，还在下一座路口等我们。",
    referenceScope:"city", evidenceType:"traffic-scene",
  },
  stockholm: {
    image:"/map-signals/stockholm-same-sex-signals.jpg",
    sourceUrl:"https://commons.wikimedia.org/wiki/File:Same_Sex_Traffic_Lights_Drottninggatan.jpg",
    credit:"Yvwv · CC BY-SA 4.0",
    note:"在斯德哥尔摩 Drottninggatan，绿灯里不再只有一个人，而是一对相伴前行的身影。城市用极小的图形变化，让“谁可以一起走”变得可见。",
    referenceScope:"city",
  },
  dublin: {
    image:"/map-signals/dublin-pedestrian-signal.jpg",
    sourceUrl:"https://commons.wikimedia.org/wiki/File:Traffic_light_modern_version_Ireland_Dublin_1_green_2009-09-27.jpg",
    credit:"Sir James · CC BY-SA 3.0",
    note:"都柏林的小人微微前倾，像是刚听见绿灯便准备迈出去。密密的 LED 留下颗粒感，也让这个寻常动作带着一点旧电子屏的温度。",
    referenceScope:"city",
  },
  milan: {
    image:"/map-signals/milan-pedestrian-signal.jpg",
    sourceUrl:"https://commons.wikimedia.org/wiki/File:Pedestrian_signal_iItaly_milan_green_20101230.JPG",
    credit:"Sir James · CC BY-SA 3.0",
    note:"米兰的绿色小人身形修长，迈步干脆，在圆形灯罩里像一枚正在播放的城市剪影。灯亮起来时，整条街仿佛也跟着向前一步。",
    referenceScope:"city",
  },
  brussels: {
    image:"/map-signals/brussels-crossing-button.jpg",
    sourceUrl:"https://commons.wikimedia.org/wiki/File:Pedestrian_signal_push_button_in_Brussels.jpg",
    credit:"Zorro2212 · CC BY-SA 4.0",
    note:"布鲁塞尔先让我们摸到一枚过街按钮：按下它，人与城市完成一次很小的握手。灯里的角色暂时没有入镜，但交互已经先说了你好。",
    referenceScope:"city", evidenceType:"pedestrian-button",
  },
  athens: {
    image:"/map-signals/athens-crosswalk-button.jpg",
    sourceUrl:"https://commons.wikimedia.org/wiki/File:Crosswalk_button_Athens.jpg",
    credit:"Badseed · CC BY-SA 3.0",
    note:"雅典的过街按钮把希腊语留在手指旁边。游客也许读不懂每个字，却很快会明白这个动作：按一下，然后和整座城市一起等。",
    referenceScope:"city", evidenceType:"pedestrian-button",
  },
  johannesburg: {
    image:"/map-signals/johannesburg-traffic-light.jpg",
    sourceUrl:"https://commons.wikimedia.org/wiki/File:Traffic_light_in_Johannesburg.jpg",
    credit:"Gsalamander · CC BY-SA 4.0",
    note:"约翰内斯堡市中心的信号灯站在宽阔街道与高楼之间，像一位负责分配城市节奏的指挥。行人小人的近照，仍是下一段街头任务。",
    referenceScope:"city", evidenceType:"traffic-scene",
  },
  santiago: {
    image:"/map-signals/santiago-pedestrian-signal.jpg",
    sourceUrl:"https://commons.wikimedia.org/wiki/File:Sem%C3%A1foro_peatonal_Mac_Iver_con_Merced,_Santiago_20200314.jpg",
    credit:"Carlos yo · CC BY-SA 4.0",
    note:"圣地亚哥 Mac Iver 与 Merced 路口的小人被装进深色灯罩，绿色身体在阳光下格外醒目。一个简单迈步，也有安第斯城市明亮的反差。",
    referenceScope:"city",
  },
  buenosaires: {
    image:"/map-signals/buenos-aires-signals.jpg",
    sourceUrl:"https://commons.wikimedia.org/wiki/File:Buenos_Aires_sygnalizatory.jpg",
    credit:"Andrzej Otrębski · CC BY-SA 4.0",
    note:"行人与自行车在同一根灯杆上等绿灯——布宜诺斯艾利斯把两种速度并排放进一个路口，让走路与骑行短暂共享同一拍。",
    referenceScope:"city",
  },
  rome: {
    image:"/map-signals/milan-pedestrian-signal.jpg",
    sourceUrl:"https://commons.wikimedia.org/wiki/File:Pedestrian_signal_iItaly_milan_green_20101230.JPG",
    credit:"Sir James · CC BY-SA 3.0",
    note:"罗马暂时借用已经核验的意大利通用行人灯作为国家参照。它能说明当地制式，但不会冒充罗马街头的城市专属照片。",
    referenceScope:"country",
  },
  warsaw: {
    image:"/map-signals/city-references/warsaw-pedestrian-signal.jpg",
    sourceUrl:"https://commons.wikimedia.org/wiki/File:Warsaw_Gn_4_Aug_2024-004.jpg",
    credit:"Gnangarra · CC BY 2.5 AU",
    note:"华沙的绿色行人小人已经找到城市明确的正面近照。灯内轮廓完整、点阵清楚，来源与许可均可追溯，已进入 SVG 提取候选。",
    referenceScope:"city", evidenceType:"pedestrian-figure",
  },
  krakow: {
    image:"/map-signals/countries/pol-pedestrian-signal.jpg",
    sourceUrl:"https://commons.wikimedia.org/wiki/File:Man_waiting_for_green_traffic_light.jpg",
    credit:"Wikimedia Commons · 开放实拍",
    note:"克拉科夫目前使用波兰行人灯实拍作为国家级参照。相同制式只登记一次来源，不虚构城市差异。",
    referenceScope:"country",
  },
  ljubljana: {
    image:"/map-signals/countries/svn-pedestrian-signal.jpg",
    sourceUrl:"https://commons.wikimedia.org/wiki/File:Downtown_(13045289564).jpg",
    credit:"Rowan Z · CC BY 2.0",
    note:"卢布尔雅那 Slovenska cesta 的红色行人小人已经在城市街景中确认，Commons 也把原图收录进该市行人信号分类。人物距离较远，不适合高精度抠图，但城市对应关系明确。",
    referenceScope:"city", evidenceType:"pedestrian-figure",
  },
  losangeles: {
    image:"/map-signals/city-references/los-angeles-pedestrian-button.jpg", sourceUrl:"https://commons.wikimedia.org/wiki/File:Los_Angeles_pedestrian_crossing_button.jpg", credit:"Downtowngal · CC BY-SA 3.0",
    note:"洛杉矶市名直接印在过街说明牌上，行走小人、红手、倒计时与按钮规则都被完整拍下。它是城市明确的行人交互实证，但不是灯箱小人近照。", referenceScope:"city", evidenceType:"pedestrian-button",
  },
  sanfrancisco: {
    image:"/characters/new-york.svg", sourceUrl:"https://commons.wikimedia.org/wiki/File:MUTCD_Ped_Signal_-_Walk.svg", credit:"US DOT · Public Domain",
    note:"旧金山采用美国 MUTCD WALK 通用图形作为国家参照；城市路口的声音与灯箱外观仍可继续补充。", referenceScope:"country",
  },
  chicago: {
    image:"/map-signals/city-references/chicago-walk-signal.jpg", sourceUrl:"https://commons.wikimedia.org/wiki/File:Walk_textual_pedestrian_signal_(37681061855).jpg", credit:"Eric Fischer · CC BY 2.0",
    note:"芝加哥找到的是老式文字型 WALK 行人信号：城市与许可明确，文字灯本身也是当地过街视觉史的一部分。它不是人物图形，因此单独标作文字信号。", referenceScope:"city", evidenceType:"text-signal",
  },
  toronto: {
    image:"/map-signals/countries/can-pedestrian-signal.jpg", sourceUrl:"https://commons.wikimedia.org/wiki/File:Traffic_Light_Color_Types_and_Stages_-_GREEN_July_4th_2008.JPG", credit:"Cindy Flynn · CC BY 3.0",
    note:"多伦多先使用加拿大绿色行人信号实拍作为国家参照，城市级路口细节继续采集。", referenceScope:"country",
  },
  vancouver: {
    image:"/map-signals/countries/can-pedestrian-signal.jpg", sourceUrl:"https://commons.wikimedia.org/wiki/File:Traffic_Light_Color_Types_and_Stages_-_GREEN_July_4th_2008.JPG", credit:"Cindy Flynn · CC BY 3.0",
    note:"温哥华目前接入加拿大通用行人信号实拍；同制式素材复用，不重复制造差异。", referenceScope:"country",
  },
  montreal: {
    image:"/map-signals/countries/can-pedestrian-signal.jpg", sourceUrl:"https://commons.wikimedia.org/wiki/File:Traffic_Light_Color_Types_and_Stages_-_GREEN_July_4th_2008.JPG", credit:"Cindy Flynn · CC BY 3.0",
    note:"蒙特利尔先以加拿大实拍为国家参照，后续若找到魁北克本地差异再单独替换。", referenceScope:"country",
  },
  riodejaneiro: {
    image:"/map-signals/countries/bra-pedestrian-signal.jpg", sourceUrl:"https://commons.wikimedia.org/wiki/File:Traffic_lights_Sao_Paulo_Brasil.jpg", credit:"Morio · CC BY-SA 3.0",
    note:"里约热内卢暂用已核验的巴西行人信号作为国家参照，不把圣保罗照片误标为里约实拍。", referenceScope:"country",
  },
  melbourne: {
    image:"/map-signals/city-references/melbourne-pedestrian-signal.jpg", sourceUrl:"https://commons.wikimedia.org/wiki/File:Bell_Street_cyclist_signal_and_pedestrian_signal,_Melbourne,_Australia,_August_2024.jpg", credit:"PEPSI697 · CC BY-SA 4.0",
    note:"墨尔本 Bell Street 的自行车与行人信号被放在同一处路口记录。城市、日期和许可明确；人物距离较远，先列为同城交通现场而非可抠图近景。", referenceScope:"city", evidenceType:"traffic-scene",
  },
  brisbane: {
    image:"/map-signals/city-references/brisbane-pedestrian-button.jpg", sourceUrl:"https://commons.wikimedia.org/wiki/File:Pedestrian_signal_push_button_in_Brisbane,_Australia.jpg", credit:"Kgbo · CC BY-SA 4.0",
    note:"布里斯班过街按钮与说明牌同框，红绿人物和闪烁阶段都能直接核对。它补齐了城市交互设备，但灯内 LED 小人仍需近景。", referenceScope:"city", evidenceType:"pedestrian-button",
  },
  perth: {
    image:"/characters/sydney.svg", sourceUrl:"https://commons.wikimedia.org/wiki/File:Australia_-_2_aspect_pedestrian_signal_with_timer.svg", credit:"Wikimedia Commons · CC0",
    note:"珀斯先显示澳大利亚通用行人灯与倒计时矢量，不虚构城市独有造型。", referenceScope:"country",
  },
  auckland: {
    image:"/map-signals/city-references/auckland-pedestrian-button.jpg", sourceUrl:"https://commons.wikimedia.org/wiki/File:Pedestrian_signal_push_button_in_Auckland.jpg", credit:"russellstreet · CC BY-SA 2.0",
    note:"奥克兰的蓝银色过街按钮已经找到城市明确的近照。它呈现当地行人如何向路口发出请求，但并不替代灯箱人物素材。", referenceScope:"city", evidenceType:"pedestrian-button",
  },
  hanoi: {
    image:"/map-signals/city-references/hanoi-traffic-lights.jpg", sourceUrl:"https://commons.wikimedia.org/wiki/File:Hanoi_Vietnam_Waiting-at-the-red-lights-01.jpg", credit:"CEphoto, Uwe Aranas · CC BY-SA 3.0",
    note:"河内路口的真实车辆信号与等灯车流已经找到。照片能确认城市现场，却看不清行人小人，所以先作为交通场景补充，继续寻找灯箱近景。", referenceScope:"supplementary",
  },
  hochiminh: {
    image:"/map-signals/city-references/ho-chi-minh-city-traffic-signal.jpg", sourceUrl:"https://commons.wikimedia.org/wiki/File:Saigon_Traffic_Signal.jpg", credit:"Andrew Crump · CC BY 2.0",
    note:"胡志明市先找到一组会显示摩托车与方向箭头的信号：很有城市交通特征，但它不是行人灯，因此只作为同城交通语言的补充。", referenceScope:"supplementary",
  },
  mumbai: {
    image:"/map-signals/india-udagamandalam-pedestrian-signal.jpg", sourceUrl:"https://commons.wikimedia.org/wiki/File:Pedestrian-Signal-Udagamandalam.jpg", credit:"Rsrikanth05 · CC BY-SA 3.0",
    note:"孟买暂用已核验的印度行人信号实拍作为国家参照；照片来自乌塔卡蒙德，不冒充孟买城市实拍。", referenceScope:"country",
  },
  bengaluru: {
    image:"/map-signals/india-udagamandalam-pedestrian-signal.jpg", sourceUrl:"https://commons.wikimedia.org/wiki/File:Pedestrian-Signal-Udagamandalam.jpg", credit:"Rsrikanth05 · CC BY-SA 3.0",
    note:"班加罗尔先接入印度国家参照。若后续找到本地灯箱姿势、倒计时或声音差异，再替换为城市证据。", referenceScope:"country",
  },
  kolkata: {
    image:"/map-signals/india-udagamandalam-pedestrian-signal.jpg", sourceUrl:"https://commons.wikimedia.org/wiki/File:Pedestrian-Signal-Udagamandalam.jpg", credit:"Rsrikanth05 · CC BY-SA 3.0",
    note:"加尔各答目前展示印度行人信号的已核验实拍，不把相同制式重复包装成城市独有角色。", referenceScope:"country",
  },
  dubai: {
    image:"/map-signals/countries/are-pedestrian-panel.jpg", sourceUrl:"https://commons.wikimedia.org/wiki/File:Dubai_pedestrian_panel.jpg", credit:"Doris Antony · CC BY-SA / GFDL",
    note:"迪拜的行人过街控制面板已经找到。它记录了人如何向路口发出请求，但不是灯箱里的小人，因此归入交互补充。", referenceScope:"supplementary",
  },
  abudhabi: {
    image:"/map-signals/countries/are-pedestrian-panel.jpg", sourceUrl:"https://commons.wikimedia.org/wiki/File:Dubai_pedestrian_panel.jpg", credit:"Doris Antony · CC BY-SA / GFDL",
    note:"阿布扎比暂以迪拜过街控制面板作为阿联酋国家参照；来源城市会明确保留，阿布扎比行人灯仍待近景。", referenceScope:"country",
  },
  oslo: {
    image:"/map-signals/city-references/oslo-traffic-light.jpg", sourceUrl:"https://commons.wikimedia.org/wiki/File:Traffic_light_IMG_5185_oslo.JPG", credit:"Bjoertvedt · CC BY-SA 3.0",
    note:"奥斯陆的车辆信号灯近景已经确认，能看见当地灯体与街道环境；行人小人的正面图仍在寻找，所以先标成交通补充。", referenceScope:"supplementary",
  },
  helsinki: {
    image:"/map-signals/city-references/helsinki-traffic-signals.jpg", sourceUrl:"https://commons.wikimedia.org/wiki/File:General_and_bicycle_traffic_signals_(42051978381).jpg", credit:"Eric Fischer · CC BY 2.0",
    note:"赫尔辛基夜间路口的普通与自行车信号同框出现。这能确认城市现场，但尚不足以提取行人小人轮廓。", referenceScope:"supplementary",
  },
  sofia: {
    image:"/map-signals/city-references/sofia-traffic-signal.jpg", sourceUrl:"https://commons.wikimedia.org/wiki/File:Sofai_Ampel_IMG_3441.JPG", credit:"Wikimedia Commons · 开放实拍",
    note:"索非亚的红、绿行人姿势与倒计时被同一张照片完整记录，已经可以直接核对人物轮廓与灯箱组合。", referenceScope:"city",
  },
  belgrade: {
    image:"/map-signals/city-references/belgrade-traffic-signal.jpg", sourceUrl:"https://commons.wikimedia.org/wiki/File:Semafor_Ustani%C4%8Dka_ulica.jpg", credit:"Srđan Popović · CC BY-SA 4.0",
    note:"贝尔格莱德 Ustanička 街的交通灯与行人过街标志同框。它证明城市路口样貌，但灯内行人小人没有入镜。", referenceScope:"supplementary",
  },
  zagreb: {
    image:"/map-signals/city-references/zagreb-pedestrian-button.jpg", sourceUrl:"https://commons.wikimedia.org/wiki/File:Pedestrian_signal_button,_Zagreb,_2025.jpg", credit:"Hijerovit · CC BY-SA 4.0",
    note:"萨格勒布的黄色过街按钮有凸起手掌与触觉提示；这是行人交互设备近景，不是灯内小人。", referenceScope:"city", evidenceType:"pedestrian-button",
  },
  nairobi: {
    image:"/map-signals/city-references/nairobi-innovative-traffic-light.jpg", sourceUrl:"https://commons.wikimedia.org/wiki/File:Innovative_traffic-light.jpg", credit:"Maker Faire Africa · CC BY 2.0",
    note:"内罗毕出现过一组太阳能交通信号原型，像一件直接长在草地上的机器雕塑。它不是道路中的行人灯，只作为城市创新案例。", referenceScope:"supplementary",
  },
  havana: {
    image:"/map-signals/city-references/havana-pedestrian-signal.jpg", sourceUrl:"https://commons.wikimedia.org/wiki/File:HAV_Traffic_light_in_Havanna_for_pedestrians.jpg", credit:"Sarang · Public Domain",
    note:"哈瓦那的绿色行人小人和倒计时被清楚拍在同一灯箱里：一边迈步，一边把可以通行的剩余秒数直接告诉你。", referenceScope:"city",
  },
  bogota: {
    image:"/map-signals/city-references/bogota-traffic-lights.jpg", sourceUrl:"https://commons.wikimedia.org/wiki/File:Bogot%C3%A1,_sem%C3%A1foros.JPG", credit:"Felipe Restrepo Acosta · CC BY-SA",
    note:"波哥大 Chicó Norte 路口的黄色灯杆和成组车辆信号已经找到。行人角色未入镜，因此先保存为城市交通现场。", referenceScope:"supplementary",
  },
  lima: {
    image:"/map-signals/city-references/lima-cycling-signal.jpg", sourceUrl:"https://commons.wikimedia.org/wiki/File:Traffic_Light_in_Lima,_Peru.jpg", credit:"Ianyou78 · CC BY-SA 3.0",
    note:"利马先找到一盏带倒计时的自行车信号。它展示城市如何为另一种移动方式分配时间，但不是行人小人。", referenceScope:"supplementary",
  },
  reykjavik: {
    image:"/map-signals/city-references/akureyri-heart-traffic-light.jpg", sourceUrl:"https://commons.wikimedia.org/wiki/File:Traffic_Light_(52413739830).jpg", credit:"David Stanley · CC BY 2.0",
    note:"这颗红色爱心来自冰岛阿克雷里，而不是雷克雅未克。它作为冰岛特殊信号参照被保留，城市归属不会被混淆。", referenceScope:"country",
  },
};
const catalogCities: CatalogCity[] = catalogCitySeeds.map(([id,city,english,country,code,lat,lon])=>({id,city,english,country,code,lat,lon,...catalogCityDetails[id]}));

const cityIds = Object.keys(cities) as CityId[];
const mapPoints: MapPoint[] = [
  ...cityIds.map((id) => {
    const city = cities[id];
    const story = signalStories.find((item) => item.cityId === id);
    return { id: `city-${id}`, city: city.city, english: city.english, code: city.code, lat: city.lat, lon: city.lon, cityId: id, storyId: story?.id, special: Boolean(story) };
  }),
  ...signalStories.filter((story) => !story.cityId && story.lat !== undefined && story.lon !== undefined).map((story) => ({
    id: `story-${story.id}`, city: story.city, english: story.english ?? story.city, code: story.code ?? "NEW", lat: story.lat!, lon: story.lon!, storyId: story.id, special: true,
  })),
  ...catalogCities.map((city)=>({id:`catalog-${city.id}`,city:city.city,english:city.english,code:city.code,lat:city.lat,lon:city.lon,catalogId:city.id,special:false})),
];
const MAP_POINT_COUNT=mapPoints.length;
const COUNTRY_COUNT=195;
const pointDisplayPriority=(point:MapPoint)=>point.special?5:point.cityId?4:point.catalogId&&catalogCities.find((city)=>city.id===point.catalogId)?.image?3:2;
const selectSemanticPoints=(points:MapPoint[],zoom:number)=>{
  if(zoom>=2.55)return points;
  const scale=Math.pow(Math.max(.78,zoom),1.52);
  const latCell=Math.max(2.35,8.6/scale);
  const lonCell=Math.max(3.1,12.2/scale);
  const occupied=new Set<string>();
  return [...points]
    .sort((a,b)=>pointDisplayPriority(b)-pointDisplayPriority(a)||a.id.localeCompare(b.id))
    .filter((point)=>{
      const key=`${Math.floor((point.lat+90)/latCell)}:${Math.floor((point.lon+180)/lonCell)}`;
      if(occupied.has(key))return false;
      occupied.add(key);
      return true;
    });
};
const focusRegionDefinitions=[
  {id:"europe",name:"欧洲街角",english:"EUROPEAN CORNERS",minLat:34,maxLat:72,minLon:-13,maxLon:45},
  {id:"east-asia",name:"东亚路口",english:"EAST ASIA CROSSINGS",minLat:18,maxLat:56,minLon:100,maxLon:150},
  {id:"southeast-asia",name:"南洋路口",english:"SOUTHEAST ASIA",minLat:-13,maxLat:24,minLon:90,maxLon:145},
  {id:"north-america-east",name:"北美东岸",english:"EASTERN NORTH AMERICA",minLat:23,maxLat:62,minLon:-102,maxLon:-50},
  {id:"north-america-west",name:"北美西岸",english:"WESTERN NORTH AMERICA",minLat:18,maxLat:72,minLon:-175,maxLon:-102},
  {id:"south-america",name:"南美街角",english:"SOUTH AMERICA",minLat:-58,maxLat:18,minLon:-92,maxLon:-30},
  {id:"africa",name:"非洲路口",english:"AFRICAN CROSSINGS",minLat:-39,maxLat:38,minLon:-20,maxLon:55},
  {id:"middle-east",name:"西亚与中亚",english:"WEST & CENTRAL ASIA",minLat:18,maxLat:58,minLon:35,maxLon:100},
  {id:"oceania",name:"大洋洲路口",english:"OCEANIA",minLat:-50,maxLat:2,minLon:108,maxLon:180},
] as const;
const pointDistance=(first:MapPoint,second:MapPoint)=>{
  const averageLat=(first.lat+second.lat)/2*Math.PI/180;
  const lonDistance=(first.lon-second.lon)*Math.cos(averageLat);
  return Math.hypot(first.lat-second.lat,lonDistance);
};
const createFocusRegion=(seed:MapPoint):FocusRegion=>{
  const definition=focusRegionDefinitions.find((region)=>seed.lat>=region.minLat&&seed.lat<=region.maxLat&&seed.lon>=region.minLon&&seed.lon<=region.maxLon);
  const regionalPoints=definition?mapPoints.filter((point)=>point.lat>=definition.minLat&&point.lat<=definition.maxLat&&point.lon>=definition.minLon&&point.lon<=definition.maxLon):[];
  const nearbyPoints=[...mapPoints].sort((a,b)=>pointDistance(seed,a)-pointDistance(seed,b)||b.lat-a.lat||a.lon-b.lon||a.id.localeCompare(b.id));
  const regionPool=regionalPoints.length>=3?[...regionalPoints]:nearbyPoints.filter((point)=>pointDistance(seed,point)<=18);
  const points=regionPool
    .sort((a,b)=>b.lat-a.lat||a.lon-b.lon||a.city.localeCompare(b.city,"zh-CN"));
  const pointIds=(points.length?points:nearbyPoints.slice(0,6)).map((point)=>point.id);
  const included=mapPoints.filter((point)=>pointIds.includes(point.id));
  const specialCount=included.filter((point)=>point.special).length;
  const evidenceCount=included.filter((point)=>point.storyId||point.cityId||catalogCities.find((city)=>city.id===point.catalogId)?.image).length;
  return{id:definition?.id??`near-${seed.id}`,name:definition?.name??`${seed.city}附近`,english:definition?.english??"NEARBY CROSSINGS",focusCity:seed.city,focusCode:seed.code,seedPointId:seed.id,centerLat:seed.lat,centerLon:seed.lon,pointIds,totalCount:included.length,specialCount,evidenceCount};
};
const getPointCountry=(point:MapPoint)=>point.cityId?cities[point.cityId].country:point.storyId?signalStories.find((story)=>story.id===point.storyId)?.country??"":catalogCities.find((city)=>city.id===point.catalogId)?.country??"";
const catalogEvidenceLabel=(catalog:CatalogCity)=>{
  const labels:Record<NonNullable<CatalogCity["evidenceType"]>,string>={
    "pedestrian-figure":"城市小人",
    "text-signal":"文字信号",
    "pedestrian-button":"过街按钮",
    "traffic-scene":"城市交通",
    "national-reference":"国家参照",
    "historical":"历史档案",
  };
  if(catalog.evidenceType)return labels[catalog.evidenceType];
  if(catalog.referenceScope==="country")return"国家参照";
  if(catalog.referenceScope==="supplementary")return"交互补充";
  return"城市小人";
};
const getPointStatus=(point:MapPoint)=>{
  if(point.storyId)return"特殊信号";
  if(point.cityId)return"可表演";
  const catalog=catalogCities.find((city)=>city.id===point.catalogId);
  if(!catalog?.image)return"差异待核验";
  return catalogEvidenceLabel(catalog);
};
const mapFeatureCards: MapFeatureCard[] = [
  {pointId:"catalog-dublin",city:"都柏林",image:"/map-signals/dublin-pedestrian-signal.jpg",kicker:"GREEN",offsetX:-66,offsetY:-62,rotate:-4},
  {pointId:"catalog-madrid",city:"马德里",image:"/map-signals/madrid-pride-signal.jpg",kicker:"PRIDE",offsetX:64,offsetY:-58,rotate:4},
  {pointId:"city-taipei",city:"台北",image:"/map-signals/taipei-little-green-man.jpg",kicker:"XIAOLÜREN",offsetX:58,offsetY:-68,rotate:3},
  {pointId:"catalog-kualalumpur",city:"吉隆坡",image:"/map-signals/kuala-lumpur-countdown-signal.jpg",kicker:"COUNTDOWN",offsetX:68,offsetY:52,rotate:4},
  {pointId:"story-wellington-carmen",city:"惠灵顿",image:"/map-signals/wellington-carmen.jpg",kicker:"CARMEN",offsetX:-58,offsetY:-62,rotate:-3},
  {pointId:"catalog-buenosaires",city:"布宜诺斯艾利斯",image:"/map-signals/buenos-aires-signals.jpg",kicker:"WALK+CYCLE",offsetX:-66,offsetY:54,rotate:-3},
  {pointId:"catalog-johannesburg",city:"约翰内斯堡",image:"/map-signals/johannesburg-traffic-light.jpg",kicker:"STREET",offsetX:62,offsetY:58,rotate:3},
];
const ensembleLayout = [
  { left:7, bottom:13, size:66 }, { left:16, bottom:31, size:54 }, { left:25, bottom:17, size:64 }, { left:34, bottom:46, size:45 },
  { left:43, bottom:25, size:58 }, { left:52, bottom:51, size:43 }, { left:61, bottom:14, size:67 }, { left:70, bottom:35, size:52 },
  { left:79, bottom:19, size:63 }, { left:88, bottom:43, size:47 }, { left:11, bottom:56, size:41 }, { left:21, bottom:64, size:37 },
  { left:31, bottom:29, size:55 }, { left:40, bottom:61, size:38 }, { left:49, bottom:11, size:68 }, { left:58, bottom:65, size:37 },
  { left:67, bottom:55, size:41 }, { left:76, bottom:62, size:38 }, { left:86, bottom:27, size:57 }, { left:93, bottom:12, size:65 },
] as const;

export function SignalEarth() {
  const [rotation, setRotation] = useState(88);
  const [tilt, setTilt] = useState(0);
  const [zoom, setZoom] = useState(1.08);
  const [dragging, setDragging] = useState(false);
  const [autoRotate,setAutoRotate]=useState(true);
  const [spotlightPulse,setSpotlightPulse]=useState(0);
  const [selectedCity, setSelectedCity] = useState<CityId | null>(null);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [selectedCatalogId, setSelectedCatalogId] = useState<string | null>(null);
  const [selectedCountry,setSelectedCountry]=useState<CountryCoverage|null>(null);
  const [countryCoverage,setCountryCoverage]=useState<CountryCoverage[]>([]);
  const [phase, setPhase] = useState<PreviewPhase>("preview");
  const [ensemble, setEnsemble] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [groupMove, setGroupMove] = useState<GroupMove>("dance");
  const [collected, setCollected] = useState<Set<CityId>>(new Set());
  const [soundOn, setSoundOn] = useState(false);
  const [soundLayers, setSoundLayers] = useState<Record<SoundLayer, boolean>>({ signal: true, ambient: true, performance: true });
  const [searchTerm,setSearchTerm]=useState("");
  const [fontMode,setFontMode]=useState<FontMode>("trackpad");
  const [focusedRegion,setFocusedRegion]=useState<FocusRegion|null>(null);
  const [guideOpen,setGuideOpen]=useState(false);
  const dragOrigin = useRef<{ x: number; y: number; rotation: number; tilt: number } | null>(null);
  const globeShellRef=useRef<HTMLDivElement|null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRefs = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const clearPointOffsets=useCallback(()=>{
    const shell=globeShellRef.current;
    if(!shell)return;
    shell.querySelectorAll<HTMLElement>("[data-map-point]").forEach((node)=>{
      node.style.removeProperty("--point-x");
      node.style.removeProperty("--point-y");
      node.style.removeProperty("--connector-length");
      node.style.removeProperty("--connector-angle");
      node.dataset.pointX="0";
      node.dataset.pointY="0";
      node.classList.remove("auto-separated","far-separated");
    });
  },[]);
  const closeFocusedRegion=useCallback(()=>setFocusedRegion(null),[]);
  const returnToGlobalView=useCallback(()=>{
    setFocusedRegion(null);
    clearPointOffsets();
    setZoom(1.08);
    setAutoRotate(true);
  },[clearPointOffsets]);
  const focusPointRegion=useCallback((point:MapPoint)=>{
    const region=createFocusRegion(point);
    clearPointOffsets();
    setAutoRotate(false);
    setFocusedRegion(region);
    setRotation(point.lon);
    // Cobe's positive theta turns northern latitudes toward the viewport centre.
    // Using the inverse latitude pushed European cities to the top edge instead.
    setTilt(Math.max(-68,Math.min(68,point.lat)));
    // A focus action owns the zoom level: do not preserve an earlier 272% zoom.
    setZoom(region.totalCount>20?2.08:1.88);
  },[clearPointOffsets]);
  const tone = useCallback((frequency: number, duration = 0.12, layer: SoundLayer = "signal", force = false, volume = 0.05) => {
    if (((!soundOn || !soundLayers[layer]) && !force) || typeof window === "undefined") return;
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = audioContext.current && audioContext.current.state !== "closed" ? audioContext.current : new AudioContextClass();
    audioContext.current = context;
    const startTone = () => {
      if (context.state === "closed") return;
      const now = context.currentTime + 0.012;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = layer === "performance" && frequency < 180 ? "square" : layer === "ambient" ? "sine" : "triangle";
      oscillator.frequency.setValueAtTime(frequency, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      oscillator.connect(gain).connect(context.destination);
      oscillator.addEventListener("ended", () => { oscillator.disconnect(); gain.disconnect(); }, { once: true });
      oscillator.start(now);
      oscillator.stop(now + duration + 0.03);
    };
    if (context.state === "suspended") void context.resume().then(startTone).catch(() => undefined);
    else startTone();
  }, [soundLayers, soundOn]);

  const clearSound = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    timeoutRefs.current.forEach(clearTimeout);
    intervalRef.current = null;
    timeoutRefs.current = [];
  }, []);

  const queueTone = useCallback((frequency: number, delay: number, layer: SoundLayer = "signal", force = false) => {
    timeoutRefs.current.push(setTimeout(() => tone(frequency, 0.1, layer, force), delay));
  }, [tone]);

  const playSignal = useCallback((id: CityId, force = false) => {
    clearSound();
    cities[id].notes.slice(0, 4).forEach((frequency, index) => {
      if (index === 0 && force) tone(frequency, 0.12, "signal", true);
      else queueTone(frequency, index * (id === "taipei" ? 135 : 190), "signal", force);
    });
  }, [clearSound, queueTone, tone]);

  const selectCity = useCallback((id: CityId, preserveFocus = false) => {
    clearSound();
    setAutoRotate(false);
    if(!preserveFocus)closeFocusedRegion();
    clearPointOffsets();
    setEnsemble(false);
    setArchiveOpen(false);
    setSelectedStoryId(null);
    setSelectedCatalogId(null);
    setSelectedCountry(null);
    setSelectedCity(id);
    setPhase("preview");
    setRotation(cities[id].lon);
    setSoundOn(true);
    setSoundLayers((current) => ({ ...current, signal: true }));
    playSignal(id, true);
  }, [clearPointOffsets,clearSound,closeFocusedRegion, playSignal]);

  const selectStory = useCallback((id: string, preserveFocus = false) => {
    const story=signalStories.find((item)=>item.id===id);
    if(!story)return;
    clearSound();
    setAutoRotate(false);
    if(!preserveFocus)closeFocusedRegion();
    clearPointOffsets();
    setSelectedCity(null);
    setSelectedCatalogId(null);
    setSelectedCountry(null);
    setSelectedStoryId(id);
    setArchiveOpen(false);
    setEnsemble(false);
    if(story.lon!==undefined)setRotation(story.lon);
    setSoundOn(true);
    setSoundLayers((current)=>({...current,signal:true}));
    tone(698,.18,"signal",true);
  },[clearPointOffsets,clearSound,closeFocusedRegion,tone]);

  const selectCatalogCity = useCallback((id:string,preserveFocus=false)=>{
    const city=catalogCities.find((item)=>item.id===id);
    if(!city)return;
    clearSound();
    setAutoRotate(false);
    if(!preserveFocus)closeFocusedRegion();
    clearPointOffsets();
    setSelectedCity(null);
    setSelectedStoryId(null);
    setSelectedCountry(null);
    setSelectedCatalogId(id);
    setArchiveOpen(false);
    setEnsemble(false);
    setRotation(city.lon);
    setSoundOn(true);
    tone(523,.14,"signal",true);
  },[clearPointOffsets,clearSound,closeFocusedRegion,tone]);

  const selectCountry=useCallback((country:CountryCoverage)=>{
    clearSound();setSearchTerm("");setAutoRotate(false);closeFocusedRegion();clearPointOffsets();setSelectedCity(null);setSelectedStoryId(null);setSelectedCatalogId(null);setSelectedCountry(country);setArchiveOpen(false);setEnsemble(false);setRotation(country.lon);setTilt(Math.max(-68,Math.min(68,country.lat)));setZoom(1.3);tone(country.status.startsWith("verified")?659:392,.14,"signal",true);
  },[clearPointOffsets,clearSound,closeFocusedRegion,tone]);

  const activatePoint=useCallback((point:MapPoint,preserveFocus=false)=>{
    if(point.cityId)selectCity(point.cityId,preserveFocus);
    else if(point.storyId)selectStory(point.storyId,preserveFocus);
    else if(point.catalogId)selectCatalogCity(point.catalogId,preserveFocus);
  },[selectCatalogCity,selectCity,selectStory]);

  const focusAndActivatePoint=useCallback((point:MapPoint)=>{
    focusPointRegion(point);
    activatePoint(point,true);
  },[activatePoint,focusPointRegion]);

  const locatePoint=useCallback((point:MapPoint)=>{
    setSearchTerm("");
    focusAndActivatePoint(point);
  },[focusAndActivatePoint]);

  useEffect(()=>{fetch("/data/country-coverage.json").then((response)=>response.json()).then((data:CountryCoverage[])=>setCountryCoverage(data)).catch(()=>setCountryCoverage([]));},[]);

  useEffect(()=>{
    if(typeof window==="undefined")return;
    setGuideOpen(!window.localStorage.getItem("signal-earth-guide-seen"));
  },[]);

  const dismissGuide=useCallback(()=>{
    if(typeof window!=="undefined")window.localStorage.setItem("signal-earth-guide-seen","true");
    setGuideOpen(false);
  },[]);

  const finishPerformance = useCallback((id: CityId) => {
    clearSound();
    setPhase("complete");
    setCollected((current) => new Set([...current, id]));
    tone(784, 0.36, "signal", true);
  }, [clearSound, tone]);

  const startPerformance = useCallback(() => {
    if (!selectedCity) return;
    clearSound();
    setPhase("performing");
    const city = cities[selectedCity];
    setSoundOn(true);
    setSoundLayers({ signal: true, ambient: true, performance: true });
    tone(city.notes[0], 0.13, "performance", true, 0.06);
    if (selectedCity === "berlin") {
      let beat = 1;
      intervalRef.current = setInterval(() => {
        tone(city.notes[beat % city.notes.length], 0.09, "performance", true, 0.06);
        beat += 1;
      }, 300);
    } else if (selectedCity === "taipei") {
      [620,1120,1500,1810,2070,2290,2480,2640,2770].forEach((delay, index) => queueTone(city.notes[(index + 1) % city.notes.length], delay, "performance", true));
    } else {
      city.notes.concat(city.notes).slice(1).forEach((frequency, index) => queueTone(frequency, (index + 1) * 390, index % 3 === 0 ? "ambient" : "performance", true));
    }
    timeoutRefs.current.push(setTimeout(() => finishPerformance(selectedCity), city.duration));
  }, [clearSound, finishPerformance, queueTone, selectedCity, tone]);

  const openEnsemble = useCallback(() => {
    clearSound();
    clearPointOffsets();
    closeFocusedRegion();
    setAutoRotate(false);
    setSelectedCity(null);
    setSelectedStoryId(null);
    setSelectedCatalogId(null);
    setSelectedCountry(null);
    setEnsemble(true);
    setArchiveOpen(false);
    setCollected(new Set(cityIds));
    setGroupMove("dance");
    setSoundOn(true);
    [110,392,659,988].forEach((frequency, index) => index === 0 ? tone(frequency, .12, "performance", true) : queueTone(frequency, index * 150, "performance", true));
  }, [clearPointOffsets,clearSound,closeFocusedRegion, queueTone, tone]);

  const changeGroupMove = useCallback((move: GroupMove) => {
    clearSound();
    setGroupMove(move);
    setSoundOn(true);
    const patterns: Record<GroupMove, number[]> = { walk:[392,523,659], dance:[110,440,784,220], spin:[523,659,784,1046] };
    patterns[move].forEach((frequency, index) => index === 0 ? tone(frequency, .12, "performance", true) : queueTone(frequency, index * 150, "performance", true));
  }, [clearSound, queueTone, tone]);

  const toggleSound = useCallback(() => {
    if (soundOn) { clearSound(); setSoundOn(false); void audioContext.current?.suspend(); }
    else { setSoundOn(true); tone(659, 0.16, "signal", true); }
  }, [clearSound, soundOn, tone]);

  const toggleLayer = useCallback((layer: SoundLayer) => {
    const next = !soundLayers[layer];
    setSoundLayers((current) => ({ ...current, [layer]: next }));
    if (next) {
      setSoundOn(true);
      const preview: Record<SoundLayer, number> = { signal: 784, ambient: 392, performance: 110 };
      tone(preview[layer], layer === "ambient" ? 0.5 : 0.22, layer, true, layer === "ambient" ? 0.035 : 0.055);
    }
  }, [soundLayers, tone]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    setAutoRotate(false);
    clearPointOffsets();
    dragOrigin.current = { x: event.clientX, y: event.clientY, rotation, tilt };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  };
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragOrigin.current) {
      setRotation(dragOrigin.current.rotation - (event.clientX - dragOrigin.current.x) * 0.42);
      setTilt(Math.max(-68,Math.min(68,dragOrigin.current.tilt + (event.clientY - dragOrigin.current.y) * 0.3)));
    }
  };
  const stopDragging = () => { dragOrigin.current = null; setDragging(false); };
  const adjustZoom = useCallback((change:number) => {clearPointOffsets();setZoom((current)=>Math.max(.78,Math.min(3.4,Number((current+change).toFixed(2)))));},[clearPointOffsets]);
  const openArchive = useCallback(() => {
    clearSound();
    setAutoRotate(false);
    clearPointOffsets();
    closeFocusedRegion();
    setSelectedCity(null);
    setSelectedStoryId(null);
    setSelectedCatalogId(null);
    setEnsemble(false);
    setArchiveOpen(true);
  }, [clearPointOffsets,clearSound,closeFocusedRegion]);

  useEffect(() => () => { clearSound(); void audioContext.current?.close(); }, [clearSound]);

  useEffect(()=>{
    if(!autoRotate||dragging||ensemble||archiveOpen||selectedCity||selectedStoryId||selectedCatalogId||selectedCountry)return;
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    const timer=window.setInterval(()=>setRotation((current)=>Number(((current+.2)%360).toFixed(3))),80);
    return()=>window.clearInterval(timer);
  },[archiveOpen,autoRotate,dragging,ensemble,selectedCatalogId,selectedCity,selectedCountry,selectedStoryId]);

  useEffect(()=>{
    if(!autoRotate||ensemble||archiveOpen||selectedCity||selectedStoryId||selectedCatalogId||selectedCountry)return;
    const timer=window.setInterval(()=>setSpotlightPulse((current)=>current+1),4400);
    return()=>window.clearInterval(timer);
  },[archiveOpen,autoRotate,ensemble,selectedCatalogId,selectedCity,selectedCountry,selectedStoryId]);

  const normalizedSearch=searchTerm.trim().toLocaleLowerCase();
  const searchResults=normalizedSearch?mapPoints.filter((point)=>[point.city,point.english,point.code,getPointCountry(point)].some((value)=>value.toLocaleLowerCase().includes(normalizedSearch))).slice(0,6):[];
  const countrySearchResults=normalizedSearch?countryCoverage.filter((country)=>[country.country,country.english,country.code,country.code2,country.capital].some((value)=>value.toLocaleLowerCase().includes(normalizedSearch))).filter((country)=>!searchResults.some((point)=>getPointCountry(point)===country.country)).slice(0,Math.max(0,9-searchResults.length)):[];
  const focusedPoints=focusedRegion?focusedRegion.pointIds.map((id)=>mapPoints.find((point)=>point.id===id)).filter((point):point is MapPoint=>Boolean(point)):[];
  const focusedPointIds=new Set(focusedPoints.map((point)=>point.id));
  const selectedPointId=selectedCity?`city-${selectedCity}`:selectedStoryId?`story-${selectedStoryId}`:selectedCatalogId?`catalog-${selectedCatalogId}`:null;
  const semanticPoints=selectSemanticPoints(mapPoints,zoom);
  const selectedPoint=selectedPointId?mapPoints.find((point)=>point.id===selectedPointId):undefined;
  const essentialPoints=[...focusedPoints,...(selectedPoint?[selectedPoint]:[])];
  const visiblePoints=[...semanticPoints,...essentialPoints.filter((point)=>!semanticPoints.some((candidate)=>candidate.id===point.id))];
  const spotlightCandidates=mapFeatureCards.map((card)=>({card,point:mapPoints.find((point)=>point.id===card.pointId)!})).map((entry)=>({...entry,distance:Math.abs(((entry.point.lon-rotation+540)%360)-180)})).filter((entry)=>entry.distance<92).sort((a,b)=>a.distance-b.distance);
  const spotlightCard=spotlightCandidates.length?spotlightCandidates[spotlightPulse%Math.min(spotlightCandidates.length,3)]?.card:null;

  return (
    <main className={`signal-app raw-doodle-ui ${fontMode==="trackpad"?"font-trackpad":"font-fusion"}`}>
      <header className="app-header">
        <div className="brand-cluster">
          <button className="wordmark" type="button" onClick={() => { clearSound(); clearPointOffsets(); closeFocusedRegion(); setSelectedCity(null); setSelectedStoryId(null); setSelectedCatalogId(null); setSelectedCountry(null); setEnsemble(false); setArchiveOpen(false); setAutoRotate(true); }}>
            <img className="traffic-mark-illustration" src="/brand/traffic-light-illustration.png" alt="" aria-hidden="true" />
            <span><small>SIGNAL EARTH · {COUNTRY_COUNT}</small><strong>向左转向右转</strong></span>
          </button>
          <div className="font-switch" aria-label="字体切换">
            <button className={fontMode==="fusion"?"active":""} type="button" aria-pressed={fontMode==="fusion"} onClick={()=>setFontMode("fusion")}>PIXEL</button>
            <button className={fontMode==="trackpad"?"active":""} type="button" aria-pressed={fontMode==="trackpad"} title="切换到 testType trackpad" onClick={()=>setFontMode("trackpad")}>TRACKPAD</button>
            <a href="https://www.notyourtype.nl/typefaces/testtype/" target="_blank" rel="noreferrer" aria-label="前往官网下载 testType trackpad" title="前往官网下载">↗</a>
          </div>
        </div>
        <nav className="main-nav" aria-label="主导航">
          <button className={!ensemble && !archiveOpen ? "active" : ""} type="button" onClick={() => { clearSound(); clearPointOffsets(); closeFocusedRegion(); setSelectedCity(null); setSelectedStoryId(null); setSelectedCatalogId(null); setSelectedCountry(null); setEnsemble(false); setArchiveOpen(false); setAutoRotate(true); }}>地球</button>
          <button className={archiveOpen ? "active" : ""} type="button" onClick={openArchive}>特别信号 <span>{String(signalStories.length).padStart(2,"0")}</span></button>
          <button className={ensemble ? "active" : ""} type="button" onClick={openEnsemble}>全球绿灯 <span>20</span></button>
        </nav>
        <div className="map-search" onPointerDown={(event)=>event.stopPropagation()}>
          <label><span aria-hidden="true">⌕</span><input value={searchTerm} onChange={(event)=>setSearchTerm(event.target.value)} onKeyDown={(event)=>{if(event.key==="Escape")setSearchTerm("")}} placeholder="搜索国家／城市 / COUNTRY / CITY / ISO" aria-label="搜索地图国家或城市" autoComplete="off"/></label>
          {normalizedSearch&&<div className="map-search-results" role="listbox" aria-label="城市与国家搜索结果">
            {searchResults.map((point)=><button key={point.id} type="button" role="option" aria-selected="false" onClick={()=>locatePoint(point)}><i className={point.special?"special":point.catalogId?"collecting":"performance"}/><span><strong>{point.city}</strong><small>{point.code} · {point.english} · {getPointCountry(point)}</small></span><b>{getPointStatus(point)}</b></button>)}
            {countrySearchResults.map((country)=><button key={`country-${country.code}`} type="button" role="option" aria-selected="false" onClick={()=>selectCountry(country)}><i className={country.status.startsWith("verified")?"performance":"collecting"}/><span><strong>{country.country}</strong><small>{country.code} · {country.english} · {country.continent}</small></span><b>{country.status.startsWith("verified")?"已找到":"继续寻找"}</b></button>)}
            {!searchResults.length&&!countrySearchResults.length&&<p>没有匹配地点 / NO MATCH</p>}
          </div>}
        </div>
        <div className="header-tools">
          <button className="guide-toggle" type="button" onClick={()=>setGuideOpen(true)} aria-haspopup="dialog" aria-expanded={guideOpen}>新手指南 <span aria-hidden="true">?</span></button>
          <button className={`sound-toggle ${soundOn ? "on" : ""}`} type="button" onClick={toggleSound} aria-pressed={soundOn}>
            <span aria-hidden="true">{soundOn ? "◖))" : "◖"}</span> SOUND {soundOn ? "ON" : "OFF"}
          </button>
        </div>
      </header>

      {guideOpen&&<aside className="newcomer-guide" role="dialog" aria-modal="false" aria-labelledby="newcomer-guide-title" onPointerDown={(event)=>event.stopPropagation()}>
        <header>
          <span>FIRST SIGNAL / 新手指南</span>
          <button type="button" onClick={dismissGuide} aria-label="关闭新手指南">×</button>
        </header>
        <h2 id="newcomer-guide-title">从一盏灯开始</h2>
        <ol>
          <li><b>01</b><span><strong>拖动地球</strong><small>用鼠标或手指旋转地球；底部的 − / ＋ 只改变缩放。</small></span></li>
          <li><b>02</b><span><strong>点任意圆点</strong><small>城市点会打开故事，国家点则显示当地信号资料的收集状态。</small></span></li>
          <li><b>03</b><span><strong>随时回到全球</strong><small>聚焦某个城市后，点击地图上方的「返回全球视图」即可继续漫游。</small></span></li>
        </ol>
        <footer><small>声音默认关闭，可从右上角随时开启。</small><button type="button" onClick={dismissGuide}>开始探索 ↗</button></footer>
      </aside>}

      <section className={`earth-workspace ${selectedCity || selectedStoryId || selectedCatalogId || selectedCountry ? "has-preview" : ""} ${ensemble ? "is-ensemble" : ""} ${archiveOpen ? "is-archive" : ""}`}>
        <div className="intro-panel">
          <p className="section-code">01 / SIGNAL EARTH</p>
          <h1 className={`lyric lyric-title ${!archiveOpen && !ensemble ? "landing-title" : ""}`}>{archiveOpen ? <>街角很小，<br />故事很大。</> : ensemble ? <>不同方向，<br />同一个绿灯。</> : <><span>Turn left,</span><span>turn right</span></>}</h1>
          <p className="lyric intro-copy">{archiveOpen ? "同样是走与停，有的信号来自官方设计，有的是文化角色，也有艺术家短暂改写的街头规则。" : ensemble ? "二十座城市的角色散布在同一个全球舞台上。" : "世界向左 我们向右"}</p>
          {archiveOpen ? <div className="archive-summary"><strong>{String(signalStories.length).padStart(2,"0")}</strong><span>个真实案例<br />持续补充中</span><button type="button" onClick={() => setArchiveOpen(false)}>返回地球 ↗</button></div> : !ensemble ? <>
            <button className="global-cta" type="button" onClick={openEnsemble}><i />全球绿灯 <span>召集二十座城市</span></button>
            <button className="archive-cta" type="button" onClick={openArchive}><span>特别信号档案</span><small>{String(signalStories.length).padStart(2,"0")} STORIES</small><i>↗</i></button>
            <div className="city-shortcuts">{cityIds.map((id) => <button key={id} className={selectedCity === id ? "active" : ""} type="button" onClick={() => selectCity(id)}><span>{cities[id].code}</span><b>{cities[id].city}</b><i>↗</i></button>)}</div>
          </> : <div className="group-controls">
            <button className={groupMove === "walk" ? "active" : ""} type="button" onClick={() => changeGroupMove("walk")}>一起走路</button>
            <button className={groupMove === "dance" ? "active" : ""} type="button" onClick={() => changeGroupMove("dance")}>一起跳舞</button>
            <button className={groupMove === "spin" ? "active" : ""} type="button" onClick={() => changeGroupMove("spin")}>一起转圈</button>
          </div>}
          <div className="status-row"><span><strong>{archiveOpen ? String(signalStories.length).padStart(2,"0") : COUNTRY_COUNT}</strong>{archiveOpen ? "信号故事" : "国家覆盖"}</span><span><strong>{String(signalStories.length).padStart(2,"0")}</strong>特殊信号</span><span><strong>{String(collected.size).padStart(2,"0")}</strong>已体验</span></div>
        </div>

        <div className={`globe-panel ${dragging ? "dragging" : ""} ${autoRotate ? "auto-rotating" : ""} ${focusedRegion?"region-focused":""}`} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={stopDragging} onPointerCancel={stopDragging} onWheel={(event)=>{event.preventDefault();adjustZoom(event.deltaY>0?-.08:.08)}}>
          {!archiveOpen && <div ref={globeShellRef} className="globe-shell" style={{transform:`scale(${zoom})`}}>
            <CobeGlobe rotation={rotation} tilt={tilt} countries={countryCoverage} />
            {!ensemble&&countryCoverage.map((country,countryIndex)=>{
              const active=selectedCountry?.code===country.code;
              const verified=country.status.startsWith("verified");
              const evidence=verified||country.status==="commons-category"||country.status==="traffic-category";
              return <button key={`country-${country.code}`} data-map-point={`country-${country.code}`} className={`country-map-pin ${verified?"verified":evidence?"evidence":"collecting"} ${active?"active":""} ${focusedRegion?"muted":""}`} style={{positionAnchor:`--cobe-country-${country.code}`,left:"anchor(center)",top:"anchor(center)",opacity:focusedRegion?0:`var(--cobe-visible-country-${country.code},0)`,transform:`translate(-50%,-50%) scale(${Number((1/zoom).toFixed(4))}) scale(var(--cobe-visible-country-${country.code},0))`,"--pin-delay":`${-((countryIndex%23)*.11)}s`} as React.CSSProperties} type="button" onPointerDown={(event)=>event.stopPropagation()} onPointerLeave={(event)=>event.currentTarget.blur()} onClick={()=>selectCountry(country)} aria-label={`查看${country.country}的行人信号收集状态`}><i/><span><strong>{country.country}</strong><small>{country.code} · {country.status.startsWith("verified")?"已找到素材":country.status==="research-needed"?"采集中":"已有线索"}</small></span></button>;
            })}
            {!ensemble&&visiblePoints.map((point,pointIndex)=>{
              const active=point.cityId?selectedCity===point.cityId:point.storyId?selectedStoryId===point.storyId:selectedCatalogId===point.catalogId;
              const visited=point.cityId?collected.has(point.cityId):false;
              const inFocus=focusedPointIds.has(point.id);
              return <button key={point.id} data-map-point={point.id} className={`map-pin cobe-map-pin ${point.catalogId?"catalog-pin":""} ${point.special?"special-pin":""} ${active?"active":""} ${visited?"visited":""} ${inFocus?"focus-anchor":""} ${focusedRegion&&!inFocus?"muted":""} ${focusedRegion?.seedPointId===point.id?"focus-seed":""}`} style={{positionAnchor:`--cobe-${point.id}`,left:"anchor(center)",top:"anchor(center)",opacity:focusedRegion&&!inFocus?0:`var(--cobe-visible-${point.id},0)`,transform:`translate(-50%,-50%) scale(${Number((1/zoom).toFixed(4))}) scale(var(--cobe-visible-${point.id},0))`,"--pin-delay":`${-((pointIndex%19)*.14)}s`} as React.CSSProperties} type="button" onPointerDown={(event)=>event.stopPropagation()} onPointerLeave={(event)=>event.currentTarget.blur()} onClick={()=>focusAndActivatePoint(point)} aria-label={`聚焦并预览${point.city}${point.special?"特殊信号":"红绿灯小人"}`}><i/><span><strong>{point.city}</strong><small>{point.special?`SPECIAL · ${point.code}`:point.english}</small></span></button>;
            })}
            {!ensemble&&!focusedRegion&&zoom<=1.5&&spotlightCard&&[spotlightCard].map((card)=>{
              const point=mapPoints.find((item)=>item.id===card.pointId);
              if(!point)return null;
              return <button key={`${card.pointId}-${spotlightPulse}`} className={`map-feature-card signal-spotlight feature-${point.id}`} style={{positionAnchor:`--cobe-${point.id}`,left:"anchor(center)",top:"anchor(center)",opacity:`var(--cobe-visible-${point.id},0)`,transform:`translate(-50%,-50%) scale(${Number((1/zoom).toFixed(4))}) translate(${card.offsetX}px,${card.offsetY}px) rotate(${card.rotate}deg) scale(var(--cobe-visible-${point.id},0))`} as React.CSSProperties} type="button" onPointerDown={(event)=>event.stopPropagation()} onClick={()=>focusAndActivatePoint(point)} aria-label={`聚焦并查看${card.city}${card.kicker}信号资料`}><em>NOW PASSING</em><img src={card.image} alt="" aria-hidden="true"/><span><strong>{card.city}</strong><small>{card.kicker}</small></span></button>;
            })}
          </div>}
          {!ensemble&&!archiveOpen&&focusedRegion&&<div className="globe-focus-note" onPointerDown={(event)=>event.stopPropagation()}><span><small>{focusedRegion.focusCode} · {focusedRegion.english}</small><strong>{focusedRegion.focusCity}已居中</strong><em>{focusedRegion.name}：{focusedRegion.totalCount} 个城市信号点 · {focusedRegion.specialCount} 个特别信号 · {focusedRegion.evidenceCount} 个已有素材</em></span><button type="button" onClick={returnToGlobalView}>← 返回全球视图</button></div>}
          {!ensemble && !archiveOpen && <div className="globe-controls" onPointerDown={(event)=>event.stopPropagation()}><button className={autoRotate?"active":""} type="button" onClick={()=>{clearPointOffsets();closeFocusedRegion();setAutoRotate((current)=>!current)}} aria-label={autoRotate?"暂停地球自转":"继续地球自转"}>{autoRotate?"Ⅱ":"▶"}</button><button type="button" onClick={() => {clearPointOffsets();closeFocusedRegion();setAutoRotate(false);setRotation((value) => value - 30)}} aria-label="向左旋转地球">←</button><span>{focusedRegion?`${focusedRegion.name} · ${focusedRegion.totalCount} 个信号点`:autoRotate?"自动巡游中 / SIGNALS PASSING":"点击圆点聚焦放大 / 缩放只改变地球"}</span><button type="button" onClick={() => {clearPointOffsets();closeFocusedRegion();setAutoRotate(false);setRotation((value) => value + 30)}} aria-label="向右旋转地球">→</button><i/><button type="button" onClick={() => adjustZoom(-.14)} aria-label="缩小地球">−</button><strong>{Math.round(zoom*100)}%</strong><button type="button" onClick={() => adjustZoom(.14)} aria-label="放大地球">＋</button></div>}
          {ensemble && <EnsembleStage move={groupMove} />}
          {archiveOpen && <SignalArchive onClose={() => setArchiveOpen(false)} onSelectCity={selectCity} onSelectStory={selectStory} />}
        </div>

        {selectedCity && !ensemble && <CityPreview city={cities[selectedCity]} phase={phase} soundLayers={soundLayers}
          onClose={() => { clearSound(); setSelectedCity(null); }} onPlay={startPerformance} onPreviewSound={() => { setSoundOn(true); setSoundLayers((current) => ({ ...current, signal: true })); playSignal(selectedCity, true); }}
          onToggleLayer={toggleLayer} onOpenArchive={openArchive} />}
        {selectedStoryId && !ensemble && <SignalStoryPreview story={signalStories.find((story)=>story.id===selectedStoryId)!} onClose={()=>setSelectedStoryId(null)} onOpenArchive={openArchive} />}
        {selectedCatalogId && !ensemble && <CatalogCityPreview city={catalogCities.find((city)=>city.id===selectedCatalogId)!} onClose={()=>setSelectedCatalogId(null)} onOpenArchive={openArchive} />}
        {selectedCountry && !ensemble && <CountryCoveragePreview country={selectedCountry} onClose={()=>setSelectedCountry(null)} />}
      </section>
      <footer className="app-footer"><span>{fontMode==="trackpad"?"testType trackpad · Xiaoyuan Gao / notyourtypefoundry":"LOCAL PROTOTYPE · NOT DEPLOYED"}</span><span>COBE WEBGL · {COUNTRY_COUNT} COUNTRIES · {MAP_POINT_COUNT} CITY POINTS · {String(signalStories.length).padStart(2,"0")} SPECIAL SIGNALS</span></footer>
    </main>
  );
}

function CobeGlobe({ rotation, tilt, countries }: { rotation: number; tilt: number; countries:CountryCoverage[] }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const globeRef = useRef<Globe | null>(null);
  const rotationRef = useRef({ rotation, tilt });

  useEffect(() => {
    const canvas=canvasRef.current;
    const container=canvas?.parentElement;
    if(!canvas||!container)return;
    const markers: Marker[]=[...countries.map((country)=>({location:[country.lat,country.lon] as [number,number],size:country.status.startsWith("verified") ? .0045 : .0022,id:`country-${country.code}`,color:[0,0,0] as [number,number,number]})),...mapPoints.map((point)=>({
      location:[point.lat,point.lon],
      size:point.catalogId ? .006 : .012,
      id:point.id,
      color:[0,0,0],
    }))];
    const orientation=()=>({
      phi:-Math.PI/2-rotationRef.current.rotation*Math.PI/180,
      theta:rotationRef.current.tilt*Math.PI/180,
    });
    const rect=container.getBoundingClientRect();
    const size=Math.max(1,Math.min(rect.width,rect.height));
    const direction=orientation();
    globeRef.current=createGlobe(canvas,{
      devicePixelRatio:Math.min(window.devicePixelRatio||1,2),
      width:size,
      height:size,
      phi:direction.phi,
      theta:direction.theta,
      dark:0,
      diffuse:1.15,
      scale:1,
      mapSamples:18000,
      mapBrightness:6,
      mapBaseBrightness:0,
      baseColor:[1,1,1],
      markerColor:[0,0,0],
      glowColor:[1,1,1],
      opacity:1,
      offset:[0,0],
      markerElevation:.018,
      markers,
    });
    let primeFrame=0;
    const primeStart=performance.now();
    const primeMapTexture=(now:number)=>{
      const current=orientation();
      globeRef.current?.update({phi:current.phi,theta:current.theta});
      if(now-primeStart<1800)primeFrame=requestAnimationFrame(primeMapTexture);
    };
    primeFrame=requestAnimationFrame(primeMapTexture);
    const observer=new ResizeObserver(()=>{
      const bounds=container.getBoundingClientRect();
      const nextSize=Math.max(1,Math.min(bounds.width,bounds.height));
      globeRef.current?.update({width:nextSize,height:nextSize});
    });
    observer.observe(container);
    return()=>{cancelAnimationFrame(primeFrame);observer.disconnect();globeRef.current?.destroy();globeRef.current=null};
  },[countries]);

  useEffect(()=>{
    rotationRef.current={rotation,tilt};
    globeRef.current?.update({phi:-Math.PI/2-rotation*Math.PI/180,theta:tilt*Math.PI/180});
  },[rotation,tilt]);

  return <canvas ref={canvasRef} className="globe-canvas cobe-canvas" aria-hidden="true" />;
}

function CatalogCityPreview({ city, onClose, onOpenArchive }:{ city:CatalogCity; onClose:()=>void; onOpenArchive:()=>void }) {
  const isCountryReference=city.referenceScope==="country";
  const isSupplementary=city.referenceScope==="supplementary";
  const evidenceLabel=catalogEvidenceLabel(city);
  return <aside className="city-preview catalog-city-preview">
    <header><div><span>{city.country} · {city.code}</span><h2>{city.city}</h2><small>{city.english}</small></div><button type="button" onClick={onClose} aria-label="关闭城市采集预览">×</button></header>
    {city.image?<figure className="catalog-found-photo"><img src={city.image} alt={isCountryReference?`${city.country}已找到的行人交通信号参照`:isSupplementary?`${city.city}已找到的过街交互补充资料`:`${city.city}已找到的${evidenceLabel}资料`}/><figcaption>{evidenceLabel.toUpperCase()} / {evidenceLabel}</figcaption></figure>:<div className="catalog-signal-stage"><div className="catalog-signal-light" aria-hidden="true"><i/><i/><i/></div><span>SIGNAL EXISTS · VERIFYING DIFFERENCE</span><strong>当地有红绿灯<br/>差异素材待核验</strong></div>}
    <div className="preview-copy"><p>{city.note??`地图先为${city.city}留下一盏灯。我们正在等一张能看清当地人物姿势、灯箱细节或提示方式的照片；在那之前，让这个空位继续保持好奇。`}</p>{city.credit&&<small className="source-credit">PHOTO · {city.credit}</small>}<div className="archive-line"><span>LAT {city.lat.toFixed(3)}</span><span>LON {city.lon.toFixed(3)}</span></div>{city.sourceUrl&&<a className="catalog-source-link" href={city.sourceUrl} target="_blank" rel="noreferrer">查看素材来源 ↗</a>}</div>
    <button className="action-button catalog-archive-button" type="button" onClick={onOpenArchive}>先看已核验的特殊信号 <span>↗</span></button>
  </aside>;
}

function CountryCoveragePreview({country,onClose}:{country:CountryCoverage;onClose:()=>void}){
  const labels={"verified-vector":"已找到完整矢量","verified-photo":"已找到实拍","commons-category":"已有行人信号分类，待选图","traffic-category":"已找到交通信号，待找行人小人","traffic-only":"只有交通信号资料","supplementary-only":"只有按钮／补充资料","research-needed":"继续寻找行人信号"};
  const countryAssets:Record<string,string>={DEU:"/characters/berlin-green.svg",JPN:"/characters/tokyo.svg",USA:"/characters/new-york.svg",GBR:"/characters/london.svg",AUS:"/characters/sydney.svg",KOR:"/characters/seoul.svg",AUT:"/signal-sources/vienna-couple.jpg",CZE:"/signal-sources/prague-ztohoven.jpg",IRL:"/map-signals/dublin-pedestrian-signal.jpg",ITA:"/map-signals/milan-pedestrian-signal.jpg",MYS:"/map-signals/kuala-lumpur-countdown-signal.jpg",IND:"/map-signals/india-udagamandalam-pedestrian-signal.jpg",CHE:"/map-signals/lugano-pedestrian-signal.jpg",ESP:"/map-signals/madrid-pride-signal.jpg",CHL:"/map-signals/santiago-pedestrian-signal.jpg",ARG:"/map-signals/buenos-aires-signals.jpg",NZL:"/map-signals/wellington-carmen.jpg",ZAF:"/map-signals/countries/south-africa-green-man.jpg",SUR:"/map-signals/countries/suriname-green-paramaribo.jpg",TKM:"/map-signals/countries/turkmenistan-ashgabat.jpg",UZB:"/map-signals/countries/uzbekistan-tashkent-pedestrian.jpg"};
  const evidenceAsset=country.asset.startsWith("photos/countries/")?`/map-signals/countries/${country.asset.split("/").at(-1)}`:undefined;
  const localAsset=countryAssets[country.code]??evidenceAsset;
  return <aside className="city-preview country-coverage-preview"><header><div><span>{country.continent} · {country.code}</span><h2>{country.country}</h2><small>{country.english}</small></div><button type="button" onClick={onClose} aria-label="关闭国家覆盖预览">×</button></header>{localAsset?<figure className="catalog-found-photo"><img src={localAsset} alt={`${country.country}行人信号素材`}/><figcaption>COUNTRY EVIDENCE / 国家证据</figcaption></figure>:<div className="catalog-signal-stage"><div className="catalog-signal-light" aria-hidden="true"><i/><i/><i/></div><span>195 COUNTRY COVERAGE</span><strong>{labels[country.status]}</strong></div>}<div className="preview-copy"><p>{country.note}</p><div className="archive-line"><span>{country.capital}</span><span>{country.code2}</span></div><a className="catalog-source-link" href={country.categoryUrl} target="_blank" rel="noreferrer">继续核对该国素材 ↗</a></div></aside>;
}

function SignalArchive({ onClose, onSelectCity, onSelectStory }: { onClose: () => void; onSelectCity: (city: CityId) => void; onSelectStory: (story: string) => void }) {
  return <section className="signal-archive" onPointerDown={(event) => event.stopPropagation()}>
    <header><div><span>FIELD NOTES / {String(signalStories.length).padStart(2,"0")}</span><h2>特别信号档案</h2><p>不只收集造型，也记录它为什么出现在这条街上。</p></div><button type="button" onClick={onClose} aria-label="关闭特别信号档案">×</button></header>
    <div className="story-grid">{signalStories.map((story, index) => <article className={`story-card story-${story.id}`} key={story.id}>
      <figure><img src={story.image} alt={`${story.city}：${story.title}`} style={{objectPosition:story.focalPoint,"--thumb-zoom":story.thumbnailZoom} as React.CSSProperties} /><figcaption>{String(index + 1).padStart(2, "0")} / {story.period}</figcaption></figure>
      <div className="story-copy"><div className="story-meta"><span>{story.country} · {story.city}</span><b>{story.category}</b></div><h3>{story.title}</h3><p>{story.summary}</p><small>{story.detail}</small><div className="story-actions"><button type="button" onClick={() => story.cityId ? onSelectCity(story.cityId) : onSelectStory(story.id)}>在地球上看它</button><a href={story.sourceUrl} target="_blank" rel="noreferrer">来源 ↗</a></div><em>PHOTO · {story.credit}</em></div>
    </article>)}</div>
  </section>;
}

function SignalStoryPreview({ story, onClose, onOpenArchive }: { story: SignalStory; onClose: () => void; onOpenArchive: () => void }) {
  const [playing,setPlaying]=useState(true);
  const hasTracedAsset=Boolean(tracedSignalAssets[story.id]);
  const hasAnimatedCharacter=hasTracedAsset||story.id==="rotterdam-panda";
  return <aside className="special-preview">
    <header><div><span>{story.country} · {story.code}</span><h2>{story.city}</h2><small>{story.english}</small></div><button type="button" onClick={onClose} aria-label="关闭特殊信号预览">×</button></header>
    <figure><img src={story.image} alt={`${story.city}：${story.title}`} style={{objectPosition:story.focalPoint,"--preview-zoom":Math.max(1,story.thumbnailZoom-.16)} as React.CSSProperties} />{hasAnimatedCharacter&&<TracedSignalCharacter storyId={story.id} playing={playing}/>}<figcaption><b>{story.category}</b><span>{story.period}</span></figcaption></figure>
    <div className="special-preview-copy"><small>{hasTracedAsset?"REAL LED TRACE / 实物 SVG 抠取":hasAnimatedCharacter?"PIXEL INTERPRETATION / 像素演绎":"ARCHIVE PHOTO / 实拍档案"}</small><h3>{story.title}</h3><p>{story.summary}</p><span>{story.detail}</span><em>PHOTO · {story.credit}</em></div>
    <div className={`special-preview-actions ${hasAnimatedCharacter?"":"photo-only"}`}>{hasAnimatedCharacter?<button className={playing?"active":""} type="button" onClick={()=>setPlaying((current)=>!current)}>{playing?"暂停动作":"让它动起来"}</button>:<span className="photo-only-badge">真实案例</span>}<button type="button" onClick={onOpenArchive}>{signalStories.length} 个案例</button><a href={story.sourceUrl} target="_blank" rel="noreferrer">来源 ↗</a></div>
  </aside>;
}

function SpecialPixelCharacter({ storyId, playing }: { storyId: string; playing: boolean }) {
  if(storyId==="utrecht-miffy")return <div className={`special-pixel-character pixel-miffy ${playing?"playing":""}`} aria-label="跳动的米菲兔信号角色"><i className="ear one"/><i className="ear two"/><i className="head"/><i className="eye one"/><i className="eye two"/><i className="mouth"/><i className="body"/><i className="foot one"/><i className="foot two"/></div>;
  if(storyId==="rotterdam-panda")return <div className={`special-pixel-character pixel-paws ${playing?"playing":""}`} aria-label="行走的小红熊猫脚印">{Array.from({length:4},(_,index)=><i key={index}><b/><b/><b/><b/></i>)}</div>;
  return <div className={`special-pixel-character pixel-person ${storyId==="mainz-det"?"pixel-det":"pixel-pumuckl"} ${playing?"playing":""}`} aria-label={`${storyId==="mainz-det"?"行走的 Det":"奔跑的 Pumuckl"}信号角色`}><i className="hair"/><i className="head"/><i className="eye"/><i className="body"/><i className="arm one"/><i className="arm two"/><i className="leg one"/><i className="leg two"/></div>;
}

function TracedSignalCharacter({ storyId, playing }: { storyId: string; playing: boolean }) {
  const asset=tracedSignalAssets[storyId];
  if(!asset)return <SpecialPixelCharacter storyId={storyId} playing={playing}/>;
  return <img className={`traced-signal-character traced-${storyId} ${playing?"playing":""}`} src={asset.src} alt={asset.label} />;
}

function CityPreview({ city, phase, soundLayers, onClose, onPlay, onPreviewSound, onToggleLayer, onOpenArchive }:{ city:City; phase:PreviewPhase; soundLayers:Record<SoundLayer,boolean>; onClose:()=>void; onPlay:()=>void; onPreviewSound:()=>void; onToggleLayer:(layer:SoundLayer)=>void; onOpenArchive:()=>void }) {
  return <aside className={`city-preview city-${city.id} phase-${phase}`} style={{"--city-color":city.color} as React.CSSProperties}>
    <header><div><span>{city.country} · {city.code}</span><h2>{city.city}</h2><small>{city.english}</small></div><button type="button" onClick={onClose} aria-label="关闭城市预览">×</button></header>
    <div className="preview-stage">
      <CityEnvironment city={city.id} />
      <div className="signal-lens"><i />{city.referencePhoto ? <img className="signal-reference-photo" src={city.referencePhoto} alt={`${city.city}真实红绿灯参考`} /> : <CharacterGraphic city={city.id} compact />}<small>{phase === "performing" ? "灯箱已空" : "真实素材"}</small></div>
      <div className="hero-character"><CharacterGraphic city={city.id} /></div>
      {phase === "performing" && <div className="motion-caption"><i /><span>{city.caption}</span></div>}
    </div>
    <div className="preview-copy"><p>{city.action}</p><div className="archive-line"><span>{city.character}</span><small><b>{city.assetKind}</b> · {city.archive}</small></div>{city.referenceCredit && <small className="source-credit">SOURCE · {city.referenceCredit}</small>}<button className="story-link" type="button" onClick={onOpenArchive}>读更多特别信号故事 ↗</button></div>
    <button className="action-button" type="button" onClick={onPlay}>{phase === "performing" ? "正在表演…" : phase === "complete" ? "再来一次" : city.trigger}<span>↗</span></button>
    <div className="sound-console"><button className="replay-sound" type="button" onClick={onPreviewSound}>↻ 重播</button>{(["signal","ambient","performance"] as SoundLayer[]).map((layer)=><button key={layer} className={soundLayers[layer]?"active":""} type="button" aria-pressed={soundLayers[layer]} onClick={()=>onToggleLayer(layer)}><i />{layer==="signal"?"信号":layer==="ambient"?"环境":"表演"}<b>{soundLayers[layer]?"ON":"OFF"}</b></button>)}<small>点击与开始表演会自动重新连接声音 · {city.sound} · 非现场录音</small></div>
  </aside>;
}

function Figure({ city }: { city: CityId }) {
  return <span className={`figure figure-${city}`} aria-label={`${cities[city].city}人物动作占位`}><i className="head"/><i className="body"/><i className="arm arm-one"/><i className="arm arm-two"/><i className="leg leg-one"/><i className="leg leg-two"/></span>;
}

function CharacterGraphic({ city, compact = false }: { city: CityId; compact?: boolean }) {
  const character=cities[city];
  const asset=character.asset;
  if(city==="berlin" || (compact && asset))return <img className="character-svg" src={asset} alt={`${cities[city].city}行人信号人物`} />;
  if(asset && character.heroAsset)return <span className={`source-character source-${character.heroAsset}`}><img src={asset} alt={`${character.city}真实行人信号图形`} /></span>;
  if(city==="vienna")return <span className="vienna-pair"><Figure city={city}/><Figure city={city}/></span>;
  return <Figure city={city}/>;
}

function CityEnvironment({ city }: { city: CityId }) {
  if(city==="berlin")return <div className="berlin-club" aria-hidden="true"><span className="club-light one"/><span className="club-light two"/><span className="speaker left"><i/><i/><i/></span><span className="speaker right"><i/><i/><i/></span><span className="club-floor"/></div>;
  if(city==="shanghai")return <div className="shanghai-city" aria-hidden="true"><span className="river"/><span className="skyline back">{Array.from({length:9},(_,i)=><i key={i}/>)}</span><span className="pearl"><i className="needle"/><i className="orb small"/><i className="orb top"/><i className="orb main"/><i className="leg left"/><i className="leg right"/><i className="base"/></span></div>;
  if(city==="taipei")return <div className="taipei-city" aria-hidden="true"><span className="rain"/><span className="taipei101"><i className="spire"/>{Array.from({length:8},(_,i)=><i className="tier" key={i}/>)}<i className="base"/></span><span className="countdown">09</span></div>;
  if(city==="prague")return <div className="prague-photo-city" aria-hidden="true"><figure className="kafka-photo"><img src="/city-photos/prague-01.jpg" alt=""/><figcaption>KAFKA HEAD · USER PHOTO</figcaption></figure><figure className="freud-photo"><img src="/city-photos/prague-02.jpg" alt=""/><figcaption>HANGING FREUD · USER PHOTO</figcaption></figure><span className="photo-vignette"/></div>;
  if((city==="vienna"||city==="amsterdam"||city==="saopaulo")&&cities[city].referencePhoto)return <div className={`source-photo-city source-photo-${city}`} aria-hidden="true"><img src={cities[city].referencePhoto} alt=""/><span/><small>{cities[city].english} · SIGNAL ARCHIVE</small></div>;
  return <div className={`metro-city metro-${city}`} aria-hidden="true"><span className="metro-skyline">{Array.from({length:10},(_,i)=><i key={i}/>)}</span><span className="metro-landmark"><i/><i/><i/></span><span className="metro-ground"/><span className="metro-weather"/><small>{cities[city].english}</small></div>;
}

function EnsembleStage({ move }: { move: GroupMove }) {
  return <div className={`ensemble-stage move-${move}`}>
    <div className="global-rings" aria-hidden="true"><i/><i/><i/></div>
    <div className="crossing" aria-hidden="true">{Array.from({length:13},(_,i)=><i key={i}/>)}</div>
    {cityIds.map((id,index)=>{const position=ensembleLayout[index];return <div className={`ensemble-character ensemble-${id}`} style={{"--person-color":cities[id].color,"--delay":`${index*-.11}s`,left:`${position.left}%`,bottom:`${position.bottom}%`,width:`${position.size}px`,height:`${Math.round(position.size*1.58)}px`,zIndex:Math.round(100-position.bottom)} as React.CSSProperties} key={id}><CharacterGraphic city={id}/><small>{cities[id].code}</small></div>})}
  </div>;
}
