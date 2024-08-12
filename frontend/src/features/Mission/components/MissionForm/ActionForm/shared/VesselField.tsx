import { HIDDEN_ERROR } from '@features/Mission/components/MissionForm/constants'
import { useGetVesselQuery } from '@features/Vessel/apis'
import { VesselSearch } from '@features/VesselSearch'
import { Checkbox, useNewWindow } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/query'
import { UNKNOWN_VESSEL } from 'domain/entities/vessel/vessel'
import { useFormikContext } from 'formik'
import { useMemo } from 'react'
import styled from 'styled-components'

import { useGetMissionActionFormikUsecases } from '../../hooks/useGetMissionActionFormikUsecases'

import type { MissionActionFormValues } from '../../types'
import type { VesselIdentity } from 'domain/entities/vessel/types'

export function VesselField() {
  const { errors, setValues, values } = useFormikContext<MissionActionFormValues>()
  const { updateFieldsControlledByVessel } = useGetMissionActionFormikUsecases()

  const { newWindowContainerRef } = useNewWindow()

  const { data: vessel, isFetching } = useGetVesselQuery(values.vesselId ?? skipToken)

  const defaultValue = useMemo(() => {
    if (!values.vesselId || !values.flagState) {
      return undefined
    }

    if (values.vesselId === UNKNOWN_VESSEL.vesselId) {
      return undefined
    }

    return {
      districtCode: values.districtCode ?? null,
      externalReferenceNumber: values.externalReferenceNumber ?? null,
      flagState: values.flagState ?? '',
      internalReferenceNumber: values.internalReferenceNumber ?? null,
      ircs: values.ircs ?? null,
      vesselId: values.vesselId,
      vesselName: values.vesselName ?? null
    }
  }, [
    values.flagState,
    values.vesselName,
    values.districtCode,
    values.externalReferenceNumber,
    values.internalReferenceNumber,
    values.vesselId,
    values.ircs
  ])

  const handleVesselSearchChange = (nextVessel: VesselIdentity | undefined) => {
    if (!nextVessel) {
      setValues({
        ...values,
        districtCode: undefined,
        externalReferenceNumber: undefined,
        flagState: undefined,
        internalReferenceNumber: undefined,
        ircs: undefined,
        vesselId: undefined,
        vesselName: undefined
      })

      return
    }

    // TODO Show an error in this case?
    if (!nextVessel.vesselId || !nextVessel.vesselName) {
      return
    }

    setValues({
      ...values,
      districtCode: nextVessel.districtCode ?? undefined,
      externalReferenceNumber: nextVessel.externalReferenceNumber ?? undefined,
      flagState: nextVessel.flagState,
      internalReferenceNumber: nextVessel.internalReferenceNumber ?? undefined,
      ircs: nextVessel.ircs ?? undefined,
      vesselId: nextVessel.vesselId,
      vesselName: nextVessel.vesselName
    })

    const valuesWithVessel = { ...values, internalReferenceNumber: nextVessel.internalReferenceNumber ?? undefined }
    updateFieldsControlledByVessel(valuesWithVessel)
  }

  const handleIsVesselUnknownChange = (isChecked: boolean | undefined) => {
    if (isChecked) {
      handleVesselSearchChange(UNKNOWN_VESSEL)

      return
    }

    handleVesselSearchChange(undefined)
  }

  return (
    <>
      <Wrapper>
        <Field>
          <StyledVesselSearch
            baseRef={newWindowContainerRef}
            defaultValue={defaultValue}
            disabled={values.vesselId === UNKNOWN_VESSEL.vesselId}
            extendedWidth={400}
            hasError={!!errors.vesselId}
            isExtended
            isLinkToVesselSidebarDisplayed
            isVesselIdRequiredFromResults
            onChange={handleVesselSearchChange}
          />
          <Checkbox
            checked={values.vesselId === UNKNOWN_VESSEL.vesselId}
            label="Navire inconnu"
            name="isVesselUnknown"
            onChange={handleIsVesselUnknownChange}
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
                <span>{values.externalReferenceNumber}</span> (Mq. ext)
              </>
            )}
            {values.ircs && (
              <>
                <span>{values.ircs}</span> (Call Sign)
              </>
            )}
            {!isFetching && !!vessel?.length && (
              <>
                <span>{vessel.length}m</span> (Taille)
              </>
            )}
          </VesselIdentityBar>
        )}
      </Wrapper>

      {errors.vesselId && errors.vesselId !== HIDDEN_ERROR && <ErrorMessage>{errors.vesselId}</ErrorMessage>}
    </>
  )
}

const ErrorMessage = styled.p`
  color: ${p => p.theme.color.maximumRed};
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

  > div:first-child {
    flex-grow: 1;
    margin-right: 16px;
  }

  /* TODO Change that in monitor-ui */
  > div:last-child {
    label {
      white-space: nowrap;
    }
  }
`

const StyledVesselSearch = styled(VesselSearch)`
  width: auto;
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
