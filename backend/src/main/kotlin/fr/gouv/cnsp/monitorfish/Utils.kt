package fr.gouv.cnsp.monitorfish

import java.time.ZonedDateTime

class Utils {
    companion object {
        /**
         * Compares two strings by trimming them and checking if they are equivalent:
         *
         * If both strings are null or empty, they are considered equivalent.
         */
        fun areStringsEqual(
            leftString: String?,
            rightString: String?,
        ): Boolean {
            val normalizedLeftString = leftString?.trim().takeUnless { it.isNullOrEmpty() || it == " " }
            val normalizedRightString = rightString?.trim().takeUnless { it.isNullOrEmpty() || it == " " }

            return normalizedLeftString == normalizedRightString
        }

        /**
         * Checks if the ZonedDateTime is between the start and end times.
         */
        fun isZonedDateTimeBetween(
            zonedDateTime: ZonedDateTime,
            start: ZonedDateTime,
            end: ZonedDateTime,
            isInclusive: Boolean = false,
        ): Boolean {
            return if (isInclusive) {
                zonedDateTime >= start && zonedDateTime <= end
            } else {
                zonedDateTime > start && zonedDateTime < end
            }
        }
    }
}
