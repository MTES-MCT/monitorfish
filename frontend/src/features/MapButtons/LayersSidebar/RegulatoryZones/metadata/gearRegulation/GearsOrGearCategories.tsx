import { Elem, Field, Fields, Key, Value } from '../RegulatoryMetadata.style'
import { CodeAndName } from '../CodeAndName'
import { GEAR_MESH_SIZE } from '../../../../../../domain/entities/backoffice'
import ReactMarkdown from 'react-markdown'
import type { GearCategory, Gear as RegulatedGear } from '../../../../../../domain/types/regulation'
import type { Gear } from '../../../../../../domain/types/Gear'

export type GearOrGearCategoriesProps = {
  // TODO Check this type.
  list: Record<string, RegulatedGear> | RegulatedGear[] | Record<string, GearCategory>
  isCategory?: boolean
  categoriesToGears?: Map<string, Gear[]> | undefined
}
export function GearsOrGearCategories({ list, isCategory = false, categoriesToGears }: GearOrGearCategoriesProps) {
  return (
    <>
      {Object.keys(list).length > 0
        ? Object.keys(list).map(elem => {
            const gear = list[elem]
            if (!gear) {
              return <></>
            }

            const { code, name, meshType, mesh, remarks } = gear

            return (
              <Elem key={elem}>
                <CodeAndName code={code} name={name} isCategory={isCategory} categoriesToGears={categoriesToGears} />
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
