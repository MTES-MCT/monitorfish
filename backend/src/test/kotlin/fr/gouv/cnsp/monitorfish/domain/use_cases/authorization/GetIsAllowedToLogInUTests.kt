package fr.gouv.cnsp.monitorfish.domain.use_cases.authorization

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.never
import com.nhaarman.mockitokotlin2.verify
import fr.gouv.cnsp.monitorfish.config.OIDCProperties
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.ExternalAdministration
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.UserAuthorization
import fr.gouv.cnsp.monitorfish.domain.hash
import fr.gouv.cnsp.monitorfish.domain.repositories.AuthorizedOrganizationalUnitRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.UserAuthorizationRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.CsvSource
import org.mockito.BDDMockito.given
import org.mockito.BDDMockito.willReturn
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class GetIsAllowedToLogInUTests {
    @MockitoBean
    private lateinit var userAuthorizationRepository: UserAuthorizationRepository

    @MockitoBean
    private lateinit var authorizedOrganizationalUnitRepository: AuthorizedOrganizationalUnitRepository

    private val cerbereIdpId = "5b1c8a4e-3f2d-4c6b-9e7a-1d2f3c4b5a60"
    private val otherIdpId = "9f8e7d6c-5b4a-4321-8fed-cba987654321"

    private lateinit var oidcProperties: OIDCProperties

    @BeforeEach
    fun setUp() {
        oidcProperties = OIDCProperties().apply { cerbereIdpId = this@GetIsAllowedToLogInUTests.cerbereIdpId }
        given(userAuthorizationRepository.findByHashedEmail(any())).willThrow(EmptyResultDataAccessException(1))
        given(authorizedOrganizationalUnitRepository.findAll()).willReturn(listOf("DAM/DPMA", "DAM/DIRM NAMO"))
    }

    private fun getIsAllowedToLogIn() =
        GetIsAllowedToLogIn(oidcProperties, userAuthorizationRepository, authorizedOrganizationalUnitRepository)

    @Test
    fun `execute Should allow any user When the login filter is bypassed`() {
        // Given
        oidcProperties.bypassLoginFilter = "true"

        // When
        val isAllowed = getIsAllowedToLogIn().execute("lambda@me.fr", otherIdpId, null)

        // Then
        assertThat(isAllowed).isTrue()
    }

    @Test
    fun `execute Should allow a registered user and save its login, whatever its identity provider`() {
        // Given
        willReturn(
            UserAuthorization(
                hashedEmail = hash("another@email.com"),
                isSuperUser = false,
                service = null,
                isAdministrator = false,
                administration = ExternalAdministration.DOUANE,
            ),
        ).given(userAuthorizationRepository).findByHashedEmail(hash("another@email.com"))

        // When
        val isAllowed = getIsAllowedToLogIn().execute("Another@email.com", otherIdpId, null)

        // Then
        assertThat(isAllowed).isTrue()
        verify(userAuthorizationRepository).saveLogin(eq(hash("another@email.com")), eq("another@email.com"), any())
    }

    @Test
    fun `execute Should allow a Cerbère user within an authorized organizational unit`() {
        // When
        val isAllowed = getIsAllowedToLogIn().execute("agent@email.gouv.fr", cerbereIdpId, "DAM/DIRM NAMO/DML 29")

        // Then
        assertThat(isAllowed).isTrue()
        verify(userAuthorizationRepository, never()).saveLogin(any(), any(), any())
    }

    @Test
    fun `execute Should reject a Cerbère user outside the authorized organizational units`() {
        // When
        val isAllowed =
            getIsAllowedToLogIn().execute("lambda@me.fr", cerbereIdpId, "SG/DNUM/PNM/DPNM4/Prestataire")

        // Then
        assertThat(isAllowed).isFalse()
    }

    @Test
    fun `execute Should reject a Cerbère user without organizational unit`() {
        // When
        val isAllowed = getIsAllowedToLogIn().execute("agent@email.gouv.fr", cerbereIdpId, null)

        // Then
        assertThat(isAllowed).isFalse()
    }

    @Test
    fun `execute Should reject an unregistered user of another identity provider, even within an authorized organizational unit`() {
        // When
        val isAllowed = getIsAllowedToLogIn().execute("someone@external.fr", otherIdpId, "DAM/DPMA")

        // Then
        assertThat(isAllowed).isFalse()
    }

    @Test
    fun `execute Should reject Cerbère users When the Cerbère idp_id is not configured`() {
        // Given
        oidcProperties.cerbereIdpId = ""

        // When
        val isAllowed = getIsAllowedToLogIn().execute("agent@email.gouv.fr", "", "DAM/DPMA")

        // Then
        assertThat(isAllowed).isFalse()
    }

    @ParameterizedTest
    @CsvSource(
        "DAM/DPMA, DAM/DPMA, true",
        "DAM/DPMA/CNSP, DAM/DPMA, true",
        "dam/dpma/cnsp, DAM/DPMA/, true",
        "DAM/DPMAX, DAM/DPMA, false",
        "DAM, DAM/DPMA, false",
        "SG/DNUM/PNM/DPNM4/Prestataire, DAM/DPMA, false",
    )
    fun `isWithinOrganizationalUnit Should match organizational units on path boundaries`(
        organizationalUnit: String,
        authorizedOrganizationalUnit: String,
        expected: Boolean,
    ) {
        assertThat(
            GetIsAllowedToLogIn.isWithinOrganizationalUnit(organizationalUnit, authorizedOrganizationalUnit),
        ).isEqualTo(expected)
    }
}
