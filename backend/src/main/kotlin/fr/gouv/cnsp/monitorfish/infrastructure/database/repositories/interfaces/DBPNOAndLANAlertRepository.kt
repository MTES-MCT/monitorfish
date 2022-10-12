package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.AlertEntity
import org.hibernate.annotations.DynamicUpdate
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository

@DynamicUpdate
interface DBPNOAndLANAlertRepository : CrudRepository<AlertEntity, Long> {
    @Query(
        "select * from pno_lan_alerts where internal_reference_number = :internalReferenceNumber " +
            "and trip_number = :tripNumber and value->>'type' in (:types)",
        nativeQuery = true
    )
    fun findAlertsOfRules(types: List<String>, internalReferenceNumber: String, tripNumber: String?): List<AlertEntity>
}
