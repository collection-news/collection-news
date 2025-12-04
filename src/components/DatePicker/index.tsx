import { Button, Popover, PopoverContent, PopoverTrigger, useDisclosure } from '@chakra-ui/react'
import { DayPicker, SelectSingleEventHandler } from 'react-day-picker'
import classNames from 'react-day-picker/style.module.css'
import { zhTW } from 'react-day-picker/locale'
import { AiOutlineCalendar } from 'react-icons/ai'
import { useState } from 'react'
import classes from './index.module.css'

type DatePickerProps = {
  onSelect: NonNullable<SelectSingleEventHandler>
  range: [Date, Date]
}

export const DatePicker = ({ onSelect, range: [firstDay, lastDay] }: DatePickerProps) => {
  const { onOpen, onClose, isOpen } = useDisclosure()
  const [selected, setSelected] = useState<Date | undefined>(undefined)
  const _onSelect: SelectSingleEventHandler = (day, selectedDay, modifiers, e) => {
    onSelect(day, selectedDay, modifiers, e)
    setSelected(day)
    onClose()
  }
  return (
    <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose} isLazy closeOnBlur closeOnEsc computePositionOnMount>
      <PopoverTrigger>
        <Button leftIcon={<AiOutlineCalendar />} colorScheme="theme" size="sm" borderRadius="sm">
          選擇日期
        </Button>
      </PopoverTrigger>
      <PopoverContent borderRadius="sm">
        <DayPicker
          selected={selected}
          onSelect={_onSelect}
          defaultMonth={lastDay}
          reverseYears
          showOutsideDays
          locale={zhTW}
          mode="single"
          captionLayout="dropdown"
          navLayout="around"
          startMonth={firstDay}
          endMonth={lastDay}
          disabled={[{ before: firstDay }, { after: lastDay }]}
          classNames={{
            ...classNames,
            day: classes.day,
            root: `${classNames.root} ${classes.root}`,
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
