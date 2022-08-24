import React from 'react'
import styled from 'styled-components'

import { GEAR_MESH_SIZE } from '../../../../domain/entities/backoffice'
import { ContentLine } from '../../../commonStyles/Backoffice.style'
import { Label, CustomInput } from '../../../commonStyles/Input.style'
import CustomSelectComponent from '../custom_form/CustomSelectComponent'
import MenuItem from '../custom_form/MenuItem'
import Tag from '../Tag'

function RegulatedGear(props) {
  const { allowMesh, code, id, label, mesh, meshType, onChange, onCloseIconClicked, remarks } = props

  return (
    <Wrapper>
      <ContentLine data-cy="regulatory-gear-line">
        <Label>{code ? `Engin ${id + 1}` : `Catégorie ${id + 1}`}</Label>
        <Tag onCloseIconClicked={onCloseIconClicked} tagValue={`${label}${code ? ` (${code})` : ''}`} />
      </ContentLine>
      {allowMesh && (
        <ContentLine>
          <Label data-cy="mesh-label">Maillage</Label>
          <CustomSelectComponent
            cleanable={false}
            data={[
              {
                label: 'supérieur à',
                value: GEAR_MESH_SIZE.greaterThan,
              },
              {
                label: 'supérieur ou égal à',
                value: GEAR_MESH_SIZE.greaterThanOrEqualTo,
              },
              {
                label: 'inférieur à',
                value: GEAR_MESH_SIZE.lowerThan,
              },
              {
                label: 'inférieur ou égal à',
                value: GEAR_MESH_SIZE.lowerThanOrEqualTo,
              },
              {
                label: 'égal à',
                value: GEAR_MESH_SIZE.equal,
              },
              {
                label: 'entre',
                value: GEAR_MESH_SIZE.between,
              },
            ]}
            onChange={value => onChange('meshType', value)}
            renderMenuItem={(_, item) => <MenuItem item={item} />}
            searchable={false}
            value={meshType || GEAR_MESH_SIZE.greaterThan}
            valueIsMissing={false}
            width={165}
          />
          <CustomInput
            $isGray={mesh && mesh[0] !== ''}
            onChange={intervalValue => {
              const nextIntervalValue = mesh ? [...mesh] : []
              nextIntervalValue[0] = intervalValue
              onChange('mesh', nextIntervalValue)
            }}
            value={mesh?.length > 0 ? mesh[0] : ''}
            width="60px"
          />
          {meshType && meshType === 'between' && (
            <>
              et
              <SecondCustomInput
                $isGray={mesh && mesh.length === 2 && mesh[1] !== ''}
                onChange={value => {
                  onChange('mesh', [mesh[0], value])
                }}
                value={mesh && mesh.length === 2 ? mesh[1] : ''}
                width="60px"
              />
            </>
          )}
          mm
        </ContentLine>
      )}
      <ContentLine alignedToTop>
        <Label>Remarques</Label>
        <CustomInput
          $isGray={remarks}
          as="textarea"
          data-cy="regulatory-gears-remarks"
          onChange={event => onChange('remarks', event.target.value)}
          placeholder=""
          rows={2}
          value={remarks || ''}
          width="300px"
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
