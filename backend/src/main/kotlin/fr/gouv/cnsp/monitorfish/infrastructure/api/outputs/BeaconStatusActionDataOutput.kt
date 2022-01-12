package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.BeaconStatusAction
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.BeaconStatusActionPropertyName
import java.time.ZonedDateTime

data class BeaconStatusActionDataOutput(
        val beaconStatusId: Int,
        val propertyName: BeaconStatusActionPropertyName,
        val previousValue: String,
        val nextValue: String,
        val dateTime: ZonedDateTime) {
    companion object {
        fun fromBeaconStatusAction(beaconStatusAction: BeaconStatusAction): BeaconStatusActionDataOutput {
            return BeaconStatusActionDataOutput(
                    beaconStatusId = beaconStatusAction.beaconStatusId,
                    propertyName = beaconStatusAction.propertyName,
                    previousValue = beaconStatusAction.previousValue,
                    nextValue = beaconStatusAction.nextValue,
                    dateTime = beaconStatusAction.dateTime)
        }
    }
}
