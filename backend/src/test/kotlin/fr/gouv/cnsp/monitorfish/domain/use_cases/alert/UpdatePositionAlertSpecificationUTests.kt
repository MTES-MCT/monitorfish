package fr.gouv.cnsp.monitorfish.domain.use_cases.alert

import com.nhaarman.mockitokotlin2.given
import com.nhaarman.mockitokotlin2.verify
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PositionAlertSpecification
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionAlertSpecificationRepository
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class UpdatePositionAlertSpecificationUTests {
    @MockitoBean
    private lateinit var positionAlertSpecificationRepository: PositionAlertSpecificationRepository

    @Test
    fun `execute should update position alert specification with preserved createdBy and createdAtUtc`() {
        // Given
        val updatePositionAlertSpecification = UpdatePositionAlertSpecification(positionAlertSpecificationRepository)
        val alertId = 1
        val createdBy = "original@user.com"
        val createdAtUtc = ZonedDateTime.now().minusDays(1)

        val existingAlertSpecification =
            PositionAlertSpecification(
                id = alertId,
                name = "Original Alert",
                description = "Original description",
                isUserDefined = true,
                natinf = 123,
                threat = "Activités INN",
                threatCharacterization = "Pêche sans autorisation par navire communautaire",
                trackAnalysisDepth = 5.0,
                onlyFishingPositions = true,
                repeatEachYear = false,
                createdBy = createdBy,
                createdAtUtc = createdAtUtc,
            )

        val updatedAlertSpecification =
            PositionAlertSpecification(
                name = "Updated Alert",
                description = "Updated description",
                isUserDefined = true,
                natinf = 456,
                threat = "Activités INN",
                threatCharacterization = "Pêche sans autorisation par navire communautaire",
                trackAnalysisDepth = 10.0,
                onlyFishingPositions = false,
                repeatEachYear = true,
            )

        given(positionAlertSpecificationRepository.findById(alertId)).willReturn(existingAlertSpecification)

        // When
        updatePositionAlertSpecification.execute(alertId, updatedAlertSpecification)

        // Then
        val expectedUpdatedAlert =
            updatedAlertSpecification.copy(
                id = alertId,
                createdBy = createdBy,
                createdAtUtc = createdAtUtc,
                isInError = false,
                errorReason = null,
            )
        verify(positionAlertSpecificationRepository).save(expectedUpdatedAlert)
    }

    @Test
    fun `execute should throw exception when alert specification not found`() {
        // Given
        val updatePositionAlertSpecification = UpdatePositionAlertSpecification(positionAlertSpecificationRepository)
        val alertId = 999
        val alertSpecification =
            PositionAlertSpecification(
                name = "Updated Alert",
                description = "Updated description",
                isUserDefined = true,
                natinf = 123,
                threat = "Activités INN",
                threatCharacterization = "Pêche sans autorisation par navire communautaire",
                trackAnalysisDepth = 10.0,
                onlyFishingPositions = false,
                repeatEachYear = true,
            )

        given(positionAlertSpecificationRepository.findById(alertId)).willReturn(null)

        // When & Then
        assertThrows<IllegalArgumentException> {
            updatePositionAlertSpecification.execute(alertId, alertSpecification)
        }
    }
}
