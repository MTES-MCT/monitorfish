package fr.gouv.cnsp.monitorfish.domain.entities

import com.neovisionaries.i18n.CountryCode

data class Vessel(
        val internalReferenceNumber: String ? = null,
        val externalReferenceNumber: String? = null,
        val vesselName: String? = null,
        val flagState: CountryCode? = null,
        val gearType: String? = null,
        val vesselType: String? = null)
