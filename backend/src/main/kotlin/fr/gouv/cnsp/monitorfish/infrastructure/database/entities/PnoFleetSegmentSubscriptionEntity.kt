package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationFleetSegmentSubscription
import jakarta.persistence.*
import java.io.Serializable

@Embeddable
class PnoFleetSegmentSubscriptionId(
    val controlUnitId: Int,
    @Column(name = "segment", updatable = false)
    val segmentCode: String,
) : Serializable

@Entity
@Table(name = "pno_segments_subscriptions")
data class PnoFleetSegmentSubscriptionEntity(
    @EmbeddedId
    val id: PnoFleetSegmentSubscriptionId,
) {
    fun toPriorNotificationFleetSegmentSubscription(): PriorNotificationFleetSegmentSubscription {
        return PriorNotificationFleetSegmentSubscription(
            controlUnitId = id.controlUnitId,
            segmentCode = id.segmentCode,
            segmentName = null,
        )
    }

    companion object {
        fun fromPriorNotificationFleetSegmentSubscription(
            priorNotificationFleetSegmentSubscription: PriorNotificationFleetSegmentSubscription,
        ): PnoFleetSegmentSubscriptionEntity {
            return PnoFleetSegmentSubscriptionEntity(
                id =
                    PnoFleetSegmentSubscriptionId(
                        controlUnitId = priorNotificationFleetSegmentSubscription.controlUnitId,
                        segmentCode = priorNotificationFleetSegmentSubscription.segmentCode,
                    ),
            )
        }
    }
}
