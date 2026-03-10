import { REPORTINGS_VECTOR_SOURCE } from '@features/Reporting/layers/ReportingLayer/constants'
import { describe, it, expect, afterAll, beforeEach } from '@jest/globals'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'

import { hoverOnMapFeature } from '../hoverOnMapFeature'

jest.mock('@features/Reporting/layers/ReportingLayer/constants', () => ({
  REPORTINGS_VECTOR_SOURCE: {
    changed: jest.fn(),
    getFeatures: jest.fn()
  }
}))

describe('hoverOnMapFeature()', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(REPORTINGS_VECTOR_SOURCE.getFeatures as jest.Mock).mockReturnValue([])
  })

  afterAll(() => {
    jest.resetModules()
  })

  it('Should reset isHovered on a previously hovered reporting feature when no feature is provided', () => {
    // Given
    const hoveredFeature = new Feature({ geometry: new Point([0, 0]) })
    hoveredFeature.setId('REPORTING:7')
    hoveredFeature.set('isHovered', true)
    const setSpy = jest.spyOn(hoveredFeature, 'set')
    ;(REPORTINGS_VECTOR_SOURCE.getFeatures as jest.Mock).mockReturnValue([hoveredFeature])

    // When
    hoverOnMapFeature(undefined)

    // Then
    expect(setSpy).toHaveBeenCalledWith('isHovered', false)
    expect(REPORTINGS_VECTOR_SOURCE.changed).toHaveBeenCalled()
  })

  it('Should set isHovered to true when feature id contains REPORTING', () => {
    // Given
    const reportingFeature = new Feature({ geometry: new Point([0, 0]) })
    reportingFeature.setId('REPORTING:7')
    const setSpy = jest.spyOn(reportingFeature, 'set')

    // When
    hoverOnMapFeature(reportingFeature)

    // Then
    expect(setSpy).toHaveBeenCalledWith('isHovered', true)
  })

  it('Should NOT set isHovered when feature id does not contain REPORTING', () => {
    // Given
    const vesselFeature = new Feature({ geometry: new Point([0, 0]) })
    vesselFeature.setId('VESSELS')
    const setSpy = jest.spyOn(vesselFeature, 'set')

    // When
    hoverOnMapFeature(vesselFeature)

    // Then
    expect(setSpy).not.toHaveBeenCalledWith('isHovered', expect.anything())
  })
})
