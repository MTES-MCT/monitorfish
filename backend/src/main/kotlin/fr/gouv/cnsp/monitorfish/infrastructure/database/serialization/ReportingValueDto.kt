package fr.gouv.cnsp.monitorfish.infrastructure.database.serialization

import com.fasterxml.jackson.annotation.JsonProperty
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingActor

/**
 * Data class for JSON serialization/deserialization of InfractionSuspicion reporting value.
 * This is used for the JSONB `value` column in the database.
 */
data class InfractionSuspicionDto(
    val reportingActor: ReportingActor,
    val controlUnitId: Int? = null,
    @Deprecated("Replaced by createdBy filled in the controller")
    val authorTrigram: String = "",
    val authorContact: String? = null,
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
    val reportingActor: ReportingActor,
    val controlUnitId: Int? = null,
    @Deprecated("Replaced by createdBy filled in the controller")
    val authorTrigram: String = "",
    val authorContact: String? = null,
    val title: String,
    val description: String? = null,
    val seaFront: String? = null,
    val dml: String? = null,
    @JsonProperty("type")
    val reportingTypeMapping: ReportingTypeMapping = ReportingTypeMapping.OBSERVATION,
)
