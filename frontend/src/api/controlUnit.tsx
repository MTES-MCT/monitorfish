import { monitorenvApi } from '.'

// import { getEnvironmentVariable } from './utils'

import type { ControlUnit } from '../domain/types/controlUnit'

// const MONITORENV_URL = getEnvironmentVariable('REACT_APP_MONITORENV_URL')

export const controlUnitApi = monitorenvApi.injectEndpoints({
  endpoints: builder => ({
    getMany: builder.query<ControlUnit[], void>({
      providesTags: () => [{ type: 'ControlUnits' }],
      query: () => `control_units`
    })
  })
})
