import debounce from 'debounce'
import Link from 'next/link'
import { Box, Button, IconButton, Spacer, Icon } from '@chakra-ui/react'
import { GoHomeFill } from 'react-icons/go'
import { DateRangeFilter } from './DateRangeFilter'
import { MediaFilter } from './MediaFilter'
import { CategoryFilter } from './CategoryFilter'
import { SearchBox } from './SearchBox'
import { SortSelect } from './SortSelect'
import { SearchHelpTips } from './SearchHelpTips'

const queryHook = debounce((query, search) => search(query), 200, { immediate: true })

interface SearchHeaderProps {
  onClose: () => void
  isPageView: boolean
}

export const SearchHeader = ({ onClose, isPageView }: SearchHeaderProps) => {
  return (
    <Box p={4} borderBottomWidth="1px">
      <Box display="flex" alignItems="center" gap={2}>
        <Box flex="1">
          <SearchBox queryHook={queryHook} />
        </Box>
        <SearchHelpTips />
        {!isPageView ? (
          <Button onClick={onClose} display={{ base: 'flex', md: 'none' }} variant="ghost">
            取消
          </Button>
        ) : (
          <Link href="/">
            <IconButton
              aria-label="Home"
              bg="bg.500"
              color="black"
              _hover={{ bg: 'gray.100' }}
              icon={<Icon as={GoHomeFill} />}
            />
          </Link>
        )}
      </Box>
      <Box mt={4} display="flex" gap={2} alignItems="center" flexWrap="wrap">
        <MediaFilter />
        <CategoryFilter />
        <DateRangeFilter />
        <Spacer />
        <SortSelect />
      </Box>
    </Box>
  )
}
