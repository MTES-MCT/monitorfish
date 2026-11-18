import { monitorfishApi, monitorfishPublicApi } from '@api/api'
import { getAllRegulatoryLayers } from '@features/Regulation/useCases/getAllRegulatoryLayers'
import { beforeEach, describe, expect, it } from '@jest/globals'

import { getAllGearCodes } from '../../../../domain/use_cases/gearCode/getAllGearCodes'
import { getInfractions } from '../../../../domain/use_cases/infraction/getInfractions'
import { getAllSpecies } from '../../../../domain/use_cases/species/getAllSpecies'
import { refreshChangedReferentials } from '../refreshChangedReferentials'

jest.mock('@features/Regulation/useCases/getAllRegulatoryLayers', () => ({
  getAllRegulatoryLayers: jest.fn(() => ({ type: 'TEST/getAllRegulatoryLayers' }))
}))
jest.mock('../../../../domain/use_cases/gearCode/getAllGearCodes', () => ({
  getAllGearCodes: jest.fn(() => ({ type: 'TEST/getAllGearCodes' }))
}))
jest.mock('../../../../domain/use_cases/infraction/getInfractions', () => ({
  getInfractions: jest.fn(() => ({ type: 'TEST/getInfractions' }))
}))
jest.mock('../../../../domain/use_cases/species/getAllSpecies', () => ({
  getAllSpecies: jest.fn(() => ({ type: 'TEST/getAllSpecies' }))
}))

const VERSIONS = { gears: 'g1', infractions: 'i1', ports: 'p1', regulations: 'r1', species: 's1' }

describe('features/MainWindow/useCases/refreshChangedReferentials()', () => {
  const dispatch = jest.fn((action: any) => action)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Should not download anything When no version changed', () => {
    refreshChangedReferentials(VERSIONS, { ...VERSIONS })(dispatch, jest.fn() as any, undefined)

    expect(dispatch).not.toHaveBeenCalled()
  })

  it('Should only download again the regulatory zones When their version changed', () => {
    refreshChangedReferentials(VERSIONS, { ...VERSIONS, regulations: 'r2' })(dispatch, jest.fn() as any, undefined)

    expect(getAllRegulatoryLayers).toHaveBeenCalledWith(undefined)
    expect(getAllSpecies).not.toHaveBeenCalled()
    expect(getAllGearCodes).not.toHaveBeenCalled()
    expect(getInfractions).not.toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalledTimes(1)
  })

  it('Should download again the species, then the regulatory zones converted with them, When the species changed', () => {
    refreshChangedReferentials(VERSIONS, { ...VERSIONS, species: 's2' })(dispatch, jest.fn() as any, undefined)

    expect(dispatch).toHaveBeenCalledWith(monitorfishApi.util.invalidateTags([{ type: 'Species' }]))
    expect(getAllSpecies).toHaveBeenCalledWith(true)
    expect(jest.mocked(getAllRegulatoryLayers).mock.calls[0]?.[0]).toEqual({ type: 'TEST/getAllSpecies' })
  })

  it('Should download again the gears, infractions and ports When they changed', () => {
    refreshChangedReferentials(VERSIONS, { ...VERSIONS, gears: 'g2', infractions: 'i2', ports: 'p2' })(
      dispatch,
      jest.fn() as any,
      undefined
    )

    expect(getAllGearCodes).toHaveBeenCalledWith(true)
    expect(getInfractions).toHaveBeenCalledWith(true)
    expect(dispatch).toHaveBeenCalledWith(monitorfishApi.util.invalidateTags([{ type: 'Ports' }]))
    expect(dispatch).toHaveBeenCalledWith(monitorfishPublicApi.util.invalidateTags([{ type: 'Infractions' }]))
    expect(getAllRegulatoryLayers).not.toHaveBeenCalled()
  })
})
