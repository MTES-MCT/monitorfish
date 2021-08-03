function getTextForSearch (text) {
  return text
    .toLowerCase()
    .replace(/[ ]/g, '')
    .replace(/[']/g, '')
    .replace(/["]/g, '')
}

export function findMatchingFeature (feature, searchText) {
  return (feature.getProperties().internalReferenceNumber &&
    getTextForSearch(feature.getProperties().internalReferenceNumber).includes(getTextForSearch(searchText))) ||
    (feature.getProperties().externalReferenceNumber &&
      getTextForSearch(feature.getProperties().externalReferenceNumber).includes(getTextForSearch(searchText))) ||
    (feature.getProperties().mmsi &&
      getTextForSearch(feature.getProperties().mmsi).includes(getTextForSearch(searchText))) ||
    (feature.getProperties().ircs &&
      getTextForSearch(feature.getProperties().ircs).includes(getTextForSearch(searchText))) ||
    (feature.getProperties().vesselName &&
      getTextForSearch(feature.getProperties().vesselName).includes(getTextForSearch(searchText)))
}

export function removeDuplicatedFoundVessels (foundVesselsFromAPI, foundVesselsOnMap) {
  return foundVesselsFromAPI.filter(vessel => {
    return !(
      (vessel.internalReferenceNumber
        ? foundVesselsOnMap.some(vesselFromMap => vesselFromMap.getProperties().internalReferenceNumber === vessel.internalReferenceNumber)
        : false) ||
      (vessel.externalReferenceNumber
        ? foundVesselsOnMap.some(vesselFromMap => vesselFromMap.getProperties().externalReferenceNumber === vessel.externalReferenceNumber)
        : false) ||
      (vessel.ircs
        ? foundVesselsOnMap.some(vesselFromMap => vesselFromMap.getProperties().ircs === vessel.ircs)
        : false))
  })
}
