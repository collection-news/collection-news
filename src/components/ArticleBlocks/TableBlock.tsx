import React from 'react'
import { Table } from '@chakra-ui/react'

type Props<T extends {}> = {
  header: T[]
  rows: T[][]
  itemRender: (item: T) => React.ReactNode
}

export const TableBlock = <T extends {}>({ header, rows, itemRender }: Props<T>) => {
  return (
    <Table.Root variant="line" fontSize="md">
      <Table.Header>
        <Table.Row>
          {header.map((item, i) => (
            <Table.ColumnHeader
              key={i}
              px="6"
              py="3"
              fontSize="xs"
              fontWeight="bold"
              letterSpacing="wider"
              textTransform="uppercase"
              color="gray.600"
            >
              {itemRender(item)}
            </Table.ColumnHeader>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {rows.map((row, rowIndex) => (
          <Table.Row key={rowIndex}>
            {row.map((item, i) => (
              <Table.Cell key={i} px="6" py="4">
                {itemRender(item)}
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}
