import React, { useState } from 'react'
import SectionTitle from '../../SectionTitle'
import { CustomInput, Label } from '../../../commonStyles/Input.style'
import RegulatorySpeciesForm from './RegulatorySpeciesForm'
import { useDispatch, useSelector } from 'react-redux'
import { setRegulationByKey } from '../../Regulation.slice'
import { FormSection, OtherRemark } from '../../../commonStyles/Backoffice.style'
import { REGULATORY_REFERENCE_KEYS } from '../../../../domain/entities/regulatory'

const RegulatorySpeciesSection = () => {
  const [show, setShow] = useState(false)

  const dispatch = useDispatch()

  const { regulatorySpecies } = useSelector(state => state.regulation.currentRegulation)

  const setRegulatorySpecies = value => {
    dispatch(setRegulationByKey({ key: REGULATORY_REFERENCE_KEYS.REGULATORY_SPECIES, value }))
  }

  const setOtherInfo = value => {
    setRegulatorySpecies({
      ...regulatorySpecies,
      otherInfo: value
    })
  }

  return <FormSection show>
    <SectionTitle
      dataCy={'open-regulated-species'}
      title={'ESPÈCES RÉGLEMENTÉES'}
      isOpen={show}
      setIsOpen={setShow}
    />
    <RegulatorySpeciesForm
      regulatorySpecies={regulatorySpecies}
      setRegulatorySpecies={setRegulatorySpecies}
      show={show}
    />
    <OtherRemark show={show}>
      <Label>Autres points sur les espèces</Label>
      <CustomInput
        data-cy={'regulatory-species-other-info'}
        width={'730px'}
        value={regulatorySpecies?.otherInfo || ''}
        onChange={setOtherInfo} />
    </OtherRemark>
  </FormSection>
}

export default RegulatorySpeciesSection
