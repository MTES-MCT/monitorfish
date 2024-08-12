package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.VesselEntity
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import org.springframework.data.repository.query.Param

interface DBVesselRepository : CrudRepository<VesselEntity, Int> {
    @Query(
        value = "SELECT * FROM vessels WHERE cfr LIKE %:searched% " +
            "OR mmsi LIKE %:searched% " +
            "OR vessel_name LIKE %:searched% " +
            "OR external_immatriculation LIKE %:searched% " +
            "OR ircs LIKE %:searched% limit 50",
        nativeQuery = true,
    )
    fun searchBy(@Param("searched") searched: String): List<VesselEntity>

    // Only used in tests
    @Query(value = "SELECT * FROM vessels WHERE cfr = :cfr LIMIT 1", nativeQuery = true)
    fun findFirstByCfr(@Param("cfr") cfr: String): VesselEntity?

    fun findByInternalReferenceNumber(internalReferenceNumber: String): VesselEntity

    fun findByExternalReferenceNumberIgnoreCaseContaining(externalReferenceNumber: String): VesselEntity

    fun findByIrcs(ircs: String): VesselEntity

    @Query(value = "SELECT * FROM vessels WHERE id in (:ids)", nativeQuery = true)
    fun findAllByIds(ids: List<Int>): List<VesselEntity>

    @Query(value = "SELECT * FROM vessels WHERE cfr in (:cfr)", nativeQuery = true)
    fun findAllByInternalReferenceNumbers(cfr: List<String>): List<VesselEntity>

    @Query(
        value = """
        SELECT under_charter
        FROM vessels
        WHERE
            ircs = :value
            AND :vesselIdentifier = 'IRCS'

        UNION ALL

        SELECT under_charter
        FROM vessels
        WHERE
            cfr = :value
            AND :vesselIdentifier = 'INTERNAL_REFERENCE_NUMBER'

        UNION ALL

        SELECT under_charter
        FROM vessels
        WHERE
            external_immatriculation = :value
            AND :vesselIdentifier = 'EXTERNAL_REFERENCE_NUMBER'
        """,
        nativeQuery = true,
    )
    fun findUnderCharterByVesselIdentifierEquals(vesselIdentifier: String, value: String): Boolean
}
