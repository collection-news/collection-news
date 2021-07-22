import React, { useState } from 'react'
import { Box, Flex, Image as ChakraImage, ImageProps, Spinner } from '@chakra-ui/react'

import { Empty } from './Empty'
import { isNil } from 'ramda'
import { useUpdateEffect } from 'react-use'

export const Image: React.FC<ImageProps> = ({ onLoad, src, onError, ...props }) => {
  const [loading, setLoading] = useState(!isNil(src))

  useUpdateEffect(() => {
    setLoading(true)
  }, [src])

  const handleImageLoad: ImageProps['onLoad'] = event => {
    setLoading(false)
    onLoad && onLoad(event)
  }

  const handleError: ImageProps['onError'] = event => {
    setLoading(false)
    onError && onError(event)
  }

  return (
    <ChakraImage
      {...props}
      src={src}
      onLoad={handleImageLoad}
      onError={handleError}
      fallback={
        <Flex h={333} w="full" justifyContent="center" alignItems="center">
          {loading ? (
            <Spinner size="lg" color="theme.500" speed="0.9s" />
          ) : (
            <Box w="full" h="full">
              <Empty />
            </Box>
          )}
        </Flex>
      }
    />
  )
}
