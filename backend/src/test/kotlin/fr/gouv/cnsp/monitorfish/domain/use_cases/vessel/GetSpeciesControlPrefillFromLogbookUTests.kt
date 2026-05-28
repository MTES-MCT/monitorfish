package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import com.nhaarman.mockitokotlin2.any
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.Haul
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookFishingCatch
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookOperationType
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookTransmissionFormat
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.VoyageDatesAndTripNumber
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.DIS
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.FAR
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.DiscardReason
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetSpeciesControlPrefillFromLogbookUTests {
    @MockitoBean
    private lateinit var logbookReportRepository: LogbookReportRepository

    @MockitoBean
    private lateinit var getLogbookMessages: GetLogbookMessages

    private val cfr = "FR224226850"
    private val trip =
        VoyageDatesAndTripNumber(
            tripNumber = "trip1",
            firstOperationDateTime = ZonedDateTime.parse("2021-08-21T10:00:00+00:00"),
            lastOperationDateTime = ZonedDateTime.parse("2021-08-22T10:00:00+00:00"),
            startDateTime = ZonedDateTime.parse("2021-08-21T06:00:00+00:00"),
            endDateTime = ZonedDateTime.parse("2021-08-22T18:00:00+00:00"),
        )

    private fun makeLogbookMessage(
        messageType: String,
        message: fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.LogbookMessageValue,
    ) = LogbookMessage(
        id = 1,
        operationNumber = "ON#1",
        tripNumber = trip.tripNumber,
        flagState = "FRA",
        operationType = LogbookOperationType.DAT,
        messageType = messageType,
        message = message,
        transmissionFormat = LogbookTransmissionFormat.ERS,
        integrationDateTime = ZonedDateTime.now(),
        isEnriched = false,
        operationDateTime = ZonedDateTime.now(),
        reportDateTime = ZonedDateTime.now(),
    )

    private fun makeFarMessage(catches: List<LogbookFishingCatch>): LogbookMessage {
        val haul = Haul().also { it.catches = catches }
        val far = FAR().also { it.hauls = listOf(haul) }
        return makeLogbookMessage("FAR", far)
    }

    private fun makeDisMessage(catches: List<LogbookFishingCatch>): LogbookMessage {
        val dis = DIS().also { it.catches = catches }
        return makeLogbookMessage("DIS", dis)
    }

    @Test
    fun `execute Should return empty list When vessel has no trips`() {
        given(logbookReportRepository.findAllTrips(any())).willReturn(emptyList())

        val result = GetSpeciesControlPrefillFromLogbook(logbookReportRepository, getLogbookMessages).execute(cfr)

        assertThat(result).isEmpty()
    }

    @Test
    fun `execute Should return faoZones and presentationCode from FAR catches`() {
        given(logbookReportRepository.findAllTrips(any())).willReturn(listOf(trip))
        val catch =
            LogbookFishingCatch().also {
                it.species = "HKE"
                it.faoZone = "27.8.a"
                it.presentation = "GUT"
                it.weight = 500.0
            }
        given(getLogbookMessages.execute(any(), any(), any(), any())).willReturn(listOf(makeFarMessage(listOf(catch))))

        val result = GetSpeciesControlPrefillFromLogbook(logbookReportRepository, getLogbookMessages).execute(cfr)

        assertThat(result).hasSize(1)
        val species = result.first()
        assertThat(species.speciesCode).isEqualTo("HKE")
        assertThat(species.faoZones).containsExactly("27.8.a")
        assertThat(species.presentationCode).isEqualTo("GUT")
        assertThat(species.rejectedWeight).isNull()
        assertThat(species.discardReason).isNull()
    }

    @Test
    fun `execute Should collect distinct faoZones across multiple FAR hauls`() {
        given(logbookReportRepository.findAllTrips(any())).willReturn(listOf(trip))
        val catchA =
            LogbookFishingCatch().also {
                it.species = "HKE"
                it.faoZone = "27.8.a"
                it.weight = 200.0
            }
        val catchB =
            LogbookFishingCatch().also {
                it.species = "HKE"
                it.faoZone = "27.8.b"
                it.weight = 300.0
            }
        val catchC =
            LogbookFishingCatch().also {
                it.species = "HKE"
                it.faoZone = "27.8.a"
                it.weight = 100.0
            }

        val haul1 = Haul().also { it.catches = listOf(catchA, catchB) }
        val haul2 = Haul().also { it.catches = listOf(catchC) }
        val far = FAR().also { it.hauls = listOf(haul1, haul2) }
        given(getLogbookMessages.execute(any(), any(), any(), any()))
            .willReturn(listOf(makeLogbookMessage("FAR", far)))

        val result = GetSpeciesControlPrefillFromLogbook(logbookReportRepository, getLogbookMessages).execute(cfr)

        assertThat(result).hasSize(1)
        assertThat(result.first().faoZones).containsExactlyInAnyOrder("27.8.a", "27.8.b")
    }

    @Test
    fun `execute Should return rejectedWeight and discardReason DIS from DIS catches`() {
        given(logbookReportRepository.findAllTrips(any())).willReturn(listOf(trip))
        val catchA =
            LogbookFishingCatch().also {
                it.species = "HKE"
                it.weight = 50.0
            }
        val catchB =
            LogbookFishingCatch().also {
                it.species = "HKE"
                it.weight = 30.0
            }
        given(getLogbookMessages.execute(any(), any(), any(), any()))
            .willReturn(listOf(makeDisMessage(listOf(catchA, catchB))))

        val result = GetSpeciesControlPrefillFromLogbook(logbookReportRepository, getLogbookMessages).execute(cfr)

        assertThat(result).hasSize(1)
        val species = result.first()
        assertThat(species.speciesCode).isEqualTo("HKE")
        assertThat(species.rejectedWeight).isEqualTo(80.0)
        assertThat(species.discardReason).isEqualTo(DiscardReason.DIS)
        assertThat(species.faoZones).isNull()
        assertThat(species.presentationCode).isNull()
    }

    @Test
    fun `execute Should set discardReason to DIM When at least one DIS catch has presentation DIM`() {
        given(logbookReportRepository.findAllTrips(any())).willReturn(listOf(trip))
        val catchDim =
            LogbookFishingCatch().also {
                it.species = "HKE"
                it.weight = 20.0
                it.presentation = "DIM"
            }
        val catchOther =
            LogbookFishingCatch().also {
                it.species = "HKE"
                it.weight = 10.0
            }
        given(getLogbookMessages.execute(any(), any(), any(), any()))
            .willReturn(listOf(makeDisMessage(listOf(catchDim, catchOther))))

        val result = GetSpeciesControlPrefillFromLogbook(logbookReportRepository, getLogbookMessages).execute(cfr)

        assertThat(result.first().discardReason).isEqualTo(DiscardReason.DIM)
        assertThat(result.first().rejectedWeight).isEqualTo(30.0)
    }

    @Test
    fun `execute Should merge FAR and DIS data for same species`() {
        given(logbookReportRepository.findAllTrips(any())).willReturn(listOf(trip))
        val farCatch =
            LogbookFishingCatch().also {
                it.species = "HKE"
                it.faoZone = "27.8.a"
                it.presentation = "GUT"
                it.weight = 500.0
            }
        val disCatch =
            LogbookFishingCatch().also {
                it.species = "HKE"
                it.weight = 50.0
            }
        given(getLogbookMessages.execute(any(), any(), any(), any()))
            .willReturn(listOf(makeFarMessage(listOf(farCatch)), makeDisMessage(listOf(disCatch))))

        val result = GetSpeciesControlPrefillFromLogbook(logbookReportRepository, getLogbookMessages).execute(cfr)

        assertThat(result).hasSize(1)
        val species = result.first()
        assertThat(species.speciesCode).isEqualTo("HKE")
        assertThat(species.faoZones).containsExactly("27.8.a")
        assertThat(species.presentationCode).isEqualTo("GUT")
        assertThat(species.rejectedWeight).isEqualTo(50.0)
        assertThat(species.discardReason).isEqualTo(DiscardReason.DIS)
    }

    @Test
    fun `execute Should include species from FAR only and DIS only in the result`() {
        given(logbookReportRepository.findAllTrips(any())).willReturn(listOf(trip))
        val farCatch =
            LogbookFishingCatch().also {
                it.species = "COD"
                it.faoZone = "27.4"
                it.weight = 200.0
            }
        val disCatch =
            LogbookFishingCatch().also {
                it.species = "HKE"
                it.weight = 30.0
            }
        given(getLogbookMessages.execute(any(), any(), any(), any()))
            .willReturn(listOf(makeFarMessage(listOf(farCatch)), makeDisMessage(listOf(disCatch))))

        val result = GetSpeciesControlPrefillFromLogbook(logbookReportRepository, getLogbookMessages).execute(cfr)

        assertThat(result).hasSize(2)
        val cod = result.first { it.speciesCode == "COD" }
        assertThat(cod.faoZones).containsExactly("27.4")
        assertThat(cod.rejectedWeight).isNull()
        val hke = result.first { it.speciesCode == "HKE" }
        assertThat(hke.rejectedWeight).isEqualTo(30.0)
        assertThat(hke.faoZones).isNull()
    }

    @Test
    fun `execute Should not use DIM presentation as presentationCode for FAR catches`() {
        given(logbookReportRepository.findAllTrips(any())).willReturn(listOf(trip))
        val catch =
            LogbookFishingCatch().also {
                it.species = "HKE"
                it.presentation = "DIM"
                it.weight = 100.0
            }
        given(getLogbookMessages.execute(any(), any(), any(), any())).willReturn(listOf(makeFarMessage(listOf(catch))))

        val result = GetSpeciesControlPrefillFromLogbook(logbookReportRepository, getLogbookMessages).execute(cfr)

        assertThat(result.first().presentationCode).isNull()
    }
}
