import { describe, expect, it } from '@jest/globals'

import { getFeaturesFromPositions, getTrackType } from './index'

import type { VesselLineFeature, VesselPointFeature, VesselPosition } from '../types'

describe('vessel/track', () => {
  it('getFeaturesFromPositions Should return one feature point When one position is given', async () => {
    // Given
    const positions = [
      {
        course: 356,
        dateTime: '2022-10-27T16:10:20.4564+02:00',
        destination: 'DE',
        externalReferenceNumber: 'SE457432',
        flagState: 'FR',
        from: 'FR',
        internalReferenceNumber: 'ABC000898396',
        ircs: 'ZBRI',
        isFishing: null,
        isManual: null,
        latitude: 46.386,
        longitude: -3.328,
        mmsi: null,
        positionType: 'VMS',
        speed: 2.8,
        tripNumber: null,
        vesselName: 'CE DEVANT ÉLEVER'
      }
    ]
    const vesselId = 'VESSEL_ID'

    // When
    const features = getFeaturesFromPositions(positions, vesselId)

    // Then
    expect(features).toHaveLength(1)

    const feature = features[0] as VesselPointFeature
    expect(feature!.course).toEqual(356)
    expect(feature!.name).toEqual('vessel_track:position:0')
    expect(feature!.speed).toEqual(2.8)
    expect(feature!.dateTime).toEqual('2022-10-27T16:10:20.4564+02:00')
    expect(feature!.getId()).toEqual('vessel_track:VESSEL_ID:position:0')
    expect(feature!.getGeometry()?.getFlatCoordinates()[0]).toEqual(-370471.26536001445)
    expect(feature!.getGeometry()?.getFlatCoordinates()[1]).toEqual(5842423.238503429)
  })

  it('getFeaturesFromPositions Should return multiple features When a track is given', async () => {
    // Given
    const positions = DUMMY_VESSEL_TRACK
    const expectedPositionsCourses = DUMMY_VESSEL_TRACK.map(position => position.course)
    const vesselId = 'VESSEL_ID'

    // When
    const features = getFeaturesFromPositions(positions, vesselId)
    const positionFeatures = features.filter(feature => feature.getId()?.toString().includes('position'))
    const lineFeatures = features.filter(feature => feature.getId()?.toString().includes('line'))
    const arrowFeatures = features.filter(feature => feature.getId()?.toString().includes('arrow'))

    // Then, there is 5 positions (6 positions minus the last showed position) + 5 lines + 5 arrows = 16 features
    expect(features).toHaveLength(16)
    expect(lineFeatures).toHaveLength(5)
    expect(positionFeatures).toHaveLength(6)
    expect(arrowFeatures).toHaveLength(5)

    expect(positionFeatures.map(position => position.course)).toEqual(expectedPositionsCourses)

    // First Line
    const firstLineFeature = lineFeatures[0] as VesselLineFeature
    expect(firstLineFeature!.course!.toString()).toContain('-1.8')
    expect(firstLineFeature!.speed).toEqual(2.8)
    expect(firstLineFeature!.isTimeEllipsis).toEqual(false)
    // Line should be fishing as N+1 and N+1 positions have the isFishing property set to true
    expect(firstLineFeature!.trackType!.code).toEqual('FISHING')
    expect(firstLineFeature!.getId()).toEqual('vessel_track:VESSEL_ID:line:0')
    expect(firstLineFeature!.getGeometry()?.getLength().toString()).toContain('7411')
    // A LineString geometry is of type Coordinate[][]
    expect(firstLineFeature!.getGeometry()?.getCoordinates()).toEqual([
      [-370471.26536001445, 5842423.238503429],
      [-372586.33568508667, 5849526.831117608]
    ])

    // Second Line
    const secondLineFeature = lineFeatures[1] as VesselLineFeature
    expect(secondLineFeature!.course!.toString()).toContain('-2.57')
    expect(secondLineFeature!.speed).toEqual(2.9)
    expect(secondLineFeature!.isTimeEllipsis).toEqual(false)
    expect(secondLineFeature!.trackType!.code).toEqual('TRANSIT')
    expect(secondLineFeature!.getId()).toEqual('vessel_track:VESSEL_ID:line:1')
    expect(secondLineFeature!.getGeometry()?.getLength().toString()).toContain('8439')
    // A LineString geometry is of type Coordinate[][]
    expect(secondLineFeature!.getGeometry()?.getCoordinates()).toEqual([
      [-372586.33568508667, 5849526.831117608],
      [-379710.7830958562, 5854050.285232945]
    ])

    // Last position
    const positionFeature = positionFeatures[5] as VesselPointFeature
    expect(positionFeature!.course).toEqual(263)
    expect(positionFeature!.getId()).toEqual('vessel_track:VESSEL_ID:position:5')
    // A Point geometry is of type Coordinate[]
    expect(positionFeature!.getGeometry()?.getCoordinates()).toEqual([-402308.6397268907, 5852757.632510743])
  })

  it('getTrackType Should return FISHING When two positions have the isFishing property set as true', async () => {
    // Given
    const firstPosition = DUMMY_VESSEL_TRACK[0] as VesselPosition
    firstPosition.isFishing = true
    const secondPosition = DUMMY_VESSEL_TRACK[1] as VesselPosition
    secondPosition.isFishing = true

    // When
    const trackType = getTrackType([firstPosition, secondPosition], false)

    // Then
    expect(trackType.code).toEqual('FISHING')
  })

  it('getTrackType Should not return FISHING When first position does have the isFishing property set as true', async () => {
    // Given
    const firstPosition = DUMMY_VESSEL_TRACK[0] as VesselPosition
    firstPosition.isFishing = false
    const secondPosition = DUMMY_VESSEL_TRACK[1] as VesselPosition
    secondPosition.isFishing = true

    // When
    const trackType = getTrackType([firstPosition, secondPosition], false)

    // Then
    expect(trackType.code).toEqual('TRANSIT')
  })

  it('getTrackType Should not return FISHING When second position does have the isFishing property set as true', async () => {
    // Given
    const firstPosition = DUMMY_VESSEL_TRACK[0] as VesselPosition
    firstPosition.isFishing = true
    const secondPosition = DUMMY_VESSEL_TRACK[1] as VesselPosition
    secondPosition.isFishing = false

    // When
    const trackType = getTrackType([firstPosition, secondPosition], false)

    // Then
    expect(trackType.code).toEqual('TRANSIT')
  })

  it('getTrackType Should return FISHING When only one position is given and does have the isFishing property set as true', async () => {
    // Given
    const firstPosition = DUMMY_VESSEL_TRACK[0] as VesselPosition
    firstPosition.isFishing = true

    // When
    const trackType = getTrackType([firstPosition], false)

    // Then
    expect(trackType.code).toEqual('FISHING')
  })
})

const DUMMY_VESSEL_TRACK = [
  {
    course: 356,
    dateTime: '2022-10-27T16:10:20.4564+02:00',
    destination: 'DE',
    externalReferenceNumber: 'SE457432',
    flagState: 'FR',
    from: 'FR',
    internalReferenceNumber: 'ABC000898396',
    ircs: 'ZBRI',
    isFishing: true,
    isManual: null,
    latitude: 46.386,
    longitude: -3.328,
    mmsi: null,
    positionType: 'VMS',
    speed: 2.8,
    tripNumber: null,
    vesselName: 'CE DEVANT ÉLEVER'
  },
  {
    course: 328,
    dateTime: '2022-10-27T17:10:20.4564+02:00',
    destination: 'DE',
    externalReferenceNumber: 'SE457432',
    flagState: 'FR',
    from: 'FR',
    internalReferenceNumber: 'ABC000898396',
    ircs: 'ZBRI',
    isFishing: true,
    isManual: null,
    latitude: 46.43,
    longitude: -3.347,
    mmsi: null,
    positionType: 'VMS',
    speed: 2.9,
    tripNumber: null,
    vesselName: 'CE DEVANT ÉLEVER'
  },
  {
    course: 310,
    dateTime: '2022-10-27T18:10:20.4564+02:00',
    destination: 'DE',
    externalReferenceNumber: 'SE457432',
    flagState: 'FR',
    from: 'FR',
    internalReferenceNumber: 'ABC000898396',
    ircs: 'ZBRI',
    isFishing: null,
    isManual: null,
    latitude: 46.458,
    longitude: -3.411,
    mmsi: null,
    positionType: 'VMS',
    speed: 2.2,
    tripNumber: null,
    vesselName: 'CE DEVANT ÉLEVER'
  },
  {
    course: 282,
    dateTime: '2022-10-27T19:10:20.4564+02:00',
    destination: 'DE',
    externalReferenceNumber: 'SE457432',
    flagState: 'FR',
    from: 'FR',
    internalReferenceNumber: 'ABC000898396',
    ircs: 'ZBRI',
    isFishing: null,
    isManual: null,
    latitude: 46.486,
    longitude: -3.481,
    mmsi: null,
    positionType: 'VMS',
    speed: 3.1,
    tripNumber: null,
    vesselName: 'CE DEVANT ÉLEVER'
  },
  {
    course: 227,
    dateTime: '2022-10-27T20:10:20.4564+02:00',
    destination: 'DE',
    externalReferenceNumber: 'SE457432',
    flagState: 'FR',
    from: 'FR',
    internalReferenceNumber: 'ABC000898396',
    ircs: 'ZBRI',
    isFishing: null,
    isManual: null,
    latitude: 46.471,
    longitude: -3.552,
    mmsi: null,
    positionType: 'VMS',
    speed: 2.8,
    tripNumber: null,
    vesselName: 'CE DEVANT ÉLEVER'
  },
  {
    course: 263,
    dateTime: '2022-10-27T21:10:20.4564+02:00',
    destination: 'DE',
    externalReferenceNumber: 'SE457432',
    flagState: 'FR',
    from: 'FR',
    internalReferenceNumber: 'ABC000898396',
    ircs: 'ZBRI',
    isFishing: null,
    isManual: null,
    latitude: 46.45,
    longitude: -3.614,
    mmsi: null,
    positionType: 'VMS',
    speed: 2.9,
    tripNumber: null,
    vesselName: 'CE DEVANT ÉLEVER'
  }
]
