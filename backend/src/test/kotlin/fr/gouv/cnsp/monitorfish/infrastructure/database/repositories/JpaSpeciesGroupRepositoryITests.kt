package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.CacheManager
import org.springframework.transaction.annotation.Transactional

class JpaSpeciesGroupRepositoryITests : AbstractDBTests() {

    @Autowired
    private lateinit var jpaSpeciesGroupRepository: JpaSpeciesGroupRepository

    @Autowired
    lateinit var cacheManager: CacheManager

    @BeforeEach
    fun setup() {
        cacheManager.getCache("all_species_groups")?.clear()
    }

    @Test
    @Transactional
    fun `findAll Should return all species`() {
        // When
        val species = jpaSpeciesGroupRepository.findAll()

        assertThat(species).hasSize(14)
        assertThat(species.first().group).isEqualTo("Espèces eau profonde")
        assertThat(species.first().comment).isEqualTo(
            "Liste des espèces eau profondes définies dans l'annexe XI de l'AM_27-05-2016",
        )
    }
}
