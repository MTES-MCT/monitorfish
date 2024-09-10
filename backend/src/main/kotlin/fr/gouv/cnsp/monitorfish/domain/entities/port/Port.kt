package fr.gouv.cnsp.monitorfish.domain.entities.port

data class Port(
    val locode: String,
    /** ISO Alpha-2 country code */
    val countryCode: String?,
    val name: String,
    val facade: String?,
    val faoAreas: List<String>,
    val latitude: Double?,
    val longitude: Double?,
    val region: String?,
) {
    private val FRENCH_PORT_COUNTRY_CODES =
        listOf<String>(
            "TF", "MQ", "GF", "YT", "GP", "RE", "NC", "PF", "BL", "MF", "PM", "WF",
        )

    fun isFrenchOrUnknown(): Boolean {
        return this.countryCode === null || FRENCH_PORT_COUNTRY_CODES.contains(countryCode)
    }
}
