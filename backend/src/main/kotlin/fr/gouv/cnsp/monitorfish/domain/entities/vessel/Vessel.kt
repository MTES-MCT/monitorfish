package fr.gouv.cnsp.monitorfish.domain.entities.vessel

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.FRENCH_COUNTRY_CODES
import java.util.*

// TODO Remove all default values.
data class Vessel(
    val id: Int,
    // TODO Rename to either `cfr` (domain naming) or `commonFleetRegisterNumber` (ex: https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX%3A32017R0218).
    /** CFR (Common Fleet Register Number). */
    val internalReferenceNumber: String? = null,
    /** IMO (International Maritime Organization). IMO is one of multiple UVI (Unique Vessel Identifier) types. */
    val imo: String? = null,
    /** MMSI (Maritime Mobile Service Identity). */
    val mmsi: String? = null,
    // TODO Rename to either `callSign` (domain naming) or `internationRadioCallSign`.
    /** IRCS (International Radio Call Sign). */
    val ircs: String? = null,
    // TODO Rename to `externalMarking` (domaim naming + correct translation, ex: https://mer.gouv.fr/sites/default/files/2022-10/EU_Vessel_List_for_Jersey_Waters_Access_sept_22.pdf).
    val externalReferenceNumber: String? = null,
    // TODO Rename to `name`.
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
    val underCharter: Boolean? = null,
    val logbookEquipmentStatus: String? = null,
    val logbookSoftware: String? = null,
    val hasLogbookEsacapt: Boolean,
    val hasVisioCaptures: Boolean? = null,
) {
    fun getNationalIdentifier(): String {
        val internalReferenceNumberCountryCode =
            LIKELY_CONTROLLED_COUNTRY_CODES.find { countryAlpha3 ->
                internalReferenceNumber?.contains(
                    countryAlpha3,
                ) == true
            }
        val identifier = internalReferenceNumber?.replace("${internalReferenceNumberCountryCode}000", "") ?: ""

        if (districtCode.isNullOrEmpty()) {
            return identifier
        }

        return "$districtCode$identifier"
    }

    fun isFrench(): Boolean {
        return FRENCH_COUNTRY_CODES.contains(flagState.alpha2)
    }

    fun isLessThanTwelveMetersVessel(): Boolean {
        return length?.let { it < 12.0 } == true
    }
}

val LIKELY_CONTROLLED_COUNTRY_CODES =
    listOf(
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

val UNKNOWN_VESSEL = Vessel(id = -1, flagState = CountryCode.UNDEFINED, hasLogbookEsacapt = false)
