package fr.gouv.cnsp.monitorfish.domain.entities

import com.neovisionaries.i18n.CountryCode
import java.time.ZonedDateTime

data class Vessel(
        val internalReferenceNumber: String? = null,
        val MMSI: String? = null,
        val IRCS: String? = null,
        val externalReferenceNumber: String? = null,
        val vesselName: String? = null,
        val flagState: CountryCode? = null,
        val width: Double? = null,
        val length: Double? = null,
        val district: String? = null,
        val districtCode: String? = null,
        val gauge: Double? = null,
        val registryPort: String? = null,
        val power: Double? = null,
        val vesselType: String? = null,
        val sailingCategory: String? = null,
        val sailingType: String? = null,
        val declaredFishingGearMain: String? = null,
        val declaredFishingGearSecondary: String? = null,
        val declaredFishingGearThird: String? = null,
        val weightAuthorizedOnDeck: Double? = null,
        val pinger: Boolean? = null,
        val navigationLicenceExpirationDate: ZonedDateTime? = null,
        val shipownerName: String? = null,
        val shipownerTelephoneNumber: String? = null,
        val shipownerEmail: String? = null,
        val fisherName: String? = null,
        val fisherTelephoneNumber: String? = null,
        val fisherEmail: String? = null)
