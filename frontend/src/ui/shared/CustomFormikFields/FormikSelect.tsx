import { useField } from 'formik'
import { useCallback, useEffect } from 'react'
import { SelectPicker, TagPicker, TagPickerProps } from 'rsuite'
import styled from 'styled-components'

import type { Option } from '../../../types'

export type FormikSelectProps = Omit<TagPickerProps, 'data' | 'onChange' | 'placeholder'> & {
  isMulti?: boolean
  label: string
  name: string
  options: Option[]
}
export function FormikSelect({
  isMulti = false,
  label,
  name,
  options,
  searchable = false,
  ...originalProps
}: FormikSelectProps) {
  const [, , helpers] = useField(name)
  const { setValue } = helpers

  const handleChange = useCallback((valueOrValues: string | string[] | null) => {
    setValue(valueOrValues ?? undefined)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => setValue(undefined), [])

  if (isMulti) {
    return (
      <StyledTagPicker
        data={options}
        onChange={handleChange}
        placeholder={label}
        searchable={searchable}
        {...originalProps}
      />
    )
  }

  return (
    <StyledSelectPicker
      data={options}
      onChange={handleChange}
      placeholder={label}
      searchable={searchable}
      {...originalProps}
    />
  )
}

const StyledSelectPicker = styled(SelectPicker)`
  display: inline-flex;
  width: 9.25rem;
`

const StyledTagPicker = styled(TagPicker)`
  cursor: pointer;
  width: 9.25rem;

  > .rs-picker-toggle {
    cursor: inherit;
  }
`
