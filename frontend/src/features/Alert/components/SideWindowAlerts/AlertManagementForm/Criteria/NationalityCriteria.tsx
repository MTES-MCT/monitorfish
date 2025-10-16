import { Criteria } from '@features/Alert/components/SideWindowAlerts/AlertManagementForm/shared/Criteria'
import { buildCountriesAsTreeOptions } from '@features/Alert/components/SideWindowAlerts/AlertManagementForm/utils'
import { MultiCascader } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { useState } from 'react'

import type { EditedAlertSpecification } from '@features/Alert/types'

type NationalityCriteriaProps = {
  onDelete: () => void
}

export function NationalityCriteria({ onDelete }: NationalityCriteriaProps) {
  const [, meta, helper] = useField<EditedAlertSpecification['flagStatesIso2']>('flagStatesIso2')
  const [isCriteriaOpened, setIsCriteriaOpened] = useState(true)
  const countries = buildCountriesAsTreeOptions()

  const handleDeleteCriteria = () => {
    helper.setValue([])
    onDelete()
  }

  const updateFlagStatesIso2 = (nextValue: string[] | undefined) => {
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
        <Criteria.Title>NATIONALITÉS</Criteria.Title>
        <Criteria.ChevronIcon $isOpen={isCriteriaOpened} />
      </Criteria.Head>
      <Criteria.Body $isOpen={isCriteriaOpened}>
        <MultiCascader
          disabled={!countries}
          label="Nationalités déclenchant l'alerte"
          name="flagStatesIso2"
          onChange={updateFlagStatesIso2}
          options={countries}
          placeholder=""
          popupWidth={600}
          searchable
          uncheckableItemValues={['0', '1']}
          value={meta.value}
        />
        <Criteria.Delete onClick={handleDeleteCriteria} />
      </Criteria.Body>
    </Criteria.Wrapper>
  )
}
