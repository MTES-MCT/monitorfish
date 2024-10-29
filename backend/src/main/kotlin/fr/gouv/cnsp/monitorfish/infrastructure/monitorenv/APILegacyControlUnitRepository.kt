package fr.gouv.cnsp.monitorfish.infrastructure.monitorenv

import fr.gouv.cnsp.monitorfish.config.ApiClient
import fr.gouv.cnsp.monitorfish.config.MonitorenvProperties
import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.LegacyControlUnit
import fr.gouv.cnsp.monitorfish.domain.repositories.LegacyControlUnitRepository
import io.ktor.client.call.*
import io.ktor.client.request.*
import kotlinx.coroutines.runBlocking
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Repository

@Repository
class APILegacyControlUnitRepository(
    val monitorenvProperties: MonitorenvProperties,
    val apiClient: ApiClient,
) : LegacyControlUnitRepository {
    private val logger: Logger = LoggerFactory.getLogger(APILegacyControlUnitRepository::class.java)

    @Cacheable(value = ["legacy_control_units"])
    override fun findAll(): List<LegacyControlUnit> =
        runBlocking {
            val legacyControlUnitsUrl = "${monitorenvProperties.url}/api/v1/control_units"

            try {
                apiClient.httpClient.get(legacyControlUnitsUrl).body()
            } catch (e: Exception) {
                logger.error("Could not fetch legacy control units at $legacyControlUnitsUrl", e)

                listOf()
            }
        }
}
