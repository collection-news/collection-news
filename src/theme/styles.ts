import type { SystemStyleObject } from '@chakra-ui/react'

const globalCss: Record<string, SystemStyleObject> = {
  body: { bg: '#FFFBFF', color: 'gray.800', colorScheme: 'light' },
  '@media (prefers-reduced-motion: reduce)': {
    '& *, & *::before, & *::after': { animationDuration: '0s !important', transitionDuration: '0s !important' },
  },
}
export default globalCss
