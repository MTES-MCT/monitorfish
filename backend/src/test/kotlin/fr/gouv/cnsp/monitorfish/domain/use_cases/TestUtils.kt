package fr.gouv.cnsp.monitorfish.domain.use_cases

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.*
import fr.gouv.cnsp.monitorfish.domain.entities.facade.Seafront.NAMO
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.*
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.*
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.Infraction
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.InfractionCategory
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.*
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups.dtos.CreateOrUpdateDynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups.dtos.CreateOrUpdateFixedVesselGroup
import java.time.ZoneOffset.UTC
import java.time.ZonedDateTime

object TestUtils {
    val DUMMY_VESSEL =
        Vessel(
            id = 123,
            internalReferenceNumber = "DUMMY_CFR",
            flagState = CountryCode.FR,
            hasLogbookEsacapt = false,
        )

    fun createCurrentReporting(
        internalReferenceNumber: String,
        id: Int,
        validationDate: ZonedDateTime,
        type: ReportingType,
        alertType: AlertTypeMapping?,
        isArchived: Boolean? = false,
        natinfCode: Int? = null,
    ): Reporting =
        Reporting(
            id = id,
            validationDate = validationDate,
            creationDate = ZonedDateTime.now().minusDays(1),
            type = type,
            isArchived = isArchived ?: false,
            isDeleted = false,
            infraction =
                Infraction(
                    natinfCode = 2610,
                    infractionCategory = InfractionCategory.FISHING,
                ),
            value =
                when (alertType) {
                    AlertTypeMapping.PNO_LAN_WEIGHT_TOLERANCE_ALERT -> throw IllegalArgumentException(
                        "Unhandled test case",
                    )
                    AlertTypeMapping.THREE_MILES_TRAWLING_ALERT -> ThreeMilesTrawlingAlert(seaFront = NAMO.toString())
                    AlertTypeMapping.FRENCH_EEZ_FISHING_ALERT -> FrenchEEZFishingAlert(seaFront = NAMO.toString())
                    AlertTypeMapping.TWELVE_MILES_FISHING_ALERT -> TwelveMilesFishingAlert(seaFront = NAMO.toString())
                    AlertTypeMapping.RTC_FISHING_ALERT -> RTCFishingAlert(seaFront = NAMO.toString())
                    AlertTypeMapping.MISSING_FAR_ALERT -> MissingFARAlert(seaFront = NAMO.toString())
                    AlertTypeMapping.MISSING_FAR_48_HOURS_ALERT -> MissingFAR48HoursAlert(seaFront = NAMO.toString())
                    else ->
                        InfractionSuspicion(
                            ReportingActor.OPS,
                            natinfCode = natinfCode ?: 123456,
                            authorTrigram = "LTH",
                            title = "A title",
                        )
                },
            underCharter = null,
            vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
            internalReferenceNumber = internalReferenceNumber,
            flagState = CountryCode.FR,
        )

    fun getDummyReportings(dateTime: ZonedDateTime): List<Reporting> =
        listOf(
            Reporting(
                id = 1,
                type = ReportingType.ALERT,
                vesselName = "BIDUBULE",
                internalReferenceNumber = "FR224226850",
                externalReferenceNumber = "1236514",
                ircs = "IRCS",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = dateTime,
                validationDate = dateTime,
                value = ThreeMilesTrawlingAlert() as ReportingValue,
                isArchived = false,
                isDeleted = false,
            ),
            Reporting(
                id = 2,
                type = ReportingType.ALERT,
                vesselName = "BIDUBULE",
                internalReferenceNumber = "FR224226850",
                externalReferenceNumber = "1236514",
                ircs = "IRCS",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = dateTime,
                validationDate = dateTime,
                value = ThreeMilesTrawlingAlert() as ReportingValue,
                isArchived = false,
                isDeleted = false,
            ),
            Reporting(
                id = 666,
                type = ReportingType.ALERT,
                vesselName = "BIDUBULE",
                internalReferenceNumber = "FR224226850",
                externalReferenceNumber = "1236514",
                ircs = "IRCS",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = dateTime.minusYears(1),
                validationDate = dateTime.minusYears(1),
                value = ThreeMilesTrawlingAlert() as ReportingValue,
                isArchived = true,
                isDeleted = false,
            ),
        )

    fun getDummyLogbookMessages(): List<LogbookMessage> {
        val gearOne = LogbookTripGear()
        gearOne.gear = "OTB"
        val gearTwo = LogbookTripGear()
        gearTwo.gear = "DRB"

        val catchOne = LogbookFishingCatch()
        catchOne.species = "TTV"
        val catchTwo = LogbookFishingCatch()
        catchTwo.species = "SMV"
        val catchThree = LogbookFishingCatch()
        catchThree.species = "PNB"

        val dep = DEP()
        dep.gearOnboard = listOf(gearOne, gearTwo)
        dep.speciesOnboard = listOf(catchOne)
        dep.departurePort = "AEFAT"

        val far = FAR()
        val haul = Haul()
        haul.gear = "OTB"
        haul.catches = listOf(catchTwo, catchThree)
        haul.mesh = 120.0
        haul.dimensions = "150;120"
        far.hauls = listOf(haul)

        val protectedSpeciesCatch = ProtectedSpeciesCatch()
        protectedSpeciesCatch.economicZone = "FRA"
        protectedSpeciesCatch.effortZone = "C"
        protectedSpeciesCatch.faoZone = "27.8.a"
        protectedSpeciesCatch.statisticalRectangle = "23E6"
        protectedSpeciesCatch.species = "TTV"
        protectedSpeciesCatch.weight = 125.0
        protectedSpeciesCatch.healthState = HealthState.DEA
        val cpsMessage = CPS()
        cpsMessage.catches = listOf(protectedSpeciesCatch)
        cpsMessage.gear = "OTB"
        cpsMessage.mesh = 80.0
        cpsMessage.latitude = 45.389
        cpsMessage.longitude = -1.303
        cpsMessage.cpsDatetime = ZonedDateTime.now()

        val coe = COE()
        coe.targetSpeciesOnEntry = "DEM"

        val cox = COX()
        cox.targetSpeciesOnExit = "DEM"

        val pno = PNO()
        pno.catchOnboard = listOf(catchOne, catchTwo, catchThree)
        pno.port = "AEJAZ"

        return listOf(
            LogbookMessage(
                id = 2,
                operationNumber = "",
                tripNumber = "345",
                reportId = "REPORT_ID#1",
                operationType = LogbookOperationType.DAT,
                messageType = "FAR",
                software = "TurboCatch (3.7-1)",
                message = far,
                reportDateTime =
                    ZonedDateTime
                        .of(
                            2020,
                            5,
                            5,
                            3,
                            4,
                            5,
                            3,
                            UTC,
                        ).minusHours(12),
                transmissionFormat = LogbookTransmissionFormat.ERS,
                integrationDateTime = ZonedDateTime.now(),
                isEnriched = false,
                operationDateTime = ZonedDateTime.now(),
            ),
            LogbookMessage(
                id = 1,
                operationNumber = "",
                tripNumber = "345",
                reportId = "REPORT_ID#2",
                operationType = LogbookOperationType.DAT,
                messageType = "DEP",
                software = "e-Sacapt Secours ERSV3 V 1.0.10",
                message = dep,
                reportDateTime =
                    ZonedDateTime
                        .of(
                            2020,
                            5,
                            5,
                            3,
                            4,
                            5,
                            3,
                            UTC,
                        ).minusHours(24),
                transmissionFormat = LogbookTransmissionFormat.ERS,
                integrationDateTime = ZonedDateTime.now(),
                isEnriched = false,
                operationDateTime = ZonedDateTime.now(),
            ),
            LogbookMessage(
                id = 3,
                operationNumber = "",
                tripNumber = "345",
                reportId = "REPORT_ID#3",
                operationType = LogbookOperationType.DAT,
                messageType = "PNO",
                software = "e-Sacapt Secours ERSV3 V 1.0.7",
                message = pno,
                reportDateTime =
                    ZonedDateTime
                        .of(
                            2020,
                            5,
                            5,
                            3,
                            4,
                            5,
                            3,
                            UTC,
                        ).minusHours(0),
                transmissionFormat = LogbookTransmissionFormat.ERS,
                integrationDateTime = ZonedDateTime.now(),
                isEnriched = false,
                operationDateTime = ZonedDateTime.now(),
            ),
            LogbookMessage(
                id = 3,
                operationNumber = "",
                tripNumber = "345",
                reportId = "REPORT_ID#4",
                operationType = LogbookOperationType.DAT,
                messageType = "COE",
                software = "e-Sacapt Secours ERSV3 V 1.0.7",
                message = coe,
                reportDateTime =
                    ZonedDateTime
                        .of(
                            2020,
                            5,
                            5,
                            3,
                            4,
                            5,
                            3,
                            UTC,
                        ).minusHours(3),
                transmissionFormat = LogbookTransmissionFormat.ERS,
                integrationDateTime = ZonedDateTime.now(),
                isEnriched = false,
                operationDateTime = ZonedDateTime.now(),
            ),
            LogbookMessage(
                id = 4,
                operationNumber = "",
                tripNumber = "345",
                reportId = "REPORT_ID#4",
                operationType = LogbookOperationType.DAT,
                messageType = "COX",
                software = "e-Sacapt Secours ERSV3 V 1.0.7",
                message = cox,
                reportDateTime =
                    ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, UTC).minusHours(0).minusMinutes(
                        20,
                    ),
                transmissionFormat = LogbookTransmissionFormat.ERS,
                integrationDateTime = ZonedDateTime.now(),
                isEnriched = false,
                operationDateTime = ZonedDateTime.now(),
            ),
            LogbookMessage(
                id = 5,
                operationNumber = "",
                tripNumber = "345",
                reportId = "REPORT_ID#5",
                operationType = LogbookOperationType.DAT,
                messageType = "CPS",
                software = "",
                message = cpsMessage,
                reportDateTime =
                    ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, UTC).minusHours(0).minusMinutes(
                        20,
                    ),
                transmissionFormat = LogbookTransmissionFormat.ERS,
                integrationDateTime = ZonedDateTime.now(),
                isEnriched = false,
                operationDateTime = ZonedDateTime.now(),
            ),
        )
    }

    fun getDummyFluxAndVisioCaptureLogbookMessages(): List<LogbookMessage> {
        val gearOne = LogbookTripGear()
        gearOne.gear = "OTB"
        val gearTwo = LogbookTripGear()
        gearTwo.gear = "DRB"

        val catchOne = LogbookFishingCatch()
        catchOne.species = "TTV"
        val catchTwo = LogbookFishingCatch()
        catchTwo.species = "SMV"
        val catchThree = LogbookFishingCatch()
        catchThree.species = "PNB"

        val dep = DEP()
        dep.gearOnboard = listOf(gearOne, gearTwo)
        dep.speciesOnboard = listOf(catchOne)
        dep.departurePort = "AEFAT"

        val far = FAR()
        val haul = Haul()
        haul.gear = "OTB"
        haul.catches = listOf(catchTwo, catchThree)
        haul.mesh = 120.0
        far.hauls = listOf(haul)

        val pno = PNO()
        pno.catchOnboard = listOf(catchOne, catchTwo, catchThree)
        pno.port = "AEJAZ"

        return listOf(
            LogbookMessage(
                id = 1,
                operationNumber = "",
                tripNumber = "345",
                reportId = "",
                operationType = LogbookOperationType.DAT,
                messageType = "DEP",
                software = "FT/VISIOCaptures V1.4.7",
                message = dep,
                reportDateTime =
                    ZonedDateTime
                        .of(
                            2020,
                            5,
                            5,
                            3,
                            4,
                            5,
                            3,
                            UTC,
                        ).minusHours(24),
                transmissionFormat = LogbookTransmissionFormat.ERS,
                integrationDateTime = ZonedDateTime.now(),
                isEnriched = false,
                operationDateTime = ZonedDateTime.now(),
            ),
            LogbookMessage(
                id = 2,
                operationNumber = "",
                tripNumber = "345",
                reportId = "",
                operationType = LogbookOperationType.DAT,
                messageType = "FAR",
                software = "FP/VISIOCaptures V1.4.7",
                message = far,
                reportDateTime =
                    ZonedDateTime
                        .of(
                            2020,
                            5,
                            5,
                            3,
                            4,
                            5,
                            3,
                            UTC,
                        ).minusHours(12),
                transmissionFormat = LogbookTransmissionFormat.ERS,
                integrationDateTime = ZonedDateTime.now(),
                isEnriched = false,
                operationDateTime = ZonedDateTime.now(),
            ),
            LogbookMessage(
                id = 3,
                operationNumber = "",
                tripNumber = "345",
                reportId = "",
                operationType = LogbookOperationType.DAT,
                messageType = "PNO",
                software = "TurboCatch (3.6-1)",
                message = pno,
                reportDateTime =
                    ZonedDateTime
                        .of(
                            2020,
                            5,
                            5,
                            3,
                            4,
                            5,
                            3,
                            UTC,
                        ).minusHours(0),
                transmissionFormat = LogbookTransmissionFormat.FLUX,
                integrationDateTime = ZonedDateTime.now(),
                isEnriched = false,
                operationDateTime = ZonedDateTime.now(),
            ),
        )
    }

    fun getDummyCorrectedLogbookMessages(): List<LogbookMessage> {
        val catchOne = LogbookFishingCatch()
        catchOne.species = "TTV"
        val catchTwo = LogbookFishingCatch()
        catchTwo.species = "SMV"
        val catchThree = LogbookFishingCatch()
        catchThree.species = "PNB"

        val far = FAR()
        val haul = Haul()
        haul.gear = "OTB"
        haul.catches = listOf(catchOne, catchTwo)
        haul.mesh = 120.0
        far.hauls = listOf(haul)

        val correctedFar = FAR()
        val correctedHaul = Haul()
        correctedHaul.gear = "OTB"
        correctedHaul.catches = listOf(catchOne, catchTwo, catchThree)
        correctedHaul.mesh = 120.0
        correctedFar.hauls = listOf(correctedHaul)

        return listOf(
            LogbookMessage(
                id = 1,
                operationNumber = "9065646811",
                tripNumber = "345",
                reportId = "9065646811",
                operationType = LogbookOperationType.DAT,
                messageType = "FAR",
                message = far,
                reportDateTime =
                    ZonedDateTime
                        .of(
                            2020,
                            5,
                            5,
                            3,
                            4,
                            5,
                            3,
                            UTC,
                        ).minusHours(12),
                transmissionFormat = LogbookTransmissionFormat.ERS,
                integrationDateTime = ZonedDateTime.now(),
                isEnriched = false,
                operationDateTime = ZonedDateTime.now(),
            ),
            LogbookMessage(
                id = 2,
                operationNumber = "",
                tripNumber = "345",
                reportId = "",
                referencedReportId = "9065646811",
                operationType = LogbookOperationType.COR,
                messageType = "FAR",
                message = correctedFar,
                reportDateTime =
                    ZonedDateTime
                        .of(
                            2020,
                            5,
                            5,
                            3,
                            4,
                            5,
                            3,
                            UTC,
                        ).minusHours(12),
                transmissionFormat = LogbookTransmissionFormat.ERS,
                integrationDateTime = ZonedDateTime.now(),
                isEnriched = false,
                operationDateTime = ZonedDateTime.now(),
            ),
        )
    }

    fun getDummyRETLogbookMessages(): List<LogbookMessage> {
        val catchOne = LogbookFishingCatch()
        catchOne.species = "TTV"
        val catchTwo = LogbookFishingCatch()
        catchTwo.species = "SMV"
        val catchThree = LogbookFishingCatch()
        catchThree.species = "PNB"

        val far = FAR()
        val haul = Haul()
        haul.gear = "OTB"
        haul.catches = listOf(catchOne, catchTwo)
        haul.mesh = 120.0
        far.hauls = listOf(haul)

        val farTwo = FAR()
        val haulTwo = Haul()
        haulTwo.gear = "OTB"
        haulTwo.catches = listOf(catchOne, catchTwo, catchThree)
        haulTwo.mesh = 120.0
        farTwo.hauls = listOf(haulTwo)

        val farAck = Acknowledgment()
        farAck.returnStatus = "000"

        val farBadAck = Acknowledgment()
        farBadAck.returnStatus = "002"
        farBadAck.rejectionCause = "Oops"

        return listOf(
            LogbookMessage(
                id = 1,
                operationNumber = "",
                tripNumber = "345",
                reportId = "9065646811",
                operationType = LogbookOperationType.DAT,
                messageType = "FAR",
                message = far,
                reportDateTime =
                    ZonedDateTime
                        .of(
                            2020,
                            5,
                            5,
                            3,
                            4,
                            5,
                            3,
                            UTC,
                        ).minusHours(12),
                transmissionFormat = LogbookTransmissionFormat.ERS,
                integrationDateTime = ZonedDateTime.now(),
                isEnriched = false,
                operationDateTime = ZonedDateTime.now(),
            ),
            LogbookMessage(
                id = 2,
                operationNumber = "",
                reportId = "9065646816",
                referencedReportId = "9065646811",
                operationType = LogbookOperationType.RET,
                messageType = "",
                message = farBadAck,
                reportDateTime =
                    ZonedDateTime
                        .of(
                            2020,
                            5,
                            5,
                            3,
                            4,
                            5,
                            3,
                            UTC,
                        ).minusHours(12),
                transmissionFormat = LogbookTransmissionFormat.ERS,
                integrationDateTime = ZonedDateTime.now(),
                isEnriched = false,
                operationDateTime = ZonedDateTime.now(),
            ),
            LogbookMessage(
                id = 3,
                operationNumber = "",
                tripNumber = "345",
                reportId = "9065646813",
                operationType = LogbookOperationType.DAT,
                messageType = "FAR",
                message = farTwo,
                reportDateTime =
                    ZonedDateTime
                        .of(
                            2020,
                            5,
                            5,
                            3,
                            4,
                            5,
                            3,
                            UTC,
                        ).minusHours(12),
                transmissionFormat = LogbookTransmissionFormat.ERS,
                integrationDateTime = ZonedDateTime.now(),
                isEnriched = false,
                operationDateTime = ZonedDateTime.now(),
            ),
            LogbookMessage(
                id = 4,
                operationNumber = "",
                reportId = "9065646818",
                referencedReportId = "9065646813",
                operationType = LogbookOperationType.RET,
                messageType = "",
                message = farAck,
                reportDateTime =
                    ZonedDateTime
                        .of(
                            2020,
                            5,
                            5,
                            3,
                            4,
                            5,
                            3,
                            UTC,
                        ).minusHours(12),
                transmissionFormat = LogbookTransmissionFormat.ERS,
                integrationDateTime = ZonedDateTime.now(),
                isEnriched = false,
                operationDateTime = ZonedDateTime.now(),
            ),
            LogbookMessage(
                id = 5,
                operationNumber = "",
                referencedReportId = "9065646813",
                operationType = LogbookOperationType.DEL,
                messageType = "",
                message = farAck,
                reportDateTime =
                    ZonedDateTime
                        .of(
                            2020,
                            5,
                            5,
                            3,
                            4,
                            5,
                            3,
                            UTC,
                        ).minusHours(12),
                transmissionFormat = LogbookTransmissionFormat.ERS,
                integrationDateTime = ZonedDateTime.now(),
                isEnriched = false,
                operationDateTime = ZonedDateTime.now(),
            ),
            LogbookMessage(
                id = 6,
                operationNumber = "5h499-erh5u7-pm3ae8c5trj78j67dfh",
                tripNumber = "SCR-TTT20200505030505",
                reportId = "zegj15-zeg56-errg569iezz3659g",
                operationType = LogbookOperationType.DAT,
                messageType = "FAR",
                message = far,
                reportDateTime =
                    ZonedDateTime
                        .of(
                            2020,
                            5,
                            5,
                            3,
                            9,
                            5,
                            3,
                            UTC,
                        ).minusHours(12),
                transmissionFormat = LogbookTransmissionFormat.FLUX,
                integrationDateTime = ZonedDateTime.now(),
                isEnriched = false,
                operationDateTime = ZonedDateTime.now(),
            ),
        )
    }

    fun getDummyPNOAndLANLogbookMessages(
        weightToAdd: Double = 0.0,
        addSpeciesToLAN: Boolean = false,
    ): List<Pair<LogbookMessage, LogbookMessage>> {
        val catchOne = LogbookFishingCatch()
        catchOne.species = "TTV"
        catchOne.weight = 123.0
        catchOne.conversionFactor = 1.0

        val catchTwo = LogbookFishingCatch()
        catchTwo.species = "SMV"
        catchTwo.weight = 961.5
        catchTwo.conversionFactor = 1.22

        val catchThree = LogbookFishingCatch()
        catchThree.species = "PNB"
        catchThree.weight = 69.7
        catchThree.conversionFactor = 1.35

        val catchFour = LogbookFishingCatch()
        catchFour.species = "CQL"
        catchFour.weight = 98.2
        catchFour.conversionFactor = 1.0

        val catchFive = LogbookFishingCatch()
        catchFive.species = "FGV"
        catchFive.weight = 25.5

        val catchSix = LogbookFishingCatch()
        catchSix.species = "THB"
        catchSix.weight = 35.0

        val catchSeven = LogbookFishingCatch()
        catchSeven.species = "VGY"
        catchSeven.weight = 66666.0

        val catchEight = LogbookFishingCatch()
        catchEight.species = "MQP"
        catchEight.weight = 11.1

        val catchNine = LogbookFishingCatch()
        catchNine.species = "FPS"
        catchNine.weight = 22.0

        val catchTen = LogbookFishingCatch()
        catchTen.species = "DPD"
        catchTen.weight = 2225.0

        val firstLan = LAN()
        // The weight is reduced because of the conversion factor
        // catchTwo: 788.11 = 961.5 / 1.22
        // catchTwo: 51.62 = 69.7 / 1.35
        firstLan.catchLanded =
            listOf(
                catchOne,
                catchTwo.copy(weight = 788.11),
                catchThree.copy(weight = 51.62),
                catchFour,
                catchNine,
            )

        val firstPno = PNO()
        firstPno.catchOnboard =
            listOf(
                catchOne.copy(weight = catchOne.weight?.plus(weightToAdd)),
                catchTwo.copy(weight = catchTwo.weight?.plus(0.5)),
                catchThree.copy(weight = catchThree.weight?.plus(weightToAdd)),
                catchFour,
            )

        val secondLan = LAN()
        if (addSpeciesToLAN) {
            secondLan.catchLanded = listOf(catchFive, catchSix, catchSeven, catchEight, catchTen)
        } else {
            secondLan.catchLanded = listOf(catchFive, catchSix, catchSeven, catchEight)
        }
        val secondPno = PNO()
        secondPno.catchOnboard = listOf(catchFive, catchSix, catchSeven, catchEight)

        return listOf(
            Pair(
                LogbookMessage(
                    id = 1,
                    operationNumber = "456846844658",
                    tripNumber = "125345",
                    reportId = "456846844658",
                    operationType = LogbookOperationType.DAT,
                    messageType = "LAN",
                    message = firstLan,
                    transmissionFormat = LogbookTransmissionFormat.ERS,
                    integrationDateTime = ZonedDateTime.now(),
                    isEnriched = false,
                    operationDateTime = ZonedDateTime.now(),
                    reportDateTime = ZonedDateTime.now(),
                ),
                LogbookMessage(
                    id = 2,
                    operationNumber = "47177857577",
                    tripNumber = "125345",
                    reportId = "47177857577",
                    operationType = LogbookOperationType.DAT,
                    messageType = "PNO",
                    message = firstPno,
                    transmissionFormat = LogbookTransmissionFormat.ERS,
                    integrationDateTime = ZonedDateTime.now(),
                    isEnriched = false,
                    operationDateTime = ZonedDateTime.now(),
                    reportDateTime = ZonedDateTime.now(),
                ),
            ),
            Pair(
                LogbookMessage(
                    id = 3,
                    operationNumber = "48545254254",
                    tripNumber = "125345",
                    reportId = "48545254254",
                    operationType = LogbookOperationType.DAT,
                    messageType = "LAN",
                    message = secondLan,
                    transmissionFormat = LogbookTransmissionFormat.ERS,
                    integrationDateTime = ZonedDateTime.now(),
                    isEnriched = false,
                    operationDateTime = ZonedDateTime.now(),
                    reportDateTime = ZonedDateTime.now(),
                ),
                LogbookMessage(
                    id = 4,
                    operationNumber = "004045204504",
                    tripNumber = "125345",
                    reportId = "004045204504",
                    operationType = LogbookOperationType.DAT,
                    messageType = "PNO",
                    message = secondPno,
                    transmissionFormat = LogbookTransmissionFormat.ERS,
                    integrationDateTime = ZonedDateTime.now(),
                    isEnriched = false,
                    operationDateTime = ZonedDateTime.now(),
                    reportDateTime = ZonedDateTime.now(),
                ),
            ),
        )
    }

    fun getDummyPNOAndLANLogbookMessagesWithSpeciesInDouble(
        weightToAdd: Double = 0.0,
        addSpeciesToLAN: Boolean = false,
    ): List<Pair<LogbookMessage, LogbookMessage>> {
        val catchOne = LogbookFishingCatch()
        catchOne.species = "TTV"
        catchOne.weight = 123.0
        val catchTwo = LogbookFishingCatch()
        catchTwo.species = "SMV"
        catchTwo.weight = 961.5
        val catchThree = LogbookFishingCatch()
        catchThree.species = "PNB"
        catchThree.weight = 69.7
        val catchFour = LogbookFishingCatch()
        catchFour.species = "CQL"
        catchFour.weight = 98.2

        val catchFive = LogbookFishingCatch()
        catchFive.species = "FGV"
        catchFive.weight = 25.5
        val catchSix = LogbookFishingCatch()
        catchSix.species = "THB"
        catchSix.weight = 35.0
        val catchSeven = LogbookFishingCatch()
        catchSeven.species = "VGY"
        catchSeven.weight = 66666.0
        val catchEight = LogbookFishingCatch()
        catchEight.species = "MQP"
        catchEight.weight = 11.1

        val catchNine = LogbookFishingCatch()
        catchNine.species = "FPS"
        catchNine.weight = 22.0

        val catchTen = LogbookFishingCatch()
        catchTen.species = "DPD"
        catchTen.weight = 2225.0

        val firstLan = LAN()
        firstLan.catchLanded = listOf(catchOne, catchTwo, catchTwo, catchTwo, catchThree, catchFour, catchNine)

        val firstPno = PNO()
        firstPno.catchOnboard =
            listOf(
                catchOne.copy(weight = catchOne.weight?.plus(weightToAdd)),
                catchTwo.copy(weight = catchTwo.weight?.plus(0.5)),
                catchTwo,
                catchThree.copy(weight = catchThree.weight?.plus(weightToAdd)),
                catchFour,
            )

        val secondLan = LAN()
        if (addSpeciesToLAN) {
            secondLan.catchLanded = listOf(catchFive, catchSix, catchSeven, catchEight, catchTen)
        } else {
            secondLan.catchLanded = listOf(catchFive, catchSix, catchSeven, catchEight)
        }
        val secondPno = PNO()
        secondPno.catchOnboard = listOf(catchFive, catchSix, catchSeven, catchEight)

        return listOf(
            Pair(
                LogbookMessage(
                    id = 1,
                    operationNumber = "456846844658",
                    tripNumber = "125345",
                    reportId = "456846844658",
                    operationType = LogbookOperationType.DAT,
                    messageType = "LAN",
                    message = firstLan,
                    transmissionFormat = LogbookTransmissionFormat.ERS,
                    integrationDateTime = ZonedDateTime.now(),
                    isEnriched = false,
                    operationDateTime = ZonedDateTime.now(),
                    reportDateTime = ZonedDateTime.now(),
                ),
                LogbookMessage(
                    id = 2,
                    operationNumber = "47177857577",
                    tripNumber = "125345",
                    reportId = "47177857577",
                    operationType = LogbookOperationType.DAT,
                    messageType = "PNO",
                    message = firstPno,
                    transmissionFormat = LogbookTransmissionFormat.ERS,
                    integrationDateTime = ZonedDateTime.now(),
                    isEnriched = false,
                    operationDateTime = ZonedDateTime.now(),
                    reportDateTime = ZonedDateTime.now(),
                ),
            ),
            Pair(
                LogbookMessage(
                    id = 3,
                    operationNumber = "48545254254",
                    tripNumber = "125345",
                    reportId = "48545254254",
                    operationType = LogbookOperationType.DAT,
                    messageType = "LAN",
                    message = secondLan,
                    transmissionFormat = LogbookTransmissionFormat.ERS,
                    integrationDateTime = ZonedDateTime.now(),
                    isEnriched = false,
                    operationDateTime = ZonedDateTime.now(),
                    reportDateTime = ZonedDateTime.now(),
                ),
                LogbookMessage(
                    id = 4,
                    operationNumber = "004045204504",
                    tripNumber = "125345",
                    reportId = "004045204504",
                    operationType = LogbookOperationType.DAT,
                    messageType = "PNO",
                    message = secondPno,
                    transmissionFormat = LogbookTransmissionFormat.ERS,
                    integrationDateTime = ZonedDateTime.now(),
                    isEnriched = false,
                    operationDateTime = ZonedDateTime.now(),
                    reportDateTime = ZonedDateTime.now(),
                ),
            ),
        )
    }

    fun getCreateOrUpdateDynamicVesselGroups() =
        listOf(
            CreateOrUpdateDynamicVesselGroup(
                id = 1,
                isDeleted = false,
                name = "Mission Thémis – chaluts de fonds",
                description = "Ciblage pour la mission du Thémis (bordée A) du 08/01 au 17/01/25.",
                pointsOfAttention =
                    "Points d'attention : Si le navire X est dans le secteur, le contrôler pour " +
                        "suspicion blanchiment bar en 7.d.",
                color = "#4287f5",
                sharing = Sharing.PRIVATE,
                sharedTo = null,
                endOfValidityUtc = null,
                filters =
                    VesselGroupFilters(
                        countryCodes = listOf(CountryCode.FR, CountryCode.ES, CountryCode.IT),
                        districtCodes = listOf(),
                        fleetSegments = emptyList(),
                        gearCodes = listOf("OTB", "OTM", "TBB", "PTB"),
                        hasLogbook = true,
                        lastControlPeriod = LastControlPeriod.BEFORE_SIX_MONTHS_AGO,
                        lastLandingPortLocodes = emptyList(),
                        lastPositionHoursAgo = null,
                        producerOrganizations = emptyList(),
                        riskFactors = listOf(2, 3),
                        specyCodes = emptyList(),
                        vesselSize = VesselSize.ABOVE_TWELVE_METERS,
                        vesselsLocation = listOf(VesselLocation.SEA),
                        zones = emptyList(),
                    ),
            ),
            CreateOrUpdateDynamicVesselGroup(
                id = 2,
                isDeleted = false,
                name = "Mission Thémis – chaluts de fonds",
                description = "Ciblage pour la mission du Thémis (bordée A) du 08/01 au 17/01/25.",
                pointsOfAttention = null,
                color = "#4287f5",
                sharing = Sharing.PRIVATE,
                sharedTo = null,
                endOfValidityUtc = null,
                filters =
                    VesselGroupFilters(
                        countryCodes = listOf(),
                        districtCodes = listOf(),
                        fleetSegments = listOf("PEL13"),
                        gearCodes = listOf("OTB", "OTM", "TBB", "PTB"),
                        hasLogbook = true,
                        lastControlPeriod = LastControlPeriod.BEFORE_ONE_YEAR_AGO,
                        lastLandingPortLocodes = emptyList(),
                        lastPositionHoursAgo = null,
                        producerOrganizations = emptyList(),
                        riskFactors = listOf(2, 3),
                        specyCodes = emptyList(),
                        vesselSize = VesselSize.ABOVE_TWELVE_METERS,
                        vesselsLocation = listOf(VesselLocation.SEA),
                        zones = emptyList(),
                    ),
            ),
        )

    fun getCreateOrUpdateFixedVesselGroups() =
        listOf(
            CreateOrUpdateFixedVesselGroup(
                id = 1,
                isDeleted = false,
                name = "Mission Thémis – chaluts de fonds",
                description = "Ciblage pour la mission du Thémis (bordée A) du 08/01 au 17/01/25.",
                pointsOfAttention =
                    "Points d'attention : Si le navire X est dans le secteur, le contrôler pour " +
                        "suspicion blanchiment bar en 7.d.",
                color = "#4287f5",
                sharing = Sharing.PRIVATE,
                sharedTo = null,
                endOfValidityUtc = null,
                vessels =
                    listOf(
                        VesselIdentity(
                            vesselId = null,
                            cfr = "FR123456785",
                            name = "MY AWESOME VESSEL TWO",
                            flagState = CountryCode.FR,
                            ircs = null,
                            externalIdentification = null,
                            vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                        ),
                        VesselIdentity(
                            vesselId = 1,
                            cfr = "FR00022680",
                            name = "MY AWESOME VESSEL",
                            flagState = CountryCode.FR,
                            ircs = null,
                            externalIdentification = null,
                            vesselIdentifier = null,
                        ),
                    ),
            ),
            CreateOrUpdateFixedVesselGroup(
                id = 2,
                isDeleted = false,
                name = "Mission Thémis – chaluts de fonds",
                description = "Ciblage pour la mission du Thémis (bordée A) du 08/01 au 17/01/25.",
                pointsOfAttention = null,
                color = "#4287f5",
                sharing = Sharing.PRIVATE,
                sharedTo = null,
                endOfValidityUtc = null,
                vessels =
                    listOf(
                        VesselIdentity(
                            vesselId = null,
                            cfr = "FR123456785",
                            name = "MY AWESOME VESSEL TWO",
                            flagState = CountryCode.FR,
                            ircs = null,
                            externalIdentification = null,
                            vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                        ),
                        VesselIdentity(
                            vesselId = 1,
                            cfr = "FR00022680",
                            name = "MY AWESOME VESSEL",
                            flagState = CountryCode.FR,
                            ircs = null,
                            externalIdentification = null,
                            vesselIdentifier = null,
                        ),
                    ),
            ),
        )
}
