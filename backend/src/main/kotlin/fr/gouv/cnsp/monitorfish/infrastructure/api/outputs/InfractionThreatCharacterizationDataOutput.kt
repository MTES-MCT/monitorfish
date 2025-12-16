package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.infraction.InfractionThreatCharacterization
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.Infraction
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.utils.InfractionHierarchyBuilder

data class InfractionThreatCharacterizationDataOutput(
    val threats: List<ThreatHierarchyDataOutput>,
) {
    companion object {
        fun fromInfractionThreatCharacterization(
            infractions: List<InfractionThreatCharacterization>,
        ): List<ThreatHierarchyDataOutput> {
            val threats =
                InfractionHierarchyBuilder.buildThreatHierarchy(
                    items = infractions,
                    threatExtractor = { it.threat },
                    characterizationExtractor = { it.threatCharacterization },
                    natinfCodeExtractor = { it.natinfCode },
                    infractionNameExtractor = { it.infraction },
                )

            return InfractionThreatCharacterizationDataOutput(threats = threats).threats
        }

        fun fromInfraction(infraction: Infraction): ThreatHierarchyDataOutput {
            val threats =
                InfractionHierarchyBuilder.buildThreatHierarchy(
                    items = listOf(infraction),
                    threatExtractor = { it.threat ?: "Famille inconnue" },
                    characterizationExtractor = { it.threatCharacterization ?: "Type inconnu" },
                    natinfCodeExtractor = { it.natinf!! },
                    infractionNameExtractor = { "" },
                )

            return InfractionThreatCharacterizationDataOutput(threats = threats).threats.single()
        }
    }
}

