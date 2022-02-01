import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import Draggable from './Draggable'
import StageColumnHeader from './StageColumnHeader'
import BeaconStatusCard from './BeaconStatusCard'

const StageColumn = ({ stage, beaconStatuses, updateVesselStatus, isDroppedId, baseUrl }) => {
  const updateStageVesselStatus = (beaconStatus, status) => updateVesselStatus(stage?.code, beaconStatus, status)

  return <Wrapper
    data-cy={`side-window-beacon-statuses-columns-${stage.code}`}
    style={wrapperStyle}
  >
    <StageColumnHeader
      title={stage?.title}
      description={stage?.description}
      numberOfItems={beaconStatuses?.length}
    />
    <ScrollableContainer style={ScrollableContainerStyle}>
      {
        beaconStatuses
          .map((beaconStatus, index) => {
            return <Draggable
              key={beaconStatus.id}
              id={beaconStatus.id}
              stageId={stage.code}
              isDroppedId={isDroppedId}
              index={index}
            >
              <BeaconStatusCard
                baseUrl={baseUrl}
                beaconStatus={beaconStatus}
                updateStageVesselStatus={updateStageVesselStatus}
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
  width: 282,
  border: `1px solid ${COLORS.lightGray}`,
  height: 'calc(100vh - 100px)'
}

export default StageColumn
