import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import Draggable from './Draggable'
import StageColumnHeader from './StageColumnHeader'
import BeaconStatusCard from './BeaconStatusCard'

const StageColumn = ({ stage, beaconStatuses, updateVesselStatus, isDroppedId, baseUrl }) => {
  const updateStageVesselStatus = (beaconStatus, status) => updateVesselStatus(stage?.code, beaconStatus, status)

  return <Wrapper style={wrapperStyle}>
    <StageColumnHeader
      title={stage?.title}
      description={stage?.description}
      numberOfItems={beaconStatuses?.length}
    />
    {
      beaconStatuses
        .map(beaconStatus => {
          return <Draggable
            key={beaconStatus.id}
            id={beaconStatus.id}
            stageId={stage.code}
            isDroppedId={isDroppedId}
          >
            <BeaconStatusCard
              baseUrl={baseUrl}
              beaconStatus={beaconStatus}
              updateStageVesselStatus={updateStageVesselStatus}
            />
          </Draggable>
        })
    }
  </Wrapper>
}

const Wrapper = styled.div``
const wrapperStyle = {
  width: 282,
  border: `1px solid ${COLORS.lightGray}`,
  height: 'calc(100vh - 100px)'
}

export default StageColumn
