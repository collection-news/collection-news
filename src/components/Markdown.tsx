/* eslint-disable react/display-name */
import { chakra, Text, Heading, Image } from '@chakra-ui/react'
import { MDXProvider } from '@mdx-js/react'

export const Markdown: React.FC = ({ children }) => (
  <MDXProvider
    components={{
      // https://mdxjs.com/table-of-components
      // https://nextjs.org/blog/markdown
      img: Image,
      h1: p => <Heading my={6} as="h1" {...p} />,
      h2: p => <Heading my={4} as="h2" size="lg" {...p} />,
      h3: p => <Heading as="h3" size="md" my={4} {...p} />,
      h4: p => <Heading as="h4" size="sm" mt="4" mb="2" {...p} />,
      h5: p => <Heading as="h5" size="xs" {...p} />,
      ol: p => <chakra.ol sx={{ listStylePosition: 'inside' }} {...p} />,
      p: p => <Text as="p" mb={2} {...p} />,
      a: p => (
        <chakra.a
          borderBottomWidth="1px"
          borderStyle="dotted"
          _hover={{
            borderBottomWidth: '2px',
            borderColor: 'theme.100',
          }}
          {...p}
        />
      ),
    }}
  >
    {children}
  </MDXProvider>
)
