import React, { useMemo } from 'react'
import { ListItem, OrderedList, UnorderedList } from '@chakra-ui/react'

type Props<T extends {}> = {
  listType: 'ordered' | 'unordered'
  items: T[]
  itemRender: (item: T) => React.ReactNode
}

export const ListBlock = <T extends {}>({ listType, items, itemRender }: Props<T>) => {
  const ListEle = useMemo(() => (listType === 'ordered' ? OrderedList : UnorderedList), [listType])

  return (
    <ListEle>
      {items.map((item, index) => (
        <ListItem key={index}>{itemRender(item)}</ListItem>
      ))}
    </ListEle>
  )
}
