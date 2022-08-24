import React, { useRef } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import BeaconMalfunctionCard from './BeaconMalfunctionCard'
import Draggable from './Draggable'
import StageColumnHeader from './StageColumnHeader'

function StageColumn({
  stage,
  beaconMalfunctions,
  updateVesselStatus,
  isDroppedId,
  baseUrl,
  activeBeaconMalfunction,
  baseRef,
}) {
  const verticalScrollRef = useRef()
  const { openedBeaconMalfunctionInKanban } = useSelector(state => state.beaconMalfunction)

  return (
    <Wrapper data-cy={`side-window-beacon-malfunctions-columns-${stage.code}`} style={wrapperStyle}>
      <StageColumnHeader
        stage={stage?.title}
        description={stage?.description}
        numberOfItems={beaconMalfunctions?.length}
      />
      <ScrollableContainer style={ScrollableContainerStyle} ref={verticalScrollRef} className={'smooth-scroll'}>
        {beaconMalfunctions.map(beaconMalfunction => <Draggable
              key={beaconMalfunction.id}
              id={beaconMalfunction.id}
              stageId={stage.code}
            >
              <BeaconMalfunctionCard
                showed={openedBeaconMalfunctionInKanban?.beaconMalfunction?.id === beaconMalfunction.id}
                verticalScrollRef={verticalScrollRef}
                baseUrl={baseUrl}
                beaconMalfunction={beaconMalfunction}
                updateVesselStatus={updateVesselStatus}
                isDroppedId={isDroppedId}
                isDragging={false}
                activeBeaconMalfunctionId={activeBeaconMalfunction?.id}
                baseRef={baseRef}
              />
            </Draggable>)
        })}
      </ScrollableContainer>
    </Wrapper>
  )
}

const ScrollableContainer = styled.div``
const ScrollableContainerStyle = {
  overflowX: 'hidden',
  height: 'calc(100vh - 232px)',
  overflowY: 'auto',
}

const Wrapper = styled.div``
const wrapperStyle = {
  border: `1px solid ${COLORS.lightGray}`,
  height: 'calc(100vh - 100px)',
  width: 267,
}

export default StageColumn
