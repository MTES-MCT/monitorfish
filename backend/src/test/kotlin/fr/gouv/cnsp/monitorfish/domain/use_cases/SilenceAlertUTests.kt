package fr.gouv.cnsp.monitorfish.domain.use_cases

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.*
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.SilencedAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertTypeMapping
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.MissingFAR48HoursAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.MissingFARAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.ThreeMilesTrawlingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.repositories.SilencedAlertRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.alert.SilenceAlert
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class SilenceAlertUTests {
    @MockBean
    private lateinit var silencedAlertRepository: SilencedAlertRepository

    @Test
    fun `execute Should silence an alert`() {
        // Given
        val now = ZonedDateTime.now()
        val alertToSilence =
            SilencedAlert(
                internalReferenceNumber = "FRFGRGR",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                vesselId = 123,
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                value = ThreeMilesTrawlingAlert(),
                silencedBeforeDate = now.plusDays(25),
            )
        given(silencedAlertRepository.save(any())).willReturn(alertToSilence)

        // When
        SilenceAlert(silencedAlertRepository).execute(alertToSilence)

        // Then
        argumentCaptor<SilencedAlert>().apply {
            verify(silencedAlertRepository, times(1)).save(capture())

            assertThat(allValues.first().internalReferenceNumber).isEqualTo("FRFGRGR")
            assertThat(allValues.first().value.type).isEqualTo(AlertTypeMapping.THREE_MILES_TRAWLING_ALERT)
            assertThat(allValues.first().value.natinfCode).isEqualTo(7059)
            assertThat(allValues.first().silencedBeforeDate).isEqualTo(now.plusDays(25))
        }
    }

    @Test
    fun `execute Should silence two alert When a MISSING_FAR_ALERT is silenced`() {
        // Given
        val now = ZonedDateTime.now()
        val alertToSilence =
            SilencedAlert(
                internalReferenceNumber = "FRFGRGR",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                vesselId = 123,
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                value = MissingFARAlert(),
                silencedBeforeDate = now.plusDays(25),
            )
        given(silencedAlertRepository.save(any())).willReturn(alertToSilence)

        // When
        SilenceAlert(silencedAlertRepository).execute(alertToSilence)

        // Then
        argumentCaptor<SilencedAlert>().apply {
            verify(silencedAlertRepository, times(2)).save(capture())

            assertThat(allValues.first().internalReferenceNumber).isEqualTo("FRFGRGR")
            assertThat(allValues.first().value.type).isEqualTo(AlertTypeMapping.MISSING_FAR_ALERT)
            assertThat(allValues.first().value.natinfCode).isEqualTo(27689)
            assertThat(allValues.first().silencedBeforeDate).isEqualTo(now.plusDays(25))

            assertThat(allValues.last().internalReferenceNumber).isEqualTo("FRFGRGR")
            assertThat(allValues.last().value.type).isEqualTo(AlertTypeMapping.MISSING_FAR_48_HOURS_ALERT)
            assertThat(allValues.last().value.natinfCode).isEqualTo(27689)
            assertThat(allValues.last().silencedBeforeDate).isEqualTo(now.plusDays(25))
        }
    }

    @Test
    fun `execute Should silence two alert When a MISSING_FAR_48_HOURS_ALERT is silenced`() {
        // Given
        val now = ZonedDateTime.now()
        val alertToSilence =
            SilencedAlert(
                internalReferenceNumber = "FRFGRGR",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                vesselId = 123,
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                value = MissingFAR48HoursAlert(),
                silencedBeforeDate = now.plusDays(25),
            )
        given(silencedAlertRepository.save(any())).willReturn(alertToSilence)

        // When
        SilenceAlert(silencedAlertRepository).execute(alertToSilence)

        // Then
        argumentCaptor<SilencedAlert>().apply {
            verify(silencedAlertRepository, times(2)).save(capture())

            assertThat(allValues.first().internalReferenceNumber).isEqualTo("FRFGRGR")
            assertThat(allValues.first().value.type).isEqualTo(AlertTypeMapping.MISSING_FAR_48_HOURS_ALERT)
            assertThat(allValues.first().value.natinfCode).isEqualTo(27689)
            assertThat(allValues.first().silencedBeforeDate).isEqualTo(now.plusDays(25))

            assertThat(allValues.last().internalReferenceNumber).isEqualTo("FRFGRGR")
            assertThat(allValues.last().value.type).isEqualTo(AlertTypeMapping.MISSING_FAR_ALERT)
            assertThat(allValues.last().value.natinfCode).isEqualTo(27689)
            assertThat(allValues.last().silencedBeforeDate).isEqualTo(now.plusDays(25))
        }
    }
}
