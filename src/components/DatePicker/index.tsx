import { Button, Popover, PopoverCloseButton, PopoverContent, PopoverTrigger, useDisclosure } from '@chakra-ui/react'
import * as React from 'react'
import { DayPicker, SelectSingleEventHandler } from 'react-day-picker'
import { zhTW } from 'date-fns/locale'
import { AiOutlineCalendar } from 'react-icons/ai'
import classes from './index.module.css'

import 'react-day-picker/dist/style.css'
import colors from '../../theme/foundations/colors'

type DatePickerProps = {
  onSelect: SelectSingleEventHandler
  range: [Date, Date]
}

export const DatePicker = ({ onSelect, range: [firstDay, lastDay] }: DatePickerProps) => {
  const { onOpen, onClose, isOpen } = useDisclosure()
  const _onSelect: SelectSingleEventHandler = (day, selectedDay, modifiers, e) => {
    onSelect(day, selectedDay, modifiers, e)
    onClose()
  }
  return (
    <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose} isLazy closeOnBlur={false} computePositionOnMount>
      <PopoverTrigger>
        <Button leftIcon={<AiOutlineCalendar />} colorScheme="theme" size="sm" borderRadius="sm">
          選擇日期
        </Button>
      </PopoverTrigger>
      <PopoverContent borderRadius="sm" className={classes.wrapper}>
        <PopoverCloseButton />
        <DayPicker
          onSelect={_onSelect}
          defaultMonth={lastDay}
          locale={zhTW}
          mode="single"
          captionLayout="dropdown"
          fromDate={firstDay}
          toDate={lastDay}
          classNames={classes}
          modifiersStyles={{
            selected: { borderRadius: '2px', backgroundColor: colors.theme[500] },
            day: { borderRadius: '2px', backgroundColor: colors.theme[500] },
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
