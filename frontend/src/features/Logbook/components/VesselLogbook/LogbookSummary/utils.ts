import type { FleetSegment } from '../../../../FleetSegment/types'

export function getTripSegments(
  segments: string[] | undefined,
  segmentsReferential: FleetSegment[] | undefined
): Partial<FleetSegment>[] {
  if (!segments?.length) {
    return []
  }

  if (!segmentsReferential?.length) {
    return segments.map(segment => ({
      segment
    }))
  }

  return segments.map(segment => {
    const found = segmentsReferential.find(segmentWithProperties => segmentWithProperties.segment === segment)

    if (!found) {
      return {
        segment
      }
    }

    return found
  })
}

export function getSegmentInfo(segment: Partial<FleetSegment>): string {
  if (segment.gears ?? segment.faoAreas ?? segment.targetSpecies ?? segment.bycatchSpecies) {
    const gears = segment.gears?.length ? segment.gears.join(', ') : 'aucun'
    const faoAreas = segment.faoAreas?.length ? segment.faoAreas.join(', ') : 'aucune'

    let targetSpeciesArray: string[] = []
    if (segment.targetSpecies?.length) {
      targetSpeciesArray = targetSpeciesArray.concat(segment.targetSpecies)
    }
    if (segment.bycatchSpecies?.length) {
      targetSpeciesArray = targetSpeciesArray.concat(segment.bycatchSpecies)
    }
    const targetSpecies = targetSpeciesArray.length ? targetSpeciesArray.join(', ') : 'aucune'

    return `Engins: ${gears}
Zones FAO: ${faoAreas}
Espèces: ${targetSpecies}`
  }

  return 'Segment de flotte inconnu'
}
