package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.defaultImpactRiskFactor
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
        cacheManager.getCache("active_vessels")?.clear()
    }

    @Test
    @Transactional
    fun `findAll Should get and parse the last positions JSONBs`() {
        // Then
        val positions = jpaLastPositionRepository.findAll()

        val position =
            positions.find {
                it.internalReferenceNumber == "FAK000999999"
            }
        assertThat(position?.gearOnboard).hasSize(1)
        assertThat(position?.gearOnboard?.first()?.dimensions).isEqualTo("45.0")
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
        assertThat(previousLastPosition.alerts).contains("Chalutage dans les 3 milles")
        assertThat(previousLastPosition.reportings).hasSize(0)
        cacheManager.getCache("vessels_all_position")?.clear()

        // When
        jpaLastPositionRepository.removeAlertToLastPositionByVesselIdentifierEquals(
            alertName = "Chalutage dans les 3 milles",
            vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
            value = "ABC000926735",
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
        assertThat(previousLastPosition.alerts).contains("Chalutage dans les 3 milles")
        assertThat(previousLastPosition.reportings).hasSize(0)
        cacheManager.getCache("vessels_all_position")?.clear()

        // When
        jpaLastPositionRepository.removeAlertToLastPositionByVesselIdentifierEquals(
            alertName = "Chalutage dans les 3 milles",
            vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
            value = "ABC000339263",
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
        assertThat(previousLastPosition.alerts).contains("FAR manquant en 24h")
        assertThat(previousLastPosition.reportings).hasSize(0)
        cacheManager.getCache("vessels_all_position")?.clear()

        // When
        jpaLastPositionRepository.removeAlertToLastPositionByVesselIdentifierEquals(
            alertName = "FAR manquant en 24h",
            vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
            value = "ABC000498845",
            isValidated = false,
        )

        // Then
        val lastPositions = jpaLastPositionRepository.findAll()
        val lastPosition = lastPositions.find { it.internalReferenceNumber == "ABC000498845" }!!
        assertThat(lastPosition.alerts).hasSize(1)
        assertThat(lastPosition.alerts).contains("FAR manquant en 24h")
        assertThat(lastPosition.reportings).hasSize(0)
    }

    @Test
    @Transactional
    fun `findLastPositionsWithProfileAndVessel Should get last positions, profiles and vessel entities`() {
        // Given

        // When
        val lastPositionsWithProfiles = jpaLastPositionRepository.findActiveVesselWithReferentialData()

        // Then
        /**
         * Only a last position without a profile
         */
        assertThat(lastPositionsWithProfiles).hasSize(3313)
        assertThat(lastPositionsWithProfiles.first().lastPosition).isNotNull()
        assertThat(lastPositionsWithProfiles.first().vesselProfile).isNull()
        assertThat(lastPositionsWithProfiles.first().vessel).isNull()

        /**
         * The OP is attached to the last position
         */
        val vesselWithProducerOrganization = lastPositionsWithProfiles.first { it.lastPosition?.vesselId == 1 }
        assertThat(vesselWithProducerOrganization.producerOrganization?.organizationName).isEqualTo("SA THO AN")

        /**
         * A vessel with risk factor is attached to a last position even if there is no profile for this vessel
         * (i.e a foreign vessel without logbook activity)
         */
        val vesselWithRiskFactorNotInProfile =
            lastPositionsWithProfiles.first {
                it.riskFactor.impactRiskFactor != defaultImpactRiskFactor &&
                    it.vesselProfile == null
            }
        assertThat(vesselWithRiskFactorNotInProfile.lastPosition?.internalReferenceNumber).isEqualTo("ABC000661639")

        /**
         * Only a profile without a last position
         */
        assertThat(lastPositionsWithProfiles.last().lastPosition).isNull()
        assertThat(lastPositionsWithProfiles.last().vesselProfile).isNotNull()
        assertThat(lastPositionsWithProfiles.last().vessel).isNotNull()
    }
}
