package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.PositionEntity
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import javax.persistence.Tuple

interface DBPositionRepository : CrudRepository<PositionEntity, Long> {
    fun findAllByMMSI(MMSI: String): List<PositionEntity>

    @Query(value = "select distinct on (internal_reference_number) " +
                "internal_reference_number, " +
                "external_reference_number, " +
                "mmsi, " +
                "ircs, " +
                "id, " +
                "date_time, " +
                "vessel_name, " +
                "flag_state, " +
                "from_country, " +
                "destination_country, " +
                "trip_number, " +
                "latitude, " +
                "longitude, " +
                "speed, " +
                "course, " +
                "position_type " +
            "from positions " +
            "where internal_reference_number is not null " +
            "order by internal_reference_number, date_time desc ",
            nativeQuery = true)
    fun findLastDistinctInternalReferenceNumbers(): List<PositionEntity>

    @Query(value = "select distinct on (external_reference_number) " +
            "internal_reference_number, " +
            "external_reference_number, " +
            "mmsi, " +
            "ircs, " +
            "id, " +
            "date_time, " +
            "vessel_name, " +
            "flag_state, " +
            "from_country, " +
            "destination_country, " +
            "trip_number, " +
            "latitude, " +
            "longitude, " +
            "speed, " +
            "course, " +
            "position_type " +
            "from positions " +
            "where internal_reference_number is null " +
            "order by external_reference_number, date_time desc ",
            nativeQuery = true)
    fun findLastDistinctExternalReferenceNumberByInternalReferenceNumberIsNull(): List<PositionEntity>

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
    fun findLastByIRCS(IRCS: String): List<PositionEntity>
}
