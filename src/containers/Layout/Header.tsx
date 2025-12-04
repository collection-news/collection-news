import { Box, Button, Flex, IconButton, Spacer, useDisclosure } from '@chakra-ui/react'
import Link from 'next/link'
import * as React from 'react'
import { BsSearch } from 'react-icons/bs'

import { maxYearForToday } from '../../utils/date'
import { HamburgerIcon } from '@chakra-ui/icons'
import { NavDropdown } from '../../components/NavDropdown'
import { MediaMeta } from '../../types/mediaMeta'
import { mediaDescMap } from '../../constants/mediaMeta/desc'
import Logo from '../../components/Logo'
import { SearchModal } from '../../components/Search/SearchModal'

export const Header = ({
  mediaMeta,
  showSearch,
  dropdownShowMainPage,
}: {
  mediaMeta?: MediaMeta
  showSearch: boolean
  dropdownShowMainPage: boolean
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <Box as="header" h="header" bg="theme.500" position="sticky" top="0" zIndex="overlay">
      <Flex align="center" h="full">
        <NavDropdown showMainPage={dropdownShowMainPage}>
          <IconButton
            aria-label="Menu"
            colorScheme="theme"
            icon={<HamburgerIcon />}
            size="lg"
            data-cy="header-nav-btn"
          />
        </NavDropdown>
        {mediaMeta && (
          <>
            <Link href={`/${mediaMeta.key}`}>
              <IconButton
                aria-label="Media Home"
                colorScheme="theme"
                icon={<Logo src={mediaDescMap.find(_ => _.key === mediaMeta.key)?.logoFullWhite} />}
                data-cy="header-media-home-btn"
                paddingLeft={2}
                paddingRight={2}
              />
            </Link>
            <Link
              href={{
                pathname: '/[media]/history/[year]',
                query: { media: mediaMeta.key, year: maxYearForToday(mediaMeta.range[1]) },
              }}
            >
              <Button data-cy="history-btn" colorScheme="theme">
                當年今日
              </Button>
            </Link>
          </>
        )}
        <Spacer />
        {showSearch && (
          <>
            <IconButton
              aria-label="Search"
              icon={<BsSearch />}
              size="lg"
              colorScheme="theme"
              data-cy="header-search-btn"
              onClick={onOpen}
            />
            <SearchModal isOpen={isOpen} onClose={onClose} />
          </>
        )}
      </Flex>
    </Box>
  )
}
