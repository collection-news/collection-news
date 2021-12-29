import { ChakraProvider } from '@chakra-ui/react'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'

import '@fontsource/noto-sans-tc'
import 'react-responsive-carousel/lib/styles/carousel.min.css'

import { ProgressBar } from '../components/ProgressBar'
import { Layout } from '../containers/Layout'
import { theme } from '../theme'

// Create a client
const queryClient = new QueryClient()

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <ProgressBar />
        <Head>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
          <link rel="manifest" href="/manifest.json" />
          <link rel="apple-touch-icon" href="apple-icon-180x180-dunplab-manifest-45521.png" />
        </Head>
        <Layout>
          <Component {...pageProps} />
        </Layout>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ChakraProvider>
  )
}
export default MyApp
