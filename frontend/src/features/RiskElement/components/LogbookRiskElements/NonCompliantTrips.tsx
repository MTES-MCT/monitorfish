import { Link } from '@mtes-mct/monitor-ui'
import { useState } from 'react'
import styled from 'styled-components'

import { getNonCompliantTripLabel } from '../../utils'

import type { RiskElement } from '../../types'

type NonCompliantTripsProps = Readonly<{
  nonCompliantTrips: RiskElement.NonCompliantTrip[]
}>

export function NonCompliantTrips({ nonCompliantTrips }: NonCompliantTripsProps) {
  const [areOtherTripsOpened, setAreOtherTripsOpened] = useState(false)
  const [lastTrip, ...otherTrips] = nonCompliantTrips

  if (!lastTrip) {
    return null
  }

  return (
    <>
      <LastOccurrence>
        <Label>Dernière occurrence</Label>
        <Value>{getNonCompliantTripLabel(lastTrip)}</Value>
      </LastOccurrence>
      {otherTrips.length > 0 && (
        <>
          {areOtherTripsOpened && (
            <OtherTrips>
              {otherTrips.map(trip => (
                <li key={trip.tripNumber}>{getNonCompliantTripLabel(trip)}</li>
              ))}
            </OtherTrips>
          )}
          <ToggleOtherTrips onClick={() => setAreOtherTripsOpened(!areOtherTripsOpened)}>
            {areOtherTripsOpened ? 'Masquer' : 'Voir'} les dates des autres occurrences
          </ToggleOtherTrips>
        </>
      )}
    </>
  )
}

const LastOccurrence = styled.div`
  display: flex;
  margin-top: 8px;
`

const Label = styled.span`
  color: ${p => p.theme.color.slateGray};
  width: 140px;
`

const Value = styled.span`
  color: ${p => p.theme.color.gunMetal};
  font-weight: 500;
`

const OtherTrips = styled.ul`
  color: ${p => p.theme.color.gunMetal};
  list-style: none;
  margin: 4px 0 0 140px;
  padding: 0;

  > li {
    margin-top: 4px;
  }
`

const ToggleOtherTrips = styled(Link)`
  cursor: pointer;
  display: block;
  margin-top: 8px;
`
