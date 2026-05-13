package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPositionAIS
import jakarta.persistence.*
import java.io.Serializable
import java.time.ZonedDateTime

@Entity
@Table(name = "last_positions_ais")
data class LastPositionAisEntity(
    @Id
    @Column(name = "mmsi")
    val mmsi: Long,
    @Column(name = "ircs")
    val ircs: String? = null,
    @Column(name = "external_immatriculation")
    val externalReferenceNumber: String? = null,
    @Column(name = "vessel_name")
    val vesselName: String? = null,
    @Column(name = "flag_state")
    val flagState: String? = null,
    @Column(name = "latitude")
    val latitude: Double,
    @Column(name = "longitude")
    val longitude: Double,
    @Column(name = "speed")
    val speed: Double? = null,
    @Column(name = "course")
    val course: Double? = null,
    @Column(name = "status")
    val status: String? = null,
    @Column(name = "last_position_datetime_utc")
    val dateTime: ZonedDateTime,
    @Column(name = "length")
    val length: Double? = null,
    @Column(name = "is_at_port")
    val isAtPort: Boolean,
    @Column(name = "imo")
    val imo: String? = null,
    @Column(name = "destination")
    val destination: String? = null,
    @Column(name = "ship_type")
    val shipType: Int? = null,
) : Serializable {
    fun toLastPositionAis() =
        LastPositionAIS(
            mmsi = mmsi,
            ircs = ircs,
            externalMarker = externalReferenceNumber,
            vesselName = vesselName,
            flagState =
                flagState?.let {
                    try {
                        CountryCode.valueOf(it)
                    } catch (e: IllegalArgumentException) {
                        CountryCode.UNDEFINED
                    }
                } ?: CountryCode.UNDEFINED,
            latitude = latitude,
            longitude = longitude,
            speed = speed,
            course = course,
            status = status,
            dateTime = dateTime,
            length = length,
            isAtPort = isAtPort,
            imo = imo,
            destination = destination,
            shipType = shipType,
        )
}
