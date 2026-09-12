import { Input, InputGroup, IconButton } from '@chakra-ui/react'
import { BsSearch, BsX } from 'react-icons/bs'
import * as React from 'react'
import { SEARCH_PLACEHOLDER } from '../../constants/text'
import { useSearchBox, UseSearchBoxProps } from 'react-instantsearch'

export function SearchBox(props: UseSearchBoxProps) {
  const { query, refine, clear } = useSearchBox(props)
  // Local state to keep UI responsive
  const [value, setValue] = React.useState(query)

  // Sync URL/reset changes before rendering the input, while preserving local edits.
  const [previousQuery, setPreviousQuery] = React.useState(query)
  if (query !== previousQuery) {
    setPreviousQuery(query)
    setValue(query)
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value
    setValue(newValue)
    refine(newValue)
  }

  const handleClear = () => {
    setValue('')
    clear()
  }

  return (
    <InputGroup
      startElement={<BsSearch />}
      endElement={
        value.length > 0 ? (
          <IconButton aria-label="Clear search" size="sm" variant="ghost" onClick={handleClear} color="gray.500">
            <BsX />
          </IconButton>
        ) : undefined
      }
      endElementProps={{ px: 0 }}
    >
      <Input
        autoFocus
        size="lg"
        type="text"
        placeholder={SEARCH_PLACEHOLDER}
        value={value}
        onChange={handleChange}
        borderRadius="sm"
        bg="white"
        color="black"
        _placeholder={{ color: 'gray.400' }}
        data-cy="modal-search-input"
      />
    </InputGroup>
  )
}
