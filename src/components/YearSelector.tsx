import { Box, Button, HStack, Flex } from '@chakra-ui/react'
import dayjs from 'dayjs'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'
import HScrollBar from './HScrollBar'

type Props = {
  selectedYear: string
  range: [string, string]
}

export const YearSelector = ({ selectedYear, range: [start, end] }: Props) => {
  const { query, pathname } = useRouter()

  const yearList = useMemo(() => {
    const endDayjs = dayjs(end, 'YYYYMMDD')
    const startDayjs = dayjs(start, 'YYYYMMDD')
    const diffYear = endDayjs.diff(startDayjs, 'year')

    return Array.from({ length: diffYear + 1 }).map((_, delta) => `${endDayjs.get('year') - delta}`)
  }, [start, end])

  return (
    <HScrollBar>
      <Flex gap="0" alignItems="center">
        {yearList.map(year => {
          const selected = selectedYear === year
          return (
            <Link key={year} href={{ pathname, query: { ...query, year } }}>
              <Button
                flexShrink={0}
                size={selected ? 'md' : 'sm'}
                bg={selected ? 'theme.500' : ''}
                color={selected ? 'white' : 'gray.400'}
                fontWeight={selected ? 'bold' : 'semibold'}
                _hover={{ color: selected ? 'white' : 'gray.500' }}
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
