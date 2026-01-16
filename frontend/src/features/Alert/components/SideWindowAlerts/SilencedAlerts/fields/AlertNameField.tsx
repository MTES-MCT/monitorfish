import { useGetAllAlertSpecificationsQuery } from '@features/Alert/apis'
import { FieldError, Select } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import styled from 'styled-components'

import type { SilencedAlertFormValues } from '../types'

export function AlertNameField() {
  const [input, meta, helper] = useField<SilencedAlertFormValues['value']>('value')
  const { data: alertSpecifications } = useGetAllAlertSpecificationsQuery()

  const alertsAsOptions =
    alertSpecifications?.map(alert => ({
      label: alert.name,
      value: alert.name
    })) ?? []

  const add = (alertName: string | undefined) => {
    if (!alertName || !alertSpecifications) {
      helper.setValue(undefined)

      return
    }

    const nextValue = alertSpecifications.find(alert => alert.name === alertName)
    if (!nextValue) {
      return
    }

    helper.setValue({
      alertId: nextValue.id,
      name: nextValue.name,
      natinfCode: nextValue.natinf,
      threat: nextValue.threat,
      threatCharacterization: nextValue.threatCharacterization,
      type: nextValue.type
    })
  }

  return (
    <>
      <StyledSelect
        label="Alerte suspendue"
        name="alertName"
        onChange={nextValue => add(nextValue as string | undefined)}
        options={alertsAsOptions}
        searchable
        value={input.value?.name}
      />

      {/* @ts-ignore */}
      {typeof meta.error?.type === 'string' && <FieldError>{meta.error.type}</FieldError>}
    </>
  )
}

const StyledSelect = styled(Select)`
  margin-top: 30px;
  width: 495px;
`
