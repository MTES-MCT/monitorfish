package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.user_feedback.UserFeedback

interface UserFeedbackRepository {
    fun send(feedback: UserFeedback)
}
