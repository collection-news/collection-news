import { Button, ButtonGroup, ButtonProps, Text, Flex } from '@chakra-ui/react'
import Link from 'next/link'
import { isNil, reject } from 'ramda'
import * as React from 'react'
import { forwardRef } from 'react'
import { appleDailyCategoryList } from '../constants/appleDailyCategory'
import HScrollBar from './HScrollBar'

type CategoryListProps = {
  getHref: (prop: { lastDay?: string; category?: string }) => string
  isInCategory: (category?: string) => boolean
}

export const CategoryList = ({ getHref, isInCategory }: CategoryListProps) => {
  return (
    <Flex justifyContent="center" bg="theme.300" position="sticky" top="header" zIndex="overlay" color="white">
      <Link href={{ pathname: getHref({}) }} passHref>
        <BasicCategoryBtn data-cy="show-all-category-btn" bg="theme.400">
          全部
        </BasicCategoryBtn>
      </Link>
      <HScrollBar>
        <ButtonGroup spacing="0">
          {appleDailyCategoryList.map(({ text, category, color, lastDay }) => (
            <CategoryBtn
              key={category}
              text={text}
              category={category}
              color={color}
              href={getHref({ category, lastDay })}
              isInCategory={isInCategory}
            />
          ))}
        </ButtonGroup>
      </HScrollBar>
    </Flex>
  )
}

type CategoryBtnProps = {
  text: string
  category: string
  color: string
  href: string
  isInCategory: (category?: string) => boolean
}

const CategoryBtn = ({ text, category, color, href, isInCategory }: CategoryBtnProps) => {
  return (
    <Link
      href={{
        pathname: href,
      }}
      passHref
    >
      <BasicCategoryBtn
        _hover={{ bg: color }}
        data-cy={`category-${category}-btn`}
        bg={isInCategory(category) ? color : undefined}
      >
        {text}
      </BasicCategoryBtn>
    </Link>
  )
}

type BasicCategoryBtnProps = {
  children: React.ReactNode
} & ButtonProps

const BasicCategoryBtn = forwardRef(({ children, ...rest }: BasicCategoryBtnProps, ref: any) => {
  return (
    <Button
      ref={ref}
      as="a"
      isFullWidth
      width="mix"
      bg="theme.300"
      size="sm"
      _hover={{ bg: 'theme.500' }}
      {...reject(isNil, rest)}
    >
      <Text px="0">{children}</Text>
    </Button>
  )
})
BasicCategoryBtn.displayName = 'BasicCategoryBtn'
