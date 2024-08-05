package fr.gouv.cnsp.monitorfish.fakers

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessageAndValue
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import java.time.ZonedDateTime

class PriorNotificationFaker {
    companion object {
        fun fakePriorNotification(index: Int = 1): PriorNotification {
            return PriorNotification(
                reportId = "FAKE_REPORT_ID_$index",
                authorTrigram = "ABC",
                createdAt = ZonedDateTime.now(),
                didNotFishAfterZeroNotice = false,
                isManuallyCreated = false,
                logbookMessageAndValue = LogbookMessageAndValue(
                    clazz = PNO::class.java,
                    logbookMessage = LogbookMessageFaker.fakePnoLogbookMessage(index),
                ),
                port = PortFaker.fakePort(),
                reportingCount = null,
                seafront = null,
                sentAt = ZonedDateTime.now(),
                updatedAt = ZonedDateTime.now(),
                vessel = VesselFaker.fakeVessel(),
                lastControlDateTime = null,
            )
        }
    }
}
