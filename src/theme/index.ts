import { extendTheme } from '@chakra-ui/react'
import Button from './components/button'
import colors from './foundations/colors'
import fonts from './foundations/fonts'
import sizes from './foundations/sizes'
import space from './foundations/space'
import styles from './styles'

export const theme = extendTheme({
  fonts,
  colors,
  styles,
  space,
  sizes,
  components: { Button },
})
