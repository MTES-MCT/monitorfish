package fr.gouv.cnsp.monitorfish.infrastructure.kafka

import com.fasterxml.jackson.annotation.JsonProperty
import fr.gouv.cnsp.monitorfish.domain.entities.ais_position.AisPosition
import java.time.ZonedDateTime

data class AisPositionMessage(
    val mmsi: Long,
    val coord: String?,
    val ts: ZonedDateTime,
    val course: Double? = null,
    val speed: Double? = null,
    val status: String? = null,
    val features: AisFeatures? = null,
) {
    fun toAisPosition(): AisPosition {
        val (longitude, latitude) = parseCoord(coord)
        val ais = features?.ais
        val navpro = features?.navpro
        return AisPosition(
            mmsi = mmsi,
            dateTime = ts,
            latitude = latitude,
            longitude = longitude,
            speed = speed,
            course = course,
            status = status,
            imo = ais?.imo ?: navpro?.imo?.toString(),
            shipType = ais?.shiptype,
            destination = ais?.destination,
            cfr = navpro?.cfr,
            externalImmatriculation = navpro?.externalImmatriculation,
            vesselName = navpro?.vesselName ?: ais?.shipname,
            ircs = ais?.callsign ?: navpro?.ircs,
            flagState = navpro?.flagState,
            length = if (ais?.toBow != null && ais.toStern != null) ais.toBow + ais.toStern else null,
        )
    }

    private fun parseCoord(coord: String?): Pair<Double, Double> {
        if (coord == null) return Pair(0.0, 0.0)
        // WKT format: "POINT(longitude latitude)"
        val content = coord.removePrefix("POINT(").removeSuffix(")")
        val parts = content.trim().split(" ")
        return Pair(parts[0].toDouble(), parts[1].toDouble())
    }
}

data class AisFeatures(
    val ais: AisDetails? = null,
    val navpro: NavproDetails? = null,
)

data class AisDetails(
    val imo: String? = null,
    val callsign: String? = null,
    val shipname: String? = null,
    val shiptype: Int? = null,
    val destination: String? = null,
    @JsonProperty("to_bow") val toBow: Double? = null,
    @JsonProperty("to_stern") val toStern: Double? = null,
)

data class NavproDetails(
    val imo: Long? = null,
    val cfr: String? = null,
    @JsonProperty("external_immatriculation") val externalImmatriculation: String? = null,
    @JsonProperty("vessel_name") val vesselName: String? = null,
    val ircs: String? = null,
    @JsonProperty("flag_state") val flagState: String? = null,
)
