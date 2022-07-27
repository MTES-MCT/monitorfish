export function getAlertForList (alert) {
  return {
    id: alert.id,
    vesselName: alert.vesselName,
    internalReferenceNumber: alert.internalReferenceNumber,
    externalReferenceNumber: alert.externalReferenceNumber,
    ircs: alert.ircs,
    creationDateTimestamp: alert.creationDate ? new Date(alert.creationDate).getTime() : '',
    creationDate: alert.creationDate,
    vesselIdentifier: alert.vesselIdentifier,
    silencedPeriod: alert.silencedPeriod,
    isValidated: alert.isValidated,
    riskFactor: alert.value.riskFactor,
    flagState: alert.value.flagState?.toLowerCase(),
    seaFront: alert.value.seaFront,
    type: alert.value.type,
    natinfCode: alert.value.natinfCode
  }
}

export function getSilencedAlertForList (silencedAlert) {
  return {
    id: silencedAlert.id,
    vesselName: silencedAlert.vesselName,
    internalReferenceNumber: silencedAlert.internalReferenceNumber,
    externalReferenceNumber: silencedAlert.externalReferenceNumber,
    ircs: silencedAlert.ircs,
    silencedBeforeDate: silencedAlert.silencedBeforeDate,
    silencedAfterDate: silencedAlert.silencedAfterDate,
    vesselIdentifier: silencedAlert.vesselIdentifier,
    flagState: silencedAlert.value.flagState?.toLowerCase(),
    seaFront: silencedAlert.value.seaFront,
    type: silencedAlert.value.type,
    natinfCode: silencedAlert.value.natinfCode,
    isReactivated: silencedAlert.isReactivated
  }
}
