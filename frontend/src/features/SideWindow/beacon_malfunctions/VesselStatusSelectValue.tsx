import styled from 'styled-components'

export function VesselStatusSelectValue({ item }) {
  const { icon } = item

  return (
    <Value data-cy="side-window-beacon-malfunctions-vessel-status" style={valueStyle}>
      {icon}
      <Text style={textStyle}>{item.label}</Text>
    </Value>
  )
}

const Value = styled.div``
const valueStyle = {
  color: '#282F3E'
}

const Text = styled.span``
const textStyle = {
  marginLeft: 5
}
