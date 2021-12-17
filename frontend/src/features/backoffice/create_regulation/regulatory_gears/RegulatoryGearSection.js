import React, { useState } from 'react'
import styled from 'styled-components'
import GearForm from './RegulatoryGearForm'
import SectionTitle from '../../SectionTitle'
import { Label, CustomInput } from '../../../commonStyles/Input.style'

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

  return <>
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
  </>
}

const OtherRemark = styled.div`
  display: ${props => props.show ? 'flex' : 'none'};
  align-items: center;
  margin-top: 10px;
`

export default RegulatoryGearSection
