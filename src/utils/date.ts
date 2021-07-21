import { lastDayOfAppleDaily } from '../constants'
import { dayjs } from './dayjs'

export function getTodayOfTheHistory(year: string): string {
  return dayjs()
    .year(+year)
    .format('YYYYMMDD')
}

export function maxYearForToday(): number {
  return dayjs().year(2021).isAfter(getDate(lastDayOfAppleDaily)) ? 2020 : 2021
}

export function getDateParamFromDate(date: Date | string): string {
  return dayjs(date).format('YYYYMMDD')
}

export function getDateFromDateParam(date: string): Date {
  return getDate(date).toDate()
}

export function getZhFormatFromDateParam(date: string): string {
  return getDate(date).format('YYYY年M月D日')
}

export function getFullFormatFromTs(ts: string): string {
  return dayjs(ts).format('YYYY/MM/DD HH:mm')
}

export function getDate(date: string) {
  return dayjs(date, 'YYYYMMDD')
}

export function getStartEndDateFromYear(year: number) {
  const d = getDate(year + '0101')
  if (year !== 2021) {
    return [d.startOf('year'), d.endOf('year')]
  } else {
    return [d.startOf('year'), getDate(lastDayOfAppleDaily)]
  }
}
