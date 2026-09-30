package fr.gouv.cnsp.monitorfish.infrastructure.tchap

import fr.gouv.cnsp.monitorfish.config.ApiClient
import fr.gouv.cnsp.monitorfish.config.TchapProperties
import fr.gouv.cnsp.monitorfish.domain.entities.user_feedback.UserFeedback
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendInternalException
import fr.gouv.cnsp.monitorfish.domain.repositories.UserFeedbackRepository
import fr.gouv.cnsp.monitorfish.infrastructure.tchap.requests.MatrixTextMessageRequest
import io.ktor.client.request.bearerAuth
import io.ktor.client.request.put
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.contentType
import io.ktor.http.encodeURLPathPart
import kotlinx.coroutines.runBlocking
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Repository
import java.util.UUID

/**
 * Posts feedbacks to a Tchap room through a custom bot account.
 *
 * The room must be unencrypted: messages are sent in clear, as documented in
 * https://doc.incubateur.net/communaute/les-outils-de-la-communaute/tchap#bots-customs
 */
@Repository
class TchapUserFeedbackRepository(
    private val tchapProperties: TchapProperties,
    private val apiClient: ApiClient,
) : UserFeedbackRepository {
    private val logger: Logger = LoggerFactory.getLogger(TchapUserFeedbackRepository::class.java)

    override fun send(feedback: UserFeedback) {
        val homeserverUrl = tchapProperties.homeserverUrl
        val accessToken = tchapProperties.accessToken
        val roomId = tchapProperties.feedbackRoomId
        if (!tchapProperties.enabled ||
            homeserverUrl.isNullOrBlank() ||
            accessToken.isNullOrBlank() ||
            roomId.isNullOrBlank()
        ) {
            logger.warn("Tchap is disabled or not configured: the user feedback was not sent.")

            return
        }

        val url =
            "$homeserverUrl/_matrix/client/v3/rooms/${roomId.encodeURLPathPart()}/send/m.room.message/${UUID.randomUUID()}"

        try {
            runBlocking {
                apiClient.httpClient.put(url) {
                    bearerAuth(accessToken)
                    contentType(ContentType.Application.Json)
                    setBody(toMatrixMessage(feedback))
                }
            }
        } catch (e: Exception) {
            throw BackendInternalException("Could not send the user feedback to Tchap.", e)
        }
    }

    private fun toMatrixMessage(feedback: UserFeedback): MatrixTextMessageRequest {
        val author = feedback.userEmail.ifBlank { "un utilisateur anonyme" }
        val page = feedback.pageUrl?.let { "Page : $it\n" } ?: ""
        val htmlPage = feedback.pageUrl?.let { "Page : ${escapeHtml(it)}<br>" } ?: ""

        return MatrixTextMessageRequest(
            msgtype = "m.text",
            format = "org.matrix.custom.html",
            body = "💬 Retour MonitorFish de $author\n$page\n${feedback.message}",
            formattedBody =
                "<p>💬 <strong>Retour MonitorFish</strong> de ${escapeHtml(author)}<br>$htmlPage</p>" +
                    "<p>${escapeHtml(feedback.message).replace("\n", "<br>")}</p>",
        )
    }

    private fun escapeHtml(value: String): String =
        value
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#39;")
}
