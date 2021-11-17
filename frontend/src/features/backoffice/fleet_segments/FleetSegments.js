import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import SeaFrontSegments from './SeaFrontSegments'

const FleetSegments = () => {
  return (
    <FleetSegmentsContainer>
      <SeaFrontSegments
        title={'NORD ATLANTIQUE MANCHE OUEST (NAMO)'}
        data={[
          { id: 123, segment: 'SWW 04', segmentName: 'Bottom trawls', gears: 'test', riskFactor: 2.5, priority: 3 },
          { id: 5, segment: 'SWW 04', segmentName: 'Bottom trawls', gears: 'test', riskFactor: 2.5, priority: 3 },
          { id: 1267673, segment: 'SWW 04', segmentName: 'Bottom trawls', gears: 'test', riskFactor: 2.5, priority: 3 },
          { id: 456, segment: 'SWW 04', segmentName: 'Bottom trawls', gears: 'test', riskFactor: 2.5, priority: 3 }]}
      />
      <SeaFrontSegments
        title={'MANCHE-EST MER DU NORD (MEMN)'}
        data={[
          { id: 123, segment: 'SWW 04', segmentName: 'Bottom trawls', gears: 'test', riskFactor: 2.5, priority: 3 },
          { id: 5, segment: 'SWW 04', segmentName: 'Bottom trawls', gears: 'test', riskFactor: 2.5, priority: 3 },
          { id: 1267673, segment: 'SWW 04', segmentName: 'Bottom trawls', gears: 'test', riskFactor: 2.5, priority: 3 },
          { id: 456, segment: 'SWW 04', segmentName: 'Bottom trawls', gears: 'test', riskFactor: 2.5, priority: 3 }]}
      />
      <SeaFrontSegments
        title={'NORD ATLANTIQUE MANCHE OUEST (NAMO)'}
        data={[
          { id: 123, segment: 'SWW 04', segmentName: 'Bottom trawls', gears: 'test', riskFactor: 2.5, priority: 3 },
          { id: 5, segment: 'SWW 04', segmentName: 'Bottom trawls', gears: 'test', riskFactor: 2.5, priority: 3 },
          { id: 1267673, segment: 'SWW 04', segmentName: 'Bottom trawls', gears: 'test', riskFactor: 2.5, priority: 3 },
          { id: 456, segment: 'SWW 04', segmentName: 'Bottom trawls', gears: 'test', riskFactor: 2.5, priority: 3 }]}
      />
      <SeaFrontSegments
        title={'MANCHE-EST MER DU NORD (MEMN)'}
        data={[
          { id: 123, segment: 'SWW 04', segmentName: 'Bottom trawls', gears: 'test', riskFactor: 2.5, priority: 3 },
          { id: 5, segment: 'SWW 04', segmentName: 'Bottom trawls', gears: 'test', riskFactor: 2.5, priority: 3 },
          { id: 1267673, segment: 'SWW 04', segmentName: 'Bottom trawls', gears: 'test', riskFactor: 2.5, priority: 3 },
          { id: 456, segment: 'SWW 04', segmentName: 'Bottom trawls', gears: 'test', riskFactor: 2.5, priority: 3 }]}
      />
    </FleetSegmentsContainer>
  )
}

const FleetSegmentsContainer = styled.div`
  position: relative;
  background-color: ${COLORS.white};
  width: 100%;
  height: 100%;
  padding: 80px 20px;
  display: flex;
  overflow: auto;
`

export default FleetSegments
