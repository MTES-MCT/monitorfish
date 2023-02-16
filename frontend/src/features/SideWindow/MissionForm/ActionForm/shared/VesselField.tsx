import { useFormikContext } from 'formik'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'

import { useNewWindow } from '../../../../../ui/NewWindow'
import { VesselSearch } from '../../../../VesselSearch'

import type { VesselIdentity } from '../../../../../domain/entities/vessel/types'
import type { MissionActionFormValues } from '../../types'

export function VesselField() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { setFieldValue, values } = useFormikContext<MissionActionFormValues>()

  const { newWindowContainerRef } = useNewWindow()

  const defaultValue = useMemo(
    () => ({
      flagState: values.vesselFlagState,
      vesselName: values.vesselName
    }),
    [values.vesselFlagState, values.vesselName]
  )

  const handleVesselChange = useCallback(
    (nextVessel: VesselIdentity | undefined) => {
      if (!nextVessel) {
        setFieldValue('vesselFlagState', undefined)
        setFieldValue('vesselId', undefined)
        setFieldValue('vesselInternalReferenceNumber', undefined)
        setFieldValue('vesselName', undefined)

        return
      }

      if (!nextVessel.flagState || !nextVessel.vesselId || !nextVessel.vesselName) {
        return
      }

      setFieldValue('vesselFlagState', nextVessel.flagState)
      setFieldValue('vesselId', nextVessel.vesselId)
      setFieldValue('vesselInternalReferenceNumber', nextVessel.internalReferenceNumber)
      setFieldValue('vesselName', nextVessel.vesselName)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <StyledVesselSearch
      baseRef={newWindowContainerRef}
      defaultValue={defaultValue}
      extendedWidth={400}
      hasVesselIdInResults
      isExtended
      onChange={handleVesselChange}
    />
  )
}

const StyledVesselSearch = styled(VesselSearch)`
  width: auto;
`
