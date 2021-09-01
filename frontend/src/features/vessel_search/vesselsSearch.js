function getTextForSearch (text) {
  return text
    .toLowerCase()
    .replace(/[ ]/g, '')
    .replace(/[']/g, '')
    .replace(/["]/g, '')
}

export function findMatchingFeature (feature, searchText) {
  return (feature.vessel.internalReferenceNumber &&
    getTextForSearch(feature.vessel.internalReferenceNumber).includes(getTextForSearch(searchText))) ||
    (feature.vessel.externalReferenceNumber &&
      getTextForSearch(feature.vessel.externalReferenceNumber).includes(getTextForSearch(searchText))) ||
    (feature.vessel.mmsi &&
      getTextForSearch(feature.vessel.mmsi).includes(getTextForSearch(searchText))) ||
    (feature.vessel.ircs &&
      getTextForSearch(feature.vessel.ircs).includes(getTextForSearch(searchText))) ||
    (feature.vessel.vesselName &&
      getTextForSearch(feature.vessel.vesselName).includes(getTextForSearch(searchText)))
}

export function removeDuplicatedFoundVessels (foundVesselsFromAPI, foundVesselsOnMap) {
  return foundVesselsFromAPI.filter(vessel => {
    return !(
      (vessel.internalReferenceNumber
        ? foundVesselsOnMap.some(vesselFromMap => vesselFromMap.vessel.internalReferenceNumber === vessel.internalReferenceNumber)
        : false) ||
      (vessel.externalReferenceNumber
        ? foundVesselsOnMap.some(vesselFromMap => vesselFromMap.vessel.externalReferenceNumber === vessel.externalReferenceNumber)
        : false) ||
      (vessel.ircs
        ? foundVesselsOnMap.some(vesselFromMap => vesselFromMap.vessel.ircs === vessel.ircs)
        : false))
  })
}
