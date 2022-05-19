package fr.gouv.cnsp.monitorfish.domain.mappers

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingValue
import fr.gouv.cnsp.monitorfish.domain.exceptions.EntityConversionException
import org.springframework.stereotype.Component

@Component
object ReportingMapper {
    private const val jsonbNullString = "null"

    fun getReportingValueFromJSON(mapper: ObjectMapper, message: String?, reportingType: ReportingType): ReportingValue {
        return try {
            if (reportingType == ReportingType.ALERT && !message.isNullOrEmpty() && message != jsonbNullString) {
                mapper.readValue(message, AlertType::class.java)
            } else {
                throw EntityConversionException("No 'Reporting' value found.")
            }
        } catch (e: Exception) {
            throw EntityConversionException("Error while converting 'Reporting'. $message", e)
        }
    }
}
