package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.neovisionaries.i18n.CountryCode
import org.assertj.core.api.Assertions.assertThat
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
    fun `findVessel Should return an empty Vessel object When no vessel is found`() {
        // When
        val vessel = jpaVesselRepository.findVessel("DUMMY", "", "")

        assertThat(vessel.internalReferenceNumber).isNull()
        assertThat(vessel.externalReferenceNumber).isNull()
        assertThat(vessel.mmsi).isNull()
        assertThat(vessel.ircs).isNull()
    }

    @Test
    @Transactional
    fun `findVessel Should return a vessel When the CFR is given`() {
        // When
        val vessel = jpaVesselRepository.findVessel("FAK000999999", "", "")

        assertThat(vessel.internalReferenceNumber).isEqualTo("FAK000999999")
    }

    @Test
    @Transactional
    fun `findVessel Should return a vessel When the external marking is given`() {
        // When
        val vessel = jpaVesselRepository.findVessel("BAD_IDEA", "TALK2ME", "")

        assertThat(vessel.internalReferenceNumber).isEqualTo("U_W0NTFINDME")
    }

    @Test
    @Transactional
    fun `search Should return a vessel When part of the CFR is given`() {
        // When
        val vessels = jpaVesselRepository.search("FAK0")

        assertThat(vessels).hasSize(1)
        assertThat(vessels.first().internalReferenceNumber).isEqualTo("FAK000999999")
    }

    @Test
    @Transactional
    fun `search Should return no vessel When no search string is given`() {
        // When
        val vessels = jpaVesselRepository.search("")

        assertThat(vessels).hasSize(0)
    }

    @Test
    @Transactional
    fun `search Should return a vessel When part of the vessel name is given`() {
        // When
        val vessels = jpaVesselRepository.search("LE b")

        assertThat(vessels).hasSize(1)
        assertThat(vessels.first().internalReferenceNumber).isEqualTo("FR263418260")
    }

    @Test
    @Transactional
    fun `search Should return an UNDEFINED flag state When a wrong flag state is given`() {
        // When
        val vessels = jpaVesselRepository.search("U_W0NTFINDME")

        assertThat(vessels).hasSize(1)
        assertThat(vessels.first().flagState).isEqualTo(CountryCode.UNDEFINED)
    }
}
