import { VesselReportingList } from '@features/Reporting/components/VesselReportingList'
import { VesselReportingListTab } from '@features/Reporting/components/VesselReportingList/constants'
import { useGetVesselReportingsByVesselIdentityQuery } from '@features/Vessel/vesselApi'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { usePrevious } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/query'
import { useEffect, useState } from 'react'

import { vesselsAreEquals } from '../../../../domain/entities/vessel/vessel'

export function ReportingList() {
  const archivedReportingsFromDate = useMainAppSelector(state => state.mainWindowReporting.archivedReportingsFromDate)
  const selectedVesselIdentity = useMainAppSelector(state => state.vessel.selectedVesselIdentity)
  const vesselIdentity = useMainAppSelector(state => state.mainWindowReporting.vesselIdentity)

  const { data: vesselReportings } = useGetVesselReportingsByVesselIdentityQuery(
    vesselIdentity
      ? {
          fromDate: archivedReportingsFromDate,
          vesselIdentity
        }
      : skipToken
  )

  const [selectedTab, setSelectedTab] = useState(VesselReportingListTab.CURRENT_REPORTING)

  const previousSelectedVesselIdentity = usePrevious(selectedVesselIdentity)

  useEffect(() => {
    if (!vesselsAreEquals(previousSelectedVesselIdentity, selectedVesselIdentity)) {
      setSelectedTab(VesselReportingListTab.CURRENT_REPORTING)
    }
  }, [previousSelectedVesselIdentity, selectedVesselIdentity])

  return (
    <VesselReportingList
      onTabChange={setSelectedTab}
      selectedTab={selectedTab}
      vesselReportings={vesselReportings}
      withTabs
    />
  )
}
