import { Box, Flex } from '@chakra-ui/react'
import Image from 'next/legacy/image'
import React from 'react'
import logoBlack from '../assets/logoBlack.svg'

export const Empty = () => (
  <Flex bg="theme.100" opacity={0.2} w="full" h="full" justifyContent="center" alignItems="center">
    <Box w={20} h={20}>
      <Image src={logoBlack} alt="empty" />
    </Box>
  </Flex>
)
