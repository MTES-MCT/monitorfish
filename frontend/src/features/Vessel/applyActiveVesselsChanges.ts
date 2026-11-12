import { ActivityType } from './schemas/ActiveVesselSchema'

import type { Vessel } from './Vessel.types'

/**
 * FNV-1a (32 bits) of the sorted feature ids joined by line breaks.
 * See in backend: `ActiveVesselsChangeTracker.getFingerprint()`.
 */
export function getActiveVesselsFingerprint(vesselFeatureIds: string[]): number {
  // Ordered by UTF-16 code units, as Kotlin `sorted()` (not `localeCompare()`, which depends on the locale)
  const text = [...vesselFeatureIds].sort((a, b) => (a < b ? -1 : Number(a > b))).join('\n')
  let hash = 0x811c9dc5
  for (let index = 0; index < text.length; index += 1) {
    // UTF-16 code units, as Kotlin `Char.code`
    hash = Math.imul(hash ^ text.charCodeAt(index), 0x01000193) // NOSONAR
  }

  return hash >>> 0
}

function getVesselGroups(
  vesselFeatureId: string,
  changes: Vessel.ActiveVesselsChanges,
  vesselGroupsById: Map<number, Vessel.VesselGroupOfActiveVessel>
): Vessel.VesselGroupOfActiveVessel[] {
  return (changes.vesselGroupIdsByVesselFeatureId[vesselFeatureId] ?? [])
    .map(id => vesselGroupsById.get(id))
    .filter((group): group is Vessel.VesselGroupOfActiveVessel => !!group)
}

function haveSameVesselGroups(
  groups: Vessel.VesselGroupOfActiveVessel[],
  otherGroups: Vessel.VesselGroupOfActiveVessel[]
): boolean {
  return (
    groups.length === otherGroups.length &&
    groups.every(
      (group, index) =>
        group.id === otherGroups[index]?.id &&
        group.name === otherGroups[index]?.name &&
        group.color === otherGroups[index]?.color
    )
  )
}

/**
 * `isConsistent` is `false` when the result differs from the backend vessels (count or fingerprint):
 * all the vessels must then be fetched again.
 */
export function applyActiveVesselsChanges(
  currentVessels: Vessel.ActiveVessel[],
  changes: Vessel.ActiveVesselsChanges
): { isConsistent: boolean; vessels: Vessel.ActiveVessel[] } {
  if (changes.isFull) {
    return { isConsistent: true, vessels: changes.vessels }
  }

  let isConsistent = true
  const vesselsByFeatureId = new Map(currentVessels.map(vessel => [vessel.vesselFeatureId, vessel]))

  changes.removedVesselFeatureIds.forEach(vesselFeatureId => vesselsByFeatureId.delete(vesselFeatureId))
  changes.vessels.forEach(vessel => vesselsByFeatureId.set(vessel.vesselFeatureId, vessel))
  changes.positions.forEach(position => {
    const vessel = vesselsByFeatureId.get(position.vesselFeatureId)
    if (vessel?.activityType !== ActivityType.POSITION_BASED) {
      isConsistent = false

      return
    }

    vesselsByFeatureId.set(position.vesselFeatureId, {
      ...vessel,
      // All the position properties are set, as the undefined ones are not sent
      coordinates: position.coordinates,
      course: position.course,
      dateTime: position.dateTime,
      emissionPeriod: position.emissionPeriod,
      estimatedCurrentLatitude: position.estimatedCurrentLatitude,
      estimatedCurrentLongitude: position.estimatedCurrentLongitude,
      isAtPort: position.isAtPort,
      lastPositionSentAt: position.lastPositionSentAt,
      latitude: position.latitude,
      longitude: position.longitude,
      positionType: position.positionType,
      speed: position.speed
    })
  })

  // The groups of all the vessels are sent, as a dynamic group may change without any change of its vessels
  const vesselGroupsById = new Map(changes.vesselGroups.map(group => [group.id, group]))
  vesselsByFeatureId.forEach((vessel, vesselFeatureId) => {
    if (vessel.activityType !== ActivityType.POSITION_BASED) {
      return
    }

    const vesselGroups = getVesselGroups(vesselFeatureId, changes, vesselGroupsById)
    if (!haveSameVesselGroups(vessel.vesselGroups, vesselGroups)) {
      vesselsByFeatureId.set(vesselFeatureId, { ...vessel, vesselGroups })
    }
  })

  const vesselFeatureIds = [...vesselsByFeatureId.keys()]
  if (
    vesselFeatureIds.length !== changes.activeVesselsCount ||
    getActiveVesselsFingerprint(vesselFeatureIds) !== changes.fingerprint
  ) {
    isConsistent = false
  }

  return { isConsistent, vessels: [...vesselsByFeatureId.values()] }
}
