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
class ReplaceAdministrationUsersUTests {
    @MockitoBean
    private lateinit var userAuthorizationRepository: UserAuthorizationRepository

    private fun externalUser(email: String) =
        UserAuthorization(
            hashedEmail = hash(email),
            email = email,
            isSuperUser = false,
            service = null,
            isAdministrator = false,
            administration = ExternalAdministration.GENDARMERIE_MARITIME,
        )

    @Test
    fun `execute Should add missing users, remove users that are not in the list and leave kept users untouched`() {
        // Given
        given(userAuthorizationRepository.findAll()).willReturn(
            listOf(
                externalUser("kept@gendarmerie.fr"),
                externalUser("removed@gendarmerie.fr"),
                externalUser("douane@douane.fr").copy(administration = ExternalAdministration.DOUANE),
            ),
        )

        // When
        val result =
            ReplaceAdministrationUsers(userAuthorizationRepository).execute(
                ExternalAdministration.GENDARMERIE_MARITIME,
                listOf(" Kept@Gendarmerie.fr ", "added@gendarmerie.fr", "added@gendarmerie.fr", ""),
            )

        // Then
        assertThat(result.addedEmails).containsExactly("added@gendarmerie.fr")
        assertThat(result.removedEmails).containsExactly("removed@gendarmerie.fr")
        verify(userAuthorizationRepository).deleteAll(listOf(hash("removed@gendarmerie.fr")))

        val captor = argumentCaptor<List<UserAuthorization>>()
        verify(userAuthorizationRepository).upsertAll(captor.capture())
        assertThat(captor.firstValue.map { it.email }).containsExactly("added@gendarmerie.fr")
        assertThat(captor.firstValue).allMatch {
            it.administration == ExternalAdministration.GENDARMERIE_MARITIME &&
                !it.isSuperUser
        }
    }

    @Test
    fun `execute Should not downgrade a super user found in the list`() {
        // Given
        given(userAuthorizationRepository.findAll()).willReturn(
            listOf(
                UserAuthorization(
                    hashedEmail = hash("dummy@email.gouv.fr"),
                    isSuperUser = true,
                    service = null,
                    isAdministrator = true,
                ),
            ),
        )

        // When
        val result =
            ReplaceAdministrationUsers(
                userAuthorizationRepository,
            ).execute(ExternalAdministration.GENDARMERIE_MARITIME, listOf("dummy@email.gouv.fr"))

        // Then
        assertThat(result.addedEmails).isEmpty()
        assertThat(result.ignoredSuperUserEmails).containsExactly("dummy@email.gouv.fr")
        verify(userAuthorizationRepository).upsertAll(listOf())
    }

    @Test
    fun `execute Should throw When an email is invalid`() {
        // When
        val throwable =
            catchThrowable {
                ReplaceAdministrationUsers(
                    userAuthorizationRepository,
                ).execute(ExternalAdministration.GENDARMERIE_MARITIME, listOf("not-an-email"))
            }

        // Then
        assertThat(throwable).isInstanceOf(BackendUsageException::class.java)
        verify(userAuthorizationRepository, never()).deleteAll(any())
    }
}
