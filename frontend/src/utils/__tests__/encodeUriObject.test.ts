/* eslint-disable sort-keys-fix/sort-keys-fix */

import { expect } from '@jest/globals'

import { encodeUriObject } from '../encodeUriObject'

describe('utils/encodeUriObject()', () => {
  it('should return the expected encoded URI', () => {
    const baseUri = 'https://example.org'
    const searchParamsAsObject = {
      typename: 'monitorfish:regulations',
      outputFormat: 'application/json',
      CQL_FILTER: `topic='Ouest Cotentin Bivalves' AND zone='Praires Ouest cotentin'`
    }

    const result = encodeUriObject(baseUri, searchParamsAsObject)

    expect(result).toStrictEqual(
      'https://example.org?typename=monitorfish%3Aregulations&outputFormat=application%2Fjson&CQL_FILTER=topic%3D%27Ouest+Cotentin+Bivalves%27+AND+zone%3D%27Praires+Ouest+cotentin%27'
    )
  })

  it('should return the expected Geoserver encoded URI', () => {
    const baseUri = 'https://example.org'
    const searchParamsAsObject = {
      typename: 'monitorfish:regulations',
      outputFormat: 'application/json',
      CQL_FILTER: `topic='Ouest Cotentin Bivalves' AND zone='Praires Ouest cotentin'`
    }

    const result = encodeUriObject(baseUri, searchParamsAsObject, true)

    expect(result).toStrictEqual(
      'https://example.org?typename=monitorfish:regulations&outputFormat=application/json&CQL_FILTER=topic=%27Ouest%20Cotentin%20Bivalves%27%20AND%20zone=%27Praires%20Ouest%20cotentin%27'
    )
  })
})
