package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test

class ThreatHierarchyDataInputUTests {
    private fun natinf(code: Int) = NatinfDataInput(value = code, label = code.toString())

    private fun characterization(
        name: String,
        vararg natinfCodes: Int,
    ) = ThreatCharacterizationDataInput(
        value = name,
        label = name,
        children = natinfCodes.map { natinf(it) },
    )

    private fun threat(
        name: String,
        vararg characterizations: ThreatCharacterizationDataInput,
    ) = ThreatHierarchyDataInput(value = name, label = name, children = characterizations.toList())

    @Test
    fun `toLeaf Should return the single leaf`() {
        // Given
        val hierarchy =
            threat("Activités INN", characterization("Pêche sans autorisation par navire tiers", 2608))

        // When
        val result = hierarchy.toLeaf()

        // Then
        assertThat(result.threat).isEqualTo("Activités INN")
        assertThat(result.threatCharacterization).isEqualTo("Pêche sans autorisation par navire tiers")
        assertThat(result.natinfCode).isEqualTo(2608)
    }

    @Test
    fun `toLeaf Should keep the first threat characterization When several are given`() {
        // Given
        val hierarchy =
            threat(
                "Mesures techniques et de conservation",
                characterization("Engin", 2593),
                characterization("Transbordement", 27714),
            )

        // When
        val result = hierarchy.toLeaf()

        // Then
        assertThat(result.threatCharacterization).isEqualTo("Engin")
        assertThat(result.natinfCode).isEqualTo(2593)
    }

    @Test
    fun `toLeaf Should keep the first NATINF When several are given`() {
        // Given
        val hierarchy = threat("Mesures techniques et de conservation", characterization("Engin", 2593, 7057, 7059))

        // When
        val result = hierarchy.toLeaf()

        // Then
        assertThat(result.natinfCode).isEqualTo(2593)
    }

    @Test
    fun `toLeaf Should throw When the threat has no threat characterization`() {
        // Given
        val hierarchy = threat("Activités INN")

        // When / Then
        assertThatThrownBy { hierarchy.toLeaf() }
            .isInstanceOf(IllegalArgumentException::class.java)
            .hasMessageContaining("Activités INN")
    }

    @Test
    fun `toLeaf Should throw When the threat characterization has no NATINF`() {
        // Given
        val hierarchy = threat("Activités INN", characterization("Pêche sans autorisation par navire tiers"))

        // When / Then
        assertThatThrownBy { hierarchy.toLeaf() }
            .isInstanceOf(IllegalArgumentException::class.java)
            .hasMessageContaining("Pêche sans autorisation par navire tiers")
    }

    @Test
    fun `toSingleLeaf Should keep the first threat When several are given`() {
        // Given
        val hierarchies =
            listOf(
                threat("Activités INN", characterization("Pêche sans autorisation par navire tiers", 2608)),
                threat("Entrave au contrôle", characterization("Dissimulation", 12922)),
            )

        // When
        val result = hierarchies.toSingleLeaf()

        // Then
        assertThat(result.threat).isEqualTo("Activités INN")
        assertThat(result.natinfCode).isEqualTo(2608)
    }

    @Test
    fun `toSingleLeaf Should throw When no threat is given`() {
        // When / Then
        assertThatThrownBy { emptyList<ThreatHierarchyDataInput>().toSingleLeaf() }
            .isInstanceOf(IllegalArgumentException::class.java)
    }
}
