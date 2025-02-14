import { z } from 'zod'

import { booleanOrUndefined, stringOrUndefined } from '../../../types'

export const BeaconSchema = z.strictObject({
  beaconNumber: z.string(),
  isCoastal: booleanOrUndefined,
  loggingDatetimeUtc: stringOrUndefined
})
