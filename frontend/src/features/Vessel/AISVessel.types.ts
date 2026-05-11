import { z } from 'zod'

import type { AISVesselSchema } from '@features/Vessel/schemas/AISVesselSchema'
import type Feature from 'ol/Feature'
import type Point from 'ol/geom/Point'

export namespace AISVessel {
  export type AISVessel = z.infer<typeof AISVesselSchema>

  export type AISVesselLastPositionFeature = Feature<Point> & AISVessel.AISVessel
}
