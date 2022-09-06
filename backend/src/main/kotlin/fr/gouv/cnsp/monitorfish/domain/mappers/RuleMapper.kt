package fr.gouv.cnsp.monitorfish.domain.mappers

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.rules.type.RuleType
import fr.gouv.cnsp.monitorfish.domain.exceptions.EntityConversionException
import org.springframework.stereotype.Component

@Component
object RuleMapper {
  fun getRuleTypeFromJSON(mapper: ObjectMapper, value: String): RuleType {
    return try {
      if (value.isEmpty()) {
        throw EntityConversionException("Error while converting 'RuleType'. RuleType is empty.")
      }

      mapper.readValue(value, RuleType::class.java)
    } catch (e: Exception) {
      throw EntityConversionException("Error while converting 'RuleType'. $value", e)
    }
  }
}
