package fr.gouv.cnsp.monitorfish.domain.entities

import com.neovisionaries.i18n.CountryCode
import java.time.ZonedDateTime

enum class PositionType {
    VMS,
    AIS
}

data class Position(
        val id: Int? = null,

        /* Ship identification properties */
        // Unique code composed by the contracting party/cooperating non-contracting party expressed as 3-alpha
        // country code followed by the vessel registration number as recorded in the national fleet register
        val internalReferenceNumber: String ? = null,
        // Maritime Mobile Service Identity (MMSI)
        val MMSI: String? = null,
        // International Radio Call Sign of the vessel (IRCS)
        val IRCS: String? = null,
        // i.e side number, registration number, IMO number or any other external marking identifying the vessel
        val externalReferenceNumber: String? = null,
        val vesselName: String? = null,
        val flagState: CountryCode? = null,
        val positionType: PositionType,

        val latitude: Double,
        val longitude: Double,
        val speed: Double,
        val course: Double,
        val dateTime: ZonedDateTime,
        val from: CountryCode? = null,
        val destination: CountryCode? = null,
        val tripNumber: Int? = null)