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

export const getVesselFeatureAndIdentity = (feature, vessel) => {
    return {
        vessel: vessel,
        feature: feature
    }
}
