package fr.gouv.cnsp.monitorfish.domain.use_cases

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.*
import fr.gouv.cnsp.monitorfish.domain.entities.facade.Seafront.NAMO
import fr.gouv.cnsp.monitorfish.domain.entities.infraction.Infraction
import fr.gouv.cnsp.monitorfish.domain.entities.infraction.InfractionCategory
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.*
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.*
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
        alertType: AlertType?,
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
                    AlertType.POSITION_ALERT ->
                        Alert(
                            type = AlertType.POSITION_ALERT,
                            seaFront = NAMO.toString(),
                            alertId = 1,
                            natinfCode = 7059,
                            name = "Chalutage dans les 3 milles",
                        )
                    AlertType.MISSING_FAR_ALERT -> AlertType.MISSING_FAR_ALERT.getValue()
                    AlertType.MISSING_FAR_48_HOURS_ALERT -> AlertType.MISSING_FAR_48_HOURS_ALERT.getValue()
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
                value =
                    Alert(
                        type = AlertType.POSITION_ALERT,
                        seaFront = NAMO.toString(),
                        alertId = 1,
                        natinfCode = 7059,
                        name = "Chalutage dans les 3 milles",
                    ) as ReportingValue,
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
                value =
                    Alert(
                        type = AlertType.POSITION_ALERT,
                        seaFront = NAMO.toString(),
                        alertId = 1,
                        natinfCode = 7059,
                        name = "Chalutage dans les 3 milles",
                    ) as ReportingValue,
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
                value =
                    Alert(
                        type = AlertType.POSITION_ALERT,
                        seaFront = NAMO.toString(),
                        alertId = 1,
                        natinfCode = 7059,
                        name = "Chalutage dans les 3 milles",
                    ) as ReportingValue,
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
                operationNumber = "ON#1",
                tripNumber = "345",
                reportId = "REPORT_ID#1",
                flagState = "FRA",
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
                operationNumber = "ON#2",
                tripNumber = "345",
                reportId = "REPORT_ID#2",
                flagState = "FRA",
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
                operationNumber = "ON#3",
                tripNumber = "345",
                reportId = "REPORT_ID#3",
                flagState = "FRA",
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
                operationNumber = "ON#4",
                tripNumber = "345",
                reportId = "REPORT_ID#4",
                flagState = "FRA",
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
                operationNumber = "ON#4",
                tripNumber = "345",
                reportId = "REPORT_ID#4",
                flagState = "FRA",
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
                operationNumber = "ON#5",
                tripNumber = "345",
                reportId = "REPORT_ID#5",
                flagState = "FRA",
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

    fun getDummyLogbookMessagesFromFlagStatesWithoutRET(): List<LogbookMessage> {
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
                operationNumber = "ON_1",
                tripNumber = "345",
                reportId = "ON_1",
                flagState = "BEL",
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
                operationNumber = "ON_2",
                tripNumber = "346",
                reportId = "ON_2",
                flagState = "GBR",
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
                operationNumber = "ON_3",
                tripNumber = "345",
                reportId = "ON_3",
                flagState = "BEL",
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

        val okAck =
            Acknowledgment(returnStatus = "000")

        val nokAck =
            Acknowledgment(
                returnStatus = "002",
                rejectionCause = "Oops",
            )

        return listOf(
            LogbookMessage(
                id = 1,
                operationNumber = "9065646811",
                tripNumber = "345",
                flagState = "FRA",
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
                operationNumber = "2222222222",
                reportId = null,
                referencedReportId = "9065646811",
                operationType = LogbookOperationType.RET,
                messageType = "",
                message = nokAck,
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
                operationNumber = "9065646813",
                tripNumber = "345",
                reportId = "9065646813",
                operationType = LogbookOperationType.DAT,
                messageType = "FAR",
                flagState = "FRA",
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
                operationNumber = "4444444444",
                reportId = null,
                referencedReportId = "9065646813",
                operationType = LogbookOperationType.RET,
                messageType = "",
                message = okAck,
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
                operationNumber = "90656468131",
                reportId = null,
                referencedReportId = "9065646813",
                operationType = LogbookOperationType.DEL,
                messageType = "",
                message = okAck,
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
                id = 7,
                operationNumber = "7777777777",
                reportId = null,
                referencedReportId = "90656468131",
                operationType = LogbookOperationType.RET,
                messageType = "",
                message = okAck,
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
                flagState = "BEL",
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
                        lastControlAtQuayPeriod = LastControlPeriod.BEFORE_SIX_MONTHS_AGO,
                        lastControlAtSeaPeriod = null,
                        landingPortLocodes = emptyList(),
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
                        lastControlAtQuayPeriod = LastControlPeriod.BEFORE_ONE_YEAR_AGO,
                        lastControlAtSeaPeriod = null,
                        landingPortLocodes = emptyList(),
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

    /**
     * Test data extracted from V666.5.1__Insert_logbook_raw_messages_and_reports.sql
     * for trip_number 9463715
     */
    fun getTrip9463715LogbookMessages(): List<LogbookMessage> {
        // DEP message
        val gearOne = LogbookTripGear()
        gearOne.gear = "GTN"
        gearOne.mesh = 100.0
        val gearTwo = LogbookTripGear()
        gearTwo.gear = "GTN"
        gearTwo.mesh = 85.0

        val dep = DEP()
        dep.gearOnboard = listOf(gearOne, gearTwo)
        dep.departurePort = "AEJAZ"
        dep.anticipatedActivity = "FSH"
        dep.tripStartDate = ZonedDateTime.of(2019, 10, 11, 0, 0, 0, 0, UTC)
        dep.departureDateTime = ZonedDateTime.of(2019, 10, 11, 1, 40, 0, 0, UTC)

        // COX message
        val cox = COX()
        cox.faoZoneExited = "27.8.a"
        cox.latitudeExited = 46.488
        cox.longitudeExited = -1.851
        cox.effortZoneExited = "C"
        cox.economicZoneExited = "FRA"
        cox.targetSpeciesOnExit = "DEM"
        cox.effortZoneExitDatetime = ZonedDateTime.of(2020, 8, 9, 13, 47, 0, 0, UTC)
        cox.statisticalRectangleExited = "21E8"

        // COE message
        val coe = COE()
        coe.faoZoneEntered = "27.8.a"
        coe.latitudeEntered = 46.695
        coe.longitudeEntered = -1.943
        coe.effortZoneEntered = "C"
        coe.economicZoneEntered = "FRA"
        coe.targetSpeciesOnEntry = "PEL"
        coe.effortZoneEntryDatetime = ZonedDateTime.of(2020, 8, 10, 3, 16, 0, 0, UTC)
        coe.statisticalRectangleEntered = "22E8"

        // CRO message
        val cro = CRO()
        cro.faoZoneEntered = "27.8.a"
        cro.latitudeEntered = 46.695
        cro.longitudeEntered = -1.943
        cro.effortZoneEntered = "C"
        cro.economicZoneEntered = "FRA"
        cro.targetSpeciesOnEntry = "PEL"
        cro.effortZoneEntryDatetime = ZonedDateTime.of(2020, 8, 10, 3, 16, 0, 0, UTC)
        cro.statisticalRectangleEntered = "22E8"
        cro.faoZoneExited = "27.7.d"
        cro.latitudeExited = 49.629
        cro.longitudeExited = -0.899
        cro.effortZoneExited = "B"
        cro.economicZoneExited = "FRA"
        cro.effortZoneExitDatetime = ZonedDateTime.of(2020, 11, 4, 20, 50, 0, 0, UTC)
        cro.statisticalRectangleExited = "28E9"

        // FAR message (original)
        val farCatch1 = LogbookFishingCatch()
        farCatch1.species = "BON"
        farCatch1.weight = 1500.0
        farCatch1.conversionFactor = 1.2
        farCatch1.faoZone = "27.8.a"
        farCatch1.effortZone = "C"
        farCatch1.economicZone = "FRA"
        farCatch1.statisticalRectangle = "23E6"

        val farCatch2 = LogbookFishingCatch()
        farCatch2.species = "BON"
        farCatch2.weight = 86.0
        farCatch2.conversionFactor = 1.0
        farCatch2.faoZone = "27.8.a"
        farCatch2.effortZone = "C"
        farCatch2.economicZone = "FRA"
        farCatch2.statisticalRectangle = "23E6"

        val farCatch3 = LogbookFishingCatch()
        farCatch3.species = "SOL"
        farCatch3.weight = 2.0
        farCatch3.faoZone = "27.8.a"
        farCatch3.effortZone = "C"
        farCatch3.economicZone = "FRA"
        farCatch3.statisticalRectangle = "23E6"

        val farCatch4 = LogbookFishingCatch()
        farCatch4.species = "RJH"
        farCatch4.weight = 17.0
        farCatch4.faoZone = "27.8.a"
        farCatch4.effortZone = "C"
        farCatch4.economicZone = "FRA"
        farCatch4.statisticalRectangle = "23E6"

        val far = FAR()
        val haul = Haul()
        haul.gear = "GTN"
        haul.mesh = 100.0
        haul.dimensions = "150.0;120.0"
        haul.catches = listOf(farCatch1, farCatch2, farCatch3, farCatch4)
        haul.catchDateTime = ZonedDateTime.of(2019, 10, 17, 11, 32, 0, 0, UTC)
        far.hauls = listOf(haul)

        // RET for FAR (success)
        val farAck = Acknowledgment(returnStatus = "000")

        // COR message (corrected FAR with more catches)
        val corCatch1 = LogbookFishingCatch()
        corCatch1.species = "BON"
        corCatch1.weight = 1500.0
        corCatch1.conversionFactor = 1.0
        corCatch1.presentation = "GUT"
        corCatch1.faoZone = "27.8.a"
        corCatch1.effortZone = "C"
        corCatch1.economicZone = "FRA"
        corCatch1.statisticalRectangle = "23E6"

        val corCatch2 = LogbookFishingCatch()
        corCatch2.species = "BON"
        corCatch2.weight = 256.0
        corCatch2.conversionFactor = 1.0
        corCatch2.presentation = "OTH"
        corCatch2.faoZone = "27.8.a"
        corCatch2.effortZone = "C"
        corCatch2.economicZone = "FRA"
        corCatch2.statisticalRectangle = "23E6"

        val correctedFar = FAR()
        val correctedHaul = Haul()
        correctedHaul.gear = "GTN"
        correctedHaul.mesh = 150.0
        correctedHaul.dimensions = "120.0" // numeric dimension as string
        correctedHaul.catches =
            listOf(
                corCatch1,
                corCatch2,
                farCatch2,
                farCatch3,
                farCatch4,
            ) +
            listOf("LAO", "GPE", "EOD", "BGP", "RPD", "TYU", "BVC", "EDC", "RGH", "EGT").map {
                LogbookFishingCatch().apply {
                    species = it
                    weight = 17.0
                    faoZone = "27.8.a"
                    effortZone = "C"
                    economicZone = "FRA"
                    statisticalRectangle = "23E6"
                }
            } +
            listOf("TYU", "BVC", "RGH", "EGT").map {
                LogbookFishingCatch().apply {
                    species = it
                    weight = 37.0
                    faoZone = "27.8.a"
                    effortZone = "C"
                    economicZone = "FRA"
                    statisticalRectangle = "23E6"
                }
            } +
            listOf(
                LogbookFishingCatch().apply {
                    species = "EDC"
                    weight = 57.0
                    faoZone = "27.8.a"
                    effortZone = "C"
                    economicZone = "FRA"
                    statisticalRectangle = "23E6"
                },
                LogbookFishingCatch().apply {
                    species = "RGH"
                    weight = 7.0
                    faoZone = "27.8.a"
                    effortZone = "C"
                    economicZone = "FRA"
                    statisticalRectangle = "23E6"
                },
                LogbookFishingCatch().apply {
                    species = "EGT"
                    weight = 47.0
                    faoZone = "27.8.a"
                    effortZone = "C"
                    economicZone = "FRA"
                    statisticalRectangle = "23E6"
                },
            )
        correctedHaul.catchDateTime = ZonedDateTime.of(2019, 10, 17, 11, 32, 0, 0, UTC)
        correctedFar.hauls = listOf(correctedHaul)

        // RET for COR (success)
        val corAck = Acknowledgment(returnStatus = "000")

        // DIS message
        val disCatch1 = LogbookFishingCatch()
        disCatch1.species = "NEP"
        disCatch1.weight = 5.0
        disCatch1.nbFish = 1.0
        disCatch1.faoZone = "27.8.a"
        disCatch1.packaging = "BOX"
        disCatch1.presentation = "DIM"
        disCatch1.economicZone = "FRA"
        disCatch1.preservationState = "ALI"
        disCatch1.statisticalRectangle = "24E5"

        val disCatch2 = LogbookFishingCatch()
        disCatch2.species = "BIB"
        disCatch2.weight = 3.0
        disCatch2.nbFish = 2.0
        disCatch2.faoZone = "27.8.a"
        disCatch2.packaging = "BOX"
        disCatch2.presentation = "DIM"
        disCatch2.economicZone = "FRA"
        disCatch2.preservationState = "FRE"
        disCatch2.statisticalRectangle = "24E5"

        val dis = DIS()
        dis.catches = listOf(disCatch1, disCatch2)
        dis.discardDateTime = ZonedDateTime.of(2019, 10, 17, 11, 45, 0, 0, UTC)

        // RET for DIS (success)
        val disAck = Acknowledgment(returnStatus = "000")

        // EOF message
        val eof = EOF()
        eof.endOfFishingDateTime = ZonedDateTime.of(2019, 10, 20, 12, 16, 0, 0, UTC)

        // PNO message
        val pnoCatch1 = LogbookFishingCatch()
        pnoCatch1.species = "SLS"
        pnoCatch1.weight = 20.0
        pnoCatch1.faoZone = "27.8.a"
        pnoCatch1.effortZone = "C"
        pnoCatch1.economicZone = "FRA"
        pnoCatch1.statisticalRectangle = "23E6"

        val pnoCatch2 = LogbookFishingCatch()
        pnoCatch2.species = "HKC"
        pnoCatch2.weight = 153.0
        pnoCatch2.faoZone = "27.8.a"
        pnoCatch2.effortZone = "C"
        pnoCatch2.economicZone = "FRA"
        pnoCatch2.statisticalRectangle = "23E6"

        val pnoCatch3 = LogbookFishingCatch()
        pnoCatch3.species = "SOL"
        pnoCatch3.weight = 2.0
        pnoCatch3.faoZone = "27.8.a"
        pnoCatch3.effortZone = "C"
        pnoCatch3.economicZone = "FRA"
        pnoCatch3.statisticalRectangle = "23E6"

        val pnoCatch4 = LogbookFishingCatch()
        pnoCatch4.species = "BON"
        pnoCatch4.weight = 1500.0
        pnoCatch4.faoZone = "27.8.a"
        pnoCatch4.effortZone = "C"
        pnoCatch4.economicZone = "FRA"
        pnoCatch4.statisticalRectangle = "23E6"

        val pno = PNO()
        pno.port = "AEJAZ"
        pno.purpose = LogbookMessagePurpose.LAN
        pno.catchOnboard = listOf(pnoCatch1, pnoCatch2, pnoCatch3, pnoCatch4)
        pno.tripStartDate = ZonedDateTime.of(2019, 10, 11, 0, 0, 0, 0, UTC)
        pno.predictedArrivalDatetimeUtc = ZonedDateTime.of(2019, 10, 21, 8, 16, 0, 0, UTC)

        // RET for PNO (success)
        val pnoAck = Acknowledgment(returnStatus = "000")

        // RTP message
        val rtp = RTP()
        rtp.port = "AEAJM"
        rtp.gearOnboard = listOf(gearOne)
        rtp.reasonOfReturn = "LAN"
        rtp.dateTime = ZonedDateTime.of(2019, 10, 21, 11, 12, 0, 0, UTC)

        // RET for RTP (error)
        val rtpAck =
            Acknowledgment(
                returnStatus = "002",
                rejectionCause =
                    "002 MGEN02 Message incorrect : la date/heure de l'événement RTP n° OOF20201105037001 " +
                        "est postérieure à la date/heure courante. Veuillez vérifier la date/heure de " +
                        "l'événement déclaré et renvoyer votre message.",
            )

        // LAN message
        val lanCatch1 = LogbookFishingCatch()
        lanCatch1.species = "SLS"
        lanCatch1.weight = 10.0
        lanCatch1.conversionFactor = 1.2
        lanCatch1.faoZone = "27.8.a"
        lanCatch1.effortZone = "C"
        lanCatch1.economicZone = "FRA"
        lanCatch1.statisticalRectangle = "23E6"

        val lanCatch2 = LogbookFishingCatch()
        lanCatch2.species = "SLS"
        lanCatch2.weight = 20.0
        lanCatch2.conversionFactor = 1.0
        lanCatch2.faoZone = "27.8.b"
        lanCatch2.effortZone = "C"
        lanCatch2.economicZone = "FRA"
        lanCatch2.statisticalRectangle = "23E6"

        val lanCatch3 = LogbookFishingCatch()
        lanCatch3.species = "HKC"
        lanCatch3.weight = 180.0
        lanCatch3.faoZone = "27.8.a"
        lanCatch3.effortZone = "C"
        lanCatch3.economicZone = "FRA"
        lanCatch3.statisticalRectangle = "23E6"

        val lanCatch4 = LogbookFishingCatch()
        lanCatch4.species = "BON"
        lanCatch4.weight = 1500.0
        lanCatch4.faoZone = "27.8.a"
        lanCatch4.effortZone = "C"
        lanCatch4.economicZone = "FRA"
        lanCatch4.statisticalRectangle = "23E6"

        val lanCatch5 = LogbookFishingCatch()
        lanCatch5.species = "SCR"
        lanCatch5.weight = 200.0
        lanCatch5.faoZone = "27.8.a"
        lanCatch5.packaging = "CNT"
        lanCatch5.effortZone = "C"
        lanCatch5.presentation = "WHL"
        lanCatch5.economicZone = "FRA"
        lanCatch5.preservationState = "ALI"
        lanCatch5.statisticalRectangle = "24E6"

        val lanCatch6 = LogbookFishingCatch()
        lanCatch6.species = "LBE"
        lanCatch6.weight = 6.0
        lanCatch6.faoZone = "27.8.a"
        lanCatch6.packaging = "CNT"
        lanCatch6.effortZone = "C"
        lanCatch6.presentation = "WHL"
        lanCatch6.economicZone = "FRA"
        lanCatch6.preservationState = "ALI"
        lanCatch6.statisticalRectangle = "24E6"

        val lan = LAN()
        lan.port = "AEAJM"
        lan.sender = "MAS"
        lan.catchLanded = listOf(lanCatch1, lanCatch2, lanCatch3, lanCatch4, lanCatch5, lanCatch6)
        lan.landingDateTime = ZonedDateTime.of(2019, 10, 22, 11, 6, 0, 0, UTC)

        // CPS message
        val cpsCatch1 = ProtectedSpeciesCatch()
        cpsCatch1.species = "DCO"
        cpsCatch1.weight = 60.0
        cpsCatch1.nbFish = 1.0
        cpsCatch1.sex = "M"
        cpsCatch1.healthState = HealthState.DEA
        cpsCatch1.ring = 1234567
        cpsCatch1.fate = Fate.DIS
        cpsCatch1.faoZone = "27.8.a"
        cpsCatch1.economicZone = "FRA"
        cpsCatch1.statisticalRectangle = "22E7"
        cpsCatch1.effortZone = "C"

        val cpsCatch2 = ProtectedSpeciesCatch()
        cpsCatch2.species = "DCO"
        cpsCatch2.weight = 80.0
        cpsCatch2.nbFish = 1.0
        cpsCatch2.sex = "M"
        cpsCatch2.healthState = HealthState.DEA
        cpsCatch2.careMinutes = 40
        cpsCatch2.ring = 1234568
        cpsCatch2.fate = Fate.DIS
        cpsCatch2.comment = "A comment"
        cpsCatch2.faoZone = "27.8.a"
        cpsCatch2.economicZone = "FRA"
        cpsCatch2.statisticalRectangle = "22E7"
        cpsCatch2.effortZone = "C"

        val cps = CPS()
        cps.cpsDatetime = ZonedDateTime.of(2023, 2, 28, 17, 44, 0, 0, UTC)
        cps.gear = "GTR"
        cps.mesh = 100.0
        cps.dimensions = "50.0;2.0"
        cps.catches = listOf(cpsCatch1, cpsCatch2)
        cps.latitude = 46.575
        cps.longitude = -2.741

        // RET for LAN (success)
        val lanAck = Acknowledgment(returnStatus = "000")

        // RET for DEL (success)
        val delAck = Acknowledgment(returnStatus = "000")

        return listOf(
            // DEP
            LogbookMessage(
                id = 1,
                operationNumber = "OOF20191011059900",
                tripNumber = "9463715",
                reportId = "OOF20191011059900",
                operationType = LogbookOperationType.DAT,
                messageType = "DEP",
                message = dep,
                flagState = "FRA",
                reportDateTime = ZonedDateTime.of(2019, 10, 11, 2, 6, 0, 0, UTC),
                transmissionFormat = LogbookTransmissionFormat.ERS,
                integrationDateTime = ZonedDateTime.of(2021, 1, 18, 7, 17, 28, 888437000, UTC),
                isEnriched = false,
                operationDateTime = ZonedDateTime.of(2019, 10, 11, 2, 6, 0, 0, UTC),
                software = "TurboCatch (3.7-1)",
            ),
            // COX
            LogbookMessage(
                id = 2,
                operationNumber = "OOF20191015059904",
                tripNumber = "9463715",
                reportId = "OOF20191015059904",
                operationType = LogbookOperationType.DAT,
                messageType = "COX",
                message = cox,
                flagState = "FRA",
                reportDateTime = ZonedDateTime.of(2019, 10, 15, 11, 23, 0, 0, UTC),
                transmissionFormat = LogbookTransmissionFormat.ERS,
                integrationDateTime = ZonedDateTime.of(2021, 1, 18, 7, 17, 18, 982560000, UTC),
                isEnriched = false,
                operationDateTime = ZonedDateTime.of(2019, 10, 15, 11, 23, 0, 0, UTC),
                software = "e-Sacapt Secours ERSV3 V 1.0.10",
            ),
            // COE
            LogbookMessage(
                id = 3,
                operationNumber = "OOF20190617059901",
                tripNumber = "9463715",
                reportId = "OOF20190617059901",
                operationType = LogbookOperationType.DAT,
                messageType = "COE",
                message = coe,
                flagState = "FRA",
                reportDateTime = ZonedDateTime.of(2019, 10, 17, 1, 32, 0, 0, UTC),
                transmissionFormat = LogbookTransmissionFormat.ERS,
                integrationDateTime = ZonedDateTime.of(2021, 1, 18, 7, 17, 18, 324128000, UTC),
                isEnriched = false,
                operationDateTime = ZonedDateTime.of(2019, 10, 17, 1, 32, 0, 0, UTC),
                software = "FP/VISIOCaptures V1.4.7",
            ),
            // CRO
            LogbookMessage(
                id = 4,
                operationNumber = "OOF20190617056738",
                tripNumber = "9463715",
                reportId = "OOF20190617056738",
                operationType = LogbookOperationType.DAT,
                messageType = "CRO",
                message = cro,
                flagState = "FRA",
                reportDateTime = ZonedDateTime.of(2019, 10, 17, 1, 33, 0, 0, UTC),
                transmissionFormat = LogbookTransmissionFormat.ERS,
                integrationDateTime = ZonedDateTime.of(2021, 1, 18, 7, 17, 18, 324128000, UTC),
                isEnriched = false,
                operationDateTime = ZonedDateTime.of(2019, 10, 17, 1, 33, 0, 0, UTC),
                software = "TurboCatch (3.7-1)",
            ),
            // FAR
            LogbookMessage(
                id = 5,
                operationNumber = "OOF20191030059902",
                tripNumber = "9463715",
                reportId = "OOF20191030059902",
                operationType = LogbookOperationType.DAT,
                messageType = "FAR",
                message = far,
                flagState = "FRA",
                reportDateTime = ZonedDateTime.of(2019, 10, 17, 11, 32, 0, 0, UTC),
                transmissionFormat = LogbookTransmissionFormat.ERS,
                integrationDateTime = ZonedDateTime.of(2021, 1, 18, 7, 17, 27, 384921000, UTC),
                isEnriched = false,
                operationDateTime = ZonedDateTime.of(2019, 10, 17, 11, 32, 0, 0, UTC),
                software = "TurboCatch (3.7-1)",
            ),
            // RET for FAR
            LogbookMessage(
                id = 6,
                operationNumber = "OOF20103048326985",
                tripNumber = null,
                reportId = null,
                referencedReportId = "OOF20191030059902",
                operationType = LogbookOperationType.RET,
                messageType = "",
                message = farAck,
                reportDateTime = ZonedDateTime.of(2019, 10, 30, 11, 32, 0, 0, UTC),
                transmissionFormat = LogbookTransmissionFormat.ERS,
                integrationDateTime = ZonedDateTime.of(2021, 1, 18, 7, 19, 28, 384921000, UTC),
                isEnriched = false,
                operationDateTime = ZonedDateTime.of(2019, 10, 17, 11, 36, 0, 0, UTC),
                software = "TurboCatch (3.7-1)",
            ),
            // COR
            LogbookMessage(
                id = 7,
                operationNumber = "OOF20191030059903",
                tripNumber = "9463715",
                reportId = "OOF20191030059903",
                referencedReportId = "OOF20191030059902",
                operationType = LogbookOperationType.COR,
                messageType = "FAR",
                message = correctedFar,
                flagState = "FRA",
                reportDateTime = ZonedDateTime.of(2019, 10, 30, 11, 32, 0, 0, UTC),
                transmissionFormat = LogbookTransmissionFormat.ERS,
                integrationDateTime = ZonedDateTime.of(2021, 1, 18, 7, 19, 27, 384921000, UTC),
                isEnriched = false,
                operationDateTime = ZonedDateTime.of(2019, 10, 17, 11, 36, 0, 0, UTC),
                software = "e-Sacapt Secours ERSV3 V 1.0.7",
            ),
            // RET for COR
            LogbookMessage(
                id = 8,
                operationNumber = "OOF19103048321388",
                tripNumber = null,
                reportId = null,
                referencedReportId = "OOF20191030059903",
                operationType = LogbookOperationType.RET,
                messageType = "",
                message = corAck,
                reportDateTime = ZonedDateTime.of(2019, 10, 30, 11, 32, 0, 0, UTC),
                transmissionFormat = LogbookTransmissionFormat.ERS,
                integrationDateTime = ZonedDateTime.of(2021, 1, 18, 7, 19, 28, 384921000, UTC),
                isEnriched = false,
                operationDateTime = ZonedDateTime.of(2019, 10, 17, 11, 36, 0, 0, UTC),
                software = "TurboCatch (3.7-1)",
            ),
            // DIS
            LogbookMessage(
                id = 9,
                operationNumber = "OOF20191030059909",
                tripNumber = "9463715",
                reportId = "OOF20191030059909",
                operationType = LogbookOperationType.DAT,
                messageType = "DIS",
                message = dis,
                flagState = "FRA",
                reportDateTime = ZonedDateTime.of(2019, 10, 30, 11, 38, 0, 0, UTC),
                transmissionFormat = LogbookTransmissionFormat.ERS,
                integrationDateTime = ZonedDateTime.of(2021, 1, 18, 7, 17, 27, 384921000, UTC),
                isEnriched = false,
                operationDateTime = ZonedDateTime.of(2019, 10, 17, 11, 45, 0, 0, UTC),
                software = "TurboCatch (3.7-1)",
            ),
            // RET for DIS
            LogbookMessage(
                id = 10,
                operationNumber = "OOF22103048326325",
                tripNumber = null,
                reportId = null,
                referencedReportId = "OOF20191030059909",
                operationType = LogbookOperationType.RET,
                messageType = "",
                message = disAck,
                reportDateTime = ZonedDateTime.of(2021, 1, 18, 7, 19, 29, 384921000, UTC),
                transmissionFormat = LogbookTransmissionFormat.ERS,
                integrationDateTime = ZonedDateTime.of(2021, 1, 18, 7, 19, 29, 384921000, UTC),
                isEnriched = false,
                operationDateTime = ZonedDateTime.of(2021, 1, 18, 7, 19, 29, 384921000, UTC),
                software = "TurboCatch (3.7-1)",
            ),
            // EOF
            LogbookMessage(
                id = 11,
                operationNumber = "OOF20191203059903",
                tripNumber = "9463715",
                reportId = "OOF20191203059903",
                operationType = LogbookOperationType.DAT,
                messageType = "EOF",
                message = eof,
                flagState = "FRA",
                reportDateTime = ZonedDateTime.of(2019, 12, 3, 12, 16, 0, 0, UTC),
                transmissionFormat = LogbookTransmissionFormat.ERS,
                integrationDateTime = ZonedDateTime.of(2021, 1, 18, 7, 17, 26, 736456000, UTC),
                isEnriched = false,
                operationDateTime = ZonedDateTime.of(2019, 10, 20, 12, 16, 0, 0, UTC),
                software = "TurboCatch (3.7-1)",
            ),
            // PNO
            LogbookMessage(
                id = 12,
                operationNumber = "OOF20191011059902",
                tripNumber = "9463715",
                reportId = "OOF20191011059902",
                operationType = LogbookOperationType.DAT,
                messageType = "PNO",
                message = pno,
                flagState = "FRA",
                reportDateTime = ZonedDateTime.of(2019, 10, 11, 8, 16, 0, 0, UTC),
                transmissionFormat = LogbookTransmissionFormat.ERS,
                integrationDateTime = ZonedDateTime.of(2021, 1, 18, 7, 17, 19, 42440000, UTC),
                isEnriched = false,
                operationDateTime = ZonedDateTime.of(2019, 10, 21, 8, 16, 0, 0, UTC),
                software = "TurboCatch (3.7-1)",
            ),
            // RET for PNO
            LogbookMessage(
                id = 13,
                operationNumber = "OOF22113048321388",
                tripNumber = null,
                reportId = null,
                referencedReportId = "OOF20191011059902",
                operationType = LogbookOperationType.RET,
                messageType = "",
                message = pnoAck,
                reportDateTime = ZonedDateTime.of(2019, 10, 30, 11, 32, 0, 0, UTC),
                transmissionFormat = LogbookTransmissionFormat.ERS,
                integrationDateTime = ZonedDateTime.of(2021, 1, 18, 7, 19, 28, 384921000, UTC),
                isEnriched = false,
                operationDateTime = ZonedDateTime.of(2019, 10, 17, 11, 36, 0, 0, UTC),
                software = "TurboCatch (3.7-1)",
            ),
            // RTP
            LogbookMessage(
                id = 14,
                operationNumber = "OOF20190830059906",
                tripNumber = "9463715",
                reportId = "OOF20190830059906",
                operationType = LogbookOperationType.DAT,
                messageType = "RTP",
                message = rtp,
                flagState = "FRA",
                reportDateTime = ZonedDateTime.of(2019, 8, 30, 11, 12, 0, 0, UTC),
                transmissionFormat = LogbookTransmissionFormat.ERS,
                integrationDateTime = ZonedDateTime.of(2021, 1, 18, 7, 17, 20, 7244000, UTC),
                isEnriched = false,
                operationDateTime = ZonedDateTime.of(2019, 10, 21, 11, 12, 0, 0, UTC),
                software = "TurboCatch (3.7-1)",
            ),
            // RET for RTP (error)
            LogbookMessage(
                id = 15,
                operationNumber = "OOF20190830059966",
                tripNumber = null,
                reportId = null,
                referencedReportId = "OOF20190830059906",
                operationType = LogbookOperationType.RET,
                messageType = "",
                message = rtpAck,
                reportDateTime = ZonedDateTime.of(2019, 8, 30, 11, 12, 0, 0, UTC),
                transmissionFormat = LogbookTransmissionFormat.ERS,
                integrationDateTime = ZonedDateTime.of(2021, 1, 18, 7, 17, 21, 7244000, UTC),
                isEnriched = false,
                operationDateTime = ZonedDateTime.of(2019, 10, 21, 11, 12, 0, 0, UTC),
                software = "TurboCatch (3.7-1)",
            ),
            // LAN
            LogbookMessage(
                id = 16,
                operationNumber = "OOF20190627059908",
                tripNumber = "9463715",
                reportId = "OOF20190627059908",
                operationType = LogbookOperationType.DAT,
                messageType = "LAN",
                message = lan,
                flagState = "FRA",
                reportDateTime = ZonedDateTime.of(2019, 6, 27, 11, 6, 0, 0, UTC),
                transmissionFormat = LogbookTransmissionFormat.ERS,
                integrationDateTime = ZonedDateTime.of(2021, 1, 18, 9, 17, 28, 271700000, UTC),
                isEnriched = false,
                operationDateTime = ZonedDateTime.of(2019, 10, 22, 11, 6, 0, 0, UTC),
                software = "TurboCatch (3.7-1)",
            ),
            // CPS
            LogbookMessage(
                id = 17,
                operationNumber = "OOF20103048323658",
                tripNumber = "9463715",
                reportId = "OOF20103048323658",
                operationType = LogbookOperationType.DAT,
                messageType = "CPS",
                message = cps,
                flagState = "FRA",
                reportDateTime = ZonedDateTime.of(2019, 10, 11, 1, 6, 0, 0, UTC),
                transmissionFormat = LogbookTransmissionFormat.ERS,
                integrationDateTime = ZonedDateTime.of(2019, 10, 11, 1, 17, 28, 271700000, UTC),
                isEnriched = false,
                operationDateTime = ZonedDateTime.of(2019, 10, 11, 1, 6, 0, 0, UTC),
                software = "TurboCatch (3.7-1)",
            ),
            // RET for LAN
            LogbookMessage(
                id = 18,
                operationNumber = "OOF221030483213993",
                tripNumber = null,
                reportId = null,
                referencedReportId = "OOF20190627059908",
                operationType = LogbookOperationType.RET,
                messageType = "",
                message = lanAck,
                reportDateTime = ZonedDateTime.of(2019, 10, 30, 11, 32, 0, 0, UTC),
                transmissionFormat = LogbookTransmissionFormat.ERS,
                integrationDateTime = ZonedDateTime.of(2021, 1, 18, 7, 19, 28, 384921000, UTC),
                isEnriched = false,
                operationDateTime = ZonedDateTime.of(2019, 10, 17, 11, 36, 0, 0, UTC),
                software = "TurboCatch (3.7-1)",
            ),
            // DEL
            LogbookMessage(
                id = 19,
                operationNumber = "OOF22103048321399",
                tripNumber = null,
                reportId = null,
                referencedReportId = "OOF20190627059908",
                operationType = LogbookOperationType.DEL,
                messageType = "",
                message = null,
                reportDateTime = ZonedDateTime.of(2019, 10, 30, 11, 32, 0, 0, UTC),
                transmissionFormat = LogbookTransmissionFormat.ERS,
                integrationDateTime = ZonedDateTime.of(2021, 1, 18, 7, 19, 28, 384921000, UTC),
                isEnriched = false,
                operationDateTime = ZonedDateTime.of(2019, 10, 17, 11, 36, 0, 0, UTC),
                software = "TurboCatch (3.7-1)",
            ),
            // RET for DEL
            LogbookMessage(
                id = 20,
                operationNumber = "OOF221030483213994",
                tripNumber = null,
                reportId = null,
                referencedReportId = "OOF22103048321399",
                operationType = LogbookOperationType.RET,
                messageType = "",
                message = delAck,
                reportDateTime = ZonedDateTime.of(2106, 10, 30, 11, 32, 0, 0, UTC),
                transmissionFormat = LogbookTransmissionFormat.ERS,
                integrationDateTime = ZonedDateTime.of(2019, 10, 18, 7, 19, 28, 384921000, UTC),
                isEnriched = false,
                operationDateTime = ZonedDateTime.of(2021, 1, 17, 11, 36, 0, 0, UTC),
                software = "TurboCatch (3.7-1)",
            ),
        )
    }
}
