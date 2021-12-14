import React from 'react'
import styled from 'styled-components'
import { Label, CustomInput } from '../../../commonStyles/Input.style'
import { ContentLine } from '../../../commonStyles/Backoffice.style'
import CustomSelectComponent from '../custom_form/CustomSelectComponent'
import Tag from '../Tag'

const GearLine = (props) => {
  const {
    id,
    label,
    code,
    onChange,
    onCloseIconClicked,
    intervalType,
    intervalValues
  } = props
  return (<>
      <ContentLine>
        <Label>{`Engin ${id + 1}`}</Label>
        <Tag
          tagValue={`${label}${code ? ` (${code})` : ''}`}
          onCloseIconClicked={onCloseIconClicked}
        />
      </ContentLine>
      <ContentLine>
        <Label>Maillage</Label>
        <CustomSelectComponent
          value={intervalType || 'greaterThan'}
          onChange={meshInterval => onChange('intervalType', meshInterval)}
          data={[{
            value: 'greaterThan',
            label: 'supérieur ou égal à'
          }, {
            value: 'between',
            label: 'entre'
          }]}
          valueIsMissing={false}
          cleanable={false}
          searchable={false}
        />
        <CustomInput
          width={'60px'}
          $isGray={intervalValues && intervalValues[0] !== ''}
          value={intervalValues ? intervalValues[0] : ''}
          onChange={intervalValue => {
            const nextIntervalValue = intervalValues ? [...intervalValues] : []
            nextIntervalValue[0] = intervalValue
            onChange('intervalValues', nextIntervalValue)
          }} />
        {
          intervalType && intervalType === 'between' &&
          <>{'et'}<SecondCustomInput
          $isGray={intervalValues && intervalValues.length === 2 && intervalValues[1] !== ''}
          width={'60px'}
          value={intervalValues && intervalValues.length === 2 ? intervalValues[1] : ''}
          onChange={intervalValue => {
            onChange('intervalValues', [intervalValues[0], intervalValue])
          }} /></>
        }
        {'mm'}
      </ContentLine>
    </>
  )
}
const SecondCustomInput = styled(CustomInput)` 
  margin-left: 10px;
`
export default GearLine
