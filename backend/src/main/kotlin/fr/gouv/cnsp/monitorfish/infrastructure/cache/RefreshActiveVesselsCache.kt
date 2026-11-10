package fr.gouv.cnsp.monitorfish.infrastructure.cache

import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.GetActiveVesselsWithoutVesselGroups
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component

/**
 * Refreshes the active vessels ahead, so that the users' polls never wait for their computation
 * (seconds with the production volumes, as the queries' caches expire after 1 minute).
 */
@Component
class RefreshActiveVesselsCache(
    private val getActiveVesselsWithoutVesselGroups: GetActiveVesselsWithoutVesselGroups,
) {
    @Scheduled(fixedDelay = 30_000, initialDelay = 0)
    fun execute() {
        getActiveVesselsWithoutVesselGroups.refresh()
    }
}
