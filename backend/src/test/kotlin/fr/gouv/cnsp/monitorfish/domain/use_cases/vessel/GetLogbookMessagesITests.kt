package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.AbstractDBTests
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.junit.jupiter.SpringExtension
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
@Import(MapperConfiguration::class)
@SpringBootTest
class GetLogbookMessagesITests : AbstractDBTests() {
    @Autowired
    private lateinit var logbookReportRepository: LogbookReportRepository

    @Autowired
    private lateinit var speciesRepository: SpeciesRepository

    @Autowired
    private lateinit var portRepository: PortRepository

    @Autowired
    private lateinit var gearRepository: GearRepository

    @Autowired
    private lateinit var logbookRawMessageRepository: LogbookRawMessageRepository

    @Test
    @Transactional
    fun `execute Should exclude invalidated PNOs`() {
        // Given
        val internalReferenceNumber = "FAK000999999"
        val afterDepartureDate = ZonedDateTime.parse("2019-01-17T00:00:00Z")
        val beforeDepartureDate = ZonedDateTime.parse("2019-02-24T23:59:59Z")
        val tripNumber = "9463713"

        // When
        val logbookMessages =
            GetLogbookMessages(
                logbookReportRepository,
                gearRepository,
                speciesRepository,
                portRepository,
                logbookRawMessageRepository,
            )
                .execute(internalReferenceNumber, afterDepartureDate, beforeDepartureDate, tripNumber)

        // Then
        assertThat(logbookMessages).hasSize(2)
        assertThat(logbookMessages[0].messageType).isEqualTo("FAR")
        assertThat(logbookMessages[1].messageType).isEqualTo("EOF")
    }
}
