import { VesselLabel } from '@features/Vessel/label.types'
import { drawMovedLabelLineIfFoundAndReturnOffset } from '@features/Vessel/label.utils'
import { VESSELS_LABEL_VECTOR_SOURCE } from '@features/Vessel/layers/VesselsLabelsLayer/constants'
import { VesselFeature } from '@features/Vessel/types/vessel'
import { VesselLabelLine } from '@features/Vessel/types/vesselLabelLine'
import { extractVesselPropertiesFromFeature, getVesselCompositeIdentifier } from '@features/Vessel/utils'

import type { ShowedVesselTrack } from '@features/Vessel/types/types'
import type { Vessel } from '@features/Vessel/Vessel.types'

export function getLabelFromFeatures(
  features,
  options: {
    areVesselsNotInVesselGroupsHidden: boolean
    isSuperUser: boolean
    riskFactorShowedOnMap: boolean
    selectedVessel: Vessel.SelectedVessel | undefined
    vesselLabel: VesselLabel
    vesselLabelsShowedOnMap: boolean
    vesselToCoordinates: Map<string, any>
    vesselsTracksShowed: Record<string, ShowedVesselTrack>
  }
) {
  const showedTracksVesselsIdentities = Object.keys(options.vesselsTracksShowed)
  if (options.selectedVessel) {
    showedTracksVesselsIdentities.push(getVesselCompositeIdentifier(options.selectedVessel))
  }

  return features.map(feature => {
    const vesselProperties = extractVesselPropertiesFromFeature(feature, [
      'activityOrigin',
      'beaconMalfunctionId',
      'dateTime',
      'detectabilityRiskFactor',
      'flagState',
      'groupsDisplayed',
      'internalReferenceNumber',
      'ircs',
      'externalReferenceNumber',
      'impactRiskFactor',
      'internalReferenceNumber',
      'isAtPort',
      'lastControlAtSeaDateTime',
      'lastControlAtQuayDateTime',
      'probabilityRiskFactor',
      'riskFactor',
      'segments',
      'underCharter',
      'vesselId',
      'vesselIdentifier',
      'vesselName'
    ])
    const label = VesselFeature.getVesselFeatureLabel(vesselProperties, {
      areVesselsNotInVesselGroupsHidden: options.areVesselsNotInVesselGroupsHidden,
      isRiskFactorShowed: options.isSuperUser && options.riskFactorShowedOnMap,
      vesselLabel: options.vesselLabel,
      vesselLabelsShowedOnMap: options.vesselLabelsShowedOnMap
    })
    const identity = {
      externalReferenceNumber: feature.get('externalReferenceNumber'),
      internalReferenceNumber: feature.get('internalReferenceNumber'),
      ircs: feature.get('ircs')
    }
    const labelLineFeatureId = VesselLabelLine.getFeatureId(identity)
    const offset = drawMovedLabelLineIfFoundAndReturnOffset(
      VESSELS_LABEL_VECTOR_SOURCE,
      options.vesselToCoordinates,
      labelLineFeatureId,
      feature
    )
    const trackIsShown = showedTracksVesselsIdentities.includes(getVesselCompositeIdentifier(vesselProperties))

    return {
      featureId: labelLineFeatureId,
      identity: {
        coordinates: feature.getGeometry().getCoordinates(),
        externalReferenceNumber: identity.externalReferenceNumber,
        flagState: vesselProperties.flagState,
        internalReferenceNumber: identity.internalReferenceNumber,
        ircs: identity.ircs,
        key: feature.ol_uid,
        vesselId: vesselProperties.vesselId,
        vesselIdentifier: vesselProperties.vesselIdentifier,
        vesselName: vesselProperties.vesselName
      },
      label,
      offset,
      trackIsShown
    }
  })
}
