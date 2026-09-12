import { defineRecipe } from '@chakra-ui/react'

export default defineRecipe({
  base: {
    borderRadius: '0',
    fontWeight: 'semibold',
    cursor: 'pointer',
    _focusVisible: { outline: '2px solid', outlineColor: 'colorPalette.focusRing', outlineOffset: '2px' },
  },
  variants: {
    size: {
      xs: { h: '6', minW: '6', px: '2', fontSize: 'xs' },
      sm: { h: '8', minW: '8', px: '3', fontSize: 'sm' },
      md: { h: '10', minW: '10', px: '4', fontSize: 'md' },
      lg: { h: '12', minW: '12', px: '6', fontSize: 'lg' },
    },
    variant: {
      solid: { bg: 'colorPalette.solid', color: 'colorPalette.contrast', _hover: { bg: 'colorPalette.emphasized' } },
    },
  },
})
