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
    val underCharter: Boolean? = null
)
