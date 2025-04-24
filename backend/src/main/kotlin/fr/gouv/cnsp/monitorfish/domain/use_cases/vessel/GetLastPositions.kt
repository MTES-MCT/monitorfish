package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPosition
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.FixedVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselGroupBase
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselGroupRepository
import java.time.ZonedDateTime

@UseCase
class GetLastPositions(
    private val lastPositionRepository: LastPositionRepository,
    private val vesselGroupRepository: VesselGroupRepository,
) {
    fun execute(userEmail: String): List<LastPosition> {
        val now = ZonedDateTime.now()
        val lastPositions = lastPositionRepository.findAllInLastMonthOrWithBeaconMalfunction()
        val vesselGroups = vesselGroupRepository.findAllByUser(userEmail)

        return lastPositions.map { lastPosition ->
            val foundVesselGroups =
                vesselGroups.filter { vesselGroup ->
                    isInGroup(
                        vesselGroup = vesselGroup,
                        lastPosition = lastPosition,
                        now = now,
                    )
                }

            lastPosition.copy(vesselGroups = foundVesselGroups)
        }
    }

    private fun isInGroup(
        vesselGroup: VesselGroupBase,
        lastPosition: LastPosition,
        now: ZonedDateTime,
    ) = when (vesselGroup) {
        is DynamicVesselGroup -> lastPosition.isInGroup(vesselGroup, now)
        is FixedVesselGroup -> {
            vesselGroup.vessels.any {
                return@any it.isEqualToLastPosition(lastPosition)
            }
        }
    }
}
