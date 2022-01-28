package fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses

import fr.gouv.cnsp.monitorfish.domain.entities.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPosition
import java.time.ZonedDateTime

data class BeaconStatus(
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
        var riskFactor: Double? = null) {
    companion object {
        fun getVesselFromBeaconStatus(beaconStatus: BeaconStatus): (LastPosition) -> Boolean {
            return { lastPosition ->
                when (beaconStatus.vesselIdentifier) {
                    VesselIdentifier.INTERNAL_REFERENCE_NUMBER -> lastPosition.internalReferenceNumber == beaconStatus.internalReferenceNumber
                    VesselIdentifier.IRCS -> lastPosition.ircs == beaconStatus.ircs
                    VesselIdentifier.EXTERNAL_REFERENCE_NUMBER -> lastPosition.externalReferenceNumber == beaconStatus.externalReferenceNumber
                    else -> false
                }
            }
        }
    }
}