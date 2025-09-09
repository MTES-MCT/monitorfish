import { Select, THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { VesselStatusSelectValue } from './VesselStatusSelectValue'
import { VESSEL_STATUS } from '../../constants'

import type { BeaconMalfunction, BeaconMalfunctionStatusValue } from '../../types'

type VesselStatusSelectProps = {
  beaconMalfunction?: BeaconMalfunction
  isCleanable?: boolean
  updateVesselStatus: (beaconMalfunction: BeaconMalfunction | undefined, status: string) => void
  vesselStatus: Omit<BeaconMalfunctionStatusValue, 'hoursOffsetToRetrieveMalfunctionCreation'> | undefined
}
export function VesselStatusSelect({
  beaconMalfunction,
  isCleanable = false,
  updateVesselStatus,
  vesselStatus
}: VesselStatusSelectProps) {
  return (
    <StyledSelect
      $color={vesselStatus?.color ?? THEME.color.white}
      $textColor={vesselStatus?.textColor ?? THEME.color.charcoal}
      cleanable={isCleanable}
      isLabelHidden
      label="Status"
      menuStyle={{ width: '180px' }}
      name="vesselStatus"
      onChange={status => updateVesselStatus(beaconMalfunction, status as string)}
      options={VESSEL_STATUS}
      placeholder="Statut"
      renderValue={(_, item) => (
        <VesselStatusSelectValue item={item} textColor={vesselStatus?.textColor ?? THEME.color.charcoal} />
      )}
      searchable={false}
      value={vesselStatus?.value ?? undefined}
    />
  )
}

const StyledSelect = styled(Select)<{ $color: string; $textColor: string }>`
  > div {
    > .rs-picker {
      > .rs-picker-toggle {
        background-color: ${p => p.$color} !important;
        padding-right: 28px !important;
        > .rs-stack {
          > .rs-picker-toggle-indicator {
            > svg {
              color: ${p => p.$textColor} !important;
            }
          }
        }
      }
    }
  }
`
