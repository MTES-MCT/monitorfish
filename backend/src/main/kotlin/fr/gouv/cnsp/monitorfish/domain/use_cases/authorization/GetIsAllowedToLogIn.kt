package fr.gouv.cnsp.monitorfish.domain.use_cases.authorization

import fr.gouv.cnsp.monitorfish.config.OIDCProperties
import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.hash
import fr.gouv.cnsp.monitorfish.domain.repositories.AuthorizedOrganizationalUnitRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.UserAuthorizationRepository
import org.slf4j.LoggerFactory
import java.time.ZoneOffset
import java.time.ZonedDateTime

/**
 * A user is allowed to log in when:
 * - their email is registered in `user_authorizations` (super users and listed external users), or
 * - they come from Cerbère and their `organizational_unit` is within an authorized organizational unit.
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
        organizationalUnit: String?,
    ): Boolean {
        val hashedEmail = hash(email)
        val isRegisteredUser =
            try {
                userAuthorizationRepository.findByHashedEmail(hashedEmail)
                true
            } catch (_: Throwable) {
                false
            }
        if (isRegisteredUser) {
            userAuthorizationRepository.saveLogin(hashedEmail, email.lowercase(), ZonedDateTime.now(ZoneOffset.UTC))
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
