package fr.gouv.cnsp.monitorfish.domain.entities.logbook

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.Acknowledgment
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.FAR
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.LAN
import java.time.ZonedDateTime

object TestUtils {
    val dummyCorrectedLanMessages =
        listOf(
            LogbookMessage(
                id = null,
                operationNumber = "OOF20190430059907",
                tripNumber = "9463714",
                operationType = LogbookOperationType.DAT,
                reportId = "OOF20190430059907",
                referencedReportId = null,
                reportDateTime = ZonedDateTime.parse("2019-04-30T12:41:00Z"),
                operationDateTime = ZonedDateTime.parse("2019-04-30T12:41:00Z"),
                internalReferenceNumber = "FAK000999999",
                ircs = "CALLME",
                externalReferenceNumber = "DONTSINK",
                vesselName = "PHENOMENE",
                flagState = "FRA",
                imo = null,
                messageType = "LAN",
                message = LAN(),
                activityDateTime = ZonedDateTime.parse("2019-09-03T12:18Z"),
                integrationDateTime = ZonedDateTime.parse("2021-01-18T07:17:31.532639Z"),
                transmissionFormat = LogbookTransmissionFormat.ERS,
                software = "TurboCatch (3.7-1)",
            ),
            LogbookMessage(
                id = null,
                operationNumber = "OOF20190430059918",
                tripNumber = "9463714",
                operationType = LogbookOperationType.RET,
                reportId = null,
                referencedReportId = "OOF20190430059907",
                reportDateTime = ZonedDateTime.parse("2019-10-30T11:32:00Z"),
                operationDateTime = ZonedDateTime.parse("2019-10-17T11:36:00Z"),
                internalReferenceNumber = null,
                ircs = null,
                externalReferenceNumber = null,
                vesselName = null,
                flagState = null,
                imo = null,
                messageType = "",
                message = Acknowledgment(returnStatus = "000"),
                activityDateTime = null,
                integrationDateTime = ZonedDateTime.parse("2021-01-18T07:19:28.384921Z"),
                transmissionFormat = LogbookTransmissionFormat.ERS,
                software = "TurboCatch (3.7-1)",
            ),
            LogbookMessage(
                id = null,
                operationNumber = "OOF69850430059918",
                tripNumber = "9463714",
                operationType = LogbookOperationType.COR,
                reportId = "OOF69850430059918",
                referencedReportId = "OOF20190430059907",
                reportDateTime = ZonedDateTime.parse("2019-04-30T12:41:00Z"),
                operationDateTime = ZonedDateTime.parse("2019-04-30T12:41:00Z"),
                internalReferenceNumber = "FAK000999999",
                ircs = "CALLME",
                externalReferenceNumber = "DONTSINK",
                vesselName = "PHENOMENE",
                flagState = "FRA",
                imo = null,
                messageType = "LAN",
                message = LAN(),
                activityDateTime = ZonedDateTime.parse("2019-09-03T12:18Z"),
                integrationDateTime = ZonedDateTime.parse("2021-01-18T07:17:31.532639Z"),
                transmissionFormat = LogbookTransmissionFormat.ERS,
                software = "TurboCatch (3.7-1)",
            ),
            LogbookMessage(
                id = null,
                operationNumber = "OOF20190433689918",
                tripNumber = null,
                operationType = LogbookOperationType.RET,
                reportId = null,
                referencedReportId = "OOF69850430059918",
                reportDateTime = ZonedDateTime.parse("2019-10-30T11:32:00Z"),
                operationDateTime = ZonedDateTime.parse("2019-10-17T11:36:00Z"),
                internalReferenceNumber = null,
                ircs = null,
                externalReferenceNumber = null,
                vesselName = null,
                flagState = null,
                imo = null,
                messageType = "",
                message = Acknowledgment(returnStatus = "000"),
                activityDateTime = null,
                integrationDateTime = ZonedDateTime.parse("2021-01-18T07:19:28.384921Z"),
                transmissionFormat = LogbookTransmissionFormat.ERS,
                software = "TurboCatch (3.7-1)",
            ),
        )

    val dummyFarMessages =
        listOf(
            LogbookMessage(
                id = null,
                reportId = "010b9f1b-0a70-4ad3-81a7-985c69979a82",
                operationNumber = "819d9175-afb6-42e0-b404-67de1b2cc0a5",
                tripNumber = "BEL-DMPE-2025053000614",
                referencedReportId = "56a89cff-71f7-46db-b3ee-7090e4861685",
                operationDateTime = ZonedDateTime.parse("2025-06-03T00:16:28Z"),
                activityDateTime = ZonedDateTime.parse("2025-06-02T00:00:00Z"),
                internalReferenceNumber = "BEL065451",
                externalReferenceNumber = "EFMPD",
                ircs = "OPLJ",
                vesselName = "Ma MORE",
                vesselId = null,
                flagState = "BEL",
                imo = null,
                integrationDateTime = ZonedDateTime.parse("2025-06-03T00:25:19.69861Z"),
                rawMessage = "",
                transmissionFormat = LogbookTransmissionFormat.FLUX,
                software = null,
                isDeleted = false,
                isEnriched = false,
                isSentByFailoverSoftware = false,
                message =
                    FAR().apply {
                        hauls =
                            listOf(
                                Haul().apply {
                                    gear = "TBB"
                                    gearName = "Chaluts à perche"
                                    mesh = 70.0
                                    catchDateTime = ZonedDateTime.parse("2025-06-02T00:00:00Z")
                                    catches =
                                        listOf(
                                            LogbookFishingCatch(
                                                weight = 150.0,
                                                nbFish = 25.0,
                                                species = "SOL",
                                                speciesName = "Atlantic Cod",
                                                faoZone = "27.4.a",
                                                freshness = "FRESH",
                                                packaging = "BOX",
                                                effortZone = "EEZ-FR",
                                                presentation = "WHOLE",
                                                economicZone = "FR",
                                                conversionFactor = 1.12,
                                                preservationState = "CHILLED",
                                                statisticalRectangle = "40F1",
                                            ),
                                            LogbookFishingCatch(
                                                weight = 1050.0,
                                                nbFish = 25.0,
                                                species = "COD",
                                                speciesName = "Atlantic Cod",
                                                faoZone = "27.4.a",
                                                freshness = "FRESH",
                                                packaging = "BOX",
                                                effortZone = "EEZ-FR",
                                                presentation = "WHOLE",
                                                economicZone = "FR",
                                                conversionFactor = 1.12,
                                                preservationState = "CHILLED",
                                                statisticalRectangle = "40F1",
                                            ),
                                            LogbookFishingCatch(
                                                weight = 160.0,
                                                nbFish = 25.0,
                                                species = "MNZ",
                                                speciesName = "Atlantic Cod",
                                                faoZone = "27.4.a",
                                                freshness = "FRESH",
                                                packaging = "BOX",
                                                effortZone = "EEZ-FR",
                                                presentation = "WHOLE",
                                                economicZone = "FR",
                                                conversionFactor = 1.12,
                                                preservationState = "CHILLED",
                                                statisticalRectangle = "40F1",
                                            ),
                                        )
                                    latitude = null
                                    longitude = null
                                    dimensions = null
                                },
                            )
                    },
                messageType = "FAR",
                operationType = LogbookOperationType.COR,
                reportDateTime = ZonedDateTime.parse("2025-06-03T00:16:28Z"),
                tripGears = emptyList(),
                tripSegments = emptyList(),
            ),
            LogbookMessage(
                id = null,
                reportId = "56a89cff-71f7-46db-b3ee-7090e4861685",
                operationNumber = "56a89cff-71f7-46db-b3ee-7090e4861685",
                tripNumber = "BEL-DMPE-2025053000614",
                referencedReportId = null,
                operationDateTime = ZonedDateTime.parse("2025-06-03T00:15:28Z"),
                activityDateTime = ZonedDateTime.parse("2025-06-02T00:00:00Z"),
                internalReferenceNumber = "BEL065451",
                externalReferenceNumber = "EFMPD",
                ircs = "OPLJ",
                vesselName = "Ma MORE",
                vesselId = null,
                flagState = "BEL",
                imo = null,
                integrationDateTime = ZonedDateTime.parse("2025-06-03T00:25:19.69861Z"),
                rawMessage = "",
                transmissionFormat = LogbookTransmissionFormat.FLUX,
                software = null,
                isDeleted = false,
                isEnriched = false,
                isSentByFailoverSoftware = false,
                message =
                    FAR().apply {
                        hauls =
                            listOf(
                                Haul().apply {
                                    gear = "TBB"
                                    gearName = "Chaluts à perche"
                                    mesh = 70.0
                                    catchDateTime = ZonedDateTime.parse("2025-06-02T00:00:00Z")
                                    catches =
                                        listOf(
                                            LogbookFishingCatch(
                                                weight = 10.0,
                                                nbFish = 25.0,
                                                species = "SOL",
                                                speciesName = "Atlantic Cod",
                                                faoZone = "27.4.a",
                                                freshness = "FRESH",
                                                packaging = "BOX",
                                                effortZone = "EEZ-FR",
                                                presentation = "WHOLE",
                                                economicZone = "FR",
                                                conversionFactor = 1.12,
                                                preservationState = "CHILLED",
                                                statisticalRectangle = "40F1",
                                            ),
                                        )
                                    latitude = null
                                    longitude = null
                                    dimensions = null
                                },
                            )
                    },
                messageType = "FAR",
                operationType = LogbookOperationType.DAT,
                reportDateTime = ZonedDateTime.parse("2025-06-01T00:16:28Z"),
                tripGears = emptyList(),
                tripSegments = emptyList(),
            ),
        )
}
