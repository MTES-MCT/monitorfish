package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
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
        cacheManager.getCache("vessels")?.clear()
    }

    @Test
    @Transactional
    fun `findAll Should all the vessels`() {
        // When
        val vessel = jpaVesselRepository.findVessel("DUMMY", "", "")

        // Then
        assertThat(vessel).isNull()
    }

    @Test
    @Transactional
    fun `findVessel Should return null When no vessel is found`() {
        // When
        val vessel = jpaVesselRepository.findVessel("DUMMY", "", "")

        // Then
        assertThat(vessel).isNull()
    }

    @Test
    @Transactional
    fun `findVessel Should return a vessel When the CFR is given`() {
        // When
        val vessel = jpaVesselRepository.findVessel("FAK000999999", "", "")

        // Then
        assertThat(vessel).isNotNull
        assertThat(vessel!!.internalReferenceNumber).isEqualTo("FAK000999999")
    }

    @Test
    @Transactional
    fun `findVessel Should return a vessel When the external marking is given`() {
        // When
        val vessel = jpaVesselRepository.findVessel("BAD_IDEA", "TALK2ME", "")

        // Then
        assertThat(vessel).isNotNull
        assertThat(vessel!!.internalReferenceNumber).isEqualTo("U_W0NTFINDME")
    }

    @Test
    @Transactional
    fun `search Should return a vessel When part of the CFR is given`() {
        // When
        val vessels = jpaVesselRepository.search("FAK0")

        // Then
        assertThat(vessels).hasSize(1)
        assertThat(vessels.first().internalReferenceNumber).isEqualTo("FAK000999999")
        assertThat(vessels.first().districtCode).isEqualTo("AY")
    }

    @Test
    @Transactional
    fun `search Should return no vessel When no search string is given`() {
        // When
        val vessels = jpaVesselRepository.search("")

        // Then
        assertThat(vessels).hasSize(0)
    }

    @Test
    @Transactional
    fun `search Should return a vessel When part of the vessel name is given`() {
        // When
        val vessels = jpaVesselRepository.search("LE b")

        // Then
        assertThat(vessels).hasSize(2)
        assertThat(vessels.first().internalReferenceNumber).isEqualTo("FR263418260")
    }

    @Test
    @Transactional
    fun `search Should return an UNDEFINED flag state When a wrong flag state is given`() {
        // When
        val vessels = jpaVesselRepository.search("U_W0NTFINDME")

        // Then
        assertThat(vessels).hasSize(1)
        assertThat(vessels.first().flagState).isEqualTo(CountryCode.UNDEFINED)
    }

    @Test
    @Transactional
    fun `findVesselsByIds Should return vessels from vessel ids`() {
        // When
        val vessels = jpaVesselRepository.findVesselsByIds(listOf(1, 2, 3, 4, 66666666))

        // Then
        assertThat(vessels).hasSize(4)
        assertThat(vessels.first().internalReferenceNumber).isEqualTo("FAK000999999")
        assertThat(vessels.first().vesselName).isEqualTo("PHENOMENE")
    }

    @Test
    @Transactional
    fun `findVesselsByInternalReferenceNumbers Should return vessels from vessel CFR`() {
        // When
        val vessels = jpaVesselRepository.findVesselsByInternalReferenceNumbers(listOf("U_W0NTFINDME", "FAK000999999"))

        // Then
        assertThat(vessels).hasSize(2)
        assertThat(vessels.first().internalReferenceNumber).isEqualTo("FAK000999999")
        assertThat(vessels.first().vesselName).isEqualTo("PHENOMENE")
    }

    @Test
    @Transactional
    fun `findUnderCharterForVessel Should get the underCharter field of a vessel`() {
        // When
        val notUnderCharterOnCfr =
            jpaVesselRepository.findUnderCharterForVessel(
                VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                "FAK000999999",
            )
        val underCharterOnIrcs =
            jpaVesselRepository.findUnderCharterForVessel(
                VesselIdentifier.IRCS,
                "QGDF",
            )
        val underCharterOnExternalImmatriculation =
            jpaVesselRepository.findUnderCharterForVessel(
                VesselIdentifier.EXTERNAL_REFERENCE_NUMBER,
                "08FR65324",
            )

        // Then
        assertThat(notUnderCharterOnCfr).isFalse
        assertThat(underCharterOnIrcs).isTrue
        assertThat(underCharterOnExternalImmatriculation).isTrue
    }
}
