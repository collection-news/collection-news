import React from 'react'
import { Heading } from '@chakra-ui/react'

type Props = {
  level: number
  children: React.ReactNode
}

export const HeaderBlock: React.FC<Props> = ({ level, children }) => {
  switch (level) {
    case 1:
      return (
        <Heading as="h1" size="xl">
          {children}
        </Heading>
      )
    case 2:
      return (
        <Heading as="h2" size="lg">
          {children}
        </Heading>
      )
    case 3:
      return (
        <Heading as="h3" size="md">
          {children}
        </Heading>
      )
    case 4:
      return (
        <Heading as="h4" size="sm">
          {children}
        </Heading>
      )
    default:
      return <div>{children}</div>
  }
}
