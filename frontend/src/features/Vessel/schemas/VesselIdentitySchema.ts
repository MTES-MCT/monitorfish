import { VesselIdentifier } from '@features/Vessel/schemas/ActiveVesselSchema'
import { z } from 'zod'

import { numberOrUndefined, stringOrUndefined } from '../../../types'

export const VesselIdentitySchema = z.strictObject({
  beaconNumber: numberOrUndefined,
  districtCode: stringOrUndefined,
  externalReferenceNumber: stringOrUndefined,
  flagState: z.string(),
  internalReferenceNumber: stringOrUndefined,
  ircs: stringOrUndefined,
  mmsi: stringOrUndefined,
  vesselId: numberOrUndefined,
  vesselIdentifier: z.union([z.nativeEnum(VesselIdentifier), z.undefined()]),
  vesselLength: numberOrUndefined,
  vesselName: stringOrUndefined
})
