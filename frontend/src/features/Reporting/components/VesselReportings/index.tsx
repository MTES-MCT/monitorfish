import { RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS } from '@api/constants'
import { ArchivedReportingList } from '@features/Reporting/components/ArchivedReportingList'
import { CurrentReportingList } from '@features/Reporting/components/CurrentReportingList'
import { TwelveMonthsSummary } from '@features/Reporting/components/ReportingListSummary'
import { getDefaultReportingsStartDate } from '@features/Reporting/utils'
import { getVesselIdentityFromLegacyVesselIdentity } from '@features/Vessel/utils'
import { useGetVesselReportingsByVesselIdentityQuery } from '@features/Vessel/vesselApi'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { customDayjs, FingerprintLoader, THEME } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/query'
import { useMemo, useState } from 'react'
import styled from 'styled-components'

export function VesselReportings() {
  const selectedLegacyVesselIdentity = useMainAppSelector(state => state.vessel.selectedVesselIdentity)

  const [startDate, setStartDate] = useState(getDefaultReportingsStartDate())

  const selectedVesselIdentity = useMemo(
    () =>
      selectedLegacyVesselIdentity
        ? getVesselIdentityFromLegacyVesselIdentity(selectedLegacyVesselIdentity)
        : undefined,
    [selectedLegacyVesselIdentity]
  )

  const { data: vesselReportings } = useGetVesselReportingsByVesselIdentityQuery(
    selectedVesselIdentity
      ? {
          fromDate: startDate.toISOString(),
          vesselIdentity: selectedVesselIdentity
        }
      : skipToken,
    RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS
  )

  const decreaseStartDate = () => {
    setStartDate(customDayjs(startDate).subtract(1, 'year').toDate())
  }

  if (!selectedVesselIdentity || !vesselReportings) {
    return <FingerprintLoader className="radar" color={THEME.color.charcoal} />
  }

  return (
    <Body data-cy="vessel-reporting">
      <StyledCurrentReportingList vesselIdentity={selectedVesselIdentity} vesselReportings={vesselReportings} />
      <TwelveMonthsSummary reportingSummary={vesselReportings.summary} />
      <ArchivedReportingList fromDate={startDate} onMore={decreaseStartDate} vesselReportings={vesselReportings} />
    </Body>
  )
}

const StyledCurrentReportingList = styled(CurrentReportingList)`
  margin-bottom: 10px;
`

const Body = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 10px;
`
