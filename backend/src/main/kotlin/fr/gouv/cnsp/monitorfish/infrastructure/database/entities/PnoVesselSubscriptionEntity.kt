package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationVesselSubscription
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
) {
    fun toPriorNotificationVesselSubscription(): PriorNotificationVesselSubscription {
        return PriorNotificationVesselSubscription(
            controlUnitId = id.controlUnitId,
            vesselId = id.vesselId,
            vesselName = null,
        )
    }

    companion object {
        fun fromPriorNotificationVesselSubscription(
            priorNotificationVesselSubscription: PriorNotificationVesselSubscription,
        ): PnoVesselSubscriptionEntity {
            return PnoVesselSubscriptionEntity(
                id =
                    PnoVesselSubscriptionId(
                        controlUnitId = priorNotificationVesselSubscription.controlUnitId,
                        vesselId = priorNotificationVesselSubscription.vesselId,
                    ),
            )
        }
    }
}
