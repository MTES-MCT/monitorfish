import { Legend, useNewWindow } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import { useMemo } from 'react'
import styled from 'styled-components'

import { UNKNOWN_VESSEL } from '../../../../../domain/entities/vessel/vessel'
import { VesselSearch } from '../../../../VesselSearch'

import type { VesselIdentity } from '../../../../../domain/entities/vessel/types'
import type { SilencedAlertFormValues } from '../types'
import {FormError, FormErrorCode} from "../../../../../libs/FormError";

export function VesselField() {
  const { errors, setValues, values } = useFormikContext<SilencedAlertFormValues>()
  const { newWindowContainerRef } = useNewWindow()

  const defaultValue: VesselIdentity = useMemo(
    () => ({
      externalReferenceNumber: values.externalReferenceNumber || null,
      flagState: values.flagState || '',
      internalReferenceNumber: values.internalReferenceNumber || null,
      ircs: values.ircs || null,
      vesselId: values.vesselId || null,
      vesselIdentifier: values.vesselIdentifier || null,
      vesselName: values.vesselName || null
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

  const handleVesselSearchChange = (nextVessel: VesselIdentity | undefined) => {
    if (!nextVessel) {
      setValues({
        ...values,
        externalReferenceNumber: null,
        internalReferenceNumber: null,
        ircs: null,
        vesselId: null,
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
      externalReferenceNumber: nextVessel.externalReferenceNumber || null,
      flagState: nextVessel.flagState,
      internalReferenceNumber: nextVessel.internalReferenceNumber || null,
      ircs: nextVessel.ircs || null,
      vesselId: nextVessel.vesselId || null,
      vesselIdentifier: nextVessel.vesselIdentifier,
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
            hasVesselIdInResults
            isExtended
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

      {errors.vesselId && <Error>{errors.vesselId}</Error>}
    </>
  )
}

const StyledLegend = styled(Legend)`
  font-weight: 400;
`

const Error = styled.p`
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

    :not(:first-child) {
      margin-left: 16px;
    }
  }
`
