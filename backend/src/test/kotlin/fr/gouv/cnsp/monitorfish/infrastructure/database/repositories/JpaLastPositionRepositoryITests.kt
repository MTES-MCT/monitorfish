package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.VesselIdentifier
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.CacheManager
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.transaction.annotation.Transactional

@RunWith(SpringRunner::class)
class JpaLastPositionRepositoryITests : AbstractDBTests() {

    @Autowired
    private lateinit var jpaLastPositionRepository: JpaLastPositionRepository

    @Autowired
    lateinit var cacheManager: CacheManager

    @BeforeEach
    fun setup() {
        cacheManager.getCache("vessels_position")?.clear()
    }

    @Test
    @Transactional
    fun `Should get and parse the last positions JSONBs`() {
        // Then
        val positions = jpaLastPositionRepository.findAll()

        val position = positions.find {
            it.internalReferenceNumber == "GBR000B14430"
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
        assertThat(position?.vesselIdentifier).isEqualTo(VesselIdentifier.INTERNAL_REFERENCE_NUMBER.toString())
    }

}