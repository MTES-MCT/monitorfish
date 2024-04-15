package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.CacheManager
import org.springframework.transaction.annotation.Transactional

class JpaRiskFactorRepositoryITests : AbstractDBTests() {

    @Autowired
    private lateinit var jpaRiskFactorRepository: JpaRiskFactorRepository

    @Autowired
    lateinit var cacheManager: CacheManager

    @BeforeEach
    fun setup() {
        cacheManager.getCache("risk_factor")?.clear()
        cacheManager.getCache("risk_factors")?.clear()
    }

    @Test
    @Transactional
    fun `findAll Should return all risk factors`() {
        // When
        val result = jpaRiskFactorRepository.findAll()

        // Then
        assertThat(result.size).isGreaterThan(0)
    }

    @Test
    @Transactional
    fun `findVesselRiskFactors Should return the vessel's risk factor`() {
        // When
        val vesselRiskFactor = jpaRiskFactorRepository.findByInternalReferenceNumber("FAK000999999")

        // Then
        assertThat(vesselRiskFactor).isInstanceOf(VesselRiskFactor::class.java)
        assertThat(vesselRiskFactor?.numberGearSeizuresLastFiveYears).isEqualTo(4)
        assertThat(vesselRiskFactor?.numberSpeciesSeizuresLastFiveYears).isEqualTo(3)
        assertThat(vesselRiskFactor?.numberVesselSeizuresLastFiveYears).isEqualTo(2)
    }
}
