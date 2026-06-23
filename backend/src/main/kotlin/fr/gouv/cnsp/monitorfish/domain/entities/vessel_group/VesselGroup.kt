package fr.gouv.cnsp.monitorfish.domain.entities.vessel_group

import fr.gouv.cnsp.monitorfish.domain.entities.authorization.CnspService
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.EnrichedActiveVessel
import java.time.ZoneOffset
import java.time.ZonedDateTime

sealed class VesselGroupBase(
    open val id: Int?,
    open val name: String,
    open val isDeleted: Boolean,
    open val description: String?,
    open val pointsOfAttention: String?,
    open val color: String,
    open val sharing: Sharing,
    open val sharedTo: List<CnspService>? = listOf(),
    open val type: GroupType,
    // Whether this group is a priority target group ("groupe de cibles prioritaires"). For now only the hardcoded P1/P2
    // groups are priority, but other groups could be flagged as priority in the future.
    open val isPriorityGroup: Boolean = false,
    open val createdBy: String,
    open val createdAtUtc: ZonedDateTime,
    open val updatedAtUtc: ZonedDateTime? = null,
    open val endOfValidityUtc: ZonedDateTime? = null,
    open val startOfValidityUtc: ZonedDateTime? = null,
) {
    fun hasUserRights(
        userEmail: String,
        userService: CnspService?,
    ) = when (sharing) {
        Sharing.PRIVATE -> createdBy == userEmail
        Sharing.SHARED -> {
            val containsUserService = sharedTo?.contains(userService) ?: true

            createdBy == userEmail || containsUserService
        }
    }
}

data class DynamicVesselGroup(
    override val id: Int?,
    override val name: String,
    override val isDeleted: Boolean,
    override val description: String?,
    override val pointsOfAttention: String?,
    override val color: String,
    override val sharing: Sharing,
    override val sharedTo: List<CnspService>? = listOf(),
    override val isPriorityGroup: Boolean = false,
    override val createdBy: String,
    override val createdAtUtc: ZonedDateTime,
    override val updatedAtUtc: ZonedDateTime? = null,
    override val endOfValidityUtc: ZonedDateTime? = null,
    override val startOfValidityUtc: ZonedDateTime? = null,
    val filters: VesselGroupFilters,
) : VesselGroupBase(
        id = id,
        name = name,
        isDeleted = isDeleted,
        description = description,
        pointsOfAttention = pointsOfAttention,
        color = color,
        sharing = sharing,
        sharedTo = sharedTo,
        type = GroupType.DYNAMIC,
        isPriorityGroup = isPriorityGroup,
        createdBy = createdBy,
        createdAtUtc = createdAtUtc,
        updatedAtUtc = updatedAtUtc,
        endOfValidityUtc = endOfValidityUtc,
        startOfValidityUtc = startOfValidityUtc,
    ) {
    fun containsActiveVessel(
        activeVessel: EnrichedActiveVessel,
        now: ZonedDateTime,
    ): Boolean {
        val hasLandingPort = activeVessel.landingPort != null
        val hasLandingPortMatch =
            if (hasLandingPort) activeVessel.landingPort.isInGroup(vesselGroup = this) else true

        if (activeVessel.lastPosition != null) {
            val hasLastPositionMatch =
                activeVessel.lastPosition.isInGroup(
                    vesselGroup = this,
                    profile = activeVessel.vesselProfile,
                    now = now,
                )

            val hasProducerOrganizationMatch =
                when (filters.producerOrganizations.isNotEmpty()) {
                    true -> activeVessel.producerOrganization?.isInGroup(this) == true
                    false -> true
                }

            val hasRiskFactorMatch =
                activeVessel.riskFactor.isLastPositionInGroup(
                    vesselGroup = this,
                    now = now,
                )

            return hasLastPositionMatch && hasProducerOrganizationMatch && hasRiskFactorMatch && hasLandingPortMatch
        }

        if (filters.lastPositionHoursAgo != null ||
            filters.vesselsLocation.isNotEmpty() ||
            filters.zones.isNotEmpty()
        ) {
            // These filters are not applicable without positions
            return false
        }

        val hasRiskFactorAndProfileMatch =
            activeVessel.riskFactor.isInGroup(
                vesselGroup = this,
                profile = activeVessel.vesselProfile,
                now = now,
            )
        val hasVesselReferentialMatch = activeVessel.vessel?.isInGroup(vesselGroup = this) == true
        val hasProducerOrganizationMatch =
            when (filters.producerOrganizations.isNotEmpty()) {
                true -> activeVessel.producerOrganization?.isInGroup(this) == true
                false -> true
            }

        val emitsPositions = filters.emitsPositions.singleOrNull()
        val hasPositionsMatch =
            emitsPositions?.let {
                (it == VesselEmitsPositions.YES && activeVessel.emitsPositions) ||
                    (it == VesselEmitsPositions.NO && !activeVessel.emitsPositions)
            } ?: true

        return hasRiskFactorAndProfileMatch &&
            hasVesselReferentialMatch &&
            hasPositionsMatch &&
            hasProducerOrganizationMatch &&
            hasLandingPortMatch
    }
}

data class PriorityVesselGroup(
    override val id: Int? = null,
    override val name: String,
    override val isDeleted: Boolean = false,
    override val description: String? = null,
    override val pointsOfAttention: String? = null,
    override val color: String,
    override val sharing: Sharing = Sharing.SHARED,
    override val sharedTo: List<CnspService>? = null,
    override val createdBy: String = "",
    override val createdAtUtc: ZonedDateTime = ZonedDateTime.of(2024, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC),
    override val updatedAtUtc: ZonedDateTime? = null,
    override val endOfValidityUtc: ZonedDateTime? = null,
    override val startOfValidityUtc: ZonedDateTime? = null,
    override val isPriorityGroup: Boolean = true,
    val priorityLevel: Int,
) : VesselGroupBase(
        id = id,
        name = name,
        isDeleted = isDeleted,
        description = description,
        pointsOfAttention = pointsOfAttention,
        color = color,
        sharing = sharing,
        sharedTo = sharedTo,
        type = GroupType.HARDCODED,
        isPriorityGroup = isPriorityGroup,
        createdBy = createdBy,
        createdAtUtc = createdAtUtc,
        updatedAtUtc = updatedAtUtc,
        endOfValidityUtc = endOfValidityUtc,
        startOfValidityUtc = startOfValidityUtc,
    ) {
    fun containsActiveVessel(activeVessel: EnrichedActiveVessel): Boolean =
        activeVessel.riskFactor.effectiveControlPriorityLevel.toInt() == priorityLevel &&
            (activeVessel.vessel?.let { it.underCharter == false } ?: true)

    companion object {
        val PRIORITY_GROUPS =
            listOf(
                PriorityVesselGroup(
                    id = -1,
                    name = "Segments P1",
                    description = "Navires appartenant à des segments à contrôler en priorité en mer au vu de l’avancée des objectifs PIRC et de la saisonnalité.",
                    color = "#E1000F",
                    priorityLevel = 4,
                ),
                PriorityVesselGroup(
                    id = -2,
                    name = "Segments P2",
                    description = "Navires appartenant à des segments à contrôler en priorité en mer au vu de l’avancée des objectifs PIRC et de la saisonnalité.",
                    color = "#FF9940",
                    priorityLevel = 3,
                ),
            )
    }
}

data class FixedVesselGroup(
    override val id: Int?,
    override val name: String,
    override val isDeleted: Boolean,
    override val description: String?,
    override val pointsOfAttention: String?,
    override val color: String,
    override val sharing: Sharing,
    override val sharedTo: List<CnspService>? = listOf(),
    override val isPriorityGroup: Boolean = false,
    override val createdBy: String,
    override val createdAtUtc: ZonedDateTime,
    override val updatedAtUtc: ZonedDateTime? = null,
    override val endOfValidityUtc: ZonedDateTime? = null,
    override val startOfValidityUtc: ZonedDateTime? = null,
    val vessels: List<VesselIdentity>,
) : VesselGroupBase(
        id = id,
        name = name,
        isDeleted = isDeleted,
        description = description,
        pointsOfAttention = pointsOfAttention,
        color = color,
        sharing = sharing,
        sharedTo = sharedTo,
        type = GroupType.FIXED,
        isPriorityGroup = isPriorityGroup,
        createdBy = createdBy,
        createdAtUtc = createdAtUtc,
        updatedAtUtc = updatedAtUtc,
        endOfValidityUtc = endOfValidityUtc,
        startOfValidityUtc = startOfValidityUtc,
    ) {
    fun containsActiveVessel(activeVessel: EnrichedActiveVessel) =
        vessels.any { vessel -> vessel.isEqualToActiveVessel(activeVessel) }
}
