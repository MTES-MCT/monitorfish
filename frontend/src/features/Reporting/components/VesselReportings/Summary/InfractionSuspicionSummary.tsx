import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Link } from '@mtes-mct/monitor-ui'
import { pluralize } from '@utils/pluralize'
import { useState } from 'react'
import styled from 'styled-components'

const DEFAULT_INFRACTIONS_DISPLAYED = 5

export function InfractionSuspicionSummary() {
  const summary = useMainAppSelector(state => state.reporting.selectedVesselReportings?.summary)
  const [areAllInfractionsSuspicionShowed, setAreAllInfractionsSuspicionShowed] = useState(false)

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
  font-size: 13px;
  display: block;
  margin-top: 6px;
  cursor: pointer;
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
  margin-top: 4px;
  font-weight: 500;
`

const Name = styled.span`
  display: inline-block;
  color: ${p => p.theme.color.gunMetal};
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin-left: 6px;
  max-width: 400px;
  vertical-align: bottom;
`

const BadgeNumber = styled.div`
  display: inline-block;
  height: 15px;
  padding: 0 4px;
  text-align: center;
  border-radius: 10px;
  line-height: 14px;
  background: ${p => p.theme.color.maximumRed};
  color: ${p => p.theme.color.white};
  font-size: 12px;
  letter-spacing: 0px;
  font-weight: 700;
`
