package fr.gouv.cnsp.monitorfish.domain.use_cases.authorization

import com.nhaarman.mockitokotlin2.any
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.UserAuthorization
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.JpaUserAuthorizationRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.util.*

@ExtendWith(SpringExtension::class)
class GetIsAuthorizedUserUTests {

    @MockBean
    private lateinit var userAuthorizationRepository: JpaUserAuthorizationRepository

    @Test
    fun `execute Should return true When the authorization is found`() {
        given(userAuthorizationRepository.findByHashedEmail(any())).willReturn(UserAuthorization("58GE5S8VXE871FGGd2", true))

        // When
        val isAuthorized = GetIsAuthorizedUser(userAuthorizationRepository).execute("test")

        // Then
        assertThat(isAuthorized).isTrue()
    }

    @Test
    fun `execute Should return false When the authorization bad`() {
        given(userAuthorizationRepository.findByHashedEmail(any())).willReturn(UserAuthorization("58GE5S8VXE871FGGd2", false))

        // When
        val isAuthorized = GetIsAuthorizedUser(userAuthorizationRepository).execute("test")

        // Then
        assertThat(isAuthorized).isFalse()
    }

    @Test
    fun `execute Should return false When the user authorization is not found`() {
        given(userAuthorizationRepository.findByHashedEmail(any())).willThrow(EmptyResultDataAccessException("User not found", 1))

        // When
        val isAuthorized = GetIsAuthorizedUser(userAuthorizationRepository).execute("test")

        // Then
        assertThat(isAuthorized).isFalse()
    }
}
