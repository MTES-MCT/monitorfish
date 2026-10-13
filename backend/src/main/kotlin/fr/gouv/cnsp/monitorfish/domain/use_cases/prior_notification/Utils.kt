package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.UNKNOWN_VESSEL
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository

fun enrichWithVessel(
    priorNotifications: List<PriorNotification>,
    vesselRepository: VesselRepository,
): List<PriorNotification> {
    val vesselsById =
        priorNotifications
            .asSequence()
            .filter { it.isManuallyCreated }
            .mapNotNull { it.logbookMessageAndValue.logbookMessage.vesselId }
            .distinct()
            .chunked(5000)
            .flatMap { vesselRepository.findVesselsByIds(it) }
            .toList()

    val vesselsByInternalReferenceNumber =
        priorNotifications
            .asSequence()
            .filter { !it.isManuallyCreated }
            .mapNotNull { it.logbookMessageAndValue.logbookMessage.internalReferenceNumber }
            .distinct()
            .chunked(5000)
            .flatMap { vesselRepository.findVesselsByInternalReferenceNumbers(it) }
            .toList()

    val vessels = vesselsById + vesselsByInternalReferenceNumber

    return priorNotifications.map { pno ->
        val vessel =
            if (pno.isManuallyCreated) {
                vessels.find { it.id == pno.logbookMessageAndValue.logbookMessage.vesselId }
            } else {
                vessels.find {
                    it.internalReferenceNumber ==
                        pno.logbookMessageAndValue.logbookMessage.internalReferenceNumber
                }
            } ?: UNKNOWN_VESSEL

        pno.copy(vessel = vessel)
    }
}
