package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import fr.gouv.cnsp.monitorfish.domain.entities.authorization.CnspService
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.Sharing
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselGroupFilters
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups.dtos.CreateOrUpdateDynamicVesselGroup
import java.time.ZonedDateTime

data class DynamicVesselGroupDataInput(
    val id: Int?,
    val name: String,
    val isDeleted: Boolean,
    val description: String?,
    val pointsOfAttention: String?,
    val color: String,
    val sharing: Sharing,
    val sharedTo: List<CnspService>?,
    val endOfValidityUtc: ZonedDateTime? = null,
    val filters: VesselGroupFilters,
) {
    fun toCreateOrUpdateDynamicVesselGroup() =
        CreateOrUpdateDynamicVesselGroup(
            id = id,
            name = name,
            isDeleted = isDeleted,
            description = description,
            pointsOfAttention = pointsOfAttention,
            color = color,
            sharing = sharing,
            sharedTo = sharedTo,
            endOfValidityUtc = endOfValidityUtc,
            filters = filters,
        )
}
