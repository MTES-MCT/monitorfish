import { z } from 'zod'

import { stringOrUndefined } from '../../../types'

export const AdministrativeLayerSchema = z.strictObject({
  type: z.string(),
  zone: stringOrUndefined
})

export const UserLayersSchema = z.strictObject({
  administrativeLayers: z.array(AdministrativeLayerSchema),
  baseLayer: stringOrUndefined,
  selectedRegulatoryZoneIds: z.array(z.string()),
  showedRegulatoryZoneIds: z.array(z.string())
})
