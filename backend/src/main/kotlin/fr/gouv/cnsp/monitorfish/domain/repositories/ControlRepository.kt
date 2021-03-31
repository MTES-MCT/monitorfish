package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.Control
import java.time.ZonedDateTime

interface ControlRepository {
    fun findVesselControls(vesselId: Int): List<Control>
}
