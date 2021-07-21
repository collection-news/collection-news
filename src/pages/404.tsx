import { Center, Flex } from '@chakra-ui/react'
import Image from 'next/image'
import React from 'react'
import notFound from '../assets/notFound.svg'

const Custom404Page = () => (
  <Center>
    <Flex justifyContent="center" py={10} my={50}>
      <Image src={notFound} alt="404icon" width={500} height={120} />
    </Flex>
  </Center>
)

export default Custom404Page
