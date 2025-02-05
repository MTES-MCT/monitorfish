package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.position.NetworkType
import fr.gouv.cnsp.monitorfish.domain.entities.position.Position
import fr.gouv.cnsp.monitorfish.domain.entities.position.PositionType
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.converters.CountryCodeConverter
import jakarta.persistence.*
import java.time.ZonedDateTime

@Entity
@Table(name = "positions")
data class PositionEntity(
    @Id
    @SequenceGenerator(name = "position_id_seq", sequenceName = "position_id_seq", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "position_id_seq")
    @Column(name = "id")
    val id: Int? = null,
    // Optional fields
    @Column(name = "internal_reference_number")
    val internalReferenceNumber: String? = null,
    @Column(name = "mmsi")
    val mmsi: String? = null,
    @Column(name = "ircs")
    val ircs: String? = null,
    @Column(name = "external_reference_number")
    val externalReferenceNumber: String? = null,
    @Column(name = "vessel_name")
    val vesselName: String? = null,
    @Column(name = "flag_state")
    @Convert(converter = CountryCodeConverter::class)
    val flagState: CountryCode,
    @Column(name = "from_country")
    @Enumerated(EnumType.STRING)
    val from: CountryCode? = null,
    @Column(name = "destination_country")
    @Enumerated(EnumType.STRING)
    val destination: CountryCode? = null,
    @Column(name = "trip_number")
    val tripNumber: String? = null,
    @Column(name = "is_manual")
    val isManual: Boolean? = false,
    @Column(name = "is_fishing")
    val isFishing: Boolean? = false,
    @Column(name = "is_at_port")
    val isAtPort: Boolean? = null,
    @Column(name = "network_type")
    @Enumerated(EnumType.STRING)
    val networkType: NetworkType? = null,
    @Column(name = "speed")
    val speed: Double? = null,
    @Column(name = "course")
    val course: Double? = null,
    // Mandatory fields
    @Enumerated(EnumType.STRING)
    @Column(name = "position_type")
    val positionType: PositionType,
    @Column(name = "latitude")
    val latitude: Double,
    @Column(name = "longitude")
    val longitude: Double,
    @Column(name = "date_time")
    val dateTime: ZonedDateTime,
) {
    fun toPosition() =
        Position(
            id = id,
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
            destination = destination,
            from = from,
            tripNumber = tripNumber,
            positionType = positionType,
            isManual = isManual,
            isFishing = isFishing,
            isAtPort = isAtPort,
            networkType = networkType,
        )

    companion object {
        fun fromPosition(position: Position): PositionEntity =
            PositionEntity(
                internalReferenceNumber = position.internalReferenceNumber,
                ircs = position.ircs,
                mmsi = position.mmsi,
                externalReferenceNumber = position.externalReferenceNumber,
                dateTime = position.dateTime,
                latitude = position.latitude,
                longitude = position.longitude,
                vesselName = position.vesselName,
                speed = position.speed,
                course = position.course,
                flagState = position.flagState ?: CountryCode.UNDEFINED,
                destination = position.destination,
                from = position.from,
                tripNumber = position.tripNumber,
                positionType = position.positionType,
                isManual = position.isManual,
                isFishing = position.isFishing,
                networkType = position.networkType,
            )
    }
}
