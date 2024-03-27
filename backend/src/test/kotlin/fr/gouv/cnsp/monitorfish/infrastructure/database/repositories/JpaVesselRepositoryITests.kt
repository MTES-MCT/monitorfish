package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.neovisionaries.i18n.CountryCode
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.CacheManager
import org.springframework.transaction.annotation.Transactional

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
    fun `findVessel Should return null When no vessel is found`() {
        // When
        val vessel = jpaVesselRepository.findVessel("DUMMY", "", "")

        assertThat(vessel).isNull()
    }

    @Test
    @Transactional
    fun `findVessel Should return a vessel When the CFR is given`() {
        // When
        val vessel = jpaVesselRepository.findVessel("FAK000999999", "", "")

        assertThat(vessel).isNotNull
        assertThat(vessel!!.internalReferenceNumber).isEqualTo("FAK000999999")
    }

    @Test
    @Transactional
    fun `findVessel Should return a vessel When the external marking is given`() {
        // When
        val vessel = jpaVesselRepository.findVessel("BAD_IDEA", "TALK2ME", "")

        assertThat(vessel).isNotNull
        assertThat(vessel!!.internalReferenceNumber).isEqualTo("U_W0NTFINDME")
    }

    @Test
    @Transactional
    fun `search Should return a vessel When part of the CFR is given`() {
        // When
        val vessels = jpaVesselRepository.search("FAK0")

        assertThat(vessels).hasSize(1)
        assertThat(vessels.first().internalReferenceNumber).isEqualTo("FAK000999999")
        assertThat(vessels.first().districtCode).isEqualTo("AY")
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

        assertThat(vessels).hasSize(2)
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

    @Test
    @Transactional
    fun `findVesselsByIds Should return vessels from vessel ids`() {
        // When
        val vessels = jpaVesselRepository.findVesselsByIds(listOf(1, 2, 3, 4, 66666666))

        assertThat(vessels).hasSize(4)
        assertThat(vessels.first().internalReferenceNumber).isEqualTo("FAK000999999")
        assertThat(vessels.first().vesselName).isEqualTo("PHENOMENE")
    }
}
