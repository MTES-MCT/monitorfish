import React, { useEffect, useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'
import { ContentLine, Delimiter, CustomCheckbox } from '../../../commonStyles/Backoffice.style'
import { CustomInput, Label } from '../../../commonStyles/Input.style'
import { ValidateButton, CancelButton } from '../../../commonStyles/Buttons.style'
import { CheckboxGroup } from 'rsuite'
import CustomDatePicker from '../custom_form/CustomDatePicker'
import { INFINITE } from '../../constants'
import { COLORS } from '../../../../constants/constants'
import {
  addObjectToUpcomingRegulatoryTextCheckedMap,
  addObjectToRegulatoryTextCheckedMap
} from '../../Regulation.slice'
import Tag from '../Tag'
import { REGULATORY_TEXT_SOURCE } from '../../../../domain/entities/regulatory'

/**
 * @typedef {object} Props
 * @prop {Number} id
 * @prop {RegulatoryText} regulatoryText
 * @prop {Function} addOrRemoveRegulatoryTextInList
 * @prop {Boolean} saveForm
 * @prop {RegulatoryTextSource} source
 */
const RegulatoryText = props => {
  const {
    setRegulatoryText,
    id,
    regulatoryText,
    addOrRemoveRegulatoryTextInList,
    listLength,
    source,
    saveForm
  } = props

  const {
    reference,
    url,
    startDate,
    endDate,
    textType
  } = regulatoryText

  /**
  * @enum {RegulatoryTextType}
  */
  const REGULATORY_TEXT_TYPE = {
    CREATION: 'creation',
    REGULATION: 'regulation'
  }

  const dispatch = useDispatch()

  /** @type {boolean} isEditing */
  const [isEditing, setIsEditing] = useState(undefined)
  /** @type {boolean} fromForm */
  const [fromForm, setFromForm] = useState(false)
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

  const set = useCallback((key, value) => {
    const obj = {
      ...regulatoryText,
      [key]: value
    }
    setRegulatoryText(id, obj)
  })

  useEffect(() => {
    if (fromForm) {
      if (!isEditing) {
        setIsEditing(reference === undefined || reference === '' || url === undefined || url === '')
      }
    } else {
      setIsEditing(reference === undefined || reference === '' || url === undefined || url === '')
    }
  }, [reference, url, fromForm])

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
    let required = !reference || reference === ''
    let oneValueIsMissing = required
    setNameIsRequired(required)
    required = !url || url === '' || !checkURL(url)
    oneValueIsMissing = oneValueIsMissing || required
    setURLIsrequired(required)
    if (!oneValueIsMissing) {
      setFromForm(false)
      return false
    }
    return true
  }

  /**
   * @function checkOtherRequiredValues
   * @returns true if a regulatory text form value is missing or incorrect, else false
   */
  const checkOtherRequiredValues = () => {
    let oneValueIsMissing = false
    let valueIsMissing = !startDate || startDate === ''
    oneValueIsMissing = oneValueIsMissing || valueIsMissing
    setStartDateIsRequired(valueIsMissing)
    valueIsMissing = !endDate || endDate === ''
    oneValueIsMissing = oneValueIsMissing || valueIsMissing
    setEndDateIsRequired(valueIsMissing)
    valueIsMissing = !textType || textType.length === 0
    oneValueIsMissing = oneValueIsMissing || valueIsMissing
    setTextTypeIsRequired(valueIsMissing)
    return oneValueIsMissing
  }

  useEffect(() => {
    if (saveForm) {
      console.log('saveForm')
      const nameOrUrlIsMissing = checkNameAndUrl()
      const atLeastOneValueIsMissing = checkOtherRequiredValues() || nameOrUrlIsMissing
      const payload = {
        id: id,
        source: source,
        complete: !atLeastOneValueIsMissing
      }
      if (source === REGULATORY_TEXT_SOURCE.UPCOMING_REGULATION) {
        dispatch(addObjectToUpcomingRegulatoryTextCheckedMap(payload))
      } else if (source === REGULATORY_TEXT_SOURCE.REGULATION) {
        dispatch(addObjectToRegulatoryTextCheckedMap(payload))
      }
    }
  }, [saveForm, source, id])

  const cancelAddNewRegulatoryText = () => {
    setIsEditing(true)
    const obj = {
      ...regulatoryText,
      reference: '',
      url: ''
    }
    setRegulatoryText(id, obj)
  }

  const onCloseIconClicked = () => {
    setFromForm(true)
    setIsEditing(true)
  }

  const removeTextIsDisabled = () => {
    return listLength <= 1 &&
      textType?.length === 0 &&
      !startDate && !endDate &&
      (!reference || reference === '') &&
      (!url || url === '')
  }

  const onInputValueChange = (key, value) => {
    set(key, value)
    if (!fromForm) {
      setFromForm(true)
    }
  }

  return <>
    <ContentLine>
      <Label>{`Texte réglementaire ${regulatoryText ? id + 1 : 1}`}</Label>
      {isEditing
        ? <>
          <CustomInput
            placeholder={'Nom'}
            $isRed={nameIsRequired}
            width={'250px'}
            value={reference || ''}
            onChange={value => onInputValueChange('reference', value)}
            data-cy="reg-text-name"
          />
          <CustomInput
            placeholder={'URL'}
            $isRed={URLIsrequired}
            width={'250px'}
            value={url || ''}
            onChange={value => onInputValueChange('url', value)}
            data-cy="reg-text-url"
          />
          {(reference || url) &&
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
            tagValue={reference}
            tagUrl={url}
            onCloseIconClicked={onCloseIconClicked}
          />
    }
    </ContentLine>
    <ContentLine>
      <Label>Type de texte</Label>
      <CustomCheckboxGroup
        inline
        name="checkboxList"
        value={textType || []}
        onChange={value => set('textType', value)}
      >
        <CustomCheckbox
          $isRequired={textTypeIsRequired}
          value={REGULATORY_TEXT_TYPE.CREATION}
          data-cy='create-zone-checkbox'
        >création de la zone</CustomCheckbox>
        <CustomCheckbox
          $isRequired={textTypeIsRequired}
          value={REGULATORY_TEXT_TYPE.REGULATION}
          data-cy='zone-regulation-checkbox'
        >réglementation de la zone</CustomCheckbox>
      </CustomCheckboxGroup>
    </ContentLine>
    <ContentLine>
      <Label>Début de validité</Label>
      <CustomDatePicker
        key={startDate}
        isRequired={startDateIsRequired}
        value={startDate ? new Date(startDate) : new Date()}
        saveValue={date => set('startDate', date.getTime())}
        format={'DD/MM/YYYY'}
        placement={'rightStart'}
        oneTap
      />
    </ContentLine>
    <ContentLine>
      <Label>Fin de validité</Label>
      <CustomDatePicker
        key={endDate}
        isRequired={endDateIsRequired}
        value={(!endDate || endDate === INFINITE) ? undefined : new Date(endDate)}
        saveValue={date => set('endDate', date.getTime())}
        oneTap
        format={'DD/MM/YYYY'}
        placement={'rightEnd'}
      />
      <Or>&nbsp;ou</Or>
      <CustomCheckbox
        $isRequired={endDateIsRequired}
        checked={endDate === INFINITE}
        onChange={(_, checked) => set('endDate', checked ? INFINITE : '')}
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

const Or = styled.span`
  padding: 0 10px;
  color: ${COLORS.slateGray};
  font-size: 13px;
`

export default RegulatoryText
