package fr.gouv.cnsp.monitorfish.domain.use_cases

import com.nhaarman.mockitokotlin2.any
import fr.gouv.cnsp.monitorfish.domain.entities.VoyageDatesAndTripNumber
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetVesselVoyageUTests {

    @MockBean
    private lateinit var ersRepository: ERSRepository

    @MockBean
    private lateinit var alertRepository: AlertRepository

    @MockBean
    private lateinit var getERSMessages: GetERSMessages

    @Test
    fun `execute Should return a voyage that isLastTrip When dateTime is null`() {
        // Given
        val endDate = ZonedDateTime.parse("2021-06-21T10:24:46.021615+02:00")
        val startDate = ZonedDateTime.parse("2021-05-21T10:24:46.021615+02:00")
        val tripNumber = 123456789
        given(ersRepository.findLastTripBefore(any(), any())).willReturn(VoyageDatesAndTripNumber(tripNumber, startDate, endDate))

        // When
        val voyage = GetVesselVoyage(ersRepository, alertRepository, getERSMessages)
                .execute("FR224226850", "lastTripBefore", null)

        val (_, alerts) = voyage.ersMessagesAndAlerts

        // Then
        assertThat(voyage.isLastVoyage).isTrue
        assertThat(voyage.startDate).isEqualTo(startDate)
        assertThat(voyage.endDate).isEqualTo(endDate)
        assertThat(alerts).hasSize(0)
    }

}
