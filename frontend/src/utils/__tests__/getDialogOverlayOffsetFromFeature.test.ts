import { describe, expect, it, jest } from '@jest/globals'
import { Geometry } from 'ol/geom'
import Map from 'ol/Map'

import { MonitorFishLayer } from '../../domain/entities/layers/types'
import { FeatureWithCodeAndEntityId } from '../../libs/FeatureWithCodeAndEntityId'
import { getDialogOverlayOffsetFromFeature } from '../getDialogOverlayOffsetFromFeature'
import { type Margins } from '../getDialogWindowPositionFromFeature'

const MockedMap = Map as jest.MockedClass<typeof Map>

const TEST_FEATURE_MARGINS: Margins = [11, 12, 13, 14]
const TEST_WINDOW_MARGINS: Margins = [21, 22, 23, 24]

describe('utils/getDialogOverlayOffsetFromFeature()', () => {
  const featureMock = new FeatureWithCodeAndEntityId({
    code: MonitorFishLayer.VESSELS,
    entityId: 123,
    geometry: new Geometry()
  })
  const geometryMock = {
    getExtent: jest.fn().mockReturnValue([0, 0, 100, 100])
  }
  ;(featureMock as any).getGeometry = jest.fn().mockReturnValue(geometryMock)

  const dialogElementMock = {
    offsetWidth: 100,
    // eslint-disable-next-line sort-keys-fix/sort-keys-fix
    offsetHeight: 200
  } as HTMLDivElement

  const callGetDialogOverlayOffsetFromFeature = () =>
    getDialogOverlayOffsetFromFeature(featureMock, dialogElementMock, TEST_FEATURE_MARGINS, TEST_WINDOW_MARGINS)

  beforeEach(() => {
    global.window.innerWidth = 800
    global.window.innerHeight = 600

    document.body.innerHTML = `
      <div id="mainWindowWrapper" />
    `
  })

  it('should position dialog above the feature and horizontally centered when there is enough space above', () => {
    MockedMap.prototype.getPixelFromCoordinate.mockReturnValue([400, 300]) // Center of the 800x600 window

    expect(callGetDialogOverlayOffsetFromFeature()).toEqual([-50, -251])
  })

  it('should position dialog below the feature and horizontally centered when overflowing above', () => {
    MockedMap.prototype.getPixelFromCoordinate.mockReturnValue([400, 150]) // Above the center of the 800x600 window

    expect(callGetDialogOverlayOffsetFromFeature()).toEqual([-50, 13])
  })

  it('should position dialog to the left of the feature and vertically centered when overflowing on the right', () => {
    MockedMap.prototype.getPixelFromCoordinate.mockReturnValue([750, 300]) // Right side of the center of the 800x600 window

    expect(callGetDialogOverlayOffsetFromFeature()).toEqual([-114, -120])
  })

  it('should position dialog to the right and vertically centered when overflowing on the left', () => {
    MockedMap.prototype.getPixelFromCoordinate.mockReturnValue([50, 300]) // Left side of the center of the 800x600 window

    expect(callGetDialogOverlayOffsetFromFeature()).toEqual([12, -120])
  })

  it('should position dialog to the bottom right of the feature when in the top left corner of the window', () => {
    MockedMap.prototype.getPixelFromCoordinate.mockReturnValue([50, 50]) // Top-left corner of the 800x600 window

    expect(callGetDialogOverlayOffsetFromFeature()).toEqual([12, 13])
  })

  it('should position dialog to the bottom left of the feature when in the top right corner of the window', () => {
    MockedMap.prototype.getPixelFromCoordinate.mockReturnValue([750, 50]) // Top-right corner of the 800x600 window

    expect(callGetDialogOverlayOffsetFromFeature()).toEqual([-114, 13])
  })

  it('should position dialog to the top right of the feature when in the bottom left corner of the window', () => {
    MockedMap.prototype.getPixelFromCoordinate.mockReturnValue([50, 550]) // Bottom-left corner of the 800x600 window

    expect(callGetDialogOverlayOffsetFromFeature()).toEqual([12, -251])
  })

  it('should position dialog to the top left of the feature when in the top right corner of the window', () => {
    MockedMap.prototype.getPixelFromCoordinate.mockReturnValue([750, 550]) // Bottom-right corner of the 800x600 window

    expect(callGetDialogOverlayOffsetFromFeature()).toEqual([-114, -251])
  })
})
