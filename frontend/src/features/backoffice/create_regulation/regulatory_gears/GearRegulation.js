import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import RegulatedGears from './RegulatedGears'
import SectionTitle from '../../SectionTitle'
import { Label, CustomInput } from '../../../commonStyles/Input.style'
import { Section, OtherRemark, VerticalLine } from '../../../commonStyles/Backoffice.style'
import { setProcessingRegulationByKey } from '../../Regulation.slice'
import { REGULATORY_REFERENCE_KEYS } from '../../../../domain/entities/regulatory'
import { GEAR_REGULATION_KEYS } from '../../../../domain/entities/backoffice'

const GearRegulation = () => {
  const dispatch = useDispatch()
  const {
    gearRegulation
  } = useSelector(state => state.regulation.processingRegulation)

  const [show, setShow] = useState(false)

  const setGearRegulation = value => {
    console.log(value)
    dispatch(setProcessingRegulationByKey({
      key: REGULATORY_REFERENCE_KEYS.GEAR_REGULATION,
      value
    }))
  }

  const setRegulatedGears = (isAuthorized, regulatedGears) => {
    const authorizedKey = isAuthorized
      ? GEAR_REGULATION_KEYS.AUTHORIZED
      : GEAR_REGULATION_KEYS.UNAUTHORIZED

    setGearRegulation({
      ...gearRegulation,
      [authorizedKey]: regulatedGears
    })
  }

  const setOtherInfo = value => {
    setGearRegulation({
      ...gearRegulation,
      [GEAR_REGULATION_KEYS.OTHER_INFO]: value
    })
  }

  return <Section show>
    <SectionTitle
      title={'Engins Réglementés'}
      isOpen={show}
      setIsOpen={setShow}
      dataCy={'regulatory-gears-section'}
    />
    <RegulatedGearsForms>
      <RegulatedGears
        show={show}
        authorized={true}
        regulatedGearsObject={gearRegulation[GEAR_REGULATION_KEYS.AUTHORIZED] || {}}
        setRegulatedGearsObject={setRegulatedGears}
      />
      <VerticalLine/>
      <RegulatedGears
        show={show}
        authorized={false}
        regulatedGearsObject={gearRegulation[GEAR_REGULATION_KEYS.UNAUTHORIZED] || {}}
        setRegulatedGearsObject={setRegulatedGears}
      />
    </RegulatedGearsForms>
    <OtherRemark show={show}>
      <Label>Remarques générales</Label>
      <CustomInput
        as="textarea"
        rows={2}
        placeholder=''
        value={gearRegulation?.otherInfo || ''}
        onChange={event => setOtherInfo(event.target.value)}
        width={'500px'}
        $isGray={gearRegulation?.otherInfo && gearRegulation?.otherInfo !== ''}
      />
    </OtherRemark>
  </Section>
}

const RegulatedGearsForms = styled.div`
  display: flex;
`

export default GearRegulation
