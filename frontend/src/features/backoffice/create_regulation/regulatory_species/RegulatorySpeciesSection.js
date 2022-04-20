import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import SectionTitle from '../../SectionTitle'
import { CustomInput, Label } from '../../../commonStyles/Input.style'
import RegulatorySpeciesForm from './RegulatorySpeciesForm'
import { setProcessingRegulationByKey } from '../../Regulation.slice'
import { Section, OtherRemark } from '../../../commonStyles/Backoffice.style'
import { REGULATORY_REFERENCE_KEYS } from '../../../../domain/entities/regulatory'

const RegulatorySpeciesSection = () => {
  const [show, setShow] = useState(false)

  const dispatch = useDispatch()

  const { regulatorySpecies } = useSelector(state => state.regulation.processingRegulation)

  const setRegulatorySpecies = value => {
    dispatch(setProcessingRegulationByKey({ key: REGULATORY_REFERENCE_KEYS.REGULATORY_SPECIES, value }))
  }

  const setOtherInfo = value => {
    setRegulatorySpecies({
      ...regulatorySpecies,
      otherInfo: value
    })
  }

  return <Section show>
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
      <Label>Remarques générales</Label>
      <CustomInput
        data-cy={'regulatory-species-other-info'}
        width={'730px'}
        value={regulatorySpecies?.otherInfo || ''}
        onChange={setOtherInfo}
        $isGray={regulatorySpecies.otherInfo && regulatorySpecies.otherInfo !== ''} />
    </OtherRemark>
  </Section>
}

export default RegulatorySpeciesSection
