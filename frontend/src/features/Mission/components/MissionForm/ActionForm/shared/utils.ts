import { MissionAction } from '@features/Mission/missionAction.types'
import { getLocalizedDayjs } from '@mtes-mct/monitor-ui'

import type { FleetSegment } from '@features/FleetSegment/types'
import type { Option } from '@mtes-mct/monitor-ui'
import type { Gear } from 'domain/types/Gear'

const GEAR_CATEGORIES_WITHOUT_MESH = new Set([
  'Engins de pêche récréative',
  'Engins de récolte',
  'Engins divers',
  'Lignes et hameçons',
  'Pièges et casiers',
  "Pas d'engin"
])

// These gear codes belong to "Engins divers" but do use mesh
const GEAR_CODES_WITH_MESH_IN_NO_MESH_CATEGORY = new Set(['FCN', 'MDR'])

export function gearHasMeshFields(gear: Gear | undefined): boolean {
  if (!gear) {
    return false
  }
  if (GEAR_CODES_WITH_MESH_IN_NO_MESH_CATEGORY.has(gear.code)) {
    return true
  }

  return !GEAR_CATEGORIES_WITHOUT_MESH.has(gear.category)
}

export function getTitleDateFromUtcStringDate(utcStringDate: string): string {
  return getLocalizedDayjs(utcStringDate).format('D MMM à HH:mm UTC')
}

export function getFleetSegmentsAsOption(
  getFleetSegmentsApiQuery: FleetSegment[] | undefined
): Option<MissionAction.FleetSegment>[] {
  if (!getFleetSegmentsApiQuery) {
    return []
  }

  return getFleetSegmentsApiQuery.map(({ segment, segmentName }) => ({
    label: `${segment} - ${segmentName}`,
    value: {
      segment,
      segmentName: segmentName ?? undefined
    }
  }))
}
