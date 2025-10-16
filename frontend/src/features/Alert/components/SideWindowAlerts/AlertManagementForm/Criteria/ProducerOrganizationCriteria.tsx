import { Criteria } from '@features/Alert/components/SideWindowAlerts/AlertManagementForm/shared/Criteria'
import { useGetProducerOrganizationsAsOptions } from '@hooks/useGetProducerOrganizationsAsOptions'
import { CheckPicker } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { useState } from 'react'

import type { EditedAlertSpecification } from '@features/Alert/types'

type ProducerOrganizationCriteriaProps = {
  onDelete: () => void
}

export function ProducerOrganizationCriteria({ onDelete }: ProducerOrganizationCriteriaProps) {
  const [, meta, helper] = useField<EditedAlertSpecification['producerOrganizations']>('producerOrganizations')
  const [isCriteriaOpened, setIsCriteriaOpened] = useState(true)
  const producerOrganizations = useGetProducerOrganizationsAsOptions()

  const handleDeleteCriteria = () => {
    helper.setValue([])
    onDelete()
  }

  const updateProducerOrganizations = (nextValue: string[] | undefined) => {
    helper.setValue(nextValue ?? [])
  }

  return (
    <Criteria.Wrapper>
      <Criteria.Head
        onClick={() => {
          setIsCriteriaOpened(!isCriteriaOpened)
        }}
        type="button"
      >
        <Criteria.Title>ORGANISATIONS DE PRODUCTEURS</Criteria.Title>
        <Criteria.ChevronIcon $isOpen={isCriteriaOpened} />
      </Criteria.Head>
      <Criteria.Body $isOpen={isCriteriaOpened}>
        <CheckPicker
          label="Organisations de producteurs déclenchant l'alerte"
          name="producerOrganizations"
          onChange={updateProducerOrganizations}
          options={producerOrganizations}
          searchable
          value={meta.value}
        />
        <Criteria.Delete onClick={handleDeleteCriteria} />
      </Criteria.Body>
    </Criteria.Wrapper>
  )
}
