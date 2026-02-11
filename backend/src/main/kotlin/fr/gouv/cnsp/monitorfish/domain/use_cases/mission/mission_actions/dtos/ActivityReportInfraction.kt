package fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions.dtos

import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.Infraction

data class ActivityReportInfraction(
    val infraction: Infraction,
    val isrCode: String? = null,
    val isrName: String? = null,
)
