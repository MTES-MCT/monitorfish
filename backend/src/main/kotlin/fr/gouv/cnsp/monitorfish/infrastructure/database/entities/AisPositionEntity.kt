package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.ais_position.AisPosition
import jakarta.persistence.*
import java.io.Serializable
import java.time.ZonedDateTime

@Embeddable
data class AisPositionPK(
    @Column(name = "mmsi")
    val mmsi: Long,
    @Column(name = "date_time")
    val dateTime: ZonedDateTime,
) : Serializable

@Entity
@Table(name = "ais_positions")
data class AisPositionEntity(
    @EmbeddedId
    val pk: AisPositionPK,
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
    @Column(name = "imo")
    val imo: String? = null,
    @Column(name = "ship_type")
    val shipType: Int? = null,
    @Column(name = "destination")
    val destination: String? = null,
    @Column(name = "cfr")
    val cfr: String? = null,
    @Column(name = "external_immatriculation")
    val externalImmatriculation: String? = null,
    @Column(name = "vessel_name")
    val vesselName: String? = null,
    @Column(name = "ircs")
    val ircs: String? = null,
    @Column(name = "flag_state")
    val flagState: String? = null,
    @Column(name = "length")
    val length: Double? = null,
) {
    companion object {
        fun fromAisPosition(position: AisPosition): AisPositionEntity =
            AisPositionEntity(
                pk = AisPositionPK(mmsi = position.mmsi, dateTime = position.dateTime),
                latitude = position.latitude,
                longitude = position.longitude,
                speed = position.speed,
                course = position.course,
                status = position.status,
                imo = position.imo,
                shipType = position.shipType,
                destination = position.destination,
                cfr = position.cfr,
                externalImmatriculation = position.externalImmatriculation,
                vesselName = position.vesselName,
                ircs = position.ircs,
                flagState = position.flagState,
                length = position.length,
            )
    }
}
