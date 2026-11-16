package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

class JpaRegulatoryCatalogueRepositoryITests : AbstractDBTests() {
    @Autowired
    private lateinit var jpaRegulatoryCatalogueRepository: JpaRegulatoryCatalogueRepository

    @Test
    @Transactional
    fun `findAllAsGeoJson Should return the regulatory zones as the GeoServer layer properties`() {
        // When
        val catalogue = ObjectMapper().readTree(jpaRegulatoryCatalogueRepository.findAllAsGeoJson())

        // Then
        assertThat(catalogue["type"].asText()).isEqualTo("FeatureCollection")
        val features = catalogue["features"]
        assertThat(features).hasSize(7)
        assertThat(features.map { it["id"].asText() }).containsExactly(
            "regulations.431",
            "regulations.598",
            "regulations.605",
            "regulations.3145",
            "regulations.10727",
            "regulations.10728",
            "regulations.10729",
        )

        val ouestCotentin = features.first { it["properties"]["id"].asInt() == 598 }
        assertThat(ouestCotentin["geometry"].isNull).isTrue()
        assertThat(ouestCotentin["properties"]["topic"].asText()).isEqualTo("Ouest Cotentin Bivalves")
        assertThat(ouestCotentin["properties"]["law_type"].asText()).isEqualTo("Reg. MEMN")
        // As GeoServer, the JSON columns are returned as JSON strings
        assertThat(ouestCotentin["properties"]["gears"].isTextual).isTrue()
        assertThat(ouestCotentin["properties"]["tags"].asText()).isEqualTo("""["ZPF"]""")
        assertThat(ouestCotentin["properties"].has("fishing_period")).isFalse()
    }
}
