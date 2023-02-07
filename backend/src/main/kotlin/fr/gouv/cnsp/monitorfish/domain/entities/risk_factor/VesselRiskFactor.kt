package fr.gouv.cnsp.monitorfish.domain.entities.risk_factor

import fr.gouv.cnsp.monitorfish.domain.entities.last_position.Gear
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.Species
import java.time.ZonedDateTime

// The default risk factors values are handled here
const val defaultImpactRiskFactor = 1.0
const val defaultProbabilityRiskFactor = 2.0
const val defaultDetectabilityRiskFactor = 2.0
const val defaultRiskFactor = 1.4
const val defaultControlPriorityLevel = 1.0
const val defaultControlRateRiskFactor = 4.0

data class VesselRiskFactor(
    val impactRiskFactor: Double = defaultImpactRiskFactor,
    val probabilityRiskFactor: Double = defaultProbabilityRiskFactor,
    val detectabilityRiskFactor: Double = defaultDetectabilityRiskFactor,
    val riskFactor: Double = defaultRiskFactor,
    val controlPriorityLevel: Double = defaultControlPriorityLevel,
    val controlRateRiskFactor: Double = defaultControlRateRiskFactor,
    val internalReferenceNumber: String? = null,
    val gearOnboard: List<Gear>? = listOf(),
    val speciesOnboard: List<Species>? = listOf(),
    val totalWeightOnboard: Double? = null,
    val segments: List<String>? = listOf(),
    val probableSegments: List<String>? = listOf(),
    val segmentHighestImpact: String? = null,
    val segmentHighestPriority: String? = null,
    val lastControlDatetime: ZonedDateTime? = null,
    val postControlComments: String? = null,
    val numberControlsLastFiveYears: Short? = null,
    val numberControlsLastThreeYears: Short? = null,
    val numberInfractionsLastFiveYears: Short? = null,
    val numberDiversionsLastFiveYears: Short? = null,
    val numberSeizuresLastFiveYears: Short? = null,
    val numberEscortsToQuayLastFiveYears: Short? = null,
)
