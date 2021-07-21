import React, { useState } from 'react'
import { Box, Center, Image as ChakraImage, ImageProps, Spinner } from '@chakra-ui/react'

import { Empty } from './Empty'
import { isNil } from 'ramda'
import { useUpdateEffect } from 'react-use'

export const Image: React.FC<ImageProps> = ({ onLoad, src, onError, ...props }) => {
  const [loading, setLoading] = useState(!isNil(src))
  const [error, setError] = useState(isNil(src))

  useUpdateEffect(() => {
    setLoading(true)
  }, [src])

  const handleImageLoad: ImageProps['onLoad'] = event => {
    setLoading(false)
    setError(false)
    onLoad && onLoad(event)
  }

  const handleError: ImageProps['onError'] = event => {
    setError(true)
    onError && onError(event)
  }

  return (
    <ChakraImage
      {...props}
      src={src}
      onLoad={handleImageLoad}
      onError={handleError}
      fallback={
        loading ? (
          <Center>
            <Spinner size="lg" color="theme.500" speed="0.9s" />
          </Center>
        ) : (
          <Box minHeight={300} w="full">
            <Empty />
          </Box>
        )
      }
    />
  )
}
