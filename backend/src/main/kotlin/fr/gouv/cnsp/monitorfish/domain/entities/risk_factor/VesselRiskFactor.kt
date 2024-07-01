package fr.gouv.cnsp.monitorfish.domain.entities.risk_factor

import fr.gouv.cnsp.monitorfish.domain.entities.last_position.Gear
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.Species
import java.time.ZonedDateTime

/**
 * The default risk factors must be equal to values in the base Python implementation:
 * https://github.com/MTES-MCT/monitorfish/blob/78ba0ea85e087ff78640ee9f31bcb3c443f2d22b/datascience/config.py#L118
 * */
const val defaultImpactRiskFactor = 1.0
const val defaultProbabilityRiskFactor = 2.0
const val defaultDetectabilityRiskFactor = 2.0
const val defaultRiskFactor = 1.74
const val defaultControlPriorityLevel = 1.0
const val defaultControlRateRiskFactor = 4.0

/**
 * The risk factors coefficients must be equal to values in the base Python implementation:
 * https://github.com/MTES-MCT/monitorfish/blob/78ba0ea85e087ff78640ee9f31bcb3c443f2d22b/datascience/config.py#L112C1-L117C1
 * */
const val impactRiskFactorCoefficient = 0.2
const val probabilityRiskFactorCoefficient = 0.3
const val controlRateRiskFactorCoefficient = 0.25
const val controlPriorityLevelCoefficient = 0.25

data class VesselRiskFactor(
    val impactRiskFactor: Double = defaultImpactRiskFactor,
    val probabilityRiskFactor: Double = defaultProbabilityRiskFactor,
    val detectabilityRiskFactor: Double = defaultDetectabilityRiskFactor,
    val riskFactor: Double = defaultRiskFactor,
    val controlPriorityLevel: Double = defaultControlPriorityLevel,
    val controlRateRiskFactor: Double = defaultControlRateRiskFactor,
    /** CFR (Community Fleet Register Number). */
    val internalReferenceNumber: String? = null,
    val vesselId: Int? = null,
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
    val numberGearSeizuresLastFiveYears: Short? = null,
    val numberSpeciesSeizuresLastFiveYears: Short? = null,
    val numberVesselSeizuresLastFiveYears: Short? = null,
)
