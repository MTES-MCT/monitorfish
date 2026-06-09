package fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessagePurpose
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookOperationType
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookTransmissionFormat
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.VoyageDatesAndTripNumber
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.DEP
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.LogbookMessageValue
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.Completion
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionActionType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.logbook.GetLogbookMessages
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.mockito.Mockito.never
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.bean.override.mockito.MockitoBean
import java.time.ZonedDateTime

@SpringBootTest(classes = [EnrichPublicMissionAction::class])
class EnrichPublicMissionActionUTests {
    @Autowired
    private lateinit var enrichPublicMissionAction: EnrichPublicMissionAction

    @MockitoBean
    private lateinit var vesselRepository: VesselRepository

    @MockitoBean
    private lateinit var logbookReportRepository: LogbookReportRepository

    @MockitoBean
    private lateinit var getLogbookMessages: GetLogbookMessages

    private val cfr = "FRA000123456"

    private val mockAction =
        MissionAction(
            id = 1,
            vesselId = 42,
            internalReferenceNumber = cfr,
            missionId = 1,
            actionDatetimeUtc = ZonedDateTime.parse("2021-06-15T10:00:00Z"),
            actionType = MissionActionType.SEA_CONTROL,
            isDeleted = false,
            hasSomeGearsSeized = false,
            hasSomeSpeciesSeized = false,
            isFromPoseidon = false,
            flagState = CountryCode.FR,
            userTrigram = "LTH",
            completion = Completion.TO_COMPLETE,
        )

    private fun logbookMessage(
        messageType: String,
        value: LogbookMessageValue,
        reportId: String,
        isDeleted: Boolean = false,
        isCorrectedByNewerMessage: Boolean = false,
    ) = LogbookMessage(
        id = 1L,
        reportId = reportId,
        operationNumber = reportId,
        operationDateTime = ZonedDateTime.parse("2021-06-10T08:00:00Z"),
        integrationDateTime = ZonedDateTime.parse("2021-06-10T08:00:00Z"),
        transmissionFormat = LogbookTransmissionFormat.ERS,
        operationType = LogbookOperationType.DAT,
        reportDateTime = ZonedDateTime.parse("2021-06-10T08:00:00Z"),
        messageType = messageType,
        message = value,
        isDeleted = isDeleted,
        isCorrectedByNewerMessage = isCorrectedByNewerMessage,
    )

    @Test
    fun `execute should enrich with vessel and current-trip JPE data`() {
        // Given
        `when`(vesselRepository.findVesselById(42)).thenReturn(
            Vessel(
                id = 42,
                flagState = CountryCode.FR,
                hasLogbookEsacapt = false,
                length = 24.0,
                vesselType = "Chalutier",
                imo = "1234567",
            ),
        )

        // Two trips: the control date (2021-06-15) falls in the second trip's window.
        val previousTrip =
            VoyageDatesAndTripNumber(
                tripNumber = "20210001",
                firstOperationDateTime = ZonedDateTime.parse("2021-05-01T00:00:00Z"),
                lastOperationDateTime = ZonedDateTime.parse("2021-05-20T00:00:00Z"),
                startDateTime = ZonedDateTime.parse("2021-05-01T00:00:00Z"),
                endDateTime = ZonedDateTime.parse("2021-05-20T00:00:00Z"),
            )
        val currentTrip =
            VoyageDatesAndTripNumber(
                tripNumber = "20210002",
                firstOperationDateTime = ZonedDateTime.parse("2021-06-10T00:00:00Z"),
                lastOperationDateTime = ZonedDateTime.parse("2021-06-25T00:00:00Z"),
                startDateTime = ZonedDateTime.parse("2021-06-10T00:00:00Z"),
                endDateTime = ZonedDateTime.parse("2021-06-25T00:00:00Z"),
            )
        `when`(logbookReportRepository.findAllTrips(cfr)).thenReturn(listOf(previousTrip, currentTrip))

        val dep =
            DEP().apply {
                departurePort = "FRLEH"
                departurePortName = "Le Havre"
                departureDateTime = ZonedDateTime.parse("2021-06-10T08:00:00Z")
            }
        val pno =
            PNO().apply {
                purpose = LogbookMessagePurpose.LAN
            }
        `when`(
            getLogbookMessages.execute(
                eq(cfr),
                eq(currentTrip.firstOperationDateTime),
                eq(currentTrip.lastOperationDateTime),
                eq(currentTrip.tripNumber),
            ),
        ).thenReturn(
            listOf(
                logbookMessage("DEP", dep, reportId = "DEP_1"),
                logbookMessage("PNO", pno, reportId = "PNO_1"),
            ),
        )

        // When
        val result = enrichPublicMissionAction.execute(mockAction)

        // Then
        assertThat(result.vessel?.length).isEqualTo(24.0)
        assertThat(result.vessel?.vesselType).isEqualTo("Chalutier")
        assertThat(result.vessel?.imo).isEqualTo("1234567")
        assertThat(result.tripNumber).isEqualTo("20210002")
        assertThat(result.pnoReportId).isEqualTo("PNO_1")
        assertThat(result.pnoPurpose).isEqualTo(LogbookMessagePurpose.LAN)
        assertThat(result.lastDeparturePortLocode).isEqualTo("FRLEH")
        assertThat(result.lastDeparturePortName).isEqualTo("Le Havre")
        assertThat(result.lastDepartureDateTime).isEqualTo(ZonedDateTime.parse("2021-06-10T08:00:00Z"))
    }

    @Test
    fun `execute should ignore deleted and corrected DEP and PNO messages`() {
        // Given
        `when`(vesselRepository.findVesselById(42)).thenReturn(null)
        val trip =
            VoyageDatesAndTripNumber(
                tripNumber = "20210002",
                firstOperationDateTime = ZonedDateTime.parse("2021-06-10T00:00:00Z"),
                lastOperationDateTime = ZonedDateTime.parse("2021-06-25T00:00:00Z"),
                startDateTime = ZonedDateTime.parse("2021-06-10T00:00:00Z"),
                endDateTime = ZonedDateTime.parse("2021-06-25T00:00:00Z"),
            )
        `when`(logbookReportRepository.findAllTrips(cfr)).thenReturn(listOf(trip))

        val deletedDep = DEP().apply { departurePort = "DELETED" }
        val correctedPno = PNO().apply { purpose = LogbookMessagePurpose.RES }
        `when`(getLogbookMessages.execute(any(), any(), any(), any())).thenReturn(
            listOf(
                logbookMessage("DEP", deletedDep, reportId = "DEP_1", isDeleted = true),
                logbookMessage("PNO", correctedPno, reportId = "PNO_1", isCorrectedByNewerMessage = true),
            ),
        )

        // When
        val result = enrichPublicMissionAction.execute(mockAction)

        // Then
        assertThat(result.lastDeparturePortLocode).isNull()
        assertThat(result.pnoReportId).isNull()
        assertThat(result.pnoPurpose).isNull()
    }

    @Test
    fun `execute should return only base action when there is no vesselId nor CFR`() {
        // Given
        val action = mockAction.copy(vesselId = null, internalReferenceNumber = null)

        // When
        val result = enrichPublicMissionAction.execute(action)

        // Then
        assertThat(result.vessel).isNull()
        assertThat(result.tripNumber).isNull()
        verify(vesselRepository, never()).findVesselById(any())
        verify(logbookReportRepository, never()).findAllTrips(any())
    }
}
