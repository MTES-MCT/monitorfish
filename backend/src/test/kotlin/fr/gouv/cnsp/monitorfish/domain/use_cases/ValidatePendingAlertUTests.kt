package fr.gouv.cnsp.monitorfish.domain.use_cases

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.Alert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.entities.facade.Seafront.NAMO
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PendingAlertRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.SilencedAlertRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.alert.ValidatePendingAlert
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mockito
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class ValidatePendingAlertUTests {
    @MockBean
    private lateinit var pendingAlertRepository: PendingAlertRepository

    @MockBean
    private lateinit var reportingRepository: ReportingRepository

    @MockBean
    private lateinit var silencedAlertRepository: SilencedAlertRepository

    @MockBean
    private lateinit var lastPositionRepository: LastPositionRepository

    @Test
    fun `execute Should validate a pending alert`() {
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
                latitude = 12.123,
                longitude = -5.5698,
            )
        given(pendingAlertRepository.find(any())).willReturn(pendingPositionAlert)

        // When
        ValidatePendingAlert(
            pendingAlertRepository,
            reportingRepository,
            silencedAlertRepository,
            lastPositionRepository,
        ).execute(666)

        // Then
        Mockito.verify(silencedAlertRepository).save(eq(pendingPositionAlert), any(), any())
        Mockito.verify(pendingAlertRepository).delete(eq(666))
        Mockito.verify(reportingRepository).save(eq(pendingPositionAlert), any())
        Mockito.verify(lastPositionRepository).removeAlertToLastPositionByVesselIdentifierEquals(
            alertName = "Chalutage dans les 3 milles",
            vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
            value = "FRFGRGR",
            isValidated = true,
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
                ValidatePendingAlert(
                    pendingAlertRepository,
                    reportingRepository,
                    silencedAlertRepository,
                    lastPositionRepository,
                ).execute(
                    666,
                )
            }

        // Then
        assertThat(exception.message).isEqualTo("L'alerte n'est plus active")
    }
}
