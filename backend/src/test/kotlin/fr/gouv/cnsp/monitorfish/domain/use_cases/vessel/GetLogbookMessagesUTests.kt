package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import com.nhaarman.mockitokotlin2.any
import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.ScipSpeciesType
import fr.gouv.cnsp.monitorfish.domain.entities.gear.Gear
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.*
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.*
import fr.gouv.cnsp.monitorfish.domain.entities.species.Species
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.TestUtils.getDummyCorrectedLogbookMessages
import fr.gouv.cnsp.monitorfish.domain.use_cases.TestUtils.getDummyLogbookMessages
import fr.gouv.cnsp.monitorfish.domain.use_cases.TestUtils.getDummyLogbookMessagesFromFlagStatesWithoutRET
import fr.gouv.cnsp.monitorfish.domain.use_cases.TestUtils.getDummyRETLogbookMessages
import fr.gouv.cnsp.monitorfish.domain.use_cases.TestUtils.getTrip9463715LogbookMessages
import fr.gouv.cnsp.monitorfish.fakers.PortFaker
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZoneOffset
import java.time.ZoneOffset.UTC
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetLogbookMessagesUTests {
    @MockitoBean
    private lateinit var logbookReportRepository: LogbookReportRepository

    @MockitoBean
    private lateinit var speciesRepository: SpeciesRepository

    @MockitoBean
    private lateinit var portRepository: PortRepository

    @MockitoBean
    private lateinit var gearRepository: GearRepository

    @MockitoBean
    private lateinit var logbookRawMessageRepository: LogbookRawMessageRepository

    @Test
    fun `execute Should return an ordered list of last ERS messages with the codes' names`() {
        // Given
        given(logbookReportRepository.findLastTripBeforeDateTime(any(), any())).willReturn(
            VoyageDatesAndTripNumber("123", ZonedDateTime.now(), ZonedDateTime.now()),
        )
        given(logbookReportRepository.findAllMessagesByTripNumberBetweenDates(any(), any(), any(), any())).willReturn(
            getDummyLogbookMessages(),
        )
        given(logbookRawMessageRepository.findRawMessage(any())).willReturn("<xml>DUMMY XML MESSAGE</xml>")
        given(gearRepository.findAll()).willReturn(
            listOf(
                Gear("OTB", "Chaluts de fond à panneaux"),
                Gear("DRB", "Dragues remorquées par bateau"),
            ),
        )
        given(portRepository.findAll()).willReturn(
            listOf(
                PortFaker.fakePort(locode = "AEFAT", name = "Al Jazeera Port"),
                PortFaker.fakePort(locode = "AEJAZ", name = "Arzanah Island"),
            ),
        )
        given(speciesRepository.findAll()).willReturn(
            listOf(
                Species(code = "TTV", name = "TORPILLE OCELLÉE", scipSpeciesType = ScipSpeciesType.PELAGIC),
                Species(code = "SMV", name = "STOMIAS BREVIBARBATUS", scipSpeciesType = ScipSpeciesType.PELAGIC),
                Species(code = "PNB", name = "CREVETTE ROYALE ROSE", scipSpeciesType = ScipSpeciesType.PELAGIC),
            ),
        )

        // When
        val ersMessages =
            GetLogbookMessages(
                logbookReportRepository,
                gearRepository,
                speciesRepository,
                portRepository,
                logbookRawMessageRepository,
            ).execute("FR224226850", ZonedDateTime.now().minusMinutes(5), ZonedDateTime.now(), "345")

        // Then
        assertThat(ersMessages).hasSize(6)

        assertThat(ersMessages[0].message).isInstanceOf(DEP::class.java)
        assertThat(ersMessages[0].rawMessage).isEqualTo("<xml>DUMMY XML MESSAGE</xml>")
        val dep = ersMessages[0].message as DEP
        assertThat(dep.speciesOnboard.first().species).isEqualTo("TTV")
        assertThat(dep.speciesOnboard.first().speciesName).isEqualTo("TORPILLE OCELLÉE")
        assertThat(dep.gearOnboard.first().gear).isEqualTo("OTB")
        assertThat(dep.gearOnboard.first().gearName).isEqualTo("Chaluts de fond à panneaux")
        assertThat(dep.gearOnboard.last().gear).isEqualTo("DRB")
        assertThat(dep.gearOnboard.last().gearName).isEqualTo("Dragues remorquées par bateau")
        assertThat(dep.departurePort).isEqualTo("AEFAT")
        assertThat(dep.departurePortName).isEqualTo("Al Jazeera Port")

        assertThat(ersMessages[1].message).isInstanceOf(FAR::class.java)
        assertThat(ersMessages[1].rawMessage).isEqualTo("<xml>DUMMY XML MESSAGE</xml>")
        val far = ersMessages[1].message as FAR
        assertThat(far.hauls.size).isEqualTo(1)
        assertThat(
            far.hauls
                .first()
                .catches
                .first()
                .species,
        ).isEqualTo("SMV")
        assertThat(
            far.hauls
                .first()
                .catches
                .first()
                .speciesName,
        ).isEqualTo("STOMIAS BREVIBARBATUS")
        assertThat(
            far.hauls
                .first()
                .catches
                .last()
                .species,
        ).isEqualTo("PNB")
        assertThat(
            far.hauls
                .first()
                .catches
                .last()
                .speciesName,
        ).isEqualTo("CREVETTE ROYALE ROSE")
        assertThat(far.hauls.first().gearName).isEqualTo("Chaluts de fond à panneaux")

        assertThat(ersMessages[2].message).isInstanceOf(COE::class.java)
        val coe = ersMessages[2].message as COE
        assertThat(coe.targetSpeciesOnEntry).isEqualTo("DEM")
        assertThat(coe.targetSpeciesNameOnEntry).isEqualTo("Démersal")

        assertThat(ersMessages[3].message).isInstanceOf(COX::class.java)
        val cox = ersMessages[3].message as COX
        assertThat(cox.targetSpeciesOnExit).isEqualTo("DEM")
        assertThat(cox.targetSpeciesNameOnExit).isEqualTo("Démersal")

        assertThat(ersMessages[4].message).isInstanceOf(CPS::class.java)
        val cps = ersMessages[4].message as CPS
        assertThat(cps.catches[0].species).isEqualTo("TTV")
        assertThat(cps.catches[0].speciesName).isEqualTo("TORPILLE OCELLÉE")
        assertThat(cps.catches[0].healthState).isEqualTo(HealthState.DEA)

        assertThat(ersMessages[5].message).isInstanceOf(PNO::class.java)
        assertThat(ersMessages[5].rawMessage).isEqualTo("<xml>DUMMY XML MESSAGE</xml>")
        val pno = ersMessages[5].message as PNO
        assertThat(pno.catchOnboard[0].species).isEqualTo("TTV")
        assertThat(pno.catchOnboard[0].speciesName).isEqualTo("TORPILLE OCELLÉE")
        assertThat(pno.catchOnboard[1].species).isEqualTo("SMV")
        assertThat(pno.catchOnboard[1].speciesName).isEqualTo("STOMIAS BREVIBARBATUS")
        assertThat(pno.catchOnboard[2].species).isEqualTo("PNB")
        assertThat(pno.catchOnboard[2].speciesName).isEqualTo("CREVETTE ROYALE ROSE")
        assertThat(pno.port).isEqualTo("AEJAZ")
        assertThat(pno.portName).isEqualTo("Arzanah Island")
    }

    @Test
    fun `execute Should flag a corrected message as true`() {
        // Given
        given(logbookReportRepository.findLastTripBeforeDateTime(any(), any())).willReturn(
            VoyageDatesAndTripNumber("123", ZonedDateTime.now(), ZonedDateTime.now()),
        )
        given(logbookReportRepository.findAllMessagesByTripNumberBetweenDates(any(), any(), any(), any())).willReturn(
            getDummyCorrectedLogbookMessages(),
        )

        // When
        val ersMessages =
            GetLogbookMessages(
                logbookReportRepository,
                gearRepository,
                speciesRepository,
                portRepository,
                logbookRawMessageRepository,
            ).execute("FR224226850", ZonedDateTime.now().minusMinutes(5), ZonedDateTime.now(), "345")

        // Then
        assertThat(ersMessages).hasSize(2)

        assertThat(ersMessages[0].message).isInstanceOf(FAR::class.java)
        assertThat(ersMessages[0].operationType).isEqualTo(LogbookOperationType.DAT)
        assertThat(ersMessages[0].isCorrectedByNewerMessage).isEqualTo(true)
        val correctedFar = ersMessages[0].message as FAR
        assertThat(correctedFar.hauls.size).isEqualTo(1)
        assertThat(correctedFar.hauls.first().catches).hasSize(2)

        assertThat(ersMessages[1].message).isInstanceOf(FAR::class.java)
        assertThat(ersMessages[1].operationType).isEqualTo(LogbookOperationType.COR)
        assertThat(ersMessages[1].isCorrectedByNewerMessage).isEqualTo(false)
        val far = ersMessages[1].message as FAR
        assertThat(far.hauls.size).isEqualTo(1)
        assertThat(far.hauls.first().catches).hasSize(3)
    }

    @Test
    fun `execute Should filter to return only DAT and COR messages and add the acknowledge property`() {
        // Given
        given(logbookReportRepository.findLastTripBeforeDateTime(any(), any())).willReturn(
            VoyageDatesAndTripNumber("123", ZonedDateTime.now(), ZonedDateTime.now()),
        )
        given(logbookReportRepository.findAllMessagesByTripNumberBetweenDates(any(), any(), any(), any())).willReturn(
            getDummyRETLogbookMessages(),
        )

        // When
        val ersMessages =
            GetLogbookMessages(
                logbookReportRepository,
                gearRepository,
                speciesRepository,
                portRepository,
                logbookRawMessageRepository,
            ).execute("FR224226850", ZonedDateTime.now().minusMinutes(5), ZonedDateTime.now(), "345")

        // Then
        assertThat(ersMessages).hasSize(3)

        assertThat(ersMessages[0].message).isInstanceOf(FAR::class.java)
        assertThat(ersMessages[0].acknowledgment).isInstanceOf(Acknowledgment::class.java)
        assertThat(ersMessages[0].operationType).isEqualTo(LogbookOperationType.DAT)
        assertThat(ersMessages[0].isCorrectedByNewerMessage).isEqualTo(false)
        val ack = ersMessages[0].acknowledgment as Acknowledgment
        assertThat(ack.rejectionCause).isEqualTo("Oops")
        assertThat(ack.returnStatus).isEqualTo("002")
        assertThat(ack.isSuccess).isFalse
        val correctedFar = ersMessages[0].message as FAR
        assertThat(correctedFar.hauls.size).isEqualTo(1)
        assertThat(correctedFar.hauls.first().catches).hasSize(2)

        assertThat(ersMessages[1].message).isInstanceOf(FAR::class.java)
        assertThat(ersMessages[1].operationType).isEqualTo(LogbookOperationType.DAT)
        assertThat(ersMessages[1].isCorrectedByNewerMessage).isEqualTo(false)
        val ackTwo = ersMessages[1].acknowledgment as Acknowledgment
        assertThat(ackTwo.rejectionCause).isNull()
        assertThat(ackTwo.returnStatus).isEqualTo("000")
        assertThat(ackTwo.isSuccess).isTrue
        val far = ersMessages[1].message as FAR
        assertThat(far.hauls.size).isEqualTo(1)
        assertThat(far.hauls.first().catches).hasSize(3)

        assertThat(ersMessages[2].operationNumber).isEqualTo("5h499-erh5u7-pm3ae8c5trj78j67dfh")
        assertThat(ersMessages[2].transmissionFormat).isEqualTo(LogbookTransmissionFormat.FLUX)
        val ackThree = ersMessages[2].acknowledgment as Acknowledgment
        assertThat(ackThree.isSuccess).isTrue
        assertThat(ackThree.rejectionCause).isNull()
        assertThat(ackThree.returnStatus).isNull()
    }

    @Test
    fun `execute Should only add the latest acknowledge message`() {
        // Given
        val lastAck = Acknowledgment(returnStatus = "000")

        given(logbookReportRepository.findLastTripBeforeDateTime(any(), any()))
            .willReturn(VoyageDatesAndTripNumber("123", ZonedDateTime.now(), ZonedDateTime.now()))
        given(logbookReportRepository.findAllMessagesByTripNumberBetweenDates(any(), any(), any(), any()))
            .willReturn(
                getDummyRETLogbookMessages() +
                    LogbookMessage(
                        id = 2,
                        reportId = "9065646816",
                        referencedReportId = "9065646811",
                        integrationDateTime = ZonedDateTime.now(),
                        isEnriched = false,
                        message = lastAck,
                        messageType = "",
                        operationDateTime = ZonedDateTime.now(),
                        operationNumber = "",
                        operationType = LogbookOperationType.RET,
                        reportDateTime =
                            ZonedDateTime.of(2021, 5, 5, 3, 4, 5, 3, ZoneOffset.UTC).minusHours(
                                12,
                            ),
                        transmissionFormat = LogbookTransmissionFormat.ERS,
                    ),
            )
        given(logbookRawMessageRepository.findRawMessage(any())).willReturn("<xml>DUMMY XML MESSAGE</xml>")
        given(gearRepository.findAll()).willReturn(emptyList())
        given(portRepository.findAll()).willReturn(emptyList())
        given(speciesRepository.findAll()).willReturn(emptyList())

        // When
        val ersMessages =
            GetLogbookMessages(
                logbookReportRepository,
                gearRepository,
                speciesRepository,
                portRepository,
                logbookRawMessageRepository,
            ).execute("FR224226850", ZonedDateTime.now().minusMinutes(5), ZonedDateTime.now(), "345")

        // Then
        assertThat(ersMessages).hasSize(3)

        // The last ACK message by date time is saved in the acknowledge property
        val ack = ersMessages[0].acknowledgment as Acknowledgment
        assertThat(ack.returnStatus).isEqualTo("000")
        assertThat(ack.isSuccess).isTrue
    }

    @Test
    fun `execute Should add the deleted property`() {
        // Given
        given(logbookReportRepository.findLastTripBeforeDateTime(any(), any())).willReturn(
            VoyageDatesAndTripNumber("123", ZonedDateTime.now(), ZonedDateTime.now()),
        )
        given(logbookReportRepository.findAllMessagesByTripNumberBetweenDates(any(), any(), any(), any())).willReturn(
            getDummyRETLogbookMessages(),
        )

        // When
        val ersMessages =
            GetLogbookMessages(
                logbookReportRepository,
                gearRepository,
                speciesRepository,
                portRepository,
                logbookRawMessageRepository,
            ).execute("FR224226850", ZonedDateTime.now().minusMinutes(5), ZonedDateTime.now(), "345")

        // Then
        assertThat(ersMessages).hasSize(3)

        assertThat(ersMessages[1].reportId).isEqualTo("9065646813")
        assertThat(ersMessages[1].isDeleted).isTrue
    }

    @Test
    fun `execute Should not add the deleted property When the DEL message is not acknowledged`() {
        // Given
        given(logbookReportRepository.findLastTripBeforeDateTime(any(), any())).willReturn(
            VoyageDatesAndTripNumber("123", ZonedDateTime.now(), ZonedDateTime.now()),
        )
        val messagesWithoutValidRet =
            getDummyRETLogbookMessages()
                .filter { it.id != 7.toLong() } +
                LogbookMessage(
                    id = 7,
                    operationNumber = "7777777777",
                    reportId = null,
                    referencedReportId = "90656468131",
                    operationType = LogbookOperationType.RET,
                    messageType = "",
                    message = Acknowledgment(returnStatus = "002", rejectionCause = "Oops"),
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
                )
        given(logbookReportRepository.findAllMessagesByTripNumberBetweenDates(any(), any(), any(), any())).willReturn(
            messagesWithoutValidRet,
        )

        // When
        val ersMessages =
            GetLogbookMessages(
                logbookReportRepository,
                gearRepository,
                speciesRepository,
                portRepository,
                logbookRawMessageRepository,
            ).execute("FR224226850", ZonedDateTime.now().minusMinutes(5), ZonedDateTime.now(), "345")

        // Then
        assertThat(ersMessages).hasSize(3)

        assertThat(ersMessages[1].reportId).isEqualTo("9065646813")
        assertThat(ersMessages[1].isDeleted).isFalse
    }

    @Test
    fun `execute Should acknowledge messages from flag stages that do not send RET`() {
        // Given
        given(logbookReportRepository.findLastTripBeforeDateTime(any(), any())).willReturn(
            VoyageDatesAndTripNumber("123", ZonedDateTime.now(), ZonedDateTime.now()),
        )
        given(logbookReportRepository.findAllMessagesByTripNumberBetweenDates(any(), any(), any(), any())).willReturn(
            getDummyLogbookMessagesFromFlagStatesWithoutRET(),
        )

        // When
        val ersMessages =
            GetLogbookMessages(
                logbookReportRepository,
                gearRepository,
                speciesRepository,
                portRepository,
                logbookRawMessageRepository,
            ).execute("FR224226850", ZonedDateTime.now().minusMinutes(5), ZonedDateTime.now(), "345")

        // Then
        assertThat(ersMessages).hasSize(3)

        assertThat(ersMessages[0].acknowledgment?.isSuccess).isTrue
        assertThat(ersMessages[1].acknowledgment?.isSuccess).isTrue
        assertThat(ersMessages[2].acknowledgment?.isSuccess).isTrue
    }

    /**
     * add two report_id for the same RET in the stub
     */

    @Test
    fun `execute Should flag messages sent by the failover software e-Sacapt`() {
        // Given
        given(logbookReportRepository.findLastTripBeforeDateTime(any(), any())).willReturn(
            VoyageDatesAndTripNumber("123", ZonedDateTime.now(), ZonedDateTime.now()),
        )
        given(logbookReportRepository.findAllMessagesByTripNumberBetweenDates(any(), any(), any(), any())).willReturn(
            getDummyLogbookMessages(),
        )

        // When
        val ersMessages =
            GetLogbookMessages(
                logbookReportRepository,
                gearRepository,
                speciesRepository,
                portRepository,
                logbookRawMessageRepository,
            ).execute("FR224226850", ZonedDateTime.now().minusMinutes(5), ZonedDateTime.now(), "345")

        // Then
        assertThat(ersMessages).hasSize(6)

        assertThat(ersMessages[0].isSentByFailoverSoftware).isTrue
        assertThat(ersMessages[1].isSentByFailoverSoftware).isFalse
        assertThat(ersMessages[2].isSentByFailoverSoftware).isTrue
        assertThat(ersMessages[3].isSentByFailoverSoftware).isTrue
        assertThat(ersMessages[4].isSentByFailoverSoftware).isFalse
    }

    @Test
    fun `execute Should add the deleted property When messages are from a flag state with no RET`() {
        // Given
        val farMessage = FAR()
        val haul = Haul()
        haul.gear = "OTB"
        farMessage.hauls = listOf(haul)

        given(logbookReportRepository.findLastTripBeforeDateTime(any(), any())).willReturn(
            VoyageDatesAndTripNumber("123", ZonedDateTime.now(), ZonedDateTime.now()),
        )
        given(logbookReportRepository.findAllMessagesByTripNumberBetweenDates(any(), any(), any(), any())).willReturn(
            listOf(
                LogbookMessage(
                    id = 1,
                    operationNumber = "FAR123",
                    tripNumber = "345",
                    reportId = "FAR123",
                    operationType = LogbookOperationType.DAT,
                    messageType = "FAR",
                    message = farMessage,
                    flagState = "DNK",
                    reportDateTime = ZonedDateTime.now().minusHours(12),
                    transmissionFormat = LogbookTransmissionFormat.ERS,
                    integrationDateTime = ZonedDateTime.now(),
                    isEnriched = false,
                    operationDateTime = ZonedDateTime.now(),
                ),
                LogbookMessage(
                    id = 2,
                    operationNumber = "",
                    reportId = "DEL123",
                    referencedReportId = "FAR123",
                    operationType = LogbookOperationType.DEL,
                    messageType = "",
                    message = null,
                    reportDateTime = ZonedDateTime.now().minusHours(6),
                    transmissionFormat = LogbookTransmissionFormat.ERS,
                    integrationDateTime = ZonedDateTime.now(),
                    isEnriched = false,
                    operationDateTime = ZonedDateTime.now(),
                ),
            ),
        )

        // When
        val ersMessages =
            GetLogbookMessages(
                logbookReportRepository,
                gearRepository,
                speciesRepository,
                portRepository,
                logbookRawMessageRepository,
            ).execute("FR224226850", ZonedDateTime.now().minusMinutes(5), ZonedDateTime.now(), "345")

        // Then
        assertThat(ersMessages).hasSize(1)
        assertThat(ersMessages[0].reportId).isEqualTo("FAR123")
        assertThat(ersMessages[0].isDeleted).isTrue
    }

    @Test
    fun `execute Should not add the deleted property When DEL has no referencedReportId`() {
        // Given
        val farMessage = FAR()
        val haul = Haul()
        haul.gear = "OTB"
        farMessage.hauls = listOf(haul)

        given(logbookReportRepository.findLastTripBeforeDateTime(any(), any())).willReturn(
            VoyageDatesAndTripNumber("123", ZonedDateTime.now(), ZonedDateTime.now()),
        )
        given(logbookReportRepository.findAllMessagesByTripNumberBetweenDates(any(), any(), any(), any())).willReturn(
            listOf(
                LogbookMessage(
                    id = 1,
                    operationNumber = "FAR789",
                    tripNumber = "345",
                    reportId = "FAR789",
                    operationType = LogbookOperationType.DAT,
                    messageType = "FAR",
                    message = farMessage,
                    reportDateTime = ZonedDateTime.now().minusHours(12),
                    transmissionFormat = LogbookTransmissionFormat.ERS,
                    integrationDateTime = ZonedDateTime.now(),
                    isEnriched = false,
                    operationDateTime = ZonedDateTime.now(),
                ),
                LogbookMessage(
                    id = 2,
                    operationNumber = "DEL789",
                    reportId = null,
                    referencedReportId = null,
                    operationType = LogbookOperationType.DEL,
                    messageType = "",
                    message = Acknowledgment(returnStatus = "000"),
                    reportDateTime = ZonedDateTime.now().minusHours(6),
                    transmissionFormat = LogbookTransmissionFormat.ERS,
                    integrationDateTime = ZonedDateTime.now(),
                    isEnriched = false,
                    operationDateTime = ZonedDateTime.now(),
                ),
            ),
        )

        // When
        val ersMessages =
            GetLogbookMessages(
                logbookReportRepository,
                gearRepository,
                speciesRepository,
                portRepository,
                logbookRawMessageRepository,
            ).execute("FR224226850", ZonedDateTime.now().minusMinutes(5), ZonedDateTime.now(), "345")

        // Then
        assertThat(ersMessages).hasSize(1)
        assertThat(ersMessages[0].reportId).isEqualTo("FAR789")
        assertThat(ersMessages[0].isDeleted).isFalse
    }

    @Test
    fun `execute Should acknowledge two messages with the same report id`() {
        // Given
        val retTargetingTwoMessages =
            LogbookMessage(
                id = 123,
                operationNumber = "906564681689",
                reportId = null,
                referencedReportId = "ON#4",
                operationType = LogbookOperationType.RET,
                messageType = "",
                message = Acknowledgment(returnStatus = "000"),
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
            )
        given(logbookReportRepository.findLastTripBeforeDateTime(any(), any())).willReturn(
            VoyageDatesAndTripNumber("123", ZonedDateTime.now(), ZonedDateTime.now()),
        )
        given(logbookReportRepository.findAllMessagesByTripNumberBetweenDates(any(), any(), any(), any())).willReturn(
            getDummyLogbookMessages() + retTargetingTwoMessages,
        )

        // When
        val ersMessages =
            GetLogbookMessages(
                logbookReportRepository,
                gearRepository,
                speciesRepository,
                portRepository,
                logbookRawMessageRepository,
            ).execute(
                internalReferenceNumber = "FR224226850",
                afterDepartureDate = ZonedDateTime.now().minusMinutes(5),
                beforeDepartureDate = ZonedDateTime.now(),
                tripNumber = "345",
            )

        // Then
        assertThat(ersMessages).hasSize(6)

        assertThat(ersMessages[2].acknowledgment?.isSuccess).isTrue
        assertThat(ersMessages[3].acknowledgment?.isSuccess).isTrue
    }

    @Test
    fun `execute Should handle comprehensive trip data from trip 9463715`() {
        // Given
        given(logbookReportRepository.findAllMessagesByTripNumberBetweenDates(any(), any(), any(), any())).willReturn(
            getTrip9463715LogbookMessages(),
        )
        given(gearRepository.findAll()).willReturn(emptyList())
        given(portRepository.findAll()).willReturn(emptyList())
        given(speciesRepository.findAll()).willReturn(emptyList())

        // When
        val ersMessages =
            GetLogbookMessages(
                logbookReportRepository,
                gearRepository,
                speciesRepository,
                portRepository,
                logbookRawMessageRepository,
            ).execute(
                internalReferenceNumber = "FAK000999999",
                afterDepartureDate = ZonedDateTime.of(2019, 10, 1, 0, 0, 0, 0, UTC),
                beforeDepartureDate = ZonedDateTime.of(2019, 12, 31, 23, 59, 59, 0, UTC),
                tripNumber = "9463715",
            )

        // Then
        // Should only return DAT and COR messages (filters out RET, DEL, etc.)
        assertThat(ersMessages).hasSize(12)

        // Verify DEP message
        assertThat(ersMessages[3].messageType).isEqualTo("DEP")
        assertThat(ersMessages[3].reportId).isEqualTo("OOF20191011059900")
        assertThat(ersMessages[3].message).isInstanceOf(DEP::class.java)
        val dep = ersMessages[3].message as DEP
        assertThat(dep.gearOnboard).hasSize(2)
        assertThat(dep.gearOnboard[0].gear).isEqualTo("GTN")
        assertThat(dep.gearOnboard[0].mesh).isEqualTo(100.0)

        // Verify COX message
        assertThat(ersMessages[5].messageType).isEqualTo("COX")
        assertThat(ersMessages[5].message).isInstanceOf(COX::class.java)
        val cox = ersMessages[5].message as COX
        assertThat(cox.targetSpeciesOnExit).isEqualTo("DEM")

        // Verify COE message
        assertThat(ersMessages[6].messageType).isEqualTo("COE")
        assertThat(ersMessages[6].message).isInstanceOf(COE::class.java)
        val coe = ersMessages[6].message as COE
        assertThat(coe.targetSpeciesOnEntry).isEqualTo("PEL")

        // Verify CRO message
        assertThat(ersMessages[7].messageType).isEqualTo("CRO")
        assertThat(ersMessages[7].message).isInstanceOf(CRO::class.java)

        // Verify FAR message (original)
        assertThat(ersMessages[8].messageType).isEqualTo("FAR")
        assertThat(ersMessages[8].reportId).isEqualTo("OOF20191030059902")
        assertThat(ersMessages[8].operationType).isEqualTo(LogbookOperationType.DAT)
        assertThat(ersMessages[8].isCorrectedByNewerMessage).isTrue
        assertThat(ersMessages[8].acknowledgment).isNotNull
        assertThat(ersMessages[8].acknowledgment?.isSuccess).isTrue
        val far = ersMessages[8].message as FAR
        assertThat(far.hauls).hasSize(1)
        assertThat(far.hauls[0].catches).hasSize(4)
        assertThat(far.hauls[0].dimensions).isEqualTo("150.0;120.0")

        // Verify COR message (corrected FAR)
        assertThat(ersMessages[9].messageType).isEqualTo("FAR")
        assertThat(ersMessages[9].reportId).isEqualTo("OOF20191030059903")
        assertThat(ersMessages[9].referencedReportId).isEqualTo("OOF20191030059902")
        assertThat(ersMessages[9].operationType).isEqualTo(LogbookOperationType.COR)
        assertThat(ersMessages[9].isCorrectedByNewerMessage).isFalse
        assertThat(ersMessages[9].acknowledgment).isNotNull
        assertThat(ersMessages[9].acknowledgment?.isSuccess).isTrue
        val correctedFar = ersMessages[9].message as FAR
        assertThat(correctedFar.hauls).hasSize(1)
        // Verify dimensions field can hold numeric data as strings
        assertThat(correctedFar.hauls[0].dimensions).isEqualTo("120.0")
        assertThat(correctedFar.hauls[0].catches.size).isGreaterThan(far.hauls[0].catches.size)

        // Verify DIS message
        assertThat(ersMessages[10].messageType).isEqualTo("DIS")
        assertThat(ersMessages[10].acknowledgment?.isSuccess).isTrue
        val dis = ersMessages[10].message as DIS
        assertThat(dis.catches).hasSize(2)
        assertThat(dis.catches[0].species).isEqualTo("NEP")
        assertThat(dis.catches[1].species).isEqualTo("BIB")

        // Verify EOF message
        assertThat(ersMessages[11].messageType).isEqualTo("EOF")
        val eof = ersMessages[11].message as EOF
        assertThat(eof.endOfFishingDateTime).isEqualTo(ZonedDateTime.of(2019, 10, 20, 12, 16, 0, 0, UTC))

        // Verify PNO message
        assertThat(ersMessages[4].messageType).isEqualTo("PNO")
        assertThat(ersMessages[4].acknowledgment?.isSuccess).isTrue
        val pno = ersMessages[4].message as PNO
        assertThat(pno.catchOnboard).hasSize(4)

        // Verify RTP message with error acknowledgment
        assertThat(ersMessages[1].messageType).isEqualTo("RTP")
        assertThat(ersMessages[1].acknowledgment).isNotNull
        assertThat(ersMessages[1].acknowledgment?.isSuccess).isFalse
        assertThat(ersMessages[1].acknowledgment?.returnStatus).isEqualTo("002")
        assertThat(ersMessages[1].acknowledgment?.rejectionCause).contains("MGEN02")
        val rtp = ersMessages[1].message as RTP
        assertThat(rtp.port).isEqualTo("AEAJM")

        // Verify LAN message is marked as deleted
        assertThat(ersMessages[0].messageType).isEqualTo("LAN")
        assertThat(ersMessages[0].reportId).isEqualTo("OOF20190627059908")
        assertThat(ersMessages[0].isDeleted).isTrue
        assertThat(ersMessages[0].acknowledgment?.isSuccess).isTrue
        val lan = ersMessages[0].message as LAN
        assertThat(lan.catchLanded).hasSize(6)
        assertThat(lan.sender).isEqualTo("MAS")

        // Verify CPS message
        assertThat(ersMessages[2].messageType).isEqualTo("CPS")
        val cps = ersMessages[2].message as CPS
        assertThat(cps.catches).hasSize(2)
        assertThat(cps.catches[0].species).isEqualTo("DCO")
        assertThat(cps.catches[0].ring).isEqualTo(1234567)
    }
}
