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
