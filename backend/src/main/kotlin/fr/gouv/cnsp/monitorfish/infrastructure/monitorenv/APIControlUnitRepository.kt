package fr.gouv.cnsp.monitorfish.infrastructure.monitorenv

import fr.gouv.cnsp.monitorfish.config.ApiClient
import fr.gouv.cnsp.monitorfish.config.MonitorenvProperties
import fr.gouv.cnsp.monitorfish.domain.entities.mission.ControlUnit
import fr.gouv.cnsp.monitorfish.domain.repositories.ControlUnitRepository
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
class APIControlUnitRepository(
    val monitorenvProperties: MonitorenvProperties,
    val apiClient: ApiClient,
) : ControlUnitRepository {
    private val logger: Logger = LoggerFactory.getLogger(APIControlUnitRepository::class.java)

    @Cacheable(value = ["control_units"])
    override fun findAll(scope: CoroutineScope): Deferred<List<ControlUnit>> {
        return scope.async {
            val missionsUrl = "${monitorenvProperties.url}/api/v1/control_units"

            try {
                apiClient.httpClient.get(missionsUrl).body()
            } catch (e: Exception) {
                logger.error("Could not fetch control units at $missionsUrl", e)

                listOf()
            }
        }
    }
}
