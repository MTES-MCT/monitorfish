package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.AisPositionEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.AisPositionPK
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.time.ZonedDateTime

interface DBAisPositionRepository : JpaRepository<AisPositionEntity, AisPositionPK> {
    @Query("SELECT a FROM AisPositionEntity a WHERE a.cfr = :cfr AND a.pk.dateTime >= :from AND a.pk.dateTime <= :to")
    fun findLastByCfr(
        cfr: String,
        from: ZonedDateTime,
        to: ZonedDateTime,
    ): List<AisPositionEntity>

    @Query(
        """
        SELECT a
        FROM AisPositionEntity a
        WHERE a.pk.mmsi = :mmsi AND
            a.pk.dateTime >= :from AND
            a.pk.dateTime <= :to
        ORDER BY a.pk.dateTime DESC
    """,
    )
    fun findLastByMmsi(
        mmsi: Long,
        from: ZonedDateTime,
        to: ZonedDateTime,
    ): List<AisPositionEntity>

    @Query("SELECT a FROM AisPositionEntity a WHERE a.ircs = :ircs AND a.pk.dateTime >= :from AND a.pk.dateTime <= :to")
    fun findLastByIrcs(
        ircs: String,
        from: ZonedDateTime,
        to: ZonedDateTime,
    ): List<AisPositionEntity>

    @Query(
        "SELECT a FROM AisPositionEntity a WHERE a.externalImmatriculation = :externalImmatriculation AND a.pk.dateTime >= :from AND a.pk.dateTime <= :to",
    )
    fun findLastByExternalImmatriculation(
        externalImmatriculation: String,
        from: ZonedDateTime,
        to: ZonedDateTime,
    ): List<AisPositionEntity>
}
