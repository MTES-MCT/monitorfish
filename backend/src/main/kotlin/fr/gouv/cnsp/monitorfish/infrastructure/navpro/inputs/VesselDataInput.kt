package fr.gouv.cnsp.monitorfish.infrastructure.navpro.inputs

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.Vessel

data class VesselDataInput(
        val internalReferenceNumber: String ? = null,
        val externalReferenceNumber: String? = null,
        val vesselName: String? = null,
        val flagState: CountryCode? = null,
        val gearType: String? = null,
        val vesselType: String? = null) {
    fun toVessel(): Vessel {
        return Vessel(
                internalReferenceNumber = internalReferenceNumber,
                externalReferenceNumber = externalReferenceNumber,
                vesselName = vesselName,
                flagState = flagState,
                gearType = gearType,
                vesselType = vesselType
        )
    }
}
