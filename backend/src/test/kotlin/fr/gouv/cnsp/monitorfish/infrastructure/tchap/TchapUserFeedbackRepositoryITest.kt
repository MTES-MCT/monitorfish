package fr.gouv.cnsp.monitorfish.infrastructure.tchap

import fr.gouv.cnsp.monitorfish.config.ApiClient
import fr.gouv.cnsp.monitorfish.config.TchapProperties
import fr.gouv.cnsp.monitorfish.domain.entities.user_feedback.UserFeedback
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendInternalException
import io.ktor.client.engine.mock.MockEngine
import io.ktor.client.engine.mock.respond
import io.ktor.client.engine.mock.toByteArray
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.http.HttpStatusCode
import io.ktor.http.headersOf
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test

class TchapUserFeedbackRepositoryITest {
    private val feedback =
        UserFeedback(
            message = "Le <b>filtre</b> ne marche pas\nMerci",
            userEmail = "user@example.com",
            pageUrl = "https://monitorfish.fr/?a=1&b=2",
        )

    private fun getTchapProperties(enabled: Boolean = true) =
        TchapProperties().apply {
            this.enabled = enabled
            homeserverUrl = "https://matrix.example.com"
            accessToken = "secret-token"
            feedbackRoomId = "!room:agent.dinum.tchap.gouv.fr"
        }

    @Test
    fun `send Should put a text message in the feedback room`() {
        // Given
        var requestMethod: HttpMethod? = null
        var requestPath: String? = null
        var authorizationHeader: String? = null
        var requestBody: String? = null
        val mockEngine =
            MockEngine { request ->
                requestMethod = request.method
                requestPath = request.url.encodedPath
                authorizationHeader = request.headers[HttpHeaders.Authorization]
                requestBody = String(request.body.toByteArray())

                respond(
                    content = """{"event_id": "${'$'}event"}""",
                    status = HttpStatusCode.OK,
                    headers = headersOf(HttpHeaders.ContentType, "application/json"),
                )
            }

        // When
        TchapUserFeedbackRepository(getTchapProperties(), ApiClient(mockEngine)).send(feedback)

        // Then
        assertThat(requestMethod).isEqualTo(HttpMethod.Put)
        assertThat(requestPath).startsWith(
            "/_matrix/client/v3/rooms/!room:agent.dinum.tchap.gouv.fr/send/m.room.message/",
        )
        assertThat(authorizationHeader).isEqualTo("Bearer secret-token")

        val body = Json.parseToJsonElement(requestBody!!).jsonObject
        assertThat(body["msgtype"]?.jsonPrimitive?.content).isEqualTo("m.text")
        assertThat(body["format"]?.jsonPrimitive?.content).isEqualTo("org.matrix.custom.html")
        assertThat(body["body"]?.jsonPrimitive?.content).isEqualTo(
            "💬 Retour MonitorFish de user@example.com\n" +
                "Page : https://monitorfish.fr/?a=1&b=2\n\n" +
                "Le <b>filtre</b> ne marche pas\nMerci",
        )
        assertThat(body["formatted_body"]?.jsonPrimitive?.content).isEqualTo(
            "<p>💬 <strong>Retour MonitorFish</strong> de user@example.com<br>" +
                "Page : https://monitorfish.fr/?a=1&amp;b=2<br></p>" +
                "<p>Le &lt;b&gt;filtre&lt;/b&gt; ne marche pas<br>Merci</p>",
        )
    }

    @Test
    fun `send Should not call Tchap When disabled`() {
        // Given
        var hasBeenCalled = false
        val mockEngine =
            MockEngine { _ ->
                hasBeenCalled = true
                respond(content = "{}", status = HttpStatusCode.OK)
            }

        // When
        TchapUserFeedbackRepository(getTchapProperties(enabled = false), ApiClient(mockEngine)).send(feedback)

        // Then
        assertThat(hasBeenCalled).isFalse()
    }

    @Test
    fun `send Should throw When Tchap answers an error`() {
        // Given
        val mockEngine =
            MockEngine { _ ->
                respond(content = """{"errcode": "M_FORBIDDEN"}""", status = HttpStatusCode.Forbidden)
            }

        // When
        val throwable =
            catchThrowable {
                TchapUserFeedbackRepository(getTchapProperties(), ApiClient(mockEngine)).send(feedback)
            }

        // Then
        assertThat(throwable).isInstanceOf(BackendInternalException::class.java)
    }
}
