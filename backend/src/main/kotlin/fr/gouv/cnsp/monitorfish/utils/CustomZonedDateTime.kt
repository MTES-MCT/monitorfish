package fr.gouv.cnsp.monitorfish.utils

import java.time.ZoneOffset
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter

/**
 * A custom and consistent `ZonedDateTime` that always uses UTC as the time zone.
 *
 * The overridden `toString()` method ensures seconds are always present in the output
 * (= never omitted when equal to `00`) and removes unecessary milli/micro/nanoseconds.
 */
data class CustomZonedDateTime(private val dateAsZonedDateTime: ZonedDateTime) {
    companion object {
        val dateTimeFormatter: DateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssX")

        fun fromZonedDateTime(dateAsZonedDateTime: ZonedDateTime): CustomZonedDateTime {
            val dateAsUtcZonedDateTime = dateAsZonedDateTime.withZoneSameInstant(ZoneOffset.UTC)

            return CustomZonedDateTime(dateAsUtcZonedDateTime)
        }

        fun now(): CustomZonedDateTime {
            val dateAsUtcZonedDateTime = ZonedDateTime.now().withZoneSameInstant(ZoneOffset.UTC)

            return CustomZonedDateTime(dateAsUtcZonedDateTime)
        }

        fun parse(dateAsString: String): CustomZonedDateTime {
            val dateAsUtcZonedDateTime =
                ZonedDateTime
                    .parse(dateAsString, dateTimeFormatter)
                    .withZoneSameInstant(ZoneOffset.UTC)

            return CustomZonedDateTime(dateAsUtcZonedDateTime)
        }
    }

    override fun toString(): String {
        val utcZonedDateTime = dateAsZonedDateTime.withZoneSameInstant(ZoneOffset.UTC)

        return utcZonedDateTime.format(dateTimeFormatter)
    }

    fun toZonedDateTime(): ZonedDateTime {
        return dateAsZonedDateTime.withZoneSameInstant(ZoneOffset.UTC)
    }
}
