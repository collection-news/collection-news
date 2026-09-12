import { createSystem, defaultConfig, defineRecipe, defineSlotRecipe } from '@chakra-ui/react'
import colors from './foundations/colors'
import sizes from './foundations/sizes'
import spacing from './foundations/space'
import button from './components/button'
import { menuRecipe } from './components/menu'
import globalCss from './styles'

export const system = createSystem(defaultConfig, {
  globalCss,
  theme: {
    tokens: {
      colors,
      spacing,
      sizes,
      shadows: {
        base: { value: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px 0 rgb(0 0 0 / 0.06)' },
        calendar: { value: '0 1px 2px 0 rgb(0 0 0 / 0.05)' },
      },
      fonts: {
        body: {
          value:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
        },
        heading: {
          value:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
        },
      },
      radii: { sm: { value: '0.125rem' }, md: { value: '0.375rem' }, lg: { value: '0.5rem' } },
    },
    semanticTokens: {
      colors: {
        bg: { DEFAULT: { value: '#FFFBFF' } },
        fg: { DEFAULT: { value: '{colors.gray.800}' } },
        border: { DEFAULT: { value: '#E2E8F0' } },
        theme: {
          solid: { value: '{colors.theme.500}' },
          contrast: { value: 'white' },
          fg: { value: '{colors.theme.500}' },
          subtle: { value: '{colors.theme.100}' },
          muted: { value: '{colors.theme.200}' },
          emphasized: { value: '{colors.theme.600}' },
          focusRing: { value: '{colors.brand.500}' },
        },
        brand: {
          solid: { value: '{colors.brand.500}' },
          contrast: { value: '{colors.theme.500}' },
          fg: { value: '{colors.theme.500}' },
          subtle: { value: '{colors.brand.100}' },
          muted: { value: '{colors.brand.200}' },
          emphasized: { value: '{colors.brand.600}' },
          focusRing: { value: '{colors.theme.300}' },
        },
        orange: { subtle: { value: '{colors.orange.100}' }, fg: { value: '{colors.orange.800}' } },
        teal: { subtle: { value: '{colors.teal.100}' }, fg: { value: '{colors.teal.800}' } },
        gray: {
          solid: { value: '#EDF2F7' },
          contrast: { value: '{colors.gray.800}' },
          emphasized: { value: '#E2E8F0' },
        },
      },
    },
    recipes: {
      button,
      input: defineRecipe({
        variants: {
          size: {
            sm: { '--input-height': 'sizes.8', fontSize: 'sm', px: '3' },
            md: { '--input-height': 'sizes.10', fontSize: 'md', px: '4' },
            lg: { '--input-height': 'sizes.12', fontSize: 'lg', px: '4' },
          },
        },
      }),
      code: defineRecipe({
        base: {
          display: 'inline-block',
          whiteSpace: 'normal',
          borderRadius: 'sm',
          fontWeight: 'normal',
          lineHeight: 1.5,
        },
        variants: {
          size: { sm: { fontSize: 'sm', px: '0.2em', py: '0', minH: '0' } },
          variant: { subtle: { bg: 'gray.100', color: 'gray.800' } },
        },
        defaultVariants: { size: 'sm' },
      }),
      badge: defineRecipe({
        base: { borderRadius: 'sm', fontWeight: 'bold' },
        variants: { size: { sm: { fontSize: 'xs', px: '1', py: '0', minH: '0', lineHeight: 1.5 } } },
        defaultVariants: { size: 'sm' },
      }),
      heading: defineRecipe({
        base: { fontWeight: 'bold', letterSpacing: 'normal' },
        variants: {
          size: {
            xs: { textStyle: 'none', fontSize: 'sm', lineHeight: 1.2 },
            sm: { textStyle: 'none', fontSize: 'md', lineHeight: 1.2 },
            md: { textStyle: 'none', fontSize: 'xl', lineHeight: 1.2 },
            lg: { textStyle: 'none', fontSize: { base: '2xl', md: '3xl' }, lineHeight: { base: 1.33, md: 1.2 } },
            xl: { textStyle: 'none', fontSize: { base: '3xl', md: '4xl' }, lineHeight: { base: 1.33, md: 1.2 } },
          },
        },
        defaultVariants: { size: 'xl' },
      }),
    },
    slotRecipes: {
      menu: menuRecipe,
      tag: defineSlotRecipe({
        slots: ['root'],
        base: { root: { color: 'gray.800', fontWeight: 'medium', lineHeight: 1.2, borderRadius: 'md' } },
        variants: {
          size: {
            sm: { root: { minH: '5', minW: '5', fontSize: 'xs', px: '2' } },
            md: { root: { minH: '6', minW: '6', fontSize: 'sm', px: '2' } },
          },
        },
        defaultVariants: { size: 'md' },
      }),
    },
  },
})
