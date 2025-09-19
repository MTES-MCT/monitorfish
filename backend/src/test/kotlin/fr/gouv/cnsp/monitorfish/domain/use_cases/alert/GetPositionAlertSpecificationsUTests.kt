package fr.gouv.cnsp.monitorfish.domain.use_cases.alert

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.infrastructure.api.bff.TestUtils.DUMMY_POSITION_ALERT
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.JpaPositionAlertSpecificationSpecificationRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.JpaVesselRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class GetPositionAlertSpecificationsUTests {
    @MockBean
    private lateinit var positionAlertSpecification: JpaPositionAlertSpecificationSpecificationRepository

    @MockBean
    private lateinit var vesselRepository: JpaVesselRepository

    @Test
    fun `execute Should return all position and extra alerts`() {
        // Given
        given(positionAlertSpecification.findAllByIsDeletedIsFalse())
            .willReturn(listOf(DUMMY_POSITION_ALERT, DUMMY_POSITION_ALERT.copy(vesselIds = listOf(5, 6))))
        given(vesselRepository.findVesselsByIds(eq(listOf(1, 2, 3, 5, 6))))
            .willReturn(listOf(
                Vessel(id = 1, flagState = CountryCode.FR, hasLogbookEsacapt = false),
                Vessel(id = 2, flagState = CountryCode.FR, hasLogbookEsacapt = false),
                Vessel(id = 3, flagState = CountryCode.FR, hasLogbookEsacapt = false),
                Vessel(id = 5, flagState = CountryCode.FR, hasLogbookEsacapt = false),
                Vessel(id = 6, flagState = CountryCode.FR, hasLogbookEsacapt = false),
            ))

        // When
        val alerts = GetPositionAlertSpecifications(positionAlertSpecification, vesselRepository).execute()

        // Then
        assertThat(alerts).hasSize(6)
        assertThat(alerts.last().name).isEqualTo("Suspicion de sous-déclaration")

        val positionAlert = alerts.first { it.type == AlertType.POSITION_ALERT.name }
        assertThat(positionAlert.vessels).hasSize(3)
        assertThat(positionAlert.vessels.map { it.id }).isEqualTo(listOf(1, 2, 3))

        val lastPositionAlert = alerts.last { it.type == AlertType.POSITION_ALERT.name }
        assertThat(lastPositionAlert.vessels).hasSize(2)
        assertThat(lastPositionAlert.vessels.map { it.id }).isEqualTo(listOf(5, 6))
    }
}
