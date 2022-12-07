import { useMemo, useState } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import { getNumberOfSeaAndLandBeaconMalfunctions } from '../../../../domain/entities/beaconMalfunction'
import {
  YearListChevronIcon,
  YearListContent,
  YearListTitle,
  YearListTitleText
} from '../../common_styles/YearList.style'
import { BeaconMalfunctionCard } from './BeaconMalfunctionCard'

import type { BeaconMalfunctionResumeAndDetails } from '../../../../domain/types/beaconMalfunction'

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
  const numberOfMalfunctions = useMemo(
    () => getNumberOfSeaAndLandBeaconMalfunctions(yearBeaconMalfunctions),
    [yearBeaconMalfunctions]
  )

  const sortedMalfunctions = useMemo(
    () =>
      yearBeaconMalfunctions.sort(
        (a, b) =>
          new Date(b.beaconMalfunction.malfunctionStartDateTime).getTime() -
          new Date(a.beaconMalfunction.malfunctionStartDateTime).getTime()
      ),
    [yearBeaconMalfunctions]
  )

  return (
    yearBeaconMalfunctions && (
      <Row>
        <YearListTitle isEmpty={isEmpty} isOpen={isOpen}>
          <YearListTitleText isEmpty={isEmpty} onClick={() => !isEmpty && setIsOpen(!isOpen)} title={year.toString()}>
            {!isEmpty && <YearListChevronIcon $isOpen={isOpen} />}
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
        <YearListContent isOpen={isOpen} name={year.toString()}>
          {sortedMalfunctions.map((beaconMalfunctionWithDetails, index) => (
            <BeaconMalfunctionCard
              key={beaconMalfunctionWithDetails.beaconMalfunction.id}
              beaconMalfunctionWithDetails={beaconMalfunctionWithDetails}
              isLastItem={yearBeaconMalfunctions.length === index + 1}
              setIsCurrentBeaconMalfunctionDetails={setIsCurrentBeaconMalfunctionDetails}
            />
          ))}
        </YearListContent>
      </Row>
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
  margin: 0;
  text-align: left;
  list-style-type: none;
  width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden !important;
  margin: 0;
  background: ${p => p.theme.color.white};
  color: ${COLORS.gunMetal};
  border-bottom: 1px solid ${p => p.theme.color.lightGray};
  line-height: 1.9em;
`
