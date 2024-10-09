import { VesselReportingList } from '@features/Reporting/components/VesselReportingList'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useKey } from '@mtes-mct/monitor-ui'

export function ReportingList() {
  const selectedVesselIdentity = useMainAppSelector(state => state.vessel.selectedVesselIdentity)
  const key = useKey([selectedVesselIdentity])

  return (
    <VesselReportingList
      // This key resets the default tab when `selectedVesselIdentity` changes
      key={key}
      vesselIdentity={selectedVesselIdentity}
      withTabs
    />
  )
}
