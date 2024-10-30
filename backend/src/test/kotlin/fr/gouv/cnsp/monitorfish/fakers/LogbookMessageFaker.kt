package fr.gouv.cnsp.monitorfish.fakers

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.*
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.Acknowledgment
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import java.time.ZonedDateTime

class LogbookMessageFaker {
    companion object {
        fun fakePnoLogbookMessage(index: Int): LogbookMessage {
            return LogbookMessage(
                id = index.toLong(),
                reportId = "FAKE_REPORT_ID_$index",
                referencedReportId = null,
                integrationDateTime = ZonedDateTime.now(),
                isCorrectedByNewerMessage = false,
                isDeleted = false,
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

        fun fakePnoLogbookMessage(
            id: Long? = null,
            reportId: String? = null,
            referencedReportId: String? = null,
            acknowledgment: Acknowledgment? = null,
            externalReferenceNumber: String? = null,
            flagState: String? = null,
            imo: String? = null,
            integrationDateTime: ZonedDateTime = ZonedDateTime.now(),
            internalReferenceNumber: String? = null,
            ircs: String? = null,
            isCorrectedByNewerMessage: Boolean = false,
            isDeleted: Boolean = false,
            isEnriched: Boolean = false,
            isSentByFailoverSoftware: Boolean = false,
            message: PNO = fakePnoMessage(),
            messageType: String? = null,
            operationDateTime: ZonedDateTime = ZonedDateTime.now(),
            operationNumber: String? = null,
            operationType: LogbookOperationType = LogbookOperationType.DAT,
            rawMessage: String? = null,
            reportDateTime: ZonedDateTime? = null,
            software: String? = null,
            transmissionFormat: LogbookTransmissionFormat? = null,
            tripGears: List<LogbookTripGear>? = emptyList(),
            tripNumber: String? = null,
            tripSegments: List<LogbookTripSegment>? = emptyList(),
            vesselId: Int? = null,
            vesselName: String? = null,
        ): LogbookMessage {
            return LogbookMessage(
                id = id,
                reportId = reportId,
                referencedReportId = referencedReportId,
                acknowledgment = acknowledgment,
                externalReferenceNumber = externalReferenceNumber,
                flagState = flagState,
                imo = imo,
                integrationDateTime = integrationDateTime,
                internalReferenceNumber = internalReferenceNumber,
                ircs = ircs,
                isCorrectedByNewerMessage = isCorrectedByNewerMessage,
                isDeleted = isDeleted,
                isEnriched = isEnriched,
                isSentByFailoverSoftware = isSentByFailoverSoftware,
                message = message,
                messageType = messageType,
                operationDateTime = operationDateTime,
                operationNumber = operationNumber,
                operationType = operationType,
                rawMessage = rawMessage,
                reportDateTime = reportDateTime,
                software = software,
                transmissionFormat = transmissionFormat,
                tripGears = tripGears,
                tripNumber = tripNumber,
                tripSegments = tripSegments,
                vesselId = vesselId,
                vesselName = vesselName,
            )
        }

        fun fakeLogbookFishingCatch(
            conversionFactor: Double? = null,
            economicZone: String? = null,
            effortZone: String? = null,
            faoZone: String? = "FAO AREA 51",
            freshness: String? = null,
            nbFish: Double? = null,
            packaging: String? = null,
            presentation: String? = null,
            preservationState: String? = null,
            species: String? = "HKE",
            speciesName: String? = "Fake Species HKE",
            statisticalRectangle: String? = null,
            weight: Double? = 42.0,
        ): LogbookFishingCatch {
            return LogbookFishingCatch(
                conversionFactor = conversionFactor,
                economicZone = economicZone,
                effortZone = effortZone,
                faoZone = faoZone,
                freshness = freshness,
                nbFish = nbFish,
                packaging = packaging,
                presentation = presentation,
                preservationState = preservationState,
                species = species,
                speciesName = speciesName,
                statisticalRectangle = statisticalRectangle,
                weight = weight,
            )
        }

        fun fakePnoMessage(): PNO {
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
