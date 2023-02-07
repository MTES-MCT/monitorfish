package fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.repositories.FleetSegmentRepository
import java.time.Clock
import java.time.ZonedDateTime

@UseCase
class AddFleetSegmentYear(
    private val fleetSegmentRepository: FleetSegmentRepository,
    private val clock: Clock,
) {
    fun execute(nextYear: Int) {
        val currentYear = ZonedDateTime.now(clock).year

        return fleetSegmentRepository.addYear(currentYear, nextYear)
    }
}
