import { VesselLabel } from '@features/Vessel/label.types'

export const VESSEL_LABEL_OPTIONS = [
  { label: 'Nom', value: VesselLabel.VESSEL_NAME },
  { label: 'Segment de flotte', value: VesselLabel.VESSEL_FLEET_SEGMENT },
  { label: 'CFR', value: VesselLabel.VESSEL_INTERNAL_REFERENCE_NUMBER }
]
