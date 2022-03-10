import React, { useRef } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import Draggable from './Draggable'
import StageColumnHeader from './StageColumnHeader'
import BeaconMalfunctionCard from './BeaconMalfunctionCard'

const StageColumn = ({ stage, beaconMalfunctions, updateVesselStatus, isDroppedId, baseUrl, horizontalScrollRef }) => {
  const verticalScrollRef = useRef()

  return <Wrapper
    data-cy={`side-window-beacon-malfunctions-columns-${stage.code}`}
    style={wrapperStyle}
  >
    <StageColumnHeader
      stage={stage?.title}
      description={stage?.description}
      numberOfItems={beaconMalfunctions?.length}
    />
    <ScrollableContainer
      style={ScrollableContainerStyle}
      ref={verticalScrollRef}
    >
      {
        beaconMalfunctions
          .map((beaconMalfunction, index) => {
            return <Draggable
              key={beaconMalfunction.id}
              id={beaconMalfunction.id}
              stageId={stage.code}
              isDroppedId={isDroppedId}
              index={index}
              horizontalScrollRef={horizontalScrollRef}
              verticalScrollRef={verticalScrollRef}
            >
              <BeaconMalfunctionCard
                verticalScrollRef={verticalScrollRef}
                baseUrl={baseUrl}
                beaconMalfunction={beaconMalfunction}
                updateVesselStatus={updateVesselStatus}
              />
            </Draggable>
          })
      }
    </ScrollableContainer>
  </Wrapper>
}

const ScrollableContainer = styled.div``
const ScrollableContainerStyle = {
  overflowY: 'auto',
  overflowX: 'hidden',
  height: 'calc(100vh - 232px)'
}

const Wrapper = styled.div``
const wrapperStyle = {
  width: 267,
  border: `1px solid ${COLORS.lightGray}`,
  height: 'calc(100vh - 100px)'
}

export default StageColumn
