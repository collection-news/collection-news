import React from 'react'
import { Box, Flex, Image as ChakraImage, ImageProps } from '@chakra-ui/react'

import { Empty } from './Empty'

export const ArticleImage: React.FC<ImageProps> = ({ onLoad, src, onError, ...props }) => {
  const handleImageLoad: ImageProps['onLoad'] = event => {
    onLoad && onLoad(event)
  }

  const handleError: ImageProps['onError'] = event => {
    onError && onError(event)
  }

  return (
    <ChakraImage {...props} src={src} onLoad={handleImageLoad} onError={handleError} fallback={<ImageFallback />} />
  )
}

const ImageFallback: React.FC = () => {
  return (
    <Flex h={333} w="full" justifyContent="center" alignItems="center">
      <Box w="full" h="full">
        <Empty />
      </Box>
    </Flex>
  )
}
