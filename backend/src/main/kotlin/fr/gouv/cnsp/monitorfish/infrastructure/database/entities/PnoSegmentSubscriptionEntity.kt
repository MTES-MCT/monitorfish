package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationSegmentSubscription
import jakarta.persistence.*
import java.io.Serializable

@Embeddable
class PnoSegmentSubscriptionId(
    val controlUnitId: Int,
    @Column(name = "segment", updatable = false)
    val segmentCode: String,
) : Serializable

@Entity
@Table(name = "pno_segments_subscriptions")
data class PnoSegmentSubscriptionEntity(
    @EmbeddedId
    val id: PnoSegmentSubscriptionId,
) {
    fun toPriorNotificationSegmentSubscription(): PriorNotificationSegmentSubscription {
        return PriorNotificationSegmentSubscription(
            controlUnitId = id.controlUnitId,
            segmentCode = id.segmentCode,
        )
    }
}
