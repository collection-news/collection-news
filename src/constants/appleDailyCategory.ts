export enum appleDailyCategory {
  UNKNOWN = 'unknown',
  ADFUND = 'adfund',
  BREAKING = 'breaking',
  CAR = 'car',
  CHINA = 'china',
  COLUMNIST = 'columnist',
  CULTURE = 'culture',
  DAILY = 'daily',
  ENG_NEWS = 'engNews',
  ENTERTAINMENT = 'entertainment',
  ETW = 'etw',
  FAMILY = 'family',
  FEATURE = 'feature',
  FINANCE = 'finance',
  FOOD = 'food',
  INTERNATIONAL = 'international',
  INTERVIEW = 'interview',
  LIFESTYLE = 'lifestyle',
  LOCAL = 'local',
  NEWS = 'news',
  NEXT_PLUS = 'nextplus',
  OPINION = 'opinion',
  RACING = 'racing',
  REAL_TIME = 'realtime',
  SKIPPED_HK = 'skippedHK',
  SPECIAL = 'special',
  SPORTS = 'sports',
  TECH = 'tech',
  TRAVEL = 'travel',
  US = 'us',
}

type CategoryMetadata = {
  category: appleDailyCategory
  text: string
  color: string
  lastDay: string
}

export const appleDailyCategoryList: CategoryMetadata[] = [
  // order matters here
  { category: appleDailyCategory.UNKNOWN, text: '未分類', color: 'gray.300', lastDay: '20210623' }, // unknown are the majority of the content: ;
  { category: appleDailyCategory.REAL_TIME, text: '即時', color: 'red.300', lastDay: '20201218' },
  { category: appleDailyCategory.BREAKING, text: '突發', color: 'orange.300', lastDay: '20210623' },
  { category: appleDailyCategory.LOCAL, text: '本地', color: 'yellow.300', lastDay: '20210623' },
  { category: appleDailyCategory.DAILY, text: '每日', color: 'red.300', lastDay: '20201207' },
  { category: appleDailyCategory.NEWS, text: '新聞', color: 'teal.300', lastDay: '20210622' },
  { category: appleDailyCategory.INTERNATIONAL, text: '國際', color: 'purple.300', lastDay: '20210623' },
  { category: appleDailyCategory.CHINA, text: '中國', color: 'green.300', lastDay: '20210623' },
  { category: appleDailyCategory.ENTERTAINMENT, text: '娛樂', color: 'blue.300', lastDay: '20210623' },
  { category: appleDailyCategory.COLUMNIST, text: '專欄', color: 'cyan.300', lastDay: '20210623' },
  { category: appleDailyCategory.CULTURE, text: '文化', color: 'pink.300', lastDay: '20210623' },
  { category: appleDailyCategory.ENG_NEWS, text: '英文', color: 'orange.300', lastDay: '20210312' },
  { category: appleDailyCategory.ETW, text: '飲食男女', color: 'yellow.300', lastDay: '20210623' },
  { category: appleDailyCategory.FAMILY, text: '家庭', color: 'green.300', lastDay: '20210622' },
  { category: appleDailyCategory.FEATURE, text: '專題', color: 'teal.300', lastDay: '20210621' },
  { category: appleDailyCategory.FINANCE, text: '金融', color: 'blue.300', lastDay: '20210623' },
  { category: appleDailyCategory.FOOD, text: '飲食', color: 'cyan.300', lastDay: '20210623' },
  { category: appleDailyCategory.LIFESTYLE, text: '生活', color: 'pink.300', lastDay: '20210623' },
  { category: appleDailyCategory.INTERVIEW, text: '訪問', color: 'red.300', lastDay: '20210619' },
  { category: appleDailyCategory.NEXT_PLUS, text: 'NEXT+', color: 'orange.300', lastDay: '20201001' },
  { category: appleDailyCategory.OPINION, text: '意見', color: 'yellow.300', lastDay: '20210622' },
  { category: appleDailyCategory.RACING, text: '賽馬', color: 'green.300', lastDay: '20210623' },
  { category: appleDailyCategory.SPECIAL, text: '特別', color: 'blue.300', lastDay: '20210623' },
  { category: appleDailyCategory.SPORTS, text: '體育', color: 'cyan.300', lastDay: '20210623' },
  { category: appleDailyCategory.TECH, text: '科技', color: 'purple.300', lastDay: '20210622' },
  { category: appleDailyCategory.TRAVEL, text: '旅遊', color: 'pink.300', lastDay: '20210615' },
  { category: appleDailyCategory.CAR, text: '車', color: 'red.300', lastDay: '20210621' },
  { category: appleDailyCategory.US, text: 'US', color: 'orange.300', lastDay: '20210623' },
  { category: appleDailyCategory.ADFUND, text: '慈善', color: 'yellow.300', lastDay: '20210623' },
  { category: appleDailyCategory.SKIPPED_HK, text: 'skipped-hk', color: 'teal.300', lastDay: '20210507' },
]

export const appleDailyCategoryMap = appleDailyCategoryList.reduce((map, obj) => {
  map[obj.category] = obj
  return map
}, {} as Record<string, CategoryMetadata>)
