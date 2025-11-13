package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselContactToUpdate

data class VesselContactToUpdateDataOutput(
    val id: Int?,
    val vesselId: Int,
    val contactMethod: String?,
    val contactMethodShouldBeChecked: Boolean?,
) {
    companion object {
        fun fromVesselContactToUpdate(vesselContactToUpdate: VesselContactToUpdate): VesselContactToUpdateDataOutput =
            VesselContactToUpdateDataOutput(
                id = vesselContactToUpdate.id,
                vesselId = vesselContactToUpdate.vesselId,
                contactMethod = vesselContactToUpdate.contactMethod,
                contactMethodShouldBeChecked = vesselContactToUpdate.contactMethodShouldBeChecked,
            )
    }
}
