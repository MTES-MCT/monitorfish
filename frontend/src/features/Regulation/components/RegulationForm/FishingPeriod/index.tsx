import { useBackofficeAppDispatch } from '@hooks/useBackofficeAppDispatch'
import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { useState } from 'react'

import { FishingPeriodForm } from './FishingPeriodForm'
import { OtherRemark, Section } from '../../../../commonStyles/Backoffice.style'
import { CustomInput, Label } from '../../../../commonStyles/Input.style'
import { regulationActions } from '../../../slice'
import { SectionTitle } from '../../RegulationTables/SectionTitle'

export function FishingPeriodSection() {
  const dispatch = useBackofficeAppDispatch()
  const processingRegulation = useBackofficeAppSelector(state => state.regulation.processingRegulation)

  const [show, setShow] = useState(false)

  const onChange = value => {
    dispatch(regulationActions.setFishingPeriodOtherInfo(value))
  }

  return (
    <Section $show>
      <SectionTitle isOpen={show} setIsOpen={setShow} title="Périodes de pêche" />
      <FishingPeriodForm show={show} />
      <OtherRemark $show={show}>
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
