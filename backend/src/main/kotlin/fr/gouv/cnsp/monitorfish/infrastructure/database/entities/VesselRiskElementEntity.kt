package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.risk_element.NonCompliantTrip
import fr.gouv.cnsp.monitorfish.domain.entities.risk_element.RiskElementMetrics
import fr.gouv.cnsp.monitorfish.domain.entities.risk_element.VesselRiskElement
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType
import jakarta.persistence.Column
import jakarta.persistence.Embeddable
import jakarta.persistence.EmbeddedId
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import org.hibernate.annotations.Type
import java.io.Serializable
import java.time.ZonedDateTime

@Embeddable
data class VesselRiskElementId(
    @Column(name = "cfr")
    val cfr: String,
    @Column(name = "risk_element_code")
    val riskElementCode: String,
) : Serializable

@Entity
@Table(name = "vessels_risk_elements")
data class VesselRiskElementEntity(
    @EmbeddedId
    val id: VesselRiskElementId,
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "risk_element_code", insertable = false, updatable = false)
    val riskElement: RiskElementEntity,
    @Type(JsonBinaryType::class)
    @Column(name = "metrics", nullable = false, columnDefinition = "jsonb")
    val metrics: String,
    @Column(name = "risk_level", nullable = false)
    val riskLevel: Int,
) {
    fun toVesselRiskElement(mapper: ObjectMapper): VesselRiskElement =
        VesselRiskElement(
            cfr = id.cfr,
            code = id.riskElementCode,
            name = riskElement.name,
            riskLevel = riskLevel,
            metrics = toRiskElementMetrics(mapper.readTree(metrics)),
        )

    /** The metrics are written by the `risk_elements` pipeline flow, with snake_case keys. */
    private fun toRiskElementMetrics(metricsNode: JsonNode): RiskElementMetrics {
        if (metricsNode.has("total_trips")) {
            return RiskElementMetrics.Trips(
                totalTrips = metricsNode["total_trips"].asInt(),
                compliantTrips = metricsNode["compliant_trips"].asInt(),
                shareOfNonCompliantTrips = metricsNode["share_of_non_compliant_trips"].asDouble(),
                nonCompliantTrips =
                    metricsNode.path("non_compliant_trips").map { trip ->
                        NonCompliantTrip(
                            tripNumber = trip["trip_number"].asText(),
                            startDateTimeUtc = trip.toZonedDateTimeOrNull("start_datetime_utc"),
                            endDateTimeUtc = trip.toZonedDateTimeOrNull("end_datetime_utc"),
                        )
                    },
            )
        }

        return RiskElementMetrics.Occurrences(
            occurrences = metricsNode["occurrences"].asInt(),
            reportingIds = metricsNode.path("reporting_ids").map { it.asInt() },
            beaconMalfunctionIds = metricsNode.path("beacon_malfunction_ids").map { it.asInt() },
        )
    }

    private fun JsonNode.toZonedDateTimeOrNull(fieldName: String): ZonedDateTime? =
        this[fieldName]?.takeUnless { it.isNull }?.let { ZonedDateTime.parse(it.asText()) }
}
