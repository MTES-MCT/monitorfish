export function getAlertForList(alert) {
  return {
    creationDate: alert.creationDate,
    creationDateTimestamp: alert.creationDate ? new Date(alert.creationDate).getTime() : '',
    externalReferenceNumber: alert.externalReferenceNumber,
    flagState: alert.value.flagState?.toLowerCase(),
    id: alert.id,
    internalReferenceNumber: alert.internalReferenceNumber,
    ircs: alert.ircs,
    isValidated: alert.isValidated,
    natinfCode: alert.value.natinfCode,
    riskFactor: alert.value.riskFactor,
    seaFront: alert.value.seaFront,
    vesselName: alert.vesselName,
    silencedPeriod: alert.silencedPeriod,
    type: alert.value.type,
    vesselIdentifier: alert.vesselIdentifier,
  }
}

export function getSilencedAlertForList(silencedAlert) {
  return {
    externalReferenceNumber: silencedAlert.externalReferenceNumber,
    flagState: silencedAlert.value.flagState?.toLowerCase(),
    id: silencedAlert.id,
    internalReferenceNumber: silencedAlert.internalReferenceNumber,
    ircs: silencedAlert.ircs,
    isReactivated: silencedAlert.isReactivated,
    natinfCode: silencedAlert.value.natinfCode,
    seaFront: silencedAlert.value.seaFront,
    silencedAfterDate: silencedAlert.silencedAfterDate,
    silencedBeforeDate: silencedAlert.silencedBeforeDate,
    type: silencedAlert.value.type,
    vesselName: silencedAlert.vesselName,
    vesselIdentifier: silencedAlert.vesselIdentifier,
  }
}
