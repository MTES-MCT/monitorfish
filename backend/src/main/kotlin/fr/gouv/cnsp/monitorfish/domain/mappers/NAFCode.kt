package fr.gouv.cnsp.monitorfish.domain.mappers

import java.util.regex.Pattern

enum class NAFCode(val code: String) {
    START_RECORD("SR"),
    END_RECORD("ER"),
    FROM("FR"),
    TO("AD"),
    TYPE_OF_MESSAGE("TM"),
    DATE("DA"),
    TIME("TI"),
    INTERNAL_REFERENCE_NUMBER("IR"),
    FLAG("FS"),
    RADIO_CALL_SIGN("RC"),
    VESSEL_NAME("NA"),
    EXTERNAL_REFERENCE_NUMBER("XR"),
    LATITUDE_DECIMAL("LT"),
    LONGITUDE_DECIMAL("LG"),
    SPEED("SP"),
    COURSE("CO"),
    TEST_RECORD("TEST"),
    ACTIVITY("AC"),
    IMO_NUMBER("IM"),
    TRIP_NUMBER("TN"),
    LATITUDE("LA"),
    LONGITUDE("LO"),
    ;

    private val pattern: Pattern

    init {
        this.pattern = Pattern.compile(getPattern())
    }

    private fun getPattern(): String {
        // '//CODE/([^/]+)//'
        return "${DELIMITER}$code$SUBDELIMITER([^$SUBDELIMITER]+)$DELIMITER"
    }

    fun matches(nafMessage: String): Boolean {
        val matcher = pattern.matcher(nafMessage)
        return matcher.find()
    }

    fun getValue(nafMessage: String): String? {
        val matcher = pattern.matcher(nafMessage)
        matcher.find()
        return matcher.group(1)
    }

    companion object {
        const val DELIMITER = "//"
        const val SUBDELIMITER = "/"
    }
}
