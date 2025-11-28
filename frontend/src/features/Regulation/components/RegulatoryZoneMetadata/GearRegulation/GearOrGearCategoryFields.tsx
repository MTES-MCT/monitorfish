import ReactMarkdown from 'react-markdown'
import styled from 'styled-components'

import { GearMeshSizeEqualityComparator } from '../../../../../domain/entities/backoffice'
import { Elem, Field, Fields, Key, Value } from '../RegulatoryMetadata.style'

import type { Gear as RegulationGear, GearCategory } from '../../../types'

export type GearOrGearCategoriesProps = {
  gearOrCategory: RegulationGear | GearCategory
}
export function GearOrGearCategoryFields({ gearOrCategory }: GearOrGearCategoriesProps) {
  return (
    <Elem>
      <Fields>
        <tbody>
          {!!gearOrCategory.mesh?.length && (
            <Field>
              <Key>Maillage</Key>
              <Value $isNotLastItem>
                {gearOrCategory.meshType === undefined && `supérieur à ${gearOrCategory.mesh[0]} mm`}
                {gearOrCategory.meshType === GearMeshSizeEqualityComparator.greaterThan &&
                  `supérieur à ${gearOrCategory.mesh[0]} mm`}
                {gearOrCategory.meshType === GearMeshSizeEqualityComparator.greaterThanOrEqualTo &&
                  `supérieur ou égal à ${gearOrCategory.mesh[0]} mm`}
                {gearOrCategory.meshType === GearMeshSizeEqualityComparator.lowerThan &&
                  `inférieur à ${gearOrCategory.mesh[0]} mm`}
                {gearOrCategory.meshType === GearMeshSizeEqualityComparator.lowerThanOrEqualTo &&
                  `inférieur ou égal à ${gearOrCategory.mesh[0]} mm`}
                {gearOrCategory.meshType === GearMeshSizeEqualityComparator.equal &&
                  `égal à ${gearOrCategory.mesh[0]} mm`}
                {gearOrCategory.meshType === GearMeshSizeEqualityComparator.between &&
                  `entre ${gearOrCategory.mesh[0]} et ${gearOrCategory.mesh[1]} mm`}
              </Value>
            </Field>
          )}
        </tbody>
      </Fields>
      {gearOrCategory.remarks && <Remarks>{gearOrCategory.remarks}</Remarks>}
    </Elem>
  )
}

const Remarks = styled(ReactMarkdown)`
  margin-left: 24px;
`
