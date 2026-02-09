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
        assertThat(threats.first().label).isEqualTo("Activités INN")
        assertThat(threats.first().value).isEqualTo("Activités INN")
        assertThat(threats.first().value).isEqualTo("Activités INN")
        assertThat(threats.first().children).hasSize(7)

        val firstThreatCharacterization = threats.first().children.first()
        assertThat(firstThreatCharacterization.label).isEqualTo("Navire sans immatriculation")
        assertThat(firstThreatCharacterization.label).isEqualTo("Navire sans immatriculation")
        assertThat(firstThreatCharacterization.children).hasSize(1)

        val firstNatinf = firstThreatCharacterization.children.first()
        assertThat(
            firstNatinf.label,
        ).isEqualTo(
            "27879 - EXPLOITATION, GESTION OU POSSESSION D'UN NAVIRE DE PECHE MARITIME NON IMMATRICULE",
        )
        assertThat(firstNatinf.value).isEqualTo(27879)
    }
}
