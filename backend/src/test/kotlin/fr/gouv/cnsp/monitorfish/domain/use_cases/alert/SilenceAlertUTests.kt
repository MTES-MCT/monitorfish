package fr.gouv.cnsp.monitorfish.domain.use_cases.alert

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.*
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.SilencedAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.Alert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.entities.facade.Seafront.NAMO
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.repositories.SilencedAlertRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class SilenceAlertUTests {
    @MockitoBean
    private lateinit var silencedAlertRepository: SilencedAlertRepository

    @Test
    fun `execute Should silence an alert`() {
        // Given
        val now = ZonedDateTime.now()
        val positionAlertToSilence =
            SilencedAlert(
                internalReferenceNumber = "FRFGRGR",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                vesselId = 123,
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                value =
                    Alert(
                        type = AlertType.POSITION_ALERT,
                        seaFront = NAMO.toString(),
                        alertId = 1,
                        natinfCode = 7059,
                        name = "Chalutage dans les 3 milles",
                    ),
                silencedBeforeDate = now.plusDays(25),
            )
        given(silencedAlertRepository.save(any())).willReturn(positionAlertToSilence)

        // When
        SilenceAlert(silencedAlertRepository).execute(positionAlertToSilence)

        // Then
        argumentCaptor<SilencedAlert>().apply {
            verify(silencedAlertRepository, times(1)).save(capture())

            assertThat(allValues.first().internalReferenceNumber).isEqualTo("FRFGRGR")
            assertThat(allValues.first().value.type).isEqualTo(AlertType.POSITION_ALERT)
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
                value = AlertType.MISSING_FAR_ALERT.getValue(),
                silencedBeforeDate = now.plusDays(25),
            )
        given(silencedAlertRepository.save(any())).willReturn(alertToSilence)

        // When
        SilenceAlert(silencedAlertRepository).execute(alertToSilence)

        // Then
        argumentCaptor<SilencedAlert>().apply {
            verify(silencedAlertRepository, times(2)).save(capture())

            assertThat(allValues.first().internalReferenceNumber).isEqualTo("FRFGRGR")
            assertThat(allValues.first().value.type).isEqualTo(AlertType.MISSING_FAR_ALERT)
            assertThat(allValues.first().value.natinfCode).isEqualTo(27689)
            assertThat(allValues.first().silencedBeforeDate).isEqualTo(now.plusDays(25))

            assertThat(allValues.last().internalReferenceNumber).isEqualTo("FRFGRGR")
            assertThat(allValues.last().value.type).isEqualTo(AlertType.MISSING_FAR_48_HOURS_ALERT)
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
                value = AlertType.MISSING_FAR_48_HOURS_ALERT.getValue(),
                silencedBeforeDate = now.plusDays(25),
            )
        given(silencedAlertRepository.save(any())).willReturn(alertToSilence)

        // When
        SilenceAlert(silencedAlertRepository).execute(alertToSilence)

        // Then
        argumentCaptor<SilencedAlert>().apply {
            verify(silencedAlertRepository, times(2)).save(capture())

            assertThat(allValues.first().internalReferenceNumber).isEqualTo("FRFGRGR")
            assertThat(allValues.first().value.type).isEqualTo(AlertType.MISSING_FAR_48_HOURS_ALERT)
            assertThat(allValues.first().value.natinfCode).isEqualTo(27689)
            assertThat(allValues.first().silencedBeforeDate).isEqualTo(now.plusDays(25))

            assertThat(allValues.last().internalReferenceNumber).isEqualTo("FRFGRGR")
            assertThat(allValues.last().value.type).isEqualTo(AlertType.MISSING_FAR_ALERT)
            assertThat(allValues.last().value.natinfCode).isEqualTo(27689)
            assertThat(allValues.last().silencedBeforeDate).isEqualTo(now.plusDays(25))
        }
    }
}
