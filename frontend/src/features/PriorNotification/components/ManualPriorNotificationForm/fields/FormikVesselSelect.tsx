import { VesselSearchWithMapVessels } from '@features/Vessel/components/VesselSearch/VesselSearchWithMapVessels'
import { getVesselIdentityFromVessel } from '@features/Vessel/utils'
import { vesselApi } from '@features/Vessel/vesselApi'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { Field, FieldError, logSoftError, useNewWindow } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { useCallback, useRef, useState } from 'react'
import styled from 'styled-components'

import type { Vessel } from '@features/Vessel/Vessel.types'

type FormikVesselSelectProps = Readonly<{
  initialVesselIdentity: Vessel.VesselIdentity | undefined
  onChange: (nextVessel: Vessel.VesselIdentity | undefined) => void
  readOnly?: boolean | undefined
}>
export function FormikVesselSelect({ initialVesselIdentity, onChange, readOnly }: FormikVesselSelectProps) {
  const [, meta, helper] = useField<number | undefined>('vesselId')

  const valueRef = useRef<Vessel.VesselIdentity | undefined>(initialVesselIdentity)

  const dispatch = useMainAppDispatch()
  const { newWindowContainerRef } = useNewWindow()

  const [isLoading, setIsLoading] = useState(false)

  const handleVesselSearchChange = async (nextVessel: Vessel.VesselIdentity | undefined) => {
    if (!nextVessel) {
      valueRef.current = undefined

      helper.setValue(undefined)
      onChange(undefined)

      return
    }

    // TODO Show an error in this case?
    if (!nextVessel.vesselId) {
      logSoftError({
        isSideWindowError: true,
        message: '`nextVessel.vesselId` is null or undefined.',
        userMessage: 'Une erreur est survenue lors de la sélection du navire. Veuillez réessayer.'
      })

      return
    }

    await setValue(nextVessel.vesselId)
    helper.setValue(nextVessel.vesselId)

    onChange(nextVessel)
  }

  const setValue = useCallback(
    async (vesselId: number) => {
      setIsLoading(true)

      const vessel = await dispatch(vesselApi.endpoints.getVessel.initiate(vesselId)).unwrap()

      const nextVesselIdentity = getVesselIdentityFromVessel(vessel)

      valueRef.current = nextVesselIdentity

      setIsLoading(false)

      onChange(nextVesselIdentity)
    },
    [dispatch, onChange]
  )

  return (
    <Field>
      <StyledVesselSearch
        baseRef={newWindowContainerRef}
        disabled={isLoading || readOnly}
        displayedErrorKey={DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_FORM_ERROR}
        hasError={!!meta.error}
        isVesselIdRequiredFromResults
        onChange={handleVesselSearchChange}
        shouldCloseOnClickOutside
        value={valueRef.current}
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
