package fr.gouv.cnsp.monitorfish.infrastructure.monitorenv

import fr.gouv.cnsp.monitorfish.config.ApiClient
import fr.gouv.cnsp.monitorfish.config.MonitorenvProperties
import fr.gouv.cnsp.monitorfish.domain.entities.mission.ControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.mission.Mission
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionRepository
import fr.gouv.cnsp.monitorfish.infrastructure.monitorenv.input.MissionDataResponse
import io.ktor.client.call.*
import io.ktor.client.request.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Deferred
import kotlinx.coroutines.async
import kotlinx.coroutines.runBlocking
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Repository
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter

@Repository
class APIMissionRepository(
    val monitorenvProperties: MonitorenvProperties,
    val apiClient: ApiClient,
) : MissionRepository {
    private val logger: Logger = LoggerFactory.getLogger(APIMissionRepository::class.java)
    private val zoneDateTimeFormatter: DateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.000X")

    @Cacheable(value = ["mission_control_units"])
    override fun findControlUnitsOfMission(scope: CoroutineScope, missionId: Int): Deferred<List<ControlUnit>> {
        return scope.async {
            val missionsUrl = "${monitorenvProperties.url}/api/v1/missions/$missionId"

            try {
                apiClient.httpClient.get(missionsUrl).body<MissionDataResponse>().controlUnits
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
        missionNatures: List<String>?,
        missionTypes: List<String>?,
        missionStatuses: List<String>?,
        seaFronts: List<String>?,
    ): List<Mission> {
        val missionsUrl = """
            ${monitorenvProperties.url}/api/v1/missions?
                pageNumber=${pageNumber ?: ""}&
                pageSize=${pageSize ?: ""}&
                startedAfterDateTime=${startedAfterDateTime?.format(zoneDateTimeFormatter) ?: ""}&
                startedBeforeDateTime=${startedBeforeDateTime?.format(zoneDateTimeFormatter) ?: ""}&
                missionNature=${missionNatures?.joinToString(",") ?: ""}&
                missionTypes=${missionTypes?.joinToString(",") ?: ""}&
                missionStatus=${missionStatuses?.joinToString(",") ?: ""}&
                seaFronts=${seaFronts?.joinToString(",") ?: ""}
        """.trimIndent()

        return runBlocking {
            try {
                val missions = apiClient.httpClient.get(missionsUrl).body<List<MissionDataResponse>>()

                return@runBlocking missions.map { it.toMission() }
            } catch (e: Exception) {
                logger.error("Could not fetch missions at $missionsUrl", e)

                return@runBlocking listOf()
            }
        }
    }
}
