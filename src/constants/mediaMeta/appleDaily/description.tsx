import { Markdown } from '../../../components/Markdown'
import Description from './description.mdx'
import CollectionNewsDescription from './collectionNewsDescription.mdx'
import React from 'react'
import { MediaDescription } from '../../../types/mediaMeta'
import logoFullWhite from './logoFullWhite.svg'
import { media } from '../../media'

export const appleDailyDesc: MediaDescription = {
  key: media.APPLE_DAILY,
  brandName: '蘋果日報',
  description: (
    <Markdown>
      <Description />
    </Markdown>
  ),
  collectionNewsDescription: (
    <Markdown>
      <CollectionNewsDescription />
    </Markdown>
  ),
  logoFullWhite,
}
