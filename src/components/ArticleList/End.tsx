import { Box, Flex, Text, Separator } from '@chakra-ui/react'
import * as React from 'react'

export const End = () => {
  return (
    <Flex align="center" wrap="nowrap" mb={6} data-cy="article-list-view-ending-block">
      <Separator flex="1" />
      <Box minWidth="150px">
        <Text textAlign="center" mx="8">
          沒有更多
        </Text>
      </Box>
      <Separator flex="1" />
    </Flex>
  )
}
