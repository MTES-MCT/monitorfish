package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.PositionEntity
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import javax.persistence.Tuple

interface DBPositionRepository : CrudRepository<PositionEntity, Long> {
    fun findAllByMMSI(MMSI: String): List<PositionEntity>

    @Query(value = "select distinct " +
                "n.internal_reference_number, " +
                "n.external_reference_number, " +
                "n.mmsi, " +
                "n.ircs, " +
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
            "from positions n " +
            "left join positions p on p.id = (select po.ID from positions po where " +
                "n.internal_reference_number = po.internal_reference_number " +
                "order by po.date_time desc limit 1) " +
            "group by " +
                "n.internal_reference_number, " +
                "n.external_reference_number, " +
                "n.mmsi, " +
                "n.ircs, " +
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
                "p.position_type ",
            nativeQuery = true)
    fun findLastDistinctInternalReferenceNumberPositions(): List<PositionEntity>

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
    fun findLastPositionsByInternalReferenceNumber(internalReferenceNumber: String): List<PositionEntity>
}
