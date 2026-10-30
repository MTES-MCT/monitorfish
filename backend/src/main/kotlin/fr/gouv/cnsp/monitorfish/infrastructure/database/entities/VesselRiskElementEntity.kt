package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.fasterxml.jackson.databind.ObjectMapper
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
    fun toVesselRiskElement(mapper: ObjectMapper): VesselRiskElement {
        val metricsNode = mapper.readTree(metrics)
        val metricsClass =
            if (metricsNode.has("totalTrips")) {
                RiskElementMetrics.Trips::class.java
            } else {
                RiskElementMetrics.Occurrences::class.java
            }

        return VesselRiskElement(
            cfr = id.cfr,
            code = id.riskElementCode,
            name = riskElement.name,
            riskLevel = riskLevel,
            metrics = mapper.treeToValue(metricsNode, metricsClass),
        )
    }
}
