import React from 'react'
import styled from 'styled-components'

export const VesselStatusSelectValue = ({ item }) => {
  const { icon } = item

  return (<Value>
      {icon}
      <Text>
        {item.label}
      </Text>
      </Value>
  )
}

const Value = styled.div`
  color: #282F3E; 
`

const Text = styled.span`
  margin-left: 5px;
`
