import { Center, Flex } from '@chakra-ui/react'
import Image from 'next/image'
import React from 'react'
import notFound from '../assets/notFound.svg'
import { NonArticleHead } from '../components/HtmlHead'

const Custom404Page = () => (
  <>
    <NonArticleHead title="找不到 | 果靈聞庫" />
    <Center>
      <Flex justifyContent="center" py={10} my={50}>
        <Image src={notFound} alt="404icon" width={500} height={120} />
      </Flex>
    </Center>
  </>
)

export default Custom404Page
