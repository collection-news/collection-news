import React from 'react'
import { Box } from '@chakra-ui/react'

import { Header } from './Header'
import { media } from '../../constants/media'
import { useRouter } from 'next/router'
import { getMedia } from '../../utils/dataHelper'

type Props = {
  children: React.ReactNode
}

export const Layout: React.FC<Props> = ({ children }) => {
  const { query, pathname } = useRouter()

  const currentMedia = query.media as media
  const mediaMeta = getMedia(currentMedia)
  const dropdownShowMainPage = pathname !== '/'

  return (
    <Box position="relative">
      <Header mediaMeta={mediaMeta} dropdownShowMainPage={dropdownShowMainPage} />
      {children}
    </Box>
  )
}
