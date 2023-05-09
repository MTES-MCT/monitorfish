package fr.gouv.cnsp.monitorfish.infrastructure.monitorenv

import fr.gouv.cnsp.monitorfish.config.ApiClient
import fr.gouv.cnsp.monitorfish.config.MonitorenvProperties
import fr.gouv.cnsp.monitorfish.domain.entities.mission.MissionNature
import fr.gouv.cnsp.monitorfish.domain.entities.mission.MissionType
import fr.gouv.cnsp.monitorfish.infrastructure.monitorenv.TestUtils.Companion.getDummyMissions
import io.ktor.client.engine.mock.*
import io.ktor.http.*
import io.ktor.utils.io.*
import kotlinx.coroutines.runBlocking
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.ZoneOffset
import java.time.ZonedDateTime

class APIMissionRepositoryITest {

    @Test
    fun `findControlUnitsByMissionId Should return the mission`() {
        runBlocking {
            // Given
            val mockEngine = MockEngine { _ ->
                respond(
                    content = ByteReadChannel(
                        """{
                      "id": 34,
                      "missionTypes": ["SEA"],
                      "missionNature": ["OTHER"],
                      "controlUnits": [
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
                      ],
                      "openBy": "Steve Snyder",
                      "closedBy": "Jacob Martin",
                      "observationsCacem": "Surface different shoulder interview. Job together area probably. Of alone class capital determine machine always.",
                      "observationsCnsp": null,
                      "facade": "MEMN",
                      "geom": {
                        "type": "MultiPolygon",
                        "coordinates": [
                          [
                            [
                              [-0.63780295, 49.47775876],
                              [-0.62730058, 49.35133213],
                              [-0.40769229, 49.34599875],
                              [-0.22179846, 49.2940188],
                              [0.00683004, 49.33779656],
                              [0.07874359, 49.46756946],
                              [-0.22010001, 49.60456891],
                              [-0.54074987, 49.63043863],
                              [-0.63780295, 49.47775876]
                            ]
                          ]
                        ]
                      },
                      "startDateTimeUtc": "2023-03-02T09:30:55.923703Z",
                      "endDateTimeUtc": null,
                      "envActions": [
                        {
                          "actionType": "SURVEILLANCE",
                          "id": "88713755-3966-4ca4-ae18-10cab6249485",
                          "actionStartDateTimeUtc": "2022-11-28T13:59:20.176Z",
                          "geom": null,
                          "actionTheme": "Police des activités de cultures marines",
                          "actionSubTheme": "Contrôle du schéma des structures",
                          "protectedSpecies": [],
                          "duration": 1,
                          "observations": "Surveillance ok",
                          "coverMissionZone": true
                        },
                        {
                          "actionType": "CONTROL",
                          "id": "b05d96b8-387f-4599-bff0-cd7dab71dfb8",
                          "actionStartDateTimeUtc": "2022-11-17T13:59:51.108Z",
                          "geom": {
                            "type": "MultiPoint",
                            "coordinates": [[-0.56798364, 49.45398316]]
                          },
                          "actionTheme": "Activités et manifestations soumises à évaluation d’incidence Natura 2000",
                          "actionSubTheme": "Contrôle administratif",
                          "protectedSpecies": [],
                          "actionNumberOfControls": 1,
                          "actionTargetType": "VEHICLE",
                          "vehicleType": "VESSEL",
                          "infractions": [
                            {
                              "id": "c52c6f20-e495-4b29-b3df-d7edfb67fdd7",
                              "natinf": ["10038", "10054"],
                              "observations": "Pas d'observations",
                              "registrationNumber": "BALTIK",
                              "companyName": null,
                              "relevantCourt": "LOCAL_COURT",
                              "infractionType": "WITH_REPORT",
                              "formalNotice": "PENDING",
                              "toProcess": false,
                              "controlledPersonIdentity": "John Doe",
                              "vesselType": "COMMERCIAL",
                              "vesselSize": "FROM_24_TO_46m"
                            }
                          ]
                        }
                      ],
                      "missionSource": "MONITORENV",
                      "isClosed": false,
                      "isUnderJdp": false
                    }""",
                    ),
                    status = HttpStatusCode.OK,
                    headers = headersOf(HttpHeaders.ContentType, "application/json"),
                )
            }
            val apiClient = ApiClient(mockEngine)
            val monitorenvProperties = MonitorenvProperties()
            monitorenvProperties.url = "http://test"

            // When
            val controlUnits = APIMissionRepository(monitorenvProperties, apiClient)
                .findControlUnitsOfMission(this, 1).await()

            // Then
            assertThat(controlUnits).hasSize(3)
            assertThat(controlUnits.first().id).isEqualTo(10016)
            assertThat(controlUnits.first().administration).isEqualTo("Douane")
            assertThat(controlUnits.first().name).isEqualTo("BSN Ste Maxime")
            assertThat(controlUnits.first().resources).hasSize(0)
            assertThat(controlUnits.first().contact).isNull()
        }
    }

    @Test
    fun `findControlUnitsByMissionId Should not thrown an exception When the request fail`() {
        runBlocking {
            // Given
            val mockEngine = MockEngine { _ ->
                respond(
                    content = "NOT FOUND",
                    status = HttpStatusCode.NotFound,
                )
            }
            val apiClient = ApiClient(mockEngine)
            val monitorenvProperties = MonitorenvProperties()
            monitorenvProperties.url = "http://test"

            // When
            val controlUnits = APIMissionRepository(monitorenvProperties, apiClient)
                .findControlUnitsOfMission(this, 1).await()

            // Then
            assertThat(controlUnits).hasSize(0)
        }
    }

    @Test
    fun `findMissions Should return the missions`() {
        runBlocking {
            // Given
            val mockEngine = MockEngine { _ ->
                respond(
                    content = ByteReadChannel(getDummyMissions()),
                    status = HttpStatusCode.OK,
                    headers = headersOf(HttpHeaders.ContentType, "application/json"),
                )
            }
            val apiClient = ApiClient(mockEngine)
            val monitorenvProperties = MonitorenvProperties()
            monitorenvProperties.url = "http://test"

            // When
            val missions = APIMissionRepository(monitorenvProperties, apiClient)
                .findAllMissions(
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                )

            // Then
            assertThat(missions).hasSize(12)
            assertThat(mockEngine.requestHistory.first().url.toString())
                .isEqualTo(
                    "http://test/api/v1/missions?pageNumber=&pageSize=&startedAfterDateTime=&startedBeforeDateTime=",
                )
        }
    }

    @Test
    fun `findMissions Should return the missions When some parameters are given`() {
        runBlocking {
            // Given
            val mockEngine = MockEngine { _ ->
                respond(
                    content = ByteReadChannel(getDummyMissions()),
                    status = HttpStatusCode.OK,
                    headers = headersOf(HttpHeaders.ContentType, "application/json"),
                )
            }
            val apiClient = ApiClient(mockEngine)
            val monitorenvProperties = MonitorenvProperties()
            monitorenvProperties.url = "http://test"

            // When
            val missions = APIMissionRepository(monitorenvProperties, apiClient)
                .findAllMissions(
                    1,
                    2,
                    ZonedDateTime.of(2021, 5, 5, 3, 4, 5, 3, ZoneOffset.UTC),
                    ZonedDateTime.of(2022, 5, 5, 3, 4, 5, 3, ZoneOffset.UTC),
                    listOf("MONITORFISH"),
                    listOf(MissionNature.FISH.toString()),
                    listOf(MissionType.SEA.toString(), MissionType.LAND.toString()),
                    listOf(),
                    listOf("MED"),
                )

            // Then
            assertThat(missions).hasSize(12)
            assertThat(mockEngine.requestHistory.first().url.toString())
                .isEqualTo(
                    """
                    http://test/api/v1/missions?
                    pageNumber=1&
                    pageSize=2&
                    startedAfterDateTime=2021-05-05T03:04:05.000Z&
                    startedBeforeDateTime=2022-05-05T03:04:05.000Z&
                    missionSource=MONITORFISH&
                    missionNature=FISH&
                    missionTypes=SEA,LAND&
                    seaFronts=MED
                """.trim().replace("\\s+".toRegex(), ""),
                )
        }
    }
}
