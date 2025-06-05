package fr.gouv.cnsp.monitorfish.domain.entities.logbook

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.FAR
import java.time.ZonedDateTime

object TestUtils {
    val getDummyFarMessages =
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
