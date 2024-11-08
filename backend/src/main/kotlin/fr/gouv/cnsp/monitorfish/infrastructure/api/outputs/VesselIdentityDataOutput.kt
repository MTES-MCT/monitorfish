package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselAndBeacon

data class VesselIdentityDataOutput(
    val beaconNumber: String? = null,
    val districtCode: String? = null,
    val externalReferenceNumber: String? = null,
    val flagState: CountryCode,
    val imo: String? = null,
    val internalReferenceNumber: String? = null,
    val ircs: String? = null,
    val isLessThanTwelveMetersVessel: Boolean? = null,
    val mmsi: String? = null,
    val vesselId: Int,
    val vesselName: String? = null,
) {
    companion object {
        fun fromVessel(vessel: Vessel): VesselIdentityDataOutput {
            return VesselIdentityDataOutput(
                districtCode = vessel.districtCode,
                externalReferenceNumber = vessel.externalReferenceNumber,
                flagState = vessel.flagState,
                imo = vessel.imo,
                internalReferenceNumber = vessel.internalReferenceNumber,
                ircs = vessel.ircs,
                isLessThanTwelveMetersVessel = vessel.length?.let { it < 12 },
                mmsi = vessel.mmsi,
                vesselId = vessel.id,
                vesselName = vessel.vesselName,
            )
        }

        fun fromVesselAndBeacon(vesselAndBeacon: VesselAndBeacon): VesselIdentityDataOutput {
            return VesselIdentityDataOutput(
                beaconNumber = vesselAndBeacon.beacon?.beaconNumber,
                districtCode = vesselAndBeacon.vessel.districtCode,
                externalReferenceNumber = vesselAndBeacon.vessel.externalReferenceNumber,
                flagState = vesselAndBeacon.vessel.flagState,
                imo = vesselAndBeacon.vessel.imo,
                internalReferenceNumber = vesselAndBeacon.vessel.internalReferenceNumber,
                ircs = vesselAndBeacon.vessel.ircs,
                isLessThanTwelveMetersVessel = vesselAndBeacon.vessel.length?.let { it < 12 },
                mmsi = vesselAndBeacon.vessel.mmsi,
                vesselId = vesselAndBeacon.vessel.id,
                vesselName = vesselAndBeacon.vessel.vesselName,
            )
        }
    }
}
