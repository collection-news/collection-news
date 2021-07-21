import { Flex, Button } from '@chakra-ui/react'
import * as React from 'react'

type LoadingProps = {
  isLoading: boolean
  onClick: () => unknown
}

export const Loading = ({ isLoading, onClick }: LoadingProps) => {
  return (
    <Flex data-cy="article-list-view-loading-block" align="center" justify="center">
      <Button colorScheme="theme" isLoading={isLoading} onClick={onClick}>
        F5
      </Button>
    </Flex>
  )
}
