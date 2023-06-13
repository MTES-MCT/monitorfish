import { Checkbox, useNewWindow } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'

import { UNKNOWN_VESSEL } from '../../../../../domain/entities/vessel/vessel'
import { useDeepCompareCallback } from '../../../../../hooks/useDeepCompareCallback'
import { VesselSearch } from '../../../../VesselSearch'

import type { VesselIdentity } from '../../../../../domain/entities/vessel/types'
import type { MissionActionFormValues } from '../../types'

export function VesselField() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { errors, setValues, values } = useFormikContext<MissionActionFormValues>()

  const { newWindowContainerRef } = useNewWindow()

  const defaultValue = useMemo(
    () => ({
      flagState: values.flagState,
      vesselName: values.vesselName === UNKNOWN_VESSEL.vesselName ? 'INCONNU' : values.vesselName
    }),
    [values.flagState, values.vesselName]
  )

  const handleVesselSearchChange = useDeepCompareCallback(
    (nextVessel: VesselIdentity | undefined) => {
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
        districtCode: nextVessel.districtCode || undefined,
        externalReferenceNumber: nextVessel.externalReferenceNumber || undefined,
        flagState: nextVessel.flagState,
        internalReferenceNumber: nextVessel.internalReferenceNumber || undefined,
        ircs: nextVessel.ircs || undefined,
        vesselId: nextVessel.vesselId,
        vesselName: nextVessel.vesselName
      })
    },
    [values]
  )

  const handleIsVesselUnknownChange = useCallback(
    (isChecked: boolean) => {
      if (isChecked) {
        handleVesselSearchChange(UNKNOWN_VESSEL)

        return
      }

      handleVesselSearchChange(undefined)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleVesselSearchChange]
  )

  return (
    <>
      <Wrapper>
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
        <Checkbox
          checked={values.vesselId === UNKNOWN_VESSEL.vesselId}
          label="Navire inconnu"
          name="isVesselUnknown"
          onChange={handleIsVesselUnknownChange}
        />
      </Wrapper>

      {errors.vesselId && <Error>{errors.vesselId}</Error>}
    </>
  )
}

const Error = styled.p`
  color: ${p => p.theme.color.maximumRed};
  font-style: italic;
  margin: 4px 0 0 !important;
`

const Wrapper = styled.div`
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
