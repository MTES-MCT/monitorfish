package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionAction
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionActionPropertyName
import java.time.ZonedDateTime

data class BeaconMalfunctionActionDataOutput(
    val beaconMalfunctionId: Int,
    val propertyName: BeaconMalfunctionActionPropertyName,
    val previousValue: String,
    val nextValue: String,
    val dateTime: ZonedDateTime,
) {
    companion object {
        fun fromBeaconMalfunctionAction(beaconMalfunctionAction: BeaconMalfunctionAction): BeaconMalfunctionActionDataOutput {
            return BeaconMalfunctionActionDataOutput(
                beaconMalfunctionId = beaconMalfunctionAction.beaconMalfunctionId,
                propertyName = beaconMalfunctionAction.propertyName,
                previousValue = beaconMalfunctionAction.previousValue,
                nextValue = beaconMalfunctionAction.nextValue,
                dateTime = beaconMalfunctionAction.dateTime,
            )
        }
    }
}
