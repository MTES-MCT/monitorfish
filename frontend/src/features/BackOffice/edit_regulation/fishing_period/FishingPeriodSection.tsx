import { useBackofficeAppDispatch } from '@hooks/useBackofficeAppDispatch'
import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { useState, useCallback } from 'react'

import { FishingPeriodForm } from './FishingPeriodForm'
import { Section, OtherRemark } from '../../../commonStyles/Backoffice.style'
import { Label, CustomInput } from '../../../commonStyles/Input.style'
import { SectionTitle } from '../../SectionTitle'
import { setFishingPeriodOtherInfo } from '../../slice'

export function FishingPeriodSection() {
  const dispatch = useBackofficeAppDispatch()
  const processingRegulation = useBackofficeAppSelector(state => state.regulation.processingRegulation)

  const [show, setShow] = useState(false)

  const onChange = useCallback(value => dispatch(setFishingPeriodOtherInfo(value)), [dispatch])

  return (
    <Section show>
      <SectionTitle isOpen={show} setIsOpen={setShow} title="Périodes de pêche" />
      <FishingPeriodForm show={show} />
      <OtherRemark show={show}>
        <Label>Remarques</Label>
        <CustomInput
          $isGray={processingRegulation.fishingPeriod?.otherInfo !== ''}
          as="textarea"
          onChange={event => onChange(event.target.value)}
          placeholder=""
          rows={2}
          value={processingRegulation.fishingPeriod?.otherInfo ?? ''}
          width="500px"
        />
      </OtherRemark>
    </Section>
  )
}
