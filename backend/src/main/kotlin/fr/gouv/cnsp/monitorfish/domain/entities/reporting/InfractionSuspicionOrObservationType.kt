package fr.gouv.cnsp.monitorfish.domain.entities.reporting

import com.fasterxml.jackson.annotation.JsonTypeInfo

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
abstract class InfractionSuspicionOrObservationType(
    val type: ReportingTypeMapping,
    open val reportingActor: ReportingActor,
    open val controlUnitId: Int? = null,
    open val authorTrigram: String,
    open val authorContact: String? = null,
    open val title: String,
    open val description: String? = null,
    override val natinfCode: String? = null,
) : ReportingValue(natinfCode) {
    fun checkReportingActorAndFieldsRequirements() = when (reportingActor) {
        ReportingActor.UNIT -> require(controlUnitId != null) {
            "An unit must be set"
        }
        ReportingActor.DML -> require(!authorContact.isNullOrEmpty()) {
            "An author contact must be set"
        }
        ReportingActor.DIRM -> require(!authorContact.isNullOrEmpty()) {
            "An author contact must be set"
        }
        ReportingActor.OTHER -> require(!authorContact.isNullOrEmpty()) {
            "An author contact must be set"
        }
        else -> {}
    }
}
