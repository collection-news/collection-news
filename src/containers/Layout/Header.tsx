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
import Logo from '../../components/Logo'

export const Header = ({
  mediaMeta,
  dropdownShowMainPage,
}: {
  mediaMeta?: MediaMeta
  dropdownShowMainPage: boolean
}) => {
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
          </>
        )}
      </Flex>
    </Box>
  )
}
