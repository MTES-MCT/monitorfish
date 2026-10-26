import { MonitorFishMap } from '@features/Map/Map.types'
import { getMissionFeatureZone } from '@features/Mission/features'
import { describe, expect, it } from '@jest/globals'

import type { MissionMainFormValuesWithId } from '@features/Mission/features'

describe('features/Mission/features.getMissionFeatureZone()', () => {
  it('should return a feature without geometry when the mission has no geometry', () => {
    const mission = {
      controlUnits: [],
      id: -1,
      isGeometryComputedFromControls: false,
      isValid: true,
      startDateTimeUtc: '2026-10-26T00:00:00.000Z'
    } as MissionMainFormValuesWithId

    const result = getMissionFeatureZone(mission, MonitorFishMap.MonitorFishLayer.MISSION_SELECTED)

    expect(result.getGeometry()).toBeUndefined()
    expect(result.getId()).toBe(`${MonitorFishMap.MonitorFishLayer.MISSION_SELECTED}:-1`)
  })

  it('should return a feature with the mission geometry', () => {
    const mission = {
      controlUnits: [],
      geom: {
        coordinates: [
          [
            [
              [-4, 47],
              [-3, 47],
              [-3, 48],
              [-4, 47]
            ]
          ]
        ],
        type: 'MultiPolygon'
      },
      id: 1,
      isGeometryComputedFromControls: false,
      isValid: true,
      startDateTimeUtc: '2026-10-26T00:00:00.000Z'
    } as MissionMainFormValuesWithId

    const result = getMissionFeatureZone(mission, MonitorFishMap.MonitorFishLayer.MISSION_SELECTED)

    expect(result.getGeometry()?.getType()).toBe('MultiPolygon')
  })
})
