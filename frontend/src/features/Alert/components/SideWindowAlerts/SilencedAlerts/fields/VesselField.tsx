import { UNKNOWN_VESSEL } from '@features/Vessel/types/vessel'
import { VesselSearch } from '@features/VesselSearch'
import { FormError, FormErrorCode } from '@libs/FormError'
import { Legend, useNewWindow } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import { useMemo } from 'react'
import styled from 'styled-components'

import type { SilencedAlertFormValues } from '../types'
import type { Vessel } from '@features/Vessel/Vessel.types'

export function VesselField() {
  const { errors, setValues, values } = useFormikContext<SilencedAlertFormValues>()
  const { newWindowContainerRef } = useNewWindow()

  const defaultValue: Vessel.VesselIdentity = useMemo(
    () => ({
      beaconNumber: undefined,
      districtCode: undefined,
      externalReferenceNumber: values.externalReferenceNumber,
      flagState: values.flagState ?? UNKNOWN_VESSEL.flagState,
      internalReferenceNumber: values.internalReferenceNumber,
      ircs: values.ircs,
      mmsi: undefined,
      vesselId: values.vesselId,
      vesselIdentifier: values.vesselIdentifier,
      vesselLength: undefined,
      vesselName: values.vesselName
    }),
    [
      values.flagState,
      values.vesselName,
      values.externalReferenceNumber,
      values.internalReferenceNumber,
      values.vesselId,
      values.ircs,
      values.vesselIdentifier
    ]
  )

  const handleVesselSearchChange = (nextVessel: Vessel.VesselIdentity | undefined) => {
    if (!nextVessel) {
      setValues({
        ...values,
        externalReferenceNumber: undefined,
        internalReferenceNumber: undefined,
        ircs: undefined,
        vesselId: undefined
      })

      return
    }

    if (!nextVessel.vesselIdentifier) {
      throw new FormError(nextVessel, 'vesselIdentifier', FormErrorCode.MISSING_OR_UNDEFINED)
    }

    if (!nextVessel.vesselName) {
      throw new FormError(nextVessel, 'vesselName', FormErrorCode.MISSING_OR_UNDEFINED)
    }

    setValues({
      ...values,
      externalReferenceNumber: nextVessel.externalReferenceNumber ?? undefined,
      flagState: nextVessel.flagState.toUpperCase(),
      internalReferenceNumber: nextVessel.internalReferenceNumber ?? undefined,
      ircs: nextVessel.ircs ?? undefined,
      vesselId: nextVessel.vesselId ?? undefined,
      vesselIdentifier: nextVessel.vesselIdentifier ?? undefined,
      vesselName: nextVessel.vesselName
    })
  }

  return (
    <>
      <Wrapper>
        <StyledLegend>Navire</StyledLegend>
        <Field>
          <StyledVesselSearch
            baseRef={newWindowContainerRef}
            defaultValue={defaultValue}
            disabled={values.vesselId === UNKNOWN_VESSEL.vesselId}
            extendedWidth={400}
            hasError={!!errors.vesselId}
            isExtended
            isVesselIdRequiredFromResults
            onChange={handleVesselSearchChange}
          />
        </Field>
        {values.vesselId && values.vesselId !== UNKNOWN_VESSEL.vesselId && (
          <VesselIdentityBar>
            {values.internalReferenceNumber && (
              <>
                <span>{values.internalReferenceNumber}</span> (CFR)
              </>
            )}
            {values.externalReferenceNumber && (
              <>
                <span>{values.externalReferenceNumber}</span> (Marq. ext)
              </>
            )}
            {values.ircs && (
              <>
                <span>{values.ircs}</span> (Call Sign)
              </>
            )}
          </VesselIdentityBar>
        )}
      </Wrapper>

      {errors.vesselId && <ErrorMessage>{errors.vesselId}</ErrorMessage>}
    </>
  )
}

const StyledLegend = styled(Legend)`
  font-weight: 400;
`

const ErrorMessage = styled.p`
  color: ${p => p.theme.color.maximumRed} !important;
  font-style: italic;
  margin: 4px 0 0 !important;
`

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const Field = styled.div`
  align-items: center;
  display: flex;
  border: solid 1px ${p => p.theme.color.lightGray};

  /* TODO Change that in monitor-ui */
  > div:last-child {
    label {
      white-space: nowrap;
    }
  }
`

const StyledVesselSearch = styled(VesselSearch)`
  width: 100%;
`

const VesselIdentityBar = styled.div`
  color: ${p => p.theme.color.slateGray};
  font-weight: 300;
  margin-top: 4px;

  > span {
    font-weight: normal;

    &:not(:first-child) {
      margin-left: 16px;
    }
  }
`
