package fr.gouv.cnsp.monitorfish.infrastructure.rapportnav

import fr.gouv.cnsp.monitorfish.config.ApiClient
import fr.gouv.cnsp.monitorfish.config.RapportnavProperties
import fr.gouv.cnsp.monitorfish.domain.entities.rapportnav.RapportNavMissionAction
import fr.gouv.cnsp.monitorfish.domain.repositories.RapportNavMissionActionsRepository
import io.ktor.client.call.*
import io.ktor.client.request.*
import kotlinx.coroutines.TimeoutCancellationException
import kotlinx.coroutines.withTimeout
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Repository

@Repository
class APIRapportNavMissionActionsRepository(
    val apiClient: ApiClient,
    val rapportnavProperties: RapportnavProperties,
) : RapportNavMissionActionsRepository {
    private val logger: Logger = LoggerFactory.getLogger(APIRapportNavMissionActionsRepository::class.java)

    override suspend fun findRapportNavMissionActionsById(missionId: Int): RapportNavMissionAction {
        val missionActionsUrl =
            "${rapportnavProperties.url}/api/v1/missions/$missionId"
        logger.info("Fetching RapportNav actions at: $missionActionsUrl")

        return try {
            withTimeout(rapportnavProperties.timeout) {
                try {
                    val rapportNavMissionActions =
                        apiClient
                            .httpClient
                            .get(missionActionsUrl)
                            .body<RapportNavMissionAction>()
                    logger.debug(
                        "Fetched mission has actions and the result is : $rapportNavMissionActions",
                    )

                    return@withTimeout rapportNavMissionActions
                } catch (e: Exception) {
                    logger.error(
                        "Could not fetch mission actions from rapportNav at $missionActionsUrl",
                        e,
                    )

                    RapportNavMissionAction(id = missionId, containsActionsAddedByUnit = false)
                }
            }
        } catch (e: TimeoutCancellationException) {
            logger.error("Timeout while fetching rapportNav $missionActionsUrl", e)

            RapportNavMissionAction(id = missionId, containsActionsAddedByUnit = false)
        }
    }
}
