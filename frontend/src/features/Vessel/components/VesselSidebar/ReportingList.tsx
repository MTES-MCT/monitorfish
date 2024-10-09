import { VesselReportingList } from '@features/Reporting/components/VesselReportingList'
import { getDefaultReportingsStartDate } from '@features/Reporting/utils'
import { useGetVesselReportingsByVesselIdentityQuery } from '@features/Vessel/vesselApi'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { customDayjs, useKey } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/query'
import { useState } from 'react'

export function ReportingList() {
  const selectedVesselIdentity = useMainAppSelector(state => state.vessel.selectedVesselIdentity)
  const key = useKey([selectedVesselIdentity])

  const [startDate, setStartDate] = useState(getDefaultReportingsStartDate())

  const { data: vesselReportings } = useGetVesselReportingsByVesselIdentityQuery(
    selectedVesselIdentity
      ? {
          fromDate: startDate.toISOString(),
          vesselIdentity: selectedVesselIdentity
        }
      : skipToken
  )

  const showMore = () => {
    setStartDate(customDayjs(startDate).subtract(5, 'year').toDate())
  }

  if (!selectedVesselIdentity) {
    return <p>Chargement en cours...</p>
  }

  return (
    <VesselReportingList
      // This key resets the default tab when `selectedVesselIdentity` changes
      key={key}
      fromDate={startDate}
      onMore={showMore}
      vesselIdOrIdentity={selectedVesselIdentity}
      vesselReportings={vesselReportings}
      withTabs
    />
  )
}
