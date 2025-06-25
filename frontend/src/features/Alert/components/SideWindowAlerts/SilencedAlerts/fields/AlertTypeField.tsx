import { FieldError, Select } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import styled from 'styled-components'

import { OPERATIONAL_ALERTS, PendingAlertValueType } from '../../../../constants'

import type { SilencedAlertFormValues } from '../types'

export function AlertTypeField() {
  const [input, meta, helper] = useField<SilencedAlertFormValues['value']>('value')

  const alertsAsOptions = OPERATIONAL_ALERTS.map(alert => ({
    label: alert.name,
    value: alert.code
  }))

  const add = (alert: PendingAlertValueType | undefined) => {
    if (!alert) {
      helper.setValue(undefined)

      return
    }

    helper.setValue({ type: alert })
  }

  return (
    <>
      <StyledSelect
        label="Alerte suspendue"
        name="newGear"
        onChange={nextValue => add(nextValue as PendingAlertValueType)}
        options={alertsAsOptions}
        searchable
        value={input.value?.type}
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
