import { checkNameAndUrl, checkOtherRequiredValues } from '@features/BackOffice/edit_regulation/regulatory_text/utils'
import { useBackofficeAppDispatch } from '@hooks/useBackofficeAppDispatch'
import {
  Accent,
  Button,
  Checkbox,
  customDayjs,
  DatePicker,
  MultiCheckbox,
  SingleTag,
  TextInput,
  THEME
} from '@mtes-mct/monitor-ui'
import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

import { ContentLine, Delimiter } from '../../../commonStyles/Backoffice.style'
import { Label } from '../../../commonStyles/Input.style'
import { checkURL, RegulatoryTextType } from '../../../Regulation/utils'
import { INFINITE } from '../../constants'
import { addObjectToRegulatoryTextCheckedMap } from '../../slice'

/**
 * @typedef {object} Props
 * @prop {Number} id
 * @prop {RegulatoryText} regulatoryText
 * @prop {Function} addOrRemoveRegulatoryTextInList
 * @prop {Boolean} saveForm
 */
export function RegulatoryText({
  addOrRemoveRegulatoryTextInList,
  id,
  listLength,
  regulatoryText,
  saveForm,
  setRegulatoryText
}) {
  const { endDate, reference, startDate, textType, url } = regulatoryText

  const dispatch = useBackofficeAppDispatch()

  const [isEditing, setIsEditing] = useState<boolean>(true)

  const set = useCallback(
    (key, value) => {
      const obj = {
        ...regulatoryText,
        [key]: value
      }
      setRegulatoryText(id, obj)
    },
    [id, regulatoryText, setRegulatoryText]
  )

  useEffect(() => {
    if (saveForm) {
      const nameOrUrlIsMissing = checkNameAndUrl(reference, url)
      const hasOneOrMoreValuesMissing = checkOtherRequiredValues(startDate, endDate, textType) || nameOrUrlIsMissing
      const payload = {
        complete: !hasOneOrMoreValuesMissing,
        id
      }
      dispatch(addObjectToRegulatoryTextCheckedMap(payload))
    }
    // TODO Refactor to avoid using a useEffect for an action
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveForm, id, dispatch])

  const cancelAddNewRegulatoryText = useCallback(() => {
    setIsEditing(true)

    const obj = {
      ...regulatoryText,
      reference: '',
      url: ''
    }

    setRegulatoryText(id, obj)
  }, [regulatoryText, id, setRegulatoryText, setIsEditing])

  const onCloseIconClicked = () => {
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
  }

  return (
    <>
      <ContentLine>
        <Label>{`Texte réglementaire ${regulatoryText && id ? id + 1 : 1}`}</Label>
        {isEditing && (
          <>
            <StyledTextInput
              error={reference ? undefined : 'Le nom est requis'}
              isErrorMessageHidden
              isLabelHidden
              label="Nom"
              name="reference"
              onChange={value => onInputValueChange('reference', value)}
              placeholder="Nom"
              value={reference || ''}
            />
            <StyledTextInput
              error={url && checkURL(url) ? undefined : "L'URL est requise"}
              isErrorMessageHidden
              isLabelHidden
              label="URL"
              name="url"
              onChange={value => onInputValueChange('url', value)}
              placeholder="URL"
              value={url || ''}
            />
            {(reference || url) && (
              <>
                <StyledButton onClick={() => !checkNameAndUrl(reference, url) && setIsEditing(false)}>
                  Enregistrer
                </StyledButton>
                <StyledButton accent={Accent.TERTIARY} onClick={cancelAddNewRegulatoryText}>
                  Effacer
                </StyledButton>
              </>
            )}
          </>
        )}
        {!isEditing && <SingleTag onDelete={onCloseIconClicked}>{reference}</SingleTag>}
      </ContentLine>
      <ContentLine>
        <Label>Type de texte</Label>
        <MultiCheckbox
          error={textType?.length ? undefined : 'Type de texte est requis'}
          isErrorMessageHidden
          isInline
          isLabelHidden
          label="Type de texte"
          name="textType"
          onChange={value => set('textType', value)}
          options={[
            { label: 'création de la zone', value: RegulatoryTextType.CREATION },
            { label: 'réglementation de la zone', value: RegulatoryTextType.REGULATION }
          ]}
          value={textType}
        />
      </ContentLine>
      <ContentLine>
        <Label>Début de validité</Label>
        <DatePicker
          defaultValue={startDate || customDayjs().toISOString()}
          error={startDate ? undefined : 'Début de validité requis'}
          isErrorMessageHidden
          isLabelHidden
          isStringDate
          label="Début de validité"
          name="startDate"
          onChange={date => set('startDate', date)}
          withTime={false}
        />
      </ContentLine>
      <ContentLine>
        <Label>Fin de validité</Label>
        <DatePicker
          defaultValue={endDate || undefined}
          disabled={endDate === INFINITE}
          error={endDate ? undefined : 'Fin de validité requis'}
          isErrorMessageHidden
          isLabelHidden
          isStringDate
          label="Fin de validité"
          name="endDate"
          onChange={date => set('endDate', date)}
          withTime={false}
        />
        <Or>&nbsp;ou</Or>
        <StyledCheckbox
          checked={endDate === INFINITE}
          label={"jusqu'à nouvel ordre"}
          name="endDate"
          onChange={isChecked => {
            set('endDate', isChecked ? INFINITE : '')
          }}
        />
      </ContentLine>
      <CancelContentLine>
        <Button
          accent={Accent.SECONDARY}
          disabled={removeTextIsDisabled()}
          onClick={() => addOrRemoveRegulatoryTextInList(id)}
        >
          Supprimer le texte
        </Button>
      </CancelContentLine>
      <Delimiter />
    </>
  )
}

const StyledCheckbox = styled(Checkbox)`
  margin-left: 8px;
`

const CancelContentLine = styled(ContentLine)`
  margin: 16px 0px 15px 0px;
`

const StyledTextInput = styled(TextInput)`
  margin-right: 8px;
`

const StyledButton = styled(Button)`
  margin-right: 8px;
`

const Or = styled.span`
  padding: 0 10px;
  color: ${THEME.color.slateGray};
  font-size: 13px;
`
