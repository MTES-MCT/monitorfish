package fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses

import java.time.ZonedDateTime

data class BeaconStatusAction(
        val id: Int? = null,
        val beaconStatusId: Int,
        val propertyName: BeaconStatusActionPropertyName,
        val previousValue: String,
        val nextValue: String,
        val dateTime: ZonedDateTime)
