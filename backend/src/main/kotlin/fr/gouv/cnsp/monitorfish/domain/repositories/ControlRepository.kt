package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.use_cases.dtos.ControlAndInfractionIds
import java.time.ZonedDateTime

interface ControlRepository {
    fun findVesselControlsAfterDateTime(vesselId: Int, afterDateTime: ZonedDateTime): List<ControlAndInfractionIds>
}
