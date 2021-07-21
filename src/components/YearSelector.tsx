import { Box, Button, HStack, Flex } from '@chakra-ui/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'
import HScrollBar from './HScrollBar'

// Generate string array ["2021", "2020", ..., 19 years ago]
const yearList = Array.from({ length: 20 }).map((_, delta) => `${2021 - delta}`)

export const YearSelector = () => {
  const { query, pathname } = useRouter()

  const selectedYear = query.year as string
  return (
    <HScrollBar>
      <Flex spacing="0" alignItems="center">
        {yearList.map(year => {
          const selected = selectedYear === year
          return (
            <Link key={year} href={{ pathname, query: { ...query, year } }} passHref>
              <Button
                flexShrink={0}
                size={selected ? 'md' : 'sm'}
                bg={selected ? 'theme.500' : ''}
                color={selected ? 'white' : 'gray.400'}
                fontWeight={selected ? 'bold' : 'semibold'}
                _hover={{ color: selected ? 'white' : 'gray.500' }}
                as="a"
                my={2}
                borderRadius="sm"
              >
                {year}
              </Button>
            </Link>
          )
        })}
      </Flex>
    </HScrollBar>
  )
}
