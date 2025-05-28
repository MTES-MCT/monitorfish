import { SpeciesTypeToSpeciesTypeLabel } from '@features/FleetSegment/constants'
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

export function getSegmentInfo(segment: FleetSegment | undefined): string {
  if (!segment) {
    return 'Segment de flotte inconnu'
  }

  const gears = segment.gears?.length ? segment.gears.join(', ') : 'aucun'
  const numberOfGears = segment.gears?.length ?? 0
  const faoAreas = segment.faoAreas?.length ? segment.faoAreas.join(', ') : 'aucune'
  const numberOfFaoAreas = segment.faoAreas?.length ?? 0
  const targetSpecies = segment.targetSpecies?.length ? segment.targetSpecies.join(', ') : 'aucune'
  const numberOfTargetSpecies = segment.targetSpecies?.length ?? 0
  const percent = segment.minShareOfTargetSpecies ? segment.minShareOfTargetSpecies * 100 : undefined

  return `Nom : ${segment.segmentName}
${pluralize('Zone', numberOfFaoAreas)} : ${faoAreas}
${pluralize('Engin', numberOfGears)} : ${gears}
Maillage min. : ${segment.minMesh ? `${segment.minMesh}mm` : 'aucun'}
Maillage max. : ${segment.maxMesh ? `${segment.maxMesh}mm` : 'aucun'}
Majorité d'espèces : ${segment.mainScipSpeciesType ? SpeciesTypeToSpeciesTypeLabel[segment.mainScipSpeciesType] : 'aucun'}
${pluralize('Espèce', numberOfTargetSpecies)} ${pluralize('cible', numberOfTargetSpecies)} ${percent ? `(≥ ${percent}% du total des captures) ` : ''}: ${targetSpecies}`
}
