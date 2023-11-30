import { describe, expect, it } from '@jest/globals'
import { ControlUnit } from '@mtes-mct/monitor-ui'

import { displayControlUnitResourcesFromControlUnit } from '../utils'

describe('features/ControlUnit/components/ControlUnitListDialog/utils > displayControlUnitResourcesFromControlUnit()', () => {
  it('should return formatted resource string for multiple resources', () => {
    const controlUnit = {
      controlUnitResources: [
        { isArchived: false, type: ControlUnit.ControlUnitResourceType.CAR },
        { isArchived: false, type: ControlUnit.ControlUnitResourceType.CAR },
        { isArchived: false, type: ControlUnit.ControlUnitResourceType.DRONE }
      ]
    } as unknown as ControlUnit.ControlUnit

    const result = displayControlUnitResourcesFromControlUnit(controlUnit)

    expect(result).toEqual('2 Voitures, 1 Drône')
  })

  it('should handle empty resource list', () => {
    const controlUnit = {
      controlUnitResources: []
    } as unknown as ControlUnit.ControlUnit

    const result = displayControlUnitResourcesFromControlUnit(controlUnit)

    expect(result).toEqual('Aucun moyen')
  })

  it('should not count archived resources', () => {
    const controlUnit = {
      controlUnitResources: [
        { isArchived: true, type: ControlUnit.ControlUnitResourceType.CAR },
        { isArchived: false, type: ControlUnit.ControlUnitResourceType.DRONE }
      ]
    } as unknown as ControlUnit.ControlUnit

    const result = displayControlUnitResourcesFromControlUnit(controlUnit)
    expect(result).toEqual('1 Drône')
  })
})
