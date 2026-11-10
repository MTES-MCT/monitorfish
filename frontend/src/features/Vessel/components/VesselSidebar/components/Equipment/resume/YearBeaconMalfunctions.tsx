import { getNumberOfSeaAndLandBeaconMalfunctions } from '@features/BeaconMalfunction/utils'
import { CollapsibleListItem } from '@features/Vessel/components/VesselSidebar/components/common/CollapsibleListItem'
import { THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { BeaconMalfunctionCard } from './BeaconMalfunctionCard'

import type { BeaconMalfunctionResumeAndDetails } from '@features/BeaconMalfunction/types'

type YearBeaconMalfunctionsProps = {
  setIsCurrentBeaconMalfunctionDetails: (boolean) => void
  year: number
  yearBeaconMalfunctions: BeaconMalfunctionResumeAndDetails[]
}

export function YearBeaconMalfunctions({
  setIsCurrentBeaconMalfunctionDetails,
  year,
  yearBeaconMalfunctions
}: YearBeaconMalfunctionsProps) {
  const isEmpty = yearBeaconMalfunctions.length === 0
  const numberOfMalfunctions = getNumberOfSeaAndLandBeaconMalfunctions(yearBeaconMalfunctions)

  const sortedMalfunctions = yearBeaconMalfunctions.sort(
    (a, b) =>
      new Date(b.beaconMalfunction.malfunctionStartDateTime).getTime() -
      new Date(a.beaconMalfunction.malfunctionStartDateTime).getTime()
  )

  return (
    <CollapsibleListItem
      isEmpty={isEmpty}
      title={
        <>
          <Year>{year}</Year>
          <YearResume>
            {isEmpty && 'Aucune avarie'}
            {numberOfMalfunctions && (
              <>
                {numberOfMalfunctions?.atSea} avarie
                {numberOfMalfunctions?.atSea > 1 ? 's' : ''} en mer <AtSeaCircle /> {numberOfMalfunctions?.atPort}{' '}
                avarie
                {numberOfMalfunctions?.atPort > 1 ? 's' : ''} à quai <AtPortCircle />
              </>
            )}
          </YearResume>
        </>
      }
    >
      <Column>
        {sortedMalfunctions.map(beaconMalfunctionWithDetails => (
          <BeaconMalfunctionCard
            key={beaconMalfunctionWithDetails.beaconMalfunction.id}
            beaconMalfunctionWithDetails={beaconMalfunctionWithDetails}
            setIsCurrentBeaconMalfunctionDetails={setIsCurrentBeaconMalfunctionDetails}
          />
        ))}
      </Column>
    </CollapsibleListItem>
  )
}

const AtSeaCircle = styled.span`
  background-color: ${p => p.theme.color.powderBlue};
  border-radius: 50%;
  display: inline-block;
  height: 10px;
  margin-left: 2px;
  margin-right: 7px;
  width: 10px;
`

const AtPortCircle = styled.span`
  background-color: #f4deaf;
  border-radius: 50%;
  display: inline-block;
  height: 10px;
  margin-left: 2px;
  width: 10px;
`

const Year = styled.span`
  color: ${THEME.color.slateGray};
  font-size: 16px;
`

const YearResume = styled.span`
  color: ${THEME.color.gunMetal};
  font-size: 13px;
  margin-left: 15px;
  vertical-align: text-bottom;
`

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 20px;
`
