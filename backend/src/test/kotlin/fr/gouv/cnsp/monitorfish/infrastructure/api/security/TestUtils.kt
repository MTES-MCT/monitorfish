package fr.gouv.cnsp.monitorfish.infrastructure.api.security

import fr.gouv.cnsp.monitorfish.config.ApiClient
import io.ktor.client.engine.mock.*
import io.ktor.http.*
import io.ktor.utils.io.*

class TestUtils {
    companion object {
        fun mockApiClient(): ApiClient {
            val mockEngine = MockEngine { _ ->
                respond(
                    content = ByteReadChannel(
                        """{
                      "email": "email@domain-name.com"
                    }""",
                    ),
                    status = HttpStatusCode.OK,
                    headers = headersOf(HttpHeaders.ContentType, "application/json"),
                )
            }

            return ApiClient(mockEngine)
        }
    }
}
