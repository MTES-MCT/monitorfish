package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.PnoAndLanAlertEntity
import org.hibernate.annotations.DynamicUpdate
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import java.time.ZonedDateTime
import java.util.*

@DynamicUpdate
interface DBPNOAndLANAlertRepository : CrudRepository<PnoAndLanAlertEntity, UUID> {
    @Query(
        "select * from pno_lan_alerts where internal_reference_number = :internalReferenceNumber " +
            "and trip_number = :tripNumber and value->>'type' in (:types)",
        nativeQuery = true
    )
    fun findAlertsOfRules(types: List<String>, internalReferenceNumber: String, tripNumber: String?): List<PnoAndLanAlertEntity>

    @Modifying
    @Query(
        """
        insert into
            pno_lan_alerts
        values (
            cast(:id as uuid),
            :internalReferenceNumber,
            :externalReferenceNumber,
            :ircs,
            :creationDate,
            :tripNumber,
            cast(:value as jsonb)
        )
    """,
        nativeQuery = true
    )
    fun save(
        id: UUID,
        internalReferenceNumber: String? = null,
        externalReferenceNumber: String? = null,
        ircs: String? = null,
        creationDate: ZonedDateTime,
        tripNumber: String? = null,
        value: String
    )
}
