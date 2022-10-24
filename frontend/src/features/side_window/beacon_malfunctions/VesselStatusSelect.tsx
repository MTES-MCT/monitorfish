import { useRef } from 'react'
import { SelectPicker } from 'rsuite'

import { vesselStatuses } from '../../../domain/entities/beaconMalfunction/constants'
import { VesselStatusSelectValue } from './VesselStatusSelectValue'

import type { BeaconMalfunction } from '../../../domain/types/beaconMalfunction'

type VesselStatusSelectProps = {
  beaconMalfunction: BeaconMalfunction
  domRef: any
  isAbsolute: boolean
  updateVesselStatus: (beaconMalfunction: BeaconMalfunction, status: string | null) => void
  // TODO Type vesselStatus in constants.tsx
  vesselStatus: { color: string; icon: JSX.Element; label: string; textColor: string; value: string }
}

export function VesselStatusSelect({
  beaconMalfunction,
  domRef,
  isAbsolute = false,
  updateVesselStatus,
  vesselStatus
}: VesselStatusSelectProps) {
  const selectMenuRef = useRef<HTMLSpanElement>(null)

  return (
    <>
      <SelectPicker
        cleanable={false}
        container={() => domRef.current}
        data={vesselStatuses}
        menuStyle={
          isAbsolute
            ? { marginLeft: 40, marginTop: 120, position: 'absolute' }
            : { marginLeft: -5, marginTop: -67, position: 'relative' }
        }
        onChange={status => updateVesselStatus(beaconMalfunction, status)}
        renderValue={(_, item) => <VesselStatusSelectValue item={item} />}
        searchable={false}
        value={vesselStatus.value}
      />
      <span ref={selectMenuRef} />
    </>
  )
}
