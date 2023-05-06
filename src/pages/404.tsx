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
      <Box justifyContent="center" py={10} my={50}>
        <Image
          src={logoError}
          alt="404icon"
          width={500}
          height={120}
          style={{
            maxWidth: '100%',
            height: 'auto',
          }}
        />
        <Heading textAlign="center">404 Not Found</Heading>
        <Flex justifyContent="center" mt="4">
          <Link href="/" passHref>
            <Button>回到主頁</Button>
          </Link>
        </Flex>
      </Box>
    </Center>
  </>
)

export default Custom404Page
