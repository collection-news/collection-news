/* eslint-disable react/display-name */
import { chakra, Box, Flex, Text, Heading, Image } from '@chakra-ui/react'
import { MDXProvider } from '@mdx-js/react'
import { IconButton } from '@chakra-ui/react'
import { AiFillGithub } from 'react-icons/ai'

export const Markdown: React.FC = ({ children }) => (
  <MDXProvider
    components={{
      // https://mdxjs.com/table-of-components
      // https://nextjs.org/blog/markdown
      img: Image,
      h1: p => <Heading my={6} as="h1" {...p} />,
      h2: p => <Heading my={4} as="h2" size="lg" {...p} />,
      h3: p => <Heading as="h3" size="md" my={2} {...p} />,
      h4: p => <Heading as="h4" size="sm" my={2} {...p} />,
      h5: p => <Heading as="h5" size="xs" {...p} />,
      ol: p => <chakra.ol sx={{ listStylePosition: 'inside' }} {...p} />,
      p: p => <Text as="p" mb={2} {...p} />,
      a: p => (
        <chakra.a
          color="theme.200"
          _hover={{
            borderBottomWidth: '1px',
            borderStyle: 'dotted',
            borderColor: 'theme.600',
          }}
          {...p}
        />
      ),
    }}
  >
    <Box mb={10}>
      {children}
      <Footer />
    </Box>
  </MDXProvider>
)

const Footer: React.FC = () => {
  return (
    <Flex align="center">
      <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">
        <Image
          alt="Creative Commons License"
          src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png"
          border={0}
          display="inline-block"
        />
      </a>
      <a href="https://github.com/appledailybackup/collection-news" target="_blank" rel="noreferrer">
        <IconButton
          color="theme.700"
          aria-label="GitHub repository"
          isRound
          variant="link"
          size="lg"
          icon={<AiFillGithub />}
        />
      </a>
    </Flex>
  )
}
