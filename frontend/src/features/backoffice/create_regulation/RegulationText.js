import React, { useState } from 'react'
import { ContentLine } from '../../commonStyles/Backoffice.style'
import { CustomInput, Label } from '../../commonStyles/Input.style'
import { ValidateButton, CancelButton } from '../../commonStyles/Buttons.style'
import { Checkbox, DatePicker } from 'rsuite'

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
      <Label>`Texte réglementaire ${id + 1}`</Label>
      <CustomInput
        placeholder='Nom'
        value={currentRegulationTextName}
        onChange={setCurrentRegulationTextName}
      />
      <CustomInput
        placeholder='URL'
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
      <Checkbox>création de la zone</Checkbox>
      <Checkbox>réglementation de la zone</Checkbox>
    </ContentLine>
    <ContentLine>
      <Label>Début de validité</Label>
      <DatePicker
        cleanable
        placeholder="  / / "
        apparance={'subtle'} />
    </ContentLine>
    <ContentLine>
      <Label>Fin de validité</Label>
      <DatePicker
        preventOverflow
        cleanable
        apparance={'default'}
        placeholder="  / / " />
      ou
      <Checkbox>{"jusqu'à nouvel ordre"}</Checkbox>
    </ContentLine>
  </>
}

export default RegulationText
