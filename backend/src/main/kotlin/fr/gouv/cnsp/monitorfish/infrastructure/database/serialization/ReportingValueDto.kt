package fr.gouv.cnsp.monitorfish.infrastructure.database.serialization

import com.fasterxml.jackson.annotation.JsonAlias
import com.fasterxml.jackson.annotation.JsonProperty
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.OtherSource
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingSource
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.SatelliteSource

/**
 * Data class for JSON serialization/deserialization of InfractionSuspicion reporting value.
 * This is used for the JSONB `value` column in the database.
 */
data class InfractionSuspicionDto(
    @JsonAlias("reportingActor")
    val reportingSource: ReportingSource,
    val controlUnitId: Int? = null,
    @Deprecated("Replaced by createdBy filled in the controller")
    val authorTrigram: String = "",
    val authorContact: String? = null,
    val otherSourceType: OtherSource? = null,
    val satelliteType: SatelliteSource? = null,
    val title: String,
    val description: String? = null,
    val natinfCode: Int,
    val seaFront: String? = null,
    val dml: String? = null,
    val threat: String? = null,
    val threatCharacterization: String? = null,
    @JsonProperty("type")
    val reportingTypeMapping: ReportingTypeMapping = ReportingTypeMapping.INFRACTION_SUSPICION,
)

/**
 * Data class for JSON serialization/deserialization of Observation reporting value.
 * This is used for the JSONB `value` column in the database.
 */
data class ObservationDto(
    @JsonAlias("reportingActor")
    val reportingSource: ReportingSource,
    val controlUnitId: Int? = null,
    @Deprecated("Replaced by createdBy filled in the controller")
    val authorTrigram: String = "",
    val authorContact: String? = null,
    val otherSourceType: OtherSource? = null,
    val satelliteType: SatelliteSource? = null,
    val title: String,
    val description: String? = null,
    val seaFront: String? = null,
    val dml: String? = null,
    @JsonProperty("type")
    val reportingTypeMapping: ReportingTypeMapping = ReportingTypeMapping.OBSERVATION,
)
