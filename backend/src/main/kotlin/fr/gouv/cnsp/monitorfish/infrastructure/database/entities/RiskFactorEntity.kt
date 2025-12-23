package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.Gear
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.Species
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.converters.deserializeJSONList
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.Type
import java.io.Serializable
import java.time.ZonedDateTime

@Entity
@Table(name = "risk_factors")
data class RiskFactorEntity(
    @Id
    @Column(name = "id")
    val id: Int,
    @Column(name = "cfr")
    val cfr: String?,
    @Column(name = "impact_risk_factor")
    val impactRiskFactor: Double,
    @Column(name = "recent_segments_impact_risk_factor")
    val recentSegmentsImpactRiskFactor: Double,
    @Column(name = "probability_risk_factor")
    val probabilityRiskFactor: Double,
    @Column(name = "detectability_risk_factor")
    val detectabilityRiskFactor: Double,
    @Column(name = "recent_segments_detectability_risk_factor")
    val recentSegmentsDetectabilityRiskFactor: Double,
    @Column(name = "risk_factor")
    val riskFactor: Double,
    @Column(name = "recent_segments_risk_factor")
    val recentSegmentsRiskFactor: Double,
    @Type(JsonBinaryType::class)
    @Column(name = "gear_onboard", columnDefinition = "jsonb")
    val gearOnboard: String?,
    @Type(JsonBinaryType::class)
    @Column(name = "species_onboard", columnDefinition = "jsonb")
    val speciesOnboard: String?,
    @Column(name = "segments", columnDefinition = "varchar(50)[]")
    val segments: List<String>,
    @Column(name = "recent_segments", columnDefinition = "varchar(50)[]")
    val recentSegments: List<String>?,
    @Column(name = "segment_highest_impact")
    val segmentHighestImpact: String? = null,
    @Column(name = "recent_segment_highest_impact")
    val recentSegmentHighestImpact: String? = null,
    @Column(name = "segment_highest_priority")
    val segmentHighestPriority: String? = null,
    @Column(name = "recent_segment_highest_priority")
    val recentSegmentHighestPriority: String? = null,
    @Column(name = "control_priority_level")
    val controlPriorityLevel: Double,
    @Column(name = "recent_segments_control_priority_level")
    val recentControlPriorityLevel: Double,
    @Column(name = "last_control_datetime_utc")
    val lastControlDateTime: ZonedDateTime? = null,
    @Column(name = "last_control_at_sea_datetime_utc")
    val lastControlAtSeaDateTime: ZonedDateTime? = null,
    @Column(name = "last_control_at_quay_datetime_utc")
    val lastControlAtQuayDateTime: ZonedDateTime? = null,
    @Column(name = "control_rate_risk_factor")
    val controlRateRiskFactor: Double,
    @Column(name = "total_weight_onboard")
    val totalWeightOnboard: Double?,
    @Column(name = "infraction_score")
    val infractionScore: Double? = null,
    @Column(name = "number_controls_last_5_years")
    val numberControlsLastFiveYears: Short,
    @Column(name = "number_controls_last_3_years")
    val numberControlsLastThreeYears: Short,
    @Column(name = "number_infractions_last_5_years")
    val numberInfractionsLastFiveYears: Short,
    @Column(name = "number_gear_seizures_last_5_years")
    val numberGearSeizuresLastFiveYears: Short,
    @Column(name = "number_species_seizures_last_5_years")
    val numberSpeciesSeizuresLastFiveYears: Short,
    @Column(name = "number_vessel_seizures_last_5_years")
    val numberVesselSeizuresLastFiveYears: Short,
    @Column(name = "vessel_id")
    val vesselId: Int?,
    @Column(name = "has_current_vms_fishing_activity")
    val hasCurrentVmsFishingActivity: Boolean,
) : Serializable {
    fun toVesselRiskFactor(mapper: ObjectMapper) =
        VesselRiskFactor(
            impactRiskFactor = impactRiskFactor,
            probabilityRiskFactor = probabilityRiskFactor,
            detectabilityRiskFactor = detectabilityRiskFactor,
            riskFactor = riskFactor,
            internalReferenceNumber = cfr,
            gearOnboard = deserializeJSONList(mapper, gearOnboard, Gear::class.java),
            speciesOnboard = deserializeJSONList(mapper, speciesOnboard, Species::class.java),
            segments = segments,
            controlPriorityLevel = controlPriorityLevel,
            segmentHighestImpact = segmentHighestImpact,
            segmentHighestPriority = segmentHighestPriority,
            totalWeightOnboard = totalWeightOnboard ?: 0.0,
            lastControlDateTime = lastControlDateTime,
            lastControlAtSeaDateTime = lastControlAtSeaDateTime,
            lastControlAtQuayDateTime = lastControlAtQuayDateTime,
            controlRateRiskFactor = controlRateRiskFactor,
            numberControlsLastFiveYears = numberControlsLastFiveYears,
            numberControlsLastThreeYears = numberControlsLastThreeYears,
            numberInfractionsLastFiveYears = numberInfractionsLastFiveYears,
            numberGearSeizuresLastFiveYears = numberGearSeizuresLastFiveYears,
            numberSpeciesSeizuresLastFiveYears = numberSpeciesSeizuresLastFiveYears,
            numberVesselSeizuresLastFiveYears = numberVesselSeizuresLastFiveYears,
            recentSegmentsImpactRiskFactor = recentSegmentsImpactRiskFactor,
            recentSegmentsDetectabilityRiskFactor = recentSegmentsDetectabilityRiskFactor,
            recentSegmentsRiskFactor = recentSegmentsRiskFactor,
            recentSegments = recentSegments ?: listOf(),
            recentSegmentHighestImpact = recentSegmentHighestImpact,
            recentSegmentHighestPriority = recentSegmentHighestPriority,
            recentControlPriorityLevel = recentControlPriorityLevel,
            hasCurrentVmsFishingActivity = hasCurrentVmsFishingActivity,
        )
}
