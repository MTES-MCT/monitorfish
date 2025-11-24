package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselContactToUpdate
import jakarta.persistence.*

@Entity
@Table(name = "vessel_contact_to_updates")
data class VesselContactToUpdateEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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

    companion object {
        fun fromVesselContactToUpdate(vesselContactToUpdate: VesselContactToUpdate): VesselContactToUpdateEntity =
            VesselContactToUpdateEntity(
                id = vesselContactToUpdate.id,
                vesselId = vesselContactToUpdate.vesselId,
                contactMethod = vesselContactToUpdate.contactMethod,
                contactMethodShouldBeChecked = vesselContactToUpdate.contactMethodShouldBeChecked,
            )
    }
}
