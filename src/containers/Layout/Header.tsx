import { Box, Button, Flex, IconButton, Spacer } from '@chakra-ui/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import * as React from 'react'

import { mediaType } from '../../constants/mediaType'
import { maxYearForToday } from '../../utils/date'
import logoFull from '../../assets/logoFull.svg'
import Image from 'next/image'

export const Header: React.FC = () => {
  const { query } = useRouter()

  return (
    <Box as="header" h="header" bg="theme.500" position="sticky" top="0" zIndex="overlay">
      <Flex align="center" h="full">
        <Link href="/" passHref>
          <IconButton
            as="a"
            aria-label="Home"
            colorScheme="theme"
            icon={<Image src={logoFull} alt="logo" layout="fill" />}
            h="full"
            data-cy="header-home-btn"
            mx={2}
            w={100}
          />
        </Link>
        <Link
          href={{
            pathname: '/[media]/history/[year]',
            query: { media: query.media || mediaType.APPLE_DAILY, year: maxYearForToday() },
          }}
          passHref
        >
          <Button
            as="a"
            colorScheme="theme"
            _hover={{ bg: 'brand.500', color: 'theme.500' }}
            h="full"
            data-cy="history-btn"
          >
            當年今日
          </Button>
        </Link>
        <Spacer />
        <Link href="/about-us" passHref>
          <Button
            as="a"
            colorScheme="theme"
            _hover={{ bg: 'brand.500', color: 'theme.500' }}
            h="full"
            data-cy="about-us-btn"
          >
            關於
          </Button>
        </Link>
      </Flex>
    </Box>
  )
}
