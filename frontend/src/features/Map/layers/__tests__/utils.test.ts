import { describe, expect, it } from '@jest/globals'

import { getFeaturesFromRegulatoryZones } from '../utils'

import type { RegulatoryZone } from '../../../Regulation/types'

describe('features/Map/layers/utils.getFeaturesFromRegulatoryZones()', () => {
  it('should skip regulatory zones without geometry', () => {
    const regulatoryZones: Partial<RegulatoryZone>[] = [
      { geometry: undefined, topic: 'Without geometry', zone: 'Zone 1' },
      {
        geometry: {
          coordinates: [
            [
              [-4, 47],
              [-3, 47],
              [-3, 48],
              [-4, 47]
            ]
          ],
          type: 'Polygon'
        },
        topic: 'With geometry',
        zone: 'Zone 2'
      }
    ]

    const result = getFeaturesFromRegulatoryZones(regulatoryZones)

    expect(result).toHaveLength(1)
    expect(result[0]!.get('topic')).toBe('With geometry')
    expect(result[0]!.getGeometry()?.getType()).toBe('Polygon')
  })
})
