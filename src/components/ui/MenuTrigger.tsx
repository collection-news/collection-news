import { Menu } from '@chakra-ui/react'
import type { ReactElement } from 'react'

export const MenuTrigger = ({ children }: { children: ReactElement }) => (
  <Menu.Trigger
    asChild
    onPointerDownCapture={event => {
      // Zag cancels pointerdown; WebKit then suppresses the touch-generated click.
      // Keep the touch default so Menu's normal click handler opens it exactly once.
      if (event.pointerType === 'touch') event.stopPropagation()
    }}
  >
    {children}
  </Menu.Trigger>
)
