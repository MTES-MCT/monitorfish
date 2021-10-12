package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.ERSEntity
import org.hibernate.annotations.DynamicUpdate
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import java.time.Instant

@DynamicUpdate
interface DBERSRepository : CrudRepository<ERSEntity, Long>, JpaSpecificationExecutor<ERSEntity> {
    @Query( "SELECT new fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.VoyageInstantsAndTripNumber(e.tripNumber, MIN(e.operationDateTime), MAX(e.operationDateTime)) FROM " +
            "ERSEntity e " +
            "WHERE e.internalReferenceNumber = ?1 " +
            "AND e.tripNumber IS NOT NULL " +
            "AND e.operationType IN ('DAT', 'COR') " +
            "AND e.operationDateTime >= ?2 " +
            "GROUP BY e.tripNumber " +
            "ORDER BY 2 ASC ")
    fun findTripsAfterDatetime(internalReferenceNumber: String, afterDateTime: Instant, pageable: Pageable): List<VoyageInstantsAndTripNumber>

    @Query( "SELECT new fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.VoyageInstantsAndTripNumber(e.tripNumber, MIN(e.operationDateTime), MAX(e.operationDateTime)) FROM " +
            "ERSEntity e " +
            "WHERE e.internalReferenceNumber = ?1 " +
            "AND e.tripNumber IS NOT NULL " +
            "AND e.operationType IN ('DAT', 'COR') " +
            "AND e.operationDateTime <= ?2 " +
            "GROUP BY e.tripNumber " +
            "ORDER BY 2 DESC ")
    fun findTripsBeforeDatetime(internalReferenceNumber: String, beforeDateTime: Instant, pageable: Pageable): List<VoyageInstantsAndTripNumber>

    @Query("WITH dat_cor AS (" +
            "   SELECT * " +
            "   FROM ers " +
            "   WHERE " +
            "       operation_datetime_utc >= ?2 AND " +
            "       operation_datetime_utc <= ?3 AND " +
            "       cfr = ?1 AND " +
            "       trip_number = ?4 AND " +
            "       operation_type IN ('DAT', 'COR') " +
            "   ORDER BY operation_datetime_utc DESC" +
            "), " +
            "ret AS (" +
            "   select * " +
            "   FROM ers " +
            "   WHERE " +
            "       referenced_ers_id IN (select ers_id FROM dat_cor) AND " +
            "       operation_datetime_utc + INTERVAL '1 day' >= ?2 AND " +
            "       operation_datetime_utc - INTERVAL '1 day' < ?3 AND " +
            "       operation_type = 'RET' " +
            "   ORDER BY operation_datetime_utc DESC" +
            "), " +
            "del AS (" +
            "   SELECT * " +
            "   FROM ers " +
            "   WHERE " +
            "       referenced_ers_id IN (select ers_id FROM dat_cor) AND " +
            "       operation_datetime_utc >= ?2 AND " +
            "       operation_datetime_utc - INTERVAL '1 week' < ?3 AND " +
            "       operation_type = 'DEL' " +
            "   ORDER BY operation_datetime_utc desc" +
            ") " +
            "SELECT * " +
            "FROM dat_cor " +
            "UNION ALL SELECT * from ret " +
            "UNION ALL SELECT * from del", nativeQuery = true)
    fun findAllMessagesByTripNumberBetweenDates(internalReferenceNumber: String, afterDateTime: Instant, beforeDateTime: Instant, tripNumber: Int): List<ERSEntity>


    @Query("select operation_datetime_utc from ers where operation_datetime_utc < now() order by operation_datetime_utc desc limit 1", nativeQuery = true)
    fun findLastOperationDateTime(): Instant

    @Query("select * from ers where ers_id in " +
            "(select distinct referenced_ers_id from ers where operation_type = 'RET' and value->>'returnStatus' = '000') " +
            "and (log_type = 'LAN' or log_type = 'PNO') " +
            "and (:ruleType <> ANY(analyzed_by_rules) or analyzed_by_rules is null)", nativeQuery = true)
    fun findAllLANAndPNONotProcessedByRule(ruleType: String): List<ERSEntity>

    @Modifying(clearAutomatically = true)
    @Query("update ers set analyzed_by_rules = array_append(analyzed_by_rules, :ruleType) where id in (:ids)", nativeQuery = true)
    fun updateERSMessagesAsProcessedByRule(ids: List<Long>, ruleType: String)

}
