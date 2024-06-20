package fr.gouv.cnsp.monitorfish.fakers

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessageTyped
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookOperationType
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookTransmissionFormat
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import java.time.ZonedDateTime

class PriorNotificationFaker {
    companion object {
        fun fakePriorNotification(): PriorNotification {
            return PriorNotification(
                reportId = "FAKE_REPORT_ID_1",
                authorTrigram = null,
                createdAt = null,
                didNotFishAfterZeroNotice = false,
                isManuallyCreated = false,
                logbookMessageTyped = LogbookMessageTyped(
                    clazz = PNO::class.java,
                    logbookMessage = LogbookMessage(
                        id = 1,
                        reportId = "FAKE_REPORT_ID_1",
                        referencedReportId = null,
                        analyzedByRules = emptyList(),
                        isDeleted = false,
                        integrationDateTime = ZonedDateTime.now(),
                        isCorrectedByNewerMessage = false,
                        isEnriched = true,
                        message = PNO(),
                        messageType = "PNO",
                        operationDateTime = ZonedDateTime.now(),
                        operationNumber = "1",
                        operationType = LogbookOperationType.DAT,
                        reportDateTime = ZonedDateTime.now(),
                        transmissionFormat = LogbookTransmissionFormat.ERS,
                    ),
                ),
                port = null,
                reportingCount = null,
                seafront = null,
                sentAt = null,
                state = null,
                updatedAt = null,
                vessel = null,
                vesselRiskFactor = null,
            )
        }
    }
}
