import { IconButton, Flex } from '@chakra-ui/react'
import React from 'react'
import { Carousel as RCarousel } from 'react-responsive-carousel'
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'

type Props = {
  children: React.ReactChild[]
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
            colorScheme="theme"
            disabled={!hasPrev}
            size="sm"
          >
            <ChevronLeftIcon />
          </IconButton>
        </Flex>
      )}
      renderArrowNext={(clickHandler, hasPrev, label) => (
        <Flex alignItems="center" height="100%" position="absolute" right={0} top={0} zIndex="dropdown">
          <IconButton
            borderRadius="sm"
            aria-label="next"
            onClick={clickHandler}
            colorScheme="theme"
            disabled={!hasPrev}
            size="sm"
          >
            <ChevronRightIcon />
          </IconButton>
        </Flex>
      )}
      renderIndicator={(clickHandler, isSelected, index, label) => (
        <IconButton
          borderRadius="sm"
          aria-label="next"
          onClick={clickHandler}
          colorScheme="theme"
          disabled={isSelected}
          h={2}
          mr={2}
        />
      )}
    >
      {children}
    </RCarousel>
  )
}
