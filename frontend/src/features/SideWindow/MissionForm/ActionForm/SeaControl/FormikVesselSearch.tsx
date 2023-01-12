import { useField } from 'formik'
import { useCallback } from 'react'

import { useNewWindow } from '../../../../../ui/NewWindow'
import { VesselSearch } from '../../../../VesselSearch'

import type { VesselIdentity } from '../../../../../domain/entities/vessel/types'
import type { PartialSeaControl } from '../../types'

export function FormikVesselSearch() {
  const [field, , helper] = useField<PartialSeaControl['vessel']>('vessel')

  const { newWindowContainerRef } = useNewWindow()

  const onSelectVessel = useCallback(
    (nextValue: VesselIdentity) => {
      if (!nextValue || !nextValue.vesselId || !nextValue.vesselName) {
        return
      }

      const selectedVessel = {
        externalReferenceNumber: nextValue.externalReferenceNumber,
        flagState: nextValue.flagState,
        internalReferenceNumber: nextValue.internalReferenceNumber,
        ircs: nextValue.ircs,
        mmsi: nextValue.mmsi,
        vesselId: nextValue.vesselId,
        vesselName: nextValue.vesselName
      }

      helper.setValue(selectedVessel)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const onUnselectVessel = useCallback(() => {
    helper.setValue({
      externalReferenceNumber: undefined,
      flagState: undefined,
      internalReferenceNumber: undefined,
      ircs: undefined,
      mmsi: undefined,
      vesselId: undefined,
      vesselName: undefined
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <VesselSearch
      baseRef={newWindowContainerRef}
      defaultValue={field.value}
      extendedWidth={400}
      hasVesselIdInResults
      isExtended
      isLastSearchedVesselsShowed={false}
      onClickOutsideOrEscape={() => {}}
      onInputClick={() => {}}
      onSelectVessel={onSelectVessel}
      onUnselectVessel={onUnselectVessel}
    />
  )
}
