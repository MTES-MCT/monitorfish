import { afterEach, beforeEach, describe, expect, it } from '@jest/globals'

import { DEFAULT_REGULATION } from '../../utils'
import { createOrUpdateBackofficeRegulation } from '../createOrUpdateRegulation'

import type { RegulatoryZoneDraft } from '../../types'
import type { Polygon } from 'geojson'

/**
 * GeoServer response to a WFS 1.1.0 Transaction.
 * @see https://docs.geoserver.org/stable/en/user/services/wfs/reference.html#transaction
 */
const GEOSERVER_TRANSACTION_RESPONSE = `<?xml version="1.0" encoding="UTF-8"?>
<wfs:TransactionResponse xmlns:wfs="http://www.opengis.net/wfs" xmlns:ogc="http://www.opengis.net/ogc" version="1.1.0">
  <wfs:TransactionSummary>
    <wfs:totalInserted>0</wfs:totalInserted>
    <wfs:totalUpdated>1</wfs:totalUpdated>
    <wfs:totalDeleted>1</wfs:totalDeleted>
  </wfs:TransactionSummary>
  <wfs:TransactionResults/>
  <wfs:InsertResults>
    <wfs:Feature>
      <ogc:FeatureId fid="none"/>
    </wfs:Feature>
  </wfs:InsertResults>
</wfs:TransactionResponse>`

const PICKED_GEOMETRY: Polygon = {
  coordinates: [
    [
      [-4.5, 48.1],
      [-4.4, 48.1],
      [-4.4, 48.2],
      [-4.5, 48.1]
    ]
  ],
  type: 'Polygon'
}

const REGULATION: RegulatoryZoneDraft = {
  ...DEFAULT_REGULATION,
  lawType: 'Reg. MEMN',
  region: ['Bretagne'],
  topic: 'Ouest Cotentin Bivalves',
  zone: 'Praires Ouest cotentin'
}

const fetchMock = jest.fn()
const dispatch = jest.fn(action =>
  typeof action === 'function' ? action(dispatch, getState, undefined) : action
) as any
const getState = jest.fn() as any

const getSentTransaction = () => {
  const [, { body }] = fetchMock.mock.calls[0] as [string, { body: string }]

  return new DOMParser().parseFromString(body, 'text/xml')
}

const findElements = (node: Document | Element, localName: string) =>
  Array.from(node.getElementsByTagName('*')).filter(element => element.localName === localName)

const getFeatureIds = (transaction: Document, operation: 'Delete' | 'Update') =>
  findElements(transaction, operation).map(element => findElements(element, 'FeatureId')[0]?.getAttribute('fid'))

const getUpdatedPropertyNames = (transaction: Document) =>
  findElements(findElements(transaction, 'Update')[0]!, 'Property').map(
    property => findElements(property, 'Name')[0]?.textContent
  )

describe('createOrUpdateBackofficeRegulation()', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    fetchMock.mockResolvedValue(new Response(GEOSERVER_TRANSACTION_RESPONSE, { status: 200 }))
    global.fetch = fetchMock as any
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.useRealTimers()
  })

  it('Should copy the picked geometry into the edited regulation and delete the geometry row, in a single transaction', async () => {
    // When
    await createOrUpdateBackofficeRegulation({ ...REGULATION, geometryId: '456', id: '123' }, PICKED_GEOMETRY)(
      dispatch,
      getState,
      undefined
    )
    jest.runAllTimers()

    // Then
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const transaction = getSentTransaction()
    expect(getFeatureIds(transaction, 'Update')).toEqual(['regulations_write.123'])
    expect(getFeatureIds(transaction, 'Delete')).toEqual(['regulations_write.456'])
    expect(getUpdatedPropertyNames(transaction)).toEqual(expect.arrayContaining(['geometry', 'topic', 'zone']))
    expect(
      [...findElements(transaction, 'Update'), ...findElements(transaction, 'Delete')].map(operation =>
        operation.getAttribute('typeName')
      )
    ).toEqual(['monitorfish:regulations_write', 'monitorfish:regulations_write'])
  })

  it('Should send the geometry with a CRS whose axis order GeoServer reads as latitude/longitude', async () => {
    // When
    await createOrUpdateBackofficeRegulation({ ...REGULATION, geometryId: '456', id: '123' }, PICKED_GEOMETRY)(
      dispatch,
      getState,
      undefined
    )

    // Then
    const transaction = getSentTransaction()
    const polygon = findElements(transaction, 'Polygon')[0]!
    // GeoServer reads `EPSG:4326` as longitude/latitude, but the URN form as latitude/longitude
    // @see https://docs.geoserver.org/stable/en/user/services/wfs/axis_order.html
    expect(polygon.getAttribute('srsName')).toBe('urn:ogc:def:crs:EPSG::4326')
    expect(findElements(polygon, 'posList')[0]?.textContent?.split(' ').slice(0, 2)).toEqual(['48.1', '-4.5'])
  })

  it('Should only update the regulation When no other geometry is picked', async () => {
    // When
    await createOrUpdateBackofficeRegulation({ ...REGULATION, id: '123' }, undefined)(dispatch, getState, undefined)
    jest.runAllTimers()

    // Then
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const transaction = getSentTransaction()
    expect(getFeatureIds(transaction, 'Update')).toEqual(['regulations_write.123'])
    expect(getFeatureIds(transaction, 'Delete')).toEqual([])
    expect(getUpdatedPropertyNames(transaction)).not.toContain('geometry')
  })

  it('Should fill the picked geometry row When the regulation is created', async () => {
    // When
    await createOrUpdateBackofficeRegulation({ ...REGULATION, geometryId: '456' }, PICKED_GEOMETRY)(
      dispatch,
      getState,
      undefined
    )
    jest.runAllTimers()

    // Then
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const transaction = getSentTransaction()
    expect(getFeatureIds(transaction, 'Update')).toEqual(['regulations_write.456'])
    expect(getFeatureIds(transaction, 'Delete')).toEqual([])
    expect(getUpdatedPropertyNames(transaction)).not.toContain('geometry')
  })
})
