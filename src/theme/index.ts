import { extendTheme } from '@chakra-ui/react'
import colors from './foundations/colors'
import sizes from './foundations/sizes'
import space from './foundations/space'
import Button from './components/button'
import { menuTheme } from './components/menu'
import styles from './styles'

export const theme = extendTheme({
  colors,
  styles,
  space,
  sizes,
  components: { Button, Menu: menuTheme },
})
