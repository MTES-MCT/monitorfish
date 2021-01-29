package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.ERSEntity
import org.hibernate.annotations.DynamicUpdate
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import java.time.Instant

@DynamicUpdate
interface DBERSRepository : CrudRepository<ERSEntity, Long> {
    @Query("select e.operation_datetime_utc from ers e where" +
            " e.cfr = ?1 and e.log_type = 'DEP' order by e.operation_datetime_utc desc limit 1", nativeQuery = true)
    fun findLastDepartureDateByInternalReferenceNumber(internalReferenceNumber: String): Instant

    @Query("select e.operation_datetime_utc from ers e where" +
            " e.external_identification = ?1 and e.log_type = 'DEP' order by e.operation_datetime_utc desc limit 1", nativeQuery = true)
    fun findLastDepartureDateByExternalReferenceNumber(externalReferenceNumber: String): Instant

    @Query("select e.operation_datetime_utc from ers e where" +
            " e.ircs = ?1 and e.log_type = 'DEP' order by e.operation_datetime_utc desc limit 1", nativeQuery = true)
    fun findLastDepartureDateByIRCS(ircs: String): Instant

    @Query("select * from ers e where e.cfr = ?1 and e.operation_datetime_utc >= ?2 order by e.operation_datetime_utc desc", nativeQuery = true)
    fun findERSMessagesAfterOperationDateTime(internalReferenceNumber: String, dateTime: Instant): List<ERSEntity>
}
