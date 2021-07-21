import _dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

_dayjs.extend(utc)
_dayjs.extend(timezone)

export const dayjs = (...param: Parameters<typeof _dayjs>) => _dayjs(...param).tz('Asia/Hong_Kong')
