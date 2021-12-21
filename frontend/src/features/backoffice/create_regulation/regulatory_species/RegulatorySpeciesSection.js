import React, { useState } from 'react'
import styled from 'styled-components'
import SectionTitle from '../../SectionTitle'
import { CustomInput, Label } from '../../../commonStyles/Input.style'
import RegulatorySpeciesForm from './RegulatorySpeciesForm'

const RegulatorySpeciesSection = props => {
  const {
    /** @type {RegulatorySpecies} */
    regulatorySpecies,
    setRegulatorySpecies
  } = props
  const [show, setShow] = useState(false)

  const setOtherInfo = value => {
    setRegulatorySpecies({
      ...regulatorySpecies,
      otherInfo: value
    })
  }

  return <>
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
  </>
}

const OtherRemark = styled.div`
  display: ${props => props.show ? 'flex' : 'none'};
  align-items: center;
  margin-top: 10px;
`

export default RegulatorySpeciesSection
