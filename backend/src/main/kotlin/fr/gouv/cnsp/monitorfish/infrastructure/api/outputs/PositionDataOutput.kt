package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.Position
import fr.gouv.cnsp.monitorfish.domain.entities.PositionType
import java.time.ZonedDateTime

data class PositionDataOutput(
        val internalReferenceNumber: String ? = null,
        val mmsi: String? = null,
        val ircs: String? = null,
        val externalReferenceNumber: String? = null,
        val vesselName: String? = null,
        val flagState: CountryCode? = null,
        val latitude: Double,
        val longitude: Double,
        val speed: Double,
        val course: Double?,
        val dateTime: ZonedDateTime,
        val from: CountryCode? = null,
        val destination: CountryCode? = null,
        val tripNumber: Int? = null,
        val positionType: PositionType) {
    companion object {
        fun fromPosition(position: Position): PositionDataOutput {
            return PositionDataOutput(
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
                    flagState = position.flagState,
                    destination = position.destination,
                    from = position.from,
                    tripNumber = position.tripNumber,
                    positionType = position.positionType
            )
        }
    }
}