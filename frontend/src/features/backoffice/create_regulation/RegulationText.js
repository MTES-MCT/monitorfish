import React, { useState } from 'react'
import styled from 'styled-components'
import { ContentLine } from '../commonStyles/Backoffice.style'
import { CustomInput, Label } from '../commonStyles/Input.style'
import { ValidateButton, CancelButton } from '../commonStyles/Buttons.style'
import { Checkbox, CheckboxGroup } from 'rsuite'
import CustomDatePicker from './create_regulation/CustomDatePicker'
import { COLORS, INFINITE } from '../../constants/constants'
import Tag from './create_regulation/Tag'

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
  /* const [startDateIsRequired, setStartDateIsRequired] = useState(false)
  const [endDateIsRequired, setEndDateIsRequired] = useState(false)
  const [textTypeIsRequired, setTextTypeIsRequired] = useState(false) */

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
    // add check that it is an url with a regex
    oneValueIsMissing = oneValueIsMissing || required
    setURLIsrequired(required)
    /* required = !currentStartDate
    oneValueIsMissing = oneValueIsMissing || required
    setStartDateIsRequired(required)
    required = !currentEndDate
    oneValueIsMissing = oneValueIsMissing || required
    setEndDateIsRequired(required)
    required = currentTextType.length === 0
    oneValueIsMissing = oneValueIsMissing || required
    setTextTypeIsRequired(required) */
    return oneValueIsMissing
  }

  const cancelAddNewRegulationText = () => {
    setIsEditing(true)
    setCurrentRegulationTextName('')
    setCurrentRegulationTextURL('')
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

  const getValidityDate = () => {
    const options = { day: '2-digit', year: 'numeric', month: '2-digit' }
    const startDate = currentStartDate.toLocaleDateString('fr-FR', options)
    const endDate = currentEndDate === INFINITE ? currentEndDate : currentEndDate.toLocaleDateString('fr-FR', options)
    return `Valide du ${startDate} ${currentEndDate === INFINITE ? 'jusqu\'à nouvel ordre' : `au ${endDate}`}.`
  }

  const onCloseIconClicked = () => {
    setIsEditing(true)
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
          {(currentRegulationTextName || currentRegulationTextURL) &&
            <><ValidateButton
              disabled={false}
              isLast={false}
              onClick={updateOrAddRegulationText}>
              Enregistrer
            </ValidateButton>
            <CancelButton
              disabled={false}
              isLast={false}
              onClick={cancelAddNewRegulationText}>
              Effacer
            </CancelButton></>}
          </>
        : <Tag
            selectedValue={currentRegulationTextName}
            selectedURL={currentRegulationTextURL}
            onCloseIconClicked={onCloseIconClicked}
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
          // isRequired={textTypeIsRequired}
          value='create'
        >création de la zone</CustomCheckbox>
        <CustomCheckbox
          // isRequired={textTypeIsRequired}
          value='regulation'
        >réglementation de la zone</CustomCheckbox>
      </CheckboxGroup>
    </ContentLine>
    <ContentLine>
      <Label>Début de validité</Label>
      <CustomDatePicker
        // isRequired={startDateIsRequired}
        value={currentStartDate}
        onChange={setCurrentStartDate}
        onOk={setCurrentStartDate}
        format='DD/MM/YYYY'
      />
    </ContentLine>
    <ContentLine>
      <Label>Fin de validité</Label>
      <CustomDatePicker
        // isRequired={endDateIsRequired}
        value={currentEndDate === INFINITE ? undefined : currentEndDate}
        onChange={setCurrentEndDate}
        onOk={setCurrentEndDate}
        format='DD/MM/YYYY'
      />
      <Or>&nbsp;ou</Or>
      <CustomCheckbox
        // isRequired={endDateIsRequired}
        checked={currentEndDate === INFINITE}
        onChange={_ => setCurrentEndDate(INFINITE)}
      >{"jusqu'à nouvel ordre"}</CustomCheckbox>
    </ContentLine>
    {currentStartDate && currentEndDate && <ValidyDateLine>
        <ValidityDate>{getValidityDate()}</ValidityDate>
    </ValidyDateLine>}
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

const ValidyDateLine = styled(ContentLine)`
  background-color: ${COLORS.grayBackground};
  width: 484px;
  padding: 10px;
`

const ValidityDate = styled.span`
  font-size: 13px;
`

export default RegulationText
