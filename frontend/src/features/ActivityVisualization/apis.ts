import { monitorfishApi } from '@api/api'

export const activityVisualizationApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getActivityVisualization: builder.query<string, void>({
      query: () => ({
        method: 'GET',
        responseHandler: 'text',
        url: `activity_visualization`
      })
    })
  })
})

export const { useGetActivityVisualizationQuery } = activityVisualizationApi
