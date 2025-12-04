import {
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Text,
  VStack,
  Code,
  Box,
} from '@chakra-ui/react'
import { BsQuestionCircle } from 'react-icons/bs'

export const SearchHelpTips = () => {
  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <IconButton aria-label="Search tips" icon={<BsQuestionCircle />} variant="ghost" size="md" colorScheme="gray" />
      </PopoverTrigger>
      <PopoverContent width="300px">
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader fontWeight="bold">搜尋小貼士</PopoverHeader>
        <PopoverBody>
          <VStack align="start" spacing={3}>
            <Box>
              <Text fontWeight="bold" fontSize="sm">
                準確搜尋 (Phrase Search)
              </Text>
              <Text fontSize="sm">
                使用 <Code>&quot;&quot;</Code>搜尋完全符合關鍵字的內容，例如 <Code>&quot;香港&quot;</Code>。
              </Text>
            </Box>
            <Box>
              <Text fontWeight="bold" fontSize="sm">
                排除關鍵字 (Negative Search)
              </Text>
              <Text fontSize="sm">
                使用 <Code>-</Code> 排除包含該關鍵字的內容，例如 <Code>-&quot;蘋果&quot;</Code>。
              </Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.500">
                範例: <Code>&quot;民主&quot; -&quot;自由&quot;</Code>
              </Text>
            </Box>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
