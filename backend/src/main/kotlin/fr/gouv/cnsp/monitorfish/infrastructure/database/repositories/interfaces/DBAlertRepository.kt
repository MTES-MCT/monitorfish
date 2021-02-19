package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.AlertEntity
import org.hibernate.annotations.DynamicUpdate
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository

@DynamicUpdate
interface DBAlertRepository : CrudRepository<AlertEntity, Long> {
    @Query("select * from alerts where internal_reference_number = :internalReferenceNumber " +
            "and trip_number = :tripNumber and name in (:rules)", nativeQuery = true)
    fun findAlertsOfRules(rules: List<String>, internalReferenceNumber: String, tripNumber: Int?): List<AlertEntity>
}
