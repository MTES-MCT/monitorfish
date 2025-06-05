package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.EnrichedActiveVessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.FixedVesselGroup
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselGroupRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetAuthorizedUser
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
    private val getAuthorizedUser: GetAuthorizedUser,
) {
    private val logger: Logger = LoggerFactory.getLogger(GetAllVesselGroupsWithVessels::class.java)

    fun execute(userEmail: String): List<VesselGroupWithVessels> {
        val userService = getAuthorizedUser.execute(userEmail).service
        val vesselGroups =
            vesselGroupRepository.findAllByUserAndSharing(
                user = userEmail,
                service = userService,
            )
        val activeVessels =
            lastPositionRepository.findActiveVesselWithReferentialData()
        val now = ZonedDateTime.now()

        val byVesselId = mutableMapOf<Int, EnrichedActiveVessel>()
        val byCfr = mutableMapOf<String, EnrichedActiveVessel>()
        val byIrcs = mutableMapOf<String, EnrichedActiveVessel>()
        val byExternalId = mutableMapOf<String, EnrichedActiveVessel>()
        activeVessels.forEach { activeVessel ->
            buildMapOfIdentifiers(activeVessel, byVesselId, byCfr, byIrcs, byExternalId)
        }
        val dynamicGroups = vesselGroups.filterIsInstance<DynamicVesselGroup>()
        val dynamicGroupsToActiveVessels =
            ConcurrentHashMap<DynamicVesselGroup, MutableList<EnrichedActiveVessel>>().apply {
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
                }

            VesselGroupWithVessels(
                group = group,
                vessels = activeVesselsFromGroups,
            )
        }
    }

    private fun getVesselsFromReferential(
        group: FixedVesselGroup,
        byVesselId: MutableMap<Int, EnrichedActiveVessel>,
        byCfr: MutableMap<String, EnrichedActiveVessel>,
        byIrcs: MutableMap<String, EnrichedActiveVessel>,
        byExternalId: MutableMap<String, EnrichedActiveVessel>,
    ): List<EnrichedActiveVessel> =
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
                    EnrichedActiveVessel(
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
                        producerOrganization = null,
                        riskFactor = VesselRiskFactor(),
                    )
                }
                else -> {
                    logger.warn("Vessel ${vessel.cfr} not found in vessels table, skipping it.")

                    null
                }
            }
        }

    private fun buildMapOfIdentifiers(
        activeVessel: EnrichedActiveVessel,
        byVesselId: MutableMap<Int, EnrichedActiveVessel>,
        byCfr: MutableMap<String, EnrichedActiveVessel>,
        byIrcs: MutableMap<String, EnrichedActiveVessel>,
        byExternalId: MutableMap<String, EnrichedActiveVessel>,
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
