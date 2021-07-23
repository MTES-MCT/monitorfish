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
  const {
    id,
    regulationText,
    updateRegulationText
  } = props
  const [currentRegulationTextName, setCurrentRegulationTextName] = useState(regulationText ? regulationText.name : '')
  const [currentRegulationTextURL, setCurrentRegulationTextURL] = useState(regulationText ? regulationText.URL : '')
  const [isEditing, setIsEditing] = useState(false)
  const updateOrAddRegulationText = () => {
    const updatedRegulationText = {
      name: currentRegulationTextName,
      URL: currentRegulationTextURL
    }
    updateRegulationText(regulationText ? id : undefined, updatedRegulationText)
  }
  const cancelAddNewRegulationText = () => {
    setIsEditing(false)
    setCurrentRegulationTextName(regulationText ? regulationText.name : '')
    setCurrentRegulationTextURL(regulationText ? regulationText.URL : '')
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
        ? <><CustomInput
          placeholder='Nom'
          width={'250px'}
          value={currentRegulationTextName}
          onChange={value => onNameValueChange(value)}
          />
          <CustomInput
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
      <CustomDatePicker />
    </ContentLine>
    <ContentLine>
      <Label>Fin de validité</Label>
      <CustomDatePicker />
      <Or>&nbsp;ou</Or>
      <CustomCheckbox>{"jusqu'à nouvel ordre"}</CustomCheckbox>
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
      border: 2px solid ${COLORS.grayDarker};
    }
  }
`

const Or = styled.span`
  padding: 0 10px;
  color: ${COLORS.textGray};
  font-size: 13px;
`
/*
* TODO : add value for datepicker
* Tenter de supprimer le padding dans les checkbox...
* tous les éléments sont requis, les passer en rouge s'ils sont pas saisis
* à voir pour la checkbox à top 8px je voudrai la faire passer à 0...
*/

export default RegulationText
