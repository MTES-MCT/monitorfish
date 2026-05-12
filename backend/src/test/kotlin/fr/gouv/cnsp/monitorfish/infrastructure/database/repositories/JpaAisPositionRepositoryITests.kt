package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.ais_position.AisPosition
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.AisPositionPK
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBAisPositionRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime

class JpaAisPositionRepositoryITests : AbstractDBTests() {
    @Autowired
    private lateinit var jpaAisPositionRepository: JpaAisPositionRepository

    @Autowired
    private lateinit var dbAisPositionRepository: DBAisPositionRepository

    @Test
    @Transactional
    fun `saveAll Should persist AIS positions to the database`() {
        // Given
        val dateTime = ZonedDateTime.parse("2025-01-01T00:00:00Z")
        val positions =
            listOf(
                AisPosition(
                    mmsi = 123456789L,
                    dateTime = dateTime,
                    latitude = 47.6078,
                    longitude = -2.7335,
                    speed = 10.5,
                    course = 12.12,
                    status = "Under way using engine",
                    imo = "IMO1234567",
                    ircs = "ABCD",
                    vesselName = "TEST VESSEL",
                    shipType = 70,
                    destination = "FRBST",
                ),
            )

        // When
        jpaAisPositionRepository.saveAll(positions)

        // Then
        val saved = dbAisPositionRepository.findByIdOrNull(AisPositionPK(mmsi = 123456789L, dateTime = dateTime))
        assertThat(saved).isNotNull()
        assertThat(saved!!.pk.mmsi).isEqualTo(123456789L)
        assertThat(saved.latitude).isEqualTo(47.6078)
        assertThat(saved.longitude).isEqualTo(-2.7335)
        assertThat(saved.speed).isEqualTo(10.5)
        assertThat(saved.course).isEqualTo(12.12)
        assertThat(saved.status).isEqualTo("Under way using engine")
        assertThat(saved.imo).isEqualTo("IMO1234567")
        assertThat(saved.vesselName).isEqualTo("TEST VESSEL")
        assertThat(saved.destination).isEqualTo("FRBST")
    }
}
