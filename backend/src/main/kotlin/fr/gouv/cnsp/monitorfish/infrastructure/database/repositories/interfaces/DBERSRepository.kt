package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.ERSEntity
import org.hibernate.annotations.DynamicUpdate
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import java.time.Instant
import javax.transaction.Transactional

@DynamicUpdate
interface DBERSRepository : CrudRepository<ERSEntity, Long>, JpaSpecificationExecutor<ERSEntity> {
    @Query("select new fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.LastDepartureInstantAndTripNumber(e.operationDateTime, e.tripNumber) " +
            "from ERSEntity e where e.internalReferenceNumber = ?1 and e.messageType = 'DEP' order by e.operationDateTime desc")
    fun findLastDepartureDateByInternalReferenceNumber(internalReferenceNumber: String, pageable: Pageable): List<LastDepartureInstantAndTripNumber>

    @Query("select new fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.LastDepartureInstantAndTripNumber(e.operationDateTime, e.tripNumber) " +
            "from ERSEntity e where e.externalReferenceNumber = ?1 and e.messageType = 'DEP' order by e.operationDateTime desc")
    fun findLastDepartureDateByExternalReferenceNumber(externalReferenceNumber: String, pageable: Pageable): List<LastDepartureInstantAndTripNumber>

    @Query("select new fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.LastDepartureInstantAndTripNumber(e.operationDateTime, e.tripNumber) " +
            "from ERSEntity e where e.ircs = ?1 and e.messageType = 'DEP' order by e.operationDateTime desc")
    fun findLastDepartureDateByIRCS(ircs: String, pageable: Pageable): List<LastDepartureInstantAndTripNumber>

    @Query("select * from ers e where e.cfr = ?1 and e.operation_datetime_utc >= ?2 order by e.operation_datetime_utc desc", nativeQuery = true)
    fun findERSMessagesAfterOperationDateTime(internalReferenceNumber: String, dateTime: Instant): List<ERSEntity>

    @Query("select * from ers where ers_id in " +
            "(select distinct referenced_ers_id from ers where operation_type = 'RET' and value->>'returnStatus' = '000') " +
            "and (log_type = 'LAN' or log_type = 'PNO') " +
            "and (:ruleType <> ANY(analyzed_by_rules) or analyzed_by_rules is null)", nativeQuery = true)
    fun findAllLANAndPNONotProcessedByRule(ruleType: String): List<ERSEntity>

    @Modifying(clearAutomatically = true)
    @Transactional
    @Query("update ers set analyzed_by_rules = array_append(analyzed_by_rules, :ruleType) where id in (:ids)", nativeQuery = true)
    fun updateERSMessagesAsProcessedByRule(ids: List<Long>, ruleType: String)

}
