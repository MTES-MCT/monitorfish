package fr.gouv.cnsp.monitorfish.domain.entities

import java.time.ZonedDateTime

data class Position(
        val id: Int?,
        val IMEI: String,
        val latitude: Double,
        val longitude: Double,
        val speed: Double,
        val direction: Double,
        val positionDate: ZonedDateTime,
        val receivedDate: ZonedDateTime)