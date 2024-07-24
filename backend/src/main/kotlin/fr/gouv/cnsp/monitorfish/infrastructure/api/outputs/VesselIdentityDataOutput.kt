package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselAndBeacon
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier

data class VesselIdentityDataOutput(
    val vesselId: Int,
    val beaconNumber: String?,
    val districtCode: String?,
    val externalReferenceNumber: String?,
    val flagState: CountryCode,
    val imo: String?,
    val internalReferenceNumber: String?,
    val ircs: String?,
    val length: Double?,
    val mmsi: String?,
    val vesselIdentifer: VesselIdentifier?,
    val vesselName: String?,
) {
    companion object {
        fun fromVesselAndBeacon(vesselAndBeacon: VesselAndBeacon): VesselIdentityDataOutput {
            return VesselIdentityDataOutput(
                vesselId = vesselAndBeacon.vessel.id,
                beaconNumber = vesselAndBeacon.beacon?.beaconNumber,
                districtCode = vesselAndBeacon.vessel.districtCode,
                externalReferenceNumber = vesselAndBeacon.vessel.externalReferenceNumber,
                flagState = vesselAndBeacon.vessel.flagState,
                imo = vesselAndBeacon.vessel.imo,
                internalReferenceNumber = vesselAndBeacon.vessel.internalReferenceNumber,
                ircs = vesselAndBeacon.vessel.ircs,
                length = vesselAndBeacon.vessel.length,
                mmsi = vesselAndBeacon.vessel.mmsi,
                vesselIdentifer = vesselAndBeacon.vessel.getIdentifier(),
                vesselName = vesselAndBeacon.vessel.vesselName,
            )
        }
    }
}
