import React, { useMemo } from 'react'
import { Td, Table, Tbody, Thead, Tr, Th } from '@chakra-ui/react'

type Props<T extends {}> = {
  header: T[]
  rows: T[][]
  itemRender: (item: T) => React.ReactNode
}

export const TableBlock = <T extends {}>({ header, rows, itemRender }: Props<T>) => {
  return (
    <Table variant="simple">
      <Thead>
        <Tr>
          {header.map((item, i) => (
            <Th key={i}>{itemRender(item)}</Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {rows.map((row, rowIndex) => (
          <Tr key={rowIndex}>
            {row.map((item, i) => (
              <Td key={i}>{itemRender(item)}</Td>
            ))}
          </Tr>
        ))}
      </Tbody>
    </Table>
  )
}
