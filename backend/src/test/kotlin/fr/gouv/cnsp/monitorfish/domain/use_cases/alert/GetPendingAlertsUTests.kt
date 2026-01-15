package fr.gouv.cnsp.monitorfish.domain.use_cases.alert

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.Alert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.entities.facade.Seafront.NAMO
import fr.gouv.cnsp.monitorfish.domain.entities.infraction.Infraction
import fr.gouv.cnsp.monitorfish.domain.entities.infraction.InfractionCategory
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.repositories.InfractionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PendingAlertRepository
import fr.gouv.cnsp.monitorfish.infrastructure.api.bff.TestUtils.DUMMY_POSITION_ALERT
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.mockito.Mockito
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetPendingAlertsUTests {
    @MockitoBean
    private lateinit var pendingAlertRepository: PendingAlertRepository

    @MockitoBean
    private lateinit var infractionRepository: InfractionRepository

    @MockitoBean
    private lateinit var getPositionAlertSpecifications: GetPositionAlertSpecifications

    @Test
    fun `execute Should return alerts with associated infractions`() {
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
                        threat = "Obligations déclaratives",
                        threatCharacterization = "DEP",
                        name = "Chalutage dans les 3 milles",
                    ),
            )
        given(infractionRepository.findInfractionByNatinfCode(eq(7059))).willReturn(
            Infraction(
                natinfCode = 7059,
                infractionCategory = InfractionCategory.FISHING,
            ),
        )
        given(pendingAlertRepository.findAlertsOfTypes(any())).willReturn(listOf(pendingPositionAlert))
        given(getPositionAlertSpecifications.execute()).willReturn(
            listOf(DUMMY_POSITION_ALERT) +
                AlertType.entries
                    .filter { it.name !== AlertType.POSITION_ALERT.name }
                    .mapNotNull { it.specification?.copy(type = it.name) },
        )

        // When
        val alerts =
            GetPendingAlerts(
                getPositionAlertSpecifications = getPositionAlertSpecifications,
                pendingAlertRepository = pendingAlertRepository,
                infractionRepository = infractionRepository,
            ).execute()

        // Then
        val alert = alerts.first().first
        val alertSpecification = alerts.first().second
        assertThat(alert.value.natinfCode).isEqualTo(7059)
        assertThat(alert.infraction?.natinfCode).isEqualTo(7059)
        assertThat(alert.infraction?.infractionCategory).isEqualTo(InfractionCategory.FISHING)
        assertThat(alertSpecification.name).isEqualTo("Chalutage dans les 3 milles")

        Mockito.verify(pendingAlertRepository).findAlertsOfTypes(
            listOf(
                AlertType.POSITION_ALERT,
                AlertType.MISSING_DEP_ALERT,
                AlertType.MISSING_FAR_48_HOURS_ALERT,
                AlertType.SUSPICION_OF_UNDER_DECLARATION_ALERT,
            ),
        )
        Mockito.verify(infractionRepository, Mockito.times(1)).findInfractionByNatinfCode(eq(7059))
    }
}
