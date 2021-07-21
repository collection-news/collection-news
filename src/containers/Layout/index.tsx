import React from 'react'
import { Box } from '@chakra-ui/react'

import { Header } from './Header'

export const Layout: React.FC = ({ children }) => {
  return (
    <Box position="relative">
      <Header />
      {children}
    </Box>
  )
}
