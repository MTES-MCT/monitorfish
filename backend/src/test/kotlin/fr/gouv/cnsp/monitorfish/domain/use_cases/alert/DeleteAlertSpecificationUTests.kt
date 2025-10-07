package fr.gouv.cnsp.monitorfish.domain.use_cases.alert

import fr.gouv.cnsp.monitorfish.domain.repositories.PositionAlertSpecificationRepository
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mockito.verify
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class DeleteAlertSpecificationUTests {
    @MockitoBean
    private lateinit var positionAlertSpecificationRepository: PositionAlertSpecificationRepository

    @Test
    fun `execute Should call delete on repository`() {
        // Given
        val alertId = 123
        val useCase = DeleteAlertSpecification(positionAlertSpecificationRepository)

        // When
        useCase.execute(alertId)

        // Then
        verify(positionAlertSpecificationRepository).delete(alertId)
    }
}
