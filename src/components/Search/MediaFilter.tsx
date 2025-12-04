import { Button, Menu, MenuButton, MenuItem, MenuItemOption, MenuList } from '@chakra-ui/react'
import { FiChevronDown } from 'react-icons/fi'
import { useClearRefinements, useRefinementList } from 'react-instantsearch'
import type { TransformItems } from 'instantsearch.js/es/types'
import { RefinementListItem } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { mediaMap } from '../../constants/mediaMeta'

const transformItems: TransformItems<RefinementListItem> = items => {
  return items.map(item => ({
    ...item,
    label: mediaMap.find(_ => _.key === item.value)?.brandName || item.label,
  }))
}

export const MediaFilter = () => {
  const { items, refine } = useRefinementList({ attribute: 'media', transformItems })
  const { refine: clear } = useClearRefinements({ includedAttributes: ['media'] })

  // Assuming 'items' contains values like 'appledaily', 'standnews'
  // If no items selected, it means "All"
  const isAll = items.every(item => !item.isRefined)
  const selectedItems = items.filter(item => item.isRefined)

  const label = isAll ? '媒體: 全部' : `媒體: ${selectedItems.map(i => i.label).join(', ')}`

  return (
    <Menu closeOnSelect={false}>
      <MenuButton as={Button} size="sm" variant="outline" rightIcon={<FiChevronDown />}>
        {label}
      </MenuButton>
      <MenuList>
        <MenuItem onClick={() => clear()}>全部</MenuItem>
        {items.map(item => (
          <MenuItemOption
            key={item.value}
            value={item.value}
            isChecked={item.isRefined}
            onClick={() => refine(item.value)}
          >
            {item.label} ({item.count})
          </MenuItemOption>
        ))}
      </MenuList>
    </Menu>
  )
}
