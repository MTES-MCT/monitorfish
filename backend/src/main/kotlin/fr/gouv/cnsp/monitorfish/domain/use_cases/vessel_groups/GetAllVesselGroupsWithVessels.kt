package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPosition
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.FixedVesselGroup
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselGroupRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups.dtos.VesselGroupWithVessels
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.CopyOnWriteArrayList

@UseCase
class GetAllVesselGroupsWithVessels(
    private val vesselGroupRepository: VesselGroupRepository,
    private val lastPositionRepository: LastPositionRepository,
) {
    private val logger: Logger = LoggerFactory.getLogger(GetAllVesselGroupsWithVessels::class.java)

    fun execute(userEmail: String): List<VesselGroupWithVessels> {
        val vesselGroups = vesselGroupRepository.findAllByUser(userEmail)
        val lastPositions = lastPositionRepository.findAllInLastMonthOrWithBeaconMalfunction()
        val now = ZonedDateTime.now()

        val byVesselId = mutableMapOf<Int, LastPosition>()
        val byCfr = mutableMapOf<String, LastPosition>()
        val byIrcs = mutableMapOf<String, LastPosition>()
        val byExternalId = mutableMapOf<String, LastPosition>()

        lastPositions.forEach { pos ->
            pos.vesselId?.let { byVesselId[it] = pos }
            pos.internalReferenceNumber?.let { byCfr[it] = pos }
            pos.ircs?.let { byIrcs[it] = pos }
            pos.externalReferenceNumber?.let { byExternalId[it] = pos }
        }

        val dynamicGroups = vesselGroups.filterIsInstance<DynamicVesselGroup>()
        val dynamicGroupsToLastPositions = ConcurrentHashMap<DynamicVesselGroup, MutableList<LastPosition>>().apply {
            dynamicGroups.forEach { this[it] = CopyOnWriteArrayList() }
        }
        lastPositions.parallelStream().forEach { lastPosition ->
            dynamicGroups.forEach { group ->
                if (lastPosition.isInGroup(group, now)) {
                    dynamicGroupsToLastPositions[group]?.add(lastPosition)
                }
            }
        }

        return vesselGroups.map { group ->
            val vesselLastPositions =
                when (group) {
                    is DynamicVesselGroup -> dynamicGroupsToLastPositions[group] ?: emptyList()
                    is FixedVesselGroup ->
                        group.vessels.mapIndexed { index, vessel ->
                            val match =
                                when {
                                    vessel.vesselId != null -> byVesselId[vessel.vesselId]
                                    vessel.vesselIdentifier != null ->
                                        when (vessel.vesselIdentifier) {
                                            VesselIdentifier.INTERNAL_REFERENCE_NUMBER -> byCfr[vessel.cfr]
                                            VesselIdentifier.IRCS -> byIrcs[vessel.ircs]
                                            VesselIdentifier.EXTERNAL_REFERENCE_NUMBER -> byExternalId[vessel.externalIdentification]
                                        }
                                    !vessel.cfr.isNullOrEmpty() -> byCfr[vessel.cfr]
                                    !vessel.ircs.isNullOrEmpty() -> byIrcs[vessel.ircs]
                                    !vessel.externalIdentification.isNullOrEmpty() -> byExternalId[vessel.externalIdentification]
                                    else -> null
                                }

                            match?.copy(id = index) ?: vessel.toLastPosition(index)
                        }
                }

            VesselGroupWithVessels(
                group = group,
                vessels = vesselLastPositions,
            )
        }
    }
}
