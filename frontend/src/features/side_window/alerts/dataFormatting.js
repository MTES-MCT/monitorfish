export function getAlertForTable (alert) {
  return {
    id: alert.id,
    vesselName: alert.vesselName,
    internalReferenceNumber: alert.internalReferenceNumber,
    creationDateTimestamp: alert.creationDate ? new Date(alert.creationDate).getTime() : '',
    creationDate: alert.creationDate,
    flagState: alert.value.flagState?.toLowerCase(),
    seaFront: alert.value.seaFront,
    speed: alert.value.speed,
    numberOfIncursion: alert.value.numberOfIncursion
  }
}
