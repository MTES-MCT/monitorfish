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
