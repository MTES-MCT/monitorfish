package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups.dtos

import fr.gouv.cnsp.monitorfish.domain.entities.authorization.CnspService
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.Sharing
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselGroupFilters
import java.time.ZonedDateTime

data class CreateOrUpdateDynamicVesselGroup(
    val id: Int?,
    val name: String,
    val isDeleted: Boolean,
    val description: String?,
    val pointsOfAttention: String?,
    val color: String,
    val sharing: Sharing,
    val sharedTo: List<CnspService>?,
    val endOfValidityUtc: ZonedDateTime? = null,
    val startOfValidityUtc: ZonedDateTime? = null,
    val filters: VesselGroupFilters,
) {
    fun toDynamicVesselGroup(
        createdBy: String,
        createdAtUtc: ZonedDateTime,
        updatedAtUtc: ZonedDateTime?,
    ) = DynamicVesselGroup(
        id = id,
        name = name,
        isDeleted = isDeleted,
        description = description,
        pointsOfAttention = pointsOfAttention,
        color = color,
        sharing = sharing,
        sharedTo = sharedTo,
        createdBy = createdBy,
        createdAtUtc = createdAtUtc,
        updatedAtUtc = updatedAtUtc,
        endOfValidityUtc = endOfValidityUtc,
        startOfValidityUtc = startOfValidityUtc,
        filters = filters,
    )
}
