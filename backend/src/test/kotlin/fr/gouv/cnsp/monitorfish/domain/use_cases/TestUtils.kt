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

        val farAck =
            Acknowledgment().apply {
                returnStatus = "000"
            }

        val farBadAck =
            Acknowledgment().apply {
                returnStatus = "002"
                rejectionCause = "Oops"
            }

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
                reportId = "90656468131",
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
                id = 7,
                operationNumber = "",
                reportId = "90656468132",
                referencedReportId = "90656468131",
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
}
