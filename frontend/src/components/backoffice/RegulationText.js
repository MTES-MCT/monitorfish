import React, { useState } from 'react'
import styled from 'styled-components'
import { ContentLine } from '../commonStyles/Backoffice.style'
import { CustomInput, Label } from '../commonStyles/Input.style'
import { ValidateButton, CancelButton } from '../commonStyles/Buttons.style'
import { Checkbox } from 'rsuite'
import CustomDatePicker from './create_regulation/CustomDatePicker'
import { COLORS } from '../../constants/constants'

const RegulationText = props => {
  const {
    isEmpty,
    id,
    regulationText,
    updateRegulationText
  } = props
  const [currentRegulationTextName, setCurrentRegulationTextName] = useState(isEmpty ? '' : regulationText.name)
  const [currentRegulationTextURL, setCurrentRegulationTextURL] = useState(isEmpty ? '' : regulationText.URL)
  const updateOrAddRegulationText = () => {
    const regulationText = {
      name: currentRegulationTextName,
      URL: currentRegulationTextURL
    }
    updateRegulationText(isEmpty ? null : id, regulationText)
  }
  const cancelAddNewRegulationText = () => {
    /* que fait-on ? On réinitilaise ? */
  }
  return <>
    <ContentLine>
      <Label>{`Texte réglementaire ${isEmpty ? 1 : id + 1}`}</Label>
      <CustomInput
        placeholder='Nom'
        width={'250px'}
        value={currentRegulationTextName}
        onChange={setCurrentRegulationTextName}
      />
      <CustomInput
        placeholder='URL'
        width={'250px'}
        value={currentRegulationTextURL}
        onChange={setCurrentRegulationTextURL}
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
