import { ReportingType } from '@features/Reporting/types/ReportingType'

import type { Option } from '@mtes-mct/monitor-ui'

export const REPORTING_TYPE_FILTER_OPTIONS: Option<ReportingType>[] = [
  { label: 'Observations', value: ReportingType.OBSERVATION },
  { label: "Suspicions d'infraction", value: ReportingType.INFRACTION_SUSPICION }
]
