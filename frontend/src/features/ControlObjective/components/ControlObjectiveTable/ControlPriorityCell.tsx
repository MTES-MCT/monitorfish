import { Select } from '@mtes-mct/monitor-ui'
import { Table } from 'rsuite'
import styled from 'styled-components'

const { Cell } = Table
export function ControlPriorityCell({ dataKey, onChange, ...props }) {
  const { rowData } = props
  const dataCy = `row-${rowData.id}-${dataKey}`

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <StyledCell key={rowData.id} {...props} className="table-content-editing">
      <Select
        cleanable={false}
        container={document.body}
        data-cy={dataCy}
        isLabelHidden
        isTransparent
        label="Priorité de contrôle"
        name="controlPriority"
        onChange={value => {
          const controlPriority = value ?? ''
          if (onChange) {
            onChange(rowData.id, dataKey, controlPriority)
          }
        }}
        options={[
          { label: '1', value: 1 },
          { label: '2', value: 2 },
          { label: '3', value: 3 },
          { label: '4', value: 4 }
        ]}
        searchable={false}
        value={rowData[dataKey]}
      />
    </StyledCell>
  )
}

const StyledCell = styled(Cell)`
  > div {
    padding: 4px 0 0 0 !important;
  }
`
