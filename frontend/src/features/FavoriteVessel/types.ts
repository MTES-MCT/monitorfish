import { FavoriteVesselVesselIdentitySchema } from '@features/FavoriteVessel/schemas/FavoriteVesselVesselIdentitySchema'

import type { z } from 'zod'

export type FavoriteVesselVesselIdentity = z.infer<typeof FavoriteVesselVesselIdentitySchema>
