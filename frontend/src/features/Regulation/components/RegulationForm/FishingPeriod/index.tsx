import { useBackofficeAppDispatch } from '@hooks/useBackofficeAppDispatch'
import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { Textarea } from '@mtes-mct/monitor-ui'
import { useState } from 'react'

import { FishingPeriodForm } from './FishingPeriodForm'
import { OtherRemark, Section } from '../../../../commonStyles/Backoffice.style'
import { regulationActions } from '../../../slice'
import { SectionTitle } from '../../RegulationTables/SectionTitle'

export function FishingPeriodSection() {
  const dispatch = useBackofficeAppDispatch()
  const processingRegulation = useBackofficeAppSelector(state => state.regulation.processingRegulation)

  const [show, setShow] = useState(false)

  const onChange = (value: string | undefined) => {
    dispatch(regulationActions.setFishingPeriodOtherInfo(value ?? ''))
  }

  return (
    <Section $show>
      <SectionTitle isOpen={show} setIsOpen={setShow} title="Périodes de pêche" />
      <FishingPeriodForm show={show} />
      <OtherRemark $show={show}>
        <Textarea
          label="Remarques"
          name="fishingPeriodOtherInfo"
          onChange={onChange}
          rows={2}
          style={{ width: '500px' }}
          value={processingRegulation.fishingPeriod?.otherInfo ?? ''}
        />
      </OtherRemark>
    </Section>
  )
}
