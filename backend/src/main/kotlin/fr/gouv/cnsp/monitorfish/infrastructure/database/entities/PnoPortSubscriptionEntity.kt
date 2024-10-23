package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationPortSubscription
import jakarta.persistence.*
import java.io.Serializable

@Embeddable
class PnoPortSubscriptionId(val controlUnitId: Int, val portLocode: String) : Serializable

@Entity
@Table(name = "pno_ports_subscriptions")
data class PnoPortSubscriptionEntity(
    @EmbeddedId
    val id: PnoPortSubscriptionId,
    @Column(name = "receive_all_pnos", updatable = false)
    val receiveAllPnos: Boolean,
) {
    fun toPriorNotificationPortSubscription(): PriorNotificationPortSubscription {
        return PriorNotificationPortSubscription(
            controlUnitId = id.controlUnitId,
            portLocode = id.portLocode,
            hasSubscribedToAllPriorNotifications = receiveAllPnos,
        )
    }
}
