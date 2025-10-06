package fr.gouv.cnsp.monitorfish.domain.use_cases.alert

import com.nhaarman.mockitokotlin2.argThat
import com.nhaarman.mockitokotlin2.verify
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionAlertSpecificationRepository
import fr.gouv.cnsp.monitorfish.infrastructure.api.bff.TestUtils.DUMMY_POSITION_ALERT
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class AddPositionAlertSpecificationUTests {
    @MockBean
    private lateinit var positionAlertSpecificationRepository: PositionAlertSpecificationRepository

    @Test
    fun `execute Should save alert specification with user email and current timestamp`() {
        // Given
        val userEmail = "user@example.gouv.fr"
        val inputAlertSpecification =
            DUMMY_POSITION_ALERT.copy(
                createdBy = null,
                createdAtUtc = null,
            )
        val useCase = AddPositionAlertSpecification(positionAlertSpecificationRepository)

        // When
        useCase.execute(userEmail, inputAlertSpecification)

        // Then
        verify(positionAlertSpecificationRepository).save(
            argThat { alertSpec ->
                alertSpec.createdBy == userEmail &&
                    alertSpec.createdAtUtc != null &&
                    alertSpec.name == inputAlertSpecification.name &&
                    alertSpec.description == inputAlertSpecification.description &&
                    alertSpec.natinfCode == inputAlertSpecification.natinfCode &&
                    alertSpec.isActivated == inputAlertSpecification.isActivated
            },
        )
    }
}
