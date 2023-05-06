import { Box, Center } from '@chakra-ui/react'
import React from 'react'
import { use100vh } from 'react-div-100vh'
import Image from 'next/legacy/image'
import coverImage from '../assets/coverImage.svg'

const Banner: React.FC = () => {
  const bannerHeight = use100vh()
  const bannerHeightStyle = bannerHeight ? `calc(${bannerHeight}px - 3rem)` : 'calc(100vh - 3rem)'
  return (
    <Center bg="theme.500" color="white" h={bannerHeightStyle}>
      <Box w="100%" maxW="500px" px="4">
        <Image src={coverImage} alt="cover" />
      </Box>
    </Center>
  )
}

export default Banner
