package fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions

import fr.gouv.cnsp.monitorfish.domain.entities.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPosition
import java.time.ZonedDateTime

data class BeaconMalfunction(
        val id: Int,
        val internalReferenceNumber: String?,
        val externalReferenceNumber: String?,
        val ircs: String?,
        val vesselIdentifier: VesselIdentifier,
        val vesselName: String,
        val vesselStatus: VesselStatus,
        val stage: Stage,
        val priority: Boolean,
        val malfunctionStartDateTime: ZonedDateTime,
        val malfunctionEndDateTime: ZonedDateTime?,
        val vesselStatusLastModificationDateTime: ZonedDateTime,
        var riskFactor: Double? = null,
        val endOfBeaconMalfunctionReason: EndOfBeaconMalfunctionReason? = null) {
    companion object {
        fun getVesselFromBeaconMalfunction(beaconMalfunction: BeaconMalfunction): (LastPosition) -> Boolean {
            return { lastPosition ->
                when (beaconMalfunction.vesselIdentifier) {
                    VesselIdentifier.INTERNAL_REFERENCE_NUMBER -> lastPosition.internalReferenceNumber == beaconMalfunction.internalReferenceNumber
                    VesselIdentifier.IRCS -> lastPosition.ircs == beaconMalfunction.ircs
                    VesselIdentifier.EXTERNAL_REFERENCE_NUMBER -> lastPosition.externalReferenceNumber == beaconMalfunction.externalReferenceNumber
                }
            }
        }
    }
}