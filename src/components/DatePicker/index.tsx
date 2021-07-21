import { Button, Popover, PopoverContent, PopoverTrigger, useDisclosure } from '@chakra-ui/react'
import * as React from 'react'
import { DayPicker, ModifierStatus, SelectSingleEventHandler } from 'react-day-picker'
import { zhTW } from 'date-fns/locale'
import { AiOutlineCalendar } from 'react-icons/ai'
import classes from './index.module.css'

import 'react-day-picker/style.css'
import colors from '../../theme/foundations/colors'

type DatePickerProps = {
  onSelect: SelectSingleEventHandler
  defaultMonth: Date
}

export const DatePicker = ({ onSelect, defaultMonth }: DatePickerProps) => {
  const { onOpen, onClose, isOpen } = useDisclosure()
  const _onSelect = (day: Date | undefined, selectedDay: Date, modifiers: ModifierStatus, e: React.MouseEvent) => {
    onSelect(day, selectedDay, modifiers, e)
    onClose()
  }
  return (
    <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose} isLazy>
      <PopoverTrigger>
        <Button leftIcon={<AiOutlineCalendar />} colorScheme="theme" size="sm" borderRadius="sm">
          選擇日期
        </Button>
      </PopoverTrigger>
      <PopoverContent borderRadius="sm" className={classes.wrapper}>
        <DayPicker
          onSelect={_onSelect}
          defaultMonth={defaultMonth}
          locale={zhTW}
          mode="single"
          captionLayout="dropdown"
          fromDate={new Date(2002, 0, 1)}
          toDate={new Date(2021, 5, 24)}
          classNames={classes}
          modifierStyles={{
            selected: { borderRadius: '2px', backgroundColor: colors.theme[500] },
            day: { borderRadius: '2px', backgroundColor: colors.theme[500] },
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
