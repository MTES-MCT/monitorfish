package fr.gouv.cnsp.monitorfish.domain.use_cases

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertTypeMapping
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.ThreeMilesTrawlingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PendingAlertRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.SilencedAlertRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.alert.ValidateOperationalAlert
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mockito
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class ValidateOperationalAlertUTests {

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
        val pendingAlert = PendingAlert(
            internalReferenceNumber = "FRFGRGR",
            externalReferenceNumber = "RGD",
            ircs = "6554fEE",
            vesselId = 123,
            vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
            tripNumber = "123456",
            creationDate = ZonedDateTime.now(),
            value = ThreeMilesTrawlingAlert(),
            latitude = 12.123,
            longitude = -5.5698
        )
        given(pendingAlertRepository.find(any())).willReturn(pendingAlert)

        // When
        ValidateOperationalAlert(
            pendingAlertRepository,
            reportingRepository,
            silencedAlertRepository,
            lastPositionRepository
        ).execute(666)

        // Then
        Mockito.verify(silencedAlertRepository).save(eq(pendingAlert), any(), any())
        Mockito.verify(pendingAlertRepository).delete(eq(666))
        Mockito.verify(reportingRepository).save(eq(pendingAlert), any())
        Mockito.verify(lastPositionRepository).removeAlertToLastPositionByVesselIdentifierEquals(
            AlertTypeMapping.THREE_MILES_TRAWLING_ALERT,
            VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
            "FRFGRGR",
            true
        )
    }
}
