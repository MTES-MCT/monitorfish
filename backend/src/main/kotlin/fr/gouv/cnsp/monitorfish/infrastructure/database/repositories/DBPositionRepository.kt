package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.PositionEntity
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import javax.persistence.Tuple

interface DBPositionRepository : CrudRepository<PositionEntity, Long> {
    fun findAllByMmsi(mmsi: String): List<PositionEntity>

    @Query(value = "select distinct " +
            "p.internal_reference_number, " +
            "p.external_reference_number, " +
            "p.mmsi, " +
            "p.ircs, " +
            "p.id, " +
            "p.date_time, " +
            "p.vessel_name, " +
            "p.flag_state, " +
            "p.from_country, " +
            "p.destination_country, " +
            "p.trip_number, " +
            "p.latitude, " +
            "p.longitude, " +
            "p.speed, " +
            "p.course, " +
            "p.position_type " +
            "from positions p " +
            "where p.internal_reference_number = ?1 " +
            "order by p.date_time DESC " +
            "limit 12",
            nativeQuery = true)
    fun findLastByInternalReferenceNumber(internalReferenceNumber: String): List<PositionEntity>

    @Query(value = "select distinct " +
            "p.internal_reference_number, " +
            "p.external_reference_number, " +
            "p.mmsi, " +
            "p.ircs, " +
            "p.id, " +
            "p.date_time, " +
            "p.vessel_name, " +
            "p.flag_state, " +
            "p.from_country, " +
            "p.destination_country, " +
            "p.trip_number, " +
            "p.latitude, " +
            "p.longitude, " +
            "p.speed, " +
            "p.course, " +
            "p.position_type " +
            "from positions p " +
            "where p.external_reference_number = ?1 " +
            "order by p.date_time DESC " +
            "limit 12",
            nativeQuery = true)
    fun findLastByExternalReferenceNumber(externalReferenceNumber: String): List<PositionEntity>

    @Query(value = "select distinct " +
            "p.internal_reference_number, " +
            "p.external_reference_number, " +
            "p.mmsi, " +
            "p.ircs, " +
            "p.id, " +
            "p.date_time, " +
            "p.vessel_name, " +
            "p.flag_state, " +
            "p.from_country, " +
            "p.destination_country, " +
            "p.trip_number, " +
            "p.latitude, " +
            "p.longitude, " +
            "p.speed, " +
            "p.course, " +
            "p.position_type " +
            "from positions p " +
            "where p.ircs = ?1 " +
            "order by p.date_time DESC " +
            "limit 12",
            nativeQuery = true)
    fun findLastByIrcs(ircs: String): List<PositionEntity>
}
