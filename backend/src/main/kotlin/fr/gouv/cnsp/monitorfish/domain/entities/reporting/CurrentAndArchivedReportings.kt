package fr.gouv.cnsp.monitorfish.domain.entities.reporting

import fr.gouv.cnsp.monitorfish.domain.entities.mission.ControlUnit

class CurrentAndArchivedReportings(
    val current: List<Pair<Reporting, ControlUnit?>>,
    val archived: List<Pair<Reporting, ControlUnit?>>,
)
