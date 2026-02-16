import { z } from 'zod'

import { stringOrUndefined } from '../../../types'

export const FleetSegmentSchema = z.strictObject({
  segment: stringOrUndefined,
  segmentName: stringOrUndefined
})
