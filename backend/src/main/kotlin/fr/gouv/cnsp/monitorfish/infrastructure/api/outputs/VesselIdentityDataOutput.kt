package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel

data class VesselIdentityDataOutput(
    val internalReferenceNumber: String? = null,
    val districtCode: String? = null,
    val vesselId: Int,
    val imo: String? = null,
    val mmsi: String? = null,
    val ircs: String? = null,
    val externalReferenceNumber: String? = null,
    val vesselName: String? = null,
    val flagState: CountryCode,
    val beaconNumber: String? = null,
) {
    companion object {
        fun fromVessel(vessel: Vessel): VesselIdentityDataOutput {
            return VesselIdentityDataOutput(
                internalReferenceNumber = vessel.internalReferenceNumber,
                districtCode = vessel.districtCode,
                vesselId = vessel.id,
                imo = vessel.imo,
                ircs = vessel.ircs,
                mmsi = vessel.mmsi,
                externalReferenceNumber = vessel.externalReferenceNumber,
                vesselName = vessel.vesselName,
                flagState = vessel.flagState,
                beaconNumber = vessel.beaconNumber,
            )
        }
    }
}
