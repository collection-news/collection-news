import React from 'react'
import { Container } from '@chakra-ui/react'

export const ContentWrapper: React.FC = ({ children }) => {
  return <Container maxW="container.lg">{children}</Container>
}
