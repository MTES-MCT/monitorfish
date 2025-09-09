import { Checkbox } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

type MenuItemProps = Readonly<{
  checked?: boolean
  item: any
  tag?: string
}>

export function MenuItem({ checked = false, item, tag }: MenuItemProps) {
  const { label } = item
  const labelToDisplay = label

  if (tag === 'Checkbox') {
    return (
      <Checkbox checked={checked} label={labelToDisplay} name={labelToDisplay} title={labelToDisplay}>
        {labelToDisplay}
      </Checkbox>
    )
  }

  return <Text>{labelToDisplay}</Text>
}

const Text = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 8px 0px 4px 10px;
`
