package fr.gouv.cnsp.monitorfish.domain.entities.port

import fr.gouv.cnsp.monitorfish.domain.FRENCH_COUNTRY_CODES

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
    fun isFrenchOrUnknown(): Boolean {
        return this.countryCode === null || FRENCH_COUNTRY_CODES.contains(countryCode)
    }
}
