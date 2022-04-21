import { MediaDescription } from '../../../types/mediaMeta'
import { Markdown } from '../../../components/Markdown'
import Description from './description.mdx'
import CollectionNewsDescription from './collectionNewsDescription.mdx'
import logoFullWhite from './logoFullWhite.svg'
import { media } from '../../media'

export const theStandNewsDesc: MediaDescription = {
  key: media.THE_STAND_NEWS,
  brandName: '立場新聞',
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
