import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { Draggable } from './Draggable'
import StageColumnHeader from './StageColumnHeader'
import BeaconStatusCard from './BeaconStatusCard'

const StageColumn = ({ stage, beaconStatuses, baseUrl }) => {
  return <Wrapper>
    <StageColumnHeader
      title={stage?.title}
      description={stage?.description}
      numberOfItems={beaconStatuses?.length}
    />
    <Body>
      {
        beaconStatuses.map(beaconStatus => {
          return <Draggable
            key={beaconStatus.id}
            id={beaconStatus.id}
            stageId={stage.code}
          >
            <BeaconStatusCard
              baseUrl={baseUrl}
              beaconStatus={beaconStatus}
            />
          </Draggable>
        })
      }
    </Body>
  </Wrapper>
}

const Wrapper = styled.div`
  width: 282px;
  background: ${COLORS.gainsboro} 0% 0% no-repeat padding-box;
  border: 1px solid ${COLORS.lightGray};
  margin: 10px 5px;
  min-height: 700px;
`

const Body = styled.div`
  height: 100%;
`

export default StageColumn
