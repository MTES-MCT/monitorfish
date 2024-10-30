package fr.gouv.cnsp.monitorfish.infrastructure.monitorenv

import com.github.benmanes.caffeine.cache.Caffeine
import fr.gouv.cnsp.monitorfish.config.ApiClient
import fr.gouv.cnsp.monitorfish.config.MonitorenvProperties
import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.LegacyControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.mission.Mission
import fr.gouv.cnsp.monitorfish.domain.exceptions.CouldNotFindException
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionRepository
import fr.gouv.cnsp.monitorfish.infrastructure.monitorenv.responses.MissionDataResponse
import io.ktor.client.call.*
import io.ktor.client.request.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Deferred
import kotlinx.coroutines.async
import kotlinx.coroutines.runBlocking
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Repository
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter
import java.util.concurrent.TimeUnit

@Repository
class APIMissionRepository(
    val monitorenvProperties: MonitorenvProperties,
    val apiClient: ApiClient,
) : MissionRepository {
    private val logger: Logger = LoggerFactory.getLogger(APIMissionRepository::class.java)
    private val zoneDateTimeFormatter: DateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.000X")

    private val cache =
        Caffeine.newBuilder()
            .maximumSize(500)
            .expireAfterWrite(1, TimeUnit.DAYS)
            .build<String, List<LegacyControlUnit>>()

    override fun findControlUnitsOfMission(
        scope: CoroutineScope,
        missionId: Int,
    ): Deferred<List<LegacyControlUnit>> {
        val cacheKey = "control_units_$missionId"
        val cachedControlUnits = cache.getIfPresent(cacheKey)

        cachedControlUnits?.let { return@findControlUnitsOfMission scope.async { it } }

        return scope.async {
            val missionsUrl = "${monitorenvProperties.url}/api/v1/missions/$missionId"

            try {
                val controlUnits =
                    apiClient.httpClient.get(missionsUrl)
                        .body<MissionDataResponse>().controlUnits.map { it.toLegacyControlUnit() }

                cache.put(cacheKey, controlUnits)

                return@async controlUnits
            } catch (e: Exception) {
                logger.error("Could not fetch control units for mission $missionId at $missionsUrl", e)

                listOf()
            }
        }
    }

    override fun findAllMissions(
        pageNumber: Int?,
        pageSize: Int?,
        startedAfterDateTime: ZonedDateTime?,
        startedBeforeDateTime: ZonedDateTime?,
        missionSources: List<String>?,
        missionTypes: List<String>?,
        missionStatuses: List<String>?,
        seaFronts: List<String>?,
    ): List<Mission> {
        // For these parameters, if the list is null or empty, we don't send the param to the server to avoid filtering results
        val missionTypesParameter =
            if (!missionTypes.isNullOrEmpty()) {
                "missionTypes=${
                    missionTypes.joinToString(
                        ",",
                    )
                }&"
            } else {
                ""
            }
        val missionStatusesParameter =
            if (!missionStatuses.isNullOrEmpty()) {
                "missionStatus=${
                    missionStatuses.joinToString(
                        ",",
                    )
                }&"
            } else {
                ""
            }
        val seaFrontsParameter = if (!seaFronts.isNullOrEmpty()) "seaFronts=${seaFronts.joinToString(",")}&" else ""
        val missionSourcesParameter =
            if (!missionSources.isNullOrEmpty()) {
                "missionSource=${
                    missionSources.joinToString(
                        ",",
                    )
                }&"
            } else {
                ""
            }

        val missionsUrl =
            """
            ${monitorenvProperties.url}/api/v1/missions?
                pageNumber=${pageNumber ?: ""}&
                pageSize=${pageSize ?: ""}&
                startedAfterDateTime=${startedAfterDateTime?.format(zoneDateTimeFormatter) ?: ""}&
                startedBeforeDateTime=${startedBeforeDateTime?.format(zoneDateTimeFormatter) ?: ""}&
                $missionSourcesParameter
                $missionTypesParameter
                $missionStatusesParameter
                $seaFrontsParameter
            """.trimIndent()

        logger.info("Fetching missions at URL: $missionsUrl")
        return runBlocking {
            try {
                val missions = apiClient.httpClient.get(missionsUrl).body<List<MissionDataResponse>>()
                logger.info("Fetched ${missions.size}.")

                return@runBlocking missions.map { it.toMission() }
            } catch (e: Exception) {
                logger.error("Could not fetch missions at $missionsUrl", e)

                return@runBlocking listOf()
            }
        }
    }

    override fun findByIds(ids: List<Int>): List<Mission> {
        val idsParameter = ids.joinToString(",")

        val missionsUrl = "${monitorenvProperties.url}/api/v1/missions/find?ids=$idsParameter"

        logger.info("Fetching missions at URL: $missionsUrl")
        return runBlocking {
            try {
                val missions = apiClient.httpClient.get(missionsUrl).body<List<MissionDataResponse>>()
                logger.info("Fetched ${missions.size}.")

                return@runBlocking missions.map { it.toMission() }
            } catch (e: Exception) {
                logger.error("Could not fetch missions at $missionsUrl", e)

                return@runBlocking listOf()
            }
        }
    }

    override fun findById(id: Int): Mission {
        val missionUrl = "${monitorenvProperties.url}/api/v1/missions/$id"

        logger.info("Fetching mission at URL: $missionUrl")
        return runBlocking {
            try {
                val mission = apiClient.httpClient.get(missionUrl).body<MissionDataResponse>()

                return@runBlocking mission.toFullMission()
            } catch (e: Exception) {
                throw CouldNotFindException("Could not fetch missions at $missionUrl", e)
            }
        }
    }
}
