import { afterEach, beforeAll, describe, expect, it } from '@jest/globals'
import { webcrypto } from 'node:crypto'

import {
  getOpenVesselPhotosContributeUrl,
  getOpenVesselPhotosContributorId,
  isSubmissionOfVessel,
  OpenVesselPhotoSubmissionStatus
} from '../openVesselPhotosApi'

import type * as OpenVesselPhotosApi from '../openVesselPhotosApi'

const ORIGINAL_ENV = { ...process.env }

function importWithTrackingEnabled(): typeof OpenVesselPhotosApi {
  process.env.FRONTEND_OPEN_VESSEL_PHOTOS_API_KEY = 'ovp_test'
  process.env.FRONTEND_OPEN_VESSEL_PHOTOS_APP_ID = 'app_test00000000'

  let module: typeof OpenVesselPhotosApi | undefined
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    module = require('../openVesselPhotosApi')
  })

  return module as typeof OpenVesselPhotosApi
}

describe('features/Vessel/openVesselPhotosApi', () => {
  beforeAll(() => {
    if (!globalThis.crypto?.subtle) {
      Object.defineProperty(globalThis, 'crypto', { value: webcrypto })
    }
  })

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  describe('getOpenVesselPhotosContributeUrl()', () => {
    it('should prefill both the CFR and the MMSI', () => {
      expect(getOpenVesselPhotosContributeUrl({ cfr: 'FRA000295304', mmsi: '227101600' })).toBe(
        'https://openvesselphotos.org/fr/contribute?cfr=FRA000295304&mmsi=227101600'
      )
    })

    it('should only prefill the known key', () => {
      expect(getOpenVesselPhotosContributeUrl({ cfr: undefined, mmsi: '227101600' })).toBe(
        'https://openvesselphotos.org/fr/contribute?mmsi=227101600'
      )
      expect(getOpenVesselPhotosContributeUrl({ cfr: 'FRA000295304', mmsi: undefined })).toBe(
        'https://openvesselphotos.org/fr/contribute?cfr=FRA000295304'
      )
    })

    it('should not prefill anything without any key', () => {
      expect(getOpenVesselPhotosContributeUrl({ cfr: undefined, mmsi: undefined })).toBe(
        'https://openvesselphotos.org/fr/contribute'
      )
    })

    it('should not add the application nor the contributor when the tracking is disabled', () => {
      process.env.FRONTEND_OPEN_VESSEL_PHOTOS_API_KEY = ''
      process.env.FRONTEND_OPEN_VESSEL_PHOTOS_APP_ID = ''
      let module: typeof OpenVesselPhotosApi | undefined
      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        module = require('../openVesselPhotosApi')
      })

      expect(module?.getOpenVesselPhotosContributeUrl({ cfr: 'FRA000295304', mmsi: undefined }, 'abc')).toBe(
        'https://openvesselphotos.org/fr/contribute?cfr=FRA000295304'
      )
    })

    it('should add the application and the contributor when the tracking is enabled', () => {
      const module = importWithTrackingEnabled()

      expect(module.getOpenVesselPhotosContributeUrl({ cfr: 'FRA000295304', mmsi: '227101600' }, 'abc')).toBe(
        'https://openvesselphotos.org/fr/contribute?cfr=FRA000295304&mmsi=227101600&app=app_test00000000&contributorId=abc'
      )
      expect(module.getOpenVesselPhotosContributeUrl({ cfr: 'FRA000295304', mmsi: undefined }, undefined)).toBe(
        'https://openvesselphotos.org/fr/contribute?cfr=FRA000295304'
      )
    })
  })

  describe('getOpenVesselPhotosContributorId()', () => {
    it('should return the same 64 hexadecimal characters id for the same e-mail, whatever its case', async () => {
      const contributorId = await getOpenVesselPhotosContributorId('Jean.Dupont@example.gouv.fr')

      expect(contributorId).toMatch(/^[0-9a-f]{64}$/)
      expect(await getOpenVesselPhotosContributorId(' jean.dupont@example.gouv.fr ')).toBe(contributorId)
      expect(await getOpenVesselPhotosContributorId('marie.durand@example.gouv.fr')).not.toBe(contributorId)
    })
  })

  describe('isSubmissionOfVessel()', () => {
    const submission = {
      cfr: 'FRA000295304',
      id: 1,
      mmsi: null,
      rejectReason: null,
      status: OpenVesselPhotoSubmissionStatus.PENDING,
      vesselName: 'LE GRANVILLAIS'
    }

    it('should match a vessel by its CFR or its MMSI', () => {
      expect(isSubmissionOfVessel(submission, { cfr: 'FRA000295304', mmsi: undefined })).toBe(true)
      expect(isSubmissionOfVessel({ ...submission, mmsi: '227101600' }, { cfr: undefined, mmsi: '227101600' })).toBe(
        true
      )
    })

    it('should not match another vessel', () => {
      expect(isSubmissionOfVessel(submission, { cfr: 'FRA000111111', mmsi: undefined })).toBe(false)
      expect(isSubmissionOfVessel({ ...submission, cfr: null }, { cfr: undefined, mmsi: undefined })).toBe(false)
    })
  })
})
