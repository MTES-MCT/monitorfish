import { CSSProperties, MutableRefObject, useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { getMalfunctionStartDateText } from '../../../domain/entities/beaconMalfunction'
import { END_OF_MALFUNCTION_REASON_RECORD, VESSEL_STATUS } from '../../../domain/entities/beaconMalfunction/constants'
import { openBeaconMalfunctionInKanban } from '../../../domain/use_cases/beaconMalfunction/openBeaconMalfunctionInKanban'
import { showVesselFromBeaconMalfunctionsKanban } from '../../../domain/use_cases/vessel/showVesselFromBeaconMalfunctionsKanban'
import { getBeaconCreationOrModificationDate } from './beaconMalfunctions'
import { VesselStatusSelect } from './VesselStatusSelect'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'

import type { BeaconMalfunction } from '../../../domain/entities/beaconMalfunction/types'

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
      data-cy="side-window-beacon-malfunctions-card"
      style={wrapperStyle(
        hasScroll,
        isDragging,
        isDroppedId,
        beaconMalfunction?.id,
        activeBeaconId,
        endOfBeaconMalfunctionReason
      )}
    >
      <Header style={headerStyle}>
        <Row style={rowStyle(true, 8, hasScroll)}>
          <Id data-cy="side-window-vessel-id" style={idStyle}>
            #{beaconMalfunction?.id} - {getBeaconCreationOrModificationDate(beaconMalfunction)}
          </Id>
          <ShowIcon
            alt="Voir sur la carte"
            // TODO Fix the TS error when an action returns a Promise
            // @ts-ignore
            onClick={() => dispatch(showVesselFromBeaconMalfunctionsKanban(beaconMalfunction, false))}
            src={`${baseUrl}/View_on_map.png`}
            style={showIconStyle}
          />
        </Row>
        <Row style={rowStyle(false, 4, hasScroll)}>
          {beaconMalfunction?.flagState ? (
            <Flag src={`${baseUrl}/flags/${beaconMalfunction?.flagState.toLowerCase()}.svg`} style={flagStyle} />
          ) : null}
          <VesselName
            className="hover-border"
            data-cy="side-window-beacon-malfunctions-card-vessel-name"
            // TODO Fix the TS error when an action returns a Promise
            // @ts-ignore
            onClick={() => dispatch(openBeaconMalfunctionInKanban(beaconMalfunction.id))}
            style={vesselNameStyle}
          >
            {beaconMalfunction.vesselName || 'Aucun nom'}
          </VesselName>
        </Row>
      </Header>
      <Body ref={bodyRef} style={bodyStyle}>
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
            data-cy="side-window-beacon-malfunctions-end-of-malfunction"
            style={endOfMalfunctionStyle(endOfBeaconMalfunctionReason)}
          >
            {endOfBeaconMalfunctionReason?.label || 'Sans raison'}
          </EndOfMalfunction>
        )}
        <Row style={rowStyle(false, 8, hasScroll)}>
          <MalfunctionStartOrEndDateText style={malfunctionStartOrEndDateTextStyle}>
            {getMalfunctionStartDateText(beaconMalfunction)}
          </MalfunctionStartOrEndDateText>
        </Row>
      </Body>
    </Wrapper>
  )
}

const Id = styled.div``
const idStyle = {
  color: COLORS.slateGray,
  fontSize: 11
}

// We need to use an IMG tag as with a SVG a DND drag event is emitted when the pointer
// goes back to the main window
const ShowIcon = styled.img``
const showIconStyle: CSSProperties = {
  cursor: 'pointer',
  flexShrink: 0,
  float: 'right',
  height: 18,
  marginLeft: 'auto',
  marginTop: 0,
  width: 18
}

const Row = styled.div``
const rowStyle = (isFirstRow, marginTop, hasScroll): CSSProperties => ({
  display: 'flex',
  height: `${isFirstRow ? '16px' : 'unset'}`,
  margin: `${marginTop || 4}px 0 0 12px`,
  maxWidth: hasScroll ? 205 : 220,
  textAlign: 'left'
})

const Wrapper = styled.div``
const wrapperStyle = (hasScroll, isDragging, isDroppedId, id, activeBeaconId, isMalfunctionEnded) => ({
  animation: isDroppedId === id ? 'blink 1s' : 'unset',
  background: activeBeaconId === id ? COLORS.lightGray : COLORS.white,
  border: `1px solid ${COLORS.lightGray}`,
  borderRadius: 2,
  boxShadow: isDragging ? `0px 0px 10px -3px ${COLORS.gunMetal}` : 'unset',
  height: isMalfunctionEnded ? 163 : 133,
  width: hasScroll ? 230 : 245
})

const Header = styled.div``
const headerStyle = {
  borderBottom: `1px solid ${COLORS.lightGray}`,
  paddingBottom: 8,
  paddingLeft: 2
}

const Body = styled.div``
const bodyStyle = {
  paddingLeft: 2,
  paddingTop: 4
}

const Flag = styled.img``
const flagStyle = {
  cursor: 'pointer',
  display: 'inline-block',
  height: 14,
  marginTop: 3,
  verticalAlign: 'middle'
}

const VesselName = styled.div``
const vesselNameStyle: CSSProperties = {
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 700,
  height: 18,
  marginLeft: 8,
  maxWidth: 193,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
}

const MalfunctionStartOrEndDateText = styled.div``
const malfunctionStartOrEndDateTextStyle: CSSProperties = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
}

export const Priority = styled.div``
export const priorityStyle = priority => ({
  border: `1px solid ${priority ? COLORS.charcoal : COLORS.lightGray}`,
  borderRadius: 2,
  color: `${priority ? COLORS.gunMetal : COLORS.slateGray}`,
  display: 'inline-block',
  fontSize: 14,
  fontWeight: 500,
  height: 19,
  lineHeight: '14px',
  padding: '3px 9px 0px 9px',
  textAlign: 'center',
  userSelect: 'none'
})

const EndOfMalfunction = styled.div``
const endOfMalfunctionStyle: (endOfBeaconMalfunctionReason) => CSSProperties = endOfBeaconMalfunctionReason => ({
  background: endOfBeaconMalfunctionReason?.color || 'unset',
  borderRadius: 11,
  color: endOfBeaconMalfunctionReason?.textColor || 'unset',
  fontWeight: 500,
  height: 20,
  margin: '8px 12px 5px 12px',
  maxWidth: 185,
  overflow: 'hidden',
  padding: '1px 10px',
  textAlign: 'left',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  width: 'fit-content'
})
