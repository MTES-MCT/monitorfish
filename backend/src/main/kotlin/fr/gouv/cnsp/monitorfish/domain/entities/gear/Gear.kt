package fr.gouv.cnsp.monitorfish.domain.entities.gear

data class Gear(
    val code: String,
    val name: String,
    val category: String? = null,
    val groupId: Int? = null,
    val isMeshRequiredForSegment: Boolean? = null,
)
