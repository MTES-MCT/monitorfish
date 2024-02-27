import { useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'

import { getBeaconCreationOrModificationDate } from './beaconMalfunctions'
import { VesselStatusSelect } from './VesselStatusSelect'
import { COLORS } from '../../../constants/constants'
import { getMalfunctionStartDateText } from '../../../domain/entities/beaconMalfunction'
import { END_OF_MALFUNCTION_REASON_RECORD, VESSEL_STATUS } from '../../../domain/entities/beaconMalfunction/constants'
import { openBeaconMalfunctionInKanban } from '../../../domain/use_cases/beaconMalfunction/openBeaconMalfunctionInKanban'
import { showVesselFromBeaconMalfunctionsKanban } from '../../../domain/use_cases/vessel/showVesselFromBeaconMalfunctionsKanban'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'

import type { BeaconMalfunction } from '../../../domain/entities/beaconMalfunction/types'
import type { MutableRefObject } from 'react'

export type BeaconMalfunctionCardProps = {
  activeBeaconId: number | undefined
  baseUrl: string
  beaconMalfunction: BeaconMalfunction
  isDragging: boolean
  isDroppedId: boolean | undefined
  isShowed: boolean
  updateVesselStatus: (beaconMalfunction: BeaconMalfunction | undefined, status: string | null) => void
  verticalScrollRef: MutableRefObject<HTMLDivElement> | undefined
}

export function BeaconMalfunctionCard({
  activeBeaconId,
  baseUrl,
  beaconMalfunction,
  isDragging,
  isDroppedId,
  isShowed,
  updateVesselStatus,
  verticalScrollRef
}: BeaconMalfunctionCardProps) {
  const dispatch = useMainAppDispatch()
  const vesselStatus = VESSEL_STATUS.find(_vesselStatus => _vesselStatus.value === beaconMalfunction?.vesselStatus)
  const bodyRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const hasScroll = verticalScrollRef?.current
    ? verticalScrollRef?.current?.scrollHeight > verticalScrollRef?.current?.clientHeight
    : false

  const endOfBeaconMalfunctionReason = useMemo(
    () => END_OF_MALFUNCTION_REASON_RECORD[beaconMalfunction?.endOfBeaconMalfunctionReason],
    [beaconMalfunction]
  )

  useEffect(() => {
    if (isShowed && beaconMalfunction && wrapperRef.current) {
      wrapperRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      })
    }
  }, [isShowed, beaconMalfunction])

  return (
    <Wrapper
      ref={wrapperRef}
      $hasScroll={hasScroll}
      $isActive={activeBeaconId === beaconMalfunction.id}
      $isDragging={isDragging}
      $isDroppedId={!!isDroppedId}
      $isMalfunctionEnded={!!endOfBeaconMalfunctionReason}
      data-cy="side-window-beacon-malfunctions-card"
    >
      <Header>
        <Row $hasScroll={hasScroll} $isFirstRow $marginTop={8}>
          <Id data-cy="side-window-vessel-id">
            #{beaconMalfunction?.id} - {getBeaconCreationOrModificationDate(beaconMalfunction)}
          </Id>
          <ShowIcon
            alt="Voir sur la carte"
            onClick={() => dispatch(showVesselFromBeaconMalfunctionsKanban(beaconMalfunction, false))}
            src={`${baseUrl}/View_on_map.png`}
          />
        </Row>
        <Row $hasScroll={hasScroll} $marginTop={4}>
          {beaconMalfunction?.flagState ? (
            <Flag src={`${baseUrl}/flags/${beaconMalfunction?.flagState.toLowerCase()}.svg`} />
          ) : null}
          <VesselName
            className="hover-border"
            data-cy="side-window-beacon-malfunctions-card-vessel-name"
            onClick={() => dispatch(openBeaconMalfunctionInKanban(beaconMalfunction.id))}
          >
            {beaconMalfunction.vesselName || 'Aucun nom'}
          </VesselName>
        </Row>
      </Header>
      <Body ref={bodyRef}>
        {vesselStatus && (
          <VesselStatusSelect
            beaconMalfunction={beaconMalfunction}
            domRef={bodyRef}
            isAbsolute={false}
            isCleanable={false}
            updateVesselStatus={updateVesselStatus}
            vesselStatus={vesselStatus}
          />
        )}
        {endOfBeaconMalfunctionReason && (
          <EndOfMalfunction
            $backgroundColor={endOfBeaconMalfunctionReason.color}
            $color={endOfBeaconMalfunctionReason.textColor}
            data-cy="side-window-beacon-malfunctions-end-of-malfunction"
          >
            {endOfBeaconMalfunctionReason?.label || 'Sans raison'}
          </EndOfMalfunction>
        )}
        <Row $hasScroll={hasScroll} $marginTop={8}>
          <MalfunctionStartOrEndDateText>
            {getMalfunctionStartDateText(beaconMalfunction)}
          </MalfunctionStartOrEndDateText>
        </Row>
      </Body>
    </Wrapper>
  )
}

const Id = styled.div`
  color: ${p => p.theme.color.slateGray};
  font-size: 11px;
`

// We need to use an IMG tag as with a SVG a DND drag event is emitted when the pointer
// goes back to the main window
const ShowIcon = styled.img`
  cursor: pointer;
  flex-shrink: 0;
  float: right;
  height: 18px;
  margin-left: auto;
  margin-top: 0;
  width: 18px;
`

const Row = styled.div<{
  $hasScroll: boolean
  $isFirstRow?: boolean
  $marginTop: number
}>`
  display: flex;
  height: ${p => (p.$isFirstRow ? '16px' : 'unset')};
  margin: ${p => p.$marginTop || 4}px 0 0 0;
  max-width: ${p => (p.$hasScroll ? '205px' : '220px')};
  text-align: left;
`

const Wrapper = styled.div<{
  $hasScroll: boolean
  $isActive: boolean
  $isDragging: boolean
  $isDroppedId: boolean
  $isMalfunctionEnded: boolean
}>`
  animation: ${p => (p.$isDroppedId ? 'blink 1s' : 'unset')};
  background: ${p => (p.$isActive ? COLORS.lightGray : COLORS.white)};
  border: 1px solid ${p => p.theme.color.lightGray};
  border-radius: 2px;
  box-shadow: ${p => (p.$isDragging ? `0px 0px 10px -3px ${COLORS.gunMetal}` : 'unset')};
  height: ${p => (p.$isMalfunctionEnded ? '163px' : '133px')};
  width: ${p => (p.$hasScroll ? '230px' : '245px')};
`

const Header = styled.div`
  border-bottom: 1px solid ${COLORS.lightGray};
  padding: 0 12px 8px;
`

const Body = styled.div`
  padding: 12px;
  text-align: left;
`

const Flag = styled.img`
  cursor: pointer;
  display: inline-block;
  height: 14px;
  margin-top: 3px;
  vertical-align: middle;
`

const VesselName = styled.div`
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  height: 18px;
  margin-left: 8px;
  max-width: 193px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const MalfunctionStartOrEndDateText = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const EndOfMalfunction = styled.div<{ $backgroundColor: string; $color: string }>`
  background-color: ${p => p.$backgroundColor || 'unset'};
  border-radius: 11px;
  color: ${p => p.$color || 'unset'};
  font-weight: 500;
  height: 20px;
  margin: 8px 12px 5px;
  max-width: 185px;
  overflow: hidden;
  padding: 1px 10px;
  text-align: left;
  text-overflow: 'ellipsis';
  white-space: nowrap;
  width: fit-content;
`
