package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.fasterxml.jackson.annotation.JsonInclude
import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.LegacyControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingActor
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.utils.InfractionHierarchyBuilder

@JsonInclude(JsonInclude.Include.NON_NULL)
data class InfractionSuspicionDataOutput(
    val reportingActor: ReportingActor,
    val controlUnitId: Int? = null,
    val controlUnit: LegacyControlUnit? = null,
    val authorContact: String? = null,
    val title: String,
    val description: String? = null,
    val natinfCode: Int,
    val seaFront: String? = null,
    val dml: String? = null,
    val threat: String,
    val threatCharacterization: String,
    // This field is used to control the Reporting form
    val threatHierarchy: ThreatHierarchyDataOutput? = null,
) : ReportingValueDataOutput() {
    companion object {
        fun fromInfractionSuspicion(
            reporting: Reporting.InfractionSuspicion,
            controlUnit: LegacyControlUnit? = null,
            useThreatHierarchyForForm: Boolean = false,
        ): InfractionSuspicionDataOutput {
            val threatHierarchy =
                if (useThreatHierarchyForForm) {
                    InfractionHierarchyBuilder
                        .buildThreatHierarchy(
                            items = listOf(reporting),
                            threatExtractor = { it.threat ?: "Famille inconnue" },
                            characterizationExtractor = { it.threatCharacterization ?: "Type inconnu" },
                            natinfCodeExtractor = { it.natinfCode },
                            infractionNameExtractor = { "" },
                        ).single()
                } else {
                    null
                }

            return InfractionSuspicionDataOutput(
                reportingActor = reporting.reportingActor,
                controlUnitId = reporting.controlUnitId,
                controlUnit = controlUnit,
                authorContact = reporting.authorContact,
                title = reporting.title,
                description = reporting.description,
                natinfCode = reporting.natinfCode,
                threat = reporting.threat,
                threatCharacterization = reporting.threatCharacterization,
                threatHierarchy = threatHierarchy,
                dml = reporting.dml,
                seaFront = reporting.seaFront,
            )
        }
    }
}
