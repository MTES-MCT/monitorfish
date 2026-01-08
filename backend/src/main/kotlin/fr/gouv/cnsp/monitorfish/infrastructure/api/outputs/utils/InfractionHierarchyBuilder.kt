package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.utils

import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.NatinfDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.ThreatCharacterizationDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.ThreatHierarchyDataOutput

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
 *             "label": "27718 – Débarquement de produits de la pêche maritime et de l'aquaculture marine hors d'un port désigné",
 *             "value": 27718
 *           }
 *         ],
 *         "label": "Autorisation Débarquement",
 *         "value": "Autorisation Débarquement"
 *       }
 *     ],
 *     "label": "Mesures techniques et de conservation",
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
    ): List<ThreatHierarchyDataOutput> {
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
    ): ThreatHierarchyDataOutput {
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

        return ThreatHierarchyDataOutput(
            children = characterizations,
            label = threatName,
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
            label = characterizationName,
            value = characterizationName,
        )
    }

    private fun buildNatinfOutput(
        natinfCode: Int,
        infractionName: String,
    ): NatinfDataOutput =
        NatinfDataOutput(
            label = formatNatinfName(natinfCode, infractionName),
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
