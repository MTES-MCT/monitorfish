package fr.gouv.cnsp.monitorfish.domain.use_cases.authorization

import fr.gouv.cnsp.monitorfish.config.OIDCProperties
import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.ExternalAdministration
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.UserAuthorization
import fr.gouv.cnsp.monitorfish.domain.hash
import fr.gouv.cnsp.monitorfish.domain.repositories.AuthorizedOrganizationalUnitRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.UserAuthorizationRepository
import org.slf4j.LoggerFactory
import java.time.ZoneOffset
import java.time.ZonedDateTime

/**
 * A user is allowed to log in when:
 * - their email is registered in `user_authorizations` (super users and listed external users) and they log in with
 *   the expected ProConnect identity: the identity provider of their administration (Cerbère for super users), and the
 *   `idp_id`/`sub` bound at their first login. The email alone is not trusted, as any identity provider of the
 *   ProConnect federation could assert it.
 * - or they come from Cerbère and their `organizational_unit` is within an authorized organizational unit.
 */
@UseCase
class GetIsAllowedToLogIn(
    private val oidcProperties: OIDCProperties,
    private val userAuthorizationRepository: UserAuthorizationRepository,
    private val authorizedOrganizationalUnitRepository: AuthorizedOrganizationalUnitRepository,
) {
    private val logger = LoggerFactory.getLogger(GetIsAllowedToLogIn::class.java)

    fun execute(
        email: String,
        idpId: String?,
        sub: String?,
        organizationalUnit: String?,
    ): Boolean {
        val hashedEmail = hash(email)
        val registeredUser =
            try {
                userAuthorizationRepository.findByHashedEmail(hashedEmail)
            } catch (_: Throwable) {
                null
            }
        if (registeredUser != null) {
            if (!isExpectedIdentity(registeredUser, idpId, sub)) {
                return false
            }

            userAuthorizationRepository.saveLogin(
                hashedEmail,
                email.lowercase(),
                idpId,
                sub,
                ZonedDateTime.now(ZoneOffset.UTC),
            )
            logger.info("✅ User is registered in user authorizations.")

            return true
        }

        if (oidcProperties.bypassLoginFilter == "true") {
            logger.info("✅ OIDC is bypassing the login filter.")

            return true
        }

        val isCerbereUser = oidcProperties.cerbereIdpId.isNotBlank() && idpId == oidcProperties.cerbereIdpId
        if (!isCerbereUser || organizationalUnit.isNullOrBlank()) {
            logger.warn(
                "❌ User is not registered and does not come from Cerbère with an organizational unit (idp_id: $idpId).",
            )

            return false
        }

        val isWithinAuthorizedOrganizationalUnit =
            authorizedOrganizationalUnitRepository.findAll().any {
                isWithinOrganizationalUnit(organizationalUnit, it)
            }
        if (!isWithinAuthorizedOrganizationalUnit) {
            logger.warn("❌ Cerbère user organizational unit '$organizationalUnit' is not authorized.")

            return false
        }

        logger.info("✅ Cerbère user authorized with organizational unit '$organizationalUnit'.")

        return true
    }

    private fun isExpectedIdentity(
        user: UserAuthorization,
        idpId: String?,
        sub: String?,
    ): Boolean {
        val expectedIdpId =
            when {
                user.isSuperUser -> oidcProperties.cerbereIdpId
                user.administration == ExternalAdministration.DOUANE -> oidcProperties.douaneIdpId
                user.administration == ExternalAdministration.GENDARMERIE_MARITIME -> oidcProperties.extenssoIdpId
                user.administration == ExternalAdministration.GENDARMERIE_NATIONALE -> oidcProperties.extenssoIdpId
                else -> ""
            }
        if (expectedIdpId.isNotBlank() && idpId != expectedIdpId) {
            logger.warn("❌ Registered user logged in with an unexpected identity provider (idp_id: $idpId).")

            return false
        }

        if (user.idpId != null && user.idpId != idpId) {
            logger.warn(
                "❌ Registered user logged in with another identity provider than at its first login (idp_id: $idpId).",
            )

            return false
        }
        if (user.sub != null && user.sub != sub) {
            logger.warn("❌ Registered user logged in with another ProConnect identity than at its first login.")

            return false
        }

        return true
    }

    companion object {
        /**
         * `DAM/DPMA` contains `DAM/DPMA` and `DAM/DPMA/CNSP`, but not `DAM/DPMAX`.
         */
        fun isWithinOrganizationalUnit(
            organizationalUnit: String,
            authorizedOrganizationalUnit: String,
        ): Boolean {
            val normalizedUnit = organizationalUnit.trim().trimEnd('/').lowercase()
            val normalizedAuthorizedUnit = authorizedOrganizationalUnit.trim().trimEnd('/').lowercase()
            if (normalizedAuthorizedUnit.isEmpty()) {
                return false
            }

            return normalizedUnit == normalizedAuthorizedUnit || normalizedUnit.startsWith("$normalizedAuthorizedUnit/")
        }
    }
}
