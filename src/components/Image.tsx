import React, { useCallback, useState } from 'react'
import { Box, Flex, Image as ChakraImage, ImageProps } from '@chakra-ui/react'
import { Empty } from './Empty'

export const ArticleImage: React.FC<ImageProps> = ({ onLoad, src, onError, ...props }) => {
  const [image, setImage] = useState<{ src: ImageProps['src']; status: 'loading' | 'loaded' | 'failed' }>({
    src,
    status: 'loading',
  })
  if (image.src !== src) setImage({ src, status: 'loading' })
  const loaded = Boolean(src) && image.src === src && image.status === 'loaded'
  const failed = image.src === src && image.status === 'failed'
  const checkCompletedImage = useCallback(
    (element: HTMLImageElement | null) => {
      // A cached or server-rendered image may load before React attaches onLoad.
      if (element?.complete) setImage({ src, status: element.naturalWidth > 0 ? 'loaded' : 'failed' })
    },
    [src]
  )

  return (
    <>
      {src && !failed && (
        <ChakraImage
          {...props}
          ref={checkCompletedImage}
          src={src}
          style={{ ...props.style, ...(!loaded ? { display: 'none' } : {}) }}
          onLoad={event => {
            setImage({ src, status: 'loaded' })
            onLoad?.(event)
          }}
          onError={event => {
            setImage({ src, status: 'failed' })
            onError?.(event)
          }}
        />
      )}
      {!loaded && <ImageFallback />}
    </>
  )
}

const ImageFallback: React.FC = () => (
  <Flex h={333} w="full" justifyContent="center" alignItems="center">
    <Box w="full" h="full">
      <Empty />
    </Box>
  </Flex>
)
