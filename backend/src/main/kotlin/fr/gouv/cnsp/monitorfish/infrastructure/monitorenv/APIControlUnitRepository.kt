package fr.gouv.cnsp.monitorfish.infrastructure.monitorenv

import fr.gouv.cnsp.monitorfish.config.ApiClient
import fr.gouv.cnsp.monitorfish.config.MonitorenvProperties
import fr.gouv.cnsp.monitorfish.domain.repositories.ControlUnitRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.dtos.FullControlUnit
import fr.gouv.cnsp.monitorfish.infrastructure.monitorenv.responses.FullControlUnitDataResponse
import io.ktor.client.call.*
import io.ktor.client.request.*
import kotlinx.coroutines.runBlocking
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
    override fun findAll(): List<FullControlUnit> =
        runBlocking {
            val controlUnitsUrl = "${monitorenvProperties.url}/api/v2/control_units"

            try {
                apiClient.httpClient.get(controlUnitsUrl).body<List<FullControlUnitDataResponse>>()
                    .map { it.toFullControlUnit() }
            } catch (e: Exception) {
                logger.error("Could not fetch control units at $controlUnitsUrl", e)

                listOf()
            }
        }
}
