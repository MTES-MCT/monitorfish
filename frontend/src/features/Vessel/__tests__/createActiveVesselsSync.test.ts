import { describe, expect, it } from '@jest/globals'

import { getActiveVesselsFingerprint } from '../applyActiveVesselsChanges'
import { createActiveVesselsSync } from '../createActiveVesselsSync'

import type { Vessel } from '../Vessel.types'

const buildVessel = (vesselFeatureId: string) =>
  ({
    activityType: 'LOGBOOK_BASED',
    emitsPositions: false,
    vesselFeatureId
  }) as unknown as Vessel.ActiveVessel

const VESSEL_A = buildVessel('VESSELS:A')
const VESSEL_B = buildVessel('VESSELS:B')

function getChanges(
  vessels: Vessel.ActiveVessel[],
  changes: Partial<Vessel.ActiveVesselsChanges>
): Vessel.ActiveVesselsChanges {
  return {
    activeVesselsCount: vessels.length,
    asOf: 'instance.1',
    fingerprint: getActiveVesselsFingerprint(vessels.map(vessel => vessel.vesselFeatureId)),
    isFull: false,
    positions: [],
    removedVesselFeatureIds: [],
    vesselGroupIdsByVesselFeatureId: {},
    vesselGroups: [],
    vessels: [],
    ...changes
  }
}

function mockFetchChanges(responses: Vessel.ActiveVesselsChanges[]) {
  const afters: Array<string | undefined> = []
  const fetchChanges = (after: string | undefined) => {
    afters.push(after)

    return Promise.resolve(responses.shift()!)
  }

  return { afters, fetchChanges }
}

describe('features/Vessel/createActiveVesselsSync()', () => {
  it('Should download all the vessels first, then only their changes since the previous response', async () => {
    const getActiveVessels = createActiveVesselsSync()
    const { afters, fetchChanges } = mockFetchChanges([
      getChanges([VESSEL_A], { asOf: 'instance.1', isFull: true, vessels: [VESSEL_A] }),
      getChanges([VESSEL_A, VESSEL_B], { asOf: 'instance.2', vessels: [VESSEL_B] })
    ])

    expect(await getActiveVessels(fetchChanges)).toEqual([VESSEL_A])
    expect(await getActiveVessels(fetchChanges)).toEqual([VESSEL_A, VESSEL_B])

    expect(afters).toEqual([undefined, 'instance.1'])
  })

  it('Should download all the vessels again When the result differs from the backend vessels', async () => {
    const getActiveVessels = createActiveVesselsSync()
    const { afters, fetchChanges } = mockFetchChanges([
      getChanges([VESSEL_A], { asOf: 'instance.1', isFull: true, vessels: [VESSEL_A] }),
      // A vessel missed by the client
      getChanges([VESSEL_A, VESSEL_B], { asOf: 'instance.2' }),
      getChanges([VESSEL_A, VESSEL_B], { asOf: 'instance.3', isFull: true, vessels: [VESSEL_A, VESSEL_B] })
    ])
    await getActiveVessels(fetchChanges)

    expect(await getActiveVessels(fetchChanges)).toEqual([VESSEL_A, VESSEL_B])

    expect(afters).toEqual([undefined, 'instance.1', undefined])
  })

  it('Should download all the vessels again every 4 hours', async () => {
    let now = 0
    const getActiveVessels = createActiveVesselsSync(() => now)
    const { afters, fetchChanges } = mockFetchChanges([
      getChanges([VESSEL_A], { asOf: 'instance.1', isFull: true, vessels: [VESSEL_A] }),
      getChanges([VESSEL_A], { asOf: 'instance.2' }),
      getChanges([VESSEL_A], { asOf: 'instance.3', isFull: true, vessels: [VESSEL_A] })
    ])
    await getActiveVessels(fetchChanges)

    now = 4 * 60 * 60 * 1000 - 1
    await getActiveVessels(fetchChanges)
    now = 4 * 60 * 60 * 1000
    await getActiveVessels(fetchChanges)

    expect(afters).toEqual([undefined, 'instance.1', undefined])
  })

  it('Should return frozen vessels, as Immer skips them instead of deeply walking them', async () => {
    const getActiveVessels = createActiveVesselsSync()
    const { fetchChanges } = mockFetchChanges([getChanges([VESSEL_A], { isFull: true, vessels: [{ ...VESSEL_A }] })])

    const vessels = await getActiveVessels(fetchChanges)

    expect(vessels.every(vessel => Object.isFrozen(vessel))).toBe(true)
  })
})
