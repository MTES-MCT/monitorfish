import { dummyControlUnits } from '@features/Mission/components/MissionForm/MainForm/FormikMultiControlUnitPicker/__tests__/mocks/dummy'
import { expect } from '@jest/globals'
import { getOptionsFromStrings } from '@utils/getOptionsFromStrings'

import { getActiveAndSelectedAdministrationAsOptions, getActiveAndSelectedControlUnits } from '../utils'

describe('features/Mission/components/MissionForm/MainForm/FormikMultiControlUnitPicker/utils()', () => {
  it('getActiveAndSelectedControlUnits() Should include an archived control unit', () => {
    // Given
    const value = {
      administration: 'Gendarmerie Maritime',
      contact: undefined,
      id: 10336,
      isArchived: false,
      name: 'BSL Lorient',
      resources: []
    }

    // When
    const result = getActiveAndSelectedControlUnits(dummyControlUnits, value)

    // Then
    expect(result).toHaveLength(10)
    expect(result[0]?.name).toEqual('BSL Lorient')
  })

  it('getActiveAndSelectedControlUnits() Should include a control unit not found in the control unit list', () => {
    // Given
    const value = {
      administration: 'Not Found',
      contact: undefined,
      id: 10336,
      isArchived: false,
      name: 'Not Found Unit',
      resources: []
    }

    // When
    const result = getActiveAndSelectedControlUnits(dummyControlUnits, value)

    // Then
    expect(result).toHaveLength(11)
    expect(result[result.length - 1]?.name).toEqual('Not Found Unit')
  })

  it('getActiveAndSelectedAdministrationAsOptions() Should include an administration not found in the list', () => {
    // Given
    const administrations = dummyControlUnits.map(unit => unit.administration)
    const value = {
      administration: 'Not Found Admin.',
      contact: undefined,
      id: 10336,
      isArchived: false,
      name: 'Not Found Unit',
      resources: []
    }

    // When
    const result = getActiveAndSelectedAdministrationAsOptions(getOptionsFromStrings(administrations), value)

    // Then
    expect(result).toHaveLength(15)
    expect(result[result.length - 1]?.value).toEqual('Not Found Admin.')
  })
})
