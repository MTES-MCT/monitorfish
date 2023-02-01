package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.fasterxml.jackson.databind.ObjectMapper
import com.vladmihalcea.hibernate.type.array.ListArrayType
import com.vladmihalcea.hibernate.type.json.JsonBinaryType
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.Gear
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.Species
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.Type
import java.io.Serializable
import java.time.ZonedDateTime

@Entity
@Table(name = "risk_factors")
data class RiskFactorsEntity(
    @Id
    @Column(name = "cfr")
    val cfr: String,
    @Column(name = "impact_risk_factor")
    val impactRiskFactor: Double,
    @Column(name = "probability_risk_factor")
    val probabilityRiskFactor: Double,
    @Column(name = "detectability_risk_factor")
    val detectabilityRiskFactor: Double,
    @Column(name = "risk_factor")
    val riskFactor: Double,
    @Type(JsonBinaryType::class)
    @Column(name = "gear_onboard", columnDefinition = "jsonb")
    val gearOnboard: String?,
    @Type(JsonBinaryType::class)
    @Column(name = "species_onboard", columnDefinition = "jsonb")
    val speciesOnboard: String?,
    @Type(ListArrayType::class)
    @Column(name = "segments", columnDefinition = "varchar(50)[]")
    val segments: List<String>,
    @Column(name = "segment_highest_impact")
    val segmentHighestImpact: String? = null,
    @Column(name = "segment_highest_priority")
    val segmentHighestPriority: String? = null,
    @Column(name = "control_priority_level")
    val controlPriorityLevel: Double,
    @Column(name = "last_control_datetime_utc")
    val lastControlDatetime: ZonedDateTime,
    @Column(name = "control_rate_risk_factor")
    val controlRateRiskFactor: Double,
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
    val numberVesselSeizuresLastFiveYears: Short
) : Serializable {

    fun toVesselRiskFactor(mapper: ObjectMapper) = VesselRiskFactor(
        impactRiskFactor = impactRiskFactor,
        probabilityRiskFactor = probabilityRiskFactor,
        detectabilityRiskFactor = detectabilityRiskFactor,
        riskFactor = riskFactor,
        internalReferenceNumber = cfr,
        gearOnboard = mapper.readValue(
            gearOnboard,
            mapper.typeFactory
                .constructCollectionType(MutableList::class.java, Gear::class.java),
        ),
        speciesOnboard = mapper.readValue(
            speciesOnboard,
            mapper.typeFactory
                .constructCollectionType(MutableList::class.java, Species::class.java),
        ),
        segments = segments,
        controlPriorityLevel = controlPriorityLevel,
        segmentHighestImpact = segmentHighestImpact,
        segmentHighestPriority = segmentHighestPriority,
        lastControlDatetime = lastControlDatetime,
        controlRateRiskFactor = controlRateRiskFactor,
        numberControlsLastFiveYears = numberControlsLastFiveYears,
        numberControlsLastThreeYears = numberControlsLastThreeYears,
        numberInfractionsLastFiveYears = numberInfractionsLastFiveYears,
        numberGearSeizuresLastFiveYears = numberGearSeizuresLastFiveYears,
        numberSpeciesSeizuresLastFiveYears = numberSpeciesSeizuresLastFiveYears,
        numberVesselSeizuresLastFiveYears = numberVesselSeizuresLastFiveYears
    )
}
