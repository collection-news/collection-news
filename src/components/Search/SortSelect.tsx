import { Button, Menu, MenuButton, MenuItemOption, MenuList, MenuOptionGroup } from '@chakra-ui/react'
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
    <Menu>
      <MenuButton as={Button} size="sm" variant="ghost" rightIcon={<FiChevronDown />}>
        排序: {currentLabel}
      </MenuButton>
      <MenuList>
        <MenuOptionGroup defaultValue={currentRefinement} type="radio" onChange={val => refine(val as string)}>
          <MenuItemOption value={MEILI_INDEX_NAME}>相關度</MenuItemOption>
          <MenuItemOption value={`${MEILI_INDEX_NAME}:publish_ts:desc`}>日期 (新到舊)</MenuItemOption>
          <MenuItemOption value={`${MEILI_INDEX_NAME}:publish_ts:asc`}>日期 (舊到新)</MenuItemOption>
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  )
}
