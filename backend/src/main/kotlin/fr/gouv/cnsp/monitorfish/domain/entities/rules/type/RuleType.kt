package fr.gouv.cnsp.monitorfish.domain.entities.rules.type

import com.fasterxml.jackson.annotation.JsonTypeInfo
import fr.gouv.cnsp.monitorfish.domain.entities.rules.InputSource

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
abstract class RuleType(
    val name: RuleTypeMapping,
    val inputSource: InputSource,
) {
    abstract fun evaluate(parameterToAssert: Double): Boolean
}
