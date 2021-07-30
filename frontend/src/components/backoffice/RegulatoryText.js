import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { ContentLine } from '../commonStyles/Backoffice.style'
import { CustomInput, Label } from '../commonStyles/Input.style'
import { ValidateButton, CancelButton } from '../commonStyles/Buttons.style'
import { Checkbox, CheckboxGroup } from 'rsuite'
import CustomDatePicker from './create_regulation/CustomDatePicker'
import { COLORS, INFINITE } from '../../constants/constants'
import Tag from './create_regulation/Tag'

/**
 * RegulatoryText props
 * @type {number} id
 * @type {RegulatoryText} regulatoryText
 * @type {Function} updateRegulationText
 */
const RegulatoryText = props => {
  const {
    id,
    regulatoryText,
    /**
     * @function updateRegulationText
     * update the value of an object at a given list index
     * @param {number} regulatoryTextId
     * @parem {RegulatoryText} newRegulatoryText
     */
    updateRegulationText
  } = props
  const [currentRegulationTextName, setCurrentRegulationTextName] = useState()
  const [currentRegulationTextURL, setCurrentRegulationTextURL] = useState()
  const [currentStartDate, setCurrentStartDate] = useState()
  const [currentEndDate, setCurrentEndDate] = useState()
  const [currentTextType, setCurrentTextType] = useState()

  const [isEditing, setIsEditing] = useState(false)
  const [nameIsRequired, setNameIsRequired] = useState(false)
  const [URLIsrequired, setURLIsrequired] = useState(false)
  /* const [startDateIsRequired, setStartDateIsRequired] = useState(false)
  const [endDateIsRequired, setEndDateIsRequired] = useState(false)
  const [textTypeIsRequired, setTextTypeIsRequired] = useState(false) */

  const initFormValues = () => {
    setCurrentRegulationTextName(regulatoryText.name || '')
    setCurrentRegulationTextURL(regulatoryText.URL || '')
    setCurrentStartDate(regulatoryText.startDate || '')
    setCurrentEndDate(regulatoryText.endDate || '')
    setCurrentTextType(regulatoryText.textType || [])
  }

  useEffect(() => {
    initFormValues()
  }, [regulatoryText])

  /**
   * @funtion updateOrAddRegulatoryText
   * Create a new regulatory text object
   * with the current values.
   * And call updateRegulationText() function
   */
  const updateOrAddRegulatoryText = () => {
    const updatedRegulationText = {
      name: currentRegulationTextName,
      URL: currentRegulationTextURL,
      startDate: currentStartDate,
      endDate: currentEndDate,
      textType: currentTextType
    }
    updateRegulationText(regulatoryText ? id : undefined, updatedRegulationText)
  }

  /* const checkRequiredValueOnSubmit = () => {
    let required = !currentRegulationTextName || currentRegulationTextName === ''
    let oneValueIsMissing = required
    setNameIsRequired(required)
    required = !currentRegulationTextURL || currentRegulationTextURL === ''
    // add check that it is an url with a regex
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
  } */

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

  const onCloseIconClicked = () => {
    setIsEditing(true)
  }

  /**
   * @function onValidateButtonClicked
   * check the required values
   * if no value are missing
   * update the regulatory text object
   */
  const onValidateButtonClicked = () => {
    let required = !currentRegulationTextName || currentRegulationTextName === ''
    let oneValueIsMissing = required
    setNameIsRequired(required)
    required = !currentRegulationTextURL || currentRegulationTextURL === ''
    oneValueIsMissing = oneValueIsMissing || required
    setURLIsrequired(required)
    if (!oneValueIsMissing) {
      setIsEditing(false)
      updateOrAddRegulatoryText()
    }
  }

  /**
  * @enum {RegulatoryTextType}
  */
  const REGULATORY_TEXT_TYPE = {
    CREATION: 'creation',
    REGULATION: 'regulation'
  }

  return <>
    <ContentLine>
      <Label>{`Texte réglementaire ${regulatoryText ? id + 1 : 1}`}</Label>
      {isEditing || regulatoryText === undefined || Object.keys(regulatoryText).length === 0
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
              onClick={onValidateButtonClicked}>
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
          value={REGULATORY_TEXT_TYPE.CREATION}
        >création de la zone</CustomCheckbox>
        <CustomCheckbox
          // isRequired={textTypeIsRequired}
          value={REGULATORY_TEXT_TYPE.REGULATION}
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
        value={currentEndDate === INFINITE ? '' : currentEndDate}
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
    <ContentLine>
      <CancelButton
        disabled={false}
        isLast={false}
        onClick={_ => updateRegulationText(id)}>
        Supprimer le texte
      </CancelButton>
    </ContentLine>
    <Delimiter />
  </>
}

const Delimiter = styled.div`
  width: 700px;
  border-bottom: 1px solid ${COLORS.grayDarker};
  margin-bottom: 15px;
`
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
  .rs-checkbox-checker {
    padding-top: 0px !important;
    padding-left: 24px !important;
} 
`
const Or = styled.span`
  padding: 0 10px;
  color: ${COLORS.textGray};
  font-size: 13px;
`

export default RegulatoryText
