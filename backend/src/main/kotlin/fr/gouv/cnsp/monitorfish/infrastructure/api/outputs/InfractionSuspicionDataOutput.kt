package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.fasterxml.jackson.annotation.JsonInclude
import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.LegacyControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.OtherSource
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingSource
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.SatelliteSource
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.utils.InfractionHierarchyBuilder

@JsonInclude(JsonInclude.Include.NON_NULL)
data class InfractionSuspicionThreatDataOutput(
    val natinfCode: Int,
    val threat: String,
    val threatCharacterization: String,
    val threatHierarchy: ThreatHierarchyDataOutput? = null,
    val infraction: InfractionDataOutput? = null,
)

@JsonInclude(JsonInclude.Include.NON_NULL)
data class InfractionSuspicionDataOutput(
    val reportingSource: ReportingSource,
    val controlUnitId: Int? = null,
    val controlUnit: LegacyControlUnit? = null,
    val authorContact: String? = null,
    val otherSourceType: OtherSource? = null,
    val satelliteType: SatelliteSource? = null,
    val title: String,
    val description: String? = null,
    val seaFront: String? = null,
    val dml: String? = null,
    val infractions: List<InfractionSuspicionThreatDataOutput>,
) : ReportingValueDataOutput() {
    companion object {
        fun fromInfractionSuspicion(
            reporting: Reporting.InfractionSuspicion,
            controlUnit: LegacyControlUnit? = null,
            useThreatHierarchyForForm: Boolean = false,
        ): InfractionSuspicionDataOutput {
            val infractionOutputs =
                reporting.infractions.map { item ->
                    val threatHierarchy =
                        if (useThreatHierarchyForForm) {
                            InfractionHierarchyBuilder.buildSingleThreatHierarchy(
                                item = item,
                                threatExtractor = { it.threat },
                                characterizationExtractor = { it.threatCharacterization },
                                natinfCodeExtractor = { it.natinfCode },
                                infractionNameExtractor = { "" },
                            )
                        } else {
                            null
                        }
                    InfractionSuspicionThreatDataOutput(
                        natinfCode = item.natinfCode,
                        threat = item.threat,
                        threatCharacterization = item.threatCharacterization,
                        threatHierarchy = threatHierarchy,
                        infraction = item.infraction?.let { InfractionDataOutput.fromInfraction(it) },
                    )
                }

            return InfractionSuspicionDataOutput(
                reportingSource = reporting.reportingSource,
                controlUnitId = reporting.controlUnitId,
                controlUnit = controlUnit,
                authorContact = reporting.authorContact,
                otherSourceType = reporting.otherSourceType,
                satelliteType = reporting.satelliteType,
                title = reporting.title,
                description = reporting.description,
                dml = reporting.dml,
                seaFront = reporting.seaFront,
                infractions = infractionOutputs,
            )
        }
    }
}
