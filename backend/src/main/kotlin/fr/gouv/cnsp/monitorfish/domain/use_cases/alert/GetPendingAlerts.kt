package fr.gouv.cnsp.monitorfish.domain.use_cases.alert

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertTypeMapping
import fr.gouv.cnsp.monitorfish.domain.exceptions.NatinfCodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.InfractionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PendingAlertRepository
import org.slf4j.LoggerFactory

@UseCase
class GetPendingAlerts(
    private val pendingAlertRepository: PendingAlertRepository,
    private val infractionRepository: InfractionRepository,
) {
    private val logger = LoggerFactory.getLogger(GetPendingAlerts::class.java)

    fun execute(): List<PendingAlert> =
        pendingAlertRepository
            .findAlertsOfTypes(
                listOf(
                    AlertTypeMapping.THREE_MILES_TRAWLING_ALERT,
                    AlertTypeMapping.FRENCH_EEZ_FISHING_ALERT,
                    AlertTypeMapping.TWELVE_MILES_FISHING_ALERT,
                    AlertTypeMapping.RTC_FISHING_ALERT,
                    AlertTypeMapping.MISSING_DEP_ALERT,
                    AlertTypeMapping.MISSING_FAR_48_HOURS_ALERT,
                    AlertTypeMapping.SUSPICION_OF_UNDER_DECLARATION_ALERT,
                ),
            ).map { pendingAlert ->
                pendingAlert.value.natinfCode?.let {
                    try {
                        pendingAlert.infraction = infractionRepository.findInfractionByNatinfCode(it)
                    } catch (e: NatinfCodeNotFoundException) {
                        logger.warn(e.message)
                    }
                }

                pendingAlert
            }
}
