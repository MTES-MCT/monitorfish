package fr.gouv.cnsp.monitorfish.infrastructure.monitorenv

import fr.gouv.cnsp.monitorfish.config.ApiClient
import fr.gouv.cnsp.monitorfish.config.MonitorenvProperties
import io.ktor.client.engine.mock.*
import io.ktor.http.*
import io.ktor.utils.io.*
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class APIControlUnitRepositoryITests {
    @Test
    fun `findAll Should return control units`() {
        // Given
        val mockEngine =
            MockEngine { _ ->
                respond(
                    content =
                        ByteReadChannel(
                            """[
                        {
                          "id": 10016,
                          "administration": "Douane",
                          "isArchived": false,
                          "name": "BSN Ste Maxime",
                          "resources": [],
                          "contact": null
                        },
                        {
                          "id": 10017,
                          "administration": "Douane",
                          "isArchived": false,
                          "name": "DF 25 Libecciu",
                          "resources": [],
                          "contact": null
                        },
                        {
                          "id": 10018,
                          "administration": "Douane",
                          "isArchived": false,
                          "name": "DF 61 Port-de-Bouc",
                          "resources": [],
                          "contact": null
                        }
                      ]""",
                        ),
                    status = HttpStatusCode.OK,
                    headers = headersOf(HttpHeaders.ContentType, "application/json"),
                )
            }
        val apiClient = ApiClient(mockEngine)
        val monitorenvProperties = MonitorenvProperties()
        monitorenvProperties.url = "http://test"

        // When
        val controlUnits =
            APIControlUnitRepository(monitorenvProperties, apiClient)
                .findAll()

        assertThat(controlUnits).hasSize(3)
        assertThat(controlUnits.first().id).isEqualTo(10016)
    }
}
