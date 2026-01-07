package fr.gouv.cnsp.monitorfish.domain.use_cases.alert

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PositionAlertSpecification
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.entities.infraction.Infraction
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendInternalErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendInternalException
import fr.gouv.cnsp.monitorfish.domain.exceptions.NatinfCodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.InfractionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PendingAlertRepository
import org.slf4j.LoggerFactory

@UseCase
class GetPendingAlerts(
    private val getPositionAlertSpecifications: GetPositionAlertSpecifications,
    private val pendingAlertRepository: PendingAlertRepository,
    private val infractionRepository: InfractionRepository,
) {
    private val logger = LoggerFactory.getLogger(GetPendingAlerts::class.java)

    fun execute(): List<Pair<PendingAlert, PositionAlertSpecification>> {
        val alertSpecifications = getPositionAlertSpecifications.execute()

        return pendingAlertRepository
            .findAlertsOfTypes(
                listOf(
                    AlertType.POSITION_ALERT,
                    AlertType.MISSING_DEP_ALERT,
                    AlertType.MISSING_FAR_48_HOURS_ALERT,
                    AlertType.SUSPICION_OF_UNDER_DECLARATION_ALERT,
                ),
            ).map { pendingAlert ->
                val pendingAlertWithInfraction =
                    getInfraction(pendingAlert)?.let { infraction ->
                        pendingAlert.copy(infraction = infraction)
                    } ?: pendingAlert

                val specification = getSpecification(alertSpecifications, pendingAlertWithInfraction)

                return@map Pair(pendingAlertWithInfraction, specification)
            }
    }

    private fun getSpecification(
        alertSpecifications: List<PositionAlertSpecification>,
        pendingAlertWithInfraction: PendingAlert,
    ): PositionAlertSpecification =
        alertSpecifications.singleOrNull {
            if (pendingAlertWithInfraction.value.alertId != null) {
                return@singleOrNull it.id == pendingAlertWithInfraction.value.alertId
            }

            return@singleOrNull it.name == pendingAlertWithInfraction.value.name
        } ?: throw BackendInternalException(
            message = "Could not find alert specification of alertId: ${pendingAlertWithInfraction.value.alertId} and alertName: ${pendingAlertWithInfraction.value.name}",
            code = BackendInternalErrorCode.UNPROCESSABLE_RESOURCE_DATA
        )

    private fun getInfraction(pendingAlert: PendingAlert): Infraction? {
        return pendingAlert.value.natinfCode?.let {
            return try {
                infractionRepository.findInfractionByNatinfCode(it)
            } catch (e: NatinfCodeNotFoundException) {
                logger.warn(e.message)

                null
            }
        }
    }
}
