package fr.gouv.cnsp.monitorfish.domain.entities.ais_position

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPositionAIS
import fr.gouv.cnsp.monitorfish.domain.entities.position.Position
import fr.gouv.cnsp.monitorfish.domain.entities.position.PositionType
import java.time.ZonedDateTime

data class AisPosition(
    val mmsi: Long,
    val dateTime: ZonedDateTime,
    val latitude: Double,
    val longitude: Double,
    val speed: Double? = null,
    val course: Double? = null,
    val status: String? = null,
    val imo: String? = null,
    val shipType: Int? = null,
    val destination: String? = null,
    val cfr: String? = null,
    val externalImmatriculation: String? = null,
    val vesselName: String? = null,
    val ircs: String? = null,
    val flagState: String? = null,
    val length: Double? = null,
) {
    fun toPosition(): Position =
        Position(
            internalReferenceNumber = cfr,
            mmsi = mmsi.toString(),
            ircs = ircs,
            externalReferenceNumber = externalImmatriculation,
            vesselName = vesselName,
            flagState = flagState?.let { runCatching { CountryCode.valueOf(it) }.getOrElse { CountryCode.UNDEFINED } },
            positionType = PositionType.AIS,
            latitude = latitude,
            longitude = longitude,
            speed = speed,
            course = course,
            dateTime = dateTime,
        )

    fun toLastPositionAIS(): LastPositionAIS =
        LastPositionAIS(
            mmsi = mmsi,
            ircs = ircs,
            externalMarker = externalImmatriculation,
            vesselName = vesselName,
            latitude = latitude,
            longitude = longitude,
            speed = speed,
            course = course,
            status = status,
            dateTime = dateTime,
            length = length,
            imo = imo,
            destination = destination,
            shipType = shipType,
        )
}
