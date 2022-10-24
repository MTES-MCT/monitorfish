import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import { ReactComponent as ChevronIconSVG } from '../../../icons/Chevron_simple_gris.svg'
import BeaconMalfunction from './BeaconMalfunction'
import { getNumberOfSeaAndLandBeaconMalfunctions } from '../../../../domain/entities/beaconMalfunction'

const YearBeaconMalfunctions = props => {
  const {
    /** @type {BeaconMalfunctionResumeAndDetails[]} yearBeaconMalfunctions */
    yearBeaconMalfunctions,
    year,
    setIsCurrentBeaconMalfunctionDetails,
    isLastItem
  } = props

  const [isOpen, setIsOpen] = useState(false)
  /** @type {{
   *  numberOfBeaconMalfunctionsAtSea: number,
   *  numberOfBeaconMalfunctionsAtPort: number
   * } || null} numberOfSeaAndLandBeaconMalfunctions */
  const [numberOfSeaAndLandBeaconMalfunctions, setNumberOfSeaAndLandBeaconMalfunctions] = useState(null)

  useEffect(() => {
    if (yearBeaconMalfunctions?.length) {
      setNumberOfSeaAndLandBeaconMalfunctions(getNumberOfSeaAndLandBeaconMalfunctions(yearBeaconMalfunctions))
    }
  }, [yearBeaconMalfunctions])

  return yearBeaconMalfunctions &&
    <Row>
      <YearTitle isEmpty={yearBeaconMalfunctions.length === 0} isLastItem={isLastItem} isOpen={isOpen}>
        <Text isEmpty={yearBeaconMalfunctions.length === 0} isOpen={isOpen} title={year} onClick={() => setIsOpen(!isOpen)}>
          {
            yearBeaconMalfunctions.length ? <ChevronIcon $isOpen={isOpen}/> : null
          }
          <Year>{year}</Year>
          <YearResume>
            {
              !yearBeaconMalfunctions.length
                ? 'Aucune avarie'
                : null
            }
            {
              numberOfSeaAndLandBeaconMalfunctions
                ? <>
                  {numberOfSeaAndLandBeaconMalfunctions?.numberOfBeaconMalfunctionsAtSea} avarie
                  {numberOfSeaAndLandBeaconMalfunctions?.numberOfBeaconMalfunctionsAtSea > 1 ? 's' : ''} en mer <AtSeaCircle/>
                  {' '}
                  {numberOfSeaAndLandBeaconMalfunctions?.numberOfBeaconMalfunctionsAtPort} avarie
                  {numberOfSeaAndLandBeaconMalfunctions?.numberOfBeaconMalfunctionsAtPort > 1 ? 's' : ''} à quai <AtPortCircle/>
                  </>
                : null
            }
          </YearResume>
        </Text>
      </YearTitle>
      <List
        isOpen={isOpen}
        name={year}>
        {
          yearBeaconMalfunctions.length
            ? yearBeaconMalfunctions
              .sort((a, b) =>
                new Date(b.beaconMalfunction.malfunctionStartDateTime) - new Date(a.beaconMalfunction.malfunctionStartDateTime))
              .map((beaconMalfunctionWithDetails, index) => {
                return <BeaconMalfunction
                  key={beaconMalfunctionWithDetails.beaconMalfunction.id}
                  beaconMalfunctionWithDetails={beaconMalfunctionWithDetails}
                  index={index}
                  isLastItem={yearBeaconMalfunctions.length === index + 1}
                  setIsCurrentBeaconMalfunctionDetails={setIsCurrentBeaconMalfunctionDetails}
                />
              })
            : null
        }
      </List>
    </Row>
}

const AtSeaCircle = styled.span`
  height: 10px;
  width: 10px;
  margin-left: 2px;
  margin-right: 7px;
  background-color: #9ED7D9;
  border-radius: 50%;
  display: inline-block;
`

const AtPortCircle = styled.span`
  height: 10px;
  width: 10px;
  margin-left: 2px;
  background-color: #F4DEAF;
  border-radius: 50%;
  display: inline-block;
`

const Year = styled.span`
  color: ${COLORS.slateGray};
  font-size: 16px;
`

const YearResume = styled.span`
  color: ${COLORS.gunMetal};
  font-size: 13px;
  margin-left: 15px;
  vertical-align: text-bottom;
`

const YearTitle = styled.span`
  padding: 7px 5px 5px 20px;
  width: 100%;
  display: flex;
  user-select: none;
  ${props => props.isEmpty ? null : 'cursor: pointer;'}
  ${props => !props.isOpen ? null : `border-bottom: 1px solid ${COLORS.gray};`}
  ${props => !props.isLastItem ? `border-bottom: 1px solid ${COLORS.gray};` : null}
`

const Row = styled.div`
  margin: 0;
  text-align: left;
  list-style-type: none;
  width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden !important;
  margin: 0;
  background: ${COLORS.background};
  color: ${COLORS.gunMetal};
  border-bottom: 1px solid ${COLORS.gray};
  line-height: 1.9em;
`

const ChevronIcon = styled(ChevronIconSVG)`
  transform: rotate(180deg);
  width: 16px;
  margin-right: 10px;
  margin-top: 9px;
  float: right;

  animation: ${props => props.$isOpen ? 'chevron-layer-opening' : 'chevron-layer-closing'} 0.5s ease forwards;

  @keyframes chevron-layer-opening {
    0%   { transform: rotate(180deg); }
    100% { transform: rotate(0deg); }
  }

  @keyframes chevron-layer-closing {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(180deg);   }
  }
`

const List = styled.div`
  height: 0;
  overflow: hidden;
  opacity: 0;
  animation: ${props => props.isOpen ? 'list-controls-opening' : 'list-controls-closing'} 0.2s ease forwards;

  @keyframes list-controls-opening {
    0%   { opacity: 0; height: 0; }
    100% { opacity: 1; height: inherit; }
  }

  @keyframes list-controls-closing {
    0%   { opacity: 1; height: inherit; }
    100% { opacity: 0; height: 0; }
  }
`

const Text = styled.div`
  color: ${COLORS.slateGray};
  font-size: 13px;
  font-weight: 500;
  width: 95%;
  ${props => props.isEmpty ? null : 'cursor: pointer;'}
`

export default YearBeaconMalfunctions
