import ReactMarkdown from 'react-markdown'

import { GEAR_MESH_SIZE } from '../../../../../../domain/entities/backoffice'
import { CodeAndName } from '../CodeAndName'
import { Elem, Field, Fields, Key, Value } from '../RegulatoryMetadata.style'

import type { Gear } from '../../../../../../domain/types/Gear'
import type { GearCategory, Gear as RegulatedGear } from '../../../../../../domain/types/regulation'

export type GearOrGearCategoriesProps = {
  categoriesToGears?: Map<string, Gear[]> | undefined
  isCategory?: boolean
  // TODO Check this type.
  list: Record<string, RegulatedGear> | RegulatedGear[] | Record<string, GearCategory>
}
export function GearsOrGearCategories({ categoriesToGears, isCategory = false, list }: GearOrGearCategoriesProps) {
  return (
    <>
      {Object.keys(list).length > 0
        ? Object.keys(list).map(elem => {
            const gear = list[elem]
            if (!gear) {
              return <></>
            }

            const { code, mesh, meshType, name, remarks } = gear

            return (
              <Elem key={elem}>
                <CodeAndName categoriesToGears={categoriesToGears} code={code} isCategory={isCategory} name={name} />
                <Fields>
                  {mesh && (
                    <Field>
                      <Key>Maillage</Key>
                      <Value $isNotLastItem>
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
