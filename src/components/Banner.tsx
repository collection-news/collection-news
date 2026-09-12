import { Box, Center, Input, InputGroup, Button, Icon } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { BsSearch } from 'react-icons/bs'
import React from 'react'
import { use100vh } from 'react-div-100vh'
import Image from 'next/image'
import coverImage from '../assets/coverImage.svg'
import { SEARCH_PLACEHOLDER, MEILI_INDEX_NAME } from '../constants/text'
import { featureFlags } from '../utils/config'
import { SisterSiteLinks } from './SisterSiteLinks'

const Banner: React.FC = () => {
  const bannerHeight = use100vh()
  const bannerHeightStyle = bannerHeight ? `calc(${bannerHeight}px - 3rem)` : 'calc(100vh - 3rem)'
  const router = useRouter()
  const [query, setQuery] = React.useState('')

  const handleSearch = () => {
    if (query.trim()) {
      const k = `${MEILI_INDEX_NAME}[query]`
      const v = query.trim()
      router.push(`/search?${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const borderRadius = 'full'

  return (
    // Short screens need room below the fixed hero for the links, without recentering the search.
    <Box
      bg="theme.500"
      css={{
        '@media (max-height: 480px)': { paddingBottom: 24 },
      }}
    >
      <Center bg="theme.500" color="white" h={bannerHeightStyle} pb={featureFlags.enableSearchFeature ? '20vh' : 0}>
        <Box w="100%" maxW="600px" px="4" display="flex" flexDirection="column" alignItems="center" position="relative">
          <Box w="100%" maxW="500px" mb={8}>
            <Image
              src={coverImage}
              alt="cover"
              style={{
                maxWidth: '100%',
                height: 'auto',
              }}
            />
          </Box>
          {featureFlags.enableSearchFeature && (
            <InputGroup
              maxW="600px"
              bg="white"
              borderRadius={borderRadius}
              boxShadow="lg"
              startElement={
                <Icon color="gray.500" fontSize="1.25rem">
                  <BsSearch />
                </Icon>
              }
              endElement={
                <Button onClick={handleSearch} borderRadius={borderRadius} colorPalette="gray" variant="ghost">
                  搜尋
                </Button>
              }
              endElementProps={{ px: 0, width: '4.5rem' }}
            >
              <Input
                size="lg"
                pe="4.5rem"
                placeholder={SEARCH_PLACEHOLDER}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                borderRadius={borderRadius}
                pl={12}
                bg="transparent"
                color="black"
                _focus={{ boxShadow: 'none' }}
                data-cy="index-search-input"
              />
            </InputGroup>
          )}
          {/* Keep promotions outside the centered stack so the logo and search do not move. */}
          <Box position="absolute" top="100%" mt="6" insetInline="4">
            <SisterSiteLinks />
          </Box>
        </Box>
      </Center>
    </Box>
  )
}

export default Banner
