import React from 'react'
import styled from 'styled-components'
import { Label, CustomInput } from '../../../commonStyles/Input.style'
import { ContentLine } from '../../../commonStyles/Backoffice.style'
import CustomSelectComponent from '../custom_form/CustomSelectComponent'
import Tag from '../Tag'
import MenuItem from '../custom_form/MenuItem'
import { GearMeshSizeEqualityComparator } from '../../../../domain/entities/backoffice'

const RegulatedGear = props => {
  const {
    id,
    label,
    code,
    allowMesh,
    onChange,
    onCloseIconClicked,
    meshType,
    mesh,
    remarks
  } = props

  return (<Wrapper>
      <ContentLine data-cy='regulatory-gear-line'>
        <Label>{code ? `Engin ${id + 1}` : `Catégorie ${id + 1}`}</Label>
        <Tag
          tagValue={`${label}${code ? ` (${code})` : ''}`}
          onCloseIconClicked={onCloseIconClicked}
        />
      </ContentLine>
      {allowMesh && <ContentLine>
        <Label data-cy='mesh-label'>Maillage</Label>
        <CustomSelectComponent
          value={meshType || GearMeshSizeEqualityComparator.greaterThan}
          onChange={value => onChange('meshType', value)}
          data={[
            {
              value: GearMeshSizeEqualityComparator.greaterThan,
              label: 'supérieur à'
            },
            {
              value: GearMeshSizeEqualityComparator.greaterThanOrEqualTo,
              label: 'supérieur ou égal à'
            },
            {
              value: GearMeshSizeEqualityComparator.lowerThan,
              label: 'inférieur à'
            },
            {
              value: GearMeshSizeEqualityComparator.lowerThanOrEqualTo,
              label: 'inférieur ou égal à'
            },
            {
              value: GearMeshSizeEqualityComparator.equal,
              label: 'égal à'
            },
            {
              value: GearMeshSizeEqualityComparator.between,
              label: 'entre'
            }
          ]}
          renderMenuItem={(_, item) => <MenuItem item={item} />}
          valueIsMissing={false}
          cleanable={false}
          searchable={false}
          width={165}
        />
        <CustomInput
          width={'60px'}
          $isGray={mesh && mesh[0] !== ''}
          value={mesh?.length > 0 ? mesh[0] : ''}
          onChange={intervalValue => {
            const nextIntervalValue = mesh ? [...mesh] : []
            nextIntervalValue[0] = intervalValue
            onChange('mesh', nextIntervalValue)
          }} />
        {
          meshType && meshType === 'between' &&
          <>{'et'}<SecondCustomInput
          $isGray={mesh && mesh.length === 2 && mesh[1] !== ''}
          width={'60px'}
          value={mesh && mesh.length === 2 ? mesh[1] : ''}
          onChange={value => {
            onChange('mesh', [mesh[0], value])
          }} /></>
        }
        {'mm'}
      </ContentLine>}
      <ContentLine alignedToTop>
        <Label>Remarques</Label>
        <CustomInput
          data-cy={'regulatory-gears-remarks'}
          as="textarea"
          rows={2}
          placeholder=''
          value={remarks || ''}
          onChange={event => onChange('remarks', event.target.value)}
          width={'300px'}
          $isGray={remarks}
        />
      </ContentLine>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  .rs-picker-toggle {
    width: 120px;
  }
`

const SecondCustomInput = styled(CustomInput)`
  margin-left: 10px;
`

export default RegulatedGear
