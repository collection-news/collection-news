import { Box, Divider, Flex, Text } from '@chakra-ui/react'
import * as React from 'react'

export const End = () => {
  return (
    <Flex align="center" wrap="nowrap" mb={6} data-cy="article-list-view-ending-block">
      <Divider />
      <Box minWidth="150px">
        <Text align="center" mx="8">
          沒有更多
        </Text>
      </Box>
      <Divider />
    </Flex>
  )
}
