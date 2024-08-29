package fr.gouv.cnsp.monitorfish.domain.entities.reporting

import fr.gouv.cnsp.monitorfish.domain.entities.mission.ControlUnit

data class ReportingAndOccurrences(
    val otherOccurrencesOfSameAlert: List<Reporting>,
    val reporting: Reporting,
    val controlUnit: ControlUnit?,
)
