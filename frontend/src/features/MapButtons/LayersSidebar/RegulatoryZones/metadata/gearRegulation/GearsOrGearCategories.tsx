import ReactMarkdown from 'react-markdown'

import { GearMeshSizeEqualityComparator } from '../../../../../../domain/entities/backoffice'
import { CodeAndName } from '../CodeAndName'
import { Elem, Field, Fields, Key, Value } from '../RegulatoryMetadata.style'

import type { Gear } from '../../../../../../domain/types/Gear'
import type { GearCategory, Gear as RegulationGear } from '../../../../../../domain/types/regulation'

export type GearOrGearCategoriesProps = {
  categoriesToGears?: Record<string, Gear[]> | undefined
  isCategory?: boolean
  list: Record<string, RegulationGear> | Record<string, GearCategory>
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

            const { mesh, meshType, name } = gear

            return (
              <Elem key={elem}>
                <CodeAndName
                  categoriesToGears={categoriesToGears}
                  code={(gear as any).code as string | undefined}
                  isCategory={isCategory}
                  name={name}
                />
                <Fields>
                  <tbody>
                    {!!mesh?.length && (
                      <Field>
                        <Key>Maillage</Key>
                        <Value $isNotLastItem>
                          {meshType === undefined && `supérieur à ${mesh[0]} mm`}
                          {meshType === GearMeshSizeEqualityComparator.greaterThan && `supérieur à ${mesh[0]} mm`}
                          {meshType === GearMeshSizeEqualityComparator.greaterThanOrEqualTo &&
                            `supérieur ou égal à ${mesh[0]} mm`}
                          {meshType === GearMeshSizeEqualityComparator.lowerThan && `inférieur à ${mesh[0]} mm`}
                          {meshType === GearMeshSizeEqualityComparator.lowerThanOrEqualTo &&
                            `inférieur ou égal à ${mesh[0]} mm`}
                          {meshType === GearMeshSizeEqualityComparator.equal && `égal à ${mesh[0]} mm`}
                          {meshType === GearMeshSizeEqualityComparator.between && `entre ${mesh[0]} et ${mesh[1]} mm`}
                        </Value>
                      </Field>
                    )}
                    {((gear as any).remarks as string | undefined) && (
                      <Field>
                        <Key>Remarques</Key>
                        <Value>
                          <ReactMarkdown>{(gear as any).remarks as string}</ReactMarkdown>
                        </Value>
                      </Field>
                    )}
                  </tbody>
                </Fields>
              </Elem>
            )
          })
        : null}
    </>
  )
}
