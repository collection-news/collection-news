import { Button, Menu } from '@chakra-ui/react'
import { MenuTrigger } from '../ui/MenuTrigger'
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
        <Menu.Content>
          <Menu.Item onSelect={() => clear()} value="item-0">
            全部
          </Menu.Item>
          {items.map(item => (
            <Menu.CheckboxItem
              key={item.value}
              value={item.value}
              checked={item.isRefined}
              onCheckedChange={() => refine(item.value)}
            >
              {item.label} ({item.count})
              <Menu.ItemIndicator />
            </Menu.CheckboxItem>
          ))}
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  )
}
