import { Link } from '@mtes-mct/monitor-ui'
import { pluralize } from '@utils/pluralize'
import { useState } from 'react'
import styled from 'styled-components'

import type { ReportingSummary } from '@features/Reporting/types'

const DEFAULT_INFRACTIONS_DISPLAYED = 5

type InfractionSuspicionSummaryProps = Readonly<{
  reportingSummary: ReportingSummary
}>
export function InfractionSuspicionSummary({ reportingSummary }: InfractionSuspicionSummaryProps) {
  const [areAllInfractionsSuspicionShowed, setAreAllInfractionsSuspicionShowed] = useState(false)

  const displayedInfractionsSuspicion =
    reportingSummary.infractionSuspicionsSummary.slice(
      0,
      areAllInfractionsSuspicionShowed
        ? (reportingSummary.infractionSuspicionsSummary?.length ?? DEFAULT_INFRACTIONS_DISPLAYED)
        : DEFAULT_INFRACTIONS_DISPLAYED
    ) ?? []

  return (
    <Wrapper>
      <Label>
        Suspicions d&apos;infraction <LabelNumber>{reportingSummary.numberOfInfractionSuspicions}</LabelNumber>
      </Label>
      {displayedInfractionsSuspicion.map((infractionSuspicion, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <InfractionSuspicion key={`${infractionSuspicion.title}-${index}`}>
          <BadgeNumber>{infractionSuspicion.numberOfOccurrences}</BadgeNumber>
          <Name title={infractionSuspicion.title}>
            {pluralize('Signalement', infractionSuspicion.numberOfOccurrences)} &quot;{infractionSuspicion.title}&quot;
          </Name>
        </InfractionSuspicion>
      ))}
      {!!reportingSummary.infractionSuspicionsSummary &&
        reportingSummary.infractionSuspicionsSummary.length > DEFAULT_INFRACTIONS_DISPLAYED && (
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
  color: #FF3392;
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
  max-width: 385px;
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
