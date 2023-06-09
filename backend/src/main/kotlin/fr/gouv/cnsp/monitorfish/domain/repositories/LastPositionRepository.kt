package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertTypeMapping
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPosition
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import java.time.ZonedDateTime

interface LastPositionRepository {
    fun findAll(): List<LastPosition>
    fun findAllInLast48Hours(): List<LastPosition>
    fun findAllWithBeaconMalfunctionBeforeLast48Hours(): List<LastPosition>
    fun findLastPositionDate(): ZonedDateTime
    fun removeAlertToLastPositionByVesselIdentifierEquals(
        alertType: AlertTypeMapping,
        vesselIdentifier: VesselIdentifier,
        value: String,
        isValidated: Boolean,
    )

    fun findUnderCharterForVessel(vesselIdentifier: VesselIdentifier, value: String): Boolean

    // For V0.222.0__Insert_dummy_facade_areas.sql purpose
    fun deleteAll()
}
