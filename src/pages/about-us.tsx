import { Flex, Image } from '@chakra-ui/react'

import logoFull from '../assets/logoFull.svg'
import { ContentWrapper } from '../components/ContentWrapper'
import { NonArticleHead } from '../components/HtmlHead'
import { Markdown } from '../components/Markdown'
import AboutUsContent from '../containers/AboutUs.mdx'

export default function AboutUs() {
  return (
    <>
      <NonArticleHead title="關於我們 | 果靈聞庫" />
      <ContentWrapper>
        <Flex bg="theme.500" justifyContent="center" py={10} my={4}>
          <Image src={logoFull.src} alt="logo" height={120} />
        </Flex>
        <Markdown>
          <AboutUsContent />
        </Markdown>
      </ContentWrapper>
    </>
  )
}
