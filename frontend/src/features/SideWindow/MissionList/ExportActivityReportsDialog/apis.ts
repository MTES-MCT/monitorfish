import { monitorfishApi } from '../../../../api/api'

import type { ActivityReport } from './types'

export type GetActivityReportsParams = {
  afterDateTime: string
  beforeDateTime: string
  jdp: string
}

export const activityReportApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getActivityReports: builder.query<ActivityReport[], GetActivityReportsParams>({
      query: params =>
        `/mission_actions/controls/activity_reports?beforeDateTime=${params.beforeDateTime}&afterDateTime=${params.afterDateTime}&jdp=${params.jdp}`
    })
  })
})

export const { useGetActivityReportsQuery } = activityReportApi
