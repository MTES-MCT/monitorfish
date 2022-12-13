package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.*
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import jakarta.persistence.*
import java.time.Instant
import java.time.ZoneOffset

@Entity
@Table(name = "beacon_malfunctions")
data class BeaconMalfunctionEntity(
    @Id
    @Column(name = "id")
    val id: Int,
    @Column(name = "internal_reference_number")
    val internalReferenceNumber: String?,
    @Column(name = "ircs")
    val ircs: String?,
    @Column(name = "external_reference_number")
    val externalReferenceNumber: String?,
    @Column(name = "vessel_name")
    val vesselName: String,
    @Column(name = "flag_state")
    val flagState: String?,
    @Column(name = "vessel_identifier")
    @Enumerated(EnumType.STRING)
    val vesselIdentifier: VesselIdentifier,
    @Column(name = "vessel_status")
    @Enumerated(EnumType.STRING)
    val vesselStatus: VesselStatus,
    @Column(name = "stage")
    @Enumerated(EnumType.STRING)
    val stage: Stage,
    @Column(name = "malfunction_start_date_utc")
    val malfunctionStartDateTime: Instant,
    @Column(name = "malfunction_end_date_utc")
    val malfunctionEndDateTime: Instant?,
    @Column(name = "vessel_status_last_modification_date_utc")
    val vesselStatusLastModificationDateTime: Instant,
    @Enumerated(EnumType.STRING)
    @Column(name = "end_of_malfunction_reason", columnDefinition = "beacon_malfunctions_end_of_malfunction_reason")
    val endOfBeaconMalfunctionReason: EndOfBeaconMalfunctionReason,
    @Column(name = "vessel_id", nullable = false)
    val vesselId: Int,
    @Column(name = "notification_requested")
    @Enumerated(EnumType.STRING)
    val notificationRequested: BeaconMalfunctionNotificationType?,
    @Column(name = "requested_notification_foreign_fmc_code")
    val requestedNotificationForeignFmcCode: String?,
    @Column(name = "beacon_number")
    val beaconNumber: String,
    @Enumerated(EnumType.STRING)
    @Column(name = "beacon_status_at_malfunction_creation")
    val beaconStatusAtMalfunctionCreation: BeaconStatus,
) {
    fun toBeaconMalfunction() = BeaconMalfunction(
        id = id,
        internalReferenceNumber = internalReferenceNumber,
        ircs = ircs,
        externalReferenceNumber = externalReferenceNumber,
        vesselName = vesselName,
        flagState = flagState,
        vesselIdentifier = vesselIdentifier,
        vesselStatus = vesselStatus,
        stage = stage,
        malfunctionStartDateTime = malfunctionStartDateTime.atZone(ZoneOffset.UTC),
        malfunctionEndDateTime = malfunctionEndDateTime?.atZone(ZoneOffset.UTC),
        vesselStatusLastModificationDateTime = vesselStatusLastModificationDateTime.atZone(ZoneOffset.UTC),
        endOfBeaconMalfunctionReason = endOfBeaconMalfunctionReason,
        vesselId = vesselId,
        notificationRequested = notificationRequested,
        requestedNotificationForeignFmcCode= requestedNotificationForeignFmcCode,
        beaconNumber = beaconNumber,
        beaconStatusAtMalfunctionCreation = beaconStatusAtMalfunctionCreation,
    )
}
