package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import jakarta.persistence.Embeddable
import jakarta.persistence.EmbeddedId
import jakarta.persistence.Entity
import jakarta.persistence.Table
import java.io.Serializable

@Embeddable
class PnoVesselSubscriptionId(val controlUnitId: Int, val vesselId: Int) : Serializable

@Entity
@Table(name = "pno_vessels_subscriptions")
data class PnoVesselSubscriptionEntity(
    @EmbeddedId
    val id: PnoVesselSubscriptionId,
)
