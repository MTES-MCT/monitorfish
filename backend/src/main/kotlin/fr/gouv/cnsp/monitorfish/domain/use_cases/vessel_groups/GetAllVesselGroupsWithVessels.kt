package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.ActiveVesselType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.ActiveVesselWithReferentialData
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.FixedVesselGroup
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselGroupRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.dtos.ActiveVesselWithReferentialDataDTO
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
        val activeVessels =
            lastPositionRepository
                .findActiveVesselWithReferentialData()
                .filter { it.hasLastPositionOrVesselProfileWithVessel() }
        val now = ZonedDateTime.now()

        val byVesselId = mutableMapOf<Int, ActiveVesselWithReferentialDataDTO>()
        val byCfr = mutableMapOf<String, ActiveVesselWithReferentialDataDTO>()
        val byIrcs = mutableMapOf<String, ActiveVesselWithReferentialDataDTO>()
        val byExternalId = mutableMapOf<String, ActiveVesselWithReferentialDataDTO>()
        activeVessels.forEach { activeVessel ->
            buildMapOfIdentifiers(activeVessel, byVesselId, byCfr, byIrcs, byExternalId)
        }
        val dynamicGroups = vesselGroups.filterIsInstance<DynamicVesselGroup>()
        val dynamicGroupsToActiveVessels =
            ConcurrentHashMap<DynamicVesselGroup, MutableList<ActiveVesselWithReferentialDataDTO>>().apply {
                dynamicGroups.forEach { this[it] = CopyOnWriteArrayList() }
            }
        activeVessels.parallelStream().forEach { activeVessel ->
            dynamicGroups.forEach { group ->
                if (group.containsActiveVessel(activeVessel, now)) {
                    dynamicGroupsToActiveVessels[group]?.add(activeVessel)
                }
            }
        }

        return vesselGroups.map { group ->
            val activeVesselsFromGroups =
                when (group) {
                    is DynamicVesselGroup -> dynamicGroupsToActiveVessels[group] ?: emptyList()
                    is FixedVesselGroup -> getVesselsFromReferential(group, byVesselId, byCfr, byIrcs, byExternalId)
                }.map {
                    ActiveVesselWithReferentialData(
                        lastPosition = it.lastPosition,
                        vesselProfile = it.vesselProfile,
                        vessel = it.vessel,
                        producerOrganizationName = it.producerOrganizationName,
                        riskFactor = it.riskFactor,
                        // TODO This is not used by the frontend at the moment
                        vesselGroups = listOf(),
                        activeVesselType =
                            it.lastPosition?.let { ActiveVesselType.POSITION_ACTIVITY }
                                ?: ActiveVesselType.LOGBOOK_ACTIVITY,
                    )
                }

            VesselGroupWithVessels(
                group = group,
                vessels = activeVesselsFromGroups,
            )
        }
    }

    private fun getVesselsFromReferential(
        group: FixedVesselGroup,
        byVesselId: MutableMap<Int, ActiveVesselWithReferentialDataDTO>,
        byCfr: MutableMap<String, ActiveVesselWithReferentialDataDTO>,
        byIrcs: MutableMap<String, ActiveVesselWithReferentialDataDTO>,
        byExternalId: MutableMap<String, ActiveVesselWithReferentialDataDTO>,
    ): List<ActiveVesselWithReferentialDataDTO> =
        group.vessels.mapNotNull { vessel ->
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
                else -> {
                    logger.warn("Vessel in group has no identifier.")

                    null
                }
            } ?: when {
                vessel.vesselId != null -> {
                    ActiveVesselWithReferentialDataDTO(
                        lastPosition = null,
                        vesselProfile = null,
                        vessel =
                            Vessel(
                                id = vessel.vesselId,
                                internalReferenceNumber = vessel.cfr,
                                externalReferenceNumber = vessel.externalIdentification,
                                ircs = vessel.ircs,
                                vesselName = vessel.name,
                                flagState = vessel.flagState,
                                hasLogbookEsacapt = false,
                            ),
                        producerOrganizationName = null,
                    )
                }
                else -> {
                    logger.warn("Vessel ${vessel.cfr} not found in vessels table, skipping it.")

                    null
                }
            }
        }

    private fun buildMapOfIdentifiers(
        activeVessel: ActiveVesselWithReferentialDataDTO,
        byVesselId: MutableMap<Int, ActiveVesselWithReferentialDataDTO>,
        byCfr: MutableMap<String, ActiveVesselWithReferentialDataDTO>,
        byIrcs: MutableMap<String, ActiveVesselWithReferentialDataDTO>,
        byExternalId: MutableMap<String, ActiveVesselWithReferentialDataDTO>,
    ) {
        if (activeVessel.lastPosition != null) {
            activeVessel.lastPosition.vesselId?.let { byVesselId[it] = activeVessel }
            activeVessel.lastPosition.internalReferenceNumber?.let { byCfr[it] = activeVessel }
            activeVessel.lastPosition.ircs?.let { byIrcs[it] = activeVessel }
            activeVessel.lastPosition.externalReferenceNumber?.let { byExternalId[it] = activeVessel }

            return
        }

        requireNotNull(activeVessel.vessel)

        activeVessel.vessel.id.let { byVesselId[it] = activeVessel }
        activeVessel.vessel.internalReferenceNumber?.let { byCfr[it] = activeVessel }
        activeVessel.vessel.ircs?.let { byIrcs[it] = activeVessel }
        activeVessel.vessel.externalReferenceNumber?.let { byExternalId[it] = activeVessel }
    }
}
