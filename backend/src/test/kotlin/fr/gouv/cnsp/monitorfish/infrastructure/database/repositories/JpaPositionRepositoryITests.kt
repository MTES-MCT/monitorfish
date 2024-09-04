package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.position.Position
import fr.gouv.cnsp.monitorfish.domain.entities.position.PositionType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.CacheManager
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId
import java.time.ZonedDateTime

class JpaPositionRepositoryITests : AbstractDBTests() {
    @Autowired
    private lateinit var jpaPositionRepository: JpaPositionRepository

    @Autowired
    lateinit var cacheManager: CacheManager

    @BeforeEach
    fun setup() {
        cacheManager.getCache("vessels_positions")?.clear()
    }

    @Test
    @Transactional
    fun `save Should save the position`() {
        // Given
        val farPastFixedDateTime = ZonedDateTime.of(LocalDate.EPOCH, LocalTime.MAX.plusSeconds(1), ZoneId.of("UTC"))
        val expectedPosition =
            Position(
                null,
                internalReferenceNumber = "REF_NUMBER",
                mmsi = "224136470",
                ircs = null,
                externalReferenceNumber = null,
                vesselName = null,
                flagState = null,
                positionType = PositionType.AIS,
                isManual = false,
                isFishing = false,
                course = 16.445,
                latitude = 48.2525,
                longitude = 1.8,
                speed = 180.0,
                dateTime = farPastFixedDateTime,
            )

        // When
        jpaPositionRepository.save(expectedPosition)

        // Then
        val positions = jpaPositionRepository.findAll()

        val sameMMSIPositions =
            positions.filter {
                it.mmsi == "224136470"
            }
        assertThat(sameMMSIPositions).hasSize(1)
        assertThat(positions).hasSize(69240)
        assertThat(positions.last().dateTime.toString()).isEqualTo("1970-01-01T00:00:00.999999999Z[UTC]")
    }

    @Test
    @Transactional
    fun `findVesselLastPositionsWithoutSpecifiedIdentifier Should filter the list of positions based on the from and to parameter`() {
        // Given
        val now = ZonedDateTime.now()
        val firstPosition =
            Position(
                null,
                internalReferenceNumber = "FR224226850",
                mmsi = "224226850",
                ircs = null,
                externalReferenceNumber = null,
                vesselName = null,
                flagState = null,
                positionType = PositionType.AIS,
                isManual = false,
                isFishing = false,
                course = 16.445,
                latitude = 48.2525,
                longitude = 1.8,
                speed = 180.0,
                dateTime =
                    now.minusHours(
                        4,
                    ),
            )
        val secondPosition =
            Position(
                null,
                internalReferenceNumber = "FR224226850",
                mmsi = "224226850",
                ircs = null,
                externalReferenceNumber = null,
                vesselName = null,
                flagState = null,
                positionType = PositionType.AIS,
                isManual = false,
                isFishing = false,
                course = 16.445,
                latitude = 48.2525,
                longitude = 1.8,
                speed = 180.0,
                dateTime =
                    now.minusHours(
                        3,
                    ),
            )
        val thirdPosition =
            Position(
                null,
                internalReferenceNumber = "FR224226850",
                mmsi = "224226850",
                ircs = null,
                externalReferenceNumber = null,
                vesselName = null,
                flagState = null,
                positionType = PositionType.AIS,
                isManual = false,
                isFishing = false,
                course = 16.445,
                latitude = 48.2525,
                longitude = 1.8,
                speed = 180.0,
                dateTime =
                    now.minusHours(
                        2,
                    ),
            )
        val fourthPosition =
            Position(
                null,
                internalReferenceNumber = "FR224226850",
                mmsi = "224226850",
                ircs = null,
                externalReferenceNumber = null,
                vesselName = null,
                flagState = null,
                positionType = PositionType.AIS,
                isManual = false,
                isFishing = false,
                course = 16.445,
                latitude = 48.2525,
                longitude = 1.8,
                speed = 180.0,
                dateTime =
                    now.minusMinutes(
                        1,
                    ),
            )

        // When
        jpaPositionRepository.save(firstPosition)
        jpaPositionRepository.save(secondPosition)
        jpaPositionRepository.save(thirdPosition)
        jpaPositionRepository.save(fourthPosition)
        val lastPositions =
            jpaPositionRepository.findVesselLastPositionsWithoutSpecifiedIdentifier(
                "FR224226850",
                "",
                "",
                ZonedDateTime.now().minusHours(2).minusMinutes(10),
                ZonedDateTime.now(),
            )

        // Then
        // For this vessel, we inserted
        assertThat(lastPositions).hasSize(2)
    }

    @Test
    @Transactional
    fun `findVesselLastPositionsWithoutSpecifiedIdentifier Should return the list of last positions for a given vessel When the CFR is not empty`() {
        // Given
        val now = ZonedDateTime.now()
        val firstPosition =
            Position(
                null,
                internalReferenceNumber = "FR224226850",
                mmsi = "224226850",
                ircs = null,
                externalReferenceNumber = null,
                vesselName = null,
                flagState = null,
                positionType = PositionType.AIS,
                isManual = false,
                isFishing = false,
                course = 16.445,
                latitude = 48.2525,
                longitude = 1.8,
                speed = 180.0,
                dateTime =
                    now.minusHours(
                        4,
                    ),
            )
        val secondPosition =
            Position(
                null,
                internalReferenceNumber = "FR224226850",
                mmsi = "224226850",
                ircs = null,
                externalReferenceNumber = null,
                vesselName = null,
                flagState = null,
                positionType = PositionType.AIS,
                isManual = false,
                isFishing = false,
                course = 16.445,
                latitude = 48.2525,
                longitude = 1.8,
                speed = 180.0,
                dateTime =
                    now.minusHours(
                        3,
                    ),
            )
        val thirdPosition =
            Position(
                null,
                internalReferenceNumber = "FR224226850",
                mmsi = "224226850",
                ircs = null,
                externalReferenceNumber = null,
                vesselName = null,
                flagState = null,
                positionType = PositionType.AIS,
                isManual = false,
                isFishing = false,
                course = 16.445,
                latitude = 48.2525,
                longitude = 1.8,
                speed = 180.0,
                dateTime =
                    now.minusHours(
                        2,
                    ),
            )
        val fourthPosition =
            Position(
                null,
                internalReferenceNumber = "FR224226850",
                mmsi = "224226850",
                ircs = null,
                externalReferenceNumber = null,
                vesselName = null,
                flagState = null,
                positionType = PositionType.AIS,
                isManual = false,
                isFishing = false,
                course = 16.445,
                latitude = 48.2525,
                longitude = 1.8,
                speed = 180.0,
                dateTime =
                    now.minusHours(
                        1,
                    ),
            )

        // When
        jpaPositionRepository.save(firstPosition)
        jpaPositionRepository.save(secondPosition)
        jpaPositionRepository.save(thirdPosition)
        jpaPositionRepository.save(fourthPosition)
        val lastPositions =
            jpaPositionRepository.findVesselLastPositionsWithoutSpecifiedIdentifier(
                "FR224226850",
                "",
                "",
                ZonedDateTime.now().minusHours(6),
                ZonedDateTime.now(),
            )

        // Then
        // For this vessel, we inserted
        assertThat(lastPositions).hasSize(4)
    }

    @Test
    @Transactional
    fun `findVesselLastPositionsWithoutSpecifiedIdentifier Should return the list of last positions for a given vessel When the external marking is not empty`() {
        // Given
        val now = ZonedDateTime.now()
        val firstPosition =
            Position(
                null,
                internalReferenceNumber = "FR224226850",
                mmsi = "224226850",
                ircs = null,
                externalReferenceNumber = "NOT_NULL",
                vesselName = null,
                flagState = null,
                positionType = PositionType.AIS,
                isManual = false,
                isFishing = false,
                course = 16.445,
                latitude = 48.2525,
                longitude = 1.8,
                speed = 180.0,
                dateTime =
                    now.minusHours(
                        4,
                    ),
            )
        val secondPosition =
            Position(
                null,
                internalReferenceNumber = "FR224226850",
                mmsi = "224226850",
                ircs = null,
                externalReferenceNumber = "NOT_NULL",
                vesselName = null,
                flagState = null,
                positionType = PositionType.AIS,
                isManual = false,
                isFishing = false,
                course = 16.445,
                latitude = 48.2525,
                longitude = 1.8,
                speed = 180.0,
                dateTime =
                    now.minusHours(
                        3,
                    ),
            )
        val thirdPosition =
            Position(
                null,
                internalReferenceNumber = "FR224226850",
                mmsi = "224226850",
                ircs = null,
                externalReferenceNumber = "NOT_NULL",
                vesselName = null,
                flagState = null,
                positionType = PositionType.AIS,
                isManual = false,
                isFishing = false,
                course = 16.445,
                latitude = 48.2525,
                longitude = 1.8,
                speed = 180.0,
                dateTime =
                    now.minusHours(
                        2,
                    ),
            )
        val fourthPosition =
            Position(
                null,
                internalReferenceNumber = "FR224226850",
                mmsi = "224226850",
                ircs = null,
                externalReferenceNumber = "NOT_NULL",
                vesselName = null,
                flagState = null,
                positionType = PositionType.AIS,
                isManual = false,
                isFishing = false,
                course = 16.445,
                latitude = 48.2525,
                longitude = 1.8,
                speed = 180.0,
                dateTime =
                    now.minusHours(
                        1,
                    ),
            )

        // When
        jpaPositionRepository.save(firstPosition)
        jpaPositionRepository.save(secondPosition)
        jpaPositionRepository.save(thirdPosition)
        jpaPositionRepository.save(fourthPosition)
        val lastPositions =
            jpaPositionRepository.findVesselLastPositionsWithoutSpecifiedIdentifier(
                "",
                "NOT_NULL",
                "",
                ZonedDateTime.now().minusHours(6),
                ZonedDateTime.now(),
            )

        // Then
        assertThat(lastPositions).hasSize(4)
    }

    @Test
    @Transactional
    fun `findVesselLastPositionsWithoutSpecifiedIdentifier Should return the list of last positions for a given vessel When the IRCS is not empty`() {
        // Given
        val now = ZonedDateTime.now()
        val firstPosition =
            Position(
                null,
                internalReferenceNumber = "FR224226850",
                mmsi = "224226850",
                ircs = "NOT_NULL",
                externalReferenceNumber = "",
                vesselName = null,
                flagState = null,
                positionType = PositionType.AIS,
                isManual = false,
                isFishing = false,
                course = 16.445,
                latitude = 48.2525,
                longitude = 1.8,
                speed = 180.0,
                dateTime =
                    now.minusHours(
                        4,
                    ),
            )
        val secondPosition =
            Position(
                null,
                internalReferenceNumber = "FR224226850",
                mmsi = "224226850",
                ircs = "NOT_NULL",
                externalReferenceNumber = "",
                vesselName = null,
                flagState = null,
                positionType = PositionType.AIS,
                isManual = false,
                isFishing = false,
                course = 16.445,
                latitude = 48.2525,
                longitude = 1.8,
                speed = 180.0,
                dateTime =
                    now.minusHours(
                        3,
                    ),
            )
        val thirdPosition =
            Position(
                null,
                internalReferenceNumber = "FR224226850",
                mmsi = "224226850",
                ircs = "NOT_NULL",
                externalReferenceNumber = "",
                vesselName = null,
                flagState = null,
                positionType = PositionType.AIS,
                isManual = false,
                isFishing = false,
                course = 16.445,
                latitude = 48.2525,
                longitude = 1.8,
                speed = 180.0,
                dateTime =
                    now.minusHours(
                        2,
                    ),
            )
        val fourthPosition =
            Position(
                null,
                internalReferenceNumber = "FR224226850",
                mmsi = "224226850",
                ircs = "NOT_NULL",
                externalReferenceNumber = "",
                vesselName = null,
                flagState = null,
                positionType = PositionType.AIS,
                isManual = false,
                isFishing = false,
                course = 16.445,
                latitude = 48.2525,
                longitude = 1.8,
                speed = 180.0,
                dateTime =
                    now.minusHours(
                        1,
                    ),
            )

        // When
        jpaPositionRepository.save(firstPosition)
        jpaPositionRepository.save(secondPosition)
        jpaPositionRepository.save(thirdPosition)
        jpaPositionRepository.save(fourthPosition)
        val lastPositions =
            jpaPositionRepository.findVesselLastPositionsWithoutSpecifiedIdentifier(
                "",
                "",
                "NOT_NULL",
                ZonedDateTime.now().minusHours(6),
                ZonedDateTime.now(),
            )

        // Then
        assertThat(lastPositions).hasSize(4)
    }

    @Test
    @Transactional
    fun `findLastPositionDate Should find the last position date before now and not a date in the future`() {
        // Then
        val dateTime = jpaPositionRepository.findLastPositionDate()

        // Then
        assertThat(dateTime).isNotEqualTo(ZonedDateTime.parse("2100-12-21T15:01Z"))
    }
}
