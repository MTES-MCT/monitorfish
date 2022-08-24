import React, { useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Section, OtherRemark } from '../../../commonStyles/Backoffice.style'
import { Label, CustomInput } from '../../../commonStyles/Input.style'
import { setFishingPeriodOtherInfo } from '../../Regulation.slice'
import SectionTitle from '../../SectionTitle'
import FishingPeriodForm from './FishingPeriodForm'

function FishingPeriodSection() {
  const { fishingPeriod } = useSelector(state => state.regulation.processingRegulation)

  const dispatch = useDispatch()

  const [show, setShow] = useState(false)

  const onChange = useCallback(value => dispatch(setFishingPeriodOtherInfo(value)), [dispatch])

  return (
    <Section show>
      <SectionTitle isOpen={show} setIsOpen={setShow} title="Périodes de pêche" />
      <FishingPeriodForm fishingPeriod={fishingPeriod} show={show} />
      <OtherRemark show={show}>
        <Label>Remarques générales</Label>
        <CustomInput
          $isGray={fishingPeriod?.otherInfo && fishingPeriod?.otherInfo !== ''}
          as="textarea"
          onChange={event => onChange(event.target.value)}
          placeholder=""
          rows={2}
          value={fishingPeriod?.otherInfo || ''}
          width="500px"
        />
      </OtherRemark>
    </Section>
  )
}

export default FishingPeriodSection
