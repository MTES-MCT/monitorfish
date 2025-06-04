package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups.dtos

import fr.gouv.cnsp.monitorfish.domain.entities.authorization.CnspService
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.FixedVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.Sharing
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselIdentity
import java.time.ZonedDateTime

data class CreateOrUpdateFixedVesselGroup(
    val id: Int?,
    val name: String,
    val isDeleted: Boolean,
    val description: String?,
    val pointsOfAttention: String?,
    val color: String,
    val sharing: Sharing,
    val sharedTo: List<CnspService>?,
    val endOfValidityUtc: ZonedDateTime? = null,
    val vessels: List<VesselIdentity>,
) {
    fun toFixedVesselGroup(
        createdBy: String,
        createdAtUtc: ZonedDateTime,
        updatedAtUtc: ZonedDateTime?,
    ) = FixedVesselGroup(
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
        vessels = vessels,
    )
}
