package fr.gouv.cnsp.monitorfish.infrastructure

class Utils {
    companion object {
        /**
         * Compares two strings by trimming them and checking if they are equivalent:
         *
         * If both strings are null or empty, they are considered equivalent.
         */
        fun areStringsEquivalent(leftString: String?, rightString: String?): Boolean {
            val normalizedLeftString = leftString?.trim().takeUnless { it.isNullOrEmpty() || it == " " }
            val normalizedRightString = rightString?.trim().takeUnless { it.isNullOrEmpty() || it == " " }

            return normalizedLeftString == normalizedRightString
        }
    }
}
