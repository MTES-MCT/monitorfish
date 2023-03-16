import { Checkbox } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import { useNewWindow } from '../../../../../ui/NewWindow'
import { VesselSearch } from '../../../../VesselSearch'

import type { VesselIdentity } from '../../../../../domain/entities/vessel/types'
import type { MissionActionFormValues } from '../../types'

export function VesselField() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { setFieldValue, values } = useFormikContext<MissionActionFormValues>()

  const { newWindowContainerRef } = useNewWindow()

  const [isVesselSearchDisabled, setIsVesselSearchDisabled] = useState(false)

  const defaultValue = useMemo(
    () => ({
      flagState: values.flagState,
      vesselName: values.vesselName
    }),
    [values.flagState, values.vesselName]
  )

  const handleVesselSearchChange = useCallback(
    (nextVessel: VesselIdentity | undefined) => {
      if (!nextVessel) {
        setFieldValue('externalReferenceNumber', undefined)
        setFieldValue('flagState', undefined)
        setFieldValue('internalReferenceNumber', undefined)
        setFieldValue('ircs', undefined)
        setFieldValue('vesselId', undefined)
        setFieldValue('vesselName', undefined)

        return
      }

      // TODO I don't really know why these fields can be null in the original types.
      if (
        !nextVessel.externalReferenceNumber ||
        !nextVessel.internalReferenceNumber ||
        !nextVessel.ircs ||
        !nextVessel.vesselId ||
        !nextVessel.vesselName
      ) {
        return
      }

      setFieldValue('externalReferenceNumber', nextVessel.externalReferenceNumber)
      setFieldValue('flagState', nextVessel.flagState)
      setFieldValue('internalReferenceNumber', nextVessel.internalReferenceNumber)
      setFieldValue('ircs', nextVessel.ircs)
      setFieldValue('vesselId', nextVessel.vesselId)
      setFieldValue('vesselName', nextVessel.vesselName)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const handleIsUnknownVesselChange = useCallback(
    (isChecked: boolean) => {
      if (isChecked) {
        setIsVesselSearchDisabled(true)

        handleVesselSearchChange(undefined)

        return
      }

      // TODO I don't really know why these fields can be null in the original types.
      setIsVesselSearchDisabled(false)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleVesselSearchChange]
  )

  return (
    <Wrapper>
      <StyledVesselSearch
        baseRef={newWindowContainerRef}
        defaultValue={defaultValue}
        disabled={isVesselSearchDisabled}
        extendedWidth={400}
        hasVesselIdInResults
        isExtended
        onChange={handleVesselSearchChange}
      />

      <Checkbox
        disabled={Boolean(values.vesselId)}
        label="Navire inconnu"
        name="isUnknownVessel"
        onChange={handleIsUnknownVesselChange}
      />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  align-items: center;
  display: flex;

  > div:first-child {
    flex-grow: 1;
    margin-right: 16px;
  }

  /* TODO CHange that in monitor-ui */
  > div:last-child {
    label {
      white-space: nowrap;
    }
  }
`

const StyledVesselSearch = styled(VesselSearch)`
  width: auto;
`
