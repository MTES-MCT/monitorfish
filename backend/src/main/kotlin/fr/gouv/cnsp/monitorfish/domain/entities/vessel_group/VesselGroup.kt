package fr.gouv.cnsp.monitorfish.domain.entities.vessel_group

import java.time.ZonedDateTime

data class VesselGroup(
    val id: Int,
    val name: String,
    val isDeleted: Boolean,
    val description: String,
    val pointsOfAttention: String,
    val color: String,
    val filters: VesselGroupFilters,
    val sharing: Sharing,
    val type: GroupType,
    val createdBy: String,
    val createdAtUtc: ZonedDateTime,
    val updatedAtUtc: ZonedDateTime? = null,
    val endOfValidityUtc: ZonedDateTime? = null,
)
