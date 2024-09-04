package fr.gouv.cnsp.monitorfish.domain.mappers

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.InfractionSuspicion
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Observation
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingValue
import fr.gouv.cnsp.monitorfish.domain.exceptions.EntityConversionException
import org.springframework.stereotype.Component

@Component
object ReportingMapper {
    private const val jsonbNullString = "null"

    fun getReportingValueFromJSON(
        mapper: ObjectMapper,
        message: String?,
        reportingType: ReportingType,
    ): ReportingValue {
        return try {
            if (!message.isNullOrEmpty() && message != jsonbNullString) {
                when (reportingType) {
                    ReportingType.ALERT -> mapper.readValue(message, AlertType::class.java)
                    ReportingType.OBSERVATION -> mapper.readValue(message, Observation::class.java)
                    ReportingType.INFRACTION_SUSPICION -> mapper.readValue(message, InfractionSuspicion::class.java)
                }
            } else {
                throw EntityConversionException("No 'Reporting' value found.")
            }
        } catch (e: Exception) {
            throw EntityConversionException("Error while converting 'Reporting'. $message", e)
        }
    }
}
