import { useGetVesselReportingsByVesselIdentityQuery } from '@features/Vessel/vesselApi'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Link } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/query'
import { pluralize } from '@utils/pluralize'
import { useState } from 'react'
import styled from 'styled-components'

const DEFAULT_INFRACTIONS_DISPLAYED = 5

export function InfractionSuspicionSummary() {
  const archivedReportingsFromDate = useMainAppSelector(state => state.mainWindowReporting.archivedReportingsFromDate)
  const vesselIdentity = useMainAppSelector(state => state.mainWindowReporting.vesselIdentity)

  const { data: selectedVesselReportings } = useGetVesselReportingsByVesselIdentityQuery(
    vesselIdentity
      ? {
          fromDate: archivedReportingsFromDate,
          vesselIdentity
        }
      : skipToken
  )

  const [areAllInfractionsSuspicionShowed, setAreAllInfractionsSuspicionShowed] = useState(false)

  const summary = selectedVesselReportings?.summary
  const displayedInfractionsSuspicion =
    summary?.infractionSuspicionsSummary.slice(
      0,
      areAllInfractionsSuspicionShowed
        ? (summary?.infractionSuspicionsSummary?.length ?? DEFAULT_INFRACTIONS_DISPLAYED)
        : DEFAULT_INFRACTIONS_DISPLAYED
    ) ?? []

  return (
    <Wrapper>
      <Label>
        Suspicions d&apos;infraction <LabelNumber>{summary?.numberOfInfractionSuspicions}</LabelNumber>
      </Label>
      {displayedInfractionsSuspicion.map(infractionSuspicion => (
        <InfractionSuspicion>
          <BadgeNumber>{infractionSuspicion.numberOfOccurrences}</BadgeNumber>
          <Name title={infractionSuspicion.title}>
            {pluralize('Signalement', infractionSuspicion.numberOfOccurrences)} &quot;{infractionSuspicion.title}&quot;
          </Name>
        </InfractionSuspicion>
      ))}
      {!!summary?.infractionSuspicionsSummary &&
        summary.infractionSuspicionsSummary.length > DEFAULT_INFRACTIONS_DISPLAYED && (
          <OpenAllInfractionsSuspicion
            onClick={() => setAreAllInfractionsSuspicionShowed(!areAllInfractionsSuspicionShowed)}
          >
            Voir {areAllInfractionsSuspicionShowed ? 'moins' : 'plus'}
          </OpenAllInfractionsSuspicion>
        )}
    </Wrapper>
  )
}

const OpenAllInfractionsSuspicion = styled(Link)`
  cursor: pointer;
  display: block;
  font-size: 13px;
  margin-top: 6px;
`

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const Label = styled.div`
  color: ${p => p.theme.color.slateGray};
  margin-right: 8px;
`

const LabelNumber = styled.span`
  color: ${p => p.theme.color.gunMetal};
  margin-left: 8px;
`

const InfractionSuspicion = styled.div`
  display: block;
  font-weight: 500;
  margin-top: 4px;
`

const Name = styled.span`
  color: ${p => p.theme.color.gunMetal};
  display: inline-block;
  margin-left: 6px;
  max-width: 390px;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: bottom;
  white-space: nowrap;
`

const BadgeNumber = styled.div`
  background: ${p => p.theme.color.maximumRed};
  border-radius: 10px;
  color: ${p => p.theme.color.white};
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  height: 15px;
  letter-spacing: 0px;
  line-height: 14px;
  padding: 0 4px;
  text-align: center;
`
