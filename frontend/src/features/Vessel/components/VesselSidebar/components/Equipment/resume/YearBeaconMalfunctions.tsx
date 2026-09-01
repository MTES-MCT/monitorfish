import { getNumberOfSeaAndLandBeaconMalfunctions } from '@features/BeaconMalfunction/utils'
import {
  YearListChevronIcon,
  YearListTitle,
  YearListTitleText
} from '@features/Vessel/components/VesselSidebar/components/common/YearList.style'
import { THEME } from '@mtes-mct/monitor-ui'
import { useState } from 'react'
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
  const [isOpen, setIsOpen] = useState(false)
  const isEmpty = yearBeaconMalfunctions.length === 0
  const numberOfMalfunctions = getNumberOfSeaAndLandBeaconMalfunctions(yearBeaconMalfunctions)

  const sortedMalfunctions = yearBeaconMalfunctions.sort(
    (a, b) =>
      new Date(b.beaconMalfunction.malfunctionStartDateTime).getTime() -
      new Date(a.beaconMalfunction.malfunctionStartDateTime).getTime()
  )

  return (
    yearBeaconMalfunctions && (
      <div>
        <Row>
          <YearListTitle as={isEmpty ? 'div' : 'button'} onClick={() => !isEmpty && setIsOpen(!isOpen)}>
            <YearListTitleText>
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
            </YearListTitleText>
          </YearListTitle>
          {!isEmpty && <YearListChevronIcon isOpen={isOpen} onClick={() => !isEmpty && setIsOpen(!isOpen)} />}
        </Row>
        {isOpen && (
          <Column>
            {sortedMalfunctions.map(beaconMalfunctionWithDetails => (
              <BeaconMalfunctionCard
                key={beaconMalfunctionWithDetails.beaconMalfunction.id}
                beaconMalfunctionWithDetails={beaconMalfunctionWithDetails}
                setIsCurrentBeaconMalfunctionDetails={setIsCurrentBeaconMalfunctionDetails}
              />
            ))}
          </Column>
        )}
      </div>
    )
  )
}

const AtSeaCircle = styled.span`
  background-color: #9ed7d9;
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

const Row = styled.div`
  align-items: center;
  background: ${p => p.theme.color.white};
  color: ${p => p.theme.color.gunMetal};
  display: flex;
  line-height: 1.9em;
  white-space: nowrap;
`

const Column = styled(Row)`
  flex-direction: column;
  border-top: 1px solid ${p => p.theme.color.lightGray};
  gap: 10px;
  padding: 10px 20px;
`
