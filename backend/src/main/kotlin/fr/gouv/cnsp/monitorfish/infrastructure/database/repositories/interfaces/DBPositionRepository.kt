package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.PositionEntity
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import java.time.ZonedDateTime
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
            "where p.internal_reference_number = :internalReferenceNumber " +
            "and p.date_time >= :from " +
            "order by p.date_time DESC ",
            nativeQuery = true)
    fun findLastByInternalReferenceNumber(internalReferenceNumber: String, from: ZonedDateTime): List<PositionEntity>

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
            "where p.external_reference_number = :externalReferenceNumber " +
            "and p.date_time >= :from " +
            "order by p.date_time DESC ",
            nativeQuery = true)
    fun findLastByExternalReferenceNumber(externalReferenceNumber: String, from: ZonedDateTime): List<PositionEntity>

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
            "where p.ircs = :ircs " +
            "and p.date_time >= :from " +
            "order by p.date_time DESC",
            nativeQuery = true)
    fun findLastByIrcs(ircs: String, from: ZonedDateTime): List<PositionEntity>
}
