package fr.gouv.cnsp.monitorfish.domain.use_cases.authorization

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.never
import com.nhaarman.mockitokotlin2.verify
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.CnspService
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.ExternalAdministration
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.UserAuthorization
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.hash
import fr.gouv.cnsp.monitorfish.domain.repositories.UserAuthorizationRepository
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.mockito.BDDMockito.willReturn
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class AddUserUTests {
    @MockitoBean
    private lateinit var userAuthorizationRepository: UserAuthorizationRepository

    @BeforeEach
    fun setUp() {
        given(userAuthorizationRepository.findByHashedEmail(any())).willThrow(EmptyResultDataAccessException(1))
    }

    @Test
    fun `execute Should add a CNSP user with its service`() {
        // When
        AddUser(userAuthorizationRepository).execute(" Agent@Email.gouv.fr ", true, true, CnspService.POLE_SIP, null)

        // Then
        val captor = argumentCaptor<UserAuthorization>()
        verify(userAuthorizationRepository).upsert(captor.capture())
        assertThat(captor.firstValue.hashedEmail).isEqualTo(hash("agent@email.gouv.fr"))
        assertThat(captor.firstValue.email).isEqualTo("agent@email.gouv.fr")
        assertThat(captor.firstValue.isSuperUser).isTrue()
        assertThat(captor.firstValue.isAdministrator).isTrue()
        assertThat(captor.firstValue.service).isEqualTo(CnspService.POLE_SIP)
        assertThat(captor.firstValue.administration).isNull()
    }

    @Test
    fun `execute Should add an external user with its administration`() {
        // When
        AddUser(userAuthorizationRepository).execute(
            "agent@douane.finances.gouv.fr",
            false,
            false,
            null,
            ExternalAdministration.DOUANE,
        )

        // Then
        val captor = argumentCaptor<UserAuthorization>()
        verify(userAuthorizationRepository).upsert(captor.capture())
        assertThat(captor.firstValue.isSuperUser).isFalse()
        assertThat(captor.firstValue.administration).isEqualTo(ExternalAdministration.DOUANE)
    }

    @Test
    fun `execute Should throw When an external user has no administration`() {
        // When
        val throwable =
            catchThrowable {
                AddUser(userAuthorizationRepository).execute("agent@douane.finances.gouv.fr", false, false, null, null)
            }

        // Then
        assertThat(throwable).isInstanceOf(BackendUsageException::class.java)
        verify(userAuthorizationRepository, never()).upsert(any())
    }

    @Test
    fun `execute Should throw When the user already exists`() {
        // Given
        willReturn(
            UserAuthorization(
                hashedEmail = hash("another@email.com"),
                isSuperUser = false,
                service = null,
                isAdministrator = false,
            ),
        ).given(userAuthorizationRepository).findByHashedEmail(hash("another@email.com"))

        // When
        val throwable =
            catchThrowable {
                AddUser(userAuthorizationRepository).execute("another@email.com", true, false, null, null)
            }

        // Then
        assertThat(throwable).isInstanceOf(BackendUsageException::class.java)
        verify(userAuthorizationRepository, never()).upsert(any())
    }

    @Test
    fun `execute Should throw When the email is invalid`() {
        // When
        val throwable =
            catchThrowable { AddUser(userAuthorizationRepository).execute("agent", true, false, null, null) }

        // Then
        assertThat(throwable).isInstanceOf(BackendUsageException::class.java)
    }
}
