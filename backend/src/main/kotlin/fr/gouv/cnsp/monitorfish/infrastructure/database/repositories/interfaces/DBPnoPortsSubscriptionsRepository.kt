package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.PnoPortSubscriptionEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.PnoPortSubscriptionId
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface DBPnoPortsSubscriptionsRepository : JpaRepository<PnoPortSubscriptionEntity, PnoPortSubscriptionId> {
    @Query(
        "SELECT COUNT(*) FROM pno_ports_subscriptions WHERE receive_all_pnos AND port_locode = :portLocode",
        nativeQuery = true,
    )
    fun countByPortLocode(portLocode: String): Long
}
