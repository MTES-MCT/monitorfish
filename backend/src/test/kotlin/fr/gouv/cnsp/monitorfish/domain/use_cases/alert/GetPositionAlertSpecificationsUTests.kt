package fr.gouv.cnsp.monitorfish.domain.use_cases.alert

import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.infrastructure.api.bff.TestUtils.DUMMY_POSITION_ALERT
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.JpaPositionAlertSpecificationSpecificationRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class GetPositionAlertSpecificationsUTests {
    @MockBean
    private lateinit var positionAlertSpecification: JpaPositionAlertSpecificationSpecificationRepository

    @Test
    fun `execute Should return all position and extra alerts`() {
        // Given
        given(positionAlertSpecification.findAllByIsDeletedIsFalse())
            .willReturn(listOf(DUMMY_POSITION_ALERT))

        // When
        val alerts = GetPositionAlertSpecifications(positionAlertSpecification).execute()

        // Then
        assertThat(alerts).hasSize(5)
        assertThat(alerts.last().name).isEqualTo("Suspicion de sous-déclaration")
    }
}
