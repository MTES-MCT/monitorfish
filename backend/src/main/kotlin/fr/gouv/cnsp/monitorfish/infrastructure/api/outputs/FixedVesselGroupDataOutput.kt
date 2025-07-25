package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.authorization.CnspService
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
    val sharedTo: List<CnspService>? = null,
    val type: GroupType,
    val createdBy: String,
    val createdAtUtc: ZonedDateTime,
    val updatedAtUtc: ZonedDateTime? = null,
    val endOfValidityUtc: ZonedDateTime? = null,
    val startOfValidityUtc: ZonedDateTime? = null,
    val vessels: List<FixedVesselGroupVesselIdentityDataOutput>,
) {
    companion object {
        fun fromFixedVesselGroup(vesselGroup: FixedVesselGroup) =
            FixedVesselGroupDataOutput(
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
                vessels =
                    vesselGroup.vessels
                        .map { FixedVesselGroupVesselIdentityDataOutput.fromVesselIdentity(it) },
            )
    }
}
