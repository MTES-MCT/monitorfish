package fr.gouv.cnsp.monitorfish.domain.entities.vessel

data class VesselContactToUpdate(
    val id: Int?,
    val vesselId: Int,
    val contactMethod: String?,
    val contactMethodShouldBeChecked: Boolean?,
)
