import { VesselSearch } from '@features/Vessel/components/VesselSearch'
import { vesselSelectors } from '@features/Vessel/slice'
import { vesselApi } from '@features/Vessel/vesselApi'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Field, FieldError, logSoftError, useNewWindow } from '@mtes-mct/monitor-ui'
import { getOnlyVesselIdentityProperties } from 'domain/entities/vessel/vessel'
import { useField } from 'formik'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import type { VesselIdentity } from 'domain/entities/vessel/types'

type FormikVesselSelectProps = Readonly<{
  initialVesselIdentity: VesselIdentity | undefined
  onChange: (nextVessel: VesselIdentity | undefined) => void
  readOnly?: boolean | undefined
}>
export function FormikVesselSelect({ initialVesselIdentity, onChange, readOnly }: FormikVesselSelectProps) {
  const [input, meta, helper] = useField<number | undefined>('vesselId')

  const valueRef = useRef<VesselIdentity | undefined>(initialVesselIdentity)

  const dispatch = useMainAppDispatch()
  const cachedVesselEnhancedLastPositionWebGLObjects = useMainAppSelector(state =>
    vesselSelectors.selectAll(state.vessel.vessels)
  )
  const { newWindowContainerRef } = useNewWindow()

  const [isLoading, setIsLoading] = useState(true)

  const cachedVesselIdentities = useMemo(
    () => cachedVesselEnhancedLastPositionWebGLObjects.map(getOnlyVesselIdentityProperties),
    [cachedVesselEnhancedLastPositionWebGLObjects]
  )

  const handleVesselSearchChange = async (nextVessel: VesselIdentity | undefined) => {
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

      const nextVessel: VesselIdentity = {
        externalReferenceNumber: vessel.externalReferenceNumber ?? null,
        flagState: vessel.flagState ?? null,
        internalReferenceNumber: vessel.internalReferenceNumber ?? null,
        ircs: vessel.ircs ?? null,
        mmsi: vessel.mmsi ?? null,
        vesselId: vessel.vesselId ?? null,
        vesselName: vessel.vesselName ?? null
      }
      valueRef.current = nextVessel
      onChange(nextVessel)

      setIsLoading(false)
    },
    [dispatch, onChange]
  )

  useEffect(
    () => {
      if (!input.value) {
        setIsLoading(false)

        return
      }

      setValue(input.value)
    },

    // Ignore `input.value` change since it should only be called on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setValue]
  )

  return (
    <Field>
      <StyledVesselSearch
        baseRef={newWindowContainerRef}
        cachedVesselIdentities={cachedVesselIdentities}
        disabled={isLoading || readOnly}
        hasError={!!meta.error}
        isVesselIdRequiredFromResults
        onChange={handleVesselSearchChange}
        value={valueRef.current}
      />

      {!!meta.error && <FieldError>{meta.error}</FieldError>}
    </Field>
  )
}

const StyledVesselSearch = styled(VesselSearch)`
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
