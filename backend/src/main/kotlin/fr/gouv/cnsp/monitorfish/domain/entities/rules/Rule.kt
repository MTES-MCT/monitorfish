package fr.gouv.cnsp.monitorfish.domain.entities.rules

import fr.gouv.cnsp.monitorfish.domain.entities.rules.type.RuleType
import java.time.ZonedDateTime
import java.util.*

class Rule(
    val id: UUID,
    val title: String,
    val active: Boolean,
    val creationDate: ZonedDateTime,
    val lastUpdateDate: ZonedDateTime? = null,
    val lastRunDate: ZonedDateTime? = null,
    val lastRunSuccess: Boolean? = false,
    val value: RuleType,
)
