package fr.gouv.cnsp.monitorfish.domain.use_cases.healthcheck

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.health.Health
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionRepository

@UseCase
class GetHealthcheck(
    private val lastPositionRepository: LastPositionRepository,
    private val positionRepository: PositionRepository,
    private val logbookReportRepository: LogbookReportRepository
) {
    fun execute(): Health {
        val dateLastPositionUpdatedByPrefect = lastPositionRepository.findLastPositionDate()
        val dateLastPositionReceivedByAPI = positionRepository.findLastPositionDate()
        val logbookMessageDateTime = logbookReportRepository.findLastMessageDate()

        return Health(
            dateLastPositionUpdatedByPrefect = dateLastPositionUpdatedByPrefect,
            dateLastPositionReceivedByAPI = dateLastPositionReceivedByAPI,
            dateLogbookMessageReceived = logbookMessageDateTime
        )
    }
}
