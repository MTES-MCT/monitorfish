import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'
import { ContentLine, Delimiter } from '../../commonStyles/Backoffice.style'
import { CustomInput, Label } from '../../commonStyles/Input.style'
import { ValidateButton, CancelButton } from '../../commonStyles/Buttons.style'
import { Checkbox, CheckboxGroup } from 'rsuite'
import CustomDatePicker from './CustomDatePicker'
import { COLORS, INFINITE } from '../../../constants/constants'
import { addObjectToRegulatoryTextListValidityMap } from '../Regulation.slice'
import Tag from './Tag'

/**
 * @typedef {object} Props
 * @prop {Number} id
 * @prop {RegulatoryText} regulatoryText
 * @prop {Function} addOrRemoveRegulatoryTextInList
 * @prop {Boolean} saveForm
 */
const RegulatoryText = props => {
  const {
    id,
    regulatoryText,
    addOrRemoveRegulatoryTextInList,
    saveForm,
    listLength
  } = props

  /**
  * @enum {RegulatoryTextType}
  */
  const REGULATORY_TEXT_TYPE = {
    CREATION: 'creation',
    REGULATION: 'regulation'
  }

  const dispatch = useDispatch()

  /** @type {string} currentRegulatoryTextName */
  const [currentRegulatoryTextName, setCurrentRegulatoryTextName] = useState('')
  /** @type {string} currentRegulatoryTextURL */
  const [currentRegulatoryTextURL, setCurrentRegulatoryTextURL] = useState('')
  /** @type {string} currentStartDate */
  const [currentStartDate, setCurrentStartDate] = useState()
  /** @type {string} currentEndDate */
  const [currentEndDate, setCurrentEndDate] = useState()
  /** @type {[RegulatoryTextType]} currentTextType */
  const [currentTextType, setCurrentTextType] = useState([])

  /** @type {boolean} isEditing */
  const [isEditing, setIsEditing] = useState(false)
  /** @type {boolean} nameIsRequired */
  const [nameIsRequired, setNameIsRequired] = useState(false)
  /** @type {boolean} URLIsrequired */
  const [URLIsrequired, setURLIsrequired] = useState(false)
  /** @type {boolean} startDateIsRequired */
  const [startDateIsRequired, setStartDateIsRequired] = useState(false)
  /** @type {boolean} endDateIsRequired */
  const [endDateIsRequired, setEndDateIsRequired] = useState(false)
  /** @type {boolean} textTypeIsRequired */
  const [textTypeIsRequired, setTextTypeIsRequired] = useState(false)

  const initFormValues = () => {
    const {
      reference,
      url,
      startDate,
      endDate,
      textType
    } = regulatoryText
    setCurrentRegulatoryTextName(reference || '')
    setCurrentRegulatoryTextURL(url || '')
    setCurrentStartDate(startDate || '')
    setCurrentEndDate(endDate || '')
    setCurrentTextType(textType || [])
    setIsEditing(reference === undefined || reference === '' || url === undefined || url === '')
  }

  useEffect(() => {
    initFormValues()
  }, [regulatoryText])

  /**
   * @function checkUrl
   * @param {String} url
   * @returns true if the url parameter is a correct url, else false
   */
  const checkURL = (url) => {
    const regex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/
    return regex.test(url)
  }

  /**
   * @function checkNameAndUrl
   * @return true if a value is missing, else false
   */
  const checkNameAndUrl = () => {
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
      return false
    }
    return true
  }

  /**
   * @function checkOtherRequiredValues
   * @returns true if a regulatory text form value is missing or incorrect, else false
   */
  const checkOtherRequiredValues = () => {
    let required = !currentStartDate
    let oneValueIsMissing = false
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

  useEffect(() => {
    if (saveForm) {
      const payload = { id: id }
      let allValuesAreFilled = !checkNameAndUrl()
      allValuesAreFilled = !checkOtherRequiredValues() && allValuesAreFilled
      if (allValuesAreFilled) {
        const updatedRegulatoryText = {
          name: currentRegulatoryTextName,
          URL: currentRegulatoryTextURL,
          startDate: currentStartDate,
          endDate: currentEndDate,
          textType: currentTextType
        }
        payload.validity = updatedRegulatoryText
      } else {
        payload.validity = false
      }
      dispatch(addObjectToRegulatoryTextListValidityMap(payload))
    }
  }, [saveForm])

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

  const removeTextIsDisabled = () => {
    return listLength <= 1 &&
      currentTextType.length === 0 &&
      !currentStartDate && !currentEndDate &&
      (!currentRegulatoryTextName || currentRegulatoryTextName === '') &&
      (!currentRegulatoryTextURL || currentRegulatoryTextURL === '')
  }

  return <>
    <ContentLine>
      <Label>{`Texte réglementaire ${regulatoryText ? id + 1 : 1}`}</Label>
      {isEditing
        ? <>
          <CustomInput
            placeholder={'Nom'}
            $isRed={nameIsRequired}
            width={'87px'}
            value={currentRegulatoryTextName}
            onChange={onNameValueChange}
            data-cy="reg-text-name"
          />
          <CustomInput
            placeholder={'URL'}
            $isRed={URLIsrequired}
            width={'87px'}
            value={currentRegulatoryTextURL}
            onChange={onURLValueChange}
            data-cy="reg-text-url"
          />
          {(currentRegulatoryTextName || currentRegulatoryTextURL) &&
            <><ValidateButton
              disabled={false}
              isLast={false}
              onClick={checkNameAndUrl}
              data-cy="save-reg-text-name"
            >
              Enregistrer
            </ValidateButton>
            <CancelButton
              disabled={false}
              isLast={false}
              onClick={cancelAddNewRegulatoryText}
              data-cy="clear-reg-text-name"
            >
              Effacer
            </CancelButton></>}
          </>
        : <Tag
            tagValue={currentRegulatoryTextName}
            tagUrl={currentRegulatoryTextURL}
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
          $isRequired={textTypeIsRequired}
          value={REGULATORY_TEXT_TYPE.CREATION}
          data-cy={'create-zone-checkbox'}
        >création de la zone</CustomCheckbox>
        <CustomCheckbox
          $isRequired={textTypeIsRequired}
          value={REGULATORY_TEXT_TYPE.REGULATION}
          data-cy={'zone-regulation-checkbox'}
        >réglementation de la zone</CustomCheckbox>
      </CustomCheckboxGroup>
    </ContentLine>
    <ContentLine>
      <Label>Début de validité</Label>
      <CustomDatePicker
        isRequired={startDateIsRequired}
        value={currentStartDate === INFINITE ? undefined : currentStartDate}
        onChange={(date) => setCurrentStartDate(date)}
        onOk={(date, _) => setCurrentStartDate(date)}
        format='DD/MM/YYYY'
        placement={'rightStart'}
      />
    </ContentLine>
    <ContentLine>
      <Label>Fin de validité</Label>
      <CustomDatePicker
        isRequired={endDateIsRequired}
        value={currentEndDate === INFINITE ? undefined : currentEndDate}
        onChange={(date) => setCurrentEndDate(date)}
        onOk={(date, _) => setCurrentEndDate(date)}
        format='DD/MM/YYYY'
        placement={'rightEnd'}
      />
      <Or>&nbsp;ou</Or>
      <CustomCheckbox
        $isRequired={endDateIsRequired}
        checked={currentEndDate === INFINITE}
        onChange={_ => setCurrentEndDate(INFINITE)}
      >{"jusqu'à nouvel ordre"}</CustomCheckbox>
    </ContentLine>
    <CancelContentLine>
      <CancelButton
        disabled={removeTextIsDisabled()}
        isLast={false}
        onClick={_ => addOrRemoveRegulatoryTextInList(id)}>
        Supprimer le texte
      </CancelButton>
    </CancelContentLine>
    <Delimiter />
  </>
}

const CancelContentLine = styled(ContentLine)`
  margin: 16px 0px 15px 0px; 
`

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
  .rs-checkbox-wrapper .rs-checkbox-inner {
    &:before {
      border: 1px solid ${props => props.$isRequired ? COLORS.red : COLORS.lightGray} !important;
      box-sizing: border-box;
    }
    &:after {
      margin-top: 0px !important;
      margin-left: 4px !important;
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
