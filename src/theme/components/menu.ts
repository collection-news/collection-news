import { defineSlotRecipe } from '@chakra-ui/react'

export const menuRecipe = defineSlotRecipe({
  slots: ['content', 'item'],
  base: {
    content: { minW: '3xs', bg: 'white', color: 'gray.800', borderWidth: '1px', py: '2', borderRadius: 'md' },
    item: {
      px: '3',
      py: '1.5',
      fontSize: 'md',
      borderRadius: '0',
      cursor: 'pointer',
      _highlighted: { bg: 'brand.500' },
    },
  },
})
