package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.CacheManager
import org.springframework.transaction.annotation.Transactional

class JpaRiskFactorsRepositoryITests : AbstractDBTests() {

    @Autowired
    private lateinit var jpaRiskFactorsRepository: JpaRiskFactorsRepository

    @Autowired
    lateinit var cacheManager: CacheManager

    @BeforeEach
    fun setup() {
        cacheManager.getCache("risk_factors")?.clear()
    }

    @Test
    @Transactional
    fun `findVesselRiskFactors Should return the vessel's risk factor`() {
        // When
        val vesselRiskFactor = jpaRiskFactorsRepository.findVesselRiskFactors("FAK000999999")
        assertThat(vesselRiskFactor).isInstanceOf(VesselRiskFactor::class.java)
        assertThat(vesselRiskFactor?.numberGearSeizuresLastFiveYears).isEqualTo(4)
        assertThat(vesselRiskFactor?.numberSpeciesSeizuresLastFiveYears).isEqualTo(3)
        assertThat(vesselRiskFactor?.numberVesselSeizuresLastFiveYears).isEqualTo(2)
    }
}
