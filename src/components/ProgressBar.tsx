import { Progress, Portal, useDisclosure } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import * as React from 'react'
import { useLifecycles } from 'react-use'

export const ProgressBar = () => {
  const router = useRouter()
  const { open, onOpen, onClose } = useDisclosure()
  const routeChangeStart = () => {
    onOpen()
  }
  const routeChangeEnd = () => {
    onClose()
  }
  useLifecycles(
    () => {
      router.events.on('routeChangeStart', routeChangeStart)
      router.events.on('routeChangeComplete', routeChangeEnd)
      router.events.on('routeChangeError', routeChangeEnd)
    },
    () => {
      router.events.off('routeChangeStart', routeChangeStart)
      router.events.off('routeChangeComplete', routeChangeEnd)
      router.events.off('routeChangeError', routeChangeEnd)
    }
  )
  return open ? (
    <Portal>
      <Progress.Root
        size="xs"
        value={null}
        top="0"
        position="fixed"
        left="0"
        w="full"
        zIndex="overlay"
        colorPalette="brand"
        bg="theme.500"
      >
        <Progress.Track>
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>
    </Portal>
  ) : null
}
