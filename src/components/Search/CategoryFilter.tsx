import {
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuItemOption,
  MenuList,
  Stack,
} from '@chakra-ui/react'
import { useState } from 'react'
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
    <Menu closeOnSelect={false}>
      <MenuButton as={Button} size="sm" variant="outline" rightIcon={<FiChevronDown />}>
        {label}
      </MenuButton>
      <MenuList
        zIndex={1500}
        maxH="300px" // Limit height since list can be long
        overflowY="auto"
      >
        <Stack px={3} py={2} position="sticky" top={0} bg="white" zIndex={1}>
          <InputGroup size="sm">
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="搜尋分類..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              // Prevent menu usage of arrow keys/enter from hijacking the input
              onKeyDown={e => e.stopPropagation()}
            />
          </InputGroup>
        </Stack>
        <MenuItem onClick={() => clear()}>全部</MenuItem>
        {filteredItems.map(item => (
          <MenuItemOption
            key={item.value}
            value={item.value}
            isChecked={item.isRefined}
            onClick={() => refine(item.value)}
          >
            {categoryMap[item.value] || item.label} ({item.count})
          </MenuItemOption>
        ))}
        {filteredItems.length === 0 && <MenuItem isDisabled>找不到結果</MenuItem>}
      </MenuList>
    </Menu>
  )
}
