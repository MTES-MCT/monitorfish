import { beforeEach, describe, expect, it } from '@jest/globals'
import { WORLD_WIDTH } from '@utils/worldCopy'

import { animateToVesselCoordinates, fitMapToExtent, fitMapToVesselTrack } from '../animateMap'

const mockAnimate = jest.fn()
const mockFit = jest.fn()
const mockGetCenter = jest.fn()

jest.mock('@features/Map/monitorfishMap', () => ({
  monitorfishMap: {
    getView: () => ({
      animate: mockAnimate,
      fit: mockFit,
      getCenter: mockGetCenter,
      getResolution: () => 1,
      getResolutionForZoom: () => 1,
      getZoom: () => 9
    })
  }
}))

describe('features/Map/useCases/animateMap', () => {
  beforeEach(() => {
    // The user panned once around the globe
    mockGetCenter.mockReturnValue([WORLD_WIDTH + 1000, 5000])
  })

  it('animateToVesselCoordinates() Should animate to the vessel copy of the world copy displayed by the map', () => {
    animateToVesselCoordinates([2000, 6000], false)

    expect(mockAnimate).toHaveBeenCalledWith({ center: [2000 + WORLD_WIDTH, 6000], duration: 500 })
  })

  it('fitMapToExtent() Should fit the extent copy of the world copy displayed by the map', () => {
    fitMapToExtent([2000, 6000, 3000, 7000])

    expect(mockFit).toHaveBeenCalledWith([2000 + WORLD_WIDTH, 6000, 3000 + WORLD_WIDTH, 7000], expect.anything())
  })

  it('fitMapToVesselTrack() Should fit the track copy of the world copy displayed by the map', () => {
    fitMapToVesselTrack([2000, 6000, 3000, 7000])

    expect(mockFit).toHaveBeenCalledWith([2000 + WORLD_WIDTH, 6000, 3000 + WORLD_WIDTH, 7000], expect.anything())
  })

  it('animateToVesselCoordinates() Should not move the view across the world When it displays the main world', () => {
    mockGetCenter.mockReturnValue([1000, 5000])

    animateToVesselCoordinates([2000, 6000], false)

    expect(mockAnimate).toHaveBeenCalledWith({ center: [2000, 6000], duration: 500 })
  })
})
