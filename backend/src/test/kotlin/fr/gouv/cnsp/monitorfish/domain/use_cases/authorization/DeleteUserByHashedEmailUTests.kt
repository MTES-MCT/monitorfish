package fr.gouv.cnsp.monitorfish.domain.use_cases.authorization

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.never
import com.nhaarman.mockitokotlin2.verify
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.AuthorizationAuditAction
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.AuthorizationAuditLog
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.ExternalAdministration
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.UserAuthorization
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.hash
import fr.gouv.cnsp.monitorfish.domain.repositories.AuthorizationAuditLogRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.UserAuthorizationRepository
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class DeleteUserByHashedEmailUTests {
    @MockitoBean
    private lateinit var userAuthorizationRepository: UserAuthorizationRepository

    @MockitoBean
    private lateinit var authorizationAuditLogRepository: AuthorizationAuditLogRepository

    private val administrator =
        UserAuthorization(
            hashedEmail = hash("admin@email.gouv.fr"),
            email = "admin@email.gouv.fr",
            isSuperUser = true,
            service = null,
            isAdministrator = true,
        )

    @Test
    fun `execute Should delete a user and trace it`() {
        // Given
        val externalUser =
            UserAuthorization(
                hashedEmail = hash("agent@douane.fr"),
                email = "agent@douane.fr",
                isSuperUser = false,
                service = null,
                isAdministrator = false,
                administration = ExternalAdministration.DOUANE,
            )
        given(userAuthorizationRepository.findByHashedEmail(externalUser.hashedEmail)).willReturn(externalUser)

        // When
        DeleteUserByHashedEmail(userAuthorizationRepository, authorizationAuditLogRepository).execute(
            externalUser.hashedEmail,
            "admin@email.gouv.fr",
        )

        // Then
        verify(userAuthorizationRepository).delete(externalUser.hashedEmail)
        val auditLogCaptor = argumentCaptor<AuthorizationAuditLog>()
        verify(authorizationAuditLogRepository).save(auditLogCaptor.capture())
        assertThat(auditLogCaptor.firstValue.actorEmail).isEqualTo("admin@email.gouv.fr")
        assertThat(auditLogCaptor.firstValue.action).isEqualTo(AuthorizationAuditAction.DELETE_USER)
        assertThat(auditLogCaptor.firstValue.target).isEqualTo("agent@douane.fr")
        assertThat(auditLogCaptor.firstValue.details).containsEntry("administration", "DOUANE")
    }

    @Test
    fun `execute Should throw When an administrator deletes itself`() {
        // Given
        given(userAuthorizationRepository.findByHashedEmail(administrator.hashedEmail)).willReturn(administrator)
        given(userAuthorizationRepository.findAll()).willReturn(
            listOf(administrator, administrator.copy(hashedEmail = hash("other@email.gouv.fr"))),
        )

        // When
        val throwable =
            catchThrowable {
                DeleteUserByHashedEmail(userAuthorizationRepository, authorizationAuditLogRepository).execute(
                    administrator.hashedEmail,
                    "Admin@email.gouv.fr",
                )
            }

        // Then
        assertThat(throwable).isInstanceOf(BackendUsageException::class.java)
        verify(userAuthorizationRepository, never()).delete(any())
    }

    @Test
    fun `execute Should throw When deleting the last administrator`() {
        // Given
        given(userAuthorizationRepository.findByHashedEmail(administrator.hashedEmail)).willReturn(administrator)
        given(userAuthorizationRepository.findAll()).willReturn(listOf(administrator))

        // When
        val throwable =
            catchThrowable {
                DeleteUserByHashedEmail(userAuthorizationRepository, authorizationAuditLogRepository).execute(
                    administrator.hashedEmail,
                    null,
                )
            }

        // Then
        assertThat(throwable).isInstanceOf(BackendUsageException::class.java)
        verify(userAuthorizationRepository, never()).delete(any())
    }
}
