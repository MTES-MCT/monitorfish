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
    fun `execute Should return an empty list of alerts When the trim number is not found`() {
        // Given
        given(ersRepository.findLastDepartureDateAndTripNumber(any())).willReturn(LastDepartureDateAndTripNumber(ZonedDateTime.now(), null))

        // When
        val (_, alerts) = GetVesselLastVoyage(ersRepository, alertRepository, getERSMessages)
                .execute("FR224226850")

        // Then
        assertThat(alerts).hasSize(0)
    }

}
