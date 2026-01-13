package fr.gouv.cnsp.monitorfish.domain.entities.reporting

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.Alert as AlertValue
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.InfractionSuspicion as InfractionSuspicionValue
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Observation as ObservationValue

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes(
    JsonSubTypes.Type(value = ReportingContent.Alert::class, name = "ALERT"),
    JsonSubTypes.Type(value = ReportingContent.InfractionSuspicion::class, name = "INFRACTION_SUSPICION"),
    JsonSubTypes.Type(value = ReportingContent.Observation::class, name = "OBSERVATION"),
)
sealed class ReportingContent {
    abstract val natinfCode: Int?
    abstract val threat: String?
    abstract val threatCharacterization: String?

    data class Alert(val alert: AlertValue) : ReportingContent() {
        override val natinfCode: Int = alert.natinfCode
        override val threat: String = alert.threat
        override val threatCharacterization: String = alert.threatCharacterization
    }

    data class InfractionSuspicion(val infractionSuspicion: InfractionSuspicionValue) : ReportingContent() {
        override val natinfCode: Int = infractionSuspicion.natinfCode
        override val threat: String = infractionSuspicion.threat
        override val threatCharacterization: String = infractionSuspicion.threatCharacterization
    }

    data class Observation(val observation: ObservationValue) : ReportingContent() {
        override val natinfCode: Int? = null
        override val threat: String? = null
        override val threatCharacterization: String? = null
    }
}
