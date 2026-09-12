import { IconButton, Flex, Tag } from '@chakra-ui/react'
import React from 'react'
import { Carousel as RCarousel } from 'react-responsive-carousel'
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu'

type Props = {
  children: React.ReactNode
}

export const Carousel: React.FC<Props> = ({ children }) => {
  return (
    <RCarousel
      showArrows={true}
      showStatus={false}
      renderArrowPrev={(clickHandler, hasPrev, label) => (
        <Flex alignItems="center" height="100%" position="absolute" left={0} top={0} zIndex="dropdown">
          <IconButton
            borderRadius="sm"
            aria-label="prev"
            onClick={clickHandler}
            colorPalette="theme"
            disabled={!hasPrev}
            size="sm"
          >
            <LuChevronLeft />
          </IconButton>
        </Flex>
      )}
      renderArrowNext={(clickHandler, hasPrev, label) => (
        <Flex alignItems="center" height="100%" position="absolute" right={0} top={0} zIndex="dropdown">
          <IconButton
            borderRadius="sm"
            aria-label="next"
            onClick={clickHandler}
            colorPalette="theme"
            disabled={!hasPrev}
            size="sm"
          >
            <LuChevronRight />
          </IconButton>
        </Flex>
      )}
      renderIndicator={(clickHandler, isSelected, index, label) => (
        <Tag.Root
          borderRadius="0"
          size="sm"
          aria-label="next"
          onClick={clickHandler}
          bg={isSelected ? 'theme.600' : 'theme.200'}
          cursor="pointer"
          h={2}
        />
      )}
    >
      {children as any}
    </RCarousel>
  )
}
