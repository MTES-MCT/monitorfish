package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.EnrichedActiveVessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.FixedVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.PriorityVesselGroup
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups.GetAllUserVesselGroups
import java.time.ZonedDateTime

@UseCase
class GetActiveVessels(
    private val getActiveVesselsWithoutVesselGroups: GetActiveVesselsWithoutVesselGroups,
    private val getAllUserVesselGroups: GetAllUserVesselGroups,
) {
    fun execute(userEmail: String): List<EnrichedActiveVessel> {
        val now = ZonedDateTime.now()
        val vesselGroups = getAllUserVesselGroups.execute(userEmail)

        return getActiveVesselsWithoutVesselGroups.execute().map { activeVessel ->
            val foundVesselGroups =
                vesselGroups
                    .filter { vesselGroup ->
                        when (vesselGroup) {
                            is DynamicVesselGroup -> vesselGroup.containsActiveVessel(activeVessel, now)
                            is FixedVesselGroup -> vesselGroup.containsActiveVessel(activeVessel)
                            is PriorityVesselGroup -> vesselGroup.containsActiveVessel(activeVessel)
                        }
                    }
                    // Priority groups must be returned first so that they are displayed first
                    // (vessel label icons and layer group color)
                    .sortedByDescending { it.isPriorityGroup }

            activeVessel.copy(vesselGroups = foundVesselGroups)
        }
    }
}
