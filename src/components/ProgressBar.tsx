import { Progress, Portal, useDisclosure } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import * as React from 'react'
import { useLifecycles } from 'react-use'

export const ProgressBar = () => {
  const router = useRouter()
  const { isOpen, onOpen, onClose } = useDisclosure()
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
  return isOpen ? (
    <Portal>
      <Progress
        size="xs"
        isIndeterminate
        top="0"
        position="fixed"
        left="0"
        w="full"
        zIndex="overlay"
        colorScheme="brand"
        bg="theme.500"
      />
    </Portal>
  ) : null
}
