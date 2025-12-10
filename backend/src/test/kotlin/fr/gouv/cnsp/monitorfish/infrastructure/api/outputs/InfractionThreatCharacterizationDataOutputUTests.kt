package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class InfractionThreatCharacterizationDataOutputUTests {
    @Test
    fun `fromInfractionThreatCharacterization Should return the formatted options`() {
        // When
        val threats =
            InfractionThreatCharacterizationDataOutput
                .fromInfractionThreatCharacterization(dummyInfractionThreatCharacterizations)

        // Then
        assertThat(threats).hasSize(3)
        assertThat(threats.first().name).isEqualTo("Activités INN")
        assertThat(threats.first().value).isEqualTo("Activités INN")
        assertThat(threats.first().value).isEqualTo("Activités INN")
        assertThat(threats.first().children).hasSize(7)

        val firstThreatCharacterization = threats.first().children.first()
        assertThat(firstThreatCharacterization.name).isEqualTo("Pêche sans autorisation par navire tiers")
        assertThat(firstThreatCharacterization.name).isEqualTo("Pêche sans autorisation par navire tiers")
        assertThat(firstThreatCharacterization.children).hasSize(1)

        val firstNatinf = firstThreatCharacterization.children.first()
        assertThat(
            firstNatinf.name,
        ).isEqualTo(
            "2608 - Peche maritime non autorisee dans les eaux maritimes ou salees francaises par un navire de pays tiers a l'union europeenne",
        )
        assertThat(firstNatinf.value).isEqualTo(2608)
    }
}
