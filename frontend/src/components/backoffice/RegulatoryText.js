import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { ContentLine, Delimiter } from '../commonStyles/Backoffice.style'
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
 * @type {Function} updateRegulatoryText
 */
const RegulatoryText = props => {
  const {
    id,
    regulatoryText,
    /**
     * @function updateRegulatoryText
     * update the value of an object at a given list index
     * @param {number} regulatoryTextId
     * @parem {RegulatoryText} newRegulatoryText
     */
    updateRegulatoryText
  } = props
  const [currentRegulatoryTextName, setCurrentRegulatoryTextName] = useState()
  const [currentRegulatoryTextURL, setCurrentRegulatoryTextURL] = useState()
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
    const {
      name,
      URL,
      startDate,
      endDate,
      textType
    } = regulatoryText
    setCurrentRegulatoryTextName(name || '')
    setCurrentRegulatoryTextURL(URL || '')
    setCurrentStartDate(startDate || '')
    setCurrentEndDate(endDate || '')
    setCurrentTextType(textType || [])
    setIsEditing(name === undefined || name === '' || URL === undefined || URL === '')
  }

  useEffect(() => {
    initFormValues()
  }, [])

  useEffect(() => {
    if ((currentStartDate && currentStartDate !== '') ||
    (currentEndDate && currentEndDate !== '') ||
    (currentTextType && currentTextType !== '')) {
      updateOrAddRegulatoryText()
    }
  }, [currentStartDate, currentEndDate, currentTextType])

  /**
   * @funtion updateOrAddRegulatoryText
   * Create a new regulatory text object
   * with the current values.
   * And call updateRegulatoryText() function
   */
  const updateOrAddRegulatoryText = () => {
    console.log('updateOrAddRegulatoryText')
    const updatedRegulatoryText = {
      name: currentRegulatoryTextName,
      URL: currentRegulatoryTextURL,
      startDate: currentStartDate,
      endDate: currentEndDate,
      textType: currentTextType
    }
    updateRegulatoryText(regulatoryText ? id : undefined, updatedRegulatoryText)
  }

  /* const checkRequiredValueOnSubmit = () => {
    let required = !currentRegulatoryTextName || currentRegulatoryTextName === ''
    let oneValueIsMissing = required
    setNameIsRequired(required)
    required = !currentRegulatoryTextURL || currentRegulatoryTextURL === ''
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

  const cancelAddNewRegulatoryText = () => {
    setIsEditing(true)
    setCurrentRegulatoryTextName('')
    setCurrentRegulatoryTextURL('')
  }

  const onNameValueChange = (value) => {
    if (!isEditing) {
      setIsEditing(true)
    }
    setCurrentRegulatoryTextName(value)
  }

  const onURLValueChange = (value) => {
    if (!isEditing) {
      setIsEditing(true)
    }
    setCurrentRegulatoryTextURL(value)
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
  const onSaveButtonClicked = () => {
    let required = !currentRegulatoryTextName || currentRegulatoryTextName === ''
    let oneValueIsMissing = required
    setNameIsRequired(required)
    required = !currentRegulatoryTextURL || currentRegulatoryTextURL === ''
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

  const onCurrentStartDateChange = (date) => {
    setCurrentStartDate(date)
    // updateOrAddRegulatoryText()
  }

  const onCurrentEndDateChange = (date) => {
    setCurrentEndDate(date)
    // updateOrAddRegulatoryText()
  }

  const onTypeChange = (type) => {
    setCurrentTextType(type)
    // updateOrAddRegulatoryText()
  }

  return <>
    <ContentLine>
      <Label>{`Texte réglementaire ${regulatoryText ? id + 1 : 1}`}</Label>
      {isEditing
        ? <>
          <CustomInput
            isRed={nameIsRequired}
            placeholder='Nom'
            width={'250px'}
            value={currentRegulatoryTextName}
            onChange={value => onNameValueChange(value)}
          />
          <CustomInput
            isRed={URLIsrequired}
            placeholder='URL'
            width={'250px'}
            value={currentRegulatoryTextURL}
            onChange={value => onURLValueChange(value)}
          />
          {(currentRegulatoryTextName || currentRegulatoryTextURL) &&
            <><ValidateButton
              disabled={false}
              isLast={false}
              onClick={onSaveButtonClicked}>
              Enregistrer
            </ValidateButton>
            <CancelButton
              disabled={false}
              isLast={false}
              onClick={cancelAddNewRegulatoryText}>
              Effacer
            </CancelButton></>}
          </>
        : <Tag
            selectedValue={currentRegulatoryTextName}
            selectedURL={currentRegulatoryTextURL}
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
        onChange={onTypeChange}
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
        onChange={(date) => onCurrentStartDateChange(date)}
        onOk={(date, _) => onCurrentStartDateChange(date)}
        format='DD/MM/YYYY'
      />
    </ContentLine>
    <ContentLine>
      <Label>Fin de validité</Label>
      <CustomDatePicker
        // isRequired={endDateIsRequired}
        value={currentEndDate === INFINITE ? '' : currentEndDate}
        onChange={(date) => onCurrentEndDateChange(date)}
        onOk={(date, _) => onCurrentEndDateChange(date)}
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
        onClick={_ => updateRegulatoryText(id)}>
        Supprimer le texte
      </CancelButton>
    </ContentLine>
    <Delimiter />
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
