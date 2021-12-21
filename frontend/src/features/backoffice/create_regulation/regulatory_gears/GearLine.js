import React from 'react'
import styled from 'styled-components'
import { Label, CustomInput } from '../../../commonStyles/Input.style'
import { ContentLine } from '../../../commonStyles/Backoffice.style'
import CustomSelectComponent from '../custom_form/CustomSelectComponent'
import Tag from '../Tag'
import MenuItem from '../custom_form/MenuItem'

const GearLine = (props) => {
  const {
    id,
    label,
    code,
    allowMesh,
    onChange,
    onCloseIconClicked,
    meshType,
    mesh
  } = props
  return (<>
      <ContentLine data-cy='regulatory-gear-line'>
        <Label>{code ? `Engin ${id + 1}` : `Catégorie ${id + 1}`}</Label>
        <Tag
          tagValue={`${label}${code ? ` (${code})` : ''}`}
          onCloseIconClicked={onCloseIconClicked}
        />
      </ContentLine>
      {allowMesh && <ContentLine>
        <Label data-cy='mesh-label' >Maillage</Label>
        <CustomSelectComponent
          value={meshType || 'greaterThan'}
          onChange={value => onChange('meshType', value)}
          data={[{
            value: 'greaterThan',
            label: 'supérieur ou égal à'
          }, {
            value: 'between',
            label: 'entre'
          }]}
          renderMenuItem={(_, item) =>
            <MenuItem item={item} />}
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
    </>
  )
}
const SecondCustomInput = styled(CustomInput)` 
  margin-left: 10px;
`
export default GearLine
