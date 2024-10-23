package fr.gouv.cnsp.monitorfish.domain.entities.reporting

import fr.gouv.cnsp.monitorfish.domain.entities.control_units.LegacyControlUnit

data class ReportingAndOccurrences(
    val otherOccurrencesOfSameAlert: List<Reporting>,
    val reporting: Reporting,
    val legacyControlUnit: LegacyControlUnit?,
)
