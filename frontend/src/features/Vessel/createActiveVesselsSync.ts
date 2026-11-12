import { applyActiveVesselsChanges } from './applyActiveVesselsChanges'

import type { Vessel } from './Vessel.types'

/** Last-resort full download, for the changes not detected by the fingerprint (e.g. a property of a vessel) */
const FULL_REFRESH_INTERVAL = 4 * 60 * 60 * 1000

type FetchChanges = (after: string | undefined) => Promise<Vessel.ActiveVesselsChanges>

/**
 * All the vessels are downloaded first, then only their changes since the previous response.
 * All the vessels are downloaded again when the result differs from the backend vessels, and every 4 hours.
 */
export function createActiveVesselsSync(
  now: () => number = Date.now
): (fetchChanges: FetchChanges) => Promise<Vessel.ActiveVessel[]> {
  let asOf: string | undefined
  let lastFullRefreshAt: number | undefined
  let vessels: Vessel.ActiveVessel[] = []

  return async fetchChanges => {
    const isFullRefreshDue = lastFullRefreshAt === undefined || now() - lastFullRefreshAt >= FULL_REFRESH_INTERVAL
    let changes = await fetchChanges(isFullRefreshDue ? undefined : asOf)
    let result = applyActiveVesselsChanges(vessels, changes)
    if (!result.isConsistent) {
      changes = await fetchChanges(undefined)
      result = applyActiveVesselsChanges(vessels, changes)
    }

    if (changes.isFull) {
      lastFullRefreshAt = now()
    }
    asOf = changes.asOf
    vessels = result.vessels.map(vessel => Object.freeze(vessel))

    return vessels
  }
}
