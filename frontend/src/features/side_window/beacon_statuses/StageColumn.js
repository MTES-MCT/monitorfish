import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import Draggable from './Draggable'
import StageColumnHeader from './StageColumnHeader'
import BeaconStatusCard from './BeaconStatusCard'
import { SortableContext } from '@dnd-kit/sortable'

const StageColumn = ({ stage, beaconStatuses, updateVesselStatus, isDroppedId, baseUrl }) => {
  const updateStageVesselStatus = (beaconStatus, status) => updateVesselStatus(stage?.code, beaconStatus, status)

  return <Wrapper>
    <StageColumnHeader
      title={stage?.title}
      description={stage?.description}
      numberOfItems={beaconStatuses?.length}
    />
    <SortableContext items={beaconStatuses}>
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
    </SortableContext>
  </Wrapper>
}

const Wrapper = styled.div`
  width: 282px;
  border: 1px solid ${COLORS.lightGray};
  height: calc(100vh - 50px);
  
  @keyframes blink {
    0%   { background: ${COLORS.background}; }
    50% { background: ${COLORS.shadowBlue} }
    0%   { background: ${COLORS.background}; }
  }
`

export default React.memo(StageColumn)
