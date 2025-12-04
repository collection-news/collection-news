import React from 'react'
import { Box } from '@chakra-ui/react'

import { Header } from './Header'
import { media } from '../../constants/media'
import { useRouter } from 'next/router'
import { getMedia } from '../../utils/dataHelper'
import { featureFlags } from '../../utils/config'

type Props = {
  children: React.ReactNode
}

export const Layout: React.FC<Props> = ({ children }) => {
  // Use when needed
  const isWithinGrayscaleWindow = () => {
    return false
  }
  const { query, pathname } = useRouter()

  const currentMedia = query.media as media
  const mediaMeta = getMedia(currentMedia)
  const dropdownShowMainPage = pathname !== '/'
  const showSearch = featureFlags.enableSearchFeature && !['/', '/404', '/google'].includes(pathname)

  return (
    <Box position="relative" filter={isWithinGrayscaleWindow() ? 'grayscale(100%)' : 'none'}>
      <Header mediaMeta={mediaMeta} dropdownShowMainPage={dropdownShowMainPage} showSearch={showSearch} />
      {children}
    </Box>
  )
}
