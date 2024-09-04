package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

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
)
