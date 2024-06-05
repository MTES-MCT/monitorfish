package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselAndBeacon

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
        fun fromVesselAndBeacon(vesselAndBeacon: VesselAndBeacon): VesselIdentityDataOutput {
            return VesselIdentityDataOutput(
                internalReferenceNumber = vesselAndBeacon.vessel.internalReferenceNumber,
                districtCode = vesselAndBeacon.vessel.districtCode,
                vesselId = vesselAndBeacon.vessel.id,
                imo = vesselAndBeacon.vessel.imo,
                ircs = vesselAndBeacon.vessel.ircs,
                mmsi = vesselAndBeacon.vessel.mmsi,
                externalReferenceNumber = vesselAndBeacon.vessel.externalReferenceNumber,
                vesselName = vesselAndBeacon.vessel.vesselName,
                flagState = vesselAndBeacon.vessel.flagState,
                beaconNumber = vesselAndBeacon.beacon?.beaconNumber,
            )
        }
    }
}
