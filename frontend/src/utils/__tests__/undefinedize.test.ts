import { expect } from '@jest/globals'

import { undefinedize } from '../undefinedize'

describe('utils/undefinedize()', () => {
  const getPojo = (index: number) => ({
    aBoolean: true,
    aNull: null,
    aNumber: index,
    anUndefined: undefined,
    aString: `String ${index}`
  })

  it('should return the expected result with a complex object', () => {
    const value = {
      ...getPojo(1),
      anArray: [getPojo(2), getPojo(3)],
      anObject: getPojo(4)
    }

    const result = undefinedize(value)

    expect(result).toStrictEqual({
      aBoolean: true,
      aNull: undefined,
      aNumber: 1,
      anUndefined: undefined,
      aString: 'String 1',

      // eslint-disable-next-line sort-keys-fix/sort-keys-fix
      anArray: [
        {
          aBoolean: true,
          aNull: undefined,
          aNumber: 2,
          anUndefined: undefined,
          aString: 'String 2'
        },
        {
          aBoolean: true,
          aNull: undefined,
          aNumber: 3,
          anUndefined: undefined,
          aString: 'String 3'
        }
      ],

      anObject: {
        aBoolean: true,
        aNull: undefined,
        aNumber: 4,
        anUndefined: undefined,
        aString: 'String 4'
      }
    })
  })

  it('should return the expected result with a complex array', () => {
    const value = [
      getPojo(1),
      {
        ...getPojo(2),
        anObject: getPojo(3)
      }
    ]

    const result = undefinedize(value)

    expect(result).toStrictEqual([
      {
        aBoolean: true,
        aNull: undefined,
        aNumber: 1,
        anUndefined: undefined,
        aString: 'String 1'
      },
      {
        aBoolean: true,
        aNull: undefined,
        aNumber: 2,
        anUndefined: undefined,
        aString: 'String 2',

        // eslint-disable-next-line sort-keys-fix/sort-keys-fix
        anObject: {
          aBoolean: true,
          aNull: undefined,
          aNumber: 3,
          anUndefined: undefined,
          aString: 'String 3'
        }
      }
    ])
  })

  it('should return the expected result with a geometry object', () => {
    const value = {
      completedBy: null,
      controlUnits: [
        {
          administration: 'DIRM / DM',
          contact: null,
          id: 10121,
          isArchived: false,
          name: 'PAM Jeanne Barret',
          resources: []
        }
      ],
      createdAtUtc: '2024-03-05T09:51:18.379906Z',
      endDateTimeUtc: '2024-04-26T01:53:35.968599Z',
      envActions: [],
      facade: 'SA',
      geom: {
        coordinates: [
          [
            [
              [-4.05440374, 48.76920876],
              [-3.9882835, 48.77112607],
              [-3.99375797, 48.72670474],
              [-4.05440374, 48.76920876]
            ]
          ]
        ],
        type: 'MultiPolygon'
      },
      hasMissionOrder: false,
      id: 22,
      isGeometryComputedFromControls: false,
      isUnderJdp: false,
      missionSource: 'MONITORENV',
      missionTypes: ['LAND'],
      observationsCacem:
        'So maintain focus bag. Benefit put charge shake high national experience music. Surface computer decade happen small.',
      observationsCnsp: null,
      openBy: null,
      startDateTimeUtc: '2023-12-27T02:22:25.968599Z',
      updatedAtUtc: '2024-03-05T09:51:18.379906Z'
    }

    const result = undefinedize(value)

    expect(result).toStrictEqual({
      completedBy: undefined,
      controlUnits: [
        {
          administration: 'DIRM / DM',
          contact: undefined,
          id: 10121,
          isArchived: false,
          name: 'PAM Jeanne Barret',
          resources: []
        }
      ],
      createdAtUtc: '2024-03-05T09:51:18.379906Z',
      endDateTimeUtc: '2024-04-26T01:53:35.968599Z',
      envActions: [],
      facade: 'SA',
      geom: {
        coordinates: [
          [
            [
              [-4.05440374, 48.76920876],
              [-3.9882835, 48.77112607],
              [-3.99375797, 48.72670474],
              [-4.05440374, 48.76920876]
            ]
          ]
        ],
        type: 'MultiPolygon'
      },
      hasMissionOrder: false,
      id: 22,
      isGeometryComputedFromControls: false,
      isUnderJdp: false,
      missionSource: 'MONITORENV',
      missionTypes: ['LAND'],
      observationsCacem:
        'So maintain focus bag. Benefit put charge shake high national experience music. Surface computer decade happen small.',
      observationsCnsp: undefined,
      openBy: undefined,
      startDateTimeUtc: '2023-12-27T02:22:25.968599Z',
      updatedAtUtc: '2024-03-05T09:51:18.379906Z'
    })
  })
})
