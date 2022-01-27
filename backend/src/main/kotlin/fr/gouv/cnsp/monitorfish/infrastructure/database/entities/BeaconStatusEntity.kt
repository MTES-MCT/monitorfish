package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.BeaconStatus
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.Stage
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.VesselStatus
import java.time.Instant
import java.time.ZoneOffset
import javax.persistence.*

@Entity
@Table(name = "beacon_statuses")
data class BeaconStatusEntity(
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
        @Column(name = "vessel_identifier")
        @Enumerated(EnumType.STRING)
        val vesselIdentifier: VesselIdentifier,
        @Column(name = "vessel_status")
        @Enumerated(EnumType.STRING)
        val vesselStatus: VesselStatus,
        @Column(name = "stage")
        @Enumerated(EnumType.STRING)
        val stage: Stage,
        @Column(name = "priority")
        val priority: Boolean,
        @Column(name = "malfunction_start_date_utc")
        val malfunctionStartDateTime: Instant,
        @Column(name = "malfunction_end_date_utc")
        val malfunctionEndDateTime: Instant?,
        @Column(name = "vessel_status_last_modification_date_utc")
        val vesselStatusLastModificationDateTime: Instant) {

        fun toBeaconStatus() = BeaconStatus(
                id = id,
                internalReferenceNumber = internalReferenceNumber,
                ircs = ircs,
                externalReferenceNumber = externalReferenceNumber,
                vesselName = vesselName,
                vesselIdentifier = vesselIdentifier,
                vesselStatus = vesselStatus,
                stage = stage,
                priority = priority,
                malfunctionStartDateTime = malfunctionStartDateTime.atZone(ZoneOffset.UTC),
                malfunctionEndDateTime = malfunctionEndDateTime?.atZone(ZoneOffset.UTC),
                vesselStatusLastModificationDateTime = vesselStatusLastModificationDateTime.atZone(ZoneOffset.UTC))
}
