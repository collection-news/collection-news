import { Box, Button, Center, Flex, Heading } from '@chakra-ui/react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import logoError from '../assets/logoError.svg'
import { NonArticleHead } from '../components/HtmlHead'

const Custom404Page = () => (
  <>
    <NonArticleHead title="找不到 | 聞庫" />
    <Center>
      <Flex flexDirection="column" justifyContent="center" alignItems="center" alignContent="center" py={10} my={50}>
        <Image src={logoError} alt="404icon" width={200} height={200} />
        <Heading textAlign="center" py={4}>
          404 找不到
        </Heading>
        <Flex justifyContent="center">
          <Button asChild>
            <Link href="/">回到主頁</Link>
          </Button>
        </Flex>
      </Flex>
    </Center>
  </>
)

export default Custom404Page
