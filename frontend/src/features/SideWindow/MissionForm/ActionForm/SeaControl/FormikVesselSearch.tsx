import { useField } from 'formik'
import { RefObject, useCallback } from 'react'

import { VesselSearch } from '../../../../VesselSearch'

import type { VesselIdentity } from '../../../../../domain/entities/vessel/types'
import type { PartialSeaControl } from '../../types'

export type FormikVesselSearchProps = {
  baseRef: RefObject<HTMLDivElement>
}
export function FormikVesselSearch({ baseRef }: FormikVesselSearchProps) {
  const [field, , helper] = useField<PartialSeaControl['vessel']>('vessel')

  const onSelectVessel = useCallback(
    (_nextValue: VesselIdentity) => {
      if (!_nextValue || !_nextValue.vesselId || !_nextValue.vesselName) {
        return
      }

      const nextValue = {
        externalReferenceNumber: _nextValue.externalReferenceNumber,
        flagState: _nextValue.flagState,
        internalReferenceNumber: _nextValue.internalReferenceNumber,
        ircs: _nextValue.ircs,
        mmsi: _nextValue.mmsi,
        vesselId: _nextValue.vesselId,
        vesselName: _nextValue.vesselName
      }

      helper.setValue(nextValue)
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
      baseRef={baseRef}
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
