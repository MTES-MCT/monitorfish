package fr.gouv.cnsp.monitorfish.infrastructure.api.contract

import com.fasterxml.jackson.annotation.JsonInclude
import java.time.ZonedDateTime
import java.util.Optional

/**
 * If the value is set as null in the JSON payload, the value will be Optional.isEmpty: we set is as null.
 * If the property is not passed to the JSON payload: we keep the existing value
 *
 * Clients pass `Optional.empty()` to clear a value and `null` to leave it untouched.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
data class PatchableMissionActionDataInput(
    val actionDatetimeUtc: Optional<ZonedDateTime>?,
    val actionEndDatetimeUtc: Optional<ZonedDateTime>?,
    val observationsByUnit: Optional<String>?,
)
