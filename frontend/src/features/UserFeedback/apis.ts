import { monitorfishApi } from '@api/api'
import { FrontendApiError } from '@libs/FrontendApiError'

import type { UserFeedback } from './types'

const SEND_USER_FEEDBACK_ERROR_MESSAGE = "Nous n'avons pas pu envoyer votre message."

export const userFeedbackApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    sendUserFeedback: builder.mutation<void, UserFeedback>({
      // Retrying could post the same message several times in the Tchap room
      extraOptions: { maxRetries: 0 },
      query: userFeedback => ({
        body: userFeedback,
        method: 'POST',
        url: '/user_feedback'
      }),
      transformErrorResponse: response => new FrontendApiError(SEND_USER_FEEDBACK_ERROR_MESSAGE, response)
    })
  })
})

export const { useSendUserFeedbackMutation } = userFeedbackApi
