import { getTextForSearch } from '../../utils'

export function findMatchingFeature (feature, searchText) {
  return (feature.vesselProperties?.internalReferenceNumber &&
    getTextForSearch(feature.vesselProperties?.internalReferenceNumber).includes(getTextForSearch(searchText))) ||
    (feature.vesselProperties?.externalReferenceNumber &&
      getTextForSearch(feature.vesselProperties?.externalReferenceNumber).includes(getTextForSearch(searchText))) ||
    (feature.vesselProperties?.mmsi &&
      getTextForSearch(feature.vesselProperties?.mmsi).includes(getTextForSearch(searchText))) ||
    (feature.vesselProperties?.ircs &&
      getTextForSearch(feature.vesselProperties?.ircs).includes(getTextForSearch(searchText))) ||
    (feature.vesselProperties?.vesselName &&
      getTextForSearch(feature.vesselProperties?.vesselName).includes(getTextForSearch(searchText)))
}

export function removeDuplicatedFoundVessels (foundVesselsFromAPI, foundVesselsOnMap) {
  return foundVesselsFromAPI.filter(vessel => {
    return !(
      (vessel.internalReferenceNumber
        ? foundVesselsOnMap.some(vesselFromMap => vesselFromMap.vesselProperties?.internalReferenceNumber === vessel.internalReferenceNumber)
        : false) ||
      (vessel.externalReferenceNumber
        ? foundVesselsOnMap.some(vesselFromMap => vesselFromMap.vesselProperties?.externalReferenceNumber === vessel.externalReferenceNumber)
        : false) ||
      (vessel.ircs
        ? foundVesselsOnMap.some(vesselFromMap => vesselFromMap.vesselProperties?.ircs === vessel.ircs)
        : false))
  })
}
