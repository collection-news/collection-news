import { Button, ButtonGroup, ButtonProps, Text, Flex } from '@chakra-ui/react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { Tooltip } from './ui/Tooltip'
import HScrollBar from './HScrollBar'
import { getCategoryColor } from '../utils/dataHelper'
import { CategoryItem } from '../types/mediaMeta'

type CategoryListProps = {
  categoryList: CategoryItem[]
  getHref: (prop: { date?: string; category?: string }) => string
  currentCategory: CategoryItem | null
  total: number
}

export const CategoryList = ({ getHref, total, categoryList, currentCategory }: CategoryListProps) => (
  <Flex justifyContent="center" bg="theme.300" position="sticky" top="header" zIndex="sticky" color="white">
    <CategoryButton href={getHref({})} data-cy="show-all-category-btn" bg="theme.400" count={total}>
      全部
    </CategoryButton>
    <HScrollBar>
      <ButtonGroup gap="0">
        {categoryList.map(({ chiName, engName, range: [, lastDay], count }) => {
          const color = getCategoryColor(engName)
          return (
            <CategoryButton
              key={engName}
              href={getHref({ category: engName, date: lastDay })}
              data-cy={`category-${engName}-btn`}
              bg={currentCategory?.engName === engName ? color : 'theme.300'}
              _hover={{ bg: color }}
              count={count}
            >
              {chiName}
            </CategoryButton>
          )
        })}
      </ButtonGroup>
    </HScrollBar>
  </Flex>
)

type CategoryButtonProps = ButtonProps & { href: string; count: number; children: ReactNode }

const CategoryButton = ({ children, count, href, ...props }: CategoryButtonProps) => (
  <Tooltip content={`${count}篇文章`}>
    <Button
      width="auto"
      flexShrink={0}
      bg="theme.300"
      size="sm"
      color="white"
      _hover={{ bg: 'theme.500' }}
      {...props}
      asChild
    >
      <Link href={href}>
        <Text as="span" px="0">
          {children}
        </Text>
      </Link>
    </Button>
  </Tooltip>
)
