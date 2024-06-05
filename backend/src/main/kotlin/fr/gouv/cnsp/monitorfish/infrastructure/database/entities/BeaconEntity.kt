package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.Beacon
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconStatus
import jakarta.persistence.*
import java.time.Instant
import java.time.ZoneOffset

@Entity
@Table(name = "beacons")
data class BeaconEntity(
    @Id
    @Column(name = "beacon_number")
    val beaconNumber: String,
    @Column(name = "vessel_id")
    val vesselId: Int? = null,
    @Column(name = "beacon_status")
    @Enumerated(EnumType.STRING)
    val beaconStatus: BeaconStatus? = null,
    @Column(name = "satellite_operator_id")
    val satelliteOperatorId: Int? = null,
    @Column(name = "is_coastal")
    val isCoastal: Boolean? = null,
    @Column(name = "logging_datetime_utc")
    val loggingDatetimeUtc: Instant? = null,

) {

    fun toBeacon() = Beacon(
        beaconNumber = beaconNumber,
        vesselId = vesselId,
        beaconStatus = beaconStatus,
        satelliteOperatorId = satelliteOperatorId,
        isCoastal = isCoastal,
        loggingDatetimeUtc = loggingDatetimeUtc?.atZone(ZoneOffset.UTC),
    )
}
