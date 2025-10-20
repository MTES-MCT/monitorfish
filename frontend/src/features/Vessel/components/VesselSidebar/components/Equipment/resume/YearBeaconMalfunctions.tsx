import { COLORS } from '@constants/constants'
import {
  YearListChevronIcon,
  YearListTitle,
  YearListTitleText
} from '@features/Vessel/components/VesselSidebar/components/common/YearList.style'
import { useState } from 'react'
import styled from 'styled-components'

import { BeaconMalfunctionCard } from './BeaconMalfunctionCard'
import { getNumberOfSeaAndLandBeaconMalfunctions } from '../../../../../../BeaconMalfunction/utils'

import type { BeaconMalfunctionResumeAndDetails } from '../../../../../../BeaconMalfunction/types'

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
  height: 10px;
  width: 10px;
  margin-left: 2px;
  margin-right: 7px;
  background-color: #9ed7d9;
  border-radius: 50%;
  display: inline-block;
`

const AtPortCircle = styled.span`
  height: 10px;
  width: 10px;
  margin-left: 2px;
  background-color: #f4deaf;
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

const Row = styled.div`
  display: flex;
  align-items: center;
  white-space: nowrap;
  background: ${p => p.theme.color.white};
  color: ${p => p.theme.color.gunMetal};
  line-height: 1.9em;
`

const Column = styled(Row)`
  flex-direction: column;
  border-top: 1px solid ${p => p.theme.color.lightGray};
  gap: 10px;
  padding: 10px 20px;
`
