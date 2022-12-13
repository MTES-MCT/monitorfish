package fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions

import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPosition
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import java.time.ZonedDateTime

data class BeaconMalfunction(
    val id: Int,
    val internalReferenceNumber: String?,
    val externalReferenceNumber: String?,
    val ircs: String?,
    val flagState: String?,
    val vesselIdentifier: VesselIdentifier?,
    val vesselName: String,
    val vesselStatus: VesselStatus,
    val stage: Stage,
    val malfunctionStartDateTime: ZonedDateTime,
    val malfunctionEndDateTime: ZonedDateTime?,
    val vesselStatusLastModificationDateTime: ZonedDateTime,
    var riskFactor: Double? = null,
    val endOfBeaconMalfunctionReason: EndOfBeaconMalfunctionReason? = null,
    val vesselId: Int,
    val notificationRequested: BeaconMalfunctionNotificationType? = null,
    val requestedNotificationForeignFmcCode: String? = null,
    val beaconNumber: String,
    val beaconStatusAtMalfunctionCreation: BeaconStatus,
) {
    companion object {
        fun getVesselFromBeaconMalfunction(beaconMalfunction: BeaconMalfunction): (LastPosition) -> Boolean {
            return { lastPosition ->
                when (beaconMalfunction.vesselIdentifier) {
                    VesselIdentifier.INTERNAL_REFERENCE_NUMBER -> lastPosition.internalReferenceNumber == beaconMalfunction.internalReferenceNumber
                    VesselIdentifier.IRCS -> lastPosition.ircs == beaconMalfunction.ircs
                    VesselIdentifier.EXTERNAL_REFERENCE_NUMBER -> lastPosition.externalReferenceNumber == beaconMalfunction.externalReferenceNumber
                    else -> false
                }
            }
        }
    }
}
