import type { Reporting } from '../../../../../domain/types/reporting'

export type ReportingAndOccurrences = {
  otherOccurrences: Reporting[]
  reporting: Reporting
}
