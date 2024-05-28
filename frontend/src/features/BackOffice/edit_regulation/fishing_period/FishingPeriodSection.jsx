import React, { useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import FishingPeriodForm from './FishingPeriodForm'
import SectionTitle from '../../SectionTitle'
import { Label, CustomInput } from '../../../commonStyles/Input.style'
import { setFishingPeriodOtherInfo } from '../../slice'
import { Section, OtherRemark } from '../../../commonStyles/Backoffice.style'

const FishingPeriodSection = () => {
  const { fishingPeriod } = useSelector(state => state.regulation.processingRegulation)

  const dispatch = useDispatch()

  const [show, setShow] = useState(false)

  const onChange = useCallback(value => dispatch(setFishingPeriodOtherInfo(value)), [dispatch])

  return (
    <Section show>
      <SectionTitle title={'Périodes de pêche'} isOpen={show} setIsOpen={setShow} />
      <FishingPeriodForm show={show} fishingPeriod={fishingPeriod} />
      <OtherRemark show={show}>
        <Label>Remarques</Label>
        <CustomInput
          as="textarea"
          rows={2}
          placeholder=""
          value={fishingPeriod?.otherInfo || ''}
          onChange={event => onChange(event.target.value)}
          width={'500px'}
          $isGray={fishingPeriod?.otherInfo && fishingPeriod?.otherInfo !== ''}
        />
      </OtherRemark>
    </Section>
  )
}

export default FishingPeriodSection
