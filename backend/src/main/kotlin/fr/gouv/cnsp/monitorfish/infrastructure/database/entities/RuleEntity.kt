package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.fasterxml.jackson.databind.ObjectMapper
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType
import fr.gouv.cnsp.monitorfish.domain.entities.rules.Rule
import fr.gouv.cnsp.monitorfish.domain.entities.rules.type.RuleType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.Type
import java.time.ZonedDateTime
import java.util.*

@Entity
@Table(name = "rules")
data class RuleEntity(
    @Id
    @Column(name = "rule_id")
    val id: UUID,
    @Column(name = "title", nullable = false)
    val title: String,
    @Column(name = "active", nullable = false)
    val active: Boolean,
    @Column(name = "creation_date", nullable = false)
    val creationDate: ZonedDateTime,
    @Column(name = "last_update_date")
    val lastUpdateDate: ZonedDateTime? = null,
    @Column(name = "last_run_date")
    val lastRunDate: ZonedDateTime? = null,
    @Column(name = "last_run_success")
    val lastRunSuccess: Boolean? = null,
    @Type(JsonBinaryType::class)
    @Column(name = "value", nullable = false, columnDefinition = "jsonb")
    val value: String,
) {

    fun toRule(mapper: ObjectMapper): Rule {
        return Rule(
            id = id,
            title = title,
            active = active,
            creationDate = creationDate,
            lastUpdateDate = lastUpdateDate,
            lastRunDate = lastRunDate,
            lastRunSuccess = lastRunSuccess,
            value = mapper.readValue(value, RuleType::class.java),
        )
    }
}
