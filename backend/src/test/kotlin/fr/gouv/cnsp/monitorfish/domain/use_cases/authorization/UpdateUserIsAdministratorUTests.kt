package fr.gouv.cnsp.monitorfish.domain.use_cases.authorization

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.never
import com.nhaarman.mockitokotlin2.verify
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.ExternalAdministration
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.UserAuthorization
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.hash
import fr.gouv.cnsp.monitorfish.domain.repositories.UserAuthorizationRepository
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class UpdateUserIsAdministratorUTests {
    @MockitoBean
    private lateinit var userAuthorizationRepository: UserAuthorizationRepository

    private val cnspUser =
        UserAuthorization(
            hashedEmail = hash("agent@email.gouv.fr"),
            email = "agent@email.gouv.fr",
            isSuperUser = true,
            service = null,
            isAdministrator = false,
        )

    @Test
    fun `execute Should grant the administrator rights to a CNSP user`() {
        // Given
        given(userAuthorizationRepository.findByHashedEmail(cnspUser.hashedEmail)).willReturn(cnspUser)

        // When
        UpdateUserIsAdministrator(userAuthorizationRepository).execute(
            cnspUser.hashedEmail,
            true,
            "admin@email.gouv.fr",
        )

        // Then
        val captor = argumentCaptor<UserAuthorization>()
        verify(userAuthorizationRepository).upsert(captor.capture())
        assertThat(captor.firstValue).isEqualTo(cnspUser.copy(isAdministrator = true))
    }

    @Test
    fun `execute Should throw When granting the administrator rights to an external user`() {
        // Given
        val externalUser = cnspUser.copy(isSuperUser = false, administration = ExternalAdministration.DOUANE)
        given(userAuthorizationRepository.findByHashedEmail(externalUser.hashedEmail)).willReturn(externalUser)

        // When
        val throwable =
            catchThrowable {
                UpdateUserIsAdministrator(userAuthorizationRepository).execute(
                    externalUser.hashedEmail,
                    true,
                    "admin@email.gouv.fr",
                )
            }

        // Then
        assertThat(throwable).isInstanceOf(BackendUsageException::class.java)
        verify(userAuthorizationRepository, never()).upsert(any())
    }

    @Test
    fun `execute Should throw When an administrator removes its own rights`() {
        // Given
        val administrator = cnspUser.copy(isAdministrator = true)
        given(userAuthorizationRepository.findByHashedEmail(administrator.hashedEmail)).willReturn(administrator)

        // When
        val throwable =
            catchThrowable {
                UpdateUserIsAdministrator(userAuthorizationRepository).execute(
                    administrator.hashedEmail,
                    false,
                    "Agent@email.gouv.fr",
                )
            }

        // Then
        assertThat(throwable).isInstanceOf(BackendUsageException::class.java)
        verify(userAuthorizationRepository, never()).upsert(any())
    }
}
