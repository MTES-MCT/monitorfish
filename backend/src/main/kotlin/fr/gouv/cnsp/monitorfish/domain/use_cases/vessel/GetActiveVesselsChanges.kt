package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.ActiveVesselsChanges

@UseCase
class GetActiveVesselsChanges(
    private val getActiveVesselsWithoutVesselGroups: GetActiveVesselsWithoutVesselGroups,
    private val getActiveVessels: GetActiveVessels,
    private val activeVesselsChangeTracker: ActiveVesselsChangeTracker,
) {
    fun execute(
        userEmail: String,
        after: String?,
    ): ActiveVesselsChanges {
        activeVesselsChangeTracker.record(getActiveVesselsWithoutVesselGroups.execute())
        val changes = activeVesselsChangeTracker.getChangesSince(after)

        val vesselsWithGroups =
            getActiveVessels
                .addVesselGroups(activeVesselsChangeTracker.currentVessels, userEmail)
                .associateBy { it.getFeatureId() }

        return changes.copy(
            vessels = changes.vessels.map { vesselsWithGroups[it.getFeatureId()] ?: it },
            vesselGroupsByVesselFeatureId =
                if (changes.isFull) {
                    mapOf()
                } else {
                    // A dynamic group may change without any change of its vessels (e.g. a period filter)
                    vesselsWithGroups
                        .mapValues { it.value.vesselGroups }
                        .filterValues { it.isNotEmpty() }
                },
        )
    }
}
