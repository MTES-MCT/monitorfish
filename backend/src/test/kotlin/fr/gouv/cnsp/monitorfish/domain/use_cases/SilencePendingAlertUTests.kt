package fr.gouv.cnsp.monitorfish.domain.use_cases

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.*
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.SilenceAlertPeriod
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.Alert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.entities.facade.Seafront.NAMO
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PendingAlertRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.SilencedAlertRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.alert.SilencePendingAlert
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mockito
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class SilencePendingAlertUTests {
    @MockBean
    private lateinit var pendingAlertRepository: PendingAlertRepository

    @MockBean
    private lateinit var silencedAlertRepository: SilencedAlertRepository

    @MockBean
    private lateinit var lastPositionRepository: LastPositionRepository

    @Test
    fun `execute Should silence a pending alert for one day`() {
        // Given
        val pendingPositionAlert =
            PendingAlert(
                internalReferenceNumber = "FRFGRGR",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                vesselId = 123,
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                tripNumber = "123456",
                creationDate = ZonedDateTime.now(),
                value =
                    Alert(
                        type = AlertType.POSITION_ALERT,
                        seaFront = NAMO.toString(),
                        alertId = 1,
                        natinfCode = 7059,
                        name = "Chalutage dans les 3 milles",
                    ),
            )
        given(pendingAlertRepository.find(any())).willReturn(pendingPositionAlert)

        // When
        SilencePendingAlert(
            pendingAlertRepository,
            silencedAlertRepository,
            lastPositionRepository,
        ).execute(666, SilenceAlertPeriod.ONE_DAY)

        // Then
        Mockito.verify(pendingAlertRepository).delete(eq(666))
        Mockito.verify(lastPositionRepository).removeAlertToLastPositionByVesselIdentifierEquals(
            alertName = "Chalutage dans les 3 milles",
            vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
            value = "FRFGRGR",
            isValidated = false,
        )
        argumentCaptor<ZonedDateTime>().apply {
            verify(silencedAlertRepository, times(1)).save(eq(pendingPositionAlert), capture(), any())

            assertThat(allValues.first().toString().split("T")[0])
                .isEqualTo(
                    ZonedDateTime
                        .now()
                        .plusDays(1)
                        .toString()
                        .split("T")[0],
                )
        }
    }

    @Test
    fun `execute Should silence a pending alert for a custom period`() {
        // Given
        val pendingPositionAlert =
            PendingAlert(
                internalReferenceNumber = "FRFGRGR",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                vesselId = 123,
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                tripNumber = "123456",
                creationDate = ZonedDateTime.now(),
                value =
                    Alert(
                        type = AlertType.POSITION_ALERT,
                        seaFront = NAMO.toString(),
                        alertId = 1,
                        natinfCode = 7059,
                        name = "Chalutage dans les 3 milles",
                    ),
            )
        given(pendingAlertRepository.find(any())).willReturn(pendingPositionAlert)

        // When
        SilencePendingAlert(
            pendingAlertRepository,
            silencedAlertRepository,
            lastPositionRepository,
        ).execute(
            666,
            SilenceAlertPeriod.CUSTOM,
            ZonedDateTime.now().plusDays(26),
        )

        // Then
        Mockito.verify(pendingAlertRepository).delete(eq(666))
        argumentCaptor<ZonedDateTime>().apply {
            verify(silencedAlertRepository, times(1)).save(eq(pendingPositionAlert), capture(), any())

            assertThat(allValues.first().toString().split("T")[0])
                .isEqualTo(
                    ZonedDateTime
                        .now()
                        .plusDays(26)
                        .toString()
                        .split("T")[0],
                )
        }
    }

    @Test
    fun `execute Should throw an exception When silencing a pending alert for a custom period Without after or before dates`() {
        // Given
        val pendingPositionAlert =
            PendingAlert(
                internalReferenceNumber = "FRFGRGR",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                vesselId = 123,
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                tripNumber = "123456",
                creationDate = ZonedDateTime.now(),
                value =
                    Alert(
                        type = AlertType.POSITION_ALERT,
                        seaFront = NAMO.toString(),
                        alertId = 1,
                        natinfCode = 7059,
                        name = "Chalutage dans les 3 milles",
                    ),
            )
        given(pendingAlertRepository.find(any())).willReturn(pendingPositionAlert)

        // When
        val throwable =
            catchThrowable {
                SilencePendingAlert(
                    pendingAlertRepository,
                    silencedAlertRepository,
                    lastPositionRepository,
                ).execute(
                    666,
                    SilenceAlertPeriod.CUSTOM,
                    null,
                )
            }

        // Then
        assertThat(throwable).isNotNull
        assertThat(throwable.message).isEqualTo(
            "end date must be not null when ignoring an operational alert with a custom period",
        )
    }

    @Test
    fun `execute Should catch a NoSuchElementException exception When an alert is not found`() {
        // Given
        given(pendingAlertRepository.find(any()))
            .willThrow(NoSuchElementException("No value present"))

        // When
        val exception =
            catchThrowable {
                SilencePendingAlert(
                    pendingAlertRepository,
                    silencedAlertRepository,
                    lastPositionRepository,
                ).execute(
                    666,
                    SilenceAlertPeriod.CUSTOM,
                    ZonedDateTime.now().plusDays(26),
                )
            }

        // Then
        assertThat(exception.message).isEqualTo("L'alerte n'est plus active")
    }
}
