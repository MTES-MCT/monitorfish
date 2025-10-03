package fr.gouv.cnsp.monitorfish.domain.use_cases.alert

import fr.gouv.cnsp.monitorfish.domain.repositories.PositionAlertSpecificationRepository
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mockito.verify
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class ActivateOrDeactivateAlertSpecificationUTests {
    @MockBean
    private lateinit var positionAlertSpecificationRepository: PositionAlertSpecificationRepository

    @Test
    fun `execute Should call activate on repository when isActivated is true`() {
        // Given
        val alertId = 123
        val useCase = ActivateOrDeactivateAlertSpecification(positionAlertSpecificationRepository)

        // When
        useCase.execute(alertId, true)

        // Then
        verify(positionAlertSpecificationRepository).activate(alertId)
    }

    @Test
    fun `execute Should call deactivate on repository when isActivated is false`() {
        // Given
        val alertId = 456
        val useCase = ActivateOrDeactivateAlertSpecification(positionAlertSpecificationRepository)

        // When
        useCase.execute(alertId, false)

        // Then
        verify(positionAlertSpecificationRepository).deactivate(alertId)
    }
}
