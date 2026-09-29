import type { AdministrativeLayerSchema, UserLayersSchema } from './schemas/UserLayersSchema'
import type { z } from 'zod'

export type AdministrativeLayer = z.infer<typeof AdministrativeLayerSchema>
export type UserLayers = z.infer<typeof UserLayersSchema>
