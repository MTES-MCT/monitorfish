import { FieldError, Select } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import styled from 'styled-components'

import { OPERATIONAL_ALERTS } from '../../../../constants'
import { PendingAlertValueType } from '../../../../types'

import type { SilencedAlertFormValues } from '../types'
import type { Option } from '@mtes-mct/monitor-ui'

export function AlertTypeField() {
  const [input, meta, helper] = useField<SilencedAlertFormValues['value']>('value')

  const alertsAsOptions: Array<Option<PendingAlertValueType>> = OPERATIONAL_ALERTS.map(alert => ({
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
