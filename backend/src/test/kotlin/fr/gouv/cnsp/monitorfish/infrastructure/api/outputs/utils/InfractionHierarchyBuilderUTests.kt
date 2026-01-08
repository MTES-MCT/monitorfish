package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.utils

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class InfractionHierarchyBuilderUTests {
    data class TestInfraction(
        val threat: String,
        val characterization: String,
        val natinfCode: Int,
        val infractionName: String,
    )

    @Test
    fun `buildThreatHierarchy Should build a simple hierarchy with one threat, one characterization and one NATINF`() {
        // Given
        val infractions =
            listOf(
                TestInfraction(
                    threat = "Mesures techniques et de conservation",
                    characterization = "Autorisation Débarquement",
                    natinfCode = 27718,
                    infractionName = "Débarquement de produits de la pêche maritime et de l'aquaculture marine hors d'un port désigné",
                ),
            )

        // When
        val result =
            InfractionHierarchyBuilder.buildThreatHierarchy(
                items = infractions,
                threatExtractor = { it.threat },
                characterizationExtractor = { it.characterization },
                natinfCodeExtractor = { it.natinfCode },
                infractionNameExtractor = { it.infractionName },
            )

        // Then
        assertThat(result).hasSize(1)

        val threat = result.first()
        assertThat(threat.label).isEqualTo("Mesures techniques et de conservation")
        assertThat(threat.value).isEqualTo("Mesures techniques et de conservation")
        assertThat(threat.children).hasSize(1)

        val characterization = threat.children.first()
        assertThat(characterization.label).isEqualTo("Autorisation Débarquement")
        assertThat(characterization.value).isEqualTo("Autorisation Débarquement")
        assertThat(characterization.children).hasSize(1)

        val natinf = characterization.children.first()
        assertThat(natinf.label).isEqualTo(
            "27718 - Débarquement de produits de la pêche maritime et de l'aquaculture marine hors d'un port désigné",
        )
        assertThat(natinf.value).isEqualTo(27718)
    }

    @Test
    fun `buildThreatHierarchy Should build a complex hierarchy with multiple threats and characterizations`() {
        // Given
        val infractions =
            listOf(
                TestInfraction(
                    threat = "Activités INN",
                    characterization = "Pêche sans autorisation",
                    natinfCode = 2608,
                    infractionName = "Pêche maritime non autorisée dans les eaux françaises",
                ),
                TestInfraction(
                    threat = "Activités INN",
                    characterization = "Pêche sans autorisation",
                    natinfCode = 2610,
                    infractionName = "Pêche sans licence",
                ),
                TestInfraction(
                    threat = "Activités INN",
                    characterization = "Transbordement illicite",
                    natinfCode = 7059,
                    infractionName = "Transbordement en mer non autorisé",
                ),
                TestInfraction(
                    threat = "Mesures techniques et de conservation",
                    characterization = "Autorisation Débarquement",
                    natinfCode = 27718,
                    infractionName = "Débarquement hors port désigné",
                ),
            )

        // When
        val result =
            InfractionHierarchyBuilder.buildThreatHierarchy(
                items = infractions,
                threatExtractor = { it.threat },
                characterizationExtractor = { it.characterization },
                natinfCodeExtractor = { it.natinfCode },
                infractionNameExtractor = { it.infractionName },
            )

        // Then
        assertThat(result).hasSize(2)

        val innThreat = result.find { it.label == "Activités INN" }
        assertThat(innThreat).isNotNull
        assertThat(innThreat?.children).hasSize(2)

        val authorisationCharacterization = innThreat?.children?.find { it.label == "Pêche sans autorisation" }
        assertThat(authorisationCharacterization).isNotNull
        assertThat(authorisationCharacterization?.children).hasSize(2)
        assertThat(authorisationCharacterization?.children?.map { it.value }).containsExactlyInAnyOrder(2608, 2610)

        val transbordementCharacterization = innThreat?.children?.find { it.label == "Transbordement illicite" }
        assertThat(transbordementCharacterization).isNotNull
        assertThat(transbordementCharacterization?.children).hasSize(1)
        assertThat(transbordementCharacterization?.children?.first()?.value).isEqualTo(7059)

        val technicalThreat = result.find { it.label == "Mesures techniques et de conservation" }
        assertThat(technicalThreat).isNotNull
        assertThat(technicalThreat?.children).hasSize(1)
        assertThat(
            technicalThreat
                ?.children
                ?.first()
                ?.children
                ?.first()
                ?.value,
        ).isEqualTo(27718)
    }

    @Test
    fun `buildThreatHierarchy Should format NATINF label with only code when infraction name is empty`() {
        // Given
        val infractions =
            listOf(
                TestInfraction(
                    threat = "Test Threat",
                    characterization = "Test Characterization",
                    natinfCode = 12345,
                    infractionName = "",
                ),
                TestInfraction(
                    threat = "Test Threat",
                    characterization = "Test Characterization",
                    natinfCode = 67890,
                    infractionName = "Infraction with name",
                ),
            )

        // When
        val result =
            InfractionHierarchyBuilder.buildThreatHierarchy(
                items = infractions,
                threatExtractor = { it.threat },
                characterizationExtractor = { it.characterization },
                natinfCodeExtractor = { it.natinfCode },
                infractionNameExtractor = { it.infractionName },
            )

        // Then
        val natinfs =
            result
                .first()
                .children
                .first()
                .children
        assertThat(natinfs).hasSize(2)

        val emptyNameNatinf = natinfs.find { it.value == 12345 }
        assertThat(emptyNameNatinf?.label).isEqualTo("12345")

        val namedNatinf = natinfs.find { it.value == 67890 }
        assertThat(namedNatinf?.label).isEqualTo("67890 - Infraction with name")
    }
}
