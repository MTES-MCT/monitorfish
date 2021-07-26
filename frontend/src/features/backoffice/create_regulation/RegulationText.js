import React, { useState } from 'react'
import styled from 'styled-components'
import { ContentLine } from '../commonStyles/Backoffice.style'
import { CustomInput, Label } from '../commonStyles/Input.style'
import { ValidateButton, CancelButton } from '../commonStyles/Buttons.style'
import { Checkbox, CheckboxGroup } from 'rsuite'
import CustomDatePicker from './create_regulation/CustomDatePicker'
import { COLORS } from '../../constants/constants'
import Tag from './create_regulation/Tag'

const INFINITE = 'infinite'

const RegulationText = props => {
  const { id, regulationText, updateRegulationText } = props
  const [currentRegulationTextName, setCurrentRegulationTextName] = useState(regulationText ? regulationText.name : '')
  const [currentRegulationTextURL, setCurrentRegulationTextURL] = useState(regulationText ? regulationText.URL : '')
  const [currentStartDate, setCurrentStartDate] = useState(regulationText ? regulationText.startDate : undefined)
  const [currentEndDate, setCurrentEndDate] = useState(regulationText ? regulationText.endDate : undefined)
  const [currentTextType, setCurrentTextType] = useState(regulationText && regulationText.textType ? regulationText.textType : [])
  const [isEditing, setIsEditing] = useState(false)

  const [nameIsRequired, setNameIsRequired] = useState(false)
  const [URLIsrequired, setURLIsrequired] = useState(false)
  const [startDateIsRequired, setStartDateIsRequired] = useState(false)
  const [endDateIsRequired, setEndDateIsRequired] = useState(false)
  const [textTypeIsRequired, setTextTypeIsRequired] = useState(false)

  const updateOrAddRegulationText = () => {
    if (!checkRequiredValueOnSubmit()) {
      const updatedRegulationText = {
        name: currentRegulationTextName,
        URL: currentRegulationTextURL,
        startDate: currentStartDate,
        endDate: currentEndDate,
        textType: currentTextType
      }
      updateRegulationText(regulationText ? id : undefined, updatedRegulationText)
    }
  }

  const checkRequiredValueOnSubmit = () => {
    let required = !currentRegulationTextName || currentRegulationTextName === ''
    let oneValueIsMissing = required
    setNameIsRequired(required)
    required = !currentRegulationTextURL || currentRegulationTextURL === ''
    oneValueIsMissing = oneValueIsMissing || required
    setURLIsrequired(required)
    required = !currentStartDate
    oneValueIsMissing = oneValueIsMissing || required
    setStartDateIsRequired(required)
    required = !currentEndDate
    oneValueIsMissing = oneValueIsMissing || required
    setEndDateIsRequired(required)
    required = currentTextType.length === 0
    oneValueIsMissing = oneValueIsMissing || required
    setTextTypeIsRequired(required)
    return oneValueIsMissing
  }

  const cancelAddNewRegulationText = () => {
    setIsEditing(false)
    setCurrentRegulationTextName(regulationText ? regulationText.name : '')
    setCurrentRegulationTextURL(regulationText ? regulationText.URL : '')
    setCurrentStartDate(regulationText ? regulationText.startDate : undefined)
    setCurrentEndDate(regulationText ? regulationText.endDate : undefined)
    setCurrentTextType(regulationText && regulationText.textType ? regulationText.textType : [])
  }

  const onNameValueChange = (value) => {
    if (!isEditing) {
      setIsEditing(true)
    }
    setCurrentRegulationTextName(value)
  }

  const onURLValueChange = (value) => {
    if (!isEditing) {
      setIsEditing(true)
    }
    setCurrentRegulationTextURL(value)
  }

  return <>
    <ContentLine>
      <Label>{`Texte réglementaire ${regulationText ? id + 1 : 1}`}</Label>
      {isEditing || regulationText === undefined || regulationText === {}
        ? <>
          <CustomInput
            isRed={nameIsRequired}
            placeholder='Nom'
            width={'250px'}
            value={currentRegulationTextName}
            onChange={value => onNameValueChange(value)}
          />
          <CustomInput
            isRed={URLIsrequired}
            placeholder='URL'
            width={'250px'}
            value={currentRegulationTextURL}
            onChange={value => onURLValueChange(value)}
          />
          <ValidateButton
            disabled={false}
            isLast={false}
            onClick={updateOrAddRegulationText}>
            Enregistrer
          </ValidateButton>
          <CancelButton
            disabled={false}
            isLast={false}
            onClick={cancelAddNewRegulationText}>
            Annuler
          </CancelButton>
          </>
        : <Tag
            selectedValue={currentRegulationTextName}
            onCloseIconClicked={_ => updateRegulationText(id)}
            isLink
          />
    }
    </ContentLine>
    <ContentLine>
      <Label>Type de texte</Label>
      <CheckboxGroup
        inline
        name="checkboxList"
        value={currentTextType}
        onChange={setCurrentTextType}
      >
        <CustomCheckbox
          isRequired={textTypeIsRequired}
          value='create'
        >création de la zone</CustomCheckbox>
        <CustomCheckbox
          isRequired={textTypeIsRequired}
          value='regulation'
        >réglementation de la zone</CustomCheckbox>
      </CheckboxGroup>
    </ContentLine>
    <ContentLine>
      <Label>Début de validité</Label>
      <CustomDatePicker
        isRequired={startDateIsRequired}
        value={currentStartDate}
        onChange={setCurrentStartDate}
        onOk={setCurrentStartDate}
      />
    </ContentLine>
    <ContentLine>
      <Label>Fin de validité</Label>
      <CustomDatePicker
        isRequired={endDateIsRequired}
        value={currentEndDate === INFINITE ? undefined : currentEndDate}
        onChange={setCurrentEndDate}
        onOk={setCurrentEndDate}
      />
      <Or>&nbsp;ou</Or>
      <CustomCheckbox
        isRequired={endDateIsRequired}
        checked={currentEndDate === INFINITE}
        onChange={_ => setCurrentEndDate(INFINITE)}
      >{"jusqu'à nouvel ordre"}</CustomCheckbox>
    </ContentLine>
  </>
}

const CustomCheckbox = styled(Checkbox)`
  padding-right: 15px;
  font-size: 13px;
  color: ${COLORS.grayDarkerThree};
  .rs-checkbox-wrapper {
    top: 0px !important;
    left: 0px !important;
  }
  .rs-checkbox-inner {
    &:before {
      border: 2px solid ${props => props.isRequired ? COLORS.red : COLORS.grayDarker} !important;
    }
  }
`
const Or = styled.span`
  padding: 0 10px;
  color: ${COLORS.textGray};
  font-size: 13px;
`

export default RegulationText
