import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'
import InfoSVG from '../icons/Information.svg?react'

const FleetSegments = ({ selectedVessel, fleetSegmentsReferential }) => {
  const [fleetSegments, setFleetSegments] = useState([])

  useEffect(() => {
    if (selectedVessel &&
      selectedVessel.segments &&
      selectedVessel.segments.length) {
      if (fleetSegmentsReferential && fleetSegmentsReferential.length) {
        const nextFleetSegments = selectedVessel.segments.map(segment => {
          const found = fleetSegmentsReferential.find(segmentWithProperties => segmentWithProperties.segment === segment)

          if (found) {
            return found
          } else {
            return {
              segment: segment
            }
          }
        }).filter(segment => segment)

        setFleetSegments(nextFleetSegments)
      } else {
        const nextFleetSegments = selectedVessel.segments.map(segment => {
          return {
            segment: segment
          }
        })
        setFleetSegments(nextFleetSegments)
      }
    } else {
      setFleetSegments([])
    }
  }, [fleetSegmentsReferential, selectedVessel])

  function getSegmentInfo (segment) {
    if (segment.gears || segment.faoAreas || segment.targetSpecies || segment.dirm || segment.bycatchSpecies) {
      const gears = segment.gears && segment.gears.length ? segment.gears.join(', ') : 'aucun'
      const faoAreas = segment.faoAreas && segment.faoAreas.length ? segment.faoAreas.join(', ') : 'aucune'
      const dirm = segment.dirm && segment.dirm.length ? segment.dirm.join(', ') : 'aucune'

      let targetSpeciesArray = []
      if (segment.targetSpecies && segment.targetSpecies.length) {
        targetSpeciesArray = targetSpeciesArray.concat(segment.targetSpecies)
      }
      if (segment.bycatchSpecies && segment.bycatchSpecies.length) {
        targetSpeciesArray = targetSpeciesArray.concat(segment.bycatchSpecies)
      }
      const targetSpecies = targetSpeciesArray && targetSpeciesArray.length ? targetSpeciesArray.join(', ') : 'aucune'

      return `Engins: ${gears}
Zones FAO: ${faoAreas}
Espèces: ${targetSpecies}
Façade: ${dirm}`
    } else {
      return 'Segment de flotte inconnu'
    }
  }

  return (
    <>
      {
        fleetSegments && fleetSegments.length
          ? fleetSegments.map((segment, index) => {
            return <span key={index}>
                  {segment.segment}
              <Info $isInfoSegment={true} title={getSegmentInfo(segment)}/>
              {fleetSegments.length === index + 1 ? '' : ', '}
                </span>
          })
          : <NoValue>-</NoValue>
      }
    </>
  )
}

const NoValue = styled.span`
  color: ${COLORS.slateGray};
  font-weight: 300;
  line-height: normal;
`

const Info = styled(InfoSVG)`
  width: 14px;
  vertical-align: text-bottom;
  margin-bottom: 2px;
  margin-left: ${props => props.$isInfoSegment ? '5px' : '2px'};
`

export default FleetSegments
