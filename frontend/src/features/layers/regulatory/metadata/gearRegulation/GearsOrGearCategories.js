import React from 'react'
import ReactMarkdown from 'react-markdown'

import { GEAR_MESH_SIZE } from '../../../../../domain/entities/backoffice'
import CodeAndName from '../CodeAndName'
import { Elem, Field, Fields, Key, Value } from '../RegulatoryMetadata.style'

function GearsOrGearCategories({ categoriesToGears, isCategory, list }) {
  return (
    <>
      {Object.keys(list).length > 0
        ? Object.keys(list).map(elem => {
            const { code, mesh, meshType, name, remarks } = list[elem]

            return (
              <Elem key={elem}>
                <CodeAndName categoriesToGears={categoriesToGears} code={code} isCategory={isCategory} name={name} />
                <Fields>
                  {mesh && (
                    <Field>
                      <Key>Maillage</Key>
                      <Value isNotLastItem>
                        {meshType === undefined && `supérieur à ${mesh[0]} mm`}
                        {meshType === GEAR_MESH_SIZE.greaterThan && `supérieur à ${mesh[0]} mm`}
                        {meshType === GEAR_MESH_SIZE.greaterThanOrEqualTo && `supérieur ou égal à ${mesh[0]} mm`}
                        {meshType === GEAR_MESH_SIZE.lowerThan && `inférieur à ${mesh[0]} mm`}
                        {meshType === GEAR_MESH_SIZE.lowerThanOrEqualTo && `inférieur ou égal à ${mesh[0]} mm`}
                        {meshType === GEAR_MESH_SIZE.equal && `égal à ${mesh[0]} mm`}
                        {meshType === GEAR_MESH_SIZE.between && `entre ${mesh[0]} et ${mesh[1]} mm`}
                      </Value>
                    </Field>
                  )}
                  {remarks && (
                    <Field>
                      <Key>Remarques</Key>
                      <Value>
                        <ReactMarkdown>{remarks}</ReactMarkdown>
                      </Value>
                    </Field>
                  )}
                </Fields>
              </Elem>
            )
          })
        : null}
    </>
  )
}

export default GearsOrGearCategories
