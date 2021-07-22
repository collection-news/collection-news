import { IconButton } from '@chakra-ui/react'
import React from 'react'
import { AiOutlineShareAlt } from 'react-icons/ai'
import { useWebShare } from '../hooks'

type Props = {
  title: string
  text: string
}

export const NativeShareBtn: React.FC<Props> = ({ title, text }) => {
  const { canShare, onShare } = useWebShare(title, text)
  return canShare ? (
    <IconButton aria-label="share" icon={<AiOutlineShareAlt />} variant="link" onClick={onShare} />
  ) : null
}
