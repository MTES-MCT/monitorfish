package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

class JpaForeignFMCRepositoryITests : AbstractDBTests() {

    @Autowired
    private lateinit var jpaForeignFMCRepository: JpaForeignFMCRepository

    @Test
    @Transactional
    fun `findAll Should return all foreign FMCs`() {
        // When
        val foreignFMCs = jpaForeignFMCRepository.findAll()

        // Then
        assertThat(foreignFMCs).hasSize(2)

        assertThat(foreignFMCs.first().countryCodeIso3).isEqualTo("ABC")
        assertThat(foreignFMCs.first().countryName).isEqualTo("Alabama")
        assertThat(foreignFMCs.first().emailAddresses).isEqualTo(listOf("fmc@somewhere.com", "fmc2@somewhere.io"))

        assertThat(foreignFMCs.last().countryCodeIso3).isEqualTo("DEF")
        assertThat(foreignFMCs.last().countryName).isEqualTo("Dumbledoreland")
        assertThat(foreignFMCs.last().emailAddresses).isEqualTo(null)
    }
}
