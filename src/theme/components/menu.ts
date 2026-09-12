import { defineSlotRecipe } from '@chakra-ui/react'

export const menuRecipe = defineSlotRecipe({
  slots: ['content', 'item'],
  base: {
    content: { bg: 'white', color: 'gray.800', borderWidth: '1px', borderRadius: 'md', boxShadow: 'popover' },
    item: {
      px: '3',
      py: '1.5',
      fontSize: 'md',
      borderRadius: '0',
      cursor: 'pointer',
      _highlighted: { bg: 'brand.500' },
    },
  },
  variants: {
    size: {
      md: {
        content: { minW: '3xs', p: '0', py: '2' },
        item: { textStyle: 'none', fontSize: 'md', lineHeight: 1.5, px: '3', py: '1.5' },
      },
    },
    variant: {
      subtle: { item: { _highlighted: { bg: 'brand.500' } } },
    },
  },
})
