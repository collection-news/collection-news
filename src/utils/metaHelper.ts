import { MediaMeta, MediaMetaForProps } from '../types/mediaMeta'

export function getMedataMetaForPros(media: MediaMeta): MediaMetaForProps {
  const { brandNameShorthand, brandName, range, categoryList, count } = media
  return { brandNameShorthand, brandName, range, categoryList, count }
}
