package fr.gouv.cnsp.monitorfish.domain.use_cases.alert

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.SilencedAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.*
import fr.gouv.cnsp.monitorfish.domain.repositories.SilencedAlertRepository
import org.slf4j.LoggerFactory

@UseCase
class SilenceAlert(
    private val silencedAlertRepository: SilencedAlertRepository,
) {
    private val logger = LoggerFactory.getLogger(SilenceAlert::class.java)

    fun execute(silencedAlert: SilencedAlert): SilencedAlert {
        // We recreate the object from the `value.type` as the AlertType class from our domain contains the `natinfCode`
        val silencedAlertWithNatinf = getSilencedAlertWithNatinf(silencedAlert)

        val savedSilencedAlert = silencedAlertRepository.save(silencedAlertWithNatinf)

        // If the silenced alert is of type MISSING_FAR_ALERT or MISSING_FAR_48_HOURS_ALERT, we need to save the other silenced alert
        when (silencedAlert.value.type) {
            AlertType.MISSING_FAR_ALERT -> {
                // If MISSING_FAR_ALERT was silenced, we also silence MISSING_FAR_48_HOURS_ALERT
                val missingFAR48HoursSilencedAlert =
                    silencedAlert
                        .copy(value = AlertType.MISSING_FAR_48_HOURS_ALERT.getValue())
                silencedAlertRepository.save(missingFAR48HoursSilencedAlert)
            }
            AlertType.MISSING_FAR_48_HOURS_ALERT -> {
                // If MISSING_FAR_48_HOURS_ALERT was silenced, we also silence MISSING_FAR_ALERT
                val missingFARSilencedAlert =
                    silencedAlert
                        .copy(value = AlertType.MISSING_FAR_ALERT.getValue())
                silencedAlertRepository.save(missingFARSilencedAlert)
            }
            else -> {}
        }

        logger.info(
            "Alert ${savedSilencedAlert.value.type} has been silenced for vessel " +
                "${savedSilencedAlert.internalReferenceNumber}/${savedSilencedAlert.ircs}/${savedSilencedAlert.externalReferenceNumber}.",
        )

        return savedSilencedAlert
    }

    private fun getSilencedAlertWithNatinf(silencedAlert: SilencedAlert): SilencedAlert {
        val nextValueWithNatinf: Alert =
            when (silencedAlert.value.type) {
                AlertType.POSITION_ALERT -> {
                    requireNotNull(silencedAlert.value.alertId) {
                        "The alert id of a POSITION_ALERT should be not null"
                    }

                    Alert(
                        type = silencedAlert.value.type,
                        alertId = silencedAlert.value.alertId,
                        natinfCode = silencedAlert.value.natinfCode,
                        seaFront = silencedAlert.value.seaFront,
                        name = silencedAlert.value.name,
                        description = silencedAlert.value.description,
                    )
                }
                AlertType.MISSING_DEP_ALERT -> AlertType.MISSING_DEP_ALERT.getValue()
                AlertType.MISSING_FAR_ALERT -> AlertType.MISSING_FAR_ALERT.getValue()
                AlertType.MISSING_FAR_48_HOURS_ALERT -> AlertType.MISSING_FAR_48_HOURS_ALERT.getValue()
                else -> {
                    throw IllegalArgumentException(
                        "The alert type '${silencedAlert.value.type}' could not be silenced.",
                    )
                }
            }
        return silencedAlert.copy(value = nextValueWithNatinf)
    }
}
