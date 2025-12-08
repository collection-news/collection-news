import { Modal, ModalOverlay, ModalContent, ModalBody, Box, useBreakpointValue } from '@chakra-ui/react'
import { useEffect } from 'react'
import { InstantSearch, Configure } from 'react-instantsearch'
import { createInstantSearchRouterNext } from 'react-instantsearch-router-nextjs'
import singletonRouter from 'next/router'
import { SearchResults } from './SearchResults'
import { searchClient } from '../../utils/searchClient'
import { MEILI_INDEX_NAME } from '../../constants/text'
import { SearchHeader } from './SearchHeader'
import { useInView } from 'react-intersection-observer'

type SearchModalProps = {
  isOpen: boolean
  onClose?: () => void
  isPageView?: boolean
  useRouter?: boolean
}

const noop = () => {}

export const SearchModal = ({ isOpen, isPageView = false, onClose = noop, useRouter = false }: SearchModalProps) => {
  const { ref: sentinelRef, inView } = useInView({
    threshold: 0,
  })

  const isSmallViewport = useBreakpointValue({
    base: true,
    sm: false,
  })

  useEffect(() => {
    const handleRouteChange = () => {
      if (isOpen) {
        onClose()
      }
    }

    singletonRouter.events.on('routeChangeStart', handleRouteChange)
    return () => {
      singletonRouter.events.off('routeChangeStart', handleRouteChange)
    }
  }, [isOpen, onClose])

  const modalSize = isPageView ? 'full' : { base: 'full', sm: 'full', md: '2xl', lg: '4xl', xl: '5xl', '2xl': '6xl' }
  const width = isPageView ? { base: '100vw', lg: '90vw', xl: '75vw', '2xl': '60vw' } : 'auto'
  const alignItems = isPageView ? 'center' : 'normal'

  return (
    <Modal
      isOpen={isOpen}
      onClose={!isPageView ? onClose : noop}
      size={modalSize}
      scrollBehavior="inside"
      closeOnOverlayClick={!isPageView}
      closeOnEsc={!isPageView}
      motionPreset={isPageView ? 'none' : 'scale'}
    >
      <ModalOverlay />
      <ModalContent
        mt={isPageView ? 0 : { base: 0, md: 4 }}
        borderRadius={isPageView ? 0 : { base: 0, md: 'sm' }}
        maxH={isPageView ? '100vh' : { base: '100vh', md: '85vh' }}
        h={isPageView ? '100vh' : { base: '100vh', md: '80vh' }}
        overflow="hidden"
        alignItems={alignItems}
        bg="bg.500"
      >
        <ModalBody
          id="search-results-container"
          p={0}
          width={width}
          display="flex"
          flexDirection="column"
          overflowY="auto"
        >
          <InstantSearch
            searchClient={searchClient}
            indexName={MEILI_INDEX_NAME}
            future={{ preserveSharedStateOnUnmount: false }}
            routing={
              useRouter && {
                router: createInstantSearchRouterNext({
                  singletonRouter,
                  routerOptions: {
                    cleanUrlOnDispose: true,
                  },
                }),
              }
            }
          >
            <Configure />
            <Box
              position={isSmallViewport ? 'sticky' : 'static'}
              top={0}
              zIndex={1}
              bg="bg.500"
              transition="transform 0.18s ease-out, box-shadow 0.18s ease-out"
              transform={!inView && isSmallViewport ? 'translateY(-100%)' : 'translateY(0)'}
              boxShadow={!inView && isSmallViewport ? 'none' : 'sm'}
            >
              <SearchHeader onClose={onClose} isPageView={isPageView} />
            </Box>
            {/* Sentinel is observed to detect when content has been scrolled past the top */}
            <Box ref={sentinelRef} h="1px" w="100%" />
            {/* id is needed for infinite scroll to keep track of the scroll target */}
            <Box flex="1" p={4} minH={0}>
              <SearchResults />
            </Box>
          </InstantSearch>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
