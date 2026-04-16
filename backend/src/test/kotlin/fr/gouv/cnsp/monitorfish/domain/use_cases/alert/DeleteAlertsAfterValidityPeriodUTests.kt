package fr.gouv.cnsp.monitorfish.domain.use_cases.alert

import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PositionAlertSpecification
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionAlertSpecificationRepository
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mockito.never
import org.mockito.Mockito.verify
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class DeleteAlertsAfterValidityPeriodUTests {
    @MockitoBean
    private lateinit var positionAlertSpecificationRepository: PositionAlertSpecificationRepository

    private fun makeAlert(
        id: Int,
        isDeletedAfterValidityPeriod: Boolean,
        repeatEachYear: Boolean,
        validityEndDatetimeUtc: ZonedDateTime?,
    ) = PositionAlertSpecification(
        id = id,
        name = "Alert $id",
        description = "",
        isUserDefined = false,
        natinf = 0,
        threat = "",
        threatCharacterization = "",
        isDeletedAfterValidityPeriod = isDeletedAfterValidityPeriod,
        repeatEachYear = repeatEachYear,
        validityEndDatetimeUtc = validityEndDatetimeUtc,
        trackAnalysisDepth = 0.0,
        onlyFishingPositions = false,
    )

    @Test
    fun `execute Should delete alerts whose validity period has expired`() {
        // Given
        val expiredAlert =
            makeAlert(
                id = 1,
                isDeletedAfterValidityPeriod = true,
                repeatEachYear = false,
                validityEndDatetimeUtc = ZonedDateTime.now().minusDays(1),
            )
        given(positionAlertSpecificationRepository.findAllByIsDeletedIsFalse()).willReturn(listOf(expiredAlert))

        val useCase = DeleteAlertsAfterValidityPeriod(positionAlertSpecificationRepository)

        // When
        useCase.execute()

        // Then
        verify(positionAlertSpecificationRepository).delete(1)
    }

    @Test
    fun `execute Should not delete alert when isDeletedAfterValidityPeriod is false`() {
        // Given
        val alert =
            makeAlert(
                id = 2,
                isDeletedAfterValidityPeriod = false,
                repeatEachYear = false,
                validityEndDatetimeUtc = ZonedDateTime.now().minusDays(1),
            )
        given(positionAlertSpecificationRepository.findAllByIsDeletedIsFalse()).willReturn(listOf(alert))

        val useCase = DeleteAlertsAfterValidityPeriod(positionAlertSpecificationRepository)

        // When
        useCase.execute()

        // Then
        verify(positionAlertSpecificationRepository, never()).delete(2)
    }

    @Test
    fun `execute Should not delete alert when repeatEachYear is true`() {
        // Given
        val alert =
            makeAlert(
                id = 3,
                isDeletedAfterValidityPeriod = true,
                repeatEachYear = true,
                validityEndDatetimeUtc = ZonedDateTime.now().minusDays(1),
            )
        given(positionAlertSpecificationRepository.findAllByIsDeletedIsFalse()).willReturn(listOf(alert))

        val useCase = DeleteAlertsAfterValidityPeriod(positionAlertSpecificationRepository)

        // When
        useCase.execute()

        // Then
        verify(positionAlertSpecificationRepository, never()).delete(3)
    }

    @Test
    fun `execute Should not delete alert when validity end date is in the future`() {
        // Given
        val alert =
            makeAlert(
                id = 4,
                isDeletedAfterValidityPeriod = true,
                repeatEachYear = false,
                validityEndDatetimeUtc = ZonedDateTime.now().plusDays(1),
            )
        given(positionAlertSpecificationRepository.findAllByIsDeletedIsFalse()).willReturn(listOf(alert))

        val useCase = DeleteAlertsAfterValidityPeriod(positionAlertSpecificationRepository)

        // When
        useCase.execute()

        // Then
        verify(positionAlertSpecificationRepository, never()).delete(4)
    }

    @Test
    fun `execute Should not delete alert when validityEndDatetimeUtc is null`() {
        // Given
        val alert =
            makeAlert(
                id = 5,
                isDeletedAfterValidityPeriod = true,
                repeatEachYear = false,
                validityEndDatetimeUtc = null,
            )
        given(positionAlertSpecificationRepository.findAllByIsDeletedIsFalse()).willReturn(listOf(alert))

        val useCase = DeleteAlertsAfterValidityPeriod(positionAlertSpecificationRepository)

        // When
        useCase.execute()

        // Then
        verify(positionAlertSpecificationRepository, never()).delete(5)
    }

    @Test
    fun `execute Should only delete eligible alerts when multiple alerts are returned`() {
        // Given
        val expiredAlert =
            makeAlert(
                id = 10,
                isDeletedAfterValidityPeriod = true,
                repeatEachYear = false,
                validityEndDatetimeUtc = ZonedDateTime.now().minusDays(1),
            )
        val notExpiredAlert =
            makeAlert(
                id = 11,
                isDeletedAfterValidityPeriod = true,
                repeatEachYear = false,
                validityEndDatetimeUtc = ZonedDateTime.now().plusDays(1),
            )
        val repeatingAlert =
            makeAlert(
                id = 12,
                isDeletedAfterValidityPeriod = true,
                repeatEachYear = true,
                validityEndDatetimeUtc = ZonedDateTime.now().minusDays(1),
            )
        given(positionAlertSpecificationRepository.findAllByIsDeletedIsFalse())
            .willReturn(listOf(expiredAlert, notExpiredAlert, repeatingAlert))

        val useCase = DeleteAlertsAfterValidityPeriod(positionAlertSpecificationRepository)

        // When
        useCase.execute()

        // Then
        verify(positionAlertSpecificationRepository).delete(10)
        verify(positionAlertSpecificationRepository, never()).delete(11)
        verify(positionAlertSpecificationRepository, never()).delete(12)
    }
}
