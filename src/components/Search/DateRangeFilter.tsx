import { Box, Button, Popover } from '@chakra-ui/react'
import { format } from 'date-fns'
import { useState } from 'react'
import { DayPicker, DateRange } from 'react-day-picker'
import { zhTW } from 'react-day-picker/locale'
import classNames from 'react-day-picker/style.module.css'
import { FiChevronDown } from 'react-icons/fi'
import { Configure } from 'react-instantsearch'
import datePickerClasses from '../DatePicker/index.module.css'
import { getDateFromDateParam, getDateParamFromDate } from '../../utils/date'
import { mediaMap } from '../../constants/mediaMeta'

const minStartDay = mediaMap.map(_ => _.range[0]).reduce((prev, curr) => (prev < curr ? prev : curr))
const maxEndDay = mediaMap.map(_ => _.range[1]).reduce((prev, curr) => (prev > curr ? prev : curr))
const [firstDay, lastDay] = [getDateFromDateParam(minStartDay), getDateFromDateParam(maxEndDay)]

const getFilter = (range: DateRange | undefined) => {
  if (!range?.from) return undefined

  const start = getDateParamFromDate(range.from)

  if (range.to) {
    const end = getDateParamFromDate(range.to)
    return `publish_date >= ${start} AND publish_date <= ${end}`
  }

  // Single day or just start selected
  return `publish_date >= ${start}`
}

export const DateRangeFilter = () => {
  const [range, setRange] = useState<DateRange | undefined>()

  const filter = getFilter(range)

  const label = range?.from
    ? `${format(range.from, 'yyyy-MM-dd')} ${range.to ? ` - ${format(range.to, 'yyyy-MM-dd')}` : ''}`
    : '所有日期'

  return (
    <>
      {/* @ts-ignore - filters is a valid parameter for MeiliSearch */}
      {filter && <Configure filters={filter} />}
      <Popover.Root
        lazyMount
        positioning={{
          strategy: 'fixed',
          hideWhenDetached: true,
          placement: 'bottom-start',
        }}
      >
        <Popover.Trigger asChild>
          <Button size="sm" variant="outline">
            日期: {label}
            <FiChevronDown />
          </Button>
        </Popover.Trigger>
        <Popover.Positioner>
          <Popover.Content width="auto" p={0} fontSize="md" lineHeight={1.5} boxShadow="calendar">
            <Popover.Body p={0} display="flex">
              <Box p={2}>
                <DayPicker
                  mode="range"
                  captionLayout="dropdown"
                  navLayout="around"
                  selected={range}
                  onSelect={setRange}
                  locale={zhTW}
                  showOutsideDays
                  startMonth={firstDay}
                  endMonth={lastDay}
                  disabled={[{ before: firstDay }, { after: lastDay }]}
                  classNames={{
                    ...classNames,
                    day: datePickerClasses.day,
                    root: `${classNames.root} ${datePickerClasses.root}`,
                  }}
                />
              </Box>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Root>
    </>
  )
}
