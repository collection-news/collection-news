import { media } from '../../media'
import { MediaMeta } from '../../../types/mediaMeta'

export const appleDaily: MediaMeta = {
  key: media.APPLE_DAILY,
  brandName: '蘋果日報',
  brandNameShorthand: '蘋果',
  range: ['20020101', '20210623'],
  count: 2284437,
  categoryList: [
    { engName: 'unknown', chiName: '未分類', count: 1519487, range: ['20020106', '20210531'] },
    { engName: 'local', chiName: '本地', count: 135770, range: ['20020101', '20210624'] },
    { engName: 'finance', chiName: '金融', count: 108785, range: ['20020101', '20210623'] },
    { engName: 'entertainment', chiName: '娛樂', count: 99361, range: ['20020101', '20210623'] },
    { engName: 'sports', chiName: '體育', count: 90106, range: ['20020101', '20210623'] },
    { engName: 'international', chiName: '國際', count: 58188, range: ['20020101', '20210623'] },
    { engName: 'china', chiName: '中國', count: 50125, range: ['20020101', '20210623'] },
    { engName: 'columnist', chiName: '專欄', count: 24321, range: ['20020101', '20210624'] },
    { engName: 'breaking', chiName: '突發', count: 21808, range: ['20130703', '20210624'] },
    { engName: 'racing', chiName: '賽馬', count: 21613, range: ['20130903', '20210624'] },
    { engName: 'lifestyle', chiName: '生活', count: 19110, range: ['20130418', '20210623'] },
    { engName: 'etw', chiName: '飲食男女', count: 9115, range: ['20111202', '20210623'] },
    { engName: 'special', chiName: '特別', count: 7800, range: ['20020101', '20210624'] },
    { engName: 'food', chiName: '飲食', count: 3685, range: ['20020101', '20210624'] },
    { engName: 'tech', chiName: '科技', count: 2969, range: ['20020101', '20210622'] },
    { engName: 'culture', chiName: '文化', count: 2939, range: ['20020101', '20210624'] },
    { engName: 'skippedHK', chiName: 'skipped-hk', count: 2741, range: ['20140729', '20210507'] },
    { engName: 'travel', chiName: '旅遊', count: 2581, range: ['20020101', '20210615'] },
    { engName: 'news', chiName: '新聞', count: 2239, range: ['20200601', '20210622'] },
    { engName: 'car', chiName: '車', count: 2133, range: ['20020101', '20210621'] },
    { engName: 'opinion', chiName: '意見', count: 1141, range: ['20200601', '20210622'] },
    { engName: 'family', chiName: '家庭', count: 535, range: ['20130703', '20210622'] },
    { engName: 'us', chiName: 'US', count: 452, range: ['20170613', '20210623'] },
    { engName: 'feature', chiName: '專題', count: 80, range: ['20200601', '20210621'] },
    { engName: 'nextplus', chiName: 'NEXT+', count: 77, range: ['20180606', '20190930'] },
    { engName: 'interview', chiName: '訪問', count: 16, range: ['20200618', '20210619'] },
    { engName: 'adfund', chiName: '慈善', count: 15, range: ['20201204', '20210623'] },
    { engName: 'realtime', chiName: '即時', count: 5, range: ['20200911', '20201218'] },
    { engName: 'daily', chiName: '每日', count: 4, range: ['20200813', '20201207'] },
    { engName: 'engNews', chiName: '英文', count: 4, range: ['20200911', '20210312'] },
  ],
}