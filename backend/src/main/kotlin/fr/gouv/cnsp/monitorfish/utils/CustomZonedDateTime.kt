package fr.gouv.cnsp.monitorfish.utils

import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter

data class CustomZonedDateTime(private val zonedDateTime: ZonedDateTime) {
    companion object {
        val dateTimeFormatter: DateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssX")

        fun fromZonedDateTime(zonedDateTime: ZonedDateTime): CustomZonedDateTime {
            return CustomZonedDateTime(zonedDateTime)
        }
    }

    override fun toString(): String {
        return zonedDateTime.format(dateTimeFormatter)
    }

    fun toZonedDateTime(): ZonedDateTime {
        return zonedDateTime
    }
}
