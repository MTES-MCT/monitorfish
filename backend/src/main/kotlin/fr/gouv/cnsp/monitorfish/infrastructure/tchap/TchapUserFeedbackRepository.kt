package fr.gouv.cnsp.monitorfish.infrastructure.tchap

import fr.gouv.cnsp.monitorfish.config.ApiClient
import fr.gouv.cnsp.monitorfish.config.TchapProperties
import fr.gouv.cnsp.monitorfish.domain.entities.user_feedback.UserFeedback
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendInternalException
import fr.gouv.cnsp.monitorfish.domain.repositories.UserFeedbackRepository
import fr.gouv.cnsp.monitorfish.infrastructure.tchap.requests.MatrixImageInfo
import fr.gouv.cnsp.monitorfish.infrastructure.tchap.requests.MatrixImageMessageRequest
import fr.gouv.cnsp.monitorfish.infrastructure.tchap.requests.MatrixTextMessageRequest
import fr.gouv.cnsp.monitorfish.infrastructure.tchap.responses.MatrixUploadResponse
import io.ktor.client.call.body
import io.ktor.client.request.bearerAuth
import io.ktor.client.request.parameter
import io.ktor.client.request.post
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

        val sendUrl = "$homeserverUrl/_matrix/client/v3/rooms/${roomId.encodeURLPathPart()}/send/m.room.message"

        try {
            runBlocking {
                // Uploaded before posting anything, so that a rejected file does not leave a lone text message
                val imageMessages =
                    feedback.attachments.map { attachment ->
                        val upload =
                            apiClient.httpClient
                                .post("$homeserverUrl/_matrix/media/v3/upload") {
                                    bearerAuth(accessToken)
                                    parameter("filename", attachment.fileName)
                                    contentType(ContentType.parse(attachment.mimeType))
                                    setBody(attachment.content)
                                }.body<MatrixUploadResponse>()

                        MatrixImageMessageRequest(
                            msgtype = "m.image",
                            body = attachment.fileName,
                            url = upload.contentUri,
                            info = MatrixImageInfo(mimetype = attachment.mimeType, size = attachment.content.size),
                        )
                    }

                apiClient.httpClient.put("$sendUrl/${UUID.randomUUID()}") {
                    bearerAuth(accessToken)
                    contentType(ContentType.Application.Json)
                    setBody(toMatrixMessage(feedback))
                }

                imageMessages.forEach { imageMessage ->
                    apiClient.httpClient.put("$sendUrl/${UUID.randomUUID()}") {
                        bearerAuth(accessToken)
                        contentType(ContentType.Application.Json)
                        setBody(imageMessage)
                    }
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
