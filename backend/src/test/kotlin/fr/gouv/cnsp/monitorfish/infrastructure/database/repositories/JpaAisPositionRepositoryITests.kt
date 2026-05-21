package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.ais_position.AisPosition
import fr.gouv.cnsp.monitorfish.domain.entities.position.PositionType
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

    @Test
    @Transactional
    fun `findVesselLastAisPositionsByCfr Should return positions within the time range`() {
        // Given
        val now = ZonedDateTime.now()
        jpaAisPositionRepository.saveAll(
            listOf(
                AisPosition(
                    mmsi = 111000001L,
                    dateTime = now.minusHours(2),
                    latitude = 47.0,
                    longitude = -3.0,
                    cfr = "FR111000001",
                ),
                AisPosition(
                    mmsi = 111000001L,
                    dateTime = now.minusHours(1),
                    latitude = 47.1,
                    longitude = -3.1,
                    cfr = "FR111000001",
                ),
            ),
        )

        // When
        val result = jpaAisPositionRepository.findVesselLastAisPositionsByCfr("FR111000001", now.minusHours(3), now)

        // Then
        assertThat(result).hasSize(2)
        assertThat(result).allSatisfy { position ->
            assertThat(position.internalReferenceNumber).isEqualTo("FR111000001")
            assertThat(position.positionType).isEqualTo(PositionType.AIS)
            assertThat(position.latitude).isBetween(-90.0, 90.0)
            assertThat(position.longitude).isBetween(-180.0, 180.0)
        }
    }

    @Test
    @Transactional
    fun `findVesselLastAisPositionsByCfr Should not return positions outside the time range`() {
        // Given
        val now = ZonedDateTime.now()
        jpaAisPositionRepository.saveAll(
            listOf(
                AisPosition(
                    mmsi = 111000002L,
                    dateTime = now.minusHours(5),
                    latitude = 47.0,
                    longitude = -3.0,
                    cfr = "FR111000002",
                ),
            ),
        )

        // When
        val result = jpaAisPositionRepository.findVesselLastAisPositionsByCfr("FR111000002", now.minusHours(3), now)

        // Then
        assertThat(result).isEmpty()
    }

    @Test
    @Transactional
    fun `findVesselLastAisPositionsByCfr Should return empty list when no positions match`() {
        // When
        val result =
            jpaAisPositionRepository.findVesselLastAisPositionsByCfr(
                "UNKNOWNCFR",
                ZonedDateTime.now().minusHours(1),
                ZonedDateTime.now(),
            )

        // Then
        assertThat(result).isEmpty()
    }

    @Test
    @Transactional
    fun `findVesselLastAisPositionsByIrcs Should return positions within the time range`() {
        // Given
        val now = ZonedDateTime.now()
        jpaAisPositionRepository.saveAll(
            listOf(
                AisPosition(
                    mmsi = 222000001L,
                    dateTime = now.minusHours(2),
                    latitude = 48.0,
                    longitude = -4.0,
                    ircs = "TIRCS1",
                ),
                AisPosition(
                    mmsi = 222000001L,
                    dateTime = now.minusHours(1),
                    latitude = 48.1,
                    longitude = -4.1,
                    ircs = "TIRCS1",
                ),
            ),
        )

        // When
        val result = jpaAisPositionRepository.findVesselLastAisPositionsByIrcs("TIRCS1", now.minusHours(3), now)

        // Then
        assertThat(result).hasSize(2)
        assertThat(result).allSatisfy { position ->
            assertThat(position.ircs).isEqualTo("TIRCS1")
            assertThat(position.positionType).isEqualTo(PositionType.AIS)
            assertThat(position.latitude).isBetween(-90.0, 90.0)
            assertThat(position.longitude).isBetween(-180.0, 180.0)
        }
    }

    @Test
    @Transactional
    fun `findVesselLastAisPositionsByIrcs Should not return positions outside the time range`() {
        // Given
        val now = ZonedDateTime.now()
        jpaAisPositionRepository.saveAll(
            listOf(
                AisPosition(
                    mmsi = 222000002L,
                    dateTime = now.minusHours(5),
                    latitude = 48.0,
                    longitude = -4.0,
                    ircs = "TIRCS2",
                ),
            ),
        )

        // When
        val result = jpaAisPositionRepository.findVesselLastAisPositionsByIrcs("TIRCS2", now.minusHours(3), now)

        // Then
        assertThat(result).isEmpty()
    }

    @Test
    @Transactional
    fun `findVesselLastAisPositionsByIrcs Should return empty list when no positions match`() {
        // When
        val result =
            jpaAisPositionRepository.findVesselLastAisPositionsByIrcs(
                "UNKNOWNIRCS",
                ZonedDateTime.now().minusHours(1),
                ZonedDateTime.now(),
            )

        // Then
        assertThat(result).isEmpty()
    }

    @Test
    @Transactional
    fun `findVesselLastAisPositionsByExternalImmatriculation Should return positions within the time range`() {
        // Given
        val now = ZonedDateTime.now()
        jpaAisPositionRepository.saveAll(
            listOf(
                AisPosition(
                    mmsi = 333000001L,
                    dateTime = now.minusHours(2),
                    latitude = 46.0,
                    longitude = -2.0,
                    externalImmatriculation = "TEXTEXT1",
                ),
                AisPosition(
                    mmsi = 333000001L,
                    dateTime = now.minusHours(1),
                    latitude = 46.1,
                    longitude = -2.1,
                    externalImmatriculation = "TEXTEXT1",
                ),
            ),
        )

        // When
        val result =
            jpaAisPositionRepository.findVesselLastAisPositionsByExternalImmatriculation(
                "TEXTEXT1",
                now.minusHours(3),
                now,
            )

        // Then
        assertThat(result).hasSize(2)
        assertThat(result).allSatisfy { position ->
            assertThat(position.externalReferenceNumber).isEqualTo("TEXTEXT1")
            assertThat(position.positionType).isEqualTo(PositionType.AIS)
            assertThat(position.latitude).isBetween(-90.0, 90.0)
            assertThat(position.longitude).isBetween(-180.0, 180.0)
        }
    }

    @Test
    @Transactional
    fun `findVesselLastAisPositionsByExternalImmatriculation Should not return positions outside the time range`() {
        // Given
        val now = ZonedDateTime.now()
        jpaAisPositionRepository.saveAll(
            listOf(
                AisPosition(
                    mmsi = 333000002L,
                    dateTime = now.minusHours(5),
                    latitude = 46.0,
                    longitude = -2.0,
                    externalImmatriculation = "TEXTEXT2",
                ),
            ),
        )

        // When
        val result =
            jpaAisPositionRepository.findVesselLastAisPositionsByExternalImmatriculation(
                "TEXTEXT2",
                now.minusHours(3),
                now,
            )

        // Then
        assertThat(result).isEmpty()
    }

    @Test
    @Transactional
    fun `findVesselLastAisPositionsByExternalImmatriculation Should return empty list when no positions match`() {
        // When
        val result =
            jpaAisPositionRepository.findVesselLastAisPositionsByExternalImmatriculation(
                "UNKNOWNEXT",
                ZonedDateTime.now().minusHours(1),
                ZonedDateTime.now(),
            )

        // Then
        assertThat(result).isEmpty()
    }

    @Test
    @Transactional
    fun `findVesselLastAisPositionsByMmsi Should return positions within the time range`() {
        // Given
        val now = ZonedDateTime.now()
        jpaAisPositionRepository.saveAll(
            listOf(
                AisPosition(mmsi = 444000001L, dateTime = now.minusHours(2), latitude = 45.0, longitude = -1.0),
                AisPosition(mmsi = 444000001L, dateTime = now.minusHours(1), latitude = 45.1, longitude = -1.1),
            ),
        )

        // When
        val result = jpaAisPositionRepository.findVesselLastAisPositionsByMmsi(444000001L, now.minusHours(3), now)

        // Then
        assertThat(result).hasSize(2)
        assertThat(result).allSatisfy { position ->
            assertThat(position.mmsi).isEqualTo("444000001")
            assertThat(position.positionType).isEqualTo(PositionType.AIS)
            assertThat(position.latitude).isBetween(-90.0, 90.0)
            assertThat(position.longitude).isBetween(-180.0, 180.0)
        }
    }

    @Test
    @Transactional
    fun `findVesselLastAisPositionsByMmsi Should not return positions outside the time range`() {
        // Given
        val now = ZonedDateTime.now()
        jpaAisPositionRepository.saveAll(
            listOf(
                AisPosition(mmsi = 444000002L, dateTime = now.minusHours(5), latitude = 45.0, longitude = -1.0),
            ),
        )

        // When
        val result = jpaAisPositionRepository.findVesselLastAisPositionsByMmsi(444000002L, now.minusHours(3), now)

        // Then
        assertThat(result).isEmpty()
    }

    @Test
    @Transactional
    fun `findVesselLastAisPositionsByMmsi Should return empty list when no positions match`() {
        // When
        val result =
            jpaAisPositionRepository.findVesselLastAisPositionsByMmsi(
                999999999L,
                ZonedDateTime.now().minusHours(1),
                ZonedDateTime.now(),
            )

        // Then
        assertThat(result).isEmpty()
    }
}
