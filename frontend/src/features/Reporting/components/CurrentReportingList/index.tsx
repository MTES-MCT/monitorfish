import { Content } from './Content'

import type { VesselReportings } from '@features/Reporting/types'
import type { Vessel } from '@features/Vessel/Vessel.types'

type CurrentReportingListProps = Readonly<{
  className?: string
  onIsDirty?: (isDirty: boolean) => void
  vesselIdentity: Vessel.VesselIdentity
  vesselReportings: VesselReportings
  withOpenedNewReportingForm?: boolean
  withVesselSidebarHistoryLink?: boolean
}>
export function CurrentReportingList({
  className,
  onIsDirty,
  vesselIdentity,
  vesselReportings,
  withOpenedNewReportingForm = false,
  withVesselSidebarHistoryLink = false
}: CurrentReportingListProps) {
  return (
    <Content
      className={className}
      onIsDirty={onIsDirty}
      vesselIdentity={vesselIdentity}
      vesselReportings={vesselReportings}
      withOpenedNewReportingForm={withOpenedNewReportingForm}
      withVesselSidebarHistoryLink={withVesselSidebarHistoryLink}
    />
  )
}
