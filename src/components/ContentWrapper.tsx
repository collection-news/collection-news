import React from 'react'
import { Container } from '@chakra-ui/react'

type Props = {
  children: React.ReactNode
}

export const ContentWrapper: React.FC<Props> = ({ children }) => {
  return <Container maxW="container.lg">{children}</Container>
}
