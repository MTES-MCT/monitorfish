import { FieldError, Select, useNewWindow } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import styled from 'styled-components'

import { operationalAlertTypes } from '../../../../../domain/entities/alerts/constants'
import { PendingAlertValueType } from '../../../../../domain/entities/alerts/types'

import type { SilencedAlertFormValues } from '../types'
import type { Option } from '@mtes-mct/monitor-ui'

export function AlertTypeField() {
  const [input, meta, helper] = useField<SilencedAlertFormValues['value']>('value')
  const { newWindowContainerRef } = useNewWindow()

  const alertsAsOptions: Array<Option<PendingAlertValueType>> = operationalAlertTypes.map(alert => ({
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
        baseContainer={newWindowContainerRef.current}
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
