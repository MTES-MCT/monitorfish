package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.ais_position.AisPosition
import fr.gouv.cnsp.monitorfish.domain.entities.position.Position
import java.time.ZonedDateTime

interface AisPositionRepository {
    fun saveAll(positions: List<AisPosition>)

    fun findVesselLastAisPositionsByCfr(
        cfr: String,
        from: ZonedDateTime,
        to: ZonedDateTime,
    ): List<Position>

    fun findVesselLastAisPositionsByIrcs(
        ircs: String,
        from: ZonedDateTime,
        to: ZonedDateTime,
    ): List<Position>

    fun findVesselLastAisPositionsByExternalImmatriculation(
        externalImmatriculation: String,
        from: ZonedDateTime,
        to: ZonedDateTime,
    ): List<Position>
}
