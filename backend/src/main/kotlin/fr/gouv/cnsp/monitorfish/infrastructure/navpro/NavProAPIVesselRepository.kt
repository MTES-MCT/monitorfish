package fr.gouv.cnsp.monitorfish.infrastructure.navpro

import com.google.gson.Gson
import fr.gouv.cnsp.monitorfish.config.ThirdPartyProperties
import fr.gouv.cnsp.monitorfish.domain.entities.Vessel
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import fr.gouv.cnsp.monitorfish.infrastructure.navpro.inputs.VesselDataInput
import org.http4k.client.ApacheClient
import org.http4k.core.Method
import org.http4k.core.Request
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Repository

@Repository
class NavProAPIVesselRepository(@Autowired val thirdPartyProperties: ThirdPartyProperties) : VesselRepository {
    @Cacheable(value = ["vessel"])
    override fun findVessel(internalReferenceNumber: String): Vessel {
        val registrationParameter = "immatriculation"

        return thirdPartyProperties.navProUrl?.let {
            val request = Request(Method.GET, it)
                    .query(registrationParameter, internalReferenceNumber)

            val response = ApacheClient().invoke(request)

            when (response.status.successful) {
                true -> {
                    val vesselDataInput: VesselDataInput = Gson().fromJson(response.bodyString(), VesselDataInput::class.java)
                    vesselDataInput.toVessel()
                }
                false -> throw IllegalArgumentException("Could not obtain vessel data: $response")
            }
        } ?: throw IllegalArgumentException("No NavPro URL defined in properties")
    }
}
