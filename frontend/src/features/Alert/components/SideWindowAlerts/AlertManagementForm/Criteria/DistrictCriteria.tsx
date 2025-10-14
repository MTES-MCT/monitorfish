import { useGetDistrictsQuery } from '@api/district'
import { Criteria } from '@features/Alert/components/SideWindowAlerts/AlertManagementForm/shared/Criteria'
import { MultiCascader } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { useState } from 'react'

import type { EditedAlertSpecification } from '@features/Alert/types'

type DistrictCriteriaProps = {
  onDelete: () => void
}

export function DistrictCriteria({ onDelete }: DistrictCriteriaProps) {
  const [, meta, helper] = useField<EditedAlertSpecification['districtCodes']>('districtCodes')
  const [isCriteriaOpened, setIsCriteriaOpened] = useState(true)
  const { data: districtsAsTreeOptions } = useGetDistrictsQuery()

  const handleDeleteCriteria = () => {
    helper.setValue([])
    onDelete()
  }

  const updateDistrict = (nextValue: string[] | undefined) => {
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
        <Criteria.Title>DÉPARTEMENTS ET QUARTIERS</Criteria.Title>
        <Criteria.ChevronIcon $isOpen={isCriteriaOpened} />
      </Criteria.Head>
      <Criteria.Body $isOpen={isCriteriaOpened}>
        <MultiCascader
          disabled={!districtsAsTreeOptions}
          label="Départements et/ou quartiers déclenchant l'alerte"
          name="districtCodes"
          onChange={updateDistrict}
          options={districtsAsTreeOptions ?? []}
          placeholder=""
          searchable
          value={meta.value}
        />
        <Criteria.Delete onClick={handleDeleteCriteria} />
      </Criteria.Body>
    </Criteria.Wrapper>
  )
}
