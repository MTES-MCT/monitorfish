import { VesselReportingList } from '@features/Reporting/components/VesselReportingList'
import { VesselReportingListTab } from '@features/Reporting/components/VesselReportingList/constants'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { usePrevious } from '@mtes-mct/monitor-ui'
import { useEffect, useState } from 'react'

import { vesselsAreEquals } from '../../../../domain/entities/vessel/vessel'

export function ReportingList() {
  const archivedReportingsFromDate = useMainAppSelector(state => state.mainWindowReporting.archivedReportingsFromDate)
  const selectedVesselIdentity = useMainAppSelector(state => state.vessel.selectedVesselIdentity)
  const vesselIdentity = useMainAppSelector(state => state.mainWindowReporting.vesselIdentity)

  const [selectedTab, setSelectedTab] = useState(VesselReportingListTab.CURRENT_REPORTING)

  const previousSelectedVesselIdentity = usePrevious(selectedVesselIdentity)

  useEffect(() => {
    if (!vesselsAreEquals(previousSelectedVesselIdentity, selectedVesselIdentity)) {
      setSelectedTab(VesselReportingListTab.CURRENT_REPORTING)
    }
  }, [previousSelectedVesselIdentity, selectedVesselIdentity])

  return (
    <VesselReportingList
      fromDate={archivedReportingsFromDate}
      onTabChange={setSelectedTab}
      selectedTab={selectedTab}
      vesselIdentity={vesselIdentity}
      withTabs
    />
  )
}
