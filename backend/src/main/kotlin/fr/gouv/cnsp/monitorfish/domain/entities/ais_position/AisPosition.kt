package fr.gouv.cnsp.monitorfish.domain.entities.ais_position

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
)
