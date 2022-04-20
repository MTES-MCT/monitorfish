import React from 'react'
import styled from 'styled-components'
import { Elem, Key, Value } from './RegulatoryMetadata.style'
import CodeAndName from './CodeAndName'
import { GEAR_MESH_SIZE } from '../../../../domain/entities/backoffice'

const GearsOrGearCategories = ({ list }) => {
  return <>{Object.keys(list).length > 0
    ? Object.keys(list).map(elem => {
      const { code, name, meshType, mesh } = list[elem]
      return (<Elem key={elem}>
        <CodeAndName code={code} name={name} />
        {mesh &&
        <Mesh>
          <Key>Maillage</Key>
          <Value>
            {
              meshType === GEAR_MESH_SIZE.greaterThan &&
              `supérieur à ${mesh[0]} mm`
            }
            {
              meshType === GEAR_MESH_SIZE.greaterThanOrEqualTo &&
              `supérieur ou égal à ${mesh[0]} mm`
            }
            {
              meshType === GEAR_MESH_SIZE.lowerThan &&
              `inférieur à ${mesh[0]} mm`
            }
            {
              meshType === GEAR_MESH_SIZE.lowerThanOrEqualTo &&
              `inférieur ou égal à ${mesh[0]} mm`
            }
            {
              meshType === GEAR_MESH_SIZE.equal &&
              `égal à ${mesh[0]} mm`
            }
            {
              meshType === GEAR_MESH_SIZE.between &&
              `entre ${mesh[0]} et ${mesh[1]} mm`
            }
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
