package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.VesselEntity
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import org.springframework.data.repository.query.Param

interface DBVesselRepository : CrudRepository<VesselEntity, Long> {
    @Query(value = "SELECT * FROM vessels WHERE cfr LIKE %:internalReferenceNumber% " +
            "OR external_immatriculation LIKE %:externalReferenceNumber% " +
            "OR ircs LIKE %:IRCS%", nativeQuery = true)
    fun findByReferences(@Param("internalReferenceNumber") internalReferenceNumber: String,
                      @Param("externalReferenceNumber") externalReferenceNumber: String,
                      @Param("IRCS") IRCS: String): List<VesselEntity>
    fun findByInternalReferenceNumber(internalReferenceNumber: String): VesselEntity
    fun findByExternalReferenceNumberIgnoreCaseContaining(externalReferenceNumber: String): VesselEntity
    fun findByIRCS(IRCS: String): VesselEntity
}
