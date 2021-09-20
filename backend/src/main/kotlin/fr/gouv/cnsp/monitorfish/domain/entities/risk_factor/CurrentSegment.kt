package fr.gouv.cnsp.monitorfish.domain.entities.risk_factor

import fr.gouv.cnsp.monitorfish.domain.entities.last_position.Gear
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.Species
import java.time.ZonedDateTime

data class CurrentSegment(
        val internalReferenceNumber: String ? = null,
        val lastErsDateTime: ZonedDateTime? = null,
        val departureDateTime: ZonedDateTime? = null,
        val tripNumber: Double? = null,
        val gearOnboard: List<Gear>? = listOf(),
        val speciesOnboard: List<Species>? = listOf(),
        val totalWeightOnboard: Double? = null,
        val segments: List<String>? = listOf(),
        val probableSegments: List<String>? = listOf(),
        val riskFactor: Double? = null,
        val controlPriorityLevel: Double? = null)
