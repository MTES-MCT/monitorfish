package fr.gouv.cnsp.monitorfish.infrastructure.api.input

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
)
