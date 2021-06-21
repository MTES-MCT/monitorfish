package fr.gouv.cnsp.monitorfish.domain.use_cases

import com.nhaarman.mockitokotlin2.any
import fr.gouv.cnsp.monitorfish.domain.entities.LastDepartureDateAndTripNumber
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetVesselLastVoyageUTests {

    @MockBean
    private lateinit var ersRepository: ERSRepository

    @MockBean
    private lateinit var alertRepository: AlertRepository

    @MockBean
    private lateinit var getERSMessages: GetERSMessages

    @Test
    fun `execute Should return an empty list of alerts When the trip number is not found`() {
        // Given
        val expectedBeforeDateTime = ZonedDateTime.parse("2021-06-21T10:24:46.021615+02:00")
        given(ersRepository.findLastDepartureDateAndTripNumber(any(), any())).willReturn(LastDepartureDateAndTripNumber(expectedBeforeDateTime, null))

        // When
        val voyage = GetVesselLastVoyage(ersRepository, alertRepository, getERSMessages)
                .execute("FR224226850", null)

        val (_, alerts) = voyage.ersMessagesAndAlerts

        // Then
        assertThat(voyage.isLastVoyage).isTrue
        assertThat(voyage.previousBeforeDateTime).isEqualTo(expectedBeforeDateTime)
        assertThat(voyage.nextBeforeDateTime).isNull()
        assertThat(voyage.isLastVoyage).isTrue
        assertThat(alerts).hasSize(0)
    }

}
