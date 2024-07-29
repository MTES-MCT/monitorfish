package fr.gouv.cnsp.monitorfish.fakers

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.*
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import java.time.ZonedDateTime

class LogbookMessageFaker {
    companion object {
        fun fakePnoLogbookMessage(index: Int = 1): LogbookMessage {
            return LogbookMessage(
                id = index.toLong(),
                reportId = "FAKE_REPORT_ID_$index",
                referencedReportId = null,
                isDeleted = false,
                integrationDateTime = ZonedDateTime.now(),
                isCorrectedByNewerMessage = false,
                isEnriched = true,
                message = fakePnoMessage(),
                messageType = "PNO",
                operationDateTime = ZonedDateTime.now(),
                operationNumber = "$index",
                operationType = LogbookOperationType.DAT,
                reportDateTime = ZonedDateTime.now(),
                transmissionFormat = LogbookTransmissionFormat.ERS,
            )
        }

        private fun fakeLogbookFishingCatch(specyCode: String = "HKE"): LogbookFishingCatch {
            return LogbookFishingCatch(
                conversionFactor = null,
                economicZone = null,
                effortZone = null,
                faoZone = "FAO AREA 51",
                freshness = null,
                nbFish = null,
                packaging = null,
                presentation = null,
                preservationState = null,
                species = specyCode,
                speciesName = "Fake Species $specyCode",
                statisticalRectangle = null,
                weight = 42.0,
            )
        }

        private fun fakePnoMessage(): PNO {
            return PNO().apply {
                hasPortEntranceAuthorization = null
                hasPortLandingAuthorization = null
                catchOnboard = listOf(fakeLogbookFishingCatch())
                catchToLand = listOf(fakeLogbookFishingCatch())
                economicZone = null
                effortZone = null
                faoZone = null
                isInVerificationScope = null
                isVerified = null
                isBeingSent = null
                isSent = null
                latitude = null
                longitude = null
                note = null
                pnoTypes = emptyList()
                port = "FRABC"
                portName = null
                predictedArrivalDatetimeUtc = ZonedDateTime.now()
                predictedLandingDatetimeUtc = ZonedDateTime.now()
                purpose = LogbookMessagePurpose.LAN
                statisticalRectangle = null
            }
        }
    }
}
