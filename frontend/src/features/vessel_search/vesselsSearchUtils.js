function getTextForSearch (text) {
  return text
    .toLowerCase()
    .replace(/[ ]/g, '')
    .replace(/[']/g, '')
    .replace(/["]/g, '')
}

export function findMatchingFeature (feature, searchText) {
  return (feature.internalReferenceNumber &&
    getTextForSearch(feature.internalReferenceNumber).includes(getTextForSearch(searchText))) ||
    (feature.externalReferenceNumber &&
      getTextForSearch(feature.externalReferenceNumber).includes(getTextForSearch(searchText))) ||
    (feature.mmsi &&
      getTextForSearch(feature.mmsi).includes(getTextForSearch(searchText))) ||
    (feature.ircs &&
      getTextForSearch(feature.ircs).includes(getTextForSearch(searchText))) ||
    (feature.vesselName &&
      getTextForSearch(feature.vesselName).includes(getTextForSearch(searchText)))
}

export function removeDuplicatedFoundVessels (foundVesselsFromAPI, foundVesselsOnMap) {
  return foundVesselsFromAPI.filter(vessel => {
    return !(
      (vessel.internalReferenceNumber
        ? foundVesselsOnMap.some(vesselFromMap => vesselFromMap.internalReferenceNumber === vessel.internalReferenceNumber)
        : false) ||
      (vessel.externalReferenceNumber
        ? foundVesselsOnMap.some(vesselFromMap => vesselFromMap.externalReferenceNumber === vessel.externalReferenceNumber)
        : false) ||
      (vessel.ircs
        ? foundVesselsOnMap.some(vesselFromMap => vesselFromMap.ircs === vessel.ircs)
        : false))
  })
}
