import { IconButton } from '@chakra-ui/react'
import React from 'react'
import { AiOutlineShareAlt } from 'react-icons/ai'

import { useWebShare } from '../hooks'

export const NativeShareBtn: React.FC = () => {
  const { canShare, onShare } = useWebShare()
  return canShare ? (
    <IconButton aria-label="share" icon={<AiOutlineShareAlt />} variant="link" onClick={onShare} />
  ) : null
}
