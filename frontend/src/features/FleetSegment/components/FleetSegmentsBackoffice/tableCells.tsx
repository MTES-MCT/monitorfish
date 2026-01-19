import { Accent, Icon, IconButton, Tag, THEME } from '@mtes-mct/monitor-ui'
import { Table } from 'rsuite'
import styled from 'styled-components'

const { Cell } = Table

export function TagsCell({ dataKey, id, ...props }) {
  const { rowData } = props

  return (
    <Wrapper>
      <Cell
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        title={rowData[dataKey]?.join(', ')}
      >
        <TagOnly id={id}>
          {rowData[dataKey]?.map(tag => (
            <Tag key={tag} backgroundColor={THEME.color.gainsboro}>
              {tag}
            </Tag>
          ))}
        </TagOnly>
      </Cell>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  .rs-table-cell-content {
    padding-left: 5px;
    padding-top: 0;
  }
`
const TagOnly = styled.div`
  margin-top: 7px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`

export function EditAndDeleteCell({ id, onDelete, onEdit, ...props }) {
  const { rowData } = props

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Cell key={rowData[id]} {...props} style={{ display: 'flex', padding: '5px 5px' }}>
      <IconButton
        accent={Accent.TERTIARY}
        data-cy={`edit-row-${rowData[id]}`}
        Icon={Icon.EditUnbordered}
        iconSize={20}
        onClick={() => onEdit(rowData)}
        title="Editer la ligne"
      />
      <IconButton
        accent={Accent.TERTIARY}
        data-cy={`delete-row-${rowData[id]}`}
        Icon={Icon.Delete}
        iconSize={20}
        onClick={() => onDelete(rowData[id])}
        style={{ marginLeft: 7 }}
        title="Supprimer la ligne"
      />
    </Cell>
  )
}
