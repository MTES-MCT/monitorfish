package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import org.slf4j.Logger
import org.slf4j.LoggerFactory

private val logger: Logger = LoggerFactory.getLogger(ThreatHierarchyDataInput::class.java)

data class NatinfDataInput(
    val label: String,
    val value: Int,
)

data class ThreatCharacterizationDataInput(
    val children: List<NatinfDataInput>,
    val label: String,
    val value: String,
)

data class ThreatHierarchyDataInput(
    val children: List<ThreatCharacterizationDataInput>,
    val label: String,
    val value: String,
) {
    /**
     * The Frontend threat picker selects a single leaf, so a hierarchy is expected to carry exactly one
     * characterization and one NATINF.
     *
     * A wider hierarchy used to reach `single()` and answer a `400` naming neither the endpoint nor the payload
     * (MONITORFISH-17J03). We keep the first leaf and log what was actually received instead, so the next
     * occurrence names its own culprit.
     */
    fun toLeaf(): ThreatLeaf {
        val characterization =
            children.firstOrNull()
                ?: throw IllegalArgumentException("Threat \"$value\" has no threat characterization.")
        val natinf =
            characterization.children.firstOrNull()
                ?: throw IllegalArgumentException(
                    "Threat characterization \"${characterization.value}\" of threat \"$value\" has no NATINF.",
                )

        if (children.size > 1 || characterization.children.size > 1) {
            logger.warn(
                "Threat \"$value\" carries ${children.size} threat characterizations and " +
                    "${characterization.children.size} NATINFs for its first one: keeping " +
                    "\"${characterization.value}\" / ${natinf.value}.",
            )
        }

        return ThreatLeaf(
            threat = value,
            threatCharacterization = characterization.value,
            natinfCode = natinf.value,
        )
    }
}

data class ThreatLeaf(
    val threat: String,
    val threatCharacterization: String,
    val natinfCode: Int,
)

/**
 * Same contract as [ThreatHierarchyDataInput.toLeaf] one level up: a single threat is expected.
 */
fun List<ThreatHierarchyDataInput>.toSingleLeaf(): ThreatLeaf {
    val threat = firstOrNull() ?: throw IllegalArgumentException("No threat given.")

    if (size > 1) {
        logger.warn("$size threats given where a single one is expected: keeping \"${threat.value}\".")
    }

    return threat.toLeaf()
}
