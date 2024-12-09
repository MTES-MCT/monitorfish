import { RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS } from '@api/constants'
import { FingerprintSpinner } from '@components/FingerprintSpinner'
import { getDefaultReportingsStartDate } from '@features/Reporting/utils'
import { useGetVesselReportingsByVesselIdentityQuery } from '@features/Vessel/vesselApi'
import { THEME } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/query'

import { Content } from './Content'

import type { Vessel } from '@features/Vessel/Vessel.types'

type CurrentReportingListProps = Readonly<{
  className?: string
  onIsDirty?: (isDirty: boolean) => void
  startDate?: Date
  vesselIdentity: Vessel.VesselIdentity | undefined
  withOpenedNewReportingForm?: boolean
  withVesselSidebarHistoryLink?: boolean
}>
export function CurrentReportingList({
  className,
  onIsDirty,
  startDate = getDefaultReportingsStartDate(),
  vesselIdentity,
  withOpenedNewReportingForm = false,
  withVesselSidebarHistoryLink = false
}: CurrentReportingListProps) {
  const { data: vesselReportings, isFetching } = useGetVesselReportingsByVesselIdentityQuery(
    vesselIdentity
      ? {
          fromDate: startDate.toISOString(),
          vesselIdentity
        }
      : skipToken,
    RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS
  )

  if (!vesselIdentity || !vesselReportings || isFetching) {
    return <FingerprintSpinner className="radar" color={THEME.color.charcoal} size={100} />
  }

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
