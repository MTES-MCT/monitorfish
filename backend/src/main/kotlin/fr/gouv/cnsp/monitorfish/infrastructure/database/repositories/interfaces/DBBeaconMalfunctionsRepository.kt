package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.BeaconMalfunctionEntity
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import java.time.Instant
import java.time.ZonedDateTime

interface DBBeaconMalfunctionsRepository : CrudRepository<BeaconMalfunctionEntity, Int> {
    @Query(
        value = "SELECT * FROM beacon_malfunctions where stage = 'ARCHIVED' ORDER BY vessel_status_last_modification_date_utc DESC LIMIT 60",
        nativeQuery = true,
    )
    fun findLastSixtyArchived(): List<BeaconMalfunctionEntity>

    @Query(value = "SELECT * FROM beacon_malfunctions where stage <> 'ARCHIVED'", nativeQuery = true)
    fun findAllExceptArchived(): List<BeaconMalfunctionEntity>

    @Modifying(clearAutomatically = true)
    @Query(
        value = "UPDATE beacon_malfunctions SET vessel_status = CAST(:vesselStatus AS beacon_malfunctions_vessel_status), vessel_status_last_modification_date_utc = :updateDateTime WHERE id = :beaconMalfunctionId",
        nativeQuery = true,
    )
    fun updateVesselStatus(beaconMalfunctionId: Int, vesselStatus: String, updateDateTime: ZonedDateTime)

    @Modifying(clearAutomatically = true)
    @Query(
        value = "UPDATE beacon_malfunctions SET stage = CAST(:stage AS beacon_malfunctions_stage), vessel_status_last_modification_date_utc = :updateDateTime WHERE id = :beaconMalfunctionId",
        nativeQuery = true,
    )
    fun updateStage(beaconMalfunctionId: Int, stage: String, updateDateTime: ZonedDateTime)

    @Modifying(clearAutomatically = true)
    @Query(
        value = """
        UPDATE beacon_malfunctions SET
            end_of_malfunction_reason = CAST(:endOfMalfunctionReason AS beacon_malfunctions_end_of_malfunction_reason),
            vessel_status_last_modification_date_utc = :updateDateTime,
            malfunction_end_date_utc = :updateDateTime
        WHERE id = :beaconMalfunctionId
        """,
        nativeQuery = true,
    )
    fun updateEndOfMalfunctionReason(
        beaconMalfunctionId: Int,
        endOfMalfunctionReason: String,
        updateDateTime: ZonedDateTime,
    )

    @Query(
        value = "SELECT * FROM beacon_malfunctions WHERE vessel_id = :vesselId AND malfunction_start_date_utc >= :afterDateTime",
        nativeQuery = true,
    )
    fun findAllByVesselIdEqualsAfterDateTime(vesselId: Int, afterDateTime: Instant): List<BeaconMalfunctionEntity>

    @Modifying(clearAutomatically = true)
    @Query(
        value = """
            UPDATE beacon_malfunctions
            SET
                notification_requested = CAST(:notificationType AS beacon_malfunction_notification_type),
                requested_notification_foreign_fmc_code = :requestedNotificationForeignFmcCode
            WHERE id = :beaconMalfunctionId
        """,
        nativeQuery = true
    )
    fun updateRequestNotification(beaconMalfunctionId: Int, notificationType: String, requestedNotificationForeignFmcCode: String?)
}
