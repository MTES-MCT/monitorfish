package fr.gouv.cnsp.monitorfish.infrastructure.oidc

import fr.gouv.cnsp.monitorfish.config.ApiClient
import fr.gouv.cnsp.monitorfish.config.OIDCProperties
import fr.gouv.cnsp.monitorfish.domain.entities.oidc.UserInfo
import fr.gouv.cnsp.monitorfish.domain.repositories.OIDCRepository
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.http.HttpHeaders.Authorization
import kotlinx.coroutines.runBlocking
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Repository

@Repository
class APIOIDCRepository(
    private val oidcProperties: OIDCProperties,
    private val apiClient: ApiClient,
) : OIDCRepository {
    private val logger: Logger = LoggerFactory.getLogger(APIOIDCRepository::class.java)

    @Cacheable(value = ["user_info"])
    override fun getUserInfo(authorizationHeaderContent: String): UserInfo =
        runBlocking {
            val userInfoResponse =
                apiClient.httpClient
                    .get(
                        oidcProperties.issuerUri!! + oidcProperties.userinfoEndpoint!!,
                    ) {
                        headers {
                            append(Authorization, authorizationHeaderContent)
                        }
                    }.body<UserInfo>()

            return@runBlocking userInfoResponse
        }
}
