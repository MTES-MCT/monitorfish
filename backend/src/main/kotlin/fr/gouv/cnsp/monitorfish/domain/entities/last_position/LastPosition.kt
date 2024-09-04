package fr.gouv.cnsp.monitorfish.domain.entities.last_position

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.position.PositionType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import java.time.Duration
import java.time.ZonedDateTime

data class LastPosition(
    val id: Int? = null,
    // Vessel identification properties
    val vesselId: Int? = null,
    // Unique code composed by the contracting party/cooperating non-contracting party expressed as 3-alpha
    // country code followed by the vessel registration number as recorded in the national fleet register
    val internalReferenceNumber: String? = null,
    // Maritime Mobile Service Identity (MMSI)
    val mmsi: String? = null,
    // International Radio Call Sign of the vessel (IRCS)
    val ircs: String? = null,
    // i.e side number, registration number, IMO number or any other external marking identifying the vessel
    val externalReferenceNumber: String? = null,
    val vesselName: String? = null,
    val flagState: CountryCode,
    val positionType: PositionType,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val estimatedCurrentLatitude: Double? = null,
    val estimatedCurrentLongitude: Double? = null,
    val speed: Double? = null,
    val course: Double? = null,
    val dateTime: ZonedDateTime,
    val tripNumber: String? = null,
    val emissionPeriod: Duration? = null,
    val lastLogbookMessageDateTime: ZonedDateTime? = null,
    val departureDateTime: ZonedDateTime? = null,
    val width: Double? = null,
    val length: Double? = null,
    val registryPortName: String? = null,
    val district: String? = null,
    val districtCode: String? = null,
    val gearOnboard: List<Gear>? = listOf(),
    val segments: List<String>? = listOf(),
    val speciesOnboard: List<Species>? = listOf(),
    val totalWeightOnboard: Double? = null,
    val lastControlDateTime: ZonedDateTime? = null,
    val lastControlInfraction: Boolean? = null,
    val postControlComment: String? = null,
    val vesselIdentifier: VesselIdentifier,
    val impactRiskFactor: Double? = null,
    val probabilityRiskFactor: Double? = null,
    val detectabilityRiskFactor: Double? = null,
    val riskFactor: Double? = null,
    val underCharter: Boolean? = null,
    val isAtPort: Boolean? = null,
    val alerts: List<String>? = listOf(),
    val beaconMalfunctionId: Int? = null,
    val reportings: List<String> = listOf(),
)
