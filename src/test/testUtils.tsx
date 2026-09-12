import { ChakraProvider } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'
import { system } from '../theme'

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  const client = createTestQueryClient()

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <ChakraProvider value={system}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </ChakraProvider>
  )
  return render(ui, { wrapper: Wrapper, ...options })
}

export * from '@testing-library/react'
