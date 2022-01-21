import React from 'react'
import styled from 'styled-components'

export const VesselStatusSelectValue = ({ item }) => {
  const { icon } = item

  return (<Value
      data-cy={'side-window-beacon-statuses-vessel-status'}
      style={valueStyle}
    >
      {icon}
      <Text style={textStyle}>
        {item.label}
      </Text>
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
