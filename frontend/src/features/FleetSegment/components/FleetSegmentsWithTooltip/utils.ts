import { FLEET_SEGMENT_ORIGIN_LABEL, SpeciesTypeToSpeciesTypeLabel } from '@features/FleetSegment/constants'
import { ActivityOrigin } from '@features/Vessel/schemas/ActiveVesselSchema'
import { pluralize } from '@mtes-mct/monitor-ui'

import type { FleetSegment } from '@features/FleetSegment/types'

export function getSegmentsWithProperties(
  segments: string[] | undefined,
  segmentsReferential: FleetSegment[] | undefined
): Array<FleetSegment | undefined> {
  if (!segments?.length || !segmentsReferential?.length) {
    return []
  }

  return segments.map(segment => {
    const found = segmentsReferential.find(segmentWithProperties => segmentWithProperties.segment === segment)
    if (!found) {
      return undefined
    }

    return found
  })
}

export function getSegmentInfo(segment: FleetSegment | undefined, activityOrigin: ActivityOrigin | undefined): string {
  const segmentOrigin = activityOrigin ? FLEET_SEGMENT_ORIGIN_LABEL[activityOrigin] : ''
  if (!segment) {
    return `${segmentOrigin}

Segment de flotte inconnu`
  }

  const gears = segment.gears?.length ? segment.gears.join(', ') : 'aucun'
  const numberOfGears = segment.gears?.length ?? 0
  const faoAreas = segment.faoAreas?.length ? segment.faoAreas.join(', ') : 'aucune'
  const numberOfFaoAreas = segment.faoAreas?.length ?? 0
  const targetSpecies = segment.targetSpecies?.length ? segment.targetSpecies.join(', ') : 'aucune'
  const numberOfTargetSpecies = segment.targetSpecies?.length ?? 0
  const percent = segment.minShareOfTargetSpecies ? segment.minShareOfTargetSpecies * 100 : undefined

  return `${segmentOrigin}

Nom : ${segment.segmentName}
${pluralize('Zone', numberOfFaoAreas)} : ${faoAreas}
${pluralize('Engin', numberOfGears)} : ${gears}
Maillage min. : ${segment.minMesh ? `${segment.minMesh}mm` : 'aucun'}
Maillage max. : ${segment.maxMesh ? `${segment.maxMesh}mm` : 'aucun'}
Majorité d'espèces : ${segment.mainScipSpeciesType ? SpeciesTypeToSpeciesTypeLabel[segment.mainScipSpeciesType] : 'aucun'}
${pluralize('Espèce', numberOfTargetSpecies)} ${pluralize('cible', numberOfTargetSpecies)} ${percent ? `(≥ ${percent}% du total des captures) ` : ''}: ${targetSpecies}`
}
