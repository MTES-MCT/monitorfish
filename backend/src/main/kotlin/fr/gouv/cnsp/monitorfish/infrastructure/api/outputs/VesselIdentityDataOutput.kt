package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.Vessel

data class VesselIdentityDataOutput(
        val internalReferenceNumber: String? = null,
        val imo: String? = null,
        val mmsi: String? = null,
        val ircs: String? = null,
        val externalReferenceNumber: String? = null,
        val vesselName: String? = null,
        val flagState: CountryCode? = null) {
    companion object {
        fun fromVessel(vessel: Vessel): VesselIdentityDataOutput {
            return VesselIdentityDataOutput(
                    internalReferenceNumber = vessel.internalReferenceNumber,
                    imo = vessel.imo,
                    ircs = vessel.ircs,
                    mmsi = vessel.mmsi,
                    externalReferenceNumber = vessel.externalReferenceNumber,
                    vesselName = vessel.vesselName,
                    flagState = vessel.flagState,
            )
        }
    }
}
