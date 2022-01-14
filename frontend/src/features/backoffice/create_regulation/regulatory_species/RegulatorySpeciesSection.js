import React, { useState, useCallback } from 'react'
import SectionTitle from '../../SectionTitle'
import { CustomInput, Label } from '../../../commonStyles/Input.style'
import RegulatorySpeciesForm from './RegulatorySpeciesForm'
import { useDispatch, useSelector } from 'react-redux'
import { setRegulationByKey } from '../../Regulation.slice'
import { FormSection, OtherRemark } from '../../../commonStyles/Backoffice.style'

const RegulatorySpeciesSection = () => {
  const [show, setShow] = useState(false)

  const dispatch = useDispatch()

  const { regulatorySpecies } = useSelector(state => state.regulation.currentRegulation)

  const setRegulatorySpecies = value => {
    dispatch(setRegulationByKey({ key: 'regulatorySpecies', value }))
  }

  const setOtherInfo = useCallback(value => {
    setRegulatorySpecies({
      ...regulatorySpecies,
      otherInfo: value
    })
  }, [regulatorySpecies, setRegulatorySpecies])

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
