package fr.gouv.cnsp.monitorfish.fakers

import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselContactToUpdate

class VesselContactToUpdateFaker {
    companion object {
        fun fakeVesselContactToUpdate(
            id: Int? = null,
            contactMethod: String? = "Contact Method",
            contactMethodShouldBeChecked: Boolean? = false,
            vesselId: Int = 1,
        ): VesselContactToUpdate =
            VesselContactToUpdate(
                id = id,
                vesselId = vesselId,
                contactMethod = contactMethod,
                contactMethodShouldBeChecked = contactMethodShouldBeChecked,
            )
    }
}
