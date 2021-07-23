import React, { useState } from 'react'
import styled from 'styled-components'
import { ContentLine } from '../commonStyles/Backoffice.style'
import { CustomInput, Label } from '../commonStyles/Input.style'
import { ValidateButton, CancelButton } from '../commonStyles/Buttons.style'
import { Checkbox } from 'rsuite'
import CustomDatePicker from './create_regulation/CustomDatePicker'
import { COLORS } from '../../constants/constants'
import Tag from './create_regulation/Tag'

const RegulationText = props => {
  const { id, regulationText, updateRegulationText } = props
  const [currentRegulationTextName, setCurrentRegulationTextName] = useState(regulationText ? regulationText.name : '')
  const [currentRegulationTextURL, setCurrentRegulationTextURL] = useState(regulationText ? regulationText.URL : '')
  const [currentStartDate, setCurrentStartDate] = useState(regulationText ? regulationText.startDate : undefined)
  const [currentEndDate, setCurrentEndDate] = useState(regulationText && regulationText.endDate ? regulationText.endDate : 'inifinite')
  const [isEditing, setIsEditing] = useState(false)

  const [nameIsRequired, setNameIsRequired] = useState(false)
  const [URLIsrequired, setURLIsRequired] = useState(false)
  const [startDateIsRequired, setStartDateIsRequired] = useState(false)
  const [endDateIsRequired, setEndDateIsRequired] = useState(false)

  const updateOrAddRegulationText = () => {
    checkRequiredValueOnSubmit()
    if (nameIsRequired || URLIsrequired || startDateIsRequired || endDateIsRequired) {
      return
    }
    const updatedRegulationText = {
      name: currentRegulationTextName,
      URL: currentRegulationTextURL,
      startDate: currentStartDate,
      endDate: currentEndDate
    }
    console.log('updatedRegulationText')
    console.log(updatedRegulationText)
    updateRegulationText(regulationText ? id : undefined, updatedRegulationText)
  }

  const checkRequiredValueOnSubmit = () => {
    setNameIsRequired(!currentRegulationTextName || currentRegulationTextName === '')
    setURLIsRequired(!currentRegulationTextURL || currentRegulationTextURL === '')
    setStartDateIsRequired(!currentStartDate)
    setEndDateIsRequired(!currentEndDate)
  }
  const cancelAddNewRegulationText = () => {
    setIsEditing(false)
    setCurrentRegulationTextName(regulationText ? regulationText.name : '')
    setCurrentRegulationTextURL(regulationText ? regulationText.URL : '')
    setCurrentStartDate(regulationText.startDate)
    setCurrentEndDate(regulationText && regulationText.endDate ? regulationText.endDate : 'inifinite')
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
            isRed={nameIsRequired}
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
      <CustomCheckbox>création de la zone</CustomCheckbox>
      <CustomCheckbox>réglementation de la zone</CustomCheckbox>
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
        value={!currentEndDate || currentEndDate === 'infinite' ? undefined : currentEndDate}
        onChange={setCurrentEndDate}
        onOk={setCurrentEndDate}
      />
      <Or>&nbsp;ou</Or>
      <CustomCheckbox
        isRequired={endDateIsRequired}
        checked={currentEndDate === 'infinite'}
        onChange={_ => setCurrentEndDate('infinite')}
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
    &:before {
      border: 2px solid ${props => props.isRequired ? COLORS.grayDarker : COLORS.red};
    }
  }
`
const Or = styled.span`
  padding: 0 10px;
  color: ${COLORS.textGray};
  font-size: 13px;
`

export default RegulationText
