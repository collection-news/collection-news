import { Portal, Tooltip as ChakraTooltip } from '@chakra-ui/react'
import type { ReactNode } from 'react'

type TooltipProps = Omit<ChakraTooltip.RootProps, 'children'> & {
  children: ReactNode
  content: ReactNode
  showArrow?: boolean
  'aria-label'?: string
}

export const Tooltip = ({ children, content, showArrow, 'aria-label': ariaLabel, ...props }: TooltipProps) => (
  <ChakraTooltip.Root {...props}>
    <ChakraTooltip.Trigger asChild>{children}</ChakraTooltip.Trigger>
    <Portal>
      <ChakraTooltip.Positioner>
        <ChakraTooltip.Content aria-label={ariaLabel}>
          {showArrow && (
            <ChakraTooltip.Arrow>
              <ChakraTooltip.ArrowTip />
            </ChakraTooltip.Arrow>
          )}
          {content}
        </ChakraTooltip.Content>
      </ChakraTooltip.Positioner>
    </Portal>
  </ChakraTooltip.Root>
)
