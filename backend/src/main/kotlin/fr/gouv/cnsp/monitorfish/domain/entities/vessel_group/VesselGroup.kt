package fr.gouv.cnsp.monitorfish.domain.entities.vessel_group

import fr.gouv.cnsp.monitorfish.domain.entities.authorization.CnspService
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.ActivityType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.EnrichedActiveVessel
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

            val hasRiskFactorMatch = activeVessel.riskFactor.isLastPositionInGroup(this)

            return hasLastPositionMatch && hasProducerOrganizationMatch && hasRiskFactorMatch
        }

        val hasVesselProfileMatch = activeVessel.vesselProfile?.isInGroup(this) == true
        val hasRiskFactorMatch = activeVessel.riskFactor.isInGroup(this, now)
        val hasVesselReferentialMatch = activeVessel.vessel?.isInGroup(this) == true
        val hasProducerOrganizationMatch =
            when (filters.producerOrganizations.isNotEmpty()) {
                true -> activeVessel.producerOrganization?.isInGroup(this) == true
                false -> true
            }

        val emitsPositions = filters.emitsPositions.singleOrNull()
        val hasPositionsMatch =
            emitsPositions?.let {
                (it == VesselEmitsPositions.YES && activeVessel.activityType == ActivityType.POSITION_BASED) ||
                    (it == VesselEmitsPositions.NO && activeVessel.activityType != ActivityType.POSITION_BASED)
            } ?: true

        return hasVesselProfileMatch &&
            hasRiskFactorMatch &&
            hasVesselReferentialMatch &&
            hasPositionsMatch &&
            hasProducerOrganizationMatch
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
        createdBy = createdBy,
        createdAtUtc = createdAtUtc,
        updatedAtUtc = updatedAtUtc,
        endOfValidityUtc = endOfValidityUtc,
        startOfValidityUtc = startOfValidityUtc,
    ) {
    fun containsActiveVessel(activeVessel: EnrichedActiveVessel) =
        vessels.any { vessel -> vessel.isEqualToActiveVessel(activeVessel) }
}
