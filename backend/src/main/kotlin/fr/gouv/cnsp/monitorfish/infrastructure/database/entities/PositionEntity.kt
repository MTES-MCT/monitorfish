package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.Position
import java.time.ZonedDateTime
import javax.persistence.*

@Entity
@Table(name = "POSITIONS", indexes = [Index(columnList = "IMEI")])
data class PositionEntity(
        @Id
        @GeneratedValue(strategy = GenerationType.SEQUENCE)
        @Column(name = "ID")
        val id: Int? = null,
        @Column(name = "IMEI")
        val IMEI: String,
        @Column(name = "LATITUDE")
        val latitude: Double,
        @Column(name = "LONGITUDE")
        val longitude: Double,
        @Column(name = "SPEED")
        val speed: Double,
        @Column(name = "DIRECTION")
        val direction: Double,
        @Column(name = "POSITION_DATE")
        val positionDate: ZonedDateTime,
        @Column(name = "RECEIVED_DATE")
        val receivedDate: ZonedDateTime) {

    fun toPosition() = Position(
            id = this.id,
            IMEI = this.IMEI,
            latitude = this.latitude,
            longitude = this.longitude,
            speed = this.speed,
            direction = this.direction,
            positionDate = this.positionDate,
            receivedDate = this.receivedDate)
}