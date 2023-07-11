import React from 'react'
import { Elem, Field, Fields, Key, Value } from '../RegulatoryMetadata.style'
import CodeAndName from '../CodeAndName'
import { GEAR_MESH_SIZE } from '../../../../../../domain/entities/backoffice'
import ReactMarkdown from 'react-markdown'

const GearsOrGearCategories = ({ list, isCategory, categoriesToGears }) => {
  return <>{Object.keys(list).length > 0
    ? Object.keys(list).map(elem => {
      const {
        code,
        name,
        meshType,
        mesh,
        remarks
      } = list[elem]

      return (<Elem key={elem}>
        <CodeAndName
          code={code}
          name={name}
          isCategory={isCategory}
          categoriesToGears={categoriesToGears}
        />
        <Fields>
          {mesh &&
          <Field>
            <Key>Maillage</Key>
            <Value isNotLastItem>
              {
                meshType === undefined &&
                `supérieur à ${mesh[0]} mm`
              }
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
          </Field>}
          {remarks &&
          <Field>
            <Key>Remarques</Key>
            <Value>
              <ReactMarkdown>
                {remarks}
              </ReactMarkdown>
            </Value>
          </Field>}
        </Fields>
      </Elem>)
    })
    : null
  }</>
}

export default GearsOrGearCategories
