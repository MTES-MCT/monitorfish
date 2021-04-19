export const getVesselIdentityFromFeature = feature => {
    return {
        internalReferenceNumber: feature.getProperties().internalReferenceNumber,
        externalReferenceNumber: feature.getProperties().externalReferenceNumber,
        vesselName: feature.getProperties().vesselName,
        flagState: feature.getProperties().flagState,
        mmsi: feature.getProperties().mmsi,
        ircs: feature.getProperties().ircs,
    }
}

export const getVesselFeatureAndIdentity = (feature, identity) => {
    return {
        identity: identity,
        feature: feature
    }
}

export function vesselAndVesselFeatureAreEquals(vessel, feature) {
    return (feature.getProperties().internalReferenceNumber
      ? feature.getProperties().internalReferenceNumber === vessel.internalReferenceNumber
      : false) ||
      (feature.getProperties().ircs
        ? feature.getProperties().ircs === vessel.ircs
        : false) ||
      (feature.getProperties().externalReferenceNumber
        ? feature.getProperties().externalReferenceNumber === vessel.externalReferenceNumber
        : false)
}

export function vesselsAreEquals(firstVessel, secondVessel) {
    if(!firstVessel || !secondVessel) {
        return false
    }

    return (firstVessel.internalReferenceNumber
      ? firstVessel.internalReferenceNumber === secondVessel.internalReferenceNumber
      : false) ||
      (firstVessel.ircs
        ? firstVessel.ircs === secondVessel.ircs
        : false) ||
      (firstVessel.externalReferenceNumber
        ? firstVessel.externalReferenceNumber === secondVessel.externalReferenceNumber
        : false)
}
