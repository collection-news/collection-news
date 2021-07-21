import React from 'react'
import { Flex, Box } from '@chakra-ui/react'
import { Stream } from '../../types/appleDailyArticle'

type Props = {
  streams: Stream[]
}

export const VideoBlock: React.FC<Props> = ({ streams }) => {
  return (
    <Flex mb={4} justify="center">
      <Box border="1px" borderRadius="sm" borderColor="theme.400" bgColor="theme.400" w={['80%', '80%', '60%']}>
        <video controls>
          {streams.map(({ streamType, url }, index) => (
            <source src={url} type={`video/${streamType}`} key={index} />
          ))}
          Your browser does not support the video tag.
        </video>
      </Box>
    </Flex>
  )
}
