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
            AlertTypeMapping.MISSING_FAR_ALERT -> {
                // If MISSING_FAR_ALERT was silenced, we also silence MISSING_FAR_48_HOURS_ALERT
                val missingFAR48HoursSilencedAlert = silencedAlert.copy(value = MissingFAR48HoursAlert())
                silencedAlertRepository.save(missingFAR48HoursSilencedAlert)
            }
            AlertTypeMapping.MISSING_FAR_48_HOURS_ALERT -> {
                // If MISSING_FAR_48_HOURS_ALERT was silenced, we also silence MISSING_FAR_ALERT
                val missingFARSilencedAlert = silencedAlert.copy(value = MissingFARAlert())
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
        val nextValueWithNatinf: AlertType = when (silencedAlert.value.type) {
            AlertTypeMapping.THREE_MILES_TRAWLING_ALERT -> ThreeMilesTrawlingAlert()
            AlertTypeMapping.FRENCH_EEZ_FISHING_ALERT -> FrenchEEZFishingAlert()
            AlertTypeMapping.TWELVE_MILES_FISHING_ALERT -> TwelveMilesFishingAlert()
            AlertTypeMapping.MISSING_FAR_ALERT -> MissingFARAlert()
            AlertTypeMapping.MISSING_FAR_48_HOURS_ALERT -> MissingFAR48HoursAlert()
            else -> {
                throw IllegalArgumentException("The alert type '${silencedAlert.value.type}' could not be silenced.")
            }
        }
        return silencedAlert.copy(value = nextValueWithNatinf)
    }
}
