package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.authorization.AuthorizationAuditAction
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.AuthorizationAuditLog
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime

class JpaAuthorizationAuditLogRepositoryITests : AbstractDBTests() {
    @Autowired
    private lateinit var jpaAuthorizationAuditLogRepository: JpaAuthorizationAuditLogRepository

    @Test
    @Transactional
    fun `save and findAll Should save audit logs and return pages of the most recent first`() {
        // Given
        jpaAuthorizationAuditLogRepository.save(
            AuthorizationAuditLog(
                actorEmail = "dummy@email.gouv.fr",
                action = AuthorizationAuditAction.ADD_AUTHORIZED_ORGANIZATIONAL_UNIT,
                target = "DAM/DIRM MEMN",
                createdAtUtc = ZonedDateTime.parse("2026-10-20T08:00:00Z"),
            ),
        )
        jpaAuthorizationAuditLogRepository.save(
            AuthorizationAuditLog(
                actorEmail = null,
                action = AuthorizationAuditAction.REPLACE_ADMINISTRATION_USERS,
                target = "DOUANE",
                details = mapOf("addedEmails" to listOf("agent@douane.fr")),
                createdAtUtc = ZonedDateTime.parse("2026-10-21T08:00:00Z"),
            ),
        )

        jpaAuthorizationAuditLogRepository.save(
            AuthorizationAuditLog(
                actorEmail = "dummy@email.gouv.fr",
                action = AuthorizationAuditAction.ADD_USER,
                target = "agent_100%@email.gouv.fr",
                createdAtUtc = ZonedDateTime.parse("2026-10-22T08:00:00Z"),
            ),
        )

        // When
        val firstPage = jpaAuthorizationAuditLogRepository.findAll(null, null, 0, 2)
        val secondPage = jpaAuthorizationAuditLogRepository.findAll(null, null, 1, 2)

        // Then
        assertThat(firstPage.totalLength).isEqualTo(3)
        assertThat(firstPage.lastPageNumber).isEqualTo(1)
        assertThat(firstPage.data.map { it.target }).containsExactly("agent_100%@email.gouv.fr", "DOUANE")
        assertThat(firstPage.data[1].actorEmail).isNull()
        assertThat(firstPage.data[1].details).containsEntry("addedEmails", listOf("agent@douane.fr"))
        assertThat(secondPage.data.map { it.target }).containsExactly("DAM/DIRM MEMN")
    }

    @Test
    @Transactional
    fun `findAll Should filter by action and search in the actor, the target and the details`() {
        // Given
        jpaAuthorizationAuditLogRepository.save(
            AuthorizationAuditLog(
                actorEmail = "dummy@email.gouv.fr",
                action = AuthorizationAuditAction.ADD_AUTHORIZED_ORGANIZATIONAL_UNIT,
                target = "DAM/DIRM MEMN",
            ),
        )
        jpaAuthorizationAuditLogRepository.save(
            AuthorizationAuditLog(
                actorEmail = null,
                action = AuthorizationAuditAction.REPLACE_ADMINISTRATION_USERS,
                target = "DOUANE",
                details = mapOf("addedEmails" to listOf("Agent@Douane.fr")),
            ),
        )
        jpaAuthorizationAuditLogRepository.save(
            AuthorizationAuditLog(
                actorEmail = "dummy@email.gouv.fr",
                action = AuthorizationAuditAction.ADD_USER,
                target = "agent_100%@email.gouv.fr",
            ),
        )

        // When, Then
        assertThat(
            jpaAuthorizationAuditLogRepository
                .findAll(AuthorizationAuditAction.ADD_USER, null, 0, 10)
                .data
                .map { it.target },
        ).containsExactly("agent_100%@email.gouv.fr")
        assertThat(
            jpaAuthorizationAuditLogRepository.findAll(null, "agent@douane", 0, 10).data.map { it.target },
        ).containsExactly("DOUANE")
        assertThat(
            jpaAuthorizationAuditLogRepository.findAll(null, "dirm", 0, 10).data.map { it.target },
        ).containsExactly("DAM/DIRM MEMN")
        assertThat(jpaAuthorizationAuditLogRepository.findAll(null, "DUMMY@", 0, 10).totalLength).isEqualTo(2)
        // `%` and `_` are searched literally
        assertThat(
            jpaAuthorizationAuditLogRepository.findAll(null, "100%", 0, 10).data.map { it.target },
        ).containsExactly("agent_100%@email.gouv.fr")
        assertThat(jpaAuthorizationAuditLogRepository.findAll(null, "_", 0, 10).totalLength).isEqualTo(1)
    }
}
