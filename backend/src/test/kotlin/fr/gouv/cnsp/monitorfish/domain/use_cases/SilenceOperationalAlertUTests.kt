package fr.gouv.cnsp.monitorfish.domain.use_cases

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.*
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.SilenceAlertPeriod
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertTypeMapping
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.ThreeMilesTrawlingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
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

    @MockBean
    private lateinit var lastPositionRepository: LastPositionRepository

    @Test
    fun `execute Should silence a pending alert for one day`() {
        // Given
        val pendingAlert = PendingAlert(
            internalReferenceNumber = "FRFGRGR",
            externalReferenceNumber = "RGD",
            ircs = "6554fEE",
            vesselId = 123,
            vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
            flagState = CountryCode.FR,
            tripNumber = "123456",
            creationDate = ZonedDateTime.now(),
            value = ThreeMilesTrawlingAlert(),
        )
        given(pendingAlertRepository.find(any())).willReturn(pendingAlert)

        // When
        SilenceOperationalAlert(
            pendingAlertRepository,
            silencedAlertRepository,
            lastPositionRepository,
        ).execute(666, SilenceAlertPeriod.ONE_DAY)

        // Then
        Mockito.verify(pendingAlertRepository).delete(eq(666))
        Mockito.verify(lastPositionRepository).removeAlertToLastPositionByVesselIdentifierEquals(
            AlertTypeMapping.THREE_MILES_TRAWLING_ALERT,
            VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
            "FRFGRGR",
            false,
        )
        argumentCaptor<ZonedDateTime>().apply {
            verify(silencedAlertRepository, times(1)).save(eq(pendingAlert), capture(), any())

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
            vesselId = 123,
            vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
            flagState = CountryCode.FR,
            tripNumber = "123456",
            creationDate = ZonedDateTime.now(),
            value = ThreeMilesTrawlingAlert(),
        )
        given(pendingAlertRepository.find(any())).willReturn(pendingAlert)

        // When
        SilenceOperationalAlert(
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
            verify(silencedAlertRepository, times(1)).save(eq(pendingAlert), capture(), any())

            assertThat(allValues.first().toString().split("T")[0])
                .isEqualTo(ZonedDateTime.now().plusDays(26).toString().split("T")[0])
        }
    }

    @Test
    fun `execute Should throw an exception When silencing a pending alert for a custom period Without after or before dates`() {
        // Given
        val pendingAlert = PendingAlert(
            internalReferenceNumber = "FRFGRGR",
            externalReferenceNumber = "RGD",
            ircs = "6554fEE",
            vesselId = 123,
            vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
            flagState = CountryCode.FR,
            tripNumber = "123456",
            creationDate = ZonedDateTime.now(),
            value = ThreeMilesTrawlingAlert(),
        )
        given(pendingAlertRepository.find(any())).willReturn(pendingAlert)

        // When
        val throwable = catchThrowable {
            SilenceOperationalAlert(
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
}
