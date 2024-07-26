package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.LastPositionEntity
import org.hibernate.annotations.DynamicUpdate
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import java.time.Instant
import java.time.ZonedDateTime

@DynamicUpdate
interface DBLastPositionRepository : JpaRepository<LastPositionEntity, Int> {
    fun findAllByDateTimeLessThanEqualAndBeaconMalfunctionIdNotNull(dateTime: ZonedDateTime): List<LastPositionEntity>

    /**
     * We need to get all recent positions OR positions with a beacon malfunction
     */
    fun findAllByDateTimeGreaterThanEqualOrBeaconMalfunctionIdNotNull(dateTime: ZonedDateTime): List<LastPositionEntity>

    @Query(
        "select last_position_datetime_utc from last_positions where last_position_datetime_utc < now() order by last_position_datetime_utc desc limit 1",
        nativeQuery = true,
    )
    fun findLastPositionDateTime(): Instant

    @Modifying(clearAutomatically = true)
    @Query(
        value = """
        UPDATE last_positions
        SET
            alerts = f_array_remove_elem(alerts, array_position(alerts, :alertType)),
            reportings = CASE
                WHEN :isValidated IS TRUE THEN array_append(reportings, 'ALERT')
                ELSE reportings
            END
        WHERE
            CASE
                WHEN :vesselIdentifier = 'INTERNAL_REFERENCE_NUMBER' THEN cfr
                WHEN :vesselIdentifier = 'IRCS' THEN ircs
                WHEN :vesselIdentifier = 'EXTERNAL_REFERENCE_NUMBER' THEN external_immatriculation
            END = :value
        """,
        nativeQuery = true,
    )
    fun removeAlertByVesselIdentifierEquals(
        vesselIdentifier: String,
        value: String,
        alertType: String,
        isValidated: Boolean,
    )
}
