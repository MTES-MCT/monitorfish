import { describe, expect, it, jest } from '@jest/globals'
import { Geometry } from 'ol/geom'
import Map from 'ol/Map'

import { MonitorFishLayer } from '../../domain/entities/layers/types'
import { FeatureWithCodeAndEntityId } from '../../libs/FeatureWithCodeAndEntityId'
import { getDialogOverlayPositionFromFeature } from '../getDialogOverlayPositionFromFeature'

import type { Margins } from '../getDialogWindowPositionFromFeature'

const MockedMap = Map as jest.MockedClass<typeof Map>

const TEST_DIALOG_WIDTH_AND_HEIGHT: [number, number] = [320, 334]
const TEST_FEATURE_MARGINS: Margins = [60, 0, 0, 0]

// The values in this test come from real values in the app.
// This test doesn't test or guarantee anything at the moment: it just returns mocked values.
// It is just there for documentation purposes.
// TODO Find a way to spy on the real OL library?
describe('utils/getDialogOverlayPositionFromFeature()', () => {
  const featureMock = new FeatureWithCodeAndEntityId({
    code: MonitorFishLayer.VESSELS,
    entityId: 123,
    geometry: new Geometry()
  })
  const mockGeometry = {
    getExtent: jest
      .fn()
      .mockReturnValue([-307336.08219813695, 6050184.652254513, -307336.08219813695, 6050184.652254513])
  }
  ;(featureMock as any).getGeometry = jest.fn().mockReturnValue(mockGeometry)

  const dialogElementMock = {
    offsetWidth: TEST_DIALOG_WIDTH_AND_HEIGHT[0],
    // eslint-disable-next-line sort-keys-fix/sort-keys-fix
    offsetHeight: TEST_DIALOG_WIDTH_AND_HEIGHT[1]
  } as HTMLDivElement

  it('should calculate correct overlay position for a centered feature', () => {
    MockedMap.prototype.getPixelFromCoordinate.mockReturnValue([722.5017053675074, 613.1952867660966])
    MockedMap.prototype.getCoordinateFromPixel.mockReturnValue([-377435.1012661498, 6222803.486709494])

    const firstResult = getDialogOverlayPositionFromFeature(featureMock, dialogElementMock, TEST_FEATURE_MARGINS)
    const secondResult = getDialogOverlayPositionFromFeature(
      featureMock,
      TEST_DIALOG_WIDTH_AND_HEIGHT,
      TEST_FEATURE_MARGINS
    )

    expect(firstResult).toEqual([-377435.1012661498, 6222803.486709494])
    expect(secondResult).toEqual([-377435.1012661498, 6222803.486709494])
  })
})
