package fr.gouv.cnsp.monitorfish.domain.entities.risk_factor

import java.time.ZonedDateTime

data class VesselControlAnteriority(
        val cfr: String? = null,
        val ircs: String? = null,
        val externalImmatriculation: String? = null,
        val lastControlDatetime: ZonedDateTime,
        val lastControlInfraction: Boolean,
        val postControlComments: String? = null,
        val numberRecentControls: Double,
        val controlRateRiskFactor: Double,
        val infractionScore: Double,
        val numberControlsLastFiveYears: Short? = null,
        val numberControlsLastThreeYears: Short? = null,
        val numberInfractionsLastFiveYears: Short? = null,
        val numberDiversionsLastFiveYears: Short? = null,
        val numberSeizuresLastFiveYears: Short? = null,
        val numberEscortsToQuayLastFiveYears: Short? = null)
