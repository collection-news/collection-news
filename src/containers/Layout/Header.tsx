import { Box, Button, Flex, IconButton, Spacer, Link as ChLink } from '@chakra-ui/react'
import Link from 'next/link'
import * as React from 'react'
import Image from 'next/image'
import { BsSearch } from 'react-icons/bs'

import { maxYearForToday } from '../../utils/date'
import { featureFlags } from '../../utils/config'
import { HamburgerIcon } from '@chakra-ui/icons'
import { NavDropdown } from '../../components/NavDropdown'
import { MediaMeta } from '../../types/mediaMeta'
import { mediaDescMap } from '../../constants/mediaMeta/desc'

export const Header = ({
  mediaMeta,
  dropdownShowMainPage,
}: {
  mediaMeta?: MediaMeta
  dropdownShowMainPage: boolean
}) => {
  const showSearch = featureFlags.showSearchBtn
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
            <Link href={`/${mediaMeta.key}`} passHref>
              <IconButton
                as="a"
                aria-label="Media Home"
                colorScheme="theme"
                icon={
                  <Image
                    src={mediaDescMap.find(_ => _.key === mediaMeta.key)?.logoFullWhite}
                    alt="logo"
                    height="48px"
                    width="80px"
                  />
                }
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
              passHref
            >
              <Button as="a" data-cy="history-btn" colorScheme="theme">
                當年今日
              </Button>
            </Link>
          </>
        )}
        <Spacer />
        {showSearch && (
          <ChLink href="/search">
            <IconButton
              aria-label="Search"
              icon={<BsSearch />}
              size="lg"
              colorScheme="theme"
              data-cy="header-search-btn"
            />
          </ChLink>
        )}
      </Flex>
    </Box>
  )
}
