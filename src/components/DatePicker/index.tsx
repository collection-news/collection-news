import { Button, Popover, useDisclosure } from '@chakra-ui/react'
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
  const { onOpen, onClose, open } = useDisclosure()
  const [selected, setSelected] = useState<Date | undefined>(undefined)
  const _onSelect: SelectSingleEventHandler = (day, selectedDay, modifiers, e) => {
    onSelect(day, selectedDay, modifiers, e)
    setSelected(day)
    onClose()
  }
  return (
    <Popover.Root
      open={open}
      lazyMount
      closeOnInteractOutside
      closeOnEscape
      onOpenChange={e => {
        if (e.open) {
          onOpen()
        } else {
          onClose()
        }
      }}
    >
      <Popover.Trigger asChild>
        <Button colorPalette="theme" size="sm" borderRadius="sm">
          <AiOutlineCalendar />
          選擇日期
        </Button>
      </Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content borderRadius="sm">
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
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  )
}
