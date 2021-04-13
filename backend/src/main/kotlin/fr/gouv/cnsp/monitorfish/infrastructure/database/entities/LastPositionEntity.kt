package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.Position
import fr.gouv.cnsp.monitorfish.domain.entities.PositionType
import java.io.Serializable
import java.time.ZonedDateTime
import javax.persistence.*

@Entity
@IdClass(LastPositionEntity.ReferenceCompositeKey::class)
@Table(name = "last_positions", uniqueConstraints = [UniqueConstraint(columnNames = ["cfr", "external_immatriculation"])])
data class LastPositionEntity(
        @Id
        @Column(name = "cfr")
        val internalReferenceNumber: String? = null,
        @Column(name = "mmsi")
        val mmsi: String? = null,
        @Column(name = "ircs")
        val ircs: String? = null,
        @Id
        @Column(name = "external_immatriculation")
        val externalReferenceNumber: String? = null,
        @Column(name = "vessel_name")
        val vesselName: String? = null,
        @Column(name = "flag_state")
        @Enumerated(EnumType.STRING)
        val flagState: CountryCode? = null,
        @Column(name = "trip_number")
        val tripNumber: Int? = null,

        // Mandatory fields
        @Column(name = "latitude")
        val latitude: Double,
        @Column(name = "longitude")
        val longitude: Double,
        @Column(name = "speed")
        val speed: Double,
        @Column(name = "course")
        val course: Double? = null,
        @Column(name = "last_position_datetime_utc")
        val dateTime: ZonedDateTime) : Serializable {

        data class ReferenceCompositeKey(val internalReferenceNumber: String? = null, val externalReferenceNumber: String? = null) : Serializable

        fun toPosition() = Position(
            internalReferenceNumber = internalReferenceNumber,
            ircs = ircs,
            mmsi = mmsi,
            externalReferenceNumber = externalReferenceNumber,
            dateTime = dateTime,
            latitude = latitude,
            longitude = longitude,
            vesselName = vesselName,
            speed = speed,
            course = course,
            flagState = flagState,
            tripNumber = tripNumber,
            positionType = PositionType.VMS)

        companion object {
                fun fromPosition(position: Position): LastPositionEntity {
                        return LastPositionEntity(
                                internalReferenceNumber = position.internalReferenceNumber ?: "",
                                ircs = position.ircs,
                                mmsi = position.mmsi,
                                externalReferenceNumber = position.externalReferenceNumber ?: "",
                                dateTime = position.dateTime,
                                latitude = position.latitude,
                                longitude = position.longitude,
                                vesselName = position.vesselName,
                                speed = position.speed,
                                course = position.course,
                                flagState = position.flagState,
                                tripNumber = position.tripNumber
                        )
                }
        }
}
