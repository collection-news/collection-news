import { Button, Menu } from '@chakra-ui/react'
import { MenuTrigger } from '../ui/MenuTrigger'
import { FiChevronDown } from 'react-icons/fi'
import { useSortBy } from 'react-instantsearch'
import { MEILI_INDEX_NAME } from '../../constants/text'

export const SortSelect = () => {
  const { currentRefinement, refine } = useSortBy({
    items: [
      { label: '相關度', value: MEILI_INDEX_NAME },
      { label: '日期 (新到舊)', value: `${MEILI_INDEX_NAME}:publish_ts:desc` },
      { label: '日期 (舊到新)', value: `${MEILI_INDEX_NAME}:publish_ts:asc` },
    ],
  })

  // Find label for current refinement
  const currentLabel =
    currentRefinement === MEILI_INDEX_NAME
      ? '相關度'
      : currentRefinement.includes('desc')
        ? '日期 (新到舊)'
        : '日期 (舊到新)'

  return (
    <Menu.Root positioning={{ strategy: 'fixed', hideWhenDetached: true }} lazyMount unmountOnExit>
      <MenuTrigger>
        <Button size="sm" variant="ghost">
          排序: {currentLabel}
          <FiChevronDown />
        </Button>
      </MenuTrigger>
      <Menu.Positioner>
        <Menu.Content>
          <Menu.RadioItemGroup value={currentRefinement} onValueChange={({ value }) => refine(value)}>
            <Menu.RadioItem value={MEILI_INDEX_NAME}>
              相關度
              <Menu.ItemIndicator />
            </Menu.RadioItem>
            <Menu.RadioItem value={`${MEILI_INDEX_NAME}:publish_ts:desc`}>
              日期 (新到舊)
              <Menu.ItemIndicator />
            </Menu.RadioItem>
            <Menu.RadioItem value={`${MEILI_INDEX_NAME}:publish_ts:asc`}>
              日期 (舊到新)
              <Menu.ItemIndicator />
            </Menu.RadioItem>
          </Menu.RadioItemGroup>
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  )
}
