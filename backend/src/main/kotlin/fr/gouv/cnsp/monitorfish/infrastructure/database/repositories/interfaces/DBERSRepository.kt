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
    @Query("select new fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.LastDepartureInstantAndTripNumber(e.operationDateTime, e.tripNumber) " +
            "from ERSEntity e where e.internalReferenceNumber = ?1 and e.messageType = 'DEP' AND e.operationDateTime < ?2 order by e.operationDateTime desc")
    fun findLastDepartureDateByInternalReferenceNumber(internalReferenceNumber: String, beforeDateTime: Instant, pageable: Pageable): List<LastDepartureInstantAndTripNumber>

    @Query("select new fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.LastDepartureInstantAndTripNumber(e.operationDateTime, e.tripNumber) " +
            "from ERSEntity e where e.externalReferenceNumber = ?1 and e.messageType = 'DEP' order by e.operationDateTime desc")
    fun findLastDepartureDateByExternalReferenceNumber(externalReferenceNumber: String, pageable: Pageable): List<LastDepartureInstantAndTripNumber>

    @Query("select new fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.LastDepartureInstantAndTripNumber(e.operationDateTime, e.tripNumber) " +
            "from ERSEntity e where e.ircs = ?1 and e.messageType = 'DEP' order by e.operationDateTime desc")
    fun findLastDepartureDateByIRCS(ircs: String, pageable: Pageable): List<LastDepartureInstantAndTripNumber>

    @Query("WITH dat_cor AS (select * from ers e where e.cfr = ?1 AND e.operation_datetime_utc >= ?2 AND e.operation_datetime_utc < ?3 AND operation_type IN ('DAT', 'COR') order by e.operation_datetime_utc desc), " +
            "ret AS (select * from ers e where e.referenced_ers_id IN (select ers_id FROM dat_cor) AND e.operation_datetime_utc >= ?2 AND e.operation_datetime_utc < ?3 AND operation_type = 'RET' order by e.operation_datetime_utc desc), " +
            "del AS (select * from ers e where e.referenced_ers_id IN (select ers_id FROM dat_cor) AND e.operation_datetime_utc >= ?2 AND e.operation_datetime_utc < ?3 AND operation_type = 'DEL' order by e.operation_datetime_utc desc) " +
            "SELECT * " +
            "FROM dat_cor " +
            "UNION ALL SELECT * from ret " +
            "UNION ALL SELECT * from del", nativeQuery = true)
    fun findERSMessagesAfterOperationDateTime(internalReferenceNumber: String, afterDateTime: Instant, beforeDateTime: Instant): List<ERSEntity>

    @Query("select * from ers where ers_id in " +
            "(select distinct referenced_ers_id from ers where operation_type = 'RET' and value->>'returnStatus' = '000') " +
            "and (log_type = 'LAN' or log_type = 'PNO') " +
            "and (:ruleType <> ANY(analyzed_by_rules) or analyzed_by_rules is null)", nativeQuery = true)
    fun findAllLANAndPNONotProcessedByRule(ruleType: String): List<ERSEntity>

    @Modifying(clearAutomatically = true)
    @Query("update ers set analyzed_by_rules = array_append(analyzed_by_rules, :ruleType) where id in (:ids)", nativeQuery = true)
    fun updateERSMessagesAsProcessedByRule(ids: List<Long>, ruleType: String)

}
