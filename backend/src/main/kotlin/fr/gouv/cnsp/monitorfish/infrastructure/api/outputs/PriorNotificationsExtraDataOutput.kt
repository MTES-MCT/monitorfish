package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.facade.SeafrontGroup

data class PriorNotificationsExtraDataOutput(
    val perSeafrontGroupCount: Map<SeafrontGroup, Int>,
)
