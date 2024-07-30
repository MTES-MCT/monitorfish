package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.PnoVesselSubscriptionEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.PnoVesselSubscriptionId
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface DBPnoVesselsSubscriptionsRepository : JpaRepository<PnoVesselSubscriptionEntity, PnoVesselSubscriptionId> {
    @Query("SELECT COUNT(*) FROM pno_vessels_subscriptions WHERE vessel_id = :vesselId", nativeQuery = true)
    fun countByVesselId(vesselId: Int): Long
}
