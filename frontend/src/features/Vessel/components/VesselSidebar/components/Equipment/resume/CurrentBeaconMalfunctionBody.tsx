import { VesselStatusSelectValue } from '@features/BeaconMalfunction/components/BeaconMalfunctionBoard/VesselStatusSelectValue'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Select, THEME } from '@mtes-mct/monitor-ui'
import { useRef } from 'react'
import styled from 'styled-components'

import { VESSEL_STATUS } from '../../../../../../BeaconMalfunction/constants'
import { updateBeaconMalfunctionFromKanban } from '../../../../../../BeaconMalfunction/useCases/updateBeaconMalfunctionFromKanban'
import { getMalfunctionStartDateText } from '../../../../../../BeaconMalfunction/utils'
import TimeAgoSVG from '../../../../../../icons/Label_horaire_VMS.svg?react'

import type { BeaconMalfunctionResumeAndDetails } from '../../../../../../BeaconMalfunction/types'

type CurrentBeaconMalfunctionBodyProps = {
  currentBeaconMalfunctionWithDetails: BeaconMalfunctionResumeAndDetails | null | undefined
}
export function CurrentBeaconMalfunctionBody({
  currentBeaconMalfunctionWithDetails
}: CurrentBeaconMalfunctionBodyProps) {
  const dispatch = useMainAppDispatch()
  const vesselStatusRef = useRef<HTMLDivElement | null>(null)
  const vesselStatus = VESSEL_STATUS.find(
    beaconMalfunctionStatusValue =>
      beaconMalfunctionStatusValue.value === currentBeaconMalfunctionWithDetails?.beaconMalfunction?.vesselStatus
  )

  const updateVesselStatus = (beaconMalfunction, status) => {
    const nextBeaconMalfunction = {
      ...beaconMalfunction,
      vesselStatus: status,
      vesselStatusLastModificationDateTime: new Date().toISOString()
    }

    dispatch(
      updateBeaconMalfunctionFromKanban(beaconMalfunction.id, nextBeaconMalfunction, {
        stage: undefined,
        vesselStatus: nextBeaconMalfunction.vesselStatus
      })
    )
  }

  return currentBeaconMalfunctionWithDetails ? (
    <Body ref={vesselStatusRef}>
      <StyledSelect
        $color={vesselStatus?.color ?? THEME.color.white}
        $textColor={vesselStatus?.textColor ?? THEME.color.charcoal}
        cleanable={false}
        isLabelHidden
        label="Status"
        name="vesselStatus"
        onChange={status => updateVesselStatus(currentBeaconMalfunctionWithDetails?.beaconMalfunction, status)}
        options={VESSEL_STATUS}
        renderValue={(_, item) => (
          <VesselStatusSelectValue item={item} textColor={vesselStatus?.textColor ?? THEME.color.charcoal} />
        )}
        searchable={false}
        value={vesselStatus?.value}
      />
      <LastPosition title={currentBeaconMalfunctionWithDetails?.beaconMalfunction?.malfunctionStartDateTime}>
        <TimeAgo style={timeAgoStyle} />
        {getMalfunctionStartDateText(currentBeaconMalfunctionWithDetails?.beaconMalfunction)}
      </LastPosition>
    </Body>
  ) : null
}

const Body = styled.div`
  margin: 15px 10px 15px 20px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  background: ${p => p.theme.color.white};
  position: relative;
`
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

const TimeAgo = styled(TimeAgoSVG)``
const timeAgoStyle = {
  marginRight: 5,
  verticalAlign: 'sub',
  width: 15
}

const LastPosition = styled.div`
  background: ${p => p.theme.color.gainsboro} 0% 0% no-repeat padding-box;
  border-radius: 1px;
  display: inline-block;
  font-weight: 500;
  padding: 5px 8px;
`
