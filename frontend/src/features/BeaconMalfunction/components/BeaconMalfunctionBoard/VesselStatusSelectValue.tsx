import styled from 'styled-components'

export function VesselStatusSelectValue({ item, textColor }) {
  const { icon } = item

  return (
    <Value data-cy="side-window-beacon-malfunctions-vessel-status" textColor={textColor}>
      <div>{icon}</div>
      <Text title={item.label}>{item.label}</Text>
    </Value>
  )
}

const Value = styled.div<{ textColor: string }>`
  align-items: center;
  color: ${p => p.textColor} !important;
  display: flex;
`

const Text = styled.span`
  margin-left: 5px;
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
`
