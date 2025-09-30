import { Criteria } from '@features/Alert/components/SideWindowAlerts/AlertManagementForm/shared/Criteria'
import { buildCountriesAsTreeOptions } from '@features/Alert/components/SideWindowAlerts/AlertManagementForm/utils'
import { FormikMultiCascader } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { useState } from 'react'

import type { EditedAlertSpecification } from '@features/Alert/types'

type NationalityCriteriaProps = {
  onDelete: () => void
}
export function NationalityCriteria({ onDelete }: NationalityCriteriaProps) {
  const [, , helper] = useField<EditedAlertSpecification['flagStatesIso2']>('flagStatesIso2')
  const [isCriteriaOpened, setIsCriteriaOpened] = useState(false)
  const countries = buildCountriesAsTreeOptions()

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
        <Criteria.Title>NATIONALITÉS</Criteria.Title>
        <Criteria.ChevronIcon $isOpen={isCriteriaOpened} />
      </Criteria.Head>
      <Criteria.Body $isOpen={isCriteriaOpened}>
        <FormikMultiCascader
          disabled={!countries}
          label="Nationalités déclenchant l'alerte"
          name="flagStatesIso2"
          options={countries}
          placeholder=""
          popupWidth={600}
          searchable
          uncheckableItemValues={['0', '1']}
        />
        <Criteria.Delete onClick={handleDeleteCriteria} />
      </Criteria.Body>
    </Criteria.Wrapper>
  )
}
