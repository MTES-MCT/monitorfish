package fr.gouv.cnsp.monitorfish.domain.use_cases.alert

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.SilencedAlert
import fr.gouv.cnsp.monitorfish.domain.repositories.SilencedAlertRepository
import org.slf4j.LoggerFactory

@UseCase
class GetSilencedAlerts(private val silencedAlertRepository: SilencedAlertRepository) {
    private val logger = LoggerFactory.getLogger(GetSilencedAlerts::class.java)

    fun execute(): List<SilencedAlert> {
        return silencedAlertRepository.findAllCurrentSilencedAlerts()
                .filter {
                    it.wasValidated == null || it.wasValidated.let { wasValidated -> !wasValidated }
                }
    }
}
