package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import fr.gouv.cnsp.monitorfish.infrastructure.cache.CacheName
import org.springframework.cache.annotation.Cacheable

@UseCase
class GetVessels(
    private val vesselRepository: VesselRepository,
) {
    @Cacheable(value = [CacheName.IDENTIFIABLE_VESSELS], sync = true)
    fun execute(): List<Vessel> =
        vesselRepository.findAll().filter {
            it.isIdentifiable()
        }
}
