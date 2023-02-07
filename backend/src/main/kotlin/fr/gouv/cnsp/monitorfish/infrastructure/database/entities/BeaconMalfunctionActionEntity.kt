package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionAction
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionActionPropertyName
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.Stage
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.VesselStatus
import jakarta.persistence.*
import java.time.Instant
import java.time.ZoneOffset

@Entity
@Table(name = "beacon_malfunction_actions")
data class BeaconMalfunctionActionEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id", unique = true, nullable = false)
    val id: Int?,
    @Column(name = "beacon_malfunction_id")
    val beaconMalfunctionId: Int,
    @Column(name = "property_name")
    @Enumerated(EnumType.STRING)
    val propertyName: BeaconMalfunctionActionPropertyName,
    @Column(name = "previous_value")
    val previousValue: String,
    @Column(name = "next_value")
    val nextValue: String,
    @Column(name = "date_time_utc")
    val dateTime: Instant,
) {

    fun toBeaconMalfunctionAction() = BeaconMalfunctionAction(
        id = id!!,
        beaconMalfunctionId = beaconMalfunctionId,
        propertyName = propertyName,
        previousValue = previousValue,
        nextValue = nextValue,
        dateTime = dateTime.atZone(ZoneOffset.UTC),
    )

    companion object {
        fun fromBeaconMalfunctionAction(beaconMalfunctionAction: BeaconMalfunctionAction): BeaconMalfunctionActionEntity {
            if (beaconMalfunctionAction.propertyName === BeaconMalfunctionActionPropertyName.VESSEL_STATUS) {
                try {
                    VesselStatus.valueOf(beaconMalfunctionAction.previousValue)
                    VesselStatus.valueOf(beaconMalfunctionAction.nextValue)
                } catch (e: IllegalArgumentException) {
                    throw IllegalArgumentException(
                        "One of the previous or next values are incorrect for the property " +
                            "${BeaconMalfunctionActionPropertyName.VESSEL_STATUS}. Previous value is " +
                            "'${beaconMalfunctionAction.previousValue}' and next value is '${beaconMalfunctionAction.nextValue}'.",
                    )
                }
            }

            if (beaconMalfunctionAction.propertyName === BeaconMalfunctionActionPropertyName.STAGE) {
                try {
                    Stage.valueOf(beaconMalfunctionAction.previousValue)
                    Stage.valueOf(beaconMalfunctionAction.nextValue)
                } catch (e: IllegalArgumentException) {
                    throw IllegalArgumentException(
                        "One of the previous or next values are incorrect for the property " +
                            "${BeaconMalfunctionActionPropertyName.STAGE}. Previous value is " +
                            "'${beaconMalfunctionAction.previousValue}' and next value is '${beaconMalfunctionAction.nextValue}'.",
                    )
                }
            }

            return BeaconMalfunctionActionEntity(
                id = beaconMalfunctionAction.id,
                beaconMalfunctionId = beaconMalfunctionAction.beaconMalfunctionId,
                propertyName = beaconMalfunctionAction.propertyName,
                previousValue = beaconMalfunctionAction.previousValue,
                nextValue = beaconMalfunctionAction.nextValue,
                dateTime = beaconMalfunctionAction.dateTime.toInstant(),
            )
        }
    }
}
