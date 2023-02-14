package fr.gouv.cnsp.monitorfish.infrastructure.monitorenv

import fr.gouv.cnsp.monitorfish.config.ApiClient
import fr.gouv.cnsp.monitorfish.config.MonitorenvProperties
import fr.gouv.cnsp.monitorfish.domain.entities.mission.ControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.mission.Mission
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionRepository
import io.ktor.client.call.*
import io.ktor.client.request.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Deferred
import kotlinx.coroutines.async
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Repository

@Repository
class APIMissionRepository(
    val monitorenvProperties: MonitorenvProperties,
    val apiClient: ApiClient,
) : MissionRepository {
    private val logger: Logger = LoggerFactory.getLogger(APIMissionRepository::class.java)

    @Cacheable(value = ["missions"])
    override fun findControlUnitsOfMission(scope: CoroutineScope, missionId: Int): Deferred<List<ControlUnit>> {
        return scope.async {
            val missionsUrl = "${monitorenvProperties.url}/api/v1/missions/$missionId"

            try {
                apiClient.httpClient.get(missionsUrl).body<Mission>().controlUnits
            } catch (e: Exception) {
                logger.error("Could not fetch control units for mission $missionId at $missionsUrl", e)

                listOf()
            }
        }
    }
}
