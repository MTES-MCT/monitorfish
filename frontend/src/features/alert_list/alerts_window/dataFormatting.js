export function getAlertForTable (alert) {
  return {
    id: alert.id,
    vesselName: alert.vesselName,
    seaFront: alert.seaFront,
    flagState: alert.flagState?.toLowerCase(),
    internalReferenceNumber: alert.internalReferenceNumber,
    dateTimeTimestamp: alert.dateTime ? new Date(alert.dateTime).getTime() : '',
    dateTime: alert.dateTime,
    value: alert.value
  }
}
