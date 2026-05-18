package fr.gouv.cnsp.monitorfish.domain.entities.last_position

import com.neovisionaries.i18n.CountryCode
import java.time.ZonedDateTime

data class LastPositionAIS(
    val mmsi: Long,
    val ircs: String? = null,
    val externalMarker: String? = null,
    val vesselName: String? = null,
    val flagState: CountryCode = CountryCode.UNDEFINED,
    val latitude: Double,
    val longitude: Double,
    val speed: Double? = null,
    val course: Double? = null,
    val status: String? = null,
    val dateTime: ZonedDateTime,
    val length: Double? = null,
    val isAtPort: Boolean = false,
    val imo: String? = null,
    val destination: String? = null,
    val shipType: Int? = null,
)
