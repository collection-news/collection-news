import { menuAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(menuAnatomy.keys)

// define the base component styles
const baseStyle = definePartsStyle({
  item: {
    // this will style the MenuItem and MenuItemOption components
    _hover: {
      bg: 'brand.500',
    },
    _focus: {
      bg: 'brand.500',
    },
  },
})
// export the base styles in the component theme
export const menuTheme = defineMultiStyleConfig({ baseStyle })
