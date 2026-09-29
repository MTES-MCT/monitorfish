import { z } from 'zod'

import { stringOrUndefined } from '../../../types'

export const AdministrativeLayerSchema = z.strictObject({
  type: z.string(),
  zone: stringOrUndefined
})

export const UserLayersSchema = z.strictObject({
  baseLayer: stringOrUndefined,
  displayedAdministrativeLayers: z.array(AdministrativeLayerSchema),
  displayedRegulatoryZoneIds: z.array(z.string()),
  selectedRegulatoryZoneIds: z.array(z.string())
})
