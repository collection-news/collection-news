import { Icon, IconButton, Popover, Text, VStack, Code, Box, CloseButton } from '@chakra-ui/react'
import { BsQuestionCircle } from 'react-icons/bs'

export const SearchHelpTips = () => {
  return (
    <Popover.Root
      positioning={{
        strategy: 'fixed',
        hideWhenDetached: true,
        placement: 'bottom-end',
      }}
    >
      <Popover.Trigger asChild>
        <IconButton aria-label="Search tips" variant="ghost" size="md" colorPalette="gray">
          <Icon boxSize="4" asChild>
            <BsQuestionCircle />
          </Icon>
        </IconButton>
      </Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content width="300px" fontSize="md" lineHeight={1.5} borderWidth="1px" boxShadow="popover">
          <Popover.Arrow>
            <Popover.ArrowTip />
          </Popover.Arrow>
          <Popover.CloseTrigger asChild position="absolute" top="1" right="1">
            <CloseButton size="sm" />
          </Popover.CloseTrigger>
          <Popover.Title fontWeight="bold" lineHeight={1.5} px="3" py="2" borderBottomWidth="1px">
            搜尋小貼士
          </Popover.Title>
          <Popover.Body px="3" py="2">
            <VStack align="start" gap={3}>
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
                  使用 <Code>-</Code> 排除包含該關鍵字的內容，例如 <Code>-蘋果</Code>。
                </Text>
              </Box>
              <Box>
                <Text fontSize="xs" color="gray.500">
                  範例: <Code>&quot;民主&quot; -自由</Code>
                </Text>
              </Box>
            </VStack>
          </Popover.Body>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  )
}
