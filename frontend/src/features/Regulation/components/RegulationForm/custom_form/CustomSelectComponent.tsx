import { Select } from '@mtes-mct/monitor-ui'

import type { ReactNode } from 'react'

type CustomSelectComponentProps = Readonly<{
  cleanable?: boolean
  dataCy?: string
  disabled?: boolean
  emptyMessage?: string
  label: string
  name: string
  onChange: (value) => void
  options: any[]
  placeholder?: string
  renderMenuItem: (label: ReactNode, item: any) => JSX.Element
  searchable: boolean
  value: any
  virtualized?: boolean
  width?: number
}>
export function CustomSelectComponent({
  cleanable = true,
  dataCy = undefined,
  disabled = false,
  emptyMessage = 'Aucun résultat',
  label,
  name,
  onChange,
  options,
  placeholder = 'Sélectionner',
  renderMenuItem,
  searchable,
  value,
  virtualized = false,
  width = undefined
}: CustomSelectComponentProps) {
  return (
    <Select
      cleanable={cleanable}
      data-cy={dataCy}
      disabled={disabled}
      isLabelHidden
      isTransparent
      label={label}
      locale={
        {
          emptyMessage,
          noResultsText: emptyMessage
        } as any
      }
      name={name}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      renderMenuItem={renderMenuItem}
      searchable={searchable}
      style={{ width: width ? `${width}px` : '200px' }}
      value={value}
      virtualized={virtualized}
    />
  )
}
