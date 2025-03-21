package fr.gouv.cnsp.monitorfish.domain.entities.vessel_group

import java.time.ZonedDateTime

sealed class VesselGroupBase(
    open val id: Int?,
    open val name: String,
    open val isDeleted: Boolean,
    open val description: String,
    open val pointsOfAttention: String?,
    open val color: String,
    open val sharing: Sharing,
    open val type: GroupType,
    open val createdBy: String,
    open val createdAtUtc: ZonedDateTime,
    open val updatedAtUtc: ZonedDateTime? = null,
    open val endOfValidityUtc: ZonedDateTime? = null,
)

data class DynamicVesselGroup(
    override val id: Int?,
    override val name: String,
    override val isDeleted: Boolean,
    override val description: String,
    override val pointsOfAttention: String?,
    override val color: String,
    override val sharing: Sharing,
    override val createdBy: String,
    override val createdAtUtc: ZonedDateTime,
    override val updatedAtUtc: ZonedDateTime? = null,
    override val endOfValidityUtc: ZonedDateTime? = null,
    val filters: VesselGroupFilters,
) : VesselGroupBase(
        id = id,
        name = name,
        isDeleted = isDeleted,
        description = description,
        pointsOfAttention = pointsOfAttention,
        color = color,
        sharing = sharing,
        type = GroupType.DYNAMIC,
        createdBy = createdBy,
        createdAtUtc = createdAtUtc,
        updatedAtUtc = updatedAtUtc,
        endOfValidityUtc = endOfValidityUtc,
    )

data class FixedVesselGroup(
    override val id: Int?,
    override val name: String,
    override val isDeleted: Boolean,
    override val description: String,
    override val pointsOfAttention: String?,
    override val color: String,
    override val sharing: Sharing,
    override val createdBy: String,
    override val createdAtUtc: ZonedDateTime,
    override val updatedAtUtc: ZonedDateTime? = null,
    override val endOfValidityUtc: ZonedDateTime? = null,
    val vessels: List<VesselIdentity>,
) : VesselGroupBase(
        id = id,
        name = name,
        isDeleted = isDeleted,
        description = description,
        pointsOfAttention = pointsOfAttention,
        color = color,
        sharing = sharing,
        type = GroupType.FIXED,
        createdBy = createdBy,
        createdAtUtc = createdAtUtc,
        updatedAtUtc = updatedAtUtc,
        endOfValidityUtc = endOfValidityUtc,
    )
