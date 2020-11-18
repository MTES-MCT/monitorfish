package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.exceptions.VesselNotFoundException
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.CacheManager
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.transaction.annotation.Transactional

@RunWith(SpringRunner::class)
class JpaVesselRepositoryITests : AbstractDBTests() {

    @Autowired
    private lateinit var jpaVesselRepository: JpaVesselRepository

    @Autowired
    lateinit var cacheManager: CacheManager

    @BeforeEach
    fun setup() {
        cacheManager.getCache("vessel")?.clear()
    }

    @Test
    @Transactional
    fun `findVessel Should throw a VesselNotFoundException When no vessel is found`() {
        // When
        val throwable = catchThrowable {
            jpaVesselRepository.findVessel("DUMMY")
        }

        assertThat(throwable).isInstanceOf(VesselNotFoundException::class.java)
        assertThat(throwable).hasMessageContaining("Vessel DUMMY not found")
    }

    @Test
    @Transactional
    fun `findVessel Should return a vessel`() {
        // When
        val vessel = jpaVesselRepository.findVessel("FR209143000")

        assertThat(vessel.internalReferenceNumber).isEqualTo("FR209143000")
    }
}