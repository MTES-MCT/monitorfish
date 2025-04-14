package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.*
import java.time.ZonedDateTime

data class FixedVesselGroupDataOutput(
    val id: Int?,
    val name: String,
    val isDeleted: Boolean,
    val description: String?,
    val pointsOfAttention: String?,
    val color: String,
    val sharing: Sharing,
    val type: GroupType,
    val createdBy: String,
    val createdAtUtc: ZonedDateTime,
    val updatedAtUtc: ZonedDateTime? = null,
    val endOfValidityUtc: ZonedDateTime? = null,
    val vessels: List<VesselIdentity>,
) {
    companion object {
        fun fromFixedVesselGroup(
            vesselGroup: FixedVesselGroup,
            withVessels: Boolean,
        ) = FixedVesselGroupDataOutput(
            id = vesselGroup.id,
            name = vesselGroup.name,
            isDeleted = vesselGroup.isDeleted,
            description = vesselGroup.description,
            pointsOfAttention = vesselGroup.pointsOfAttention,
            color = vesselGroup.color,
            sharing = vesselGroup.sharing,
            type = vesselGroup.type,
            createdBy = vesselGroup.createdBy,
            createdAtUtc = vesselGroup.createdAtUtc,
            updatedAtUtc = vesselGroup.updatedAtUtc,
            endOfValidityUtc = vesselGroup.endOfValidityUtc,
            vessels = if (withVessels) vesselGroup.vessels else listOf(),
        )
    }
}
