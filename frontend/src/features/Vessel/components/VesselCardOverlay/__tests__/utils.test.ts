import { describe, expect, it } from '@jest/globals'
import Feature from 'ol/Feature'

import { FLEET_SEGMENTS_SECTION_HEIGHT, WARNING_BANNER_HEIGHT } from '../constants'
import { computeYOffset } from '../utils'

const EMPTY_CARD_PROPERTIES = {
  groupsDisplayed: [],
  hasAlert: false,
  hasInfractionSuspicion: false,
  numberOfGroupsHidden: 0
}

describe('features/Vessel/components/VesselCardOverlay/utils.computeYOffset()', () => {
  it('Should not offset an active vessel card without warnings nor groups', () => {
    const feature = new Feature({ ...EMPTY_CARD_PROPERTIES, isReplayed: false })

    expect(computeYOffset(feature, true)).toEqual(0)
  })

  it('Should shrink a replayed vessel card, which has no fleet segments', () => {
    const feature = new Feature({ ...EMPTY_CARD_PROPERTIES, isReplayed: true })

    expect(computeYOffset(feature, true)).toEqual(-FLEET_SEGMENTS_SECTION_HEIGHT)
  })

  it('Should grow an active vessel card with a warning for a super user only', () => {
    const feature = new Feature({ ...EMPTY_CARD_PROPERTIES, hasAlert: true, isReplayed: false })

    expect(computeYOffset(feature, true)).toEqual(WARNING_BANNER_HEIGHT)
    expect(computeYOffset(feature, false)).toEqual(0)
  })
})
