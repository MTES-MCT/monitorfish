import { vesselApi } from '@features/Vessel/vesselApi'
import { VesselSearch } from '@features/VesselSearch'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Field, FieldError, logSoftError, useKey, useNewWindow } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import type { VesselIdentity } from 'domain/entities/vessel/types'

type FormikVesselSelectProps = Readonly<{
  initialVesselIdentity: VesselIdentity | undefined
  onChange: (nextVessel: VesselIdentity | undefined) => void
  readOnly?: boolean | undefined
}>
export function FormikVesselSelect({ initialVesselIdentity, onChange, readOnly }: FormikVesselSelectProps) {
  const [input, meta, helper] = useField<number | undefined>('vesselId')

  const defaultValueRef = useRef<VesselIdentity | undefined>(initialVesselIdentity)
  const isFirstRenderRef = useRef<boolean>(true)

  const dispatch = useMainAppDispatch()
  const { newWindowContainerRef } = useNewWindow()

  const [isLoading, setIsLoading] = useState(true)

  const key = useKey([defaultValueRef.current, isLoading])

  const handleVesselSearchChange = async (nextVessel: VesselIdentity | undefined) => {
    if (!nextVessel) {
      defaultValueRef.current = undefined

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

    await setDefaultValue(nextVessel.vesselId)

    helper.setValue(nextVessel.vesselId)
    onChange(nextVessel)
  }

  const setDefaultValue = useCallback(
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
      defaultValueRef.current = nextVessel
      onChange(nextVessel)

      setIsLoading(false)
    },
    [dispatch, onChange]
  )

  useEffect(
    () => {
      if (!input.value || isFirstRenderRef.current) {
        if (isFirstRenderRef.current) {
          isFirstRenderRef.current = false
        }

        setIsLoading(false)

        return
      }

      setDefaultValue(input.value)
    },

    // Ignore `input.value` change since it should only be called on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setDefaultValue]
  )

  return (
    <Field>
      <StyledVesselSearch
        key={key}
        baseRef={newWindowContainerRef}
        defaultValue={defaultValueRef.current}
        disabled={isLoading || readOnly}
        hasError={!!meta.error}
        isVesselIdRequiredFromResults
        onChange={handleVesselSearchChange}
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
