/**
 * Who a reporting comes from, as displayed in the "Source" column and filter.
 *
 * Mirrors the backend `ReportingOrigin`: unlike `ReportingOriginSource` it covers alerts, and
 * folds the legacy `DML` / `DIRM` sources — now carried by `otherSourceType` — into `OTHER`.
 */
export enum ReportingOrigin {
  ALERT = 'ALERT',
  OPS = 'OPS',
  OTHER = 'OTHER',
  SATELLITE = 'SATELLITE',
  SIP = 'SIP',
  UNIT = 'UNIT'
}
