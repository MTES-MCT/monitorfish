import { VesselSearchWithMapVessels } from '@features/Vessel/components/VesselSearch/VesselSearchWithMapVessels'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { Field, FieldError, useNewWindow } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { useCallback } from 'react'
import styled from 'styled-components'

import type { ManualPriorNotificationFormValues } from '../types'
import type { Vessel } from '@features/Vessel/Vessel.types'

type FormikVesselSelectProps = Readonly<{
  onChange: (nextVessel: Vessel.VesselIdentity | undefined) => void
  readOnly?: boolean | undefined
}>
export function FormikVesselSelect({ onChange, readOnly }: FormikVesselSelectProps) {
  const [input, meta, helper] = useField<ManualPriorNotificationFormValues['vesselIdentity']>('vesselIdentity')

  const { newWindowContainerRef } = useNewWindow()

  const handleVesselSearchChange = useCallback(
    (nextVessel: Vessel.VesselIdentity | undefined) => {
      helper.setValue(nextVessel)
      onChange(nextVessel)
    },

    /* eslint-disable react-hooks/exhaustive-deps */
    // Skip `helper` dependency to avoid unecessary re-renders
    [onChange]
  )

  return (
    <Field>
      <StyledVesselSearch
        baseRef={newWindowContainerRef}
        disabled={readOnly}
        displayedErrorKey={DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_FORM_ERROR}
        hasError={!!meta.error}
        isVesselIdRequiredFromResults
        onChange={handleVesselSearchChange}
        shouldCloseOnClickOutside
        value={input.value}
      />

      {!!meta.error && <FieldError>{meta.error}</FieldError>}
    </Field>
  )
}

const StyledVesselSearch = styled(VesselSearchWithMapVessels)`
  position: relative;
  width: 100%;

  > div:first-child {
    > input {
      background-color: ${p => p.theme.color.gainsboro};
    }
  }

  > div:last-child {
    background-color: ${p => p.theme.color.gainsboro};
    width: 100%;
  }
`
