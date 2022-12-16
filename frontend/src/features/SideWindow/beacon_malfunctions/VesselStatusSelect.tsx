import { THEME } from '@mtes-mct/monitor-ui'
import { useEffect } from 'react'
import { SelectPicker } from 'rsuite'

import { VESSEL_STATUS } from '../../../domain/entities/beaconMalfunction/constants'
import { VesselStatusSelectValue } from './VesselStatusSelectValue'

import type { BeaconMalfunction } from '../../../domain/entities/beaconMalfunction/types'

type VesselStatusSelectProps = {
  beaconMalfunction: BeaconMalfunction | undefined
  domRef: any
  isAbsolute?: boolean
  isCleanable?: boolean
  marginTop?: number | undefined
  updateVesselStatus: (beaconMalfunction: BeaconMalfunction | undefined, status: string | null) => void
  // TODO Type vesselStatus in constants.tsx
  vesselStatus: { color: string; icon: JSX.Element; label: string; textColor: string; value: string } | undefined
}
export function VesselStatusSelect({
  beaconMalfunction,
  domRef,
  isAbsolute = false,
  isCleanable = false,
  updateVesselStatus,
  marginTop = undefined,
  vesselStatus
}: VesselStatusSelectProps) {
  useEffect(() => {
    if (domRef.current) {
      // TODO Use styled-component and avoid useEffect to update these elements style.
      const selectElement = domRef.current.querySelector('.rs-picker-select') as HTMLElement
      if (selectElement?.style) {
        selectElement.style.background = vesselStatus?.color || THEME.color.white
      }

      const toggleElement = domRef.current.querySelector(
        '*[data-cy="side-window-beacon-malfunctions-vessel-status"]'
      ) as HTMLElement
      if (toggleElement?.style) {
        toggleElement.style.color = vesselStatus?.textColor || THEME.color.charcoal
      }

      const icons = domRef.current.querySelectorAll('.rs-icon') as HTMLElement[]
      icons.forEach(icon => {
        if (icon?.style) {
          // eslint-disable-next-line no-param-reassign
          icon.style.color = vesselStatus?.textColor || THEME.color.charcoal
        }
      })
    }
  }, [vesselStatus, beaconMalfunction, domRef])

  return (
    <SelectPicker
      cleanable={isCleanable}
      container={() => domRef.current}
      data={VESSEL_STATUS}
      menuStyle={
        isAbsolute
          ? { marginLeft: 40, marginTop: 120, position: 'absolute' }
          : { marginLeft: -5, marginTop: marginTop || -67, position: 'relative' }
      }
      onChange={status => updateVesselStatus(beaconMalfunction, status)}
      placeholder="Statut"
      renderValue={(_, item) => <VesselStatusSelectValue item={item} />}
      searchable={false}
      value={vesselStatus?.value || null}
    />
  )
}
