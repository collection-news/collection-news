import React from 'react'
import { List } from '@chakra-ui/react'

type Props<T extends {}> = {
  listType: 'ordered' | 'unordered'
  items: T[]
  itemRender: (item: T) => React.ReactNode
}

export const ListBlock = <T extends {}>({ listType, items, itemRender }: Props<T>) => {
  return (
    <List.Root
      as={listType === 'ordered' ? 'ol' : 'ul'}
      listStyleType={listType === 'ordered' ? 'decimal' : 'disc'}
      ms="1em"
    >
      {items.map((item, index) => (
        <List.Item key={index} _marker={{ color: 'inherit' }}>
          {itemRender(item)}
        </List.Item>
      ))}
    </List.Root>
  )
}
