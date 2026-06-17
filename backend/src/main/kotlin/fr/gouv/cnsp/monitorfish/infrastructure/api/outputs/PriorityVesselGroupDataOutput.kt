package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.authorization.CnspService
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.GroupType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.PriorityVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.Sharing
import java.time.ZonedDateTime

data class PriorityVesselGroupDataOutput(
    val id: Int?,
    val name: String,
    val isDeleted: Boolean,
    val description: String?,
    val pointsOfAttention: String?,
    val color: String,
    val sharing: Sharing,
    val sharedTo: List<CnspService>?,
    val type: GroupType,
    val createdBy: String,
    val createdAtUtc: ZonedDateTime,
    val updatedAtUtc: ZonedDateTime?,
    val endOfValidityUtc: ZonedDateTime?,
    val startOfValidityUtc: ZonedDateTime?,
    val priorityLevel: Int,
) {
    companion object {
        fun fromPriorityVesselGroup(vesselGroup: PriorityVesselGroup) =
            PriorityVesselGroupDataOutput(
                id = vesselGroup.id,
                name = vesselGroup.name,
                isDeleted = vesselGroup.isDeleted,
                description = vesselGroup.description,
                pointsOfAttention = vesselGroup.pointsOfAttention,
                color = vesselGroup.color,
                sharing = vesselGroup.sharing,
                sharedTo = vesselGroup.sharedTo,
                type = vesselGroup.type,
                createdBy = vesselGroup.createdBy,
                createdAtUtc = vesselGroup.createdAtUtc,
                updatedAtUtc = vesselGroup.updatedAtUtc,
                endOfValidityUtc = vesselGroup.endOfValidityUtc,
                startOfValidityUtc = vesselGroup.startOfValidityUtc,
                priorityLevel = vesselGroup.priorityLevel,
            )
    }
}
