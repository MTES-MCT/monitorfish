import { VesselLabel } from '../../../../../domain/entities/vessel/label/types'

export const VESSEL_LABEL_OPTIONS = [
  { label: 'Nationalité', value: VesselLabel.VESSEL_NATIONALITY },
  { label: 'Nom du navire', value: VesselLabel.VESSEL_NAME },
  { label: 'CFR', value: VesselLabel.VESSEL_INTERNAL_REFERENCE_NUMBER }
]

export const SUPER_USER_VESSEL_LABEL_OPTION = { label: 'Segment de flotte', value: VesselLabel.VESSEL_FLEET_SEGMENT }
