import { vesselApi } from '@features/Vessel/vesselApi'
import { VesselSearch } from '@features/VesselSearch'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Field, FieldError, logSoftError, useKey, useNewWindow } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import type { VesselIdentity } from 'domain/entities/vessel/types'

export function FormikVesselSelect() {
  const defaultValueRef = useRef<VesselIdentity | undefined>(undefined)

  const dispatch = useMainAppDispatch()
  const [input, meta, helper] = useField<number | undefined>('vesselId')
  const { newWindowContainerRef } = useNewWindow()

  const [isLoading, setIsLoading] = useState(true)

  const key = useKey([defaultValueRef.current, isLoading])

  const handleVesselSearchChange = async (nextVessel: VesselIdentity | undefined) => {
    if (!nextVessel) {
      defaultValueRef.current = undefined

      helper.setValue(undefined)

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
  }

  const setDefaultValue = useCallback(
    async (vesselId: number) => {
      setIsLoading(true)

      const vessel = await dispatch(vesselApi.endpoints.getVessel.initiate(vesselId)).unwrap()

      defaultValueRef.current = {
        externalReferenceNumber: vessel.externalReferenceNumber ?? null,
        flagState: vessel.flagState ?? null,
        internalReferenceNumber: null,
        ircs: vessel.ircs ?? null,
        vesselId: vessel.vesselId,
        vesselName: vessel.vesselName
      }

      setIsLoading(false)
    },
    [dispatch]
  )

  useEffect(
    () => {
      if (!input.value) {
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
        disabled={isLoading}
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
