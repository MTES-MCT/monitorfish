import { useGetDistrictsQuery } from '@api/district'
import { Criteria } from '@features/Alert/components/SideWindowAlerts/AlertManagementForm/shared/Criteria'
import { FormikMultiCascader } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { useState } from 'react'

import type { EditedAlertSpecification } from '@features/Alert/types'

type DistrictCriteriaProps = {
  onDelete: () => void
}

export function DistrictCriteria({ onDelete }: DistrictCriteriaProps) {
  const [, , helper] = useField<EditedAlertSpecification['districtCodes']>('districtCodes')
  const [isCriteriaOpened, setIsCriteriaOpened] = useState(true)
  const { data: districtsAsTreeOptions } = useGetDistrictsQuery()

  const handleDeleteCriteria = () => {
    helper.setValue([])
    onDelete()
  }

  return (
    <Criteria.Wrapper>
      <Criteria.Head
        onClick={() => {
          setIsCriteriaOpened(!isCriteriaOpened)
        }}
        type="button"
      >
        <Criteria.Title>DÉPARTEMENTS ET QUARTIERS</Criteria.Title>
        <Criteria.ChevronIcon $isOpen={isCriteriaOpened} />
      </Criteria.Head>
      <Criteria.Body $isOpen={isCriteriaOpened}>
        <FormikMultiCascader
          disabled={!districtsAsTreeOptions}
          label="Départements et/ou quartiers déclenchant l'alerte"
          name="districtCodes"
          options={districtsAsTreeOptions ?? []}
          placeholder=""
          searchable
        />
        <Criteria.Delete onClick={handleDeleteCriteria} />
      </Criteria.Body>
    </Criteria.Wrapper>
  )
}
