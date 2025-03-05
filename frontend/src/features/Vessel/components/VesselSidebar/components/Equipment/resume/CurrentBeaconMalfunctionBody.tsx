import { COLORS } from '@constants/constants'
import { VesselStatusSelectValue } from '@features/BeaconMalfunction/components/BeaconMalfunctionBoard/VesselStatusSelectValue'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useEffect, useRef } from 'react'
import { SelectPicker } from 'rsuite'
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

  useEffect(() => {
    if (vesselStatus?.color && currentBeaconMalfunctionWithDetails?.beaconMalfunction?.id) {
      // TODO Use styled-component and avoid useEffect to update these elements style.
      ;(
        (vesselStatusRef.current as HTMLDivElement).querySelector('.rs-picker-select > div') as HTMLElement
      ).style.setProperty('background', vesselStatus.color, 'important')
      ;(
        (vesselStatusRef.current as HTMLDivElement).querySelector('.rs-picker-select') as HTMLElement
      ).style.setProperty('margin', '0 16px 0 0', 'important')
      ;(
        (vesselStatusRef.current as HTMLDivElement).querySelector('.rs-picker-toggle-value >  div') as HTMLElement
      ).style.setProperty('color', vesselStatus.textColor, 'important')
    }
  }, [vesselStatus, currentBeaconMalfunctionWithDetails?.beaconMalfunction])

  const updateVesselStatus = (beaconMalfunction, status) => {
    const nextBeaconMalfunction = {
      ...beaconMalfunction,
      vesselStatus: status,
      vesselStatusLastModificationDateTime: new Date().toISOString()
    }

    dispatch(
      updateBeaconMalfunctionFromKanban(beaconMalfunction.id, nextBeaconMalfunction, {
        stage: nextBeaconMalfunction.stage,
        vesselStatus: nextBeaconMalfunction.vesselStatus
      })
    )
  }

  return currentBeaconMalfunctionWithDetails ? (
    <Body ref={vesselStatusRef}>
      <SelectPicker
        cleanable={false}
        data={VESSEL_STATUS}
        onChange={status => updateVesselStatus(currentBeaconMalfunctionWithDetails?.beaconMalfunction, status)}
        renderValue={(_, item) => <VesselStatusSelectValue item={item} />}
        searchable={false}
        value={vesselStatus?.value}
      />
      <LastPosition
        style={lastPositionStyle}
        title={currentBeaconMalfunctionWithDetails?.beaconMalfunction?.malfunctionStartDateTime}
      >
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
  background: ${COLORS.white};
  position: relative;

  .rs-picker-toggle-wrapper {
    width: 184px !important;

    > .rs-picker-toggle {
      height: 30px !important;
      padding: 2px 8px !important;

      .rs-picker-toggle-value {
        span {
          display: inline-block !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
          width: 130px !important;
        }
      }

      .rs-picker-caret-icon {
        top: 3px !important;
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

const LastPosition = styled.div``
const lastPositionStyle = {
  background: `${COLORS.gainsboro} 0% 0% no-repeat padding-box`,
  borderRadius: 1,
  display: 'inline-block',
  fontWeight: 500,
  padding: '5px 8px'
}
