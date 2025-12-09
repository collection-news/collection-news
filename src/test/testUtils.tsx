import { ChakraProvider } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { theme } from '../theme'

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  const client = createTestQueryClient()

  return render(
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={client}>{ui}</QueryClientProvider>
    </ChakraProvider>,
    options
  )
}

export * from '@testing-library/react'
