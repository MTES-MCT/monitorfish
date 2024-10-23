package fr.gouv.cnsp.monitorfish.domain.entities.reporting

import fr.gouv.cnsp.monitorfish.domain.entities.mission.LegacyControlUnit

data class ReportingAndOccurrences(
    val otherOccurrencesOfSameAlert: List<Reporting>,
    val reporting: Reporting,
    val legacyControlUnit: LegacyControlUnit?,
)
