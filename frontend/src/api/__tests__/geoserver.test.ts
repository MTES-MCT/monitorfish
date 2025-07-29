import { getAdministrativeZoneURL } from '@api/geoserver'
import { describe, expect, it } from '@jest/globals'

describe('geoserver', () => {
  it('getAdministrativeZoneURL Should return the formatted URL', async () => {
    // When
    const url = getAdministrativeZoneURL('fao_areas', undefined, 'fao_areas.27.3.b, c', 'localhost')

    // Then
    expect(url).toEqual(
      'localhost/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&' +
        'typename=monitorfish:fao_areas&outputFormat=application/json&' +
        'srsname=EPSG:4326&' +
        'featureID=fao_areas.27.3.b%2C%20c'
    )
  })
})
