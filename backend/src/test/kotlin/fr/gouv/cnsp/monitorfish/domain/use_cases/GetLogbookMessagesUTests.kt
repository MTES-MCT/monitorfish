package fr.gouv.cnsp.monitorfish.domain.use_cases

import com.nhaarman.mockitokotlin2.any
import fr.gouv.cnsp.monitorfish.domain.entities.gear.Gear
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.*
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.*
import fr.gouv.cnsp.monitorfish.domain.entities.species.Species
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.TestUtils.getDummyCorrectedLogbookMessages
import fr.gouv.cnsp.monitorfish.domain.use_cases.TestUtils.getDummyFluxAndVisioCaptureLogbookMessages
import fr.gouv.cnsp.monitorfish.domain.use_cases.TestUtils.getDummyLogbookMessages
import fr.gouv.cnsp.monitorfish.domain.use_cases.TestUtils.getDummyRETLogbookMessages
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.GetLogbookMessages
import fr.gouv.cnsp.monitorfish.fakers.PortFaker
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZoneOffset
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetLogbookMessagesUTests {
    @MockBean
    private lateinit var logbookReportRepository: LogbookReportRepository

    @MockBean
    private lateinit var speciesRepository: SpeciesRepository

    @MockBean
    private lateinit var portRepository: PortRepository

    @MockBean
    private lateinit var gearRepository: GearRepository

    @MockBean
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
                Species("TTV", "TORPILLE OCELLÉE"),
                Species("SMV", "STOMIAS BREVIBARBATUS"),
                Species("PNB", "CREVETTE ROYALE ROSE"),
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
            )
                .execute("FR224226850", ZonedDateTime.now().minusMinutes(5), ZonedDateTime.now(), "345")

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
        assertThat(far.hauls.first().catches.first().species).isEqualTo("SMV")
        assertThat(far.hauls.first().catches.first().speciesName).isEqualTo("STOMIAS BREVIBARBATUS")
        assertThat(far.hauls.first().catches.last().species).isEqualTo("PNB")
        assertThat(far.hauls.first().catches.last().speciesName).isEqualTo("CREVETTE ROYALE ROSE")
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
                Species("TTV", "TORPILLE OCELLÉE"),
                Species("SMV", "STOMIAS BREVIBARBATUS"),
                Species("PNB", "CREVETTE ROYALE ROSE"),
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
            )
                .execute("FR224226850", ZonedDateTime.now().minusMinutes(5), ZonedDateTime.now(), "345")

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
                Species("TTV", "TORPILLE OCELLÉE"),
                Species("SMV", "STOMIAS BREVIBARBATUS"),
                Species("PNB", "CREVETTE ROYALE ROSE"),
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
            )
                .execute("FR224226850", ZonedDateTime.now().minusMinutes(5), ZonedDateTime.now(), "345")

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
        val lastAck = Acknowledgment()
        lastAck.returnStatus = "000"

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
            )
                .execute("FR224226850", ZonedDateTime.now().minusMinutes(5), ZonedDateTime.now(), "345")

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
                Species("TTV", "TORPILLE OCELLÉE"),
                Species("SMV", "STOMIAS BREVIBARBATUS"),
                Species("PNB", "CREVETTE ROYALE ROSE"),
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
            )
                .execute("FR224226850", ZonedDateTime.now().minusMinutes(5), ZonedDateTime.now(), "345")

        // Then
        assertThat(ersMessages).hasSize(3)

        assertThat(ersMessages[1].isDeleted).isTrue
    }

    @Test
    fun `execute Should acknowledge FLUX and VISIOCAPTURE messages`() {
        // Given
        given(logbookReportRepository.findLastTripBeforeDateTime(any(), any())).willReturn(
            VoyageDatesAndTripNumber("123", ZonedDateTime.now(), ZonedDateTime.now()),
        )
        given(logbookReportRepository.findAllMessagesByTripNumberBetweenDates(any(), any(), any(), any())).willReturn(
            getDummyFluxAndVisioCaptureLogbookMessages(),
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
                Species("TTV", "TORPILLE OCELLÉE"),
                Species("SMV", "STOMIAS BREVIBARBATUS"),
                Species("PNB", "CREVETTE ROYALE ROSE"),
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
            )
                .execute("FR224226850", ZonedDateTime.now().minusMinutes(5), ZonedDateTime.now(), "345")

        // Then
        assertThat(ersMessages).hasSize(3)

        assertThat(ersMessages[0].acknowledgment?.isSuccess).isTrue
        assertThat(ersMessages[1].acknowledgment?.isSuccess).isTrue
        assertThat(ersMessages[2].acknowledgment?.isSuccess).isTrue
    }

    @Test
    fun `execute Should flag messages sent by the failover software e-Sacapt`() {
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
                Species("TTV", "TORPILLE OCELLÉE"),
                Species("SMV", "STOMIAS BREVIBARBATUS"),
                Species("PNB", "CREVETTE ROYALE ROSE"),
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
            )
                .execute("FR224226850", ZonedDateTime.now().minusMinutes(5), ZonedDateTime.now(), "345")

        // Then
        assertThat(ersMessages).hasSize(6)

        assertThat(ersMessages[0].isSentByFailoverSoftware).isTrue
        assertThat(ersMessages[1].isSentByFailoverSoftware).isFalse
        assertThat(ersMessages[2].isSentByFailoverSoftware).isTrue
        assertThat(ersMessages[3].isSentByFailoverSoftware).isTrue
        assertThat(ersMessages[4].isSentByFailoverSoftware).isFalse
    }
}
