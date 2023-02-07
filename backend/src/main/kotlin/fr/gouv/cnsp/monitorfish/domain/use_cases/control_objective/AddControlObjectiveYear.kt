package fr.gouv.cnsp.monitorfish.domain.use_cases.control_objective

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.repositories.ControlObjectivesRepository
import java.time.Clock
import java.time.ZonedDateTime

@UseCase
class AddControlObjectiveYear(
    private val controlObjectivesRepository: ControlObjectivesRepository,
    private val clock: Clock,
) {
    fun execute() {
        val lastYearFoundInEntries = controlObjectivesRepository.findYearEntries().first()
        val currentYear = ZonedDateTime.now(clock).year
        val nextYear = currentYear + 1
        val previousYear = currentYear - 1

        require(lastYearFoundInEntries < nextYear) {
            "The year $nextYear is already added in the control objectives"
        }

        if (lastYearFoundInEntries == currentYear) {
            return controlObjectivesRepository.addYear(currentYear, nextYear)
        } else if (lastYearFoundInEntries == previousYear) {
            return controlObjectivesRepository.addYear(previousYear, currentYear)
        }
    }
}
