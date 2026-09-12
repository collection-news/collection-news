import { Box, Button, Flex, IconButton, Spacer, useDisclosure } from '@chakra-ui/react'
import Link from 'next/link'
import * as React from 'react'
import { BsSearch } from 'react-icons/bs'

import { maxYearForToday } from '../../utils/date'
import { NavDropdown } from '../../components/NavDropdown'
import { MediaMeta } from '../../types/mediaMeta'
import { mediaDescMap } from '../../constants/mediaMeta/desc'
import Logo from '../../components/Logo'
import { SearchModal } from '../../components/Search/SearchModal'
import { LuMenu } from 'react-icons/lu'

export const Header = ({
  mediaMeta,
  showSearch,
  dropdownShowMainPage,
}: {
  mediaMeta?: MediaMeta
  showSearch: boolean
  dropdownShowMainPage: boolean
}) => {
  const searchTrigger = React.useRef<HTMLButtonElement>(null)
  const { open, onOpen, onClose } = useDisclosure()
  return (
    <Box as="header" h="header" bg="theme.500" position="sticky" top="0" zIndex="overlay">
      <Flex align="center" h="full">
        <NavDropdown showMainPage={dropdownShowMainPage}>
          <IconButton aria-label="Menu" colorPalette="theme" size="lg" data-cy="header-nav-btn">
            <LuMenu />
          </IconButton>
        </NavDropdown>
        {mediaMeta && (
          <>
            <IconButton
              aria-label="Media Home"
              colorPalette="theme"
              data-cy="header-media-home-btn"
              paddingLeft={2}
              paddingRight={2}
              asChild
            >
              <Link href={`/${mediaMeta.key}`}>
                <Logo src={mediaDescMap.find(_ => _.key === mediaMeta.key)?.logoFullWhite} />
              </Link>
            </IconButton>
            <Button data-cy="history-btn" colorPalette="theme" asChild>
              <Link
                href={{
                  pathname: '/[media]/history/[year]',
                  query: { media: mediaMeta.key, year: maxYearForToday(mediaMeta.range[1]) },
                }}
              >
                當年今日
              </Link>
            </Button>
          </>
        )}
        <Spacer />
        {showSearch && (
          <>
            <IconButton
              ref={searchTrigger}
              aria-label="Search"
              size="lg"
              colorPalette="theme"
              data-cy="header-search-btn"
              onClick={onOpen}
            >
              <BsSearch />
            </IconButton>
            <SearchModal isOpen={open} onClose={onClose} finalFocusEl={() => searchTrigger.current} />
          </>
        )}
      </Flex>
    </Box>
  )
}
