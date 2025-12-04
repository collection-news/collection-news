import { Input, InputGroup, InputLeftElement, InputRightElement, IconButton } from '@chakra-ui/react'
import { BsSearch, BsX } from 'react-icons/bs'
import * as React from 'react'
import { SEARCH_PLACEHOLDER } from '../../constants/text'
import { useSearchBox, UseSearchBoxProps } from 'react-instantsearch'

export function SearchBox(props: UseSearchBoxProps) {
  const { query, refine, clear } = useSearchBox(props)
  // Local state to keep UI responsive
  const [value, setValue] = React.useState(query)

  // Sync local state with upstream query changes (e.g. from URL or reset)
  React.useEffect(() => {
    setValue(query)
  }, [query])

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
    <InputGroup size="lg">
      <InputLeftElement pointerEvents="none">
        <BsSearch color="gray.300" />
      </InputLeftElement>
      <Input
        type="text"
        placeholder={SEARCH_PLACEHOLDER}
        value={value}
        onChange={handleChange}
        autoFocus
        borderRadius="sm"
        bg="white"
        color="black"
        _placeholder={{ color: 'gray.400' }}
        data-cy="modal-search-input"
      />
      {value.length > 0 && (
        <InputRightElement>
          <IconButton
            aria-label="Clear search"
            icon={<BsX />}
            size="sm"
            variant="ghost"
            onClick={handleClear}
            color="gray.500"
          />
        </InputRightElement>
      )}
    </InputGroup>
  )
}
