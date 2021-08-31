import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'
import { ContentLine, Delimiter } from '../../commonStyles/Backoffice.style'
import { CustomInput, Label } from '../../commonStyles/Input.style'
import { ValidateButton, CancelButton } from '../../commonStyles/Buttons.style'
import { Checkbox, CheckboxGroup } from 'rsuite'
import CustomDatePicker from './CustomDatePicker'
import { COLORS, INFINITE } from '../../../constants/constants'
import { setRegulatoryTextHasValueMissing } from '../Regulation.slice'
import Tag from './Tag'

/**
 * RegulatoryText props
 * @type {Number} id
 * @type {RegulatoryText} regulatoryText
 * @type {Function} updateRegulatoryText
 * @type {Boolean} saveForm
 */
const RegulatoryText = props => {
  const {
    id,
    regulatoryText,
    updateRegulatoryText,
    saveForm
  } = props

  /**
  * @enum {RegulatoryTextType}
  */
  const REGULATORY_TEXT_TYPE = {
    CREATION: 'creation',
    REGULATION: 'regulation'
  }

  const dispatch = useDispatch()

  /** @type {String} currentRegulatoryTextName */
  const [currentRegulatoryTextName, setCurrentRegulatoryTextName] = useState('')
  /** @type {String} currentRegulatoryTextURL */
  const [currentRegulatoryTextURL, setCurrentRegulatoryTextURL] = useState('')
  /** @type {String} currentStartDate */
  const [currentStartDate, setCurrentStartDate] = useState()
  /** @type {String} currentEndDate */
  const [currentEndDate, setCurrentEndDate] = useState()
  /** @type {[RegulatoryTextType]} currentTextType */
  const [currentTextType, setCurrentTextType] = useState([])

  /** @type {Boolean} isEditing */
  const [isEditing, setIsEditing] = useState(false)
  /** @type {Boolean} nameIsRequired */
  const [nameIsRequired, setNameIsRequired] = useState(false)
  /** @type {Boolean} URLIsrequired */
  const [URLIsrequired, setURLIsrequired] = useState(false)
  /** @type {Boolean} startDateIsRequired */
  const [startDateIsRequired, setStartDateIsRequired] = useState(false)
  /** @type {Boolean} endDateIsRequired */
  const [endDateIsRequired, setEndDateIsRequired] = useState(false)
  /** @type {Boolean} textTypeIsRequired */
  const [textTypeIsRequired, setTextTypeIsRequired] = useState(false)
  
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
    setCurrentStartDate(startDate || undefined)
    setCurrentEndDate(endDate || undefined)
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
    const updatedRegulatoryText = {
      name: currentRegulatoryTextName,
      URL: currentRegulatoryTextURL,
      startDate: currentStartDate,
      endDate: currentEndDate,
      textType: currentTextType
    }
    updateRegulatoryText(regulatoryText ? id : undefined, updatedRegulatoryText)
  }

  /**
   * @function checkRequiredValueOnSubmit
   * @returns true if a regulatory text form value is missing or incorrect, else false
   */
  const checkRequiredValueOnSubmit = () => {
    let required = !currentRegulatoryTextName || currentRegulatoryTextName === ''
    let oneValueIsMissing = required
    setNameIsRequired(required)
    required = !currentRegulatoryTextURL ||
      currentRegulatoryTextURL ||
      !checkURL(currentRegulatoryTextURL)
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
    dispatch(setRegulatoryTextHasValueMissing(oneValueIsMissing))
    return oneValueIsMissing
  }

  useEffect(() => {
    if (saveForm) {
      checkRequiredValueOnSubmit()
    }
  }, [saveForm])

  /**
   * @function checkUrl
   * @param {String} url
   * @returns true if the url parameter is a correct url, else false
   */
  const checkURL = (url) => {
    const regex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/
    return regex.test(url)
  }

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
    required = !currentRegulatoryTextURL ||
      currentRegulatoryTextURL === '' ||
      !checkURL(currentRegulatoryTextURL)
    oneValueIsMissing = oneValueIsMissing || required
    setURLIsrequired(required)
    if (!oneValueIsMissing) {
      setIsEditing(false)
      updateOrAddRegulatoryText()
    }
  }

  return <>
    <ContentLine>
      <Label>{`Texte réglementaire ${regulatoryText ? id + 1 : 1}`}</Label>
      {isEditing
        ? <>
          <CustomInput
            placeholder={'Nom'}
            $isred={nameIsRequired}
            width={'250px'}
            value={currentRegulatoryTextName}
            onChange={onNameValueChange}
          />
          <CustomInput
            placeholder={'URL'}
            $isred={URLIsrequired}
            width={'250px'}
            value={currentRegulatoryTextURL}
            onChange={onURLValueChange}
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
      <CustomCheckboxGroup
        inline
        name="checkboxList"
        value={currentTextType}
        onChange={setCurrentTextType}
      >
        <CustomCheckbox
          $isrequired={textTypeIsRequired}
          value={REGULATORY_TEXT_TYPE.CREATION}
        >création de la zone</CustomCheckbox>
        <CustomCheckbox
          $isrequired={textTypeIsRequired}
          value={REGULATORY_TEXT_TYPE.REGULATION}
        >réglementation de la zone</CustomCheckbox>
      </CustomCheckboxGroup>
    </ContentLine>
    <ContentLine>
      <Label>Début de validité</Label>
      <CustomDatePicker
        $isrequired={startDateIsRequired}
        value={currentStartDate}
        onChange={(date) => setCurrentStartDate(date)(date)}
        onOk={(date, _) => setCurrentEndDate(date)}
        format='DD/MM/YYYY'
        placement={'rightStart'}
      />
    </ContentLine>
    <ContentLine>
      <Label>Fin de validité</Label>
      <CustomDatePicker
        $isrequired={endDateIsRequired}
        value={currentEndDate === INFINITE ? '' : currentEndDate}
        onChange={(date) => setCurrentStartDate(date)}
        onOk={(date, _) => setCurrentEndDate(date)}
        format='DD/MM/YYYY'
        placement={'rightEnd'}
      />
      <Or>&nbsp;ou</Or>
      <CustomCheckbox
        $isrequired={endDateIsRequired}
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

const CustomCheckboxGroup = styled(CheckboxGroup)`
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
`

const CustomCheckbox = styled(Checkbox)`
  padding-right: 15px;
  font-size: 13px;
  color: ${COLORS.gunMetal};
  display: flex;
  vertical-align: baseline;
  .rs-checkbox-wrapper {
    top: 0px !important;
    left: 0px !important;
  }
  .rs-checkbox-inner {
    &:before {
      border: 2px solid ${props => props.$isrequired ? COLORS.red : COLORS.lightGray} !important;
      box-sizing: border-box;
    }
  }
  .rs-checkbox-checker {
    padding-top: 0px !important;
    padding-left: 24px !important;
} 
`
const Or = styled.span`
  padding: 0 10px;
  color: ${COLORS.slateGray};
  font-size: 13px;
`

export default RegulatoryText
