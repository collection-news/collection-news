import { Button, ButtonGroup, ButtonProps, Text, Flex, Tooltip } from '@chakra-ui/react'
import Link from 'next/link'
import * as React from 'react'
import { forwardRef } from 'react'
import HScrollBar from './HScrollBar'
import { getCategoryColor } from '../utils/dataHelper'
import { CategoryItem } from '../types/mediaMeta'

type CategoryListProps = {
  categoryList: CategoryItem[]
  getHref: (prop: { date?: string; category?: string }) => string
  currentCategory: CategoryItem | null
  total: number
}

export const CategoryList = ({ getHref, total, categoryList, currentCategory }: CategoryListProps) => {
  return (
    <Flex justifyContent="center" bg="theme.300" position="sticky" top="header" zIndex="sticky" color="white">
      <Link href={{ pathname: getHref({}) }}>
        <BasicCategoryBtn data-cy="show-all-category-btn" bg="theme.400" count={total}>
          全部
        </BasicCategoryBtn>
      </Link>
      <HScrollBar>
        <ButtonGroup spacing="0">
          {categoryList.map(({ chiName, engName, range: [, lastDay], count }) => (
            <CategoryBtn
              key={engName}
              text={chiName}
              category={engName}
              color={getCategoryColor(engName)}
              href={getHref({ category: engName, date: lastDay })}
              isInCategory={currentCategory?.engName === engName}
              count={count}
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
  isInCategory: boolean
  count: number
}

const CategoryBtn = ({ text, category, color, href, isInCategory, count }: CategoryBtnProps) => {
  return (
    <Link
      href={{
        pathname: href,
      }}
    >
      <BasicCategoryBtn
        _hover={{ bg: color }}
        data-cy={`category-${category}-btn`}
        bg={isInCategory ? color : undefined}
        count={count}
      >
        {text}
      </BasicCategoryBtn>
    </Link>
  )
}

type BasicCategoryBtnProps = {
  children: React.ReactNode
  count: number
} & ButtonProps

const BasicCategoryBtn = forwardRef(({ children, count, ...rest }: BasicCategoryBtnProps, ref: any) => {
  return (
    <Tooltip label={`${count}篇文章`}>
      <Button ref={ref} width="full" bg="theme.300" size="sm" _hover={{ bg: 'theme.500' }} {...rest}>
        <Text px="0">{children}</Text>
      </Button>
    </Tooltip>
  )
})
BasicCategoryBtn.displayName = 'BasicCategoryBtn'
