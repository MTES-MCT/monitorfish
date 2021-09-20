package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselControlAnteriority
import java.time.ZonedDateTime
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.Table

@Entity
@Table(name = "control_anteriority")
data class ControlAnteriorityEntity(
        @Id
        @Column(name = "vessel_id")
        val id: Int,
        @Column(name = "cfr")
        val cfr: String? = null,
        @Column(name = "ircs")
        val ircs: String? = null,
        @Column(name = "external_immatriculation")
        val externalImmatriculation: String? = null,
        @Column(name = "last_control_datetime_utc")
        val lastControlDatetime: ZonedDateTime,
        @Column(name = "last_control_infraction")
        val lastControlInfraction: Boolean,
        @Column(name = "post_control_comments")
        val postControlComments: String? = null,
        @Column(name = "number_recent_controls")
        val numberRecentControls: Double,
        @Column(name = "control_rate_risk_factor")
        val controlRateRiskFactor: Double,
        @Column(name = "infraction_score")
        val infractionScore: Double,
        @Column(name = "number_controls_last_5_years")
        val numberControlsLastFiveYears: Short? = null,
        @Column(name = "number_controls_last_3_years")
        val numberControlsLastThreeYears: Short? = null,
        @Column(name = "number_infractions_last_5_years")
        val numberInfractionsLastFiveYears: Short? = null,
        @Column(name = "number_diversions_last_5_years")
        val numberDiversionsLastFiveYears: Short? = null,
        @Column(name = "number_seizures_last_5_years")
        val numberSeizuresLastFiveYears: Short? = null,
        @Column(name = "number_escorts_to_quay_last_5_years")
        val numberEscortsToQuayLastFiveYears: Short? = null) {

        fun toVesselControlAnteriority() : VesselControlAnteriority {
                return VesselControlAnteriority(
                        cfr = cfr,
                        ircs = ircs,
                        externalImmatriculation = externalImmatriculation,
                        lastControlDatetime = lastControlDatetime,
                        lastControlInfraction = lastControlInfraction,
                        postControlComments = postControlComments,
                        numberRecentControls = numberRecentControls,
                        controlRateRiskFactor = controlRateRiskFactor,
                        infractionScore = infractionScore,
                        numberControlsLastFiveYears = numberControlsLastFiveYears,
                        numberControlsLastThreeYears = numberControlsLastThreeYears,
                        numberInfractionsLastFiveYears = numberInfractionsLastFiveYears,
                        numberDiversionsLastFiveYears = numberDiversionsLastFiveYears,
                        numberSeizuresLastFiveYears = numberSeizuresLastFiveYears,
                        numberEscortsToQuayLastFiveYears = numberEscortsToQuayLastFiveYears
                )
        }
}
