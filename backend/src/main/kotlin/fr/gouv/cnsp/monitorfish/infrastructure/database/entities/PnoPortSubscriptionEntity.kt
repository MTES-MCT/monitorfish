package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

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
)
