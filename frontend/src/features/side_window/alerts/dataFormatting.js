export function getAlertForList (alert) {
  return {
    id: alert.id,
    vesselName: alert.vesselName,
    internalReferenceNumber: alert.internalReferenceNumber,
    externalReferenceNumber: alert.externalReferenceNumber,
    ircs: alert.ircs,
    creationDateTimestamp: alert.creationDate ? new Date(alert.creationDate).getTime() : '',
    creationDate: alert.creationDate,
    flagState: alert.value.flagState?.toLowerCase(),
    seaFront: alert.value.seaFront,
    type: alert.value.type
  }
}
