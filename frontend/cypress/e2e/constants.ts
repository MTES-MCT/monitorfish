import { type Administration } from '@mtes-mct/monitor-ui'

export const FAKE_API_POST_RESPONSE = {
  body: {},
  statusCode: 201
}

export const FAKE_API_PUT_RESPONSE = {
  body: {},
  statusCode: 200
}

export const FAKE_MISSION_WITH_EXTERNAL_ACTIONS = {
  body: { canDelete: false, sources: ['MONITORENV'] },
  statusCode: 200
}

export const FAKE_MISSION_WITHOUT_EXTERNAL_ACTIONS = {
  body: { canDelete: true, sources: [] },
  statusCode: 200
}

export const FAKE_ADMINISTRATIONS: Administration.Administration[] = [
  {
    controlUnitIds: [1],
    controlUnits: [
      {
        administrationId: 101,
        areaNote: undefined,
        departmentAreaInseeCode: undefined,
        id: 1,
        isArchived: false,
        name: 'Unité 1',
        termsNote: undefined
      }
    ],
    id: 101,
    isArchived: false,
    name: 'Administration 1'
  },
  {
    controlUnitIds: [],
    controlUnits: [],
    id: 102,
    isArchived: false,
    name: 'Administration 2'
  },
  {
    controlUnitIds: [],
    controlUnits: [],
    id: 103,
    isArchived: false,
    name: 'Administration 3'
  }
]
