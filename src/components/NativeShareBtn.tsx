import { IconButton } from '@chakra-ui/react'
import React from 'react'
import { AiOutlineShareAlt } from 'react-icons/ai'

import { useWebShare } from '../hooks'

const NativeShareBtn: React.FC = () => {
  const { canShare, onShare } = useWebShare()
  return canShare ? (
    <IconButton aria-label="share" variant="plain" onClick={onShare}>
      <AiOutlineShareAlt />
    </IconButton>
  ) : null
}

export default NativeShareBtn
