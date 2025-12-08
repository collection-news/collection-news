import { Box, Center, Input, InputGroup, InputLeftElement, InputRightElement, Button, Icon } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { BsSearch } from 'react-icons/bs'
import React from 'react'
import { use100vh } from 'react-div-100vh'
import Image from 'next/image'
import coverImage from '../assets/coverImage.svg'
import { SEARCH_PLACEHOLDER, MEILI_INDEX_NAME } from '../constants/text'
import { featureFlags } from '../utils/config'

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
    <Center bg="theme.500" color="white" h={bannerHeightStyle} pb={featureFlags.enableSearchFeature ? '20vh' : 0}>
      <Box w="100%" maxW="600px" px="4" display="flex" flexDirection="column" alignItems="center">
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
          <InputGroup size="lg" maxW="600px" bg="white" borderRadius={borderRadius} boxShadow="lg">
            <InputLeftElement pointerEvents="none" color="gray.500" fontSize="1.25rem" pt={1} pl={2}>
              <Icon>
                <BsSearch />
              </Icon>
            </InputLeftElement>
            <Input
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
            <InputRightElement width="4.5rem">
              <Button onClick={handleSearch} borderRadius={borderRadius} colorScheme="gray" variant="ghost">
                搜尋
              </Button>
            </InputRightElement>
          </InputGroup>
        )}
      </Box>
    </Center>
  )
}

export default Banner
