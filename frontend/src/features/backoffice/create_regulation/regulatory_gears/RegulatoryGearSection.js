import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import GearForm from './RegulatoryGearForm'
import SectionTitle from '../../SectionTitle'
import { Label, CustomInput } from '../../../commonStyles/Input.style'
import { Section, OtherRemark } from '../../../commonStyles/Backoffice.style'
import { setProcessingRegulationByKey } from '../../Regulation.slice'
import { REGULATORY_REFERENCE_KEYS } from '../../../../domain/entities/regulatory'

const RegulatoryGearSection = () => {
  const dispatch = useDispatch()
  const { regulatoryGears } = useSelector(state => state.regulation.processingRegulation)

  const setRegulatoryGears = value => {
    dispatch(setProcessingRegulationByKey({ key: REGULATORY_REFERENCE_KEYS.REGULATORY_GEARS, value }))
  }

  const [show, setShow] = useState(false)

  const setOtherInfo = value => {
    setRegulatoryGears({ ...regulatoryGears, otherInfo: value })
  }

  return <Section show>
    <SectionTitle
      title={'Engins Réglementés'}
      isOpen={show}
      setIsOpen={setShow}
      dataCy={'regulatory-gears-section'}
    />
    <GearForm
      show={show}
      regulatoryGears={regulatoryGears}
      setRegulatoryGears={setRegulatoryGears}
    />
    <OtherRemark show={show}>
      <Label>Remarques générales</Label>
      <CustomInput
        as="textarea"
        rows={2}
        placeholder=''
        value={regulatoryGears?.otherInfo || ''}
        onChange={event => setOtherInfo(event.target.value)}
        width={'500px'}
        $isGray={regulatoryGears?.otherInfo && regulatoryGears?.otherInfo !== ''}
      />
    </OtherRemark>
  </Section>
}

export default RegulatoryGearSection
