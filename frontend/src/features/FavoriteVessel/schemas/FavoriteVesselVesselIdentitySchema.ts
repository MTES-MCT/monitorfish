import { VesselIdentifier } from '@features/Vessel/schemas/ActiveVesselSchema'
import { z } from 'zod'

import { numberOrUndefined, stringOrUndefined } from '../../../types'

export const FavoriteVesselVesselIdentitySchema = z.strictObject({
  cfr: stringOrUndefined,
  externalIdentification: stringOrUndefined,
  flagState: stringOrUndefined,
  ircs: stringOrUndefined,
  name: stringOrUndefined,
  vesselId: numberOrUndefined,
  vesselIdentifier: z.union([z.enum(VesselIdentifier), z.undefined()])
})
