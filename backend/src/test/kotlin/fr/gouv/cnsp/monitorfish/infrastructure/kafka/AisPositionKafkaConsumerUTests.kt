package fr.gouv.cnsp.monitorfish.infrastructure.kafka

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.doThrow
import com.nhaarman.mockitokotlin2.whenever
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.SaveAisPositions
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertDoesNotThrow
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class AisPositionKafkaConsumerUTests {
    @MockitoBean
    private lateinit var saveAisPositions: SaveAisPositions

    @Test
    fun `consume Should not rethrow When saveAisPositions throws`() {
        // Given
        val consumer = AisPositionKafkaConsumer(saveAisPositions)
        val message = AisPositionMessage(mmsi = 123456789L, coord = null, ts = ZonedDateTime.parse("2025-01-01T00:00:00Z"))
        doThrow(RuntimeException("DB error")).whenever(saveAisPositions).execute(any())

        // When / Then
        assertDoesNotThrow { consumer.consume(listOf(message)) }
    }
}
