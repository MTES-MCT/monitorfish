package fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses

import fr.gouv.cnsp.monitorfish.domain.entities.VesselIdentifier
import java.time.ZonedDateTime

data class BeaconStatus(
        val id: Int,
        val internalReferenceNumber: String?,
        val externalReferenceNumber: String?,
        val ircs: String?,
        val vesselIdentifier: VesselIdentifier,
        val vesselName: String,
        val vesselStatus: VesselStatus,
        val stage: Stage,
        val priority: Boolean,
        val malfunctionStartDateTime: ZonedDateTime,
        val malfunctionEndDateTime: ZonedDateTime?,
        val vesselStatusLastModificationDateTime: ZonedDateTime,
        var riskFactor: Double? = null)
