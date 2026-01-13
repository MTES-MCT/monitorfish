package fr.gouv.cnsp.monitorfish.domain.mappers

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.Alert
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.InfractionSuspicion
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Observation
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingContent
import fr.gouv.cnsp.monitorfish.domain.exceptions.EntityConversionException
import org.springframework.stereotype.Component

@Component
object ReportingMapper {
    private const val jsonbNullString = "null"

    fun getReportingContentFromJSON(
        mapper: ObjectMapper,
        message: String?,
        reportingType: ReportingType,
    ): ReportingContent =
        try {
            if (!message.isNullOrEmpty() && message != jsonbNullString) {
                when (reportingType) {
                    ReportingType.ALERT -> {
                        val alert = mapper.readValue(message, Alert::class.java)
                        ReportingContent.Alert(alert)
                    }
                    ReportingType.OBSERVATION -> {
                        val observation = mapper.readValue(message, Observation::class.java)
                        ReportingContent.Observation(observation)
                    }
                    ReportingType.INFRACTION_SUSPICION -> {
                        val infractionSuspicion = mapper.readValue(message, InfractionSuspicion::class.java)
                        ReportingContent.InfractionSuspicion(infractionSuspicion)
                    }
                }
            } else {
                throw EntityConversionException("No 'Reporting' value found.")
            }
        } catch (e: Exception) {
            throw EntityConversionException("Error while converting 'Reporting': ${e.message}", e)
        }
}
