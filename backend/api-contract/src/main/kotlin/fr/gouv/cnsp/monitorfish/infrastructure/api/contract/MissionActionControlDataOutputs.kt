package fr.gouv.cnsp.monitorfish.infrastructure.api.contract

import com.fasterxml.jackson.annotation.JsonInclude

data class GearControlDataOutput(
    val gearCode: String? = null,
    val gearName: String? = null,
    val declaredMesh: Double? = null,
    val controlledMesh: Double? = null,
    val hasUncontrolledMesh: Boolean = false,
    val gearWasControlled: Boolean? = null,
    val gearMarkingIsCompliant: ControlCheck? = null,
    val averageWireThickness: Double? = null,
    val wireType: WireType? = null,
    val comments: String? = null,
)

data class SpeciesOnboardControlDataOutput(
    val speciesCode: String? = null,
    val speciesName: String? = null,
    val isNotLanded: Boolean? = null,
    val nbFish: Double? = null,
    val declaredWeight: Double? = null,
    val controlledWeight: Double? = null,
    val underSized: Boolean? = null,
    val underSizedWeight: Double? = null,
    val presentationCodes: List<String>? = null,
    val faoZones: List<String>? = null,
    val toleranceMargin: Double? = null,
)

/**
 * Names are only resolved for public API clients: they are omitted from the BFF output.
 */
data class DiscardedSpeciesControlDataOutput(
    val speciesCode: String,
    @field:JsonInclude(JsonInclude.Include.NON_NULL)
    val speciesName: String? = null,
    val rejectedWeight: Double? = null,
    val discardReason: DiscardReason? = null,
    @field:JsonInclude(JsonInclude.Include.NON_NULL)
    val discardReasonName: String? = null,
    val faoZones: List<String>? = null,
)

data class MissionActionFleetSegmentDataOutput(
    val segment: String? = null,
    val segmentName: String? = null,
)
