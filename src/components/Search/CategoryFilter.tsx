import { Button, Input, InputGroup, Menu, Stack } from '@chakra-ui/react'
import { useState } from 'react'
import { MenuTrigger } from '../ui/MenuTrigger'
import { FiChevronDown, FiSearch } from 'react-icons/fi'
import { useClearRefinements, useRefinementList } from 'react-instantsearch'
import { categoryMap } from '../../constants/mediaMeta/categoryMap'

export const CategoryFilter = () => {
  // Use a reasonable limit to get enough categories for client-side filtering
  const { items, refine } = useRefinementList({ attribute: 'category', limit: 100 })
  const { refine: clear } = useClearRefinements({ includedAttributes: ['category'] })
  const [keyword, setKeyword] = useState('')

  const isAll = items.every(item => !item.isRefined)
  const selectedItems = items.filter(item => item.isRefined)

  const label = isAll ? '分類: 全部' : `分類 (${selectedItems.length})`

  // Client-side filter
  // Search against both English key and Chinese label
  const filteredItems = items.filter(item => {
    const displayLabel = categoryMap[item.value] || item.label
    const searchTarget = `${displayLabel} ${item.value}`.toLowerCase()
    return searchTarget.includes(keyword.toLowerCase())
  })

  return (
    <Menu.Root
      positioning={{ strategy: 'fixed', hideWhenDetached: true }}
      lazyMount
      unmountOnExit
      closeOnSelect={false}
    >
      <MenuTrigger>
        <Button size="sm" variant="outline">
          {label}
          <FiChevronDown />
        </Button>
      </MenuTrigger>
      <Menu.Positioner>
        <Menu.Content maxH="300px" overflowY="auto">
          <Stack px={3} py={2} position="sticky" top={0} bg="white" zIndex={1}>
            <InputGroup startElement={<FiSearch />}>
              <Input
                size="sm"
                placeholder="搜尋分類..."
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                // Prevent menu usage of arrow keys/enter from hijacking the input
                onKeyDown={e => {
                  if (e.key !== 'Escape' && e.key !== 'Tab') e.stopPropagation()
                }}
              />
            </InputGroup>
          </Stack>
          <Menu.Item onSelect={() => clear()} value="item-0">
            全部
          </Menu.Item>
          {filteredItems.map(item => (
            <Menu.CheckboxItem
              key={item.value}
              value={item.value}
              checked={item.isRefined}
              onCheckedChange={() => refine(item.value)}
            >
              {categoryMap[item.value] || item.label} ({item.count})
              <Menu.ItemIndicator />
            </Menu.CheckboxItem>
          ))}
          {filteredItems.length === 0 && (
            <Menu.Item disabled value="item-1">
              找不到結果
            </Menu.Item>
          )}
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  )
}
