import { useRef } from 'react'
import styled from 'styled-components'

import { BeaconMalfunctionCard } from './BeaconMalfunctionCard'
import { Draggable } from './Draggable'
import { StageColumnHeader } from './StageColumnHeader'
import { COLORS } from '../../../constants/constants'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'

import type {
  BeaconMalfunction,
  BeaconMalfunctionStageColumnValue
} from '../../../domain/entities/beaconMalfunction/types'
import type { CSSProperties, MutableRefObject } from 'react'

type StageColumnType = {
  activeBeaconMalfunction: BeaconMalfunction | null
  baseUrl: string
  beaconMalfunctions: BeaconMalfunction[]
  isDroppedId: boolean
  stage: BeaconMalfunctionStageColumnValue
  updateVesselStatus
}
export function StageColumn({
  activeBeaconMalfunction,
  baseUrl,
  beaconMalfunctions,
  isDroppedId,
  stage,
  updateVesselStatus
}: StageColumnType) {
  const verticalScrollRef = useRef<HTMLDivElement>(null) as MutableRefObject<HTMLDivElement>
  const openedBeaconMalfunctionInKanban = useMainAppSelector(
    state => state.beaconMalfunction.openedBeaconMalfunctionInKanban
  )

  return (
    <Wrapper data-cy={`side-window-beacon-malfunctions-columns-${stage.code}`} style={wrapperStyle}>
      <StageColumnHeader
        description={stage.description}
        ids={beaconMalfunctions.map(beaconMalfunction => beaconMalfunction.id)}
        numberOfItems={beaconMalfunctions?.length}
        stage={stage.title}
      />
      <ScrollableContainer ref={verticalScrollRef} className="smooth-scroll" style={ScrollableContainerStyle}>
        {beaconMalfunctions.map(beaconMalfunction => (
          <Draggable key={beaconMalfunction.id} id={beaconMalfunction.id} stageId={stage.code}>
            <BeaconMalfunctionCard
              activeBeaconId={activeBeaconMalfunction?.id}
              baseUrl={baseUrl}
              beaconMalfunction={beaconMalfunction}
              isDragging={false}
              isDroppedId={isDroppedId}
              isShowed={openedBeaconMalfunctionInKanban?.beaconMalfunction?.id === beaconMalfunction.id}
              updateVesselStatus={updateVesselStatus}
              verticalScrollRef={verticalScrollRef}
            />
          </Draggable>
        ))}
      </ScrollableContainer>
    </Wrapper>
  )
}

const ScrollableContainer = styled.div``
const ScrollableContainerStyle: CSSProperties = {
  height: 'calc(100vh - 232px)',
  overflowX: 'hidden',
  overflowY: 'auto'
}

const Wrapper = styled.div``
const wrapperStyle = {
  border: `1px solid ${COLORS.lightGray}`,
  height: 'calc(100vh - 100px)',
  width: 267
}
