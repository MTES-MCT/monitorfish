import { RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS } from '@api/constants'
import { FingerprintSpinner } from '@components/FingerprintSpinner'
import { getDefaultReportingsStartDate } from '@features/Reporting/utils'
import { useGetVesselReportingsByVesselIdentityQuery } from '@features/Vessel/vesselApi'
import { THEME } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/query'

import { Content } from './Content'

import type { VesselIdentity } from 'domain/entities/vessel/types'
import type { CSSProperties } from 'react'

type CurrentReportingListProps = Readonly<{
  className?: string
  onIsDirty?: (isDirty: boolean) => void
  startDate?: Date
  style?: CSSProperties
  vesselIdentity: VesselIdentity | undefined
  withOpenedNewReportingForm?: boolean
  withVesselSidebarHistoryLink?: boolean
}>
export function CurrentReportingList({
  className,
  onIsDirty,
  startDate = getDefaultReportingsStartDate(),
  style,
  vesselIdentity,
  withOpenedNewReportingForm = false,
  withVesselSidebarHistoryLink = false
}: CurrentReportingListProps) {
  const { data: vesselReportings } = useGetVesselReportingsByVesselIdentityQuery(
    vesselIdentity
      ? {
          fromDate: startDate.toISOString(),
          vesselIdentity
        }
      : skipToken,
    RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS
  )

  if (!vesselIdentity || !vesselReportings) {
    return <FingerprintSpinner className="radar" color={THEME.color.charcoal} size={100} />
  }

  return (
    <Content
      className={className}
      onIsDirty={onIsDirty}
      style={style}
      vesselIdentity={vesselIdentity}
      vesselReportings={vesselReportings}
      withOpenedNewReportingForm={withOpenedNewReportingForm}
      withVesselSidebarHistoryLink={withVesselSidebarHistoryLink}
    />
  )
}
