import type { ReplayedVesselSchema } from '@features/PositionReplay/schemas/ReplayedVesselSchema'
import type { z } from 'zod'

export type ReplayedVesselData = z.infer<typeof ReplayedVesselSchema>
