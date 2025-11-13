package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselContactToUpdate

data class VesselContactToUpdateDataInput(
    val id: Int?,
    val vesselId: Int,
    val contactMethod: String?,
    val contactMethodShouldBeChecked: Boolean?,
) {
    fun toVesselContactToUpdate(): VesselContactToUpdate =
        VesselContactToUpdate(
            id = id,
            vesselId = vesselId,
            contactMethod = contactMethod,
            contactMethodShouldBeChecked = contactMethodShouldBeChecked,
        )
}
