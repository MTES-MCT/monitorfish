package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.Beacon
import java.time.ZonedDateTime

data class BeaconDataOutput(
    val beaconNumber: String,
    val isCoastal: Boolean? = null,
    val loggingDatetimeUtc: ZonedDateTime? = null,
) {
    companion object {
        fun fromBeacon(beacon: Beacon): BeaconDataOutput {
            return BeaconDataOutput(
                beaconNumber = beacon.beaconNumber,
                isCoastal = beacon.isCoastal,
                loggingDatetimeUtc = beacon.loggingDatetimeUtc,
            )
        }
    }
}
