package fr.gouv.cnsp.monitorfish.domain.use_cases

import com.nhaarman.mockitokotlin2.*
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.SilenceAlertPeriod
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.ThreeMilesTrawlingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.repositories.PendingAlertRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.SilencedAlertRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.alert.SilenceOperationalAlert
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mockito
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class SilenceOperationalAlertUTests {

    @MockBean
    private lateinit var pendingAlertRepository: PendingAlertRepository

    @MockBean
    private lateinit var silencedAlertRepository: SilencedAlertRepository

    @Test
    fun `execute Should silence a pending alert for one day`() {
        // Given
        val pendingAlert = PendingAlert(
                internalReferenceNumber = "FRFGRGR",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                tripNumber = "123456",
                creationDate = ZonedDateTime.now(),
                value = ThreeMilesTrawlingAlert())
        given(pendingAlertRepository.find(any())).willReturn(pendingAlert)

        // When
        SilenceOperationalAlert(
                pendingAlertRepository,
                silencedAlertRepository).execute(666, SilenceAlertPeriod.ONE_DAY)

        // Then
        Mockito.verify(pendingAlertRepository).delete(eq(666))
        argumentCaptor<ZonedDateTime>().apply {
            verify(silencedAlertRepository, times(1)).save(eq(pendingAlert), capture(), anyOrNull())

            assertThat(allValues.first().toString().split("T")[0])
                    .isEqualTo(ZonedDateTime.now().plusDays(1).toString().split("T")[0])
        }
    }

    @Test
    fun `execute Should silence a pending alert for a custom period`() {
        // Given
        val pendingAlert = PendingAlert(
                internalReferenceNumber = "FRFGRGR",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                tripNumber = "123456",
                creationDate = ZonedDateTime.now(),
                value = ThreeMilesTrawlingAlert())
        given(pendingAlertRepository.find(any())).willReturn(pendingAlert)

        // When
        SilenceOperationalAlert(
                pendingAlertRepository,
                silencedAlertRepository).execute(
                666,
                SilenceAlertPeriod.CUSTOM,
                ZonedDateTime.now().plusDays(2),
                ZonedDateTime.now().plusDays(26))

        // Then
        Mockito.verify(pendingAlertRepository).delete(eq(666))
        argumentCaptor<ZonedDateTime>().apply {
            verify(silencedAlertRepository, times(1)).save(eq(pendingAlert), capture(), capture())

            assertThat(allValues.first().toString().split("T")[0])
                    .isEqualTo(ZonedDateTime.now().plusDays(26).toString().split("T")[0])
            assertThat(allValues.last().toString().split("T")[0])
                    .isEqualTo(ZonedDateTime.now().plusDays(2).toString().split("T")[0])
        }
    }

    @Test
    fun `execute Should throw an exception When silencing a pending alert for a custom period Without after or before dates`() {
        // Given
        val pendingAlert = PendingAlert(
                internalReferenceNumber = "FRFGRGR",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                tripNumber = "123456",
                creationDate = ZonedDateTime.now(),
                value = ThreeMilesTrawlingAlert())
        given(pendingAlertRepository.find(any())).willReturn(pendingAlert)

        // When
        val throwable = catchThrowable {
            SilenceOperationalAlert(
                    pendingAlertRepository,
                    silencedAlertRepository).execute(
                    666,
                    SilenceAlertPeriod.CUSTOM,
                    ZonedDateTime.now().plusDays(2),
                    null)
        }

        // Then
        assertThat(throwable).isNotNull
        assertThat(throwable.message).isEqualTo("end date must be not null when ignoring an operational alert with a custom period")
    }

}
