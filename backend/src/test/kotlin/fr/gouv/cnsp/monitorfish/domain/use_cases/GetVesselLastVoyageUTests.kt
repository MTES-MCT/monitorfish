package fr.gouv.cnsp.monitorfish.domain.use_cases

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import fr.gouv.cnsp.monitorfish.domain.entities.Gear
import fr.gouv.cnsp.monitorfish.domain.entities.wrappers.LastDepartureDateAndTripNumber
import fr.gouv.cnsp.monitorfish.domain.entities.Port
import fr.gouv.cnsp.monitorfish.domain.entities.Species
import fr.gouv.cnsp.monitorfish.domain.entities.ers.ERSOperationType
import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.DEP
import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.Acknowledge
import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.FAR
import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.TestUtils.getCorrectedDummyERSMessage
import fr.gouv.cnsp.monitorfish.domain.use_cases.TestUtils.getDummyERSMessage
import fr.gouv.cnsp.monitorfish.domain.use_cases.TestUtils.getRETDummyERSMessage
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetVesselLastVoyageUTests {

    @MockBean
    private lateinit var ersRepository: ERSRepository

    @MockBean
    private lateinit var speciesRepository: SpeciesRepository

    @MockBean
    private lateinit var portRepository: PortRepository

    @MockBean
    private lateinit var gearRepository: GearRepository

    @MockBean
    private lateinit var alertRepository: AlertRepository

    @MockBean
    private lateinit var ersMessageRepository: ERSMessageRepository

    @Test
    fun `execute Should return an ordered list of last ERS messages with the codes' names`() {
        // Given
        given(ersRepository.findLastDepartureDateAndTripNumber(any(), any(), any())).willReturn(LastDepartureDateAndTripNumber(ZonedDateTime.now(), 123))
        given(ersRepository.findAllMessagesAfterDepartureDate(any(), any(), any(), any())).willReturn(getDummyERSMessage())
        given(speciesRepository.find(eq("TTV"))).willReturn(Species("TTV", "TORPILLE OCELLÉE"))
        given(speciesRepository.find(eq("SMV"))).willReturn(Species("SMV", "STOMIAS BREVIBARBATUS"))
        given(speciesRepository.find(eq("PNB"))).willReturn(Species("PNB", "CREVETTE ROYALE ROSE"))
        given(gearRepository.find(eq("OTB"))).willReturn(Gear("OTB", "Chaluts de fond à panneaux"))
        given(gearRepository.find(eq("DRB"))).willReturn(Gear("DRB", "Dragues remorquées par bateau"))
        given(portRepository.find(eq("AEFAT"))).willReturn(Port("AEFAT", "Al Jazeera Port"))
        given(portRepository.find(eq("AEJAZ"))).willReturn(Port("AEJAZ", "Arzanah Island"))
        given(ersMessageRepository.findRawMessage(any())).willReturn("<xml>DUMMY XML MESSAGE</xml>")

        // When
        val (ersMessages, _) = GetVesselLastVoyage(ersRepository, gearRepository, speciesRepository, portRepository, alertRepository, ersMessageRepository)
                .execute("FR224226850", "", "")

        // Then
        assertThat(ersMessages).hasSize(3)

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
        assertThat(far.catches.first().species).isEqualTo("SMV")
        assertThat(far.catches.first().speciesName).isEqualTo("STOMIAS BREVIBARBATUS")
        assertThat(far.catches.last().species).isEqualTo("PNB")
        assertThat(far.catches.last().speciesName).isEqualTo("CREVETTE ROYALE ROSE")
        assertThat(far.gearName).isEqualTo("Chaluts de fond à panneaux")

        assertThat(ersMessages[2].message).isInstanceOf(PNO::class.java)
        assertThat(ersMessages[2].rawMessage).isEqualTo("<xml>DUMMY XML MESSAGE</xml>")
        val pno = ersMessages[2].message as PNO
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
    fun `execute Should return an empty list of alerts When the trim number is not found`() {
        // Given
        given(ersRepository.findLastDepartureDateAndTripNumber(any(), any(), any())).willReturn(LastDepartureDateAndTripNumber(ZonedDateTime.now(), null))
        given(ersRepository.findAllMessagesAfterDepartureDate(any(), any(), any(), any())).willReturn(getDummyERSMessage())
        given(speciesRepository.find(eq("TTV"))).willReturn(Species("TTV", "TORPILLE OCELLÉE"))
        given(speciesRepository.find(eq("SMV"))).willReturn(Species("SMV", "STOMIAS BREVIBARBATUS"))
        given(speciesRepository.find(eq("PNB"))).willReturn(Species("PNB", "CREVETTE ROYALE ROSE"))
        given(gearRepository.find(eq("OTB"))).willReturn(Gear("OTB", "Chaluts de fond à panneaux"))
        given(gearRepository.find(eq("DRB"))).willReturn(Gear("DRB", "Dragues remorquées par bateau"))
        given(portRepository.find(eq("AEFAT"))).willReturn(Port("AEFAT", "Al Jazeera Port"))
        given(portRepository.find(eq("AEJAZ"))).willReturn(Port("AEJAZ", "Arzanah Island"))
        given(ersMessageRepository.findRawMessage(any())).willReturn("<xml>DUMMY XML MESSAGE</xml>")

        // When
        val (_, alerts) = GetVesselLastVoyage(ersRepository, gearRepository, speciesRepository, portRepository, alertRepository, ersMessageRepository)
                .execute("FR224226850", "", "")

        // Then
        assertThat(alerts).hasSize(0)
    }

    @Test
    fun `execute Should flag a corrected message as true`() {
        // Given
        given(ersRepository.findLastDepartureDateAndTripNumber(any(), any(), any())).willReturn(LastDepartureDateAndTripNumber(ZonedDateTime.now(), 123))
        given(ersRepository.findAllMessagesAfterDepartureDate(any(), any(), any(), any())).willReturn(getCorrectedDummyERSMessage())
        given(speciesRepository.find(eq("TTV"))).willReturn(Species("TTV", "TORPILLE OCELLÉE"))
        given(speciesRepository.find(eq("SMV"))).willReturn(Species("SMV", "STOMIAS BREVIBARBATUS"))
        given(speciesRepository.find(eq("PNB"))).willReturn(Species("PNB", "CREVETTE ROYALE ROSE"))
        given(gearRepository.find(eq("OTB"))).willReturn(Gear("OTB", "Chaluts de fond à panneaux"))
        given(gearRepository.find(eq("DRB"))).willReturn(Gear("DRB", "Dragues remorquées par bateau"))
        given(portRepository.find(eq("AEFAT"))).willReturn(Port("AEFAT", "Al Jazeera Port"))
        given(portRepository.find(eq("AEJAZ"))).willReturn(Port("AEJAZ", "Arzanah Island"))
        given(ersMessageRepository.findRawMessage(any())).willReturn("<xml>DUMMY XML MESSAGE</xml>")

        // When
        val (ersMessages, _) = GetVesselLastVoyage(ersRepository, gearRepository, speciesRepository, portRepository, alertRepository, ersMessageRepository)
                .execute("FR224226850", "", "")

        // Then
        assertThat(ersMessages).hasSize(2)

        assertThat(ersMessages[0].message).isInstanceOf(FAR::class.java)
        assertThat(ersMessages[0].operationType).isEqualTo(ERSOperationType.DAT)
        assertThat(ersMessages[0].isCorrected).isEqualTo(true)
        val correctedFar = ersMessages[0].message as FAR
        assertThat(correctedFar.catches).hasSize(2)

        assertThat(ersMessages[1].message).isInstanceOf(FAR::class.java)
        assertThat(ersMessages[1].operationType).isEqualTo(ERSOperationType.COR)
        assertThat(ersMessages[1].isCorrected).isEqualTo(false)
        val far = ersMessages[1].message as FAR
        assertThat(far.catches).hasSize(3)
    }

    @Test
    fun `execute Should filter to return only DAT and COR messages and add the acknowledge property`() {
        // Given
        given(ersRepository.findLastDepartureDateAndTripNumber(any(), any(), any())).willReturn(LastDepartureDateAndTripNumber(ZonedDateTime.now(), 123))
        given(ersRepository.findAllMessagesAfterDepartureDate(any(), any(), any(), any())).willReturn(getRETDummyERSMessage())
        given(speciesRepository.find(eq("TTV"))).willReturn(Species("TTV", "TORPILLE OCELLÉE"))
        given(speciesRepository.find(eq("SMV"))).willReturn(Species("SMV", "STOMIAS BREVIBARBATUS"))
        given(speciesRepository.find(eq("PNB"))).willReturn(Species("PNB", "CREVETTE ROYALE ROSE"))
        given(gearRepository.find(eq("OTB"))).willReturn(Gear("OTB", "Chaluts de fond à panneaux"))
        given(gearRepository.find(eq("DRB"))).willReturn(Gear("DRB", "Dragues remorquées par bateau"))
        given(portRepository.find(eq("AEFAT"))).willReturn(Port("AEFAT", "Al Jazeera Port"))
        given(portRepository.find(eq("AEJAZ"))).willReturn(Port("AEJAZ", "Arzanah Island"))
        given(ersMessageRepository.findRawMessage(any())).willReturn("<xml>DUMMY XML MESSAGE</xml>")

        // When
        val (ersMessages, _) = GetVesselLastVoyage(ersRepository, gearRepository, speciesRepository, portRepository, alertRepository, ersMessageRepository)
                .execute("FR224226850", "", "")

        // Then
        assertThat(ersMessages).hasSize(2)

        assertThat(ersMessages[0].message).isInstanceOf(FAR::class.java)
        assertThat(ersMessages[0].acknowledge).isInstanceOf(Acknowledge::class.java)
        assertThat(ersMessages[0].operationType).isEqualTo(ERSOperationType.DAT)
        assertThat(ersMessages[0].isCorrected).isEqualTo(false)
        val ack = ersMessages[0].acknowledge as Acknowledge
        assertThat(ack.rejectionCause).isEqualTo("Oops")
        assertThat(ack.returnStatus).isEqualTo("002")
        assertThat(ack.isSuccess).isFalse
        val correctedFar = ersMessages[0].message as FAR
        assertThat(correctedFar.catches).hasSize(2)

        assertThat(ersMessages[1].message).isInstanceOf(FAR::class.java)
        assertThat(ersMessages[1].operationType).isEqualTo(ERSOperationType.DAT)
        assertThat(ersMessages[1].isCorrected).isEqualTo(false)
        val ackTwo = ersMessages[1].acknowledge as Acknowledge
        assertThat(ackTwo.rejectionCause).isNull()
        assertThat(ackTwo.returnStatus).isEqualTo("000")
        assertThat(ackTwo.isSuccess).isTrue
        val far = ersMessages[1].message as FAR
        assertThat(far.catches).hasSize(3)
    }
}
