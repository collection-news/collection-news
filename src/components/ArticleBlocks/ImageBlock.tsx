import React from 'react'
import { Flex, Box } from '@chakra-ui/react'
import { isEmpty, trim } from 'ramda'
import { Empty } from '../Empty'
import { Image } from '../Image'

type Props = {
  url: string
  caption?: string | null
}

export const ImageBlock: React.FC<Props> = ({ url, caption }) => {
  return (
    <Flex mb={4} justify="center">
      <Box border="1px" borderRadius="sm" borderColor="theme.400" bgColor="theme.400" w={['80%', '80%', '60%']}>
        <Flex justify="center">
          <Box w="full">
            <Image src={url} alt={caption || ''} fallback={<Empty />} />
          </Box>
        </Flex>
        {caption && !isEmpty(trim(caption)) && (
          <Box p={2} fontWeight="semibold" color="white" dangerouslySetInnerHTML={{ __html: caption }} />
        )}
      </Box>
    </Flex>
  )
}
