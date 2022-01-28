import React from 'react'
import styled from 'styled-components'
import { Elem, Label, Key, Value } from './RegulatoryMetadata.style'

const GearsOrGearCategories = ({ list }) => {
  return <>{Object.keys(list).length > 0
    ? Object.keys(list).map(elem => {
      const { code, name, meshType, mesh } = list[elem]
      return (<Elem key={elem}>
        <Label>{`${code
          ? `${code} ${name ? `(${name})` : ''}`
          : `${name ? `${name}` : ''}`
        }`}</Label>
        {mesh &&
        <Mesh><Key>Maillage</Key>
          <Value>{meshType === 'between'
            ? `entre ${mesh[0]} et ${mesh[1]} mm`
            : `supérieur ou égal à ${mesh[0]} mm`}
          </Value>
        </Mesh>}
      </Elem>)
    })
    : null
  }</>
}

const Mesh = styled.span`
  display: flex;
  flex-direction: row;
`

export default GearsOrGearCategories
