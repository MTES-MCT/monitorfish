package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertTypeMapping
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.CacheManager
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime

class JpaLastPositionRepositoryITests : AbstractDBTests() {

    @Autowired
    private lateinit var jpaLastPositionRepository: JpaLastPositionRepository

    @Autowired
    lateinit var cacheManager: CacheManager

    @BeforeEach
    fun setup() {
        cacheManager.getCache("vessels_positions")?.clear()
    }

    @Test
    @Transactional
    fun `findAll Should get and parse the last positions JSONBs`() {
        // Then
        val positions = jpaLastPositionRepository.findAll()

        val position = positions.find {
            it.internalReferenceNumber == "FAK000999999"
        }
        assertThat(position?.gearOnboard).hasSize(1)
        assertThat(position?.gearOnboard?.first()?.dimensions).isEqualTo(45.0)
        assertThat(position?.gearOnboard?.first()?.gear).isEqualTo("OTB")
        assertThat(position?.gearOnboard?.first()?.mesh).isEqualTo(70.0)

        assertThat(position?.speciesOnboard).hasSize(2)
        assertThat(position?.speciesOnboard?.first()?.faoZone).isEqualTo("27.8.b")
        assertThat(position?.speciesOnboard?.first()?.gear).isEqualTo("OTB")
        assertThat(position?.speciesOnboard?.first()?.species).isEqualTo("BLI")
        assertThat(position?.speciesOnboard?.first()?.weight).isEqualTo(13.46)

        assertThat(position?.lastControlDateTime).isNotNull
        assertThat(position?.lastControlInfraction).isTrue
        assertThat(position?.postControlComment).isEqualTo("Tout va bien")
        assertThat(position?.vesselIdentifier).isEqualTo(VesselIdentifier.INTERNAL_REFERENCE_NUMBER)

        assertThat(position?.impactRiskFactor).isEqualTo(2.1)
        assertThat(position?.probabilityRiskFactor).isEqualTo(2.0)
        assertThat(position?.detectabilityRiskFactor).isEqualTo(3.0)
        assertThat(position?.riskFactor).isEqualTo(2.473)
    }

    @Test
    @Transactional
    fun `findAllInLastMonth Should returns the last positions in the last month`() {
        // Then
        val positions = jpaLastPositionRepository.findAllInLastMonthOrWithBeaconMalfunction()

        assertThat(positions).hasSize(1003)
        val assertedVessel = positions.find { it.internalReferenceNumber == "ABC000339263" }
        assertThat(assertedVessel?.dateTime).isBefore(ZonedDateTime.now().minusMonths(1))
    }

    @Test
    @Transactional
    fun `findAllWithBeaconMalfunctionBeforeLast48Hours Should returns the last positions with beacon malfunctions before the last 48 hours`() {
        // Then
        val positions = jpaLastPositionRepository.findAllWithBeaconMalfunctionBeforeLast48Hours()

        assertThat(positions).hasSize(1)
        assertThat(positions.first().internalReferenceNumber).isEqualTo("ABC000939217")
        assertThat(positions.first().vesselName).isEqualTo("FRAIS AVIS MODE")
        assertThat(positions.first().beaconMalfunctionId).isEqualTo(7)
    }

    @Test
    @Transactional
    fun `findLastPositionDate Should find the last position date before now and not a date in the future`() {
        // Then
        val dateTime = jpaLastPositionRepository.findLastPositionDate()

        // Then
        assertThat(dateTime).isNotEqualTo(ZonedDateTime.parse("2106-01-15T08:13:00Z"))
    }

    @Test
    @Transactional
    fun `findLastPositionDate Should return a dummy date When there is no row in the last_position table`() {
        // Given
        jpaLastPositionRepository.deleteAll()

        // When
        val dateTime = jpaLastPositionRepository.findLastPositionDate()

        // Then
        assertThat(dateTime).isEqualTo(ZonedDateTime.parse("2012-04-17T00:00:00.000000001Z"))
    }

    @Test
    @Transactional
    fun `removeAlertToLastPositionByVesselIdentifierEquals Should update a last position row with a validated alert`() {
        // Given
        val previousLastPositions = jpaLastPositionRepository.findAll()
        val previousLastPosition = previousLastPositions.find { it.internalReferenceNumber == "ABC000926735" }!!
        assertThat(previousLastPosition.alerts).hasSize(1)
        assertThat(previousLastPosition.alerts).contains("THREE_MILES_TRAWLING_ALERT")
        assertThat(previousLastPosition.reportings).hasSize(0)
        cacheManager.getCache("vessels_all_position")?.clear()

        // When
        jpaLastPositionRepository.removeAlertToLastPositionByVesselIdentifierEquals(
            AlertTypeMapping.THREE_MILES_TRAWLING_ALERT,
            VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
            "ABC000926735",
            isValidated = true,
        )

        // Then
        val lastPositions = jpaLastPositionRepository.findAll()
        val lastPosition = lastPositions.find { it.internalReferenceNumber == "ABC000926735" }!!
        assertThat(lastPosition.alerts).hasSize(0)
        assertThat(lastPosition.reportings).hasSize(1)
        assertThat(lastPosition.reportings).contains("ALERT")
    }

    @Test
    @Transactional
    fun `removeAlertToLastPositionByVesselIdentifierEquals Should update a last position row with a silenced alert`() {
        // Given
        val previousLastPositions = jpaLastPositionRepository.findAll()
        val previousLastPosition = previousLastPositions.find { it.internalReferenceNumber == "ABC000339263" }!!
        assertThat(previousLastPosition.alerts).hasSize(1)
        assertThat(previousLastPosition.alerts).contains("THREE_MILES_TRAWLING_ALERT")
        assertThat(previousLastPosition.reportings).hasSize(0)
        cacheManager.getCache("vessels_all_position")?.clear()

        // When
        jpaLastPositionRepository.removeAlertToLastPositionByVesselIdentifierEquals(
            AlertTypeMapping.THREE_MILES_TRAWLING_ALERT,
            VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
            "ABC000339263",
            isValidated = false,
        )

        // Then
        val lastPositions = jpaLastPositionRepository.findAll()
        val lastPosition = lastPositions.find { it.internalReferenceNumber == "ABC000339263" }!!
        assertThat(lastPosition.alerts).hasSize(0)
        assertThat(lastPosition.reportings).hasSize(0)
    }

    @Test
    @Transactional
    fun `removeAlertToLastPositionByVesselIdentifierEquals Should update a last position row and only remove the first occurence of an alert`() {
        // Given
        val previousLastPositions = jpaLastPositionRepository.findAll()
        val previousLastPosition = previousLastPositions.find { it.internalReferenceNumber == "ABC000498845" }!!
        assertThat(previousLastPosition.alerts).hasSize(2)
        assertThat(previousLastPosition.alerts).contains("MISSING_FAR_ALERT")
        assertThat(previousLastPosition.reportings).hasSize(0)
        cacheManager.getCache("vessels_all_position")?.clear()

        // When
        jpaLastPositionRepository.removeAlertToLastPositionByVesselIdentifierEquals(
            AlertTypeMapping.MISSING_FAR_ALERT,
            VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
            "ABC000498845",
            isValidated = false,
        )

        // Then
        val lastPositions = jpaLastPositionRepository.findAll()
        val lastPosition = lastPositions.find { it.internalReferenceNumber == "ABC000498845" }!!
        assertThat(lastPosition.alerts).hasSize(1)
        assertThat(previousLastPosition.alerts).contains("MISSING_FAR_ALERT")
        assertThat(lastPosition.reportings).hasSize(0)
    }

    @Test
    @Transactional
    fun `findUnderCharterForVessel Should get the underCharter field of a vessel`() {
        // When
        val underCharter = jpaLastPositionRepository.findUnderCharterForVessel(
            VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
            "ABC000180832",
        )

        // Then
        assertThat(underCharter).isTrue
    }
}
