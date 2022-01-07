import React, { useState } from 'react'
import GearForm from './RegulatoryGearForm'
import SectionTitle from '../../SectionTitle'
import { Label, CustomInput } from '../../../commonStyles/Input.style'
import { Section, OtherRemark } from '../../../commonStyles/Backoffice.style'

const RegulatoryGearSection = (props) => {
  const {
    regulatoryGears,
    setRegulatoryGears
  } = props

  const [show, setShow] = useState(false)

  const setOtherInfo = value => {
    setRegulatoryGears({
      ...regulatoryGears,
      otherInfo: value
    })
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
      <Label>Mesures Techniques</Label>
      <CustomInput
        width={'730px'}
        value={regulatoryGears?.otherInfo || ''}
        onChange={setOtherInfo} />
    </OtherRemark>
  </Section>
}

export default RegulatoryGearSection
