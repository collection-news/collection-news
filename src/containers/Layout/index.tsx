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
  const isWithinGrayscaleWindow = () => {
    const y = new Date().getFullYear()
    return y === 2025
  }
  const { query, pathname } = useRouter()

  const currentMedia = query.media as media
  const mediaMeta = getMedia(currentMedia)
  const dropdownShowMainPage = pathname !== '/'

  return (
    <Box position="relative" filter={isWithinGrayscaleWindow() ? 'grayscale(100%)' : 'none'}>
      <Header mediaMeta={mediaMeta} dropdownShowMainPage={dropdownShowMainPage} />
      {children}
    </Box>
  )
}
