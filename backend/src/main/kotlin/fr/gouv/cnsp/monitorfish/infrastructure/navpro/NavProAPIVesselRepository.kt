package fr.gouv.cnsp.monitorfish.infrastructure.navpro

import com.google.gson.Gson
import com.google.gson.JsonSyntaxException
import fr.gouv.cnsp.monitorfish.config.ThirdPartyProperties
import fr.gouv.cnsp.monitorfish.domain.entities.Vessel
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import fr.gouv.cnsp.monitorfish.infrastructure.exceptions.InvalidAPIResponseException
import fr.gouv.cnsp.monitorfish.infrastructure.navpro.inputs.VesselDataInput
import org.http4k.client.ApacheClient
import org.http4k.core.Method
import org.http4k.core.Request
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Repository

@Repository
class NavProAPIVesselRepository(@Autowired val thirdPartyProperties: ThirdPartyProperties) : VesselRepository {

    private val logger: Logger = LoggerFactory.getLogger(NavProAPIVesselRepository::class.java)

    @Cacheable(value = ["vessel"])
    override fun findVessel(internalReferenceNumber: String): Vessel {
        val registrationParameter = "immatriculation"

        return thirdPartyProperties.navProUrl?.let {
            val request = Request(Method.GET, it)
                    .query(registrationParameter, internalReferenceNumber)

            val response = ApacheClient().invoke(request)

            when (response.status.successful) {
                true -> {
                    try {
                        val vesselDataInput: VesselDataInput = Gson().fromJson(response.bodyString(), VesselDataInput::class.java)
                        vesselDataInput.toVessel()
                    } catch (e: JsonSyntaxException) {
                        throw InvalidAPIResponseException("Could not obtain vessel data from API", e)
                    }
                }
                false -> {
                    logger.warn(response.bodyString())
                    throw InvalidAPIResponseException("Could not obtain vessel data from API: HTTP code ${response.status.code}")
                }
            }
        } ?: throw IllegalArgumentException("No NavPro URL defined in properties")
    }
}
