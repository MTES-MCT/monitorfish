import React, { useEffect, useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { CheckboxGroup } from 'rsuite'
import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import { checkURL, REGULATORY_TEXT_TYPE } from '../../../../domain/entities/regulatory'
import { ContentLine, Delimiter, CustomCheckbox } from '../../../commonStyles/Backoffice.style'
import { ValidateButton, CancelButton } from '../../../commonStyles/Buttons.style'
import { CustomInput, Label } from '../../../commonStyles/Input.style'
import { INFINITE } from '../../constants'
import { addObjectToRegulatoryTextCheckedMap } from '../../Regulation.slice'
import CustomDatePicker from '../custom_form/CustomDatePicker'
import Tag from '../Tag'

/**
 * @typedef {object} Props
 * @prop {Number} id
 * @prop {RegulatoryText} regulatoryText
 * @prop {Function} addOrRemoveRegulatoryTextInList
 * @prop {Boolean} saveForm
 */
function RegulatoryText(props) {
  const { addOrRemoveRegulatoryTextInList, id, listLength, regulatoryText, saveForm, setRegulatoryText } = props

  const { endDate, reference, startDate, textType, url } = regulatoryText

  const dispatch = useDispatch()

  /** @type {boolean} isEditing */
  const [isEditing, setIsEditing] = useState(undefined)
  /** @type {boolean} fromForm */
  const [fromForm, setFromForm] = useState(false)
  /** @type {boolean} nameIsRequired */
  const [nameIsRequired, setNameIsRequired] = useState(false)
  /** @type {boolean} URLIsRequired */
  const [URLIsRequired, setURLIsRequired] = useState(false)
  /** @type {boolean} startDateIsRequired */
  const [startDateIsRequired, setStartDateIsRequired] = useState(false)
  /** @type {boolean} endDateIsRequired */
  const [endDateIsRequired, setEndDateIsRequired] = useState(false)
  /** @type {boolean} textTypeIsRequired */
  const [textTypeIsRequired, setTextTypeIsRequired] = useState(false)

  const set = useCallback(
    (key, value) => {
      const obj = {
        ...regulatoryText,
        [key]: value,
      }
      setRegulatoryText(id, obj)
    },
    [id, regulatoryText, setRegulatoryText],
  )

  useEffect(() => {
    if (fromForm) {
      if (!isEditing) {
        setIsEditing(reference === undefined || reference === '' || url === undefined || url === '')
      }
    } else {
      setIsEditing(reference === undefined || reference === '' || url === undefined || url === '')
    }
  }, [reference, url, fromForm, setIsEditing, isEditing])

  /**
   * @function checkOtherRequiredValues
   * @returns true if a regulatory text form value is missing or incorrect, else false
   */
  const checkOtherRequiredValues = useCallback(() => {
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
  }, [startDate, endDate, textType])

  /**
   * @function checkNameAndUrl
   * @return true if a value is missing, else false
   */
  const checkNameAndUrl = useCallback(() => {
    let required = !reference || reference === ''
    let oneValueIsMissing = required
    setNameIsRequired(required)
    required = !url || url === '' || !checkURL(url)
    oneValueIsMissing = oneValueIsMissing || required
    setURLIsRequired(required)
    if (!oneValueIsMissing) {
      setFromForm(false)

      return false
    }

    return true
  }, [reference, url])

  useEffect(() => {
    if (saveForm) {
      const nameOrUrlIsMissing = checkNameAndUrl()
      const atLeastOneValueIsMissing = checkOtherRequiredValues() || nameOrUrlIsMissing
      const payload = {
        complete: !atLeastOneValueIsMissing,
        id,
      }
      dispatch(addObjectToRegulatoryTextCheckedMap(payload))
    }
  }, [saveForm, id, checkNameAndUrl, checkOtherRequiredValues, dispatch])

  const cancelAddNewRegulatoryText = useCallback(() => {
    setIsEditing(true)
    const obj = {
      ...regulatoryText,
      reference: '',
      url: '',
    }
    setRegulatoryText(id, obj)
  }, [regulatoryText, id, setRegulatoryText, setIsEditing])

  const onCloseIconClicked = () => {
    setFromForm(true)
    setIsEditing(true)
  }

  const removeTextIsDisabled = () =>
    listLength <= 1 &&
    textType?.length === 0 &&
    !startDate &&
    !endDate &&
    (!reference || reference === '') &&
    (!url || url === '')

  const onInputValueChange = (key, value) => {
    set(key, value)
    if (!fromForm) {
      setFromForm(true)
    }
  }

  return (
    <>
      <ContentLine>
        <Label>{`Texte réglementaire ${regulatoryText && id ? id + 1 : 1}`}</Label>
        {isEditing ? (
          <>
            <CustomInput
              $isRed={nameIsRequired}
              data-cy="reg-text-name"
              onChange={value => onInputValueChange('reference', value)}
              placeholder="Nom"
              value={reference || ''}
              width="250px"
            />
            <CustomInput
              $isRed={URLIsRequired}
              data-cy="reg-text-url"
              onChange={value => onInputValueChange('url', value)}
              placeholder="URL"
              value={url || ''}
              width="250px"
            />
            {(reference || url) && (
              <>
                <ValidateButton data-cy="save-reg-text-name" disabled={false} isLast={false} onClick={checkNameAndUrl}>
                  Enregistrer
                </ValidateButton>
                <CancelButton
                  data-cy="clear-reg-text-name"
                  disabled={false}
                  isLast={false}
                  onClick={cancelAddNewRegulatoryText}
                >
                  Effacer
                </CancelButton>
              </>
            )}
          </>
        ) : (
          <Tag onCloseIconClicked={onCloseIconClicked} tagUrl={url} tagValue={reference} />
        )}
      </ContentLine>
      <ContentLine>
        <Label>Type de texte</Label>
        <CustomCheckboxGroup
          inline
          name="checkboxList"
          onChange={value => set('textType', value)}
          value={textType || []}
        >
          <CustomCheckbox
            $isRequired={textTypeIsRequired}
            data-cy="create-zone-checkbox"
            value={REGULATORY_TEXT_TYPE.CREATION}
          >
            création de la zone
          </CustomCheckbox>
          <CustomCheckbox
            $isRequired={textTypeIsRequired}
            data-cy="zone-regulation-checkbox"
            value={REGULATORY_TEXT_TYPE.REGULATION}
          >
            réglementation de la zone
          </CustomCheckbox>
        </CustomCheckboxGroup>
      </ContentLine>
      <ContentLine>
        <Label>Début de validité</Label>
        <CustomDatePicker
          key={startDate}
          format="dd/MM/yyyy"
          isRequired={startDateIsRequired}
          oneTap
          placement="rightStart"
          saveValue={date => set('startDate', date.getTime())}
          value={startDate ? new Date(startDate) : new Date()}
        />
      </ContentLine>
      <ContentLine>
        <Label>Fin de validité</Label>
        <CustomDatePicker
          key={endDate}
          format="dd/MM/yyyy"
          isRequired={endDateIsRequired}
          oneTap
          placement="rightEnd"
          saveValue={date => set('endDate', date.getTime())}
          value={!endDate || endDate === INFINITE ? undefined : new Date(endDate)}
        />
        <Or>&nbsp;ou</Or>
        <CustomCheckbox
          $isRequired={endDateIsRequired}
          checked={endDate === INFINITE}
          onChange={(_, checked) => set('endDate', checked ? INFINITE : '')}
        >
          jusqu'à nouvel ordre
        </CustomCheckbox>
      </ContentLine>
      <CancelContentLine>
        <CancelButton
          disabled={removeTextIsDisabled()}
          isLast={false}
          onClick={_ => addOrRemoveRegulatoryTextInList(id)}
        >
          Supprimer le texte
        </CancelButton>
      </CancelContentLine>
      <Delimiter />
    </>
  )
}

const CancelContentLine = styled(ContentLine)`
  margin: 16px 0px 15px 0px;
`

const CustomCheckboxGroup = styled(CheckboxGroup)`
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  padding-left: 10px;
`

const Or = styled.span`
  padding: 0 10px;
  color: ${COLORS.slateGray};
  font-size: 13px;
`

export default RegulatoryText
