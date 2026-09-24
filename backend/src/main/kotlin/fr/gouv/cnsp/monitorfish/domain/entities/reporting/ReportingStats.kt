package fr.gouv.cnsp.monitorfish.domain.entities.reporting

import fr.gouv.cnsp.monitorfish.domain.entities.facade.SeafrontGroup

data class ReportingStats(
    val perSeafrontGroupCount: Map<SeafrontGroup, Int>,
)
