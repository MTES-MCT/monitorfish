package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.BeaconStatusAction
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.BeaconStatusActionPropertyName
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.Stage
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.VesselStatus
import java.time.Instant
import java.time.ZoneOffset
import javax.persistence.*

@Entity
@Table(name = "beacon_status_actions")
data class BeaconStatusActionEntity(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Basic(optional = false)
        @Column(name = "id",unique = true, nullable = false)
        val id: Int?,
        @Column(name = "beacon_status_id")
        val beaconStatusId: Int,
        @Column(name = "property_name")
        @Enumerated(EnumType.STRING)
        val propertyName: BeaconStatusActionPropertyName,
        @Column(name = "previous_value")
        val previousValue: String,
        @Column(name = "next_value")
        val nextValue: String,
        @Column(name = "date_time_utc")
        val dateTime: Instant) {

    fun toBeaconStatusAction() = BeaconStatusAction(
            id = id!!,
            beaconStatusId = beaconStatusId,
            propertyName = propertyName,
            previousValue = previousValue,
            nextValue = nextValue,
            dateTime = dateTime.atZone(ZoneOffset.UTC))

    companion object {
        fun fromBeaconStatusAction(beaconStatusAction: BeaconStatusAction): BeaconStatusActionEntity {
            if (beaconStatusAction.propertyName === BeaconStatusActionPropertyName.VESSEL_STATUS) {
                try {
                    VesselStatus.valueOf(beaconStatusAction.previousValue)
                    VesselStatus.valueOf(beaconStatusAction.nextValue)
                } catch (e: IllegalArgumentException) {
                    throw IllegalArgumentException("One of the previous or next values are incorrect for the property " +
                            "${BeaconStatusActionPropertyName.VESSEL_STATUS}. Previous value is " +
                            "'${beaconStatusAction.previousValue}' and next value is '${beaconStatusAction.nextValue}'.")
                }
            }

            if (beaconStatusAction.propertyName === BeaconStatusActionPropertyName.STAGE) {
                try {
                    Stage.valueOf(beaconStatusAction.previousValue)
                    Stage.valueOf(beaconStatusAction.nextValue)
                } catch (e: IllegalArgumentException) {
                    throw IllegalArgumentException("One of the previous or next values are incorrect for the property " +
                            "${BeaconStatusActionPropertyName.STAGE}. Previous value is " +
                            "'${beaconStatusAction.previousValue}' and next value is '${beaconStatusAction.nextValue}'.")
                }
            }

            return BeaconStatusActionEntity(
                    id = beaconStatusAction.id,
                    beaconStatusId = beaconStatusAction.beaconStatusId,
                    propertyName = beaconStatusAction.propertyName,
                    previousValue = beaconStatusAction.previousValue,
                    nextValue = beaconStatusAction.nextValue,
                    dateTime = beaconStatusAction.dateTime.toInstant()
            )
        }
    }
}
