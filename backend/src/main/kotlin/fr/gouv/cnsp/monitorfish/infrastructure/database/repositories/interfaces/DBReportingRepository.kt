package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.ReportingEntity
import org.hibernate.annotations.DynamicUpdate
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import java.time.Instant

@DynamicUpdate
interface DBReportingRepository : CrudRepository<ReportingEntity, Int> {
    @Query(value = """
        SELECT * FROM reporting WHERE 
            CASE
                WHEN :vesselIdentifier = 'INTERNAL_REFERENCE_NUMBER' THEN internal_reference_number
                WHEN :vesselIdentifier = 'IRCS' THEN ircs
                WHEN :vesselIdentifier = 'EXTERNAL_REFERENCE_NUMBER' THEN external_reference_number
            END = :value AND (
                (validation_date >= :fromDate AND
                    archived IS TRUE AND
                    deleted IS FALSE)
                OR
                (archived IS FALSE AND
                    deleted IS FALSE))
        """, nativeQuery = true)
    fun findCurrentAndArchivedByVesselIdentifier(vesselIdentifier: String, value: String, fromDate: Instant): List<ReportingEntity>
}
