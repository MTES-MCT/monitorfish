package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.Position
import fr.gouv.cnsp.monitorfish.domain.entities.PositionType
import java.io.Serializable
import java.time.ZonedDateTime
import javax.persistence.*

@Entity
@IdClass(LastPositionEntity.ReferenceCompositeKey::class)
@Table(name = "last_positions", uniqueConstraints = [UniqueConstraint(columnNames = ["internal_reference_number", "external_reference_number"])])
data class LastPositionEntity(
        @Id
        @Column(name = "internal_reference_number")
        val internalReferenceNumber: String? = null,
        @Column(name = "mmsi")
        val MMSI: String? = null,
        @Column(name = "ircs")
        val IRCS: String? = null,
        @Id
        @Column(name = "external_reference_number")
        val externalReferenceNumber: String? = null,
        @Column(name = "vessel_name")
        val vesselName: String? = null,
        @Column(name = "flag_state")
        @Enumerated(EnumType.STRING)
        val flagState: CountryCode? = null,
        @Column(name = "from_country")
        @Enumerated(EnumType.STRING)
        val from: CountryCode? = null,
        @Column(name = "destination_country")
        @Enumerated(EnumType.STRING)
        val destination: CountryCode? = null,
        @Column(name = "trip_number")
        val tripNumber: Int? = null,

        // Mandatory fields
        @Enumerated(EnumType.STRING)
        @Column(name = "position_type")
        val positionType: PositionType,
        @Column(name = "latitude")
        val latitude: Double,
        @Column(name = "longitude")
        val longitude: Double,
        @Column(name = "speed")
        val speed: Double,
        @Column(name = "course")
        val course: Double? = null,
        @Column(name = "date_time")
        val dateTime: ZonedDateTime) : Serializable {

        data class ReferenceCompositeKey(val internalReferenceNumber: String? = null, val externalReferenceNumber: String? = null) : Serializable

        fun toPosition() = Position(
            internalReferenceNumber = internalReferenceNumber,
            IRCS = IRCS,
            MMSI = MMSI,
            externalReferenceNumber = externalReferenceNumber,
            dateTime = dateTime,
            latitude = latitude,
            longitude = longitude,
            vesselName = vesselName,
            speed = speed,
            course = course,
            flagState = flagState,
            destination = destination,
            from = from,
            tripNumber = tripNumber,
            positionType = positionType)

        companion object {
                fun fromPosition(position: Position): LastPositionEntity {
                        return LastPositionEntity(
                                internalReferenceNumber = position.internalReferenceNumber,
                                IRCS = position.IRCS,
                                MMSI = position.MMSI,
                                externalReferenceNumber = position.externalReferenceNumber,
                                dateTime = position.dateTime,
                                latitude = position.latitude,
                                longitude = position.longitude,
                                vesselName = position.vesselName,
                                speed = position.speed,
                                course = position.course,
                                flagState = position.flagState,
                                destination = position.destination,
                                from = position.from,
                                tripNumber = position.tripNumber,
                                positionType = position.positionType
                        )
                }
        }
}
