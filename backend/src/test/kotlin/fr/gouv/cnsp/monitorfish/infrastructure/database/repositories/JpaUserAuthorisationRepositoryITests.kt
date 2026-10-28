package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.authorization.CnspService
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.ExternalAdministration
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.UserAuthorization
import fr.gouv.cnsp.monitorfish.domain.hash
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.CacheManager
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime

class JpaUserAuthorisationRepositoryITests : AbstractDBTests() {
    @Autowired
    private lateinit var jpaUserAuthorizationRepository: JpaUserAuthorizationRepository

    @Autowired
    lateinit var cacheManager: CacheManager

    @BeforeEach
    fun setup() {
        cacheManager.getCache("user_authorization")?.clear()
    }

    @Test
    @Transactional
    fun `findByHashedEmail Should return a user`() {
        // Given
        val email = hash("dummy@email.gouv.fr")

        // When
        val user = jpaUserAuthorizationRepository.findByHashedEmail(email)

        // Then
        assertThat(user.isSuperUser).isEqualTo(true)
        assertThat(user.service).isEqualTo(CnspService.POLE_OPS_METROPOLE)
        assertThat(user.isAdministrator).isEqualTo(true)
    }

    @Test
    @Transactional
    fun `upsert Should save a user`() {
        // Given
        val email = hash("another_new_dummy@email.gouv.fr")

        // When
        jpaUserAuthorizationRepository.upsert(
            UserAuthorization(
                hashedEmail = email,
                isSuperUser = true,
                service = CnspService.POLE_OPS_METROPOLE,
                isAdministrator = false,
            ),
        )

        // Then
        val user = jpaUserAuthorizationRepository.findByHashedEmail(email)
        assertThat(user.isSuperUser).isEqualTo(true)
    }

    @Test
    @Transactional
    fun `upsert Should update a user`() {
        // Given
        val email = hash("dummy@email.gouv.fr")

        // When
        jpaUserAuthorizationRepository.upsert(
            UserAuthorization(
                hashedEmail = email,
                isSuperUser = true,
                service = CnspService.POLE_SIP,
                isAdministrator = false,
            ),
        )

        // Then
        val user = jpaUserAuthorizationRepository.findByHashedEmail(email)
        assertThat(user.service).isEqualTo(CnspService.POLE_SIP)
    }

    @Test
    @Transactional
    fun `delete Should delete a user`() {
        // Given
        val email = hash("another_new_dummy@email.gouv.fr")
        jpaUserAuthorizationRepository.upsert(
            UserAuthorization(
                hashedEmail = email,
                isSuperUser = true,
                service = CnspService.POLE_OPS_METROPOLE,
                isAdministrator = false,
            ),
        )

        // When
        jpaUserAuthorizationRepository.delete(email)

        // Then
        val throwable = catchThrowable { jpaUserAuthorizationRepository.findByHashedEmail(email) }
        assertThat(throwable).isNotNull()
    }

    @Test
    @Transactional
    fun `findAll Should return all users with their email and administration`() {
        // When
        val users = jpaUserAuthorizationRepository.findAll()

        // Then
        assertThat(users).hasSize(2)
        val externalUser = users.first { it.hashedEmail == hash("another@email.com") }
        assertThat(externalUser.email).isEqualTo("another@email.com")
        assertThat(externalUser.administration).isEqualTo(ExternalAdministration.DOUANE)
    }

    @Test
    @Transactional
    fun `upsertAll Should save all the given users`() {
        // When
        jpaUserAuthorizationRepository.upsertAll(
            listOf("a@douane.finances.gouv.fr", "b@douane.finances.gouv.fr").map {
                UserAuthorization(
                    hashedEmail = hash(it),
                    email = it,
                    isSuperUser = false,
                    service = null,
                    isAdministrator = false,
                    administration = ExternalAdministration.DOUANE,
                )
            },
        )

        // Then
        val douaneUsers =
            jpaUserAuthorizationRepository.findAll().filter {
                it.administration ==
                    ExternalAdministration.DOUANE
            }
        assertThat(douaneUsers.map { it.email })
            .containsExactlyInAnyOrder("another@email.com", "a@douane.finances.gouv.fr", "b@douane.finances.gouv.fr")
    }

    @Test
    @Transactional
    fun `upsert Should keep the stored email When the email is not given`() {
        // Given
        val hashedEmail = hash("another@email.com")

        // When
        jpaUserAuthorizationRepository.upsert(
            UserAuthorization(
                hashedEmail = hashedEmail,
                isSuperUser = false,
                service = null,
                isAdministrator = false,
                administration = ExternalAdministration.GENDARMERIE_NATIONALE,
            ),
        )

        // Then
        val user = jpaUserAuthorizationRepository.findByHashedEmail(hashedEmail)
        assertThat(user.email).isEqualTo("another@email.com")
        assertThat(user.administration).isEqualTo(ExternalAdministration.GENDARMERIE_NATIONALE)
    }

    @Test
    @Transactional
    fun `saveLogin Should save the login date and only fill a missing email and ProConnect identity`() {
        // Given
        val hashedEmail = hash("legacy@email.gouv.fr")
        jpaUserAuthorizationRepository.upsert(
            UserAuthorization(hashedEmail = hashedEmail, isSuperUser = true, service = null, isAdministrator = false),
        )

        // When
        jpaUserAuthorizationRepository.saveLogin(
            hashedEmail,
            "legacy@email.gouv.fr",
            "idp",
            "sub",
            ZonedDateTime.parse("2026-10-20T08:00:00Z"),
        )
        jpaUserAuthorizationRepository.saveLogin(
            hashedEmail,
            "other@email.gouv.fr",
            "other-idp",
            "other-sub",
            ZonedDateTime.parse("2026-10-21T09:00:00Z"),
        )

        // Then
        val user = jpaUserAuthorizationRepository.findAll().first { it.hashedEmail == hashedEmail }
        assertThat(user.email).isEqualTo("legacy@email.gouv.fr")
        assertThat(user.idpId).isEqualTo("idp")
        assertThat(user.sub).isEqualTo("sub")
        assertThat(user.lastLoginAtUtc?.toInstant()).isEqualTo(ZonedDateTime.parse("2026-10-21T09:00:00Z").toInstant())
    }

    @Test
    @Transactional
    fun `deleteAll Should delete the given users`() {
        // When
        jpaUserAuthorizationRepository.deleteAll(listOf(hash("another@email.com")))

        // Then
        assertThat(jpaUserAuthorizationRepository.findAll().map { it.email }).containsExactly("dummy@email.gouv.fr")
    }
}
