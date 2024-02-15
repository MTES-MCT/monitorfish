package fr.gouv.cnsp.monitorfish.domain.entities.vessel

import com.neovisionaries.i18n.CountryCode
import java.util.*

data class Vessel(
    val id: Int,
    val internalReferenceNumber: String? = null,
    val imo: String? = null,
    val mmsi: String? = null,
    val ircs: String? = null,
    val externalReferenceNumber: String? = null,
    val vesselName: String? = null,
    val flagState: CountryCode,
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
    val declaredFishingGears: List<String>? = null,
    val pinger: Boolean? = null,
    val navigationLicenceExpirationDate: Date? = null,
    val operatorName: String? = null,
    val operatorPhones: List<String>? = null,
    val operatorEmail: String? = null,
    val proprietorName: String? = null,
    val proprietorPhones: List<String>? = null,
    val proprietorEmails: List<String>? = null,
    val vesselPhones: List<String>? = null,
    val vesselEmails: List<String>? = null,
    val beaconNumber: String? = null,
    val underCharter: Boolean? = null,
) {
    fun getNationalIdentifier(): String {
        val internalReferenceNumberCountryCode = LIKELY_CONTROLLED_COUNTRY_CODES.find { countryAlpha3 ->
            internalReferenceNumber?.contains(
                countryAlpha3,
            ) ?: false
        }
        val identifier = internalReferenceNumber?.replace("${internalReferenceNumberCountryCode}000", "") ?: ""

        if (districtCode.isNullOrEmpty()) {
            return identifier
        }

        return "$districtCode$identifier"
    }
}

val LIKELY_CONTROLLED_COUNTRY_CODES = listOf(
    CountryCode.FR.alpha3,
    CountryCode.RU.alpha3,
    CountryCode.KR.alpha3,
    CountryCode.JP.alpha3,
    CountryCode.LY.alpha3,
    CountryCode.VE.alpha3,
    CountryCode.SC.alpha3,
    CountryCode.AU.alpha3,
    CountryCode.CN.alpha3,
    CountryCode.MG.alpha3,
    CountryCode.BR.alpha3,
    CountryCode.PL.alpha3,
    CountryCode.VU.alpha3,
    CountryCode.KM.alpha3,
    CountryCode.MC.alpha3,
    CountryCode.BW.alpha3,
    CountryCode.AI.alpha3,
    CountryCode.LK.alpha3,
    CountryCode.TW.alpha3,
    CountryCode.TT.alpha3,
    CountryCode.FO.alpha3,
    CountryCode.GY.alpha3,
    CountryCode.PA.alpha3,
    CountryCode.SX.alpha3,
    CountryCode.TN.alpha3,
    CountryCode.TR.alpha3,
    CountryCode.AL.alpha3,
    CountryCode.GD.alpha3,
    CountryCode.DZ.alpha3,
    CountryCode.SX.alpha3,
    CountryCode.BE.alpha3,
    CountryCode.DK.alpha3,
    CountryCode.DE.alpha3,
    CountryCode.EE.alpha3,
    CountryCode.IE.alpha3,
    CountryCode.ES.alpha3,
    CountryCode.IT.alpha3,
    CountryCode.NL.alpha3,
    CountryCode.NO.alpha3,
    CountryCode.PT.alpha3,
    CountryCode.SE.alpha3,
    CountryCode.GB.alpha3,
)
