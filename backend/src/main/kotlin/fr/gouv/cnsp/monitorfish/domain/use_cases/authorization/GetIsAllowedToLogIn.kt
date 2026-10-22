package fr.gouv.cnsp.monitorfish.domain.use_cases.authorization

import fr.gouv.cnsp.monitorfish.config.OIDCProperties
import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.ExternalAdministration
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.UserAuthorization
import fr.gouv.cnsp.monitorfish.domain.hash
import fr.gouv.cnsp.monitorfish.domain.repositories.AuthorizedOrganizationalUnitRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.UserAuthorizationRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.findByHashedEmailOrNull
import org.slf4j.LoggerFactory
import java.time.ZoneOffset
import java.time.ZonedDateTime

/**
 * A registered email is not enough to log in: any identity provider of the ProConnect federation could assert it.
 * The user must also come from the identity provider of its administration, with the identity of its first login.
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
        val registeredUser = userAuthorizationRepository.findByHashedEmailOrNull(hashedEmail)
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
        val expectedIdpId = getExpectedIdpId(user)
        if (!expectedIdpId.isNullOrBlank() && idpId != expectedIdpId) {
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

    private fun getExpectedIdpId(user: UserAuthorization): String? {
        if (user.isSuperUser) {
            return oidcProperties.cerbereIdpId
        }

        return when (user.administration) {
            ExternalAdministration.DOUANE -> oidcProperties.douaneIdpId
            ExternalAdministration.GENDARMERIE_MARITIME, ExternalAdministration.GENDARMERIE_NATIONALE ->
                oidcProperties.extenssoIdpId
            null -> null
        }
    }

    companion object {
        /** `DAM/DPMA` contains `DAM/DPMA` and `DAM/DPMA/CNSP`, but not `DAM/DPMAX`. */
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
