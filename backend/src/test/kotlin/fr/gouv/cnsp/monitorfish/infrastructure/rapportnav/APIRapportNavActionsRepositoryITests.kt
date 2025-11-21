package fr.gouv.cnsp.monitorfish.infrastructure.rapportnav

import fr.gouv.cnsp.monitorfish.config.ApiClient
import fr.gouv.cnsp.monitorfish.config.RapportnavProperties
import io.ktor.client.engine.mock.*
import io.ktor.http.*
import io.ktor.utils.io.*
import kotlinx.coroutines.runBlocking
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class APIRapportNavActionsRepositoryITests {
    @Test
    fun `findRapportNavMissionActionsById Should return an object with mission id and a boolean to true if actions have been added by controlUnit`() {
        runBlocking {
            val mockEngine =
                MockEngine { _ ->
                    respond(
                        content =
                            ByteReadChannel(
                                """
                            {
                                "id": 1,
                                "containsActionsAddedByUnit": true
                            }
                        """,
                            ),
                        status = HttpStatusCode.OK,
                        headers = headersOf(HttpHeaders.ContentType, "application/json"),
                    )
                }
            val apiClient = ApiClient(mockEngine)
            val rapportnavProperties = RapportnavProperties()
            rapportnavProperties.url = "http://test"

            // When
            val missionActions =
                APIRapportNavMissionActionsRepository(apiClient, rapportnavProperties)
                    .findRapportNavMissionActionsById(1)
            assertThat(missionActions.containsActionsAddedByUnit).isTrue()
        }
    }

    @Test
    fun `findRapportNavMissionActionsById Should return an object with mission id and a boolean to false if actions have been added by controlUnit`() {
        runBlocking {
            val mockEngine =
                MockEngine { _ ->
                    respond(
                        content =
                            ByteReadChannel(
                                """
                            {
                                "id": 1,
                                "containsActionsAddedByUnit": false
                            }
                        """,
                            ),
                        status = HttpStatusCode.OK,
                        headers = headersOf(HttpHeaders.ContentType, "application/json"),
                    )
                }
            val apiClient = ApiClient(mockEngine)
            val rapportnavProperties = RapportnavProperties()
            rapportnavProperties.url = "http://test"

            // When
            val missionActions =
                APIRapportNavMissionActionsRepository(apiClient, rapportnavProperties)
                    .findRapportNavMissionActionsById(1)
            assertThat(missionActions.containsActionsAddedByUnit).isFalse()
        }
    }

    @Test
    fun `findRapportNavMissionActionsById should return negative object after X ms when rapportNav doesnt answer`() {
        runBlocking {
            val mockEngine =
                MockEngine { _ ->
                    Thread.sleep(5000)
                    respond(
                        content =
                            ByteReadChannel(
                                """
                            {
                                "id": 1,
                                "containsActionsAddedByUnit": false
                            }
                        """,
                            ),
                        status = HttpStatusCode.OK,
                        headers = headersOf(HttpHeaders.ContentType, "application/json"),
                    )
                }
            val apiClient = ApiClient(mockEngine)
            val rapportnavProperties = RapportnavProperties()
            rapportnavProperties.url = "http://test"
            rapportnavProperties.timeout = 200

            // When
            val missionActions =
                APIRapportNavMissionActionsRepository(apiClient, rapportnavProperties)
                    .findRapportNavMissionActionsById(1)
            assertThat(missionActions.containsActionsAddedByUnit).isFalse()
        }
    }
}
