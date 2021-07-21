import { ChakraProvider } from '@chakra-ui/react'
import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'

import { Layout } from '../containers/Layout'
import { ProgressBar } from '../components/ProgressBar'
import { theme } from '../theme'
import '../styles/globals.css'
import 'react-responsive-carousel/lib/styles/carousel.min.css'
import Head from 'next/head'

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
          <link rel="apple-touch-icon" href="apple-icon-180x180-dunplab-manifest-47312.png" />
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
