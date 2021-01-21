package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.VesselEntity
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import org.springframework.data.repository.query.Param

interface DBVesselRepository : CrudRepository<VesselEntity, Long> {
    @Query(value = "SELECT * FROM vessels WHERE cfr LIKE %:searched% " +
            "OR mmsi LIKE %:searched% " +
            "OR vessel_name LIKE %:searched% " +
            "OR external_immatriculation LIKE %:searched% " +
            "OR ircs LIKE %:searched% limit 10", nativeQuery = true)
    fun searchBy(@Param("searched") searched: String): List<VesselEntity>
    fun findByInternalReferenceNumber(internalReferenceNumber: String): VesselEntity
    fun findByExternalReferenceNumberIgnoreCaseContaining(externalReferenceNumber: String): VesselEntity
    fun findByIRCS(IRCS: String): VesselEntity
}
