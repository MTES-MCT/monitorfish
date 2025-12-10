package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.infraction.InfractionThreatCharacterization
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.Infraction

data class NatinfDataOutput(
    val name: String,
    val value: Int,
)

data class ThreatCharacterizationDataOutput(
    val children: List<NatinfDataOutput>,
    val name: String,
    val value: String,
)

data class ThreatDataOutput(
    val children: List<ThreatCharacterizationDataOutput>,
    val name: String,
    val value: String,
)

data class InfractionThreatCharacterizationDataOutput(
    val threats: List<ThreatDataOutput>,
) {
    companion object {
        fun fromInfractionThreatCharacterization(
            infractions: List<InfractionThreatCharacterization>,
        ): List<ThreatDataOutput> {
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

        fun fromInfraction(infraction: Infraction): ThreatDataOutput {
            val threats =
                InfractionHierarchyBuilder.buildThreatHierarchy(
                    items = listOf(infraction),
                    threatExtractor = { it.threat ?: "Autres" },
                    characterizationExtractor = { it.threatCharacterization ?: "Autres" },
                    natinfCodeExtractor = { it.natinf!! },
                    infractionNameExtractor = { "" },
                )

            return InfractionThreatCharacterizationDataOutput(threats = threats).threats.single()
        }
    }
}

/**
 * Builds a hierarchical structure of threats, threat characterizations, and NATINF codes
 * from any source type T.
 *
 * Example:
 * [
 *   {
 *     "children": [
 *       {
 *         "children": [
 *           {
 *             "name": "27718 – Débarquement de produits de la pêche maritime et de l'aquaculture marine hors d'un port désigné",
 *             "value": 27718
 *           }
 *         ],
 *         "name": "Autorisation Débarquement",
 *         "value": "Autorisation Débarquement"
 *       }
 *     ],
 *     "name": "Mesures techniques et de conservation",
 *     "value": "Mesures techniques et de conservation"
 *   }
 * ]
 */
object InfractionHierarchyBuilder {
    fun <T> buildThreatHierarchy(
        items: List<T>,
        threatExtractor: (T) -> String,
        characterizationExtractor: (T) -> String,
        natinfCodeExtractor: (T) -> Int,
        infractionNameExtractor: (T) -> String,
    ): List<ThreatDataOutput> {
        val groupedByThreat = items.groupBy { threatExtractor(it) }

        return groupedByThreat.map { (threatName, itemsInThreat) ->
            buildThreatOutput(
                threatName = threatName,
                items = itemsInThreat,
                characterizationExtractor = characterizationExtractor,
                natinfCodeExtractor = natinfCodeExtractor,
                infractionNameExtractor = infractionNameExtractor,
            )
        }
    }

    private fun <T> buildThreatOutput(
        threatName: String,
        items: List<T>,
        characterizationExtractor: (T) -> String,
        natinfCodeExtractor: (T) -> Int,
        infractionNameExtractor: (T) -> String,
    ): ThreatDataOutput {
        val groupedByCharacterization = items.groupBy { characterizationExtractor(it) }

        val characterizations =
            groupedByCharacterization.map { (characterizationName, itemsInCharacterization) ->
                buildThreatCharacterizationOutput(
                    characterizationName = characterizationName,
                    items = itemsInCharacterization,
                    natinfCodeExtractor = natinfCodeExtractor,
                    infractionNameExtractor = infractionNameExtractor,
                )
            }

        return ThreatDataOutput(
            children = characterizations,
            name = threatName,
            value = threatName,
        )
    }

    private fun <T> buildThreatCharacterizationOutput(
        characterizationName: String,
        items: List<T>,
        natinfCodeExtractor: (T) -> Int,
        infractionNameExtractor: (T) -> String,
    ): ThreatCharacterizationDataOutput {
        val natinfOutputs =
            items.map { item ->
                buildNatinfOutput(
                    natinfCode = natinfCodeExtractor(item),
                    infractionName = infractionNameExtractor(item),
                )
            }

        return ThreatCharacterizationDataOutput(
            children = natinfOutputs,
            name = characterizationName,
            value = characterizationName,
        )
    }

    private fun buildNatinfOutput(
        natinfCode: Int,
        infractionName: String,
    ): NatinfDataOutput =
        NatinfDataOutput(
            name = formatNatinfName(natinfCode, infractionName),
            value = natinfCode,
        )

    private fun formatNatinfName(
        natinfCode: Int,
        infractionName: String,
    ): String =
        if (infractionName.isEmpty()) {
            natinfCode.toString()
        } else {
            "$natinfCode - $infractionName"
        }
}
